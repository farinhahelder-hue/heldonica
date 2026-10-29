-- ============================================================================
-- Journal des actions d'agents — append-only
-- Date : 2026-10-29
-- ============================================================================
-- Contexte
-- --------
-- `agent_tasks` dit ce qui est demande et ce qui est declare fini. Il ne dit
-- ni quand, ni comment : entre `prendre_tache` et `rendre_compte`, il n'existe
-- aucune trace. Un `actions_done` est une reconstruction redigee a la fin,
-- exactement le point ou le projet a deja ete trompe (« done » sans
-- verification, montage video annonce fini et jamais rendu).
--
-- Cette table est le journal du deroule : une ligne par geste (outil MCP,
-- commit, garde-fou, commande explicite), ecrite en best-effort par
-- `scripts/agent-journal.mjs`. Le detail est redige (`redact()`) avant
-- l'ecriture : aucune valeur de secret n'entre ici.
--
-- Append-only : aucune policy UPDATE ni DELETE. Seul le service_role ecrit et
-- lit (il contourne RLS par nature) ; anon et authenticated ne voient rien.
-- Un journal reinscriptible ne prouve rien.
--
-- ⚠️ La base est partagee avec une autre application (voir
-- docs/CMS_FOUNDATION_PHASE_0_INVENTAIRE.md §2) : cette migration ne nomme que
-- sa propre table, ne touche a aucune policy existante et ne cree aucun seed.
--
-- Application : `supabase db push` apres revue humaine. Tant qu'elle n'est pas
-- appliquee, `agent-journal` se tait (il ne bloque jamais un geste).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_actions (
  id          bigserial PRIMARY KEY,
  task_id     uuid REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  agent       text NOT NULL,                        -- claude, gemini, freebuff…
  session_id  text,                                 -- session/outil, jamais un secret
  kind        text NOT NULL,                        -- task | tool | git | db | file | ci | deploy | decision
  verb        text NOT NULL,                        -- prendre_tache, commit, migration_appliquee…
  target      text,                                 -- fichier, table, branche, route…
  outcome     text NOT NULL DEFAULT 'ok',           -- ok | refuse | erreur | ignore
  detail      jsonb NOT NULL DEFAULT '{}'::jsonb,   -- args redacted, diffstat, message d'erreur
  commit_sha  text,
  branch      text,
  duration_ms integer,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.agent_actions IS
  'Journal append-only des actions d''agents : une ligne par geste, detail redacted. Complete agent_tasks (intention) sans le remplacer.';

COMMENT ON COLUMN public.agent_actions.detail IS
  'Contexte de l''action apres passage par redact() : noms de champs et tailles, jamais de valeur de secret.';

CREATE INDEX IF NOT EXISTS idx_agent_actions_task
  ON public.agent_actions (task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent
  ON public.agent_actions (agent, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_commit
  ON public.agent_actions (commit_sha);

ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

-- Aucune policy n'est creee volontairement : sans policy, RLS refuse tout a
-- anon et authenticated, et le service_role (scripts, MCP, CI) passe outre.
-- Si une lecture admin cote client devient necessaire, elle passera par une
-- route serveur, pas par une policy ouverte.
