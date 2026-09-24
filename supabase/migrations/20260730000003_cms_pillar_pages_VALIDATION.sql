-- ============================================================================
-- VALIDATION post-migration — cms_pillar_pages
-- À exécuter dans le SQL editor Supabase APRÈS 20260730_cms_pillar_pages_idempotent.sql
-- Lecture seule : aucune de ces requêtes ne modifie la base.
-- ============================================================================

-- 1. La table existe et est exposée
SELECT
  'Table créée' AS test,
  COUNT(*)::text AS resultat,
  CASE WHEN COUNT(*) = 1 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'cms_pillar_pages';

-- 2. Les 3 piliers sont seedés et actifs
SELECT
  '3 piliers actifs' AS test,
  COUNT(*)::text AS resultat,
  CASE WHEN COUNT(*) = 3 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM cms_pillar_pages
WHERE slug IN ('madere', 'montenegro', 'roumanie') AND is_active = true;

-- 3. Aucune image de stock réintroduite (décisions A2)
SELECT
  'Aucune URL Unsplash / WordPress' AS test,
  COUNT(*)::text AS resultat,
  CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM cms_pillar_pages
WHERE hero ILIKE '%unsplash%' OR hero ILIKE '%wp-content%';

-- 4. Les colonnes JSONB attendues par lib/pillar-data.ts sont bien des tableaux non vides
--    (mapRowToPillarData exige Array.isArray sur intro/info_table/itinerary/budget_breakdown/faq)
SELECT
  slug,
  jsonb_typeof(intro)             AS intro_type,
  jsonb_array_length(intro)       AS intro_n,
  jsonb_array_length(info_table)  AS info_n,
  jsonb_array_length(itinerary)   AS itineraire_n,
  jsonb_array_length(budget_breakdown) AS budget_n,
  jsonb_array_length(faq)         AS faq_n,
  (tested_by_heldonica IS NOT NULL) AS a_tested_by,
  (verdict IS NOT NULL)             AS a_verdict,
  CASE
    WHEN jsonb_typeof(intro) = 'array'
     AND jsonb_array_length(intro) > 0
     AND jsonb_array_length(itinerary) > 0
     AND jsonb_array_length(faq) > 0
    THEN 'OK' ELSE 'ECHEC'
  END AS verdict_test
FROM cms_pillar_pages
ORDER BY slug;

-- 5. Champs obligatoires non vides (sinon la page pilier s'affiche dégradée)
SELECT
  slug,
  (name IS NOT NULL AND name <> '')             AS a_name,
  (country IS NOT NULL AND country <> '')       AS a_country,
  (tagline IS NOT NULL AND tagline <> '')       AS a_tagline,
  (seo_title IS NOT NULL AND seo_title <> '')   AS a_seo_title,
  (seo_desc IS NOT NULL AND seo_desc <> '')     AS a_seo_desc,
  budget
FROM cms_pillar_pages
ORDER BY slug;

-- 6. Unicité du slug effectivement contrainte
SELECT
  'Contrainte UNIQUE sur slug' AS test,
  COUNT(*)::text AS resultat,
  CASE WHEN COUNT(*) >= 1 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'cms_pillar_pages' AND c.contype = 'u';

-- 7. RLS active + policies en place
SELECT
  'RLS activée' AS test,
  relrowsecurity::text AS resultat,
  CASE WHEN relrowsecurity THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM pg_class WHERE relname = 'cms_pillar_pages';

SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'cms_pillar_pages' ORDER BY policyname;

-- 8. Cohérence avec la table destinations : les 3 piliers doivent y exister en published
--    (le hub et les pages piliers doivent parler des mêmes destinations)
SELECT
  p.slug,
  (d.slug IS NOT NULL) AS present_dans_destinations,
  d.status,
  CASE WHEN d.slug IS NOT NULL AND d.status = 'published' THEN 'OK' ELSE 'A VERIFIER' END AS verdict
FROM cms_pillar_pages p
LEFT JOIN destinations d ON d.slug = p.slug
ORDER BY p.slug;
