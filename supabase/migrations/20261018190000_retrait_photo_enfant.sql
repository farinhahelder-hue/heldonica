-- Retrait d'une photo d'enfant publiée par erreur
--
-- IMG_20260827_135834.jpg montre le visage d'un enfant en gros plan. Elle
-- servait d'image de couverture et de partage (article Grève, page Apuseni) et
-- figurait dans deux galeries. Règle du fondateur (18/10/2026) : on garde la
-- photo, mais aucune photo d'enfant en ligne.
--
-- Ces écritures ont été faites en urgence le 18/10 directement en base (règle
-- n°2 de AGENTS.md enfreinte pour couper l'exposition au plus vite) ; cette
-- migration les versionne. Le fichier a été déplacé hors SQL : copie dans le
-- bucket privé `prive/enfants/`, original du bucket public `media` supprimé.
--
-- Garde-fou : on ne touche que les lignes qui portent encore précisément cette
-- photo. Idempotent : sans effet une fois appliqué.

UPDATE public.cms_blog_posts
SET featured_image = NULL, updated_at = NOW()
WHERE featured_image LIKE '%/media/destinations/roumanie/IMG_20260827_135834.jpg';

UPDATE public.cms_blog_posts
SET og_image = NULL, updated_at = NOW()
WHERE og_image LIKE '%/media/destinations/roumanie/IMG_20260827_135834.jpg';

UPDATE public.cms_blog_posts
SET og_image_url = NULL, updated_at = NOW()
WHERE og_image_url LIKE '%/media/destinations/roumanie/IMG_20260827_135834.jpg';

UPDATE public.cms_editable_zones
SET value = '/og-default.jpg', updated_at = NOW()
WHERE page = 'destinations-roumanie-apuseni'
  AND zone_key = 'hero_image'
  AND value LIKE '%/media/destinations/roumanie/IMG_20260827_135834.jpg';

UPDATE public.destinations
SET gallery_images = array_remove(
      gallery_images,
      'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135834.jpg'
    )
WHERE 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135834.jpg' = ANY (gallery_images);

UPDATE public.cms_media
SET path = 'prive/enfants/IMG_20260827_135834.jpg',
    url = 'prive://enfants/IMG_20260827_135834.jpg',
    alt = 'PRIVÉE — photo d enfant, ne jamais publier (déplacée dans le stockage privé le 18/10/2026)'
WHERE id = 143
  AND path = 'destinations/roumanie/IMG_20260827_135834.jpg';
