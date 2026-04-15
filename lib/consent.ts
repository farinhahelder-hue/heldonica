export const COOKIE_CONSENT_KEY = 'heldonica_cookie_consent_v1';
export const COOKIE_CONSENT_EVENT = 'heldonica-cookie-consent-updated';

export type CookieConsentValue = 'accepted' | 'rejected';

export function readCookieConsent(): CookieConsentValue | null {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
  if (value === 'accepted' || value === 'rejected') {
    return value;
  }

  return null;
}

export function writeCookieConsent(value: CookieConsentValue) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function hasOptionalTrackingConsent() {
  return readCookieConsent() === 'accepted';
}
