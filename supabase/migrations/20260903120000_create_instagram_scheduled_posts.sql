-- File d'attente des publications Instagram.
--
-- La table etait declaree dans 20260615_cms_improvements.sql, jamais appliquee :
-- quatre routes ecrivaient dedans, et le bouton « Brouillon + Instagram » de
-- l'application echouait donc en silence.
--
-- Deux ecarts avec cette declaration d'origine sont corriges ici :
--
--   * `metadata` manquait, alors que mobile-publish y range le type de
--     publication (REELS, CAROUSEL) et les URLs des images du carrousel.
--   * `article_id` pointait vers `articles`, mais tout ce qui alimente la file
--     cree ses brouillons dans `cms_blog_posts`. La cle etrangere aurait rejete
--     chaque insertion.

CREATE TABLE IF NOT EXISTS instagram_scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  published_at TIMESTAMPTZ,
  permalink TEXT,
  error_message TEXT,
  metadata JSONB,
  article_id BIGINT REFERENCES cms_blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Aucune politique : les quatre routes passent par la cle service, qui ignore
-- RLS. La declaration d'origine posait « FOR ALL USING (true) », ce qui ouvrait
-- la table a la cle publique du site — donc a n'importe quel visiteur.
ALTER TABLE instagram_scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Le cron ne lit que les entrees a publier ; le panneau les liste par date.
CREATE INDEX IF NOT EXISTS idx_insta_scheduled_status
  ON instagram_scheduled_posts (status);
CREATE INDEX IF NOT EXISTS idx_insta_scheduled_date
  ON instagram_scheduled_posts (scheduled_at);
