-- ============================================================================
-- cms_pillar_pages : colonne `accommodations` (Sprint 2 — section « Où dormir »)
-- Date: 2026-07-31
-- ============================================================================
-- Ajout non destructif d'une colonne JSONB. Aucune donnée existante n'est lue,
-- réécrite ni supprimée : les 3 lignes pilier seedées le 2026-07-30 sont
-- inchangées et héritent simplement du défaut '[]'.
--
-- Forme attendue (consommée par lib/pillar-data.ts → PillarData.accommodations) :
--   [{ "type": "charme", "label": "…", "description": "…", "searchQuery": "Funchal" }]
--   type : 'charme' | 'nature' | 'budget'
--   searchQuery : ville/zone envoyée à la recherche Booking. Optionnel —
--                 à défaut, le nom de la destination est utilisé.
--
-- La colonne reste vide à l'application : le contenu « Où dormir » doit venir
-- d'hébergements réellement testés, pas d'un seed générique. Tant qu'elle est
-- vide, la section n'apparaît pas sur la page (l'absence est visible, pas
-- masquée par du remplissage).
--
-- Idempotent : rejouable sans effet de bord.

ALTER TABLE public.cms_pillar_pages
  ADD COLUMN IF NOT EXISTS accommodations JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.cms_pillar_pages.accommodations IS
  'Où dormir par type de séjour : [{type: charme|nature|budget, label, description, searchQuery?}]. Vide = section masquée.';

-- ─── Vérification (lecture seule) ────────────────────────────────────────────
SELECT
  'Colonne accommodations présente' AS test,
  COUNT(*)::text AS resultat,
  CASE WHEN COUNT(*) = 1 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cms_pillar_pages'
  AND column_name = 'accommodations';

SELECT slug, jsonb_typeof(accommodations) AS type, jsonb_array_length(accommodations) AS n
FROM public.cms_pillar_pages
ORDER BY slug;
