-- ============================================================================
-- Migration: 20261011130000_fix_banned_words_destinations.sql
-- Date: 2026-10-11
-- Objet: Purger les mots bannis Heldonica présents dans cms_editable_zones sur
--        des pages PUBLIÉES. Mots issus de FORBIDDEN_WORDS (lib/brand-voice.ts),
--        donc règles écrites, pas jugements éditoriaux.
--
-- Contexte: le générateur de zones CMS (commit ad58c936) a introduit ces textes.
--           Ils s'affichent réellement : la valeur en base prime sur le fallback
--           de code. Relevé mesuré via GET /api/cms/zones le 11/10/2026.
--
-- Périmètre: uniquement les pages publiées. La page /destinations/sicile/taormine
--            (intro_text "spot", seo_description) est exclue : elle est en noindex
--            via lib/unpublished-pages.ts en attendant une réécriture sur vécu réel.
--
-- Rollback (à exécuter tel quel) : inverser chaque replace.
--   UPDATE cms_editable_zones SET value = replace(value, 'plages fluviales qu''on n''attendait pas', 'plages fluviales incroyables'), updated_at = now()
--     WHERE page='destinations-alentejo' AND zone_key='pepite_4_desc';
--   UPDATE cms_editable_zones SET value = replace(value, 'Demande aux locaux, ils indiquent les meilleures adresses.', 'Demandez aux locaux, ils indiquent les meilleurs spots.'), updated_at = now()
--     WHERE page='destinations-alentejo' AND zone_key='pepite_4_verdict';
--   UPDATE cms_editable_zones SET value = replace(value, 'plus vite qu''on ne l''imagine', 'plus vite que les voyageurs n''ont pu le réaliser'), updated_at = now()
--     WHERE page='destinations-colombie' AND zone_key='intro_1';
--   UPDATE cms_editable_zones SET value = replace(value, 'promenade sauvage en plein Paris', 'promenade sauvage au cœur de Paris'), updated_at = now()
--     WHERE page='destinations-idf' AND zone_key='pepite_1_desc';
--   UPDATE cms_editable_zones SET value = replace(value, 'créant un paysage qu''on n''oublie pas', 'créant un paysage inoubliable'), updated_at = now()
--     WHERE page='destinations-madere-porto-moniz' AND zone_key='intro_text';
--   UPDATE cms_editable_zones SET value = replace(value, 'Bon à savoir :', 'Astuce :'), updated_at = now()
--     WHERE page='destinations-montenegro-kotor' AND zone_key='day_3_desc';
--   UPDATE cms_editable_zones SET value = replace(value, 'une ville préservée coincée', 'une ville magnifique coincée'), updated_at = now()
--     WHERE page='destinations-montenegro-kotor' AND zone_key='intro_2';
--   UPDATE cms_editable_zones SET value = replace(value, 'avant l''arrivée des groupes.', 'avant les touristes.'), updated_at = now()
--     WHERE page='destinations-roumanie-timisoara' AND zone_key='pepite_1_desc';
--   UPDATE cms_editable_zones SET value = 'Incontournable', updated_at = now()
--     WHERE page='destinations-roumanie-timisoara' AND zone_key='pepite_1_tag' AND value='Pépite dénichée';
--   UPDATE cms_editable_zones SET value = replace(value, 'des villages préservés.', 'des villages magnifiques.'), updated_at = now()
--     WHERE page='destinations-roumanie-transylvanie' AND zone_key='intro_text';
-- ============================================================================

-- 1. Alentejo — « incroyable » (pépite 4) et « spot » (verdict)
UPDATE cms_editable_zones
SET value = replace(value, 'plages fluviales incroyables', 'plages fluviales qu''on n''attendait pas'),
    updated_at = now()
WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_4_desc';

UPDATE cms_editable_zones
SET value = replace(value, 'Demandez aux locaux, ils indiquent les meilleurs spots.', 'Demande aux locaux, ils indiquent les meilleures adresses.'),
    updated_at = now()
WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_4_verdict';

-- 2. Colombie — « les voyageurs »
UPDATE cms_editable_zones
SET value = replace(value, 'plus vite que les voyageurs n''ont pu le réaliser', 'plus vite qu''on ne l''imagine'),
    updated_at = now()
WHERE page = 'destinations-colombie' AND zone_key = 'intro_1';

-- 3. Île-de-France — « au cœur de »
UPDATE cms_editable_zones
SET value = replace(value, 'promenade sauvage au cœur de Paris', 'promenade sauvage en plein Paris'),
    updated_at = now()
WHERE page = 'destinations-idf' AND zone_key = 'pepite_1_desc';

-- 4. Madère / Porto Moniz — « inoubliable »
UPDATE cms_editable_zones
SET value = replace(value, 'créant un paysage inoubliable', 'créant un paysage qu''on n''oublie pas'),
    updated_at = now()
WHERE page = 'destinations-madere-porto-moniz' AND zone_key = 'intro_text';

-- 5. Monténégro / Kotor — « astuce » et « magnifique »
UPDATE cms_editable_zones
SET value = replace(value, 'Astuce :', 'Bon à savoir :'),
    updated_at = now()
WHERE page = 'destinations-montenegro-kotor' AND zone_key = 'day_3_desc';

UPDATE cms_editable_zones
SET value = replace(value, 'une ville magnifique coincée', 'une ville préservée coincée'),
    updated_at = now()
WHERE page = 'destinations-montenegro-kotor' AND zone_key = 'intro_2';

-- 6. Roumanie / Timișoara — « les touristes » et « incontournable »
UPDATE cms_editable_zones
SET value = replace(value, 'avant les touristes.', 'avant l''arrivée des groupes.'),
    updated_at = now()
WHERE page = 'destinations-roumanie-timisoara' AND zone_key = 'pepite_1_desc';

UPDATE cms_editable_zones
SET value = 'Pépite dénichée',
    updated_at = now()
WHERE page = 'destinations-roumanie-timisoara'
  AND zone_key = 'pepite_1_tag'
  AND value = 'Incontournable';

-- 7. Roumanie / Transylvanie — « magnifique »
UPDATE cms_editable_zones
SET value = replace(value, 'des villages magnifiques.', 'des villages préservés.'),
    updated_at = now()
WHERE page = 'destinations-roumanie-transylvanie' AND zone_key = 'intro_text';
