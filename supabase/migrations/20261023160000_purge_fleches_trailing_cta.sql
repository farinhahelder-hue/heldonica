-- Migration 20261023160000_purge_fleches_trailing_cta.sql
-- P2 de l'audit éditorial du lot 2 : retrait des flèches décoratives de CTA.
--
-- Décision #682 (migration 20261022220000) : « Retrait de la flèche et de la
-- casse haute pour une typographie apaisée et cohérente ». Elle n'avait été
-- appliquée qu'aux 10 CTA de l'accueil.
--
-- Récidive constatée : la migration 20261022230800_cms_destination_labels.sql,
-- appliquée 8 minutes APRÈS la purge 20261022230000, a réinséré en dur
-- « Voir le guide → » (subdest_cta) et « Planifier ce voyage avec Heldonica → »
-- (cta_button) sur 5 pages de destination. Sur suisse et zurich, publiées, ces
-- valeurs écrasent le fallback JSX et la flèche reste visible.
--
-- Périmètre mesuré avant écriture : 10 zones actives finissent par une flèche,
-- toutes de type CTA (cta_button, subdest_cta). Aucune flèche de trajet
-- (« Évora → Monsaraz ») ne finit une valeur : la règle est donc sûre.
--
-- Retour arrière : UPDATE ... SET value = value || ' →' sur les mêmes clés.

UPDATE public.cms_editable_zones
SET value = regexp_replace(value, '\s*→\s*$', ''),
    updated_at = now()
WHERE is_active
  AND value ~ '→\s*$'
  AND (
    zone_key LIKE '%cta%'
    OR zone_key LIKE '%button%'
    OR zone_key LIKE '%submit%'
    OR zone_key LIKE '%link%'
    OR zone_key LIKE '%label%'
  );
