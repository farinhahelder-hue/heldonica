-- Deux libellés CMS à corriger, relevés en ligne le 22/10/2026
--
-- 1. destinations-alentejo / hero_badge = 'Sparkle'
--    Régression de 20261021120000_retrait_emojis_icones_zones_cms (#667) :
--    l'emoji '✦' y a été remplacé par un nom d'icône lucide, mais la page
--    Alentejo rend ce badge comme du texte (app/destinations/alentejo/page.tsx,
--    Z('hero_badge', 'text', …)). En ligne, le hero affichait « SPARKLE ».
--    On remet le libellé de repli du composant : « Carnet de terrain ».
--
-- 2. cta_button_1 = 'Planifier mon voyage' (gabarit SubDestinationTemplate)
--    Le menu et l'accueil disent « Préparer un voyage » depuis #681 et #682 :
--    une même action, un seul nom. Toutes les pages qui portent cette valeur
--    exacte sont concernées ; le fallback du gabarit change dans le même commit.
--
-- Idempotente : chaque WHERE porte sur la valeur exacte d'origine ; une zone
-- retouchée depuis le CMS n'est pas écrasée.

BEGIN;

UPDATE public.cms_editable_zones
SET value = 'Carnet de terrain', updated_at = now()
WHERE page = 'destinations-alentejo' AND zone_key = 'hero_badge' AND value = 'Sparkle';

UPDATE public.cms_editable_zones
SET value = 'Préparer un voyage', updated_at = now()
WHERE zone_key = 'cta_button_1' AND value = 'Planifier mon voyage';

COMMIT;
