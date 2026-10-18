-- Cohérence du contenu publié : derniers mots bannis et images cassées
--
-- Objectif du fondateur (18/10/2026) : zéro contenu incohérent en ligne.
-- 1. Mots de FORBIDDEN_WORDS (lib/brand-voice.ts) restés dans des zones de pages
--    publiées après 20261011130000 (relevé exhaustif des zones actives) et dans
--    l'article Maramureș : remplacés par un équivalent neutre, sans rien inventer.
-- 2. Images cassées dans 4 articles publiés : fichiers jamais envoyés (404, Kotor,
--    Lisbonne, Podgorica) ou adresse fausse (Fanal : « fyfmuxygq »). Le lecteur voyait
--    un cadre vide. Retirées ; le texte reste. À remettre avec les originaux — la photo
--    de Fanal existe à la bonne adresse mais semble générée : à confirmer (règle n°1).
--
-- Garde-fous : chaque remplacement ne touche que le texte exact. Idempotent.

UPDATE public.cms_editable_zones SET value = replace(value, 'notre spot préféré', 'notre coin préféré'), updated_at = NOW()
  WHERE page = 'destinations-alentejo' AND zone_key = 'pepite_4_desc' AND position('notre spot préféré' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'le circuit Transylvanie', 'l''itinéraire Transylvanie'), updated_at = NOW()
  WHERE page = 'destinations-roumanie-itineraire-7-jours' AND zone_key = 'hero_description' AND position('le circuit Transylvanie' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'journée préférée du circuit', 'journée préférée de l''itinéraire'), updated_at = NOW()
  WHERE page = 'destinations-roumanie-itineraire-7-jours' AND zone_key = 'day_4_detail' AND position('journée préférée du circuit' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'pas pour les touristes', 'pas pour les visiteurs de passage'), updated_at = NOW()
  WHERE page = 'destinations-roumanie-itineraire-7-jours' AND zone_key = 'day_5_detail' AND position('pas pour les touristes' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'celle que les touristes effleurent', 'celle que les voyages pressés effleurent'), updated_at = NOW()
  WHERE page = 'destinations-roumanie-itineraire-10-jours' AND zone_key = 'day_8_detail' AND position('celle que les touristes effleurent' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'Le circuit complet', 'L''itinéraire complet'), updated_at = NOW()
  WHERE page = 'destinations-roumanie-itineraire-10-jours' AND zone_key = 'seo_description' AND position('Le circuit complet' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'Ce circuit 5 jours', 'Cet itinéraire de 5 jours'), updated_at = NOW()
  WHERE page = 'destinations-roumanie-itineraire-5-jours' AND zone_key = 'blurb' AND position('Ce circuit 5 jours' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'Le matin incontournable.', 'Notre rendez-vous du matin.'), updated_at = NOW()
  WHERE page = 'destinations-roumanie-timisoara' AND zone_key = 'eat_2' AND position('Le matin incontournable.' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'est magnifique.', 'offre de très beaux paysages.'), updated_at = NOW()
  WHERE page = 'destinations-roumanie-timisoara' AND zone_key = 'faq_2_a' AND position('est magnifique.' in value) > 0;
UPDATE public.cms_editable_zones SET value = replace(value, 'les tips pour éviter les pièges à éviter', 'les conseils pour éviter les pièges'), updated_at = NOW()
  WHERE page = 'top-10-pepites-madere' AND zone_key = 'cta_text' AND position('les tips pour éviter les pièges à éviter' in value) > 0;

UPDATE public.cms_blog_posts SET content = replace(content, 'un décor unique au cœur de la vallée sauvage', 'un décor unique au fond de la vallée sauvage'), updated_at = NOW()
  WHERE slug = 'maramures-roumanie-authentique' AND position('au cœur de la vallée sauvage' in content) > 0;
UPDATE public.cms_blog_posts SET content = regexp_replace(regexp_replace(content, '<figure[^>]*>\s*<img[^>]*PXL_20260528_082326237[^>]*>.*?</figure>\s*', '', 'g'), '<img[^>]*PXL_20260528_082326237[^>]*>\s*', '', 'g'), updated_at = NOW()
  WHERE slug = 'kotor-a-laube-remparts-venitiens-bouches-de-kotor' AND position('PXL_20260528_082326237' in content) > 0;
UPDATE public.cms_blog_posts SET content = regexp_replace(regexp_replace(content, '<figure[^>]*>\s*<img[^>]*PXL_20260528_101805508[^>]*>.*?</figure>\s*', '', 'g'), '<img[^>]*PXL_20260528_101805508[^>]*>\s*', '', 'g'), updated_at = NOW()
  WHERE slug = 'kotor-a-laube-remparts-venitiens-bouches-de-kotor' AND position('PXL_20260528_101805508' in content) > 0;
UPDATE public.cms_blog_posts SET content = regexp_replace(regexp_replace(content, '<figure[^>]*>\s*<img[^>]*DSC_0139[^>]*>.*?</figure>\s*', '', 'g'), '<img[^>]*DSC_0139[^>]*>\s*', '', 'g'), updated_at = NOW()
  WHERE slug = 'lisbonne-ruelles-alfama-miradouros-azulejos' AND position('DSC_0139' in content) > 0;
UPDATE public.cms_blog_posts SET content = regexp_replace(regexp_replace(content, '<figure[^>]*>\s*<img[^>]*DSC_0177[^>]*>.*?</figure>\s*', '', 'g'), '<img[^>]*DSC_0177[^>]*>\s*', '', 'g'), updated_at = NOW()
  WHERE slug = 'lisbonne-ruelles-alfama-miradouros-azulejos' AND position('DSC_0177' in content) > 0;
UPDATE public.cms_blog_posts SET content = regexp_replace(regexp_replace(content, '<figure[^>]*>\s*<img[^>]*PXL_20260528_150212299[^>]*>.*?</figure>\s*', '', 'g'), '<img[^>]*PXL_20260528_150212299[^>]*>\s*', '', 'g'), updated_at = NOW()
  WHERE slug = 'podgorica-capitale-oubliee-montenegro' AND position('PXL_20260528_150212299' in content) > 0;
UPDATE public.cms_blog_posts SET content = regexp_replace(regexp_replace(content, '<figure[^>]*>\s*<img[^>]*PXL_20260528_174214721[^>]*>.*?</figure>\s*', '', 'g'), '<img[^>]*PXL_20260528_174214721[^>]*>\s*', '', 'g'), updated_at = NOW()
  WHERE slug = 'podgorica-capitale-oubliee-montenegro' AND position('PXL_20260528_174214721' in content) > 0;
UPDATE public.cms_blog_posts SET content = regexp_replace(content, '!\[[^\]]*\]\([^)]*fanal_foret\.jpg[^)]*\)\s*', '', 'g'), updated_at = NOW()
  WHERE slug = 'foret-fanal-levadas-mystiques-madere-slow-travel' AND position('fyfmuxygq' in content) > 0;
