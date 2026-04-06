import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'

  let query = supabase
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
  const body = await req.json()
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .insert([{ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ article: data }, { status: 201 })
}
