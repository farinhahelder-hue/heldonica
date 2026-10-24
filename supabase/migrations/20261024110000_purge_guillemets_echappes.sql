-- Migration 20261024110000_purge_guillemets_echappes.sql
-- Audit éditorial du lot 2 : retrait de l'antislash devant un guillemet dans une
-- balise (`class=\"…\"` → `class="…"`).
--
-- Défaut : `sql/seed_cms_zones_complete.sql:49` écrivait `class=\"italic
-- text-eucalyptus\"` — réflexe JS/JSON — dans une chaîne SQL entre guillemets
-- simples, où l'antislash reste littéral. Le HTML servi porte donc `class=\"…\"`.
-- Mesuré au parseur (jsdom) : `<span class=\"italic text-eucalyptus\">` donne
-- `class="\"italic"` **et** un attribut parasite `text-eucalyptus\"`. La classe
-- Tailwind est perdue : « autrement » s'affichait sans italique ni eucalyptus,
-- sans aucune erreur visible.
--
-- Relevé le 24/10/2026, page d'accueil (`home`/`section_story_title`), actif, donc
-- visible en ligne. Périmètre mesuré (641 colonnes texte balayées) :
--   * `cms_editable_zones.value` : 1 ligne (la seule dont un antislash-guillemet
--     tombe DANS une balise ; les 22 autres lignes de la table qui contiennent
--     `\"` l'ont en prose, où l'antislash est légitime et n'est pas touché) ;
--   * `cms_blog_posts.content` : 0 ligne.
--
-- Volontairement limité à ces deux tables de contenu : la clé `home_cat_icons` de
-- `site_settings` (type `json`) porte des tracés SVG où `\"` est un échappement
-- valide. Le corriger casserait le JSON (vérifié : json.loads échoue après
-- substitution).
--
-- Le correctif de rendu (`lib/html-attributes.ts`, appelé par `normalizeZoneText`
-- et `markdownToHtml`) couvre déjà l'affichage. Cette migration nettoie la source
-- pour que la base ne serve plus jamais l'attribut fautif à un autre consommateur
-- (export, email, application mobile), et pour que le seed corrigé soit cohérent
-- avec l'état réel.
--
-- `[^<>]*?` (non glouton) borne le remplacement à l'intérieur d'une balise et
-- s'arrête au premier antislash-guillemet. Comme le `<` est consommé par chaque
-- match, une passe ne traite qu'une occurrence par balise : on répète 4 fois
-- (aucune balise du périmètre n'en porte plus d'une). Le motif ne franchit jamais
-- `<` ni `>`, donc un antislash en prose reste intact.
--
-- Retour arrière : il faudrait réintroduire l'antislash (`class="…"` →
-- `class=\"…\"`) sur la même clé. Non fourni volontairement : l'état d'avant est
-- le défaut, et le seed corrigé fait foi.

UPDATE public.cms_editable_zones
SET value = regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(value, '(<[^<>]*?)\\"', '\1"', 'g'),
                  '(<[^<>]*?)\\"', '\1"', 'g'),
                '(<[^<>]*?)\\"', '\1"', 'g'),
              '(<[^<>]*?)\\"', '\1"', 'g'),
    updated_at = now()
WHERE value ~ '(<[^<>]*?)\\"';

UPDATE public.cms_blog_posts
SET content = regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(content, '(<[^<>]*?)\\"', '\1"', 'g'),
                    '(<[^<>]*?)\\"', '\1"', 'g'),
                  '(<[^<>]*?)\\"', '\1"', 'g'),
                '(<[^<>]*?)\\"', '\1"', 'g'),
    updated_at = now()
WHERE content ~ '(<[^<>]*?)\\"';
