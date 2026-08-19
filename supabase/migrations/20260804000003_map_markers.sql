-- ===========================================================================
-- Marqueurs de la carte interactive — /destinations/carte
--
-- Ces 24 points vivaient dans lib/destinations-data.ts, dont l'en-tête annonçait
-- « Ready for future Supabase/CMS integration » sans que ce soit jamais fait.
--
-- Table dédiée plutôt qu'un ajout à `destinations` : celle-ci porte les cartes
-- éditoriales du hub (9 lignes, slugs distincts — lisbonne-hors-sentiers,
-- paris-canal-marais…), quand il s'agit ici de points géographiques, sous-lieux
-- compris (Cabo Girão, Giverny, Versailles) qui n'ont pas vocation à devenir des
-- destinations du hub. Deux entités, deux tables.
--
-- Valeurs initiales = contenu du fichier. Idempotente.

CREATE TABLE IF NOT EXISTS public.map_markers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  title       text NOT NULL,
  excerpt     text,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  category    text NOT NULL CHECK (category IN ('nature', 'culture', 'city', 'food')),
  country     text NOT NULL,
  region      text NOT NULL,
  url         text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.map_markers ENABLE ROW LEVEL SECURITY;

-- La carte est publique : lecture anonyme des marqueurs actifs, écriture
-- réservée au service_role (panel admin).
DROP POLICY IF EXISTS "map_markers lecture publique" ON public.map_markers;
CREATE POLICY "map_markers lecture publique"
  ON public.map_markers FOR SELECT
  USING (is_active = true);

INSERT INTO public.map_markers (slug, title, excerpt, latitude, longitude, category, country, region, url, is_active)
VALUES
  ('madere', 'Madère, l''île de l''éternel printemps', 'Randonnées volcaniques, levadas et villages atlantiques en mode slow travel.', 32.6669, -16.9241, 'nature', 'Portugal', 'Atlantique', '/destinations/madere', true),
  ('funchal', 'Funchal, capitale de Madère', 'Vieille ville, marchés, gastronomie et couchers de soleil sur l''Atlantique.', 32.6499, -16.9077, 'city', 'Portugal', 'Madère', '/destinations/madere/funchal', true),
  ('porto-moniz', 'Porto Moniz, baignoires volcaniques', 'Piscines naturelles creusées dans la lave noire, nord-ouest de Madère.', 32.8225, -17.168, 'nature', 'Portugal', 'Madère', '/destinations/madere/porto-moniz', true),
  ('cabo-girao', 'Cabo Girão, à pic sur l''Atlantique', 'Une des plus hautes falaises d''Europe, lever du soleil inoubliable.', 32.6308, -17.196, 'nature', 'Portugal', 'Madère', '/destinations/madere/cabo-girao', true),
  ('sicile', 'Sicile, entre pierre et Méditerranée', 'Le sud-est par la pierre, le ventre et les fins d''après-midi qui durent.', 37.5999, 14.0154, 'food', 'Italie', 'Méditerranée', '/destinations/sicile', true),
  ('palerme', 'Palerme, capitale baroque', 'Marchés de rue, architecture arabo-normande et vie nocturne intense.', 38.1157, 13.3615, 'city', 'Italie', 'Sicile', '/destinations/sicile/palerme', true),
  ('taormine', 'Taormine, perle de la Sicile', 'Théâtre grec, ruelles élégantes et vue sur l''Etna.', 37.8515, 15.2878, 'culture', 'Italie', 'Sicile', '/destinations/sicile/taormine', true),
  ('cagliari', 'Cagliari, portes du sud', 'Villas romaines, dunes roses et cuisine sarde authentique.', 39.2237, 9.1587, 'city', 'Italie', 'Sardaigne', '/destinations/sardaigne/cagliari', true),
  ('roumanie', 'Roumanie, nature sauvage', 'Delta du Danube, Transylvanie et villages qui n''ont pas perdu leur rythme.', 45.9852, 24.6854, 'culture', 'Roumanie', 'Europe de l''Est', '/destinations/roumanie', true),
  ('bucarest', 'Bucarest, entre passé et présent', 'Palais royal, jardins et scène culturelle en effervescence.', 44.4268, 26.1025, 'city', 'Roumanie', 'Valachie', '/destinations/roumanie/bucarest', true),
  ('brasov', 'Brașov, porte des Carpates', 'Ville moyenâgeuse, pistes de ski et accès à la Transylvanie.', 45.6428, 25.5879, 'culture', 'Roumanie', 'Transylvanie', '/destinations/roumanie/brasov', true),
  ('cluj', 'Cluj-Napoca, ville universitaire', 'Scène tech, bars alternatifs et architecture austro-hongroise.', 46.7712, 23.6236, 'city', 'Roumanie', 'Transylvanie', '/destinations/roumanie/cluj', true),
  ('sibiu', 'Sibiu, joyau transylvanien', 'Ville européenne de la culture 2007, architecture saxonne préservée.', 45.7967, 24.1453, 'culture', 'Roumanie', 'Transylvanie', '/destinations/roumanie/sibiu', true),
  ('lisbonne', 'Lisbonne, ville en gradins', 'Fado, azulejos, Bairro Alto et couchers de soleil sur le Tage.', 38.7223, -9.1393, 'city', 'Portugal', 'Portugal continental', '/destinations/portugal/lisbonne', true),
  ('porto', 'Porto, viñedos et Douro', 'Architecture barcelonaise, vin de Porto et scène gastronomique.', 41.1579, -8.6291, 'city', 'Portugal', 'Portugal continental', '/destinations/portugal/porto', true),
  ('paris', 'Paris, le slow mode', 'Rues qui ne demandent qu''à être arpentées plus lentement.', 48.8566, 2.3522, 'city', 'France', 'Île-de-France', '/destinations/idf/paris', true),
  ('versailles', 'Versailles, le classique en slow', 'Jardins à la française, domaines cachés et chemins de traverse.', 48.8049, 2.1204, 'culture', 'France', 'Île-de-France', '/destinations/idf/versailles', true),
  ('giverny', 'Giverny, chez Monet', 'Jardins impressionnistes et villages de la vallée de la Seine.', 49.0775, 1.5346, 'culture', 'France', 'Île-de-France', '/destinations/idf/giverny', true),
  ('fontainebleau', 'Fontainebleau, forêt et roche', 'Sites d''escalade, forêt historique et château royal.', 48.3965, 2.7, 'nature', 'France', 'Île-de-France', '/destinations/idf/fontainebleau', true),
  ('cote-albatre', 'Côte d''Albâtre, falaises bretonnes', 'Fagnes blanches, villages de pêcheurs et airs marins.', 49.8, 0.65, 'nature', 'France', 'Normandie', '/destinations/normandie/cote-albatre', true),
  ('le-havre', 'Le Havre, ville reconstruite', 'Architecture patrimoine UNESCO, plage et art contemporain.', 49.4944, 0.1079, 'city', 'France', 'Normandie', '/destinations/normandie/le-havre', true),
  ('colombie', 'Colombie, Andes et Caraïbes', 'Café, patrimoine colonial et écosystèmes diversifiés.', 4.5709, -74.2973, 'nature', 'Colombie', 'Amérique du Sud', '/destinations/colombie', true),
  ('bogota', 'Bogotá, capitale andine', 'Musée de l''Or, Graffiti district et air de hauteur.', 4.711, -74.0721, 'city', 'Colombie', 'Andes', '/destinations/colombie/bogota', true),
  ('medellin', 'Medellín, vallée de l''éternel printemps', 'Transformation urbaine, jardins botaniques et innovation sociale.', 6.2442, -75.5812, 'city', 'Colombie', 'Antioquia', '/destinations/colombie/medellin', true)
ON CONFLICT (slug) DO UPDATE
  SET title     = EXCLUDED.title,
      excerpt   = EXCLUDED.excerpt,
      latitude  = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      category  = EXCLUDED.category,
      country   = EXCLUDED.country,
      region    = EXCLUDED.region,
      url       = EXCLUDED.url,
      is_active = true,
      updated_at = now();
