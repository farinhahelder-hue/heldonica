-- ============================================================================
-- Héros des pages d'index : /blog et /destinations pilotés par le CMS
-- Date: 2026-07-31 — suite de 20260731_cms_zones_heros_index_arbitrage.sql
-- ============================================================================
-- La migration précédente neutralisait ces zones pour ne pas entretenir deux
-- sources de vérité. C'était résoudre le conflit du mauvais côté : le texte
-- restait figé dans le code, donc non modifiable sans redéploiement.
--
-- Objectif retenu : le contenu change sans redéploiement, la mécanique reste
-- dans le code, une seule source de vérité par contenu. On réaligne donc les
-- zones sur le texte arbitré, et c'est le CMS qui les sert.
--
-- ⚠️ Correction d'un constat erroné de la migration précédente : le hero de
-- /destinations n'était PAS piloté par site_settings. Les clés
-- destinations_hub_badge / _title / _subtitle n'existent dans aucune des 181
-- lignes de site_settings — le composant retombait systématiquement sur ses
-- littéraux. Les deux héros étaient donc entièrement codés en dur.
--
-- Les valeurs ci-dessous sont EXACTEMENT le texte affiché jusqu'ici :
-- l'arbitrage éditorial est préservé au caractère près, seul le mécanisme
-- change. Aucun changement visible attendu.


-- ─── /blog ──────────────────────────────────────────────────────────────────
-- Le titre tient sur deux lignes, séparées par un <br /> dans le code. Le saut
-- devient un vrai retour à la ligne dans la valeur, rendu via `whitespace-pre-line`.
-- Il reste ainsi modifiable depuis l'admin, au lieu d'être une balise figée.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('blog', 'hero_badge',    'text',     'Blog Heldonica', 'Surtitre du hero', true),
  ('blog', 'hero_title',    'textarea', 'Des moments, des détours,
des repères qu''on aurait aimé avoir avant.', 'Titre du hero', true),
  ('blog', 'hero_subtitle', 'textarea', 'On écrit depuis le terrain : une arrivée trop tardive, une adresse trouvée au bon moment, une erreur qu''on ne refera pas. Le reste, on le laisse aux brochures.', 'Paragraphe du hero', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();


-- ─── /destinations ──────────────────────────────────────────────────────────
-- Texte retenu : « Nos destinations slow travel en couple », jugé plus précis
-- en référencement que « Destinations Heldonica », qui est écarté.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('destinations', 'hero_badge',    'text',     'Hub destinations', 'Surtitre du hero', true),
  ('destinations', 'hero_title',    'text',     'Nos destinations slow travel en couple', 'Titre du hero', true),
  ('destinations', 'hero_subtitle', 'textarea', 'Toutes nos destinations testées sur le terrain — pas de contenu généré sans vécu.', 'Paragraphe du hero', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();


-- `page_title` et `intro_text` restent neutralisés sur les deux pages : le
-- premier doublonne l'export `metadata` statique, le second le paragraphe de
-- hero ci-dessus. Les rendre actifs recréerait le doublon qu'on vient de lever.


-- ─── Vérification (lecture seule) ───────────────────────────────────────────

SELECT page, zone_key, is_active, left(replace(value, chr(10), ' / '), 58) AS value
FROM public.cms_editable_zones
WHERE page IN ('blog', 'destinations')
ORDER BY page, is_active DESC, zone_key;
