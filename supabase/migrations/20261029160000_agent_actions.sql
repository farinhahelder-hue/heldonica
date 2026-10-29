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
-- Append-only, tenu par un trigger et pas seulement par RLS : aucune policy
-- UPDATE ni DELETE, et un trigger `BEFORE UPDATE OR DELETE` qui leve pour tout
-- le monde, y compris le service_role (qui contourne RLS par nature). Un
-- journal reinscriptible ne prouve rien.
--
-- Horodatage : 20261029160000, volontairement posterieur a
-- 20261029150000_journal_agent_task_events.sql (appliquee en production).
-- Un numero anterieur ferait refuser `supabase db push` (« Found local
-- migration files to be inserted before the last migration on remote
-- database »).
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

-- ── Append-only, reellement ──────────────────────────────────────────────────
-- RLS seule ne protege que anon et authenticated : le service_role la
-- contourne par construction. Sans ce trigger, un script pourrait donc
-- reecrire ou effacer une ligne du journal sans laisser de trace — le
-- contraire de ce que cette table existe pour prouver.
--
-- Exception unique : task_id est en ON DELETE SET NULL, donc supprimer une
-- tache provoque un UPDATE sur agent_actions. On l'autorise a condition que
-- seule cette colonne ait bouge ; tout autre changement est refuse.
--
-- Preuve attendue a l'application : dans une transaction annulee (BEGIN …
-- ROLLBACK), un UPDATE de `verb` doit lever (SQLSTATE 23001), et une
-- suppression de agent_tasks doit passer en mettant task_id a NULL.

CREATE OR REPLACE FUNCTION public.agent_actions_append_only()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $fn$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'agent_actions est append-only : suppression interdite (id=%)', OLD.id
      USING ERRCODE = 'restrict_violation';
  END IF;

  IF (to_jsonb(NEW) - 'task_id') IS DISTINCT FROM (to_jsonb(OLD) - 'task_id') THEN
    RAISE EXCEPTION 'agent_actions est append-only : modification interdite (id=%)', OLD.id
      USING ERRCODE = 'restrict_violation';
  END IF;

  RETURN NEW;
END;
$fn$;

COMMENT ON FUNCTION public.agent_actions_append_only() IS
  'Refuse toute modification ou suppression dans agent_actions. Seule exception : la mise a NULL de task_id par le ON DELETE SET NULL de la cle etrangere.';

DROP TRIGGER IF EXISTS agent_actions_append_only_trigger ON public.agent_actions;
CREATE TRIGGER agent_actions_append_only_trigger
  BEFORE UPDATE OR DELETE ON public.agent_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.agent_actions_append_only();
