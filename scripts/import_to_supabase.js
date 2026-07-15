#!/usr/bin/env node
/**
 * import_to_supabase.js
 * Heldonica — Pipeline d'import des articles salvagés WordPress → Supabase
 *
 * Usage :
 *   node scripts/import_to_supabase.js
 *
 * Prérequis :
 *   - NEXT_PUBLIC_SUPABASE_URL dans .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY dans .env.local
 *   - `npm install @supabase/supabase-js gray-matter`
 *
 * Le script lit content/salvaged/*.md, parse le frontmatter YAML,
 * nettoie le HTML Gutenberg, et insère dans cms_blog_posts.
 * Le trigger trigger_sync_to_articles propage automatiquement vers la table `articles`.
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const matter = require('gray-matter')

// ─── Chargement des variables d'environnement ──────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Mapping catégories WordPress → Heldonica ──────────────────────────────
const CATEGORY_MAP = {
  'destinations': 'Carnets Voyage',
  'destination': 'Carnets Voyage',
  'europe': 'Carnets Voyage',
  'suisse': 'Carnets Voyage',
  'portugal': 'Carnets Voyage',
  'roumanie': 'Carnets Voyage',
  'guides pratiques': 'Guides Pratiques',
  'guide pratique': 'Guides Pratiques',
  'slow travel': 'Guides Pratiques',
  'checklist': 'Guides Pratiques',
  'food & lifestyle': 'Food & Lifestyle',
  'food lifestyle': 'Food & Lifestyle',
  'recettes': 'Food & Lifestyle',
  'découvertes locales': 'Découvertes Locales',
  'decouvertes locales': 'Découvertes Locales',
  'paris': 'Découvertes Locales',
  'travel': 'Carnets Voyage',
}

function mapCategory(raw) {
  if (!raw) return 'Carnets Voyage'
  const lower = raw.toLowerCase().trim()
  return CATEGORY_MAP[lower] || raw
}

// ─── Nettoyage HTML Gutenberg ───────────────────────────────────────────────
function cleanHtml(html) {
  if (!html) return ''
  return html
    // Supprimer les commentaires Gutenberg
    .replace(/<!--\s*\/?wp:[^>]*-->/g, '')
    // Corriger les 'n' parasites en début de ligne (artefact de l'extraction SQL)
    .replace(/^n/gm, '')
    .replace(/\nn(?=<)/g, '\n')
    // Normaliser les sauts de ligne multiples
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ─── Parsing des tags (Python list → JS array) ─────────────────────────────
function parseTags(raw) {
  if (!raw) return []
  // Si c'est déjà un tableau JS (gray-matter le parse)
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean)
  // Si c'est une chaîne style Python : "['tag1', 'tag2']"
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/^\[|\]$/g, '').replace(/['"]/g, '')
    return cleaned.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

// ─── Mapping slug → catégorie destination ──────────────────────────────────
function inferDestination(slug, category) {
  const s = slug.toLowerCase()
  if (s.includes('zurich') || s.includes('limmat') || s.includes('stoos')) return 'Suisse'
  if (s.includes('madere') || s.includes('madère') || s.includes('bolo') || s.includes('bacalhau') || s.includes('prego')) return 'Madère'
  if (s.includes('timisoara') || s.includes('roumanie') || s.includes('cuib')) return 'Roumanie'
  if (s.includes('paris') || s.includes('mouffetard') || s.includes('ceinture') || s.includes('urbex')) return 'France'
  if (s.includes('podgorica') || s.includes('montenegro')) return 'Monténégro'
  if (s.includes('balkans')) return 'Balkans'
  return null
}

// ─── Pipeline principal ────────────────────────────────────────────────────
async function main() {
  const salvageDir = path.join(__dirname, '..', 'content', 'salvaged')

  if (!fs.existsSync(salvageDir)) {
    console.error(`❌ Dossier introuvable : ${salvageDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(salvageDir).filter(f => f.endsWith('.md'))
  console.log(`\n📂 ${files.length} fichiers Markdown trouvés dans content/salvaged/\n`)

  const results = { ok: [], skipped: [], errors: [] }

  for (const file of files) {
    const filePath = path.join(salvageDir, file)
    const raw = fs.readFileSync(filePath, 'utf-8')

    let parsed
    try {
      parsed = matter(raw)
    } catch (e) {
      console.error(`  ⚠️  Erreur parsing frontmatter : ${file}`)
      results.errors.push({ file, error: e.message })
      continue
    }

    const fm = parsed.data
    const bodyHtml = cleanHtml(parsed.content)

    // Ignorer les stubs sans contenu réel
    if (!bodyHtml || bodyHtml.length < 200) {
      console.log(`  ⏩ SKIP (contenu trop court) : ${file}`)
      results.skipped.push(file)
      continue
    }

    const slug = fm.slug || file.replace('.md', '')
    const title = fm.title || slug
    const category = mapCategory(fm.category)
    const tags = parseTags(fm.tags)
    const destination = inferDestination(slug, category)

    // Date de publication : convertir en ISO si besoin
    let publishedAt = null
    if (fm.published_at) {
      try {
        publishedAt = new Date(fm.published_at).toISOString()
      } catch {
        publishedAt = new Date().toISOString()
      }
    }

    // Nettoyage sémantique : termes interdits
    let cleanedContent = bodyHtml
      .replace(/bons plans/gi, 'pépites dénichées')
      .replace(/bons-plans/gi, 'pépites-dénichées')
      .replace(/organisation de séjour/gi, 'conception sur mesure')
      .replace(/organiser votre séjour/gi, 'concevoir votre voyage sur mesure')

    // Nettoyage excerpt (premier <p> non vide)
    const firstPMatch = cleanedContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    const excerpt = firstPMatch
      ? firstPMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 300)
      : ''

    // Image mise en avant : nettoyer le chemin relatif si besoin
    let featuredImage = fm.featured_image || null
    if (featuredImage && featuredImage.startsWith('/images/')) {
      // Laisser tel quel — sera résolu via Supabase Storage ou CDN
    }

    const record = {
      title,
      slug,
      category,
      excerpt: excerpt || null,
      content: cleanedContent,
      featured_image: featuredImage,
      author: 'Heldonica',
      published: false,       // ← à publier manuellement depuis le CMS après relecture
      published_at: publishedAt,
      tags,
      // Champs SEO Rank Math mappés sur les vraies colonnes du schéma
      meta_title: fm.seo_title || title,
      meta_description: fm.seo_description || excerpt || null,
      // Mémo destination stocké dans voice_notes (colonne libre)
      voice_notes: inferDestination(slug, category)
        ? `Destination: ${inferDestination(slug, category)}${fm.seo_keywords ? ' | kw: ' + fm.seo_keywords : ''}`
        : (fm.seo_keywords ? `kw: ${fm.seo_keywords}` : null),
      status: 'draft',
    }

    console.log(`  ↑ Import : ${title.slice(0, 60)}...`)
    console.log(`    slug: ${slug} | cat: ${category} | dest: ${destination || '—'} | tags: ${tags.length}`)

    const { error } = await supabase
      .from('cms_blog_posts')
      .upsert(record, { onConflict: 'slug' })

    if (error) {
      console.error(`  ❌ Erreur Supabase : ${error.message}`)
      results.errors.push({ file, error: error.message })
    } else {
      console.log(`  ✅ OK`)
      results.ok.push(slug)
    }
  }

  // ─── Rapport final ────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════')
  console.log(`  RAPPORT D'IMPORT`)
  console.log('══════════════════════════════════════════')
  console.log(`  ✅ Importés  : ${results.ok.length}`)
  console.log(`  ⏩ Ignorés   : ${results.skipped.length}`)
  console.log(`  ❌ Erreurs   : ${results.errors.length}`)

  if (results.ok.length > 0) {
    console.log('\n  Articles importés (published = false, à activer dans le CMS) :')
    results.ok.forEach(s => console.log(`    – /blog/${s}`))
  }

  if (results.errors.length > 0) {
    console.log('\n  Erreurs :')
    results.errors.forEach(e => console.log(`    – ${e.file} : ${e.error}`))
  }

  console.log('\n  Le trigger trigger_sync_to_articles a propagé vers la table `articles`.')
  console.log('  Rendez-vous dans le CMS pour activer published = true sur chaque article.\n')
}

main().catch(err => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})
