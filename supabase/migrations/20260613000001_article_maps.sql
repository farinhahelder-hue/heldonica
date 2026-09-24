-- Routes (one article can have multiple)
CREATE TABLE IF NOT EXISTS article_map_routes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_slug  TEXT NOT NULL,
  content_type  TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article','page','destination')),
  name          TEXT NOT NULL,
  description   TEXT,
  difficulty    TEXT CHECK (difficulty IN ('famille','debutant','intermediaire','sportif','libre')),
  duration_min  INTEGER,
  distance_km   NUMERIC(5,2),
  color         TEXT DEFAULT '#01696f',
  is_active     BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- POIs (can belong to a route or be standalone on the article)
CREATE TABLE IF NOT EXISTS article_map_pois (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_slug  TEXT NOT NULL,
  route_id      UUID REFERENCES article_map_routes(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT DEFAULT 'info' CHECK (category IN (
                  'depart','arrivee','danger','info','parking',
                  'restaurant','baignade','portage','point_vue',
                  'transport','logement','activite'
                )),
  lat           NUMERIC(10,7) NOT NULL,
  lng           NUMERIC(10,7) NOT NULL,
  address       TEXT,
  maps_url      TEXT,
  display_order INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Route polyline points (ordered)
CREATE TABLE IF NOT EXISTS article_map_route_points (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id  UUID NOT NULL REFERENCES article_map_routes(id) ON DELETE CASCADE,
  lat       NUMERIC(10,7) NOT NULL,
  lng       NUMERIC(10,7) NOT NULL,
  seq       INTEGER NOT NULL
);

-- Toggle map visibility per article
ALTER TABLE cms_blog_posts
  ADD COLUMN IF NOT EXISTS show_map BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_routes_slug ON article_map_routes(content_slug);
CREATE INDEX IF NOT EXISTS idx_pois_slug ON article_map_pois(content_slug);
CREATE INDEX IF NOT EXISTS idx_points_route ON article_map_route_points(route_id, seq);
