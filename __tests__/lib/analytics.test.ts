import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent } from '../../lib/analytics';
import * as consentModule from '../../lib/consent';

// Mock the consent module
vi.mock('../../lib/consent', () => ({
  hasOptionalTrackingConsent: vi.fn(),
}));

describe('analytics', () => {
  let originalWindow: Window & typeof globalThis;

  beforeEach(() => {
    // Keep a reference to the original window object if needed, but vitest uses jsdom
    // so window is defined globally. We'll use vi.stubGlobal for clean overriding.
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any global stubs
    vi.unstubAllGlobals();
  });

  describe('trackEvent', () => {
    it('should return early if window is undefined', () => {
      // Simulate environment without window (like SSR)
      const originalWindow = global.window;
      // @ts-expect-error - overriding global window for testing
      delete global.window;

      trackEvent('test_event');

      // If it didn't crash, it returned early successfully.
      expect(true).toBe(true);

      // Restore
      global.window = originalWindow;
    });

    it('should return early if consent is denied', () => {
      // Mock consent to return false
      vi.mocked(consentModule.hasOptionalTrackingConsent).mockReturnValue(false);

      // Mock window to capture if gtag is called
      const mockGtag = vi.fn();
      vi.stubGlobal('window', { gtag: mockGtag });

      trackEvent('test_event');

      expect(consentModule.hasOptionalTrackingConsent).toHaveBeenCalled();
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('should return early if window.gtag is not a function', () => {
      // Mock consent to return true
      vi.mocked(consentModule.hasOptionalTrackingConsent).mockReturnValue(true);

      // Mock window without gtag, or with gtag not as a function
      vi.stubGlobal('window', { gtag: undefined });

      trackEvent('test_event');

      // No crash means it handled it properly
      expect(consentModule.hasOptionalTrackingConsent).toHaveBeenCalled();
    });

    it('should call window.gtag with eventName and empty params by default', () => {
      vi.mocked(consentModule.hasOptionalTrackingConsent).mockReturnValue(true);

      const mockGtag = vi.fn();
      vi.stubGlobal('window', { gtag: mockGtag });

      trackEvent('test_event');

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {});
    });

    it('should call window.gtag with eventName and provided params', () => {
      vi.mocked(consentModule.hasOptionalTrackingConsent).mockReturnValue(true);

      const mockGtag = vi.fn();
      vi.stubGlobal('window', { gtag: mockGtag });

      const params = { foo: 'bar', value: 42, active: true };
      trackEvent('custom_event', params);

      expect(mockGtag).toHaveBeenCalledWith('event', 'custom_event', params);
    });
  });
});
