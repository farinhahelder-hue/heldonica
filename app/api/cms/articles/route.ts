import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

let _cached: ReturnType<typeof createClient> | null = null;
function supabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    _cached = (url && key) ? createClient(url, key) : null;
  }
  return _cached;
}

function withoutVoiceNotes(payload: Record<string, unknown>) {
  const { voice_notes, ...rest } = payload
  return rest
}

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
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
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  const body = await req.json()
  const payload = { ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

  // Insert into cms_blog_posts (legacy table for CMS)
  let { data, error } = await sb
    .from('cms_blog_posts')
    .insert([payload] as any)
    .select()
    .single()

  if (error?.message?.includes('voice_notes') && error.message.includes('does not exist')) {
    ;({ data, error } = await sb
      .from('cms_blog_posts')
      .insert([withoutVoiceNotes(payload)] as any)
      .select()
      .single())
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also sync to articles table for public pages
  if (data) {
    const articlesPayload = {
      id: data.id,
      title: data.title,
      slug: data.slug,
      category: data.category,
      excerpt: data.excerpt,
      content: data.content,
      featured_image: data.featured_image,
      author: data.author,
      published: data.published,
      published_at: data.published_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      tags: data.tags || [],
      archived: false,
    }
    // Sync to articles table - ignore errors as articles might not exist yet
    sb.from('articles').upsert(articlesPayload).then(() => {}).catch(() => {})
  }

  return NextResponse.json({ article: data }, { status: 201 })
}
