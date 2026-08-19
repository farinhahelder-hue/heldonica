-- ============================================================================
-- cms_editable_zones : zones sans emplacement a l'ecran
-- Date: 2026-08-01
-- ============================================================================
-- Les migrations M1-M6 du 01/08 ont cree des zones pour des pages qui ne les
-- rendent pas : 74 orphelines sur 8 pages.
--
-- Regle d'arbitrage appliquee :
--   - zone dont la valeur figure DEJA EN DUR dans le fichier de la page : elle
--     double un texte affiche, il faut la CABLER et non la neutraliser, sinon
--     le texte reste fige dans le code. 74 zones concernees, NON traitees ici.
--   - zone vide, ou dont la valeur n'apparait nulle part : aucun emplacement ne
--     l'attend. La cabler reviendrait a AJOUTER du contenu a la page, ce qui est
--     une decision editoriale et non une reparation. 0 zones, traitees ici.
--
-- Aucune suppression : is_active passe a false, les valeurs restent lisibles.


UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND (page, zone_key) IN (

);

-- ─── Verification (lecture seule) ───────────────────────────────────────────

SELECT count(*) AS zones_actives FROM public.cms_editable_zones WHERE is_active;
