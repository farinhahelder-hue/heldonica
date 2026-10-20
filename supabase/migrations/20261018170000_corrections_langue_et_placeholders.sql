-- ============================================================================
-- Migration: 20261018170000_corrections_langue_et_placeholders.sql
-- Description:
--   Corrige des fautes de langue affichées publiquement, et un caractère
--   chinois laissé par une génération IA.
--
--   Tout a été constaté en ligne (requête HTTP sur heldonica.fr, 2026-10-18),
--   puis retrouvé en base. Rien n'est déduit ici.
--
--   Cause racine : ces valeurs ont été semées par
--   20260803000001_cms_alentejo_zones.sql avec les fautes déjà présentes, et
--   les composants les recopient en repli. Corriger la base sans corriger le
--   composant laisserait la faute revenir ; corriger le composant sans la base
--   laisserait la faute affichée. Les deux sont faits.
--
--   Contenu corrigé :
--     1. site_settings.travel-planning__hero_subtitle
--        « On分析 votre demande » -> « On analyse votre demande »
--        (caractères chinois 分析 = « analyser », artefact de génération IA.
--         Constaté en ligne sur /travel-planning.)
--     2. destinations-alentejo / pepite_1_verdict
--        « bus de tourists » -> « bus de touristes » (mot anglais)
--     3. destinations-alentejo / accom_1_tip
--        « bookezminimum » -> « bookez au minimum » (mot collé + anglicisme)
--     4. destinations-alentejo / accom_2_tip
--        « establecimientos » -> « établissements » (mot espagnol)
--     5. destinations-alentejo / transport_1_tip
--        « reservez depuis Lisbonne airport » -> « réservez depuis l'aéroport de Lisbonne »
--     6. destinations-sardaigne-asinara / intro_text
--        « Pas de tourists » -> « Pas de touristes »
--
--   Réversible : les valeurs d'origine sont en commentaire au-dessus de chaque
--   UPDATE, et la sauvegarde du 2026-10-17 les contient.
-- ============================================================================

-- 1. Caractère chinois dans le sous-titre du Travel Planning
-- Avant : 'On分析 votre demande, on conçoit un itinéraire personnalisé et on vous livre un carnet de route complet.'
UPDATE site_settings
SET value = 'On analyse votre demande, on conçoit un itinéraire personnalisé et on vous livre un carnet de route complet.'
WHERE key = 'travel-planning__hero_subtitle'
  AND value LIKE '%分析%';

-- 2. « bus de tourists » -> « bus de touristes »
UPDATE cms_editable_zones
SET value = '⭐ Verdict Heldonica : À faire le matin, avant les bus de touristes.'
WHERE page = 'destinations-alentejo'
  AND zone_key = 'pepite_1_verdict'
  AND value LIKE '%tourists%';

-- 3. « bookezminimum » -> « bookez au minimum »
UPDATE cms_editable_zones
SET value = '💡 Notre conseil : bookez au minimum 3 nuits, le temps de décompresser.'
WHERE page = 'destinations-alentejo'
  AND zone_key = 'accom_1_tip'
  AND value LIKE '%bookezminimum%';

-- 4. « establecimientos » -> « établissements »
UPDATE cms_editable_zones
SET value = '💡 Notre conseil : privilégiez les établissements avec petit-déjeuner inclus.'
WHERE page = 'destinations-alentejo'
  AND zone_key = 'accom_2_tip'
  AND value LIKE '%establecimientos%';

-- 5. « reservez depuis Lisbonne airport » -> « réservez depuis l'aéroport de Lisbonne »
UPDATE cms_editable_zones
SET value = '💡 Notre conseil : réservez depuis l''aéroport de Lisbonne, compter 30-40€/jour.'
WHERE page = 'destinations-alentejo'
  AND zone_key = 'transport_1_tip'
  AND value LIKE '%airport%';

-- 6. « Pas de tourists » -> « Pas de touristes »
UPDATE cms_editable_zones
SET value = 'Asinara, c''est l''île aux ânes blanchis. Ils sont partout. Pas de touristes — seulement 1 ferry par jour.'
WHERE page = 'destinations-sardaigne-asinara'
  AND zone_key = 'intro_text'
  AND value LIKE '%tourists%';

-- Contrôle : aucune de ces fautes ne doit subsister.
DO $$
DECLARE
  restants integer;
BEGIN
  SELECT count(*) INTO restants
  FROM cms_editable_zones
  WHERE value ~ '(tourists|establecimientos|bookezminimum|airport)';

  SELECT count(*) + restants INTO restants
  FROM site_settings
  WHERE value ~ '[一-龥]';

  IF restants > 0 THEN
    RAISE NOTICE 'Attention : % valeur(s) fautive(s) subsistent — vérifier les autres tables.', restants;
  ELSE
    RAISE NOTICE 'OK : aucune faute de langue connue ne subsiste.';
  END IF;
END $$;
