-- Migration: cms_guide_items — Top 10 Pépites Madère
-- Date: 2026-07-19
-- Description: Rend le contenu des guides éditables via le CMS

CREATE TABLE IF NOT EXISTS cms_guide_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_slug TEXT NOT NULL,           -- ex: 'top-10-pepites-madere'
  rank INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,                 -- Restaurant, Randonnée, Nature...
  description TEXT NOT NULL,
  secret TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guide_slug, rank)
);

ALTER TABLE cms_guide_items ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "public_read_guide_items" ON cms_guide_items
  FOR SELECT USING (is_active = true);

-- Écriture service role uniquement
CREATE POLICY "service_write_guide_items" ON cms_guide_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_guide_items_slug ON cms_guide_items(guide_slug);
CREATE INDEX IF NOT EXISTS idx_guide_items_rank ON cms_guide_items(guide_slug, rank);

-- Seed: Top 10 Pépites Madère
INSERT INTO cms_guide_items (guide_slug, rank, title, type, description, secret) VALUES
  ('top-10-pepites-madere', 1,  'Restaurant Quinta do Fogo',      'Restaurant',   'Le meilleur poisson grillé de l''île, avec vue sur les vignobles. Le propietario sait tout sur chaque plat.',           'Demande le vin de Madère de la maison — ils le servent en carafe et c''est une tuerie.'),
  ('top-10-pepites-madere', 2,  'Levada dos Tornos',              'Randonnée',    'La plus belle levada, entre forêt luxuriante et panoramas vertigineux. 12 km, sans difficulté.',                       'Commence tôt le matin pour avoir les selfies sans personne.'),
  ('top-10-pepites-madere', 3,  'Porto Moniz Natural Pools',      'Nature',       'Piscines volcaniques naturelles, turquoise, à couper le souffle. Moins connu que les autres spots.',                   'Va au coucher du soleil — les couleurs sont irréelles et il n''y a presque personne.'),
  ('top-10-pepites-madere', 4,  'Café do Pirata',                 'Café',         'Le meilleur café de Funchal, caché dans une ruelle. Torréfaction locale, pastries maison.',                           'Prends le cortado — c''est leur spécialité et il n''est pas sur la carte.'),
  ('top-10-pepites-madere', 5,  'Miradouro Pico do Arieiro',      'Vue',          'Le troisième plus haut sommet de Madère. On y arrive par une route sinueuse, mais la vue...',                          'Parcours le tunnel jusqu''au Pico Ruivo si tu es chaud — c''est là-haut que tout se passe.'),
  ('top-10-pepites-madere', 6,  'Fábrica de Arte',                'Art & Culture','Galerie d''art improvisée dans une ancienne usine. Expositions rotate, ambiance unique.',                             'Il y a un café caché derrière la galerie — c''est là que les locaux vont.'),
  ('top-10-pepites-madere', 7,  'Praia de Seixal',                'Plage',        'La seule plage de sable noir de Madère. Sauvage, tranquille, perdue.',                                               'Il y a un bar juste au-dessus de la plage — les bières sont froides et la vue est identique.'),
  ('top-10-pepites-madere', 8,  'Monte Palace Tropical Garden',   'Jardin',       'Les jardins les plus fous de Madère. Des milliers d''espèces, des cascades, des cygnes.',                            'Le lever du soleil depuis le belvédère est un moment qu''on n''oublie pas.'),
  ('top-10-pepites-madere', 9,  'Wine Bar do Funchal',            'Bar à vin',    'Sélection de vins de Madère (les vrais, les doux) avec des amuse-bouches qui vont avec.',                           'Le propriétaire fait des dégustations privées pour ceux qui demandent gentiment.'),
  ('top-10-pepites-madere', 10, 'Anfiteatro do Faial',            'Vue',          'Un point de vue inconnu des touristes, face à la baie de Funchal. On y va pour le coucher du soleil.',               'Il y a un petit marché artisanal le dimanche matin — on y trouve des choses impossibles à trouver ailleurs.')
ON CONFLICT (guide_slug, rank) DO UPDATE SET
  title = EXCLUDED.title,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  secret = EXCLUDED.secret,
  updated_at = NOW();
