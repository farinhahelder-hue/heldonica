import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function withoutVoiceNotes(payload: Record<string, unknown>) {
  const { voice_notes, ...rest } = payload
  return rest
}

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  const sb = supabase()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'

  let query = sb
    .from('cms_blog_posts')
    .select('id, title, slug, category, published, published_at, created_at, excerpt, featured_image')
    .order('created_at', { ascending: false })

  if (status === 'published') query = query.eq('published', true)
  if (status === 'draft') query = query.eq('published', false)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ articles: data })
}

export async function POST(req: Request) {
  const authError = requireCmsAuth(req)
  if (authError) return authError

  const sb = supabase()
  const body = await req.json()
  const payload = { ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

  let { data, error } = await sb
    .from('cms_blog_posts')
    .insert([payload])
    .select()
    .single()

  if (error?.message?.includes('voice_notes') && error.message.includes('does not exist')) {
    ;({ data, error } = await sb
      .from('cms_blog_posts')
      .insert([withoutVoiceNotes(payload)])
      .select()
      .single())
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ article: data }, { status: 201 })
}
