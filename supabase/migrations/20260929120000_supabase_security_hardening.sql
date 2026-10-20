-- 20260929120000_supabase_security_hardening.sql
-- Migration de renforcement de la sécurité Supabase (RLS, vues, fonctions et nettoyage)

-- 1. Tables de sauvegarde temporaires : CONSERVÉES (décision du 20/10/2026).
--    Le DROP initialement prévu (DROP TABLE backup_articles_20260915 CASCADE)
--    est RETIRÉ de cette migration. Raison : la table contient 50 lignes dont
--    **10 n'existent nulle part ailleurs** en base, dont trois notes « paris-* »
--    (paris-515737, paris-592257, paris-900227), « carnet-mobile-665679 »,
--    « timisoara-932848 », « madere-en-mars », « lisbonne-72h-sans-touristes »,
--    « voix-heldonica-manifeste », « ici-792063 » et
--    « les-meilleures-brasseries-…-2025 ». Ce sont des notes utilisateur, pas
--    des doublons : la règle du projet est de comparer les octets, pas les slugs.
--    Un export intégral est conservé hors ligne :
--    .audit/audit-editorial-2026-10-20/backup_articles_20260915-export.json
--    La suppression se décidera à part, une fois les 10 lignes réintégrées ou
--    archivées. Ne pas réintroduire de DROP ici.

-- 2. Sécurisation des fonctions RPC (retrait de l'accès public anon)
REVOKE EXECUTE ON FUNCTION match_articles FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION match_destinations FROM PUBLIC, anon;

-- Accès restreint uniquement pour service_role et authenticated si la fonction existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_auth_role') THEN
    REVOKE EXECUTE ON FUNCTION check_auth_role FROM PUBLIC, anon;
  END IF;
END $$;

-- 3. Sécurisation de la vue v_agent_governance (security_invoker = true)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'v_agent_governance') THEN
    ALTER VIEW v_agent_governance SET (security_invoker = true);
  END IF;
END $$;

-- 4. Renforcement RLS et stratégies (Policies) pour les tables sensibles

-- Table api_keys
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_api_keys" ON api_keys;
CREATE POLICY "service_role_all_api_keys" ON api_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Table ai_requests_log
ALTER TABLE IF EXISTS ai_requests_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_ai_requests_log" ON ai_requests_log;
CREATE POLICY "service_role_all_ai_requests_log" ON ai_requests_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Table instagram_scheduled_posts
ALTER TABLE IF EXISTS instagram_scheduled_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_instagram_scheduled_posts" ON instagram_scheduled_posts;
CREATE POLICY "service_role_all_instagram_scheduled_posts" ON instagram_scheduled_posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Table copilot_generations
ALTER TABLE IF EXISTS copilot_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_copilot_generations" ON copilot_generations;
CREATE POLICY "service_role_all_copilot_generations" ON copilot_generations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
