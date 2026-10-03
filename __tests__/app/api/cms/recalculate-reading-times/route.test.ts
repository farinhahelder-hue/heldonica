import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/cms/recalculate-reading-times/route'
import { requireCmsAuth } from '@/lib/cms-auth'

vi.mock('@/lib/cms-auth', () => ({
  requireCmsAuth: vi.fn(),
}))

const mockUpsert = vi.fn()
const mockSelect = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table) => {
      if (table === 'cms_blog_posts') {
        return { select: mockSelect }
      }
      if (table === 'articles') {
        return { upsert: mockUpsert }
      }
      return {}
    })
  }))
}))

describe('POST /api/cms/recalculate-reading-times', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should update reading times and return correct counts', async () => {
    (requireCmsAuth as any).mockResolvedValue(null)
    mockSelect.mockResolvedValue({
      data: [
        { id: 1, slug: 'test-1', content: 'word '.repeat(200) },
        { id: 2, slug: 'test-2', content: 'word '.repeat(400) }
      ],
      error: null
    })
    mockUpsert.mockResolvedValue({ error: null })

    const req = new Request('http://localhost')
    const response = await POST(req)
    const json = await response.json()

    expect(json.success).toBe(true)
    expect(json.updated).toBe(2)
    expect(json.total).toBe(2)
    expect(mockUpsert).toHaveBeenCalledWith([
      { id: 1, read_time: 1 },
      { id: 2, read_time: 2 }
    ])
  })
})
