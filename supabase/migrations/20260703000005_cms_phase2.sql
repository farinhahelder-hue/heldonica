-- Phase 2 : Zone history + scheduled publishing column
CREATE TABLE IF NOT EXISTS cms_zone_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page        TEXT NOT NULL,
  zone_key    TEXT NOT NULL,
  old_value   TEXT,
  new_value   TEXT NOT NULL,
  changed_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zone_history_lookup
  ON cms_zone_history (page, zone_key, changed_at DESC);

ALTER TABLE cms_zone_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read zone history"
  ON cms_zone_history FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Admin insert zone history"
  ON cms_zone_history FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Add scheduled_publish_at to cms_blog_posts if not present
ALTER TABLE cms_blog_posts
  ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;
