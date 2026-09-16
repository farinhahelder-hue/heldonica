-- Migration : 20260916120000_create_api_keys_and_ai_logs.sql
-- Authentification universelle des agents IA (Antigravity, Claude Code, Pencode, Mobile APK)
-- et journalisation centralisée des requêtes IA.

-- 1. Table des clés API des agents
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'antigravity', 'claude', 'pencode', 'mobile_apk'
  key_prefix TEXT NOT NULL, -- e.g. 'hld_ag_', 'hld_cl_', 'hld_pe_', 'hld_mb_'
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 du token complet
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  rate_limit INTEGER NOT NULL DEFAULT 100, -- requêtes par heure
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- RLS : seule la clé service ou les fonctions serveur peuvent lire/écrire
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys (key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_name ON public.api_keys (name);

-- 2. Table des journaux d'appels IA centralisés
CREATE TABLE IF NOT EXISTS public.ai_requests_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  agent_name TEXT NOT NULL, -- 'antigravity', 'claude', 'pencode', 'mobile_apk', 'cms_session'
  endpoint TEXT NOT NULL, -- '/api/ai/vision', '/api/ai/copilot'
  model TEXT NOT NULL, -- 'gemini-2.5-flash', etc.
  prompt_preview TEXT, -- Aperçu des premiers caractères du prompt
  status_code INTEGER NOT NULL, -- 200, 400, 429, 500, 502
  duration_ms INTEGER, -- Durée en millisecondes
  error TEXT, -- Message d'erreur éventuel
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS : protégée par défaut
ALTER TABLE public.ai_requests_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ai_requests_log_created ON public.ai_requests_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_requests_log_agent ON public.ai_requests_log (agent_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_requests_log_endpoint ON public.ai_requests_log (endpoint, created_at DESC);
