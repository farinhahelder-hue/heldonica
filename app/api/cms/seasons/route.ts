import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'
import { revalidateCmsTarget } from '@/lib/revalidate'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export interface CmsSeason {
  id: string
  destination_key: string
  name: string
  emoji: string
  months: string[]
  weather: string
  crowd: 'low' | 'medium' | 'high'
  price: 'low' | 'medium' | 'high'
  description: string
  is_active: boolean
  display_order: number
}

function mapRowToSeason(row: any): CmsSeason {
  let months: string[] = []
  if (Array.isArray(row.months_array)) {
    months = row.months_array
  } else if (typeof row.months === 'string') {
    try {
      const parsed = JSON.parse(row.months)
      months = Array.isArray(parsed) ? parsed : [row.months]
    } catch {
      months = row.months ? row.months.split(',').map((s: string) => s.trim()) : []
    }
  }

  return {
    id: String(row.id),
    destination_key: row.destination_slug || '',
    name: row.season_label || '',
    emoji: row.emoji || '',
    months,
    weather: row.weather || '',
    crowd: (row.crowd || 'medium') as 'low' | 'medium' | 'high',
    price: (row.price || 'medium') as 'low' | 'medium' | 'high',
    description: row.note || '',
    is_active: row.is_active ?? true,
    display_order: row.sort_order ?? 0,
  }
}

/**
 * GET /api/cms/seasons
 * Fetch seasons for a destination or all seasons
 * Query params: destination (optional) - destination_key to filter by
 */
export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 })

  try {
    const { searchParams } = new URL(req.url)
    const destination = searchParams.get('destination')

    let query = supabase
      .from('cms_seasons')
      .select('*')
      .order('destination_slug')
      .order('sort_order')

    if (destination) {
      query = query.eq('destination_slug', destination.toLowerCase())
    }

    const { data, error } = await query

    if (error) {
      console.error('[CMS Seasons API] Fetch error:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    const seasons: CmsSeason[] = (data || []).map(mapRowToSeason)

    return NextResponse.json(
      { success: true, seasons },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('[CMS Seasons API] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cms/seasons
 * Create a new season
 */
export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 })

  try {
    const body = await req.json()
    const months = Array.isArray(body.months) ? body.months : []
    const row = {
      destination_slug: (body.destination_key || '').toLowerCase(),
      season_label: body.name || '',
      emoji: body.emoji || null,
      months_array: months,
      months: months.join(', '),
      weather: body.weather || null,
      crowd: body.crowd || 'medium',
      price: body.price || 'medium',
      note: body.description || null,
      sort_order: typeof body.display_order === 'number' ? body.display_order : 0,
      is_active: body.is_active ?? true,
    }

    const { data, error } = await supabase
      .from('cms_seasons')
      .insert([row])
      .select()
      .single()

    if (error) {
      console.error('[CMS Seasons API] Insert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    await revalidateCmsTarget({
      page: row.destination_slug ? `destinations-${row.destination_slug}` : 'destinations',
      type: 'destination'
    })

    return NextResponse.json({ success: true, season: mapRowToSeason(data) })
  } catch (err) {
    console.error('[CMS Seasons API] Error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/cms/seasons?id=...
 * Update an existing season
 */
export async function PUT(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 })

  try {
    const { searchParams } = new URL(req.url)
    const body = await req.json()
    const id = searchParams.get('id') || body.id

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    if (body.destination_key !== undefined) updates.destination_slug = body.destination_key.toLowerCase()
    if (body.name !== undefined) updates.season_label = body.name
    if (body.emoji !== undefined) updates.emoji = body.emoji || null
    if (body.months !== undefined) {
      const months = Array.isArray(body.months) ? body.months : []
      updates.months_array = months
      updates.months = months.join(', ')
    }
    if (body.weather !== undefined) updates.weather = body.weather || null
    if (body.crowd !== undefined) updates.crowd = body.crowd
    if (body.price !== undefined) updates.price = body.price
    if (body.description !== undefined) updates.note = body.description || null
    if (body.display_order !== undefined) updates.sort_order = body.display_order
    if (body.is_active !== undefined) updates.is_active = body.is_active

    const { data, error } = await supabase
      .from('cms_seasons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[CMS Seasons API] Update error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    await revalidateCmsTarget({
      page: data?.destination_slug ? `destinations-${data.destination_slug}` : 'destinations',
      type: 'destination'
    })

    return NextResponse.json({ success: true, season: mapRowToSeason(data) })
  } catch (err) {
    console.error('[CMS Seasons API] Error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/cms/seasons?id=...
 * Delete a season
 */
export async function DELETE(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('cms_seasons')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[CMS Seasons API] Delete error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CMS Seasons API] Error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
