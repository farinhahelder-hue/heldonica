import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Le quiz n'a pas de route a lui : il poste sur /api/newsletter en marquant
// l'origine dans `source`. Ces tests verifient ce contrat-la, pas une copie
// du code — une reimplementation du validateur ne prouverait rien.
const mocks = vi.hoisted(() => ({
  subscribers: [] as Array<Record<string, unknown>>,
  sequences: [] as Array<Record<string, unknown>>,
  upsertSubscribers: vi.fn(),
  upsertSequences: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  createServiceClient: () => ({
    from: (table: string) => ({
      upsert:
        table === 'newsletter_subscribers'
          ? mocks.upsertSubscribers
          : mocks.upsertSequences,
    }),
  }),
}))

import { POST } from '@/app/api/newsletter/route'

function req(body: unknown, ip = '10.0.0.1') {
  return new NextRequest('http://localhost:3000/api/newsletter', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

describe('quiz -> /api/newsletter', () => {
  beforeEach(() => {
    mocks.subscribers.length = 0
    mocks.sequences.length = 0
    mocks.upsertSubscribers.mockReset().mockImplementation(async (row: Record<string, unknown>) => {
      mocks.subscribers.push(row)
      return { error: null }
    })
    mocks.upsertSequences.mockReset().mockImplementation(async (rows: Array<Record<string, unknown>>) => {
      mocks.sequences.push(...rows)
      return { error: null }
    })
    // Sans cle, la route saute l'envoi Resend : le test reste hors reseau.
    delete process.env.RESEND_API_KEY
  })

  it('enregistre le profil du quiz comme source', async () => {
    const res = await POST(req({ email: 'couple@example.com', source: 'quiz-nature' }))

    expect(res.status).toBe(200)
    expect(mocks.subscribers).toEqual([{ email: 'couple@example.com', source: 'quiz-nature' }])
  })

  it('retombe sur popup quand la source est absente', async () => {
    await POST(req({ email: 'couple@example.com' }))

    expect(mocks.subscribers[0].source).toBe('popup')
  })

  it("n'ecrit pas une source arbitraire venue du client", async () => {
    await POST(req({ email: 'couple@example.com', source: 'quiz-a;drop--table' }))

    expect(mocks.subscribers[0].source).toBe('popup')
  })

  it('refuse une adresse invalide sans rien stocker', async () => {
    const res = await POST(req({ email: 'pas-une-adresse', source: 'quiz-culture' }))

    expect(res.status).toBe(400)
    expect(mocks.subscribers).toHaveLength(0)
  })

  it('accepte silencieusement le honeypot sans rien enregistrer', async () => {
    const res = await POST(
      req({ email: 'robot@example.com', website_url: 'http://spam.example', source: 'quiz-nature' })
    )

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ success: true })
    expect(mocks.subscribers).toHaveLength(0)
  })

  it('programme les sequences J+3 et J+7', async () => {
    await POST(req({ email: 'couple@example.com', source: 'quiz-bien-etre' }, '10.0.0.4'))

    expect(mocks.sequences).toHaveLength(2)
    expect(mocks.sequences.map((s) => s.step)).toEqual([2, 3])
  })

  it('bloque au-dela de dix demandes par minute et par IP', async () => {
    for (let i = 0; i < 10; i++) {
      await POST(req({ email: `couple${i}@example.com`, source: 'quiz-aventure' }, '10.0.0.99'))
    }

    const res = await POST(req({ email: 'onze@example.com', source: 'quiz-aventure' }, '10.0.0.99'))

    expect(res.status).toBe(429)
    expect(mocks.subscribers).toHaveLength(10)
  })
})
