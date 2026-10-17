-- ============================================================================
-- Migration : Restore masked hero photos for 5 sub-destinations
-- Date: 2026-10-16
-- ============================================================================
-- Cinq sous-destinations affichaient /og-default.jpg (placeholder) comme image de
-- couverture, alors que leur page.tsx porte déjà une vraie photo vérifiée
-- joignable. Ce script met à jour leurs zones hero_image et seo_og_image
-- dans cms_editable_zones avec leurs URLs Supabase Storage respectives.
--
-- Idempotent : ne touche que les lignes dont la valeur contient encore 'og-default'.

-- 1. Achadas da Cruz
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/achadas_da_cruz.jpg',
    updated_at = NOW()
WHERE page = 'destinations-madere-achadas-da-cruz'
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND (value = '/og-default.jpg' OR value LIKE '%og-default%');

-- 2. Ponta do Sol
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/ponta_do_sol.jpg',
    updated_at = NOW()
WHERE page = 'destinations-madere-ponta-do-sol'
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND (value = '/og-default.jpg' OR value LIKE '%og-default%');

-- 3. Porto Moniz
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/porto_moniz.jpg',
    updated_at = NOW()
WHERE page = 'destinations-madere-porto-moniz'
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND (value = '/og-default.jpg' OR value LIKE '%og-default%');

-- 4. Bucarest
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135618.jpg',
    updated_at = NOW()
WHERE page = 'destinations-roumanie-bucarest'
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND (value = '/og-default.jpg' OR value LIKE '%og-default%');

-- 5. Sibiu
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg',
    updated_at = NOW()
WHERE page = 'destinations-roumanie-sibiu'
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND (value = '/og-default.jpg' OR value LIKE '%og-default%');
