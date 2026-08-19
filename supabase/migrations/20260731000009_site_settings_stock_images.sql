-- ============================================================================
-- site_settings : retrait des images de stock (décisions A2)
-- Date: 2026-07-31
-- ============================================================================
-- Complète 20260731_cms_zones_cleanup.sql, qui ne traitait que
-- `cms_editable_zones`. Trois images hero vivent en réalité dans
-- `site_settings`, sous des clés `<page>__hero_image`, et pointent vers
-- images.unsplash.com :
--
--   home__hero_image, travel-planning__hero_image, a-propos__hero_image
--
-- `lib/cms-page-defaults.ts` déclare pour ces trois clés la valeur attendue
-- '/og-default.jpg' : les lignes en base ne faisaient que l'écraser par du
-- stock. On les y ramène plutôt que de supprimer les lignes, pour garder la
-- clé visible dans le panneau d'administration et rester réversible.
--
-- Idempotent : rejouable sans effet de bord.

UPDATE public.site_settings
SET value = '/og-default.jpg'
WHERE key IN ('home__hero_image', 'travel-planning__hero_image', 'a-propos__hero_image')
  AND value ~* '(unsplash|pexels|pixabay|shutterstock|istockphoto|gettyimages)';

-- ─── Vérification (lecture seule) ────────────────────────────────────────────

SELECT 'Images stock dans site_settings' AS controle, count(*)::text AS n,
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM public.site_settings
WHERE value ~* '(unsplash|pexels|pixabay|shutterstock|istockphoto|gettyimages)';

SELECT key, value FROM public.site_settings
WHERE key IN ('home__hero_image', 'travel-planning__hero_image', 'a-propos__hero_image')
ORDER BY key;
