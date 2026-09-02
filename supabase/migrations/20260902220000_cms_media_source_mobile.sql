-- ===========================================================================
-- cms_media.source : autoriser la valeur 'mobile'
--
-- La contrainte posee par 20260902000001_google_enrichment n'admet que
-- 'upload', 'gphotos', 'takeout' et 'places_api'. Or /api/cms/mobile-publish
-- ecrit 'mobile' : chaque envoi depuis l'application echouait donc en 500,
-- avec le message
--
--   new row for relation "cms_media" violates check constraint
--   "cms_media_source_check"
--
-- Constate sur l'appareil : la photo arrivait bien dans le stockage, mais la
-- ligne de tracage etait rejetee, et WorkManager rejouait l'envoi en boucle en
-- re-televersant le fichier a chaque tentative.
--
-- 'mobile' merite sa propre valeur plutot que d'etre range sous 'upload' :
-- c'est la seule source qui apporte une position relevee sur le terrain au
-- moment de la prise de vue.
--
-- Idempotente.
-- ===========================================================================

ALTER TABLE public.cms_media
  DROP CONSTRAINT IF EXISTS cms_media_source_check;

ALTER TABLE public.cms_media
  ADD CONSTRAINT cms_media_source_check
  CHECK (source IN ('upload', 'gphotos', 'takeout', 'places_api', 'mobile'));

-- Verification (lecture seule)
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.cms_media'::regclass
  AND conname = 'cms_media_source_check';
