import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * /api/agent-tasks — tests de la route réelle.
 *
 * Le client Supabase est simulé (aucune base ici), mais les gestionnaires GET et
 * POST sont appelés tels quels. Ces tests verrouillent ce que la route ajoute par
 * rapport au pont du poller : le vocabulaire du MCP, la validation des entrées,
 * et la prise atomique (409 en cas de conflit) — seule protection contre la
 * double-exécution d'une tâche.
 */

const h = vi.hoisted(() => {
  // File de résultats : chaque appel à from() consomme le suivant. La route fait
  // deux requêtes dans une même action (lire puis écrire), il faut donc deux
  // réponses distinctes et ordonnées.
  const state: { queue: unknown[] } = { queue: [] }

  const makeQuery = (result: unknown) => {
    const q: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'or', 'order', 'range', 'limit', 'update', 'insert', 'lt', 'gt', 'in']) {
      q[m] = () => q
    }
    q.single = async () => result
    q.maybeSingle = async () => result
    q.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
    return q
  }

  const from = vi.fn(() => {
    const result = state.queue.length > 0 ? state.queue.shift() : { data: null, error: null }
    return makeQuery(result)
  })

  return { state, from }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: h.from }),
}))

const AUTH = vi.hoisted(() => ({
  ok: true as boolean,
  agentName: 'openhands' as string,
  keyId: 'master' as string,
}))

vi.mock('@/lib/ai-auth', () => ({
  verifyAiAuth: async () => {
    if (!AUTH.ok) {
      const { NextResponse } = await import('next/server')
      return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    return { ok: true, agentName: AUTH.agentName, keyId: AUTH.keyId }
  },
  logAiRequest: async () => {},
}))

const UUID = '11111111-2222-3333-4444-555555555555'

function req(method: string, body?: unknown, url = 'http://localhost/api/agent-tasks') {
  const init: RequestInit = { method, headers: { 'x-api-key': 'hld_test' } }
  if (body !== undefined) init.body = JSON.stringify(body)
  return new NextRequest(url, init)
}

const env = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  h.state.queue = []
  AUTH.ok = true
  AUTH.agentName = 'openhands'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
})

afterEach(() => {
  process.env = { ...env }
  vi.clearAllMocks()
})

async function route() {
  return import('@/app/api/agent-tasks/route')
}

describe('GET /api/agent-tasks', () => {
  it('refuse une requête non authentifiée (401)', async () => {
    AUTH.ok = false
    const { GET } = await route()
    const res = await GET(req('GET'))
    expect(res.status).toBe(401)
  })

  it('refuse un statut hors vocabulaire (400)', async () => {
    const { GET } = await route()
    const res = await GET(req('GET', undefined, 'http://localhost/api/agent-tasks?status=fini'))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.valid).toContain('sent')
    expect(json.valid).toContain('all')
  })

  it('rend le résumé et expose le vocabulaire complet', async () => {
    h.state.queue = [
      {
        data: [
          {
            id: UUID,
            agent: 'openhands',
            status: 'sent',
            claimed_by: null,
            task: 'fiabiliser le document',
            scope: 'content',
            risk_level: 'low',
            depends_on: null,
            created_at: '2026-10-15T08:00:00Z',
            updated_at: '2026-10-15T08:00:00Z',
          },
        ],
        error: null,
        count: 1,
      },
    ]
    const { GET } = await route()
    const res = await GET(req('GET', undefined, 'http://localhost/api/agent-tasks?status=sent'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.total).toBe(1)
    expect(json.tasks[0].id).toBe(UUID.slice(0, 8))
    expect(json.statuts).toContain('waiting_validation')
    expect(json.agents).toContain('openhands')
    expect(json.agents).toContain('tous')
  })

  it('remonte une erreur base en 500 plutôt que de l’avaler', async () => {
    h.state.queue = [{ data: null, error: { message: 'relation does not exist' }, count: null }]
    const { GET } = await route()
    const res = await GET(req('GET'))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toContain('relation does not exist')
  })
})

describe('POST /api/agent-tasks — garde-fous', () => {
  it('refuse une action inconnue (400)', async () => {
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'supprimer' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.valides).toContain('deposer')
    expect(json.valides).not.toContain('supprimer')
  })

  it('refuse un destinataire hors vocabulaire (400)', async () => {
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'deposer', agent: 'chatgpt', task: 'une tâche assez longue' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('chatgpt')
    expect(json.agents).toContain('openhands')
  })

  it('refuse un titre trop court (400)', async () => {
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'deposer', agent: 'openhands', task: 'court' }))
    expect(res.status).toBe(400)
  })

  it('refuse un payload au-delà de 64 Ko (413)', async () => {
    const { POST } = await route()
    const gros = 'x'.repeat(70000)
    const res = await POST(req('POST', { action: 'deposer', agent: 'openhands', task: 'une tâche assez longue', payload: { gros } }))
    expect(res.status).toBe(413)
  })

  it('refuse de clore en `done` sans rien dans `verifie` (400)', async () => {
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'rendre_compte', id: UUID, status: 'done', actions_done: { corrige: ['x'] } }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('verifie')
  })
})

describe('POST /api/agent-tasks — dépôt et prise', () => {
  it('dépose une tâche et note l’acteur', async () => {
    h.state.queue = [
      { data: [{ id: UUID, agent: 'openhands', status: 'sent', task: 'une tâche assez longue', scope: 'content' }], error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'deposer', agent: 'openhands', task: 'une tâche assez longue', scope: 'content' }))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.deposee.agent).toBe('openhands')
  })

  it('refuse de prendre la tâche d’un autre (409)', async () => {
    h.state.queue = [
      { data: { id: UUID, status: 'sent', agent: 'tous', claimed_by: 'claude' }, error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'prendre', id: UUID }))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('claude')
  })

  it('signale une prise perdue par concurrence (409)', async () => {
    // 1) la tâche est libre ; 2) l’update conditionnel ne renvoie aucune ligne
    //    parce qu’un autre agent a été plus rapide.
    h.state.queue = [
      { data: { id: UUID, status: 'sent', agent: 'tous', claimed_by: null }, error: null },
      { data: [], error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'prendre', id: UUID }))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('plus rapide')
  })

  it('prend une tâche libre (200)', async () => {
    h.state.queue = [
      { data: { id: UUID, status: 'sent', agent: 'tous', claimed_by: null }, error: null },
      { data: [{ id: UUID, agent: 'tous', status: 'in_progress', claimed_by: 'openhands', task: 'x' }], error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'prendre', id: UUID }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.prise.claimed_by).toBe('openhands')
  })

  it('refuse de clore la tâche d’un autre (403)', async () => {
    h.state.queue = [{ data: [], error: null }]
    const { POST } = await route()
    const res = await POST(
      req('POST', { action: 'rendre_compte', id: UUID, status: 'done', actions_done: { verifie: ['638 tests verts'] } })
    )
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('openhands')
  })
})

describe('POST /api/agent-tasks — bail de prise', () => {
  // Un worker qui meurt (Android tue le processus) ne rend jamais compte. Sans
  // expiration, sa tâche reste `in_progress` pour toujours : la file devient un
  // cimetière. Ces tests verrouillent la reprise.
  const ilYA = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

  it('refuse une prise dont le bail est encore valide (409)', async () => {
    h.state.queue = [
      { data: { id: UUID, status: 'in_progress', agent: 'tous', claimed_by: 'claude', claimed_at: ilYA(5) }, error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'prendre', id: UUID }))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('claude')
  })

  it('reprend une tâche dont le bail a expiré (200)', async () => {
    h.state.queue = [
      { data: { id: UUID, status: 'in_progress', agent: 'tous', claimed_by: 'claude', claimed_at: ilYA(120) }, error: null },
      { data: [{ id: UUID, agent: 'tous', status: 'in_progress', claimed_by: 'openhands', task: 'x' }], error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'prendre', id: UUID }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.prise.claimed_by).toBe('openhands')
    expect(json.reprise_apres_bail).toBe(true)
  })

  it('ne signale pas de reprise quand la tâche était simplement libre (200)', async () => {
    h.state.queue = [
      { data: { id: UUID, status: 'sent', agent: 'tous', claimed_by: null, claimed_at: null }, error: null },
      { data: [{ id: UUID, agent: 'tous', status: 'in_progress', claimed_by: 'openhands', task: 'x' }], error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'prendre', id: UUID }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.reprise_apres_bail).toBe(false)
  })

  it('un bail expiré ne lève pas l’adressage : une tâche d’un autre agent reste refusée (403)', async () => {
    h.state.queue = [
      { data: { id: UUID, status: 'in_progress', agent: 'claude', claimed_by: 'claude', claimed_at: ilYA(120) }, error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'prendre', id: UUID }))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('claude')
  })
})

describe('GET /api/agent-tasks — balayage des baux', () => {
  it('ne balaie pas sans `balayer=1`', async () => {
    h.state.queue = [{ data: [], error: null, count: 0 }]
    const { GET } = await route()
    const res = await GET(req('GET'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.baux_liberes).toBe(0)
    // Un seul appel à from() : aucune écriture de balayage n’a eu lieu.
    expect(h.from).toHaveBeenCalledTimes(1)
  })

  it('libère un bail expiré quand `balayer=1`', async () => {
    const expiree = { id: UUID, claimed_by: 'claude', task: 'x', payload: { existant: true } }
    h.state.queue = [
      { data: [expiree], error: null },  // l’update de libération
      { data: null, error: null },       // la note dans payload
      { data: [], error: null, count: 0 } // la lecture
    ]
    const { GET } = await route()
    const res = await GET(req('GET', undefined, 'http://localhost/api/agent-tasks?balayer=1'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.baux_liberes).toBe(1)
  })
})

describe('POST /api/agent-tasks — validation par le fondateur', () => {
  // `waiting_validation` n'avait aucune porte de sortie : le bouton « Approuver »
  // du CMS appelait /api/cms/agent-tasks, une route inexistante (404). Ces tests
  // verrouillent l'action qui manquait, et la règle « l'exécutant ne valide pas
  // son propre travail ».
  it('refuse un agent qui tente de valider lui-même (403)', async () => {
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'valider', id: UUID }))
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('fondateur')
  })

  it('refuse un agent_name `openhands` même avec la clé maître (403)', async () => {
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'valider', id: UUID, agent_name: 'openhands' }))
    expect(res.status).toBe(403)
  })

  it('valide une tâche en attente quand la clé est la session CMS (200)', async () => {
    AUTH.keyId = 'cms'
    AUTH.agentName = 'cms_session'
    h.state.queue = [
      { data: [{ id: UUID, agent: 'claude', status: 'done', claimed_by: 'claude', task: 'Fusionner PR #616' }], error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'valider', id: UUID }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.validee.status).toBe('done')
  })

  it('accepte un acteur explicite `fondateur` (200)', async () => {
    h.state.queue = [
      { data: [{ id: UUID, agent: 'claude', status: 'done', claimed_by: 'claude', task: 'Fusionner PR #616' }], error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'valider', id: UUID, agent_name: 'fondateur' }))
    expect(res.status).toBe(200)
  })

  it('refuse de valider une tâche qui n’attend pas de décision (409)', async () => {
    // Zéro ligne modifiée : le filtre `in(status, waiting_validation, blocked)` n'a rien trouvé.
    h.state.queue = [{ data: [], error: null }]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'valider', id: UUID, agent_name: 'fondateur' }))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('waiting_validation')
  })

  it('refuse un statut cible autre que done (400)', async () => {
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'valider', id: UUID, agent_name: 'fondateur', status: 'sent' }))
    expect(res.status).toBe(400)
  })

  it('remonte l’erreur base plutôt que de l’avaler (500)', async () => {
    h.state.queue = [{ data: null, error: { message: 'permission denied' } }]
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'valider', id: UUID, agent_name: 'fondateur' }))
    expect(res.status).toBe(500)
  })

  it('annonce `valider` dans la liste des actions connues', async () => {
    const { POST } = await route()
    const res = await POST(req('POST', { action: 'action-inexistante' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.valides).toContain('valider')
  })
})
