-- Migration 20261030200000_purge_images_ia_en_base.sql
-- Purge des références résiduelles aux visuels générés par IA, là où la
-- migration 20261030180000_purge_refs_images_generees.sql ne les a pas vues.
--
-- Constat (mesures du 2026-10-30 sur la base réelle) : la purge du 18/10 avait
-- traité les colonnes `destinations.featured_image` / `hero_unsplash_url` pour le
-- Monténégro, mais dix lignes portent encore une URL de `destinations/madere/`
-- (les cinq visuels générés, manifeste C2PA « Created by Google Generative AI »,
-- `digitalSourceType = trainedAlgorithmicMedia`). Aucune n'est affichée
-- aujourd'hui (tous les articles visés sont `published=false`, les destinations
-- `status='draft'` ou `'coming_soon'`), mais elles restent latentes : republier
-- l'une de ces fiches ressortirait une image fabriquée. Règle #1 : on n'invente
-- rien.
--
-- Aucun `DELETE`, aucune donnée perdue : seule la colonne d'image change, vers
-- `/og-default.jpg` (image propre, marqueur C2PA absent — vérifié). Réversible
-- par une nouvelle migration versionnée.
--
-- Les deux migrations antérieures qui avaient POSÉ ces URL, et qui restent
-- telles quelles (on ne réécrit pas l'histoire) :
--   · 20261018120000_reconciliation_images.sql  (7 articles)
--   · 20261025160000_og_guide_madere.sql        (zone seo_og_image du guide)
--
-- Idempotente : ne touche que les lignes portant encore une URL de Madère.

-- ── Articles : featured_image, og_image, og_image_url ───────────────────────
UPDATE public.cms_blog_posts
SET featured_image = 'https://www.heldonica.fr/og-default.jpg'
WHERE featured_image LIKE '%/destinations/madere/%';

UPDATE public.cms_blog_posts
SET og_image_url = 'https://www.heldonica.fr/og-default.jpg'
WHERE og_image_url LIKE '%/destinations/madere/%';

UPDATE public.cms_blog_posts
SET og_image = 'https://www.heldonica.fr/og-default.jpg'
WHERE og_image LIKE '%/destinations/madere/%';

-- ── Destinations : featured_image, hero_unsplash_url ────────────────────────
UPDATE public.destinations
SET featured_image = 'https://www.heldonica.fr/og-default.jpg'
WHERE featured_image LIKE '%/destinations/madere/%';

UPDATE public.destinations
SET hero_unsplash_url = 'https://www.heldonica.fr/og-default.jpg'
WHERE hero_unsplash_url LIKE '%/destinations/madere/%';

-- ── Zones CMS : toute valeur pointant un visuel généré ──────────────────────
UPDATE public.cms_editable_zones
SET value = 'https://www.heldonica.fr/og-default.jpg',
    updated_at = now()
WHERE value LIKE '%/destinations/madere/%';

-- Vérification : plus aucune URL de Madère ne doit subsister. `supabase db push`
-- peut exécuter les instructions indépendamment (cf. AGENTS.md) : on mesure
-- l'état réel plutôt que de supposer un tout-ou-rien.
DO $$
DECLARE
  restant int;
BEGIN
  SELECT COUNT(*) INTO restant
  FROM public.cms_blog_posts
  WHERE coalesce(featured_image,'') || coalesce(og_image,'') || coalesce(og_image_url,'')
        LIKE '%/destinations/madere/%';

  IF restant <> 0 THEN
    RAISE WARNING 'cms_blog_posts : % ligne(s) portent encore une URL de Madère', restant;
  END IF;

  SELECT COUNT(*) INTO restant
  FROM public.destinations
  WHERE coalesce(featured_image,'') || coalesce(hero_unsplash_url,'')
        LIKE '%/destinations/madere/%';

  IF restant <> 0 THEN
    RAISE WARNING 'destinations : % ligne(s) portent encore une URL de Madère', restant;
  END IF;

  SELECT COUNT(*) INTO restant
  FROM public.cms_editable_zones
  WHERE value LIKE '%/destinations/madere/%';

  IF restant <> 0 THEN
    RAISE WARNING 'cms_editable_zones : % zone(s) portent encore une URL de Madère', restant;
  END IF;
END $$;
