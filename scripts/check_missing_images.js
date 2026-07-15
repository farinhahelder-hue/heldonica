const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const vars = {}
for (const line of envContent.split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i === -1) continue
  vars[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
}

const sb = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('=== AUDIT DES IMAGES MANQUANTES OU VIDES ===\n')

  // 1. Articles
  console.log('--- Table: articles ---')
  const { data: articles, error: errArt } = await sb.from('articles').select('id, title, slug, featured_image, category, destination')
  if (errArt) {
    console.error('Erreur articles:', errArt.message)
  } else {
    let emptyCount = 0
    let placeholderCount = 0
    
    articles.forEach(a => {
      const img = a.featured_image
      const isEmpty = !img || img.trim() === ''
      const isPlaceholder = img && (img.includes('placeholder') || img.includes('badges-heldonica') || img.includes('unsplash.com'))
      
      if (isEmpty || isPlaceholder) {
        if (isEmpty) emptyCount++
        else placeholderCount++
        console.log(`❌ Article: "${a.title}" (slug: ${a.slug})`)
        console.log(`   - Catégorie: ${a.category} | Destination: ${a.destination || '—'}`)
        console.log(`   - Image: ${img ? `"${img}" (Placeholder)` : 'VIDE'}`)
        console.log()
      }
    })
    console.log(`Bilan articles : ${articles.length} articles, ${emptyCount} vides, ${placeholderCount} placeholders.\n`)
  }

  // 2. Destinations
  console.log('--- Table: destinations ---')
  const { data: destinations, error: errDest } = await sb.from('destinations').select('*').limit(1)
  if (errDest) {
    console.error('Erreur destinations schema:', errDest.message)
  } else if (destinations && destinations[0]) {
    console.log('Colonnes destinations:', Object.keys(destinations[0]).join(', '))
    
    // Relancer la vraie requête de diagnostic avec les bonnes colonnes
    const titleCol = destinations[0].title !== undefined ? 'title' : (destinations[0].name !== undefined ? 'name' : 'id')
    const { data: dList } = await sb.from('destinations').select(`id, slug, featured_image, ${titleCol}`)
    
    if (dList) {
      let emptyCount = 0
      let placeholderCount = 0
      dList.forEach(d => {
        const img = d.featured_image
        const isEmpty = !img || img.trim() === ''
        const isPlaceholder = img && (img.includes('placeholder') || img.includes('badges-heldonica') || img.includes('unsplash.com'))
        if (isEmpty || isPlaceholder) {
          if (isEmpty) emptyCount++
          else placeholderCount++
          console.log(`❌ Destination: "${d[titleCol]}" (slug: ${d.slug})`)
          console.log(`   - Image: ${img ? `"${img}" (Placeholder)` : 'VIDE'}`)
          console.log()
        }
      })
      console.log(`Bilan destinations : ${dList.length} destinations, ${emptyCount} vides, ${placeholderCount} placeholders.\n`)
    }
  } else {
    console.log('Table destinations vide.')
  }
}

main().catch(console.error)
