import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export const dynamic = 'force-dynamic'

// GET /api/cms/pillar-pages?slug=madere
export async function GET(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  let query = supabase
    .from('cms_pillar_pages')
    .select('*')
    .eq('is_active', true)
    .order('slug')

  if (slug) query = (query as any).eq('slug', slug)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pages: data || [] })
}

// PATCH /api/cms/pillar-pages — update a destination
export async function PATCH(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const body = await req.json()
  const { slug, ...rest } = body

  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  const allowedFields = [
    'name', 'country', 'flag', 'hero', 'tagline', 'hero_subtitle',
    'budget', 'season', 'flight', 'visa', 'currency', 'language',
    'seo_title', 'seo_desc', 'intro', 'info_table', 'itinerary',
    'budget_breakdown', 'faq', 'tested_by_heldonica', 'verdict',
  ]

  const updates: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (rest[field] !== undefined) updates[field] = rest[field]
  }

  const { error } = await supabase.from('cms_pillar_pages').update(updates).eq('slug', slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
