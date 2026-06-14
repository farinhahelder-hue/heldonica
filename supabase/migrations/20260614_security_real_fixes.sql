-- ============================================================
-- MIGRATION : Corrections sécurité réelles — 14 juin 2026
-- STATUT : APPLIQUÉE EN PROD le 14/06/2026
-- ============================================================

-- 1. SUPPRIMER cms_password de cms_carousel_history ✔
ALTER TABLE public.cms_carousel_history
  DROP COLUMN IF EXISTS cms_password;

-- 2. ACTIVER RLS sur les 3 tables article_map_* ✔
ALTER TABLE public.article_map_routes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_map_pois         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_map_route_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lecture_publique_article_map_routes"
  ON public.article_map_routes FOR SELECT USING (true);

CREATE POLICY "lecture_publique_article_map_pois"
  ON public.article_map_pois FOR SELECT USING (true);

CREATE POLICY "lecture_publique_article_map_route_points"
  ON public.article_map_route_points FOR SELECT USING (true);

CREATE POLICY "admin_write_article_map_routes"
  ON public.article_map_routes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_write_article_map_pois"
  ON public.article_map_pois FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_write_article_map_route_points"
  ON public.article_map_route_points FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3. RENFORCER policy INSERT cms_newsletter ✔
DROP POLICY IF EXISTS "Allow public newsletter signup" ON public.cms_newsletter;
DROP POLICY IF EXISTS "Public can subscribe" ON public.cms_newsletter;

CREATE POLICY "public_newsletter_insert_validated"
  ON public.cms_newsletter FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 254
  );

-- NOTE : newsletter_subscribers n'existe pas dans cette base — ignoré

-- 4. SUPPRIMER INSERT public sur site_settings ✔
DROP POLICY IF EXISTS "Public can insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow insert site_settings" ON public.site_settings;

-- 5. cms_destinations — EN ATTENTE de confirmation visuelle
-- DROP TABLE IF EXISTS public.cms_destinations;
