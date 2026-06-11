import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

interface CmsBlogPost {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  tags: string[] | null;
  voice_notes?: string | null;
  archived: boolean;
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data, error } = await (sb.from('cms_blog_posts') as any)
    .insert([payload])
    .select()
    .single()

  if (error?.message?.includes('voice_notes') && error.message.includes('does not exist')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;({ data, error } = await (sb.from('cms_blog_posts') as any)
      .insert([withoutVoiceNotes(payload)])
      .select()
      .single())
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also sync to articles table for public pages
  if (data) {
    const articlesPayload = {
      id: (data as CmsBlogPost).id,
      title: (data as CmsBlogPost).title,
      slug: (data as CmsBlogPost).slug,
      category: (data as CmsBlogPost).category,
      excerpt: (data as CmsBlogPost).excerpt,
      content: (data as CmsBlogPost).content,
      featured_image: (data as CmsBlogPost).featured_image,
      author: (data as CmsBlogPost).author,
      published: (data as CmsBlogPost).published,
      published_at: (data as CmsBlogPost).published_at,
      created_at: (data as CmsBlogPost).created_at,
      updated_at: (data as CmsBlogPost).updated_at,
      tags: (data as CmsBlogPost).tags || [],
      archived: false,
    }
    // Sync to articles table - ignore errors as articles might not exist yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sb.from('articles') as any).upsert(articlesPayload).then(() => {}).catch(() => {})
  }

  return NextResponse.json({ article: data }, { status: 201 })
}
