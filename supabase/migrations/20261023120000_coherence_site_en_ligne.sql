-- Cohérence du site en ligne, relue en base le 23/10/2026.
-- Remplace supabase/migrations/20261020000000 de la PR 656.
-- Chaque écriture ne touche que la valeur encore présente. Idempotent.
-- Non repris, déjà corrigé en base : FAQ Roumanie, Naples, Lisbonne, Cabo Girão.

UPDATE public.cms_pillar_pages AS p
SET hero = d.featured_image,
    updated_at = NOW()
FROM public.destinations AS d
WHERE p.slug = 'montenegro'
  AND d.slug = 'montenegro'
  AND p.hero LIKE '%moraca_millennium%'
  AND d.featured_image LIKE '%sahat_kula%';

UPDATE public.cms_blog_posts
SET content = regexp_replace(
      regexp_replace(content,
        '<figure[^>]*>\s*<img[^>]*moraca_millennium\.jpg[^>]*>\s*<figcaption[^>]*>[^<]*</figcaption>\s*</figure>\s*', '', 'g'),
      '<img[^>]*moraca_millennium\.jpg[^>]*>\s*', '', 'g'),
    updated_at = NOW()
WHERE slug = 'podgorica-capitale-oubliee-montenegro'
  AND position('moraca_millennium' in content) > 0;

UPDATE public.cms_editable_zones
SET is_active = false, updated_at = NOW()
WHERE page IN ('destinations-paris', 'destinations-idf-paris')
  AND zone_key IN ('hero_image', 'seo_og_image')
  AND value LIKE '%/import-1779113929226.jpg'
  AND is_active;

UPDATE public.cms_editable_zones
SET is_active = false, updated_at = NOW()
WHERE page = 'destinations-roumanie-maramures'
  AND zone_key = 'hero_image'
  AND value LIKE '%/IMG_20260827_135025.jpg'
  AND is_active;

UPDATE public.cms_blog_posts
SET content = replace(content, 'préparée devant on,', 'préparée devant nous,'),
    updated_at = NOW()
WHERE slug = 'poncha-recette-authentique'
  AND position('préparée devant on,' in content) > 0;

UPDATE public.cms_editable_zones
SET value = (
      SELECT count(*)::text
      FROM public.cms_blog_posts
      WHERE published IS TRUE
    ),
    updated_at = NOW()
WHERE page = 'a-propos'
  AND zone_key = 'stat_2_value'
  AND value = '25+';

UPDATE public.cms_editable_zones AS z
SET value = v.apres, updated_at = NOW()
FROM (VALUES
  ('destinations-colombie-bogota', 'On prépare le guide bogota — à notre façon.', 'On prépare le guide Bogota — à notre façon.'),
  ('destinations-colombie-cali', 'On prépare le guide cali — à notre façon.', 'On prépare le guide Cali — à notre façon.'),
  ('destinations-colombie-cartago', 'On prépare le guide cartago — à notre façon.', 'On prépare le guide Cartago — à notre façon.'),
  ('destinations-colombie-medellin', 'On prépare le guide medellin — à notre façon.', 'On prépare le guide Medellin — à notre façon.'),
  ('destinations-grece', 'On prépare le guide grèce — à notre façon.', 'On prépare le guide Grèce — à notre façon.'),
  ('destinations-sardaigne-alghero', 'On prépare le guide alghero — à notre façon.', 'On prépare le guide Alghero — à notre façon.'),
  ('destinations-sardaigne-asinara', 'On prépare le guide asinara — à notre façon.', 'On prépare le guide Asinara — à notre façon.'),
  ('destinations-sardaigne-cagliari', 'On prépare le guide cagliari — à notre façon.', 'On prépare le guide Cagliari — à notre façon.'),
  ('destinations-sardaigne-costa-smeralda', 'On prépare le guide costa smeralda — à notre façon.', 'On prépare le guide Costa Smeralda — à notre façon.'),
  ('destinations-sardaigne-nuoro', 'On prépare le guide nuoro — à notre façon.', 'On prépare le guide Nuoro — à notre façon.'),
  ('destinations-sicile-catane', 'On prépare le guide catane — à notre façon.', 'On prépare le guide Catane — à notre façon.'),
  ('destinations-sicile-etoile', 'On prépare le guide isole eoliennes — à notre façon.', 'On prépare le guide Isole Eoliennes — à notre façon.'),
  ('destinations-sicile-palerme', 'On prépare le guide palerme — à notre façon.', 'On prépare le guide Palerme — à notre façon.'),
  ('destinations-sicile-syracuse', 'On prépare le guide syracuse — à notre façon.', 'On prépare le guide Syracuse — à notre façon.'),
  ('destinations-sicile-taormine', 'On prépare le guide taormine — à notre façon.', 'On prépare le guide Taormine — à notre façon.')
) AS v(page, avant, apres)
WHERE z.page = v.page
  AND z.zone_key = 'section_title'
  AND z.value = v.avant;
