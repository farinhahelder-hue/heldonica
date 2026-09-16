-- ==============================================================================
-- 20260916140000_enable_pgvector_and_embeddings.sql
-- Active pgvector, ajoute les colonnes vectorielles 768 dimensions (Gemini)
-- et définit les fonctions RPC de recherche sémantique par similarité cosinus.
-- ==============================================================================

-- 1. Activation de l'extension vector (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Ajout de la colonne vector(768) pour destinations et cms_blog_posts
ALTER TABLE public.destinations 
ADD COLUMN IF NOT EXISTS embedding vector(768);

ALTER TABLE public.cms_blog_posts 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Index IVFFLAT pour accélération des recherches par similarité cosinus
-- (Note : ivfflat nécessite qu'il y ait des lignes pour construire les listes, sinon création sans filtre)
CREATE INDEX IF NOT EXISTS destinations_embedding_idx 
ON public.destinations 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 10);

CREATE INDEX IF NOT EXISTS cms_blog_posts_embedding_idx 
ON public.cms_blog_posts 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 10);

-- 4. Fonction RPC : Recherche sémantique dans les destinations
CREATE OR REPLACE FUNCTION public.match_destinations (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  country text,
  region text,
  excerpt text,
  intro_narrative text,
  travel_style text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.slug,
    d.title,
    d.country,
    d.region,
    d.excerpt,
    d.intro_narrative,
    d.travel_style,
    (1 - (d.embedding <=> query_embedding))::float AS similarity
  FROM public.destinations d
  WHERE d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) >= match_threshold
  ORDER BY d.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- 5. Fonction RPC : Recherche sémantique dans les articles de blog
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
    AND (1 - (p.embedding <=> query_embedding)) >= match_threshold
  ORDER BY p.embedding <=> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- Permissions d'exécution
GRANT EXECUTE ON FUNCTION public.match_destinations(vector, float, int) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.match_articles(vector, float, int) TO authenticated, anon, service_role;
