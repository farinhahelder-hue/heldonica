-- ============================================================================
-- Page /guides : contenu piloté par le CMS
-- Date: 2026-08-01 — généré par scripts/generate-guides-cms.mjs
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('guides', 'hero_eyebrow', 'text', 'Guides & Pépites', 'Surtitre du hero'),
  ('guides', 'hero_title', 'text', 'Ce qu''on n''a pas mis sur le blog.', 'Titre du hero'),
  ('guides', 'hero_description', 'textarea', 'Des guides pratiques terrain — avec les vraies adresses, les vraies distances, les vraies erreurs à éviter.', 'Description du hero'),
  ('guides', 'guide_1_emoji', 'text', '🌿', 'Guide 1 — emoji'),
  ('guides', 'guide_1_destination', 'text', 'Madère', 'Guide 1 — destination'),
  ('guides', 'guide_1_title', 'text', 'Les 10 pépites de Madère qu''on ne te dit pas', 'Guide 1 — titre'),
  ('guides', 'guide_1_description', 'textarea', 'Les adresses dénichées sur le terrain, les sentiers hors des cartes et les tables familiales que les guides touristiques ignorent.', 'Guide 1 — description'),
  ('guides', 'cta_text', 'textarea', 'D''autres guides en préparation — laisse-nous ton email pour être prévenu.', 'Texte de la section basse')
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
