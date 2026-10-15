export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { verifyAiAuth } from '@/lib/ai-auth'
import { estDispatchable, brancheDe, brief, Tache } from '@/lib/registre-dispatch'

/**
 * /api/cron/dispatch-registre — transformer une tâche du registre en conversation.
 *
 * Le trou que comble cette route : `agent_tasks` sait ce qui est demandé, et
 * `agent-dispatch.yml` sait ouvrir une conversation — mais rien ne reliait les
 * deux. Une tâche déposée restait `sent` jusqu'à ce qu'un humain la lance.
 *
 * Ce qu'elle ne fait PAS, volontairement :
 *
 *   - elle ne dispatche pas `tous` (une tâche ouverte n'est pas un ordre) ;
 *   - elle ne prend pas la tâche à la place de l'agent : la conversation la
 *     prendra elle-même, et la prise est atomique. La pré-réserver ici
 *     reviendrait à bloquer un agent qui aurait été plus rapide.
 *
 * Le garde-fou anti-double est la trace `payload.dispatch` (cf.
 * lib/registre-dispatch.ts) : `libererBauxExpires` remet une tâche abandonnée en
 * `sent`, et sans cette trace elle serait relancée à chaque passage.
 *
 * Auth : `verifyAiAuth` (clé `hld_...`, clé maître, ou session CMS). Le workflow
 * GitHub appelle avec `x-api-key`, jamais avec la clé service.
 */

const QUOTA_CONVERSATIONS_ACTIVES = 5
const LIMITE_LECTURE = 200

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

type Resultat = {
  id: string
  titre: string
  lance: boolean
  conversation_id?: string
  conversation_url?: string
  raison?: string
}

/** Combien de conversations tournent déjà — pour ne pas dépasser le quota. */
async function conversationsActives(cle: string): Promise<number> {
  const r = await fetch('https://app.all-hands.dev/api/v1/app-conversations/search?limit=100', {
    headers: { Authorization: `Bearer ${cle}` },
    cache: 'no-store',
  })
  if (!r.ok) throw new Error(`recherche des conversations : HTTP ${r.status}`)
  const d = (await r.json()) as { items?: Array<{ execution_status?: string | null }> }
  return (d.items || []).filter((c) => c.execution_status === 'running').length
}

/** Ouvre une conversation et rend son identifiant, en suivant le start-task. */
async function ouvrirConversation(
  cle: string,
  t: Tache,
  siteUrl: string
): Promise<{ conversation_id: string; conversation_url?: string }> {
  const creer = await fetch('https://app.all-hands.dev/api/v1/app-conversations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      initial_message: { content: [{ type: 'text', text: brief(t, { siteUrl }) }] },
      selected_repository: 'farinhahelder-hue/heldonica',
      selected_branch: brancheDe(t),
      title: `[registre] ${(t.task || '').split('\n')[0].slice(0, 80)}`,
    }),
  })
  if (!creer.ok) {
    const texte = await creer.text()
    throw new Error(`ouverture : HTTP ${creer.status} — ${texte.slice(0, 200)}`)
  }
  let rep = (await creer.json()) as {
    id?: string
    app_conversation_id?: string
    conversation_ui_url?: string
  }

  // Le POST est asynchrone : il rend souvent un start-task dont l'id n'est PAS
  // l'identifiant de conversation. On suit le start-task jusqu'à READY.
  if (!rep.app_conversation_id && rep.id) {
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 5000))
      const suivi = await fetch(
        `https://app.all-hands.dev/api/v1/app-conversations/start-tasks?ids=${rep.id}`,
        { headers: { Authorization: `Bearer ${cle}` }, cache: 'no-store' }
      )
      if (!suivi.ok) continue
      const s = (await suivi.json()) as { items?: Array<Record<string, unknown>> }
      const item = (s.items || [])[0]
      if (!item) continue
      const etat = String(item.status || '')
      if (etat === 'READY' || item.app_conversation_id) {
        rep = {
          app_conversation_id: String(item.app_conversation_id || ''),
          conversation_ui_url: (item.conversation_ui_url as string) || undefined,
        }
        break
      }
      if (etat === 'ERROR' || etat === 'FAILED') {
        throw new Error(`start-task ${etat} : ${String(item.detail || '')}`)
      }
    }
  }

  const id = rep.app_conversation_id
  if (!id) throw new Error('conversation ouverte sans identifiant : impossible de tracer le dispatch')
  return { conversation_id: id, conversation_url: rep.conversation_ui_url }
}

async function dispatcher(req: NextRequest): Promise<NextResponse> {
  const auth = await verifyAiAuth(req)
  if (!auth.ok) {
    return auth.response ?? NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const cle = process.env.OPENHANDS_API_KEY?.trim() || process.env.OPENHANDS_CLOUD_API_KEY?.trim()
  if (!cle) {
    // Sans clé, on ne lance rien. On rend 200 avec un diagnostic : ce n'est pas
    // une panne de la route, c'est une configuration absente — et la tâche reste
    // `sent`, donc rien n'est perdu.
    return NextResponse.json({
      dispatch: 'inactif',
      raison: 'OPENHANDS_API_KEY absente : le registre est lu, mais rien ne peut être lancé.',
    })
  }

  const siteUrl = (process.env.SITE_URL || 'https://www.heldonica.fr').replace(/\/$/, '')
  // `?simuler=1` : dire ce qui partirait, sans rien lancer. Pour vérifier le
  // ciblage sans dépenser de conversation.
  const simuler = req.nextUrl.searchParams.get('simuler') === '1'

  const { data, error } = await sb
    .from('agent_tasks')
    .select('id,agent,status,task,scope,risk_level,depends_on,payload,claimed_by')
    .order('created_at', { ascending: true })
    .limit(LIMITE_LECTURE)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const taches = (data || []) as Tache[]
  const parId = new Map(taches.map((t) => [t.id, t]))
  const candidates = taches.filter((t) => estDispatchable(t, parId))

  if (candidates.length === 0) {
    return NextResponse.json({ dispatch: 'ok', lancees: [], echecs: [], simulation: simuler })
  }

  let actives: number
  try {
    actives = await conversationsActives(cle)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erreur inconnue'
    return NextResponse.json({ error: `quota indisponible : ${message}` }, { status: 502 })
  }

  const place = Math.max(0, QUOTA_CONVERSATIONS_ACTIVES - actives)
  const resultats: Resultat[] = []

  for (const t of candidates) {
    const titre = (t.task || '').split('\n')[0].slice(0, 60)
    if (simuler) {
      resultats.push({ id: t.id, titre, lance: false, raison: 'simulation' })
      continue
    }
    if (resultats.filter((r) => r.lance).length >= place) {
      resultats.push({ id: t.id, titre, lance: false, raison: 'quota de conversations actives atteint' })
      continue
    }
    try {
      const conv = await ouvrirConversation(cle, t, siteUrl)
      // La trace AVANT toute autre chose : c'est elle qui empêche un second
      // lancement si la suite échoue.
      const ancien = t.payload && typeof t.payload === 'object' ? (t.payload as object) : {}
      const { error: errTrace } = await sb
        .from('agent_tasks')
        .update({
          payload: {
            ...ancien,
            dispatch: { conversation_id: conv.conversation_id, at: new Date().toISOString() },
          },
        })
        .eq('id', t.id)
      if (errTrace) {
        // La conversation tourne mais n'est pas tracée : le prochain passage la
        // relancerait. On le dit, bruyamment — c'est un doublon en puissance.
        resultats.push({
          id: t.id,
          titre,
          lance: true,
          conversation_id: conv.conversation_id,
          raison: `TRACE ECHOUEE : ${errTrace.message} — risque de doublon`,
        })
        continue
      }
      resultats.push({
        id: t.id,
        titre,
        lance: true,
        conversation_id: conv.conversation_id,
        conversation_url: conv.conversation_url,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'erreur inconnue'
      resultats.push({ id: t.id, titre, lance: false, raison: message })
    }
  }

  return NextResponse.json({
    dispatch: 'ok',
    conversations_actives: actives,
    lancees: resultats.filter((r) => r.lance),
    echecs: resultats.filter((r) => !r.lance && r.raison !== 'simulation'),
    simulation: simuler,
    horodatage: new Date().toISOString(),
  })
}

export async function GET(req: NextRequest) {
  return dispatcher(req)
}

export async function POST(req: NextRequest) {
  return dispatcher(req)
}
