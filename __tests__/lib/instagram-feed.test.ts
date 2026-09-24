import { describe, it, expect, vi } from 'vitest'

describe('instagram-feed', () => {
  it('should fetch feed', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) })
    const { getInstagramFeed } = await import('@/lib/instagram-feed')
    const feed = await getInstagramFeed()
    expect(Array.isArray(feed)).toBe(true)
  })
})
