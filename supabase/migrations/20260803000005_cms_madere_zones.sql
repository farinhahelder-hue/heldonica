-- ============================================================================
-- Page itinéraire Madère 7 jours : contenu piloté par le CMS (cms_editable_zones)
-- Date: 2026-08-01 — généré par scripts/generate-madere-cms.mjs
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

-- ─── destinations-madere-itineraire-7-jours ────────────────────────────────────────────────────────
INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('destinations-madere-itineraire-7-jours', 'hero_badge', 'text', 'Madère - Itinéraire', 'Badge du hero', true),
  ('destinations-madere-itineraire-7-jours', 'hero_title', 'text', 'Itinéraire Madère 7 jours', 'Titre du hero', true),
  ('destinations-madere-itineraire-7-jours', 'hero_description', 'textarea', 'Un plan fait pour respirer : moins de zigzags, plus de cohérence entre
              paysages, adresses et énergie du duo.', 'Description du hero', true),
  ('destinations-madere-itineraire-7-jours', 'day_1_title', 'text', 'Jour 1 - Atterrissage doux à Funchal', 'Jour 1 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'day_1_content', 'textarea', 'Installation, marché des lavradores, front de mer, dîner local sans pression horaire.', 'Jour 1 — contenu', true),
  ('destinations-madere-itineraire-7-jours', 'day_2_title', 'text', 'Jour 2 - Ponta de São Lourenço', 'Jour 2 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'day_2_content', 'textarea', 'Départ matinal, rando côte est, pause longue face aux reliefs puis retour lent.', 'Jour 2 — contenu', true),
  ('destinations-madere-itineraire-7-jours', 'day_3_title', 'text', 'Jour 3 - Levadas et forêts', 'Jour 3 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'day_3_content', 'textarea', 'Section de levada adaptée à ton niveau, pause pique-nique et fin de journée en village.', 'Jour 3 — contenu', true),
  ('destinations-madere-itineraire-7-jours', 'day_4_title', 'text', 'Jour 4 - Nord volcanique', 'Jour 4 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'day_4_content', 'textarea', 'Route panoramique, piscines naturelles, session photo et table locale en bord de mer.', 'Jour 4 — contenu', true),
  ('destinations-madere-itineraire-7-jours', 'day_5_title', 'text', 'Jour 5 - Villages suspendus', 'Jour 5 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'day_5_content', 'textarea', 'Jardins, belvédères et cafés de hauteur. Journée idéale pour ralentir sans se couper du paysage.', 'Jour 5 — contenu', true),
  ('destinations-madere-itineraire-7-jours', 'day_6_title', 'text', 'Jour 6 - Journée modulable', 'Jour 6 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'day_6_content', 'textarea', 'Option mer, option montagne ou option repos complet selon météo et niveau d''énergie.', 'Jour 6 — contenu', true),
  ('destinations-madere-itineraire-7-jours', 'day_7_title', 'text', 'Jour 7 - Clôture sensorielle', 'Jour 7 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'day_7_content', 'textarea', 'Dernier panorama, achats utiles, retour à Funchal et départ sans course de fin de voyage.', 'Jour 7 — contenu', true),
  ('destinations-madere-itineraire-7-jours', 'conseil_1_title', 'text', 'Conseil rythme', 'Conseil 1 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'conseil_1_text', 'textarea', 'Ne surcharge pas les jours 2 à 4. Madère fatigue vite si on empile
                trop de dénivelé et de route.', 'Conseil 1 — texte', true),
  ('destinations-madere-itineraire-7-jours', 'conseil_2_title', 'text', 'Conseil budget', 'Conseil 2 — titre', true),
  ('destinations-madere-itineraire-7-jours', 'conseil_2_text', 'textarea', 'Garde une marge pour la météo : parfois on décale une activité et on
                gagne en qualité d''expérience.', 'Conseil 2 — texte', true),
  ('destinations-madere-itineraire-7-jours', 'cta_title', 'text', 'Besoin de la version sur mesure de cet itinéraire ?', 'Titre du CTA', true),
  ('destinations-madere-itineraire-7-jours', 'cta_text', 'textarea', 'On ajuste ce cadre à ton budget, ta saison et ton énergie réelle.', 'Texte du CTA', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
