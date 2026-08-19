-- ============================================================================
-- Migration: 20260819160000_go_live_editorial_and_seo_cleanup.sql
-- Description:
--   1. Passer en brouillon (published = false) les ébauches vides
--   2. Purger les 4 articles de test de la table legacy 'articles'
--   3. Optimiser les seo_title (> 60 caractères) pour le référencement naturel
--   4. Renseigner les images de couverture pour les articles publiés
-- ============================================================================

-- 1. Passer en brouillon les 9 ébauches ou articles incomplets
UPDATE cms_blog_posts
SET published = false
WHERE slug IN (
  'roumanie-villages-caches',
  'slow-travel-retour',
  'maramures-roumanie-authentique',
  'podgorica-capitale-oubliee-montenegro',
  'madere-en-mars',
  'voix-heldonica-manifeste',
  'lisbonne-72h-sans-touristes',
  'bacalhau-a-lagareiro',
  'bolo-do-caco-recette-traditionnelle-de-madere-3'
);

-- 2. Purger les 4 articles de test de la table legacy 'articles'
DELETE FROM articles
WHERE slug IN (
  'test-article-for-cms-validation',
  'test-article-3-stoos-ridge',
  'test-article-1-madere-decouverte',
  'test-article-2-zurich-flotte'
);

-- 3. Optimiser les meta-titres SEO (tous <= 60 caractères pour Google)
UPDATE cms_blog_posts SET seo_title = 'Lieux secrets de Madère : pépites mystiques hors sentiers' WHERE slug = 'pepites-mystiques-de-madere';
UPDATE cms_blog_posts SET seo_title = 'Petite Ceinture Paris 14e : balade insolite et street art' WHERE slug = 'quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014';
UPDATE cms_blog_posts SET seo_title = 'Bacalhau à Gomes de Sá : recette traditionnelle portugaise' WHERE slug = 'bacalhau-gomes-sa-recette';
UPDATE cms_blog_posts SET seo_title = 'Roumanie : villages cachés hors des guides touristiques' WHERE slug = 'roumanie-villages-caches';
UPDATE cms_blog_posts SET seo_title = 'Podgorica : carnet de route sur la capitale du Monténégro' WHERE slug = 'podgorica-capitale-oubliee-montenegro';
UPDATE cms_blog_posts SET seo_title = 'Stoos Ridge en couple : crête panoramique Alpes suisses' WHERE slug = 'stoos-ridge-notre-aventure-crete-panoramique';
UPDATE cms_blog_posts SET seo_title = 'Crêpes légères farine de riz sans gluten — Recette maison' WHERE slug = 'petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten-pleines-de-proteines-et-meme-vegetariennes';
UPDATE cms_blog_posts SET seo_title = 'Lisbonne en 72h sans les foules : adresses slow travel' WHERE slug = 'lisbonne-72h-sans-touristes';
UPDATE cms_blog_posts SET seo_title = 'Petite Ceinture Paris : balade sur l''ancienne voie ferrée' WHERE slug = 'petite-ceinture-paris-balade-urbaine';
UPDATE cms_blog_posts SET seo_title = 'Bucarest cachée : Art Nouveau, tables secrètes et street art' WHERE slug = 'bucarest-hidden-surprend';
UPDATE cms_blog_posts SET seo_title = 'Stoos Ridge au coucher du soleil : traversée en crête' WHERE slug = 'stoos-ridge-coucher-soleil-traversee-funiculaire';
UPDATE cms_blog_posts SET seo_title = 'Pudim de Nata : la recette authentique de Madère' WHERE slug = 'pudim-de-nata-recette';
UPDATE cms_blog_posts SET seo_title = 'Crêpes légères sans gluten à la farine de riz' WHERE slug = 'petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten';
UPDATE cms_blog_posts SET seo_title = 'Le Marais caché : rue du Temple entre artisans et histoire' WHERE slug = 'rues-cachees-paris-rue-temple';

-- 4. Renseigner les images de couverture pour les articles publiés
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80' WHERE slug = 'pepites-mystiques-de-madere';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80' WHERE slug = 'bolo-do-caco-recette-traditionnelle-de-madere-3';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=1200&q=80' WHERE slug = 'madeire-4-jours-guide-anti-touristique';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=1200&q=80' WHERE slug = 'maramures-aube-portes-bois';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80' WHERE slug = 'stoos-ridge-notre-aventure-crete-panoramique';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80' WHERE slug = 'zurich';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80' WHERE slug = 'urbex-paris-safe';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80' WHERE slug = 'guide-pratique-comment-debuter-le-slow-travel-en-duo';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80' WHERE slug = 'train-mocanita-maramures';
UPDATE cms_blog_posts SET featured_image = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80', og_image = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80' WHERE slug = 'madere-guide-complet';
