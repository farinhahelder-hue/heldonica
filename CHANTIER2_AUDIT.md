# CHANTIER 2 — Audit Images Manquantes

## Pages auditées

### / (Home)
- `Hero.tsx` : images fixes Unsplash (aucune manquante)
- `HomeClient.tsx` : `postImage()` avec cascade de fallbacks :
  1. `featured_image` du post
  2. `SLUG_IMAGES` (slug → URL fixe)
  3. `CAT_IMAGES` (catégorie → URL fixe)
  4. `HELDONICA_BADGE_FALLBACK` → `/images/badges-heldonica.svg`

### /blog
- `BlogClientPage.tsx` :
  - Featured post : `CATEGORY_FALLBACK_BG` ou `DEFAULT_CARD_FALLBACK`
  - Article cards : graceful fallback avec gradient + icône catégorie
  - Aucune image cassée possible

### /destinations
- `DestinationsClient.tsx` : images fixes par pays/destination
- Placeholder SVG disponible : `/images/placeholder-destination.svg`

### /travel-planning
- Hero : Unsplash photo-1530521954074-e64f6810b32d
- CTA final : Unsplash photo-1501785888041-af3ef285b470
- Aucune image manquante

### /expert-hotelier
- OG image : `/og-default.jpg` (existe ✅)

### /nos-services
- Vérification à faire côté Supabase (pas de fetch direct)

## Points OK ✅
- Toutes les images utilisent des URLs fixes ou des fallbacks codés
- `onError` handlers en place sur les images dynamiques
- Placeholder SVG branded créés en Chantier 1

## Points à corriger ⚠️
- OG images manquantes : `/og-blog.jpg` (référencée dans `/blog`), `/og-image.jpg` (référencée dans home)
- ✅ Créé `public/og-image.svg` comme placeholder SVG pour OG
- OG default existe : `/og-default.jpg`

## Fichiers SVG de fallback disponibles
- `public/images/placeholder-blog.svg` (Chantier 1)
- `public/images/placeholder-destination.svg` (Chantier 1)
- `public/images/badges-heldonica.svg` (existant)
- `public/og-image.svg` (nouveau - placeholder OG)