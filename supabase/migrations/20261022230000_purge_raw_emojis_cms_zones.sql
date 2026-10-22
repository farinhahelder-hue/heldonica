-- Migration 20261022230000_purge_raw_emojis_cms_zones.sql
-- Purge des emojis décoratifs et des flèches résiduelles dans cms_editable_zones.
--
-- Fiche 91b54bbb :
-- 1. Les zones period_N, info_N_item_N, verdict_adore_N portaient des marques
--    brutes « ✓ » ou « ⚠ » rendues publiquement sur les pages de destinations.
-- 2. Les zones d'icônes highlight_*_emoji et pepite_*_icon portaient des emojis
--    Unicode résiduels au lieu du nom d'icône Lucide (« Compass »).
-- 3. Les boutons et liens CTA portaient des flèches typographiques trailing
--    (« → ») en dur dans le texte de la zone au lieu de suivre la charte sobre.

-- 1. Nettoyage des marques ✓ et ⚠ en tête de texte dans les zones de contenu
UPDATE public.cms_editable_zones
SET value = regexp_replace(value, '^[✓⚠]\s*', ''),
    updated_at = now()
WHERE value ~ '^[✓⚠]';

-- 2. Normalisation des zones d'icônes vers le composant Lucide par défaut
UPDATE public.cms_editable_zones
SET value = 'Compass',
    updated_at = now()
WHERE (zone_key LIKE 'highlight_%_emoji' OR zone_key LIKE 'pepite_%_icon')
  AND value ~ '[\u2600-\u27BF\U00010000-\U0001FAFF]';

-- 3. Suppression des flèches trailing sur les boutons CTA et formulaires
UPDATE public.cms_editable_zones
SET value = regexp_replace(value, '\s*→\s*$', ''),
    updated_at = now()
WHERE (
  zone_key LIKE '%cta%'
  OR zone_key LIKE '%button%'
  OR zone_key LIKE '%submit%'
  OR zone_key IN ('instagram_cta_text', 'popup_cta', 'contact_form_submit')
)
AND value ~ '→\s*$';
