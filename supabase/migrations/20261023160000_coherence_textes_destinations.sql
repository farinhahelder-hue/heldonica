-- Migration 20261023160000_coherence_textes_destinations.sql
--
-- Trois incohérences vues en ligne, corrigées dans le code ; cette migration
-- aligne les valeurs déjà saisies en CMS pour qu'elles ne réécrivent pas le
-- fallback.
--
--   1. /travel-planning excluait les familles alors que l'accueil et le
--      formulaire les accueillent. La vraie frontière est le tourisme de masse
--      (« resort », parcs d'attractions), pas les enfants.
--   2. « Terrains de jeu » annonçait Sicile, Sardaigne et Colombie, qui sont en
--      « Bientôt ». Le bandeau ne liste plus que du contenu publié ; les
--      destinations en préparation passent sur leur propre ligne.
--   3. Les préfixes de titres de destinations portaient un « à » en dur, ce qui
--      donnait « Quand partir à Roumanie ». La préposition est désormais
--      calculée par le composant (en Roumanie, au Monténégro, à Madère).
--
-- Chaque UPDATE ne s'applique que si la valeur est encore l'ancienne : une
-- réécriture faite depuis l'admin n'est jamais écrasée. Sans ligne en base, le
-- fallback du composant porte déjà le bon texte.

-- 1a. Pour qui on n'est pas (page Travel Planning)
UPDATE public.cms_editable_zones
SET value = $$Les séjours « resort » et les parcs d'attractions : on conçoit du slow travel immersif et des adresses de terrain, pas du tourisme de masse — même en famille.$$,
    updated_at = now()
WHERE page = 'travel-planning'
  AND zone_key = 'personas_not_1'
  AND value = $$Les voyages en famille : notre cœur de métier, c'est le slow travel à deux.$$;

-- 1b. FAQ « Est-ce adapté aux voyages en famille ? »
UPDATE public.cms_editable_zones
SET value = $$Oui, si le voyage est vécu et non consommé. Notre terrain naturel reste le couple, mais on adapte le même regard à une famille curieuse : rythme lent, adresses de terrain, moins de sites et plus de vécu. En revanche, on ne conçoit pas de séjour « resort » ni de marathon de parcs d'attractions.$$,
    updated_at = now()
WHERE page = 'travel-planning'
  AND zone_key = 'faq_5_a'
  AND value = $$On se spécialise dans les voyages en couple. Pour les familles, on peut orienter vers des ressources adaptées — mais notre cœur de métier reste le slow travel à deux.$$;

-- 2. Terrains de jeu de l'accueil : ne plus annoncer les destinations « Bientôt »
UPDATE public.cms_editable_zones
SET value = $$Madère · Roumanie · Monténégro · Suisse · Lisbonne · Île-de-France · Portugal$$,
    updated_at = now()
WHERE page = 'home'
  AND zone_key = 'stats_playgrounds'
  AND value = $$Madère · Roumanie · Monténégro · Suisse · Lisbonne · Sicile · Sardaigne · Colombie · Île-de-France$$;

-- 3. Préfixes de titres : le « à » final est retiré, la préposition vient du code
UPDATE public.cms_editable_zones
SET value = 'Quand partir',
    updated_at = now()
WHERE page = 'destinations'
  AND zone_key = 'seasons_title_prefix'
  AND value ~ '^\s*Quand partir\s*(à|au|aux|en)?\s*$';

UPDATE public.cms_editable_zones
SET value = 'Comment organiser 7 jours',
    updated_at = now()
WHERE page = 'destinations'
  AND zone_key = 'itinerary_title_prefix'
  AND value ~ '^\s*Comment organiser 7 jours\s*(à|au|aux|en)?\s*$';
