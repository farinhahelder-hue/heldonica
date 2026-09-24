-- ============================================================
-- HELDONICA — Corrections incohérences images articles
-- Fichier : 20260625_fix_images_coherence.sql
-- Source : audit géographique des featured_image
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- CORRECTIONS CRITIQUES (image complètement hors-sujet)
-- ──────────────────────────────────────────────────────────────

-- #1 bacalhau-a-lagareiro : pizza italienne → morue/bacalhau portugaise
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'bacalhau-a-lagareiro';

-- #2 bacalhau-gomes-sa-recette : pizza italienne → morue/bacalhau portugaise
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'bacalhau-gomes-sa-recette';

-- #3 podgorica-capitale-montenegro-guide : Cartagena/Colombie → Monténégro/Balkans
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'podgorica-capitale-montenegro-guide';

-- #4 flotter-sur-la-limmat-a-zurich : jeu vidéo/écran → rivière Limmat Zurich été
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'flotter-sur-la-limmat-a-zurich';

-- #5 prego-no-bolo-do-caco : burger américain → sandwich/pain madeiran
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'prego-no-bolo-do-caco';

-- ──────────────────────────────────────────────────────────────
-- DIVERSIFICATION (même photo sur articles différents)
-- ──────────────────────────────────────────────────────────────

-- #6 greve-reserve-naturelle : avion fenêtre générique → mer Égée Grèce
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'greve-reserve-naturelle';

-- #7 voix-heldonica-manifeste : avion fenêtre générique → carnet/écriture
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'voix-heldonica-manifeste';

-- #8 train-mocanita-maramures : doublon exact → autre photo train vapeur
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'train-mocanita-maramures';

-- #9 stoos-ridge-notre-aventure-crete-panoramique : doublon stoos-04 → Alpes Suisses
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'stoos-ridge-notre-aventure-crete-panoramique'
   OR slug = 'stoos-ridge-notre-aventure-sur-la-crete-panoramique';

-- ──────────────────────────────────────────────────────────────
-- À VÉRIFIER MANUELLEMENT (incertain)
-- ──────────────────────────────────────────────────────────────

-- #10 petit-dejeuner-du-dimanche-crepes
-- Décommenter si l'image actuelle n'est PAS des crêpes :
-- UPDATE cms_blog_posts
-- SET featured_image = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80',
--     updated_at = NOW()
-- WHERE slug = 'petit-dejeuner-du-dimanche-crepes';

-- ──────────────────────────────────────────────────────────────
-- VÉRIFICATION POST-MIGRATION
-- ──────────────────────────────────────────────────────────────

SELECT
  slug,
  SUBSTRING(featured_image, 1, 80) AS image_preview
FROM cms_blog_posts
WHERE slug IN (
  'bacalhau-a-lagareiro',
  'bacalhau-gomes-sa-recette',
  'podgorica-capitale-montenegro-guide',
  'flotter-sur-la-limmat-a-zurich',
  'prego-no-bolo-do-caco',
  'greve-reserve-naturelle',
  'voix-heldonica-manifeste',
  'train-mocanita-maramures',
  'stoos-ridge-notre-aventure-crete-panoramique',
  'stoos-ridge-notre-aventure-sur-la-crete-panoramique',
  'petit-dejeuner-du-dimanche-crepes'
)
ORDER BY slug;
