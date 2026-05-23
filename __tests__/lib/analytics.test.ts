import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { trackEvent } from '@/lib/analytics'

describe('analytics', () => {
  describe('trackEvent', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_GA_ENABLED', 'true')
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      vi.clearAllMocks()
    })

    it('should not throw when window is undefined (SSR)', () => {
      vi.stubGlobal('window', undefined)

      // Should not throw
      trackEvent('test_event')
      expect(true).toBe(true)
    })

    it('should not call gtag when gtag function is not available', () => {
      vi.stubGlobal('window', {
        gtag: undefined,
        localStorage: {
          getItem: vi.fn().mockReturnValue('accepted'),
        },
      })

      trackEvent('test_event')

      // Should not throw
      expect(true).toBe(true)
    })

    it('should call gtag with event name and params', () => {
      const mockGtag = vi.fn()
      vi.stubGlobal('window', {
        gtag: mockGtag,
        localStorage: {
          getItem: vi.fn().mockReturnValue('accepted'),
        },
      })

      trackEvent('page_view', { page_path: '/blog', page_title: 'Test' })

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/blog',
        page_title: 'Test',
      })
    })

    it('should handle empty params object', () => {
      const mockGtag = vi.fn()
      vi.stubGlobal('window', {
        gtag: mockGtag,
        localStorage: {
          getItem: vi.fn().mockReturnValue('accepted'),
        },
      })

      trackEvent('test_event', {})

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {})
    })

    it('should handle various param types (string, number, boolean)', () => {
      const mockGtag = vi.fn()
      vi.stubGlobal('window', {
        gtag: mockGtag,
        localStorage: {
          getItem: vi.fn().mockReturnValue('accepted'),
        },
      })

      const params = {
        string_val: 'test',
        number_val: 42,
        boolean_val: true,
      }

      trackEvent('conversion', params)

      expect(mockGtag).toHaveBeenCalledWith('event', 'conversion', params)
    })

    it('should call gtag with only event name when no params', () => {
      const mockGtag = vi.fn()
      vi.stubGlobal('window', {
        gtag: mockGtag,
        localStorage: {
          getItem: vi.fn().mockReturnValue('accepted'),
        },
      })

      trackEvent('simple_event')

      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', {})
    })
  })
})
