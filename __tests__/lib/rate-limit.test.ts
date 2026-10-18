import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * lib/rate-limit.ts — compteur en mémoire, deux API partagées.
 *
 * `rateLimit` (IP seule) et `checkRateLimit` (IP + préfixe d'usage) cohabitent
 * dans la même Map : sans préfixe, une newsletter épuiserait le budget du
 * formulaire de voyage pour la même personne.
 */

let rateLimit: typeof import('@/lib/rate-limit').rateLimit
let checkRateLimit: typeof import('@/lib/rate-limit').checkRateLimit
let getClientIp: typeof import('@/lib/rate-limit').getClientIp

beforeEach(async () => {
  vi.useFakeTimers()
  const mod = await import('@/lib/rate-limit')
  rateLimit = mod.rateLimit
  checkRateLimit = mod.checkRateLimit
  getClientIp = mod.getClientIp
})

afterEach(() => {
  vi.useRealTimers()
})

describe('rateLimit', () => {
  it('laisse passer la première requête puis bloque au-delà du plafond', () => {
    const ip = 'rl-ip-1'
    expect(rateLimit(ip, 3, 60_000)).toBe(true)
    expect(rateLimit(ip, 3, 60_000)).toBe(true)
    expect(rateLimit(ip, 3, 60_000)).toBe(true)
    expect(rateLimit(ip, 3, 60_000)).toBe(false)
    expect(rateLimit(ip, 3, 60_000)).toBe(false)
  })

  it('les IP ont des budgets indépendants', () => {
    expect(rateLimit('rl-ip-a', 1, 60_000)).toBe(true)
    expect(rateLimit('rl-ip-b', 1, 60_000)).toBe(true)
    expect(rateLimit('rl-ip-a', 1, 60_000)).toBe(false)
  })

  it('la fenêtre glissante se rouvre une fois expirée', () => {
    const ip = 'rl-ip-fenetre'
    expect(rateLimit(ip, 1, 60_000)).toBe(true)
    expect(rateLimit(ip, 1, 60_000)).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(rateLimit(ip, 1, 60_000)).toBe(true)
  })
})

describe('checkRateLimit', () => {
  it('annonce le budget restant à chaque appel', () => {
    const r1 = checkRateLimit('cl-ip-1', { limit: 3, prefix: 'contact' })
    expect(r1).toMatchObject({ success: true, limit: 3, remaining: 2 })
    const r2 = checkRateLimit('cl-ip-1', { limit: 3, prefix: 'contact' })
    expect(r2.remaining).toBe(1)
    const r3 = checkRateLimit('cl-ip-1', { limit: 3, prefix: 'contact' })
    expect(r3).toMatchObject({ success: true, remaining: 0 })
  })

  it('refuse au-delà du plafond et garde le reset de la fenêtre en cours', () => {
    const premier = checkRateLimit('cl-ip-2', { limit: 1, prefix: 'contact' })
    const refuse = checkRateLimit('cl-ip-2', { limit: 1, prefix: 'contact' })
    expect(refuse.success).toBe(false)
    expect(refuse.remaining).toBe(0)
    expect(refuse.reset).toBe(premier.reset)
  })

  it('des préfixes distincts nourrissent des budgets séparés pour la même IP', () => {
    const contact = checkRateLimit('cl-ip-3', { limit: 1, prefix: 'contact' })
    const newsletter = checkRateLimit('cl-ip-3', { limit: 1, prefix: 'newsletter' })
    expect(contact.success).toBe(true)
    expect(newsletter.success).toBe(true)
    // Une fois le budget contact épuisé, le newsletter tient encore.
    expect(checkRateLimit('cl-ip-3', { limit: 1, prefix: 'contact' }).success).toBe(false)
    expect(checkRateLimit('cl-ip-3', { limit: 1, prefix: 'newsletter' }).success).toBe(false)
  })

  it('la fenêtre du préfixe se rouvre aussi à l’expiration', () => {
    expect(checkRateLimit('cl-ip-4', { limit: 1, prefix: 'guide-download' }).success).toBe(true)
    expect(checkRateLimit('cl-ip-4', { limit: 1, prefix: 'guide-download' }).success).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit('cl-ip-4', { limit: 1, prefix: 'guide-download' }).success).toBe(true)
  })

  it('respecte une fenêtre personnalisée', () => {
    expect(checkRateLimit('cl-ip-5', { limit: 1, prefix: 'court', windowMs: 1_000 }).success).toBe(true)
    expect(checkRateLimit('cl-ip-5', { limit: 1, prefix: 'court', windowMs: 1_000 }).success).toBe(false)
    vi.advanceTimersByTime(1_001)
    expect(checkRateLimit('cl-ip-5', { limit: 1, prefix: 'court', windowMs: 1_000 }).success).toBe(true)
  })
})

describe('getClientIp', () => {
  function requete(entetes: Record<string, string>) {
    return { headers: new Headers(entetes) } as Request
  }

  it('prend la première adresse d’une liste x-forwarded-for', () => {
    expect(getClientIp(requete({ 'x-forwarded-for': ' 203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7')
  })

  it('retombe sur x-real-ip sans forwarded-for', () => {
    expect(getClientIp(requete({ 'x-real-ip': '198.51.100.4' }))).toBe('198.51.100.4')
  })

  it('renvoie « unknown » sans aucun en-tête exploitable', () => {
    expect(getClientIp(requete({}))).toBe('unknown')
  })
})
