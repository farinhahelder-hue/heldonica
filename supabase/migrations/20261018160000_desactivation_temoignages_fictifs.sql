-- ============================================================================
-- Migration: 20261018160000_desactivation_temoignages_fictifs.sql
-- Description:
--   Désactive les 5 témoignages fictifs de démonstration, réactivés hors
--   migration le 2026-10-14.
--
--   Contexte vérifié :
--     - Ces 5 lignes ont été créées le 2026-08-19.
--     - La migration 20260819140000 les a désactivées le jour même, avec le
--       commentaire explicite « Désactivation des faux témoignages de
--       démonstration (intégrité E-E-A-T) ».
--     - Aucune migration ne les a réactivées depuis.
--     - Elles sont pourtant is_active = true, updated_at = 2026-10-14.
--       L'écriture du 14/10 est donc hors migration et non traçable
--       (cms_audit_log n'existe pas).
--     - Le propriétaire confirme : « Témoignage on en a pas pour le moment ».
--
--   Ces avis portent des noms, des villes et des destinations, avec une note
--   de 5/5, et sont affichés publiquement sur /temoignages (site en ligne,
--   maintenance_mode = false). Ils contredisent la règle n°1 (on n'invente
--   rien) et la promesse de la marque (« chaque témoignage doit être
--   authentique et vérifiable »).
--
--   La page /temoignages possède déjà un repli honnête quand il n'y a aucun
--   témoignage actif : « On construit nos retours clients en ce moment. »
--   La désactivation affiche donc ce message, elle ne casse rien.
--
--   Réversible : pour réactiver un témoignage réel plus tard, passer son
--   is_active à true (ou insérer une nouvelle ligne), jamais réutiliser un id.
-- ============================================================================

UPDATE cms_testimonials
SET is_active = false
WHERE id IN (
  '14454b5c-3176-43d4-ba42-6ccf0599f971',  -- Sophie & Marc, Madère
  'ea27168a-a3de-4734-a123-cb8682ea293f',  -- Claire, Roumanie
  '7fc49d66-010f-4a35-b684-938f8c22926c',  -- Thomas & Julie, Monténégro
  '475ebbac-9c50-48af-bd7d-43f465e477bd',  -- Marie & Antoine, Sicile
  'ebad74b8-18e7-42fd-a3f6-2b7ffa40ef07'   -- Jean-Luc & Élodie, Madère
)
AND is_active = true;

-- Contrôle : plus aucun témoignage actif tant qu'un vrai retour n'est pas saisi.
DO $$
DECLARE
  restants integer;
BEGIN
  SELECT count(*) INTO restants FROM cms_testimonials WHERE is_active = true;
  IF restants > 0 THEN
    RAISE NOTICE 'Attention : % témoignage(s) encore actif(s) — vérifier s''ils sont authentiques.', restants;
  ELSE
    RAISE NOTICE 'OK : aucun témoignage actif, /temoignages affiche son message d''attente.';
  END IF;
END $$;
