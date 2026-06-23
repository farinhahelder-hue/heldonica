import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

// Lazy initialization to avoid build-time crash
const getSupabase = () => {
  try {
    return createServiceClient()
  } catch {
    return null
  }
}

// GET /api/n8n/articles - Get articles for n8n workflows
// Query: ?category=&country=&status=&days=&limit=

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable - Supabase not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)

  const category = searchParams.get('category')
  const country = searchParams.get('country')
  const status = searchParams.get('status') // published | draft | all
  const days = parseInt(searchParams.get('days') || '7')
  const limit = parseInt(searchParams.get('limit') || '20')

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)

  let query = supabase
    .from('cms_blog_posts')
    .select('id,title,slug,category,excerpt,featured_image,published,created_at,published_at,country,city,travel_style,season')
    .gte('created_at', fromDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('category', category)
  if (country) query = query.eq('country', country)
  if (status === 'published') query = query.eq('published', true)
  else if (status === 'draft') query = query.eq('published', false)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items = data?.map((article: { id: number; title: string; slug: string; category: string | null; excerpt: string | null; featured_image: string | null; published: boolean | null; created_at: string; published_at: string | null; country: string | null; city: string | null; travel_style: string | null; season: string | null }) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    url: `https://www.heldonica.fr/blog/${article.slug}`,
    category: article.category,
    excerpt: article.excerpt,
    image: article.featured_image,
    published: article.published,
    created_at: article.created_at,
    published_at: article.published_at,
    country: article.country,
    city: article.city,
    travel_style: article.travel_style,
    season: article.season,
  })) || []

  return NextResponse.json({ count: items.length, items })
}

// PATCH /api/n8n/articles - Update article from n8n
// Body: { id, published?, category?, travel_style?, season? }

export async function PATCH(request: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable - Supabase not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { id, published, category, travel_style, season } = body

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 })
    }

    const updates: any = {}
    if (published !== undefined) updates.published = published
    if (category) updates.category = category
    if (travel_style) updates.travel_style = travel_style
    if (season) updates.season = season

    const { data, error } = await supabase
      .from('cms_blog_posts')
      .update(updates)
      .eq('id', id)
      .select('id,title,slug,published')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, article: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
