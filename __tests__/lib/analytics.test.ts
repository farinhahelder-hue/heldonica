import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent } from '@/lib/analytics';
import * as consentLib from '@/lib/consent';

// Mock the consent module
vi.mock('@/lib/consent', () => ({
  hasOptionalTrackingConsent: vi.fn(),
}));

describe('analytics', () => {
  describe('trackEvent', () => {
    beforeEach(() => {
      // Reset mocks before each test
      vi.clearAllMocks();

      // Default setup: mock window and gtag
      vi.stubGlobal('window', {
        gtag: vi.fn(),
      });

      // Default: consent granted
      vi.mocked(consentLib.hasOptionalTrackingConsent).mockReturnValue(true);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('does nothing if window is undefined', () => {
      vi.stubGlobal('window', undefined);

      trackEvent('test_event');

      // We can't really assert on a mock if window is undefined since we'd be checking undefined.gtag
      // But we can verify it doesn't throw and doesn't call hasOptionalTrackingConsent (which means it early returned)
      expect(consentLib.hasOptionalTrackingConsent).not.toHaveBeenCalled();
    });

    it('does nothing if optional tracking consent is not granted', () => {
      vi.mocked(consentLib.hasOptionalTrackingConsent).mockReturnValue(false);

      trackEvent('test_event');

      expect(window.gtag).not.toHaveBeenCalled();
    });

    it('does nothing if window.gtag is not a function', () => {
      // Create a new window stub without gtag
      vi.stubGlobal('window', {
        gtag: undefined,
      });

      trackEvent('test_event');

      // Should not throw an error
    });

    it('calls window.gtag with correct parameters when conditions are met', () => {
      const mockGtag = vi.fn();
      vi.stubGlobal('window', {
        gtag: mockGtag,
      });

      const eventName = 'sign_up';
      const eventParams = { method: 'Google' };

      trackEvent(eventName, eventParams);

      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', eventName, eventParams);
    });

    it('uses empty object as default params', () => {
      const mockGtag = vi.fn();
      vi.stubGlobal('window', {
        gtag: mockGtag,
      });

      trackEvent('page_view');

      expect(mockGtag).toHaveBeenCalledTimes(1);
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {});
    });
  });
});
