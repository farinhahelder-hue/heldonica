/**
 * Heldonica — Constants partagées
 * Source de vérité pour les données statiques du site
 * 
 * Stats officielles — alignées avec la page À propos
 * - 4 ans de slow travel (depuis 2021)
 * - 25+ carnets publiés
 * - 7 pays habités
 */

// Stats officielles — source unique pour Home et À propos
export const SITE_STATS = {
  yearsOfExperience: 4,
  publishedCarnets: 25,
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