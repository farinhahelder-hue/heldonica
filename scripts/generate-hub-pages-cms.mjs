// Migration des pages hubs (portugal, normandie, colombie) vers le CMS 3.0.
// Pattern établi : getPageZones() serveur + InlineEditProvider + EditableZone
// avec les valeurs actuelles en fallback (aucun changement visible attendu).
//
// Tout est extrait depuis `git show HEAD:<fichier>` (readOriginal) pour
// une fidélité garantie et une répétabilité après réécriture.
//
// Usage : node scripts/generate-hub-pages-cms.mjs

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

/** Schémas JSON-LD (hors FAQ) référencés par les scripts de la page. */
function getJsonLdSchemas(content) {
  const out = []
  const re = /<script\s*type="application\/ld\+json"[\s\S]*?JSON\.stringify\((\w+)\)[\s\S]*?\/>/g
  let m
  while ((m = re.exec(content)) !== null) {
    if (/faq/i.test(m[1])) continue
    const obj = parseJsonConst(content, m[1])
    if (obj) out.push(obj)
  }
  return out
}

/** FAQ depuis le schéma JSON-LD (objet parsé depuis la const). */
function getFaqFromSchema(content, constName) {
  const schema = parseJsonConst(content, constName)
  if (!schema || !Array.isArray(schema.mainEntity)) return []
  return schema.mainEntity.map((e) => ({
    q: e.name || '',
    a: (e.acceptedAnswer && e.acceptedAnswer.text) || '',
  }))
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
  const ogBlock = extractBlock(md, 'openGraph: {', 'url: ') || ''
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

/** SubNav : `const subNav = [ { label, href }, ... ]` (guillemets simple ou double). */
function getSubNav(content) {
  const m = content.match(/const subNav = \[([\s\S]*?)\r?\n\]/)
  if (!m) return []
  return [...m[1].matchAll(/\{ label: (["'])((?:[^\\]|\\.)*?)\1, href: (["'])((?:[^\\]|\\.)*?)\3 \}/g)].map((x) => ({
    label: decodeEntities(x[2]),
    href: x[4],
  }))
}

/** Portugal : const destinations = [ { label, href, desc, image, tag } ] */
function getPortugalCards(content) {
  const m = content.match(/const destinations = \[([\s\S]*?)\r?\n\]/)
  if (!m) return []
  return [...m[1].matchAll(/label: '((?:[^'\\]|\\.)*)',\s*href: '([^']+)',\s*desc: '((?:[^'\\]|\\.)*)',\s*image: '([^']+)',\s*tag: '((?:[^'\\]|\\.)*)'/g)].map((x) => ({
    title: decodeEntities(x[1].replace(/\\'/g, "'")),
    href: x[2],
    desc: decodeEntities(x[3].replace(/\\'/g, "'")),
    tag: decodeEntities(x[5].replace(/\\'/g, "'")),
  }))
}

/** Normandie : cartes régions inline JSX (3 cartes <Link>). */
function getNormandieCards(content) {
  const section = extractBlock(content, 'Nos régions', 'Quand y aller') || content
  return [...section.matchAll(/<Link[\s\S]*?href="([^"]+)"[\s\S]*?<h3 className="font-serif text-lg text-stone-900 mb-2">\s*([\s\S]*?)\s*<\/h3>\s*<p className="text-stone-600 text-sm">\s*([\s\S]*?)\s*<\/p>\s*<\/Link>/g)].map((m) => ({
    title: decodeEntities(m[2]).trim(),
    href: m[1],
    desc: decodeEntities(m[3]).trim(),
  }))
}

/** Colombie : cartes villes inline JSX (desc en simple ou double quotes). */
function getColombieCards(content) {
  const out = []
  const re = /\{ href: '([^']+)', title: '((?:[^'\\]|\\.)*)', desc: ("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*') \},/g
  let m
  while ((m = re.exec(content)) !== null) {
    const raw = m[3]
    const desc = raw.startsWith('"') ? raw.slice(1, -1).replace(/\\(.)/g, '$1') : raw.slice(1, -1).replace(/\\'/g, "'")
    out.push({ href: m[1], title: decodeEntities(m[2].replace(/\\'/g, "'")), desc: decodeEntities(desc) })
    if (out.length >= 4) break
  }
  return out
}

/** Paragraphes d'intro (marker peut être dans le premier <p> — section remontée). */
function getIntro(content, marker) {
  const mIdx = content.indexOf(marker)
  if (mIdx === -1) return []
  const sIdx = content.lastIndexOf('<section', mIdx)
  const eIdx = content.indexOf('</section>', mIdx)
  if (sIdx === -1 || eIdx === -1) return []
  const section = content.slice(sIdx, eIdx)
  return [...section.matchAll(/<p(?: className="([^"]*)")?>\s*([\s\S]*?)\s*<\/p>/g)]
    .filter((m) => !(m[1] || '').includes('text-xs'))
    .map((m) => decodeEntities(m[2]).trim())
}

/** Sections infos : [{ title, items }] — items sans le span ✓ (mis par le template). */
function getInfoSections(content, marker, stripRe) {
  const mIdx = content.indexOf(marker)
  if (mIdx === -1) return []
  const sIdx = content.lastIndexOf('<section', mIdx)
  const eIdx = content.indexOf('</section>', mIdx)
  if (sIdx === -1 || eIdx === -1) return []
  const section = content.slice(sIdx, eIdx)
  const blocks = []
  const cardRe = /<div className="bg-white p-6 rounded-(?:xl|lg) border border-stone-200">\s*<h3 className="[^"]*">\s*([\s\S]*?)\s*<\/h3>([\s\S]*?)<\/div>/g
  let mm
  while ((mm = cardRe.exec(section)) !== null) {
    const title = decodeEntities(mm[1]).trim()
    const items = [...mm[2].matchAll(/<li(?: className="[^"]*")?>\s*([\s\S]*?)\s*<\/li>/g)].map((x) => {
      let body = x[1]
      if (stripRe) body = body.replace(stripRe, '')
      return decodeEntities(body).trim()
    })
    blocks.push({ title, items })
  }
  return blocks
}

// ═══════════════════════════ Zone SQL ═══════════════════════════

function addZone(rows, page, key, type, value, label) {
  rows.push([`'${page}'`, `'${key}'`, `'${type}'`, `'${sqlEscape(value)}'`, `'${sqlEscape(label)}'`])
}

function buildZones(rows, page, data) {
  addZone(rows, page, 'hero_badge', 'text', data.hero.badge, 'Badge du hero')
  addZone(rows, page, 'hero_title', 'text', data.hero.title, 'Titre du hero')
  if (data.hero.subtitle) addZone(rows, page, 'hero_subtitle', 'text', data.hero.subtitle, 'Sous-titre du hero')
  addZone(rows, page, 'hero_description', 'textarea', data.hero.description, 'Description du hero')
  if (data.introTitle) addZone(rows, page, 'intro_title', 'text', data.introTitle, "Titre d'intro")
  data.intro.forEach((p, i) => addZone(rows, page, `intro_${i + 1}`, 'html', p, `Paragraphe d'intro ${i + 1}`))
  data.cards.forEach((c, i) => {
    addZone(rows, page, `card_${i + 1}_title`, 'text', c.title || '', `Carte ${i + 1} — titre`)
    if (c.tag) addZone(rows, page, `card_${i + 1}_tag`, 'text', c.tag || '', `Carte ${i + 1} — tag`)
    addZone(rows, page, `card_${i + 1}_desc`, 'textarea', c.desc || '', `Carte ${i + 1} — description`)
  })
  if (data.infoTitle) addZone(rows, page, 'info_title', 'text', data.infoTitle, "Titre des infos pratiques")
  data.infos.forEach((s, i) => {
    addZone(rows, page, `info_${i + 1}_title`, 'text', s.title || '', `Infos ${i + 1} — titre`)
    s.items.forEach((it, j) => addZone(rows, page, `info_${i + 1}_item_${j + 1}`, 'html', it || '', `Infos ${i + 1} — item ${j + 1}`))
  })
  if (data.showFaq) {
    data.faq.forEach((f, i) => {
      addZone(rows, page, `faq_${i + 1}_q`, 'text', f.q || '', `FAQ ${i + 1} — question`)
      addZone(rows, page, `faq_${i + 1}_a`, 'textarea', f.a || '', `FAQ ${i + 1} — réponse`)
    })
  }
  if (data.cta) {
    addZone(rows, page, 'cta_title', 'text', data.cta.title || '', 'Titre du CTA')
    addZone(rows, page, 'cta_text', 'textarea', data.cta.text || '', 'Texte du CTA')
  }
}

function buildSql(pages) {
  const lines = [
    '-- ============================================================================',
    '-- Pages hubs (portugal, normandie, colombie) : contenu piloté par le CMS',
    '-- Date: 2026-08-01 — généré par scripts/generate-hub-pages-cms.mjs',
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

// ═══════════════════════════ Templates de page ═══════════════════════════

function buildHubPage(config, data) {
  const meta = config.meta
  const jsonLdJsx = data.jsonLd
    .map((obj) => `      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ${JSON.stringify(JSON.stringify(obj))} }}
      />
`)
    .join('')
  const faqJsonLd = data.faq.length
    ? `      <script
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
`
    : ''

  const subNavConst = data.subNav.map((s) => `  { label: ${q(s.label)}, href: ${q(s.href)} },`).join('\n')
  const faqsConst = data.faq.map((f) => `  { q: ${q(f.q)}, a: ${q(f.a)} },`).join('\n')

  const introHeadingJsx = config.introTitle
    ? `            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">${config.introLabel}</p>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">
              {Z('intro_title', 'text', ${q(config.introTitle)}, undefined, 'span')}
            </h2>`
    : ''
  const introJsx = data.intro
    .map(
      (p, i) => `              <p className="text-lg text-stone-700 leading-relaxed${i > 0 ? ' mb-4' : ''}">
                {Z('intro_${i + 1}', 'html', ${q(p)}, undefined, 'span')}
              </p>`
    )
    .join('\n')

  const cardsJsx = data.cards
    .map((c, i) => {
      const tag = c.tag
        ? `                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-2">
                  {Z('card_${i + 1}_tag', 'text', ${q(c.tag)}, undefined, 'span')}
                </span>
`
        : ''
      const link = config.cardsLink
        ? `\n                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">Voir le guide →</span>`
        : ''
      return `              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
${tag}                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_${i + 1}_title', 'text', ${q(c.title)}, undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_${i + 1}_desc', 'textarea', ${q(c.desc)}, undefined, 'span')}
                </p>${link}
              </div>`
    })
    .join('\n')

  const infoSectionsJsx = data.infos
    .map(
      (s, i) => `            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                {Z('info_${i + 1}_title', 'text', ${q(s.title)}, undefined, 'span')}
              </h3>
              <ul className="space-y-3 text-stone-600 text-sm">
                ${s.items.map((it, j) => `<li className="flex items-start gap-2">
                  ${config.checkmark ? `<span className="text-eucalyptus font-bold mt-0.5">${config.checkmark}</span>
                  ` : ''}<span>{Z('info_${i + 1}_item_${j + 1}', 'html', ${q(it)}, undefined, 'span')}</span>
                </li>`).join('\n                ')}
              </ul>
            </div>`
    )
    .join('\n')

  const faqJsx = data.showFaq
    ? `          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Questions fréquentes</p>
            <div className="space-y-4">
              ${data.faq.map((f, i) => `<details key={${i}} className="group bg-white rounded-xl border border-stone-200 p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_${i + 1}_q', 'text', ${q(f.q)}, undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z('faq_${i + 1}_a', 'textarea', ${q(f.a)}, undefined, 'span')}
                </p>
              </details>`).join('\n              ')}
            </div>
          </section>`
    : ''

  const ctaJsx = data.cta
    ? `          <div className="bg-eucalyptus/5 border border-eucalyptus/20 rounded-2xl p-8 text-center mb-8">
            <h3 className="font-serif text-xl text-stone-900 mb-3">
              {Z('cta_title', 'text', ${q(data.cta.title)}, undefined, 'span')}
            </h3>
            <p className="text-stone-600 text-sm mb-5 max-w-md mx-auto">
              {Z('cta_text', 'textarea', ${q(data.cta.text)}, undefined, 'span')}
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
            >
              ${config.ctaButtonLabel}
            </Link>
          </div>`
    : ''

  const extraLinksJsx = (config.extraLinks || [])
    .map(
      (l) => `              <Link
                href="${l.href}"
                className="${l.cls}"
              >
                ${l.label}
              </Link>`
    )
    .join('\n')

  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';

const PAGE = ${q(config.page)};
const SUBNav = [
${subNavConst}
];
const FAQS: { q: string; a: string }[] = [
${faqsConst}
];
const HERO_SUBTITLE = ${q(data.hero.subtitle || '')};

export const metadata: Metadata = {
  title: ${q(meta.title)},
  description: ${q(meta.description)},
  alternates: {
    canonical: ${q(meta.canonicalPath)},
  },
  openGraph: {
    title: ${q(meta.ogTitle)},
    description: ${q(meta.ogDescription)},
    url: ${q(meta.canonicalPath)},
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

export default async function ${config.componentName}() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
${jsonLdJsx}${faqJsonLd}      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-stone-900 py-20 md:py-24 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 uppercase tracking-widest">
              {Z('hero_badge', 'text', ${q(data.hero.badge)}, undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', ${q(data.hero.title)}, undefined, 'span')}
              {HERO_SUBTITLE ? (
                <span className="block text-teal italic text-3xl md:text-4xl mt-2">
                  {Z('hero_subtitle', 'text', HERO_SUBTITLE, undefined, 'span')}
                </span>
              ) : null}
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', ${q(data.hero.description)}, undefined, 'span')}
            </p>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40" aria-label="Sous-destinations">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {SUBNav.map((item) => (
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
          {/* Intro */}
          <section className="mb-12">
${introHeadingJsx}
${introJsx}
          </section>

          {/* Cards grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              ${config.cardsTitle}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
${cardsJsx}
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-12">
            ${config.infoTitle ? `\n            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">${config.infoLabel}</p>\n            <h2 className="text-2xl font-serif text-stone-900 mb-6">\n              {Z('info_title', 'text', ${q(config.infoTitle)}, undefined, 'span')}\n            </h2>` : ''}
            <div className="grid md:grid-cols-2 gap-8">
${infoSectionsJsx}
            </div>
          </section>

${faqJsx}
${extraLinksJsx ? `          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              En voir plus
            </h2>
            <div className="flex flex-wrap gap-4">
${extraLinksJsx}
            </div>
          </section>
` : ''}${ctaJsx}          <div className="pt-4 border-t border-stone-200">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              ← Toutes les destinations
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}
`
}

// ═══════════════════════════ Exécution ═══════════════════════════

const CONFIGS = [
  {
    page: 'destinations-portugal',
    file: 'app/destinations/portugal/page.tsx',
    componentName: 'PortugalPage',
    cardsTitle: 'Où aller au Portugal',
    cardsLink: false,
    checkmark: '✓',
    ctaButtonLabel: 'Planifier mon voyage Portugal →',
    ctaFrom: '<div className="bg-eucalyptus/5',
    faqConst: 'faqPortugalSchema',
    introMarker: 'Le Portugal qu\'on connaît vraiment',
    infoMarker: 'Ce qu\'il faut savoir',
    infoStripRe: /<span className="text-eucalyptus font-bold mt-0\.5">[^<]*<\/span>/g,
    showFaq: true,
    extraLinks: null,
    introLabel: 'Notre angle',
    introTitle: 'Le Portugal qu\'on connaît vraiment',
    infoLabel: 'Côté pratique',
    infoTitle: 'Ce qu\'il faut savoir',
    heroDescClass: 'text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed',
  },
  {
    page: 'destinations-normandie',
    file: 'app/destinations/normandie/page.tsx',
    componentName: 'NormandiePage',
    cardsTitle: 'Nos régions',
    cardsLink: false,
    checkmark: '',
    ctaButtonLabel: '',
    ctaFrom: null,
    faqConst: 'faqNormandieSchema',
    introMarker: 'Quand on pense Normandie',
    infoMarker: 'Quand y aller',
    infoStripRe: null,
    showFaq: false,
    extraLinks: [
      { href: '/destinations/normandie/le-havre', label: 'Le Havre et environs →', cls: 'px-6 py-3 bg-mahogany text-white rounded-lg hover:bg-mahogany/90 transition-colors' },
      { href: '/blog', label: 'Articles Normandie →', cls: 'px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:border-eucalyptus/40 transition-colors' },
    ],
    introLabel: null,
    introTitle: null,
    infoLabel: null,
    infoTitle: null,
    heroDescClass: 'text-xl text-stone-300 max-w-2xl',
  },
  {
    page: 'destinations-colombie',
    file: 'app/destinations/colombie/page.tsx',
    componentName: 'ColombiePage',
    cardsTitle: 'Nos villes favorites',
    cardsLink: true,
    checkmark: '',
    ctaButtonLabel: '',
    ctaFrom: null,
    faqConst: 'faqColombieSchema',
    introMarker: 'La Colombie, c\'est le retour',
    infoMarker: 'Meilleure période',
    infoStripRe: null,
    showFaq: false,
    extraLinks: null,
    introLabel: null,
    introTitle: null,
    infoLabel: null,
    infoTitle: null,
    heroDescClass: 'text-xl text-stone-300 max-w-2xl leading-relaxed',
  },
]

const pages = []
for (const cfg of CONFIGS) {
  const content = readOriginal(cfg.file)
  const h1Inner = content.match(/<h1 className="text-4xl md:text-5xl font-serif text-white[^"]*">\s*([\s\S]*?)\s*<\/h1>/)?.[1] || ''
  const subMatch = h1Inner.match(/<span className="block text-teal italic[^"]*">\s*([\s\S]*?)\s*<\/span>/)
  const heroTitle = h1Inner
    .replace(subMatch?.[0] || '', '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const data = {
    hero: {
      badge: decodeEntities((content.match(/<(?:span|p) className="[^"]*text-teal[^"]*"[^>]*>\s*([\s\S]*?)\s*<\/(?:span|p)>/)?.[1] || 'Destinations').replace(/<\/?[^>]+>/g, '').trim()),
      title: decodeEntities(heroTitle),
      subtitle: subMatch ? decodeEntities(subMatch[1].trim()) : '',
      description: decodeEntities((content.match(new RegExp(`<p className="${cfg.heroDescClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">\\s*([\\s\\S]*?)\\s*<\\/p>`))?.[1] || '').replace(/<\/?[^>]+>/g, '').replace(/\s+/g, ' ').trim()),
    },
    intro: getIntro(content, cfg.introMarker),
    cards: cfg.page === 'destinations-portugal'
      ? getPortugalCards(content)
      : cfg.page === 'destinations-normandie'
        ? getNormandieCards(content)
        : getColombieCards(content),
    infos: getInfoSections(content, cfg.infoMarker, cfg.infoStripRe),
    faq: getFaqFromSchema(content, cfg.faqConst),
    cta: cfg.ctaFrom
      ? (() => {
          const section = extractBlock(content, cfg.ctaFrom, '</div>')
          const h = section?.match(/<h3 className="[^"]*">\s*([\s\S]*?)\s*<\/h3>/)?.[1]
          const p = section?.match(/<p className="[^"]*">\s*([\s\S]*?)\s*<\/p>/)?.[1]
          return h ? { title: decodeEntities(h).trim(), text: p ? decodeEntities(p).trim() : '' } : null
        })()
      : null,
    jsonLd: getJsonLdSchemas(content),
    subNav: getSubNav(content),
    showFaq: cfg.showFaq,
    introTitle: cfg.introTitle || null,
    infoTitle: cfg.infoTitle || null,
  }

  const meta = getMetadata(content)
  cfg.meta = meta

  const page = buildHubPage(cfg, data)
  const rows = []
  buildZones(rows, cfg.page, data)
  pages.push([cfg.page, rows])
  writeFileSync(join(ROOT, cfg.file), page, 'utf8')
  console.log(`✔ ${cfg.page}: ${rows.length} zones — page réécrite`)
  console.log(`  badge: ${data.hero.badge} | title: ${data.hero.title}${data.hero.subtitle ? ' + ' + data.hero.subtitle : ''}`)
  console.log(`  intro: ${data.intro.length} | cards: ${data.cards.length} | infos: ${data.infos.length} | faq: ${data.faq.length} | cta: ${data.cta ? 'oui' : 'non'} | subNav: ${data.subNav.length} | jsonLd: ${data.jsonLd.length}`)
}

const sqlPath = join(ROOT, 'supabase/migrations/20260803_cms_hub_pages_zones.sql')
writeFileSync(sqlPath, buildSql(pages), 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '\\', '')}`)
