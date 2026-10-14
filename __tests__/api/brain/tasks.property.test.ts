import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'

/**
 * Tests de propriété du pont Brain-CMS — propriétés 1, 3 et 5.
 *
 * Spec : `.kiro/specs/brain-cms-bridge/design.md` (Correctness Properties).
 * Chaque propriété doit tenir pour *toutes* les entrées valides, pas seulement
 * pour les exemples choisis à la main : c'est ce que `fast-check` vérifie.
 *
 * Ces tests appellent les handlers réels avec une doublure Supabase stateful
 * (`_supabase-mock.ts`) : on prouve ce que la route a écrit, pas ce qu'elle
 * prétend avoir écrit.
 */

vi.mock('@supabase/supabase-js', async () => {
  const { from } = await import('./_supabase-mock')
  return { createClient: () => ({ from }) }
})

const ALLOWED = ['generate_carousel', 'generate_itinerary', 'run_task', 'chat', 'status'] as const
const BRIDGE_TOKEN = 'bridge-token-test'
const URL = 'http://localhost/api/brain'

const h = await import('./_supabase-mock')

function bearer() {
  const hs = new Headers()
  hs.set('authorization', `Bearer ${BRIDGE_TOKEN}`)
  return hs
}

function post(url: string, body: string) {
  return new Request(url, { method: 'POST', headers: bearer(), body })
}

const env = { ...process.env }

beforeEach(() => {
  h.resetSbState()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://supabase.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test'
  process.env.BRAIN_BRIDGE_TOKEN = BRIDGE_TOKEN
  process.env.CMS_PASSWORD = 'cms-password-test'
})

afterEach(() => {
  process.env = { ...env }
  vi.clearAllMocks()
})

describe('Propriété 1 — le payload est stocké sans modification', () => {
  it('Feature: brain-cms-bridge, Property 1: payload round-trip', async () => {
    const { POST } = await import('@/app/api/brain/tasks/route')

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...ALLOWED),
        fc.jsonValue(),
        async (task_type, payload) => {
          h.resetSbState()
          h.sbState.result = { data: { id: 'x' }, error: null }

          const res = await POST(post(URL + '/tasks', JSON.stringify({ task_type, payload })))
          expect(res.status).toBe(201)

          const row = h.sbState.inserted[0] as Record<string, unknown>
          // Égalité structurelle : c'est la garantie de la propriété 1.
          expect(row.payload).toStrictEqual(payload)
          expect(row.task_type).toBe(task_type)
          expect(row.status).toBe('sent')
          expect(row.agent).toBe('heldonica-brain')
          expect(row.claimed_by).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Propriété 3 — l’allowlist des task_type est exhaustive', () => {
  it('Feature: brain-cms-bridge, Property 3: task type allowlist', async () => {
    const { POST } = await import('@/app/api/brain/tasks/route')

    await fc.assert(
      fc.asyncProperty(
        fc.string().filter((s) => !(ALLOWED as readonly string[]).includes(s)),
        async (task_type) => {
          h.resetSbState()
          const res = await POST(post(URL + '/tasks', JSON.stringify({ task_type })))

          expect(res.status).toBe(400)
          // Aucune ligne ne doit avoir été insérée.
          expect(h.sbState.inserted).toHaveLength(0)
          const body = await res.json()
          expect(body.valid).toEqual([...ALLOWED])
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Propriété 5 — online/offline est une fonction de la récence', () => {
  it('Feature: brain-cms-bridge, Property 5: online/offline determination', async () => {
    const { GET } = await import('@/app/api/brain/status/route')

    // `now` est fixé pour que la borne des 120 s soit testable sans flottement.
    const NOW = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(NOW)

    // Un générateur uniforme sur ±1 jour ne tomberait presque jamais dans la
    // zone des 120 s (±0,04 %), donc ne prouverait rien sur la borne. On tire
    // donc surtout *autour* du seuil, en millisecondes, et un peu partout ailleurs.
    const offsetsMs = fc.oneof(
      { weight: 5, arbitrary: fc.integer({ min: -2_000, max: 2_000 }).map((d) => 120_000 + d) },
      { weight: 2, arbitrary: fc.integer({ min: 0, max: 120_000 }) },
      { weight: 1, arbitrary: fc.integer({ min: -86_400_000, max: 86_400_000 }) }
    )

    await fc.assert(
      fc.asyncProperty(offsetsMs, async (offsetMs) => {
        h.resetSbState()
        const last_seen = new Date(NOW - offsetMs).toISOString()
        h.sbState.result = { data: { value: JSON.stringify({ last_seen }) }, error: null }

        const res = await GET(new Request(URL + '/status', { headers: bearer() }))
        const body = await res.json()

        // Propriété : online ⇔ écart strictement inférieur à 120 000 ms.
        expect(body.online).toBe(offsetMs < 120_000)
      }),
      { numRuns: 300 }
    )

    vi.restoreAllMocks()
  })

  it('la borne exacte de 120 s bascule en offline (et 119 999 ms reste online)', async () => {
    const { GET } = await import('@/app/api/brain/status/route')
    const NOW = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(NOW)

    for (const [offsetMs, expected] of [
      [120_000, false],
      [119_999, true],
      [0, true],
    ] as const) {
      h.resetSbState()
      h.sbState.result = {
        data: { value: JSON.stringify({ last_seen: new Date(NOW - offsetMs).toISOString() }) },
        error: null,
      }
      const res = await GET(new Request(URL + '/status', { headers: bearer() }))
      expect((await res.json()).online).toBe(expected)
    }

    vi.restoreAllMocks()
  })
})
