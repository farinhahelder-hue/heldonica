-- Table pour stocker l'historique des sessions Jules
CREATE TABLE IF NOT EXISTS jules_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  state TEXT DEFAULT 'pending',
  source TEXT,
  url TEXT,
  create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pr_url TEXT,
  pr_title TEXT,
  pr_description TEXT,
  created_by TEXT DEFAULT 'jules'
);

-- Table pour le "cerveau central" - log des actions
CREATE TABLE IF NOT EXISTS jules_memory (
  id SERIAL PRIMARY KEY,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  detail JSONB,
  session_id TEXT REFERENCES jules_sessions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE jules_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jules_memory ENABLE ROW LEVEL SECURITY;

-- Politiques (admin only)
CREATE POLICY "Admin can do everything on jules_sessions" ON jules_sessions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can do everything on jules_memory" ON jules_memory
  FOR ALL USING (auth.role() = 'authenticated');