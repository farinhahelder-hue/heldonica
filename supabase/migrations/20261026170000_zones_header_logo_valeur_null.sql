-- Réglages du logo : passer la valeur vide à NULL — 2026-10-26
--
-- Contexte : la migration 20261025190000_reglages_logo_entete.sql a déclaré trois
-- zones dans cms_editable_zones (header_logo_height, header_logo_width,
-- header_logo_display) avec `value = ''` et `is_active = true`, pour les rendre
-- visibles et éditables dans l'admin. Elle justifiait la chaîne vide ainsi :
-- « getCmsOrSetting traite une chaîne vide comme absente ». C'est exact
-- (hooks/useContentLoader.ts : `if (zones[zoneKey]?.value)`), mais cela enfreint
-- le garde-fou `check:cms-zones`, ajouté la veille (commit e0b91b97, 2026-10-24) :
-- il refuse toute zone ACTIVE dont la valeur n'est pas NULL et se réduit à ''.
--
-- La règle n'est pas arbitraire : components/inline-edit/EditableZone.tsx fait
-- `zones[zoneKey] ?? fallback`, et '' n'est pas null — le repli ne joue donc pas.
-- Pour ces trois réglages le repli est porté par le code appelant
-- (parseCssPx / parseLogoDisplay, qui retombent sur les tailles écrites dans le
-- composant), donc rien n'est cassé AUJOURD'HUI ; mais le motif reste un piège,
-- et c'est ce que le garde-fou interdit.
--
-- Correctif : `value = NULL` au lieu de `''`. Les zones RESTENT actives (donc
-- toujours listées et éditables dans l'admin), et le rendu ne change pas :
--   - getCmsOrSetting : `zones[zoneKey]?.value` est falsy pour NULL comme pour '' ;
--   - parseCssPx(undefined) et parseLogoDisplay(undefined) retombent sur les replis.
-- Le garde-fou repasse au vert : une valeur NULL est explicitement autorisée
-- (test `check-cms-zones.test.ts`, cas `value: null` → « Aucune zone active à
-- valeur vide »).
--
-- On ne réécrit PAS 20261025190000 : une migration appliquée est un événement
-- ponctuel, on ne le rejoue pas. Une base rejouée de zéro exécute 190000 puis
-- celle-ci, et converge donc sur NULL.
--
-- Idempotente : ne touche que les lignes encore à valeur vide. NON APPLIQUÉE.

UPDATE public.cms_editable_zones
SET value = NULL,
    updated_at = now()
WHERE page = 'global'
  AND zone_key IN ('header_logo_height', 'header_logo_width', 'header_logo_display')
  AND value IS NOT NULL
  AND btrim(value) = '';
