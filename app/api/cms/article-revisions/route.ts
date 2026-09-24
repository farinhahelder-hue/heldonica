import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'

let _cached: ReturnType<typeof createClient> | null = null
function supabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    _cached = (url && key) ? createClient(url, key) : null
  }
  return _cached
}

export const dynamic = 'force-dynamic'

// GET /api/cms/article-revisions?article_id=123 - list revisions for an article
export async function GET(req: Request) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const articleId = searchParams.get('article_id')

  if (!articleId) {
    return NextResponse.json({ error: 'article_id requis' }, { status: 400 })
  }

  const { data, error } = await sb
    .from('article_revisions')
    .select('id, article_id, title, content, excerpt, saved_at, word_count')
    .eq('article_id', articleId)
    .order('saved_at', { ascending: false })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ revisions: data })
}