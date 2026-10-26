-- Migration 20261025190000_reglages_logo_entete.sql
-- Déclaration des trois réglages du logo d'en-tête, pour qu'ils soient VISIBLES
-- et éditables dans l'admin.
--
-- Contexte : le rendu lit déjà ces clés (components/Header.tsx, via
-- `getCmsOrSetting`) — `header_logo_height` / `header_logo_width` (lib/cms-size.ts,
-- `parseCssPx`) et `header_logo_display` (`parseLogoDisplay`). Mais l'admin ne
-- liste que les zones `is_active = true` : sans ligne, le propriétaire doit taper
-- la clé exacte à la main depuis « Nouvelle zone ». Cette migration les déclare.
--
-- Valeur vide volontaire : `getCmsOrSetting` traite une chaîne vide comme
-- absente, donc le rendu garde les tailles écrites dans le code (`h-8 w-auto`,
-- `h-7 w-7`) et l'affichage « sceau + nom ». AUCUN changement visible tant que le
-- propriétaire ne renseigne pas une valeur.
--
-- Idempotente via ON CONFLICT DO NOTHING : ne réécrit pas une valeur déjà réglée.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, is_active, label, description)
VALUES
  ('global', 'header_logo_height', 'text', '', true,
   'Hauteur du logo (px)',
   'Entier en pixels, ex. 32. Vide = taille écrite dans le code.'),
  ('global', 'header_logo_width', 'text', '', true,
   'Largeur du logo (px)',
   'Entier en pixels, ex. 140. Vide = largeur automatique.'),
  ('global', 'header_logo_display', 'text', '', true,
   'Emplacement du logo',
   'both = sceau + nom (défaut) · icon = sceau seul · text = nom seul.')
ON CONFLICT (page, zone_key) DO NOTHING;
