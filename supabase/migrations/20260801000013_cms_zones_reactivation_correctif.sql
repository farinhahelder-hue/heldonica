-- ============================================================================
-- CORRECTIF : réactiver les zones désactivées à tort
-- Date: 2026-08-01
-- ============================================================================
-- Une neutralisation appliquée plus tôt aujourd'hui reposait sur une lecture
-- TRONQUÉE de cms_editable_zones : PostgREST plafonne une réponse à 1000 lignes
-- par défaut, sans autre signal que l'en-tête Content-Range. Le script d'analyse
-- n'a donc vu que 1000 des 1813 zones actives.
--
-- Conséquence : 109 zones ont été classées « valeur vide » alors qu'elles
-- portaient du contenu — leur valeur n'avait simplement pas été récupérée. Elles
-- ont été désactivées à tort.
--
-- On réactive l'intégralité du lot, avant de rejouer l'arbitrage sur une lecture
-- complète (fichier 20260801_cms_zones_sans_emplacement.sql).
--
-- La pagination est désormais explicite dans scripts/check-cms-zones.mjs, pour
-- que cette troncature silencieuse ne puisse plus se reproduire.

UPDATE public.cms_editable_zones
SET is_active = true, updated_at = NOW()
WHERE NOT is_active
  AND updated_at > NOW() - INTERVAL '120 minutes'
  AND page LIKE 'destinations-%';


-- ─── Vérification (lecture seule) ───────────────────────────────────────────

SELECT count(*) AS zones_actives FROM public.cms_editable_zones WHERE is_active;
