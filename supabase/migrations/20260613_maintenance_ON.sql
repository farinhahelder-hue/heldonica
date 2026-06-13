-- 🔴 MAINTENANCE MODE ACTIVATED — 2026-06-13
-- Run this to put the site in maintenance immediately.
-- To deactivate: update value to 'false' in site_settings where key = 'maintenance_mode'

INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES (
  'maintenance_mode',
  'true',
  'Mode maintenance',
  'boolean',
  now()
)
ON CONFLICT (key) DO UPDATE
  SET value = 'true',
      updated_at = now();
