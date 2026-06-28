-- ============================================================
-- HELDONICA — CORRECTIONS DONNÉES SUPABASE
-- Exécuter dans l'ordre
-- ============================================================

-- ============================================================
-- 1. CORRECTION EMAILS (contamination projet Monica Schneider)
-- ============================================================

-- Email contact principal
UPDATE site_settings
SET 
  value = 'info@heldonica.fr',
  updated_at = NOW()
WHERE key = 'contact_email' 
  AND (value = 'monica@happyhumans.ch' OR value LIKE '%monica%' OR value LIKE '%happyhumans%');

-- Confirmation
SELECT key, value FROM site_settings WHERE key = 'contact_email';

-- ============================================================
-- 2. CORRECTION DESCRIPTIONS SEO (anciens textes coaching)
-- ============================================================

-- Description SEO principale
UPDATE site_settings
SET 
  value = 'Slow travel vécu en duo, conçu pour vous. Carnets terrain, pépites vécues et voyages sur mesure écoresponsables en Europe.',
  updated_at = NOW()
WHERE key = 'seo_description'
  AND (value LIKE '%coaching%' OR value LIKE '%Monica%' OR value LIKE '%transformation%');

-- Meta description
UPDATE site_settings
SET 
  value = 'Blog slow travel et pépites dénichées hors des sentiers battus. Carnets de route, destinations authentiques et travel planning sur mesure écoresponsable.',
  updated_at = NOW()
WHERE key = 'seo_meta_description'
  AND (value LIKE '%coaching%' OR value LIKE '%Monica%');

-- Confirmation
SELECT key, value FROM site_settings WHERE key IN ('seo_description', 'seo_meta_description');

-- ============================================================
-- 3. CORRECTION TEXTE FOOTER
-- ============================================================

UPDATE site_settings
SET 
  value = 'Slow travel vécu en duo. Carnets de voyage & conception sur mesure écoresponsable.',
  updated_at = NOW()
WHERE key = 'footer_text'
  AND (value LIKE '%Coaching%' OR value LIKE '%Monica%' OR value LIKE '%transformation%');

-- Confirmation
SELECT key, value FROM site_settings WHERE key = 'footer_text';

-- ============================================================
-- 4. CORRECTION INSTAGRAM HANDLE
-- ============================================================

UPDATE site_settings
SET 
  value = '@heldonica',
  updated_at = NOW()
WHERE key = 'instagram_handle' 
  AND (value = '' OR value IS NULL);

UPDATE site_settings
SET 
  value = 'https://www.instagram.com/heldonica',
  updated_at = NOW()
WHERE key = 'instagram_url' 
  AND (value = '' OR value IS NULL);

-- Confirmation
SELECT key, value FROM site_settings WHERE key IN ('instagram_handle', 'instagram_url');

-- ============================================================
-- 5. CORRECTION LINKEDIN (supprimer référence Monica Schneider)
-- ============================================================

UPDATE site_settings
SET 
  value = '',
  updated_at = NOW()
WHERE key = 'linkedin_url'
  AND value LIKE '%monica-schneider%';

-- Confirmation
SELECT key, value FROM site_settings WHERE key = 'linkedin_url';

-- ============================================================
-- 6. VÉRIFICATION GÉNÉRALE
-- ============================================================

-- Liste de toutes les valeurs contenant des références problématiques
SELECT key, value 
FROM site_settings 
WHERE 
  value LIKE '%Monica%' 
  OR value LIKE '%Schneider%'
  OR value LIKE '%coaching%'
  OR value LIKE '%transformation%'
  OR value LIKE '%happy humans%'
  OR value LIKE '%happyhumans%'
  OR value LIKE '%mentorat%'
  OR value LIKE '%Happiness Design%';

-- ============================================================
-- 7. CORRECTIONS ARTICLES (si nécessaire)
-- ============================================================

-- Destination erronée : article Grèce avec destination Madère
-- D'abord identifier l'article
-- SELECT id, title, slug, destination FROM articles WHERE slug LIKE '%grece%' OR slug LIKE '%gr%C3%A8ce%';

-- Correction (décommenter si nécessaire)
-- UPDATE articles SET destination = 'Grèce' WHERE (slug LIKE '%grece%' OR slug LIKE '%gr%C3%A8ce%') AND destination = 'madere';

-- Compteurs à zéro : vérifier les catégories
-- SELECT category, COUNT(*) as count FROM articles WHERE published = true GROUP BY category;

-- ============================================================
-- 8. STATISTIQUES À JOUR
-- ============================================================

-- Mettre à jour le nombre de pays couverts
-- UPDATE site_settings SET value = '7', updated_at = NOW() WHERE key = 'covered_countries';

-- ============================================================
-- FIN DES CORRECTIONS
-- ============================================================