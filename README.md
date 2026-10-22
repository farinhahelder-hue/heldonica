# Heldonica

Média et concepteur de voyages slow travel. Deux volets : carnets de route,
guides destinations et Travel Planning sur-mesure (B2C) ; accompagnement
d'hôteliers indépendants via `/expert-hotelier` (B2B).

Site public et administration CMS : Next.js (App Router), Supabase, déployé
sur Vercel.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev                  # http://localhost:3000
```

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run preflight` | Pré-vol rapide (~1 s), sans base ni compilation |
| `npm run garde-fous` | Suite complète des contrôles |

## Avant de toucher au code

Lancer le pré-vol. Il vérifie la synchronisation Git, l'intégrité de l'espace
de travail, la parité de la voix de marque TypeScript ↔ Python, la fraîcheur
des modèles d'IA, la sécurité des routes API et la lecture des erreurs Supabase.

```bash
npm run preflight
```

La suite complète (`npm run garde-fous`) ajoute les contrôles qui interrogent
la base réelle : zones CMS orphelines, dérive des tables, cohérence éditoriale,
vécu adossé aux photos, plus `tsc` et `vitest`. Un garde-fou rouge n'est pas
« à corriger plus tard » : c'est une tâche qui n'est pas finie.

## Règles du projet

Elles sont détaillées dans `AGENTS.md` — à lire avant toute contribution. En
résumé :

1. **On n'invente rien.** Contenu, témoignages, images : tout correspond à une
   réalité vécue ou vérifiable.
2. **Toute écriture en production passe par une migration versionnée** dans
   `supabase/migrations/`, jamais par un script jetable.
3. **Aucun secret en clair dans le code.** Toujours `process.env`.
4. **Aucune photo d'enfant en ligne.** Ces photos restent dans le bucket privé
   `prive/enfants/`.
5. **Le mode maintenance est piloté intentionnellement** — ne pas le désactiver
   sans confirmation.

## Documentation

| Sujet | Fichier |
|---|---|
| Consignes agents, coordination, garde-fous | `AGENTS.md` |
| Journal des modifications | `CHANGELOG.md` |
| Voix éditoriale, pronoms, garde-fous | `docs/GUIDE_VOIX_HELDONICA_IA.md` |
| Stack, arborescence, intégrations | `docs/ARCHITECTURE.md` |
| Outils de création de contenu (agents IA) | `docs/AI_INTEGRATION.md` |

## Coordonner plusieurs agents

Plusieurs agents travaillent sur ce dépôt sans session commune. Le registre est
la table Supabase `agent_tasks` : c'est elle qui fait foi. Les gestes (lister,
lire, prendre, rendre compte, déposer) existent comme outils MCP dans
`mcp/agent-tasks/` — détails dans son `README.md`.
