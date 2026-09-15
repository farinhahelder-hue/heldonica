-- Fix #442: Policies RLS sur 7 tables avec RLS active mais sans policy
-- Supabase Advisors 12/09/2026: 7 tables avec RLS active mais aucune policy
-- Principe moindre privilège: public read là où nécessaire, service_role only sinon

-- 1. cms_pricing_plans — public read, service write
ALTER TABLE public.cms_pricing_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique pricing" ON public.cms_pricing_plans;
CREATE POLICY "Lecture publique pricing" ON public.cms_pricing_plans FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Service write pricing" ON public.cms_pricing_plans;
CREATE POLICY "Service write pricing" ON public.cms_pricing_plans FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. instagram_comments — service_role only (déjà fix 20260903000002, on s'assure)
ALTER TABLE public.instagram_comments ENABLE ROW LEVEL SECURITY;
-- Pas de policy publique → service_role bypass, anon = 0 row

-- 3. instagram_scheduled_posts — service_role only
ALTER TABLE public.instagram_scheduled_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service only scheduled" ON public.instagram_scheduled_posts;
-- Pas de policy publique

-- 4. instagram_webhook_logs — service_role only
ALTER TABLE public.instagram_webhook_logs ENABLE ROW LEVEL SECURITY;
-- Pas de policy publique

-- 5. jules_memory — service_role only (interne Jules)
ALTER TABLE public.jules_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service only jules_memory" ON public.jules_memory;
-- Pas de policy publique

-- 6. jules_sessions — service_role only
ALTER TABLE public.jules_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service only jules_sessions" ON public.jules_sessions;
-- Pas de policy publique

-- 7. newsletter_subscribers — anon insert, service read
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon insert newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anon insert newsletter" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Service read newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Service read newsletter" ON public.newsletter_subscribers FOR SELECT TO service_role USING (true);
