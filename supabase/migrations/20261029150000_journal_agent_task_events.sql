-- Migration 20261029150000_journal_agent_task_events.sql
-- Suivi des agents : journal append-only + lien vers les commits et les PR.
--
-- POURQUOI. Le registre `agent_tasks` ne garde que l'etat PRESENT : `rendre_compte`
-- fait un PATCH, donc chaque compte-rendu ecrase le precedent. `actions_done`,
-- `notes`, `description`, `files_modified` sont des champs uniques reecrits. On ne
-- peut pas reconstituer la trajectoire d'une tache (qui l'a prise, combien de fois
-- elle est passee en `waiting_validation`, ce qui a ete propose puis retire), et
-- rien ne relie une fiche aux commits ou a la PR qui l'ont realisee. Le 29/10, la
-- PR #767 n'etait rattachee a AUCUNE fiche.
--
-- Ce que cette migration ajoute, en deux volets :
--
--   VOLET 1 — `agent_task_events`, journal append-only alimente par TRIGGER.
--     Le trigger est pose sur `agent_tasks`, PAS dans le serveur MCP : tout ce qui
--     ecrit dans la table est capture, y compris un script SQL a la main ou un
--     agent qui oublie de rendre compte. Le MCP n'a rien a faire pour que ca marche.
--
--   VOLET 2 — `pr_url`, `commit_sha`, `created_by` sur `agent_tasks`.
--     `pr_url` / `commit_sha` rattachent la fiche a ce qu'elle a produit.
--     `created_by` dit qui a DEPOSE la tache (aujourd'hui `agent` designe le
--     destinataire ; l'auteur n'etait que dans le texte libre de `notes`).
--
-- APPEND-ONLY, VRAIMENT. `task_id` est en ON DELETE SET NULL, pas CASCADE : si une
-- tache disparait, son journal doit survivre (le `payload` garde la fiche entiere).
-- On ne supprime pas de tache ici — il n'y a pas d'outil pour ca, c'est voulu — mais
-- le journal ne doit pas dependre de cette discipline pour tenir.
--
-- NOTE D'EXPLOITATION. `supabase db push` peut executer les instructions d'un
-- fichier independamment les unes des autres : chaque instruction ci-dessous est
-- idempotente et sans dependance d'ordre fragile. Verifier l'etat reel apres
-- application (voir la requete de controle en fin de fichier).
--
-- NON APPLIQUEE a l'ecriture de ce fichier. A appliquer par un humain (regle #2).

-- ---------------------------------------------------------------------------
-- VOLET 1 — le journal
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.agent_task_events (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id     uuid REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  agent       text,           -- qui a agi : claimed_by, sinon created_by, sinon destinataire
  event_type  text NOT NULL,  -- depose | prise | statut | compte_rendu | validation | edition | suppression | etat_initial
  from_status text,
  to_status   text,
  payload     jsonb,          -- instantane complet : { old: {...}, new: {...} } ou la fiche entiere
  created_at  timestamptz DEFAULT now()
);

-- La lecture naturelle est « l'historique de cette tache, du plus recent au plus
-- ancien » ; la seconde est « ce qui s'est passe depuis telle date », pour le
-- tableau de bord.
CREATE INDEX IF NOT EXISTS idx_agent_task_events_task
  ON public.agent_task_events (task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_task_events_recence
  ON public.agent_task_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_task_events_agent
  ON public.agent_task_events (agent, created_at DESC);

ALTER TABLE public.agent_task_events ENABLE ROW LEVEL SECURITY;

-- Meme politique que cms_zone_history : le service_role seul ecrit et lit le
-- journal. Un agent ne peut pas effacer sa trace en passant par l'API REST
-- anonyme.
DROP POLICY IF EXISTS "Lecture du journal des taches" ON public.agent_task_events;
CREATE POLICY "Lecture du journal des taches"
  ON public.agent_task_events FOR SELECT
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Ecriture du journal des taches" ON public.agent_task_events;
CREATE POLICY "Ecriture du journal des taches"
  ON public.agent_task_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- VOLET 2 — rattacher la fiche a ce qu'elle a produit
-- ---------------------------------------------------------------------------

ALTER TABLE public.agent_tasks
  ADD COLUMN IF NOT EXISTS pr_url     text,  -- URL de la PR / MR qui realise la tache
  ADD COLUMN IF NOT EXISTS commit_sha text,  -- commit de tete au moment du compte-rendu
  ADD COLUMN IF NOT EXISTS created_by text;  -- qui a depose la tache

-- ---------------------------------------------------------------------------
-- Le trigger : une ligne de journal a chaque ecriture sur agent_tasks
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER : l'ecriture du journal ne doit pas dependre des droits de
-- l'appelant. Sinon un agent qui met a jour sa fiche verrait l'UPDATE reussir et
-- le journal echouer, ce qui est le pire des deux mondes.
CREATE OR REPLACE FUNCTION public.journaliser_agent_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  type_evt text;
  acteur   text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.agent_task_events (task_id, agent, event_type, from_status, to_status, payload)
    VALUES (
      NEW.id,
      COALESCE(NEW.created_by, NEW.agent),
      'depose',
      NULL,
      NEW.status,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- task_id est NULL : la ligne n'existe plus, la cle etrangere refuserait OLD.id.
    -- L'identite de la tache disparue reste dans le payload, pour l'enquete.
    INSERT INTO public.agent_task_events (task_id, agent, event_type, from_status, to_status, payload)
    VALUES (
      NULL,
      COALESCE(OLD.claimed_by, OLD.created_by, OLD.agent),
      'suppression',
      OLD.status,
      NULL,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;

  -- UPDATE : on nomme l'evenement par ce qui a change, du plus signifiant au plus
  -- anodin. Un seul evenement par UPDATE suffit — le `payload` garde les deux
  -- versions entieres, donc rien n'est perdu meme si l'etiquette est grossiere.
  --
  -- L'ORDRE COMPTE, et il a ete corrige apres un test : `actions_done` passe AVANT
  -- `status`, car `rendre_compte` change TOUJOURS les deux. Avec `status` en
  -- premier, aucun compte-rendu n'aurait jamais ete etiquete `compte_rendu` — le
  -- label le plus utile du journal serait reste du code mort. De meme `claimed_by`
  -- passe avant `status` : prendre une tache change les deux, et `prise` dit mieux
  -- ce qui s'est passe que `statut`.
  type_evt := CASE
    WHEN NEW.validated_by IS DISTINCT FROM OLD.validated_by THEN 'validation'
    WHEN NEW.actions_done IS DISTINCT FROM OLD.actions_done THEN 'compte_rendu'
    WHEN NEW.claimed_by   IS DISTINCT FROM OLD.claimed_by   THEN 'prise'
    WHEN NEW.status       IS DISTINCT FROM OLD.status       THEN 'statut'
    ELSE 'edition'
  END;

  acteur := COALESCE(NEW.claimed_by, NEW.created_by, NEW.agent);

  INSERT INTO public.agent_task_events (task_id, agent, event_type, from_status, to_status, payload)
  VALUES (
    NEW.id,
    acteur,
    type_evt,
    OLD.status,
    NEW.status,
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS agent_tasks_journal ON public.agent_tasks;
CREATE TRIGGER agent_tasks_journal
  AFTER INSERT OR UPDATE OR DELETE ON public.agent_tasks
  FOR EACH ROW EXECUTE FUNCTION public.journaliser_agent_task();

-- ---------------------------------------------------------------------------
-- Amorce : une ligne « etat_initial » par tache existante
-- ---------------------------------------------------------------------------

-- Sans cela, le journal demarre vide et les 270+ taches deja presentes n'ont
-- aucune histoire. On pose UN point de depart daté par tache, marque
-- `etat_initial` pour qu'on ne le confonde pas avec un vrai evenement.
-- Garde : on n'amorce que si le journal est vide, donc re-executer la migration
-- ne duplique rien.
INSERT INTO public.agent_task_events (task_id, agent, event_type, from_status, to_status, payload, created_at)
SELECT
  t.id,
  COALESCE(t.claimed_by, t.created_by, t.agent),
  'etat_initial',
  t.status,
  t.status,
  to_jsonb(t),
  COALESCE(t.updated_at, t.created_at, now())
FROM public.agent_tasks t
WHERE NOT EXISTS (SELECT 1 FROM public.agent_task_events);

-- ---------------------------------------------------------------------------
-- Controle apres application (a lancer a la main, lecture seule)
-- ---------------------------------------------------------------------------
--   SELECT event_type, count(*) FROM public.agent_task_events GROUP BY 1 ORDER BY 2 DESC;
--   SELECT * FROM public.agent_task_events ORDER BY created_at DESC LIMIT 20;
--   -- et le trigger repond bien a une ecriture :
--   SELECT count(*) FROM public.agent_task_events;
