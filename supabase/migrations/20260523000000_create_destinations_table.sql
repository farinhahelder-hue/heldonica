-- Migration: Add destinations table for map markers
-- Purpose: Store destination data with coordinates for the interactive map
-- Date: 2026-05-23

CREATE TABLE IF NOT EXISTS destinations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  country      TEXT,
  region       TEXT,
  category     TEXT CHECK (category IN ('nature', 'culture', 'city', 'food')),
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  featured_image TEXT,
  link         TEXT,
  published    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_destinations_country ON destinations(country);
CREATE INDEX idx_destinations_region ON destinations(region);
CREATE INDEX idx_destinations_category ON destinations(category);
CREATE INDEX idx_destinations_published ON destinations(published) WHERE published = true;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_destinations_updated_at ON destinations;
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON destinations
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated can manage" ON destinations
  FOR ALL USING (auth.role() = 'authenticated');