-- Restauration des polices éditoriales (Playfair Display + DM Sans),
-- nettoyage des icônes corrompues en UTF-8 dans site_settings, et alignement
-- des territoires d'accueil (cms_home_destinations) sur les seules
-- destinations publiées avec photo vérifiée.
-- Idempotent.

UPDATE public.site_settings
SET value = 'Playfair Display', updated_at = NOW()
WHERE key = 'font_heading'
  AND value IN ('Fraunces', 'Fraunces Variable', '');

UPDATE public.site_settings
SET value = 'DM Sans', updated_at = NOW()
WHERE key = 'font_body'
  AND value IN ('Source Sans 3', 'Source+Sans+3', '');

UPDATE public.site_settings
SET value = '🌿', updated_at = NOW()
WHERE key = 'pillar_2_icon'
  AND value LIKE '% replacement %' OR (key = 'pillar_2_icon' AND value = '');

UPDATE public.site_settings
SET value = '🤝', updated_at = NOW()
WHERE key = 'pillar_3_icon'
  AND value = '';

-- Désactiver sur l'accueil les destinations en « Bientôt » sans photo vérifiée
UPDATE public.cms_home_destinations
SET is_active = false, updated_at = NOW()
WHERE slug IN ('zurich', 'suisse', 'sicile', 'colombie', 'paris', 'lisbonne')
  AND is_active = true;
