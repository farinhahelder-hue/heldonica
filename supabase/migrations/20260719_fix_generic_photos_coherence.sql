-- ============================================================
-- HELDONICA — Fix: remplacer photos génériques Unsplash
-- Problème : ~15 articles utilisent une photo générique
-- (photo-1501785888041-af3ef285b470) ou partagent la même
-- photo Unsplash sans rapport avec le contenu.
--
-- Correctifs :
--  - 7 articles utilisant le fallback générique "Carnets Voyage"
--  - 5 articles Madère partageant la même photo paysage
--  - Doublons Zurich, Stoos, etc.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. ARTICLES AVEC FALLBACK GÉNÉRIQUE (1501785888041)
--    Remplacés par des photos pertinentes
-- ──────────────────────────────────────────────────────────────

-- #1 bacalhau-a-lagareiro : paysage générique → morue portugaise
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'bacalhau-a-lagareiro';

-- #2 bacalhau-gomes-sa-recette : paysage générique → morue
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'bacalhau-gomes-sa-recette';

-- #3 cuib-darte-a-timisoara : paysage générique → cour Timișoara (photo terrain)
UPDATE cms_blog_posts
SET featured_image = 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
    og_image = 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
    updated_at = NOW()
WHERE slug = 'cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine';

-- #4 voix-heldonica-manifeste : paysage générique → écriture/carnet
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'voix-heldonica-manifeste';

-- #5 maramures-aube-portes-bois : paysage générique → église bois Maramures
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1600100395204-67b500ee1b87?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1600100395204-67b500ee1b87?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'maramures-aube-portes-bois';

-- #6 podgorica-capitale-oubliee-montenegro : paysage générique → Monténégro
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1555990793-da11153b6e8d?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'podgorica-capitale-oubliee-montenegro';

-- #7 poncha-recette-authentique : paysage générique → poncha (boisson dorée, citron, miel)
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1624487394217-6d192d003564?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1624487394217-6d192d003564?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'poncha-recette-authentique';

-- ──────────────────────────────────────────────────────────────
-- 2. ARTICLES MADÈRE : diversifier les 5 articles partageant
--    la même photo (1630061945673)
-- ──────────────────────────────────────────────────────────────

-- #8 madere-guide-complet → forêt Madère (photo terrain)
UPDATE cms_blog_posts
SET featured_image = 'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
    og_image = 'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
    updated_at = NOW()
WHERE slug = 'madere-guide-complet';

-- #9 pepites-mystiques-de-madere → cascade Madère (photo terrain)
UPDATE cms_blog_posts
SET featured_image = 'https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg',
    og_image = 'https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg',
    updated_at = NOW()
WHERE slug = 'pepites-mystiques-de-madere';

-- #10 madere-quand-partir → côte Madère
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1775676143321-ca3fc08916ba?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1775676143321-ca3fc08916ba?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'madere-quand-partir-sur-lile-de-leternel-printemps';

-- #11 madeire-4-jours-guide-anti-touristique → levier/montagne Madère
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1734631621470-d7eebf4d164b?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1734631621470-d7eebf4d164b?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'madeire-4-jours-guide-anti-touristique';

-- #12 madere-en-mars → paysage Madère brumeux
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=1200&q=80',
    og_image = 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=1200&q=80',
    updated_at = NOW()
WHERE slug = 'madere-en-mars';

-- ──────────────────────────────────────────────────────────────
-- 3. AUTRES DOUBLONS À DIVERSIFIER
-- ──────────────────────────────────────────────────────────────

-- #13 zurich : même photo que les-meilleures-brasseries → diversifier
UPDATE cms_blog_posts
SET featured_image = 'https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg',
    og_image = 'https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg',
    updated_at = NOW()
WHERE slug = 'zurich';

-- #14 les-meilleures-brasseries : garde sa photo Zurich actuelle (1620563092215)
-- déjà OK, pas de changement

-- #15 stoos-ridge-la-crete-pano : garde sa photo stoos-04.jpg
-- déjà OK (Supabase Storage)

-- #16 stoos-ridge-notre-aventure-crete-panoramique : Unsplash montagne → garde
-- déjà OK

-- #17 stoos-ridge-notre-aventure-sur-la-crete-panoramique : a déjà photo terrain
-- déjà OK

-- ──────────────────────────────────────────────────────────────
-- 4. VÉRIFICATION
-- ──────────────────────────────────────────────────────────────

SELECT
  slug,
  title,
  SUBSTRING(featured_image, 1, 100) AS featured_image_preview,
  SUBSTRING(og_image, 1, 100) AS og_image_preview
FROM cms_blog_posts
WHERE slug IN (
  'bacalhau-a-lagareiro',
  'bacalhau-gomes-sa-recette',
  'cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine',
  'voix-heldonica-manifeste',
  'maramures-aube-portes-bois',
  'podgorica-capitale-oubliee-montenegro',
  'poncha-recette-authentique',
  'madere-guide-complet',
  'pepites-mystiques-de-madere',
  'madere-quand-partir-sur-lile-de-leternel-printemps',
  'madeire-4-jours-guide-anti-touristique',
  'madere-en-mars',
  'zurich'
)
ORDER BY slug;
