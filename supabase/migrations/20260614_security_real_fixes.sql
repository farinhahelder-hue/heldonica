-- ============================================================
-- MIGRATION : Corrections sécurité réelles — 14 juin 2026
-- Basée sur fact-check du codebase (pas sur audit tiers)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. SUPPRIMER cms_password de cms_carousel_history
--    Colonne TEXT en clair confirmée ligne 10 de 20260502000000
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.cms_carousel_history
  DROP COLUMN IF EXISTS cms_password;

-- ─────────────────────────────────────────────────────────────
-- 2. ACTIVER RLS sur les 3 tables article_map_*
--    Créées dans 20260613_article_maps.sql sans aucune policy
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.article_map_routes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_map_pois      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_map_route_points ENABLE ROW LEVEL SECURITY;

-- Lecture publique (données cartographiques des articles publiés)
CREATE POLICY "lecture_publique_article_map_routes"
  ON public.article_map_routes FOR SELECT
  USING (true);

CREATE POLICY "lecture_publique_article_map_pois"
  ON public.article_map_pois FOR SELECT
  USING (true);

CREATE POLICY "lecture_publique_article_map_route_points"
  ON public.article_map_route_points FOR SELECT
  USING (true);

-- Écriture réservée aux admins authentifiés
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

-- ─────────────────────────────────────────────────────────────
-- 3. RENFORCER les policies INSERT des formulaires publics
--    Actuellement : WITH CHECK (true) = aucun guard anti-spam
--    → Ajouter validation format email + rate limit côté app
--    Note : la contrainte CHECK SQL ne remplace pas un captcha,
--    mais on bloque au moins les emails vides ou malformés.
-- ─────────────────────────────────────────────────────────────

-- cms_newsletter : remplacer la policy INSERT permissive
DROP POLICY IF EXISTS "Allow public newsletter signup" ON public.cms_newsletter;
DROP POLICY IF EXISTS "Public can subscribe" ON public.cms_newsletter;

CREATE POLICY "public_newsletter_insert_validated"
  ON public.cms_newsletter FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 254
  );

-- newsletter_subscribers : même logique
DROP POLICY IF EXISTS "Allow public subscriber insert" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public can subscribe" ON public.newsletter_subscribers;

CREATE POLICY "public_subscribers_insert_validated"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 254
  );

-- site_settings : retirer l'INSERT public (table admin uniquement)
DROP POLICY IF EXISTS "Public can insert settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow insert site_settings" ON public.site_settings;
-- (les policies SELECT et UPDATE admin existantes restent inchangées)

-- ─────────────────────────────────────────────────────────────
-- 4. SUPPRIMER cms_destinations (table orpheline, 0 références)
--    → Les données réelles sont dans public.destinations
--    ATTENTION : vérifier visuellement avant d'exécuter
--    Décommente la ligne ci-dessous quand confirmé :
-- ─────────────────────────────────────────────────────────────
-- DROP TABLE IF EXISTS public.cms_destinations;
