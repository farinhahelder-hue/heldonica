-- Révoque la policy de seed temporaire
DROP POLICY IF EXISTS "Allow anon insert for seed" ON cms_blog_posts;
DROP POLICY IF EXISTS "Allow anon update for seed" ON cms_blog_posts;
