import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 })

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=fr`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Heldonica Travel Organizer (contact@heldonica.fr)',
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 },
    })
    if (!res.ok) return NextResponse.json({ error: 'Geocoding failed' }, { status: 502 })
    const data = await res.json()
    if (!data || data.length === 0) return NextResponse.json(null)
    const { lat, lon, display_name } = data[0]
    return NextResponse.json({ lat: parseFloat(lat), lng: parseFloat(lon), display_name })
  } catch {
    return NextResponse.json({ error: 'Network error' }, { status: 502 })
  }
}
