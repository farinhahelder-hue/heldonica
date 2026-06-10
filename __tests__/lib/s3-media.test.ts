import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPublicUrl } from '../../lib/s3-media'

describe('s3-media', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getPublicUrl', () => {
    it('should return empty string when S3 config is missing', () => {
      delete process.env.AWS_ACCESS_KEY_ID
      delete process.env.AWS_SECRET_ACCESS_KEY
      delete process.env.AWS_S3_BUCKET

      expect(getPublicUrl('test-image.jpg')).toBe('')
    })

    it('should return empty string if bucket is missing', () => {
      process.env.AWS_ACCESS_KEY_ID = 'test-key'
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
      delete process.env.AWS_S3_BUCKET

      expect(getPublicUrl('test-image.jpg')).toBe('')
    })

    it('should return correct public URL with default region (eu-west-1)', () => {
      process.env.AWS_ACCESS_KEY_ID = 'test-key'
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
      process.env.AWS_S3_BUCKET = 'my-test-bucket'
      delete process.env.AWS_REGION

      expect(getPublicUrl('folder/image.png')).toBe('https://my-test-bucket.s3.eu-west-1.amazonaws.com/folder/image.png')
    })

    it('should return correct public URL with custom region', () => {
      process.env.AWS_ACCESS_KEY_ID = 'test-key'
      process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
      process.env.AWS_S3_BUCKET = 'my-test-bucket'
      process.env.AWS_REGION = 'us-east-1'

      expect(getPublicUrl('test.jpg')).toBe('https://my-test-bucket.s3.us-east-1.amazonaws.com/test.jpg')
    })
  })
})
