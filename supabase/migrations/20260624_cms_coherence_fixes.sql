-- Migration: Corrections cohérence CMS — 2026-06-24
-- Contexte: audit visuel ayant révélé 5 incohérences P0 sur heldonica.fr
-- Toutes les corrections sont idempotentes (ON CONFLICT / WHERE guards)

-- ─────────────────────────────────────────────
-- 1. Mettre à jour covered_countries à 7
--    (cohérence avec "Elle a habité sept pays" dans la home + page à-propos)
-- ─────────────────────────────────────────────
INSERT INTO site_settings (key, value, label, type, updated_at)
VALUES ('covered_countries', '7', 'Nombre de pays habités', 'text', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = '7', updated_at = NOW();

-- ─────────────────────────────────────────────
-- 2. Masquer les articles de test
--    (slugs "test-article-*" exposés publiquement sur la home)
-- ─────────────────────────────────────────────
UPDATE cms_blog_posts
SET published = false,
    updated_at = NOW()
WHERE slug LIKE 'test-article-%'
  AND published = true;

-- ─────────────────────────────────────────────
-- 3. Corriger le tag "madere" sur l'article Grèce
--    (mauvaise taxonomie visible publiquement dans la grille des pépites)
-- ─────────────────────────────────────────────
UPDATE cms_blog_posts
SET tags = array_remove(tags, 'madere'),
    updated_at = NOW()
WHERE (slug ILIKE '%grece%' OR slug ILIKE '%gr%ce%' OR title ILIKE '%grèce%' OR title ILIKE '%grece%')
  AND 'madere' = ANY(tags);

-- ─────────────────────────────────────────────
-- 4. Ajouter une image Podgorica (placeholder absent)
-- ─────────────────────────────────────────────
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1555990538-42e2f6e38e43?w=800&q=80',
    updated_at = NOW()
WHERE slug ILIKE '%podgorica%'
  AND (featured_image IS NULL OR featured_image = '');

-- ─────────────────────────────────────────────
-- 5. Corriger la photo Porto utilisée pour l'article Madère
--    (URL identifiée : photo-1555881400-74d7acaacd8b = Ribeira, Porto)
-- ─────────────────────────────────────────────
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80',
    updated_at = NOW()
WHERE featured_image LIKE '%1555881400-74d7acaacd8b%'
  AND (slug ILIKE '%mader%' OR slug ILIKE '%madeire%');

-- ─────────────────────────────────────────────
-- Vérification post-migration
-- ─────────────────────────────────────────────
SELECT key, value FROM site_settings WHERE key = 'covered_countries';
SELECT slug, published FROM cms_blog_posts WHERE slug LIKE 'test-article-%';
SELECT slug, tags FROM cms_blog_posts WHERE slug ILIKE '%grece%' OR slug ILIKE '%gr%ce%';
SELECT slug, featured_image FROM cms_blog_posts WHERE slug ILIKE '%podgorica%';
