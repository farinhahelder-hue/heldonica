-- ============================================================
-- HELDONICA — Remplacer tous les Unsplash par fallback de marque
-- Conforme à la stratégie validée : asset interne > fallback brand > futur visuel généré
-- Aucune nouvelle URL Unsplash, aucune image de stock
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. VIDER les featured_image Unsplash → NULL (fallback code)
--    Tous les articles qui n'ont pas de photo personnelle
--    récupèrent automatiquement le fallback de marque via le code
-- ──────────────────────────────────────────────────────────────
UPDATE cms_blog_posts
SET featured_image = NULL,
    updated_at = NOW()
WHERE featured_image LIKE '%images.unsplash.com%'
   OR featured_image LIKE '%unsplash.com%';

-- ──────────────────────────────────────────────────────────────
-- 2. CORRECTION éditoriale : greve-reserve-naturelle
--    Slug incohérent, destination manquante, titre générique
-- ──────────────────────────────────────────────────────────────
UPDATE cms_blog_posts
SET slug = 'greve-reserve-naturelle-suisse',
    title = 'Grève de la Réserve Naturelle (Suisse)',
    tags = ARRAY['Suisse', 'slowtravel', 'reservenaturelle', 'weekendnature'],
    featured_image = NULL,
    updated_at = NOW()
WHERE slug = 'greve-reserve-naturelle';

-- ──────────────────────────────────────────────────────────────
-- 3. NETTOYAGE migrations précédentes (20260625)
--    Si déjà appliquée, on remplace les Unsplash qu'elle a injectés
-- ──────────────────────────────────────────────────────────────

-- bacalhau-a-lagareiro & bacalhau-gomes-sa-recette (pizza → morue)
UPDATE cms_blog_posts
SET featured_image = NULL,
    updated_at = NOW()
WHERE slug IN ('bacalhau-a-lagareiro', 'bacalhau-gomes-sa-recette')
  AND featured_image LIKE '%unsplash.com%';

-- podgorica-capitale-montenegro-guide (Colombie → Monténégro)
UPDATE cms_blog_posts
SET featured_image = NULL,
    updated_at = NOW()
WHERE slug = 'podgorica-capitale-montenegro-guide'
  AND featured_image LIKE '%unsplash.com%';

-- flotter-sur-la-limmat-a-zurich (jeu vidéo → rivière)
UPDATE cms_blog_posts
SET featured_image = NULL,
    updated_at = NOW()
WHERE slug = 'flotter-sur-la-limmat-a-zurich'
  AND featured_image LIKE '%unsplash.com%';

-- prego-no-bolo-do-caco (burger → sandwich)
UPDATE cms_blog_posts
SET featured_image = NULL,
    updated_at = NOW()
WHERE slug = 'prego-no-bolo-do-caco'
  AND featured_image LIKE '%unsplash.com%';

-- voix-heldonica-manifeste
UPDATE cms_blog_posts
SET featured_image = NULL,
    updated_at = NOW()
WHERE slug = 'voix-heldonica-manifeste'
  AND featured_image LIKE '%unsplash.com%';

-- train-mocanita-maramures
UPDATE cms_blog_posts
SET featured_image = NULL,
    updated_at = NOW()
WHERE slug = 'train-mocanita-maramures'
  AND featured_image LIKE '%unsplash.com%';

-- stoos-ridge-notre-aventure-crete-panoramique (doublon)
UPDATE cms_blog_posts
SET featured_image = NULL,
    updated_at = NOW()
WHERE slug IN ('stoos-ridge-notre-aventure-crete-panoramique',
               'stoos-ridge-notre-aventure-sur-la-crete-panoramique')
  AND featured_image LIKE '%unsplash.com%';

-- ──────────────────────────────────────────────────────────────
-- 4. KEEP les assets perso existants (wp-content/uploads)
--    Ne pas toucher aux vraies photos personnelles
-- ──────────────────────────────────────────────────────────────
-- Les articles avec featured_image contenant 'heldonica.fr/wp-content/uploads'
-- sont conservés tels quels (photos personnelles).
-- Aucune UPDATE nécessaire.

-- ──────────────────────────────────────────────────────────────
-- 5. NETTOYAGE site_settings (hero_fallback_images)
--    Si le setting hero_fallback_images contient des URLs Unsplash,
--    on le neutralise pour que le code utilise nos fallbacks de marque
-- ──────────────────────────────────────────────────────────────
UPDATE site_settings
SET value = '{}',
    updated_at = NOW()
WHERE key = 'hero_fallback_images'
  AND value LIKE '%unsplash%';

-- ──────────────────────────────────────────────────────────────
-- 6. VÉRIFICATION
-- ──────────────────────────────────────────────────────────────
SELECT
  slug,
  CASE
    WHEN featured_image IS NULL THEN 'NULL (fallback marque)'
    WHEN featured_image LIKE '%heldonica.fr/wp-content/uploads%' THEN 'PHOTO PERSO ✓'
    WHEN featured_image LIKE '%unsplash.com%' THEN '⚠️ UNSPLASH ENCORE PRESENT'
    ELSE featured_image
  END AS image_status
FROM cms_blog_posts
ORDER BY slug;
