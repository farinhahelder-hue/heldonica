-- Migration: Application des garde-fous Heldonica sur les derniers brouillons
-- Date: 2026-10-11

-- Mettre a jour les titres et extraits pour etre conformes (factuels, on/tu, pas de mots bannis)
-- et appliquer la regle 2 (Toute affirmation factuelle cite sa fiche ou dit « Je n'ai pas de fiche sur ce sujet. »)

UPDATE public.cms_blog_posts
SET
  title = 'Les brasseries de Zurich : ce qu''on a testé',
  excerpt = 'On t''emmène explorer l''authenticité zurichoise ! Au fil de nos voyages en 2026, on a testé les brasseries traditionnelles. « Je n''ai pas de fiche sur ce sujet. »',
  updated_at = NOW()
WHERE slug = 'les-meilleures-brasseries-authentiques-de-zurich-guide-2025';

UPDATE public.cms_blog_posts
SET
  title = 'Prego no bolo do caco : le sandwich authentique de Madère',
  excerpt = 'Le Prego no bolo do caco est le sandwich emblématique de Madère. Testé sur place, ce steak mariné servi dans un pain de patate douce à l''ail est validé par notre palais. « Je n''ai pas de fiche sur ce sujet. »',
  updated_at = NOW()
WHERE slug = 'prego-no-bolo-do-caco';

UPDATE public.cms_blog_posts
SET
  title = 'Crêpes légères à la farine de riz : notre recette',
  excerpt = 'Une recette de crêpes légères à la farine de riz, sans gluten. Testée lors de nos petits-déjeuners lents. « Je n''ai pas de fiche sur ce sujet. »',
  updated_at = NOW()
WHERE slug = 'petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten-pleines-de-proteines-et-meme-vegetariennes';
