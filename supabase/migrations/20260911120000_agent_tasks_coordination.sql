-- Verrou et dependances sur agent_tasks.
--
-- Plusieurs agents (Claude, Gemini, OpenCode, Jules, Muse Spark) lisent et
-- ecrivent cette table sans session commune. Rien n'empechait deux d'entre
-- eux de prendre la meme tache, ni d'editer les memes fichiers au meme
-- moment. Le protocole est dans AGENTS.md ; ces colonnes le rendent
-- verifiable.
--
-- claimed_by / claimed_at : qui a pris la tache, et quand. Se posent avant la
-- premiere modification. Une tache in_progress sans claimed_by est une
-- anomalie.
--
-- depends_on : la tache qui doit etre done avant celle-ci. Permet de deposer
-- une suite sans toucher a la tache d'un autre agent.

ALTER TABLE public.agent_tasks
  ADD COLUMN IF NOT EXISTS claimed_by TEXT,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS depends_on UUID REFERENCES public.agent_tasks(id);

-- Le statut par defaut historique est 'sent' ; on liste les valeurs admises
-- pour que trois agents n'inventent pas trois vocabulaires.
ALTER TABLE public.agent_tasks
  DROP CONSTRAINT IF EXISTS agent_tasks_status_check;
ALTER TABLE public.agent_tasks
  ADD CONSTRAINT agent_tasks_status_check
  CHECK (status IN ('sent', 'in_progress', 'waiting_validation', 'blocked', 'done'));

CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_status
  ON public.agent_tasks (agent, status);
