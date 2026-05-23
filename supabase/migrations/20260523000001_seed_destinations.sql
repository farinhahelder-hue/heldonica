-- Seed migration: Insert all destinations from lib/destinations-data.ts into Supabase
-- Date: 2026-05-23

INSERT INTO cms_destinations (
  slug, title, excerpt, country, region, category, latitude, longitude, image, published
) VALUES
  ('madere', 'Madère', 'Île portugaise de l''Atlantique. Levadas, falaises, villages suspendus entre l''ocean et les nuages.', 'Portugal', 'Europe', 'ile', 32.6669, -16.9241, 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80', true),
  ('zurich', 'Zurich', 'Badi flottantes, brasseries artisanales et vieille ville dense. La ville où l''eau change le tempo.', 'Suisse', 'Europe', 'ville', 47.3769, 8.5417, 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&q=80', true),
  ('suisse', 'Suisse', 'Montagnes, lacs, trains impeccables. La Suisse devient juste quand on cesse de la résumer à son prix.', 'Suisse', 'Europe', 'montagne', 46.8182, 8.2275, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', true),
  ('roumanie', 'Roumanie', 'Timișoara, Delta du Danube, Carpates. Le terrain de l''enfance et des villages qui n''ont pas laissé tomber leur rythme.', 'Roumanie', 'Europe', 'culture', 45.9432, 24.9668, 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80', true),
  ('timisoara', 'Timișoara', 'Ville hongroise autrichienne. Art Nouveau, jardins et vibe européenne. 2h30 de Paris.', 'Roumanie', 'Europe', 'ville', 45.7489, 21.2087, 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=800&q=80', true),
  ('sicile', 'Sicile', 'Île méditerranéenne. Etna, temples grecs, villages de pêcheurs et la meilleure cuisine d''Italie.', 'Italie', 'Europe', 'ile', 37.5999, 14.0154, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80', true),
  ('sardaigne', 'Sardaigne', 'Entre Méditerranée et mer Tyrrhénienne. Les plages les plus belles d''Europe et les montagnes du centre.', 'Italie', 'Europe', 'ile', 40.1209, 9.0129, 'https://images.unsplash.com/photo-1548796706-4e1a5a4c9f0c?w=800&q=80', true),
  ('cagliari', 'Cagliari', 'Le sud de la Sardaigne. Capitale, lagune aux flamants roses, vieille ville castello.', 'Italie', 'Europe', 'ville', 39.2238, 9.1217, 'https://images.unsplash.com/photo-1548796706-4e1a5a4c9f0c?w=800&q=80', true),
  ('paris', 'Paris', 'Île-de-France slow travel. Paris alternatif, Petite Ceinture, canaux, streets art et quartiers vivants.', 'France', 'Europe', 'ville', 48.8566, 2.3522, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', true),
  ('versailles', 'Versailles', 'Château et jardins. Le domaine que les bus de tourisme évitent de regarder vraiment.', 'France', 'Europe', 'culture', 48.8014, 2.1301, 'https://images.unsplash.com/photo-1564594736624-def7a10ab047?w=800&q=80', true),
  ('giverny', 'Giverny', 'Jardins de Monet. Nymphéas, pont japonais et la lumière qui change tout en mai.', 'France', 'Europe', 'nature', 49.0705, 1.5286, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', true),
  ('fontainebleau', 'Fontainebleau', 'Forêt, sable blanc et blocs de grès. L''escalade et la rando à 1h de Paris.', 'France', 'Europe', 'nature', 48.4021, 2.7045, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', true),
  ('normandie', 'Normandie', 'Falaises de craie, ports de pêche, bocage du Pays d''Auge. Le Havre UNESCO, Honfleur, Etretat.', 'France', 'Europe', 'cote', 49.1829, 0.3707, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', true),
  ('le-havre', 'Le Havre', 'Deuxième port de France, patrimoine UNESCO d''Auguste Perret. Une ville qui surprend quand on prend le temps.', 'France', 'Europe', 'ville', 49.4944, 0.1079, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', true),
  ('lisbonne', 'Lisbonne', 'Collines, Tram 28, fado et les açaï de Santa Catarina. La ville qui respire par les belvédères.', 'Portugal', 'Europe', 'ville', 38.7223, -9.1393, 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800&q=80', true),
  ('porto', 'Porto', 'Vin de Porto, architecture, bord du Douro. La ville qui se goûte en marchant.', 'Portugal', 'Europe', 'ville', 41.1579, -8.6291, 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80', true),
  ('colombie', 'Colombie', 'Bogota, Medellin, Cartago et la chaleur de l''Amérique du Sud. Le voyage qui repousse les contours.', 'Colombie', 'Amérique latine', 'culture', 4.5709, -74.2973, 'https://images.unsplash.com/photo-1569091791842-7cfb64e04797?w=800&q=80', true),
  ('bogota', 'Bogota', 'Capitale andine à 2600m. Street art, districts créatifs et la chaleur humaine qui compense l''altitude.', 'Colombie', 'Amérique latine', 'ville', 4.7110, -74.0721, 'https://images.unsplash.com/photo-1569091791842-7cfb64e04797?w=800&q=80', true),
  ('medellin', 'Medellin', 'Ville de l''éternel printemps. Communes, métro cable et la transformation la plus impressionnante d''Amérique latine.', 'Colombie', 'Amérique latine', 'ville', 6.2442, -75.5812, 'https://images.unsplash.com/photo-1569091791842-7cfb64e04797?w=800&q=80', true),
  ('brasov', 'Brasov', 'Montagne, Dracula et pizza. Le centre médiéval que les bus de Dracula rendent célèbre.', 'Roumanie', 'Europe', 'ville', 45.6427, 25.5888, 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80', true),
  ('transylvanie', 'Transylvanie', 'Villages saxons, châteaux, légendes. La région que les récits ont rendue plus grande que son échelle réelle.', 'Roumanie', 'Europe', 'culture', 46.0, 24.5, 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80', true),
  ('funchal', 'Funchal', 'Capitale de Madère. Marché, front de mer, télécabine et le pain chaud de 7h qui dit tout.', 'Portugal', 'Europe', 'ville', 32.6669, -16.9241, 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80', true),
  ('porto-moniz', 'Porto Moniz', 'Piscines volcaniques naturelles. Le nord-ouest de Madère où la lave a créé des bassins transparents.', 'Portugal', 'Europe', 'nature', 32.8669, -17.1669, 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80', true),
  ('sao-vicente', 'São Vicente', 'Le nord oublié de Madère. Grottes volcaniques, plage noire et éoliennes dans la brume.', 'Portugal', 'Europe', 'nature', 32.7833, -17.0333, 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80', true),
  ('ponta-do-sol', 'Ponta do Sol', 'Le sud de Madère. Plus intime, plus doux, idéal pour un voyage en duo orienté slow et coucher de soleil.', 'Portugal', 'Europe', 'cote', 32.65, -17.1, 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80', true),
  ('ribeiro-frio', 'Ribeiro Frio', 'Forêt de laurisylve et levadas. Le point médian de Madère où les sources froides traversent la montagne.', 'Portugal', 'Europe', 'nature', 32.7167, -16.8833, 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80', true),
  ('cabo-girao', 'Cabo Girao', 'La plus haute falaise d''Europe. 580m à pic sur l''Atlantique, une vue qui coupe le souffle.', 'Portugal', 'Europe', 'nature', 32.65, -17.0, 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80', true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  country = EXCLUDED.country,
  region = EXCLUDED.region,
  category = EXCLUDED.category,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  image = EXCLUDED.image,
  updated_at = now();