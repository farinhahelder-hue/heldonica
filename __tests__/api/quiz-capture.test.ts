import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mocks Supabase et Resend
const mockSubscribersUpsert = vi.fn()
const mockSequencesUpsert = vi.fn()
const mockEmailsSend = vi.fn()

vi.mock('@/lib/supabase', () => ({
  createServiceClient: () => ({
    from: (table: string) => {
      if (table === 'newsletter_subscribers') {
        return {
          upsert: mockSubscribersUpsert.mockResolvedValue({ error: null }),
        }
      }
      if (table === 'email_sequences') {
        return {
          upsert: mockSequencesUpsert.mockResolvedValue({ error: null }),
        }
      }
      return {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      }
    },
  }),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: mockEmailsSend.mockResolvedValue({ data: { id: 'test-email-id' }, error: null }),
    }
  },
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: () => ({ success: true }),
  getClientIp: () => '127.0.0.1',
}))

import { POST } from '@/app/api/newsletter/route'

describe('Capture email au quiz (/api/newsletter)', () => {
  const originalEnv = process.env.RESEND_API_KEY

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.RESEND_API_KEY = 're_test_dummy_key'
  })

  it('enregistre un abonné issu du quiz avec source personnalisée et profil', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({
        email: 'voyageur@heldonica.fr',
        consent: true,
        source: 'quiz-aventure',
        profil: "L'Aventurier",
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.source).toBe('quiz-aventure')

    // Vérifie le stockage Supabase
    expect(mockSubscribersUpsert).toHaveBeenCalledWith(
      { email: 'voyageur@heldonica.fr', source: 'quiz-aventure' },
      { onConflict: 'email' }
    )

    // Vérifie la programmation des séquences J+3 et J+7
    expect(mockSequencesUpsert).toHaveBeenCalledTimes(1)

    // Vérifie l'envoi de l'email Resend adapté au quiz
    expect(mockEmailsSend).toHaveBeenCalledTimes(1)
    const emailArgs = mockEmailsSend.mock.calls[0][0]
    expect(emailArgs.to).toEqual(['voyageur@heldonica.fr'])
    expect(emailArgs.subject).toBe('Ton profil voyageur Heldonica')
    expect(emailArgs.html).toContain("Ton profil voyageur est prêt")
    expect(emailArgs.html).toContain("Profil : L'Aventurier")
  })

  it('déduit la source quiz-<profil> si profil fourni sans source', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({
        email: 'slow@heldonica.fr',
        consent: true,
        profil: 'nature',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.source).toBe('quiz-nature')

    expect(mockSubscribersUpsert).toHaveBeenCalledWith(
      { email: 'slow@heldonica.fr', source: 'quiz-nature' },
      { onConflict: 'email' }
    )
  })

  it('rejette les bots via le champ piège honeypot sans écrire en base', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({
        email: 'bot@spam.com',
        website_url: 'https://spam-bot.xyz',
        source: 'quiz-aventure',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.success).toBe(true)
    expect(mockSubscribersUpsert).not.toHaveBeenCalled()
    expect(mockEmailsSend).not.toHaveBeenCalled()
  })

  it('renvoie 400 en cas dadresse email invalide', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({
        email: 'pas-un-email',
        source: 'quiz-culture',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toBe('Adresse email invalide')
    expect(mockSubscribersUpsert).not.toHaveBeenCalled()
  })

  it('refuse une inscription sans consentement explicite', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({
        email: 'sans-consentement@heldonica.fr',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toBe('Consentement requis')
    expect(mockSubscribersUpsert).not.toHaveBeenCalled()
    expect(mockEmailsSend).not.toHaveBeenCalled()
  })

  it('utilise popup par défaut pour les inscriptions classiques', async () => {
    const req = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({
        email: 'lecteur@heldonica.fr',
        consent: true,
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const data = await res.json()
    expect(data.source).toBe('popup')

    expect(mockSubscribersUpsert).toHaveBeenCalledWith(
      { email: 'lecteur@heldonica.fr', source: 'popup' },
      { onConflict: 'email' }
    )

    const emailArgs = mockEmailsSend.mock.calls[0][0]
    expect(emailArgs.subject).toBe("Bienvenue dans l'aventure Heldonica")
  })
})
