import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-key'
})

const mockUpdateSelect = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ limit: () => Promise.resolve({ data: [], count: 0 }) }),
          or: () => ({ limit: () => Promise.resolve({ data: [], count: 0 }) }),
        }),
        or: () => ({ limit: () => Promise.resolve({ data: [], count: 0 }) }),
      }),
      update: () => ({
        eq: () => ({
          or: () => ({ select: mockUpdateSelect }),
          eq: () => ({ select: mockUpdateSelect }),
        }),
      }),
    }),
  })),
}))

// lib/cms-auth n'est VOLONTAIREMENT pas mocké : le test doit exercer la vraie
// fonction d'authentification. C'est précisément parce que les tests existants
// la mockaient que l'absence de contrôle sur POST n'a jamais été détectée.
import { POST } from '@/app/api/audit-blog/route'

describe('POST /api/audit-blog — contrôle d\'accès', () => {
  const OLD = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateSelect.mockResolvedValue({ data: [], error: null })
  })

  afterEach(() => {
    process.env = { ...OLD }
  })

  it('refuse une requête non authentifiée (401) et ne touche pas la base', async () => {
    process.env.CMS_PASSWORD = 'un-mot-de-passe-de-test'
    const req = new NextRequest('https://heldonica.fr/api/audit-blog', { method: 'POST' })

    const res = await POST(req)

    expect(res.status).toBe(401)
    expect(mockUpdateSelect).not.toHaveBeenCalled()
  })

  it('refuse un mot de passe erroné (401)', async () => {
    process.env.CMS_PASSWORD = 'un-mot-de-passe-de-test'
    const req = new NextRequest('https://heldonica.fr/api/audit-blog', {
      method: 'POST',
      headers: { 'x-cms-auth': 'mauvais-mot-de-passe' },
    })

    const res = await POST(req)

    expect(res.status).toBe(401)
    expect(mockUpdateSelect).not.toHaveBeenCalled()
  })

  it('accepte un mot de passe valide et synchronise les articles', async () => {
    process.env.CMS_PASSWORD = 'un-mot-de-passe-de-test'
    const req = new NextRequest('https://heldonica.fr/api/audit-blog', {
      method: 'POST',
      headers: { 'x-cms-auth': 'un-mot-de-passe-de-test' },
    })

    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(mockUpdateSelect).toHaveBeenCalled()
  })

  it('répond 503 quand CMS_PASSWORD n\'est pas configuré', async () => {
    delete process.env.CMS_PASSWORD
    delete process.env.CMS_SESSION_SECRET
    const req = new NextRequest('https://heldonica.fr/api/audit-blog', { method: 'POST' })

    const res = await POST(req)

    expect(res.status).toBe(503)
    expect(mockUpdateSelect).not.toHaveBeenCalled()
  })
})
