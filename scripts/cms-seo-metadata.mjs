/**
 * Migration SEO metadata -> CMS.
 *
 * Pour chaque fichier page.tsx sous app/ contenant `export const metadata: Metadata = {` :
 *   1. le transforme en `const metadata` + ajoute `generateMetadata()` qui
 *      appelle `buildPageMetadata('<page-key>', metadata)` ;
 *   2. génère le SQL des zones seo_title / seo_description / seo_og_image
 *      avec les valeurs actuelles (fallback == valeur initiale en base).
 *
 * Usage: node scripts/cms-seo-metadata.mjs <transform|sql> [--write]
 *   - transform: applique l'édit sur les fichiers (obligatoire --write pour écrire)
 *   - sql: imprime la migration SQL sur stdout
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const APP = 'C:/Users/farin/Desktop/heldonica/app'
const OUT = 'C:/Users/farin/Desktop/heldonica/supabase/migrations/20260804_cms_seo_zones.sql'

const SKIP = new Set([
  'layout.tsx',
  // pages-outils hors périmètre contenu
  'app/panel-manager',
])
const SKIP_FILES = new Set([
  // racine : défauts globaux du site, pas de page
  'C:/Users/farin/Desktop/heldonica/app/layout.tsx',
])

function listPages(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (SKIP.has(entry)) continue
    if (statSync(full).isDirectory()) out.push(...listPages(full))
    else if (entry === 'page.tsx') out.push(full)
  }
  return out
}

/** Clé CMS à partir du chemin de la page. */
function pageKey(file) {
  const rel = file.replaceAll('\\', '/').replace(APP, '').replace(/^\//, '').replace(/\/page\.tsx$/, '')
  const segs = rel.split('/')
  if (segs[0] === 'destinations') return `destinations-${segs.slice(1).join('-')}`
  return segs.join('-')
}

/** Lit une chaîne JS simple (guillemets simples ou doubles) à partir de pos (index de l'ouverture). */
function readString(text, pos) {
  const q = text[pos]
  let i = pos + 1
  let s = ''
  while (i < text.length) {
    if (text[i] === '\\' && i + 1 < text.length) { s += text[i + 1]; i += 2; continue }
    if (text[i] === q) return { value: s, end: i + 1 }
    s += text[i]; i++
  }
  return { value: s, end: i }
}

/** Extrait title / description / og image du bloc metadata (déclaration comprise). */
function extractSeo(block) {
  const out = { title: '', description: '', image: '' }
  const grab = (key, keyLen) => {
    const kIdx = block.indexOf(`${key}:`)
    if (kIdx < 0) return ''
    const q = block.slice(kIdx + keyLen).search(/['"]/)
    if (q < 0) return ''
    return readString(block, kIdx + keyLen + q).value
  }
  out.title = grab('title', 6)
  out.description = grab('description', 12)
  const iIdx = block.indexOf('images:')
  if (iIdx >= 0) {
    const after = block.slice(iIdx + 7)
    // object style { url: '...' } ou array style ['...']
    const uIdx = after.indexOf('url:')
    const pick = after.indexOf("'")
    const dpick = after.indexOf('"')
    const candidates = []
    if (uIdx >= 0) candidates.push({ i: uIdx + 5, kind: 'url' })
    if (pick >= 0) candidates.push({ i: pick, kind: 'str' })
    if (dpick >= 0) candidates.push({ i: dpick, kind: 'str' })
    candidates.sort((a, b) => a.i - b.i)
    if (candidates.length) {
      const c = candidates[0]
      out.image = readString(after, c.i).value
    }
  }
  return out
}

function transform(file, key) {
  let text = readFileSync(file, 'utf8')
  const decl = /export const metadata: Metadata = \{/
  const m = decl.exec(text)
  if (!m) return { ok: false, reason: 'decl not found' }

  // 1. déclaration -> const
  text = text.slice(0, m.index) + 'const metadata: Metadata = {' + text.slice(m.index + m[0].length)

  // 2. fermeture du bloc metadata : première ligne `}` ou `};` en colonne 0
  const lines = text.split('\n')
  let closeLine = -1
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if ((t === '}' || t === '};') && !lines[i].startsWith(' ')) { closeLine = i; break }
  }
  if (closeLine < 0) return { ok: false, reason: 'closing brace not found' }

  const genFn = `
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('${key}', metadata)
}
`
  lines.splice(closeLine + 1, 0, genFn)
  text = lines.join('\n')

  // 3. import du helper après le dernier import
  const imports = [...text.matchAll(/^import .*$/gm)]
  if (!imports.length) return { ok: false, reason: 'no imports' }
  const lastImport = imports[imports.length - 1]
  const importLine = `import { buildPageMetadata } from '@/lib/page-metadata'`
  if (text.includes("page-metadata'")) return { ok: false, reason: 'already migrated' }
  text = text.slice(0, lastImport.index + lastImport[0].length) + '\n' + importLine + text.slice(lastImport.index + lastImport[0].length)

  writeFileSync(file, text)
  return { ok: true }
}

function sqlEscape(v) { return v.replace(/'/g, "''") }

const files = listPages(APP).filter((f) => !SKIP_FILES.has(f.replaceAll('\\', '/')))
const mode = process.argv[2] || 'sql'
const doWrite = process.argv.includes('--write')

let rows = []
let transformed = 0
let skipped = []

for (const file of files) {
  const key = pageKey(file)
  const text = readFileSync(file, 'utf8')
  if (!text.includes('export const metadata: Metadata')) { skipped.push(`${key}: no static metadata`); continue }
  const blockStart = text.indexOf('export const metadata: Metadata')
  // fin du bloc : ligne `}`/`};` en col 0 après blockStart
  const after = text.slice(blockStart)
  const lines = after.split('\n')
  let closeLine = -1
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim()
    if ((t === '}' || t === '};') && !lines[i].startsWith(' ')) { closeLine = i; break }
  }
  const block = lines.slice(0, closeLine + 1).join('\n')
  const seo = extractSeo(block)
  if (!seo.title) { skipped.push(`${key}: no title parsed`); continue }

  rows.push({ key, title: seo.title, description: seo.description || '', image: seo.image || '/og-default.jpg' })

  if (mode === 'transform' && doWrite) {
    const r = transform(file, key)
    if (r.ok) transformed++
    else skipped.push(`${key}: ${r.reason}`)
  }
}

if (mode === 'sql') {
  const lines = []
  lines.push('-- ===========================================================================')
  lines.push('-- SEO metadata piloté par le CMS : title / description / og:image par page')
  lines.push('-- Généré par scripts/cms-seo-metadata.mjs — valeurs initiales = fallbacks du code')
  lines.push('-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.')
  lines.push('')
  lines.push('INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)')
  lines.push('VALUES')
  const parts = []
  for (const r of rows) {
    parts.push(`  ('${r.key}', 'seo_title', 'text', '${sqlEscape(r.title)}', 'SEO — title', true),`)
    parts.push(`  ('${r.key}', 'seo_description', 'textarea', '${sqlEscape(r.description)}', 'SEO — description', true),`)
    parts.push(`  ('${r.key}', 'seo_og_image', 'text', '${r.image}', 'SEO — image Open Graph', true),`)
  }
  lines.push(parts.join('\n').replace(/,\s*$/, ''))
  lines.push('ON CONFLICT (page, zone_key) DO UPDATE')
  lines.push('SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,')
  lines.push("    label = EXCLUDED.label, is_active = true, updated_at = NOW();")
  lines.push('')
  mkdirSync(join(OUT, '..'), { recursive: true })
  writeFileSync(OUT, lines.join('\n'))
  console.log(`${rows.length} pages -> ${OUT}`)
} else {
  console.log(`transformed: ${transformed}, skipped: ${skipped.length}`)
  if (skipped.length) console.log(skipped.join('\n'))
}
