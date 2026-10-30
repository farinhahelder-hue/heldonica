-- Migration 20261030120000_depublier_articles_incoherents.sql
-- Mise en brouillon de deux articles publiés, décision du propriétaire du 2026-10-30.
--
-- Constat (mesure du 2026-10-30 sur le HTML réellement servi) : les trois seuls
-- articles publiés ne se valent pas.
--   · `bacalhau-gomes-sa-recette` — quatre fautes visibles (« déssalé »,
--     « éffóchées », « crème fraiche », « Island ») ;
--   · `poncha-recette-authentique` — deux fautes (« madeiréen », « sucrde ») et
--     un pronom « nous » sujet, banni par le guide de voix ;
--   · `podgorica-capitale-oubliee-montenegro` — carnet de terrain cohérent, adossé
--     à un vécu réel : CONSERVÉ publié.
--
-- Le propriétaire a demandé de mettre les articles incohérents EN BROUILLON, et
-- non de les supprimer. Cette migration ne fait donc que basculer deux drapeaux.
-- Aucun `DELETE`, aucune donnée perdue : le contenu reste éditable au CMS.
--
-- `published_at` est volontairement laissé intact : c'est l'historique de la
-- première mise en ligne, et le perdre nuirait à une future republication.
--
-- Le blog lit `published = true` (lib/blog-supabase.ts, `getAllPosts` et
-- `getPostBySlug`) : le drapeau suffit à retirer les pages du rendu et du
-- sitemap (app/sitemap.ts s'appuie sur `getAllPosts`).
--
-- Idempotente : ne touche que les lignes encore publiées. Rejouable sans effet.
--
-- Retour arrière : republier le slug voulu par une nouvelle migration versionnée
-- (`published = true, status = 'published'`).

UPDATE public.cms_blog_posts
SET published = false,
    status = 'draft',
    updated_at = now()
WHERE published = true
  AND slug IN (
    'bacalhau-gomes-sa-recette',
    'poncha-recette-authentique'
  );

-- Vérification : le blog doit désormais ne rendre qu'un seul article.
DO $$
DECLARE
  restants int;
BEGIN
  SELECT COUNT(*) INTO restants FROM public.cms_blog_posts WHERE published = true;
  IF restants <> 1 THEN
    RAISE WARNING 'Attendu 1 article publié après dépublication, trouvé %', restants;
  END IF;
END $$;
