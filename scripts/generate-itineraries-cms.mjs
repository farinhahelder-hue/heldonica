// Migration des pages d'itinéraires Roumanie (5/7/10 jours) vers le CMS 3.0.
// Pattern établi : getPageZones() serveur + InlineEditProvider + EditableZone
// avec les valeurs actuelles en fallback (aucun changement visible attendu).
//
// Le script extrait TOUT depuis `git show HEAD:<fichier>` (readOriginal) :
// métadonnées, hero, chips, jours, sections — le rendu généré est donc
// fidèle à l'existant, et le script reste répétable après réécriture.
//
// Usage : node scripts/generate-itineraries-cms.mjs

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

/** Contenu original du fichier (HEAD) pour une extraction fidèle et répétable. */
function readOriginal(relPath) {
  try {
    return execSync(`git show HEAD:${relPath}`, { cwd: ROOT, encoding: 'utf8' })
  } catch {
    return readFileSync(join(ROOT, relPath), 'utf8')
  }
}

/** Extraction du bloc entre deux marqueurs (indexOf). */
function extractBlock(content, from, to) {
  const i = content.indexOf(from)
  if (i === -1) return null
  const j = content.indexOf(to, i + from.length)
  if (j === -1) return null
  return content.slice(i + from.length, j)
}

// ═══════════════════════════ Extraction des données ═══════════════════════════

/** `const days = [ { day, title, ... }, ... ];` */
function extractDays(content) {
  const m = content.match(/const days = \[([\s\S]*?)\r?\n\];/)
  if (!m) return []
  const items = []
  const objRe = /\{([^{}]*)\}/g
  let mm
  while ((mm = objRe.exec(m[1])) !== null) {
    const obj = mm[1]
    const get = (k) => {
      const kv = obj.match(new RegExp(`${k}:\\s*(["'])((?:[^\\\\]|\\\\.)*?)\\1`))
      if (kv) return decodeEntities(kv[2].replace(/\\'/g, "'"))
      const num = obj.match(new RegExp(`${k}:\\s*(\\d+)`))
      return num ? num[1] : null
    }
    const day = {
      day: get('day'),
      title: get('title'),
      location: get('location'),
      activity: get('activity'),
      pepite: get('pepite'),
      accommodation: get('accommodation'),
      detail: get('detail'),
    }
    if (obj.includes('from:')) day.from = get('from')
    items.push(day)
  }
  return items
}

function getHero(content) {
  const badge = content.match(/<p className="text-xs uppercase tracking-\[0\.2em\] text-eucalyptus font-semibold mb-4">\s*([\s\S]*?)\s*<\/p>/)?.[1]
  const title = content.match(/<h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">\s*([\s\S]*?)\s*<\/h1>/)?.[1]
  const desc = content.match(/<p className="text-charcoal\/80 text-lg max-w-3xl leading-relaxed">\s*([\s\S]*?)\s*<\/p>/)?.[1]
  return {
    badge: decodeEntities(badge || '').trim(),
    title: decodeEntities(title || '').trim(),
    description: decodeEntities(desc || '').trim(),
  }
}

/** Chips du blurb (chaînes), ex. « 2 visites », « Septembre 2024 ». */
function getChips(content) {
  const chips = [
    ...content.matchAll(
      /rounded-full bg-(?:amber-50|stone-100|emerald-50)[^>]*>\s*([\s\S]*?)\s*<\/span>/g
    ),
  ].map((m) => decodeEntities(m[1]).trim())
  return chips
}

/** Texte du blurb (avec <strong> éventuel). */
function getBlurbText(content) {
  const section = extractBlock(content, 'bg-eucalyptus/5 p-6', '</section>')
  if (!section) return ''
  const m = section.match(/<p className="text-sm text-charcoal\/80 leading-relaxed">\s*([\s\S]*?)\s*<\/p>/)
  return m ? decodeEntities(m[1]).trim() : ''
}

/** Texte de l'encart « Départ » (dernier jour). */
function getDepartText(content) {
  const m = content.match(/Départ<\/p>\s*<p className="text-sm text-charcoal\/80">\s*([\s\S]*?)\s*<\/p>/)
  return m ? decodeEntities(m[1]).trim() : ''
}

/** ClassName du bloc affiliation (mt-2 selon page). */
function getDisclosureClassName(content) {
  const m = content.match(/<div className="text-xs text-stone-500([^"]*)">\s*<span>\{AFFILIATE_DISCLOSURE\}<\/span>/)
  return m ? m[1].trim() : 'mt-2'
}

/** Sous-titre de la section carte. */
function getMapSubtitle(content) {
  const m = content.match(/<h2 className="text-3xl font-serif text-mahogany mb-6">Carte interactive du circuit<\/h2>\s*<p className="text-charcoal\/70 mb-6 max-w-2xl">\s*([\s\S]*?)\s*<\/p>/)
  return m ? decodeEntities(m[1]).trim() : ''
}

/** Slug de la carte (DynamicArticleMap). */
function getMapSlug(content) {
  const m = content.match(/<DynamicArticleMap slug="([^"]+)" \/>/)
  return m ? m[1] : ''
}

/** Métadonnées (title / description / OG / canonical / ogImageAlt). */
function getMetadata(content) {
  const pick = (re) => (content.match(re)?.[1] ?? '').replace(/\\'/g, "'")
  return {
    title: pick(/title: '((?:[^'\\]|\\.)*)'/),
    description: pick(/description: '((?:[^'\\]|\\.)*)'/),
    canonicalPath: pick(/canonical: `\$\{SITE_URL\}([^`]+)`/),
    ogTitle: pick(/openGraph: \{\s*title: '((?:[^'\\]|\\.)*)'/),
    ogDescription: pick(/openGraph: \{[\s\S]*?description: '((?:[^'\\]|\\.)*)'/),
    ogImageAlt: pick(/alt: '((?:[^'\\]|\\.)*)'/),
  }
}

/** Bloc JSON-LD complet (script application/ld+json auto-fermant) s'il existe. */
function getJsonLdBlock(content) {
  const m = content.match(/<script\s*type="application\/ld\+json"[\s\S]*?\/>/)
  return m ? m[0] : null
}

/** Blocs GA4 (Script id=...) s'ils existent. */
function getGa4Blocks(content) {
  const blocks = []
  const re = /<Script id="([^"]+)"[\s\S]*?<\/Script>/g
  let m
  while ((m = re.exec(content)) !== null) blocks.push(m[0])
  return blocks
}

/** Présence des sections annexes. */
function getSections(content) {
  const idx = content.indexOf('Reste inspiré')
  const prefix = idx === -1 ? content : content.slice(0, idx)
  const bg = [...prefix.matchAll(/<section className="(bg-[a-z-]+) section-spacing">/g)].pop()
  return {
    pdf: content.includes('Télécharge le PDF de cet itinéraire'),
    slow: content.includes('Tu préfères un rythme plus lent ?'),
    notEnough: content.includes('Pas assez de temps ?'),
    custom: content.includes('Tu veux la version personnalisée'),
    newsletterBg: bg ? bg[1] : 'bg-cloud-dancer',
  }
}

// ═══════════════════════════ Zone SQL ═══════════════════════════

function addZone(rows, page, key, type, value, label) {
  rows.push([`'${page}'`, `'${key}'`, `'${type}'`, `'${sqlEscape(value)}'`, `'${sqlEscape(label)}'`])
}

function buildItineraryZones(rows, page, data) {
  addZone(rows, page, 'hero_badge', 'text', data.hero.badge, 'Badge du hero')
  addZone(rows, page, 'hero_title', 'text', data.hero.title, 'Titre du hero')
  addZone(rows, page, 'hero_description', 'textarea', data.hero.description, 'Description du hero')
  data.chips.forEach((c, i) => addZone(rows, page, `chip_${i + 1}`, 'text', c, `Badge ${i + 1}`))
  addZone(rows, page, 'blurb', 'html', data.blurb, 'Blurb « Testé par Heldonica »')
  data.days.forEach((d, i) => {
    const n = i + 1
    addZone(rows, page, `day_${n}_title`, 'text', d.title || '', `Jour ${n} — titre`)
    if (d.from !== undefined) addZone(rows, page, `day_${n}_from`, 'text', d.from || '', `Jour ${n} — provenance`)
    addZone(rows, page, `day_${n}_location`, 'text', d.location || '', `Jour ${n} — lieu`)
    addZone(rows, page, `day_${n}_activity`, 'textarea', d.activity || '', `Jour ${n} — activité`)
    addZone(rows, page, `day_${n}_pepite`, 'textarea', d.pepite || '', `Jour ${n} — pépite`)
    addZone(rows, page, `day_${n}_accommodation`, 'textarea', d.accommodation || '', `Jour ${n} — hébergement`)
    addZone(rows, page, `day_${n}_detail`, 'textarea', d.detail || '', `Jour ${n} — détail`)
  })
}

function buildSql(pages) {
  const lines = [
    '-- ============================================================================',
    '-- Pages itinéraires Roumanie : contenu piloté par le CMS (cms_editable_zones)',
    '-- Date: 2026-08-01 — généré par scripts/generate-itineraries-cms.mjs',
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

// ═══════════════════════════ Template de page ═══════════════════════════

const CHIP_STYLES = [
  'bg-amber-50 text-amber-700',
  'bg-stone-100 text-stone-600',
  'bg-emerald-50 text-emerald-700',
]

function buildDaysJsx(page, days, hasFrom, departText, disclosureClassName) {
  return days
    .map((d, i) => {
      const n = i + 1
      const header = hasFrom
        ? `                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{Z('day_${n}_title', 'text', ${q(d.title || '')}, undefined, 'span')}</h2>
                        <span className="text-xs text-stone-500">{Z('day_${n}_from', 'text', ${q(d.from || '')}, undefined, 'span')}</span>
                      </div>`
        : `                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_${n}_title', 'text', ${q(d.title || '')}, undefined, 'span')}</h2>`
      const gridMb = hasFrom ? ' mb-4' : ''
      return `                <article key={${n}} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      ${n}
                    </span>
                    <div className="flex-1">
${header}
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_${n}_location', 'text', ${q(d.location || '')}, undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_${n}_detail', 'textarea', ${q(d.detail || '')}, undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3${gridMb}">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_${n}_pepite', 'textarea', ${q(d.pepite || '')}, undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={${n}}
                      cityFallback={${q(d.location || '')}}
                      accommodationFallback={${q(d.accommodation || '')}}
                      departText={departText}
                      disclosureClassName="${disclosureClassName}"
                    />
                  </div>
                </article>`
    })
    .join('\n')
}

function buildPage(cfg, data) {
  const daysJsx = buildDaysJsx(cfg.page, data.days, data.hasFrom, data.departText, data.disclosureClassName)
  const chipsJsx = data.chips
    .map(
      (c, i) =>
        `                <span className="inline-flex items-center gap-1.5 rounded-full ${CHIP_STYLES[i % CHIP_STYLES.length]} px-3 py-1 text-xs font-semibold">{Z('chip_${i + 1}', 'text', ${q(c)}, undefined, 'span')}</span>`
    )
    .join('\n')

  const sections = []
  if (data.sections.pdf) {
    sections.push(`        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-serif text-mahogany mb-4">Télécharge le PDF de cet itinéraire</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              Emporte ce carnet Roumanie ${cfg.duration} jours dans ton téléphone ou imprime-le : les adresses et les pépites dénichées sans avoir besoin de réseau.
            </p>
            <PdfDownloadButton destination="roumanie" duration="${cfg.duration}" className="inline-flex px-8 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors" />
          </div>
        </section>`)
  }
  if (data.sections.slow) {
    sections.push(`        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <h2 className="text-2xl font-serif text-mahogany mb-4">Tu préfères un rythme plus lent ?</h2>
            <p className="text-charcoal/70 mb-6 max-w-lg mx-auto">
              5 jours c&apos;est court pour la Roumanie. Notre itinéraire 7 jours ajoute Viscri et Cluj sans rien sacrifier.
            </p>
            <Link
              href="/destinations/roumanie/itineraire-7-jours"
              className="inline-flex px-7 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
            >
              Voir l&apos;itinéraire 7 jours →
            </Link>
          </div>
        </section>`)
  }
  if (data.sections.notEnough) {
    sections.push(`        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <h2 className="text-2xl font-serif text-mahogany mb-4">Pas assez de temps ?</h2>
            <p className="text-charcoal/70 mb-6 max-w-lg mx-auto">
              Notre itinéraire 7 jours couvre l&apos;essentiel de la Transylvanie si tu as moins de flexibilité.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/destinations/roumanie/itineraire-7-jours" className="inline-flex px-6 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors">
                Voir l&apos;itinéraire 7 jours →
              </Link>
              <Link href="/destinations/roumanie/itineraire-5-jours" className="inline-flex px-6 py-3 rounded-lg border border-stone-300 text-charcoal font-semibold hover:bg-stone-50 transition-colors">
                Version 5 jours →
              </Link>
            </div>
          </div>
        </section>`)
  }
  if (data.sections.custom) {
    sections.push(`        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-3">
              Conception sur mesure
            </p>
            <h2 className="text-2xl font-serif text-mahogany mb-4">
              Tu veux la version personnalisée de cet itinéraire ?
            </h2>
            <p className="text-charcoal/70 mb-8 max-w-lg mx-auto">
              On adapte ce circuit à ton budget, ta saison et ton énergie réelle.
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex px-7 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
            >
              Construire mon itinéraire sur mesure →
            </Link>
          </div>
        </section>`)
  }
  const newsletterBg = data.sections.newsletterBg
  sections.push(`        <section className="${newsletterBg} section-spacing">
          <div className="container max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-3">
              Reste inspiré
            </p>
            <h2 className="text-2xl font-serif text-mahogany mb-4">
              On t&apos;envoie nos prochains carnets ?
            </h2>
            <NewsletterForm variant="inline" />
          </div>
        </section>`)

  const extraImports = []
  if (data.ga4.length) extraImports.push(`import Script from 'next/script';`)
  if (data.sections.pdf) extraImports.push(`import PdfDownloadButton from '@/components/PdfDownloadButton';`)
  const componentImports = [
    `import DaySummaryTable from '@/components/itinerary/DaySummaryTable';`,
    `import DayAccommodationBox from '@/components/itinerary/DayAccommodationBox';`,
  ]

  const meta = data.meta
  const departText = q(data.departText)

  const dayRows = data.days.map((d) => ({ day: Number(d.day), location: d.location || '', activity: d.activity || '', accommodation: d.accommodation || null }))
  const dayRowsJson = JSON.stringify(dayRows)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')

  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';
import DynamicArticleMap from '@/components/DynamicArticleMap';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
${[...new Set([...extraImports, ...componentImports])].join('\n')}

const SITE_URL = 'https://www.heldonica.fr';
const PAGE = ${q(cfg.page)};
const DAYS: { day: number; location: string; activity: string; accommodation: string | null }[] = ${dayRowsJson};

export const metadata: Metadata = {
  title: ${q(meta.title)},
  description: ${q(meta.description)},
  alternates: {
    canonical: \`\${SITE_URL}${meta.canonicalPath}\`,
  },
  openGraph: {
    title: ${q(meta.ogTitle)},
    description: ${q(meta.ogDescription)},
    url: \`\${SITE_URL}${meta.canonicalPath}\`,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: ${q(meta.ogImageAlt)},
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
};

export default async function ${cfg.componentName}() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  const departText = ${departText};

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
${data.jsonLd ? data.jsonLd.replace(/^/gm, '      ') + '\n' : ''}      <Header />
${data.ga4.map((b) => b.replace(/^/gm, '      ')).join('\n')}      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              {Z('hero_badge', 'text', ${q(data.hero.badge)}, undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              {Z('hero_title', 'text', ${q(data.hero.title)}, undefined, 'span')}
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              {Z('hero_description', 'textarea', ${q(data.hero.description)}, undefined, 'span')}
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing pt-0 -mt-6">
          <div className="container max-w-4xl">
            <div className="rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-eucalyptus/10 text-eucalyptus px-3 py-1 text-xs font-semibold">Testé par Heldonica</span>
${chipsJsx}
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {Z('blurb', 'html', ${q(data.blurb)}, undefined, 'span')}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing pt-0">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-serif text-mahogany mb-6">Aperçu du circuit</h2>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-sm table-auto">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Jour</th>
                    <th className="px-4 py-3 text-left">Ville</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Activité</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Nuit</th>
                  </tr>
                </thead>
                <DaySummaryTable page={PAGE} days={DAYS} />
              </table>
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <div className="space-y-6">
${daysJsx}
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">Carte interactive du circuit</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              ${data.mapSubtitle}
            </p>
            <div className="rounded-2xl overflow-hidden border border-stone-200">
              <DynamicArticleMap slug="${data.mapSlug}" />
            </div>
          </div>
        </section>

${sections.join('\n\n')}      </main>
      <Footer />
    </InlineEditProvider>
  );
}
`
}

// ═══════════════════════════ Exécution ═══════════════════════════

const PAGES = [
  {
    page: 'destinations-roumanie-itineraire-5-jours',
    file: 'app/destinations/roumanie/itineraire-5-jours/page.tsx',
    componentName: 'Itineraire5JoursPage',
    duration: '5',
  },
  {
    page: 'destinations-roumanie-itineraire-7-jours',
    file: 'app/destinations/roumanie/itineraire-7-jours/page.tsx',
    componentName: 'Itineraire7JoursPage',
    duration: '7',
  },
  {
    page: 'destinations-roumanie-itineraire-10-jours',
    file: 'app/destinations/roumanie/itineraire-10-jours/page.tsx',
    componentName: 'Itineraire10JoursPage',
    duration: '10',
  },
]

const pages = []
for (const cfg of PAGES) {
  const content = readOriginal(cfg.file)
  const days = extractDays(content)
  const data = {
    hero: getHero(content),
    chips: getChips(content),
    blurb: getBlurbText(content),
    departText: getDepartText(content),
    disclosureClassName: getDisclosureClassName(content),
    mapSubtitle: getMapSubtitle(content),
    mapSlug: getMapSlug(content),
    meta: getMetadata(content),
    jsonLd: getJsonLdBlock(content),
    ga4: getGa4Blocks(content),
    sections: getSections(content),
    hasFrom: days.some((d) => d.from !== undefined),
    days,
  }
  const rows = []
  buildItineraryZones(rows, cfg.page, data)
  pages.push([cfg.page, rows])
  const newPage = buildPage(cfg, data)
  writeFileSync(join(ROOT, cfg.file), newPage, 'utf8')
  console.log(`✔ ${cfg.page}: ${rows.length} zones (${days.length} jours) — page réécrite`)
  console.log(`  hero: ${data.hero.title}`)
  console.log(`  chips: ${data.chips.join(' | ')}`)
  console.log(`  sections: pdf=${data.sections.pdf} slow=${data.sections.slow} notEnough=${data.sections.notEnough} custom=${data.sections.custom} newsletterBg=${data.sections.newsletterBg}`)
  console.log(`  jsonLd=${!!data.jsonLd} ga4Blocks=${data.ga4.length} hasFrom=${data.hasFrom}`)
  console.log(`  depart: ${data.departText}`)
  console.log(`  mapSlug: ${data.mapSlug} | mapSubtitle: ${data.mapSubtitle.slice(0, 80)}`)
}

const sqlPath = join(ROOT, 'supabase/migrations/20260803_cms_itineraries_zones.sql')
writeFileSync(sqlPath, buildSql(pages), 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '\\', '')}`)
