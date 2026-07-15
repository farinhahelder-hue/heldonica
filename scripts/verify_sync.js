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

const LOT_1 = [
  'stoos-ridge-notre-aventure-sur-la-crete-panoramique',
  'flotter-sur-la-limmat-a-zurich-notre-aventure-dete',
  'zurich',
  'madere-slow-travel-guide',
  'check-list-pour-randonnee-en-famille-en-montagne'
]

async function main() {
  console.log('=== VERIFICATION TABLES SUPABASE ===\n')

  for (const slug of LOT_1) {
    console.log(`Checking slug: ${slug}`)
    const { data: cmsPost, error: cmsErr } = await sb.from('cms_blog_posts').select('published, status').eq('slug', slug).single()
    const { data: pubPost, error: pubErr } = await sb.from('articles').select('published, title').eq('slug', slug).single()

    if (cmsErr) {
      console.log(`  cms_blog_posts: ERREUR (${cmsErr.message})`)
    } else {
      console.log(`  cms_blog_posts: published = ${cmsPost.published}, status = ${cmsPost.status}`)
    }

    if (pubErr) {
      console.log(`  articles: ERREUR (${pubErr.message})`)
    } else {
      console.log(`  articles: published = ${pubPost.published}, title = "${pubPost.title}"`)
    }
    console.log()
  }
}

main().catch(console.error)
