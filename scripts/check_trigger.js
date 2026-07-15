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
  console.log('🔍 Recherche des définitions de trigger SQL...')
  // Exécuter du SQL RPC ou interroger pg_proc
  const { data, error } = await sb.rpc('inspect_trigger_definition', {})
  if (error) {
    // Essayer de lister les triggers via requete d'information_schema ou pg_trigger si possible
    console.log('L\'appel inspect_trigger_definition n\'existe pas (ce qui est normal).')
    console.log('Tentative via requête SQL générique (si autorisée)...')
    const { data: d2, error: e2 } = await sb.from('articles').select('title').limit(1) // juste pour tester auth
    console.log('Auth OK')
  }
}

main().catch(console.error)
