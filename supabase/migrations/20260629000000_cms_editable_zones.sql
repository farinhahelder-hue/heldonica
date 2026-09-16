-- CMS 3.0: Editable Content Zones
-- Architecture de lecture: cms_editable_zones > site_settings > hardcoded

-- Table principale pour les zones éditables
CREATE TABLE IF NOT EXISTS cms_editable_zones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page text NOT NULL DEFAULT 'global',
    zone_key text NOT NULL,
    zone_type text NOT NULL DEFAULT 'text' CHECK (zone_type IN ('text', 'image', 'cta', 'color', 'boolean')),
    value text DEFAULT '',
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(page, zone_key)
);

-- Index pour lecture rapide
CREATE INDEX IF NOT EXISTS idx_cms_zones_page_active 
    ON cms_editable_zones(page, is_active) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_cms_zones_key 
    ON cms_editable_zones(zone_key);

-- RLS
ALTER TABLE cms_editable_zones ENABLE ROW LEVEL SECURITY;

-- Politique: lecture publique pour les zones actives
CREATE POLICY "Public read active zones"
    ON cms_editable_zones FOR SELECT
    TO public
    USING (is_active = true);

-- Politique: admin peut modifier
CREATE POLICY "Admin can manage zones"
    ON cms_editable_zones FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Seed: zones globales header et footer
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value, is_active) VALUES
    -- Header
    ('global', 'header_site_name', 'text', 'Heldonica', true),
    ('global', 'header_logo_url', 'image', '', true),
    ('global', 'header_cta_label', 'cta', 'Planifier mon voyage', true),
    ('global', 'header_cta_url', 'text', '/travel-planning', true),
    -- Footer
    ('global', 'footer_tagline', 'text', 'Slow travel vécu, conçu pour toi.', true),
    ('global', 'footer_newsletter_cta', 'text', 'Reçois nos pépites directement dans ta boîte mail', true),
    ('global', 'footer_email_placeholder', 'text', 'ton@email.fr', true),
    ('global', 'footer_cta_label', 'cta', 'Écrire à Heldonica', true),
    ('global', 'footer_cta_url', 'text', 'mailto:contact@heldonica.fr', true)
ON CONFLICT (page, zone_key) DO NOTHING;
