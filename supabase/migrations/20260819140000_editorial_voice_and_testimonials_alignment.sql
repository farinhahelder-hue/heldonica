-- ============================================================================
-- Migration: 20260819140000_editorial_voice_and_testimonials_alignment.sql
-- Description:
--   1. Désactivation des faux témoignages de démonstration (intégrité E-E-A-T)
--   2. Harmonisation de la voix de marque sur les zones CMS (Home & Hôteliers)
--   3. Purge des mots bannis résiduels dans les pages piliers
-- ============================================================================

-- 1. Désactiver les témoignages fictifs de démonstration
-- La page /temoignages affichera son message authentique d'attente de vrais retours.
UPDATE cms_testimonials
SET is_active = false
WHERE is_active = true;

-- 2. Aligner les zones CMS Home et Espace Hôteliers sur la voix officielle (Brief 2026)
UPDATE cms_editable_zones
SET value = 'Deux voyageurs, dix ans de terrain, des destinations qu''on a vraiment arpentées — pas lu dans un guide.'
WHERE page = 'home' AND zone_key = 'hero_tagline';

UPDATE cms_editable_zones
SET value = 'Planifier mon voyage →'
WHERE page = 'home' AND zone_key = 'hero_cta_1_label';

UPDATE cms_editable_zones
SET value = 'Lire les carnets →'
WHERE page = 'home' AND zone_key = 'hero_cta_2_label';

UPDATE cms_editable_zones
SET value = 'Vous gérez un hébergement de charme ?<br /><em class=''text-eucalyptus''>Faites vivre l''expérience slow travel</em>'
WHERE page = 'home' AND zone_key = 'section_b2b_title';

UPDATE cms_editable_zones
SET value = 'Maison d''hôtes, gîte insolite ou hôtel indépendant : on vous aide à valoriser votre ancrage, préserver votre marge directe et attirer des voyageurs slow travel.'
WHERE page = 'home' AND zone_key = 'section_b2b_text';

UPDATE cms_editable_zones
SET value = 'Découvrir l''accompagnement hôtelier →'
WHERE page = 'home' AND zone_key = 'section_b2b_cta';

UPDATE cms_editable_zones
SET value = 'On vous accompagne pas à pas pour développer vos réservations directes et valoriser votre ancrage territorial.'
WHERE page = 'expert-hotelier' AND zone_key = 'section_solution_subtitle';

UPDATE cms_editable_zones
SET value = 'On analyse votre présence en ligne, votre parcours de réservation et votre potentiel d''attractivité slow travel pour vous proposer un plan d''action sur mesure.'
WHERE page = 'expert-hotelier' AND zone_key = 'audit_text';
