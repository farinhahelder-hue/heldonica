-- Purge des mots bannis encore servis en ligne (audit éditorial lot 2, 20/10/2026)
--
-- Contexte : le contrôle `check:content-coherence` ne scannait QUE cms_blog_posts.
-- Un audit exhaustif des tables de contenu (correspondance par sous-chaîne, comme
-- la CI) a montré 7 lignes ACTIVES portant un mot de FORBIDDEN_WORDS
-- (lib/brand-voice.ts) sur des pages publiées, indexables et rendues :
--
--   destinations-alentejo  faq_1_a        « hors des circuits habituels » -> « circuit »
--   destinations-portugal  cta_text       « circuits Alentejo »            -> « circuit »
--   top-10-pepites-madere  hero_text      « spots photo »                 -> « spot »
--   top-10-pepites-madere  intro_text     « des trucs incroyables »       -> « incroyable »
--   guides-top-10-...      seo_description « spots photo »                -> « spot » (meta)
--   cms_guide_items        Porto Moniz    « les autres spots »            -> « spot »
--   cms_home_destinations  madere         « Destination coup de cœur »   -> « coup de cœur »
--
-- Chaque remplacement est neutre et n'invente aucun fait (règle n°1) : il ne
-- touche que l'expression fautive, à l'intérieur de la valeur exacte.
-- Idempotent : `position(...) > 0` évite toute réécriture répétée.
--
-- NB : le repli code (.tsx / lib) de ces zones a déjà été corrigé par le commit
-- 2b6f121 ; la base primant sur le repli (EditableZone `zones[k] ?? fallback`),
-- c'est bien la base qu'il fallait corriger — la correction de code seule restait
-- invisible en ligne.

UPDATE public.cms_editable_zones SET value = replace(value, 'hors des circuits habituels', 'hors des sentiers battus'), updated_at = NOW()
  WHERE page = 'destinations-alentejo' AND zone_key = 'faq_1_a' AND position('hors des circuits habituels' in value) > 0;

UPDATE public.cms_editable_zones SET value = replace(value, 'circuits Alentejo', 'itinéraires Alentejo'), updated_at = NOW()
  WHERE page = 'destinations-portugal' AND zone_key = 'cta_text' AND position('circuits Alentejo' in value) > 0;

UPDATE public.cms_editable_zones SET value = replace(value, 'spots photo', 'coins photo'), updated_at = NOW()
  WHERE page = 'top-10-pepites-madere' AND zone_key = 'hero_text' AND position('spots photo' in value) > 0;

UPDATE public.cms_editable_zones SET value = replace(value, 'des trucs incroyables', 'des pépites'), updated_at = NOW()
  WHERE page = 'top-10-pepites-madere' AND zone_key = 'intro_text' AND position('des trucs incroyables' in value) > 0;

UPDATE public.cms_editable_zones SET value = replace(value, 'spots photo', 'coins photo'), updated_at = NOW()
  WHERE page = 'guides-top-10-pepites-madere' AND zone_key = 'seo_description' AND position('spots photo' in value) > 0;

UPDATE public.cms_guide_items SET description = replace(description, 'les autres spots', 'les autres lieux'), updated_at = NOW()
  WHERE guide_slug = 'top-10-pepites-madere' AND title = 'Porto Moniz Natural Pools' AND position('les autres spots' in description) > 0;

UPDATE public.cms_home_destinations SET eyebrow = replace(eyebrow, 'coup de cœur', 'phare'), updated_at = NOW()
  WHERE slug = 'madere' AND position('coup de cœur' in eyebrow) > 0;

-- Rollback (remet les libellés d'origine) — à jouer uniquement si la correction
-- devait être annulée ; réintroduit des mots bannis servis en ligne.
--   UPDATE public.cms_editable_zones SET value = replace(value, 'hors des sentiers battus', 'hors des circuits habituels')
--     WHERE page = 'destinations-alentejo' AND zone_key = 'faq_1_a';
--   UPDATE public.cms_editable_zones SET value = replace(value, 'itinéraires Alentejo', 'circuits Alentejo')
--     WHERE page = 'destinations-portugal' AND zone_key = 'cta_text';
--   UPDATE public.cms_editable_zones SET value = replace(value, 'coins photo', 'spots photo')
--     WHERE page IN ('top-10-pepites-madere','guides-top-10-pepites-madere') AND zone_key IN ('hero_text','seo_description');
--   UPDATE public.cms_editable_zones SET value = replace(value, 'des pépites', 'des trucs incroyables')
--     WHERE page = 'top-10-pepites-madere' AND zone_key = 'intro_text';
--   UPDATE public.cms_guide_items SET description = replace(description, 'les autres lieux', 'les autres spots')
--     WHERE guide_slug = 'top-10-pepites-madere' AND title = 'Porto Moniz Natural Pools';
--   UPDATE public.cms_home_destinations SET eyebrow = replace(eyebrow, 'phare', 'coup de cœur')
--     WHERE slug = 'madere';
