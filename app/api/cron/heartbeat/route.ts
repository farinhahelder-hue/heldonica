export const dynamic = 'force-dynamic'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { verifyAiAuth } from '@/lib/ai-auth'

/**
 * /api/cron/heartbeat — le battement qui empêche deux pannes silencieuses.
 *
 * 1. Supabase (plan gratuit) met un projet en pause après 7 jours sans requête.
 *    Une simple lecture suffit à le maintenir éveillé.
 * 2. `agent_tasks` n'a pas de bail en base : une tâche prise par un worker mort
 *    resterait `in_progress` pour toujours. Le battement libère les baux expirés
 *    — c'est le filet de sécurité de /api/agent-tasks.
 *
 * Si la base ne répond pas, on renvoie 500 : la panne doit être visible dans
 * l'historique du workflow, pas avalée. Un battement vert alors que la base est
 * injoignable serait un mensonge — exactement ce qu'AGENTS.md interdit.
 */

const BAIL_MINUTES = 90

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** Même règle que /api/agent-tasks : un bail dépassé redevient prenable. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function libererBauxExpires(sb: any): Promise<number> {
  const limite = new Date(Date.now() - BAIL_MINUTES * 60_000).toISOString()
  const { data, error } = await sb
    .from('agent_tasks')
    .update({ status: 'sent', claimed_by: null, claimed_at: null, updated_at: new Date().toISOString() })
    .eq('status', 'in_progress')
    .lt('claimed_at', limite)
    .select('id,claimed_by,payload')
  if (error) {
    console.warn('[heartbeat] liberation des baux echouee :', error.message)
    return 0
  }
  if (!data || data.length === 0) return 0

  for (const t of data) {
    const ancien = t.payload && typeof t.payload === 'object' ? t.payload : {}
    const { error: errNote } = await sb
      .from('agent_tasks')
      .update({ payload: { ...ancien, bail_expire: { agent: t.claimed_by, at: new Date().toISOString() } } })
      .eq('id', t.id)
    if (errNote) console.warn('[heartbeat] note de bail echouee :', errNote.message)
  }
  return data.length
}

export async function GET(req: NextRequest) {
  const auth = await verifyAiAuth(req)
  if (!auth.ok) return auth.response

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  // La lecture qui garde le projet éveillé. Une seule ligne suffit.
  const { error: errReveil } = await sb.from('site_settings').select('key').limit(1)
  if (errReveil) {
    return NextResponse.json({ reveil: 'ko', error: errReveil.message }, { status: 500 })
  }

  const bauxLiberes = await libererBauxExpires(sb)

  const { count: enAttente, error: errCount } = await sb
    .from('agent_tasks')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'sent')
  if (errCount) console.warn('[heartbeat] comptage des taches echoue :', errCount.message)

  return NextResponse.json({
    reveil: 'ok',
    baux_liberes: bauxLiberes,
    taches_en_attente: enAttente ?? null,
    horodatage: new Date().toISOString(),
  })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
