
-- ============================================================
-- GOVERNANCE IA — Upgrade agent_tasks
-- Ajoute : scope, périmètre autorisé, résumé actions, 
-- migrations déclenchées, statut étendu, validé par
-- ============================================================

ALTER TABLE agent_tasks
  ADD COLUMN IF NOT EXISTS scope          text,           -- 'schema' | 'content' | 'security' | 'seo' | 'infra'
  ADD COLUMN IF NOT EXISTS description    text,           -- résumé humain de la tâche
  ADD COLUMN IF NOT EXISTS actions_done   jsonb,          -- liste des actions réalisées
  ADD COLUMN IF NOT EXISTS migrations     text[],         -- noms des migrations appliquées
  ADD COLUMN IF NOT EXISTS files_modified text[],         -- fichiers touchés (code)
  ADD COLUMN IF NOT EXISTS allowed_tables text[],         -- tables autorisées pour cette session
  ADD COLUMN IF NOT EXISTS forbidden_ops  text[],         -- opérations interdites déclarées
  ADD COLUMN IF NOT EXISTS validated_by   text,           -- 'heldonica' | 'pending' | 'auto'
  ADD COLUMN IF NOT EXISTS validated_at   timestamptz,
  ADD COLUMN IF NOT EXISTS risk_level     text DEFAULT 'low', -- 'low' | 'medium' | 'high' | 'critical'
  ADD COLUMN IF NOT EXISTS rollback_sql   text,           -- SQL de rollback si besoin
  ADD COLUMN IF NOT EXISTS notes          text,
  ADD COLUMN IF NOT EXISTS updated_at     timestamptz DEFAULT now();

-- Contrainte sur les statuts étendus
ALTER TABLE agent_tasks
  DROP CONSTRAINT IF EXISTS agent_tasks_status_check;

ALTER TABLE agent_tasks
  ADD CONSTRAINT agent_tasks_status_check
  CHECK (status IN ('pending', 'sent', 'in_progress', 'done', 'failed', 'rolled_back', 'waiting_validation'));

-- Contrainte sur risk_level
ALTER TABLE agent_tasks
  ADD CONSTRAINT agent_tasks_risk_check
  CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent      ON agent_tasks(agent);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status     ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_scope      ON agent_tasks(scope);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_risk       ON agent_tasks(risk_level);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_validated  ON agent_tasks(validated_by);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created    ON agent_tasks(created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_agent_tasks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agent_tasks_updated_at ON agent_tasks;
CREATE TRIGGER agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW EXECUTE FUNCTION update_agent_tasks_timestamp();

-- Vue dashboard governance
CREATE OR REPLACE VIEW v_agent_governance AS
SELECT
  agent,
  scope,
  risk_level,
  status,
  validated_by,
  COUNT(*)                                        AS nb_tasks,
  MAX(created_at)                                 AS derniere_action,
  SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS taches_terminees,
  SUM(CASE WHEN status = 'waiting_validation' THEN 1 ELSE 0 END) AS en_attente_validation,
  SUM(CASE WHEN risk_level IN ('high','critical') THEN 1 ELSE 0 END) AS taches_risquees
FROM agent_tasks
GROUP BY agent, scope, risk_level, status, validated_by
ORDER BY derniere_action DESC NULLS LAST;

COMMENT ON TABLE agent_tasks IS 
'Registre de gouvernance IA — toute session Claude/Gemini/Jules/autre doit créer une entrée AVANT de commencer et la mettre à jour à la fin. Champ validated_by doit être mis à heldonica pour valider.';
