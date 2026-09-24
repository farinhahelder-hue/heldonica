-- ===========================================================================
-- cms_blog_posts.source : autoriser la valeur 'mobile'
--
-- La contrainte n'admettait que 'manual' et 'takeout' — releve empiriquement,
-- sa definition ne figure dans aucune migration du depot : elle a ete posee
-- hors du suivi, comme d'autres modifications de ce schema.
--
-- /api/cms/mobile-publish ecrit 'mobile'. Chaque envoi depuis l'application
-- echouait donc apres avoir televerse ses photos :
--
--   new row for relation "cms_blog_posts" violates check constraint
--   "cms_blog_posts_source_check"
--
-- Idempotente.
-- ===========================================================================

ALTER TABLE public.cms_blog_posts
  DROP CONSTRAINT IF EXISTS cms_blog_posts_source_check;

ALTER TABLE public.cms_blog_posts
  ADD CONSTRAINT cms_blog_posts_source_check
  CHECK (source IN ('manual', 'takeout', 'mobile'));
