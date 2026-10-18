-- Réconciliation des images cassées (base de production)
--
-- Contexte : un import de septembre 2026 (1595 lignes « gphotos » dans
-- cms_media) a laissé des références d'images sous deux formes fautives :
--
--   1. cms_media.url = '/images/<chemin>' alors que les fichiers ne sont pas
--      dans public/images/ mais dans le bucket Storage « media ».
--      → 157 URLs réparées vers leur URL publique Storage,
--      → 1441 lignes fantômes supprimées (ni fichier local, ni objet Storage :
--        elles servaient un soft-404 « text/html » avec un code 200),
--      → 3 lignes conservées (id 516, 521, 1049) : fichiers réels dans
--        public/images/destinations/montenegro/.
--
--   2. Visuels Unsplash supprimés côté Unsplash (HTTP 404), donc invisibles
--      (carte blanche ou image cassée) :
--      → destinations bari, pologne, corse, lisbonne : visuel retiré, l'image
--        de repli du site prend le relais,
--      → 14 articles de blog : image rétablie à partir des photos réelles du
--        coffre Storage (mêmes destinations), sauf
--        « lisbonne-ruelles-alfama-miradouros-azulejos » (aucune photo réelle
--        de Lisbonne au coffre → NULL, repli du site).
--
-- Idempotent : ré-exécutable sans effet sur une base déjà réconciliée.

-- ---------------------------------------------------------------------------
-- 1) cms_media : réparer les URLs locales vers l'objet Storage équivalent
-- ---------------------------------------------------------------------------
UPDATE cms_media
SET url = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/'
          || substring(url from 9)
WHERE url LIKE '/images/%'
  AND id NOT IN (516, 521, 1049)
  AND EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'media'
      AND o.name = substring(cms_media.url from 9)
  );

-- ---------------------------------------------------------------------------
-- 2) cms_media : supprimer les lignes fantômes (URL locale sans objet Storage)
-- ---------------------------------------------------------------------------
DELETE FROM cms_media m
WHERE m.url LIKE '/images/%'
  AND m.id NOT IN (516, 521, 1049)
  AND NOT EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'media'
      AND o.name = substring(m.url from 9)
  );

-- ---------------------------------------------------------------------------
-- 3) cms_blog_posts : rétablir les visuels à partir du coffre Storage
-- ---------------------------------------------------------------------------
UPDATE cms_blog_posts p
SET featured_image = v.img,
    og_image_url  = v.img,
    og_image      = v.img
FROM (VALUES
  ('bolo-do-caco-recette-traditionnelle-de-madere-3',        '/images/pudim-nata-madere.jpg'),
  ('prego-no-bolo-do-caco',                                  '/images/pudim-nata-madere.jpg'),
  ('madeire-4-jours-guide-anti-touristique',                 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/achadas_da_cruz.jpg'),
  ('pepites-mystiques-de-madere',                            'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/pico_do_arieiro.jpg'),
  ('madere-quand-partir-sur-lile-de-leternel-printemps',     'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/ponta_do_sol.jpg'),
  ('madere-slow-travel-guide',                               'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/ponta_do_sol.jpg'),
  ('madere-guide-complet',                                   'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/porto_moniz.jpg'),
  ('carnet-maderes-2025-2026',                               'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/porto_moniz.jpg'),
  ('foret-fanal-levadas-mystiques-madere-slow-travel',       'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/fanal_foret.jpg'),
  ('kotor-a-laube-remparts-venitiens-bouches-de-kotor',      'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/stara_varos.jpg'),
  ('podgorica-capitale-oubliee-montenegro',                  'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg'),
  ('cote-pastrovici-en-mer-falaises-criques-pleine-lune',    'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sipcanik_winery.jpg'),
  ('perazica-do-tunnels-falaise-baie-hotel-as',              'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/moraca_millennium.jpg'),
  ('carnet-suisse-stoos-2025',                               'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/blog-images/stoos-01.jpg')
) AS v(slug, img)
WHERE p.slug = v.slug
  AND (p.featured_image IS DISTINCT FROM v.img
       OR p.og_image_url IS DISTINCT FROM v.img
       OR p.og_image IS DISTINCT FROM v.img);

-- Article Lisbonne : aucune photo réelle au coffre → repli du site
UPDATE cms_blog_posts
SET featured_image = NULL,
    og_image_url   = NULL,
    og_image       = NULL
WHERE slug = 'lisbonne-ruelles-alfama-miradouros-azulejos'
  AND (featured_image LIKE '/images/%'
       OR featured_image LIKE 'https://images.unsplash.com/%');

-- ---------------------------------------------------------------------------
-- 4) destinations : visuels Unsplash (lus depuis travel_guides, vérifiés 200)
-- ---------------------------------------------------------------------------
UPDATE destinations
SET hero_unsplash_url = v.img
FROM (VALUES
  ('colombie', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1200&q=80'),
  ('sicile',   'https://images.unsplash.com/photo-1565626424178-c699f6601afd?w=1200&q=80'),
  ('paris',    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80')
) AS v(slug, img)
WHERE destinations.slug = v.slug;

-- Visuels Unsplash morts (404) → retirés, repli du site
UPDATE destinations
SET hero_unsplash_url = NULL
WHERE slug IN ('bari', 'pologne', 'corse', 'lisbonne')
  AND hero_unsplash_url LIKE 'https://images.unsplash.com/%';

-- ---------------------------------------------------------------------------
-- 5) travel_guides : couvertures Unsplash mortes (404) → retirées
-- ---------------------------------------------------------------------------
UPDATE travel_guides
SET cover_unsplash_url = NULL
WHERE destination_slug IN (
    'naples', 'corse', 'lisbonne', 'portugal',
    'malte', 'espagne', 'madere', 'montenegro'
  )
  AND cover_unsplash_url LIKE 'https://images.unsplash.com/%';
