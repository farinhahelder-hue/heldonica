'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { COOKIE_CONSENT_EVENT, hasOptionalTrackingConsent } from '@/lib/consent';

type Props = {
  gaId?: string;
  gtmId?: string | null;
};

/**
 * Charge GA4 et GTM uniquement après un consentement explicite.
 *
 * Les scripts étaient auparavant posés dans le <head> pour tout le monde,
 * avant même que le bandeau cookies ne s'affiche. Ici, aucun appel réseau vers
 * Google n'a lieu tant que `heldonica_cookie_consent_v1` ne vaut pas
 * « accepted ». Le bandeau met à jour le consentement en direct via l'événement.
 */
export default function ConsentAwareAnalytics({ gaId, gtmId }: Props) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(hasOptionalTrackingConsent());

    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!allowed) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `
          }} />
        </>
      )}
      {gtmId && (
        <>
          <Script id="gtm-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            `
          }} />
          <Script
            src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
            strategy="afterInteractive"
          />
        </>
      )}
    </>
  );
}
