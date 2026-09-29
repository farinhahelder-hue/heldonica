/**
 * GENERIC_PHOTO_IDS — Blacklist complète des IDs Unsplash à ne jamais conserver en featured_image.
 *
 * Critères d'inclusion :
 *  - IDs utilisés comme fallback hardcodé dans BlogClientPage.tsx (CATEGORY_FALLBACK_BG, DEFAULT_CARD_FALLBACK)
 *  - IDs utilisés comme fallback hardcodé dans lib/unsplash.ts (CATEGORY_FALLBACK_IMAGES)
 *  - IDs utilisés comme décor dans lib/instagram-static.ts
 *  - IDs utilisés dans lib/cms-page-defaults.ts, lib/pillar-data.ts (héros de pages)
 *  - Tout ID générique voyage/paysage sans rapport avec un article spécifique
 *
 * Seuil de duplication : 2 articles (site éditorial slow travel — chaque image doit être unique).
 */
export const GENERIC_PHOTO_IDS = new Set<string>([
  // --- Ancienne blacklist ---
  '1501785888041-af3ef285b470',  // Carnets Voyage fallback (ancienne blacklist)
  '1506012787146-f92b2d7d6d96',  // Placeholder URL principal
  '1501854140801-50d01698950b',  // DEFAULT_CARD_FALLBACK (BlogClientPage) + lib/unsplash.ts default
  '1469474968028-56623f02e42e',  // Hero blog page + cms-page-defaults home hero
  '1506905925346-21bda4d32df4',  // lib/unsplash.ts slow-travel + cms-page-defaults a-propos
  '1476514525535-07fb3b4ae5f1',  // ancienne blacklist
  '1464822759023-fed622ff2c3b',  // Carnets Voyage fallback (BlogClientPage + lib/unsplash.ts)
  '1520939817895-060bdaf4fe1b',  // Découvertes Locales fallback (BlogClientPage + lib/unsplash.ts)
  '1515488764276-beab7607c1e6',  // Guides Pratiques fallback (BlogClientPage + lib/unsplash.ts + instagram-static)
  '1555990793-da11153b6e8d',    // ancienne blacklist
  '1555992828-8e7e4c0c7a0a',    // ancienne blacklist
  '1555992836-003ea0c1b7a9',    // ancienne blacklist
  '1593702288056-2c160f65cf12', // pillar-data.ts hero
  '1555990538-1e0700b21df9',    // ancienne blacklist + instagram-static
  '1590001155093-a3c66ab0c3ff', // ancienne blacklist

  // --- Nouveaux IDs détectés lors de l'audit Phase 1 ---
  '1499856871958-5b9627545d1a',  // lib/unsplash.ts europe
  '1502602898657-3e91760cbb34',  // lib/unsplash.ts france
  '1555881400-74d7feeac3e4',    // lib/unsplash.ts portugal
  '1539037116277-4db20889f2d4',  // lib/unsplash.ts espagne
  '1515542622106-78bda8ba0e5b',  // lib/unsplash.ts italie
  '1488646953014-85cb44b258dc',  // lib/unsplash.ts voyage générique
  '1560719887-fe3105fa1e55',    // instagram-static.ts post 1
  '1559494007-9f5847c49d94',    // instagram-static.ts post 2
]);
