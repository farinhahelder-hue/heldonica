-- Accueil : harmonisation des 10 CTA de sections sur le style épuré du hero et du menu
-- Retrait de la flèche et de la casse haute pour une typographie apaisée et cohérente (#682).

BEGIN;

UPDATE public.cms_editable_zones
SET value = 'Lire le carnet', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_story_cta' AND value = 'Lire le carnet →';

UPDATE public.cms_editable_zones
SET value = 'Lire le carnet', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_featured_cta' AND value = 'Lire le carnet →';

UPDATE public.cms_editable_zones
SET value = 'Explorer toutes les destinations', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_destinations_cta' AND value = 'Explorer toutes les destinations →';

UPDATE public.cms_editable_zones
SET value = 'Voir tous les carnets', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_travel_cta' AND value = 'Voir tous les carnets →';

UPDATE public.cms_editable_zones
SET value = 'Voir toutes les pépites', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_food_cta' AND value = 'Voir toutes les pépites →';

UPDATE public.cms_editable_zones
SET value = 'Tout voir', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_latest_cta' AND value = 'Tout voir →';

UPDATE public.cms_editable_zones
SET value = 'Nous écrire', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_cta_btn_1' AND value = 'Nous écrire →';

UPDATE public.cms_editable_zones
SET value = 'Voir nos services', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_cta_btn_2' AND value = 'Voir nos services →';

UPDATE public.cms_editable_zones
SET value = 'Faire le quiz', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_quiz_cta' AND value = 'Faire le quiz →';

UPDATE public.cms_editable_zones
SET value = 'Découvrir l''accompagnement hôtelier', updated_at = now()
WHERE page = 'home' AND zone_key = 'section_b2b_cta' AND value = 'Découvrir l''accompagnement hôtelier →';

COMMIT;
