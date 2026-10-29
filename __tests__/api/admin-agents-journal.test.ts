import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * /api/admin/agents/journal — tests de la route réelle.
 *
 * Le client Supabase est simulé (aucune base ici), mais le gestionnaire GET est
 * appelé tel quel. Ces tests verrouillent ce que la console ajoute par rapport à
 * une lecture brute de la table : la lecture nommée de l'erreur (un journal en
 * panne ne doit pas ressembler à un journal vide), la borne de `limit`, et la
 * validation du filtre `event_type`.
 */

const h = vi.hoisted(() => {
  // File de résultats : chaque `from()` consomme le suivant. La route fait trois
  // requêtes distinctes (journal, gouvernance, à valider), il faut donc trois
  // réponses ordonnées.
  const state: { queue: unknown[]; appels: string[] } = { queue: [], appels: [] }

  const makeQuery = (result: unknown) => {
    const q: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'order', 'limit', 'range']) {
      q[m] = () => q
    }
    q.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
    return q
  }

  const from = vi.fn((table: string) => {
    state.appels.push(table)
    const result = state.queue.length > 0 ? state.queue.shift() : { data: [], error: null }
    return makeQuery(result)
  })

  return { state, from }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: h.from }),
}))

const AUTH = vi.hoisted(() => ({ autorise: true }))

vi.mock('@/lib/cms-auth', () => ({
  requireCmsAuth: async () =>
    AUTH.autorise ? null : new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 }),
}))

async function importerRoute() {
  return import('@/app/api/admin/agents/journal/route')
}

function requete(url: string) {
  return new NextRequest(new URL(url, 'http://localhost'))
}

describe('/api/admin/agents/journal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    h.state.queue = []
    h.state.appels = []
    AUTH.autorise = true
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'cle-de-test'
  })

  it('rend le journal, la gouvernance et la file à valider', async () => {
    h.state.queue = [
      { data: [{ id: 'e1', event_type: 'depose', agent: 'openhands' }], error: null },
      { data: [{ agent: 'openhands', nb_tasks: 3 }], error: null },
      { data: [{ id: 't1', task: 'a valider', agent: 'openhands' }], error: null },
    ]
    const { GET } = await importerRoute()
    const res = await GET(requete('/api/admin/agents/journal'))
    expect(res.status).toBe(200)
    const corps = await res.json()
    expect(corps.evenements).toHaveLength(1)
    expect(corps.gouvernance).toHaveLength(1)
    expect(corps.a_valider).toHaveLength(1)
    // Les trois sources sont bien interrogées, dans l'ordre attendu.
    expect(h.state.appels).toEqual(['agent_task_events', 'v_agent_governance', 'agent_tasks'])
  })

  it('nomme l’erreur du journal au lieu de rendre une liste vide', async () => {
    h.state.queue = [
      { data: null, error: { message: 'relation absente' } },
      { data: [], error: null },
      { data: [], error: null },
    ]
    const { GET } = await importerRoute()
    const res = await GET(requete('/api/admin/agents/journal'))
    expect(res.status).toBe(500)
    const corps = await res.json()
    expect(corps.error).toMatch(/journal/i)
    expect(corps.detail).toBe('relation absente')
  })

  it('nomme l’erreur de la vue de gouvernance', async () => {
    h.state.queue = [
      { data: [], error: null },
      { data: null, error: { message: 'vue absente' } },
      { data: [], error: null },
    ]
    const { GET } = await importerRoute()
    const res = await GET(requete('/api/admin/agents/journal'))
    expect(res.status).toBe(500)
    const corps = await res.json()
    expect(corps.detail).toBe('vue absente')
  })

  it('refuse un appel non authentifié sans lire la base', async () => {
    AUTH.autorise = false
    const { GET } = await importerRoute()
    const res = await GET(requete('/api/admin/agents/journal'))
    expect(res.status).toBe(401)
    expect(h.state.appels).toEqual([])
  })

  it('borne `limit` à 1000 même si l’appelant demande plus', async () => {
    h.state.queue = [
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ]
    const { GET } = await importerRoute()
    const res = await GET(requete('/api/admin/agents/journal?limit=99999'))
    expect(res.status).toBe(200)
    const corps = await res.json()
    expect(corps.limite).toBe(1000)
  })

  it('retombe sur 100 quand `limit` n’est pas un nombre', async () => {
    h.state.queue = [
      { data: [], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ]
    const { GET } = await importerRoute()
    const res = await GET(requete('/api/admin/agents/journal?limit=beaucoup'))
    const corps = await res.json()
    expect(corps.limite).toBe(100)
  })

  it('ignore un `event_type` inconnu plutôt que de rendre zéro ligne', async () => {
    h.state.queue = [
      { data: [{ id: 'e1', event_type: 'depose' }], error: null },
      { data: [], error: null },
      { data: [], error: null },
    ]
    const { GET } = await importerRoute()
    const res = await GET(requete('/api/admin/agents/journal?event_type=invente'))
    const corps = await res.json()
    // Le filtre non reconnu est écarté : on rend le journal, pas un vide trompeur.
    expect(corps.evenements).toHaveLength(1)
  })
})
