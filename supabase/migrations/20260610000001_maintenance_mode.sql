-- Migration: Ensure maintenance_mode field exists with correct defaults
-- Date: 2026-06-10

BEGIN;

-- Ensure maintenance_mode exists with correct boolean handling
INSERT INTO site_settings (key, value, label, type)
VALUES ('maintenance_mode', 'false', 'Mode maintenance', 'boolean')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  label = EXCLUDED.label,
  type = EXCLUDED.type;

-- Ensure maintenance_message exists
INSERT INTO site_settings (key, value, label, type)
VALUES ('maintenance_message', 'On revient très vite avec de nouvelles pépites ! 🌿', 'Message affiché en maintenance', 'text')
ON CONFLICT (key) DO UPDATE SET
  value = COALESCE(NULLIF(site_settings.value, ''), EXCLUDED.value);

-- Ensure maintenance_end_date exists
INSERT INTO site_settings (key, value, label, type)
VALUES ('maintenance_end_date', '', 'Fin de maintenance prévue (optionnel)', 'text')
ON CONFLICT (key) DO NOTHING;

COMMIT;