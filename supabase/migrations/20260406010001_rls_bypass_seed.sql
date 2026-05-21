-- Bypass temporaire pour seed articles
-- Permet l'upsert depuis la route API (anon key)
CREATE POLICY "Allow anon insert for seed"
  ON cms_blog_posts FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update for seed"
  ON cms_blog_posts FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
