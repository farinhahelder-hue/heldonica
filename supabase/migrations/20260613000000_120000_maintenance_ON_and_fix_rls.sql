-- =============================================================
-- MAINTENANCE MODE ON  +  fix site_settings RLS update policy
-- Run date : 2026-06-13
-- =============================================================

BEGIN;

-- 1. S'assurer que la ligne maintenance_mode existe
INSERT INTO site_settings (key, value, label, type)
VALUES ('maintenance_mode', 'true', 'Mode maintenance', 'boolean')
ON CONFLICT (key) DO UPDATE
  SET value      = 'true',
      updated_at = NOW();

-- 2. S'assurer que la ligne maintenance_message existe
INSERT INTO site_settings (key, value, label, type)
VALUES ('maintenance_message', 'On revient très vite avec de nouvelles pépites ! 🌿', 'Message maintenance', 'text')
ON CONFLICT (key) DO NOTHING;

-- 3. FIX RLS : drop les anciennes policies restrictives et recréer correctement
--    Le bug « Settings vide » vient du fait que UPDATE/DELETE ne sont pas couverts
--    pour le service_role via les policies existantes.

DROP POLICY IF EXISTS "Service role write site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public insert site_settings"  ON site_settings;
DROP POLICY IF EXISTS "Public read site_settings"          ON site_settings;

-- Lecture publique (SiteTheme, middleware, front-end)
CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT
  USING (true);

-- Écriture complète via service_role (toutes les API routes CMS)
CREATE POLICY "site_settings_service_all"
  ON site_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Écriture anon autorisée uniquement pour INSERT (seeds)
CREATE POLICY "site_settings_anon_insert"
  ON site_settings FOR INSERT
  TO anon
  WITH CHECK (true);

COMMIT;
