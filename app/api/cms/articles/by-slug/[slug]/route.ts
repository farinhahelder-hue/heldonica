import { NextRequest, NextResponse } from 'next/server'
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

// GET /api/cms/articles/by-slug/[slug] - Fetch article by slug
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  const { data, error } = await sb
    .from('cms_blog_posts')
    .select('id, slug, title, show_map')
    .eq('slug', params.slug)
    .single()
  
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ...data })
}

// PATCH /api/cms/articles/by-slug/[slug] - Update article by slug (e.g., show_map toggle)
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const authResponse = await requireCmsAuth(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  const body = await req.json()

  const { data, error } = await sb
    .from('cms_blog_posts')
    .update({ show_map: body.show_map })
    .eq('slug', params.slug)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ...data })
}