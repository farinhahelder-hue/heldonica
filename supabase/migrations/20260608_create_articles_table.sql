-- Migration: Create articles table and sync from cms_blog_posts
-- Date: 2026-06-08
-- Purpose: Fix blog 0 articles bug - use articles table for public pages

-- 1. Create articles table with all fields from cms_blog_posts plus additional fields
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  excerpt TEXT,
  content TEXT,
  voice_notes TEXT,
  featured_image TEXT,
  author TEXT,
  destination TEXT,
  country TEXT,
  travel_style TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  scheduled_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  read_time INTEGER,
  archived BOOLEAN DEFAULT FALSE,
  faq_content JSONB
);

-- 2. Copy data from cms_blog_posts to articles
INSERT INTO articles (
  id, title, slug, category, excerpt, content, featured_image, author,
  published, published_at, created_at, updated_at, tags
)
SELECT 
  id, title, slug, category, excerpt, content, featured_image, author,
  published, published_at, created_at, updated_at, 
  COALESCE(tags, ARRAY[]::TEXT[])
FROM cms_blog_posts
ON CONFLICT (slug) DO NOTHING;

-- 3. Enable RLS on articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for articles
-- Public read for published articles
CREATE POLICY "Public read published articles"
  ON articles FOR SELECT
  TO public
  USING (published = true);

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON articles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_archived ON articles(archived);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- 6. Create function to sync cms_blog_posts to articles (for future CMS writes)
CREATE OR REPLACE FUNCTION sync_to_articles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO articles (
    id, title, slug, category, excerpt, content, featured_image, author,
    published, published_at, created_at, updated_at, tags, archived
  )
  VALUES (
    NEW.id, NEW.title, NEW.slug, NEW.category, NEW.excerpt, NEW.content,
    NEW.featured_image, NEW.author, NEW.published, NEW.published_at,
    NEW.created_at, NEW.updated_at, COALESCE(NEW.tags, ARRAY[]::TEXT[]),
    false
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    excerpt = EXCLUDED.excerpt,
    content = EXCLUDED.content,
    featured_image = EXCLUDED.featured_image,
    author = EXCLUDED.author,
    published = EXCLUDED.published,
    published_at = EXCLUDED.published_at,
    updated_at = EXCLUDED.updated_at,
    tags = EXCLUDED.tags;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This migration assumes cms_blog_posts exists with the expected schema.
-- Run this in Supabase SQL Editor or via supabase CLI.