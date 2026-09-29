-- Migration: align drafts editorial voice and photo evidence
-- 1. Stoos Ridge (id=31) : éliminer le mot banni "inoubliable" -> "marquante"
-- 2. Roumanie Itinéraire (id=119) : rattacher la photo réelle de terrain (IMG_20260827_135618.jpg)
-- 3. Madère Carnet (id=120) : rattacher l'image de couverture
-- 4. Timișoara CuiB d'Arte (id=9) : rattacher la photo mobile de Timișoara et aligner les pronoms (nous -> on)
-- 5. Zurich Brasseries (id=4) : harmoniser l'extrait avec la voix Heldonica (on/tu + E-E-A-T)

-- 1. Stoos Ridge (id=31)
UPDATE public.cms_blog_posts
SET content = REPLACE(content, 'tout rendu inoubliable', 'rendu la traversée si marquante'),
    updated_at = now()
WHERE id = 31;

-- 2. Roumanie Itinéraire (id=119)
UPDATE public.cms_blog_posts
SET featured_image = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135618.jpg',
    og_image_url = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135618.jpg',
    updated_at = now()
WHERE id = 119;

-- 3. Madère Carnet (id=120)
UPDATE public.cms_blog_posts
SET featured_image = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
    og_image_url = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
    updated_at = now()
WHERE id = 120;

-- 4. Timișoara CuiB d'Arte (id=9)
UPDATE public.cms_blog_posts
SET featured_image = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/mobile/1788552928863-yeye7e-heldonica_7812946419314841504.jpg',
    og_image_url = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/mobile/1788552928863-yeye7e-heldonica_7812946419314841504.jpg',
    content = REPLACE(
      REPLACE(content, 'nous ne pouvons que vous encourager', 'on ne peut que t''encourager'),
      'nous prenons un plaisir immense', 'on prend un plaisir immense'
    ),
    updated_at = now()
WHERE id = 9;

-- 5. Zurich Brasseries (id=4)
UPDATE public.cms_blog_posts
SET excerpt = 'On t''emmène explorer l''authenticité zurichoise ! Au fil de nos voyages en 2026, on a testé les brasseries traditionnelles où se mêlent histoire, saveurs locales et ambiance chaleureuse. Voici notre carnet d''adresses sur le terrain.',
    updated_at = now()
WHERE id = 4;
