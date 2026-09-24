-- Migration: CMS improvements (sitemap SEO, Instagram scheduling, image alt text)
-- Adds columns to cms_blog_posts/articles tables + creates instagram_scheduled_posts table

-- Add sitemap + alt text columns
ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS sitemap_priority NUMERIC(3,2) DEFAULT 0.90;
ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS sitemap_changefreq TEXT DEFAULT 'weekly';
ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Add status column for draft/scheduled/published workflow
ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
UPDATE cms_blog_posts SET status = CASE WHEN published = true THEN 'published' ELSE 'draft' END WHERE status IS NULL;

-- Same columns on articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS sitemap_priority NUMERIC(3,2) DEFAULT 0.90;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS sitemap_changefreq TEXT DEFAULT 'weekly';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS alt_text TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS visit_date DATE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;

-- Instagram scheduled posts queue
CREATE TABLE IF NOT EXISTS instagram_scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','failed')),
  published_at TIMESTAMPTZ,
  permalink TEXT,
  error_message TEXT,
  article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

ALTER TABLE instagram_scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage scheduled posts" ON instagram_scheduled_posts
  FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_insta_scheduled_status ON instagram_scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_insta_scheduled_date ON instagram_scheduled_posts(scheduled_at);
