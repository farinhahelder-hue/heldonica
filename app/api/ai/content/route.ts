import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/ai/content - List articles for AI agent consumption
// Query params: category, country, travel_style, season, published, limit
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const country = searchParams.get('country')
  const travel_style = searchParams.get('travel_style')
  const season = searchParams.get('season')
  const published = searchParams.get('published') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')

  let query = supabase
    .from('cms_blog_posts')
    .select('id,title,slug,category,excerpt,featured_image,content,published,created_at,country,city,travel_style,season,budget_level,audience')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (category) query = query.eq('category', category)
  if (country) query = query.eq('country', country)
  if (travel_style) query = query.eq('travel_style', travel_style)
  if (season) query = query.eq('season', season)
  query = query.eq('published', published)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with taxonomy data
  const enriched = data?.map(article => ({
    ...article,
    word_count: article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
    read_time_min: Math.ceil((article.content?.length || 0) / 1000),
    _taxonomy: {
      category_label: article.category,
      country_flag: article.country ? getCountryFlag(article.country) : null,
    }
  }))

  return NextResponse.json({ articles: enriched, count: data?.length || 0 })
}

// POST /api/ai/content - Create/update article via AI agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, article } = body

    if (action === 'create') {
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .insert([{
          title: article.title,
          slug: article.slug || generateSlug(article.title),
          category: article.category || 'stories',
          excerpt: article.excerpt,
          content: article.content,
          featured_image: article.featured_image,
          published: article.published || false,
          country: article.country,
          city: article.city,
          travel_style: article.travel_style,
          season: article.season,
          budget_level: article.budget_level,
          meta_title: article.meta_title,
          meta_description: article.meta_description,
        }])
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true, article: data })
    }

    if (action === 'update' && article.id) {
      const { data, error } = await supabase
        .from('cms_blog_posts')
        .update({
          ...article,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true, article: data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Helpers
function generateSlug(title: string): string {
  return title.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    'Portugal': '🇵🇹',
    'France': '🇫🇷',
    'Espagne': '🇪🇸',
    'Italie': '🇮🇹',
    'Suisse': '🇨🇭',
    'Allemagne': '🇩🇪',
  }
  return flags[country] || '🌍'
}