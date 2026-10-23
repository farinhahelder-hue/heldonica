-- ============================================================================
-- Suivi de 20261023140000 : deux zones intro_text désactivées gardaient
-- « Bogota » / « Medellin » sans accent.
-- ============================================================================
-- Ces zones sont is_active = false : elles ne sont pas rendues (les pages
-- utilisent le fallback du code, corrigé dans la même PR). Elles sont
-- néanmoins corrigées pour qu'une réactivation future ne republie pas la
-- coquille. On ne touche qu'au nom propre — le reste de ces phrases est du
-- contenu antérieur, hors périmètre de cette correction.
--
-- Idempotent : chaque écriture ne touche que la valeur encore présente.
-- Retour arrière : remettre « Bogota » / « Medellin ».

UPDATE public.cms_editable_zones AS z
SET value = v.apres,
    updated_at = NOW()
FROM (VALUES
  ('destinations-colombie-bogota',   'intro_text', 'Bogota, c''est la capitale a 2600m. Le centre historique, les murs de grafitti, les musees.', 'Bogotá, c''est la capitale a 2600m. Le centre historique, les murs de grafitti, les musees.'),
  ('destinations-colombie-medellin', 'intro_text', 'Medellin, c''est la transformation. Le clima eternal, les parches, le metro cable.',            'Medellín, c''est la transformation. Le clima eternal, les parches, le metro cable.')
) AS v(page, zone_key, avant, apres)
WHERE z.page = v.page
  AND z.zone_key = v.zone_key
  AND z.value = v.avant;
