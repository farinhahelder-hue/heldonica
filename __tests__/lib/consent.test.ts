import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  readCookieConsent,
  writeCookieConsent,
  hasOptionalTrackingConsent,
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_EVENT
} from '../../lib/consent';

describe('consent', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('readCookieConsent', () => {
    it('returns null when window is undefined', () => {
      vi.stubGlobal('window', undefined);

      expect(readCookieConsent()).toBeNull();
    });

    it('returns null when no consent is set', () => {
      expect(readCookieConsent()).toBeNull();
    });

    it('returns "accepted" when consent is accepted', () => {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      expect(readCookieConsent()).toBe('accepted');
    });

    it('returns "rejected" when consent is rejected', () => {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
      expect(readCookieConsent()).toBe('rejected');
    });

    it('returns null for invalid values in localStorage', () => {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'invalid_value');
      expect(readCookieConsent()).toBeNull();
    });
  });

  describe('writeCookieConsent', () => {
    it('does nothing when window is undefined', () => {
      vi.stubGlobal('window', undefined);

      expect(() => writeCookieConsent('accepted')).not.toThrow();
    });

    it('sets the value in localStorage', () => {
      writeCookieConsent('accepted');
      expect(window.localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('accepted');

      writeCookieConsent('rejected');
      expect(window.localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('rejected');
    });

    it('dispatches the consent event', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      writeCookieConsent('accepted');

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls[0][0] as Event;
      expect(event.type).toBe(COOKIE_CONSENT_EVENT);
    });
  });

  describe('hasOptionalTrackingConsent', () => {
    it('returns true when consent is accepted', () => {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      expect(hasOptionalTrackingConsent()).toBe(true);
    });

    it('returns false when consent is rejected', () => {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
      expect(hasOptionalTrackingConsent()).toBe(false);
    });

    it('returns false when no consent is set', () => {
      expect(hasOptionalTrackingConsent()).toBe(false);
    });
  });
});
