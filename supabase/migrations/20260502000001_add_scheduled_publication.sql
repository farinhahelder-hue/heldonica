-- Add scheduled publication field for planning
ALTER TABLE public.cms_blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_published_at timestamptz;

-- Add index for scheduled posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled 
ON cms_blog_posts(scheduled_published_at) 
WHERE scheduled_published_at IS NOT NULL;