-- CMS Home Destinations: Table for managing featured destinations on homepage
-- Replaces hardcoded destinations array in components/Destinations.tsx

CREATE TABLE IF NOT EXISTS cms_home_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug VARCHAR(100) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT true,
  custom_title VARCHAR(100),
  custom_description TEXT,
  custom_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(destination_slug)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cms_home_destinations_order ON cms_home_destinations(display_order) WHERE is_active = true;

-- RLS
ALTER TABLE cms_home_destinations ENABLE ROW LEVEL SECURITY;

-- Policy: public read for active destinations
CREATE POLICY "Public read active home destinations"
    ON cms_home_destinations FOR SELECT
    TO public
    USING (is_active = true);

-- Policy: admin can manage
CREATE POLICY "Admin can manage home destinations"
    ON cms_home_destinations FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Seed: current 4 destinations featured on homepage
INSERT INTO cms_home_destinations (destination_slug, display_order, custom_title, custom_description, custom_image_url) VALUES
('suisse', 1, NULL, 'Slow travel alpin authentique', 'https://images.unsplash.com/photo-1502786129236-63f2598fd7b9?w=600&q=80'),
('roumanie', 2, NULL, 'Nature sauvage Delta du Danube', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80'),
('ile-de-france', 3, NULL, 'Paris alternatif & Petite Ceinture', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80'),
('madere', 4, NULL, 'Randonnées volcaniques en couple', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80')

ON CONFLICT (destination_slug) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  custom_description = EXCLUDED.custom_description,
  custom_image_url = EXCLUDED.custom_image_url,
  updated_at = NOW();
