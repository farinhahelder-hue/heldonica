-- Activation du mode maintenance — 2026-10-25
-- Décision du propriétaire : le site public est masqué le temps de résorber les
-- incohérences éditoriales relevées dans l'audit du 2026-10-20.
--
-- Source de vérité : `site_settings.maintenance_mode`, lue par middleware.ts via
-- getMaintenanceMode() (lib/supabase-edge.ts). La variable Vercel MAINTENANCE_MODE
-- n'intervient qu'en secours si Supabase est injoignable.
--
-- Pour désactiver : repasser cette même clé à 'false' (nouvelle migration versionnée).
-- Ne PAS éditer cette migration après application.

INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES ('maintenance_mode', 'true', 'Mode maintenance', 'boolean', now())
ON CONFLICT (key) DO UPDATE
  SET value = 'true',
      updated_at = now();
