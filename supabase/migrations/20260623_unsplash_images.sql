-- Migration: Replace generic/placeholder images with curated Unsplash photos
-- Date: 2026-06-23
-- Usage: Run in Supabase SQL Editor

-- Fill NULL cover_images and replace generic placeholders in cms_blog_posts
UPDATE cms_blog_posts
SET cover_image = CASE slug
  WHEN 'test-article-1-madere-decouverte'                THEN 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'test-article-2-zurich-flotte'                    THEN 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'test-article-3-stoos-ridge'                      THEN 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'madere-slow-travel-guide'                        THEN 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'madere-en-mars'                                  THEN 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'slow-travel-retour'                              THEN 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'roumanie-villages-caches'                        THEN 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'stoos-ridge-notre-aventure-sur-la-crete-panoramique' THEN 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'urbex-paris-safe'                                THEN 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'guide-pratique-comment-debuter-le-slow-travel-en-duo' THEN 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'madere-quand-partir-sur-lile-de-leternel-printemps' THEN 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'prego-no-bolo-do-caco'                           THEN 'https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'pepites-mystiques-de-madere'                     THEN 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=1600&h=900&fit=crop&auto=format&q=80'
  WHEN 'flotter-sur-la-limmat-a-zurich-notre-aventure-dete' THEN 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1600&h=900&fit=crop&auto=format&q=80'
  ELSE cover_image
END
WHERE slug IN (
  'test-article-1-madere-decouverte',
  'test-article-2-zurich-flotte',
  'test-article-3-stoos-ridge',
  'madere-slow-travel-guide',
  'madere-en-mars',
  'slow-travel-retour',
  'roumanie-villages-caches',
  'stoos-ridge-notre-aventure-sur-la-crete-panoramique',
  'urbex-paris-safe',
  'guide-pratique-comment-debuter-le-slow-travel-en-duo',
  'madere-quand-partir-sur-lile-de-leternel-printemps',
  'prego-no-bolo-do-caco',
  'pepites-mystiques-de-madere',
  'flotter-sur-la-limmat-a-zurich-notre-aventure-dete'
)
AND (cover_image IS NULL OR cover_image LIKE '%placeholder%' OR cover_image LIKE '%generic%' OR cover_image = '');

-- Sync to articles table
UPDATE articles
SET featured_image = cms.cover_image,
    updated_at = NOW()
FROM cms_blog_posts cms
WHERE articles.slug = cms.slug
  AND cms.cover_image IS NOT NULL
  AND cms.cover_image != ''
  AND (articles.featured_image IS NULL OR articles.featured_image LIKE '%placeholder%');
