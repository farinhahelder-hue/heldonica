# `agent-tasks` — le registre, en MCP

Un serveur MCP qui expose la table Supabase `agent_tasks` aux agents qui
travaillent sur ce dépôt. Claude Code, Gemini CLI et OpenCode parlent tous MCP :
avec ce serveur, ils ont **les mêmes cinq gestes** sur **la même table**, au lieu
de trois colles différentes et d'un accès SQL brut. Le protocole qu'il applique
est dans `AGENTS.md`, section *Coordination*.

## Les cinq outils

| Outil | Ce qu'il fait | Refuse si… |
|---|---|---|
| `taches_en_attente` | Liste les `sent` et `in_progress`, filtre par agent, inclut `tous`. | — (lecture seule) |
| `lire_tache` | La tâche entière ; l'id peut être un préfixe (`aec21f21`). | — (lecture seule) |
| `prendre_tache` | `sent` → `in_progress`, pose `claimed_by`, `claimed_at`, la branche. | déjà prise par un autre ; plus `sent` ; adressée à un autre agent ; pas d'`AGENT_NAME`. |
| `rendre_compte` | Clôt en `done` / `waiting_validation` / `blocked` avec `actions_done`. | la tâche n'est pas prise par **toi** ; `done` sans rien dans `verifie`. |
| `deposer_tache` | Crée une `sent` pour un autre agent, avec `depends_on` si suite. | agent inconnu ; pas d'`AGENT_NAME`. |

Il n'y a **pas d'outil de suppression**. Une tâche déposée reste : c'est de
l'historique.

La prise est atomique côté base : le `PATCH` filtre sur `status = 'sent'`. Si
un autre agent a été plus rapide, zéro ligne bouge et l'outil le dit.

## Installation

```bash
cd mcp/agent-tasks && npm install
```

Le serveur lit `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans
l'environnement, sinon dans `.env.local` à la racine du dépôt. **La clé
n'apparaît dans aucune configuration de client** — elles ne portent que
`AGENT_NAME`.

Les trois configurations sont déjà à la racine du dépôt :

| Client | Fichier | `AGENT_NAME` |
|---|---|---|
| Claude Code | `.mcp.json` | `claude` |
| Gemini CLI | `.gemini/settings.json` | `gemini` |
| OpenCode | `opencode.json` | `opencode` |

Claude Code demande une confirmation à la première session sur le dépôt ; c'est
normal. Les formats Gemini et OpenCode ont été écrits d'après leur documentation
mais **pas exécutés ici** — si l'un des deux ne voit pas le serveur, comparer
avec la doc du client avant de soupçonner le serveur.

## Vérifier qu'il marche

```bash
node mcp/agent-tasks/test-client.mjs
```

Lance le serveur en enfant, exerce les cinq outils, dépose une tâche d'essai
puis la supprime par PostgREST (le serveur, lui, ne sait pas supprimer). Neuf
contrôles ; tous doivent être ✓.

## Ce que le serveur ne fait pas, et pourquoi

- **Supprimer.** Le registre est la mémoire commune ; on n'efface pas ce qu'un
  autre a écrit.
- **Clore la tâche d'un autre.** `rendre_compte` filtre sur `claimed_by = toi`.
- **Accepter un `done` sans mesure.** Si `actions_done.verifie` est vide, il
  refuse : mets `waiting_validation` et dis ce qu'il reste à mesurer.
- **Parler à d'autres agents.** Il n'y a pas de session commune entre Claude,
  Gemini et OpenCode. La coordination est asynchrone : registre, git, CI.
