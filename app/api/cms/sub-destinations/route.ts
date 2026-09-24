import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'
import { revalidateCmsTarget } from '@/lib/revalidate'

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
  const parentSlug = searchParams.get('parent_slug')

  let query = supabase.from('cms_sub_destinations').select('*').order('display_order', { ascending: true })
  
  if (parentSlug) {
    query = query.eq('parent_slug', parentSlug)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data })
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const body = await req.json()
  const { data, error } = await supabase
    .from('cms_sub_destinations')
    .insert([body])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await revalidateCmsTarget({
    page: data?.parent_slug ? `destinations-${data.parent_slug}` : 'destinations',
    type: 'destination'
  })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

  const { data, error } = await supabase
    .from('cms_sub_destinations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await revalidateCmsTarget({
    page: data?.parent_slug ? `destinations-${data.parent_slug}` : 'destinations',
    type: 'destination'
  })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

  const { error } = await supabase
    .from('cms_sub_destinations')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await revalidateCmsTarget({ page: 'destinations', type: 'destination' })
  return NextResponse.json({ success: true })
}
