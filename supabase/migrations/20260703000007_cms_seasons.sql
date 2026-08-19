-- CMS Seasons: Table for managing seasonal data per destination
-- Replaces hardcoded MADEIRA_SEASONS, MONTENEGRO_SEASONS, ROUMANIE_SEASONS

CREATE TABLE IF NOT EXISTS cms_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_key VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  months JSONB NOT NULL DEFAULT '[]'::jsonb,
  weather TEXT,
  crowd VARCHAR(20) DEFAULT 'medium' CHECK (crowd IN ('low', 'medium', 'high')),
  price VARCHAR(20) DEFAULT 'medium' CHECK (price IN ('low', 'medium', 'high')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(destination_key, name)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_cms_seasons_destination ON cms_seasons(destination_key) WHERE is_active = true;

-- RLS
ALTER TABLE cms_seasons ENABLE ROW LEVEL SECURITY;

-- Policy: public read for active seasons
CREATE POLICY "Public read active seasons"
    ON cms_seasons FOR SELECT
    TO public
    USING (is_active = true);

-- Policy: admin can manage
CREATE POLICY "Admin can manage seasons"
    ON cms_seasons FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Seed data for existing destinations
INSERT INTO cms_seasons (destination_key, name, emoji, months, weather, crowd, price, description, display_order) VALUES
-- Madère
('madere', 'Printemps', '🌸', '["Mars", "Avril", "Mai"]', '16-22°C, fleurs, végétation vive', 'low', 'medium', 'La période reine pour Madère. Floraisons, températures agréables, randos idéales. Prix encore modérés avant la haute saison.', 1),
('madere', 'Été', '☀️', '["Juin", "Juillet", "Août"]', '22-28°C, mer chaude, soleil', 'high', 'high', 'Pic d''affluence et prix élevés. Parfait pour la plage et les activités nautiques. Réservez longtemps à l''avance.', 2),
('madere', 'Automne', '🍂', '["Septembre", "Octobre", "Novembre"]', '18-24°C, fin de l''été indien', 'medium', 'medium', 'Excellent compromis : chaleur encore présente, moins de monde, prix en baisse. Notre recommandation pour un premier voyage.', 3),
('madere', 'Hiver', '🌧️', '["Décembre", "Janvier", "Février"]', '14-20°C, plus humide, brumeux', 'low', 'low', 'Version contemplative de Madère. Moins de randos praticables (boue), mais ambiance unique et prix cassés.', 4),

-- Montenegro
('montenegro', 'Printemps', '🌷', '["Avril", "Mai", "Juin"]', '18-26°C, idéal pour rando', 'low', 'low', 'Températures agréables, nature en pleine croissance, sites historiques moins bondés. La meilleure période pour explorer.', 1),
('montenegro', 'Été', '🏖️', '["Juillet", "Août"]', '25-32°C, plage, festivals', 'high', 'high', 'Haute saison avec affluence maximale sur la côte. Ambiance festive, plages animées, mais réserver tout à l''avance.', 2),
('montenegro', 'Automne', '🍁', '["Septembre", "Octobre"]', '18-24°C, vendanges, couleurs', 'medium', 'medium', 'Notre coup de cœur : mer encore chaude, villages viticoles en couleurs, calme revenu. Parfait pour le slow travel.', 3),
('montenegro', 'Hiver', '❄️', '["Novembre", "Décembre", "Janvier", "Février", "Mars"]', '5-12°C, neige dans les montagnes', 'low', 'low', 'Saison basse pour le tourisme plage mais idéale pour le lac de Skadar, les Balkans intérieurs et les randos en montagne.', 4),

-- Roumanie
('roumanie', 'Printemps', '🌿', '["Avril", "Mai", "Juin"]', '12-22°C, Transylvanie en fleurs', 'medium', 'low', 'Bucovina accessible, champs de fleurs sauvages, températures agréables pour explorer. Prix encore doux.', 1),
('roumanie', 'Été', '☀️', '["Juillet", "Août"]', '20-30°C, festivals, chaleur', 'high', 'medium', 'Festivals et chaleur. Attention à la chaleur à Bucarest, mais les festivals sont incontournables.', 2),
('roumanie', 'Automne', '🍂', '["Septembre", "Octobre", "Novembre"]', '8-18°C, feuilles colorées, vendanges', 'low', 'low', 'La Transylvanie en couleurs est un cauchemar photographique. Vendanges dans les vignobles, calme idéal.', 3),
('roumanie', 'Hiver', '❄️', '["Décembre", "Janvier", "Février", "Mars"]', '-5 à 5°C, neige, marchés de Noël', 'medium', 'low', 'Marchés de Noël féériques, neige sur les châteaux, chaleur des auberges. La Transylvanie enneigée, c''est magique.', 4)

ON CONFLICT (destination_key, name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  months = EXCLUDED.months,
  weather = EXCLUDED.weather,
  crowd = EXCLUDED.crowd,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
