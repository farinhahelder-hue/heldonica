CREATE TABLE IF NOT EXISTS article_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id bigint REFERENCES cms_blog_posts(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text,
  content text,
  created_at timestamptz DEFAULT now() NOT NULL
);
