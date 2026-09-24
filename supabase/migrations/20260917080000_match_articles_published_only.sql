-- match_articles ne renvoyait que des lignes avec embedding, publiées ou non,
-- et la fonction est exécutable par anon : titres et extraits des 26 brouillons
-- lisibles avec la clé publique. Mesuré le 17/09 (rpc match_articles → un
-- brouillon « Maramureș » en 2e position). Les agents lisent les brouillons par
-- les routes CMS authentifiées, pas par la recherche.

CREATE OR REPLACE FUNCTION public.match_articles (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  slug text,
  title text,
  excerpt text,
  category text,
  tags text[],
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.slug,
    p.title,
    p.excerpt,
    p.category,
    p.tags,
    (1 - (p.embedding <=> query_embedding))::float AS similarity
  FROM public.cms_blog_posts p
  WHERE p.embedding IS NOT NULL
    AND p.published = true
    AND (1 - (p.embedding <=> query_embedding)) >= match_threshold
  ORDER BY p.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;
