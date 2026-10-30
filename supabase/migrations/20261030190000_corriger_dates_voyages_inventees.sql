-- Migration 20261030190000_corriger_dates_voyages_inventees.sql
-- Correction de dates de voyage inventées (règle n°1 : on n'invente rien).
-- Décision du propriétaire du 2026-10-30 : « C'est avril 2026 ».
--
-- CONSTAT MESURÉ
-- Le contenu affirme deux voyages en « Septembre 2025 ». Or il n'existe AUCUNE
-- photo de 2025 dans la médiathèque : la répartition complète de
-- `cms_media.taken_at` est 2026-04 (9), 2026-05 (92), 2026-08 (147), 2026-09 (5).
-- Zéro ligne en 2025.
--
--   · Madère    — carnet « Septembre 2025 »  / photos réelles 23–25 avril 2026
--   · Roumanie  — carnet « Septembre 2025 »  / photos réelles 25–31 août 2026
--   · Monténégro — carnet « Fin mai 2026 »   / photos réelles 27 mai 2026 → CORRECT
--
-- Les trois carnets ont été créés à la même seconde (2026-07-30 12:02:32) :
-- une génération en lot a inventé « Septembre 2025 » et l'a recopiée sur deux
-- destinations sur trois. Le Monténégro est le contre-exemple qui prouve que la
-- valeur était saisissable correctement.
--
-- PORTÉE — Madère et Roumanie uniquement
-- `roumanie` est `is_active = true` : sa page est EN LIGNE, indexable, dans le
-- sitemap, et affiche « Septembre 2025 ». C'est l'urgence.
-- `madere` est `is_active = false` (« Bientôt ») : rien n'est visible, mais la
-- valeur fausse reste en base et ressortirait à la publication.
--
-- Les carnets Suisse ne sont pas touchés ici : leur chronologie (juillet 2025,
-- photos `PXL_20250712_*`) est distincte et cohérente avec l'année 2025. Un écart
-- y subsiste entre `zurich` (« 2026 ») et ses propres photos de juillet 2025 —
-- à traiter séparément, hors de cette migration.
--
-- CE QUE CETTE MIGRATION NE FAIT PAS
-- Aucun `DELETE`, aucune donnée perdue : les dates sont REMPLACÉES, les articles
-- restent en brouillon, rien n'est publié ni dépublié. Les durées (« 8 jours »,
-- « 9 jours ») ne sont pas touchées : les imports photo pouvant être partiels,
-- elles ne sont pas prouvées fausses.
--
-- Idempotente : chaque `replace()` est conditionné par un `LIKE` sur la chaîne
-- fautive. Rejouable sans effet de bord.
--
-- Retour arrière : réécrire les valeurs d'origine par une nouvelle migration
-- versionnée. Les valeurs remplacées sont citées en commentaire au-dessus de
-- chaque instruction.

-- ─── 1. Carnet Roumanie (EN LIGNE) : « Septembre 2025 » → « Août 2026 » ───────
UPDATE public.cms_pillar_pages
SET tested_by_heldonica = jsonb_set(
      tested_by_heldonica,
      '{when}',
      to_jsonb('Août 2026'::text)
    ),
    updated_at = NOW()
WHERE slug = 'roumanie'
  AND tested_by_heldonica->>'when' = 'Septembre 2025';

-- ─── 2. Carnet Madère (brouillon) : « Septembre 2025 » → « Avril 2026 » ───────
UPDATE public.cms_pillar_pages
SET tested_by_heldonica = jsonb_set(
      tested_by_heldonica,
      '{when}',
      to_jsonb('Avril 2026'::text)
    ),
    updated_at = NOW()
WHERE slug = 'madere'
  AND tested_by_heldonica->>'when' = 'Septembre 2025';

-- ─── 3. Article bacalhau-a-lagareiro ─────────────────────────────────────────
-- excerpt : « lors de nos séjours en 2025 et 2026 »
UPDATE public.cms_blog_posts
SET excerpt = replace(excerpt, 'nos séjours en 2025 et 2026', 'notre séjour en avril 2026'),
    updated_at = NOW()
WHERE slug = 'bacalhau-a-lagareiro'
  AND excerpt LIKE '%nos séjours en 2025 et 2026%';

-- content : « au retour de nos séjours au Portugal entre 2025 et 2026 »
UPDATE public.cms_blog_posts
SET content = replace(content, 'nos séjours au Portugal entre 2025 et 2026', 'notre séjour au Portugal en avril 2026'),
    updated_at = NOW()
WHERE slug = 'bacalhau-a-lagareiro'
  AND content LIKE '%nos séjours au Portugal entre 2025 et 2026%';

-- ─── 4. Article bolo-do-caco-recette-traditionnelle-de-madere-3 ──────────────
-- excerpt : « Notre recette vécue et testée à Madère en 2025 et 2026. »
UPDATE public.cms_blog_posts
SET excerpt = replace(excerpt, 'testée à Madère en 2025 et 2026', 'testée à Madère en avril 2026'),
    updated_at = NOW()
WHERE slug = 'bolo-do-caco-recette-traditionnelle-de-madere-3'
  AND excerpt LIKE '%testée à Madère en 2025 et 2026%';

-- content : « lors de nos séjours à Madère entre 2025 et 2026 »
UPDATE public.cms_blog_posts
SET content = replace(content, 'nos séjours à Madère entre 2025 et 2026', 'notre séjour à Madère en avril 2026'),
    updated_at = NOW()
WHERE slug = 'bolo-do-caco-recette-traditionnelle-de-madere-3'
  AND content LIKE '%nos séjours à Madère entre 2025 et 2026%';

-- ─── 5. Article prego-no-bolo-do-caco ────────────────────────────────────────
-- Légende : « Câmara de Lobos, octobre 2025 » — Câmara de Lobos est à Madère.
UPDATE public.cms_blog_posts
SET content = replace(content, 'Câmara de Lobos, octobre 2025', 'Câmara de Lobos, avril 2026'),
    updated_at = NOW()
WHERE slug = 'prego-no-bolo-do-caco'
  AND content LIKE '%Câmara de Lobos, octobre 2025%';

-- ─── 6. Article foret-fanal-levadas-mystiques-madere-slow-travel ─────────────
-- « En explorant l'île en septembre 2025 »
UPDATE public.cms_blog_posts
SET content = replace(content, 'En explorant l''île en septembre 2025', 'En explorant l''île en avril 2026'),
    updated_at = NOW()
WHERE slug = 'foret-fanal-levadas-mystiques-madere-slow-travel'
  AND content LIKE '%En explorant l''île en septembre 2025%';

-- ─── Vérification : plus aucune date 2025 sur Madère ni Roumanie ─────────────
DO $$
DECLARE
  carnets_fautifs int;
  articles_fautifs int;
BEGIN
  SELECT COUNT(*) INTO carnets_fautifs
  FROM public.cms_pillar_pages
  WHERE slug IN ('madere', 'roumanie')
    AND tested_by_heldonica->>'when' LIKE '%2025%';

  SELECT COUNT(*) INTO articles_fautifs
  FROM public.cms_blog_posts
  WHERE slug IN (
    'bacalhau-a-lagareiro',
    'bolo-do-caco-recette-traditionnelle-de-madere-3',
    'prego-no-bolo-do-caco',
    'foret-fanal-levadas-mystiques-madere-slow-travel'
  )
  AND (excerpt LIKE '%2025%' OR content LIKE '%2025%');

  IF carnets_fautifs <> 0 THEN
    RAISE WARNING 'Attendu 0 carnet avec 2025, trouvé %', carnets_fautifs;
  END IF;
  IF articles_fautifs <> 0 THEN
    RAISE WARNING 'Attendu 0 article avec 2025, trouvé %', articles_fautifs;
  END IF;
END $$;
