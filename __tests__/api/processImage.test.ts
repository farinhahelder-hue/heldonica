import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../app/api/uploads/image/route'

vi.mock('@/lib/cms-auth', () => ({
  requireCmsAuth: vi.fn().mockResolvedValue(null)
}))


const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()


vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://mock.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'mock-key');

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    storage: {
      from: (bucket: string) => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      })
    }
  })
}))

const mockToBuffer = vi.fn().mockResolvedValue(Buffer.from('mock-optimized-buffer'))
const mockWebp = vi.fn(() => ({ toBuffer: mockToBuffer }))
const mockResize = vi.fn(() => ({ webp: mockWebp, toBuffer: mockToBuffer }))

vi.mock('sharp', () => {
  return {
    default: vi.fn(() => ({
      resize: mockResize,
      webp: mockWebp,
      toBuffer: mockToBuffer
    }))
  }
})

describe('Image Upload API (POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should process and upload image successfully', async () => {
    mockUpload.mockResolvedValue({ error: null })
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://mock.url/image.webp' } })

    const formData = new FormData()
    const file = new File(['mock content'], 'test.jpg', { type: 'image/jpeg' })
    formData.append('file', file)

    const req = new Request('http://localhost/api/uploads/image', {
      method: 'POST',
      body: formData
    })

    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.url).toBe('https://mock.url/image.webp')
    expect(mockResize).toHaveBeenCalledWith({ width: 1200, withoutEnlargement: true })
    expect(mockUpload).toHaveBeenCalled()
  })
})
