-- Backup et suppression table legacy articles (48 lignes, sync depuis cms_blog_posts)
-- Issue #448: articles (8 usages) vs cms_blog_posts (74 usages) — source de vérité cms_blog_posts
-- Backup d'abord, puis suppression. Rollback: restaurer depuis backup_articles_20260915

-- Backup
CREATE TABLE IF NOT EXISTS backup_articles_20260915 AS SELECT * FROM public.articles;

-- Vérification: les deux tables doivent avoir même nombre de lignes (48)
DO $$
DECLARE
  cnt_articles int;
  cnt_cms int;
BEGIN
  SELECT COUNT(*) INTO cnt_articles FROM public.articles;
  SELECT COUNT(*) INTO cnt_cms FROM public.cms_blog_posts;
  IF cnt_articles != cnt_cms THEN
    RAISE WARNING 'Comptes différents: articles=% cms_blog_posts=% — vérifier avant DROP', cnt_articles, cnt_cms;
  END IF;
END $$;

-- Suppression legacy (après migration des 8 usages vers cms_blog_posts dans le code)
-- DROP TABLE public.articles; -- décommenter après validation que plus aucun code ne lit articles
-- Pour l'instant on garde la table mais on la vide pour tester: on ne la supprime qu'après 7 jours
-- Option: la laisser vide pour que les 8 usages restants retournent 0 et forcent la migration côté code
