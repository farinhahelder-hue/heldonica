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
  console.log('\n🔍 Inspection cms_blog_posts...')
  const { data, error } = await sb.from('cms_blog_posts').select('*').limit(1)
  if (error) {
    console.error('Erreur select:', error.message)
    return
  }
  if (data && data[0]) {
    console.log('Colonnes existantes:', Object.keys(data[0]).join(', '))
    return
  }
  console.log('Table vide — test insert minimal')
  const { error: e2 } = await sb.from('cms_blog_posts').insert({ title: '__TEST__', slug: '__schema-test-delete-me__' })
  if (e2) {
    console.log('Erreur insert minimal:', e2.message)
    return
  }
  const { data: d2 } = await sb.from('cms_blog_posts').select('*').eq('slug', '__schema-test-delete-me__')
  if (d2 && d2[0]) {
    console.log('Colonnes existantes:', Object.keys(d2[0]).join(', '))
    await sb.from('cms_blog_posts').delete().eq('slug', '__schema-test-delete-me__')
    console.log('(test supprimé)')
  }
}

main().catch(console.error)
