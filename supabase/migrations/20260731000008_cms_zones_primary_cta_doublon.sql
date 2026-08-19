-- ============================================================================
-- cms_editable_zones : doublons primary_cta_* sur la page 'global'
-- Date: 2026-07-31 — sous-lot C
-- ============================================================================
-- `primary_cta_label` et `primary_cta_url` existent comme ZONES, mais le code
-- ne les lit jamais comme telles. Elles apparaissent uniquement en second
-- argument de getCmsOrSetting :
--
--   getCmsOrSetting('header_cta_label', 'primary_cta_label', 'Planifier…')
--                    ^ clé de zone      ^ clé de site_settings
--
-- Le second argument est cherché dans `site_settings`, pas dans les zones. Une
-- ligne de zone portant ce nom n'a donc aucun effet — d'autant que
-- `header_cta_label` / `header_cta_url` portent déjà les mêmes valeurs et sont,
-- elles, réellement lues.
--
-- Aucune suppression : is_active passe à false.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND page = 'global' AND zone_key IN ('primary_cta_label', 'primary_cta_url');


-- ─── Vérification (lecture seule) ───────────────────────────────────────────

SELECT zone_key, is_active, value
FROM public.cms_editable_zones
WHERE page = 'global' AND zone_key IN
  ('primary_cta_label', 'primary_cta_url', 'header_cta_label', 'header_cta_url')
ORDER BY zone_key;
