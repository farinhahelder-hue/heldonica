-- Seed: enrichir la destination Roumanie + rattacher les articles
-- Date: 2026-06-15

UPDATE destinations
SET
  title = 'Roumanie : l''Europe sauvage encore intacte — slow travel authentique',
  excerpt = 'Forêts de conte, citadelles médiévales, hospitalité authentique — slow travel à l''état pur entre Carpates et Transylvanie.',
  region = 'Europe de l''Est',
  category = 'culture',
  featured_image = 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=1200&fit=crop&auto=format',
  link = '/destinations/roumanie'
WHERE slug = 'roumanie';

-- Rattacher les articles Roumanie à la destination
UPDATE articles
SET destination = 'roumanie', country = 'Roumanie', travel_style = 'slow-culture'
WHERE slug ILIKE '%timisoara%' OR slug ILIKE '%roumani%' OR slug ILIKE '%roumanie%'
   OR slug IN ('bucarest', 'brasov', 'sibiu', 'cluj', 'transylvanie');

INSERT INTO destinations (slug, title, excerpt, country, region, category, latitude, longitude, link)
VALUES
  ('transylvanie', 'Transylvanie, cœur saxon de la Roumanie', 'Citadelles médiévales, villages fortifiés et collines où le temps semble suspendu.', 'Roumanie', 'Transylvanie', 'culture', 46.1450, 24.5433, '/destinations/roumanie/transylvanie'),
  ('sighisoara', 'Sighișoara, citadelle vivante', 'Forteresse médiévale habitée, tours colorées et ruelles pavées classées UNESCO.', 'Roumanie', 'Transylvanie', 'culture', 46.2197, 24.7929, '/destinations/roumanie/sighisoara'),
  ('viscri', 'Viscri, le village saxon préservé', 'Église fortifiée UNESCO, artisanat local et hébergement chez l''habitant.', 'Roumanie', 'Transylvanie', 'nature', 46.2039, 25.0873, '/destinations/roumanie/viscri')
ON CONFLICT (slug) DO NOTHING;
