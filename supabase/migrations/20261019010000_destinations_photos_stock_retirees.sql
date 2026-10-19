-- Destinations : on retire les photos de stock qui ne montrent pas leur sujet
--
-- Vues sur /destinations (captures du 19/10/2026) : un corgi pour Colombie,
-- un bâtiment de béton pour la Sicile, le Colisée pour Naples, un pot de miel
-- pour l'Espagne, une image abstraite violette pour Malte. Règle fondatrice :
-- rien d'inventé, aucune photo incohérente en ligne. La carte affiche alors une
-- tuile neutre (drapeau) jusqu'à ce qu'une vraie photo soit validée.
-- Anciennes valeurs (hero_unsplash_url), pour pouvoir revenir en arrière :
--   colombie  photo-1537151608828-ea2b11777ee8
--   sicile    photo-1565626424178-c699f6601afd
--   naples    photo-1555992828-ca4dbe41d294
--   espagne   photo-1558642452-9d2a7deb7f62
--   malte     photo-1555448248-2571daf6344b
-- Idempotent.

UPDATE public.destinations
SET hero_unsplash_url = NULL, updated_at = NOW()
WHERE slug IN ('colombie', 'sicile', 'naples', 'espagne', 'malte')
  AND hero_unsplash_url LIKE 'https://images.unsplash.com/%';
