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

// Mappeur de synchronisation global pour la table articles
async function syncArticle(postId) {
  const { data: updatedPost } = await sb.from('cms_blog_posts').select('*').eq('id', postId).single()
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
    console.log(`      (Synchronisé dans la table articles pour le slug: ${updatedPost.slug})`)
  }
}

async function main() {
  console.log('=== DEBUT DES MISES A JOUR BASE DE DONNEES ===\n')

  // --- 1. Normalisation des catégories (Incohérence #2) ---
  console.log('1. Normalisation des catégories...')
  const { data: postsForCat } = await sb.from('cms_blog_posts').select('id, category, title')
  if (postsForCat) {
    for (const p of postsForCat) {
      let newCat = p.category
      if (p.category.toLowerCase().includes('carnets de voyage') || p.category.toLowerCase().includes('carnet de voyage') || p.category.toLowerCase() === 'carnet de voyages') {
        newCat = 'Carnets Voyage'
      } else if (p.category.toLowerCase().includes('découvertes locales') || p.category.toLowerCase().includes('decouverte locale')) {
        newCat = 'Découvertes Locales'
      } else if (p.category.toLowerCase().includes('guides pratiques') || p.category.toLowerCase().includes('guide pratique')) {
        newCat = 'Guides Pratiques'
      } else if (p.category.toLowerCase().includes('food')) {
        newCat = 'Food & Lifestyle'
      }
      
      if (newCat !== p.category) {
        console.log(`   - Article "${p.title}" : "${p.category}" -> "${newCat}"`)
        await sb.from('cms_blog_posts').update({ category: newCat }).eq('id', p.id)
        await syncArticle(p.id)
      }
    }
  }
  console.log()

  // --- 2. Article Maramureș : Correction de l'image (Incohérence #3) ---
  console.log('2. Image Maramureș (campagne / bois roumain)...')
  const { data: postsForMaramures } = await sb.from('cms_blog_posts')
    .select('id, slug, title')
    .or('slug.eq.maramures-roumanie-authentique,slug.eq.maramures-train-moitie-siecle')
  
  const niceRomaniaImage = 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=1200&q=80' // Belle église en bois roumaine de campagne
  if (postsForMaramures) {
    for (const p of postsForMaramures) {
      console.log(`   - Mise à jour image pour: "${p.title}"`)
      await sb.from('cms_blog_posts').update({ featured_image: niceRomaniaImage }).eq('id', p.id)
      await syncArticle(p.id)
    }
  }
  console.log()

  // --- 3. Destination Monténégro : Baie de Kotor (Incohérence #4) ---
  console.log('3. Image Monténégro (Baie de Kotor)...')
  const kotorImage = 'https://images.unsplash.com/photo-1555992336-03a23c7b20eb?w=1200&q=80' // Superbe baie de Kotor, adriatique
  const { error: errDest } = await sb.from('destinations')
    .update({ featured_image: kotorImage })
    .or('slug.eq.montenegro,slug.eq.montenegro-podgorica')
  if (errDest) {
    console.error('   ❌ Erreur update destination Monténégro:', errDest.message)
  } else {
    console.log('   ✅ Cartes de destination Monténégro mises à jour avec Kotor.')
  }
  console.log()

  // --- 4. Podgorica article slug (Incohérence #5) ---
  console.log('4. Alignement du slug Podgorica...')
  // Rechercher l'article Podgorica existant
  const { data: podgoricaPosts } = await sb.from('cms_blog_posts')
    .select('id, slug, title')
    .ilike('title', '%podgorica%')

  if (podgoricaPosts && podgoricaPosts.length > 0) {
    const targetSlug = 'podgorica-capitale-oubliee-montenegro'
    for (const p of podgoricaPosts) {
      if (p.slug !== targetSlug) {
        console.log(`   - Correction du slug pour "${p.title}" : "${p.slug}" -> "${targetSlug}"`)
        
        // Supprimer d'abord l'ancien article dans la table de destination/articles publique pour éviter le doublon d'upsert
        await sb.from('articles').delete().eq('slug', p.slug)
        
        // Mettre à jour le CMS
        await sb.from('cms_blog_posts').update({ slug: targetSlug }).eq('id', p.id)
        
        // Synchroniser
        await syncArticle(p.id)
      }
    }
  } else {
    console.log('   ⚠️ Aucun article Podgorica trouvé pour modifier le slug.')
  }
  console.log()

  // --- 5. Article Zurich : suppression du tag "paris" (Incohérence #8) ---
  console.log('5. Nettoyage tag "paris" de Zurich...')
  const { data: zurichPosts } = await sb.from('cms_blog_posts')
    .select('id, slug, tags, title')
    .ilike('slug', '%zurich%')

  if (zurichPosts) {
    for (const p of zurichPosts) {
      if (p.tags && p.tags.includes('paris')) {
        const newTags = p.tags.filter(t => t !== 'paris')
        console.log(`   - Retrait du tag "paris" de l'article: "${p.title}"`)
        await sb.from('cms_blog_posts').update({ tags: newTags }).eq('id', p.id)
        await syncArticle(p.id)
      }
    }
  }
  console.log()

  // --- 6. Article Zurich : "en famille" -> "en duo" (Incohérence #9) ---
  console.log('6. Correction texte "en famille" -> "en duo" dans l\'article Zurich...')
  const { data: zurichTextPosts } = await sb.from('cms_blog_posts')
    .select('id, slug, content, title')
    .ilike('slug', '%zurich%')

  if (zurichTextPosts) {
    for (const p of zurichTextPosts) {
      if (p.content && p.content.includes('en famille')) {
        const newContent = p.content.replace(/en famille/g, 'en duo')
        console.log(`   - Reformulation du texte de l'article: "${p.title}"`)
        await sb.from('cms_blog_posts').update({ content: newContent }).eq('id', p.id)
        await syncArticle(p.id)
      }
    }
  }
  console.log()

  console.log('=== TOUTES LES MISES A JOUR DB SONT TERMINEES ===')
}

main().catch(console.error)
