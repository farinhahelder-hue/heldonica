-- ============================================================================
-- Sous-destinations : contenu piloté par le CMS (cms_editable_zones)
-- Date: 2026-08-01 — généré par scripts/generate-subdest-cms.mjs
-- ============================================================================
-- Les pages sous-destination passent du hardcodé (props du template) à des
-- zones éditables. Les valeurs ci-dessous sont EXACTEMENT le contenu affiché
-- jusqu'ici : l'arbitrage éditorial est préservé au caractère près, seul le
-- mécanisme change. Aucun changement visible attendu.
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

-- ─── destinations-colombie-bogota ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-colombie-bogota', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-colombie-bogota', 'intro_text', 'textarea', 'Bogota, c''est la capitale a 2600m. Le centre historique, les murs de grafitti, les musees.', 'Texte d''introduction', true),
  ('destinations-colombie-bogota', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-colombie-bogota', 'highlight_1_emoji', 'text', '🎨', 'Pépite 1 — emoji', true),
  ('destinations-colombie-bogota', 'highlight_1_title', 'text', 'Grafitti', 'Pépite 1 — titre', true),
  ('destinations-colombie-bogota', 'highlight_1_description', 'textarea', 'La Candelaria.', 'Pépite 1 — description', true),
  ('destinations-colombie-bogota', 'highlight_2_emoji', 'text', '🏛️', 'Pépite 2 — emoji', true),
  ('destinations-colombie-bogota', 'highlight_2_title', 'text', 'Musee', 'Pépite 2 — titre', true),
  ('destinations-colombie-bogota', 'highlight_2_description', 'textarea', 'Or.', 'Pépite 2 — description', true),
  ('destinations-colombie-bogota', 'highlight_3_emoji', 'text', '🗿', 'Pépite 3 — emoji', true),
  ('destinations-colombie-bogota', 'highlight_3_title', 'text', 'Monserrate', 'Pépite 3 — titre', true),
  ('destinations-colombie-bogota', 'highlight_3_description', 'textarea', 'Vue.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-colombie-cali ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-colombie-cali', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-colombie-cali', 'intro_text', 'textarea', 'Cali, c''est la capitale mondiale de la salsa. Les clubs, les festivals, la fievre.', 'Texte d''introduction', true),
  ('destinations-colombie-cali', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-colombie-cali', 'highlight_1_emoji', 'text', '💃', 'Pépite 1 — emoji', true),
  ('destinations-colombie-cali', 'highlight_1_title', 'text', 'Salsa', 'Pépite 1 — titre', true),
  ('destinations-colombie-cali', 'highlight_1_description', 'textarea', 'Calle 38.', 'Pépite 1 — description', true),
  ('destinations-colombie-cali', 'highlight_2_emoji', 'text', '🏃', 'Pépite 2 — emoji', true),
  ('destinations-colombie-cali', 'highlight_2_title', 'text', 'Feria', 'Pépite 2 — titre', true),
  ('destinations-colombie-cali', 'highlight_2_description', 'textarea', 'Decembre.', 'Pépite 2 — description', true),
  ('destinations-colombie-cali', 'highlight_3_emoji', 'text', '🌯', 'Pépite 3 — emoji', true),
  ('destinations-colombie-cali', 'highlight_3_title', 'text', 'Canqui', 'Pépite 3 — titre', true),
  ('destinations-colombie-cali', 'highlight_3_description', 'textarea', 'Empanadas.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-colombie-cartago ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-colombie-cartago', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-colombie-cartago', 'intro_text', 'textarea', 'Cartago, c''est la zone cafe. Les fincas, les plantations, le meilleur cafe de Colombie.', 'Texte d''introduction', true),
  ('destinations-colombie-cartago', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-colombie-cartago', 'highlight_1_emoji', 'text', '☕', 'Pépite 1 — emoji', true),
  ('destinations-colombie-cartago', 'highlight_1_title', 'text', 'Cafe', 'Pépite 1 — titre', true),
  ('destinations-colombie-cartago', 'highlight_1_description', 'textarea', 'Finca.', 'Pépite 1 — description', true),
  ('destinations-colombie-cartago', 'highlight_2_emoji', 'text', '🌱', 'Pépite 2 — emoji', true),
  ('destinations-colombie-cartago', 'highlight_2_title', 'text', 'Ferme', 'Pépite 2 — titre', true),
  ('destinations-colombie-cartago', 'highlight_2_description', 'textarea', 'Visites.', 'Pépite 2 — description', true),
  ('destinations-colombie-cartago', 'highlight_3_emoji', 'text', '🥭', 'Pépite 3 — emoji', true),
  ('destinations-colombie-cartago', 'highlight_3_title', 'text', 'Fruit', 'Pépite 3 — titre', true),
  ('destinations-colombie-cartago', 'highlight_3_description', 'textarea', 'Local.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-colombie-medellin ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-colombie-medellin', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-colombie-medellin', 'intro_text', 'textarea', 'Medellin, c''est la transformation. Le clima eternal, les parches, le metro cable.', 'Texte d''introduction', true),
  ('destinations-colombie-medellin', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-colombie-medellin', 'highlight_1_emoji', 'text', '🌿', 'Pépite 1 — emoji', true),
  ('destinations-colombie-medellin', 'highlight_1_title', 'text', 'Parche', 'Pépite 1 — titre', true),
  ('destinations-colombie-medellin', 'highlight_1_description', 'textarea', 'Jardins botaniques.', 'Pépite 1 — description', true),
  ('destinations-colombie-medellin', 'highlight_2_emoji', 'text', '🚡', 'Pépite 2 — emoji', true),
  ('destinations-colombie-medellin', 'highlight_2_title', 'text', 'Metro Cable', 'Pépite 2 — titre', true),
  ('destinations-colombie-medellin', 'highlight_2_description', 'textarea', 'Comuna 13.', 'Pépite 2 — description', true),
  ('destinations-colombie-medellin', 'highlight_3_emoji', 'text', '💃', 'Pépite 3 — emoji', true),
  ('destinations-colombie-medellin', 'highlight_3_title', 'text', 'Salsa', 'Pépite 3 — titre', true),
  ('destinations-colombie-medellin', 'highlight_3_description', 'textarea', 'Parque Leras.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-idf-fontainebleau ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-idf-fontainebleau', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-idf-fontainebleau', 'intro_text', 'textarea', 'La forêt. Les rochers, les parcours.', 'Texte d''introduction', true),
  ('destinations-idf-fontainebleau', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-idf-fontainebleau', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-idf-fontainebleau', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-idf-fontainebleau', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-idf-fontainebleau', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-idf-fontainebleau', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-idf-fontainebleau', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-idf-fontainebleau', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-idf-fontainebleau', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-idf-fontainebleau', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-idf-giverny ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-idf-giverny', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-idf-giverny', 'intro_text', 'textarea', 'Les jardins de Monet. Les nymphes, les ponts japonais.', 'Texte d''introduction', true),
  ('destinations-idf-giverny', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-idf-giverny', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-idf-giverny', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-idf-giverny', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-idf-giverny', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-idf-giverny', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-idf-giverny', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-idf-giverny', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-idf-giverny', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-idf-giverny', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-idf-paris ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-idf-paris', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-idf-paris', 'intro_text', 'textarea', 'Paris, c''est les balades. Les quartiers, les cafes, les parks.', 'Texte d''introduction', true),
  ('destinations-idf-paris', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-idf-paris', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-idf-paris', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-idf-paris', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-idf-paris', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-idf-paris', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-idf-paris', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-idf-paris', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-idf-paris', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-idf-paris', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-idf-versailles ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-idf-versailles', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-idf-versailles', 'intro_text', 'textarea', 'Le chateau. Les journees entieres a explore.', 'Texte d''introduction', true),
  ('destinations-idf-versailles', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-idf-versailles', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-idf-versailles', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-idf-versailles', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-idf-versailles', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-idf-versailles', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-idf-versailles', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-idf-versailles', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-idf-versailles', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-idf-versailles', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-achadas-da-cruz ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-achadas-da-cruz', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-achadas-da-cruz', 'intro_text', 'textarea', 'Le funiculaire. 1000m de chute. Vertige.', 'Texte d''introduction', true),
  ('destinations-madere-achadas-da-cruz', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-achadas-da-cruz', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-cabo-girao ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-cabo-girao', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-cabo-girao', 'intro_text', 'textarea', 'La plus haute falaise d''Europe. 580 m à pic sur l''océan.', 'Texte d''introduction', true),
  ('destinations-madere-cabo-girao', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-cabo-girao', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-cabo-girao', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-cabo-girao', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-cabo-girao', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-cabo-girao', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-cabo-girao', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-cabo-girao', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-cabo-girao', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-cabo-girao', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-camara-de-lobos ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-camara-de-lobos', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-camara-de-lobos', 'intro_text', 'textarea', 'Le village de pecheurs. Le plus authentique.', 'Texte d''introduction', true),
  ('destinations-madere-camara-de-lobos', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-camara-de-lobos', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-camara-de-lobos', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-camara-de-lobos', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-camara-de-lobos', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-camara-de-lobos', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-camara-de-lobos', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-camara-de-lobos', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-camara-de-lobos', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-camara-de-lobos', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-cote-est ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-cote-est', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-cote-est', 'intro_text', 'textarea', 'Machico, Caniçal, la côte sauvage. L''arrivée en avion.', 'Texte d''introduction', true),
  ('destinations-madere-cote-est', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-cote-est', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-cote-est', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-cote-est', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-cote-est', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-cote-est', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-cote-est', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-cote-est', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-cote-est', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-cote-est', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-estreito ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-estreito', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-estreito', 'intro_text', 'textarea', 'La vallée. Les levadas, les cascades, la forêt.', 'Texte d''introduction', true),
  ('destinations-madere-estreito', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-estreito', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-estreito', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-estreito', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-estreito', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-estreito', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-estreito', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-estreito', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-estreito', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-estreito', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-faial ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-faial', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-faial', 'intro_text', 'textarea', 'Le village dans les nuages. Montagne.', 'Texte d''introduction', true),
  ('destinations-madere-faial', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-faial', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-faial', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-faial', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-faial', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-faial', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-faial', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-faial', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-faial', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-faial', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-funchal ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-funchal', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-funchal', 'intro_text', 'textarea', 'La capitale de Madère. Le marché, le vieux quartier, et la vue depuis le téléphérique.', 'Texte d''introduction', true),
  ('destinations-madere-funchal', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-funchal', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-funchal', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-funchal', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-funchal', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-funchal', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-funchal', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-funchal', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-funchal', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-funchal', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-ponta-do-sol ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-ponta-do-sol', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-ponta-do-sol', 'intro_text', 'textarea', 'Le bout de l’île. Le plus west. Le moins connu.', 'Texte d''introduction', true),
  ('destinations-madere-ponta-do-sol', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-ponta-do-sol', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-ponta-do-sol', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-ponta-do-sol', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-ponta-do-sol', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-ponta-do-sol', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-ponta-do-sol', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-ponta-do-sol', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-ponta-do-sol', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-ponta-do-sol', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-portela ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-portela', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-portela', 'intro_text', 'textarea', 'Le village. La vue, le cimetiere, les eucalyptus.', 'Texte d''introduction', true),
  ('destinations-madere-portela', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-portela', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-portela', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-portela', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-portela', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-portela', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-portela', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-portela', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-portela', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-portela', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-porto-moniz ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-porto-moniz', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-porto-moniz', 'intro_text', 'textarea', 'Porto Moniz, situé à la pointe nord-ouest de Madère, est célèbre pour ses extraordinaires piscines naturelles formées par la lave volcanique. C''est l''un des lieux où l''énergie brute de l''océan Atlantique rencontre la roche noire, créant un paysage inoubliable.', 'Texte d''introduction', true),
  ('destinations-madere-porto-moniz', 'local_tip', 'textarea', 'Privilégie les piscines naturelles gratuites (plus sauvages) situées près du port plutôt que les piscines payantes si tu cherches une ambiance brute et sans touristes.', 'Conseil local', true),
  ('destinations-madere-porto-moniz', 'highlight_1_emoji', 'text', '🌊', 'Pépite 1 — emoji', true),
  ('destinations-madere-porto-moniz', 'highlight_1_title', 'text', 'Les Piscines Naturelles Volcaniques', 'Pépite 1 — titre', true),
  ('destinations-madere-porto-moniz', 'highlight_1_description', 'textarea', 'Des bassins de roche basaltique noire alimentés directement par les marées de l''océan Atlantique. Une eau limpide et une baignade hors du commun.', 'Pépite 1 — description', true),
  ('destinations-madere-porto-moniz', 'highlight_2_emoji', 'text', '🏰', 'Pépite 2 — emoji', true),
  ('destinations-madere-porto-moniz', 'highlight_2_title', 'text', 'Le Fort de São João Baptista', 'Pépite 2 — titre', true),
  ('destinations-madere-porto-moniz', 'highlight_2_description', 'textarea', 'Une petite forteresse historique datant du XVIIe siècle édifiée pour protéger la côte des pirates. Elle abrite aujourd''hui un petit aquarium.', 'Pépite 2 — description', true),
  ('destinations-madere-porto-moniz', 'highlight_3_emoji', 'text', '🚗', 'Pépite 3 — emoji', true),
  ('destinations-madere-porto-moniz', 'highlight_3_title', 'text', 'La Route Cotière Nord', 'Pépite 3 — titre', true),
  ('destinations-madere-porto-moniz', 'highlight_3_description', 'textarea', 'La route menant à Porto Moniz longe des falaises abruptes et traverse d''anciens tunnels creusés dans la roche volcanique. Spectaculaire.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-ribeiro-frio ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-ribeiro-frio', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-ribeiro-frio', 'intro_text', 'textarea', 'Le centre montagne. Levadas, forêt, altitude.', 'Texte d''introduction', true),
  ('destinations-madere-ribeiro-frio', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-ribeiro-frio', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-ribeiro-frio', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-ribeiro-frio', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-ribeiro-frio', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-ribeiro-frio', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-ribeiro-frio', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-ribeiro-frio', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-ribeiro-frio', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-ribeiro-frio', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-santos ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-santos', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-santos', 'intro_text', 'textarea', 'Le petit village. Les tavernes, le vin.', 'Texte d''introduction', true),
  ('destinations-madere-santos', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-santos', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-santos', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-santos', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-santos', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-santos', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-santos', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-santos', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-santos', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-santos', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-madere-sao-vicente ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-sao-vicente', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-madere-sao-vicente', 'intro_text', 'textarea', 'Le nord forgotten. Grottes, plage noire, eoliennes.', 'Texte d''introduction', true),
  ('destinations-madere-sao-vicente', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-madere-sao-vicente', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-madere-sao-vicente', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-madere-sao-vicente', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-madere-sao-vicente', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-madere-sao-vicente', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-madere-sao-vicente', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-madere-sao-vicente', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-madere-sao-vicente', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-madere-sao-vicente', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-normandie-cote-albatre ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-normandie-cote-albatre', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-normandie-cote-albatre', 'intro_text', 'textarea', 'Les falaises de craie blanche. Etretat, Caps, et les petits villages entre les deux.', 'Texte d''introduction', true),
  ('destinations-normandie-cote-albatre', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-normandie-cote-albatre', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-normandie-cote-albatre', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-normandie-cote-albatre', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-normandie-cote-albatre', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-normandie-cote-albatre', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-normandie-cote-albatre', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-normandie-cote-albatre', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-normandie-cote-albatre', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-normandie-cote-albatre', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-normandie-le-havre ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-normandie-le-havre', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-normandie-le-havre', 'intro_text', 'textarea', 'Deuxième port de France. Mais pas que ça. Architecture Art Deco, plages, et un esprit qui surprend.', 'Texte d''introduction', true),
  ('destinations-normandie-le-havre', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-normandie-le-havre', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-normandie-le-havre', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-normandie-le-havre', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-normandie-le-havre', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-normandie-le-havre', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-normandie-le-havre', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-normandie-le-havre', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-normandie-le-havre', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-normandie-le-havre', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-normandie-pays-dauge ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-normandie-pays-dauge', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-normandie-pays-dauge', 'intro_text', 'textarea', 'Honfleur, Deauville, le bocage. Le pays du cidre et du Camembert.', 'Texte d''introduction', true),
  ('destinations-normandie-pays-dauge', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-normandie-pays-dauge', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-normandie-pays-dauge', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-normandie-pays-dauge', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-normandie-pays-dauge', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-normandie-pays-dauge', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-normandie-pays-dauge', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-normandie-pays-dauge', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-normandie-pays-dauge', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-normandie-pays-dauge', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-portugal-lisbonne ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-portugal-lisbonne', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-portugal-lisbonne', 'intro_text', 'textarea', 'Lisbonne, la ville aux sept collines baignée par la lumière dorée du Tage, est une invitation à ralentir. Entre tramways historiques, façades d''azulejos patinées et mélodies nostalgiques du Fado, elle se découvre à pied, une ruelle pavée après l''autre.', 'Texte d''introduction', true),
  ('destinations-portugal-lisbonne', 'local_tip', 'textarea', 'Prends le tramway 28 tôt le matin (avant 8h30) pour éviter la foule des touristes et observer les Lisboètes faire leurs courses.', 'Conseil local', true),
  ('destinations-portugal-lisbonne', 'highlight_1_emoji', 'text', '🌅', 'Pépite 1 — emoji', true),
  ('destinations-portugal-lisbonne', 'highlight_1_title', 'text', 'Les Miradouros Secrets', 'Pépite 1 — titre', true),
  ('destinations-portugal-lisbonne', 'highlight_1_description', 'textarea', 'Les collines de Lisbonne offrent des belvédères spectaculaires. Évite les plus connus et pose-toi au Miradouro de Santa Luzia pour regarder le Tage en silence.', 'Pépite 1 — description', true),
  ('destinations-portugal-lisbonne', 'highlight_2_emoji', 'text', '🏘️', 'Pépite 2 — emoji', true),
  ('destinations-portugal-lisbonne', 'highlight_2_title', 'text', 'Le Labyrinthe de l''Alfama', 'Pépite 2 — titre', true),
  ('destinations-portugal-lisbonne', 'highlight_2_description', 'textarea', 'Le plus vieux quartier de la ville, rescapé du séisme de 1755. Perds-toi dans ses escaliers suspendus où le linge sèche aux fenêtres et où résonne le Fado.', 'Pépite 2 — description', true),
  ('destinations-portugal-lisbonne', 'highlight_3_emoji', 'text', '🥧', 'Pépite 3 — emoji', true),
  ('destinations-portugal-lisbonne', 'highlight_3_title', 'text', 'Pastéis de Belém originaux', 'Pépite 3 — titre', true),
  ('destinations-portugal-lisbonne', 'highlight_3_description', 'textarea', 'Une institution depuis 1837. Si la file d''attente est longue, prends-les à emporter et déguste-les tièdes dans le parc voisin sous les arbres.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-portugal-porto ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-portugal-porto', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-portugal-porto', 'intro_text', 'textarea', 'Porto, c''est le nord. Le vin, le fleuve, les couleurs.', 'Texte d''introduction', true),
  ('destinations-portugal-porto', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-portugal-porto', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-portugal-porto', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-portugal-porto', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-portugal-porto', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-portugal-porto', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-portugal-porto', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-portugal-porto', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-portugal-porto', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-portugal-porto', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-roumanie-brasov ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-roumanie-brasov', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-roumanie-brasov', 'intro_text', 'textarea', 'Brașov allie parfaitement le charme d''une cité médiévale fortifiée et la nature sauvage des Carpates. C''est le point de départ idéal pour explorer la Transylvanie à un rythme lent, en se perdant dans ses ruelles pavées pavoisées de maisons pastel.', 'Texte d''introduction', true),
  ('destinations-roumanie-brasov', 'local_tip', 'textarea', 'Monte au sommet du mont Tâmpa au coucher du soleil pour voir la brume s''installer sur la vallée et les lumières de la ville s''allumer une à une.', 'Conseil local', true),
  ('destinations-roumanie-brasov', 'highlight_1_emoji', 'text', '🏔️', 'Pépite 1 — emoji', true),
  ('destinations-roumanie-brasov', 'highlight_1_title', 'text', 'Le Mont Tâmpa', 'Pépite 1 — titre', true),
  ('destinations-roumanie-brasov', 'highlight_1_description', 'textarea', 'Une montagne verdoyante en plein centre-ville. On peut y monter à pied ou en téléphérique pour profiter d''une vue imprenable sur les toits rouges de la vieille ville.', 'Pépite 1 — description', true),
  ('destinations-roumanie-brasov', 'highlight_2_emoji', 'text', '⛪', 'Pépite 2 — emoji', true),
  ('destinations-roumanie-brasov', 'highlight_2_title', 'text', 'L''Église Noire', 'Pépite 2 — titre', true),
  ('destinations-roumanie-brasov', 'highlight_2_description', 'textarea', 'Un chef-d''œuvre gothique imposant qui abrite une collection impressionnante de tapis anatoliens offerts par les marchands de passage.', 'Pépite 2 — description', true),
  ('destinations-roumanie-brasov', 'highlight_3_emoji', 'text', '🧱', 'Pépite 3 — emoji', true),
  ('destinations-roumanie-brasov', 'highlight_3_title', 'text', 'La Rue de la Ficelle (Strada Sforii)', 'Pépite 3 — titre', true),
  ('destinations-roumanie-brasov', 'highlight_3_description', 'textarea', 'L''une des rues les plus étroites d''Europe, un passage secret pittoresque chargé d''histoire au cœur du quartier de Șchei.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-roumanie-bucarest ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-roumanie-bucarest', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-roumanie-bucarest', 'intro_text', 'textarea', 'Bucarest, c''est le chaos. Mais un chaos passionnant.', 'Texte d''introduction', true),
  ('destinations-roumanie-bucarest', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-roumanie-bucarest', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-roumanie-bucarest', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-roumanie-bucarest', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-roumanie-bucarest', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-roumanie-bucarest', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-roumanie-bucarest', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-roumanie-bucarest', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-roumanie-bucarest', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-roumanie-bucarest', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-roumanie-cluj ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-roumanie-cluj', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-roumanie-cluj', 'intro_text', 'textarea', 'Cluj-Napoca, la capitale non officielle de la Transylvanie, est une ville qui se vit à travers ses cafés indépendants, ses universités vibrantes et ses parcs cachés. Moins touristique que Brașov, elle offre un aperçu sincère de la Roumanie moderne et créative.', 'Texte d''introduction', true),
  ('destinations-roumanie-cluj', 'local_tip', 'textarea', 'Rends-toi chez Roots ou Meron pour goûter à l''un des meilleurs expressos du pays, puis termine ton après-midi dans les allées calmes du Jardin Botanique.', 'Conseil local', true),
  ('destinations-roumanie-cluj', 'highlight_1_emoji', 'text', '☕', 'Pépite 1 — emoji', true),
  ('destinations-roumanie-cluj', 'highlight_1_title', 'text', 'La Scène des Cafés', 'Pépite 1 — titre', true),
  ('destinations-roumanie-cluj', 'highlight_1_description', 'textarea', 'Cluj possède l''une des scènes de cafés de spécialité les plus vivantes d''Europe de l''Est. Des torréfacteurs passionnés et des recoins bohèmes pour lire tranquille.', 'Pépite 1 — description', true),
  ('destinations-roumanie-cluj', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-roumanie-cluj', 'highlight_2_title', 'text', 'Le Jardin Botanique', 'Pépite 2 — titre', true),
  ('destinations-roumanie-cluj', 'highlight_2_description', 'textarea', 'Un immense havre de paix vallonné en plein cœur de la ville, parfait pour s''isoler avec un livre sous les serres tropicales centenaires.', 'Pépite 2 — description', true),
  ('destinations-roumanie-cluj', 'highlight_3_emoji', 'text', '⛪', 'Pépite 3 — emoji', true),
  ('destinations-roumanie-cluj', 'highlight_3_title', 'text', 'Le Quartier Historique', 'Pépite 3 — titre', true),
  ('destinations-roumanie-cluj', 'highlight_3_description', 'textarea', 'Des ruelles pavées préservées autour de la place de l''Union (Piața Unirii) et l''église gothique Saint-Michel qui domine la ville.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-roumanie-sibiu ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-roumanie-sibiu', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-roumanie-sibiu', 'intro_text', 'textarea', 'Sibiu, c''est la petite Europe. Propre, rangee, avec les montagnes a cote.', 'Texte d''introduction', true),
  ('destinations-roumanie-sibiu', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-roumanie-sibiu', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-roumanie-sibiu', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-roumanie-sibiu', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-roumanie-sibiu', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-roumanie-sibiu', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-roumanie-sibiu', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-roumanie-sibiu', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-roumanie-sibiu', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-roumanie-sibiu', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-roumanie-timisoara ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-roumanie-timisoara', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-roumanie-timisoara', 'intro_text', 'textarea', 'Timisoara, ville hongroise. Art Nouveau, jardins.', 'Texte d''introduction', true),
  ('destinations-roumanie-timisoara', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-roumanie-timisoara', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-roumanie-timisoara', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-roumanie-timisoara', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-roumanie-timisoara', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-roumanie-timisoara', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-roumanie-timisoara', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-roumanie-timisoara', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-roumanie-timisoara', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-roumanie-timisoara', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-roumanie-transylvanie ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-roumanie-transylvanie', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-roumanie-transylvanie', 'intro_text', 'textarea', 'La Transylvanie, c''est la legende. Mais en vrai, ce sont des villages magnifiques.', 'Texte d''introduction', true),
  ('destinations-roumanie-transylvanie', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-roumanie-transylvanie', 'highlight_1_emoji', 'text', '📍', 'Pépite 1 — emoji', true),
  ('destinations-roumanie-transylvanie', 'highlight_1_title', 'text', 'Découvertes calmes', 'Pépite 1 — titre', true),
  ('destinations-roumanie-transylvanie', 'highlight_1_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 1 — description', true),
  ('destinations-roumanie-transylvanie', 'highlight_2_emoji', 'text', '🌿', 'Pépite 2 — emoji', true),
  ('destinations-roumanie-transylvanie', 'highlight_2_title', 'text', 'Artisanat & Nature', 'Pépite 2 — titre', true),
  ('destinations-roumanie-transylvanie', 'highlight_2_description', 'textarea', 'Découvrir la gastronomie locale et les petits producteurs.', 'Pépite 2 — description', true),
  ('destinations-roumanie-transylvanie', 'highlight_3_emoji', 'text', '✨', 'Pépite 3 — emoji', true),
  ('destinations-roumanie-transylvanie', 'highlight_3_title', 'text', 'Points de vue', 'Pépite 3 — titre', true),
  ('destinations-roumanie-transylvanie', 'highlight_3_description', 'textarea', 'Admirer le panorama au coucher du soleil loin de l''agitation.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sardaigne-alghero ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sardaigne-alghero', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sardaigne-alghero', 'intro_text', 'textarea', 'Alghero, c''est la ville catalane. Les remparts, les grottes de Neptune.', 'Texte d''introduction', true),
  ('destinations-sardaigne-alghero', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sardaigne-alghero', 'highlight_1_emoji', 'text', '🏰', 'Pépite 1 — emoji', true),
  ('destinations-sardaigne-alghero', 'highlight_1_title', 'text', 'Remparts', 'Pépite 1 — titre', true),
  ('destinations-sardaigne-alghero', 'highlight_1_description', 'textarea', 'Centre historique.', 'Pépite 1 — description', true),
  ('destinations-sardaigne-alghero', 'highlight_2_emoji', 'text', '🌊', 'Pépite 2 — emoji', true),
  ('destinations-sardaigne-alghero', 'highlight_2_title', 'text', 'Neptune', 'Pépite 2 — titre', true),
  ('destinations-sardaigne-alghero', 'highlight_2_description', 'textarea', 'Grottes marines.', 'Pépite 2 — description', true),
  ('destinations-sardaigne-alghero', 'highlight_3_emoji', 'text', '🍷', 'Pépite 3 — emoji', true),
  ('destinations-sardaigne-alghero', 'highlight_3_title', 'text', 'Vermentino', 'Pépite 3 — titre', true),
  ('destinations-sardaigne-alghero', 'highlight_3_description', 'textarea', 'Vin local.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sardaigne-asinara ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sardaigne-asinara', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sardaigne-asinara', 'intro_text', 'textarea', 'Asinara, c’est l’île aux ânes blanchis. Ils sont partout. Pas de tourists — seulement 1 ferry par jour.', 'Texte d''introduction', true),
  ('destinations-sardaigne-asinara', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sardaigne-asinara', 'highlight_1_emoji', 'text', '🫎', 'Pépite 1 — emoji', true),
  ('destinations-sardaigne-asinara', 'highlight_1_title', 'text', 'Anes', 'Pépite 1 — titre', true),
  ('destinations-sardaigne-asinara', 'highlight_1_description', 'textarea', 'Blanchis. Partout.', 'Pépite 1 — description', true),
  ('destinations-sardaigne-asinara', 'highlight_2_emoji', 'text', '🏝️', 'Pépite 2 — emoji', true),
  ('destinations-sardaigne-asinara', 'highlight_2_title', 'text', 'Prison', 'Pépite 2 — titre', true),
  ('destinations-sardaigne-asinara', 'highlight_2_description', 'textarea', 'Ex-colonie.', 'Pépite 2 — description', true),
  ('destinations-sardaigne-asinara', 'highlight_3_emoji', 'text', '📍', 'Pépite 3 — emoji', true),
  ('destinations-sardaigne-asinara', 'highlight_3_title', 'text', 'Découvertes calmes', 'Pépite 3 — titre', true),
  ('destinations-sardaigne-asinara', 'highlight_3_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sardaigne-cagliari ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sardaigne-cagliari', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sardaigne-cagliari', 'intro_text', 'textarea', 'Cagliari, c''est le sud. La lagune avec les flamants, les dunes de Piscinas.', 'Texte d''introduction', true),
  ('destinations-sardaigne-cagliari', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sardaigne-cagliari', 'highlight_1_emoji', 'text', '🦩', 'Pépite 1 — emoji', true),
  ('destinations-sardaigne-cagliari', 'highlight_1_title', 'text', 'Lagune', 'Pépite 1 — titre', true),
  ('destinations-sardaigne-cagliari', 'highlight_1_description', 'textarea', 'Flamants roses.', 'Pépite 1 — description', true),
  ('destinations-sardaigne-cagliari', 'highlight_2_emoji', 'text', '🏖️', 'Pépite 2 — emoji', true),
  ('destinations-sardaigne-cagliari', 'highlight_2_title', 'text', 'Piscinas', 'Pépite 2 — titre', true),
  ('destinations-sardaigne-cagliari', 'highlight_2_description', 'textarea', 'Dunes.', 'Pépite 2 — description', true),
  ('destinations-sardaigne-cagliari', 'highlight_3_emoji', 'text', '🧂', 'Pépite 3 — emoji', true),
  ('destinations-sardaigne-cagliari', 'highlight_3_title', 'text', 'Salines', 'Pépite 3 — titre', true),
  ('destinations-sardaigne-cagliari', 'highlight_3_description', 'textarea', 'Sel rose.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sardaigne-costa-smeralda ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sardaigne-costa-smeralda', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sardaigne-costa-smeralda', 'intro_text', 'textarea', 'Costa Smeralda, c''est les plages des stars. Mais entre Juin et Septembre seulement.', 'Texte d''introduction', true),
  ('destinations-sardaigne-costa-smeralda', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_1_emoji', 'text', '🏝️', 'Pépite 1 — emoji', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_1_title', 'text', 'Porto Cervo', 'Pépite 1 — titre', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_1_description', 'textarea', 'Le centre.', 'Pépite 1 — description', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_2_emoji', 'text', '💎', 'Pépite 2 — emoji', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_2_title', 'text', 'Smeralda', 'Pépite 2 — titre', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_2_description', 'textarea', 'La plage.', 'Pépite 2 — description', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_3_emoji', 'text', '⛵', 'Pépite 3 — emoji', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_3_title', 'text', 'Cala Raul', 'Pépite 3 — titre', true),
  ('destinations-sardaigne-costa-smeralda', 'highlight_3_description', 'textarea', 'Cachée.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sardaigne-nuoro ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sardaigne-nuoro', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sardaigne-nuoro', 'intro_text', 'textarea', 'Nuoro, c''est la montagne. Les pasteurs, les transhumances, le silence.', 'Texte d''introduction', true),
  ('destinations-sardaigne-nuoro', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sardaigne-nuoro', 'highlight_1_emoji', 'text', '⛰️', 'Pépite 1 — emoji', true),
  ('destinations-sardaigne-nuoro', 'highlight_1_title', 'text', 'Gennargentu', 'Pépite 1 — titre', true),
  ('destinations-sardaigne-nuoro', 'highlight_1_description', 'textarea', 'Le parc.', 'Pépite 1 — description', true),
  ('destinations-sardaigne-nuoro', 'highlight_2_emoji', 'text', '🐑', 'Pépite 2 — emoji', true),
  ('destinations-sardaigne-nuoro', 'highlight_2_title', 'text', 'Transhumance', 'Pépite 2 — titre', true),
  ('destinations-sardaigne-nuoro', 'highlight_2_description', 'textarea', 'Printemps.', 'Pépite 2 — description', true),
  ('destinations-sardaigne-nuoro', 'highlight_3_emoji', 'text', '🏘️', 'Pépite 3 — emoji', true),
  ('destinations-sardaigne-nuoro', 'highlight_3_title', 'text', 'Orgosolo', 'Pépite 3 — titre', true),
  ('destinations-sardaigne-nuoro', 'highlight_3_description', 'textarea', 'Village.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sicile-catane ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sicile-catane', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sicile-catane', 'intro_text', 'textarea', 'Catane, c''est au pied de l''Etna. Volcan, lave noire, cathedral baroque.', 'Texte d''introduction', true),
  ('destinations-sicile-catane', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sicile-catane', 'highlight_1_emoji', 'text', '🌋', 'Pépite 1 — emoji', true),
  ('destinations-sicile-catane', 'highlight_1_title', 'text', 'Etna', 'Pépite 1 — titre', true),
  ('destinations-sicile-catane', 'highlight_1_description', 'textarea', 'Volcan.', 'Pépite 1 — description', true),
  ('destinations-sicile-catane', 'highlight_2_emoji', 'text', '🏛️', 'Pépite 2 — emoji', true),
  ('destinations-sicile-catane', 'highlight_2_title', 'text', 'Duomo', 'Pépite 2 — titre', true),
  ('destinations-sicile-catane', 'highlight_2_description', 'textarea', 'Cathedrale.', 'Pépite 2 — description', true),
  ('destinations-sicile-catane', 'highlight_3_emoji', 'text', '♠️', 'Pépite 3 — emoji', true),
  ('destinations-sicile-catane', 'highlight_3_title', 'text', 'Marche', 'Pépite 3 — titre', true),
  ('destinations-sicile-catane', 'highlight_3_description', 'textarea', 'Poisson.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sicile-etoile ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sicile-etoile', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sicile-etoile', 'intro_text', 'textarea', 'Les Eoliennes, c''est le volcan sous la mer. Boue chaude, plages noires,Lipari, Salina.', 'Texte d''introduction', true),
  ('destinations-sicile-etoile', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sicile-etoile', 'highlight_1_emoji', 'text', '🌋', 'Pépite 1 — emoji', true),
  ('destinations-sicile-etoile', 'highlight_1_title', 'text', 'Vulcano', 'Pépite 1 — titre', true),
  ('destinations-sicile-etoile', 'highlight_1_description', 'textarea', 'Boue.', 'Pépite 1 — description', true),
  ('destinations-sicile-etoile', 'highlight_2_emoji', 'text', '🍷', 'Pépite 2 — emoji', true),
  ('destinations-sicile-etoile', 'highlight_2_title', 'text', 'Malvasia', 'Pépite 2 — titre', true),
  ('destinations-sicile-etoile', 'highlight_2_description', 'textarea', 'Vin.', 'Pépite 2 — description', true),
  ('destinations-sicile-etoile', 'highlight_3_emoji', 'text', '📍', 'Pépite 3 — emoji', true),
  ('destinations-sicile-etoile', 'highlight_3_title', 'text', 'Découvertes calmes', 'Pépite 3 — titre', true),
  ('destinations-sicile-etoile', 'highlight_3_description', 'textarea', 'Prendre le temps d''arpenter les ruelles et les recoins cachés.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sicile-palerme ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sicile-palerme', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sicile-palerme', 'intro_text', 'textarea', 'Palerme, c''est le chaos. Mais le bon. Les palais, les marches, la vraie Sicile.', 'Texte d''introduction', true),
  ('destinations-sicile-palerme', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sicile-palerme', 'highlight_1_emoji', 'text', '🏛️', 'Pépite 1 — emoji', true),
  ('destinations-sicile-palerme', 'highlight_1_title', 'text', 'Palazzo', 'Pépite 1 — titre', true),
  ('destinations-sicile-palerme', 'highlight_1_description', 'textarea', 'Normans.', 'Pépite 1 — description', true),
  ('destinations-sicile-palerme', 'highlight_2_emoji', 'text', '🍝', 'Pépite 2 — emoji', true),
  ('destinations-sicile-palerme', 'highlight_2_title', 'text', 'Capo', 'Pépite 2 — titre', true),
  ('destinations-sicile-palerme', 'highlight_2_description', 'textarea', 'Marche.', 'Pépite 2 — description', true),
  ('destinations-sicile-palerme', 'highlight_3_emoji', 'text', '🌺', 'Pépite 3 — emoji', true),
  ('destinations-sicile-palerme', 'highlight_3_title', 'text', 'Jardins', 'Pépite 3 — titre', true),
  ('destinations-sicile-palerme', 'highlight_3_description', 'textarea', 'Flora.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sicile-syracuse ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sicile-syracuse', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sicile-syracuse', 'intro_text', 'textarea', 'Syracuse, c''est la ville antique. Le temple, la cathedral, Ortigia.', 'Texte d''introduction', true),
  ('destinations-sicile-syracuse', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sicile-syracuse', 'highlight_1_emoji', 'text', '🏛️', 'Pépite 1 — emoji', true),
  ('destinations-sicile-syracuse', 'highlight_1_title', 'text', 'Temple', 'Pépite 1 — titre', true),
  ('destinations-sicile-syracuse', 'highlight_1_description', 'textarea', 'Apollo.', 'Pépite 1 — description', true),
  ('destinations-sicile-syracuse', 'highlight_2_emoji', 'text', '⌛', 'Pépite 2 — emoji', true),
  ('destinations-sicile-syracuse', 'highlight_2_title', 'text', 'Ortigia', 'Pépite 2 — titre', true),
  ('destinations-sicile-syracuse', 'highlight_2_description', 'textarea', 'Ile.', 'Pépite 2 — description', true),
  ('destinations-sicile-syracuse', 'highlight_3_emoji', 'text', '🍊', 'Pépite 3 — emoji', true),
  ('destinations-sicile-syracuse', 'highlight_3_title', 'text', 'Marche', 'Pépite 3 — titre', true),
  ('destinations-sicile-syracuse', 'highlight_3_description', 'textarea', 'Ortigia.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ─── destinations-sicile-taormine ────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-sicile-taormine', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-sicile-taormine', 'intro_text', 'textarea', 'Taormine, c''est le spot tourism. Le theatre grec avec vue sur la mer. Incredible.', 'Texte d''introduction', true),
  ('destinations-sicile-taormine', 'local_tip', 'textarea', 'Prends le temps de visiter les lieux d''intérêt en début de matinée et d''échanger avec les habitants pour dénicher les meilleures adresses de quartier.', 'Conseil local', true),
  ('destinations-sicile-taormine', 'highlight_1_emoji', 'text', '🏛️', 'Pépite 1 — emoji', true),
  ('destinations-sicile-taormine', 'highlight_1_title', 'text', 'Theatre', 'Pépite 1 — titre', true),
  ('destinations-sicile-taormine', 'highlight_1_description', 'textarea', 'Grec.', 'Pépite 1 — description', true),
  ('destinations-sicile-taormine', 'highlight_2_emoji', 'text', '🌊', 'Pépite 2 — emoji', true),
  ('destinations-sicile-taormine', 'highlight_2_title', 'text', 'Isola Bella', 'Pépite 2 — titre', true),
  ('destinations-sicile-taormine', 'highlight_2_description', 'textarea', 'Plage.', 'Pépite 2 — description', true),
  ('destinations-sicile-taormine', 'highlight_3_emoji', 'text', '🚌', 'Pépite 3 — emoji', true),
  ('destinations-sicile-taormine', 'highlight_3_title', 'text', 'Corvette', 'Pépite 3 — titre', true),
  ('destinations-sicile-taormine', 'highlight_3_description', 'textarea', 'Gare.', 'Pépite 3 — description', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
