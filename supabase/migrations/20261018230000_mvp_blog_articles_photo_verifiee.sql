-- MVP : seuls les articles dont la photo a été vérifiée restent en ligne
--
-- Décision du fondateur (18/10/2026) : « mettre en brouillon pour trancher plus
-- tard, faire un MVP avec le travel planning et les meilleurs articles avec photos ».
-- Planche de contrôle (chaque photo regardée) : 13 articles ont une photo cohérente
-- et restent publiés. Les 13 suivants passent en brouillon jusqu'à décision :
--   « à confirmer » (photo douteuse ou rendu de banque d'images) : Madère ×5, Kotor,
--     rue Mouffetard, Cuib d'Arte, guide du duo, train Mocănița ;
--   sans vraie photo : Lisbonne, Grève ;
--   non contrôlé : carnet Madère 2025-2026.
-- published_at conservé : remise en ligne à l'identique.
-- Garde-fou : seuls les articles encore publiés. Idempotent.

UPDATE public.cms_blog_posts
SET status = 'draft', published = false, updated_at = NOW()
WHERE status = 'published'
  AND slug IN (
    'madeire-4-jours-guide-anti-touristique',
    'ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature',
    'cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine',
    'pepites-mystiques-de-madere',
    'madere-quand-partir-sur-lile-de-leternel-printemps',
    'madere-slow-travel-guide',
    'guide-pratique-comment-debuter-le-slow-travel-en-duo',
    'madere-guide-complet',
    'kotor-a-laube-remparts-venitiens-bouches-de-kotor',
    'train-mocanita-maramures',
    'lisbonne-ruelles-alfama-miradouros-azulejos',
    'greve-reserve-naturelle-suisse',
    'carnet-maderes-2025-2026'
  );
