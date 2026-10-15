import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

/**
 * /api/cron/heartbeat — tests de la route réelle.
 *
 * Cette routine porte deux promesses : garder le projet Supabase éveillé, et
 * libérer les baux expirés (le filet de sécurité de /api/agent-tasks). Ces tests
 * verrouillent les deux, plus la règle « une panne doit rester visible » : si la
 * base ne répond pas, la route renvoie 500, pas 200.
 */

const h = vi.hoisted(() => {
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

const AUTH = vi.hoisted(() => ({ ok: true as boolean }))

vi.mock('@/lib/ai-auth', () => ({
  verifyAiAuth: async () => {
    if (!AUTH.ok) {
      const { NextResponse } = await import('next/server')
      return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    return { ok: true, agentName: 'cron', keyId: 'cms' }
  },
}))

function req(method = 'GET') {
  return new NextRequest('http://localhost/api/cron/heartbeat', {
    method,
    headers: { 'x-cms-auth': 'cms-test' },
  })
}

const env = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  h.state.queue = []
  AUTH.ok = true
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
})

afterEach(() => {
  process.env = { ...env }
  vi.clearAllMocks()
})

async function route() {
  return import('@/app/api/cron/heartbeat/route')
}

describe('GET /api/cron/heartbeat', () => {
  it('refuse un appel non authentifié (401)', async () => {
    AUTH.ok = false
    const { GET } = await route()
    const res = await GET(req())
    expect(res.status).toBe(401)
  })

  it('réveille la base et rend le bilan quand tout va bien (200)', async () => {
    h.state.queue = [
      { error: null },                   // lecture site_settings (réveil)
      { data: [], error: null },         // balayage : aucun bail expiré
      { count: 3, error: null },         // comptage des tâches en attente
    ]
    const { GET } = await route()
    const res = await GET(req())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.reveil).toBe('ok')
    expect(json.baux_liberes).toBe(0)
    expect(json.taches_en_attente).toBe(3)
  })

  it('renvoie 500 si la base ne répond pas — une panne doit être visible', async () => {
    h.state.queue = [{ error: { message: 'connection refused' } }]
    const { GET } = await route()
    const res = await GET(req())
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.reveil).toBe('ko')
  })

  it('libère un bail expiré et le compte', async () => {
    h.state.queue = [
      { error: null },                                                    // réveil
      { data: [{ id: 'x', claimed_by: 'claude', payload: { a: 1 } }], error: null }, // balayage
      { error: null },                                                    // note de bail
      { count: 1, error: null },                                          // comptage
    ]
    const { GET } = await route()
    const res = await GET(req())
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.baux_liberes).toBe(1)
  })

  it('POST se comporte comme GET', async () => {
    h.state.queue = [
      { error: null },
      { data: [], error: null },
      { count: 0, error: null },
    ]
    const { POST } = await route()
    const res = await POST(req('POST'))
    expect(res.status).toBe(200)
  })

  it('renvoie 503 quand la base n’est pas configurée', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.SUPABASE_SERVICE_KEY
    const { GET } = await route()
    const res = await GET(req())
    expect(res.status).toBe(503)
  })
})
