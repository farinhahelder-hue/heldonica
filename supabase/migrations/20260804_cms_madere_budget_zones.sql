-- ===========================================================================
-- Calculateur budget Madère : libellés pilotés par le CMS.
--
-- Seuls les textes deviennent éditables. Les fourchettes de prix et les
-- coefficients restent dans le code : une valeur aberrante saisie ici
-- fausserait toutes les estimations sans le moindre signal.
--
-- Valeurs initiales = fallbacks du code. Idempotente.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('destinations-madere-budget', 'hero_badge', 'text', 'Madère — Budget', 'Hero — surtitre', true),
  ('destinations-madere-budget', 'hero_title', 'text', 'Calculateur budget Madère', 'Hero — titre', true),
  ('destinations-madere-budget', 'hero_text', 'textarea', 'Point de départ fiable pour cadrer ton voyage. Référence Heldonica : 1 400–1 800 € pour 7 jours en duo, style équilibré.', 'Hero — accroche', true),
  ('destinations-madere-budget', 'form_title', 'text', 'Paramètres du voyage', 'Formulaire — titre', true),
  ('destinations-madere-budget', 'label_duration', 'text', 'Durée', 'Formulaire — libellé durée', true),
  ('destinations-madere-budget', 'label_days', 'text', 'jours', 'Formulaire — unité (jours)', true),
  ('destinations-madere-budget', 'label_comfort', 'text', 'Niveau de confort', 'Formulaire — libellé confort', true),
  ('destinations-madere-budget', 'style_1', 'text', 'Équilibré', 'Formulaire — confort 1', true),
  ('destinations-madere-budget', 'style_2', 'text', 'Confort', 'Formulaire — confort 2', true),
  ('destinations-madere-budget', 'style_3', 'text', 'Signature', 'Formulaire — confort 3', true),
  ('destinations-madere-budget', 'label_season', 'text', 'Saison', 'Formulaire — libellé saison', true),
  ('destinations-madere-budget', 'season_1', 'text', 'Basse / intermédiaire', 'Formulaire — saison 1', true),
  ('destinations-madere-budget', 'season_2', 'text', 'Haute saison', 'Formulaire — saison 2', true),
  ('destinations-madere-budget', 'label_car', 'text', 'Inclure la location de voiture', 'Formulaire — libellé voiture', true),
  ('destinations-madere-budget', 'estimate_kicker', 'text', 'Estimation duo', 'Estimation — surtitre', true),
  ('destinations-madere-budget', 'estimate_note', 'textarea', 'Fourchette indicative hors achats personnels. On affine ensuite selon tes priorités réelles.', 'Estimation — note', true),
  ('destinations-madere-budget', 'included_1', 'text', '— Vols A/R inclus', 'Estimation — inclus 1', true),
  ('destinations-madere-budget', 'included_2', 'text', '— Hébergement + repas + activités', 'Estimation — inclus 2', true),
  ('destinations-madere-budget', 'included_3', 'text', '— Ajustement automatique selon la saison', 'Estimation — inclus 3', true),
  ('destinations-madere-budget', 'included_4', 'text', '— Voiture intégrée si activée', 'Estimation — inclus 4', true),
  ('destinations-madere-budget', 'cta_label', 'text', 'Construire mon carnet Madère', 'Estimation — bouton', true),
  ('destinations-madere-budget', 'card_1_title', 'text', 'Référence rapide', 'Carte 1 — titre', true),
  ('destinations-madere-budget', 'card_1_text', 'textarea', '7 jours, style équilibré, saison intermédiaire, voiture incluse : généralement 1 400–1 800 €.', 'Carte 1 — texte', true),
  ('destinations-madere-budget', 'card_2_title', 'text', 'Conseil de pilotage', 'Carte 2 — titre', true),
  ('destinations-madere-budget', 'card_2_text', 'textarea', 'Garde 10 à 15 % de marge pour la météo et les occasions locales. Cette marge préserve la qualité de l''expérience.', 'Carte 2 — texte', true),
  ('destinations-madere-budget', 'seo_title', 'text', 'Calculateur budget Madère en couple : slow travel & pépites cachées | Heldonica', 'SEO — title', true),
  ('destinations-madere-budget', 'seo_description', 'textarea', 'Cadre ton budget avant de partir. Référence Heldonica : 1 400–1 800 € pour 7 jours en duo, style équilibré.', 'SEO — description', true),
  ('destinations-madere-budget', 'seo_og_image', 'text', '/og-default.jpg', 'SEO — image Open Graph', true)
ON CONFLICT (page, zone_key) DO UPDATE
  SET zone_type = EXCLUDED.zone_type,
      value     = EXCLUDED.value,
      label     = EXCLUDED.label,
      is_active = true;
