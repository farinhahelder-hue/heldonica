-- ============================================================================
-- cms_blog_posts : image WordPress morte dans le CORPS d'un article publié
-- Date: 2026-08-01
-- ============================================================================
-- La migration 20260731_blog_images_wordpress_cassees.sql a traité les colonnes
-- featured_image / og_image / og_image_url. Il restait un cas non couvert : une
-- balise <img> écrite en dur dans le HTML de l'article.
--
--   /blog/check-list-pour-randonnee-en-famille-en-montagne  (publié)
--   <img class="wp-block-cover__image-background wp-image-44 size-large" alt=""
--        src="https://heldonica.fr/wp-content/uploads/2025/07/featured-image-4-1024x1024.jpg"
--        data-object-fit="cover"/>
--
--   GET sur cette URL : 307 -> 403. L'image s'affiche donc cassée chez le
--   visiteur, sur un article publié.
--
-- Il s'agit du fond décoratif d'un bloc `wp-block-cover`. Le bloc conserve son
-- overlay et son texte sans elle : on retire la seule balise morte, sans toucher
-- au reste de la prose.
--
-- ⚠️ Aucune image de remplacement n'est inventée.

UPDATE public.cms_blog_posts
SET content = regexp_replace(
      content,
      '<img[^>]*wp-content/uploads[^>]*/?>',
      '',
      'g'
    ),
    updated_at = NOW()
WHERE content LIKE '%wp-content/uploads%';


-- ─── Vérification (lecture seule) ───────────────────────────────────────────

SELECT count(*) AS articles_avec_image_wp
FROM public.cms_blog_posts
WHERE content LIKE '%wp-content/uploads%';
