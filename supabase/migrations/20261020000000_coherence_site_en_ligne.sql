-- Cohérence du site en ligne : relevé du 19/10/2026 au soir
--
-- Audit des 86 pages publiques de heldonica.fr. Le code règle une partie des
-- écarts (PR agent/claude/coherence-en-ligne) ; ceux-ci viennent de la base.
--
-- 1. Photos écartées, encore servies
--    - moraca_millennium.jpg (rendu retouché/généré, écarté le 19/10, cf.
--      20261019030000) : hero et image de partage de /destinations/montenegro
--      (cms_pillar_pages.hero), et une figure de l'article Podgorica. Le hero
--      passe à la tour de l'Horloge (sahat_kula.jpg), couverture validée de
--      l'article, comme destinations.featured_image le 19/10 ; la figure est
--      retirée, le texte reste.
--    - Tour Eiffel de stock (import-1779113929226.jpg) : zones hero_image et
--      seo_og_image de destinations-paris et destinations-idf-paris.
--    - IMG_20260827_135025.jpg en hero_image de destinations-roumanie-maramures :
--      mêmes maisons qu'une photo de l'article Apuseni, 6 minutes d'écart. Ce
--      n'est pas le Maramureș.
--    Ces zones sont désactivées, pas supprimées : la page retombe sur l'image
--    par défaut (masquée), et la ligne reste pour revenir en arrière.
--
-- 2. Texte
--    - Article Poncha : « préparée devant on », substitution nous → on cassée.
--    - À propos : « 25+ Carnets publiés » ; 8 articles sont publiés.
--    - Mots de FORBIDDEN_WORDS (lib/brand-voice.ts) : « inoubliable » (carte,
--      Cabo Girão), « magnifique » (Naples, page comparer), « les touristes »
--      (Lisbonne, page comparer), « circuit » (FAQ Roumanie). Retirés ou
--      remplacés par un équivalent neutre, sans rien inventer.
--    - « On prépare le guide grèce » : 15 titres de pages « Bientôt »
--      enregistrés avec le nom en minuscules.
--
-- Garde-fous : chaque mise à jour ne touche que la valeur exacte relevée.
-- Idempotent.

-- 1. Photos ------------------------------------------------------------------

UPDATE public.cms_pillar_pages
SET hero = 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    updated_at = NOW()
WHERE slug = 'montenegro' AND hero LIKE '%moraca_millennium%';

-- Sans « .*? » : en Postgres, une expression dont le premier quantificateur est
-- gourmand l'est tout entière, et « .*?</figure> » irait jusqu'à la dernière
-- figure de l'article. Ici chaque répétition est bornée par [^>] ou [^<].
UPDATE public.cms_blog_posts
SET content = regexp_replace(
      regexp_replace(content,
        '<figure[^>]*>\s*<img[^>]*moraca_millennium\.jpg[^>]*>\s*<figcaption[^>]*>[^<]*</figcaption>\s*</figure>\s*', '', 'g'),
      '<img[^>]*moraca_millennium\.jpg[^>]*>\s*', '', 'g'),
    updated_at = NOW()
WHERE slug = 'podgorica-capitale-oubliee-montenegro' AND position('moraca_millennium' in content) > 0;

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE page IN ('destinations-paris', 'destinations-idf-paris')
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND value LIKE '%/import-1779113929226.jpg'
  AND is_active;

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE page = 'destinations-roumanie-maramures'
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND value LIKE '%/IMG_20260827_135025.jpg'
  AND is_active;

-- 2. Texte -------------------------------------------------------------------

UPDATE public.cms_blog_posts
SET content = replace(content, 'préparée devant on,', 'préparée devant nous,'), updated_at = NOW()
WHERE slug = 'poncha-recette-authentique' AND position('préparée devant on,' in content) > 0;

UPDATE public.cms_editable_zones SET value = '8', updated_at = NOW()
WHERE page = 'a-propos' AND zone_key = 'stat_2_value' AND value = '25+';

UPDATE public.map_markers
SET excerpt = 'Une des plus hautes falaises d''Europe.', updated_at = NOW()
WHERE slug = 'cabo-girao' AND excerpt = 'Une des plus hautes falaises d''Europe, lever du soleil inoubliable.';

UPDATE public.destinations
SET excerpt = 'Une des plus hautes falaises d''Europe.', updated_at = NOW()
WHERE slug = 'cabo-girao' AND excerpt = 'Une des plus hautes falaises d''Europe, lever du soleil inoubliable.';

UPDATE public.destinations
SET teaser = 'Pizza napoletana, Spaccanapoli', updated_at = NOW()
WHERE slug = 'naples' AND teaser = 'Pizza napoletana, Spaccanapoli, chaos magnifique';

UPDATE public.destinations
SET title = 'Lisbonne en 72h | Guide Heldonica', updated_at = NOW()
WHERE title = 'Lisbonne en 72h sans les touristes | Guide Heldonica';

UPDATE public.cms_pillar_pages
SET faq = replace(faq::text, 'pour un circuit Bucarest-Transylvanie', 'pour un itinéraire Bucarest-Transylvanie')::jsonb,
    updated_at = NOW()
WHERE slug = 'roumanie' AND position('pour un circuit Bucarest-Transylvanie' in faq::text) > 0;

UPDATE public.cms_editable_zones AS z
SET value = 'On prépare le guide ' || v.nom || ' — à notre façon.', updated_at = NOW()
FROM (VALUES
  ('destinations-colombie-bogota', 'Bogota'),
  ('destinations-colombie-cali', 'Cali'),
  ('destinations-colombie-cartago', 'Cartago'),
  ('destinations-colombie-medellin', 'Medellin'),
  ('destinations-grece', 'Grèce'),
  ('destinations-sardaigne-alghero', 'Alghero'),
  ('destinations-sardaigne-asinara', 'Asinara'),
  ('destinations-sardaigne-cagliari', 'Cagliari'),
  ('destinations-sardaigne-costa-smeralda', 'Costa Smeralda'),
  ('destinations-sardaigne-nuoro', 'Nuoro'),
  ('destinations-sicile-catane', 'Catane'),
  ('destinations-sicile-etoile', 'Isole Eoliennes'),
  ('destinations-sicile-palerme', 'Palerme'),
  ('destinations-sicile-syracuse', 'Syracuse'),
  ('destinations-sicile-taormine', 'Taormine')
) AS v(page, nom)
WHERE z.page = v.page
  AND z.zone_key = 'section_title'
  AND z.value = 'On prépare le guide ' || lower(v.nom) || ' — à notre façon.';
