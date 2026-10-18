-- ============================================================================
-- Sous-destinations Colombie / Sardaigne / Sicile : zones « Bientôt » désactivées
-- Date: 2026-10-17 — déjà appliqué en production (UPDATE direct, idempotent)
--
-- Constat (garde-fou check:cms-zones passant au rouge, 44 zones orphelines) :
-- ces 4 clés par page avaient été saisies le 17/10/2026 à 18h17 UTC avec les
-- valeurs du gabarit ComingSoonDestination (« Italie — Bientôt »,
-- « On prépare le guide palerme — à notre façon. ») alors que ces 14 pages sont
-- publiées et rendues par SubDestinationTemplate : le backoffice affichait des
-- textes faux, et rien ne les affichait côté public.
--
-- hero_teaser est conservé actif : il est désormais câblé dans le hero de
-- SubDestinationTemplate (voir le même commit), ses valeurs étant de vraies
-- accroches éditoriales (« Marchés de rue animés et joyaux arabo-normands. »).
--
-- Idempotent : la clause is_active = true rend un second passage sans effet.

UPDATE public.cms_editable_zones
SET is_active = false,
    updated_at = NOW()
WHERE zone_key IN ('hero_eyebrow', 'hero_title', 'section_title')
  AND page IN (
    'destinations-colombie-bogota',
    'destinations-colombie-cali',
    'destinations-colombie-cartago',
    'destinations-colombie-medellin',
    'destinations-sardaigne-alghero',
    'destinations-sardaigne-asinara',
    'destinations-sardaigne-cagliari',
    'destinations-sardaigne-costa-smeralda',
    'destinations-sardaigne-nuoro',
    'destinations-sicile-catane',
    'destinations-sicile-etoile',
    'destinations-sicile-palerme',
    'destinations-sicile-syracuse',
    'destinations-sicile-taormine'
  )
  AND is_active = true;
