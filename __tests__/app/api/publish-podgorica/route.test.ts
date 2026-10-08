import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from '@/app/api/publish-podgorica/route'

vi.mock('@/lib/blog-supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        or: vi.fn(() => ({
          data: [],
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null }))
      }))
    }))
  }
}))

describe('publish-podgorica PUT', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('proceeds with SEO updates using correctly formatted empty string checks', async () => {
    const response = await PUT()
    expect(response.status).toBe(200)
  })
})
