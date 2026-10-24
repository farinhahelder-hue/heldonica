-- Drop the triggers first
DROP TRIGGER IF EXISTS cms_blog_posts_sync_trigger ON cms_blog_posts;
DROP TRIGGER IF EXISTS sync_cms_blog_posts_to_articles ON cms_blog_posts;
DROP TRIGGER IF EXISTS trigger_sync_to_articles ON cms_blog_posts;
DROP TRIGGER IF EXISTS cms_blog_posts_delete_trigger ON cms_blog_posts;

-- Drop the functions
DROP FUNCTION IF EXISTS sync_to_articles() CASCADE;
DROP FUNCTION IF EXISTS sync_delete_from_articles() CASCADE;

-- Finally drop the legacy table
DROP TABLE IF EXISTS articles CASCADE;
