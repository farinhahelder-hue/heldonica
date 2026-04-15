'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readCookieConsent, writeCookieConsent } from '@/lib/consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readCookieConsent() === null);
  }, []);

  const setConsent = (value: 'accepted' | 'rejected') => {
    writeCookieConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4">
      <div className="mx-auto max-w-5xl rounded-2xl border border-stone-200 bg-white shadow-2xl">
        <div className="p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-2">
            Cookies et vie privee
          </p>
          <p className="text-sm md:text-base text-charcoal/85 leading-relaxed">
            Nous utilisons des cookies strictement necessaires au fonctionnement du site. Les
            cookies de mesure d'audience et marketing ne sont actives qu'avec ton consentement.
          </p>
          <p className="text-sm mt-3 text-charcoal/75">
            Details :{' '}
            <Link
              href="/politique-confidentialite"
              className="text-eucalyptus hover:text-teal transition font-medium"
            >
              Politique de confidentialite
            </Link>{' '}
            et{' '}
            <Link
              href="/mentions-legales"
              className="text-eucalyptus hover:text-teal transition font-medium"
            >
              Mentions legales
            </Link>
            .
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setConsent('rejected')}
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-charcoal hover:border-stone-400 transition"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={() => setConsent('accepted')}
              className="px-5 py-2.5 rounded-lg bg-eucalyptus text-white font-medium hover:bg-eucalyptus/90 transition"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
