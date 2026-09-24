-- ================================================
-- MAINTENANCE MODE - ACTIVER/DÉSACTIVER
-- ================================================

-- ACTIVER LA MAINTENANCE (redirige vers /maintenance)
UPDATE site_settings 
SET value = 'true', updated_at = NOW() 
WHERE key = 'maintenance_mode';

-- DÉSACTIVER LA MAINTENANCE (site accessible)
UPDATE site_settings 
SET value = 'false', updated_at = NOW() 
WHERE key = 'maintenance_mode';

-- VÉRIFIER LE STATUT ACTUEL
SELECT key, value, updated_at FROM site_settings WHERE key = 'maintenance_mode';
