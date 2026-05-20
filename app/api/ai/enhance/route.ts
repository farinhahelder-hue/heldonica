import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkBrandVoice, FORBIDDEN_WORDS } from '@/lib/brand-voice'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Optional API key for external agents
const API_KEY = process.env.AI_AGENT_API_KEY

// POST /api/ai/enhance - Enhance article content (improve text, SEO, media suggestions)
// Body: { article_id, enhancements: ['text', 'seo', 'media', 'forbidden'] }

export async function POST(request: NextRequest) {
  // API key check for external agents
  const auth = request.headers.get('x-api-key')
  if (API_KEY && auth !== API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { article_id, enhancements = ['text'] } = body

    if (!article_id) {
      return NextResponse.json({ error: 'article_id required' }, { status: 400 })
    }

    // Get article
    const { data: article, error } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .eq('id', article_id)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const results: any = {}

    // 1. Text improvement
    if (enhancements.includes('text')) {
      results.text = enhanceText(article)
    }

    // 2. SEO optimization
    if (enhancements.includes('seo')) {
      results.seo = optimizeSEO(article)
    }

    // 3. Media suggestions
    if (enhancements.includes('media')) {
      results.media = suggestMedia(article)
    }

    // 4. Forbidden words check
    if (enhancements.includes('forbidden')) {
      results.forbidden = checkForbidden(article)
    }

    return NextResponse.json({
      article_id,
      title: article.title,
      enhancements: results,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Helpers
function enhanceText(article: any): any {
  const content = article.content || ''
  const title = article.title || ''

  const suggestions: string[] = []

  // Check for weak openings
  if (content.length > 0) {
    const firstPara = content.replace(/<[^>]*>/g, '').slice(0, 200).toLowerCase()
    
    if (!firstPara.startsWith('a ') && !firstPara.startsWith('dans ') && !firstPara.startsWith('pour ')) {
      suggestions.push('Envisager une accroche plus engageante (commencer par une question ou chiffre)')
    }
  }

  // Check paragraph length
  const paragraphs = content.split(/<\/?p[^>]*>/g).filter(Boolean)
  const longParagraphs = paragraphs.filter((p: string) => p.replace(/<[^>]*>/g, '').length > 300)
  if (longParagraphs.length > 0) {
    suggestions.push('Couper les paragraphes longs pour améliorer la lisibilité')
  }

  // Check for calls to action
  if (!content.toLowerCase().includes('abonnez') && !content.toLowerCase().includes('partagez')) {
    suggestions.push('Ajouter un call-to-action (abonnez-vous, partagez...)')
  }

  return {
    score: 100 - suggestions.length * 15,
    suggestions,
    improved_title: title.length < 30 ? title + ' - Guide complet' : title,
  }
}

function optimizeSEO(article: any): any {
  const title = article.title || ''
  const content = article.content || ''
  const meta_description = article.meta_description || ''

  const suggestions: string[] = []
  const seo_score = { title: 0, meta: 0, content: 0, total: 0 }

  // Title check
  if (title.length >= 30 && title.length <= 60) {
    seo_score.title = 30
    suggestions.push('✓ Titre SEO optimal')
  } else if (title.length < 30) {
    seo_score.title = 10
    suggestions.push(`Titre troppo corto (${title.length}/60)`)
  } else {
    seo_score.title = 15
    suggestions.push('Titre trop lungo (max 60 car.)')
  }

  // Meta description
  if (meta_description.length >= 120 && meta_description.length <= 160) {
    seo_score.meta = 30
  } else {
    seo_score.meta = 10
    suggestions.push(`Meta description: ${meta_description.length}/160 car.`)
  }

  // Content SEO
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  
  if (contentLower.includes(titleLower.slice(0, 20))) {
    seo_score.content = 20
    suggestions.push('✓ Mots-clés dans le contenu')
  } else {
    seo_score.content = 10
    suggestions.push('Ajouter mots-clés dans les premiers paragraphes')
  }

  seo_score.total = seo_score.title + seo_score.meta + seo_score.content

  // Suggestions
  const newMetaTitle = !article.meta_title && title.length <= 55 
    ? title 
    : article.meta_title
  const newMetaDesc = !article.meta_description && content.length > 0
    ? content.replace(/<[^>]*>/g, ' ').slice(0, 155) + '...'
    : article.meta_description

  return {
    score: seo_score.total,
    suggestions,
    meta_title: newMetaTitle,
    meta_description: newMetaDesc,
  }
}

function suggestMedia(article: any): any {
  const suggestions: any[] = []
  const country = article.country
  const category = article.category

  // Suggest Unsplash images based on context
  if (country && category === 'destinations') {
    suggestions.push({
      type: 'featured',
      query: `${country} landscape travel`,
      source: 'unsplash',
      priority: 'high',
    })
  }

  if (category === 'food') {
    suggestions.push({
      type: 'featured',
      query: 'gastronomy restaurant local food',
      source: 'unsplash',
      priority: 'high',
    })
  }

  // Suggest video embeds
  if (category === 'experiences') {
    suggestions.push({
      type: 'video',
      query: `${article.city || article.country} travel experience`,
      source: 'youtube',
      priority: 'medium',
    })
  }

  return {
    suggestions,
    needs_image: !article.featured_image,
  }
}

function checkForbidden(article: any): any {
  const allText = [
    article.title,
    article.excerpt,
    article.content,
  ].join(' ').toLowerCase()

  const found: string[] = []
  for (const word of FORBIDDEN_WORDS) {
    if (allText.includes(word.toLowerCase())) {
      found.push(word)
    }
  }

  const replacements: Record<string, string> = {
    'bons plans': 'pépites',
    'bon plan': 'adresse secrète',
    'tips': "conseil d'initié",
    'circuit': 'itinéraire',
    'package': 'voyage sur-mesure',
    'lieu incontournable': 'adresse favorite',
  }

  return {
    found,
    clean: found.length === 0,
    score: found.length > 0 ? 50 - found.length * 15 : 100,
    replacements: found.map(w => ({
      original: w,
      suggestion: replacements[w] || 'éviter',
    })),
  }
}