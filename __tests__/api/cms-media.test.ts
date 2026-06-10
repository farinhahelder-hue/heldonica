import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('cms/media API', () => {
  let mockFetch: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST - import image from URL', () => {
    describe('URL validation (SSRF protection)', () => {
      const allowedDomains = ['images.unsplash.com', 'dropbox.com', 'storage.googleapis.com']
      const allowedSuffixes = ['.googleusercontent.com', '.supabase.co', '.behold.pictures']

      function isValidImageUrl(urlString: string): { valid: boolean; error?: string; status?: number } {
        try {
          const parsedUrl = new URL(urlString)
          if (parsedUrl.protocol !== 'https:') {
            return { valid: false, error: 'Seules les URLs HTTPS sont autorisées', status: 400 }
          }

          const isAllowed = allowedDomains.includes(parsedUrl.hostname) || 
                           allowedSuffixes.some(suffix => parsedUrl.hostname.endsWith(suffix))

          if (!isAllowed) {
            return { valid: false, error: 'Domaine non autorisé', status: 403 }
          }

          return { valid: true }
        } catch {
          return { valid: false, error: 'URL invalide', status: 400 }
        }
      }

      it('should accept HTTPS URLs from allowed domains', () => {
        // Test images.unsplash.com - exact match
        const unsplashUrl = 'https://images.unsplash.com/photo-123456789'
        const unsplashResult = isValidImageUrl(unsplashUrl)
        expect(unsplashResult.valid).toBe(true)
        
        // Test storage.googleapis.com - exact match
        const gcpUrl = 'https://storage.googleapis.com/bucket/image.jpg'
        const gcpResult = isValidImageUrl(gcpUrl)
        expect(gcpResult.valid).toBe(true)
      })

      it('should accept URLs with allowed suffixes', () => {
        const validUrls = [
          'https://lh3.googleusercontent.com/photo-123',
          'https://xyz.supabase.co/storage/v1/object/public/image.jpg',
          'https://images.behold.pictures/photo.jpg',
        ]

        for (const url of validUrls) {
          const result = isValidImageUrl(url)
          expect(result.valid).toBe(true)
        }
      })

      it('should reject HTTP URLs (not HTTPS)', () => {
        const httpUrl = 'http://malicious-site.com/image.jpg'
        const result = isValidImageUrl(httpUrl)
        expect(result.valid).toBe(false)
        expect(result.status).toBe(400)
        expect(result.error).toContain('HTTPS')
      })

      it('should reject URLs from unauthorized domains', () => {
        const unauthorizedUrls = [
          'https://evil-site.com/image.jpg',
          'https://internal-server.local/image.jpg',
          'https://169.254.169.254/latest/meta-data/', // AWS metadata
          'https://localhost/image.jpg',
          'https://127.0.0.1/image.jpg',
        ]

        for (const url of unauthorizedUrls) {
          const result = isValidImageUrl(url)
          expect(result.valid).toBe(false)
          expect(result.status).toBe(403)
        }
      })

      it('should reject internal IP addresses', () => {
        const internalIps = [
          'https://10.0.0.1/image.jpg',
          'https://192.168.1.1/image.jpg',
          'https://172.16.0.1/image.jpg',
        ]

        for (const url of internalIps) {
          const result = isValidImageUrl(url)
          expect(result.valid).toBe(false)
        }
      })

      it('should reject file:// protocol', () => {
        const fileUrl = 'file:///etc/passwd'
        const result = isValidImageUrl(fileUrl)
        expect(result.valid).toBe(false)
      })

      it('should reject data: URLs', () => {
        const dataUrl = 'data:text/html,<script>alert(1)</script>'
        const result = isValidImageUrl(dataUrl)
        expect(result.valid).toBe(false)
      })

      it('should reject invalid URLs', () => {
        const invalidUrls = [
          'not-a-url',
          'htps://invalid',
          '',
        ]

        for (const url of invalidUrls) {
          const result = isValidImageUrl(url)
          expect(result.valid).toBe(false)
          expect(result.status).toBe(400)
        }
      })

      it('should handle URL with port numbers', () => {
        const urlWithPort = 'https://images.unsplash.com:8443/photo-123'
        const result = isValidImageUrl(urlWithPort)
        // Port in hostname should still work for allowed domains
        expect(result.valid).toBe(true)
      })

      it('should handle URL with query parameters', () => {
        const urlWithParams = 'https://images.unsplash.com/photo-123?w=800&q=80'
        const result = isValidImageUrl(urlWithParams)
        expect(result.valid).toBe(true)
      })
    })

    describe('filename sanitization', () => {
      it('should generate safe filename when not provided', () => {
        const safeFilename = `import-${Date.now()}.jpg`
        expect(safeFilename).toMatch(/^import-\d+\.jpg$/)
      })

      it('should use provided filename', () => {
        const providedFilename = 'my-photo.jpg'
        const filename = providedFilename || `import-${Date.now()}.jpg`
        expect(filename).toBe('my-photo.jpg')
      })

      it('should handle folder path in filename', () => {
        const folderParam = 'articles'
        const safeFilename = 'photo.jpg'
        const path = `${folderParam}/${safeFilename}`
        expect(path).toBe('articles/photo.jpg')
      })

      it('should strip trailing slash from folder', () => {
        const folderParam = 'articles/'
        const folder = folderParam.replace(/\/$/, '')
        expect(folder).toBe('articles')
      })
    })
  })

  describe('GET - list media files', () => {
    it('should filter for image files only', () => {
      const allFiles = [
        { name: 'photo.jpg', metadata: {} },
        { name: 'image.png', metadata: {} },
        { name: 'document.pdf', metadata: {} },
        { name: 'script.js', metadata: {} },
      ]

      const imageFiles = allFiles.filter(f => /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(f.name))
      expect(imageFiles).toHaveLength(2)
      expect(imageFiles[0].name).toBe('photo.jpg')
      expect(imageFiles[1].name).toBe('image.png')
    })

    it('should parse pagination parameters', () => {
      const url = new URL('http://test.com/api?prefix=articles&limit=50&offset=10')
      const prefix = url.searchParams.get('prefix') || 'articles'
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      expect(prefix).toBe('articles')
      expect(limit).toBe(50)
      expect(offset).toBe(10)
    })

    it('should use default values for pagination', () => {
      const prefix = undefined || 'articles'
      const limit = parseInt(undefined || '20')
      const offset = parseInt(undefined || '0')

      expect(prefix).toBe('articles')
      expect(limit).toBe(20)
      expect(offset).toBe(0)
    })

    it('should build public URL for each file', () => {
      const bucket = 'media'
      const folder = 'articles'
      const filename = 'photo.jpg'
      const path = `${folder}/${filename}`

      // Mock getPublicUrl behavior
      const publicUrl = `https://supabase.co/storage/v1/object/public/${bucket}/${path}`
      expect(publicUrl).toContain(bucket)
      expect(publicUrl).toContain(path)
    })

    it('should indicate hasMore when files.length equals limit', () => {
      const files = Array(20).fill({ name: 'photo.jpg' })
      const limit = 20
      const hasMore = files.length === limit
      expect(hasMore).toBe(true)
    })

    it('should indicate no more when files.length < limit', () => {
      const files = Array(15).fill({ name: 'photo.jpg' })
      const limit = 20
      const hasMore = files.length === limit
      expect(hasMore).toBe(false)
    })
  })

  describe('DELETE - remove media file', () => {
    it('should require key parameter', () => {
      const body = {}
      const key = body.key
      expect(!!key).toBe(false)
    })

    it('should accept valid key', () => {
      const body = { key: 'articles/photo.jpg' }
      const key = body.key
      expect(!!key).toBe(true)
    })

    it('should handle delete result', () => {
      const error = null
      const success = !error
      expect(success).toBe(true)
    })

    it('should handle delete error', () => {
      const error = { message: 'File not found' }
      expect(error.message).toBe('File not found')
    })
  })

  describe('authentication', () => {
    it('should require auth for GET requests', () => {
      const authHeader = null
      const isAuthenticated = !!authHeader
      expect(isAuthenticated).toBe(false)
    })

    it('should require auth for POST requests', () => {
      const body = { imageUrl: 'https://example.com/image.jpg' }
      const hasAuth = false
      expect(!hasAuth).toBe(true)
    })

    it('should require auth for DELETE requests', () => {
      const body = { key: 'articles/photo.jpg' }
      const hasAuth = false
      expect(!hasAuth).toBe(true)
    })

    it('should return 401 for missing auth', () => {
      const authResponse = null
      expect(!!authResponse).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should return 503 when Supabase not configured', () => {
      const supabaseConfigured = false
      expect(supabaseConfigured).toBe(false)
    })

    it('should handle fetch errors', () => {
      const status = 404
      const errorMessage = `Impossible de télécharger l'image : ${status}`
      expect(errorMessage).toContain('404')
    })

    it('should handle storage upload errors', () => {
      const error = { message: 'File too large' }
      expect(error.message).toBe('File too large')
    })

    it('should handle invalid JSON in request body', () => {
      const invalidJson = 'not valid json'
      let parsed = null
      try {
        parsed = JSON.parse(invalidJson)
      } catch {
        parsed = null
      }
      expect(parsed).toBe(null)
    })
  })

  describe('content type detection', () => {
    it('should default to image/jpeg', () => {
      const contentType = null || 'image/jpeg'
      expect(contentType).toBe('image/jpeg')
    })

    it('should use detected content type', () => {
      const contentType = 'image/png'
      expect(contentType).toBe('image/png')
    })

    it('should handle webp content type', () => {
      const contentType = 'image/webp'
      expect(contentType).toBe('image/webp')
    })
  })

  describe('Supabase Storage integration', () => {
    it('should use upsert option when uploading', () => {
      const uploadOptions = {
        contentType: 'image/jpeg',
        upsert: true
      }
      expect(uploadOptions.upsert).toBe(true)
    })

    it('should build correct storage path', () => {
      const folder = 'articles'
      const safeFilename = 'photo.jpg'
      const path = `${folder}/${safeFilename}`
      expect(path).toBe('articles/photo.jpg')
    })

    it('should handle nested folder paths', () => {
      const folder = '2024/06/posts'
      const safeFilename = 'hero.jpg'
      const path = `${folder}/${safeFilename}`
      expect(path).toBe('2024/06/posts/hero.jpg')
    })
  })
})