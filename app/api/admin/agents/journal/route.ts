// ============================================================
// /api/admin/agents/journal — le journal des tâches d'agents, pour la console
//
// Deux sources, deux rôles (voir AGENTS.md, « Deux journaux, deux rôles ») :
//
//   - `agent_task_events` : la VÉRITÉ SYSTÈME. Tout changement de `agent_tasks`,
//     écrit par un trigger en base. Non contournable : même un `UPDATE` lancé à
//     la main au SQL Editor y passe. C'est la source qui fait foi.
//   - `v_agent_governance` : la vue agrégée (agent × scope × risque × statut),
//     présente en base depuis le 2026-09-03 sans qu'aucune ligne de code ne la
//     lise. Elle donne la photo d'ensemble sans refaire les `GROUP BY` ici.
//
// Lecture seule, strictement : cette route ne fait que des `select`. Le seul
// geste d'écriture de la console (valider/renvoyer une tâche) appartient à
// `/api/agent-tasks`, qui porte déjà l'authentification par clé d'agent et la
// règle « une clé d'agent ne valide pas son propre travail ». On ne la duplique
// pas ici — deux portes d'écriture pour une même table finiraient par diverger.
//
// Auth : session CMS (`requireCmsAuth`), comme les autres routes `/api/admin/*`.
//
//   GET /api/admin/agents/journal?limit=100&event_type=statut&agent=openhands
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

/** Les huit types du trigger, plus `etat_initial` (l'amorçage). */
const TYPES_EVENEMENT = new Set([
  'depose',
  'prise',
  'statut',
  'compte_rendu',
  'validation',
  'edition',
  'suppression',
  'etat_initial',
])

function getSupabaseAdmin() {
  if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) return null
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  const authError = await requireCmsAuth(request)
  if (authError) return authError

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase non configuré : URL ou clé de service manquante.' },
      { status: 503 }
    )
  }

  const params = request.nextUrl.searchParams

  // `limit` borné : l'API REST Supabase plafonne à 1000 lignes par requête, et
  // le fait silencieusement. Au-delà, on croirait lire un journal complet qui
  // ne l'est pas.
  const limiteBrute = Number.parseInt(params.get('limit') ?? '100', 10)
  const limite = Number.isFinite(limiteBrute)
    ? Math.min(Math.max(limiteBrute, 1), 1000)
    : 100

  const typeDemande = params.get('event_type')
  const agent = params.get('agent')

  let requete = supabase
    .from('agent_task_events')
    .select('id, task_id, agent, event_type, from_status, to_status, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(limite)

  if (typeDemande && TYPES_EVENEMENT.has(typeDemande)) {
    requete = requete.eq('event_type', typeDemande)
  }
  if (agent) {
    requete = requete.eq('agent', agent)
  }

  const { data: evenements, error: erreurJournal } = await requete
  if (erreurJournal) {
    // L'erreur est nommée : un journal vide et un journal en panne ne doivent
    // pas se ressembler. C'est exactement le bug « Aucun post programmé » qui a
    // coûté cher — l'écran affichait une absence là où la requête échouait.
    return NextResponse.json(
      { error: 'Lecture du journal impossible', detail: erreurJournal.message },
      { status: 500 }
    )
  }

  const { data: gouvernance, error: erreurGouvernance } = await supabase
    .from('v_agent_governance')
    .select('*')
    .limit(1000)

  if (erreurGouvernance) {
    return NextResponse.json(
      {
        error: 'Lecture de v_agent_governance impossible',
        detail: erreurGouvernance.message,
      },
      { status: 500 }
    )
  }

  // Les tâches en attente de validation humaine : le geste qui débloque le
  // travail du fondateur. Rendues ici pour que la console n'ait pas à dériver
  // cet état d'un fil d'activité qu'elle relirait entièrement.
  const { data: aValider, error: erreurAValider } = await supabase
    .from('agent_tasks')
    .select(
      'id, agent, task, scope, branch, pr_url, commit_sha, notes, created_at, updated_at'
    )
    .eq('status', 'waiting_validation')
    .order('updated_at', { ascending: false })
    .limit(200)

  if (erreurAValider) {
    return NextResponse.json(
      {
        error: 'Lecture des tâches à valider impossible',
        detail: erreurAValider.message,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    evenements: evenements ?? [],
    gouvernance: gouvernance ?? [],
    a_valider: aValider ?? [],
    limite,
  })
}
