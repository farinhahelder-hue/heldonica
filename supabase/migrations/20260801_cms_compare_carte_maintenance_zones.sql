-- ============================================================================
-- Page /maintenance : contenu piloté par le CMS
-- Date: 2026-08-01 — migrée manuellement
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('maintenance', 'title', 'text', 'On prépare quelque chose pour toi', 'Titre principal'),
  ('maintenance', 'message', 'textarea', 'On prépare quelque chose de nouveau pour toi. On revient très vite avec de nouvelles destinations et des pépites toutes fraîches.', 'Message de maintenance'),
  ('maintenance', 'feature_security', 'text', 'Données en sécurité', 'Pictogramme 1 — texte'),
  ('maintenance', 'feature_soon', 'text', 'Bientôt de retour', 'Pictogramme 2 — texte'),
  ('maintenance', 'cta_label', 'text', 'Nous suivre sur Instagram', 'Bouton Instagram'),
  ('maintenance', 'footer', 'text', 'Merci de ta patience 🌿', 'Bas de page')
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();

-- ============================================================================
-- Page /destinations/carte : contenu piloté par le CMS
-- Date: 2026-08-01 — migrée manuellement
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('destinations-carte', 'hero_eyebrow', 'text', 'Carte interactive', 'Surtitre du hero'),
  ('destinations-carte', 'hero_title', 'text', 'Explore nos destinations sur la carte', 'Titre du hero'),
  ('destinations-carte', 'hero_description', 'textarea', 'Clique sur les marqueurs pour découvrir chaque pépite, son atmosphère et son lien direct vers le guide complet.', 'Description du hero'),
  ('destinations-carte', 'filter_country', 'text', 'Pays', 'Filtre pays — libellé'),
  ('destinations-carte', 'filter_country_all', 'text', 'Tous les pays', 'Filtre pays — option par défaut'),
  ('destinations-carte', 'filter_region', 'text', 'Région', 'Filtre région — libellé'),
  ('destinations-carte', 'filter_region_all', 'text', 'Toutes régions', 'Filtre région — option par défaut'),
  ('destinations-carte', 'filter_category', 'text', 'Catégorie', 'Filtre catégorie — libellé'),
  ('destinations-carte', 'filter_category_all', 'text', 'Toutes catégories', 'Filtre catégorie — option par défaut'),
  ('destinations-carte', 'section_title', 'text', 'Nos destinations en un coup d''œil', 'Titre de la liste rapide'),
  ('destinations-carte', 'cta_title', 'text', 'Tu veux un itinéraire sur mesure ?', 'Titre de la section CTA'),
  ('destinations-carte', 'cta_description', 'textarea', 'On transforme tes contraintes en carnet de voyage concret, avec destinations testées et séquence logique.', 'Description de la section CTA'),
  ('destinations-carte', 'cta_label', 'text', 'Créer mon voyage →', 'Bouton CTA')
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
