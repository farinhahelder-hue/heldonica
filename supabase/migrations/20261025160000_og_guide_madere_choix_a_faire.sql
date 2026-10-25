-- Migration 20261025160000_hero_images_pages_publiees_og_default.sql
-- Lot 2 : image de partage du guide Madère — PRÉPARÉE, NON APPLIQUÉE.
--
-- État constaté en base le 2026-10-25 (lecture seule) :
--   `guides-top-10-pepites-madere__seo_og_image` = '/og-default.jpg'
-- La page est PUBLIÉE et indexable (absente de `lib/unpublished-pages.ts`) :
-- `buildPageMetadata` (lib/page-metadata.ts:39-48) lit la zone et remplace l'image
-- OpenGraph du fallback, donc cette zone prime sur le `'/og-default.jpg'` codé en
-- dur (app/guides/top-10-pepites-madere/page.tsx:38).
--
-- ── POURQUOI CETTE MIGRATION ÉCHOUE TANT QUE LE CHOIX N'EST PAS FAIT ────────
-- Fanal a été écarté : `fanal_foret.jpg` n'est PAS l'une des 10 pépites du
-- guide. Une image sociale montrant un lieu absent de l'article serait une
-- incohérence éditoriale. Les deux candidats ci-dessous SONT dans le guide :
--   - `pico_do_arieiro.jpg` → pépite n°5 « Miradouro Pico do Arieiro » ;
--   - `porto_moniz.jpg`     → pépite n°3 « Porto Moniz Natural Pools ».
-- Les deux fichiers répondent HTTP 200 et font 1200x896 (comme les 3 autres
-- photos Madère : l'OpenGraph 1200x630 recadre identiquement, ce n'est pas
-- discriminant pour choisir).
--
-- ⚠️  AVANT D'APPLIQUER : la règle absolue n°5 impose de REGARDER la photo
-- (aucun enfant en ligne). Le contenu visuel n'a pas pu être vérifié ici :
-- ce contrôle reste à faire par le propriétaire, en même temps que le choix.
--
-- Retour arrière : `UPDATE ... SET value = '/og-default.jpg'` sur la zone.

DO $$
DECLARE
  -- ⚠️  METTRE ICI le fichier retenu : 'pico_do_arieiro' ou 'porto_moniz'.
  v_choix text := '';
  v_url   text;
BEGIN
  IF v_choix NOT IN ('pico_do_arieiro', 'porto_moniz') THEN
    RAISE EXCEPTION
      'Aucune photo choisie. Renseigner v_choix avec ''pico_do_arieiro'' (pepite 5) ou ''porto_moniz'' (pepite 3) avant d''appliquer.';
  END IF;

  v_url := 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/'
           || v_choix || '.jpg';

  UPDATE public.cms_editable_zones
  SET value = v_url, updated_at = NOW()
  WHERE page = 'guides-top-10-pepites-madere'
    AND zone_key = 'seo_og_image';

  RAISE NOTICE 'Image de partage du guide Madere : %', v_url;
END $$;
