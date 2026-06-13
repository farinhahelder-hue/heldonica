-- RLS Policies for article_map_* tables
-- These policies allow:
-- - Public read (SELECT) via anon key for public map display
-- - Service role write (INSERT/UPDATE/DELETE) via service role key for CMS operations

-- Enable RLS on tables
ALTER TABLE article_map_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_map_pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_map_route_points ENABLE ROW LEVEL SECURITY;

-- article_map_routes policies
DROP POLICY IF EXISTS "Public read access on article_map_routes" ON article_map_routes;
CREATE POLICY "Public read access on article_map_routes"
  ON article_map_routes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access on article_map_routes" ON article_map_routes;
CREATE POLICY "Service role full access on article_map_routes"
  ON article_map_routes FOR ALL
  USING (auth.role() = 'service_role');

-- article_map_pois policies
DROP POLICY IF EXISTS "Public read access on article_map_pois" ON article_map_pois;
CREATE POLICY "Public read access on article_map_pois"
  ON article_map_pois FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access on article_map_pois" ON article_map_pois;
CREATE POLICY "Service role full access on article_map_pois"
  ON article_map_pois FOR ALL
  USING (auth.role() = 'service_role');

-- article_map_route_points policies
DROP POLICY IF EXISTS "Public read access on article_map_route_points" ON article_map_route_points;
CREATE POLICY "Public read access on article_map_route_points"
  ON article_map_route_points FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role full access on article_map_route_points" ON article_map_route_points;
CREATE POLICY "Service role full access on article_map_route_points"
  ON article_map_route_points FOR ALL
  USING (auth.role() = 'service_role');