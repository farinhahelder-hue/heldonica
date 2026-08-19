-- Migration: Attach sync_to_articles trigger to cms_blog_posts
-- Date: 2026-07-03
-- Purpose: Fix articles not appearing on blog - attach the sync trigger

-- Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION sync_to_articles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO articles (
    id, title, slug, category, excerpt, content, featured_image, author,
    published, published_at, created_at, updated_at, tags, archived,
    destination, country, travel_style, voice_notes, read_time, faq_content
  )
  VALUES (
    NEW.id, NEW.title, NEW.slug, NEW.category, NEW.excerpt, NEW.content,
    NEW.featured_image, NEW.author, NEW.published, NEW.published_at,
    NEW.created_at, NEW.updated_at, COALESCE(NEW.tags, ARRAY[]::TEXT[]),
    false,
    NEW.destination, NEW.country, NEW.travel_style,
    NEW.voice_notes, NEW.read_time, NEW.faq_content
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
    tags = EXCLUDED.tags,
    destination = EXCLUDED.destination,
    country = EXCLUDED.country,
    travel_style = EXCLUDED.travel_style,
    voice_notes = EXCLUDED.voice_notes,
    read_time = EXCLUDED.read_time,
    faq_content = EXCLUDED.faq_content;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if any (for re-runs)
DROP TRIGGER IF EXISTS cms_blog_posts_sync_trigger ON cms_blog_posts;

-- Attach trigger to cms_blog_posts
CREATE TRIGGER cms_blog_posts_sync_trigger
  AFTER INSERT OR UPDATE ON cms_blog_posts
  FOR EACH ROW EXECUTE FUNCTION sync_to_articles();

-- Also create a trigger for DELETE to remove from articles
CREATE OR REPLACE FUNCTION sync_delete_from_articles()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM articles WHERE slug = OLD.slug;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cms_blog_posts_delete_trigger ON cms_blog_posts;
CREATE TRIGGER cms_blog_posts_delete_trigger
  AFTER DELETE ON cms_blog_posts
  FOR EACH ROW EXECUTE FUNCTION sync_delete_from_articles();
