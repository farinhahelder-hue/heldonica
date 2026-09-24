// Migration des pages pleines (FAQ) vers le CMS 3.0 — sardaigne, idf, kotor.
// Pattern établi : getPageZones() serveur + InlineEditProvider + EditableZone
// avec les valeurs actuelles en fallback (aucun changement visible attendu).
//
// Usage : node scripts/generate-faq-pages-cms.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const sqlEscape = (v) => v.replace(/'/g, "''")
const normalizeNewlines = (s) => s.replace(/\s*\n\s*/g, ' ')
const q = (s) => JSON.stringify(s)

/** Décode les entités HTML courantes pour des valeurs CMS propres. */
const decodeEntities = (s) =>
  s
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")

/** Contenu original du fichier (HEAD) pour une extraction fidèle et répétable. */
function readOriginal(relPath) {
  try {
    return execSync(`git show HEAD:${relPath}`, { cwd: ROOT, encoding: 'utf8' })
  } catch {
    return readFileSync(join(ROOT, relPath), 'utf8')
  }
}

// ─── Utilitaires d'extraction ───────────────────────────────────────────────

/** Extrait les paires question/réponse d'un objet FAQ schema (clés quotées ou non). */
function extractFaq(content) {
  const m = content.match(/["']?mainEntity["']?\s*:\s*\[([\s\S]*?)\r?\n\s*\]/)
  if (!m) return []
  const faqs = []
  const re = /["']?name["']?\s*:\s*(["'])((?:[^\\]|\\.)*?)\1[\s\S]*?["']?text["']?\s*:\s*(["'])((?:[^\\]|\\.)*?)\3/g
  let mm
  while ((mm = re.exec(m[1])) !== null) {
    faqs.push({
      q: mm[2].replace(/\\'/g, "'"),
      a: mm[4].replace(/\\'/g, "'"),
    })
  }
  return faqs
}

/** Extrait les valeurs d'une const tableau d'objets : const x = [ { k: 'v' }, ... ] */
function extractConstArray(content, varName, keys) {
  const m = content.match(new RegExp(`const ${varName} = \\[([\\s\\S]*?)\\r?\\n\\]`))
  if (!m) return []
  const items = []
  const objRe = /\{([^{}]*)\}/g
  let mm
  while ((mm = objRe.exec(m[1])) !== null) {
    const obj = {}
    for (const k of keys) {
      const kv = mm[1].match(new RegExp(`${k}:\\s*(["'])((?:[^\\\\]|\\\\.)*?)\\1`))
      if (kv) obj[k] = kv[2].replace(/\\'/g, "'")
    }
    if (Object.keys(obj).length) items.push(obj)
  }
  return items
}

/** Extrait le contenu d'une const objet jusqu'au `}` de fin de ligne. */
function getConstBlock(content, varName) {
  const m = content.match(new RegExp(`const ${varName} = \\{([\\s\\S]*?)\\r?\\n\\}`))
  return m ? m[1] : ''
}

// ─── Zones SQL ──────────────────────────────────────────────────────────────

function addZone(rows, page, key, type, value, label) {
  rows.push([`'${page}'`, `'${key}'`, `'${type}'`, `'${sqlEscape(value)}'`, `'${sqlEscape(label)}'`])
}

function buildSql(pages) {
  const lines = [
    '-- ============================================================================',
    '-- Pages pleines (FAQ) : contenu piloté par le CMS (cms_editable_zones)',
    '-- Date: 2026-08-01 — généré par scripts/generate-faq-pages-cms.mjs',
    '-- ============================================================================',
    '-- Les pages idf / sardaigne / kotor passent du hardcodé à des zones',
    '-- éditables. Les valeurs sont EXACTEMENT le contenu affiché jusqu\'ici.',
    '--',
    '-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.',
    '',
  ]
  for (const [page, rows] of pages) {
    lines.push(`-- ─── ${page} ────────────────────────────────────────────────────────`)
    lines.push('INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)')
    lines.push('VALUES')
    lines.push(rows.map((r) => `  (${r.join(', ')})`).join(',\n'))
    lines.push(`ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();`)
    lines.push('')
  }
  return lines.join('\n')
}

function buildFaqsJs(faqs, prefix) {
  return faqs
    .map(
      (f, i) =>
        `  { q: { zone: ${q(`${prefix}_${i + 1}_q`)}, fb: ${q(f.q)} }, a: { zone: ${q(`${prefix}_${i + 1}_a`)}, fb: ${q(f.a)} } }`
    )
    .join(',\n')
}

// ════════════════════════════ PAGE SARDAIGNE ═══════════════════════════════

function buildSardaigne(rows, page, data) {
  addZone(rows, page, 'hero_image', 'image', '/og-default.jpg', 'Image du hero')
  addZone(rows, page, 'hero_title', 'text', data.title, 'Titre du hero')
  addZone(rows, page, 'hero_subtitle', 'text', data.subtitle, 'Sous-titre du hero')
  addZone(rows, page, 'hero_description', 'textarea', data.heroDescription, 'Description du hero')
  data.intro.forEach((p, i) => addZone(rows, page, `intro_${i + 1}`, 'textarea', p, `Introduction ${i + 1}`))
  data.zones.forEach((z, i) => {
    addZone(rows, page, `zone_${i + 1}_title`, 'text', z.title, `Zone ${i + 1} — titre`)
    addZone(rows, page, `zone_${i + 1}_desc`, 'textarea', z.desc, `Zone ${i + 1} — description`)
  })
  data.period.forEach((v, i) => addZone(rows, page, `period_${i + 1}`, 'textarea', v, `Meilleure période ${i + 1}`))
  data.budget.forEach((v, i) => addZone(rows, page, `budget_${i + 1}`, 'textarea', v, `Budget ${i + 1}`))
  data.faqs.forEach((f, i) => {
    addZone(rows, page, `faq_${i + 1}_q`, 'text', f.q, `FAQ ${i + 1} — question`)
    addZone(rows, page, `faq_${i + 1}_a`, 'textarea', f.a, `FAQ ${i + 1} — réponse`)
  })
}

function extractSardaigne(content) {
  const faqSchema = getConstBlock(content, 'faqSardaigneSchema')
  const intro = []
  const introRe = /<p className="text-lg text-stone-700 leading-relaxed(?: mb-4)?">\s*([\s\S]*?)\s*<\/p>/g
  let m
  while ((m = introRe.exec(content)) !== null) intro.push(normalizeNewlines(m[1]))
  const zones = extractJsxObjArray(content, ['href', 'title', 'desc'])
  const periodSection = content.match(/Meilleure période<\/h3>\s*<ul className="text-stone-600 text-sm space-y-2">([\s\S]*?)<\/ul>/)
  const budgetSection = content.match(/Budget indicatif \(duo\/semaine\)<\/h3>\s*<ul className="text-stone-600 text-sm space-y-2">([\s\S]*?)<\/ul>/)
  const heroDesc = content.match(/<p className="text-xl text-stone-300 max-w-2xl leading-relaxed">\s*([\s\S]*?)\s*<\/p>/)
  const heroSpan = content.match(/<span className="block text-teal italic text-3xl md:text-4xl mt-2">([\s\S]*?)<\/span>/)
  return {
    title: 'Sardaigne',
    subtitle: heroSpan ? heroSpan[1] : "l'île qui ne se livre pas d'un seul coup",
    heroDescription: heroDesc ? normalizeNewlines(heroDesc[1]) : 'Entre Méditerranée et mer Tyrrhénienne, la Sardaigne cache ses meilleures cartes à l\'intérieur des terres, loin des plages célèbres.',
    intro,
    zones,
    period: extractLiItems(periodSection ? periodSection[1] : ''),
    budget: extractLiItems(budgetSection ? budgetSection[1] : ''),
    faqs: extractFaq(faqSchema),
  }
}

/** Extrait un tableau d'objets inline `{[ {...}, {...} ].map(` (JSX). */
function extractJsxObjArray(content, keys) {
  const m = content.match(/\{\[\s*([\s\S]*?)\n\s*\]\s*\.map/)
  if (!m) return []
  const items = []
  const objRe = /\{([^{}]*)\}/g
  let mm
  while ((mm = objRe.exec(m[1])) !== null) {
    const obj = {}
    for (const k of keys) {
      const kv = mm[1].match(new RegExp(`${k}:\\s*(["'])((?:[^\\\\]|\\\\.)*?)\\1`))
      if (kv) obj[k] = kv[2].replace(/\\'/g, "'")
    }
    if (Object.keys(obj).length) items.push(obj)
  }
  return items
}

/** Extrait la liste des <li> d'un bloc (HTML inline). */
function extractLiItems(html) {
  const re = /<li[^>]*>([\s\S]*?)<\/li>/g
  const items = []
  let m
  while ((m = re.exec(html)) !== null) items.push(m[1].trim())
  return items
}

function buildSardaignePage(data) {
  const introJsx = data.intro
    .map(
      (p, i) => `            <p className="text-lg text-stone-700 leading-relaxed${i === 0 ? ' mb-4' : ''}">
              {Z('intro_${i + 1}', 'textarea', ${q(p)}, undefined, 'span')}
            </p>`
    )
    .join('\n')

  const cardsJsx = data.zones
    .map(
      (z, i) => `                <Link key={${q(z.href)}} href={${q(z.href)}}
                  className="block p-6 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                  <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">{Z('zone_${i + 1}_title', 'text', ${q(z.title)}, undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('zone_${i + 1}_desc', 'textarea', ${q(z.desc)}, undefined, 'span')}</p>
                  <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">Voir le guide →</span>
                </Link>`
    )
    .join('\n')

  const periodJsx = data.period
    .map((v, i) => `                <li>{Z('period_${i + 1}', 'textarea', ${q(v)}, undefined, 'span')}</li>`)
    .join('\n')
  const budgetJsx = data.budget
    .map((v, i) => `                <li>{Z('budget_${i + 1}', 'textarea', ${q(v)}, undefined, 'span')}</li>`)
    .join('\n')

  const faqsJs = buildFaqsJs(data.faqs, 'faq')

  return `import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const PAGE = 'destinations-sardaigne'

export const metadata: Metadata = {
  title: 'Sardaigne slow travel | Guide Heldonica',
  description: "Guide slow travel Sardaigne : plages sauvages, villages de l'intérieur, agritourisme et adresses dénichées loin des foules. Testé par Heldonica.",
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne',
  },
  openGraph: {
    title: 'Sardaigne slow travel | Guide Heldonica',
    description: "Plages sauvages, villages de l'intérieur et adresses dénichées loin des foules. Notre guide slow travel Sardaigne testé sur le terrain.",
    url: 'https://www.heldonica.fr/destinations/sardaigne',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Sardaigne — plages et villages slow travel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sardaigne slow travel | Guide Heldonica',
    description: "Plages sauvages, villages de l'intérieur et adresses dénichées loin des foules.",
    images: ['/og-default.jpg'],
    creator: '@heldonica',
  },
}

const subNav = [
  { label: 'Cagliari', href: '/destinations/sardaigne/cagliari' },
  { label: 'Costa Smeralda', href: '/destinations/sardaigne/costa-smeralda' },
  { label: 'Alghero', href: '/destinations/sardaigne/alghero' },
  { label: 'Nuoro', href: '/destinations/sardaigne/nuoro' },
  { label: 'Asinara', href: '/destinations/sardaigne/asinara' },
]

// Valeurs de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const FAQS: { q: { zone: string; fb: string }; a: { zone: string; fb: string } }[] = [
${faqsJs}
]

export default async function SardaignePage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: zones[\`\${PAGE}__\${f.q.zone}\`] ?? f.q.fb,
      acceptedAnswer: { '@type': 'Answer', text: zones[\`\${PAGE}__\${f.a.zone}\`] ?? f.a.fb },
    })),
  }

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-stone-900 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover opacity-30')}
          </div>
          <div className="relative max-w-4xl mx-auto px-6">
            <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Destination testée
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', ${q(data.title)}, undefined, 'span')}
              <span className="block text-teal italic text-3xl md:text-4xl mt-2">{Z('hero_subtitle', 'text', ${q(data.subtitle)}, undefined, 'span')}</span>
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', ${q(data.heroDescription)}, undefined, 'span')}
            </p>
          </div>
        </section>

        <nav aria-label="Villes et zones de Sardaigne" className="bg-white border-b border-stone-200 sticky top-16 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12">
${introJsx}
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Nos zones favorites</h2>
            <div className="grid gap-6 md:grid-cols-2">
${cardsJsx}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-stone-900 font-medium mb-4">Meilleure période</h3>
              <ul className="text-stone-600 text-sm space-y-2">
${periodJsx}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-stone-900 font-medium mb-4">Budget indicatif (duo/semaine)</h3>
              <ul className="text-stone-600 text-sm space-y-2">
${budgetJsx}
              </ul>
            </div>
          </section>

          <div className="pt-4 border-t border-stone-200">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              ← Toutes les destinations
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
`
}

// ══════════════════════════════ PAGE ÎLE-DE-FRANCE ═════════════════════════

function buildIdf(rows, page, data) {
  addZone(rows, page, 'hero_image', 'image', '/og-default.jpg', 'Image du hero')
  addZone(rows, page, 'hero_badge', 'text', data.badge, 'Badge du hero')
  addZone(rows, page, 'hero_title', 'text', data.title, 'Titre du hero')
  addZone(rows, page, 'hero_description', 'textarea', data.heroDescription, 'Description du hero')
  addZone(rows, page, 'intro_title', 'text', data.introTitle, 'Titre de l\'introduction')
  data.intro.forEach((p, i) => addZone(rows, page, `intro_${i + 1}`, 'textarea', p, `Introduction ${i + 1}`))
  data.pepites.forEach((p, i) => {
    addZone(rows, page, `pepite_${i + 1}_titre`, 'text', p.titre, `Pépite ${i + 1} — titre`)
    addZone(rows, page, `pepite_${i + 1}_desc`, 'textarea', p.description, `Pépite ${i + 1} — description`)
    addZone(rows, page, `pepite_${i + 1}_tag`, 'text', p.tag, `Pépite ${i + 1} — tag`)
  })
  data.zones.forEach((z, i) => {
    addZone(rows, page, `zone_${i + 1}_label`, 'text', z.label, `Zone ${i + 1} — label`)
    addZone(rows, page, `zone_${i + 1}_desc`, 'textarea', z.desc, `Zone ${i + 1} — description`)
  })
  data.when.forEach((v, i) => addZone(rows, page, `when_${i + 1}`, 'html', v, `Quand y aller ${i + 1}`))
  data.transport.forEach((v, i) => addZone(rows, page, `transport_${i + 1}`, 'html', v, `Transport & budget ${i + 1}`))
  data.faqs.forEach((f, i) => {
    addZone(rows, page, `faq_${i + 1}_q`, 'text', f.q, `FAQ ${i + 1} — question`)
    addZone(rows, page, `faq_${i + 1}_a`, 'textarea', f.a, `FAQ ${i + 1} — réponse`)
  })
}

function extractIdf(content) {
  const faqSchema = getConstBlock(content, 'faqIdfSchema')
  const pepites = extractConstArray(content, 'pepites', ['titre', 'description', 'tag', 'href'])
  const zones = extractConstArray(content, 'zones', ['label', 'href', 'desc'])
  const heroDesc = content.match(/<p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">\s*([\s\S]*?)\s*<\/p>/)
  const introTitle = content.match(/<h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">\s*([\s\S]*?)\s*<\/h2>/)
  const introBlock = content.match(/<div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4">\s*([\s\S]*?)\s*<\/div>/)
  const intro = []
  if (introBlock) {
    const pRe = /<p>\s*([\s\S]*?)\s*<\/p>/g
    let m
    while ((m = pRe.exec(introBlock[1])) !== null) intro.push(normalizeNewlines(m[1]))
  }
  const whenBlock = content.match(/Quand y aller<\/h3>[\s\S]*?<ul className="space-y-3 text-stone-600 text-sm">([\s\S]*?)<\/ul>/)
  const transportBlock = content.match(/Transport & Budget<\/h3>[\s\S]*?<ul className="space-y-3 text-stone-600 text-sm">([\s\S]*?)<\/ul>/)
  const htmlLiRe = /<li className="flex items-start gap-2">[\s\S]*?<span>([\s\S]*?)<\/span>\s*<\/li>/g
  const extractHtmlLis = (block) => {
    if (!block) return []
    const items = []
    let m
    while ((m = htmlLiRe.exec(block)) !== null) items.push(normalizeNewlines(m[1]))
    return items
  }
  return {
    title: 'Île-de-France',
    badge: 'Destinations France',
    heroDescription: heroDesc ? normalizeNewlines(heroDesc[1]) : '',
    introTitle: introTitle ? normalizeNewlines(introTitle[1]) : '',
    intro,
    pepites,
    zones,
    when: extractHtmlLis(whenBlock ? whenBlock[1] : ''),
    transport: extractHtmlLis(transportBlock ? transportBlock[1] : ''),
    faqs: extractFaq(faqSchema),
  }
}

function buildIdfPage(data) {
  const pepitesJsx = data.pepites
    .map(
      (p, i) => `                <Link
                  key={${q(p.href || p.titre)}}
                  href={${q(p.href || '/destinations/idf/paris')}}
                  className="group block p-6 bg-white rounded-2xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all"
                >
                  <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">{Z('pepite_${i + 1}_tag', 'text', ${q(p.tag)}, undefined, 'span')}</span>
                  <h3 className="font-serif text-base text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">{Z('pepite_${i + 1}_titre', 'text', ${q(p.titre)}, undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('pepite_${i + 1}_desc', 'textarea', ${q(p.description)}, undefined, 'span')}</p>
                </Link>`
    )
    .join('\n')

  const zonesJsx = data.zones
    .map(
      (z, i) => `                <Link
                  key={${q(z.href || '')}}
                  href={${q(z.href || '/destinations/idf/paris')}}
                  className="group flex items-start gap-4 p-5 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center flex-shrink-0 group-hover:bg-eucalyptus/20 transition-colors">
                    <span className="text-eucalyptus font-serif font-bold text-sm">{String.fromCharCode((zones[\`\${PAGE}__zone_${i + 1}_label\`] ?? ${q(z.label)}).charCodeAt(0))}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-eucalyptus transition-colors">{Z('zone_${i + 1}_label', 'text', ${q(z.label)}, undefined, 'span')}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{Z('zone_${i + 1}_desc', 'textarea', ${q(z.desc)}, undefined, 'span')}</p>
                  </div>
                </Link>`
    )
    .join('\n')

  const whenJsx = data.when
    .map(
      (v, i) => `                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                    <span>{Z('when_${i + 1}', 'html', ${q(v)}, undefined, 'span')}</span>
                  </li>`
    )
    .join('\n')
  const transportJsx = data.transport
    .map(
      (v, i) => `                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">→</span>
                    <span>{Z('transport_${i + 1}', 'html', ${q(v)}, undefined, 'span')}</span>
                  </li>`
    )
    .join('\n')

  const faqsJs = buildFaqsJs(data.faqs, 'faq')

  return `import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const PAGE = 'destinations-idf'

export const metadata: Metadata = {
  title: 'Île-de-France slow travel | Guide Heldonica',
  description: 'Paris autrement, Versailles hors saison, Giverny au petit matin. Notre guide Île-de-France pour voyager lentement dans la région la plus visitée du monde.',
  alternates: { canonical: 'https://www.heldonica.fr/destinations/idf' },
  openGraph: {
    title: 'Île-de-France slow travel | Guide Heldonica',
    description: 'Paris autrement, Versailles hors saison, Giverny au petit matin. Slow travel en Île-de-France.',
    url: 'https://www.heldonica.fr/destinations/idf',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Paris slow travel — Île-de-France' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', creator: '@heldonica', title: 'Île-de-France slow travel | Guide Heldonica', description: 'Paris autrement, Versailles hors saison, Giverny au petit matin.' },
}

const subNav = [
  { label: 'Paris', href: '/destinations/idf/paris' },
  { label: 'Versailles', href: '/destinations/idf/versailles' },
  { label: 'Giverny', href: '/destinations/idf/giverny' },
  { label: 'Fontainebleau', href: '/destinations/idf/fontainebleau' },
]

// Valeurs de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const FAQS: { q: { zone: string; fb: string }; a: { zone: string; fb: string } }[] = [
${faqsJs}
]

export default async function IdfPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: zones[\`\${PAGE}__\${f.q.zone}\`] ?? f.q.fb,
      acceptedAnswer: { '@type': 'Answer', text: zones[\`\${PAGE}__\${f.a.zone}\`] ?? f.a.fb },
    })),
  }

  const touristSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: zones[\`\${PAGE}__hero_title\`] ?? ${q(data.title)},
    description: zones[\`\${PAGE}__hero_description\`] ?? ${q(data.heroDescription)},
    url: 'https://www.heldonica.fr/destinations/idf',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
      addressRegion: 'Île-de-France',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 48.8566, longitude: 2.3522 },
    touristType: ['Slow traveler', 'City explorer', 'Nature lover'],
  }

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristSchema) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-24 md:py-32">
          <div className="absolute inset-0 opacity-20">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-xs font-semibold uppercase tracking-widest mb-4">{Z('hero_badge', 'text', ${q(data.badge)}, undefined, 'span')}</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              {Z('hero_title', 'text', ${q(data.title)}, undefined, 'span')}
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', ${q(data.heroDescription)}, undefined, 'span')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations/idf/paris"
                className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
              >
                Explorer Paris →
              </Link>
              <Link
                href="/destinations/idf/fontainebleau"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
              >
                Fontainebleau →
              </Link>
            </div>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40" aria-label="Sous-destinations Île-de-France">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors pb-0.5 border-b-2 border-transparent hover:border-eucalyptus/50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Notre angle</p>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">
              {Z('intro_title', 'text', ${q(data.introTitle)}, undefined, 'span')}
            </h2>
            <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4">
${data.intro.map((p, i) => `              <p>
                {Z('intro_${i + 1}', 'textarea', ${q(p)}, undefined, 'span')}
              </p>`).join('\n')}
            </div>
          </section>

          {/* Pépites */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Ce qu'on a vraiment aimé</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Nos pépites en Île-de-France</h2>
            <div className="grid gap-5 md:grid-cols-2">
${pepitesJsx}
            </div>
          </section>

          {/* Zones */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Par secteur</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Explorer par zone</h2>
            <div className="grid gap-4 sm:grid-cols-2">
${zonesJsx}
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Côté pratique</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Ce qu'il faut savoir</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Quand y aller</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
${whenJsx}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Transport & Budget</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
${transportJsx}
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Questions fréquentes</p>
            <div className="space-y-4">
              {FAQS.map((f) => (
                <details key={f.q.fb} className="group bg-white rounded-xl border border-stone-200 p-5">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                    {zones[\`\${PAGE}__\${f.q.zone}\`] ?? f.q.fb}
                    <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">{zones[\`\${PAGE}__\${f.a.zone}\`] ?? f.a.fb}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Back link */}
          <Link href="/destinations" className="text-eucalyptus hover:text-eucalyptus/80 text-sm font-medium transition-colors">
            ← Toutes les destinations
          </Link>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
`
}

// ══════════════════════════════ PAGE KOTOR ═════════════════════════════════

function buildKotor(rows, page, data) {
  addZone(rows, page, 'hero_image', 'image', '/og-default.jpg', 'Image du hero')
  addZone(rows, page, 'hero_badge', 'text', data.badge, 'Badge du hero')
  addZone(rows, page, 'hero_title', 'text', data.title, 'Titre du hero')
  addZone(rows, page, 'hero_description', 'textarea', data.heroDescription, 'Description du hero')
  addZone(rows, page, 'intro_title', 'text', data.introTitle, 'Titre de l\'introduction')
  data.intro.forEach((p, i) => addZone(rows, page, `intro_${i + 1}`, 'html', p, `Introduction ${i + 1}`))
  data.why.forEach((w, i) => {
    addZone(rows, page, `why_${i + 1}_title`, 'text', w.title, `Pourquoi ${i + 1} — titre`)
    addZone(rows, page, `why_${i + 1}_desc`, 'textarea', w.desc, `Pourquoi ${i + 1} — description`)
  })
  data.day.forEach((d, i) => {
    addZone(rows, page, `day_${i + 1}_time`, 'text', d.time, `Journée type ${i + 1} — heure`)
    addZone(rows, page, `day_${i + 1}_title`, 'text', d.title, `Journée type ${i + 1} — titre`)
    addZone(rows, page, `day_${i + 1}_desc`, 'textarea', d.desc, `Journée type ${i + 1} — description`)
  })
  data.infos.forEach((info, i) => {
    addZone(rows, page, `info_${i + 1}_title`, 'text', info.title, `Info ${i + 1} — titre`)
    info.items.forEach((item, j) => addZone(rows, page, `info_${i + 1}_item_${j + 1}`, 'html', item, `Info ${i + 1} — item ${j + 1}`))
  })
  data.faqs.forEach((f, i) => {
    addZone(rows, page, `faq_${i + 1}_q`, 'text', f.q, `FAQ ${i + 1} — question`)
    addZone(rows, page, `faq_${i + 1}_a`, 'textarea', f.a, `FAQ ${i + 1} — réponse`)
  })
  addZone(rows, page, 'verdict_who', 'textarea', data.verdict.who, 'Verdict — pour qui')
  data.verdict.adore.forEach((v, i) => addZone(rows, page, `verdict_adore_${i + 1}`, 'textarea', v, `Verdict — on adore ${i + 1}`))
  addZone(rows, page, 'verdict_avoid', 'textarea', data.verdict.avoid, 'Verdict — ce qu\'on évite')
  addZone(rows, page, 'verdict_quote', 'textarea', data.verdict.quote, 'Verdict — citation')
}

function extractKotor(content) {
  const faqSchema = getConstBlock(content, 'faqKotorSchema')

  const heroBadge = content.match(/<span className="inline-block text-teal text-sm font-medium mb-4 tracking-wide">\s*([\s\S]*?)\s*<\/span>/)
  const heroTitle = content.match(/<h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">\s*([\s\S]*?)\s*<\/h1>/)
  const heroDesc = content.match(/<p className="text-xl text-stone-200 max-w-2xl leading-relaxed mb-8">\s*([\s\S]*?)\s*<\/p>/)

  const introTitle = content.match(/<h2 className="text-3xl font-serif text-mahogany mb-6">\s*La baie de Kotor au lever du soleil\s*<\/h2>/)
  const introBlock = content.match(/<section id="decouvrir" className="mb-16">\s*<h2 className="text-3xl font-serif text-mahogany mb-6">\s*La baie de Kotor au lever du soleil\s*<\/h2>\s*([\s\S]*?)\s*<\/section>/)
  const intro = []
  if (introBlock) {
    const pRe = /<p className="text-lg text-stone-700 leading-relaxed(?: mb-4)?">([\s\S]*?)<\/p>/g
    let m
    while ((m = pRe.exec(introBlock[1])) !== null) intro.push(normalizeNewlines(m[1]))
  }

  const whyBlock = content.match(/Pourquoi découvrir Kotor tôt le matin\s*<\/h2>([\s\S]*?)<\/section>/)
  const why = []
  if (whyBlock) {
    const cardRe = /<h3 className="font-serif text-lg text-mahogany mb-3">\s*([\s\S]*?)\s*<\/h3>\s*<p className="text-stone-600">\s*([\s\S]*?)\s*<\/p>/g
    let m
    while ((m = cardRe.exec(whyBlock[1])) !== null) why.push({ title: m[1], desc: normalizeNewlines(m[2]) })
  }

  const dayBlock = content.match(/Comment on organise une journée type à Kotor\s*<\/h2>([\s\S]*?)<\/section>/)
  const day = []
  if (dayBlock) {
    const itemRe = /<span className="text-eucalyptus font-bold">([^<]+)<\/span>[\s\S]*?<h3 className="font-semibold text-mahogany mb-2">\s*([\s\S]*?)\s*<\/h3>\s*<p className="text-stone-600">\s*([\s\S]*?)\s*<\/p>/g
    let m
    while ((m = itemRe.exec(dayBlock[1])) !== null) day.push({ time: m[1], title: m[2], desc: normalizeNewlines(m[3]) })
  }

  const infos = []
  const infoBlocks = content.match(/<h3 className="font-semibold text-mahogany mb-4">\s*([^<]+)\s*<\/h3>\s*<ul className="space-y-2 text-stone-600">([\s\S]*?)<\/ul>/g)
  for (const block of infoBlocks || []) {
    const t = block.match(/<h3 className="font-semibold text-mahogany mb-4">\s*([^<]+)\s*<\/h3>/)?.[1]
    const ul = block.match(/<ul className="space-y-2 text-stone-600">([\s\S]*?)<\/ul>/)?.[1]
    infos.push({ title: t, items: extractLiItems(ul || '') })
  }

  const verdictWho = content.match(/<h3 className="font-semibold text-teal mb-3">Pour qui<\/h3>\s*<p className="text-stone-200">\s*([\s\S]*?)\s*<\/p>/)
  const verdictAdoreBlock = content.match(/<h3 className="font-semibold text-teal mb-3">Ce qu'on adore<\/h3>\s*<ul className="text-stone-200 space-y-1">([\s\S]*?)<\/ul>/)
  const verdictAvoid = content.match(/<h3 className="font-semibold text-teal mb-3">Ce qu'on évite<\/h3>\s*<p className="text-stone-200">\s*([\s\S]*?)\s*<\/p>/)
  const verdictQuote = content.match(/<p className="text-xl italic border-t border-stone-600 pt-6">\s*([\s\S]*?)\s*<\/p>/)

  return {
    title: heroTitle ? heroTitle[1] : 'Kotor avant les croisiéristes',
    badge: heroBadge ? heroBadge[1] : 'Monténégro · Bouches de Kotor',
    heroDescription: heroDesc ? normalizeNewlines(heroDesc[1]) : '',
    introTitle: introTitle ? 'La baie de Kotor au lever du soleil' : '',
    intro,
    why,
    day,
    infos,
    faqs: extractFaq(faqSchema),
    verdict: {
      who: verdictWho ? normalizeNewlines(verdictWho[1]) : '',
      adore: verdictAdoreBlock ? extractLiItems(verdictAdoreBlock[1]).map(normalizeNewlines) : [],
      avoid: verdictAvoid ? normalizeNewlines(verdictAvoid[1]) : '',
      quote: verdictQuote ? normalizeNewlines(verdictQuote[1]) : '',
    },
  }
}

function buildKotorPage(data) {
  const introJsx = data.intro
    .map(
      (p, i) => `            <p className="text-lg text-stone-700 leading-relaxed${i === 0 ? ' mb-4' : ''}">
              {Z('intro_${i + 1}', 'html', ${q(p)}, undefined, 'p')}
            </p>`
    )
    .join('\n')

  const whyJsx = data.why
    .map(
      (w, i) => `              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">{Z('why_${i + 1}_title', 'text', ${q(w.title)}, undefined, 'span')}</h3>
                <p className="text-stone-600">{Z('why_${i + 1}_desc', 'textarea', ${q(w.desc)}, undefined, 'span')}</p>
              </div>`
    )
    .join('\n')

  const dayJsx = data.day
    .map(
      (d, i) => `              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">{Z('day_${i + 1}_time', 'text', ${q(d.time)}, undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">{Z('day_${i + 1}_title', 'text', ${q(d.title)}, undefined, 'span')}</h3>
                  <p className="text-stone-600">{Z('day_${i + 1}_desc', 'textarea', ${q(d.desc)}, undefined, 'span')}</p>
                </div>
              </div>`
    )
    .join('\n')

  const infosJsx = data.infos
    .map(
      (info, i) => `              <div>
                <h3 className="font-semibold text-mahogany mb-4">{Z('info_${i + 1}_title', 'text', ${q(info.title)}, undefined, 'span')}</h3>
                <ul className="space-y-2 text-stone-600">
${info.items.map((item, j) => `                  <li>{Z('info_${i + 1}_item_${j + 1}', 'html', ${q(item)}, undefined, 'span')}</li>`).join('\n')}
                </ul>
              </div>`
    )
    .join('\n')

  const adoreJsx = data.verdict.adore
    .map((v, i) => `                  <li>{Z('verdict_adore_${i + 1}', 'textarea', ${q(v)}, undefined, 'span')}</li>`)
    .join('\n')

  const faqsJs = buildFaqsJs(data.faqs, 'faq')

  return `import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const PAGE = 'destinations-montenegro-kotor'

export const metadata: Metadata = {
  title: 'Kotor avant les croisiéristes — guide slow travel | Heldonica',
  description: 'Notre guide pour découvrir Kotor à son meilleur : lever du soleil sur la baie, remparts vides et vieille ville avant 9h. Conseils terrain pour un slow travel réussi.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/montenegro/kotor',
  },
  openGraph: {
    title: 'Kotor avant les croisiéristes | Heldonica',
    description: 'Le secret de Kotor : partir à 7h. Notre guide slow travel pour une ville vide.',
    url: 'https://www.heldonica.fr/destinations/montenegro/kotor',
    siteName: 'Heldonica',
    locale: 'fr_FR',
    type: 'article',
  },
}

const navLinks = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Monténégro', href: '/destinations/montenegro' },
]

// Valeurs de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const FAQS: { q: { zone: string; fb: string }; a: { zone: string; fb: string } }[] = [
${faqsJs}
]

export default async function KotorPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: zones[\`\${PAGE}__\${f.q.zone}\`] ?? f.q.fb,
      acceptedAnswer: { '@type': 'Answer', text: zones[\`\${PAGE}__\${f.a.zone}\`] ?? f.a.fb },
    })),
  }

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Script id="kotor-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-20 md:py-28">
          <div className="absolute inset-0 opacity-30">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 tracking-wide">
              {Z('hero_badge', 'text', ${q(data.badge)}, undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', ${q(data.title)}, undefined, 'span')}
            </h1>
            <p className="text-xl text-stone-200 max-w-2xl leading-relaxed mb-8">
              {Z('hero_description', 'textarea', ${q(data.heroDescription)}, undefined, 'span')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#decouvrir" className="inline-flex items-center gap-2 bg-eucalyptus text-white px-6 py-3 rounded-full font-semibold hover:bg-eucalyptus/90 transition-colors">
                Découvrir notre approche
              </a>
              <Link href="/destinations/montenegro" className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors">
                Retour au Monténégro
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3 text-sm items-center">
            {navLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-3">
                {i > 0 && <span className="text-stone-300">/</span>}
                <Link href={link.href} className="text-stone-500 hover:text-eucalyptus transition-colors">
                  {link.label}
                </Link>
              </span>
            ))}
            <span className="flex items-center gap-3">
              <span className="text-stone-300">/</span>
              <span className="text-mahogany font-medium">Kotor</span>
            </span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">

          {/* Intro terrain */}
          <section id="decouvrir" className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              {Z('intro_title', 'text', ${q(data.introTitle)}, undefined, 'span')}
            </h2>
${introJsx}
          </section>

          {/* Pourquoi se lever tôt */}
          <section className="mb-16 bg-gradient-to-b from-white to-stone-50 -mx-4 px-4 py-12 rounded-2xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              Pourquoi découvrir Kotor tôt le matin
            </h2>
            <p className="text-lg text-stone-700 leading-relaxed mb-8">
              Kotor subit le syndrome des destinations méditerranéennes :
              magnifiques hors saison, invivables en juillet-août.
              Mais même hors saison, les croisiéristes débarquent chaque matin.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
${whyJsx}
            </div>
          </section>

          {/* Notre façon de vivre */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              Comment on organise une journée type à Kotor
            </h2>
            <div className="space-y-8">
${dayJsx}
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16 bg-white rounded-2xl p-8 border border-stone-200">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              Infos pratiques pour Kotor
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
${infosJsx}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              Questions fréquentes sur Kotor
            </h2>
            <div className="space-y-4">
              {FAQS.map((f) => (
                <details key={f.q.fb} className="bg-white rounded-xl border border-stone-200 p-6 group">
                  <summary className="font-semibold text-mahogany cursor-pointer list-none flex justify-between items-center">
                    {zones[\`\${PAGE}__\${f.q.zone}\`] ?? f.q.fb}
                    <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="text-stone-600 mt-4 pt-4 border-t border-stone-100">
                    {zones[\`\${PAGE}__\${f.a.zone}\`] ?? f.a.fb}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Verdict */}
          <section className="mb-16 bg-mahogany text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-serif mb-6">
              Notre verdict sur Kotor
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-teal mb-3">Pour qui</h3>
                <p className="text-stone-200">
                  {Z('verdict_who', 'textarea', ${q(data.verdict.who)}, undefined, 'span')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-teal mb-3">Ce qu'on adore</h3>
                <ul className="text-stone-200 space-y-1">
${adoreJsx}
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-teal mb-3">Ce qu'on évite</h3>
                <p className="text-stone-200">
                  {Z('verdict_avoid', 'textarea', ${q(data.verdict.avoid)}, undefined, 'span')}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xl italic border-t border-stone-600 pt-6">
                  {Z('verdict_quote', 'textarea', ${q(data.verdict.quote)}, undefined, 'span')}
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-16 text-center">
            <div className="inline-block bg-gradient-to-r from-eucalyptus/10 to-teal/10 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-serif text-mahogany mb-4">
                Envie d'explorer le Monténégro sur mesure ?
              </h2>
              <p className="text-stone-600 mb-6 max-w-lg mx-auto">
                On peut concevoir ton itinéraire Monténégro avec nos adresses testées terrain —
                de Kotor à Durmitor, sans compromis.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/travel-planning" className="inline-flex items-center gap-2 bg-eucalyptus text-white px-8 py-4 rounded-full font-semibold hover:bg-eucalyptus/90 transition-colors">
                  Découvrir Travel Planning →
                </Link>
                <Link href="/destinations/montenegro" className="inline-flex items-center gap-2 bg-white text-mahogany px-8 py-4 rounded-full font-semibold hover:bg-stone-100 transition-colors border border-stone-200">
                  Retour au Monténégro
                </Link>
              </div>
            </div>
          </section>

          {/* Liens vers autres destinations */}
          <section className="border-t border-stone-200 pt-12">
            <h3 className="text-sm uppercase tracking-wider text-stone-500 mb-6">Autres destinations Heldonica</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/destinations/madere" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🇵🇹</span>
                <span className="text-mahogany font-medium">Madère</span>
              </Link>
              <Link href="/destinations/roumanie" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🇷🇴</span>
                <span className="text-mahogany font-medium">Roumanie</span>
              </Link>
              <Link href="/destinations" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🗺️</span>
                <span className="text-mahogany font-medium">Toutes</span>
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
`
}

// ══════════════════════════════ PAGE TIMIȘOARA ═════════════════════════════

function buildTimisoara(rows, page, data) {
  addZone(rows, page, 'hero_image', 'image', '/og-default.jpg', 'Image du hero')
  addZone(rows, page, 'hero_badge', 'text', data.badge, 'Badge du hero')
  addZone(rows, page, 'hero_title', 'text', data.title, 'Titre du hero')
  addZone(rows, page, 'hero_description', 'textarea', data.heroDescription, 'Description du hero')
  addZone(rows, page, 'intro_title', 'text', data.introTitle, 'Titre de l\'introduction')
  data.intro.forEach((p, i) => addZone(rows, page, `intro_${i + 1}`, 'textarea', p, `Introduction ${i + 1}`))
  data.pepites.forEach((p, i) => {
    addZone(rows, page, `pepite_${i + 1}_icon`, 'text', p.icon, `Pépite ${i + 1} — icône`)
    addZone(rows, page, `pepite_${i + 1}_tag`, 'text', p.tag, `Pépite ${i + 1} — tag`)
    addZone(rows, page, `pepite_${i + 1}_title`, 'text', p.title, `Pépite ${i + 1} — titre`)
    addZone(rows, page, `pepite_${i + 1}_desc`, 'textarea', p.description, `Pépite ${i + 1} — description`)
  })
  data.sleep.forEach((v, i) => addZone(rows, page, `sleep_${i + 1}`, 'html', v, `Où dormir ${i + 1}`))
  data.eat.forEach((v, i) => addZone(rows, page, `eat_${i + 1}`, 'html', v, `Où manger ${i + 1}`))
  data.faqs.forEach((f, i) => {
    addZone(rows, page, `faq_${i + 1}_q`, 'text', f.q, `FAQ ${i + 1} — question`)
    addZone(rows, page, `faq_${i + 1}_a`, 'textarea', f.a, `FAQ ${i + 1} — réponse`)
  })
}

function extractTimisoara(content) {
  const pepites = extractConstArray(content, 'pepites', ['title', 'description', 'icon', 'tag'])
  const faqs = extractConstArray(content, 'faqItems', ['q', 'a'])
  const heroDesc = content.match(/<p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">\s*([\s\S]*?)\s*<\/p>/)
  const introTitle = content.match(/<h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">\s*([\s\S]*?)\s*<\/h2>/)
  const introBlock = content.match(/<div className="space-y-4 text-stone-700 leading-relaxed">\s*([\s\S]*?)\s*<\/div>/)
  const intro = []
  if (introBlock) {
    const pRe = /<p>\s*([\s\S]*?)\s*<\/p>/g
    let m
    while ((m = pRe.exec(introBlock[1])) !== null) intro.push(decodeEntities(normalizeNewlines(m[1])))
  }
  const sleepBlock = content.match(/Où dormir<\/h3>\s*<ul className="space-y-3 text-stone-600 text-sm">([\s\S]*?)<\/ul>/)
  const eatBlock = content.match(/Où manger<\/h3>\s*<ul className="space-y-3 text-stone-600 text-sm">([\s\S]*?)<\/ul>/)
  return {
    title: 'Timișoara',
    badge: 'Roumanie · Banat',
    heroDescription: heroDesc ? decodeEntities(normalizeNewlines(heroDesc[1])) : '',
    introTitle: introTitle ? decodeEntities(normalizeNewlines(introTitle[1])) : '',
    intro,
    pepites: pepites.map((p) => ({ ...p, title: decodeEntities(p.title), description: decodeEntities(p.description) })),
    sleep: extractLiItems(sleepBlock ? sleepBlock[1] : ''),
    eat: extractLiItems(eatBlock ? eatBlock[1] : ''),
    faqs: faqs.map((f) => ({ q: decodeEntities(f.q), a: decodeEntities(f.a) })),
  }
}

function buildTimisoaraPage(data) {
  const pepitesJsx = data.pepites
    .map(
      (p, i) => `                <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-eucalyptus/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{Z('pepite_${i + 1}_icon', 'text', ${q(p.icon)}, undefined, 'span')}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-teal">{Z('pepite_${i + 1}_tag', 'text', ${q(p.tag)}, undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{Z('pepite_${i + 1}_title', 'text', ${q(p.title)}, undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('pepite_${i + 1}_desc', 'textarea', ${q(p.description)}, undefined, 'span')}</p>
                </div>`
    )
    .join('\n')

  const sleepJsx = data.sleep
    .map((v, i) => `                  <li>{Z('sleep_${i + 1}', 'html', ${q(v)}, undefined, 'span')}</li>`)
    .join('\n')
  const eatJsx = data.eat
    .map((v, i) => `                  <li>{Z('eat_${i + 1}', 'html', ${q(v)}, undefined, 'span')}</li>`)
    .join('\n')

  const faqsJs = buildFaqsJs(data.faqs, 'faq')

  return `import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const SITE_URL = 'https://www.heldonica.fr'
const PAGE = 'destinations-timisoara'

export const metadata: Metadata = {
  title: 'Timișoara slow travel | Guide Heldonica',
  description:
    'Timișoara, capitale européenne de la culture 2023 : architecture baroque, scène culturelle vivante et cafés de quartier. Notre guide slow travel.',
  alternates: {
    canonical: \`\${SITE_URL}/destinations/timisoara\`,
  },
  openGraph: {
    title: 'Timișoara slow travel | Guide Heldonica',
    description: 'Première ville d\\'Europe à avoir l\\'éclairage électrique, première ville de la révolution roumaine. Timișoara se découvre lentement.',
    url: \`\${SITE_URL}/destinations/timisoara\`,
    images: [{ url: \`\${SITE_URL}/og-default.jpg\`, width: 1024, height: 683, alt: 'Timișoara — Heldonica' }],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timișoara slow travel | Guide Heldonica',
    description: 'Capitale européenne de la culture 2023. Bars, cours cachées, architecture baroque — notre guide.',
    images: [\`\${SITE_URL}/og-default.jpg\`],
    creator: '@heldonica',
  },
}

// Valeurs de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const FAQS: { q: { zone: string; fb: string }; a: { zone: string; fb: string } }[] = [
${faqsJs}
]

export default async function TimisoaraPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main className="min-h-screen bg-stone-50">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-24 md:py-32">
          <div className="absolute inset-0 opacity-30">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-xs font-semibold uppercase tracking-widest mb-4">{Z('hero_badge', 'text', ${q(data.badge)}, undefined, 'span')}</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              {Z('hero_title', 'text', ${q(data.title)}, undefined, 'span')}
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', ${q(data.heroDescription)}, undefined, 'span')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations/roumanie"
                className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
              >
                Guide Roumanie →
              </Link>
              <Link
                href="/travel-planning"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
              >
                Planifier mon séjour
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb nav */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 text-sm text-stone-500 overflow-x-auto no-scrollbar">
            <Link href="/destinations" className="hover:text-eucalyptus transition-colors whitespace-nowrap">Destinations</Link>
            <span>›</span>
            <Link href="/destinations/roumanie" className="hover:text-eucalyptus transition-colors whitespace-nowrap">Roumanie</Link>
            <span>›</span>
            <span className="text-stone-900 whitespace-nowrap">{Z('hero_title', 'text', ${q(data.title)}, undefined, 'span')}</span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Intro */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Notre angle</p>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">
              {Z('intro_title', 'text', ${q(data.introTitle)}, undefined, 'span')}
            </h2>
            <div className="space-y-4 text-stone-700 leading-relaxed">
${data.intro.map((p, i) => `              <p>
                {Z('intro_${i + 1}', 'textarea', ${q(p)}, undefined, 'span')}
              </p>`).join('\n')}
            </div>
          </section>

          {/* Pépites grid */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Ce qu'on a déniché</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Les spots qu'on revisite</h2>
            <div className="grid gap-5 sm:grid-cols-2">
${pepitesJsx}
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Côté pratique</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Ce qu'il faut savoir</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Où dormir</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
${sleepJsx}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Où manger</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
${eatJsx}
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Questions fréquentes</p>
            <div className="space-y-4">
              {FAQS.map((f, i) => (
                <details key={i} className="group bg-white rounded-xl border border-stone-200 p-5">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                    {zones[\`\${PAGE}__\${f.q.zone}\`] ?? f.q.fb}
                    <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">{zones[\`\${PAGE}__\${f.a.zone}\`] ?? f.a.fb}</p>
                </details>
              ))}
            </div>
          </section>

          {/* À proximité */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">À proximité</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/destinations/roumanie" className="p-4 bg-white rounded-xl border border-stone-200 text-center hover:border-eucalyptus/40 transition-colors">
                <span className="text-stone-700 font-medium">Roumanie</span>
                <span className="block text-xs text-stone-500 mt-1">Guide complet</span>
              </Link>
              <div className="p-4 bg-stone-100 rounded-xl text-center">
                <span className="text-stone-700 font-medium">Budapest</span>
                <span className="block text-xs text-stone-500 mt-1">~3h en train</span>
              </div>
              <div className="p-4 bg-stone-100 rounded-xl text-center">
                <span className="text-stone-700 font-medium">Belgrade</span>
                <span className="block text-xs text-stone-500 mt-1">~4h en bus</span>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-eucalyptus/5 border border-eucalyptus/20 rounded-2xl p-8 text-center mb-8">
            <h3 className="font-serif text-xl text-stone-900 mb-3">Un itinéraire Roumanie sur mesure</h3>
            <p className="text-stone-600 text-sm mb-5 max-w-md mx-auto">
              Timișoara + Transylvanie + Bucarest : on conçoit le circuit qui correspond à ton rythme.
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
            >
              Concevoir mon voyage →
            </Link>
          </div>

          <Link href="/destinations/roumanie" className="text-eucalyptus hover:text-eucalyptus/80 text-sm font-medium transition-colors">
            ← Guide Roumanie
          </Link>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
`
}

// ─── Exécution ──────────────────────────────────────────────────────────────

const pages = []
const buildFns = {
  'destinations-sardaigne': {
    file: 'app/destinations/sardaigne/page.tsx',
    extract: extractSardaigne,
    buildZones: buildSardaigne,
    buildPage: buildSardaignePage,
  },
  'destinations-idf': {
    file: 'app/destinations/idf/page.tsx',
    extract: extractIdf,
    buildZones: buildIdf,
    buildPage: buildIdfPage,
  },
  'destinations-montenegro-kotor': {
    file: 'app/destinations/montenegro/kotor/page.tsx',
    extract: extractKotor,
    buildZones: buildKotor,
    buildPage: buildKotorPage,
  },
  'destinations-timisoara': {
    file: 'app/destinations/timisoara/page.tsx',
    extract: extractTimisoara,
    buildZones: buildTimisoara,
    buildPage: buildTimisoaraPage,
  },
}

for (const [page, cfg] of Object.entries(buildFns)) {
  const content = readOriginal(cfg.file)
  const data = cfg.extract(content)
  const rows = []
  cfg.buildZones(rows, page, data)
  pages.push([page, rows])
  const newPage = cfg.buildPage(data)
  writeFileSync(join(ROOT, cfg.file), newPage, 'utf8')
  console.log(`✔ ${page}: ${rows.length} zones — page réécrite`)
  if (data.faqs) console.log(`  FAQ: ${data.faqs.length}`)
  if (data.intro) console.log(`  intro: ${data.intro.length}`)
  if (data.zones) console.log(`  zones: ${data.zones.length}`)
  if (data.pepites) console.log(`  pepites: ${data.pepites.length}`)
  if (data.why) console.log(`  why: ${data.why.length}`)
  if (data.day) console.log(`  day: ${data.day.length}`)
  if (data.infos) console.log(`  infos: ${data.infos.length}`)
  if (data.verdict) console.log(`  verdict: ${JSON.stringify(data.verdict).length} chars`)
  if (data.sleep) console.log(`  sleep: ${data.sleep.length} | eat: ${data.eat.length}`)
  if (data.when) console.log(`  when: ${data.when.length} | transport: ${data.transport.length}`)
}

const sqlPath = join(ROOT, 'supabase/migrations/20260803_cms_faq_pages_zones.sql')
writeFileSync(sqlPath, buildSql(pages), 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '\\', '')}`)
