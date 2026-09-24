CREATE TABLE IF NOT EXISTS travel_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  cover_unsplash_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE travel_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read travel_guides" ON travel_guides
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage travel_guides" ON travel_guides
  FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS guide_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_slug TEXT NOT NULL,
  email TEXT NOT NULL,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

ALTER TABLE guide_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage guide_downloads" ON guide_downloads
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can insert guide_downloads" ON guide_downloads
  FOR INSERT WITH CHECK (true);
