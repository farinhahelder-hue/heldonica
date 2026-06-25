-- ============================================================
-- HELDONICA — Migration audit fixes 2026-06-25
-- Fichier : 20260625_audit_fixes.sql
-- Exécuter dans Supabase SQL Editor > Run
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- SECTION 1 — Corrections données cms_blog_posts
-- ──────────────────────────────────────────────────────────────

-- #1 Corriger le slug madeire → madere
UPDATE cms_blog_posts
SET slug = 'madere-guide-complet',
    updated_at = NOW()
WHERE slug = 'madeire'
   OR slug = 'madeire-guide-complet';

-- #2 Corriger le prénom Laura → Elena dans les articles Grèce
UPDATE cms_blog_posts
SET content   = REPLACE(content,  'Laura', 'Elena'),
    excerpt   = REPLACE(excerpt,  'Laura', 'Elena'),
    updated_at = NOW()
WHERE (tags @> ARRAY['grece'] OR title ILIKE '%grèce%' OR title ILIKE '%grece%')
  AND (content ILIKE '%Laura%' OR excerpt ILIKE '%Laura%');

-- #3 Corriger "scotchs" → "scotchés"
UPDATE cms_blog_posts
SET content    = REPLACE(content, 'scotchs', 'scotchés'),
    updated_at = NOW()
WHERE content ILIKE '%scotchs%';

-- #4 Corriger "paradIs" → "paradis" (majuscule parasite)
UPDATE cms_blog_posts
SET content    = REPLACE(content, 'paradIs', 'paradis'),
    updated_at = NOW()
WHERE content LIKE '%paradIs%';

-- #5 Corriger le tag madere → grece sur les articles Grèce
UPDATE cms_blog_posts
SET tags       = array_replace(tags, 'madere', 'grece'),
    updated_at = NOW()
WHERE (title ILIKE '%grèce%' OR title ILIKE '%grece%' OR slug ILIKE '%grece%')
  AND 'madere' = ANY(tags);

-- #6 Corriger le tag madeire → madere (faute dans les tags)
UPDATE cms_blog_posts
SET tags       = array_replace(tags, 'madeire', 'madere'),
    updated_at = NOW()
WHERE 'madeire' = ANY(tags);

-- ──────────────────────────────────────────────────────────────
-- SECTION 2 — Fix trigger sync_cms_to_articles
-- Le trigger échoue car ON CONFLICT (slug) ne couvre pas
-- le conflit sur la PRIMARY KEY (id). Correction : ON CONFLICT (id).
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_cms_to_articles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO articles (
    id, title, slug, category, excerpt, content, featured_image, author,
    published, published_at, created_at, updated_at, tags,
    voice_notes, scheduled_published_at, faq_content, archived
  )
  VALUES (
    NEW.id, NEW.title, NEW.slug, NEW.category, NEW.excerpt, NEW.content,
    NEW.featured_image, NEW.author,
    COALESCE(NEW.published, NEW.status = 'published'),
    NEW.published_at, NEW.created_at, NEW.updated_at,
    COALESCE(NEW.tags, ARRAY[]::TEXT[]),
    NEW.voice_notes, NEW.scheduled_published_at, NEW.faq_content, false
  )
  ON CONFLICT (id) DO UPDATE SET
    title                 = EXCLUDED.title,
    slug                  = EXCLUDED.slug,
    category              = EXCLUDED.category,
    excerpt               = EXCLUDED.excerpt,
    content               = EXCLUDED.content,
    featured_image        = EXCLUDED.featured_image,
    author                = EXCLUDED.author,
    published             = EXCLUDED.published,
    published_at          = EXCLUDED.published_at,
    updated_at            = EXCLUDED.updated_at,
    tags                  = EXCLUDED.tags,
    voice_notes           = EXCLUDED.voice_notes,
    faq_content           = EXCLUDED.faq_content;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────────
-- SECTION 3 — Sécurité : RLS sur guides_pdf
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.guides_pdf ENABLE ROW LEVEL SECURITY;

-- Politique lecture publique (PDFs téléchargeables librement)
DROP POLICY IF EXISTS "guides_pdf_public_select" ON public.guides_pdf;
CREATE POLICY "guides_pdf_public_select"
  ON public.guides_pdf
  FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────────────────────
-- SECTION 4 — Sécurité : vue destinations_public en SECURITY INVOKER
-- La vue actuelle peut être en SECURITY DEFINER selon la config Supabase.
-- On la recrée explicitement sans ce flag.
-- ──────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS public.destinations_public;

CREATE VIEW public.destinations_public
WITH (security_invoker = true)
AS
SELECT
  slug,
  title,
  excerpt,
  country,
  continent,
  region,
  flag_emoji,
  tagline,
  teaser,
  hero_unsplash_url,
  featured_image,
  link,
  COALESCE(travel_style, category) AS travel_style,
  best_season,
  avg_budget_couple_week,
  status,
  priority_score,
  article_count,
  coming_soon_date,
  latitude,
  longitude,
  published
FROM destinations
WHERE published = true
   OR status IN ('coming_soon', 'starred')
ORDER BY priority_score DESC, title ASC;

-- ──────────────────────────────────────────────────────────────
-- SECTION 5 — Vérifications post-migration
-- ──────────────────────────────────────────────────────────────

-- #1 Plus de "paradIs" (attend : 0 lignes)
SELECT id, title FROM cms_blog_posts WHERE content LIKE '%paradIs%';

-- #2 Tag grece bien assigné aux articles Grèce
SELECT id, title, tags
FROM cms_blog_posts
WHERE title ILIKE '%grèce%' OR title ILIKE '%grece%'
ORDER BY id;

-- #3 Plus de "Laura" dans les articles Grèce (attend : excerpt sans "Laura")
SELECT id, title, excerpt
FROM cms_blog_posts
WHERE tags @> ARRAY['grece']
ORDER BY id;

-- #4 Slug madere corrigé (attend : slug = 'madere-guide-complet', pas 'madeire')
SELECT id, title, slug
FROM cms_blog_posts
WHERE slug ILIKE '%mad%'
ORDER BY id;

-- #5 Aucun tag 'madeire' restant (attend : 0 lignes)
SELECT id, title, tags
FROM cms_blog_posts
WHERE 'madeire' = ANY(tags);
