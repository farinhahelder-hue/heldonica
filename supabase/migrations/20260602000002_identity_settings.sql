-- Insert visual identity keys into site_settings
-- Date: 2026-06-02

INSERT INTO site_settings (key, value) VALUES
('logo_url', ''),
('favicon_url', ''),
('hero_banner_url', ''),
('site_tagline', 'Vivre, découvrir, partager : embarquez dans notre histoire de slow travel en couple'),
('primary_color', '#2D8B7A'),
('secondary_color', '#C4714A'),
('font_heading', 'Playfair Display'),
('font_body', 'Inter'),
('footer_text', '© 2026 Heldonica — Slow Travel en couple')
ON CONFLICT (key) DO NOTHING;

-- Update existing color_primary to primary_color if needed
UPDATE site_settings 
SET key = 'primary_color' 
WHERE key = 'color_primary' AND NOT EXISTS (
  SELECT 1 FROM site_settings WHERE key = 'primary_color'
);

UPDATE site_settings 
SET key = 'secondary_color' 
WHERE key = 'color_secondary' AND NOT EXISTS (
  SELECT 1 FROM site_settings WHERE key = 'secondary_color'
);

-- Verify
SELECT * FROM site_settings ORDER BY key;