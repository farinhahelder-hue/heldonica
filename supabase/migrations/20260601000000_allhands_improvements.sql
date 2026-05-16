-- Migration Action 2: Kanban Travel Planning
ALTER TABLE cms_demandes_travel
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'nouveau'
CHECK (status IN ('nouveau', 'en_discussion', 'conception_sur_mesure', 'livre'));

ALTER TABLE cms_demandes_travel
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_cms_demandes_status ON cms_demandes_travel(status);

-- Migration Action 3: Calendrier Editorial
CREATE TABLE IF NOT EXISTS cms_social_schedule (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('instagram_carousel', 'newsletter', 'reels', 'story')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'planifié' CHECK (status IN ('planifié', 'publié', 'annulé')),
  related_post_id BIGINT REFERENCES cms_blog_posts(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration Action 9: Itinerary Builder
CREATE TABLE IF NOT EXISTS cms_itineraires (
  id BIGSERIAL PRIMARY KEY,
  uuid TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  title TEXT NOT NULL,
  destination TEXT,
  duration_days INTEGER,
  blocks JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoyé', 'archivé')),
  related_request_id BIGINT REFERENCES cms_demandes_travel(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cms_itineraires ENABLE ROW LEVEL SECURITY;

-- Migration Action 10: Historique de versions
CREATE TABLE IF NOT EXISTS cms_blog_posts_revisions (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES cms_blog_posts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  revised_at TIMESTAMPTZ DEFAULT NOW(),
  revision_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_revisions_post_id ON cms_blog_posts_revisions(post_id, revised_at DESC);
