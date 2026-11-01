-- Migration 20261028140000_coherence_chiffres_accueil.sql
-- Audit éditorial (lot 2), constats D et E — décisions du propriétaire du 2026-10-28.
--
-- D — Années d'expérience : « dix ans » (home/hero_tagline) contredisait « 4+ »
--     (global/stat_1_nb) sur la MÊME page, et « 4 » sur /a-propos. Trois ancrages
--     concurrents coexistent dans l'historique (2015 / 2019 / 2021) et aucune date
--     de départ n'est attestée par une preuve de terrain. Décision : on RETIRE le
--     chiffre des années plutôt que d'en choisir un. L'ancrage « En 2019 » de
--     a-propos/bio_text_3 (seule date déjà publiée sur une page) n'est pas touché.
--
-- E — Nombre de pays : le propriétaire a fourni les deux valeurs réelles, qui
--     mesurent DEUX choses différentes (confondues jusqu'ici) :
--       · 12 pays HABITÉS ensemble (le duo) — remplace « 7 », qui venait de
--         l'enfance d'ELLE seule (« une enfance entre les Carpates… sept pays
--         habités », commit 2e31e2e2) et non du duo ;
--       · ~40 pays VISITÉS — jamais revendiqué nulle part ; le « 12 pays » de
--         juin 2026 était un repli de code marqué « à confirmer avec le
--         propriétaire » et mesurait les pays VISITÉS, pas habités.
--     On affiche donc les deux, libellés sans ambiguïté.
--
-- Vérifié en lecture seule avant écriture (2026-10-28) :
--   site_settings.covered_countries = '7'
--   global/stat_1_nb = '4+'      global/stat_1_label = 'Ans de slow travel'
--   global/stat_3_label = 'Pays habités'
--   home/hero_tagline = « Deux voyageurs, dix ans de terrain, … »
--   a-propos/stat_1_value = '7' (active)   a-propos/stat_2_value = '8' (INACTIVE)
--   a-propos/stat_3_value = '4' (active)
--
-- Périmètre : 1 ligne de site_settings, 5 lignes de cms_editable_zones.
-- Aucune autre table, aucune autre clé. NON APPLIQUÉE à l'écriture de ce fichier.

-- 1. Pays habités (le duo) : 7 -> 12.
UPDATE public.site_settings
SET value = '12', updated_at = now()
WHERE key = 'covered_countries';

-- 2. Tagline du hero : retirer « dix ans de terrain, » (constat D).
UPDATE public.cms_editable_zones
SET value = 'Deux voyageurs, des destinations qu''on a vraiment arpentées — pas lu dans un guide.',
    updated_at = now()
WHERE page = 'home' AND zone_key = 'hero_tagline';

-- 3. Stat 1 de l'accueil : « Ans de slow travel 4+ » devient « Pays visités 40 »
--    (constat D + E). Le chiffre des années disparaît ; celui des pays visités,
--    fourni par le propriétaire, prend sa place.
UPDATE public.cms_editable_zones
SET value = '40', updated_at = now()
WHERE page = 'global' AND zone_key = 'stat_1_nb';

UPDATE public.cms_editable_zones
SET value = 'Pays visités', updated_at = now()
WHERE page = 'global' AND zone_key = 'stat_1_label';

-- 4. /a-propos : les trois valeurs de stat étaient FIGÉES en base ('7', '8', '4').
--    Comme EditableZone fait `zones[zoneKey] ?? fallback` ET que la lecture ne
--    charge que `is_active = true` (lib/cms-zones.ts), la valeur figée prime sur le
--    fallback calculé : le compteur de carnets (carnetCount = posts.length) ne
--    s'affichait donc jamais, et dirait encore « 8 » après un 9e carnet.
--
--    On DÉSACTIVE (is_active = false), on ne supprime pas : c'est la convention du
--    projet — « une zone inactive n'est jamais rendue » (lib/cms-zones.ts) — et
--    c'est aussi ce que fait #746 pour les zones d'alentejo. Supprimer la ligne
--    ferait perdre la zone au CMS ; la désactiver la garde réactivable.
--    Les LIBELLÉS (stat_*_label) restent actifs.
--
--    Ce point est INDÉPENDANT du libellé retenu sur /a-propos : que l'on garde
--    « Pays habités » ou les compteurs de #746, une valeur figée en base masque
--    toujours le calcul. C'est le correctif de fond.
UPDATE public.cms_editable_zones
SET is_active = false, updated_at = now()
WHERE page = 'a-propos'
  AND zone_key IN ('stat_1_value', 'stat_2_value', 'stat_3_value');
