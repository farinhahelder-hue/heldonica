'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { readCookieConsent, writeCookieConsent } from '@/lib/consent';
import { estRouteAdmin } from '@/lib/routes-admin';
import { useContentLoader, getCmsOrSetting } from '@/hooks/useContentLoader';
import type { CmsZone } from '@/lib/content-loader';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const { zones, settings } = useContentLoader();
  const z = zones as Record<string, CmsZone>;
  const t = (zoneKey: string, fallback: string) => getCmsOrSetting(zoneKey, '', fallback, z, settings);

  // Masquer sur les routes admin. Le prefixe teste ici etait « /cms », renomme
  // depuis en « /panel-manager » : le bandeau reapparaissait donc par-dessus le
  // panneau d'administration.
  const isAdminRoute = estRouteAdmin(pathname);

  useEffect(() => {
    if (isAdminRoute) {
      setVisible(false);
      return;
    }
    setVisible(readCookieConsent() === null);
  }, [pathname, isAdminRoute]);

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
            {t('cookie_title', 'Cookies et vie privée')}
          </p>
          <p className="text-sm md:text-base text-charcoal/85 leading-relaxed">
            {t('cookie_text', 'Nous utilisons des cookies strictement nécessaires au fonctionnement du site. Les cookies de mesure d’audience et marketing ne sont actifs qu’avec ton consentement.')}
          </p>
          <p className="text-sm mt-3 text-charcoal/75">
            {t('cookie_details_prefix', 'Détails :')}{' '}
            <Link
              href="/politique-confidentialite"
              className="text-eucalyptus hover:text-teal transition font-medium"
            >
              {t('cookie_privacy_label', 'Politique de confidentialité')}
            </Link>{' '}
            {t('cookie_details_joiner', 'et')}{' '}
            <Link
              href="/mentions-legales"
              className="text-eucalyptus hover:text-teal transition font-medium"
            >
              {t('cookie_legal_label', 'Mentions légales')}
            </Link>
            .
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setConsent('rejected')}
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-charcoal hover:border-stone-400 transition"
            >
              {t('cookie_reject_label', 'Refuser')}
            </button>
            <button
              type="button"
              onClick={() => setConsent('accepted')}
              className="px-5 py-2.5 rounded-lg bg-action text-white font-medium hover:bg-action-fonce transition"
            >
              {t('cookie_accept_label', 'Accepter')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
