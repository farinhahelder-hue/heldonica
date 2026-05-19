-- ============================================================
-- Heldonica — Supabase RLS Security Fix
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. instagram_drafts — Admin write only, no public read
-- ────────────────────────────────────────────────────────────
ALTER TABLE instagram_drafts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Public read instagram_drafts" ON instagram_drafts;
DROP POLICY IF EXISTS "Admin all instagram_drafts" ON instagram_drafts;

-- No public access at all — only service role (used by API routes)
CREATE POLICY "Service role only" ON instagram_drafts
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ────────────────────────────────────────────────────────────
-- 2. cms_settings — Public read OK (theme/colors/logo), write = service role only
-- ────────────────────────────────────────────────────────────
ALTER TABLE cms_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cms_settings" ON cms_settings;
DROP POLICY IF EXISTS "Admin write cms_settings" ON cms_settings;

-- Public can READ settings (needed for SiteTheme.tsx server component)
CREATE POLICY "Public read cms_settings" ON cms_settings
  FOR SELECT
  USING (true);

-- Only service role can INSERT/UPDATE/DELETE (API routes use service role key)
CREATE POLICY "Service role write cms_settings" ON cms_settings
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 3. user_profiles — Owner read/write only
-- ────────────────────────────────────────────────────────────
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;

-- Users can only read their own profile
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin CMS)
CREATE POLICY "Service role all user_profiles" ON user_profiles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- 4. Verify existing tables have RLS (check only — no changes)
-- ────────────────────────────────────────────────────────────
-- Run this SELECT to confirm RLS status on all tables:
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
