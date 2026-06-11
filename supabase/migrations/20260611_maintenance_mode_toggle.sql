-- Migration: Maintenance Mode Toggle via CMS
-- Date: 2026-06-11
-- Purpose: Ensure site_settings table has maintenance_mode setting with proper indexing

BEGIN;

-- Ensure maintenance_mode setting exists with correct defaults
INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES ('maintenance_mode', 'false', 'Mode maintenance', 'boolean', NOW())
ON CONFLICT (key) DO UPDATE SET
  value = CASE 
    WHEN site_settings.value NOT IN ('true', 'false', '1', '0', '') THEN 'false'
    ELSE site_settings.value
  END,
  label = 'Mode maintenance',
  type = 'boolean',
  updated_at = NOW();

-- Ensure maintenance_message exists
INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES ('maintenance_message', 'On revient très vite avec de nouvelles pépites ! 🌿', 'Message affiché en maintenance', 'text', NOW())
ON CONFLICT (key) DO UPDATE SET
  value = COALESCE(NULLIF(site_settings.value, ''), EXCLUDED.value),
  label = 'Message affiché en maintenance',
  type = 'text';

-- Ensure maintenance_end_date exists
INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES ('maintenance_end_date', '', 'Fin de maintenance prévue (optionnel)', 'text', NOW())
ON CONFLICT (key) DO NOTHING;

-- Add index on key column for fast lookup (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'site_settings' AND indexname = 'idx_site_settings_key'
  ) THEN
    CREATE INDEX idx_site_settings_key ON site_settings(key);
  END IF;
END $$;

-- Add index on updated_at for cache invalidation queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'site_settings' AND indexname = 'idx_site_settings_updated_at'
  ) THEN
    CREATE INDEX idx_site_settings_updated_at ON site_settings(updated_at);
  END IF;
END $$;

COMMIT;