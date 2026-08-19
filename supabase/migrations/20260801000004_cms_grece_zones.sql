-- ============================================================================
-- Page /destinations/grece : contenu piloté par le CMS
-- Date: 2026-08-01 — migrée manuellement
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-grece', 'hero_image', 'image', '/og-default.jpg', 'Image du hero', true),
  ('destinations-grece', 'hero_eyebrow', 'text', '🏛️ Grèce — Bientôt', 'Surtitre du hero', true),
  ('destinations-grece', 'hero_title', 'text', 'Grèce', 'Titre du hero', true),
  ('destinations-grece', 'hero_teaser', 'textarea', 'Archipels discrets, chapelles blanchies à la chaux, tavernes de port où personne ne parle anglais. La Grèce qu''on prépare, c''est celle d''avant les foules.', 'Accroche du hero', true),
  ('destinations-grece', 'style_label', 'text', 'Slow culture', 'Style de voyage', true),
  ('destinations-grece', 'best_season', 'text', 'Avril – juin · Septembre – octobre', 'Meilleure saison', true),
  ('destinations-grece', 'section_title', 'text', 'On prépare le guide grèce — à notre façon.', 'Titre de la section newsletter', true),
  ('destinations-grece', 'section_text', 'textarea', 'On arpente les ruelles, on teste les adresses, on sélectionne ce qu''on referait vraiment. Laisse-nous ton email et tu seras le premier averti — avant qu''on publie quoi que ce soit ailleurs.', 'Texte de la section newsletter', true),
  ('destinations-grece', 'back_link', 'text', '← Voir toutes nos destinations', 'Lien retour aux destinations', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
