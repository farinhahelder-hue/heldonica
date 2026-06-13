import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPublicUrl } from '@/lib/s3-media'

describe('s3-media', () => {
  describe('getPublicUrl', () => {
    const originalEnv = process.env

    beforeEach(() => {
      // Clear all env vars before each test
      vi.stubEnv('AWS_ACCESS_KEY_ID', '')
      vi.stubEnv('AWS_SECRET_ACCESS_KEY', '')
      vi.stubEnv('AWS_S3_BUCKET', '')
      vi.stubEnv('AWS_REGION', '')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('should return empty string when AWS_ACCESS_KEY_ID is missing', () => {
      vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret')
      vi.stubEnv('AWS_S3_BUCKET', 'my-bucket')
      expect(getPublicUrl('test.jpg')).toBe('')
    })

    it('should return empty string when AWS_SECRET_ACCESS_KEY is missing', () => {
      vi.stubEnv('AWS_ACCESS_KEY_ID', 'key')
      vi.stubEnv('AWS_S3_BUCKET', 'my-bucket')
      expect(getPublicUrl('test.jpg')).toBe('')
    })

    it('should return empty string when AWS_S3_BUCKET is missing', () => {
      vi.stubEnv('AWS_ACCESS_KEY_ID', 'key')
      vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret')
      expect(getPublicUrl('test.jpg')).toBe('')
    })

    it('should return correct URL with provided region', () => {
      vi.stubEnv('AWS_ACCESS_KEY_ID', 'key')
      vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret')
      vi.stubEnv('AWS_S3_BUCKET', 'my-bucket')
      vi.stubEnv('AWS_REGION', 'us-east-1')

      expect(getPublicUrl('images/test.jpg')).toBe('https://my-bucket.s3.us-east-1.amazonaws.com/images/test.jpg')
    })

    it('should return correct URL with default region (eu-west-1) when region is missing', () => {
      vi.stubEnv('AWS_ACCESS_KEY_ID', 'key')
      vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'secret')
      vi.stubEnv('AWS_S3_BUCKET', 'my-bucket')

      expect(getPublicUrl('images/test.jpg')).toBe('https://my-bucket.s3.eu-west-1.amazonaws.com/images/test.jpg')
    })
  })
})
