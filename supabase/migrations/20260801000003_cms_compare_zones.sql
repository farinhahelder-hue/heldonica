-- ============================================================================
-- Page /destinations/compare : contenu piloté par le CMS
-- Date: 2026-08-01 — migrée manuellement
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-compare', 'eyebrow', 'text', 'Comparateur', 'Surtitre du hero', true),
  ('destinations-compare', 'title', 'text', 'Compare nos destinations', 'Titre du hero', true),
  ('destinations-compare', 'description', 'textarea', 'Budget, saison, style de voyage, nombre d''articles — sélectionne jusqu''à 5 destinations et compare-les pour trouver celle qui te correspond.', 'Description du hero', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
