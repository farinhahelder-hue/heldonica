-- ============================================================================
-- Script de correction CMS — Heldonica v2
-- Date : 4 juillet 2026
-- IMPORTANT : Utilise la bonne structure de tables
-- ============================================================================

-- -----------------------------------------------------------------------------
-- TABLE site_settings : colonnes (key, value, updated_at)
-- TABLE cms_editable_zones : colonnes (page, zone_key, value, is_active)
-- TABLE site_content : colonnes (page, block_key, value, updated_at)
-- -----------------------------------------------------------------------------

-- 1. PREMIÈREMENT : Vérifier la structure des tables
-- -----------------------------------------------------------------------------
SELECT '=== site_settings ===' as info;
SELECT key, value FROM site_settings ORDER BY key LIMIT 20;

SELECT '=== cms_editable_zones (sample) ===' as info;
SELECT page, zone_key, value FROM cms_editable_zones LIMIT 10;

-- -----------------------------------------------------------------------------
-- 2. CORRIGER site_settings (navigation, footer, etc.)
-- -----------------------------------------------------------------------------

-- Navigation header item 5 : /expert-hotelier → /nos-services
UPDATE site_settings SET value = '/nos-services', updated_at = NOW() WHERE key = 'nav_item_5_url';
UPDATE site_settings SET value = 'Services', updated_at = NOW() WHERE key = 'nav_item_5_label';

-- Footer copyright
UPDATE site_settings SET value = '© 2026 Heldonica. Tous droits réservés.', updated_at = NOW() WHERE key = 'footer_text';
UPDATE site_settings SET value = 'contact@heldonica.fr', updated_at = NOW() WHERE key = 'contact_email';

-- -----------------------------------------------------------------------------
-- 3. CORRIGER cms_editable_zones (contenu éditorial)
-- -----------------------------------------------------------------------------

-- Newsletter title
UPDATE cms_editable_zones SET value = 'Reçois les pépites avant les autres' WHERE zone_key = 'newsletter_title';

-- Newsletter description  
UPDATE cms_editable_zones SET value = 'Chaque semaine : un lieu qu''on a aimé, un conseil qu''on aurait aimé avoir avant, et parfois un avant-goût de ce qu''on prépare. Pas de spam, jamais.' WHERE zone_key = 'newsletter_desc';

-- Footer legal items
UPDATE cms_editable_zones SET value = 'Mentions légales' WHERE zone_key = 'footer_legal_item_1_label';
UPDATE cms_editable_zones SET value = 'Politique de confidentialité' WHERE zone_key = 'footer_legal_item_2_label';
UPDATE cms_editable_zones SET value = 'Légal' WHERE zone_key = 'legal_footer_title';
UPDATE cms_editable_zones SET value = 'Écrire à Heldonica' WHERE zone_key = 'footer_cta_label';

-- Footer newsletter
UPDATE cms_editable_zones SET value = 'Reçois les pépites avant les autres' WHERE zone_key = 'newsletter_title';
UPDATE cms_editable_zones SET value = 'Chaque semaine : un lieu qu''on a aimé, un conseil qu''on aurait aimé avoir avant, et parfois un avant-goût de ce qu''on prépare. Pas de spam, jamais.' WHERE zone_key = 'newsletter_desc';

-- -----------------------------------------------------------------------------
-- 4. CORRIGER site_content (si utilisé)
-- -----------------------------------------------------------------------------

-- Nota: Vérifier d'abord si site_content existe et sa structure
-- UPDATE site_content SET value = 'À propos' WHERE block_key = 'link_5_label';

-- -----------------------------------------------------------------------------
-- 5. VÉRIFICATION FINALE
-- -----------------------------------------------------------------------------

SELECT '=== site_settings (nav items) ===' as info;
SELECT key, value FROM site_settings WHERE key LIKE '%nav_item%' OR key LIKE '%footer%';

SELECT '=== cms_editable_zones (newsletter, legal) ===' as info;
SELECT page, zone_key, value FROM cms_editable_zones WHERE zone_key LIKE '%newsletter%' OR zone_key LIKE '%legal%' OR zone_key LIKE '%footer_%';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
