-- Corrections de coquilles averees dans les zones CMS
--
-- Trois chaines collees ou mal orthographiees, visibles en ligne, corrigees
-- a l'identique dans le code du depot (app/destinations/alentejo/page.tsx,
-- lib/cms-vault-spots.ts). La base est la source de verite : sans cette
-- migration, la correction du code resterait masquee par la valeur CMS.
--
-- Idempotente : `position(...) > 0` rend chaque instruction sans effet si la
-- coquille a deja disparu.
--
-- DELIBEREMENT EXCLU : le badge `cms_pillar_pages.roumanie.tested_by_heldonica.duration`
-- annonce « 9 jours » alors que `itinerary` contient 7 entrees et que `seo_desc`
-- annonce un itineraire de 7 jours. La contradiction est reelle, mais un sejour
-- de 9 jours peut parfaitement avoir produit un itineraire publie de 7 : le
-- chiffre juste est une decision du proprietaire, pas une deduction technique.
-- Voir .audit/audit-2026-10-18/5-DECISIONS-PROPRIETAIRE.md.

-- « Évoramonsaraz » : deux villes (Évora, Monsaraz) collees en un seul mot.
UPDATE public.cms_editable_zones
SET value = replace(value, 'Évoramonsaraz', 'Évora et Monsaraz'), updated_at = NOW()
WHERE page = 'destinations-alentejo' AND zone_key = 'intro_2'
  AND position('Évoramonsaraz' in value) > 0;

UPDATE public.cms_editable_zones
SET value = replace(value, 'Évoramonsaraz', 'Évora et Monsaraz'), updated_at = NOW()
WHERE page = 'destinations-alentejo' AND zone_key = 'faq_2_a'
  AND position('Évoramonsaraz' in value) > 0;

-- « agritourismes » : la forme correcte au singulier est « agritourisme ».
UPDATE public.cms_editable_zones
SET value = replace(value, 'agritourismes', 'agritourisme'), updated_at = NOW()
WHERE page = 'destinations-sardaigne' AND zone_key = 'zone_3_desc'
  AND position('agritourismes' in value) > 0;
