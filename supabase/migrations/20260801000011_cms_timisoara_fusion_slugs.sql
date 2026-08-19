-- ============================================================================
-- cms_editable_zones : fusionner les deux jeux de zones de Timișoara
-- Date: 2026-08-01
-- ============================================================================
-- Timișoara existait à deux URL vivantes, avec deux contenus différents :
--
--   /destinations/timisoara           page de 259 lignes, slug
--                                     `destinations-timisoara`, 46 zones
--   /destinations/roumanie/timisoara  coquille de 66 lignes sur le template
--                                     partagé, slug
--                                     `destinations-roumanie-timisoara`, 14 zones
--
-- Les deux répondaient en 200 : duplication de contenu sur deux URL indexables.
-- Et incohérence de navigation, puisque Brașov, Cluj et Bucarest vivent tous
-- sous /destinations/roumanie/.
--
-- Arbitrage rendu par cohérence : le contenu riche l'emporte, et il prend l'URL
-- conventionnelle. Le code déplace donc la vraie page sous /roumanie/timisoara,
-- et l'ancienne URL redirige.
--
-- Côté données, les 46 zones doivent suivre. Les 14 zones de la coquille sont
-- d'abord neutralisées : elles décrivaient une page qui n'existe plus, et 4 de
-- leurs clés entreraient en collision avec celles du contenu riche — dont 3
-- avec une valeur différente.


-- ─── 1. Neutraliser les zones de la coquille ────────────────────────────────

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE page = 'destinations-roumanie-timisoara' AND is_active;


-- ─── 2. Rattacher les zones du contenu riche au slug conventionnel ──────────
-- La contrainte UNIQUE (page, zone_key) est libre : l'étape 1 a désactivé les
-- lignes concurrentes, mais elles existent toujours. On les renomme donc pour
-- libérer la clé, plutôt que de les supprimer.

UPDATE public.cms_editable_zones
SET zone_key = zone_key || '__ancienne_coquille', updated_at = NOW()
WHERE page = 'destinations-roumanie-timisoara' AND NOT is_active;

UPDATE public.cms_editable_zones
SET page = 'destinations-roumanie-timisoara', updated_at = NOW()
WHERE page = 'destinations-timisoara';


-- ─── Vérifications (lecture seule) ──────────────────────────────────────────

SELECT page,
       count(*) FILTER (WHERE is_active)     AS actives,
       count(*) FILTER (WHERE NOT is_active) AS neutralisees
FROM public.cms_editable_zones
WHERE page LIKE '%timisoara%'
GROUP BY page ORDER BY page;
