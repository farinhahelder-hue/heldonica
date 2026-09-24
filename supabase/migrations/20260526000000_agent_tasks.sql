-- Migration : historique des tâches envoyées aux agents IA
-- Remplace le stockage localStorage

CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT NOT NULL,
  task TEXT NOT NULL,
  repo TEXT,
  branch TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pas de RLS — table interne CMS uniquement
-- Lecture via SUPABASE_SERVICE_ROLE_KEY côté serveur
