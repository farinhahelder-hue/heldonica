-- ============================================================
-- MIGRATION : Consolidation tables — 14 juin 2026
-- STATUT : APPLIQUÉE EN PROD le 14/06/2026
-- A. Supprimer cms_destinations (orpheline, 0 références app)
-- B. Finaliser architecture cms_blog_posts → articles
-- ============================================================

-- A. DROP cms_destinations
DROP TABLE IF EXISTS public.cms_destinations;

-- B3. COLONNES EN PREMIER
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS destination   TEXT,
  ADD COLUMN IF NOT EXISTS country       TEXT,
  ADD COLUMN IF NOT EXISTS travel_style  TEXT,
  ADD COLUMN IF NOT EXISTS faq_content   JSONB;

-- B0. CRÉER LA FONCTION sync_to_articles
--     (définie dans 20260608 mais jamais exécutée en base)
--     NOTE : destination/country/travel_style absentes de cms_blog_posts
--     — ces colonnes sur articles seront remplies via le CMS uniquement
CREATE OR REPLACE FUNCTION sync_to_articles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO articles (
    id, title, slug, category, excerpt, content, featured_image, author,
    published, published_at, created_at, updated_at, tags, archived,
    voice_notes, faq_content
  )
  VALUES (
    NEW.id, NEW.title, NEW.slug, NEW.category, NEW.excerpt, NEW.content,
    NEW.featured_image, NEW.author, NEW.published, NEW.published_at,
    NEW.created_at, NEW.updated_at, COALESCE(NEW.tags, ARRAY[]::TEXT[]),
    false,
    NEW.voice_notes, NEW.faq_content
  )
  ON CONFLICT (slug) DO UPDATE SET
    title          = EXCLUDED.title,
    category       = EXCLUDED.category,
    excerpt        = EXCLUDED.excerpt,
    content        = EXCLUDED.content,
    featured_image = EXCLUDED.featured_image,
    author         = EXCLUDED.author,
    published      = EXCLUDED.published,
    published_at   = EXCLUDED.published_at,
    updated_at     = EXCLUDED.updated_at,
    tags           = EXCLUDED.tags,
    voice_notes    = EXCLUDED.voice_notes,
    faq_content    = EXCLUDED.faq_content;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- B1. Attacher le trigger
DROP TRIGGER IF EXISTS trigger_sync_to_articles ON public.cms_blog_posts;

CREATE TRIGGER trigger_sync_to_articles
  AFTER INSERT OR UPDATE ON public.cms_blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION sync_to_articles();

-- B2. Sync initiale — uniquement colonnes confirmées dans cms_blog_posts
UPDATE public.articles a
SET
  voice_notes = c.voice_notes,
  faq_content = c.faq_content,
  updated_at  = NOW()
FROM public.cms_blog_posts c
WHERE a.slug = c.slug
  AND (
    a.voice_notes IS DISTINCT FROM c.voice_notes
    OR a.faq_content IS DISTINCT FROM c.faq_content
  );

-- B4. Policy admin articles
DROP POLICY IF EXISTS "Authenticated admin full access" ON public.articles;

CREATE POLICY "Authenticated admin full access"
  ON public.articles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- ARCHITECTURE FINALE
-- cms_blog_posts = source d'écriture CMS (ne pas supprimer)
-- articles       = source de lecture front Vercel
-- sync           = trigger trigger_sync_to_articles actif
-- destination/country/travel_style = à remplir via CMS
-- ============================================================
