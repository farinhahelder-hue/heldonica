-- Migration 20261022235000_quiz_capture_email_zones.sql
-- Déclaration des zones CMS pour la capture email du quiz (/quiz).
--
-- Clés déclarées :
--   page='quiz', zone_key='capture_email_title'
--   page='quiz', zone_key='capture_email_button'
--   page='quiz', zone_key='capture_email_note'
--
-- Idempotente via ON CONFLICT DO NOTHING.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, is_active)
VALUES
  ('quiz', 'capture_email_title', 'text', 'Recevoir mon profil complet par email', true),
  ('quiz', 'capture_email_button', 'text', 'Recevoir mon profil', true),
  ('quiz', 'capture_email_note', 'text', 'Gratuit · Sans engagement · Zéro spam', true)
ON CONFLICT (page, zone_key) DO NOTHING;
