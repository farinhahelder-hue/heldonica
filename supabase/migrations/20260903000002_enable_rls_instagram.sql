-- Fix RLS critical: instagram_comments + instagram_webhook_logs étaient avec rls_enabled=false
-- Exposées à anon/authenticated (clé anon publique dans bundle). jules_memory déjà OK.
-- Correctif: ENABLE RLS sans policy public = service_role only (bypass RLS), anon/authenticated bloqués.
-- CMS lit via /api/cms/instagram/comments qui utilise SUPABASE_SERVICE_ROLE_KEY côté serveur.

ALTER TABLE public.instagram_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Nettoie éventuelles policies permissives laissées avant (si aucune, DROP IF EXISTS est no-op)
DROP POLICY IF EXISTS "Allow all" ON public.instagram_comments;
DROP POLICY IF EXISTS "Allow anon read" ON public.instagram_comments;
DROP POLICY IF EXISTS "public read" ON public.instagram_comments;
DROP POLICY IF EXISTS "Allow all" ON public.instagram_webhook_logs;
DROP POLICY IF EXISTS "Allow anon read" ON public.instagram_webhook_logs;
DROP POLICY IF EXISTS "public read" ON public.instagram_webhook_logs;

-- Politique explicite deny-all pour anon/authenticated (service_role bypass de toute façon)
-- On ne crée pas de policy SELECT pour anon → tout accès direct client = 0 row, comme voulu.
-- Si besoin futur d'un rôle admin client (ex: user_profiles.role='admin'), ajouter:
-- CREATE POLICY "admin read" ON public.instagram_comments FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
