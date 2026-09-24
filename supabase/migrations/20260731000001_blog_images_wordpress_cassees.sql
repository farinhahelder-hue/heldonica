-- ============================================================================
-- cms_blog_posts : neutraliser les images WordPress devenues inaccessibles
-- Date: 2026-07-31
-- ============================================================================
-- Ces articles pointent vers l'ancienne installation WordPress
-- (heldonica.fr/wp-content/uploads/...). Ces URL ne repondent plus :
--
--   GET https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg
--     -> 307 vers www.heldonica.fr/wp-content/... -> 403
--   Rendu par next/image : HTTP 502
--
-- Consequence en production : image d'en-tete cassee sur les articles publies.
-- Verifie sur /blog/madere-guide-complet (HTTP 200, image 502).
--
-- On vide ces references pour que le fallback s'applique au lieu d'afficher une
-- image rompue. Les URL d'origine sont conservees ci-dessous : le nom de fichier
-- permet de retrouver la photo et de la re-televerser dans Supabase.
--
-- ⚠️ Aucune image de remplacement n'est inventee. Ces articles afficheront le
-- visuel par defaut tant que de vraies photos n'auront pas ete deposees.

-- published roumanie-villages-caches
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg
--     og_image_url = https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg
-- draft     guide-pratique-comment-debuter-le-slow-travel-en-duo
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg
--     og_image_url = https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg
-- draft     pepites-mystiques-de-madere
--     featured_image = https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg
-- draft     bolo-do-caco-recette-traditionnelle-de-madere-3
--     featured_image = https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg
--     og_image_url = https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg
-- draft     ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg
--     og_image_url = https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg
-- published flotter-sur-la-limmat-zurich-aventure
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/09/zurich-limmat-ete-3-1024x681.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2025/09/zurich-limmat-ete-3-1024x681.jpg
--     og_image_url = https://heldonica.fr/wp-content/uploads/2025/09/zurich-limmat-ete-3-1024x681.jpg
-- draft     cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg
-- draft     quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg
--     og_image_url = https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg
-- published stoos-ridge-notre-aventure-sur-la-crete-panoramique
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg
--     og_image_url = https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg
-- published madere-slow-travel-guide
--     featured_image = https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg
--     og_image_url = https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg
-- draft     zurich
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg
-- draft     prego-no-bolo-do-caco
--     featured_image = https://heldonica.fr/wp-content/uploads/2025/10/prego-bolo-caco-683x1024.jpg
-- published madere-guide-complet
--     featured_image = https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg
--     og_image = https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg

UPDATE public.cms_blog_posts
SET featured_image = NULL, updated_at = NOW()
WHERE featured_image LIKE '%wp-content/uploads%';

UPDATE public.cms_blog_posts
SET og_image = NULL, updated_at = NOW()
WHERE og_image LIKE '%wp-content/uploads%';

UPDATE public.cms_blog_posts
SET og_image_url = NULL, updated_at = NOW()
WHERE og_image_url LIKE '%wp-content/uploads%';

-- ─── Verification (lecture seule) ───────────────────────────────────────────

SELECT count(*) AS restant_wp FROM public.cms_blog_posts
WHERE featured_image LIKE '%wp-content%' OR og_image LIKE '%wp-content%' OR og_image_url LIKE '%wp-content%';

SELECT status, count(*) AS sans_image FROM public.cms_blog_posts
WHERE coalesce(btrim(featured_image), '') = '' GROUP BY status ORDER BY status;
