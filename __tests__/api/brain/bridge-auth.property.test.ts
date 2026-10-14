import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'

/**
 * Tests de propriété du pont Brain-CMS — propriétés 2 et 4.
 *
 * Spec : `.kiro/specs/brain-cms-bridge/design.md` (Correctness Properties).
 *
 * P2 est la garantie la plus importante du pont : deux pollers qui réclament la
 * même tâche au même instant ne doivent jamais l'exécuter deux fois. P4 vérifie
 * qu'un jeton invalide ne touche jamais la base.
 */

vi.mock('@supabase/supabase-js', async () => {
  const { from } = await import('./_supabase-mock')
  return { createClient: () => ({ from }) }
})

const BRIDGE_TOKEN = 'bridge-token-test'
const CMS_PASSWORD = 'cms-password-test'
const URL = 'http://localhost/api/brain'

const h = await import('./_supabase-mock')

const ctx = { params: Promise.resolve({ id: 'task-1' }) }

function headers(extra: Record<string, string> = {}) {
  const hs = new Headers()
  for (const [k, v] of Object.entries(extra)) hs.set(k, v)
  return hs
}

const env = { ...process.env }

beforeEach(() => {
  h.resetSbState()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
  process.env.BRAIN_BRIDGE_TOKEN = BRIDGE_TOKEN
  process.env.CMS_PASSWORD = CMS_PASSWORD
})

afterEach(() => {
  process.env = { ...env }
  vi.clearAllMocks()
})

describe('Propriété 2 — atomicité du claim : un seul gagnant', () => {
  it('Feature: brain-cms-bridge, Property 2: claim atomicity', async () => {
    const { PATCH } = await import('@/app/api/brain/tasks/[id]/route')

    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 2, max: 10 }), async (concurrency) => {
        h.resetSbState()
        // La doublure simule « UPDATE … WHERE status='sent' » : le premier
        // appel affecte une ligne, tous les suivants zéro.
        h.sbState.claimAtomic = true

        const bodies = Array.from({ length: concurrency }, () =>
          PATCH(
            new Request(URL + '/tasks/task-1', {
              method: 'PATCH',
              headers: headers({ authorization: `Bearer ${BRIDGE_TOKEN}` }),
              body: JSON.stringify({ status: 'in_progress', claimed_by: 'heldonica-brain' }),
            }),
            ctx
          )
        )

        const responses = await Promise.all(bodies)
        const statuses = responses.map((r) => r.status)

        const winners = statuses.filter((s) => s === 200).length
        const conflicts = statuses.filter((s) => s === 409).length

        // Exactement un claim aboutit, tous les autres sont en conflit.
        expect(winners).toBe(1)
        expect(conflicts).toBe(concurrency - 1)
      }),
      { numRuns: 100 }
    )
  })
})

describe('Propriété 4 — l’authentification rejette tout jeton invalide', () => {
  it('Feature: brain-cms-bridge, Property 4: auth rejects invalid tokens', async () => {
    const { requireBridgeAuth } = await import('@/lib/bridge-auth')

    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => s !== BRIDGE_TOKEN),
        async (candidate) => {
          const res = await requireBridgeAuth({
            headers: headers({ authorization: `Bearer ${candidate}` }),
          } as Request)

          expect(res?.status).toBe(401)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('un jeton invalide ne touche jamais la base', async () => {
    const { POST } = await import('@/app/api/brain/tasks/route')
    h.resetSbState()

    const res = await POST(
      new Request(URL + '/tasks', {
        method: 'POST',
        headers: headers({ authorization: 'Bearer pas-le-bon-jeton' }),
        body: JSON.stringify({ task_type: 'chat' }),
      })
    )

    expect(res.status).toBe(401)
    expect(h.from).not.toHaveBeenCalled()
    expect(h.sbState.inserted).toHaveLength(0)
  })

  it('le 503 « jeton non configuré » ne touche pas non plus la base', async () => {
    delete process.env.BRAIN_BRIDGE_TOKEN
    const { POST } = await import('@/app/api/brain/tasks/route')
    h.resetSbState()

    const res = await POST(
      new Request(URL + '/tasks', {
        method: 'POST',
        headers: headers({ authorization: `Bearer ${BRIDGE_TOKEN}` }),
        body: JSON.stringify({ task_type: 'chat' }),
      })
    )

    expect(res.status).toBe(503)
    expect(h.from).not.toHaveBeenCalled()
  })
})
