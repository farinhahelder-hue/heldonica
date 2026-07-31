-- ============================================================================
-- Mentions légales : mentions d'identification + nettoyage des doublons
-- Date: 2026-07-31 — sous-lot C
-- ============================================================================


-- ─── 1. Identité de l'éditeur : une zone par mention légale ─────────────────
--
-- La page ne disposait que d'une zone de texte libre, `editor_info`, dont la
-- valeur servie est « Informations légales complémentaires en cours de mise à
-- jour ». Un champ libre ne dit pas ce qui manque.
--
-- L'article 6-III de la LCEN et l'article R123-237 du Code de commerce exigent
-- des mentions nommées. On crée donc une ligne par mention, VIDE, pour qu'elles
-- apparaissent dans le panneau d'administration et puissent être renseignées
-- sans redéploiement.
--
-- ⚠️ Volontairement laissées vides : ces informations relèvent du statut
-- juridique réel de l'activité. Les inventer produirait des mentions légales
-- fausses, ce qui est pire que des mentions incomplètes. Le rendu n'affiche
-- que les mentions renseignées : tant qu'elles sont vides, la page est
-- inchangée et continue d'afficher le texte libre historique.
--
-- Idempotent : ON CONFLICT sur la contrainte UNIQUE (page, zone_key).

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, description, is_active)
VALUES
  ('mentions-legales', 'editor_legal_form',          'text', '', 'Forme juridique',            'SASU, EURL, SARL, entreprise individuelle, micro-entreprise…', true),
  ('mentions-legales', 'editor_capital',             'text', '', 'Capital social',             'Montant du capital social, le cas échéant (ex. « 1 000 € »).', true),
  ('mentions-legales', 'editor_address',             'text', '', 'Adresse du siège social',    'Adresse postale complète du siège.', true),
  ('mentions-legales', 'editor_siren',               'text', '', 'SIREN',                      'Identifiant à 9 chiffres.', true),
  ('mentions-legales', 'editor_siret',               'text', '', 'SIRET',                      'Identifiant à 14 chiffres de l''établissement.', true),
  ('mentions-legales', 'editor_rcs',                 'text', '', 'RCS',                        'Ville d''immatriculation et numéro (ex. « RCS Paris 123 456 789 »).', true),
  ('mentions-legales', 'editor_vat',                 'text', '', 'TVA intracommunautaire',     'Numéro de TVA, si assujetti.', true),
  ('mentions-legales', 'editor_phone',               'text', '', 'Téléphone',                  'Numéro de contact exigé par la LCEN.', true),
  ('mentions-legales', 'editor_publication_director','text', '', 'Directeur de la publication','Personne physique responsable de la publication.', true)
ON CONFLICT (page, zone_key) DO NOTHING;


-- ─── 2. Doublons de zones déjà rendues sous un autre nom ────────────────────
--
-- Ces zones ne sont lues par aucun composant : les pages affichent déjà la même
-- information via `hero_title` / `hero_subtitle`, ou via des zones structurées.
-- Les laisser actives entretient l'illusion qu'on peut les éditer.
--
--   mentions-legales.page_title / intro_text
--     -> doublons de hero_title / hero_subtitle.
--   politique-confidentialite.page_title / intro_text / content
--     -> la page rend 30 zones structurées (data_*, purpose_*, rights_*…),
--        `content` est le bloc monolithique d'avant cette structuration.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND (page, zone_key) IN (
  ('mentions-legales',          'page_title'),
  ('mentions-legales',          'intro_text'),
  ('politique-confidentialite', 'page_title'),
  ('politique-confidentialite', 'intro_text'),
  ('politique-confidentialite', 'content')
);


-- ─── 3. Reliquats de l'ancien projet sur /a-propos ──────────────────────────
--
-- Suite du nettoyage du 2026-07-30, qui avait traité bio_text, intro_text et
-- page_title. Restent des zones décrivant la pratique de coaching (« Une
-- trajectoire entre direction, marque et accompagnement », « Ce qui oriente la
-- pratique », « Authenticité, rigueur intellectuelle… ») et des emplacements
-- photo hérités, tous vides et lus par aucun composant.

UPDATE public.cms_editable_zones SET is_active = false, updated_at = NOW()
WHERE is_active AND page = 'a-propos' AND zone_key IN (
  'bio_title', 'valeurs_title', 'valeurs_text', 'contact_email',
  'hero_image', 'photo', 'photo_1', 'photo_2', 'photo_3'
);


-- ─── 4. Copyright du pied de page : jeton d'année ───────────────────────────
--
-- `footer_copyright` devient la source du copyright, jusqu'ici calculé dans le
-- composant sous la forme `© ${currentYear} Heldonica…`. Servir la valeur du
-- CMS telle quelle aurait fait disparaître l'année.
--
-- On introduit le jeton `{année}`, substitué au rendu. Sans lui, une valeur
-- figée au CMS afficherait une année périmée dès le 1er janvier suivant.
-- Après cette migration, l'affichage est identique à celui d'avant.

UPDATE public.cms_editable_zones
SET value = '© {année} Heldonica. Tous droits réservés.', updated_at = NOW()
WHERE page = 'global' AND zone_key = 'footer_copyright'
  AND value NOT LIKE '%{année}%';


-- ─── Vérifications (lecture seule) ──────────────────────────────────────────

SELECT 'Mentions LCEN creees' AS controle, count(*)::text AS n,
       CASE WHEN count(*) = 9 THEN 'OK' ELSE 'ECHEC' END AS verdict
FROM public.cms_editable_zones
WHERE page = 'mentions-legales' AND zone_key LIKE 'editor_%' AND zone_key <> 'editor_name' AND zone_key <> 'editor_info';

SELECT 'Mentions LCEN renseignees' AS controle, count(*)::text AS n, 'a completer' AS verdict
FROM public.cms_editable_zones
WHERE page = 'mentions-legales' AND zone_key LIKE 'editor_%'
  AND zone_key NOT IN ('editor_name', 'editor_info') AND coalesce(btrim(value), '') <> '';

SELECT page, count(*) AS actives
FROM public.cms_editable_zones WHERE is_active GROUP BY page ORDER BY page;
