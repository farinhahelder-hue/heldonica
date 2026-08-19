-- ============================================================
-- MIGRATION : RLS Security Fix — email_sequences
-- STATUT : À appliquées en prod
-- DATE : 2026-07-09
-- 
-- Contexte : La table email_sequences n'a pas de RLS activé,
-- exposant potentiellement les données email des séquences
-- newsletter (J+3, J+7) via les rôles anon/authenticated.
--
-- Solution : Activer RLS avec policy service_role only
-- (le cron n8n ou webhook utilise SUPABASE_SERVICE_ROLE_KEY)
-- ============================================================

-- 1. Activer RLS sur email_sequences
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les policies existantes (si migration précédente incomplète)
DROP POLICY IF EXISTS "Public read email_sequences" ON public.email_sequences;
DROP POLICY IF EXISTS "Public write email_sequences" ON public.email_sequences;
DROP POLICY IF EXISTS "Allow public email_sequences access" ON public.email_sequences;

-- 3. Policy : Service role ONLY (pas d'accès public)
--    Les opérations de lecture/écriture/suppression sont réservées au service role
CREATE POLICY "Service role only email_sequences"
  ON public.email_sequences
  FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Supprimer les grants publics résiduels
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.email_sequences FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.email_sequences FROM authenticated;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.email_sequences FROM public;

-- 5. Accorder uniquement au service_role
GRANT ALL ON public.email_sequences TO service_role;

-- ============================================================
-- VÉRIFICATION POST-DÉPLOIEMENT
-- ============================================================
-- Exécuter dans le SQL Editor Supabase :
--
-- 1. Vérifier que RLS est activé :
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE tablename = 'email_sequences' AND schemaname = 'public';
-- 
-- Résultat attendu : rowsecurity = true
--
-- 2. Vérifier les policies :
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies WHERE tablename = 'email_sequences';
--
-- Résultat attendu : 1 policy "Service role only email_sequences" pour ALL
--
-- 3. Tester l'accès anonyme (devrait échouer) :
-- SELECT * FROM email_sequences LIMIT 1;
-- --> Erreur attendue : "permission denied for table email_sequences"
--
-- 4. Tester avec service role (dans le dashboard ou via API) :
-- SELECT * FROM email_sequences LIMIT 5;
-- --> OK si service_role key utilisé
-- ============================================================
