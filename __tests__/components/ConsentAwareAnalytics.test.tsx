import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import React from 'react';

vi.mock('next/script', () => ({
  default: ({ src, id }: { src?: string; id?: string }) => (
    <script data-testid={id || src} src={src} />
  ),
}));

import ConsentAwareAnalytics from '@/components/ConsentAwareAnalytics';
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY } from '@/lib/consent';

function rendre() {
  return render(<ConsentAwareAnalytics gaId="G-TEST" gtmId="GTM-TEST" />);
}

function scriptsGa(container: HTMLElement) {
  return container.querySelector('script[src*="gtag/js"]');
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('ConsentAwareAnalytics — aucun appel Google avant le consentement', () => {
  it('ne charge ni GA4 ni GTM sans choix explicite', () => {
    const { container } = rendre();
    expect(container.querySelector('script')).toBeNull();
  });

  it('ne charge rien quand le consentement vaut « rejected »', () => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    const { container } = rendre();
    expect(container.querySelector('script')).toBeNull();
  });

  it('charge GA4 et GTM après acceptation', () => {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    const { container } = rendre();
    expect(scriptsGa(container)).toBeTruthy();
    expect(container.querySelector('script[src*="gtm.js"]')).toBeTruthy();
  });

  it('réagit à l’acceptation en direct, sans recharger la page', () => {
    const { container } = rendre();
    expect(container.querySelector('script')).toBeNull();

    act(() => {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
    });

    expect(scriptsGa(container)).toBeTruthy();
  });
});
