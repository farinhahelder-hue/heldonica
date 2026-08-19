-- CMS 3.0 Zone Corrections - Heldonica Content
-- Fixes content that was incorrectly set from Monica Schneider / Happy Humans coaching project
-- Execute this migration AFTER running 20260629_cms_editable_zones.sql

-- HOME page updates
UPDATE cms_editable_zones SET value = 'Helder & Monica' WHERE page = 'home' AND zone_key = 'section_about_title';
UPDATE cms_editable_zones SET value = 'Un couple, deux regards, une passion commune pour le voyage lent et authentique.' WHERE page = 'home' AND zone_key = 'section_about_text';
UPDATE cms_editable_zones SET value = 'Nos carnets de voyage' WHERE page = 'home' AND zone_key = 'newsletter_title';
UPDATE cms_editable_zones SET value = 'Reçois nos pépites dénichées, itinéraires hors sentiers et conseils slow travel directement dans ta boîte mail.' WHERE page = 'home' AND zone_key = 'newsletter_subtitle';
UPDATE cms_editable_zones SET value = 'Un accompagnement voyage sur mesure' WHERE page = 'home' AND zone_key = 'services_title';
UPDATE cms_editable_zones SET value = 'Que tu prépares un voyage en couple hors des sentiers battus ou que tu gères un établissement hôtelier, on a la pépite qu''il te faut.' WHERE page = 'home' AND zone_key = 'services_subtitle';

-- A-PROPOS page updates
UPDATE cms_editable_zones SET value = 'Helder & Monica — deux explorateurs, une vision' WHERE page = 'a-propos' AND zone_key = 'page_title';
UPDATE cms_editable_zones SET value = 'Une aventure née de notre amour du voyage lent, de la rencontre authentique et des joyaux cachés.' WHERE page = 'a-propos' AND zone_key = 'intro_text';
UPDATE cms_editable_zones SET value = 'Notre histoire' WHERE page = 'a-propos' AND zone_key = 'bio_title';
UPDATE cms_editable_zones SET value = 'Voyageurs en couple depuis 10+ ans, on a troqué les circuits touristiques contre les pépites dénichées, les hôtels sans âme contre les adresses vécues. Heldonica, c''est notre carnet de route partagé.' WHERE page = 'a-propos' AND zone_key = 'bio_text';
UPDATE cms_editable_zones SET value = 'Ce qui guide nos voyages' WHERE page = 'a-propos' AND zone_key = 'valeurs_title';
UPDATE cms_editable_zones SET value = 'Authenticité, slow travel, écoresponsabilité, plénitude et déconnexion vraie.' WHERE page = 'a-propos' AND zone_key = 'valeurs_text';

-- CONTACT page updates
UPDATE cms_editable_zones SET value = 'On est là' WHERE page = 'contact' AND zone_key = 'page_title';
UPDATE cms_editable_zones SET value = 'Une question sur notre Travel Planning sur mesure ? Envie de collaborer ? Écris-nous.' WHERE page = 'contact' AND zone_key = 'intro_text';

-- MENTIONS LÉGALES
UPDATE cms_editable_zones SET value = 'Heldonica — contact@heldonica.fr' WHERE page = 'mentions-legales' AND zone_key = 'content';

-- POLITIQUE DE CONFIDENTIALITÉ  
UPDATE cms_editable_zones SET value = 'Les données collectées via les formulaires sont utilisées uniquement pour répondre à vos demandes et ne sont pas partagées avec des tiers.' WHERE page = 'politique-confidentialite' AND zone_key = 'content';

-- Disable non-Heldonica pages (coaching, relations, temoignages, entreprises)
UPDATE cms_editable_zones SET is_active = false WHERE page IN ('coaching', 'relations', 'temoignages', 'entreprises');
