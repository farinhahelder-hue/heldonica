-- Alignement de la table destinations et durcissement de la vue destinations_public
-- Résout l'incohérence où 27 destinations en status 'draft' avaient published = true (fiche fcf54b53).

BEGIN;

-- 1. Aligner les données : les brouillons ne doivent pas être marqués published = true
UPDATE public.destinations
SET published = false
WHERE status = 'draft' AND published = true;

-- 2. Durcir la vue destinations_public
DROP VIEW IF EXISTS public.destinations_public;

CREATE VIEW public.destinations_public
WITH (security_invoker = true)
AS
SELECT
  slug,
  title,
  excerpt,
  country,
  continent,
  region,
  flag_emoji,
  tagline,
  teaser,
  hero_unsplash_url,
  featured_image,
  link,
  COALESCE(travel_style, category) AS travel_style,
  best_season,
  avg_budget_couple_week,
  status,
  priority_score,
  article_count,
  coming_soon_date,
  latitude,
  longitude,
  published
FROM public.destinations
WHERE (published = true AND status = 'published')
   OR status IN ('coming_soon', 'starred')
ORDER BY priority_score DESC, title ASC;

COMMIT;
