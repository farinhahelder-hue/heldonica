-- ============================================================================
-- cms_editable_zones : remplacer og-default par une photo du lieu
-- Date: 2026-08-01
-- ============================================================================
-- 123 zones d'image servaient `og-default.jpg`, le visuel de repli du site.
-- La banque `media/articles` compte 12 photos, dont 5 n'etaient utilisees nulle
-- part.
--
-- On assigne UNIQUEMENT lorsque la photo montre reellement le lieu. Une image
-- generique posee sur une page qui ne lui correspond pas recreerait le defaut
-- qu'on cherche a corriger.
--
-- Volontairement NON traitees, faute de photo du lieu :
--   Madere (27 zones), Sardaigne (12), Sicile (11), Colombie (9),
--   Normandie (7), Portugal (5), Grece (2), Montenegro (2), Timisoara.
--   Y poser une photo d'ailleurs serait pire que le repli actuel.
--
-- Reversible : l'ancienne valeur etait `/og-default.jpg` pour toutes ces lignes.

-- Bucarest — photo de l'immeuble neoclassique du centre
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/batch-1778535469099-7.jpg',
    updated_at = NOW()
WHERE page = 'destinations-roumanie-bucarest'
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

-- Brasov — chateau de Bran, a 30 km, repere de la region
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/import-1778535717207.jpg',
    updated_at = NOW()
WHERE page = 'destinations-roumanie-brasov'
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

-- Itineraires roumains — maison paysanne du Maramures, traversee par les trois
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/import-1778536086298.jpg',
    updated_at = NOW()
WHERE page IN ('destinations-roumanie-itineraire-5-jours',
               'destinations-roumanie-itineraire-7-jours',
               'destinations-roumanie-itineraire-10-jours')
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

-- Paris — tour Eiffel depuis une rue pavee
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/import-1779113929226.jpg',
    updated_at = NOW()
WHERE page IN ('destinations-idf-paris', 'destinations-paris')
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

-- Suisse — panorama alpin
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/batch-1778535464596-3.jpg',
    updated_at = NOW()
WHERE page = 'destinations-suisse'
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';


-- ─── Verification (lecture seule) ───────────────────────────────────────────

SELECT count(*) AS zones_encore_en_og_default
FROM public.cms_editable_zones
WHERE is_active AND (zone_key LIKE '%image%') AND value LIKE '%og-default%';

SELECT page, zone_key, right(value, 30) AS photo
FROM public.cms_editable_zones
WHERE is_active AND value LIKE '%media/articles%' AND zone_key LIKE '%image%'
ORDER BY page, zone_key;
