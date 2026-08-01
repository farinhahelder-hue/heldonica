-- ============================================================================
-- Page /organisateur : contenu piloté par le CMS
-- Date: 2026-08-01 — migrée manuellement (les zones hero_title / hero_subtitle
-- existaient déjà en prod)
--
-- Idempotente : ON CONFLICT (page, zone_key) DO UPDATE.

INSERT INTO public.cms_editable_zones (page, zone_key, zone_type, value, label, is_active)
VALUES
  ('organisateur', 'saved_badge', 'text', 'Voyage sauvegardé localement', 'Badge sauvegarde auto'),
  ('organisateur', 'saved_clear', 'text', 'Effacer', 'Bouton effacer la sauvegarde'),
  ('organisateur', 'section_trip', 'text', 'Ton voyage', 'Section 1 — titre'),
  ('organisateur', 'label_destination', 'text', 'Destination principale', 'Champ destination'),
  ('organisateur', 'label_trip_type', 'text', 'Type de voyage', 'Champ type de voyage'),
  ('organisateur', 'label_travelers', 'text', 'Voyageurs', 'Champ voyageurs'),
  ('organisateur', 'label_dates', 'text', 'Dates', 'Champ dates'),
  ('organisateur', 'label_departure', 'text', 'Départ', 'Sous-champ départ'),
  ('organisateur', 'label_return', 'text', 'Retour', 'Sous-champ retour'),
  ('organisateur', 'section_itineraire', 'text', 'Itinéraire', 'Section 2 — titre'),
  ('organisateur', 'add_stage', 'text', 'Ajouter une étape', 'Bouton ajouter étape'),
  ('organisateur', 'map_hint', 'text', 'Saisis le nom d''une ville et son pays pour visualiser ton itinéraire sur la carte', 'Indication carte'),
  ('organisateur', 'section_budget', 'text', 'Budget estimé', 'Section 3 — titre'),
  ('organisateur', 'budget_split', 'text', 'Répartition', 'Sous-titre répartition budget'),
  ('organisateur', 'section_checklist', 'text', 'Checklist', 'Section 4 — titre'),
  ('organisateur', 'checklist_add_label', 'text', 'Ajouter un item personnalisé', 'Libellé item personnalisé'),
  ('organisateur', 'checklist_add_button', 'text', 'Ajouter', 'Bouton ajouter item'),
  ('organisateur', 'action_tout_effacer', 'text', 'Tout effacer', 'Action 1'),
  ('organisateur', 'action_imprimer', 'text', 'Imprimer', 'Action 2'),
  ('organisateur', 'action_exporter_txt', 'text', 'Exporter .txt', 'Action 3'),
  ('organisateur', 'cta_custom', 'text', 'Demander un itinéraire sur mesure', 'Bouton CTA final')
ON CONFLICT (page, zone_key) DO UPDATE
SET value = EXCLUDED.value, zone_type = EXCLUDED.zone_type,
    label = EXCLUDED.label, is_active = true, updated_at = NOW();
