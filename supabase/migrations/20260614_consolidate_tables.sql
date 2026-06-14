-- ============================================================
-- MIGRATION : Consolidation tables — 14 juin 2026
-- A. Supprimer cms_destinations (orpheline, 0 références app)
-- B. Finaliser architecture cms_blog_posts → articles
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- A. DROP cms_destinations
--    Table orpheline confirmée : 0 références dans l'app
--    Source de vérité = public.destinations (créée 20260523,
--    RLS activée, seed 25 lignes, utilisée par la carte)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS public.cms_destinations;

-- ─────────────────────────────────────────────────────────────
-- B. ARCHITECTURE cms_blog_posts → articles
--
-- Contexte (lu dans 20260608_create_articles_table.sql) :
--   - cms_blog_posts = source d'écriture (CMS admin)
--   - articles = table de lecture publique (front Vercel)
--   - sync_to_articles() = trigger AFTER INSERT/UPDATE
--     sur cms_blog_posts qui réplique vers articles
--
-- Problème actuel : le trigger est défini mais PAS attaché
-- (aucun CREATE TRIGGER dans 20260608)
-- ─────────────────────────────────────────────────────────────

-- B1. Attacher le trigger sync sur cms_blog_posts
DROP TRIGGER IF EXISTS trigger_sync_to_articles ON public.cms_blog_posts;

CREATE TRIGGER trigger_sync_to_articles
  AFTER INSERT OR UPDATE ON public.cms_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION sync_to_articles();

-- B2. Sync initiale : copier les champs manquants dans articles
--     (voice_notes, destination, country, travel_style, faq_content)
--     qui n'étaient pas dans le INSERT initial de 20260608
UPDATE public.articles a
SET
  voice_notes   = c.voice_notes,
  destination   = c.destination,
  country       = c.country,
  travel_style  = c.travel_style,
  faq_content   = c.faq_content,
  updated_at    = NOW()
FROM public.cms_blog_posts c
WHERE a.slug = c.slug
  AND (
    a.voice_notes  IS DISTINCT FROM c.voice_notes
    OR a.destination IS DISTINCT FROM c.destination
    OR a.country     IS DISTINCT FROM c.country
    OR a.travel_style IS DISTINCT FROM c.travel_style
    OR a.faq_content  IS DISTINCT FROM c.faq_content
  );

-- B3. Ajouter colonnes manquantes dans articles si absent
--     (sécurité si certaines colonnes n'existent pas encore)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS destination   TEXT,
  ADD COLUMN IF NOT EXISTS country       TEXT,
  ADD COLUMN IF NOT EXISTS travel_style  TEXT,
  ADD COLUMN IF NOT EXISTS faq_content   JSONB;

-- B4. Policy admin manquante sur articles
--     (actuellement : public SELECT + service_role ALL
--      mais pas de policy pour l'utilisateur authentifié admin CMS)
DROP POLICY IF EXISTS "Authenticated admin full access" ON public.articles;

CREATE POLICY "Authenticated admin full access"
  ON public.articles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- NOTE FINALE : cms_blog_posts reste la source d'écriture du CMS.
-- Ne pas la supprimer. Une fois le trigger actif et validé en prod,
-- articles devient l'unique source de lecture du front.
-- ─────────────────────────────────────────────────────────────
