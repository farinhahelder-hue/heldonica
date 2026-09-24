-- ============================================================================
-- Durcissement RLS — appliqué en prod le 2026-07-30
-- ============================================================================
-- Ce fichier documente et rend rejouable le durcissement appliqué via
-- `supabase db query --linked`. Idempotent.
--
-- ⚠️ Base partagée avec une autre application (tables emilie_*, missions,
-- reservations_seances). Ce fichier ne touche QUE des tables Heldonica,
-- nommées explicitement. Aucune opération globale sur le schéma public.
-- ============================================================================

-- ─── 1. email_sequences — alerte "RLS Disabled in Public" du Supabase Advisor ─
--
-- PRÉREQUIS CODE (déjà déployé, PR #457) : app/api/send-email-sequences
-- utilisait la clé anon. Appliquer ces REVOKE avant ce correctif aurait cassé
-- l'envoi des séquences email. La route utilise désormais createServiceClient().

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read email_sequences" ON public.email_sequences;
DROP POLICY IF EXISTS "Public write email_sequences" ON public.email_sequences;
DROP POLICY IF EXISTS "Allow public email_sequences access" ON public.email_sequences;

DROP POLICY IF EXISTS "Service role only email_sequences" ON public.email_sequences;
CREATE POLICY "Service role only email_sequences"
  ON public.email_sequences
  FOR ALL
  TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

REVOKE ALL ON public.email_sequences FROM anon;
REVOKE ALL ON public.email_sequences FROM authenticated;
GRANT ALL ON public.email_sequences TO service_role;

-- ─── 2. cms_newsletter — fuite PII latente ───────────────────────────────────
--
-- La table expose une colonne `email` et portait une policy
-- "Public select newsletter" avec USING (true) : n'importe qui disposant de la
-- clé anon (publique par design, embarquée dans le JS front) pouvait lister les
-- emails des inscrits.
--
-- Au moment de la correction la table contenait 0 ligne : aucune donnée n'a
-- été exposée. Seule /api/cms/newsletter la lit, en service_role — la
-- fermeture ne casse rien.
--
-- Les policies INSERT publiques sont CONSERVÉES : le formulaire d'inscription
-- côté visiteur doit continuer à fonctionner.

DROP POLICY IF EXISTS "Public select newsletter" ON public.cms_newsletter;

-- ─── Vérification ────────────────────────────────────────────────────────────
-- Attendu :
--   email_sequences : 1 policy (service_role), 0 grant anon/authenticated
--   cms_newsletter  : plus aucune policy SELECT ; les policies INSERT restent

SELECT tablename, policyname, cmd, roles::text
FROM pg_policies
WHERE tablename IN ('email_sequences', 'cms_newsletter')
ORDER BY tablename, cmd;

SELECT COALESCE(string_agg(DISTINCT grantee, ', '), 'AUCUN') AS grants_publics_email_sequences
FROM information_schema.role_table_grants
WHERE table_name = 'email_sequences' AND grantee IN ('anon', 'authenticated');
