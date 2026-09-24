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

const DRAFTS = [
  'bacalhau-a-lagareiro',
  'bolo-do-caco-recette-traditionnelle-de-madere-3',
  'prego-no-bolo-do-caco',
  'petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten-pleines-de-proteines-et-meme-vegetariennes',
  'les-meilleures-brasseries-authentiques-de-zurich-guide-2025'
]

async function main() {
  console.log('=== VERIFICATION DES BROUILLONS ===\n')
  for (const slug of DRAFTS) {
    const { data } = await sb.from('cms_blog_posts').select('published, status').eq('slug', slug).single()
    if (data) {
      console.log(`Slug: ${slug} -> published = ${data.published}, status = ${data.status}`)
    } else {
      console.log(`Slug: ${slug} -> INEXISTANT`)
    }
  }
}

main().catch(console.error)
