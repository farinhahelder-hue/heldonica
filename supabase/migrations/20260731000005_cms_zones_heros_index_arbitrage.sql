-- ============================================================================
-- cms_editable_zones : héros des pages d'index — arbitrage éditorial
-- Date: 2026-07-31 — clôture du sous-lot C
-- ============================================================================
-- Ces 8 zones étaient les dernières orphelines. Elles ne relevaient pas d'un
-- défaut technique mais d'un conflit de contenu : chaque hero disposait déjà
-- d'une source active, et la zone CMS proposait un autre texte.
--
-- Arbitrage rendu par la fondatrice le 2026-07-31 : dans les deux cas, le texte
-- affiché aujourd'hui fait foi. On neutralise donc la source concurrente plutôt
-- que de câbler, pour ne pas entretenir deux vérités pour le même hero.
--
-- Aucune suppression : is_active passe à false, les valeurs restent lisibles si
-- l'on souhaite un jour réaligner le CMS sur le texte retenu.


-- ─── /blog ──────────────────────────────────────────────────────────────────
--
-- Texte retenu (codé en dur dans BlogClientPage, inchangé) :
--   « Des moments, des détours, / des repères qu'on aurait aimé avoir avant. »
-- Écarté : la zone `hero_title` disait « Nos carnets de voyage » — jugé trop
-- générique, moins incarné. Câbler aurait modifié le H1 public.
--
-- `page_title` doublonne par ailleurs l'export `metadata` statique de la page.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND page = 'blog'
  AND zone_key IN ('hero_title', 'hero_subtitle', 'intro_text', 'page_title');


-- ─── /destinations ──────────────────────────────────────────────────────────
--
-- Texte retenu : « Nos destinations slow travel en couple », servi par
-- site_settings.destinations_hub_title — plus précis en référencement et plus
-- utile au lecteur.
-- Écarté : la zone `hero_title` disait « Destinations Heldonica » — trop centré
-- marque.
--
-- Le hero reste donc piloté par site_settings, qui demeure la source active.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND page = 'destinations'
  AND zone_key IN ('hero_title', 'hero_subtitle', 'intro_text', 'page_title');


-- ─── Vérification (lecture seule) ───────────────────────────────────────────

SELECT page, count(*) FILTER (WHERE is_active) AS actives,
       count(*) FILTER (WHERE NOT is_active) AS neutralisees
FROM public.cms_editable_zones
WHERE page IN ('blog', 'destinations')
GROUP BY page ORDER BY page;
