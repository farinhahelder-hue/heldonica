-- ============================================================================
-- Corrections des défauts introduits par 20261023120000_coherence_site_en_ligne
-- (PR 702, agent perplexity) — relevé du 23/10/2026.
-- ============================================================================
-- 1. Noms propres capitalisés mécaniquement sans accent ni connaissance du nom :
--      « Isole Eoliennes » -> « Îles Éoliennes »   (nom officiel, cf. destinations.iles-eoliennes)
--      « Bogota »          -> « Bogotá »           (cf. destinations.bogota : « Bogotá, capitale andine »)
--      « Medellin »        -> « Medellín »         (cf. destinations.medellin : « Medellín, vallée… »)
--    La migration précédente a passé « bogota » -> « Bogota » et
--    « isole eoliennes » -> « Isole Eoliennes » sans accentuer ni vérifier
--    le nom réel. Corrigé ici sur les zones réellement rendues.
--
-- 2. Le compteur « Carnets publiés » de /a-propos avait été figé à « 8 » (un
--    instantané). Le code sait déjà le calculer (`carnetCount`, app/a-propos/
--    page.tsx) et rend `${carnetCount}+`. On désactive la zone pour rendre la
--    main au code : le chiffre suit désormais les publications, sans figer.
--
-- Idempotent : chaque écriture ne touche que la valeur encore présente.
-- Retour arrière : voir agent_tasks.rollback_sql (tâche de cette PR).

-- ── 1. Noms propres ────────────────────────────────────────────────────────
UPDATE public.cms_editable_zones AS z
SET value = v.apres,
    updated_at = NOW()
FROM (VALUES
  -- Îles Éoliennes (nom officiel ; le slug du parent est « ile/sicile »)
  ('destinations-sicile-etoile',   'hero_title',    'Isole Eoliennes',                                                'Îles Éoliennes'),
  ('destinations-sicile-etoile',   'section_title', 'On prépare le guide Isole Eoliennes — à notre façon.',            'On prépare le guide Îles Éoliennes — à notre façon.'),
  ('destinations-sicile-etoile',   'seo_title',     'Isole Eoliennes en couple : notre carnet slow travel | Heldonica','Îles Éoliennes en couple : notre carnet slow travel | Heldonica'),
  -- Bogotá
  ('destinations-colombie-bogota', 'hero_title',    'Bogota',                                                          'Bogotá'),
  ('destinations-colombie-bogota', 'section_title', 'On prépare le guide Bogota — à notre façon.',                      'On prépare le guide Bogotá — à notre façon.'),
  ('destinations-colombie-bogota', 'seo_title',     'Bogota en couple : notre carnet slow travel | Heldonica',          'Bogotá en couple : notre carnet slow travel | Heldonica'),
  -- Medellín
  ('destinations-colombie-medellin','hero_title',   'Medellin',                                                        'Medellín'),
  ('destinations-colombie-medellin','section_title','On prépare le guide Medellin — à notre façon.',                    'On prépare le guide Medellín — à notre façon.'),
  ('destinations-colombie-medellin','seo_title',    'Medellin en couple : notre carnet slow travel | Heldonica',        'Medellín en couple : notre carnet slow travel | Heldonica')
) AS v(page, zone_key, avant, apres)
WHERE z.page = v.page
  AND z.zone_key = v.zone_key
  AND z.value = v.avant;

-- ── 2. Compteur « Carnets publiés » : rendre la main au code ───────────────
-- La zone figeait un instantané (« 8 »). Désactivée, `EditableZone` retombe
-- sur le fallback `${carnetCount}+` qui suit les articles publiés.
UPDATE public.cms_editable_zones
SET is_active = false,
    updated_at = NOW()
WHERE page = 'a-propos'
  AND zone_key = 'stat_2_value'
  AND is_active;
