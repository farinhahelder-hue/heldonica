-- Migration 20261023180000_zones_actives_vides_desactivees.sql
-- Lot 2, priorité 4 : désactiver les zones actives à valeur vide.
--
-- Une zone active dont la valeur est une chaîne vide n'affiche pas son fallback.
-- Le composant calcule `zones[zoneKey] ?? fallback` : `''` n'est pas `null`, donc
-- le fallback ne joue PAS et le bloc se rend vide. Constat en base le 2026-10-23 :
-- 37 zones actives à valeur vide, dont
--   - 23 `local_tip` : un bloc « Notre conseil » titré, sans texte, sur 23 pages
--     sous-destination (idf, madere, normandie, portugal, roumanie) ;
--   - 3 `day_N_accommodation` : « On a dormi chez » sans hébergement ;
--   - 1 `destinations-alentejo intro_label` : le libellé « Récit de terrain » disparu ;
--   - 9 `mentions-legales editor_*` + 1 `global header_logo_url` : vides
--     volontairement (champs légaux non renseignés), masqués par le code.
--
-- Cause racine : les générateurs `scripts/generate-subdest-cms.mjs` et
-- `scripts/generate-itineraries-cms.mjs` émettaient une ligne même pour une
-- valeur vide, avec `is_active = true` et un `ON CONFLICT DO UPDATE ... is_active
-- = true` qui réactivait au passage toute zone vide désactivée à la main.
-- Les deux générateurs sont corrigés dans le même lot ; cette migration répare
-- la donnée déjà produite.
--
-- Pourquoi désactiver plutôt que supprimer : la ligne reste consultable, et
-- `is_active` est le seul état de publication de la table. Renseigner la zone au
-- CMS la réactive (l'éditeur inline pose `is_active = true`), donc aucun geste
-- éditorial futur n'est perdu.
--
-- Aucun contenu n'est inventé : les 23 `local_tip` retombent sur le fallback
-- rédigé dans le code (`localTip` de chaque page), déjà utilisé tel quel sur 20
-- autres pages. Les champs légaux vides restent vides et masqués.
--
-- Retour arrière : UPDATE ... SET is_active = true WHERE id IN (...) — ou,
-- globalement, réactiver les zones dont la valeur est vide pour revenir à l'état
-- constaté (déconseillé : c'est cet état qui produit les blocs vides).

UPDATE public.cms_editable_zones
SET is_active = false, updated_at = NOW()
WHERE is_active = true
  AND value IS NOT NULL
  AND btrim(value) = '';
