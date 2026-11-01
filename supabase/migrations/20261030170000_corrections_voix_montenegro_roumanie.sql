-- ─── Corrections de voix : mots bannis passés en production ───────────────────
-- Contexte : la migration 20261030150000 (PR #787) a mis en ligne deux mots
-- bannis sur le pilier Monténégro, et deux autres dormaient dans cms_seasons.
--
-- Pourquoi le garde-fou ne les a pas vus : `scripts/check-content-coherence.mjs`
-- scanne cms_editable_zones, cms_home_destinations, cms_sub_destinations et
-- cms_guide_items — mais NI cms_pillar_pages NI cms_seasons. Angle mort à
-- combler ; en attendant, cette migration est le seul filet.
--
-- Écritures idempotentes : `replace()` ne fait rien si la chaîne est déjà
-- corrigée. Rejouable sans effet de bord.

-- 1. Pilier Monténégro — FAQ : « circuit » est un mot banni.
UPDATE public.cms_pillar_pages
SET faq = replace(faq::text, 'les circuits touristiques rapides', 'les itinéraires éclair')::jsonb,
    updated_at = NOW()
WHERE slug = 'montenegro'
  AND faq::text LIKE '%circuits touristiques rapides%';

-- 2. Pilier Monténégro — verdict : « coup de cœur » est banni.
UPDATE public.cms_pillar_pages
SET verdict = replace(verdict::text, 'Notre coup de cœur au Monténégro', 'L''étape qui nous a le plus marqués au Monténégro')::jsonb,
    updated_at = NOW()
WHERE slug = 'montenegro'
  AND verdict::text LIKE '%coup de cœur%';

-- 3. cms_seasons Monténégro — carte « Automne » : « coup de cœur » banni.
UPDATE public.cms_seasons
SET note = replace(note, 'Notre coup de cœur', 'Notre saison préférée'),
    updated_at = NOW()
WHERE destination_slug = 'montenegro'
  AND note LIKE '%coup de cœur%';

-- 4. cms_seasons Roumanie — carte « Été » : « incontournable » banni.
UPDATE public.cms_seasons
SET note = replace(note, 'sont incontournables', 'battent leur plein'),
    updated_at = NOW()
WHERE destination_slug = 'roumanie'
  AND note LIKE '%incontournables%';
