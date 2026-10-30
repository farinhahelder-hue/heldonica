-- Migration 20261030160000_madere_bientot.sql
-- Mise en « Bientôt » de la destination Madère, décision du propriétaire du 2026-10-30.
--
-- Constat (mesures du 2026-10-30, manifeste C2PA lu octet par octet sur les
-- fichiers du bucket public `media/destinations/madere/`) : les CINQ images du
-- fonds Madère sont générées par IA — manifeste signé « Created by Google
-- Generative AI », `digitalSourceType = trainedAlgorithmicMedia`, plus SynthID.
-- Aucune photo réelle de l'île n'existe dans le bucket. Or ces images servent à
-- PROUVER un vécu revendiqué en toutes lettres par le texte du pilier
-- (« Septembre 2025, en couple, 8 jours », « on a marché dans la forêt de
-- Fanal », « on s'est baignés à Porto Moniz »). Règle #1 : on n'invente rien.
--
-- Le texte est plausible (l'accueil dit « duo Paris-Madère-Roumanie »), mais
-- aucune image ne l'atteste. Tant que des photos réelles ne sont pas importées,
-- la page ne peut pas être illustrée honnêtement : elle passe « Bientôt ».
--
-- Aucun `DELETE`, aucune donnée perdue : trois drapeaux basculent, tout reste
-- éditable au CMS. Réversible par une nouvelle migration versionnée.
--
-- Les trois lignes visées (état mesuré avant écriture) :
--   · destinations(slug='madere')           published=true,  status='published'
--   · cms_home_destinations(slug='madere')  is_active=true   → carte d'accueil
--   · cms_pillar_pages(slug='madere')       is_active=true   → pilier
--
-- Le rendu public, lui, ne dépend pas de ces seuls drapeaux : le pilier
-- `DestinationPillar` ne connaît pas le mécanisme « Bientôt » (contrairement à
-- `SubDestinationTemplate`). La page porte donc un garde explicite
-- (`isUnpublishedPath('/destinations/madere')` dans app/destinations/madere/page.tsx),
-- et `buildPillarMetadata` applique le `noindex` + l'image de partage par défaut.
-- Cette migration couvre les surfaces qui, elles, lisent la base : la carte
-- d'accueil, la liste /destinations et le repli de données.
--
-- Idempotente : ne touche que les lignes encore publiées/actives. Rejouable.
--
-- Retour arrière : repasser les trois drapeaux à leur valeur d'origine
-- (`published=true, status='published'`, `is_active=true`) par une nouvelle
-- migration versionnée, ET retirer '/destinations/madere' + 'destinations-madere'
-- de lib/unpublished-pages.ts.

UPDATE public.destinations
SET published = false,
    status = 'coming_soon',
    updated_at = now()
WHERE slug = 'madere'
  AND published = true;

UPDATE public.cms_home_destinations
SET is_active = false,
    updated_at = now()
WHERE slug = 'madere'
  AND is_active = true;

UPDATE public.cms_pillar_pages
SET is_active = false,
    updated_at = now()
WHERE slug = 'madere'
  AND is_active = true;

-- ── Quatrième surface : le guide « 10 pépites de Madère » ────────────────────
-- Ce guide reste EN LIGNE (c'est un aimant à contacts, lié depuis /start, /guides
-- et le sitemap) : on ne le met pas en « Bientôt ». Mais sa zone de partage
-- `seo_og_image` pointait sur la même image générée par IA, et le HTML servi le
-- 30/10/2026 la publiait bien :
--   <meta property="og:image" content="…/madere/pico_do_arieiro.jpg">
-- Aucun composant n'affiche cette zone sur la page (le héros du guide lit
-- `hero_bg_image`, absent → repli `/og-default.jpg`). On remet donc l'image de
-- partage par défaut, sans toucher au contenu du guide.
UPDATE public.cms_editable_zones
SET value = 'https://www.heldonica.fr/og-default.jpg',
    updated_at = now()
WHERE page = 'guides-top-10-pepites-madere'
  AND zone_key = 'seo_og_image'
  AND value NOT LIKE '%/og-default.jpg';

-- Vérification : les trois drapeaux doivent être retombés. `supabase db push` peut
-- exécuter les instructions indépendamment les unes des autres (cf. AGENTS.md) :
-- on mesure l'état réel plutôt que de supposer un tout-ou-rien.
DO $$
DECLARE
  encore_visible int;
BEGIN
  SELECT COUNT(*) INTO encore_visible
  FROM public.destinations
  WHERE slug = 'madere' AND published = true;

  IF encore_visible <> 0 THEN
    RAISE WARNING 'destinations.madere toujours publiée après migration';
  END IF;

  SELECT COUNT(*) INTO encore_visible
  FROM public.cms_home_destinations
  WHERE slug = 'madere' AND is_active = true;

  IF encore_visible <> 0 THEN
    RAISE WARNING 'cms_home_destinations.madere toujours active après migration';
  END IF;

  SELECT COUNT(*) INTO encore_visible
  FROM public.cms_pillar_pages
  WHERE slug = 'madere' AND is_active = true;

  IF encore_visible <> 0 THEN
    RAISE WARNING 'cms_pillar_pages.madere toujours active après migration';
  END IF;
END $$;
