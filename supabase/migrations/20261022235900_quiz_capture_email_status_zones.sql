-- Complète 20261022235000 : QuizClient lit aussi ces trois états.
-- Appliquée en base le 2026-10-22, version journalisée 20261022235900.
-- Idempotente : ON CONFLICT DO NOTHING.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, is_active)
VALUES
  ('quiz', 'capture_email_success', 'text', 'Profil envoyé ! Pense à vérifier tes spams si besoin.', true),
  ('quiz', 'capture_email_loading', 'text', 'Envoi...', true),
  ('quiz', 'capture_email_error', 'text', 'Une erreur est survenue. Merci de réessayer.', true)
ON CONFLICT (page, zone_key) DO NOTHING;
