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
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '15', 10)
  
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = sb
    .from('cms_blog_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status === 'published') query = query.eq('published', true)
  if (status === 'draft') query = query.eq('published', false)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ articles: data, total: count || 0, page, limit })
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

    // Legacy sync to articles removed — cms_blog_posts is source of truth (#448)
    // Table articles backed up to backup_articles_20260915, will be dropped after 7d

  await revalidateCmsTarget({ slug: data?.slug, type: 'article' })

  return NextResponse.json({ article: data }, { status: 201 })
}
