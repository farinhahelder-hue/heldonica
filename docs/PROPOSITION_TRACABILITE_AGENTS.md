# Proposition — tracer chaque action des agents, pas seulement leur compte rendu

**Date :** 2026-10-29
**Branche :** `agent/freebuff/cms-sanity-like-tracabilite`
**Statut :** proposition à valider — ce document décrit une cible ; il ne crée ni table ni hook.

---

## 1. Ce que le dispositif actuel trace vraiment

| Pièce | Ce qu'elle enregistre | Ce qu'elle ne dit pas |
|---|---|---|
| `agent_tasks` (5 outils MCP) | l'intention (`sent`), la prise (`claimed_by`/`claimed_at`), le statut, un `actions_done` en 4 clés | **ce qui s'est passé entre la prise et la clôture** |
| `actions_done` | un résumé rédigé à la fin, en quatre listes | l'ordre, l'heure, la commande, le fichier exact, l'échec |
| `.githooks/pre-commit`, `pre-push` | refusent un commit sur `main` ou sur la branche d'un autre | n'écrivent rien : la tentative refusée disparaît |
| `cms_audit_log` | qui (utilisateur CMS) a modifié quoi, avec diff JSONB | ne connaît pas la notion d'agent |
| `CHANGELOG.md` | les changements notables, en prose | pas de granularité par action |
| Branche `agent/<nom>/<slug>` | l'unicité du travail | aucun lien machine entre un commit et une tâche |

**Le trou est net :** on sait *qui a pris quoi* et *ce qui a été déclaré fini*, jamais *comment*.
`actions_done` est une reconstruction rédigée de mémoire, à un instant choisi par l'agent —
exactement le point où le projet a déjà été trompé (« `done` sans vérification », montage vidéo
annoncé fini et jamais rendu). Un journal d'actions est la seule pièce qui ne dépend pas de la
bonne foi du narrateur.

---

## 2. Cible : trois couches, trois vérités distinctes

```
intention   agent_tasks        « ce qui est demandé, par qui, dans quel état »
journal     agent_actions      « ce qui a été fait, quand, sur quoi, avec quel résultat »   ← à créer
preuve      git + CI           « ce qui reste quand la session est fermée »                 ← existe
```

Règle de conception : **on ajoute une couche, on ne réécrit pas `agent_tasks`.** Les agents
(MCP, hooks, CLI) continuent d'utiliser les cinq gestes ; le journal s'écrit à côté, en
best-effort, et ne bloque jamais une tâche.

---

## 3. Le journal : table `agent_actions` (append-only)

Spécification à transformer en migration versionnée en phase T1 (jamais appliquée à la main,
règle AGENTS.md n°2). Le SQL est donné ici pour discussion, pas pour exécution.

```sql
CREATE TABLE IF NOT EXISTS public.agent_actions (
  id           bigserial PRIMARY KEY,
  task_id      uuid REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  agent        text NOT NULL,               -- 'claude', 'gemini', 'freebuff'…
  session_id   text,                        -- identifiant de session/outil, non secret
  kind         text NOT NULL,               -- task | tool | git | db | file | ci | deploy | decision
  verb         text NOT NULL,               -- 'prendre_tache', 'commit', 'migration_appliquee'…
  target       text,                        -- fichier, table, branche, route…
  outcome      text NOT NULL DEFAULT 'ok',  -- ok | refuse | erreur | ignore
  detail       jsonb NOT NULL DEFAULT '{}'::jsonb,   -- args redacted, diffstat, message d'erreur
  commit_sha   text,
  branch       text,
  duration_ms  integer,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_task    ON public.agent_actions (task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent   ON public.agent_actions (agent, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_commit  ON public.agent_actions (commit_sha);
```

Trois choix à assumer :

- **`bigserial`, pas `uuid`** : le journal est lu en flux chronologique, l'ordre compte plus que
  l'identifiant. Une séquence rend la pagination `created_at, id` fiable même à la seconde.
- **Append-only réel** : aucune policy `UPDATE`/`DELETE`, et un trigger `BEFORE UPDATE OR
  DELETE` qui lève pour tout le monde, `service_role` compris — RLS seule ne protège que
  `anon` et `authenticated`. Seule exception tolérée : la mise à `NULL` de `task_id` par le
  `ON DELETE SET NULL` de la clé étrangère, qui n'altère aucun autre champ. Un journal
  réinscriptible ne prouve rien.
- **`ON DELETE SET NULL`** sur `task_id` : une tâche ne se supprime pas aujourd'hui, mais le
  journal doit survivre à un nettoyage futur sans perdre la trace.

**Rétention.** Une action par outil MCP et par commit, c'est de l'ordre de quelques milliers de
lignes par semaine. Purge à 180 jours par tâche `pg_cron` (ou script mensuel versionné), et
archivage JSON mensuel dans `artifacts/` si un audit est demandé. À trancher avant T1 : garder
tout (coût négligeable) ou purger (habitude saine).

---

## 4. Où le journal s'écrit (quatre points d'émission, pas dix)

| Point | Événements | Fichier à toucher | Mode |
|---|---|---|---|
| Serveur MCP `agent-tasks` | les 5 gestes + refus (tâche déjà prise, nom d'agent manquant) | `mcp/agent-tasks/server.mjs` | synchrone, best-effort (un échec d'écriture ne fait pas échouer le geste) |
| Hook `commit-msg` (nouveau) | commit créé, branche, `Agent-Task:` lue dans le message, `diffstat` | `.githooks/commit-msg` | après validation, puis `git notes`/journal |
| `scripts/garde-fous.mjs` | chaque contrôle lancé, son code de sortie, sa durée | `scripts/garde-fous.mjs` | fin de run, un événement par garde-fou |
| CLI / agents sans MCP | commandes explicites (`agent-journal log …`) | `scripts/agent-journal.mjs` | manuel, pour ce que les trois autres ne voient pas |

**Corrélation.** Le lien tâche ↔ commit se fait par un trailer dans le message de commit, lu par
le hook, jamais deviné :

```
fix(cms): refuser un bloc texte sans contenu

Agent-Task: 4f2c1d9e-…
```

La branche `agent/<nom>/<slug>` donne l'agent ; le trailer donne la tâche ; le SHA donne la
preuve. Trois identifiants, aucune ambiguïté. Un commit sans trailer reste possible (travail de
fond, docs) — il est journalisé avec `task_id = null`, pas refusé : un hook qui bloque sur un
détail de forme sera contourné.

---

## 5. Ne jamais journaliser un secret (le journal est un fichier, pas un écran)

Le journal est lu par des humains et par des agents : il devient un nouveau vecteur de fuite,
exactement comme les `conversations/<id>/events/*.json` qui ont déjà laissé passer une clé
`sb_secret_…` et un jeton `ghu_…` (incidents du 26/10, AGENTS.md n°6).

Règles d'écriture :

- `detail` ne contient que des **noms** de champs et des **tailles**, jamais de valeurs
  d'environnement ;
- un `redact()` unique, partagé par les quatre points d'émission, remplace les clés sensibles
  (`*_KEY`, `*_TOKEN`, `*_SECRET`, `*_PASSWORD`, `authorization`, `apikey`, `cookie`) par
  `"[redacted: <n> car.]"` ;
- les arguments d'un outil MCP sont tronqués (2 000 caractères) et ne contiennent jamais le
  contenu d'un fichier, seulement son chemin ;
- un test unitaire vérifie que `redact()` masque bien une chaîne au format `sb_secret_` et
  `ghu_` : le garde-fou doit être prouvé mordant, pas seulement présent.

---

## 6. Ce que le journal rend possible (et qui n'existe pas aujourd'hui)

1. **Timeline par tâche** dans `/panel-manager` : intention, prise, actions, commits, garde-fous,
   clôture — dans l'ordre, avec les refus visibles. Une tâche `done` sans action mesurable
   devient une anomalie détectable, pas une opinion.
2. **Détection de conflit réel** : deux agents qui touchent les mêmes fichiers dans la même
   heure, même s'ils n'ont pas déclaré la même tâche. C'est la panne du 19/10 (commit de Claude
   poussé sur la branche d'OpenCode) rendue visible *avant* le merge.
3. **Coût et durée par type d'action** : quel garde-fou coûte 40 s, quelle migration a été
   rejouée trois fois.
4. **Reprise sans relire une session** : `actions_done` reste la synthèse, mais on peut la
   vérifier contre le journal au lieu de la croire.

---

## 7. Phases et critères de sortie

| Phase | Contenu | Critère de sortie mesurable |
|---|---|---|
| **T0** | ce document + décisions §8 | une décision écrite par question, pas une préférence implicite |
| **T1** | migration `agent_actions` (versionnée) + `redact()` + `scripts/agent-journal.mjs` | migration appliquée par un humain ; `agent-journal log` écrit une ligne et la relit ; test de `redact()` vert |
| **T2** | instrumentation MCP (5 gestes + refus) + hook `commit-msg` (trailer) | deux agents simulent une prise concurrente : les deux tentatives apparaissent, la seconde en `refuse` |
| **T3** | panneau « Journal des agents » + alerte « `done` sans action » | un cas fabriqué (tâche close sans action) est signalé ; le panneau n'affiche aucune donnée inventée quand la base est absente |

Ordre volontaire : T1 avant T2, parce qu'un journal sans schéma stable produit quatre formats
en une semaine — la même erreur que le CMS avec `content` / `richText` / commentaire JSON.

---

## 8. Décisions humaines à prendre avant T1

1. **Un journal unique ou un par agent ?** Un seul, avec la colonne `agent` : la question
   « qui a touché ce fichier » ne doit pas demander de parcourir N journaux.
2. **Rétention** : tout garder, ou purge à 180 jours avec archive mensuelle ?
3. **Le trailer `Agent-Task:` est-il obligatoire ?** Recommandation : non (avertissement en
   local, refus en CI seulement pour les branches `agent/*`).
4. **Le journal est-il lisible par les agents eux-mêmes ?** Recommandation : oui en lecture
   (il sert la coordination), jamais en écriture directe hors des quatre points d'émission.
5. **Où vit le panneau** : `/panel-manager` (à côté du Journal d'audit CMS) ou `/admin/task-giver`
   (à côté des tâches) ? Recommandation : `task-giver`, c'est la même histoire.
