// Migration des pages « destination » (DESTINATION_CONTENT de DestinationPage.tsx)
// vers le CMS 3.0 (cms_editable_zones), namespace `destinations-<slug>`.
//
//  1. Génère supabase/migrations/20260802_cms_destinations_zones.sql (idempotent)
//  2. Réécrit app/destinations/[slug]/DestinationPage.tsx avec le pattern CMS :
//     getPageZones() serveur + InlineEditProvider + EditableZone avec les valeurs
//     actuelles en fallback (aucun changement visible attendu).
//
// Usage : node scripts/generate-destinations-cms.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const FILE = join(ROOT, 'app/destinations/[slug]/DestinationPage.tsx')
const SQL_PATH = join(ROOT, 'supabase/migrations/20260802_cms_destinations_zones.sql')

// Les 5 slugs réellement routés (pages wrapper sans page dédiée) — montenegro &
// roumanie ont désormais leur pilier CMS (DestinationPillar), pas de migration ici.
const SLUGS = ['sicile', 'lisbonne', 'suisse', 'zurich', 'paris']

/** Lit `key: '...'` / `key: "..."` avec échappements, dans un bloc. */
function getValue(block, key) {
  const re = new RegExp(`${key}:\\s*(["'])((?:[^\\\\]|\\\\.)*?)\\1`, 's')
  const m = block.match(re)
  return m ? m[2].replace(/\\'/g, "'").replace(/\\"/g, '"') : ''
}

/** Extrait le tableau `tips: [...]` en liste de chaînes (une ou plusieurs lignes). */
function getTips(block) {
  const m = block.match(/tips:\s*\[([\s\S]*?)\]/)
  if (!m) return []
  const re = /(["'])((?:[^\\]|\\.)*?)\1/g
  const tips = []
  let match
  while ((match = re.exec(m[1])) !== null) tips.push(match[2].replace(/\\'/g, "'"))
  return tips
}

/** Extrait le bloc objet d'un slug dans DESTINATION_CONTENT. */
function getSlugBlock(content, slug) {
  const re = new RegExp(`'${slug}': \\{([\\s\\S]*?)\\r?\\n  \\},\\r?\\n`, 's')
  return content.match(re)?.[1] ?? null
}

const content = readFileSync(FILE, 'utf8')

const pages = []
for (const slug of SLUGS) {
  const block = getSlugBlock(content, slug)
  if (!block) {
    console.error(`⚠️ Bloc absent pour ${slug}`)
    process.exit(1)
  }
  const tips = getTips(block)
  pages.push({
    slug,
    title: getValue(block, 'title'),
    subtitle: getValue(block, 'subtitle'),
    description: getValue(block, 'description'),
    verdict: getValue(block, 'verdict'),
    duration: getValue(block, 'duration'),
    season: getValue(block, 'season'),
    budget: getValue(block, 'budget'),
    profile: getValue(block, 'profile'),
    tips,
  })
  console.log(`✔ ${slug}: title="${pages.at(-1).title}", tips=${tips.length}`)
}

// ─── SQL ─────────────────────────────────────────────────────────────────────

const sqlEscape = (v) => v.replace(/'/g, "''")

const lines = [
  '-- ============================================================================',
  '-- Pages destination : contenu piloté par le CMS (cms_editable_zones)',
  '-- Date: 2026-08-01 — généré par scripts/generate-destinations-cms.mjs',
  '-- ============================================================================',
  '-- Les pages sicile / lisbonne / suisse / zurich / paris (DestinationPage)',
  '-- passent du hardcodé (DESTINATION_CONTENT) à des zones éditables. Les',
  '-- valeurs ci-dessous sont EXACTEMENT le contenu affiché jusqu\'ici.',
  '--',
  '-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.',
  '',
]
for (const p of pages) {
  const page = `destinations-${p.slug}`
  const q = (v) => `'${sqlEscape(v)}'`
  lines.push(`-- ─── ${page} ────────────────────────────────────────────────────────`)
  lines.push('INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)')
  lines.push('VALUES')
  const rows = [
    [q(page), q('hero_image'), q('image'), q('/og-default.jpg'), q('Image du hero')],
    [q(page), q('title'), q('text'), q(p.title), q('Titre de la destination')],
    [q(page), q('subtitle'), q('text'), q(p.subtitle), q('Sous-titre')],
    [q(page), q('description'), q('textarea'), q(p.description), q('Description')],
    [q(page), q('verdict'), q('textarea'), q(p.verdict), q('Notre verdict')],
    [q(page), q('duration'), q('text'), q(p.duration), q('Durée idéale')],
    [q(page), q('season'), q('text'), q(p.season), q('Meilleure saison')],
    [q(page), q('budget'), q('text'), q(p.budget), q('Budget indicatif')],
    [q(page), q('profile'), q('text'), q(p.profile), q('Profil')],
  ]
  p.tips.forEach((tip, i) => {
    rows.push([q(page), q(`tip_${i + 1}`), q('textarea'), q(tip), q(`Notre conseil ${i + 1}`)])
  })
  lines.push(rows.map((r) => `  (${r.join(', ')})`).join(',\n'))
  lines.push(`ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();`)
  lines.push('')
}
writeFileSync(SQL_PATH, lines.join('\n'), 'utf8')
console.log(`✔ Migration écrite : ${SQL_PATH.replace(ROOT + '\\', '')}`)

// ─── Réécriture de DestinationPage.tsx ─────────────────────────────────────────

const jsx = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const highlights = pages
  .map(
    (p) =>
      `  '${p.slug}': {
    title: '${p.title.replace(/'/g, "\\'")}',
    subtitle: '${p.subtitle.replace(/'/g, "\\'")}',
    description: '${p.description.replace(/'/g, "\\'")}',
    verdict: '${p.verdict.replace(/'/g, "\\'")}',
    duration: '${p.duration.replace(/'/g, "\\'")}',
    season: '${p.season.replace(/'/g, "\\'")}',
    budget: '${p.budget.replace(/'/g, "\\'")}',
    profile: '${p.profile.replace(/'/g, "\\'")}',
    tips: [${p.tips.map((t) => `'${t.replace(/'/g, "\\'")}'`).join(', ')}],
  },`
  )
  .join('\n')

const newFile = `import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'
import RelatedArticles from '@/components/RelatedArticles'
import { supabase } from '@/lib/supabase-client'
import { notFound } from 'next/navigation'
import { BlogPost } from '@/lib/blog-supabase'
import { SUB_DESTINATIONS } from '@/lib/sub-destinations'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getPageZones } from '@/lib/cms-zones'

const DESTINATION_IMAGES: Record<string, string> = {
  'sicile': '/og-default.jpg',
  'lisbonne': '/og-default.jpg',
  'montenegro': '/og-default.jpg',
  'suisse': '/og-default.jpg',
  'zurich': '/og-default.jpg',
  'paris': '/og-default.jpg',
  'roumanie': '/og-default.jpg',
}

// Contenu de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const DESTINATION_CONTENT: Record<string, any> = {
${highlights}
}

type Props = {
  slug: string
}

// Fetch related articles for a destination
async function getRelatedArticlesForDestination(slug: string): Promise<BlogPost[]> {
  if (!supabase) return []
  
  try {
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(50)
    
    if (error || !data) return []
    
    // Match articles by destination keyword
    const patterns: Record<string, string[]> = {
      'roumanie': ['Roumanie', 'Maramure', 'Timisoara', 'Transylvanie', 'Sibiu', 'Brasov'],
      'madere': ['Madère', 'Madeira', 'Funchal'],
      'paris': ['Paris'],
      'zurich': ['Zurich'],
      'sicile': ['Sicile', 'Sicilia', 'Agrigente'],
      'lisbonne': ['Lisbonne', 'Lisboa'],
      'montenegro': ['Monténégro', 'Podgorica', 'Kotor'],
      'suisse': ['Suisse', 'Stoos', 'Alpes'],
    }
    
    const keywords = patterns[slug] || []
    if (keywords.length === 0) return []
    
    return data.filter((post: { title: string; excerpt?: string | null; destination?: string | null }) => {
      const searchText = \`\${post.title} \${post.excerpt || ''} \${post.destination || ''}\`.toLowerCase()
      return keywords.some(kw => searchText.includes(kw.toLowerCase()))
    }).slice(0, 3)
  } catch {
    return []
  }
}

export async function generateMetadata({ slug }: Props): Promise<Metadata> {
  const content = DESTINATION_CONTENT[slug]
  const image = DESTINATION_IMAGES[slug]
  if (!content) return { title: 'Destination non trouvée' }

  return {
    title: \`\${content.title} slow travel | Guide Heldonica\`,
    description: \`\${content.subtitle}. \${content.verdict}\`.slice(0, 155),
    alternates: {
      canonical: \`https://www.heldonica.fr/destinations/\${slug}\`,
    },
    openGraph: {
      title: \`\${content.title} slow travel | Guide Heldonica\`,
      description: content.description.slice(0, 160),
      url: \`https://www.heldonica.fr/destinations/\${slug}\`,
      images: [
        {
          url: image || '',
          width: 1200,
          height: 630,
          alt: \`\${content.title} - Slow travel Heldonica\`,
        },
      ],
      locale: 'fr_FR',
      type: 'article',
    },
  }
}

export default async function DestinationPage({ slug }: Props) {
  const content = DESTINATION_CONTENT[slug]
  const image = DESTINATION_IMAGES[slug]

  if (!content) {
    notFound()
  }

  const [relatedArticles, zones] = await Promise.all([
    getRelatedArticlesForDestination(slug),
    getPageZones(\`destinations-\${slug}\`),
  ])

  const Z = (zone: string, type: 'text' | 'textarea' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={\`destinations-\${slug}\`} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={\`destinations-\${slug}\`} initialZones={zones}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAction",
            "name": \`\${content.title} slow travel\`,
            "description": content.description,
            "location": {
              "@type": "Place",
              "name": content.title,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": content.title
              }
            },
            "provider": {
              "@type": "Organization",
              "name": "Heldonica",
              "url": "https://www.heldonica.fr"
            }
          })
        }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-end overflow-hidden bg-stone-900">
          {Z('hero_image', 'image', image, 'w-full h-full object-cover opacity-60')}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative container py-14 md:py-20 max-w-4xl">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">
              Destination testée
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">
              {Z('title', 'text', content.title, undefined, 'span')}, <em className="text-teal">{Z('subtitle', 'text', content.subtitle, undefined, 'span')}</em>
            </h1>
            <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
              {Z('description', 'textarea', content.description).toString().slice(0, 200)}...
            </p>
          </div>
        </section>

        {/* Info cards */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Durée idéale</p>
                <p className="text-charcoal font-medium">{Z('duration', 'text', content.duration, undefined, 'span')}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Meilleure saison</p>
                <p className="text-charcoal font-medium">{Z('season', 'text', content.season, undefined, 'span')}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Budget indicatif</p>
                <p className="text-charcoal font-medium">{Z('budget', 'text', content.budget, undefined, 'span')}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Profil</p>
                <p className="text-charcoal font-medium text-sm">{Z('profile', 'text', content.profile, undefined, 'span')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* On y est allés */}
        <section className="bg-white py-16">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">On y est allés</h2>
            <p className="text-charcoal/80 leading-relaxed text-lg mb-8">
              {Z('description', 'textarea', content.description, undefined, 'span')}
            </p>
          </div>
        </section>

        {/* Villes & pépites de la région */}
        {(() => {
          const subDests = SUB_DESTINATIONS[slug] || []
          if (subDests.length === 0) return null
          return (
            <section className="bg-stone-50 py-16 border-t border-b border-stone-200/60">
              <div className="container max-w-5xl">
                <h2 className="text-3xl font-serif text-mahogany mb-2 text-center">
                  Explorer les pépites de la région
                </h2>
                <p className="text-charcoal/60 text-sm text-center mb-10">
                  Nos guides détaillés de terrain par ville et site d&apos;intérêt.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {subDests.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={\`/destinations/\${slug}/\${sub.slug}\`}
                      className="group p-5 rounded-2xl bg-white border border-stone-100 hover:border-eucalyptus/30 hover:bg-eucalyptus/5 transition-all duration-300 flex flex-col h-full text-left"
                    >
                      <span className="text-3xl mb-3 block">{sub.emoji}</span>
                      <h3 className="font-serif font-bold text-stone-900 group-hover:text-eucalyptus transition-colors mb-2">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-charcoal/60 leading-relaxed line-clamp-2 flex-1">
                        {sub.teaser}
                      </p>
                      <span className="text-xs font-semibold text-eucalyptus mt-3 inline-block group-hover:translate-x-1 transition-transform">
                        Voir le guide →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )
        })()}

        {/* Nos tips */}
        <section className="bg-cloud-dancer py-16">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-serif text-mahogany mb-6">Ce qu&apos;on te recommande</h2>
            <ul className="space-y-4">
              {(content.tips ?? []).map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-eucalyptus/20 text-eucalyptus flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-charcoal/80">{Z(\`tip_\${i + 1}\`, 'textarea', tip, undefined, 'span')}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Verdict */}
        <section className="bg-stone-900 py-16">
          <div className="container max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">Notre verdict</p>
            <blockquote className="text-2xl md:text-3xl font-serif text-white leading-relaxed italic mb-6">
              &ldquo;{Z('verdict', 'textarea', content.verdict, undefined, 'span')}&rdquo;
            </blockquote>
            <p className="text-stone-400 text-sm">— Heldonica, testés sur place</p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-mahogany py-16 text-white">
          <div className="container max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-serif mb-4">
              Tu veux un voyage adapté à ton rythme ?
            </h2>
            <p className="text-white/80 mb-8">
              On transforme tes contraintes en itinéraire sur mesure, avec adresses testées.
            </p>
            <Link
              href={\`/travel-planning-form?destination=\${slug}\`}
              className="inline-flex px-8 py-4 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors shadow-md"
            >
              Planifier ce voyage avec Heldonica →
            </Link>
          </div>
        </section>

        {/* Quiz */}
        <section className="bg-cloud-dancer py-16">
          <div className="container max-w-4xl">
            <SlowTravelQuiz />
          </div>
        </section>

        {/* Related Articles */}
        <RelatedArticles articles={relatedArticles} destinationTitle={content.title} />
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
`

writeFileSync(FILE, newFile, 'utf8')
console.log(`✔ DestinationPage.tsx réécrit (${newFile.split('\n').length} lignes)`)
