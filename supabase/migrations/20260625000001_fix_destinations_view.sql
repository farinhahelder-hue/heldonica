-- ============================================================
-- HELDONICA — Fix destinations schema + vue sécurisée
-- Fichier : 20260625_fix_destinations_view.sql
-- CONTEXTE : 20260615_destinations_v2.sql n'a pas été appliquée
--            en production → colonnes manquantes sur destinations
-- ORDRE D'EXÉCUTION : après 20260625_audit_fixes.sql
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- ÉTAPE 1 — Ajouter les colonnes manquantes sur destinations
--           (IF NOT EXISTS = safe même si partiellement appliqué)
-- ──────────────────────────────────────────────────────────────

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS status TEXT
    DEFAULT 'draft'
    CHECK (status IN ('draft', 'coming_soon', 'published', 'starred'));

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS tagline TEXT;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS article_count INTEGER DEFAULT 0;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS continent TEXT;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS flag_emoji TEXT;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS hero_unsplash_url TEXT;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS teaser TEXT;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS coming_soon_date TEXT;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS travel_style TEXT;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS best_season TEXT;

ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS avg_budget_couple_week INTEGER;

-- Mettre à jour le statut des destinations existantes
UPDATE public.destinations
SET status = 'published', priority_score = 100
WHERE slug IN ('roumanie', 'madere', 'montenegro')
  AND (status IS NULL OR status = 'draft');

UPDATE public.destinations
SET status = 'published', priority_score = 80
WHERE slug IN ('lisbonne', 'paris', 'sardaigne', 'sicile', 'colombie',
               'portugal', 'normandie', 'suisse', 'zurich')
  AND (status IS NULL OR status = 'draft');

-- Continent par défaut pour les destinations existantes
UPDATE public.destinations
SET continent = 'Europe'
WHERE continent IS NULL;

-- ──────────────────────────────────────────────────────────────
-- ÉTAPE 2 — Recréer destinations_public en SECURITY INVOKER
--           (résout l'alerte "SECURITY DEFINER View" de Supabase)
-- ──────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS public.destinations_public;

CREATE VIEW public.destinations_public
WITH (security_invoker = true)
AS
SELECT
  slug,
  title,
  excerpt,
  country,
  continent,
  region,
  flag_emoji,
  tagline,
  teaser,
  hero_unsplash_url,
  featured_image,
  link,
  COALESCE(travel_style, category) AS travel_style,
  best_season,
  avg_budget_couple_week,
  status,
  priority_score,
  article_count,
  coming_soon_date,
  latitude,
  longitude,
  published
FROM public.destinations
WHERE published = true
   OR status IN ('coming_soon', 'starred')
ORDER BY priority_score DESC, title ASC;

-- ──────────────────────────────────────────────────────────────
-- VÉRIFICATION
-- ──────────────────────────────────────────────────────────────

-- Confirme que la vue est accessible et retourne des lignes
SELECT slug, title, status, continent
FROM public.destinations_public
LIMIT 5;

-- Confirme qu'il n'y a plus d'alerte SECURITY DEFINER
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'destinations_public';
