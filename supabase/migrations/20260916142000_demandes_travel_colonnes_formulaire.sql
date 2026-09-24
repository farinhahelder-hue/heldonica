-- demandes_travel : aligner la table réelle sur ce que le formulaire envoie
--
-- La migration 20260709000001 disait CREATE TABLE IF NOT EXISTS ; la table
-- existait déjà (créée à la main, avec prenom / style_voyage / nb_voyageurs /
-- duree_jours integer). Elle est « appliquée » dans l'historique mais n'a rien
-- créé : POST /api/travel-planning échouait en PGRST204 sur trip_type depuis
-- le 11/07, et « 1 semaine » ne rentre pas dans un integer. Mesuré le 16/09 :
-- 0 ligne dans la table. Piège n° 3 d'AGENTS.md, vérifier information_schema
-- avant d'écrire sur une table existante.

ALTER TABLE public.demandes_travel
  ADD COLUMN IF NOT EXISTS trip_type TEXT,
  ADD COLUMN IF NOT EXISTS vibe TEXT,
  ADD COLUMN IF NOT EXISTS destination_detail TEXT,
  ADD COLUMN IF NOT EXISTS brevo_synced BOOLEAN DEFAULT false;

-- Le formulaire propose « Week-end (2-3 jours) », « 1 semaine »… : du texte.
-- Table vide au moment de la migration ; USING garde le sens si une valeur existait.
ALTER TABLE public.demandes_travel
  ALTER COLUMN duree_jours TYPE TEXT USING duree_jours::text;

-- Pré-itinéraire proposé par l'IA au panneau (jamais envoyé au client) :
-- { texte, destinations: [{slug, title, similarity}], modele, score, genere_le }
ALTER TABLE public.demandes_travel
  ADD COLUMN IF NOT EXISTS proposition_ia JSONB;

COMMENT ON COLUMN public.demandes_travel.trip_type IS 'Étape 1 du formulaire : type d''escapade';
COMMENT ON COLUMN public.demandes_travel.vibe IS 'Étape 1 du formulaire : ambiance (Slow Travel & Détente, Aventure & Nature…)';
COMMENT ON COLUMN public.demandes_travel.destination_detail IS 'Précision libre sur la destination';
COMMENT ON COLUMN public.demandes_travel.duree_jours IS 'Texte du formulaire (« 1 semaine »), pas un entier';
COMMENT ON COLUMN public.demandes_travel.proposition_ia IS 'Pré-itinéraire IA pour le panneau, construit sur le vécu des destinations — brouillon interne, pas un envoi';
