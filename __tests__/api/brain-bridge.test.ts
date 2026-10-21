import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Brain-CMS Bridge — tests des routes réelles.
 *
 * Ces tests appellent les handlers (pas une réimplémentation) avec un client
 * Supabase simulé. Ils verrouillent les garanties énoncées dans
 * `.kiro/specs/brain-cms-bridge/requirements.md` : authentification,
 * validation des entrées, et surtout le *claim* atomique (409 en cas de conflit),
 * seule protection contre la double-exécution d'une tâche par le Brain.
 */

const h = vi.hoisted(() => {
  // Résultat renvoyé par la prochaine requête simulée.
  const state: { result: unknown; queue: unknown[] } = { result: { data: null, error: null }, queue: [] }

  // Chaîne Supabase « thenable » : toutes les méthodes renvoient le même
  // builder, et l'attendre (`await`) résout sur le résultat courant. `queue`
  // permet de donner des résultats distincts à des requêtes successives —
  // indispensable pour distinguer une lecture d'une écriture dans un même appel.
  const makeQuery = (result: unknown) => {
    const q: Record<string, unknown> = {}
    for (const m of ['select', 'eq', 'order', 'range', 'update', 'insert', 'upsert']) {
      q[m] = () => q
    }
    const prochain = () => (state.queue.length ? state.queue.shift() : result)
    q.single = async () => prochain()
    q.maybeSingle = async () => prochain()
    q.then = (resolve: (v: unknown) => unknown) => Promise.resolve(prochain()).then(resolve)
    return q
  }

  const from = vi.fn(() => makeQuery(state.result))
  return { state, from }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: h.from }),
}))

const URL = 'http://localhost/api/brain'
const BRIDGE_TOKEN = 'bridge-token-test'
const CMS_PASSWORD = 'cms-password-test'

function headers(extra: Record<string, string> = {}) {
  const hs = new Headers()
  for (const [k, v] of Object.entries(extra)) hs.set(k, v)
  return hs
}

function bearer() {
  return headers({ authorization: `Bearer ${BRIDGE_TOKEN}` })
}

function post(url: string, body: string, hs = bearer()) {
  return new Request(url, { method: 'POST', headers: hs, body })
}

const env = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  h.state.result = { data: null, error: null }
  h.state.queue = []
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
  process.env.BRAIN_BRIDGE_TOKEN = BRIDGE_TOKEN
  process.env.CMS_PASSWORD = CMS_PASSWORD
})

afterEach(() => {
  process.env = { ...env }
  vi.clearAllMocks()
})

describe('requireBridgeAuth', () => {
  it('refuse une requête sans credential (401)', async () => {
    const { requireBridgeAuth } = await import('@/lib/bridge-auth')
    const res = await requireBridgeAuth({ headers: headers() } as Request)
    expect(res?.status).toBe(401)
  })

  it('accepte un Bearer correct', async () => {
    const { requireBridgeAuth } = await import('@/lib/bridge-auth')
    const res = await requireBridgeAuth({ headers: bearer() } as Request)
    expect(res).toBeNull()
  })

  it('refuse un Bearer incorrect (401)', async () => {
    const { requireBridgeAuth } = await import('@/lib/bridge-auth')
    const res = await requireBridgeAuth({
      headers: headers({ authorization: 'Bearer mauvais' }),
    } as Request)
    expect(res?.status).toBe(401)
  })

  it('accepte un x-cms-auth correct', async () => {
    const { requireBridgeAuth } = await import('@/lib/bridge-auth')
    const res = await requireBridgeAuth({
      headers: headers({ 'x-cms-auth': CMS_PASSWORD }),
    } as Request)
    expect(res).toBeNull()
  })

  it('REFUS DÉJÀ CORRIGÉ — administrateur accepté même si BRAIN_BRIDGE_TOKEN est absent', async () => {
    // Avant correctif : le jeton du pont était exigé avant le chemin admin,
    // donc un admin authentifié recevait 503. Le dispatch humain ne doit pas
    // dépendre d'un secret destiné au poller.
    delete process.env.BRAIN_BRIDGE_TOKEN
    const { requireBridgeAuth } = await import('@/lib/bridge-auth')
    const res = await requireBridgeAuth({
      headers: headers({ 'x-cms-auth': CMS_PASSWORD }),
    } as Request)
    expect(res).toBeNull()
  })

  it('renvoie 503 pour un Bearer quand BRAIN_BRIDGE_TOKEN est absent', async () => {
    delete process.env.BRAIN_BRIDGE_TOKEN
    const { requireBridgeAuth } = await import('@/lib/bridge-auth')
    const res = await requireBridgeAuth({ headers: bearer() } as Request)
    expect(res?.status).toBe(503)
  })

  it('renvoie 503 quand x-cms-auth est présent mais CMS_PASSWORD absent', async () => {
    delete process.env.CMS_PASSWORD
    const { requireBridgeAuth } = await import('@/lib/bridge-auth')
    const res = await requireBridgeAuth({
      headers: headers({ 'x-cms-auth': 'peu-importe' }),
    } as Request)
    expect(res?.status).toBe(503)
  })
})

describe('POST /api/brain/tasks', () => {
  it('refuse un task_type inconnu (400)', async () => {
    const { POST } = await import('@/app/api/brain/tasks/route')
    const res = await POST(post(URL + '/tasks', JSON.stringify({ task_type: 'zzz' })))
    expect(res.status).toBe(400)
  })

  it('refuse un corps non-JSON (400, pas 500)', async () => {
    const { POST } = await import('@/app/api/brain/tasks/route')
    const res = await POST(post(URL + '/tasks', 'pas du json'))
    expect(res.status).toBe(400)
  })

  it('refuse un payload > 64 Ko (413)', async () => {
    const { POST } = await import('@/app/api/brain/tasks/route')
    const body = JSON.stringify({ task_type: 'chat', payload: { big: 'x'.repeat(70000) } })
    const res = await POST(post(URL + '/tasks', body))
    expect(res.status).toBe(413)
  })

  it('insère une tâche valide et renvoie 201', async () => {
    h.state.result = { data: { id: 'task-1' }, error: null }
    const { POST } = await import('@/app/api/brain/tasks/route')
    const res = await POST(post(URL + '/tasks', JSON.stringify({ task_type: 'chat' })))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ id: 'task-1' })
  })

  it('sert les erreurs 401/503 de l\'authentification', async () => {
    const { POST } = await import('@/app/api/brain/tasks/route')
    const res = await POST(post(URL + '/tasks', JSON.stringify({ task_type: 'chat' }), headers()))
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/brain/tasks/[id]', () => {
  const ctx = { params: Promise.resolve({ id: 'task-1' }) }

  it('claim réussi sur status=sent (200)', async () => {
    h.state.result = { data: [{ id: 'task-1' }], error: null }
    const { PATCH } = await import('@/app/api/brain/tasks/[id]/route')
    const res = await PATCH(
      post(URL + '/tasks/task-1', JSON.stringify({ status: 'in_progress' })),
      ctx
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })

  it('CLAIM ATOMIQUE — re-claim d\'une tâche déjà prise renvoie 409', async () => {
    // Aucune ligne mise à jour : la tâche n'est plus `sent`. C'est la garantie
    // qui empêche deux pollers de la même tâche de l'exécuter deux fois.
    h.state.result = { data: [], error: null }
    const { PATCH } = await import('@/app/api/brain/tasks/[id]/route')
    const res = await PATCH(
      post(URL + '/tasks/task-1', JSON.stringify({ status: 'in_progress' })),
      ctx
    )
    expect(res.status).toBe(409)
  })

  it('clôture done (200)', async () => {
    h.state.result = { data: [{ id: 'task-1' }], error: null }
    const { PATCH } = await import('@/app/api/brain/tasks/[id]/route')
    const res = await PATCH(post(URL + '/tasks/task-1', JSON.stringify({ status: 'done' })), ctx)
    expect(res.status).toBe(200)
  })

  it('refuse un status inconnu (400)', async () => {
    const { PATCH } = await import('@/app/api/brain/tasks/[id]/route')
    const res = await PATCH(post(URL + '/tasks/task-1', JSON.stringify({ status: 'zzz' })), ctx)
    expect(res.status).toBe(400)
  })

  it('refuse un corps non-JSON (400)', async () => {
    const { PATCH } = await import('@/app/api/brain/tasks/[id]/route')
    const res = await PATCH(post(URL + '/tasks/task-1', 'pas du json'), ctx)
    expect(res.status).toBe(400)
  })
})

describe('heartbeat + status', () => {
  it('accepte un heartbeat authentifié (200)', async () => {
    h.state.result = { data: null, error: null }
    const { POST } = await import('@/app/api/brain/heartbeat/route')
    const res = await POST(
      post(URL + '/heartbeat', JSON.stringify({ cpu_percent: 10, ram_percent: 20 }))
    )
    expect(res.status).toBe(200)
  })

  it('refuse un heartbeat non authentifié (401)', async () => {
    const { POST } = await import('@/app/api/brain/heartbeat/route')
    const res = await POST(post(URL + '/heartbeat', JSON.stringify({}), headers()))
    expect(res.status).toBe(401)
  })

  it('status renvoie online=true pour un heartbeat récent', async () => {
    const recent = new Date().toISOString()
    h.state.result = { data: { value: JSON.stringify({ last_seen: recent }) }, error: null }
    const { GET } = await import('@/app/api/brain/status/route')
    const res = await GET(new Request(URL + '/status', { headers: bearer() }))
    expect(res.status).toBe(200)
    expect((await res.json()).online).toBe(true)
  })

  it('status renvoie online=false pour un heartbeat périmé', async () => {
    const stale = new Date(Date.now() - 300_000).toISOString()
    h.state.result = { data: { value: JSON.stringify({ last_seen: stale }) }, error: null }
    const { GET } = await import('@/app/api/brain/status/route')
    const res = await GET(new Request(URL + '/status', { headers: bearer() }))
    expect((await res.json()).online).toBe(false)
  })
})

describe('heartbeat — ecriture conditionnelle (Disk IO)', () => {
  // Le battement ne doit plus reecrire la ligne quand rien n'a change : c'etait
  // 57 % des blocs ecrits de la base (mesure pg_stat_statements du 21/10/2026).
  const bat = (payload: Record<string, unknown>) =>
    post(URL + '/heartbeat', JSON.stringify(payload))

  it('ecrit quand aucun battement precedent n\'existe', async () => {
    h.state.result = { data: null, error: null }
    const { POST } = await import('@/app/api/brain/heartbeat/route')
    const res = await POST(bat({ cpu_percent: 10, ram_percent: 20, active_tasks: 0 }))
    expect(res.status).toBe(200)
    expect((await res.json()).ecrit).toBe(true)
  })

  it('n\'ecrit PAS quand l\'etat est identique et recent', async () => {
    const recent = new Date().toISOString()
    h.state.result = {
      data: { value: JSON.stringify({ cpu_percent: 10, ram_percent: 20, active_tasks: 0, last_seen: recent }) },
      error: null,
    }
    const { POST } = await import('@/app/api/brain/heartbeat/route')
    const res = await POST(bat({ cpu_percent: 10, ram_percent: 20, active_tasks: 0 }))
    expect(res.status).toBe(200)
    expect((await res.json()).ecrit).toBe(false)
  })

  it('ignore un bruit de mesure : 10 % et 12 % ont la meme signature', async () => {
    const recent = new Date().toISOString()
    h.state.result = {
      data: { value: JSON.stringify({ cpu_percent: 10, ram_percent: 20, last_seen: recent }) },
      error: null,
    }
    const { POST } = await import('@/app/api/brain/heartbeat/route')
    const res = await POST(bat({ cpu_percent: 12, ram_percent: 20 }))
    expect((await res.json()).ecrit).toBe(false)
  })

  it('ecrit quand un champ change (active_tasks)', async () => {
    const recent = new Date().toISOString()
    h.state.result = {
      data: { value: JSON.stringify({ active_tasks: 0, last_seen: recent }) },
      error: null,
    }
    const { POST } = await import('@/app/api/brain/heartbeat/route')
    const res = await POST(bat({ active_tasks: 3 }))
    expect((await res.json()).ecrit).toBe(true)
  })

  it('ecrit quand le precedent est trop vieux (garde le statut en ligne)', async () => {
    // Seuil de /api/brain/status : 120 s. On ecrit au plus tard a 90 s.
    const vieux = new Date(Date.now() - 95_000).toISOString()
    h.state.result = {
      data: { value: JSON.stringify({ cpu_percent: 10, last_seen: vieux }) },
      error: null,
    }
    const { POST } = await import('@/app/api/brain/heartbeat/route')
    const res = await POST(bat({ cpu_percent: 10 }))
    expect((await res.json()).ecrit).toBe(true)
  })

  it('ecrit si la lecture du precedent echoue (jamais de silence)', async () => {
    // La lecture echoue, mais l'ecriture doit passer : un battement qui
    // s'abstient parce qu'il n'a pas pu lire ferait passer le Brain hors ligne.
    h.state.result = { data: null, error: null }
    h.state.queue = [
      { data: null, error: { message: 'lecture impossible' } },
      { data: null, error: null },
    ]
    const { POST } = await import('@/app/api/brain/heartbeat/route')
    const res = await POST(bat({ cpu_percent: 10 }))
    expect(res.status).toBe(200)
    expect((await res.json()).ecrit).toBe(true)
  })
})
