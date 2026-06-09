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
      updated_at: data.updated_at,
      tags: data.tags || [],
      archived: data.archived || false,
      read_time: data.read_time,
    }
    // Sync to articles table - ignore errors
    sb.from('articles').upsert(articlesPayload).then(() => {}).catch(() => {})
  }

  return NextResponse.json({ article: data })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  // Get article slug before deletion for articles table sync
  const { data: article } = await sb.from('cms_blog_posts').select('slug').eq('id', params.id).single()

  const { error } = await sb.from('cms_blog_posts').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also archive in articles table for public pages
  if (article?.slug) {
    sb.from('articles').update({ archived: true }).eq('slug', article.slug).then(() => {}).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
