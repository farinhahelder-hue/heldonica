-- Migration : historique de versions des articles
-- Phase 3 - Heldonica CMS

CREATE TABLE IF NOT EXISTS article_revisions (
  id BIGSERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  word_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_revisions_article
ON article_revisions(article_id, saved_at DESC);

CREATE OR REPLACE FUNCTION trim_article_revisions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM article_revisions
  WHERE article_id = NEW.article_id
    AND id NOT IN (
      SELECT id FROM article_revisions
      WHERE article_id = NEW.article_id
      ORDER BY saved_at DESC
      LIMIT 10
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_revision_insert
AFTER INSERT ON article_revisions
FOR EACH ROW EXECUTE FUNCTION trim_article_revisions();
