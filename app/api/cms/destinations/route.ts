import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .order('priority_score', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, destinations })
  } catch (err) {
    console.error('[CMS Destinations GET] Error:', err)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const {
      slug, title, excerpt, country, continent, region, flag_emoji,
      tagline, teaser, hero_unsplash_url, featured_image, link,
      travel_style, best_season, avg_budget_couple_week, status,
      priority_score, coming_soon_date, latitude, longitude, published
    } = body

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug et titre requis' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('destinations')
      .insert({
        slug, title, excerpt, country, continent, region, flag_emoji,
        tagline, teaser, hero_unsplash_url, featured_image, link,
        travel_style, best_season, avg_budget_couple_week,
        status: status || 'draft',
        priority_score: priority_score !== undefined ? priority_score : 50,
        coming_soon_date,
        latitude, longitude,
        published: published !== undefined ? published : false
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, destination: data })
  } catch (err) {
    console.error('[CMS Destinations POST] Error:', err)
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Id requis' }, { status: 400 })
    }

    // Keep fields defined in the database
    const { data, error } = await supabase
      .from('destinations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, destination: data })
  } catch (err) {
    console.error('[CMS Destinations PATCH] Error:', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Id requis' }, { status: 400 })
    }

    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CMS Destinations DELETE] Error:', err)
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 })
  }
}
