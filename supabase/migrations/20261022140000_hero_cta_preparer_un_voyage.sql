-- Accueil : bouton et lien du hero alignés sur le menu
--
-- Le menu dit « Préparer un voyage » depuis 20261022120000_menu_cinq_entrees ;
-- le hero, juste dessous, disait encore « Planifier mon voyage → » et
-- « Lire les carnets → », en capitales espacées. EditableZone affiche la
-- valeur de la base telle quelle : changer le fallback de HomeClient.tsx ne
-- suffisait pas.
--
-- Valeurs d'origine relevées sur heldonica.fr le 22/10/2026 (espace simple
-- puis flèche U+2192). Idempotente : chaque WHERE porte sur la valeur exacte ;
-- une zone retouchée depuis le CMS n'est pas écrasée.

BEGIN;

UPDATE public.cms_editable_zones
SET value = 'Préparer un voyage', updated_at = now()
WHERE page = 'home' AND zone_key = 'hero_cta_1_label' AND value = 'Planifier mon voyage →';

UPDATE public.cms_editable_zones
SET value = 'Lire les carnets', updated_at = now()
WHERE page = 'home' AND zone_key = 'hero_cta_2_label' AND value = 'Lire les carnets →';

COMMIT;
