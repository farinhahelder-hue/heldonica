import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../app/api/cms/articles/[id]/snapshot/route'

vi.mock('@/lib/cms-auth', () => ({
  requireCmsAuth: vi.fn().mockResolvedValue(null)
}))

const mockInsert = vi.fn()
const mockSelect = vi.fn()


vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://mock.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'mock-key');

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === 'cms_blog_posts') {
        return {
          select: () => ({
            eq: () => ({
              single: mockSelect
            })
          })
        }
      }
      if (table === 'article_versions') {
        return {
          insert: mockInsert
        }
      }
    }
  })
}))

describe('Snapshot API (POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a snapshot successfully', async () => {
    mockSelect.mockResolvedValue({
      data: {
        title: 'Test Title',
        slug: 'test-slug',
        excerpt: 'Excerpt',
        content: 'Content'
      },
      error: null
    })

    mockInsert.mockResolvedValue({ error: null })

    const req = new Request('http://localhost/api/cms/articles/1/snapshot', {
      method: 'POST'
    })
    const res = await POST(req, { params: Promise.resolve({ id: '1' }) })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      article_id: '1',
      title: 'Test Title',
      slug: 'test-slug'
    }))
  })

  it('should return 404 if article not found', async () => {
    mockSelect.mockResolvedValue({
      data: null,
      error: { message: 'Not found' }
    })

    const req = new Request('http://localhost/api/cms/articles/1/snapshot', {
      method: 'POST'
    })
    const res = await POST(req, { params: Promise.resolve({ id: '1' }) })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.error).toBe('Not found')
  })
})
