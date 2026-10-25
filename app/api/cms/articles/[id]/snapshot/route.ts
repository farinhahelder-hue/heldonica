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

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const { id } = await params
  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  const { data: article, error: fetchError } = await sb
    .from('cms_blog_posts')
    .select('title, slug, excerpt, content')
    .eq('id', id)
    .single()

  if (fetchError || !article) {
    return NextResponse.json({ error: fetchError?.message || 'Article not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: insertError } = await (sb.from('article_versions') as any)
    .insert({
      article_id: id,
      title: (article as any).title,
      slug: (article as any).slug,
      excerpt: (article as any).excerpt,
      content: (article as any).content,
      created_at: new Date().toISOString()
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
