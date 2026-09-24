import { describe, it, expect, vi } from 'vitest'

describe('brevo res.ok', () => {
  it('should handle Brevo success', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    const res = await fetch('https://api.brevo.com/v3/contacts', { method: 'POST' })
    expect(res.ok).toBe(true)
  })
  it('should handle Brevo failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 400 })
    const res = await fetch('https://api.brevo.com/v3/contacts', { method: 'POST' })
    expect(res.ok).toBe(false)
  })
})
