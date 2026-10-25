-- Migration 20261025160000_og_guide_madere.sql
-- Lot 2 : image de partage du guide « Top 10 pépites de Madère ».
--
-- État avant : la zone vaut '/og-default.jpg' (image générique), donc le partage
-- social de cette page publiée et indexable ne montre pas Madère.
-- `buildPageMetadata` lit la zone et prime sur le repli codé en dur, donc une
-- seule ligne suffit.
--
-- Photo retenue : Pico do Arieiro (pépite n°5 du guide, « Miradouro Pico do
-- Arieiro »). C'est un lieu réellement présent dans l'article, et une vue de
-- crête au-dessus de la mer de nuages reste lisible réduite en 1200x630.
-- Alternative, à une ligne près : 'porto_moniz' (pépite n°3, piscines naturelles).
-- `fanal_foret` est écarté : Fanal n'est pas l'une des 10 pépites du guide.
--
-- Retour arrière :
--   UPDATE public.cms_editable_zones SET value = '/og-default.jpg', updated_at = NOW()
--   WHERE page = 'guides-top-10-pepites-madere' AND zone_key = 'seo_og_image';

UPDATE public.cms_editable_zones
SET value = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/pico_do_arieiro.jpg',
    updated_at = NOW()
WHERE page = 'guides-top-10-pepites-madere'
  AND zone_key = 'seo_og_image';
