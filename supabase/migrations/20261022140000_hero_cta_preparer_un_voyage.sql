-- Accueil : bouton du hero aligné sur celui du menu
--
-- Le menu dit « Préparer un voyage » depuis 20261022120000_menu_cinq_entrees ;
-- le hero, juste dessous, disait encore « Planifier mon voyage → », en
-- capitales espacées. EditableZone affiche la valeur de la base telle quelle :
-- changer le fallback de HomeClient.tsx ne suffisait pas.
--
-- Valeur d'origine relevée sur heldonica.fr le 22/10/2026 (espace simple puis
-- flèche U+2192). Idempotente : le WHERE porte sur la valeur exacte ; une zone
-- retouchée depuis le CMS n'est pas écrasée.

UPDATE public.cms_editable_zones
SET value = 'Préparer un voyage', updated_at = now()
WHERE page = 'home' AND zone_key = 'hero_cta_1_label' AND value = 'Planifier mon voyage →';
