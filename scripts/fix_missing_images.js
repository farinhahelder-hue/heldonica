const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// 1. Charger .env.local
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

const UNSPLASH_ACCESS_KEY = vars.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || vars.UNSPLASH_APP_ID

// 2. Helper de recherche Unsplash
async function fetchUnsplashPhoto(query) {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('   ⚠️ Pas de clé Unsplash configurée, utilisation du fallback par défaut.')
    return null
  }
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`
    const res = await fetch(url, {
      headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    })
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`)
    const data = await res.json()
    if (data.results && data.results[0]) {
      return data.results[0].urls.regular
    }
  } catch (err) {
    console.error(`   ❌ Erreur Unsplash pour "${query}":`, err.message)
  }
  return null
}

// 3. Déterminer la requête idéale selon la destination / titre
function getSearchQuery(title, dest, category) {
  const t = title.toLowerCase()
  const d = (dest || '').toLowerCase()
  const cat = (category || '').toLowerCase()

  if (d.includes('madere') || d.includes('madère') || t.includes('madère') || t.includes('madere')) {
    if (t.includes('poncha')) return 'Madeira traditional drink poncha'
    if (t.includes('fanal')) return 'Madeira Fanal forest mist laurissilva'
    if (t.includes('bacalhau')) return 'portuguese cod dish bacalhau'
    return 'Madeira island landscape cliffs'
  }
  if (d.includes('suisse') || d.includes('switzerland') || t.includes('suisse') || t.includes('stoos') || t.includes('zurich')) {
    if (t.includes('stoos')) return 'Stoos Ridge switzerland lake view'
    if (t.includes('zurich') || t.includes('limmat')) return 'Zurich city Limmat river'
    return 'Swiss Alps landscape'
  }
  if (d.includes('roumanie') || d.includes('romania') || t.includes('roumanie') || t.includes('maramures') || t.includes('timisoara')) {
    if (t.includes('mocanita') || t.includes('train')) return 'Mocanita steam train romania'
    if (t.includes('timisoara') || t.includes('cuib')) return 'Timisoara city square romania'
    return 'Maramures wooden churches landscape romania'
  }
  if (d.includes('paris') || d.includes('france') || t.includes('paris') || t.includes('mouffetard')) {
    if (t.includes('mouffetard')) return 'Rue Mouffetard Paris street cafe'
    if (t.includes('ceinture')) return 'Petite Ceinture Paris abandoned railway green'
    return 'Paris streets seine landscape'
  }
  if (d.includes('montenegro') || d.includes('podgorica')) {
    return 'Podgorica city montenegro landscape'
  }
  if (d.includes('lisbonne') || d.includes('lisbon')) {
    return 'Lisbon Alfama street view'
  }
  if (d.includes('sicile') || d.includes('sicily')) {
    return 'Sicily landscape nature interior'
  }

  // Fallback général
  return `${cat} ${title}`.trim()
}

// 4. Exécution du correcteur
async function main() {
  console.log('=== DÉBUT CORRECTION IMAGES ===\n')

  // A. Corriger les destinations vides ou placeholder
  console.log('--- Traitement de la table: destinations ---')
  const { data: destinations } = await sb.from('destinations').select('*')
  
  if (destinations) {
    for (const d of destinations) {
      const img = d.featured_image
      const isEmpty = !img || img.trim() === ''
      const isPlaceholder = img && (img.includes('placeholder') || img.includes('unsplash.com/photo-1553877525') || img.includes('photo-1565008576549')) // les images Unsplash génériques et incorrectes que nous avons vues dans l'audit

      if (isEmpty || isPlaceholder) {
        const title = d.title || d.name
        const query = getSearchQuery(title, d.slug, 'landscape')
        console.log(`🔧 Destination à corriger: "${title}" (slug: ${d.slug})`)
        console.log(`   Recherche Unsplash pour: "${query}"...`)
        
        const newImg = await fetchUnsplashPhoto(query)
        if (newImg) {
          const { error } = await sb.from('destinations').update({ featured_image: newImg }).eq('id', d.id)
          if (error) {
            console.error(`   ❌ Erreur update destination: ${error.message}`)
          } else {
            console.log(`   ✅ Image mise à jour: ${newImg}`)
          }
        }
        console.log()
      }
    }
  }

  // B. Corriger les articles de blog vides ou incohérents
  console.log('--- Traitement de la table: cms_blog_posts ---')
  const { data: posts } = await sb.from('cms_blog_posts').select('*')

  if (posts) {
    for (const p of posts) {
      const img = p.featured_image
      const isEmpty = !img || img.trim() === ''
      // Détecter si l'article est pour Madère mais a une image de Roumanie/Maramures (le placeholder photo-1558618666-fcd25c85cd64)
      const isMismatched = img && (
        (p.slug.includes('madere') && img.includes('photo-1558618666-fcd25c85cd64')) ||
        (p.slug.includes('madeire') && img.includes('photo-1558618666-fcd25c85cd64'))
      )
      const isPlaceholder = img && img.includes('placeholder')

      if (isEmpty || isMismatched || isPlaceholder) {
        const query = getSearchQuery(p.title, p.destination || p.category, p.category)
        console.log(`🔧 Article à corriger: "${p.title}" (slug: ${p.slug})`)
        if (isMismatched) console.log(`   ⚠️ Décalage détecté (Image de Roumanie sur article de Madère) !`)
        console.log(`   Recherche Unsplash pour: "${query}"...`)

        const newImg = await fetchUnsplashPhoto(query)
        if (newImg) {
          const { error } = await sb.from('cms_blog_posts').update({ featured_image: newImg }).eq('id', p.id)
          if (error) {
            console.error(`   ❌ Erreur update article: ${error.message}`)
          } else {
            console.log(`   ✅ Image mise à jour: ${newImg}`)
            
            // Forcer la synchronisation avec articles en modifiant published_at ou en trigger applicatif
            const { data: updatedPost } = await sb.from('cms_blog_posts').select('*').eq('id', p.id).single()
            if (updatedPost) {
              const destMatch = updatedPost.voice_notes ? updatedPost.voice_notes.match(/Destination:\s*([^|\n]+)/i) : null;
              const dest = destMatch ? destMatch[1].trim() : null;
              await sb.from('articles').upsert({
                id: updatedPost.id,
                title: updatedPost.title,
                slug: updatedPost.slug,
                category: updatedPost.category,
                excerpt: updatedPost.excerpt,
                content: updatedPost.content,
                featured_image: updatedPost.featured_image,
                author: updatedPost.author,
                published: updatedPost.published,
                published_at: updatedPost.published_at,
                tags: updatedPost.tags || [],
                archived: false,
                seo_title: updatedPost.meta_title || updatedPost.title,
                seo_description: updatedPost.meta_description || updatedPost.excerpt || null,
                faq_content: updatedPost.faq_content,
                destination: dest,
                status: updatedPost.status,
              })
              console.log(`      (Synchronisé dans la table articles)`)
            }
          }
        }
        console.log()
      }
    }
  }

  console.log('=== FIN DU CORRECTEUR D\'IMAGES ===')
}

main().catch(console.error)
