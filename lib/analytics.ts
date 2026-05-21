import { hasOptionalTrackingConsent } from '@/lib/consent';

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  if (!hasOptionalTrackingConsent()) return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, params);
}
