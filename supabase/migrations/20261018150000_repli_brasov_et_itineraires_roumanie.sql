-- Repli prudent : Brașov et les itinéraires roumains repartent en visuel de repli
--
-- Correctif de 20261018140000_photos_reelles_destinations_et_gabarits.sql.
-- Cette migration-là (et le commentaire de 20260801000007 qu'elle reprenait)
-- affirmait que les 5 photos de la banque media/articles « montrent bien le
-- lieu décrit ». Recoupement fait avec la sauvegarde de juillet 2026, il n'y a
-- de preuve que pour trois d'entre elles, celles qui étaient l'image d'un
-- article portant sur le lieu EXACT :
--   batch-...467099-7   → « Bucarest cachée : Art Nouveau… »        (Bucarest)
--   import-...3929226   → « Le Marais caché : la rue du Temple »    (Paris)
--   batch-...464596-3   → « Stoos Ridge au coucher du soleil »      (Suisse)
-- Les deux autres ne sont adossées qu'à une région, pas au lieu de la page :
--   import-...5717207   → « Transylvanie secrète : villages saxons »  posée sur Brașov
--   import-...6086298   → aucune trace dans la sauvegarde             posée sur les itinéraires
-- La charte veut qu'on n'illustre pas un lieu avec une photo dont on n'est pas
-- sûr ; on remet donc ces 5 zones en repli plutôt que de laisser une
-- affirmation non vérifiée sur des pages publiées.
--
-- Garde-fou : on ne touche QUE les zones qui portent encore précisément cette
-- photo-là. Toute photo posée entre-temps à la main est préservée.
--
-- Idempotent : ré-exécutable sans effet une fois appliqué (et sans effet si
-- 20261018140000 n'a pas été appliquée, les zones étant déjà en repli).

UPDATE public.cms_editable_zones
SET value = '/og-default.jpg',
    updated_at = NOW()
WHERE page = 'destinations-roumanie-brasov'
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND value LIKE '%/media/articles/import-1778535717207.jpg';

UPDATE public.cms_editable_zones
SET value = '/og-default.jpg',
    updated_at = NOW()
WHERE page IN ('destinations-roumanie-itineraire-5-jours',
               'destinations-roumanie-itineraire-7-jours',
               'destinations-roumanie-itineraire-10-jours')
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND value LIKE '%/media/articles/import-1778536086298.jpg';

-- ---------------------------------------------------------------------------
-- Vérification (lecture seule)
-- ---------------------------------------------------------------------------
-- Doivent rester posées (4 pages) :
SELECT page, zone_key, right(value, 40) AS fin_url
FROM public.cms_editable_zones
WHERE page IN ('destinations-roumanie-bucarest', 'destinations-idf-paris',
               'destinations-paris', 'destinations-suisse')
  AND zone_key IN ('hero_image', 'seo_og_image')
ORDER BY page, zone_key;

-- Doivent être en repli (2 pages) :
SELECT page, zone_key, value
FROM public.cms_editable_zones
WHERE page IN ('destinations-roumanie-brasov',
               'destinations-roumanie-itineraire-5-jours',
               'destinations-roumanie-itineraire-7-jours',
               'destinations-roumanie-itineraire-10-jours')
  AND zone_key IN ('hero_image', 'seo_og_image')
ORDER BY page, zone_key;
