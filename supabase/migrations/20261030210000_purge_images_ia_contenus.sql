-- Migration 20261030210000_purge_images_ia_contenus.sql
-- Complément à 20261030200000_purge_images_ia_en_base.sql.
--
-- Constat (mesures du 2026-10-31 sur la base réelle). La migration précédente
-- ne visait que les COLONNES D'IMAGE (featured_image, og_image, og_image_url,
-- hero_unsplash_url). Un balayage exhaustif de toutes les colonnes texte, json
-- ET TABLEAU de toutes les tables `public` a montré que des URL de visuels
-- générés subsistaient dans des colonnes de CONTENU, hors de ce périmètre :
--
--   · cms_blog_posts.content     — 3 images (article « foret-fanal », brouillon)
--   · cms_pillar_pages.hero      — 1 image (pilier « madere », is_active=false)
--   · article_revisions.content  — 3 images (révision 22 de l'article 89, publié)
--   · destinations.gallery_images — 4 images (galerie Madère, type `text[]`)
--
-- Le dernier cas est le plus instructif : `gallery_images` est un TABLEAU, pas
-- une colonne texte. Un balayage limité à `text`/`jsonb` ne le voit jamais —
-- c'est le trou qui a survécu à deux purges annoncées « complètes ». Le
-- garde-fou `check-cms-ai-images-db.mjs` couvre désormais les trois types.
--
-- C'est exactement le trou reproché à #790 : une purge qui ne regarde qu'une
-- famille de colonnes et déclare le reste propre. Aucune de ces références
-- n'est servie aujourd'hui (brouillon / inactif), mais la révision est
-- RESTAURABLE via /api/cms/articles/[id]/revisions/[revisionId]/restore : un
-- clic la remettrait en ligne.
--
-- Aucun `DELETE`, aucun texte retiré : seule l'URL de l'image change, vers
-- `/og-default.jpg` (image propre, sans marqueur C2PA — vérifié). Réversible.
--
-- Les neuf visuels générés connus (manifeste C2PA « Created by Google
-- Generative AI », digitalSourceType = trainedAlgorithmicMedia) :
--   Madère     : achadas_da_cruz, fanal_foret, pico_do_arieiro, ponta_do_sol, porto_moniz
--   Monténégro : moraca_millennium, sahat_kula, sipcanik_winery, stara_varos
--
-- Idempotente : ne touche que les lignes portant encore une URL de ces objets.

-- ── Article : corps Markdown (images inline) ────────────────────────────────
UPDATE public.cms_blog_posts
SET content = regexp_replace(
      content,
      'https?://[a-z0-9.]+/storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)',
      'https://www.heldonica.fr/og-default.jpg',
      'g'
    )
WHERE content ~ 'storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)';

-- ── Page pilier : image d'en-tête ───────────────────────────────────────────
UPDATE public.cms_pillar_pages
SET hero = regexp_replace(
      hero,
      'https?://[a-z0-9.]+/storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)',
      'https://www.heldonica.fr/og-default.jpg',
      'g'
    ),
    updated_at = now()
WHERE hero ~ 'storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)';

-- ── Révisions : historiques restaurables ────────────────────────────────────
-- On assainit l'historique plutôt que de le laisser : une révision restaurable
-- est une porte de retour vers l'image fabriquée.
UPDATE public.article_revisions
SET content = regexp_replace(
      content,
      'https?://[a-z0-9.]+/storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)',
      'https://www.heldonica.fr/og-default.jpg',
      'g'
    )
WHERE content ~ 'storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)';

-- ── Galeries : colonnes TABLEAU ─────────────────────────────────────────────
-- `destinations.gallery_images` est de type `text[]`, pas une colonne texte.
-- Un balayage qui ne regarde que `text`/`jsonb` la manque entièrement — c'est
-- le trou qui a laissé quatre visuels générés dans la galerie de Madère après
-- deux purges annoncées « complètes ». On retire les entrées générées du
-- tableau (aucune photo de terrain ne les remplace : les remplacer toutes par
-- `/og-default.jpg` donnerait quatre vignettes identiques). Les entrées réelles
-- d'un tableau mixte sont conservées.
UPDATE public.destinations
SET gallery_images = ARRAY(
      SELECT x FROM unnest(gallery_images) AS x
      WHERE x !~ 'storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)'
    ),
    updated_at = now()
WHERE array_to_string(gallery_images, ' ') ~ 'storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)';

-- ── Vérification : balayage de TOUTE la base (texte, json ET tableaux) ──────
-- `supabase db push` peut exécuter les instructions indépendamment (cf.
-- AGENTS.md) : on mesure l'état réel après coup plutôt que de supposer.
DO $$
DECLARE
  r record;
  n int;
  restant int := 0;
  re text := 'https?://[a-z0-9.]+/storage/v1/object/public/media/destinations/(madere|montenegro)/(achadas_da_cruz|fanal_foret|pico_do_arieiro|ponta_do_sol|porto_moniz|moraca_millennium|sahat_kula|sipcanik_winery|stara_varos)[a-z_]*\.(jpg|png|webp)';
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name, c.data_type
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_name = c.table_name AND t.table_schema = c.table_schema
    WHERE c.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND (c.data_type IN ('text', 'character varying', 'jsonb', 'json') OR c.data_type = 'ARRAY')
  LOOP
    BEGIN
      IF r.data_type = 'ARRAY' THEN
        EXECUTE format('SELECT count(*) FROM public.%I WHERE array_to_string(%I, %L) ~ %L',
                       r.table_name, r.column_name, ' ', re) INTO n;
      ELSE
        EXECUTE format('SELECT count(*) FROM public.%I WHERE %I::text ~ %L',
                       r.table_name, r.column_name, re) INTO n;
      END IF;
      IF n > 0 THEN
        RAISE WARNING 'RESTE % ligne(s) : %.%', n, r.table_name, r.column_name;
        restant := restant + n;
      END IF;
    EXCEPTION WHEN others THEN
      NULL;  -- colonne non requêtable (type exotique) : ignorée
    END;
  END LOOP;

  IF restant = 0 THEN
    RAISE NOTICE 'Purge IA complète : aucune URL de visuel généré dans la base.';
  ELSE
    RAISE WARNING 'Purge IA incomplète : % référence(s) subsistent.', restant;
  END IF;
END $$;
