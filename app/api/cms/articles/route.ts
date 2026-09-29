import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'
import { revalidateCmsTarget } from '@/lib/revalidate'

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
  const search = (searchParams.get('search') || '').trim()
  const status = searchParams.get('status') || 'all'
  const rawPage = Math.max(1, Math.min(100, parseInt(searchParams.get('page') || '1', 10) || 1))
  const rawLimit = Math.max(5, Math.min(50, parseInt(searchParams.get('limit') || '15', 10) || 15))
  
  const from = (rawPage - 1) * rawLimit
  const to = from + rawLimit - 1

  let query = sb
    .from('cms_blog_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status === 'published') {
    query = query.or('published.eq.true,status.eq.published')
  } else if (status === 'draft') {
    query = query.eq('published', false).or('status.eq.draft,status.is.null')
  } else if (status === 'scheduled') {
    query = query.or('status.eq.scheduled,scheduled_published_at.not.is.null')
  }
  if (search) {
    const esc = search.replace(/[\\%_]/g, m => `\\${m}`)
    query = query.ilike('title', `%${esc}%`)
  }

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const normalizedArticles = (data || []).map((post: any) => ({
    ...post,
    status: post.published === true || post.status === 'published'
      ? 'published'
      : (post.status === 'scheduled' || post.scheduled_published_at ? 'scheduled' : 'draft'),
  }))

  return NextResponse.json({ articles: normalizedArticles, total: count || 0, page: rawPage, limit: rawLimit })
}

export async function POST(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  const body = await req.json()
  const payload: Record<string, any> = { ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

  if (body.status === 'published' || body.published === true) {
    payload.published = true;
    payload.status = 'published';
  } else if (body.status === 'scheduled') {
    payload.published = false;
    payload.status = 'scheduled';
  } else {
    payload.published = false;
    payload.status = 'draft';
  }

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

    // Legacy sync to articles removed — cms_blog_posts is source of truth (#448)
    // Table articles backed up to backup_articles_20260915, will be dropped after 7d

  await revalidateCmsTarget({ slug: data?.slug, type: 'article' })

  return NextResponse.json({ article: data }, { status: 201 })
}
