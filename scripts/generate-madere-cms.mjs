// Migration de la page itinéraire Madère 7 jours vers le CMS 3.0.
// Pattern établi : getPageZones() serveur + InlineEditProvider + EditableZone
// avec les valeurs actuelles en fallback (aucun changement visible attendu).
//
// Tout est extrait depuis `git show HEAD:<fichier>` (readOriginal) pour
// une fidélité garantie et une répétabilité après réécriture.
//
// Usage : node scripts/generate-madere-cms.mjs

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

/** Extraction des jours : `const days = [ { title, content }, ... ];` */
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
      return kv ? decodeEntities(kv[2].replace(/\\'/g, "'")) : null
    }
    items.push({ title: get('title'), content: get('content') })
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

/** Cartes conseils (rythme / budget). */
function getConseils(content) {
  const section = content.match(/<section className="bg-cloud-dancer section-spacing">[\s\S]*?<\/section>/)?.[0] || ''
  const cards = []
  const cardRe = /<article className="rounded-2xl border border-stone-200 p-6 bg-white">\s*<p className="text-xs uppercase tracking-\[0\.15em\] text-eucalyptus font-semibold mb-2">\s*([\s\S]*?)\s*<\/p>\s*<p className="text-charcoal\/80">\s*([\s\S]*?)\s*<\/p>\s*<\/article>/g
  let mm
  while ((mm = cardRe.exec(section)) !== null) {
    cards.push({ title: decodeEntities(mm[1]).trim(), text: decodeEntities(mm[2]).trim() })
  }
  return cards
}

/** Section CTA finale (titre + texte). */
function getCta(content) {
  const m = content.match(/<section className="bg-mahogany text-white section-spacing">\s*<div className="container max-w-3xl text-center">\s*<h2 className="text-3xl md:text-4xl font-serif mb-4">\s*([\s\S]*?)\s*<\/h2>\s*<p className="text-white\/80 mb-8">\s*([\s\S]*?)\s*<\/p>/)
  if (!m) return { title: '', text: '' }
  return { title: decodeEntities(m[1]).trim(), text: decodeEntities(m[2]).trim() }
}

// ═══════════════════════════ Zone SQL ═══════════════════════════

function addZone(rows, page, key, type, value, label) {
  rows.push([`'${page}'`, `'${key}'`, `'${type}'`, `'${sqlEscape(value)}'`, `'${sqlEscape(label)}'`])
}

function buildZones(rows, page, data) {
  addZone(rows, page, 'hero_badge', 'text', data.hero.badge, 'Badge du hero')
  addZone(rows, page, 'hero_title', 'text', data.hero.title, 'Titre du hero')
  addZone(rows, page, 'hero_description', 'textarea', data.hero.description, 'Description du hero')
  data.days.forEach((d, i) => {
    const n = i + 1
    addZone(rows, page, `day_${n}_title`, 'text', d.title || '', `Jour ${n} — titre`)
    addZone(rows, page, `day_${n}_content`, 'textarea', d.content || '', `Jour ${n} — contenu`)
  })
  data.conseils.forEach((c, i) => {
    addZone(rows, page, `conseil_${i + 1}_title`, 'text', c.title || '', `Conseil ${i + 1} — titre`)
    addZone(rows, page, `conseil_${i + 1}_text`, 'textarea', c.text || '', `Conseil ${i + 1} — texte`)
  })
  addZone(rows, page, 'cta_title', 'text', data.cta.title, 'Titre du CTA')
  addZone(rows, page, 'cta_text', 'textarea', data.cta.text, 'Texte du CTA')
}

function buildSql(pages) {
  const lines = [
    '-- ============================================================================',
    '-- Page itinéraire Madère 7 jours : contenu piloté par le CMS (cms_editable_zones)',
    '-- Date: 2026-08-01 — généré par scripts/generate-madere-cms.mjs',
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

const PAGE = "destinations-madere-itineraire-7-jours";

function buildPage(data) {
  const daysJsx = data.days
    .map((d, i) => {
      const n = i + 1
      return `                <article
                  key={${n}}
                  className="rounded-2xl border border-stone-200 p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{Z('day_${n}_title', 'text', ${q(d.title || '')}, undefined, 'span')}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{Z('day_${n}_content', 'textarea', ${q(d.content || '')}, undefined, 'span')}</p>
                </article>`
    })
    .join('\n')

  const conseilsJsx = data.conseils
    .map(
      (c, i) => `            <article className="rounded-2xl border border-stone-200 p-6 bg-white">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_${i + 1}_title', 'text', ${q(c.title || '')}, undefined, 'span')}
              </p>
              <p className="text-charcoal/80">
                {Z('conseil_${i + 1}_text', 'textarea', ${q(c.text || '')}, undefined, 'span')}
              </p>
            </article>`
    )
    .join('\n')

  return `import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';

const SITE_URL = 'https://www.heldonica.fr';
const PAGE = ${q(PAGE)};

export const metadata: Metadata = {
  title: 'Itinéraire Madère 7 jours | Heldonica',
  description:
    'Itinéraire slow travel Madère sur 7 jours : rythme, points de vue, levadas et adresses locales.',
  alternates: {
    canonical: \`\${SITE_URL}/destinations/madere/itineraire-7-jours\`,
  },
};

export default async function MadereItineraryPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main>
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

        <section className="bg-white section-spacing">
          <div className="container max-w-4xl">
            <div className="space-y-5">
${daysJsx}
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl grid md:grid-cols-2 gap-5">
${conseilsJsx}
          </div>
        </section>

        <section className="bg-mahogany text-white section-spacing">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              {Z('cta_title', 'text', ${q(data.cta.title)}, undefined, 'span')}
            </h2>
            <p className="text-white/80 mb-8">
              {Z('cta_text', 'textarea', ${q(data.cta.text)}, undefined, 'span')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=madere"
                className="px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
              >
                Construire mon itinéraire
              </Link>
              <Link
                href="/destinations/madere/budget"
                className="px-7 py-3 rounded-lg border border-white/40 hover:border-white transition-colors"
              >
                Voir le budget
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}
`
}

// ═══════════════════════════ Exécution ═══════════════════════════

const FILE = 'app/destinations/madere/itineraire-7-jours/page.tsx'
const content = readOriginal(FILE)
const data = {
  hero: getHero(content),
  days: extractDays(content),
  conseils: getConseils(content),
  cta: getCta(content),
}
const rows = []
buildZones(rows, PAGE, data)
writeFileSync(join(ROOT, FILE), buildPage(data), 'utf8')
console.log(`✔ ${PAGE}: ${rows.length} zones (${data.days.length} jours, ${data.conseils.length} conseils)`)

const sqlPath = join(ROOT, 'supabase/migrations/20260803_cms_madere_zones.sql')
writeFileSync(sqlPath, buildSql([[PAGE, rows]]), 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '\\', '')}`)
