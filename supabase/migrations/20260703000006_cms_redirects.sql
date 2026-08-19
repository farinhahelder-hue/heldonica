-- Creation de la table pour le gestionnaire de redirections dynamiques
CREATE TABLE IF NOT EXISTS cms_redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_path TEXT UNIQUE NOT NULL,
  to_path TEXT NOT NULL,
  redirect_type INTEGER DEFAULT 301,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security)
ALTER TABLE cms_redirects ENABLE ROW LEVEL SECURITY;

-- Politique d'administration complete
CREATE POLICY "Admin all redirects" ON cms_redirects 
  USING (auth.role() = 'service_role');
