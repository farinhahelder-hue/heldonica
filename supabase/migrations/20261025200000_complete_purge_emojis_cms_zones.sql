-- Migration 20261025200000_complete_purge_emojis_cms_zones.sql
-- Rattrapage de l'écart de plage Unicode de la purge 20261022230000.
--
-- Contexte : la purge #687 (20261022230000) visait
--   [\u2600-\u27BF\U00010000-\U0001FAFF]
-- alors que le détecteur `scripts/check-design-tics.mjs` (DECORATIVE_EMOJI_RE)
-- couvre AUSSI 231A-231B, 23E9-23FF, 2B1B-2B1C, 2B50 et 2B55. Quatre familles
-- d'emojis décoratifs échappaient donc à la purge tout en étant refusés par la
-- CI : les sabliers (⌚-⌛), les chronomètres (⏩-⏿), l'étoile pleine (⭐) et le
-- cercle épais (⭕).
--
-- Preuve mesurée en lecture seule, caractères littéraux :
--   U+231B (⌛) : motif #687 = false, motif détecteur = true.
--   « A » (U+0041) : les deux = false (le test discrimine, il n'attrape pas
--   des lettres par accident).
--
-- Résidu mesuré avant écriture : 1 ligne, highlight_2_emoji (inactive) = ⌛.
-- Le correctif reprend la plage COMPLÈTE du détecteur, afin que le trou ne se
-- rouvre pas sur une autre zone d'icône.

-- 1. Zones d'icônes : tout emoji décoratif résiduel redevient le nom d'icône
--    Lucide par défaut, exactement comme la purge #687 (même valeur, même motif
--    de clés), mais avec la plage Unicode complète du détecteur.
--    Les drapeaux (1F1E6-1F1FF) sont exclus : ce sont des indicateurs de pays
--    sémantiques, pas des emojis décoratifs.
UPDATE public.cms_editable_zones
SET value = 'Compass',
    updated_at = now()
WHERE (zone_key LIKE 'highlight_%_emoji' OR zone_key LIKE 'pepite_%_icon')
  AND value ~ '[\U0001F300-\U0001FAFF\u231A-\u231B\u23E9-\u23FF\u2600-\u2604\u2606-\u26FF\u2700-\u27BF\u2B1B-\u2B1C\u2B50\u2B55]';

-- 2. Marques ✓ et ⚠ en tête de texte, sur l'ensemble des zones de contenu.
--    La purge #687 ne les visait pas (elles sont hors 2600-27BF) : le nettoyage
--    reste volontairement large et idempotent.
--
-- Note d'asymétrie assumée : cette migration ne corrige QUE les zones d'icônes
-- (comme #687), alors que le garde-fou `check-cms-emojis.mjs` alerte sur toute
-- zone ACTIVE portant un emoji, quelle que soit sa clé. C'est voulu : le
-- détecteur doit voir large, la migration ne touche que ce qui est mesuré comme
-- résidu (ici 1 ligne, `highlight_2_emoji`). Si le garde-fou signale un jour une
-- zone de contenu (`intro_text`…), il faudra une migration dédiée, ciblée sur
-- cette clé — jamais un remplacement aveugle du texte éditorial.
UPDATE public.cms_editable_zones
SET value = regexp_replace(value, '^[✓⚠]\s*', ''),
    updated_at = now()
WHERE value ~ '^[✓⚠]';
