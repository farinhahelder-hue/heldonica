-- ============================================================================
-- cms_editable_zones : rattacher le SEO de l'accueil a la page `home`
-- Date: 2026-08-01
-- ============================================================================
-- Le script de generation des zones SEO du 01/08 a pris le NOM DE FICHIER pour
-- le slug de page. La page d'accueil s'est donc retrouvee avec :
--
--   page = 'page.tsx'   seo_title, seo_description, seo_og_image
--
-- et app/page.tsx appelait buildPageMetadata('page.tsx', metadata) — code et
-- donnees etaient coherents entre eux, mais sur un identifiant qui n'en est pas
-- un. Consequence : dans l'admin, le SEO de l'accueil apparaissait sous une
-- entree « page.tsx », separee des 56 autres zones de la page `home`.
--
-- Le code passe a buildPageMetadata('home', …). Les donnees suivent.
-- `home` ne possede aucune zone seo_* : aucun conflit de cle.

UPDATE public.cms_editable_zones
SET page = 'home', updated_at = NOW()
WHERE page = 'page.tsx';


-- ─── Verification (lecture seule) ───────────────────────────────────────────

SELECT page, zone_key, left(value, 46) AS value
FROM public.cms_editable_zones
WHERE zone_key LIKE 'seo_%' AND page IN ('home', 'page.tsx')
ORDER BY zone_key;
