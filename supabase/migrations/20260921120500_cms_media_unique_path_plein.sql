-- L'index partiel de la migration précédente ne satisfait pas ON CONFLICT :
-- PostgREST n'ajoute pas le prédicat WHERE à la cible de conflit, et
-- PostgreSQL répond encore 42P10 (mesuré juste après l'application). Un index
-- unique plein convient : les NULL y sont distincts entre eux.
DROP INDEX IF EXISTS public.cms_media_path_key;
CREATE UNIQUE INDEX cms_media_path_key ON public.cms_media (path);
