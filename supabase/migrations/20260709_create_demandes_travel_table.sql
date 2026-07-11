-- ============================================================
-- MIGRATION : Créer table demandes_travel avec RLS
-- DATE : 2026-07-09
-- 
-- Contexte : Le formulaire Travel Planning insère dans demandes_travel
-- mais cette table n'existe peut-être pas ou n'a pas de RLS.
-- ============================================================

-- 1. Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.demandes_travel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_type TEXT,
  vibe TEXT,
  destination TEXT NOT NULL,
  destination_detail TEXT,
  duree_jours TEXT,
  budget_fourchette TEXT,
  mois_depart TEXT,
  prenom TEXT NOT NULL,
  nom TEXT DEFAULT '',
  email TEXT NOT NULL,
  telephone TEXT,
  notes TEXT,
  statut TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  email_sent_at TIMESTAMPTZ,
  notes_internes TEXT DEFAULT '',
  brevo_synced BOOLEAN DEFAULT false
);

-- 2. Ajouter commentaires
COMMENT ON TABLE public.demandes_travel IS 'Demandes de voyage depuis le formulaire Travel Planning';
COMMENT ON COLUMN public.demandes_travel.statut IS 'new, contacted, proposal_sent, converted, lost';

-- 3. Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_demandes_travel_statut ON demandes_travel(statut);
CREATE INDEX IF NOT EXISTS idx_demandes_travel_created_at ON demandes_travel(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demandes_travel_email ON demandes_travel(email);

-- 4. Activer RLS
ALTER TABLE public.demandes_travel ENABLE ROW LEVEL SECURITY;

-- 5. Supprimer policies existantes
DROP POLICY IF EXISTS "Allow insert demandes" ON public.demandes_travel;
DROP POLICY IF EXISTS "Allow read demandes" ON public.demandes_travel;
DROP POLICY IF EXISTS "Allow update demandes" ON public.demandes_travel;

-- 6. Policy : Service role only (pas d'accès public)
CREATE POLICY "Service role only demandes_travel"
  ON public.demandes_travel
  FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 7. Révoquer grants publics
REVOKE ALL ON public.demandes_travel FROM anon;
REVOKE ALL ON public.demandes_travel FROM authenticated;
REVOKE ALL ON public.demandes_travel FROM public;

-- 8. Accorder au service_role
GRANT ALL ON public.demandes_travel TO service_role;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE tablename = 'demandes_travel';
-- --> rowsecurity = true
-- 
-- SELECT policyname, cmd FROM pg_policies 
-- WHERE tablename = 'demandes_travel';
-- --> "Service role only demandes_travel" | ALL
-- ============================================================
