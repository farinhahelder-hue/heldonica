export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { verifyAiAuth } from '@/lib/ai-auth'
import {
  decisionCloture,
  conversationTracee,
  compteRendu,
  Conversation,
  TacheCloturable,
} from '@/lib/registre-cloture'

/**
 * /api/cron/cloture-registre — fermer la boucle du registre.
 *
 * Le dispatch ouvre une conversation ; cette route constate qu'elle s'est
 * arrêtée et écrit le compte rendu dans `agent_tasks`. Sans elle, l'agent doit
 * penser à clore lui-même, et une conversation qui meurt sans rendre compte
 * laisse sa tâche `in_progress` jusqu'à l'expiration du bail — puis relancée.
 *
 * GARDE-FOU CENTRAL (AGENTS.md) : le statut posé est TOUJOURS
 * `waiting_validation`, jamais `done`. Une conversation arrêtée et une PR qui
 * existe ne prouvent pas qu'un test a tourné. Le statut `done` exige des preuves
 * mesurées, et c'est un humain qui le pose.
 *
 * La route ne touche QUE les tâches qu'elle a elle-même dispatchées (trace
 * `payload.dispatch`) : une tâche prise à la main ne doit pas être close sous les
 * pieds de l'humain qui la suit.
 *
 * Auth : `verifyAiAuth`. Le workflow appelle avec `x-api-key`.
 */

const LIMITE_LECTURE = 200
const REPO = 'farinhahelder-hue/heldonica'

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/**
 * Récupère des conversations par identifiant.
 *
 * Deux détails mesurés contre l'API, pas supposés :
 *   - les ids se répètent (`?ids=a&ids=b`) : une liste séparée par des virgules
 *     rend zéro résultat ;
 *   - la réponse est un TABLEAU JSON brut, pas un objet `{ items: [...] }`.
 */
async function lireConversations(cle: string, ids: string[]): Promise<Map<string, Conversation>> {
  const sortie = new Map<string, Conversation>()
  for (let i = 0; i < ids.length; i += 25) {
    const lot = ids.slice(i, i + 25)
    const url = new URL('https://app.all-hands.dev/api/v1/app-conversations')
    for (const id of lot) url.searchParams.append('ids', id)
    const r = await fetch(url, { headers: { Authorization: `Bearer ${cle}` }, cache: 'no-store' })
    if (!r.ok) throw new Error(`lecture des conversations : HTTP ${r.status}`)
    const d = (await r.json()) as Conversation[] | { items?: Conversation[] }
    const items = Array.isArray(d) ? d : d.items || []
    for (const c of items) if (c && c.id) sortie.set(c.id, c)
  }
  return sortie
}

async function cloturer(req: NextRequest): Promise<NextResponse> {
  const auth = await verifyAiAuth(req)
  if (!auth.ok) {
    return auth.response ?? NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const cle = process.env.OPENHANDS_API_KEY?.trim() || process.env.OPENHANDS_CLOUD_API_KEY?.trim()
  if (!cle) {
    return NextResponse.json({
      cloture: 'inactif',
      raison: "OPENHANDS_API_KEY absente : impossible de lire l'état des conversations.",
    })
  }

  const { data, error } = await sb
    .from('agent_tasks')
    .select('id,status,task,claimed_by,payload')
    .in('status', ['sent', 'in_progress'])
    .limit(LIMITE_LECTURE)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const taches = (data || []) as TacheCloturable[]
  const parConversation = new Map<string, TacheCloturable>()
  for (const t of taches) {
    const cid = conversationTracee(t)
    if (cid) parConversation.set(cid, t)
  }

  if (parConversation.size === 0) {
    return NextResponse.json({ cloture: 'ok', closes: [], en_attente: 0, examinees: taches.length })
  }

  let conversations: Map<string, Conversation>
  try {
    conversations = await lireConversations(cle, [...parConversation.keys()])
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erreur inconnue'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const maintenant = new Date()
  const closes: Array<Record<string, unknown>> = []
  let enAttente = 0

  for (const [cid, t] of parConversation) {
    const conv = conversations.get(cid) || null
    const d = decisionCloture(t, conv, maintenant)
    if (!d.clore || !conv) {
      enAttente++
      continue
    }
    const cr = compteRendu(t, conv, { repo: REPO })
    const { error: errEcriture } = await sb
      .from('agent_tasks')
      .update({
        status: cr.status,
        description: cr.description,
        actions_done: cr.actions_done,
        notes: cr.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', t.id)
    if (errEcriture) {
      // On ne prétend pas avoir clos : l'échec est visible, la tâche reste
      // ouverte, et le prochain passage réessaiera.
      closes.push({ id: t.id, conversation_id: cid, close: false, erreur: errEcriture.message })
      continue
    }
    closes.push({
      id: t.id,
      conversation_id: cid,
      close: true,
      statut: cr.status,
      prs: (conv.pr_number as number[]) || [],
      resume: (t.task || '').split('\n')[0].slice(0, 60),
    })
  }

  return NextResponse.json({
    cloture: 'ok',
    examinees: taches.length,
    avec_conversation: parConversation.size,
    closes,
    en_attente: enAttente,
    horodatage: maintenant.toISOString(),
  })
}

export async function GET(req: NextRequest) {
  return cloturer(req)
}

export async function POST(req: NextRequest) {
  return cloturer(req)
}
