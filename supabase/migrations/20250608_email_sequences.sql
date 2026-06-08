-- Séquences email newsletter (J+3, J+7)
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  step INTEGER NOT NULL CHECK (step IN (2, 3)),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, step)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_email_sequences_pending ON email_sequences(scheduled_at) WHERE sent_at IS NULL;