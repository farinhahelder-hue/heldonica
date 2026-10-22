-- ============================================================================
-- Pages destination : libellés d'interface en zones CMS (DestinationPage.tsx)
-- Date : 2026-10-22 23:08 — branche cms/destination-page-hardcode
-- Tâche agent_tasks : 41000c16-27c7-42c7-9731-249cf9165354
-- ============================================================================
-- Les libellés de section (« Destination testée », « Durée idéale », « On y
-- est allés », CTA final…) étaient écrits en dur dans le JSX de
-- DestinationPage.tsx. Ils deviennent des zones éditables, une par page et
-- par libellé, avec exactement la valeur affichée jusqu'ici.
--
-- Idempotent et non destructif : ON CONFLICT DO NOTHING. Les zones de contenu
-- existantes (title, subtitle, description, verdict, duration, season,
-- budget, profile, tip_*, hero_image, seo_*) déjà saisies en base ne sont
-- jamais touchées.
--
-- Retour arrière : voir agent_tasks.rollback_sql (tâche ci-dessus).

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
SELECT p.page, z.zone_key, 'text', z.value, z.label, true
FROM (VALUES
  ('destinations-sicile'),
  ('destinations-lisbonne'),
  ('destinations-suisse'),
  ('destinations-zurich'),
  ('destinations-paris')
) AS p(page)
CROSS JOIN (VALUES
  ('hero_badge',         'Destination testée',                     'Badge du hero'),
  ('info_duration_label','Durée idéale',                           'Libellé carte Durée'),
  ('info_season_label',  'Meilleure saison',                       'Libellé carte Saison'),
  ('info_budget_label',  'Budget indicatif',                        'Libellé carte Budget'),
  ('info_profile_label', 'Profil',                                  'Libellé carte Profil'),
  ('description_title',  'On y est allés',                          'Titre section description'),
  ('subdest_title',      'Explorer les pépites de la région',       'Titre section sous-destinations'),
  ('subdest_teaser',     'Nos guides détaillés de terrain par ville et site d''intérêt.', 'Sous-titre sous-destinations'),
  ('subdest_cta',        'Voir le guide →',                         'Lien carte sous-destination'),
  ('tips_title',         'Ce qu''on te recommande',                 'Titre section conseils'),
  ('verdict_badge',      'Notre verdict',                           'Badge section verdict'),
  ('verdict_signature',  '— Heldonica, testés sur place',           'Signature du verdict'),
  ('cta_title',          'Tu veux un voyage adapté à ton rythme ?', 'Titre du CTA final'),
  ('cta_text',           'On transforme tes contraintes en itinéraire sur mesure, avec adresses testées.', 'Texte du CTA final'),
  ('cta_button',         'Planifier ce voyage avec Heldonica →',    'Bouton du CTA final')
) AS z(zone_key, value, label)
WHERE true
ON CONFLICT (page, zone_key) DO NOTHING;
