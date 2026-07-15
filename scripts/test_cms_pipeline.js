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

const TEST_SLUG = 'validation-test-cms-100-editable'

async function main() {
  console.log('=== LANCEMENT DU TEST DU PIPELINE CMS ===\n')

  // Nettoyage de sécurité préalable
  await sb.from('cms_blog_posts').delete().eq('slug', TEST_SLUG)
  await sb.from('articles').delete().eq('slug', TEST_SLUG)

  // 1. Insertion en mode Draft
  console.log('1. Insertion en draft de l\'article test dans cms_blog_posts...')
  const testPayload = {
    title: 'Test CMS Editable',
    slug: TEST_SLUG,
    excerpt: 'Ceci est un extrait de test.',
    content: '<p>Contenu de test pour validation du pipeline CMS.</p>',
    category: 'Carnets Voyage',
    author: 'Heldonica Test',
    published: false,
    featured_image: '/images/uploads/test.jpg',
    meta_title: 'SEO Title Test',
    meta_description: 'SEO Description Test',
    tags: ['test-tag-1', 'test-tag-2'],
    published_at: new Date().toISOString(),
    status: 'draft',
    faq_content: [{ question: 'Q1', answer: 'A1' }],
    show_map: true,
    featured: true,
    voice_notes: 'Destination: Suisse | Notes vocales',
  }

  const { data: insertedCms, error: insertErr } = await sb
    .from('cms_blog_posts')
    .insert([testPayload])
    .select()
    .single()

  if (insertErr) {
    console.error('❌ Erreur insertion cms_blog_posts:', insertErr.message)
    return
  }
  console.log('   ✅ OK : Article créé dans cms_blog_posts')

  // Attendre 1s pour laisser le trigger SQL tourner
  await new Promise(r => setTimeout(r, 1000))

  // 2. Vérifier si le trigger a synchronisé dans articles
  console.log('\n2. Vérification de la synchronisation automatique (trigger/articles) en draft...')
  const { data: articlesDraft, error: getErr } = await sb
    .from('articles')
    .select('*')
    .eq('slug', TEST_SLUG)
    .single()

  if (getErr) {
    console.log('   ℹ️ (Note: si getErr est une 406/404, le trigger filtre peut-être sur published=true, vérifions...)')
    console.log('   articles select error:', getErr.message)
  } else {
    console.log('   ✅ OK : Article synchronisé dans la table publique articles !')
    console.log('   Détails articles :')
    console.log(`     - published: ${articlesDraft.published}`)
    console.log(`     - seo_title: "${articlesDraft.seo_title}"`)
    console.log(`     - seo_description: "${articlesDraft.seo_description}"`)
    console.log(`     - destination: "${articlesDraft.destination}"`)
  }

  // 3. Passage à published = true
  console.log('\n3. Mise à jour de l\'article en published = true dans cms_blog_posts...')
  const { error: updateErr } = await sb
    .from('cms_blog_posts')
    .update({ published: true, status: 'published' })
    .eq('slug', TEST_SLUG)

  if (updateErr) {
    console.error('❌ Erreur update cms_blog_posts:', updateErr.message)
    return
  }
  console.log('   ✅ OK : Statut mis à jour')

  // Attendre 1s
  await new Promise(r => setTimeout(r, 1000))

  // 4. Vérifier la table articles après publication
  console.log('\n4. Vérification finale dans la table articles...')
  const { data: articlesPub, error: getPubErr } = await sb
    .from('articles')
    .select('*')
    .eq('slug', TEST_SLUG)
    .single()

  if (getPubErr) {
    console.error('❌ Erreur récupération article publié:', getPubErr.message)
  } else {
    console.log('   ✅ OK : Article publié récupéré !')
    console.log('   Détails articles publiés :')
    console.log(`     - published: ${articlesPub.published} (Attendu: true)`)
    console.log(`     - seo_title: "${articlesPub.seo_title}" (Attendu: "SEO Title Test")`)
    console.log(`     - seo_description: "${articlesPub.seo_description}" (Attendu: "SEO Description Test")`)
    console.log(`     - destination: "${articlesPub.destination}" (Attendu: "Suisse")`)
    console.log(`     - show_map: ${articlesPub.show_map} (si existant dans articles)`)
  }

  // 5. Nettoyage
  console.log('\n5. Nettoyage de l\'article de test...')
  await sb.from('cms_blog_posts').delete().eq('slug', TEST_SLUG)
  await sb.from('articles').delete().eq('slug', TEST_SLUG)
  console.log('   ✅ OK : Données nettoyées')
}

main().catch(console.error)
