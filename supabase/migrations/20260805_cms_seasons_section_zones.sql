-- ===========================================================================
-- Libellés de la section « Quand partir » (SeasonalTable) sur les pages
-- piliers, pilotés par le CMS. Valeurs initiales = fallbacks du code.
-- Idempotente.
-- ===========================================================================

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('destinations', 'seasons_title_prefix', 'text', 'Quand partir à', 'Saisons — préfixe titre (suivi du nom de la destination)', true),
  ('destinations', 'seasons_intro', 'textarea', 'On a testé plusieurs saisons sur place. Voici comment on les vit, entre météo, affluence et budget — clique sur une saison pour le détail.', 'Saisons — accroche', true)
ON CONFLICT (page, zone_key) DO UPDATE
  SET zone_type = EXCLUDED.zone_type,
      value     = EXCLUDED.value,
      label     = EXCLUDED.label,
      is_active = true;
