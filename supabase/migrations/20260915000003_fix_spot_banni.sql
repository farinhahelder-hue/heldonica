-- Fix mot banni "spot" dans titre public (canal-saint-martin-spots-secrets)
-- Remplace "spots" par "pépites" (lexique Heldonica)
UPDATE public.cms_blog_posts
SET title = 'Canal Saint-Martin : les 5 pépites méconnues',
    updated_at = now()
WHERE slug = 'canal-saint-martin-spots-secrets' AND title = 'Canal Saint-Martin : les 5 spots méconnus';
