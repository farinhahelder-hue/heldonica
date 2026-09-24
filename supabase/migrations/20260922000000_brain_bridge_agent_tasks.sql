-- ============================================================
-- Brain-CMS Bridge — agent_tasks schema additions
-- Spec: .kiro/specs/brain-cms-bridge
-- Requirements: 6.1, 6.2, 6.3, 6.5
--
-- Adds two columns required by the bridge dispatcher and poller:
--   task_type  — string identifier for the Brain capability to invoke
--                ('generate_carousel', 'generate_itinerary', 'run_task',
--                 'chat', 'status')
--   payload    — structured JSON input passed to the Brain; max ~64 KB
--
-- Both columns are nullable so existing rows are unaffected.
-- No existing column, constraint, index, or row is modified or removed.
-- ============================================================

ALTER TABLE public.agent_tasks
  ADD COLUMN IF NOT EXISTS task_type TEXT,
  ADD COLUMN IF NOT EXISTS payload   JSONB;

-- Partial index for efficient Brain polling query:
--   SELECT … WHERE status = 'sent' AND agent = 'heldonica-brain'
-- A separate partial index (vs. the existing idx_agent_tasks_agent_status
-- regular index) lets Postgres skip non-sent rows entirely at the index level.
CREATE INDEX IF NOT EXISTS idx_agent_tasks_bridge_poll
  ON public.agent_tasks (agent, status)
  WHERE status = 'sent';
