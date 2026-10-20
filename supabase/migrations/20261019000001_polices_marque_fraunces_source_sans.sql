-- Polices de marque : Fraunces (titres) + Source Sans 3 (texte).
--
-- Jusqu'ici le site servait Playfair Display + DM Sans/Inter via deux
-- @import Google Fonts concurrents (globals.css et SiteTheme), donc en double,
-- bloquants, et avec un CLS au premier rendu. Les polices passent désormais
-- par next/font (app/layout.tsx) : auto-hégees au build, subset latin,
-- display swap, zero requete tierce.
--
-- site_settings peut encore contenir les anciennes valeurs, posees par le
-- preset eucalyptus (lib/design-presets.ts). Un réglage en base reprend la
-- main sur les polices de marque et declenche un chargement Google Fonts de
-- plus : on remet les deux cles sur les polices de marque pour supprimer ce
-- surcout. On ne touche a rien si un administrateur a choisi une autre
-- police explicitement.
--
-- Idempotente : rejouer la migration ne change rien.

UPDATE site_settings
SET value = 'Fraunces', updated_at = NOW()
WHERE key = 'font_heading'
  AND value IN ('Playfair Display', 'Playfair+Display', '');

UPDATE site_settings
SET value = 'Source Sans 3', updated_at = NOW()
WHERE key = 'font_body'
  AND value IN ('DM Sans', 'DM+Sans', 'Inter', '');
