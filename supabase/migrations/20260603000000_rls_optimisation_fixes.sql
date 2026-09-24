-- ============================================================
-- Heldonica — RLS Optimisation: Fix auth.uid() subquery
-- ============================================================
-- Remplace auth.uid() par (select auth.uid()) dans les policies RLS
-- pour éviter les problèmes de cache avec les fonctions volatiles.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 4A. user_profiles — Corriger les policies avec subquery
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;

-- Lecture: seul le propriétaire peut lire son profil
CREATE POLICY "Users read own profile" ON user_profiles
  FOR SELECT
  USING ((select auth.uid()) = id);

-- Modification: seul le propriétaire peut modifier son profil
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Le service role peut tout faire (CMS admin)
-- Cette policy reste inchangée car elle utilise auth.role()
-- CREATE POLICY "Service role all user_profiles" ON user_profiles ...

-- ────────────────────────────────────────────────────────────
-- 4A. cms_settings — Aucune policy avec auth.uid() ici
-- (public read + service role write seulement)
-- ────────────────────────────────────────────────────────────

-- Note: Les policies cms_settings existantes n'utilisent pas auth.uid()
-- et ne nécessitent pas de modification
-- - "Public read cms_settings" utilise USING (true)
-- - "Service role write cms_settings" utilise auth.role()

-- ────────────────────────────────────────────────────────────
-- 4A. instagram_drafts — Aucune policy avec auth.uid() ici
-- (service role only)
-- ────────────────────────────────────────────────────────────

-- Note: Les policies instagram_drafts existantes n'utilisent pas auth.uid()
-- et ne nécessitent pas de modification
-- - "Service role only" utilise USING (false)

-- ────────────────────────────────────────────────────────────
-- 4A. cms_carousel_history — Aucune policy avec auth.uid() ici
-- (admin only)
-- ────────────────────────────────────────────────────────────

-- Note: Les policies cms_carousel_history existantes n'utilisent pas auth.uid()
-- - "Admins can manage carousel history" utilise USING (true)

-- ────────────────────────────────────────────────────────────
-- 4B. Nettoyage des index dupliqués sur destinations
-- ────────────────────────────────────────────────────────────

DROP INDEX IF EXISTS idx_cms_destinations_category;
DROP INDEX IF EXISTS idx_cms_destinations_region;

-- ────────────────────────────────────────────────────────────
-- 4C. Préparation FAQ — Ajouter colonne faq_content
-- ────────────────────────────────────────────────────────────

ALTER TABLE cms_blog_posts
ADD COLUMN IF NOT EXISTS faq_content JSONB;

-- ============================================================
-- Vérification finale
-- ============================================================

-- Afficher toutes les policies RLS pour vérification
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'cms_settings', 'instagram_drafts', 'cms_carousel_history', 'cms_blog_posts')
ORDER BY tablename, policyname;