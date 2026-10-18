// ============================================================
// /api/agent-tasks — le registre `agent_tasks`, pour le client mobile
//
// Le registre existait deja, mais aucun client mobile ne pouvait l'atteindre :
//
//   - /api/brain/tasks est fige sur `agent = 'heldonica-brain'` (GET comme POST).
//     Il sert le poller du PC, pas un client generique.
//   - le serveur MCP (mcp/agent-tasks/server.mjs) est generique, mais il parle a
//     Supabase avec SUPABASE_SERVICE_ROLE_KEY. Une cle service ne peut pas vivre
//     dans un APK : il est decompilable. Ce serait la reedition de l'incident
//     « cle Gemini dans l'APK », ferme le 2026-10-15.
//
// Cette route est la porte generique manquante : tous les agents, les cinq gestes
// du protocole AGENTS.md, et l'authentification par cle API revocable
// (`verifyAiAuth`, en-tete `x-api-key: hld_...`) au lieu de la cle service.
//
// Le vocabulaire est celui du MCP — statuts et destinataires — pour qu'il n'y ait
// pas deux langues pour une seule table.
//
// Lecture : GET /api/agent-tasks?status=sent&agent=openhands&limit=20
//   - `status=all` (defaut) rend tout ; sinon un des cinq statuts.
//   - `agent` filtre sur ce destinataire, et inclut toujours `tous`.
// Action : POST /api/agent-tasks avec { action, ... } — cf. les actions plus bas.
//
// Il n'y a pas de geste de suppression. C'est voulu, comme pour le MCP.
//
// `valider` est le seul geste du fondateur : accepter (waiting_validation -> done)
// ou renvoyer (waiting_validation|blocked -> sent, prise liberee) une tache, avec
// un commentaire. Reserve a la session CMS (mot de passe du telephone) : une cle
// d'agent ne valide pas son propre travail.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAiAuth, logAiRequest } from '@/lib/ai-auth'

export const dynamic = 'force-dynamic'

/** Les cinq statuts du protocole, dans l'ordre de vie d'une tache. */
const STATUTS = ['sent', 'in_progress', 'waiting_validation', 'blocked', 'done'] as const

/** Les destinataires reconnus — miroir de AGENTS_CONNUS du serveur MCP. */
const AGENTS_CONNUS = [
  'claude',
  'gemini',
  'opencode',
  'jules',
  'allhands',
  'openhands',
  'grok',
  'manus',
  'freebuff',
  'archiveur',
  'muse-spark',
  'discord-bot',
  'fondateur',
  'poco',
  'tous',
] as const

/** Les colonnes rendues par le resume : de quoi decider sans lire la tache entiere. */
const RESUME = 'id,agent,status,claimed_by,claimed_at,task,scope,risk_level,depends_on,created_at,updated_at'

const PAYLOAD_MAX_BYTES = 65536

/**
 * La base n'accepte que low|medium|high|critical (agent_tasks_risk_check),
 * mais le Poco envoie les libelles de son ecran (bas, moyen, haut) : sans cette
 * traduction, chaque depot depuis le telephone echouait en 500.
 */
const NIVEAUX_RISQUE: Record<string, string> = {
  low: 'low', medium: 'medium', high: 'high', critical: 'critical',
  bas: 'low', faible: 'low', moyen: 'medium', haut: 'high', eleve: 'high', 'élevé': 'high', critique: 'critical',
}

// Duree d'un bail de prise. Un worker qui meurt (Android tue les processus, le
// reseau tombe, le telephone s'eteint) ne rend jamais compte : sans expiration,
// sa tache resterait `in_progress` pour toujours et personne ne pourrait la
// reprendre. Passe ce delai, la prise est consideree abandonnee et redevient
// prenable. C'est la difference entre une file de travail et un cimetiere.
const BAIL_MINUTES = 90

// Cette route n'appelle aucun modele d'IA : elle lit et ecrit PostgREST. Le
// journal `ai_requests_log` demande un champ `model`, on y met un repere qui dit
// ce que c'est — et qui n'est pas un identifiant de modele en dur (garde-fou
// check:ai-models). D'ou la constante plutot qu'un litteral en position `model:`.
const JOURNAL_MODELE = 'postgrest-agent-tasks'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function resume(t: Record<string, unknown>) {
  return {
    id: String(t.id).slice(0, 8),
    id_complet: t.id,
    agent: t.agent,
    status: t.status,
    claimed_by: t.claimed_by ?? null,
    task: t.task,
    scope: t.scope ?? null,
    risk_level: t.risk_level ?? null,
    depends_on: t.depends_on ?? null,
    created_at: typeof t.created_at === 'string' ? t.created_at.slice(0, 16) : null,
  }
}

/**
 * Un identifiant peut etre donne entier ou par ses premiers caracteres, comme on
 * les cite dans les conversations. On resout parmi les taches non closes, puis
 * parmi toutes si besoin. Meme regle que le serveur MCP.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resoudreId(sb: any, fragment: string): Promise<string> {
  const f = String(fragment).trim().toLowerCase()
  if (/^[0-9a-f-]{36}$/.test(f)) return f
  if (!/^[0-9a-f]{4,}$/.test(f)) throw new Error(`identifiant illisible : ${fragment}`)
  const { data, error } = await sb
    .from('agent_tasks')
    .select('id,status')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw new Error(error.message)
  const candidats = (data ?? []).filter((t: { id: string }) => t.id.startsWith(f))
  if (candidats.length === 0) throw new Error(`aucune tache ne commence par ${f}`)
  if (candidats.length > 1) throw new Error(`${candidats.length} taches commencent par ${f} — precise`)
  return candidats[0].id
}

/**
 * Rend les baux expires.
 *
 * Une tache `in_progress` dont le bail est depasse redevient `sent`. On garde la
 * trace du passage : `claimed_by` part dans `payload`, et `claimed_at`/`claimed_by`
 * sont vides pour que la prochaine prise soit propre. Sans ce balayage, la
 * premiere tache prise par un telephone tue par Android resterait bloquee.
 */
async function libererBauxExpires(sb: any): Promise<number> {
  const limite = new Date(Date.now() - BAIL_MINUTES * 60_000).toISOString()
  const { data, error } = await sb
    .from('agent_tasks')
    .update({ status: 'sent', claimed_by: null, claimed_at: null, updated_at: new Date().toISOString() })
    .eq('status', 'in_progress')
    .lt('claimed_at', limite)
    .select('id,claimed_by,task,payload')
  if (error) {
    console.warn('[agent-tasks] balayage des baux echoue :', error.message)
    return 0
  }
  if (!data || data.length === 0) return 0

  // On note qui a abandonne, sans ecraser un payload existant.
  for (const t of data) {
    const ancien = (t.payload && typeof t.payload === 'object') ? t.payload : {}
    const { error: errNote } = await sb
      .from('agent_tasks')
      .update({ payload: { ...ancien, bail_expire: { agent: t.claimed_by, at: new Date().toISOString() } } })
      .eq('id', t.id)
    if (errNote) console.warn('[agent-tasks] note de bail echouee :', errNote.message)
  }
  return data.length
}

export async function GET(req: NextRequest) {
  const debut = Date.now()
  const auth = await verifyAiAuth(req)
  if (!auth.ok) return auth.response

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const url = req.nextUrl || new URL(req.url)
  const status = url.searchParams.get('status') || 'all'
  const agent = (url.searchParams.get('agent') || '').trim().toLowerCase()
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)))
  const from = (page - 1) * limit

  if (status !== 'all' && !(STATUTS as readonly string[]).includes(status)) {
    return NextResponse.json({ error: 'Invalid status', valid: ['all', ...STATUTS] }, { status: 400 })
  }

  // `?balayer=1` : rend les baux expires avant de lire. C'est ce qu'appelle un
  // cron. On ne le fait pas a chaque lecture — ecrire a chaque GET serait un
  // cout inutile pour un cas rare.
  const bauxLiberes = url.searchParams.get('balayer') === '1' ? await libererBauxExpires(sb) : 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (sb.from('agent_tasks') as any)
    .select(RESUME, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (status !== 'all') query = query.eq('status', status)
  // Une tache adressee a `tous` concerne tout le monde : on l'inclut toujours.
  if (agent) query = query.or(`agent.eq.${agent},agent.eq.tous`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAiRequest({
    apiKeyId: auth.keyId !== 'master' && auth.keyId !== 'cms' ? auth.keyId : undefined,
    agentName: auth.agentName || 'inconnu',
    endpoint: '/api/agent-tasks',
    model: JOURNAL_MODELE,
    promptPreview: `GET agent_tasks status=${status} agent=${agent || 'tous'}`,
    statusCode: 200,
    durationMs: Date.now() - debut,
  })

  return NextResponse.json({
    tasks: (data ?? []).map(resume),
    total: count ?? 0,
    page,
    limit,
    statuts: STATUTS,
    agents: AGENTS_CONNUS,
    baux_liberes: bauxLiberes,
  })
}

export async function POST(req: NextRequest) {
  const debut = Date.now()
  const auth = await verifyAiAuth(req)
  if (!auth.ok) return auth.response

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action = String(body.action || '')
  // La cle API porte deja une identite, mais un compte peut servir plusieurs
  // sessions : un client precise alors son nom de registre. Hors vocabulaire, on
  // refuse — sinon trois agents inventent trois noms pour la meme chose.
  const acteur = String(body.agent_name || (auth.keyId === 'cms' ? 'fondateur' : auth.agentName) || '').trim().toLowerCase()
  const acteurValide = (AGENTS_CONNUS as readonly string[]).includes(acteur) ? acteur : null

  try {
    if (action === 'lire') {
      const uuid = await resoudreId(sb, String(body.id || ''))
      const { data, error } = await sb.from('agent_tasks').select('*').eq('id', uuid).single()
      if (error) {
        if (error.code === 'PGRST116') return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ task: data })
    }

    if (action === 'prendre') {
      if (!acteurValide) {
        return NextResponse.json({ error: 'agent_name requis et reconnu pour prendre une tache', agents: AGENTS_CONNUS }, { status: 400 })
      }
      const uuid = await resoudreId(sb, String(body.id || ''))
      const { data: avant, error: errAvant } = await sb
        .from('agent_tasks')
        .select('id,status,agent,claimed_by,claimed_at')
        .eq('id', uuid)
        .single()
      if (errAvant) return NextResponse.json({ error: errAvant.message }, { status: 404 })

      // Un bail depasse vaut une tache libre : le worker precedent est mort.
      const limite = new Date(Date.now() - BAIL_MINUTES * 60_000).toISOString()
      const bailExpire = avant.status === 'in_progress' && !!avant.claimed_at && avant.claimed_at < limite

      if (avant.claimed_by && avant.claimed_by !== acteurValide && !bailExpire) {
        return NextResponse.json(
          { error: `deja prise par ${avant.claimed_by} — depose une suite avec depends_on plutot que de la reprendre` },
          { status: 409 }
        )
      }
      if (avant.status !== 'sent' && avant.claimed_by !== acteurValide && !bailExpire) {
        return NextResponse.json({ error: `statut ${avant.status}, pas sent — elle n'est plus a prendre` }, { status: 409 })
      }
      if (avant.agent && avant.agent !== 'tous' && avant.agent !== acteurValide) {
        return NextResponse.json({ error: `adressee a ${avant.agent}, pas a ${acteurValide}` }, { status: 403 })
      }
      // Le filtre rend la prise atomique cote base : si un autre agent a ete plus
      // rapide, zero ligne est modifiee. On accepte aussi une prise dont le bail a
      // expire, sinon une tache abandonnee par un telephone mort serait perdue.
      const corps: Record<string, unknown> = {
        status: 'in_progress',
        claimed_by: acteurValide,
        claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      if (body.branch) corps.branch = String(body.branch)
      const { data, error } = await sb
        .from('agent_tasks')
        .update(corps)
        .eq('id', uuid)
        .or(`status.eq.sent,claimed_by.eq.${acteurValide},and(status.eq.in_progress,claimed_at.lt.${limite})`)
        .select(RESUME)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (!data || data.length === 0) {
        return NextResponse.json({ error: "quelqu'un a ete plus rapide : la tache n'est plus sent" }, { status: 409 })
      }
      return NextResponse.json({ prise: resume(data[0]), reprise_apres_bail: bailExpire })
    }

    if (action === 'rendre_compte') {
      if (!acteurValide) {
        return NextResponse.json({ error: 'agent_name requis et reconnu pour rendre compte', agents: AGENTS_CONNUS }, { status: 400 })
      }
      const statut = String(body.status || '')
      if (!['waiting_validation', 'blocked', 'done'].includes(statut)) {
        return NextResponse.json({ error: 'Invalid status', valid: ['waiting_validation', 'blocked', 'done'] }, { status: 400 })
      }
      const actionsDone = body.actions_done
      if (statut === 'done') {
        const verifie = (actionsDone as { verifie?: unknown[] } | undefined)?.verifie
        if (!Array.isArray(verifie) || verifie.length === 0) {
          return NextResponse.json(
            { error: 'done sans rien dans verifie : dis ce que tu as mesure, ou mets waiting_validation' },
            { status: 400 }
          )
        }
      }
      const uuid = await resoudreId(sb, String(body.id || ''))
      const corps: Record<string, unknown> = { status: statut, updated_at: new Date().toISOString() }
      if (actionsDone !== undefined) corps.actions_done = actionsDone
      if (body.description !== undefined) corps.description = body.description
      if (body.files_modified !== undefined) corps.files_modified = body.files_modified
      if (body.notes !== undefined) corps.notes = body.notes
      // Seul celui qui a pris la tache la clot : le filtre claimed_by le garantit.
      const { data, error } = await sb
        .from('agent_tasks')
        .update(corps)
        .eq('id', uuid)
        .eq('claimed_by', acteurValide)
        .select(RESUME)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (!data || data.length === 0) {
        return NextResponse.json({ error: `cette tache n'est pas prise par ${acteurValide} — on ne clot pas la tache d'un autre` }, { status: 403 })
      }
      return NextResponse.json({ close: resume(data[0]) })
    }

    if (action === 'valider') {
      if (auth.keyId !== 'cms') {
        return NextResponse.json({ error: 'seul le fondateur (session CMS) valide une tache' }, { status: 403 })
      }
      const decision = String(body.decision || '')
      if (decision !== 'accepter' && decision !== 'renvoyer') {
        return NextResponse.json({ error: 'decision invalide', valides: ['accepter', 'renvoyer'] }, { status: 400 })
      }
      const commentaire = String(body.commentaire || '').trim().slice(0, 2000)
      const uuid = await resoudreId(sb, String(body.id || ''))
      const { data: avant, error: errAvant } = await sb
        .from('agent_tasks')
        .select('id,status,notes')
        .eq('id', uuid)
        .single()
      if (errAvant) {
        if (errAvant.code === 'PGRST116') return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        return NextResponse.json({ error: errAvant.message }, { status: 500 })
      }
      const permis = decision === 'accepter' ? ['waiting_validation'] : ['waiting_validation', 'blocked']
      if (!permis.includes(avant.status)) {
        return NextResponse.json(
          { error: `rien a ${decision} : la tache est ${avant.status}`, statuts_permis: permis },
          { status: 409 }
        )
      }
      const maintenant = new Date().toISOString()
      const trace = `${decision === 'accepter' ? 'validee' : 'renvoyee'} par le fondateur le ${maintenant.slice(0, 16)}${commentaire ? ` : ${commentaire}` : ''}`
      const corps: Record<string, unknown> = {
        status: decision === 'accepter' ? 'done' : 'sent',
        notes: avant.notes ? `${avant.notes}\n${trace}` : trace,
        updated_at: maintenant,
      }
      if (decision === 'renvoyer') {
        corps.claimed_by = null
        corps.claimed_at = null
      }
      // Filtre sur le statut lu : si un agent a bouge la tache entre-temps, on ne l'ecrase pas.
      const { data, error } = await sb
        .from('agent_tasks')
        .update(corps)
        .eq('id', uuid)
        .eq('status', avant.status)
        .select(RESUME)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (!data || data.length === 0) {
        return NextResponse.json({ error: 'la tache a change entre-temps : relis-la' }, { status: 409 })
      }
      return NextResponse.json({ [decision === 'accepter' ? 'validee' : 'renvoyee']: resume(data[0]) })
    }

    if (action === 'deposer') {
      if (!acteurValide) {
        return NextResponse.json({ error: 'agent_name requis et reconnu pour deposer', agents: AGENTS_CONNUS }, { status: 400 })
      }
      const dest = String(body.agent || '').trim().toLowerCase()
      if (!(AGENTS_CONNUS as readonly string[]).includes(dest)) {
        return NextResponse.json({ error: `agent inconnu : ${dest}`, agents: AGENTS_CONNUS }, { status: 400 })
      }
      const task = String(body.task || '').trim()
      if (task.length < 8) {
        return NextResponse.json({ error: 'task trop court (8 caracteres minimum)' }, { status: 400 })
      }
      const payload = body.payload
      if (payload !== undefined && payload !== null) {
        const taille = new TextEncoder().encode(JSON.stringify(payload)).byteLength
        if (taille > PAYLOAD_MAX_BYTES) {
          return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
        }
      }
      const corps: Record<string, unknown> = {
        agent: dest,
        task,
        repo: 'heldonica',
        status: 'sent',
        scope: body.scope ? String(body.scope) : 'a-qualifier',
        description: body.description !== undefined ? String(body.description) : null,
        notes: `deposee par ${acteurValide} via /api/agent-tasks le ${new Date().toISOString().slice(0, 16)}`,
      }
      if (body.risk_level) {
        const niveau = NIVEAUX_RISQUE[String(body.risk_level).trim().toLowerCase()]
        if (!niveau) {
          return NextResponse.json({ error: `risk_level inconnu : ${body.risk_level}`, valides: Object.keys(NIVEAUX_RISQUE) }, { status: 400 })
        }
        corps.risk_level = niveau
      }
      if (body.depends_on) corps.depends_on = await resoudreId(sb, String(body.depends_on))
      if (payload !== undefined) corps.payload = payload
      const { data, error } = await sb.from('agent_tasks').insert(corps).select(RESUME)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ deposee: resume(data[0]) }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'action inconnue', valides: ['lire', 'prendre', 'rendre_compte', 'deposer', 'valider'] },
      { status: 400 }
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erreur inconnue'
    await logAiRequest({
      apiKeyId: auth.keyId !== 'master' && auth.keyId !== 'cms' ? auth.keyId : undefined,
      agentName: auth.agentName || 'inconnu',
      endpoint: '/api/agent-tasks',
      model: JOURNAL_MODELE,
      promptPreview: `POST agent_tasks action=${action}`,
      statusCode: 400,
      durationMs: Date.now() - debut,
      error: message,
    })
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
