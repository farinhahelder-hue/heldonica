import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Tâche 11.1 — intégration du pont, de bout en bout.
 *
 * Un POST dispatch une tâche, un faux Brain la réclame puis la clôt, et le GET
 * la relit. Les handlers sont les routes **réelles** ; seule la base est
 * remplacée par une doublure stateful, ce qui permet de vérifier la chaîne
 * complète des statuts sans écrire dans Supabase.
 *
 * Le nom « integration » de la spec supposait `supabase start`. Écrire dans une
 * vraie base depuis un test laisserait des lignes derrière lui et pourrait
 * polluer `agent_tasks` — la table qui coordonne tous les agents. On teste donc
 * la chaîne HTTP complète, mais contre une base simulée.
 */

vi.mock('@supabase/supabase-js', async () => {
  const { from } = await import('../api/brain/_supabase-mock')
  return { createClient: () => ({ from }) }
})

const BRIDGE_TOKEN = 'bridge-token-test'
const URL = 'http://localhost/api/brain'

const h = await import('../api/brain/_supabase-mock')

function bearer() {
  const hs = new Headers()
  hs.set('authorization', `Bearer ${BRIDGE_TOKEN}`)
  return hs
}

const env = { ...process.env }

beforeEach(() => {
  h.resetSbState()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
  process.env.BRAIN_BRIDGE_TOKEN = BRIDGE_TOKEN
})

afterEach(() => {
  process.env = { ...env }
  vi.clearAllMocks()
})

describe('pont Brain-CMS — chaîne complète', () => {
  it('dispatch → claim → clôture done → relecture', async () => {
    const tasks = await import('@/app/api/brain/tasks/route')
    const taskId = await import('@/app/api/brain/tasks/[id]/route')
    const ctx = { params: Promise.resolve({ id: 'task-1' }) }

    // 1. Dispatch
    h.sbState.result = { data: { id: 'task-1' }, error: null }
    const dispatched = await tasks.POST(
      new Request(URL + '/tasks', {
        method: 'POST',
        headers: bearer(),
        body: JSON.stringify({ task_type: 'chat', payload: { message: 'bonjour' } }),
      })
    )
    expect(dispatched.status).toBe(201)
    expect(await dispatched.json()).toEqual({ id: 'task-1' })

    // 2. Claim
    h.sbState.result = { data: [{ id: 'task-1' }], error: null }
    const claimed = await taskId.PATCH(
      new Request(URL + '/tasks/task-1', {
        method: 'PATCH',
        headers: bearer(),
        body: JSON.stringify({ status: 'in_progress', claimed_by: 'heldonica-brain' }),
      }),
      ctx
    )
    expect(claimed.status).toBe(200)

    // 3. Clôture
    h.sbState.result = { data: [{ id: 'task-1' }], error: null }
    const closed = await taskId.PATCH(
      new Request(URL + '/tasks/task-1', {
        method: 'PATCH',
        headers: bearer(),
        body: JSON.stringify({
          status: 'done',
          actions_done: { result: { reply: 'bonjour' }, corrige: [], verifie: [], non_verifie: [], reste_a_faire: [] },
        }),
      }),
      ctx
    )
    expect(closed.status).toBe(200)

    // 4. Relecture
    h.sbState.result = {
      data: { id: 'task-1', status: 'done', actions_done: { result: { reply: 'bonjour' } } },
      error: null,
    }
    const read = await taskId.GET(new Request(URL + '/tasks/task-1', { headers: bearer() }), ctx)
    expect(read.status).toBe(200)
    const body = await read.json()
    expect(body.task.status).toBe('done')
    expect(body.task.actions_done.result.reply).toBe('bonjour')
  })

  it('heartbeat → status : online=true juste après un battement', async () => {
    const heartbeat = await import('@/app/api/brain/heartbeat/route')
    const status = await import('@/app/api/brain/status/route')

    h.sbState.result = { data: null, error: null }
    const beat = await heartbeat.POST(
      new Request(URL + '/heartbeat', {
        method: 'POST',
        headers: bearer(),
        body: JSON.stringify({ cpu_percent: 12, ram_percent: 58, ollama_running: true }),
      })
    )
    expect(beat.status).toBe(200)
    expect(await beat.json()).toEqual({ ok: true })

    // Le battement vient d'être écrit : le statut doit dire online.
    h.sbState.result = {
      data: { value: JSON.stringify({ last_seen: new Date().toISOString(), cpu_percent: 12 }) },
      error: null,
    }
    const read = await status.GET(new Request(URL + '/status', { headers: bearer() }))
    expect((await read.json()).online).toBe(true)
  })

  it('aucun heartbeat connu → online=false, last_seen=null', async () => {
    const status = await import('@/app/api/brain/status/route')
    h.sbState.result = { data: null, error: null }

    const read = await status.GET(new Request(URL + '/status', { headers: bearer() }))
    expect(await read.json()).toEqual({ online: false, last_seen: null })
  })

  it('la clôture d’une tâche inconnue renvoie 404', async () => {
    const taskId = await import('@/app/api/brain/tasks/[id]/route')
    h.sbState.result = { data: [], error: null }

    const res = await taskId.PATCH(
      new Request(URL + '/tasks/inconnu', {
        method: 'PATCH',
        headers: bearer(),
        body: JSON.stringify({ status: 'done' }),
      }),
      { params: Promise.resolve({ id: 'inconnu' }) }
    )
    expect(res.status).toBe(404)
  })
})
