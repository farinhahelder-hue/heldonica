-- Accueil : le hero n'a plus que trois lignes
--
-- Le composant avait quatre emplacements (« On ferme » / « les ordis. » /
-- « On part. » / « On revient… »), mais le CMS avait été rempli pour trois
-- lignes : line_1 = « On ferme les ordis. », line_2 = « On part. »,
-- line_3 et line_4 = « On revient… » (doublon). Résultat en ligne : la phrase
-- finale affichée deux fois et « ordis.On part. » sans espace.
-- Le composant lit désormais trois lignes ; line_4 n'est plus lue par rien.
-- Idempotent.

UPDATE public.cms_editable_zones
SET is_active = false, updated_at = NOW()
WHERE page = 'home' AND zone_key = 'hero_line_4' AND is_active = true;
