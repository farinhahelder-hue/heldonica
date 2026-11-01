-- Migration 20261030180000_purge_refs_images_generees.sql
-- Purge définitive des références résiduelles aux visuels générés par IA (Monténégro)
-- dans les colonnes featured_image et hero_unsplash_url de la table public.destinations.
-- Règle n°1 : On n'invente rien.

UPDATE public.destinations
SET featured_image = 'https://www.heldonica.fr/images/destinations/montenegro/petrovac_mer.jpg'
WHERE featured_image LIKE '%sahat_kula%'
   OR featured_image LIKE '%sipcanik_winery%'
   OR featured_image LIKE '%stara_varos%'
   OR featured_image LIKE '%moraca_millennium%';

UPDATE public.destinations
SET hero_unsplash_url = featured_image
WHERE featured_image LIKE '%montenegro%'
  AND (hero_unsplash_url LIKE '%sahat_kula%'
    OR hero_unsplash_url LIKE '%sipcanik_winery%'
    OR hero_unsplash_url LIKE '%stara_varos%'
    OR hero_unsplash_url LIKE '%moraca_millennium%');
