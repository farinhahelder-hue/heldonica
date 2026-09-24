-- ============================================================================
-- Page /organisateur : contenu piloté par le CMS
-- Date: 2026-08-01 — migrée manuellement (les zones hero_title / hero_subtitle
-- existaient déjà en prod)
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
('organisateur', 'saved_badge', 'text', 'Voyage sauvegardé localement', 'Badge sauvegarde auto', true),
  ('organisateur', 'saved_clear', 'text', 'Effacer', 'Bouton effacer la sauvegarde', true),
  ('organisateur', 'section_trip', 'text', 'Ton voyage', 'Section 1 — titre', true),
  ('organisateur', 'label_destination', 'text', 'Destination principale', 'Champ destination', true),
  ('organisateur', 'label_trip_type', 'text', 'Type de voyage', 'Champ type de voyage', true),
  ('organisateur', 'label_travelers', 'text', 'Voyageurs', 'Champ voyageurs', true),
  ('organisateur', 'label_dates', 'text', 'Dates', 'Champ dates', true),
  ('organisateur', 'label_departure', 'text', 'Départ', 'Sous-champ départ', true),
  ('organisateur', 'label_return', 'text', 'Retour', 'Sous-champ retour', true),
  ('organisateur', 'section_itineraire', 'text', 'Itinéraire', 'Section 2 — titre', true),
  ('organisateur', 'add_stage', 'text', 'Ajouter une étape', 'Bouton ajouter étape', true),
  ('organisateur', 'map_hint', 'text', 'Saisis le nom d''une ville et son pays pour visualiser ton itinéraire sur la carte', 'Indication carte', true),
  ('organisateur', 'section_budget', 'text', 'Budget estimé', 'Section 3 — titre', true),
  ('organisateur', 'budget_split', 'text', 'Répartition', 'Sous-titre répartition budget', true),
  ('organisateur', 'section_checklist', 'text', 'Checklist', 'Section 4 — titre', true),
  ('organisateur', 'checklist_add_label', 'text', 'Ajouter un item personnalisé', 'Libellé item personnalisé', true),
  ('organisateur', 'checklist_add_button', 'text', 'Ajouter', 'Bouton ajouter item', true),
  ('organisateur', 'action_tout_effacer', 'text', 'Tout effacer', 'Action 1', true),
  ('organisateur', 'action_imprimer', 'text', 'Imprimer', 'Action 2', true),
  ('organisateur', 'action_exporter_txt', 'text', 'Exporter .txt', 'Action 3', true),
  ('organisateur', 'cta_custom', 'text', 'Demander un itinéraire sur mesure', 'Bouton CTA final', true)
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
