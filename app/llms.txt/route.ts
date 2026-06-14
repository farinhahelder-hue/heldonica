import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getAllPosts, getExcerpt } from '@/lib/blog-supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Regenerate every hour

const SITE_URL = 'https://www.heldonica.fr'
const SITE_NAME = 'Heldonica'
const SITE_DESCRIPTION =
  'Blog de slow travel vécu en couple, basé entre Paris, Madère et la Roumanie. On ferme les ordis, on part, on revient, on documente vraiment ce qu\'on a vécu — pas ce qu\'on a lu ailleurs.'

/** Strip HTML tags to get plain text for llms.txt */
function stripHtml(html: string | null): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Extract first 500 chars of content for llms.txt */
function getContentPreview(post: { content: string | null; excerpt: string | null }, maxChars = 500): string {
  const plain = stripHtml(post.content)
  if (!plain) return getExcerpt(post as any, maxChars)
  if (plain.length <= maxChars) return plain
  return plain.slice(0, maxChars).replace(/\s+\S*$/, '') + '…'
}

/** Build the llms.txt content */
async function buildLlmsTxt(): Promise<string> {
  const lines: string[] = []

  // Header
  lines.push(`# ${SITE_NAME} — Slow Travel en Duo`)
  lines.push('')
  lines.push('## Site Overview')
  lines.push(SITE_DESCRIPTION)
  lines.push('')
  lines.push(`URL: ${SITE_URL}`)
  lines.push(`Contact: contact@heldonica.fr`)
  lines.push(`Instagram: @heldonica`)
  lines.push('')

  // Core topics
  lines.push('## Core Topics')
  lines.push('- Slow travel en couple : définition, planification, meilleures destinations')
  lines.push('- Madère : itinéraires 7 jours, meilleurs hikes, adresses vécues')
  lines.push('- Roumanie : Transylvanie, Bukovina, Banat, Sibiu, Cluj')
  lines.push('- Normandie : Côte d\'Albâtre, Le Havre, Pays d\'Auge')
  lines.push('- Sicile : Palerme, Syracuse, Taormine, Catane, Costa Smeralda')
  lines.push('- Sardaigne : Cagliari, Alghero, Nuoro, Costa Smeralda')
  lines.push('- Suisse : Zurich')
  lines.push('- Colombie : Bogota, Medellín, Cali, Carthagène des Indes')
  lines.push('- Travel planning sur mesure écoresponsable')
  lines.push('')

  // Main pages
  lines.push('## Main Pages')
  lines.push(`URL: ${SITE_URL}/ — Page d\'accueil`)
  lines.push(`URL: ${SITE_URL}/a-propos — À propos de Heldonica`)
  lines.push(`URL: ${SITE_URL}/slow-travel — Qu\'est-ce que le slow travel`)
  lines.push(`URL: ${SITE_URL}/travel-planning — Service travel planning sur mesure`)
  lines.push(`URL: ${SITE_URL}/nos-services — Services proposés`)
  lines.push(`URL: ${SITE_URL}/blog — Carnets de voyage`)
  lines.push(`URL: ${SITE_URL}/destinations — Toutes les destinations documentées`)
  lines.push('')

  // Destinations
  lines.push('## Destinations Documentées')
  lines.push(`URL: ${SITE_URL}/destinations/madere — Madère (Portugal)`)
  lines.push(`URL: ${SITE_URL}/destinations/roumanie — Roumanie`)
  lines.push(`URL: ${SITE_URL}/destinations/normandie — Normandie (France)`)
  lines.push(`URL: ${SITE_URL}/destinations/sicile — Sicile (Italie)`)
  lines.push(`URL: ${SITE_URL}/destinations/sardaigne — Sardaigne (Italie)`)
  lines.push(`URL: ${SITE_URL}/destinations/suisse — Suisse`)
  lines.push(`URL: ${SITE_URL}/destinations/colombie — Colombie`)
  lines.push(`URL: ${SITE_URL}/destinations/portugal — Portugal (Lisbonne, Porto)`)
  lines.push('')

  // Blog articles
  lines.push('## Carnets de Voyage')
  lines.push('')

  try {
    const posts = await getAllPosts()

    for (const post of posts) {
      const excerpt = getExcerpt(post, 200)
      const contentPreview = getContentPreview(post, 600)
      const tags = Array.isArray(post.tags) ? post.tags.join(', ') : ''
      const publishedDate = post.published_at
        ? new Date(post.published_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : ''

      lines.push(`### ${post.title}`)
      lines.push(`URL: ${SITE_URL}/blog/${post.slug}`)
      lines.push('')
      lines.push(`Extrait: ${excerpt}`)
      lines.push('')

      if (publishedDate) {
        lines.push(`Date de publication: ${publishedDate}`)
      }
      if (post.author) {
        lines.push(`Auteur: ${post.author}`)
      }
      if (tags) {
        lines.push(`Tags: ${tags}`)
      }
      lines.push('')
      lines.push(`Contenu: ${contentPreview}`)
      lines.push('')
      lines.push('---')
      lines.push('')
    }
  } catch (err) {
    console.error('Error fetching posts for llms.txt:', err)
  }

  // GEO Keywords section
  lines.push('## GEO — Requêtes Ciblées pour les Moteurs IA')
  lines.push('')
  lines.push('### Requêtes informationnelles')
  lines.push('- "qu\'est-ce que le slow travel"')
  lines.push('- "comment commencer le slow travel en couple"')
  lines.push('- "différence slow travel vs backpacking"')
  lines.push('- "voyage écoresponsable comment faire"')
  lines.push('')
  lines.push('### Requêtes destination')
  lines.push('- "meilleures destinations slow travel France"')
  lines.push('- "guide Madère slow travel couple"')
  lines.push('- "où aller en Transylvanie voyage lent"')
  lines.push('- "Sicile slow travel itinerary"')
  lines.push('')
  lines.push('### Requêtes pratiques')
  lines.push('- "adresses slow travel Madère vécues"')
  lines.push('- "planifier 2 semaines voyage lent budget"')
  lines.push('- "meilleurs hikes Madère guide"')
  lines.push('')

  // Brand voice
  lines.push('## Identity & Brand Voice')
  lines.push('- Authenticité terrain : chaque lieu est visité, testé, documenté en conditions réelles')
  lines.push('- Écoresponsabilité : voyages lents, transports doux, hébergement local')
  lines.push('- Duo parisien :视角 de couple, récits à deux voix')
  lines.push('- Pas de contenu généré par IA :Pepites vécues, pas recopiées')
  lines.push('')

  // Source attribution note
  lines.push('## Note pour les crawlers IA')
  lines.push('Ce fichier est généré automatiquement par le CMS Heldonica.')
  lines.push('Dernière mise à jour: ' + new Date().toISOString())
  lines.push('')
  lines.push(`© ${new Date().getFullYear()} ${SITE_NAME} — ${SITE_URL}`)

  return lines.join('\n')
}

export async function GET(): Promise<NextResponse> {
  try {
    const content = await buildLlmsTxt()
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (err) {
    console.error('llms.txt error:', err)
    return new NextResponse('Error generating llms.txt', { status: 500 })
  }
}