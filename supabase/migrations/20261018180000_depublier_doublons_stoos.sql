-- ============================================================================
-- Migration: 20261018180000_depublier_doublons_stoos.sql
-- Description:
--   Remet en brouillon les 2 doublons Stoos Ridge re-devenus publics.
--
--   Ce n'est PAS une décision nouvelle : la migration du 28/07/2026
--   (20260728000001_dedupe_stoos_ridge_articles.sql) avait déjà fait
--   exactement cela, et `middleware.ts` redirige déjà en 301 les anciens slugs
--   vers l'article canonique. Cette migration restaure l'état voulu.
--
--   Ce qui est constaté (2026-10-18, lecture seule de la base) :
--
--     slug                                              statut      MAJ
--     stoos-ridge-notre-aventure-sur-la-crete-panoramique  published  10-03 16:23  <- canonique
--     stoos-ridge-coucher-soleil-traversee-funiculaire     published  10-03 16:23  <- doublon
--     stoos-ridge-notre-aventure-crete-panoramique         published  10-03 16:23  <- doublon
--     stoos-ridge-la-crete-pano                            draft      08-19 00:31
--
--   Les 3 lignes `published` portent le même `updated_at`, à la minute près :
--   2026-10-03T16:23. Ce n'est pas une coïncidence — un même geste a republié
--   le canonique et ses 2 doublons, annulant la dépublication du 28/07.
--   Aucune migration ne porte cette date : l'écriture est passée hors migration.
--
--   Cause racine, plus précise : les 2 doublons portent
--   `published_at = 2026-09-29T23:22`, alors que le canonique a gardé le sien
--   (2025-08-01). Ce soir-là, 44 articles ont été modifiés en une seule fois —
--   c'est une opération de publication en masse qui a réactivé les 2 doublons.
--   Ils n'ont pas de `scheduled_published_at` : la route /api/cms/publish-scheduled
--   n'est donc pas en cause, et le mécanisme reste à identifier par le propriétaire
--   (publication depuis le CMS, script, ou action manuelle groupée).
--
--   Cette migration corrige l'état ; elle ne supprime pas la cause. Si une
--   opération de masse repasse, les 2 doublons reviendront. À surveiller.
--
--   Preuves en ligne (2026-10-18) : les 3 slugs figurent dans le sitemap et
--   sont liés depuis la home et /blog — 3 cartes pour la même randonnée.
--
--   L'article conservé est le canonique, désigné comme tel par la migration du
--   28/07 et par les 301 de `middleware.ts`. C'est aussi le plus complet :
--   7 693 caractères, 1 067 mots, 7 titres de section, FAQ, image de couverture.
--   Les 2 autres (3 922 et 5 777 caractères) passent en brouillon : ils restent
--   en base pour l'historique, et les redirections 301 continuent de fonctionner.
--
--   Réversible : `status = 'published', published = true` sur les 2 slugs.
-- ============================================================================

-- getAllPosts() (lib/blog-supabase.ts) filtre sur `published = true`, pas sur
-- `status` : les deux colonnes doivent basculer pour que la carte disparaisse
-- réellement de /blog et de la home.
UPDATE cms_blog_posts
SET status = 'draft', published = false, updated_at = NOW()
WHERE slug IN (
  'stoos-ridge-coucher-soleil-traversee-funiculaire',
  'stoos-ridge-notre-aventure-crete-panoramique'
);

-- Contrôle : un seul article Stoos doit rester publié.
DO $$
DECLARE
  publies integer;
BEGIN
  SELECT count(*) INTO publies
  FROM cms_blog_posts
  WHERE slug LIKE 'stoos%' AND published = true;

  IF publies <> 1 THEN
    RAISE EXCEPTION 'Attendu 1 article Stoos publié, trouvé %.', publies;
  END IF;

  RAISE NOTICE 'OK : 1 seul article Stoos publié (le canonique).';
END $$;
