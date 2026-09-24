export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'

function isCron(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}` && !!process.env.CRON_SECRET
}

async function enrichViaPlacesApi(name: string, address: string, lat: number, lng: number) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) return null

  // 1. Try Place Details if we have place_id logic externally, else searchText
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.regularOpeningHours,places.photos,places.googleMapsUri,places.types',
      },
      body: JSON.stringify({
        textQuery: `${name} ${address}`.trim(),
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 2000 } },
        maxResultCount: 1,
      }),
    })
    if (!res.ok) {
      console.warn('[enrich-places] Places searchText failed', await res.text())
      return null
    }
    const data = await res.json()
    const place = data.places?.[0]
    if (!place) return null
    return {
      google_place_id: place.id?.replace('places/', '') || null,
      formatted_address: place.formattedAddress || null,
      rating: place.rating || null,
      opening_hours: place.regularOpeningHours || null,
      google_maps_uri: place.googleMapsUri || null,
      types: place.types || [],
      photo_names: (place.photos || []).slice(0, 3).map((p: any) => p.name),
    }
  } catch (e) {
    console.warn('[enrich-places] exception', e)
    return null
  }
}

async function enrichViaNominatim(lat: number, lng: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=18&accept-language=fr`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Heldonica enrich-places (contact@heldonica.fr)' },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      formatted_address: data.display_name || null,
      osm_type: data.type || null,
      osm_category: data.category || null,
    }
  } catch { return null }
}

export async function GET(req: NextRequest) {
  if (!isCron(req)) {
    const authResponse = await requireCmsAuth(req as any)
    if (authResponse) return authResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  }

  const headers: Record<string, string> = { apikey: supabaseKey, 'Content-Type': 'application/json' }
  if (supabaseKey.startsWith('eyJ')) headers['Authorization'] = `Bearer ${supabaseKey}`

  // Fetch up to 10 POIs needing enrichment (source gmaps_saved/takeout, metadata google null)
  const poisRes = await fetch(
    `${supabaseUrl}/rest/v1/article_map_pois?source=in.(gmaps_saved,takeout,gphotos_exif)&select=id,name,lat,lng,address,maps_url,google_place_id,metadata&limit=10`,
    { headers }
  )
  if (!poisRes.ok) {
    return NextResponse.json({ error: 'Fetch POIs failed', details: await poisRes.text() }, { status: 500 })
  }
  let pois: any[] = await poisRes.json()
  // Filter client-side: need enrichment if metadata.google is missing
  pois = pois.filter((p) => !p.metadata?.google_place_id && !p.metadata?.enriched_at)

  if (pois.length === 0) {
    return NextResponse.json({ message: 'Aucun POI à enrichir', enriched: 0 })
  }

  let enriched = 0
  const errors: any[] = []

  for (const poi of pois) {
    try {
      const lat = parseFloat(poi.lat)
      const lng = parseFloat(poi.lng)
      let googleData = await enrichViaPlacesApi(poi.name, poi.address || '', lat, lng)
      let osmData: any = null
      if (!googleData) {
        osmData = await enrichViaNominatim(lat, lng)
      }

      const newMetadata = {
        ...poi.metadata,
        enriched_at: new Date().toISOString(),
        source: 'places_api',
        google: googleData || undefined,
        osm: osmData || undefined,
      }

      // Build patch
      const patch: Record<string, any> = { metadata: newMetadata }
      if (googleData?.google_place_id) patch.google_place_id = googleData.google_place_id
      if (googleData?.google_maps_uri && !poi.maps_url) patch.maps_url = googleData.google_maps_uri
      if (googleData?.formatted_address && !poi.address) patch.address = googleData.formatted_address
      if (osmData?.formatted_address && !poi.address && !googleData?.formatted_address) patch.address = osmData.formatted_address

      // Rate limit Places API: 1 req / 300ms
      if (googleData) await new Promise((r) => setTimeout(r, 300))

      const patchRes = await fetch(`${supabaseUrl}/rest/v1/article_map_pois?id=eq.${poi.id}`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify(patch),
      })
      if (patchRes.ok) enriched++
      else errors.push({ id: poi.id, error: await patchRes.text() })
    } catch (e: any) {
      errors.push({ id: poi.id, error: e.message })
    }
  }

  // Log
  try {
    await fetch(`${supabaseUrl}/rest/v1/import_logs`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({
        import_type: 'places_enrich',
        total_items: pois.length,
        enriched_items: enriched,
        errors: errors.slice(0, 5),
        metadata: { cron: true },
      }),
    })
  } catch {}

  return NextResponse.json({ message: `Enrichi ${enriched}/${pois.length} POIs`, enriched, total: pois.length, errors: errors.length ? errors : undefined })
}

export async function POST(req: NextRequest) { return GET(req) }
