UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80'
WHERE slug = 'rues-cachees-paris-rue-temple';

UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80'
WHERE slug = 'bacalhau-gomes-sa-recette';

UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1518063319409-5a5ab0db509d?w=800&q=80'
WHERE slug = 'bacalhau-a-lagareiro';

UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80'
WHERE slug = 'pepites-mystiques-de-madere';

UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1627883262624-9b0d6ab62f83?w=800&q=80'
WHERE slug = 'prego-no-bolo-do-caco';

UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1554900984-7833a6976694?w=800&q=80'
WHERE slug = 'flotter-sur-la-limmat-a-zurich-notre-aventure-dete';

UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
WHERE slug = 'stoos-ridge-notre-aventure-sur-la-crete-panoramique';

UPDATE cms_blog_posts
SET title = 'Stoos Ridge : La crête panoramique'
WHERE title = 'Stoos Ridge : La crete pano';

UPDATE cms_blog_posts
SET excerpt = replace(excerpt, '1700m daltitude', '1700m d''altitude'),
    content = replace(content, '1700m daltitude', '1700m d''altitude');

UPDATE cms_blog_posts
SET featured = true
WHERE slug IN ('madeire-guide-complet', 'rues-cachees-paris-rue-temple')
  AND published = true;

UPDATE cms_settings
SET settings = replace(settings, 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/blog-images/stoos-01.jpg', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80')
WHERE settings LIKE '%stoos-01.jpg%';
