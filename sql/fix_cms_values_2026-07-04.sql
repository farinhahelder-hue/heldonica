-- ============================================================================
-- Script de correction CMS — Heldonica
-- Date : 4 juillet 2026
-- Objectif : Corriger les valeurs CMS après audit
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. CORRIGER LES LIENS EXPERT-HÔTELIER DANS /START
-- -----------------------------------------------------------------------------

-- Supprimer le lien "Expertise hôtelière B2B" de /start (link_5)
DELETE FROM site_content 
WHERE page = 'start' 
AND block_key IN ('link_5_label', 'link_5_desc');

-- -----------------------------------------------------------------------------
-- 2. CORRIGER LES ACCENTS DANS LA NEWSLETTER
-- -----------------------------------------------------------------------------

UPDATE site_content 
SET value = 'Reçois les pépites avant les autres',
    updated_at = NOW()
WHERE key = 'newsletter_title' 
OR (page = 'home' AND block_key = 'newsletter_title');

UPDATE site_content 
SET value = 'Chaque semaine : un lieu qu''on a aimé, un conseil qu''on aurait aimé avoir avant, et parfois un avant-goût de ce qu''on prépare. Pas de spam, jamais.',
    updated_at = NOW()
WHERE key = 'newsletter_desc'
OR (page = 'home' AND block_key = 'newsletter_desc');

-- -----------------------------------------------------------------------------
-- 3. CORRIGER LES ACCENTS DANS LE FOOTER
-- -----------------------------------------------------------------------------

UPDATE site_content 
SET value = 'Mentions légales',
    updated_at = NOW()
WHERE key = 'footer_legal_item_1_label'
OR (page = 'footer' AND block_key = 'footer_legal_item_1_label');

UPDATE site_content 
SET value = 'Politique de confidentialité',
    updated_at = NOW()
WHERE key = 'footer_legal_item_2_label'
OR (page = 'footer' AND block_key = 'footer_legal_item_2_label');

UPDATE site_content 
SET value = '© 2026 Heldonica. Tous droits réservés.',
    updated_at = NOW()
WHERE key = 'footer_text'
OR (page = 'footer' AND block_key = 'footer_copyright');

UPDATE site_content 
SET value = 'Légal',
    updated_at = NOW()
WHERE key = 'legal_footer_title'
OR (page = 'footer' AND block_key = 'legal_footer_title');

UPDATE site_content 
SET value = 'Écrire à Heldonica',
    updated_at = NOW()
WHERE key = 'footer_cta_label'
OR (page = 'footer' AND block_key = 'footer_cta_label');

-- -----------------------------------------------------------------------------
-- 4. CORRIGER LA NAVIGATION HEADER
-- -----------------------------------------------------------------------------

UPDATE site_settings 
SET value = '/nos-services',
    updated_at = NOW()
WHERE key = 'nav_item_5_url';

UPDATE site_settings 
SET value = 'Services',
    updated_at = NOW()
WHERE key = 'nav_item_5_label';

-- -----------------------------------------------------------------------------
-- 5. CORRIGER LA NAVIGATION FOOTER FALLBACK
-- -----------------------------------------------------------------------------

-- Note: Les valeurs du footer sont dans NAV_LABEL_FALLBACKS et NAV_URL_FALLBACKS
-- dans le code (components/Footer.tsx) - ces corrections sont déjà appliquées
-- dans le code source. Les valeurs CMS peuvent aussi être mises à jour :

UPDATE site_settings 
SET value = '/nos-services',
    updated_at = NOW()
WHERE key = 'nav_item_5_url';

-- -----------------------------------------------------------------------------
-- 6. VÉRIFICATION
-- -----------------------------------------------------------------------------

-- Vérifier les valeurs mises à jour
SELECT 'site_content - newsletter_title' as check_name, value 
FROM site_content 
WHERE key = 'newsletter_title' OR block_key = 'newsletter_title'
LIMIT 5;

SELECT 'site_content - legal items' as check_name, block_key, value 
FROM site_content 
WHERE block_key LIKE '%legal%'
LIMIT 10;

SELECT 'site_settings - nav' as check_name, key, value 
FROM site_settings 
WHERE key LIKE '%nav_item_5%'
LIMIT 5;

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
