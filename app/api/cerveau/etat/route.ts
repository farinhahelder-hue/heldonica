// ============================================================
// /api/cerveau/etat — l'état du projet, en quelques lignes, pour le Cerveau du Poco
//
// GET, authentifié comme /api/agent-tasks (session CMS du téléphone ou clé
// hld_). Lecture seule. Le résumé est fait par lib/cerveau-etat.ts.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAiAuth } from '@/lib/ai-auth'
import { resumerEtat } from '@/lib/cerveau-etat'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await verifyAiAuth(req)
  if (!auth.ok) return auth.response

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })
  const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  const [articles, instagram, taches] = await Promise.all([
    sb.from('cms_blog_posts').select('slug,title,status,published,scheduled_publish_at').limit(1000),
    sb.from('instagram_scheduled_posts').select('status,scheduled_at,caption').neq('status', 'published').limit(500),
    sb.from('agent_tasks').select('agent,status,task,scope').neq('status', 'done').limit(1000),
  ])
  const erreur = articles.error || instagram.error || taches.error
  if (erreur) return NextResponse.json({ error: erreur.message }, { status: 500 })

  const etat = resumerEtat({
    maintenant: new Date(),
    articles: articles.data ?? [],
    instagram: instagram.data ?? [],
    taches: taches.data ?? [],
  })
  return NextResponse.json({ ...etat, genere_le: new Date().toISOString() })
}
