-- MVP : destinations sans photo vérifiée
--
-- Décision du fondateur (19/10/2026) : une photo de stock ou absente ne reste
-- pas en ligne.
--   - colombie, lisbonne, sicile : sans photo -> « Bientôt » (section
--     Prochainement, non cliquables), jusqu'à une vraie photo.
--   - paris : photo de stock (tour Eiffel) -> brouillon.
--   - montenegro : la photo de stock (baie de Kotor) passait avant sa propre
--     image ; on retire le stock et on prend la couverture de l'article
--     publié et validé (Podgorica, tour de l'Horloge). L'ancienne
--     featured_image (moraca_millennium.jpg) a un rendu retouché/généré : écartée.
-- Ancien hero_unsplash_url de montenegro : photo-1672225460441-6eb1561fc977
--                      de paris          : photo-1502602898657-3e91760cbb34
-- Idempotent.

UPDATE public.destinations
SET status = 'coming_soon', published = false, updated_at = NOW()
WHERE slug IN ('colombie', 'lisbonne', 'sicile') AND status = 'published';

UPDATE public.destinations
SET status = 'draft', published = false, updated_at = NOW()
WHERE slug = 'paris' AND status = 'published';

UPDATE public.destinations
SET hero_unsplash_url = NULL,
    featured_image = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    updated_at = NOW()
WHERE slug = 'montenegro';
