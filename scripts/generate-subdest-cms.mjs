// Migration des sous-destinations vers le CMS 3.0 (cms_editable_zones).
//
// Ce script lit les pages app/destinations/*/*/page.tsx qui utilisent
// SubDestinationTemplate, en extrait le contenu actuel, puis :
//   1. Genere la migration SQL supabase/migrations/20260801_cms_sub_destinations_zones.sql
//      qui seed cms_editable_zones avec le contenu actuel (source de verite
//      = base apres application, fallback = code).
//   2. Reecrit chaque page avec le pattern CMS etabli : getPageZones() cote
//      serveur + InlineEditProvider + valeurs actuelles en fallback.
//
// Aucune perte : les valeurs extraites sont conservees a l'identique (les
// apostrophes echappees \' sont normalisees, les retours a la ligne JSX
// deviennent des espaces, conformement au rendu actuel).
//
// Usage : node scripts/generate-subdest-cms.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function listSubDestinationPages() {
  const out = execSync(
    `powershell -NoProfile -Command "Get-ChildItem -Path 'app/destinations' -Recurse -Filter 'page.tsx' | Where-Object { $_.FullName -notmatch '\\\\\\[' -and (Select-String -Path $_.FullName -Pattern 'SubDestinationTemplate' -Quiet) } | Select-Object -ExpandProperty FullName"`,
    { cwd: ROOT, encoding: 'utf8' }
  )
  return out
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((p) => p.replace(/\\/g, '/').replace(`${ROOT.replace(/\\/g, '/')}/`, ''))
}

/** Lit la valeur d'un attribut JSX `key="..."` en gérant `\'` et les newlines. */
function extractAttr(content, key) {
  const re = new RegExp(`${key}="((?:[^"\\\\]|\\\\.)*)"`, 's')
  const m = content.match(re)
  if (!m) return null
  // JSX normalise les retours à la ligne / espaces des attributs en un espace.
  return m[1]
    .replace(/\\'/g, "'")
    .replace(/\s*\n\s*/g, ' ')
    .trim()
}

/** Lit une valeur de chaîne JS `key: '...'` ou `key: "..."` en gérant les échappements. */
function extractJsValue(content, key) {
  const re = new RegExp(`${key}:\\s*(["'])((?:[^\\\\]|\\\\.)*?)\\1`, 's')
  const m = content.match(re)
  if (!m) return null
  return m[2].replace(/\\'/g, "'").replace(/\\"/g, '"')
}

/** Extrait `name="..."` ou le nom du composant export. */
function extractComponentName(content) {
  const m = content.match(/export default (?:async )?function (\w+)\(\)/)
  return m ? m[1] : null
}

/** Parse le tableau `highlights = [ {...}, ... ]` (formats JSON et TS). */
function extractHighlights(content) {
  const m = content.match(/const highlights = (\[[\s\S]*?\r?\n\])\r?\n/)
  if (!m) return []
  const highlights = []
  // Découpe le tableau en objets individuels `{ ... }` (aucun objet imbriqué).
  const objRe = /\{([^{}]*)\}/g
  let match
  while ((match = objRe.exec(m[1])) !== null) {
    const body = match[1]
    const get = (key) => {
      // La clé peut être entre guillemets ("emoji":) ou nue (emoji:).
      // La valeur peut contenir des apostrophes échappées (\') ou des quotes.
      const re = new RegExp(`["']?${key}["']?\\s*:\\s*(["'])((?:[^\\\\]|\\\\.)*?)\\1`, 's')
      const found = body.match(re)
      return found ? found[2].replace(/\\'/g, "'") : ''
    }
    const emoji = get('emoji')
    const title = get('title')
    const description = get('description')
    if (title || description || emoji) highlights.push({ emoji, title, description })
  }
  return highlights
}

function sqlEscape(value) {
  return value.replace(/'/g, "''")
}

function buildPage(page, data) {
  const highlightsJson = data.highlights
    .map(
      (h) =>
        `  {\n    emoji: '${h.emoji.replace(/'/g, "\\'")}',\n    title: '${h.title.replace(/'/g, "\\'")}',\n    description: '${h.description.replace(/'/g, "\\'")}',\n  }`
    )
    .join(',\n')

  // `page` = « app/destinations/roumanie/brasov/page.tsx » → « destinations-roumanie-brasov »
  const cmsPage = page.replace(/^app\/destinations\//, '').replace(/\/page\.tsx$/, '').replace(/\//g, '-')
  const zonePage = `destinations-${cmsPage}`

  return `import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SubDestinationTemplate from '@/components/SubDestinationTemplate'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'

export const metadata: Metadata = {
  title: ${JSON.stringify(data.metadata.title)},
  description: ${JSON.stringify(data.metadata.description)},
  openGraph: {
    title: ${JSON.stringify(data.metadata.ogTitle ?? data.metadata.title)},
    description: ${JSON.stringify(data.metadata.ogDescription ?? data.metadata.description)},
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica'
  },
  alternates: {
    canonical: ${JSON.stringify(data.metadata.canonical)}
  }
}

const highlights = [
${highlightsJson}
]

export default async function ${data.componentName}() {
  const zones = await getPageZones('${zonePage}')
  return (
    <InlineEditProvider page="${zonePage}" initialZones={zones}>
      <Header />
      <SubDestinationTemplate
        page="${zonePage}"
        name="${data.name.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
        parentName="${data.parentName.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
        parentSlug="${data.parentSlug}"
        heroImage="${data.heroImage.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
        introText="${data.introText.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
        highlights={highlights}
        localTip="${data.localTip.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
      />
      <Footer />
    </InlineEditProvider>
  )
}
`
}

function buildSql(pages) {
  const lines = [
    '-- ============================================================================',
    '-- Sous-destinations : contenu piloté par le CMS (cms_editable_zones)',
    '-- Date: 2026-08-01 — généré par scripts/generate-subdest-cms.mjs',
    '-- ============================================================================',
    '-- Les pages sous-destination passent du hardcodé (props du template) à des',
    '-- zones éditables. Les valeurs ci-dessous sont EXACTEMENT le contenu affiché',
    '-- jusqu\'ici : l\'arbitrage éditorial est préservé au caractère près, seul le',
    '-- mécanisme change. Aucun changement visible attendu.',
    '--',
    '-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.',
    '',
  ]
  for (const [page, data] of pages) {
    const zonePage = `destinations-${page.replace(/^app\/destinations\//, '').replace(/\/page\.tsx$/, '').replace(/\//g, '-')}`
    const q = (v) => `'${sqlEscape(v)}'`
    lines.push(`-- ─── ${zonePage} ────────────────────────────────────────────────────`)
    lines.push(`INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)`)
    lines.push(`VALUES`)
    const rows = [
      [q(zonePage), q('hero_image'), q('image'), q(data.heroImage || '/og-default.jpg'), q('Image du hero')],
      [q(zonePage), q('intro_text'), q('textarea'), q(data.introText), q("Texte d'introduction")],
      [q(zonePage), q('local_tip'), q('textarea'), q(data.localTip), q('Conseil local')],
    ]
    data.highlights.forEach((h, i) => {
      rows.push([q(zonePage), q(`highlight_${i + 1}_emoji`), q('text'), q(h.emoji), q(`Pépite ${i + 1} — emoji`)])
      rows.push([q(zonePage), q(`highlight_${i + 1}_title`), q('text'), q(h.title), q(`Pépite ${i + 1} — titre`)])
      rows.push([q(zonePage), q(`highlight_${i + 1}_description`), q('textarea'), q(h.description), q(`Pépite ${i + 1} — description`)])
    })
    lines.push(rows.map((r) => `  (${r.join(', ')})`).join(',\n'))
    lines.push(`ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();`)
    lines.push('')
  }
  return lines.join('\n')
}

// ─── Exécution ──────────────────────────────────────────────────────────────

const files = listSubDestinationPages()
console.log(`${files.length} pages sous-destination trouvées`)

const pages = []
for (const file of files) {
  const content = readFileSync(join(ROOT, file), 'utf8')

  const metadataMatch = content.match(/export const metadata: Metadata = \{([\s\S]*?)\r?\n\}/)
  const metadataTitle = extractJsValue(metadataMatch ? metadataMatch[1] : '', 'title') ?? ''
  const metadataDesc = extractJsValue(metadataMatch ? metadataMatch[1] : '', 'description') ?? ''
  const ogBlock = metadataMatch ? metadataMatch[1].match(/openGraph: \{([\s\S]*?)\n  \}/) : null
  const ogTitle = ogBlock ? extractJsValue(ogBlock[1], 'title') ?? metadataTitle : metadataTitle
  const ogDesc = ogBlock ? extractJsValue(ogBlock[1], 'description') ?? metadataDesc : metadataDesc
  const canonical = content.match(/canonical: '([^']*)'/)?.[1] ?? ''

  const data = {
    name: extractAttr(content, 'name'),
    parentName: extractAttr(content, 'parentName'),
    parentSlug: extractAttr(content, 'parentSlug'),
    heroImage: extractAttr(content, 'heroImage'),
    introText: extractAttr(content, 'introText'),
    localTip: extractAttr(content, 'localTip'),
    highlights: extractHighlights(content),
    componentName: extractComponentName(content),
    metadata: {
      title: metadataTitle,
      description: metadataDesc,
      ogTitle,
      ogDescription: ogDesc,
      canonical,
    },
  }

  if (!data.name || !data.parentSlug || !data.introText || !data.componentName) {
    console.error(`⚠️ Extraction incomplète pour ${file}`, JSON.stringify(data, null, 2).slice(0, 500))
    process.exit(1)
  }
  if (data.highlights.length === 0) {
    console.error(`⚠️ Aucun highlight extrait pour ${file}`)
    process.exit(1)
  }

  pages.push([file, data])
}

const sql = buildSql(pages)
const sqlPath = join(ROOT, 'supabase/migrations/20260801_cms_sub_destinations_zones.sql')
writeFileSync(sqlPath, sql, 'utf8')
console.log(`✔ Migration écrite : ${sqlPath.replace(ROOT + '/', '')} (${pages.length} pages)`)

for (const [file, data] of pages) {
  writeFileSync(join(ROOT, file), buildPage(file, data), 'utf8')
}
console.log(`✔ ${pages.length} pages réécrites avec le pattern CMS`)
