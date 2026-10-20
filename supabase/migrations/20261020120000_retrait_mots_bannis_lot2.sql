-- 2026-10-20 — Audit éditorial lot 2 : retrait de 4 mots bannis servis en ligne.
--
-- PRÉPARÉE, NON APPLIQUÉE. L'écriture en base de production requiert la
-- validation du propriétaire. Les valeurs de remplacement sont neutres et
-- factuelles ; aucun fait nouveau n'est introduit.
--
-- Constat mesuré sur le DOM rendu le 2026-10-20 (voir 2-LOT2-RAPPORT.md).
--
-- Particularité du dépôt (voir AGENTS.md) : `supabase db push` peut exécuter
-- les instructions indépendamment les unes des autres. Après application,
-- vérifier le résultat instruction par instruction.

-- 1. destinations.naples : teaser « chaos magnifique »
UPDATE destinations
SET teaser = 'Pizza napoletana, Spaccanapoli, chaos vivant'
WHERE slug = 'naples'
  AND teaser LIKE '%magnifique%';

-- 2. destinations.cabo-girao : teaser « lever du soleil inoubliable »
UPDATE destinations
SET teaser = 'Une des plus hautes falaises d''Europe, lever du soleil sur l''Atlantique.'
WHERE slug = 'cabo-girao'
  AND teaser LIKE '%inoubliable%';

-- 3. destinations.lisbonne-hors-sentiers : titre « sans les touristes ».
--    ATTENTION : ce titre alimente <title>, og:title et la carte d'article.
--    La reformulation change le libellé SEO : à valider explicitement.
UPDATE destinations
SET title = 'Lisbonne en 72h, loin des foules | Guide Heldonica'
WHERE slug = 'lisbonne-hors-sentiers'
  AND title LIKE '%sans les touristes%';

-- 4. cms_pillar_pages.roumanie : FAQ « circuit Bucarest-Transylvanie »
UPDATE cms_pillar_pages
SET faq = REPLACE(faq, 'circuit Bucarest-Transylvanie', 'itinéraire Bucarest-Transylvanie')
WHERE slug = 'roumanie'
  AND faq LIKE '%circuit Bucarest-Transylvanie%';

-- Vérification après application (attendu : 0 ligne pour chacun) :
--   SELECT slug FROM destinations WHERE teaser ILIKE '%magnifique%';
--   SELECT slug FROM destinations WHERE teaser ILIKE '%inoubliable%';
--   SELECT slug FROM destinations WHERE title ILIKE '%touristes%';
--   SELECT slug FROM cms_pillar_pages WHERE faq ILIKE '%circuit%';
