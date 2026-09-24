// Migration de la page /guides (hub "guides pratiques") vers le CMS 3.0.
// Pattern établi : getPageZones() serveur + InlineEditProvider + EditableZone,
// valeurs actuelles en fallback (aucun changement visible attendu).
// Extrait depuis `git show HEAD:app/guides/page.tsx` (readOriginal).
//
// Usage : node scripts/generate-guides-cms.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const sqlEscape = (v) => v.replace(/'/g, "''")
const q = (s) => JSON.stringify(s)
const decodeEntities = (s) =>
  (s || '')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')

const PAGE = 'guides'
const FILE = 'app/guides/page.tsx'

function readOriginal(relPath) {
  try {
    return execSync(`git show HEAD:${relPath}`, { cwd: ROOT, encoding: 'utf8' })
  } catch {
    return readFileSync(join(ROOT, relPath), 'utf8')
  }
}

const collapse = (s) => decodeEntities(s).replace(/<\/?[^>]+>/g, '').replace(/\s+/g, ' ').trim()

// ═══════════════════════════ Extraction ═══════════════════════════

function getGuides(content) {
  const m = content.match(/const GUIDES = \[([\s\S]*?)\n\]/)
  if (!m) return []
  try {
    const re = /"(?:[^"\\]|\\.)*"|'((?:[^'\\]|\\.)*)'/g
    const singles = []
    const doubles = []
    let out = ''
    let last = 0
    let mm
    while ((mm = re.exec(m[1])) !== null) {
      out += m[1].slice(last, mm.index)
      if (mm[1] !== undefined) {
        singles.push(mm[1])
        out += `\u0000${singles.length - 1}\u0000`
      } else {
        doubles.push(mm[0])
        out += `\u0001${doubles.length - 1}\u0001`
      }
      last = mm.index + mm[0].length
    }
    out += m[1].slice(last)
    out = out.replace(/(^|[{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    out = out.replace(/\u0001(\d+)\u0001/g, (_, i) => doubles[+i])
    out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => JSON.stringify(singles[+i].replace(/\\'/g, "'")))
    return JSON.parse(`[${out}]`.replace(/,\s*([}\]])/g, '$1'))
  } catch (e) {
    console.log(`  ⚠ GUIDES: ${e.message}`)
    return []
  }
}

function getHero(content) {
  const h1 = content.match(/<h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-5 leading-tight">\s*([\s\S]*?)\s*<\/h1>/)?.[1] || ''
  return {
    eyebrow: content.match(/<p className="text-xs uppercase tracking-\[0\.2em\] text-mahogany font-semibold mb-4">\s*([\s\S]*?)\s*<\/p>/)?.[1] || '',
    title: collapse(h1),
    description: content.match(/<p className="text-charcoal\/70 text-lg max-w-xl mx-auto leading-relaxed">\s*([\s\S]*?)\s*<\/p>/)?.[1] || '',
  }
}

function getCta(content) {
  return {
    text: collapse(content.match(/<p className="text-charcoal\/60 text-sm mb-4">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''),
  }
}

// ═══════════════════════════ Zone SQL ═══════════════════════════

function buildZones(rows, data) {
  const add = (key, type, value, label) =>
    rows.push([`'${PAGE}'`, `'${key}'`, `'${type}'`, `'${sqlEscape(value)}'`, `'${sqlEscape(label)}'`])

  add('hero_eyebrow', 'text', data.hero.eyebrow, 'Surtitre du hero')
  add('hero_title', 'text', data.hero.title, 'Titre du hero')
  add('hero_description', 'textarea', data.hero.description, 'Description du hero')
  data.guides.forEach((c, i) => {
    add(`guide_${i + 1}_emoji`, 'text', c.emoji, `Guide ${i + 1} — emoji`)
    add(`guide_${i + 1}_destination`, 'text', c.destination, `Guide ${i + 1} — destination`)
    add(`guide_${i + 1}_title`, 'text', c.title, `Guide ${i + 1} — titre`)
    add(`guide_${i + 1}_description`, 'textarea', c.description, `Guide ${i + 1} — description`)
  })
  add('cta_text', 'textarea', data.cta.text, 'Texte de la section basse')
}

function buildSql(rows) {
  return [
    '-- ============================================================================',
    '-- Page /guides : contenu piloté par le CMS',
    '-- Date: 2026-08-01 — généré par scripts/generate-guides-cms.mjs',
    '--',
    '-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.',
    '',
    'INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)',
    'VALUES',
    rows.map((r) => `  (${r.join(', ')})`).join(',\n'),
    `ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();`,
    '',
  ].join('\n')
}

// ═══════════════════════════ Template ═══════════════════════════

function buildPage(data, meta) {
  const guidesJsx = data.guides
    .map(
      (c, i) => `                <Link
                  key={GUIDES[${i}].slug}
                  href={'/guides/' + GUIDES[${i}].slug}
                  className="group flex gap-6 rounded-2xl border border-stone-200 bg-stone-50 p-6 hover:border-eucalyptus/40 hover:bg-eucalyptus/5 transition-all"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-eucalyptus/10 flex items-center justify-center text-3xl">
                    {Z('guide_${i + 1}_emoji', 'text', ${q(c.emoji)}, undefined, 'span')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-eucalyptus font-semibold mb-1">
                      {Z('guide_${i + 1}_destination', 'text', ${q(c.destination)}, undefined, 'span')}
                    </p>
                    <h2 className="text-xl font-serif font-light text-stone-900 mb-2 group-hover:text-mahogany transition-colors leading-snug">
                      {Z('guide_${i + 1}_title', 'text', ${q(c.title)}, undefined, 'span')}
                    </h2>
                    <p className="text-sm text-charcoal/60 leading-relaxed">
                      {Z('guide_${i + 1}_description', 'textarea', ${q(c.description)}, undefined, 'span')}
                    </p>
                  </div>
                </Link>`
    )
    .join('\n')

  return `import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getPageZones } from '@/lib/cms-zones'

const PAGE = ${q(PAGE)};
const GUIDES = [
${data.guides.map((g) => `  { slug: ${q(g.slug)}, title: ${q(g.title)}, description: ${q(g.description)}, destination: ${q(g.destination)}, emoji: ${q(g.emoji)} },`).join('\n')}
];

export const metadata: Metadata = {
  title: ${q(meta.title)},
  description: ${q(meta.description)},
  alternates: {
    canonical: ${q(meta.canonicalPath)},
  },
  openGraph: {
    url: ${q(meta.canonicalPath)},
    title: ${q(meta.ogTitle)},
    description: ${q(meta.ogDescription)},
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: ${q(meta.ogImageAlt)},
      },
    ],
    locale: 'fr_FR',
    type: ${q(meta.ogType)},
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: ${q(meta.ogTitle)},
    description: ${q(meta.ogDescription)},
    creator: '@heldonica',
    images: ['/og-default.jpg'],
  },
};

export default async function GuidesPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-cloud-dancer py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-mahogany font-semibold mb-4">
              {Z('hero_eyebrow', 'text', ${q(data.hero.eyebrow)}, undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-5 leading-tight">
              {Z('hero_title', 'text', ${q(data.hero.title)}, undefined, 'span')}
            </h1>
            <p className="text-charcoal/70 text-lg max-w-xl mx-auto leading-relaxed">
              {Z('hero_description', 'textarea', ${q(data.hero.description)}, undefined, 'span')}
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid gap-6">
${guidesJsx}
            </div>
          </div>
        </section>

        <section className="bg-stone-50 border-t border-stone-200 py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-charcoal/60 text-sm mb-4">
              {Z('cta_text', 'textarea', ${q(data.cta.text)}, undefined, 'span')}
            </p>
            <Link href="/destinations" className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:underline">
              ← Voir toutes nos destinations
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
`
}

// ═══════════════════════════ Exécution ═══════════════════════════

const content = readOriginal(FILE)

const data = {
  guides: getGuides(content),
  hero: getHero(content),
  cta: getCta(content),
}

const meta = {
  title: 'Guides de voyage | Heldonica',
  description: "Nos guides pratiques terrain : pépites dénichées, adresses testées, conseils slow travel. Ce qu'on n'a pas mis sur le blog.",
  canonicalPath: 'https://www.heldonica.fr/guides',
  ogTitle: 'Guides de voyage | Heldonica',
  ogDescription: 'Nos guides pratiques terrain : pépites dénichées, adresses testées, conseils slow travel.',
  ogImageAlt: 'Guides de voyage — Heldonica',
  ogType: 'website',
}

const page = buildPage(data, meta)
const rows = []
buildZones(rows, data)
writeFileSync(join(ROOT, FILE), page, 'utf8')

console.log(`✔ ${PAGE}: ${rows.length} zones — page réécrite`)
console.log(`  hero: "${data.hero.title}" | description: ${data.hero.description.length} chars | guides: ${data.guides.map((g) => g.slug).join(', ')} | cta: ${data.cta.text.length} chars`)

const sqlPath = join(ROOT, 'supabase/migrations/20260801_cms_guides_zones.sql')
writeFileSync(sqlPath, buildSql(rows), 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '\\', '')}`)
