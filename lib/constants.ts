/**
 * Heldonica — Constants partagées
 * Source de vérité pour les données statiques du site
 */

// Stats officielles — source unique pour Home et À propos
export const SITE_STATS = {
  yearsOfExperience: 10,
  publishedCarnets: 17,
  countriesLived: 7,
  addressesTested: 100,
} as const

// URLs canoniques du site
export const SITE_URLS = {
  home: 'https://www.heldonica.fr',
  blog: 'https://www.heldonica.fr/blog',
  destinations: 'https://www.heldonica.fr/destinations',
  travelPlanning: 'https://www.heldonica.fr/travel-planning',
  aPropos: 'https://www.heldonica.fr/a-propos',
} as const

// Routes avec redirections
export const REDIRECTS = [
  { from: '/about', to: '/a-propos', permanent: true },
  { from: '/about-us', to: '/a-propos', permanent: true },
] as const