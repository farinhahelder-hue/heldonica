-- Blog : 4 articles Roumanie en brouillon (photos répétées)
--
-- Les 5 articles Roumanie publiés utilisaient des vues quasi identiques du même
-- point de vue des Apuseni (dont deux le même fichier, IMG_20260827_135025).
-- Décision du fondateur (19/10/2026) : on garde l'itinéraire de référence
-- `itineraire-slow-travel-roumanie-bucarest-apuseni` et on met les 4 autres en
-- brouillon, jusqu'à ce qu'une photo propre à chacun soit validée.
-- published_at conservé : remise en ligne à l'identique.
-- Garde-fou : seulement s'ils sont encore publiés. Idempotent.

UPDATE public.cms_blog_posts
SET status = 'draft', published = false, updated_at = NOW()
WHERE status = 'published'
  AND slug IN (
    'maramures-roumanie-authentique',
    'maramures-train-moitie-siecle',
    'roumanie-villages-caches',
    'maramures-aube-portes-bois'
  );
