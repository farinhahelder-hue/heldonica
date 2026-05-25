const LEGACY_REDIRECTS: Record<string, string> = {
  '/a-propos-2': '/a-propos',
  '/presentation-3': '/a-propos',
  '/hello-biz-360': '/travel-planning',
  '/accueil-heldonica-video': '/',
  // Redirects B2B existants (service supprimé)
  '/b2b': '/travel-planning',
  '/offre-b2b': '/travel-planning',
  '/services-b2b': '/travel-planning',
  // Ancien travel planner
  '/travel-planner': '/travel-planning',
  '/nos-services': '/travel-planning',
  '/bons-plans': '/blog',
  '/sujets/bons-plans': '/blog',
  // Destinations
  '/zurich': '/destinations/zurich',
  '/suisse': '/destinations/suisse',
  '/roumanie': '/destinations/roumanie',
  '/madere': '/destinations/madere',
  // Articles renommés
  '/stoos-ridge-notre-aventure-sur-la-crete-panoramique-2':
    '/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique',
};

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function resolveLegacyRedirect(pathname: string) {
  const normalized = normalizePath(pathname);
  const directRedirect = LEGACY_REDIRECTS[normalized];

  if (directRedirect) {
    return directRedirect;
  }

  if (normalized.startsWith('/etiquettes/')) {
    return '/blog';
  }

  if (normalized.startsWith('/sujets/')) {
    return '/blog';
  }

  return null;
}
