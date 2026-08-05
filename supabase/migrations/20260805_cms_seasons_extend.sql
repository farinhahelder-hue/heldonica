-- ===========================================================================
-- Étend cms_seasons pour alimenter SeasonalTable.tsx (météo/affluence/prix).
--
-- La table existait déjà en prod avec un schéma simple (destination_slug,
-- season_label, months en texte libre, note, sort_order) — 5 lignes éparses,
-- non consommées par aucun composant. On garde ces colonnes telles quelles
-- et on ajoute ce qui manque, plutôt que de les renommer.
--
-- Une migration antérieure (20260703_cms_seasons.sql + son seed associé)
-- avait été écrite pour un schéma plus riche mais avec CREATE TABLE IF NOT
-- EXISTS : comme la table existait déjà avec des colonnes différentes, le
-- CREATE a été ignoré et les INSERT qui suivaient (colonnes destination_key/
-- name/months inexistantes ici) ont toujours échoué. Cette migration reprend
-- le contenu Madère déjà rédigé à cette occasion (météo/affluence/prix/note),
-- jamais servi à un visiteur, plutôt que d'en réécrire un nouveau.
--
-- Rollback : `ALTER TABLE cms_seasons DROP COLUMN emoji, DROP COLUMN
-- months_array, DROP COLUMN weather, DROP COLUMN crowd, DROP COLUMN price,
-- DROP COLUMN is_active;` puis `DELETE FROM cms_seasons WHERE destination_slug
-- = 'madere' AND season_label IN ('Automne', 'Hiver');` pour retirer les 2
-- lignes ajoutées (Printemps/Été existaient déjà, seules leurs nouvelles
-- colonnes redeviennent NULL avec le DROP).
-- ===========================================================================

ALTER TABLE cms_seasons
  ADD COLUMN IF NOT EXISTS emoji text,
  ADD COLUMN IF NOT EXISTS months_array text[],
  ADD COLUMN IF NOT EXISTS weather text,
  ADD COLUMN IF NOT EXISTS crowd text CHECK (crowd IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS price text CHECK (price IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Backfill Madère — Printemps et Été existent déjà (id 1 et 2), on complète
-- leurs nouvelles colonnes. Automne et Hiver n'existaient pas, on les ajoute.

UPDATE cms_seasons SET
  emoji = '🌸',
  months_array = ARRAY['Mars', 'Avril', 'Mai'],
  weather = '16-22°C, fleurs, végétation vive',
  crowd = 'low',
  price = 'medium',
  note = 'La période reine pour Madère. Floraisons, températures agréables, randos idéales. Prix encore modérés avant la haute saison.'
WHERE destination_slug = 'madere' AND season_label = 'Printemps';

UPDATE cms_seasons SET
  emoji = '☀️',
  months_array = ARRAY['Juin', 'Juillet', 'Août'],
  weather = '22-28°C, mer chaude, soleil',
  crowd = 'high',
  price = 'high',
  note = 'Pic d''affluence et prix élevés. Parfait pour la plage et les activités nautiques. Réservez longtemps à l''avance.'
WHERE destination_slug = 'madere' AND season_label = 'Été';

INSERT INTO cms_seasons (destination_slug, season_label, months, note, sort_order, emoji, months_array, weather, crowd, price, is_active)
SELECT 'madere', 'Automne', 'Septembre, Octobre, Novembre',
  'Excellent compromis : chaleur encore présente, moins de monde, prix en baisse. Notre recommandation pour un premier voyage.',
  3, '🍂', ARRAY['Septembre', 'Octobre', 'Novembre'], '18-24°C, fin de l''été indien', 'medium', 'medium', true
WHERE NOT EXISTS (
  SELECT 1 FROM cms_seasons WHERE destination_slug = 'madere' AND season_label = 'Automne'
);

INSERT INTO cms_seasons (destination_slug, season_label, months, note, sort_order, emoji, months_array, weather, crowd, price, is_active)
SELECT 'madere', 'Hiver', 'Décembre, Janvier, Février',
  'Version contemplative de Madère. Moins de randos praticables (boue), mais ambiance unique et prix cassés.',
  4, '🌧️', ARRAY['Décembre', 'Janvier', 'Février'], '14-20°C, plus humide, brumeux', 'low', 'low', true
WHERE NOT EXISTS (
  SELECT 1 FROM cms_seasons WHERE destination_slug = 'madere' AND season_label = 'Hiver'
);
