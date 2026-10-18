-- Photos réelles des destinations + gabarits non résolus
--
-- 1) La migration 20260801000007_cms_photos_destinations.sql n'a laissé aucune
--    trace en base : ses 12 zones image visées portent encore le visuel de
--    repli (/og-default.jpg). Les 5 photos de la banque media/articles, elles,
--    existent, répondent en HTTP 200 et montrent bien le lieu décrit. On va
--    donc au bout de l'intention déjà écrite et versionnée.
--      Bucarest             : immeuble néoclassique du centre
--      Brasov               : château de Bran (à 30 km)
--      Itinéraires 5/7/10 j : maison paysanne du Maramureș
--      Paris                : tour Eiffel depuis une rue pavée
--      Suisse               : panorama alpin
--    Garde-fou : on n'écrit que là où la valeur est encore le repli, pour ne
--    jamais écraser une vraie photo posée entre-temps.
--
-- 2) Deux zones SEO portaient un gabarit « ${SITE_URL} » jamais résolu — la
--    chaîne est littérale en base, donc l'image est cassée. On pose l'URL
--    absolue du visuel de repli : og-compare.jpg n'existe pas dans public/.
--
-- 3) 57 zones « __ancienne_coquille » sur destinations-roumanie-timisoara
--    (reliquats d'un renommage, toutes inactives) : supprimées.
--
-- Idempotent : ré-exécutable sans effet une fois appliqué.

-- ---------------------------------------------------------------------------
-- 1) Photos réelles du lieu (banque media/articles)
-- ---------------------------------------------------------------------------
UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/batch-1778535469099-7.jpg',
    updated_at = NOW()
WHERE page = 'destinations-roumanie-bucarest'
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/import-1778535717207.jpg',
    updated_at = NOW()
WHERE page = 'destinations-roumanie-brasov'
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/import-1778536086298.jpg',
    updated_at = NOW()
WHERE page IN ('destinations-roumanie-itineraire-5-jours',
               'destinations-roumanie-itineraire-7-jours',
               'destinations-roumanie-itineraire-10-jours')
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/import-1779113929226.jpg',
    updated_at = NOW()
WHERE page IN ('destinations-idf-paris', 'destinations-paris')
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/articles/batch-1778535464596-3.jpg',
    updated_at = NOW()
WHERE page = 'destinations-suisse'
  AND zone_key IN ('hero_image', 'seo_og_image') AND value LIKE '%og-default%';

-- ---------------------------------------------------------------------------
-- 2) Gabarits « ${SITE_URL} » non résolus → image cassée
-- ---------------------------------------------------------------------------
UPDATE public.cms_editable_zones
SET value = 'https://www.heldonica.fr/og-default.jpg',
    updated_at = NOW()
WHERE page = 'destinations-roumanie-timisoara'
  AND zone_key = 'seo_og_image' AND value LIKE '%${SITE_URL}%';

UPDATE public.cms_editable_zones
SET value = 'https://www.heldonica.fr/og-default.jpg',
    updated_at = NOW()
WHERE page = 'destinations-compare'
  AND zone_key = 'seo_og_image' AND value LIKE '%${SITE_URL}%';

-- ---------------------------------------------------------------------------
-- 3) Reliquats de renommage sur Timișoara (toutes inactives)
-- ---------------------------------------------------------------------------
DELETE FROM public.cms_editable_zones
WHERE page = 'destinations-roumanie-timisoara'
  AND is_active = false
  AND right(zone_key, 20) = '__ancienne_coquille';

-- ---------------------------------------------------------------------------
-- Vérification (lecture seule)
-- ---------------------------------------------------------------------------
SELECT count(*) AS zones_image_encore_en_repli
FROM public.cms_editable_zones
WHERE is_active AND zone_key LIKE '%image%' AND value LIKE '%og-default%';

SELECT count(*) AS gabarits_non_resolus
FROM public.cms_editable_zones
WHERE value LIKE '%${SITE_URL}%';
