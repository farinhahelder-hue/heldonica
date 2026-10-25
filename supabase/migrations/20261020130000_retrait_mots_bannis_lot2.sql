-- 2026-10-20 — Audit éditorial lot 2 : retrait des mots bannis servis en ligne.
--
-- APPLIQUÉE le 2026-10-20 en production (validation propriétaire donnée).
-- REMPLACE le premier jet 20261020120000, qui était faux sur trois points :
--   - il ciblait destinations.teaser pour cabo-girao (le mot est dans .excerpt) ;
--   - il ignorait la duplication dans map_markers (rendu sur /destinations/carte) ;
--   - il passait cms_pillar_pages.faq (jsonb) à REPLACE sans cast (erreur de type).
--
-- Particularité du dépôt (AGENTS.md) : `supabase db push` peut exécuter les
-- instructions indépendamment. Vérifier le résultat instruction par instruction.

UPDATE destinations SET teaser = 'Pizza napoletana, Spaccanapoli, chaos vivant'
WHERE slug = 'naples' AND teaser LIKE '%magnifique%';

UPDATE destinations SET excerpt = 'Une des plus hautes falaises d''Europe, lever du soleil sur l''Atlantique.'
WHERE slug = 'cabo-girao' AND excerpt LIKE '%inoubliable%';

UPDATE map_markers SET excerpt = 'Une des plus hautes falaises d''Europe, lever du soleil sur l''Atlantique.'
WHERE slug = 'cabo-girao' AND excerpt LIKE '%inoubliable%';

UPDATE destinations SET excerpt = 'Villages saxons oubliés, forêts de hêtres, châteaux loin des foules. Notre itinéraire Transylvanie slow travel'
WHERE slug = 'roumanie-transylvanie' AND excerpt LIKE '%touristes%';

-- Ce titre alimente <title>, og:title et la carte d'article : change le libellé SEO.
UPDATE destinations SET title = 'Lisbonne en 72h, loin des foules | Guide Heldonica'
WHERE slug = 'lisbonne-hors-sentiers' AND title LIKE '%sans les touristes%';

UPDATE cms_pillar_pages
SET faq = REPLACE(faq::text, 'circuit Bucarest-Transylvanie', 'itinéraire Bucarest-Transylvanie')::jsonb
WHERE slug = 'roumanie' AND faq::text LIKE '%circuit Bucarest-Transylvanie%';

-- Vérification après application (attendu : 0 ligne pour chacun) :
--   SELECT slug FROM destinations WHERE teaser ILIKE '%magnifique%';
--   SELECT slug FROM destinations WHERE excerpt ILIKE '%inoubliable%';
--   SELECT slug FROM destinations WHERE excerpt ILIKE '%touristes%';
--   SELECT slug FROM destinations WHERE title ILIKE '%touristes%';
--   SELECT slug FROM map_markers WHERE excerpt ILIKE '%inoubliable%';
--   SELECT slug FROM cms_pillar_pages WHERE faq::text ILIKE '%circuit Bucharest%';
