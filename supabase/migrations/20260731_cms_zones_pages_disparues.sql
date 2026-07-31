-- ============================================================================
-- cms_editable_zones : zones rattachées à des pages qui n'existent plus
-- Date: 2026-07-31 — sous-lot B (pages business / conversion)
-- ============================================================================
-- Aucune ligne supprimée : is_active passe à false. Réversible d'un UPDATE, et
-- le contenu reste consultable si l'une de ces pages est un jour recréée.
--
-- Motivation : ces zones apparaissent dans le panneau d'administration comme
-- éditables. Les modifier ne produit aucun effet, puisque rien ne les rend.
-- C'est le même piège que celui corrigé pour l'ensemble du site : une interface
-- qui laisse croire qu'on pilote un contenu qui n'est en réalité jamais servi.
-- ============================================================================


-- ─── 1. nos-services : la page est une redirection permanente ───────────────
--
-- app/nos-services/page.tsx se réduit à permanentRedirect('/travel-planning').
-- Aucun rendu n'a lieu : les 22 zones de cette page sont inatteignables.
--
-- Note éditoriale : ce contenu était rédigé en vouvoiement (« On conçoit votre
-- voyage sur mesure ») sur ce qui était une page B2C. S'il devait être repris
-- pour /travel-planning, il faudrait le repasser au tutoiement.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND page = 'nos-services';


-- ─── 2. faq : aucune route ne correspond ─────────────────────────────────────
--
-- Il n'existe pas de app/faq/. Les six zones (trois questions/réponses) ne sont
-- rendues nulle part.
--
-- ⚠️ Ce contenu est en plus périmé : faq_3_answer annonce « Nos formules
-- commencent à 180€ pour un week-end », là où /travel-planning affiche 250€
-- pour la formule Essentielle. Le republier tel quel afficherait deux tarifs
-- contradictoires. À reprendre avant toute réactivation.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND page = 'faq';


-- ─── 3. Zones sans point de rendu sur des pages existantes ──────────────────
--
-- travel-planning.hero_subtitle : le hero rend `hero_title` puis `hero_text`.
--   `hero_subtitle` contient du texte Heldonica valide (« On conçoit des
--   voyages hors des sentiers battus… ») mais aucun composant ne le lit — même
--   configuration que expert-hotelier.hero_text/hero_subtitle, corrigée plus
--   tôt. Ici on désactive plutôt que de câbler : ajouter une troisième ligne au
--   hero est une décision éditoriale. Le texte reste en base, réactivable.
--
-- contact.page_title : les métadonnées de /contact viennent d'un export
--   `metadata` statique dans le fichier de page, pas du CMS.
--
-- contact.hero_image : valeur vide.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND (page, zone_key) IN (
  ('travel-planning', 'hero_subtitle'),
  ('contact',         'page_title'),
  ('contact',         'hero_image')
);


-- ─── Vérifications (lecture seule) ──────────────────────────────────────────

SELECT 'Zones de pages disparues encore actives' AS controle, count(*)::text AS n,
       CASE WHEN count(*) = 0 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM public.cms_editable_zones
WHERE is_active AND page IN ('nos-services', 'faq');

SELECT page, count(*) AS actives
FROM public.cms_editable_zones WHERE is_active GROUP BY page ORDER BY page;
