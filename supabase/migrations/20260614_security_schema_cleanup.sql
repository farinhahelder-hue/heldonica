-- ============================================================
-- Heldonica — Supabase Security & Schema Cleanup 2026-06-14
-- Priorités :
--   1. Supprimer cms_password en clair (cms_carousel_history)
--   2. Créer guides_pdf avec RLS sécurisé
--   3. Activer RLS sur article_map_*
--   4. Consolider tables newsletter
--   5. Documenter source de vérité articles/destinations
-- ============================================================
-- Exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 0. RESTREINDRE cms_carousel_history À service_role ONLY
--    La policy actuelle "Admins can manage" utilise USING (true)
--    qui autorise TOUT utilisateur authentifié (risqué si plusieurs users).
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP POLICY IF EXISTS "Admins can manage carousel history"
  ON public.cms_carousel_history;

CREATE POLICY "Service role only carousel history"
  ON public.cms_carousel_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. SUPPRIMER cms_password EN CLAIR
--    cms_carousel_history.cms_password ne doit JAMAIS être
--    stocké en clair. Si besoin d'authentification, utiliser
--    Supabase Auth ou un secret dans les variables d'env.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE public.cms_carousel_history
  DROP COLUMN IF EXISTS cms_password;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. CRÉER guides_pdf AVEC RLS
--    Table pour les lead magnets PDF (guides slow travel).
--    Lecture publique (lead magnet) + Écriture service_role
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.guides_pdf (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  filename     TEXT NOT NULL,          -- nom du fichier dans le storage
  storage_path TEXT NOT NULL,           -- chemin dans Supabase Storage
  cover_image  TEXT,                    -- URL de la couverture
  download_url TEXT,                    -- URL publique (optionnel, peut utiliser storage public URL)
  file_size_kb INTEGER,
  page_count   INTEGER,
  language     TEXT DEFAULT 'fr' CHECK (language IN ('fr','en','es','pt')),
  tags         TEXT[] DEFAULT '{}',
  is_active    BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes courantes
CREATE INDEX IF NOT EXISTS idx_guides_pdf_slug     ON guides_pdf(slug);
CREATE INDEX IF NOT EXISTS idx_guides_pdf_active  ON guides_pdf(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_guides_pdf_language ON guides_pdf(language);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_guides_pdf_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_guides_pdf_updated_at ON guides_pdf;
CREATE TRIGGER update_guides_pdf_updated_at
  BEFORE UPDATE ON guides_pdf
  FOR EACH ROW EXECUTE FUNCTION update_guides_pdf_updated_at();

-- RLS
ALTER TABLE public.guides_pdf ENABLE ROW LEVEL SECURITY;

-- Policy 1 : Lecture publique (tout le monde peut voir les guides actifs — lead magnet)
CREATE POLICY "Public read active guides_pdf"
  ON public.guides_pdf
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy 2 : Écriture service_role uniquement (API routes via SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "Service role manages guides_pdf"
  ON public.guides_pdf
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. ACTIVER RLS SUR article_map_*
--    Tables pour les itinéraires interactifs sur les articles.
--    Écriture service_role, pas de lecture publique.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 3a. article_map_routes
ALTER TABLE public.article_map_routes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read article_map_routes" ON public.article_map_routes;
DROP POLICY IF EXISTS "Service role article_map_routes" ON public.article_map_routes;

CREATE POLICY "Service role manages article_map_routes"
  ON public.article_map_routes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3b. article_map_pois
ALTER TABLE public.article_map_pois ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read article_map_pois" ON public.article_map_pois;
DROP POLICY IF EXISTS "Service role article_map_pois" ON public.article_map_pois;

CREATE POLICY "Service role manages article_map_pois"
  ON public.article_map_pois
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3c. article_map_route_points
ALTER TABLE public.article_map_route_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role article_map_route_points" ON public.article_map_route_points;

CREATE POLICY "Service role manages article_map_route_points"
  ON public.article_map_route_points
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. CONSOLIDER LES TABLES NEWSLETTER
--    → cms_newsletter  : table OFFICIELLE (utilisée par l'API)
--    → newsletter_subscribers : SUPPRIMER (doublon non utilisé par le code)
--
--    cms_newsletter a déjà :
--    - "Public insert newsletter"  (FOR INSERT WITH CHECK (true))
--    - "Public select newsletter" (FOR SELECT USING (true))
--
--    On renforce la policy INSERT avec une validation email basique
--    via une fonction helper.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Renforcer la policy INSERT : vérifier que c'est bien un email
CREATE OR REPLACE FUNCTION public.is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Supprimer l'ancienne policy et la recréer avec validation email
DROP POLICY IF EXISTS "Public insert newsletter" ON public.cms_newsletter;
CREATE POLICY "Public insert newsletter with email validation"
  ON public.cms_newsletter
  FOR INSERT
  TO public
  WITH CHECK (
    is_valid_email(email)
    AND char_length(email) <= 254
  );

-- ── cms_newsletter SELECT : restriction privacy ───────────
-- ATTENTION : la policy "Public select newsletter" existante expose
-- TOUS les emails en lecture publique — violation RGPD potentielle.
-- On la remplace par une lecture service_role ONLY (admin only).
DROP POLICY IF EXISTS "Public select newsletter" ON public.cms_newsletter;
CREATE POLICY "Service role read newsletter"
  ON public.cms_newsletter
  FOR SELECT
  TO service_role
  USING (true);

-- Supprimer newsletter_subscribers (doublon non utilisé par le code)
-- Note : à exécuter SEULEMENT si vous êtes sûr que newsletter_subscribers n'est plus utilisé
-- Vérifiez d'abord : aucun code ne fait .from('newsletter_subscribers')
DROP TABLE IF EXISTS public.newsletter_subscribers;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. DOCUMENTER SOURCE DE VÉRITÉ ARTICLES / DESTINATIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ── ARTICLES ─────────────────────────────────────────────
--  ✓ articles       : Source de vérité pour les pages PUBLICS (lib/blog-supabase.ts, sitemap, OG)
--  ✓ cms_blog_posts : Table d'édition CMS (API routes /api/cms/articles/*)
--
--  Flux attendu :
--  1. L'éditeur CMS écrit dans cms_blog_posts
--  2. Un trigger sync_to_articles() met à jour articles automatiquement
--  3. Les pages publiques lisent UNIQUEMENT dans articles
--
--  RÈGLE : Ne jamais modifier la table `articles` directement.
--          Toujours passer par cms_blog_posts + trigger.

-- ── DESTINATIONS ─────────────────────────────────────────
--  ✓ destinations    : Source de vérité (coordonnées GPS, slug, pour la carte interactive)
--  ✓ cms_destinations : Table historique — NE PLUS UTILISER
--
--  RÈGLE : Toutes les nouvelles destinations doivent être ajoutées dans `destinations`.
--          cms_destinations reste en lecture seule pour archivage.

-- ── Trigger sync cms_blog_posts → articles ───────────────
-- (Déja créé dans 20260608_create_articles_table.sql, on le recrée au cas où)

DROP TRIGGER IF EXISTS sync_cms_blog_posts_to_articles ON cms_blog_posts;
DROP FUNCTION IF EXISTS sync_cms_blog_posts_to_articles();

CREATE OR REPLACE FUNCTION sync_cms_blog_posts_to_articles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO articles (
    id, title, slug, category, excerpt, content, featured_image, author,
    published, published_at, created_at, updated_at, tags, archived
  )
  VALUES (
    NEW.id, NEW.title, NEW.slug, NEW.category, NEW.excerpt, NEW.content,
    NEW.featured_image, NEW.author, NEW.published, NEW.published_at,
    NEW.created_at, NEW.updated_at,
    COALESCE(NEW.tags, ARRAY[]::TEXT[]),
    false
  )
  ON CONFLICT (slug) DO UPDATE SET
    title        = EXCLUDED.title,
    category     = EXCLUDED.category,
    excerpt      = EXCLUDED.excerpt,
    content      = EXCLUDED.content,
    featured_image = EXCLUDED.featured_image,
    author       = EXCLUDED.author,
    published    = EXCLUDED.published,
    published_at = EXCLUDED.published_at,
    updated_at   = EXCLUDED.updated_at,
    tags         = EXCLUDED.tags,
    archived     = false;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_cms_blog_posts_to_articles
  AFTER INSERT OR UPDATE ON cms_blog_posts
  FOR EACH ROW EXECUTE FUNCTION sync_cms_blog_posts_to_articles();

-- ── Trigger sync cms_destinations → destinations ──────────
-- (Optionnel — à activer si vous voulez migrer les données progressivement)
-- DROP TRIGGER IF EXISTS sync_cms_destinations_to_destinations ON cms_destinations;
-- DROP FUNCTION IF EXISTS sync_cms_destinations_to_destinations();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 6. VÉRIFICATION FINALE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Vérifier RLS sur toutes les tables critiques
SELECT
  t.tablename,
  t.rowsecurity  AS rls_enabled,
  (
    SELECT COUNT(*)
    FROM pg_policy p
    WHERE p.polrelid = t.tablename::regclass
  ) AS policy_count
FROM pg_tables t
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'articles','cms_blog_posts',
    'destinations','cms_destinations',
    'guides_pdf','cms_media',
    'cms_newsletter','cms_carousel_history',
    'article_map_routes','article_map_pois','article_map_route_points'
  )
ORDER BY t.tablename;