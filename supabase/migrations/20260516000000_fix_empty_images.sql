-- Fix empty or incoherent placeholder images in blog posts
UPDATE cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2938&auto=format&fit=crop'
WHERE featured_image IS NULL
   OR featured_image = ''
   OR featured_image LIKE '%placeholder%';

-- Fix empty or incoherent placeholder images in destinations
UPDATE cms_destinations
SET featured_image = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2938&auto=format&fit=crop'
WHERE featured_image IS NULL
   OR featured_image = ''
   OR featured_image LIKE '%placeholder%';
