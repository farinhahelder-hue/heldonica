-- Migration: Add maintenance settings to settings table
-- Date: 2026-06-10
-- Description: Add maintenance_mode, maintenance_message, maintenance_end_date settings

INSERT INTO settings (key, value, label, type)
VALUES
  ('maintenance_mode', 'false', 'Mode maintenance actif', 'text'),
  ('maintenance_message', 'Site en cours de maintenance. Retour imminent.', 'Message de maintenance', 'textarea'),
  ('maintenance_end_date', '', 'Date de fin estimée', 'text')
ON CONFLICT (key) DO NOTHING;