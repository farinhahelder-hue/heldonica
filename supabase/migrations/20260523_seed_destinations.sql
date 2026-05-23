-- Seed data: destinations from heldonica map
-- Run after creating the destinations table

INSERT INTO destinations (slug, title, excerpt, country, region, category, latitude, longitude, link) VALUES

-- Madère, Portugal
('madere', 'Madère, l''île de l''éternel printemps', 'Randonnées volcaniques, levadas et villages atlantiques en mode slow travel.', 'Portugal', 'Atlantique', 'nature', 32.6669, -16.9241, '/destinations/madere'),
('funchal', 'Funchal, capitale de Madère', 'Vieille ville, marchés, gastronomie et couchers de soleil sur l''Atlantique.', 'Portugal', 'Madère', 'city', 32.6499, -16.9077, '/destinations/madere/funchal'),
('porto-moniz', 'Porto Moniz, baignoires volcaniques', 'Piscines naturelles creusées dans la lave noire, nord-ouest de Madère.', 'Portugal', 'Madère', 'nature', 32.8225, -17.1680, '/destinations/madere/porto-moniz'),
('cabo-girao', 'Cabo Girão, à pic sur l''Atlantique', 'Une des plus hautes falaises d''Europe, lever du soleil inoubliable.', 'Portugal', 'Madère', 'nature', 32.6308, -17.1960, '/destinations/madere/cabo-girao'),

-- Sicile, Italie
('sicile', 'Sicile, entre pierre et Méditerranée', 'Le sud-est par la pierre, le ventre et les fins d''après-midi qui durent.', 'Italie', 'Méditerranée', 'food', 37.5999, 14.0154, '/destinations/sicile'),
('palerme', 'Palerme, capitale baroque', 'Marchés de rue, architecture arabo-normande et vie nocturne intense.', 'Italie', 'Sicile', 'city', 38.1157, 13.3615, '/destinations/sicile/palerme'),
('taormine', 'Taormine, perle de la Sicile', 'Théâtre grec, ruelles élégantes et vue sur l''Etna.', 'Italie', 'Sicile', 'culture', 37.8515, 15.2878, '/destinations/sicile/taormine'),
('cagliari', 'Cagliari, portes du sud', 'Villas romaines, dunes roses et cuisine sarde authentique.', 'Italie', 'Sardaigne', 'city', 39.2237, 9.1587, '/destinations/sardaigne/cagliari'),

-- Roumanie
('roumanie', 'Roumanie, nature sauvage', 'Delta du Danube, Transylvanie et villages qui n''ont pas perdu leur rythme.', 'Roumanie', 'Europe de l''Est', 'culture', 45.9852, 24.6854, '/destinations/roumanie'),
('bucarest', 'Bucarest, entre passé et présent', 'Palais royal, jardins et scène culturelle en effervescence.', 'Roumanie', 'Valachie', 'city', 44.4268, 26.1025, '/destinations/roumanie/bucarest'),
('brasov', 'Brașov, porte des Carpates', 'Ville moyenâgeuse, pistes de ski et accès à la Transylvanie.', 'Roumanie', 'Transylvanie', 'culture', 45.6428, 25.5879, '/destinations/roumanie/brasov'),
('cluj', 'Cluj-Napoca, ville universitaire', 'Scène tech, bars alternatifs et architecture austro-hongroise.', 'Roumanie', 'Transylvanie', 'city', 46.7712, 23.6236, '/destinations/roumanie/cluj'),
('sibiu', 'Sibiu, joyau transylvanien', 'Ville européenne de la culture 2007, architecture saxonne préservée.', 'Roumanie', 'Transylvanie', 'culture', 45.7967, 24.1453, '/destinations/roumanie/sibiu'),

-- Portugal continental
('lisbonne', 'Lisbonne, ville en gradins', 'Fado, azulejos, Bairro Alto et couchers de soleil sur le Tage.', 'Portugal', 'Portugal continental', 'city', 38.7223, -9.1393, '/destinations/portugal/lisbonne'),
('porto', 'Porto, viñedos et Douro', 'Architecture barcelonaise, vin de Porto et scène gastronomique.', 'Portugal', 'Portugal continental', 'city', 41.1579, -8.6291, '/destinations/portugal/porto'),

-- Île-de-France, France
('paris', 'Paris, le slow mode', 'Rues qui ne demandent qu''à être arpentées plus lentement.', 'France', 'Île-de-France', 'city', 48.8566, 2.3522, '/destinations/idf/paris'),
('versailles', 'Versailles, le classique en slow', 'Jardins à la française, domaines cachés et chemins de traverse.', 'France', 'Île-de-France', 'culture', 48.8049, 2.1204, '/destinations/idf/versailles'),
('giverny', 'Giverny, chez Monet', 'Jardins impressionnistes et villages de la vallée de la Seine.', 'France', 'Île-de-France', 'culture', 49.0775, 1.5346, '/destinations/idf/giverny'),
('fontainebleau', 'Fontainebleau, forêt et roche', 'Sites d''escalade, forêt historique et château royal.', 'France', 'Île-de-France', 'nature', 48.3965, 2.7000, '/destinations/idf/fontainebleau'),

-- Normandie, France
('cote-albatre', 'Côte d''Albâtre, falaises bretonnes', 'Fagnes blanches, villages de pêcheurs et airs marins.', 'France', 'Normandie', 'nature', 49.8000, 0.6500, '/destinations/normandie/cote-albatre'),
('le-havre', 'Le Havre, ville reconstruite', 'Architecture patrimoine UNESCO, plage et art contemporain.', 'France', 'Normandie', 'city', 49.4944, 0.1079, '/destinations/normandie/le-havre'),

-- Colombie
('colombie', 'Colombie, Andes et Caraïbes', 'Café, patrimoine colonial et écosystèmes diversifiés.', 'Colombie', 'Amérique du Sud', 'nature', 4.5709, -74.2973, '/destinations/colombie'),
('bogota', 'Bogotá, capitale andine', 'Musée de l''Or, Graffiti district et air de hauteur.', 'Colombie', 'Andes', 'city', 4.7110, -74.0721, '/destinations/colombie/bogota'),
('medellin', 'Medellín, vallée de l''éternel printemps', 'Transformation urbaine, jardins botaniques et innovation sociale.', 'Colombie', 'Antioquia', 'city', 6.2442, -75.5812, '/destinations/colombie/medellin');