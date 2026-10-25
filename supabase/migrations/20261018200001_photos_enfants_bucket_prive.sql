-- ============================================================================
-- Migration: 20261018200001_photos_enfants_bucket_prive.sql
--   (renommee depuis 20261018200000 : cette version etait deja prise par
--    20261018200000_brouillon_articles_photo_fausse.sql, journalise en base.
--    Deux fichiers ne peuvent pas partager une version : le CLI en ignorerait un
--    en silence. Voir .audit/audit-editorial-2026-10-20/proposition-tracabilite-622-2026-10-25.md)
-- Description:
--   Met à jour les 7 fiches `cms_media` dont le fichier a été déplacé du bucket
--   public `media` vers le bucket privé `prive` (préfixe `enfants/`).
--
--   Contexte — ce qui est CONSTATÉ (2026-10-18) :
--
--   COMPLÉMENT D'UNE MIGRATION EXISTANTE : 20261018190000_retrait_photo_enfant.sql
--   (autre agent, PR #623) traite le cas de IMG_20260827_135834.jpg — gros plan
--   d'enfant qui servait d'image de partage à un article Apuseni. Cette migration-ci
--   traite les 7 AUTRES photos de la même série, détectées après coup. Les deux
--   migrations sont complémentaires et ne se recouvrent pas.
--
--   1. Une photo portait déjà l'avertissement, posé le jour même :
--        `IMG_20260827_135834.jpg`
--        alt = 'PRIVÉE — photo d enfant, ne jamais publier
--               (déplacée dans le stockage privé le 18/10/2026)'
--        path = 'prive/enfants/IMG_20260827_135834.jpg'
--      Le mécanisme était donc amorcé : bucket `prive` (public=false) + `alt`.
--
--   2. Les 7 autres photos de la même série restaient dans le bucket public
--      `media` et **téléchargeables sans authentification** (HTTP 200,
--      ~3,9 Mo chacune) :
--        IMG_20260827_135832 / 135835 / 135836 / 135837
--        PXL_20260827_180746945 / 180748460 / 180749205 (.PORTRAIT)
--
--   3. Détection : CLIP (enfant vs adulte, logits) ET BLIP (description) ont
--      concordé sur ces 8 images — « a little girl holding a cup of coffee »,
--      « a young girl holding a banana », « a girl holding a cell phone ».
--      Elles ne figuraient sur AUCUNE des 103 pages du sitemap : le risque
--      n'était pas l'affichage, mais le **téléchargement direct de l'URL**.
--
--   4. Aucune des 8 ne porte de GPS (vérifié : latitude/longitude nulles).
--
--   ACTION : les 7 fichiers ont été copiés dans `prive/enfants/` (copie
--   vérifiée par listage) PUIS supprimés de `media`. Aucune suppression
--   définitive : les originaux sont dans le bucket privé.
--
--   RÉVERSIBLE : recopier `prive/enfants/<fichier>` vers
--   `media/destinations/roumanie/<fichier>` et remettre path/url ci-dessous.
--
--   RESTE À FAIRE (propriétaire) : confirmer que les personnes représentées
--   autorisent ou non une publication. Si autorisation : recopier vers le
--   bucket public et remettre path/url d'origine. Sinon : laisser en privé.
-- ============================================================================

UPDATE cms_media
SET
  path = 'prive/enfants/' || filename,
  url  = 'prive://enfants/' || filename,
  alt  = 'PRIVÉE — photo d enfant, ne jamais publier (déplacée dans le stockage privé le 18/10/2026)'
WHERE filename IN (
  'IMG_20260827_135832.jpg',
  'IMG_20260827_135835.jpg',
  'IMG_20260827_135836.jpg',
  'IMG_20260827_135837.jpg',
  'PXL_20260827_180746945.PORTRAIT.jpg',
  'PXL_20260827_180748460.PORTRAIT.jpg',
  'PXL_20260827_180749205.PORTRAIT.jpg'
);

-- Contrôle : plus aucune fiche de cette série ne doit pointer vers le bucket public.
DO $$
DECLARE
  restants integer;
BEGIN
  SELECT count(*) INTO restants
  FROM cms_media
  WHERE filename LIKE 'IMG_20260827_13583%'
     OR filename LIKE 'PXL_20260827_18074%'
     AND path NOT LIKE 'prive/%';

  IF restants > 0 THEN
    RAISE EXCEPTION 'Encore % fiche(s) pointant vers le bucket public.', restants;
  END IF;

  RAISE NOTICE 'OK : les fiches de la série pointent toutes vers le stockage privé.';
END $$;
