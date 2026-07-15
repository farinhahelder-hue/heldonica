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

const UNSPLASH_ACCESS_KEY = vars.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || vars.UNSPLASH_APP_ID
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// 2. Helper de recherche Unsplash
async function fetchUnsplashPhoto(query, fallbackQuery = 'travel landscape') {
  if (!UNSPLASH_ACCESS_KEY) return null
  await sleep(600) // Pause pour éviter d'être bloqué par Unsplash
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
    
    // Si aucun résultat, tenter le query de secours
    if (fallbackQuery && query !== fallbackQuery) {
      console.log(`   ⚠️ Aucun résultat pour "${query}", essai avec le fallback: "${fallbackQuery}"`)
      return await fetchUnsplashPhoto(fallbackQuery, null)
    }
  } catch (err) {
    console.error(`   ❌ Erreur Unsplash pour "${query}":`, err.message)
  }
  return null
}

function getSearchQuery(title, dest, category) {
  const t = title.toLowerCase()
  const d = (dest || '').toLowerCase()
  const cat = (category || '').toLowerCase()

  if (d.includes('madere') || d.includes('madère') || t.includes('madère') || t.includes('madere')) {
    if (t.includes('poncha')) return 'Madeira traditional drink poncha'
    if (t.includes('fanal')) return 'Madeira Fanal forest mist laurissilva'
    if (t.includes('bacalhau')) return 'portuguese cod dish'
    if (t.includes('bolo')) return 'traditional bread madeira'
    if (t.includes('prego')) return 'beef sandwich portugal'
    return 'Madeira island landscape cliffs'
  }
  if (d.includes('suisse') || d.includes('switzerland') || t.includes('suisse') || t.includes('stoos') || t.includes('zurich')) {
    if (t.includes('stoos')) return 'Stoos switzerland mountain'
    if (t.includes('zurich') || t.includes('limmat')) return 'Zurich city Limmat'
    return 'Swiss Alps landscape'
  }
  if (d.includes('roumanie') || d.includes('romania') || t.includes('roumanie') || t.includes('maramures') || t.includes('timisoara')) {
    if (t.includes('mocanita') || t.includes('train')) return 'steam train romania'
    if (t.includes('timisoara') || t.includes('cuib')) return 'Timisoara city romania'
    return 'Maramures wooden churches romania'
  }
  if (d.includes('paris') || d.includes('france') || t.includes('paris') || t.includes('mouffetard')) {
    if (t.includes('mouffetard')) return 'Rue Mouffetard Paris street'
    if (t.includes('ceinture')) return 'Petite Ceinture Paris abandoned'
    return 'Paris streets seine'
  }
  if (d.includes('montenegro') || d.includes('podgorica')) {
    return 'Podgorica city montenegro'
  }
  if (d.includes('lisbonne') || d.includes('lisbon')) {
    return 'Lisbon Alfama street'
  }
  if (d.includes('sicile') || d.includes('sicily')) {
    return 'Sicily landscape nature'
  }

  // Fallback général
  return `${cat} ${title}`.trim()
}

async function main() {
  console.log('=== REMPLACEMENT DE TOUTES LES IMAGES PLACEHOLDERS ===\n')

  // A. Destinations
  console.log('--- Destinations ---')
  const { data: destinations } = await sb.from('destinations').select('*')
  if (destinations) {
    for (const d of destinations) {
      const title = d.title || d.name
      const query = getSearchQuery(title, d.slug, 'landscape')
      console.log(`🔧 Mise à jour de la destination: "${title}" (slug: ${d.slug})`)
      console.log(`   Query: "${query}"`)
      
      const newImg = await fetchUnsplashPhoto(query)
      if (newImg) {
        const { error } = await sb.from('destinations').update({ featured_image: newImg }).eq('id', d.id)
        if (error) {
          console.error(`   ❌ Erreur update: ${error.message}`)
        } else {
          console.log(`   ✅ Image mise à jour: ${newImg}`)
        }
      }
      console.log()
    }
  }

  // B. Articles de blog
  console.log('--- Articles de Blog ---')
  const { data: posts } = await sb.from('cms_blog_posts').select('*')
  if (posts) {
    for (const p of posts) {
      const img = p.featured_image
      // Remplacer si l'image est vide ou contient unsplash.com (pour forcer une photo ultra-spécifique pour chaque titre)
      const isPlaceholder = !img || img.trim() === '' || img.includes('placeholder') || img.includes('unsplash.com')

      if (isPlaceholder) {
        const query = getSearchQuery(p.title, p.destination || p.category, p.category)
        console.log(`🔧 Mise à jour de l'article: "${p.title}" (slug: ${p.slug})`)
        console.log(`   Query: "${query}"`)

        const newImg = await fetchUnsplashPhoto(query)
        if (newImg) {
          const { error } = await sb.from('cms_blog_posts').update({ featured_image: newImg }).eq('id', p.id)
          if (error) {
            console.error(`   ❌ Erreur update: ${error.message}`)
          } else {
            console.log(`   ✅ Image mise à jour: ${newImg}`)
            
            // Synchroniser avec la table articles
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

  console.log('=== FIN DU TRAITEMENT ===')
}

main().catch(console.error)
