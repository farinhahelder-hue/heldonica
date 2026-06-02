-- Migration: Fix site_settings table and add missing settings
-- Creates site_settings table with key/value structure for CMS settings
-- Date: 2026-06-02

BEGIN;

-- Create site_settings table if not exists (key/value structure)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT DEFAULT '',
  label TEXT,
  type TEXT DEFAULT 'text',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for key lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Insert maintenance_mode and maintenance_message settings
INSERT INTO site_settings (key, value, label, type)
VALUES 
  ('maintenance_mode', 'false', 'Mode maintenance', 'boolean'),
  ('maintenance_message', 'On revient très vite avec de nouvelles pépites ! 🌿', 'Message maintenance', 'text')
ON CONFLICT (key) DO NOTHING;

-- Insert default site settings for blog
INSERT INTO site_settings (key, value, label, type)
VALUES 
  ('site_logo', '', 'Logo du site (URL)', 'text'),
  ('site_favicon', '', 'Favicon (URL)', 'text'),
  ('site_name', 'Heldonica', 'Nom du site', 'text'),
  ('site_tagline', 'Explorateurs émerveillés, dénicheurs de pépites', 'Tagline', 'text')
ON CONFLICT (key) DO NOTHING;

-- Add RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (needed for SiteTheme.tsx)
CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT USING (true);

-- Service role can write (API routes use service role key)
CREATE POLICY "Service role write site_settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Also allow anon for INSERT (for seed migrations)
CREATE POLICY "Allow public insert site_settings" ON site_settings
  FOR INSERT WITH CHECK (true);

COMMIT;