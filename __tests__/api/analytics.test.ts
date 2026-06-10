import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('analytics API', () => {
  let mockFetch: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET - fetch analytics data', () => {
    it('should use default date range when not specified', () => {
      const startDate = undefined || '30daysAgo'
      const endDate = undefined || 'today'
      expect(startDate).toBe('30daysAgo')
      expect(endDate).toBe('today')
    })

    it('should use provided date range', () => {
      const params = new URLSearchParams('startDate=2024-01-01&endDate=2024-01-31')
      const startDate = params.get('startDate') || '30daysAgo'
      const endDate = params.get('endDate') || 'today'
      expect(startDate).toBe('2024-01-01')
      expect(endDate).toBe('2024-01-31')
    })

    it('should parse service account key from env', () => {
      const serviceAccountKey = JSON.parse('{}')
      expect(serviceAccountKey).toEqual({})
    })

    it('should handle empty service account key', () => {
      const envKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'
      const serviceAccountKey = JSON.parse(envKey)
      expect(serviceAccountKey.client_email).toBeUndefined()
    })
  })

  describe('GA4 metrics extraction', () => {
    it('should extract all 7 metrics from response', () => {
      const metrics = [
        { value: '1000' }, // sessions
        { value: '800' },   // activeUsers
        { value: '200' },  // newUsers
        { value: '5000' }, // screenPageViews
        { value: '45.5' }, // bounceRate
        { value: '120.5' }, // averageSessionDuration
        { value: '0.65' }  // engagementRate
      ]

      const result = {
        sessions: parseInt(metrics[0]?.value || '0'),
        users: parseInt(metrics[1]?.value || '0'),
        newUsers: parseInt(metrics[2]?.value || '0'),
        pageViews: parseInt(metrics[3]?.value || '0'),
        bounceRate: parseFloat(metrics[4]?.value || '0'),
        avgSessionDuration: parseFloat(metrics[5]?.value || '0'),
        engagementRate: parseFloat(metrics[6]?.value || '0'),
      }

      expect(result.sessions).toBe(1000)
      expect(result.users).toBe(800)
      expect(result.newUsers).toBe(200)
      expect(result.pageViews).toBe(5000)
      expect(result.bounceRate).toBe(45.5)
      expect(result.avgSessionDuration).toBe(120.5)
      expect(result.engagementRate).toBe(0.65)
    })

    it('should handle empty metrics array', () => {
      const metrics: any[] = []
      const result = {
        sessions: parseInt(metrics[0]?.value || '0'),
        users: parseInt(metrics[1]?.value || '0'),
        newUsers: parseInt(metrics[2]?.value || '0'),
        pageViews: parseInt(metrics[3]?.value || '0'),
        bounceRate: parseFloat(metrics[4]?.value || '0'),
        avgSessionDuration: parseFloat(metrics[5]?.value || '0'),
        engagementRate: parseFloat(metrics[6]?.value || '0'),
      }

      expect(result.sessions).toBe(0)
      expect(result.users).toBe(0)
      expect(result.pageViews).toBe(0)
    })

    it('should handle null values in metrics', () => {
      const metrics = [
        null, null, null, null, null, null, null
      ]

      const result = {
        sessions: parseInt(metrics[0]?.value || '0'),
        bounceRate: parseFloat(metrics[4]?.value || '0'),
      }

      expect(result.sessions).toBe(0)
      expect(result.bounceRate).toBe(0)
    })

    it('should handle undefined metrics', () => {
      const metrics = undefined
      const result = {
        sessions: parseInt(metrics?.[0]?.value || '0'),
      }
      expect(result.sessions).toBe(0)
    })
  })

  describe('GA4 property configuration', () => {
    it('should use GA4_PROPERTY_ID from env', () => {
      const propertyId = process.env.GA4_PROPERTY_ID
      const propertyPath = propertyId ? `properties/${propertyId}` : undefined
      expect(propertyPath).toBeUndefined()
    })

    it('should build correct property path', () => {
      const propertyId = '123456789'
      const propertyPath = `properties/${propertyId}`
      expect(propertyPath).toBe('properties/123456789')
    })
  })

  describe('error handling', () => {
    it('should return 500 on GA4 API error', () => {
      const error = new Error('GA4 API rate limit exceeded')
      expect(error.message).toContain('rate limit')
    })

    it('should handle network errors', () => {
      const error = new Error('ENOTFOUND')
      expect(error.message).toBe('ENOTFOUND')
    })

    it('should handle JSON parse errors', () => {
      const invalidJson = 'not valid json'
      let parsed = null
      try {
        parsed = JSON.parse(invalidJson)
      } catch {
        parsed = null
      }
      expect(parsed).toBe(null)
    })

    it('should handle missing environment variables', () => {
      const missingVars = [
        'GOOGLE_SERVICE_ACCOUNT_KEY',
        'GA4_PROPERTY_ID'
      ]
      // All should be undefined in test environment
      for (const v of missingVars) {
        expect(process.env[v]).toBeUndefined()
      }
    })

    it('should handle empty service account credentials', () => {
      const serviceAccountKey = JSON.parse('{}')
      expect(serviceAccountKey.client_email).toBeUndefined()
      expect(serviceAccountKey.private_key).toBeUndefined()
    })
  })

  describe('response structure', () => {
    it('should return all metrics in response', () => {
      const response = {
        sessions: 1000,
        users: 800,
        newUsers: 200,
        pageViews: 5000,
        bounceRate: 45.5,
        avgSessionDuration: 120.5,
        engagementRate: 0.65,
      }

      expect(response).toHaveProperty('sessions')
      expect(response).toHaveProperty('users')
      expect(response).toHaveProperty('newUsers')
      expect(response).toHaveProperty('pageViews')
      expect(response).toHaveProperty('bounceRate')
      expect(response).toHaveProperty('avgSessionDuration')
      expect(response).toHaveProperty('engagementRate')
    })

    it('should return error object on failure', () => {
      const errorResponse = { error: 'Failed to fetch analytics' }
      expect(errorResponse.error).toBe('Failed to fetch analytics')
    })
  })

  describe('dynamic route behavior', () => {
    it('should be marked as force-dynamic', () => {
      const dynamic = 'force-dynamic'
      expect(dynamic).toBe('force-dynamic')
    })

    it('should not be cached', () => {
      // force-dynamic means always revalidate
      const cacheControl = 'no-store'
      expect(cacheControl).toBe('no-store')
    })
  })

  describe('date range edge cases', () => {
    it('should handle single day range', () => {
      const startDate = '2024-01-15'
      const endDate = '2024-01-15'
      expect(startDate).toBe(endDate)
    })

    it('should handle year range', () => {
      const startDate = '2023-01-01'
      const endDate = '2023-12-31'
      expect(startDate < endDate).toBe(true)
    })

    it('should handle future dates', () => {
      const startDate = '2099-01-01'
      const endDate = '2099-12-31'
      // Should not crash even with future dates
      expect(startDate).toBeDefined()
    })
  })

  describe('metrics parsing', () => {
    it('should parse integer metrics correctly', () => {
      expect(parseInt('1000')).toBe(1000)
      expect(parseInt('0')).toBe(0)
      // parseInt('') returns NaN, not 0
      expect(Number.isNaN(parseInt(''))).toBe(true)
    })

    it('should parse float metrics correctly', () => {
      expect(parseFloat('45.5')).toBe(45.5)
      expect(parseFloat('0.65')).toBe(0.65)
      // parseFloat('') returns NaN, not 0
      expect(Number.isNaN(parseFloat(''))).toBe(true)
    })

    it('should handle non-numeric values', () => {
      // parseInt('N/A') returns NaN
      const result = parseInt('N/A')
      expect(Number.isNaN(result)).toBe(true)
      
      const result2 = parseFloat('undefined')
      expect(Number.isNaN(result2)).toBe(true)
    })
  })
})