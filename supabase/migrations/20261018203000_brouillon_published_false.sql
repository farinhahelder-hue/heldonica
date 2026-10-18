-- Correctif de 20261018200000_brouillon_articles_photo_fausse.sql
--
-- cms_blog_posts porte deux indicateurs de publication : `status` (lu par les
-- pages du blog) et `published` (lu par plusieurs routes : recherche IA, API
-- destinations, flux n8n, audit…). La migration précédente n'a basculé que
-- `status` : les 12 articles avaient disparu des pages mais restaient
-- `published = true` pour ces routes. Les 16 brouillons existants ont tous
-- `published = false` ; on aligne les 12.
--
-- Garde-fou : seuls les brouillons encore marqués publiés. Idempotent.

UPDATE public.cms_blog_posts
SET published = false, updated_at = NOW()
WHERE status = 'draft'
  AND published = true
  AND slug IN (
    'petrovac-na-moru-sentier-pins-criques-forteresse',
    'quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014',
    'perazica-do-tunnels-falaise-baie-hotel-as',
    'prego-no-bolo-do-caco',
    'stoos-ridge-notre-aventure-sur-la-crete-panoramique',
    'cote-pastrovici-en-mer-falaises-criques-pleine-lune',
    'bacalhau-a-lagareiro',
    'flotter-sur-la-limmat-zurich-aventure',
    'les-meilleures-brasseries-authentiques-de-zurich-guide-2026',
    'urbex-paris-safe',
    'petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten',
    'rues-cachees-paris-rue-temple'
  );
