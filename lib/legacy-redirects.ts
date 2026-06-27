/**
 * Legacy redirects configuration
 * Centralized redirect rules to avoid duplication between /middleware.ts and /app/middleware.ts
 */

export const LEGACY_REDIRECTS: Record<string, string> = {
  '/a-propos-2': '/a-propos',
  '/presentation-3': '/a-propos',
  '/hello-biz-360': '/travel-planning',
  '/accueil-heldonica-video': '/',
  '/b2b': '/travel-planning',
  '/offre-b2b': '/travel-planning',
  '/services-b2b': '/travel-planning',
  '/travel-planner': '/travel-planning',
  '/nos-services': '/travel-planning',
  '/bons-plans': '/blog',
  '/sujets/bons-plans': '/blog',
  '/zurich': '/destinations/zurich',
  '/suisse': '/destinations/suisse',
  '/roumanie': '/destinations/roumanie',
  '/madere': '/destinations/madere',
  '/stoos-ridge-notre-aventure-sur-la-crete-panoramique-2':
    '/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique',
};

export function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function resolveLegacyRedirect(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  const directRedirect = LEGACY_REDIRECTS[normalized];
  if (directRedirect) return directRedirect;
  if (normalized.startsWith('/etiquettes/')) return '/blog';
  if (normalized.startsWith('/sujets/')) return '/blog';
  return null;
}
