import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'
import { autoScheduleInstagramPost } from '@/lib/instagram'

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
  read_time?: number;
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

function withoutReadTime(payload: Record<string, unknown>) {
  const { read_time, ...rest } = payload
  return rest
}

function withoutVoiceNotesAndReadTime(payload: Record<string, unknown>) {
  const { voice_notes, read_time, ...rest } = payload
  return rest
}

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  const { data, error } = await sb
    .from('cms_blog_posts')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ article: data })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  const body = await req.json()

  // Auto-calculate reading_time from content (200 words per minute)
  const wordCount = (body.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  const readingTime = Math.ceil(wordCount / 200)

  const payload = {
    ...body,
    updated_at: new Date().toISOString(),
    read_time: readingTime,
  }

  // Map status to published boolean for backward compat
  if (body.status === 'published') payload.published = true;
  else if (body.status === 'draft') payload.published = false;

  // Phase 3: Save revision before updating
  const { data: raw } = await sb.from('cms_blog_posts').select('title, content, excerpt').eq('id', params.id).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (async () => {
    if (raw && typeof raw === 'object' && 'title' in raw) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const current = raw as any;
      // @ts-expect-error article_revisions table exists but types not generated
      await sb.from('article_revisions').insert({
        article_id: parseInt(params.id),
        title: current.title,
        content: current.content,
        excerpt: current.excerpt,
        word_count: (current.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
      });
    }
  })().catch(() => {/* ignore revision errors */});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = await (sb.from('cms_blog_posts') as any)
    .update(payload)
    .eq('id', params.id)
    .select()
    .single()
  let { data, error } = result;

  // Fallback 1 — read_time column missing
  if (error?.message?.includes('read_time') && error.message.includes('does not exist')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fallback: any = await (sb.from('cms_blog_posts') as any)
      .update(withoutReadTime(payload))
      .eq('id', params.id)
      .select()
      .single()
    data = fallback.data;
    error = fallback.error;
  }

  // Fallback 2 — voice_notes column missing
  if (error?.message?.includes('voice_notes') && error.message.includes('does not exist')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fallback: any = await (sb.from('cms_blog_posts') as any)
      .update(withoutVoiceNotes(payload))
      .eq('id', params.id)
      .select()
      .single()
    data = fallback.data;
    error = fallback.error;
  }

  // Fallback 3 — both columns missing
  if (error?.message && (error.message.includes('read_time') || error.message.includes('voice_notes'))) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fallback: any = await (sb.from('cms_blog_posts') as any)
      .update(withoutVoiceNotesAndReadTime(payload))
      .eq('id', params.id)
      .select()
      .single()
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also sync to articles table for public pages
  if (data) {
    const p = data as unknown as Record<string, unknown>;
    const articlesPayload = {
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      excerpt: p.excerpt,
      content: p.content,
      featured_image: p.featured_image,
      author: p.author,
      published: p.published,
      published_at: p.published_at,
      updated_at: p.updated_at,
      tags: p.tags || [],
      archived: p.archived || false,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
      visit_date: p.visit_date,
      visit_count: p.visit_count,
      sitemap_priority: p.sitemap_priority,
      sitemap_changefreq: p.sitemap_changefreq,
    }
    // Sync to articles table - ignore errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sb.from('articles') as any).upsert(articlesPayload).then(() => {}).catch(() => {})
  }

  // Auto-schedule Instagram post when article is published (fire-and-forget)
  if (body.status === 'published' && data) {
    autoScheduleInstagramPost(params.id, {
      title: (data as any).title || '',
      slug: (data as any).slug || '',
      excerpt: (data as any).excerpt || '',
      featured_image: (data as any).featured_image || '',
      category: (data as any).category || '',
    }).catch(() => {})
  }

  return NextResponse.json({ article: data })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  // Get article slug before deletion for articles table sync
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: article } = await (sb.from('cms_blog_posts') as any).select('slug').eq('id', params.id).single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb.from('cms_blog_posts') as any).delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also archive in articles table for public pages
  if (article?.slug) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(sb.from('articles') as any).update({ archived: true }).eq('slug', article.slug).then(() => {}).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
