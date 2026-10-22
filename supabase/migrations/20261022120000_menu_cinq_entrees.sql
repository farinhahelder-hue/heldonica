-- Menu principal : cinq entrées en français, un seul bouton (lot 1 « moins IA »)
--
-- POURQUOI UNE MIGRATION ET PAS SEULEMENT LE COMPOSANT
-- Header.tsx lit le menu dans les zones `nav_item_<n>_label` / `_url` de la page
-- `global` ; la liste codée en dur ne sert que si la base n'en a aucune. En
-- ligne, la base porte sept entrées (Accueil, Destinations, Blog, Travel
-- Planning, Consulting hôtelier, Contact, À propos) : corriger le composant
-- seul ne changeait rien à l'écran.
--
-- CE QUE FAIT CETTE MIGRATION
--   1. Réécrit les cinq premiers emplacements :
--        Carnets · Destinations · Voyager avec nous · Le duo · Hôteliers
--   2. Désactive les emplacements 6 et 7 (Contact, À propos) : le logo ramène
--      à l'accueil, Contact reste dans le pied de page et le menu mobile.
--   3. Libellé du bouton : « Planifier mon voyage » → « Préparer un voyage ».
--
-- Valeurs d'origine relevées sur heldonica.fr le 22/10/2026.
-- Idempotente : chaque WHERE porte sur la valeur exacte d'origine ; une zone
-- déjà modifiée à la main depuis le CMS n'est pas écrasée.

BEGIN;

-- 1. Accueil (/) → Carnets (/blog)
UPDATE cms_editable_zones SET value = 'Carnets', updated_at = now()
 WHERE page = 'global' AND zone_key = 'nav_item_1_label' AND value = 'Accueil';
UPDATE cms_editable_zones SET value = '/blog', updated_at = now()
 WHERE page = 'global' AND zone_key = 'nav_item_1_url' AND value = '/';

-- 2. Destinations : inchangé

-- 3. Blog (/blog) → Voyager avec nous (/travel-planning)
UPDATE cms_editable_zones SET value = 'Voyager avec nous', updated_at = now()
 WHERE page = 'global' AND zone_key = 'nav_item_3_label' AND value = 'Blog';
UPDATE cms_editable_zones SET value = '/travel-planning', updated_at = now()
 WHERE page = 'global' AND zone_key = 'nav_item_3_url' AND value = '/blog';

-- 4. Travel Planning (/travel-planning) → Le duo (/a-propos)
UPDATE cms_editable_zones SET value = 'Le duo', updated_at = now()
 WHERE page = 'global' AND zone_key = 'nav_item_4_label' AND value = 'Travel Planning';
UPDATE cms_editable_zones SET value = '/a-propos', updated_at = now()
 WHERE page = 'global' AND zone_key = 'nav_item_4_url' AND value = '/travel-planning';

-- 5. Consulting hôtelier → Hôteliers (même URL /expert-hotelier)
UPDATE cms_editable_zones SET value = 'Hôteliers', updated_at = now()
 WHERE page = 'global' AND zone_key = 'nav_item_5_label' AND value = 'Consulting hôtelier';

-- 6 et 7. Contact, À propos : retirés du menu principal
UPDATE cms_editable_zones SET is_active = false, updated_at = now()
 WHERE page = 'global' AND is_active = true
   AND (   (zone_key IN ('nav_item_6_label', 'nav_item_6_url') AND value IN ('Contact', '/contact'))
        OR (zone_key IN ('nav_item_7_label', 'nav_item_7_url') AND value IN ('À propos', '/a-propos')));

-- Bouton du menu
UPDATE cms_editable_zones SET value = 'Préparer un voyage', updated_at = now()
 WHERE page = 'global' AND zone_key = 'header_cta_label' AND value = 'Planifier mon voyage';

COMMIT;
