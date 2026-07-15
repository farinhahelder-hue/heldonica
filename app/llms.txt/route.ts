import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const revalidate = 3600

const SITE_URL = 'https://www.heldonica.fr'

export async function GET() {
  let articles: any[] = []

  try {
    const supabase = createServiceClient()
    if (supabase) {
      const { data } = await supabase
        .from('cms_blog_posts')
        .select('slug, title, excerpt, content, category, tags, author, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
      articles = data || []
    }
  } catch (error) {
    console.warn('LLMS.txt: Supabase not available, using empty articles list')
  }

  const sitePages = [
    { url: SITE_URL, importance: 1.0 },
    { url: `${SITE_URL}/a-propos`, importance: 0.8 },
    { url: `${SITE_URL}/blog`, importance: 0.9 },
    { url: `${SITE_URL}/slow-travel`, importance: 0.9 },
    { url: `${SITE_URL}/destinations`, importance: 0.8 },
    { url: `${SITE_URL}/travel-planning`, importance: 0.8 },
    { url: `${SITE_URL}/contact`, importance: 0.6 },
  ]

  const lines: string[] = [
    '# Heldonica - Slow Travel en Duo',
    '',
    '## Overview',
    'Heldonica est un blog de slow travel vecu en couple, base entre Paris, Madere et la Roumanie. Chaque article documente une experience reelle - periodes, lieux precis, conditions de voyage.',
    '',
    '## Core Topics',
    '',
    '### Slow Travel',
    '- Qu\'est-ce que le slow travel ?',
    '- Comment planifier un voyage lent en couple',
    '- Destinations slow travel en France, Europe et monde',
    '',
    '### Destinations documentees',
    `${articles?.length ?? 0} articles couvrant Madere, Roumanie, Normandie, Sicile, Sardaigne, Tanzanie, Colombie, Afrique du Sud.`,
    '',
    '### Services',
    '- Travel Planning sur mesure ecoresponsable',
    '- Carnets de voyage terrain',
    '',
    '## Top Pages',
    '',
  ]

  for (const page of sitePages) {
    lines.push(`- ${page.url}`)
  }
  lines.push('')

  if (articles && articles.length > 0) {
    lines.push(`## Articles (${articles.length} publies)`)
    lines.push('')

    for (const article of articles) {
      const tags = article.tags ?? []
      const excerpt = article.excerpt
        ? article.excerpt.length > 200
          ? article.excerpt.substring(0, 197) + '...'
          : article.excerpt
        : ''

      lines.push(`### ${article.title}`)
      lines.push(`URL: ${SITE_URL}/blog/${article.slug}`)

      if (article.author) lines.push(`Author: ${article.author}`)
      if (article.published_at) lines.push(`Date: ${new Date(article.published_at).toISOString().split('T')[0]}`)
      if (article.category) lines.push(`Category: ${article.category}`)
      if (tags.length > 0) lines.push(`Tags: ${tags.join(', ')}`)

      if (excerpt) lines.push(`Summary: ${excerpt}`)

      if (article.content) {
        const plainText = article.content
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        const preview = plainText.length > 500 ? plainText.substring(0, 497) + '...' : plainText
        if (preview) lines.push(`Content preview: ${preview}`)
      }

      lines.push('')
    }
  }

  lines.push('## Contact')
  lines.push(`- Site: ${SITE_URL}`)
  lines.push('- Email: contact@heldonica.fr')
  lines.push('- Instagram: @heldonica')
  lines.push('')

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
