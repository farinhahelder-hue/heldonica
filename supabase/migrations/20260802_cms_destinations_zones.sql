-- ============================================================================
-- Pages destination : contenu piloté par le CMS (cms_editable_zones)
-- Date: 2026-08-01 — généré par scripts/generate-destinations-cms.mjs
-- ============================================================================
-- Les pages sicile / lisbonne / suisse / zurich / paris (DestinationPage)
-- passent du hardcodé (DESTINATION_CONTENT) à des zones éditables. Les
-- valeurs ci-dessous sont EXACTEMENT le contenu affiché jusqu'ici.
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

-- ─── destinations-sicile ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sicile', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sicile', 'title', 'text', 'Sicile', 'Titre de la destination', true),
  ('destinations-sicile', 'subtitle', 'text', 'la botte qu''on prend par ses secrets', 'Sous-titre', true),
  ('destinations-sicile', 'description', 'textarea', 'Entre Agrigente et Raguse, entre Modica et Caltagirone, il y a une Sicile que les guides ne mentionnent pas. Celle des villages de pierre qui n''ont pas encore cédé au tourisme de masse, des tables de campagne où le vin coule à flots, des couchers de soleil sur la Méditerranée qui durent plus longtemps que prévu.', 'Description', true),
  ('destinations-sicile', 'verdict', 'textarea', 'La Sicile ne se donne pas à ceux qui passent. Elle attend ceux qui restent.', 'Notre verdict', true),
  ('destinations-sicile', 'duration', 'text', '7-10 jours', 'Durée idéale', true),
  ('destinations-sicile', 'season', 'text', 'Avril à juin · Septembre à octobre', 'Meilleure saison', true),
  ('destinations-sicile', 'budget', 'text', '900-1400€ / duo / 7 jours', 'Budget indicatif', true),
  ('destinations-sicile', 'profile', 'text', 'Couple curieux, amateur de culture et de cuisine', 'Profil', true),
  ('destinations-sicile', 'tip_1', 'textarea', 'Visiter la Vallée des Temples à Agrigente à 7h du matin', 'Notre conseil 1', true),
  ('destinations-sicile', 'tip_2', 'textarea', 'Manger chez Teresa à Modica — sa arancini est légendaire', 'Notre conseil 2', true),
  ('destinations-sicile', 'tip_3', 'textarea', 'Prendre le ferry pour Stromboli et voir l''éruption nocturne', 'Notre conseil 3', true),
  ('destinations-sicile', 'tip_4', 'textarea', 'Rester 3 nuits minimum à Raguse pour voir deux couchers de soleil différents', 'Notre conseil 4', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-lisbonne ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-lisbonne', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-lisbonne', 'title', 'text', 'Lisbonne', 'Titre de la destination', true),
  ('destinations-lisbonne', 'subtitle', 'text', 'vue par ceux qui y vivent', 'Sous-titre', true),
  ('destinations-lisbonne', 'description', 'textarea', 'Alfama le matin, avant les croisières. LX Factory à 8h, quand les artisans ouvrent leurs ateliers. Le ferry pour Cacilhas, face à Lisbonne qui se révèle en reflet sur le Tage. Lisbonne n''est pas difficile à aimer — elle est difficile à connaître vraiment.', 'Description', true),
  ('destinations-lisbonne', 'verdict', 'textarea', 'Lisbonne est meilleure quand tu la prends pour elle-même, pas pour ce qu''elle montre.', 'Notre verdict', true),
  ('destinations-lisbonne', 'duration', 'text', '3-5 jours', 'Durée idéale', true),
  ('destinations-lisbonne', 'season', 'text', 'Toute l''année · Mai et septembre idéaux', 'Meilleure saison', true),
  ('destinations-lisbonne', 'budget', 'text', '400-700€ / duo / 4 jours', 'Budget indicatif', true),
  ('destinations-lisbonne', 'profile', 'text', 'City breaker, amateur d''architecture et de fado', 'Profil', true),
  ('destinations-lisbonne', 'tip_1', 'textarea', 'Monter au Miradouro da Senhora do Monte pour le coucher du soleil', 'Notre conseil 1', true),
  ('destinations-lisbonne', 'tip_2', 'textarea', 'Prendre le tram 28 à 7h du matin — avant la foule', 'Notre conseil 2', true),
  ('destinations-lisbonne', 'tip_3', 'textarea', 'Manger des pastéis de nata à Antónia ici, pas ailleurs', 'Notre conseil 3', true),
  ('destinations-lisbonne', 'tip_4', 'textarea', 'Traverser le Tage pour voir Lisbonne depuis Cacilhas', 'Notre conseil 4', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-suisse ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-suisse', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-suisse', 'title', 'text', 'Suisse', 'Titre de la destination', true),
  ('destinations-suisse', 'subtitle', 'text', 'les Alpes par leurs crêtes et leurs bains', 'Sous-titre', true),
  ('destinations-suisse', 'description', 'textarea', 'Le funiculaire le plus raide du monde vers Stoos. Les crêtes à 2000m qu''on traverse en été avec des fleurs jusqu''aux genoux. Les bains du Lötschental, où l''on reste une heure de plus que prévu. La Suisse révèle ses meilleurs côtés à ceux qui descendent des sentiers balisés.', 'Description', true),
  ('destinations-suisse', 'verdict', 'textarea', 'La Suisse ne demande pas qu''on la visite — elle demande qu''on la découvre.', 'Notre verdict', true),
  ('destinations-suisse', 'duration', 'text', '5-7 jours', 'Durée idéale', true),
  ('destinations-suisse', 'season', 'text', 'Juin à septembre · Décembre pour les sports d''hiver', 'Meilleure saison', true),
  ('destinations-suisse', 'budget', 'text', '1200-2000€ / duo / 7 jours', 'Budget indicatif', true),
  ('destinations-suisse', 'profile', 'text', 'Randonneur, amateur de montagne et de villages alpin', 'Profil', true),
  ('destinations-suisse', 'tip_1', 'textarea', 'Prendre le funiculaire Schwyz-Stoos — 110% de pente', 'Notre conseil 1', true),
  ('destinations-suisse', 'tip_2', 'textarea', 'Rester une nuit dans un chalet d''alpage entre Stoos et Klein Mythen', 'Notre conseil 2', true),
  ('destinations-suisse', 'tip_3', 'textarea', 'Visiter les bains de Vals — architecture sensationnelle', 'Notre conseil 3', true),
  ('destinations-suisse', 'tip_4', 'textarea', 'Marcher jusqu''au sommet du Moléson pour voir la Riviera vaudoise', 'Notre conseil 4', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-zurich ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-zurich', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-zurich', 'title', 'text', 'Zurich', 'Titre de la destination', true),
  ('destinations-zurich', 'subtitle', 'text', 'la Suisse financière et ses villages cachés', 'Sous-titre', true),
  ('destinations-zurich', 'description', 'textarea', 'Zurich n''est pas ce qu''on croit. Elle est plus verte, plus calme, plus simple. Le quartier de Langstrasse, les bords de la Limmat au coucher du soleil, la Kämbel qui surplombe la vieille ville. Et à 30 minutes, des villages qui n''ont pas changé depuis des siècles.', 'Description', true),
  ('destinations-zurich', 'verdict', 'textarea', 'Zurich est meilleure en dehors des sentiers battus financiers.', 'Notre verdict', true),
  ('destinations-zurich', 'duration', 'text', '3-5 jours', 'Durée idéale', true),
  ('destinations-zurich', 'season', 'text', 'Avril à octobre', 'Meilleure saison', true),
  ('destinations-zurich', 'budget', 'text', '800-1400€ / duo / 4 jours', 'Budget indicatif', true),
  ('destinations-zurich', 'profile', 'text', 'Amateur de culture, de design et de nature', 'Profil', true),
  ('destinations-zurich', 'tip_1', 'textarea', 'Visiter le Kunsthaus — l''un des plus beaux musées d''Europe', 'Notre conseil 1', true),
  ('destinations-zurich', 'tip_2', 'textarea', 'Manger au Volkshaus — design Bauhaus, cuisine locale', 'Notre conseil 2', true),
  ('destinations-zurich', 'tip_3', 'textarea', 'Prendre le train pour Stein am Rhein — le plus beau village de Suisse', 'Notre conseil 3', true),
  ('destinations-zurich', 'tip_4', 'textarea', 'Longer la Limmat au coucher du soleil depuis le Niederdorf', 'Notre conseil 4', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-paris ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-paris', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-paris', 'title', 'text', 'Paris', 'Titre de la destination', true),
  ('destinations-paris', 'subtitle', 'text', 'la ville qu''on croit connaître', 'Sous-titre', true),
  ('destinations-paris', 'description', 'textarea', 'Paris a deux visages. Celui des cartes postales, qu''on connaît tous. Et celui que la ville garde pour ses initiés — ses friches industrielles reconverties en jardins secrets, ses passages couverts endormis, ses villages dans la ville. Même en bas de chez toi, il reste des rues qui n''ont pas fini de se révéler.', 'Description', true),
  ('destinations-paris', 'verdict', 'textarea', 'Paris est meilleur quand on arrête d''essayer d''en faire trop.', 'Notre verdict', true),
  ('destinations-paris', 'duration', 'text', '3-5 jours', 'Durée idéale', true),
  ('destinations-paris', 'season', 'text', 'Toute l''année', 'Meilleure saison', true),
  ('destinations-paris', 'budget', 'text', 'Modulable', 'Budget indicatif', true),
  ('destinations-paris', 'profile', 'text', 'Amateur de culture, de flânerie et de bonne chère', 'Profil', true),
  ('destinations-paris', 'tip_1', 'textarea', 'Explorer la Petite Ceinture — l''ancienne ligne de chemin de fer transformée en coulée verte', 'Notre conseil 1', true),
  ('destinations-paris', 'tip_2', 'textarea', 'Monter au Miradouro (équivalent) du Sacré-Cœur à l''aube', 'Notre conseil 2', true),
  ('destinations-paris', 'tip_3', 'textarea', 'Manger au mercado local du quartier, pas dans les restaurants touristiques', 'Notre conseil 3', true),
  ('destinations-paris', 'tip_4', 'textarea', 'Prendre le temps de s''asseoir dans un café sans commander autre chose qu''un café', 'Notre conseil 4', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
