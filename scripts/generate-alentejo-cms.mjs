// Migration de la page Alentejo vers le CMS 3.0.
// Pattern établi : getPageZones() serveur + InlineEditProvider + EditableZone
// avec les valeurs actuelles en fallback (aucun changement visible attendu).
//
// Tout est extrait depuis `git show HEAD:<fichier>` (readOriginal) pour
// une fidélité garantie et une répétabilité après réécriture.
//
// Usage : node scripts/generate-alentejo-cms.mjs

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

const PAGE = 'destinations-alentejo'
const FILE = 'app/destinations/alentejo/page.tsx'

function readOriginal(relPath) {
  try {
    return execSync(`git show HEAD:${relPath}`, { cwd: ROOT, encoding: 'utf8' })
  } catch {
    return readFileSync(join(ROOT, relPath), 'utf8')
  }
}

function extractBlock(content, from, to) {
  const i = content.indexOf(from)
  if (i === -1) return null
  const j = content.indexOf(to, i + from.length)
  if (j === -1) return null
  return content.slice(i + from.length, j)
}

/** Const objet JS → JSON (clés simple/double quotes, template literals ${SITE_URL}). */
function parseJsonConst(content, name) {
  const m = content.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\n\\}\\;?`))
  if (!m) return null
  try {
    let body = m[1].replace(/\$\{SITE_URL\}/g, 'https://www.heldonica.fr')
    body = body.replace(/`([^`]*)`/g, '"$1"')
    const dq = []
    body = body.replace(/"(?:[^"\\]|\\.)*"/g, (s) => {
      dq.push(s)
      return `\u0000${dq.length - 1}\u0000`
    })
    body = body.replace(/'((?:[^'\\]|\\.)*)'/g, (_, inner) => JSON.stringify(inner.replace(/\\'/g, "'")))
    body = body.replace(/(^|[{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    body = body.replace(/\u0000(\d+)\u0000/g, (_, i) => dq[+i])
    return JSON.parse(`{${body}}`.replace(/,\s*([}\]])/g, '$1'))
  } catch (e) {
    console.log(`  ⚠ JSON.parse(${name}) échoué: ${e.message}`)
    return null
  }
}

/** Schémas JSON-LD (scripts <Script> next/script). */
function getSchemas(content) {
  const out = []
  const re = /<script[\s\S]*?type="application\/ld\+json"[\s\S]*?JSON\.stringify\((\w+)\)[\s\S]*?\/>/gi
  let m
  while ((m = re.exec(content)) !== null) {
    const obj = parseJsonConst(content, m[1])
    if (obj) out.push(obj)
  }
  return out
}

/** Métadonnées (title / description / OG / canonical / ogImageAlt / ogType). */
function getMetadata(content) {
  const md = extractBlock(content, 'export const metadata: Metadata = {', '\n}') || content
  const pick = (block, prefix) => {
    const re1 = new RegExp(prefix + ":\\s*'((?:[^'\\\\]|\\\\.)*)'")
    const m1 = block.match(re1)
    if (m1) return m1[1].replace(/\\'/g, "'")
    const re2 = new RegExp(prefix + ':\\s*"((?:[^"\\\\]|\\\\.)*)"')
    const m2 = block.match(re2)
    if (m2) return m2[1].replace(/\\"/g, '"')
    return ''
  }
  const ogBlock = extractBlock(md, 'openGraph: {', 'images:') || ''
  return {
    title: pick(md, 'title'),
    description: pick(md, 'description'),
    canonicalPath: pick(md, 'canonical'),
    ogTitle: pick(ogBlock, 'title'),
    ogDescription: pick(ogBlock, 'description'),
    ogImageAlt: pick(md, 'alt'),
    ogType: md.match(/type: '(website|article)'/)?.[1] || 'website',
  }
}

const collapse = (s) => decodeEntities(s).replace(/<\/?[^>]+>/g, '').replace(/\s+/g, ' ').trim()

// ═══════════════════════════ Extraction ═══════════════════════════

function getHero(content) {
  const badge = content.match(/<span className="inline-block rounded-full bg-eucalyptus\/90[^"]*">\s*([\s\S]*?)\s*<\/span>/)?.[1] || ''
  const label = content.match(/<p className="text-teal text-xs font-bold tracking-\[0\.2em\] uppercase mb-3">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''
  const h1 = content.match(/<h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-4 leading-tight">\s*([\s\S]*?)\s*<\/h1>/)?.[1] || ''
  const [titlePart, subtitlePart] = h1.split(/<br\s*\/?>/)
  const subtitle = subtitlePart?.match(/<span className="text-teal\/80 italic">\s*([\s\S]*?)\s*<\/span>/)?.[1] || ''
  const description = content.match(/<p className="text-stone-300 text-base md:text-lg leading-relaxed max-w-2xl">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''
  return {
    badge: collapse(badge),
    label: collapse(label),
    title: collapse(titlePart),
    subtitle: collapse(subtitle),
    description: collapse(description),
  }
}

function getIntro(content) {
  const section = extractBlock(content, 'Notre retour terrain', '</section>') || ''
  return {
    label: section.match(/<p className="text-eucalyptus text-xs font-bold tracking-\[0\.2em\] uppercase mb-4">\s*([\s\S]*?)\s*<\/p>/)?.[1] || '',
    title: section.match(/<h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8">\s*([\s\S]*?)\s*<\/h2>/)?.[1] || '',
    paragraphs: [...section.matchAll(/<p className="text-stone-700 leading-relaxed(?: text-lg)?"?>\s*([\s\S]*?)\s*<\/p>/g)].map((m) => m[1].trim()),
  }
}

function getQuickFacts(content) {
  const section = extractBlock(content, 'Bon à savoir', '</section>') || ''
  const cells = []
  const re = /<div className="text-center">\s*<p className="text-xs text-stone-500 uppercase tracking-wider mb-1">\s*([\s\S]*?)\s*<\/p>\s*<p className="text-lg font-serif text-stone-900">\s*([\s\S]*?)\s*<\/p>\s*<\/div>/g
  let m
  while ((m = re.exec(section)) !== null) {
    cells.push({ label: decodeEntities(m[1]).trim(), value: decodeEntities(m[2]).trim() })
  }
  return cells
}

function getPepites(content) {
  const section = extractBlock(content, 'Nos pépites dénichées', 'Où dormir selon ton style') || ''
  const cards = []
  const re = /<div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">\s*<div className="flex items-start gap-4 mb-4">\s*<div className="w-12 h-12 rounded-full bg-eucalyptus\/10[^"]*">\s*<span className="text-2xl">\s*([\s\S]*?)\s*<\/span>\s*<\/div>\s*<div>\s*<h3 className="text-xl font-serif text-stone-900 mb-1">\s*([\s\S]*?)\s*<\/h3>\s*<p className="text-sm text-eucalyptus\/80 font-medium">\s*([\s\S]*?)\s*<\/p>\s*<\/div>\s*<\/div>\s*<p className="text-stone-600 text-sm leading-relaxed mb-4">\s*([\s\S]*?)\s*<\/p>\s*<p className="text-xs text-stone-500 italic">\s*([\s\S]*?)\s*<\/p>\s*<\/div>/g
  let m
  while ((m = re.exec(section)) !== null) {
    cards.push({
      emoji: m[1].trim(),
      title: decodeEntities(m[2]).trim(),
      subtitle: decodeEntities(m[3]).trim(),
      desc: decodeEntities(m[4]).trim(),
      verdict: decodeEntities(m[5]).trim(),
    })
  }
  return cards
}

function getAccommodations(content) {
  const section = extractBlock(content, 'Où dormir selon ton style', 'Comment se déplacer') || ''
  const cards = []
  const re = /<div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">\s*<div className="w-12 h-12 rounded-full bg-teal\/10[^"]*">\s*<span className="text-2xl">\s*([\s\S]*?)\s*<\/span>\s*<\/div>\s*<h3 className="text-lg font-serif text-stone-900 mb-2">\s*([\s\S]*?)\s*<\/h3>\s*<p className="text-sm text-stone-600 mb-4">\s*([\s\S]*?)\s*<\/p>\s*<p className="text-xs text-stone-500">\s*([\s\S]*?)\s*<\/p>\s*<\/div>/g
  let m
  while ((m = re.exec(section)) !== null) {
    cards.push({
      emoji: m[1].trim(),
      title: decodeEntities(m[2]).trim(),
      desc: decodeEntities(m[3]).trim(),
      tip: decodeEntities(m[4]).trim(),
    })
  }
  return cards
}

function getTransports(content) {
  const section = extractBlock(content, 'Comment se déplacer', 'Tu veux qu') || ''
  const rows = []
  const re = /<div className="flex gap-4 p-6 bg-stone-50 rounded-2xl">\s*<div className="w-10 h-10 rounded-full bg-eucalyptus\/10[^"]*">\s*<span className="text-xl">\s*([\s\S]*?)\s*<\/span>\s*<\/div>\s*<div>\s*<h3 className="text-lg font-semibold text-stone-900 mb-2">\s*([\s\S]*?)\s*<\/h3>\s*<p className="text-stone-600 text-sm leading-relaxed">\s*([\s\S]*?)\s*<\/p>(?:\s*<p className="text-xs text-stone-500 mt-2">\s*([\s\S]*?)\s*<\/p>)?\s*<\/div>\s*<\/div>/g
  let m
  while ((m = re.exec(section)) !== null) {
    rows.push({
      emoji: m[1].trim(),
      title: decodeEntities(m[2]).trim(),
      desc: decodeEntities(m[3]).trim(),
      tip: m[4] ? decodeEntities(m[4]).trim() : '',
    })
  }
  return rows
}

function getCta(content) {
  const section = extractBlock(content, 'CTA TRAVEL PLANNING', '</section>') || ''
  const title = section.match(/<h2 className="text-3xl md:text-4xl font-serif font-light mb-4">\s*([\s\S]*?)\s*<\/h2>/)?.[1] || ''
  const text = section.match(/<p className="text-white\/80 mb-8 max-w-xl mx-auto">\s*([\s\S]*?)\s*<\/p>/)?.[1] || ''
  return { title: decodeEntities(title).trim(), text: decodeEntities(text).trim() }
}

function getArticles(content) {
  const section = extractBlock(content, 'Nos carnets liés', 'SlowTravelQuiz') || ''
  const cards = []
  const re = /<Link href="\/blog" className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">\s*<div className="relative h-40 bg-stone-200">\s*<Image[\s\S]*?alt="([^"]*)"[\s\S]*?<\/div>\s*<div className="p-5">\s*<p className="text-xs text-eucalyptus font-semibold mb-1">\s*([\s\S]*?)\s*<\/p>\s*<h3 className="font-serif text-stone-900 group-hover:text-eucalyptus transition-colors">\s*([\s\S]*?)\s*<\/h3>\s*<\/div>\s*<\/Link>/g
  let m
  while ((m = re.exec(section)) !== null) {
    cards.push({
      alt: decodeEntities(m[1]).trim(),
      label: decodeEntities(m[2]).trim(),
      title: decodeEntities(m[3]).trim(),
    })
  }
  return cards
}

// ═══════════════════════════ Zone SQL ═══════════════════════════

function buildZones(rows, data) {
  const add = (key, type, value, label) =>
    rows.push([`'${PAGE}'`, `'${key}'`, `'${type}'`, `'${sqlEscape(value)}'`, `'${sqlEscape(label)}'`])

  add('hero_badge', 'text', data.hero.badge, 'Badge du hero (testé par)')
  add('hero_label', 'text', data.hero.label, 'Label du hero')
  add('hero_title', 'text', data.hero.title, 'Titre du hero')
  add('hero_subtitle', 'text', data.hero.subtitle, 'Sous-titre du hero')
  add('hero_description', 'textarea', data.hero.description, 'Description du hero')
  add('intro_label', 'text', data.intro.label, "Label d'intro (retour terrain)")
  add('intro_title', 'text', data.intro.title, "Titre d'intro")
  data.intro.paragraphs.forEach((p, i) => add(`intro_${i + 1}`, 'html', p, `Paragraphe d'intro ${i + 1}`))
  data.quick.forEach((c, i) => {
    add(`quick_${i + 1}_label`, 'text', c.label, `En bref ${i + 1} — label`)
    add(`quick_${i + 1}_value`, 'html', c.value, `En bref ${i + 1} — valeur`)
  })
  data.pepites.forEach((c, i) => {
    add(`pepite_${i + 1}_emoji`, 'text', c.emoji, `Pépite ${i + 1} — emoji`)
    add(`pepite_${i + 1}_title`, 'text', c.title, `Pépite ${i + 1} — titre`)
    add(`pepite_${i + 1}_subtitle`, 'text', c.subtitle, `Pépite ${i + 1} — sous-titre`)
    add(`pepite_${i + 1}_desc`, 'textarea', c.desc, `Pépite ${i + 1} — description`)
    add(`pepite_${i + 1}_verdict`, 'textarea', c.verdict, `Pépite ${i + 1} — verdict`)
  })
  data.accoms.forEach((c, i) => {
    add(`accom_${i + 1}_emoji`, 'text', c.emoji, `Hébergement ${i + 1} — emoji`)
    add(`accom_${i + 1}_title`, 'text', c.title, `Hébergement ${i + 1} — titre`)
    add(`accom_${i + 1}_desc`, 'textarea', c.desc, `Hébergement ${i + 1} — description`)
    add(`accom_${i + 1}_tip`, 'textarea', c.tip, `Hébergement ${i + 1} — conseil`)
  })
  data.transports.forEach((c, i) => {
    add(`transport_${i + 1}_emoji`, 'text', c.emoji, `Transport ${i + 1} — emoji`)
    add(`transport_${i + 1}_title`, 'text', c.title, `Transport ${i + 1} — titre`)
    add(`transport_${i + 1}_desc`, 'html', c.desc, `Transport ${i + 1} — description`)
    if (c.tip) add(`transport_${i + 1}_tip`, 'textarea', c.tip, `Transport ${i + 1} — conseil`)
  })
  add('cta_title', 'text', data.cta.title, 'Titre du CTA')
  add('cta_text', 'textarea', data.cta.text, 'Texte du CTA')
  data.faq.forEach((f, i) => {
    add(`faq_${i + 1}_q`, 'text', f.q, `FAQ ${i + 1} — question`)
    add(`faq_${i + 1}_a`, 'textarea', f.a, `FAQ ${i + 1} — réponse`)
  })
  data.articles.forEach((c, i) => {
    add(`article_${i + 1}_label`, 'text', c.label, `Article lié ${i + 1} — catégorie`)
    add(`article_${i + 1}_title`, 'text', c.title, `Article lié ${i + 1} — titre`)
    add(`article_${i + 1}_alt`, 'text', c.alt, `Article lié ${i + 1} — alt image`)
  })
}

function buildSql(rows) {
  const lines = [
    '-- ============================================================================',
    '-- Page Alentejo : contenu piloté par le CMS',
    '-- Date: 2026-08-01 — généré par scripts/generate-alentejo-cms.mjs',
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
  ]
  return lines.join('\n')
}

// ═══════════════════════════ Template ═══════════════════════════

function buildPage(data, meta, touristSchema) {
  const faqsConst = data.faq.map((f) => `  { q: ${q(f.q)}, a: ${q(f.a)} },`).join('\n')

  const quickJsx = data.quick
    .map(
      (c, i) => `              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('quick_${i + 1}_label', 'text', ${q(c.label)}, undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-stone-900">
                  {Z('quick_${i + 1}_value', 'html', ${q(c.value)}, undefined, 'span')}
                </p>
              </div>`
    )
    .join('\n')

  const pepitesJsx = data.pepites
    .map(
      (c, i) => `              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-eucalyptus/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{Z('pepite_${i + 1}_emoji', 'text', ${q(c.emoji)}, undefined, 'span')}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">
                      {Z('pepite_${i + 1}_title', 'text', ${q(c.title)}, undefined, 'span')}
                    </h3>
                    <p className="text-sm text-eucalyptus/80 font-medium">
                      {Z('pepite_${i + 1}_subtitle', 'text', ${q(c.subtitle)}, undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {Z('pepite_${i + 1}_desc', 'textarea', ${q(c.desc)}, undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 italic">
                  {Z('pepite_${i + 1}_verdict', 'textarea', ${q(c.verdict)}, undefined, 'span')}
                </p>
              </div>`
    )
    .join('\n')

  const accomJsx = data.accoms
    .map(
      (c, i) => `              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">{Z('accom_${i + 1}_emoji', 'text', ${q(c.emoji)}, undefined, 'span')}</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-2">
                  {Z('accom_${i + 1}_title', 'text', ${q(c.title)}, undefined, 'span')}
                </h3>
                <p className="text-sm text-stone-600 mb-4">
                  {Z('accom_${i + 1}_desc', 'textarea', ${q(c.desc)}, undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500">
                  {Z('accom_${i + 1}_tip', 'textarea', ${q(c.tip)}, undefined, 'span')}
                </p>
              </div>`
    )
    .join('\n')

  const transportsJsx = data.transports
    .map(
      (c, i) => `              <div className="flex gap-4 p-6 bg-stone-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center shrink-0">
                  <span className="text-xl">{Z('transport_${i + 1}_emoji', 'text', ${q(c.emoji)}, undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    {Z('transport_${i + 1}_title', 'text', ${q(c.title)}, undefined, 'span')}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {Z('transport_${i + 1}_desc', 'html', ${q(c.desc)}, undefined, 'span')}
                  </p>
                  ${c.tip ? `<p className="text-xs text-stone-500 mt-2">
                    {Z('transport_${i + 1}_tip', 'textarea', ${q(c.tip)}, undefined, 'span')}
                  </p>` : ''}
                </div>
              </div>`
    )
    .join('\n')

  const faqJsx = data.faq
    .map(
      (f, i) => `                <details key={${i}} className="bg-white rounded-xl p-5 border border-stone-100 group">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex justify-between items-center">
                    <span>{Z('faq_${i + 1}_q', 'text', ${q(f.q)}, undefined, 'span')}</span>
                    <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                    {Z('faq_${i + 1}_a', 'textarea', ${q(f.a)}, undefined, 'span')}
                  </p>
                </details>`
    )
    .join('\n')

  const articlesJsx = data.articles
    .map(
      (c, i) => `              <Link href="/blog" className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-stone-200">
                  <Image
                    src="/og-default.jpg"
                    alt={Z('article_${i + 1}_alt', 'text', ${q(c.alt)}, undefined, 'span') as any}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-eucalyptus font-semibold mb-1">
                    {Z('article_${i + 1}_label', 'text', ${q(c.label)}, undefined, 'span')}
                  </p>
                  <h3 className="font-serif text-stone-900 group-hover:text-eucalyptus transition-colors">
                    {Z('article_${i + 1}_title', 'text', ${q(c.title)}, undefined, 'span')}
                  </h3>
                </div>
              </Link>`
    )
    .join('\n')

  const jsonLdTourist = touristSchema
    ? `      <Script
        id="tourist-destination-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ${JSON.stringify(JSON.stringify(touristSchema))} }}
      />\n`
    : ''

  return `import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const PAGE = ${q(PAGE)};
const FAQS: { q: string; a: string }[] = [
${faqsConst}
];

export const metadata: Metadata = {
  title: ${q(meta.title)},
  description: ${q(meta.description)},
  alternates: {
    canonical: ${q(meta.canonicalPath)},
  },
  openGraph: {
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
  },
};

export default async function AlentejoPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
${jsonLdTourist}      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <Header />
      <Script id="ga4-destination-view" strategy="lazyOnload">{\`
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'destination_view', { destination: 'alentejo' });
        }
      \`}</Script>
      <main>
        {/* ── HERO ── */}
        <section className="relative min-h-[66vh] flex items-end overflow-hidden bg-stone-900">
          <Image
            src="/og-default.jpg"
            alt="Alentejo — vignobles dorés sous le soleil portugais"
            fill
            className="object-cover opacity-65"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

          <div className="absolute left-4 top-4 md:left-8 md:top-8">
            <span className="inline-block rounded-full bg-eucalyptus/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              {Z('hero_badge', 'text', ${q(data.hero.badge)}, undefined, 'span')}
            </span>
          </div>

          <div className="relative z-10 px-6 md:px-16 pb-12 md:pb-20 max-w-4xl">
            <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-3">
              {Z('hero_label', 'text', ${q(data.hero.label)}, undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-4 leading-tight">
              {Z('hero_title', 'text', ${q(data.hero.title)}, undefined, 'span')}
              <br />
              <span className="text-teal/80 italic">{Z('hero_subtitle', 'text', ${q(data.hero.subtitle)}, undefined, 'span')}</span>
            </h1>
            <p className="text-stone-300 text-base md:text-lg leading-relaxed max-w-2xl">
              {Z('hero_description', 'textarea', ${q(data.hero.description)}, undefined, 'span')}
            </p>
          </div>
        </section>

        {/* ── INTRODUCTION E-E-A-T ── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {Z('intro_label', 'text', ${q(data.intro.label)}, undefined, 'span')}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8">
              {Z('intro_title', 'text', ${q(data.intro.title)}, undefined, 'span')}
            </h2>
            <div className="prose prose-lg max-w-none prose-stone">
              ${data.intro.paragraphs
                .map(
                  (p, i) => `<p className="text-stone-700 leading-relaxed${i === 0 ? ' text-lg' : ''}">
                {Z('intro_${i + 1}', 'html', ${q(p)}, undefined, 'span')}
              </p>`
                )
                .join('\n              ')}
            </div>
          </div>
        </section>

        {/* ── INFOS PRATIQUES ── */}
        <section className="py-12 bg-stone-50 border-y border-stone-200">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-6 text-center">Bon à savoir</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
${quickJsx}
            </div>
          </div>
        </section>

        {/* ── NOS PÉPITES ── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Ce qu'on a vécu</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Nos pépites dénichées
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
${pepitesJsx}
            </div>
          </div>
        </section>

        {/* ── OÙ DORMIR ── */}
        <section className="py-16 md:py-24 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Hébergement</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-4 text-center">
              Où dormir selon ton style
            </h2>
            <p className="text-stone-600 text-center mb-12 max-w-xl mx-auto">
              L'Alentejo offre des options pour tous les budgets. Nous, on a testé ces trois-là.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
${accomJsx}
            </div>
          </div>
        </section>

        {/* ── COMMENT SE DÉPLACER ── */}
        <section className="py-16 md:py-24 bg-white border-t border-stone-100">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Logistique</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8 text-center">
              Comment se déplacer
            </h2>
            <div className="space-y-6">
${transportsJsx}
            </div>
          </div>
        </section>

        {/* ── CTA TRAVEL PLANNING ── */}
        <section className="py-16 md:py-24" style={{ backgroundColor: '#01696f' }}>
          <div className="max-w-3xl mx-auto px-6 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">
              {Z('cta_title', 'text', ${q(data.cta.title)}, undefined, 'span')}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              {Z('cta_text', 'textarea', ${q(data.cta.text)}, undefined, 'span')}
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-teal transition-all hover:bg-white/90"
            >
              Dis-nous ton projet →
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-24 bg-stone-50">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-8 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
${faqJsx}
            </div>
          </div>
        </section>

        {/* ── RELATED ARTICLES ── */}
        <section className="py-16 md:py-24 bg-white border-t border-stone-100">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Pour aller plus loin</p>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-8 text-center">
              Nos carnets liés
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
${articlesJsx}
            </div>
            <div className="mt-8 text-center">
              <Link href="/blog" className="text-eucalyptus font-semibold hover:text-eucalyptus/80">
                Voir tous nos carnets →
              </Link>
            </div>
          </div>
        </section>

        <SlowTravelQuiz />
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
`
}

// ═══════════════════════════ Exécution ═══════════════════════════

const content = readOriginal(FILE)
const schemas = getSchemas(content)
const faqSchema = schemas.find((s) => s['@type'] === 'FAQPage')
const touristSchema = schemas.find((s) => s['@type'] === 'TouristDestination')

const data = {
  hero: getHero(content),
  intro: { label: '', title: '', paragraphs: [], ...getIntro(content) },
  quick: getQuickFacts(content),
  pepites: getPepites(content),
  accoms: getAccommodations(content),
  transports: getTransports(content),
  cta: getCta(content),
  faq: (faqSchema?.mainEntity || []).map((e) => ({
    q: e.name || '',
    a: (e.acceptedAnswer && e.acceptedAnswer.text) || '',
  })),
  articles: getArticles(content),
}

const meta = getMetadata(content)
const page = buildPage(data, meta, touristSchema)
const rows = []
buildZones(rows, data)
writeFileSync(join(ROOT, FILE), page, 'utf8')

console.log(`✔ ${PAGE}: ${rows.length} zones — page réécrite`)
console.log(`  hero: ${data.hero.title} + ${data.hero.subtitle} | intro: ${data.intro.paragraphs.length} | quick: ${data.quick.length} | pepites: ${data.pepites.length} | accoms: ${data.accoms.length} | transports: ${data.transports.length} | faq: ${data.faq.length} | articles: ${data.articles.length} | cta: ${data.cta.title ? 'oui' : 'non'} | jsonLd: ${schemas.length}`)
console.log(`  meta.title: ${meta.title} | ogTitle: ${meta.ogTitle} | ogDesc: ${meta.ogDescription ? 'oui' : 'vide'}`)

const sqlPath = join(ROOT, 'supabase/migrations/20260803_cms_alentejo_zones.sql')
writeFileSync(sqlPath, buildSql(rows), 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '\\', '')}`)
