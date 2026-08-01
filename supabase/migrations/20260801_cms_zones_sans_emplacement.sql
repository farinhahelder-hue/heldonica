-- ============================================================================
-- cms_editable_zones : zones sans emplacement a l'ecran
-- Date: 2026-08-01
-- ============================================================================
-- Les migrations M1-M6 du 01/08 ont cree des zones pour des pages qui ne les
-- rendent pas : 758 orphelines sur 57 pages.
--
-- Regle d'arbitrage appliquee :
--   - zone dont la valeur figure DEJA EN DUR dans le fichier de la page : elle
--     double un texte affiche, il faut la CABLER et non la neutraliser, sinon
--     le texte reste fige dans le code. 651 zones concernees, NON traitees ici.
--   - zone vide, ou dont la valeur n'apparait nulle part : aucun emplacement ne
--     l'attend. La cabler reviendrait a AJOUTER du contenu a la page, ce qui est
--     une decision editoriale et non une reparation. 107 zones, traitees ici.
--
-- Aucune suppression : is_active passe a false, les valeurs restent lisibles.

-- destinations-grece (5) — aucun emplacement a l ecran
-- destinations-idf-fontainebleau (1) — aucun emplacement a l ecran
-- destinations-idf-giverny (1) — aucun emplacement a l ecran
-- destinations-idf-paris (1) — aucun emplacement a l ecran
-- destinations-idf-versailles (1) — aucun emplacement a l ecran
-- destinations-lisbonne (13) — aucun fichier de page
-- destinations-madere-achadas-da-cruz (1) — aucun emplacement a l ecran
-- destinations-madere-cabo-girao (1) — aucun emplacement a l ecran
-- destinations-madere-camara-de-lobos (1) — aucun emplacement a l ecran
-- destinations-madere-cote-est (1) — aucun emplacement a l ecran
-- destinations-madere-estreito (1) — aucun emplacement a l ecran
-- destinations-madere-faial (1) — aucun emplacement a l ecran
-- destinations-madere-funchal (1) — aucun emplacement a l ecran
-- destinations-madere-ponta-do-sol (1) — aucun emplacement a l ecran
-- destinations-madere-portela (1) — aucun emplacement a l ecran
-- destinations-madere-ribeiro-frio (1) — aucun emplacement a l ecran
-- destinations-madere-santos (1) — aucun emplacement a l ecran
-- destinations-madere-sao-vicente (1) — aucun emplacement a l ecran
-- destinations-normandie-cote-albatre (1) — aucun emplacement a l ecran
-- destinations-normandie-le-havre (1) — aucun emplacement a l ecran
-- destinations-normandie-pays-dauge (1) — aucun emplacement a l ecran
-- destinations-paris (13) — aucun fichier de page
-- destinations-portugal-lisbonne (1) — aucun emplacement a l ecran
-- destinations-portugal-porto (1) — aucun emplacement a l ecran
-- destinations-roumanie-brasov (3) — aucun emplacement a l ecran
-- destinations-roumanie-bucarest (1) — aucun emplacement a l ecran
-- destinations-roumanie-cluj (1) — aucun emplacement a l ecran
-- destinations-roumanie-itineraire-10-jours (1) — valeur vide
-- destinations-roumanie-itineraire-5-jours (1) — valeur vide
-- destinations-roumanie-itineraire-7-jours (1) — valeur vide
-- destinations-roumanie-sibiu (1) — aucun emplacement a l ecran
-- destinations-roumanie-timisoara (1) — aucun emplacement a l ecran
-- destinations-roumanie-transylvanie (1) — aucun emplacement a l ecran
-- destinations-sardaigne-asinara (1) — aucun emplacement a l ecran
-- destinations-sicile (13) — aucun fichier de page
-- destinations-sicile-etoile (1) — aucun emplacement a l ecran
-- destinations-suisse (13) — aucun fichier de page
-- destinations-zurich (16) — aucun fichier de page

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND (page, zone_key) IN (
  ('destinations-grece', 'back_link'),
  ('destinations-grece', 'hero_eyebrow'),
  ('destinations-grece', 'section_text'),
  ('destinations-grece', 'section_title'),
  ('destinations-grece', 'style_label'),
  ('destinations-idf-fontainebleau', 'highlight_1_description'),
  ('destinations-idf-giverny', 'highlight_1_description'),
  ('destinations-idf-paris', 'highlight_1_description'),
  ('destinations-idf-versailles', 'highlight_1_description'),
  ('destinations-lisbonne', 'budget'),
  ('destinations-lisbonne', 'description'),
  ('destinations-lisbonne', 'duration'),
  ('destinations-lisbonne', 'hero_image'),
  ('destinations-lisbonne', 'profile'),
  ('destinations-lisbonne', 'season'),
  ('destinations-lisbonne', 'subtitle'),
  ('destinations-lisbonne', 'tip_1'),
  ('destinations-lisbonne', 'tip_2'),
  ('destinations-lisbonne', 'tip_3'),
  ('destinations-lisbonne', 'tip_4'),
  ('destinations-lisbonne', 'title'),
  ('destinations-lisbonne', 'verdict'),
  ('destinations-madere-achadas-da-cruz', 'highlight_1_description'),
  ('destinations-madere-cabo-girao', 'highlight_1_description'),
  ('destinations-madere-camara-de-lobos', 'highlight_1_description'),
  ('destinations-madere-cote-est', 'highlight_1_description'),
  ('destinations-madere-estreito', 'highlight_1_description'),
  ('destinations-madere-faial', 'highlight_1_description'),
  ('destinations-madere-funchal', 'highlight_1_description'),
  ('destinations-madere-ponta-do-sol', 'highlight_1_description'),
  ('destinations-madere-portela', 'highlight_1_description'),
  ('destinations-madere-ribeiro-frio', 'highlight_1_description'),
  ('destinations-madere-santos', 'highlight_1_description'),
  ('destinations-madere-sao-vicente', 'highlight_1_description'),
  ('destinations-normandie-cote-albatre', 'highlight_1_description'),
  ('destinations-normandie-le-havre', 'highlight_1_description'),
  ('destinations-normandie-pays-dauge', 'highlight_1_description'),
  ('destinations-paris', 'budget'),
  ('destinations-paris', 'description'),
  ('destinations-paris', 'duration'),
  ('destinations-paris', 'hero_image'),
  ('destinations-paris', 'profile'),
  ('destinations-paris', 'season'),
  ('destinations-paris', 'subtitle'),
  ('destinations-paris', 'tip_1'),
  ('destinations-paris', 'tip_2'),
  ('destinations-paris', 'tip_3'),
  ('destinations-paris', 'tip_4'),
  ('destinations-paris', 'title'),
  ('destinations-paris', 'verdict'),
  ('destinations-portugal-lisbonne', 'highlight_2_title'),
  ('destinations-portugal-porto', 'highlight_1_description'),
  ('destinations-roumanie-brasov', 'highlight_2_description'),
  ('destinations-roumanie-brasov', 'highlight_2_title'),
  ('destinations-roumanie-brasov', 'highlight_3_description'),
  ('destinations-roumanie-bucarest', 'highlight_1_description'),
  ('destinations-roumanie-cluj', 'highlight_1_description'),
  ('destinations-roumanie-itineraire-10-jours', 'day_10_accommodation'),
  ('destinations-roumanie-itineraire-5-jours', 'day_5_accommodation'),
  ('destinations-roumanie-itineraire-7-jours', 'day_7_accommodation'),
  ('destinations-roumanie-sibiu', 'highlight_1_description'),
  ('destinations-roumanie-timisoara', 'highlight_1_description'),
  ('destinations-roumanie-transylvanie', 'highlight_1_description'),
  ('destinations-sardaigne-asinara', 'highlight_3_description'),
  ('destinations-sicile', 'budget'),
  ('destinations-sicile', 'description'),
  ('destinations-sicile', 'duration'),
  ('destinations-sicile', 'hero_image'),
  ('destinations-sicile', 'profile'),
  ('destinations-sicile', 'season'),
  ('destinations-sicile', 'subtitle'),
  ('destinations-sicile', 'tip_1'),
  ('destinations-sicile', 'tip_2'),
  ('destinations-sicile', 'tip_3'),
  ('destinations-sicile', 'tip_4'),
  ('destinations-sicile', 'title'),
  ('destinations-sicile', 'verdict'),
  ('destinations-sicile-etoile', 'highlight_3_description'),
  ('destinations-suisse', 'budget'),
  ('destinations-suisse', 'description'),
  ('destinations-suisse', 'duration'),
  ('destinations-suisse', 'hero_image'),
  ('destinations-suisse', 'profile'),
  ('destinations-suisse', 'season'),
  ('destinations-suisse', 'subtitle'),
  ('destinations-suisse', 'tip_1'),
  ('destinations-suisse', 'tip_2'),
  ('destinations-suisse', 'tip_3'),
  ('destinations-suisse', 'tip_4'),
  ('destinations-suisse', 'title'),
  ('destinations-suisse', 'verdict'),
  ('destinations-zurich', 'budget'),
  ('destinations-zurich', 'description'),
  ('destinations-zurich', 'duration'),
  ('destinations-zurich', 'hero_image'),
  ('destinations-zurich', 'profile'),
  ('destinations-zurich', 'season'),
  ('destinations-zurich', 'subtitle'),
  ('destinations-zurich', 'tip_1'),
  ('destinations-zurich', 'tip_2'),
  ('destinations-zurich', 'tip_3'),
  ('destinations-zurich', 'tip_4'),
  ('destinations-zurich', 'title'),
  ('destinations-zurich', 'verdict'),
  ('destinations-zurich', 'seo_description'),
  ('destinations-zurich', 'seo_og_image'),
  ('destinations-zurich', 'seo_title')
);

-- ─── Verification (lecture seule) ───────────────────────────────────────────

SELECT count(*) AS zones_actives FROM public.cms_editable_zones WHERE is_active;
