import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

export const dynamic = 'force-dynamic'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page')
  const zone_key = searchParams.get('zone_key')

  if (!page || !zone_key) {
    return NextResponse.json({ error: 'page and zone_key are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cms_zone_history')
    .select('id, old_value, new_value, changed_at')
    .eq('page', page)
    .eq('zone_key', zone_key)
    .order('changed_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ history: data ?? [] })
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { page, zone_key, value } = await req.json()
  if (!page || !zone_key || value === undefined) {
    return NextResponse.json({ error: 'page, zone_key, value required' }, { status: 400 })
  }

  // Restore: overwrite current zone value
  const { data: existing } = await supabase
    .from('cms_editable_zones')
    .select('id, value')
    .eq('page', page)
    .eq('zone_key', zone_key)
    .maybeSingle()

  if (existing) {
    await supabase.from('cms_zone_history').insert({
      page,
      zone_key,
      old_value: existing.value ?? null,
      new_value: value,
    })
    const { error } = await supabase
      .from('cms_editable_zones')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('cms_editable_zones')
      .insert({ page, zone_key, value, zone_type: 'text', is_active: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
