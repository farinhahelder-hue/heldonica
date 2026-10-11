import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { trackEvent, trackNewsletterSignup } from '@/lib/analytics'

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

  describe('trackNewsletterSignup', () => {
    let mockGtag;

    beforeEach(() => {
      mockGtag = vi.fn();
      vi.stubGlobal('window', {
        gtag: mockGtag,
        localStorage: {
          getItem: vi.fn().mockReturnValue('accepted'),
        },
      });
      vi.stubEnv('NEXT_PUBLIC_GA_ENABLED', 'true');
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.clearAllMocks();
    });

    it('should call gtag with newsletter_signup event, source, and hashed email', () => {
      const email = 'test@example.com';
      trackNewsletterSignup(email, 'footer');

      expect(mockGtag).toHaveBeenCalledTimes(1);
      const args = mockGtag.mock.calls[0];
      expect(args[0]).toBe('event');
      expect(args[1]).toBe('newsletter_signup');
      expect(args[2].source).toBe('footer');
      expect(args[2].email_hash).toBeDefined();
      expect(typeof args[2].email_hash).toBe('string');
    });

    it('should support different source types', () => {
      const email = 'test@example.com';
      const sources = ['footer', 'popup', 'inline', 'blog'];

      sources.forEach((source, index) => {
        trackNewsletterSignup(email, source);
        const args = mockGtag.mock.calls[index];
        expect(args[2].source).toBe(source);
      });
    });

    it('should consistently hash the same email', () => {
      const email = 'consistent@example.com';
      trackNewsletterSignup(email, 'footer');
      trackNewsletterSignup(email, 'popup');

      const hash1 = mockGtag.mock.calls[0][2].email_hash;
      const hash2 = mockGtag.mock.calls[1][2].email_hash;

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different emails', () => {
      trackNewsletterSignup('test1@example.com', 'footer');
      trackNewsletterSignup('test2@example.com', 'footer');

      const hash1 = mockGtag.mock.calls[0][2].email_hash;
      const hash2 = mockGtag.mock.calls[1][2].email_hash;

      expect(hash1).not.toBe(hash2);
    });
  })
})
