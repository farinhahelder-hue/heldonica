-- ============================================================================
-- Migration: 20260813_cms_sub_destinations.sql
-- Description: Create cms_sub_destinations table and seed initial data
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cms_sub_destinations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_slug text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  teaser text,
  emoji text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT sub_destinations_parent_slug_slug_key UNIQUE (parent_slug, slug)
);

-- Enable RLS
ALTER TABLE public.cms_sub_destinations ENABLE ROW LEVEL SECURITY;

-- Select policy: public can read active sub_destinations
CREATE POLICY "Public can read active sub destinations" 
ON public.cms_sub_destinations 
FOR SELECT 
USING (is_active = true);

-- Admin policies
CREATE POLICY "Admins can do everything on sub destinations" 
ON public.cms_sub_destinations 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sub_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_sub_destinations_updated_at
BEFORE UPDATE ON public.cms_sub_destinations
FOR EACH ROW EXECUTE FUNCTION update_sub_destinations_updated_at();

-- Seed Data
INSERT INTO public.cms_sub_destinations (parent_slug, slug, title, teaser, emoji, display_order) VALUES
('madere', 'funchal', 'Funchal', 'La capitale côtière et ses ruelles fleuries.', '🌸', 0),
('madere', 'porto-moniz', 'Porto Moniz', 'Baignade dans les piscines naturelles de roche volcanique.', '🌊', 1),
('madere', 'cabo-girao', 'Cabo Girão', 'La passerelle de verre sur la falaise côtière.', '🌉', 2),
('madere', 'camara-de-lobos', 'Câmara de Lobos', 'Village typique de pêcheurs.', '🐟', 3),
('madere', 'ponta-do-sol', 'Ponta do Sol', 'Le village le plus ensoleillé de l''île.', '☀️', 4),
('madere', 'sao-vicente', 'São Vicente', 'Grottes volcaniques et vallée verdoyante.', '🌋', 5),
('madere', 'ribeiro-frio', 'Ribeiro Frio', 'Forêt de lauriers et point de vue magique.', '🌿', 6),
('madere', 'portela', 'Portela', 'Point de vue spectaculaire sur le rocher de Penha d''Aguia.', '⛰️', 7),
('madere', 'achadas-da-cruz', 'Achadas da Cruz', 'Le téléphérique le plus raide d''Europe.', '🚠', 8),
('madere', 'estreito', 'Estreito', 'Vignobles en terrasses du vin de Madère.', '🍇', 9),
('roumanie', 'brasov', 'Brașov', 'Citadelle médiévale au cœur de la Transylvanie.', '🏰', 0),
('roumanie', 'bucarest', 'Bucarest', 'Le contraste entre architecture royale et friches industrielles.', '🏙️', 1),
('roumanie', 'cluj', 'Cluj-Napoca', 'La capitale vivante et universitaire de la Transylvanie.', '🎓', 2),
('roumanie', 'sibiu', 'Sibiu', 'La ville aux maisons qui ont des yeux.', '👀', 3),
('roumanie', 'timisoara', 'Timișoara', 'Le berceau de la révolution et capitale culturelle.', '🎭', 4),
('roumanie', 'transylvanie', 'Transylvanie', 'Forêts sauvages, châteaux médiévaux et routes alpines.', '🌲', 5),
('sicile', 'palerme', 'Palerme', 'Marchés de rue animés et joyaux arabo-normands.', '🍋', 0),
('sicile', 'catane', 'Catane', 'La cité baroque au pied de l''Etna.', '🌋', 1),
('sicile', 'syracuse', 'Syracuse', 'L''île d''Ortygie et vestiges grecs légendaires.', '🏛️', 2),
('sicile', 'taormine', 'Taormine', 'Le théâtre antique face à la mer ionienne.', '🎭', 3),
('sardaigne', 'cagliari', 'Cagliari', 'Bastions de pierre, flamants roses et lagunes.', '🦩', 0),
('sardaigne', 'alghero', 'Alghero', 'La cité catalane fortifiée face au couchant.', '🌅', 1),
('sardaigne', 'costa-smeralda', 'Costa Smeralda', 'Eaux turquoises et criques de granit sculptées.', '🛥️', 2),
('sardaigne', 'nuoro', 'Nuoro', 'Le cœur sauvage et traditionnel de la Barbagia.', '🐐', 3),
('portugal', 'lisbonne', 'Lisbonne', 'Collines pavées, fado envoûtant et pasteis de nata.', '🚠', 0),
('portugal', 'porto', 'Porto', 'Caves de porto, pont Dom Luís et vieux quartiers côtiers.', '🍷', 1),
('colombie', 'bogota', 'Bogota', 'Cité andine perchée à 2600 mètres d''altitude.', '⛰️', 0),
('colombie', 'medellin', 'Medellin', 'La ville de l''éternel printemps et de la transformation.', '🌺', 1),
('colombie', 'cali', 'Cali', 'Capitale mondiale de la salsa et joie de vivre.', '💃', 2),
('colombie', 'cartago', 'Cartago', 'Héritage colonial au cœur de la région du café.', '☕', 3),
('normandie', 'cote-albatre', 'Côte d''Albâtre', 'Falaises de craie blanche spectaculaires et galets.', '🌊', 0),
('normandie', 'le-havre', 'Le Havre', 'Architecture moderne classée UNESCO en bord de mer.', '🏢', 1),
('normandie', 'pays-dauge', 'Pays d''Auge', 'Manoirs à colombages, vergers et cidre de terroir.', '🍏', 2)
ON CONFLICT (parent_slug, slug) DO UPDATE SET 
  title = EXCLUDED.title,
  teaser = EXCLUDED.teaser,
  emoji = EXCLUDED.emoji,
  display_order = EXCLUDED.display_order;
