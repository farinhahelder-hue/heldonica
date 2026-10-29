# Heldonica — repère pour agents IA

Ce fichier est le point d'entrée pour tout agent IA (Claude, Gemini, ou autre)
qui travaille sur ce repo. Plusieurs sessions/outils différents interviennent
en parallèle sur ce projet — lis ceci avant de toucher au code ou à la base.

## À lire ensuite, selon ce que tu fais

- **Tu écris ou corriges du contenu (article, caption, page)** → `docs/GUIDE_VOIX_HELDONICA_IA.md`
  (règles de voix, pronoms, garde-fous) et `lib/brand-voice.ts` (implémentation, mots bannis).
- **Tu veux savoir ce qui a changé récemment** → `CHANGELOG.md`. Ajoutes-y une entrée
  après tout changement notable, pour que les autres sessions ne redécouvrent pas
  ce que tu viens de faire.
- **Tu modifies la base Supabase** → règle absolue plus bas.

## Ce qu'est Heldonica

Média et concepteur de voyages slow travel, duo fondateur. Deux volets :
- **B2C** : carnets de route, guides destinations, Travel Planning sur-mesure.
- **B2B** : accompagnement d'hôteliers indépendants (`/expert-hotelier`).

Les prénoms des fondateurs ne sont jamais utilisés dans le contenu public —
portraits indéfinis ("l'un", "l'autre") si besoin de les évoquer.

## Règles absolues (non négociables)

1. **On n'invente rien.** Contenu éditorial, témoignages, images : tout doit
   correspondre à une réalité vécue ou vérifiable. Un témoignage désactivé
   (`is_active = false`) vaut mieux qu'un témoignage inventé — voir l'incident
   du 19/08 dans `CHANGELOG.md`.
2. **Toute écriture en base de production passe par une migration versionnée**
   dans `supabase/migrations/`, jamais par un script jetable exécuté à la main.
   C'est cette règle enfreinte pendant des mois qui a produit 56 migrations
   orphelines à rattraper en une seule session le 19/08 — ne pas recommencer.
3. **Ne jamais committer de clé Supabase (ou autre secret) en clair dans le code.**
   Un `service_role` legacy est resté exposé publiquement 2 mois avant d'être
   trouvé et révoqué le 19/08. Toujours lire depuis `process.env`.
4. **Le mode maintenance (`site_settings.maintenance_mode` + variable Vercel
   `MAINTENANCE_MODE`) est piloté intentionnellement.** Ne jamais le désactiver
   sans confirmation explicite de l'utilisateur — c'est une décision de mise en
   ligne, pas un détail technique.
5. **Aucune photo d'enfant en ligne.** Avant de poser une photo (article, zone,
   galerie, carrousel, image de partage), la regarder : si un enfant y apparaît,
   ne pas la publier. Ces photos sont gardées, jamais supprimées, dans le bucket
   **privé** `prive/enfants/` (tous les autres buckets sont publics), et leur
   fiche `cms_media` est marquée « PRIVÉE ». Incident du 18/10/2026 : un gros
   plan d'enfant servait d'image de partage à un article — voir `CHANGELOG.md`.
  6. **Ne jamais faire apparaître un secret dans une sortie de commande.**
     Interdit : `cat .env.local`, `cat .env*`, `env`, `printenv`, `echo $SECRET`,
     ou toute commande qui imprime la valeur d'une clé. Le masquage automatique
     ne couvre pas les lectures de fichiers, et la sortie part telle quelle dans
     les journaux de session (`conversations/<id>/events/*.json`) — donc en clair
     et hors du dépôt. Pour vérifier qu'une variable existe, tester sa **présence**
     ou sa **longueur**, jamais sa valeur :
     `[ -n "$VAR" ] && echo "presente (${#VAR} car.)"`. Incident du 26/10/2026 :
     un `cat` de `.env.local` a laissé la clé secrète Supabase (`sb_secret_…`) en
     clair dans un journal de session, et un `git push -u <url à jeton>` y a laissé
     un jeton GitHub `ghu_…` dans 39 fichiers — voir `CHANGELOG.md`.

## Pièges déjà rencontrés (pour ne pas les refaire)

- `supabase db push` et `supabase db query -f` peuvent exécuter les instructions
  d'un fichier **indépendamment les unes des autres** (pas toujours dans une
  transaction unique) : une instruction plus loin dans le fichier peut échouer
  sans annuler celles d'avant. Vérifier l'état réel après une migration
  multi-instructions plutôt que de supposer un tout-ou-rien.
- Les clés Supabase existent en deux formats en ce moment : legacy JWT (`eyJ...`)
  et nouveau format (`sb_publishable_...` / `sb_secret_...`). Le nouveau format
  n'est pas un JWT — ne pas l'envoyer dans `Authorization: Bearer`, seulement
  dans le header `apikey` (voir `lib/supabase-edge.ts` pour le pattern adaptatif).
- Plusieurs tables ont un schéma en base différent de ce que suggèrent d'anciens
  fichiers de migration (créations manuelles antérieures). Toujours vérifier le
  schéma réel (`information_schema.columns`) avant d'écrire une requête ou une
  nouvelle migration sur une table existante.

## Architecture locale & Projets IA

La station locale héberge deux projets distincts qui ne doivent jamais être confondus :

1. **Heldonica Web & CMS** (`C:\Users\Work\heldonica` ou `heldonica-clean`) :
   - Dépôt Next.js principal du site public et de l'administration CMS.
   - Héberge le **Copilote CMS interactif** sur le port `8470` (`heldonica-brain/` avec `server.py`).
2. **Heldonica Brain II** (`C:\Users\Work\heldonica-brain`) :
   - Service d'arrière-plan autonome 24/7 (port `8440` + façade agents `8451`).
   - Gère le **Coffre des Savoirs (RAG 55 fiches)**, le BridgePoller sur `agent_tasks`, et le matériel local (GTX 1660 Ti).

---

## Coordination entre agents — la table `agent_tasks`

Plusieurs agents travaillent sur ce dépôt sans se parler : Claude Code, Gemini,
OpenCode, Jules, Muse Spark… Ils n'ont aucune session commune. Ce qui les
coordonne, c'est **un registre, un dépôt git et une CI** — les mêmes pour tous.

Le registre est la table Supabase `agent_tasks`. Discord, les issues GitHub et
`CHANGELOG.md` sont des **notifications** ; la table est la **vérité**. Si ce
n'est pas dans la table, ça n'a pas été demandé ni fait.

### Les gestes de l'agent

Ils existent sous forme d'outils MCP dans `mcp/agent-tasks/` — six outils,
les mêmes pour Claude Code (`.mcp.json`), Gemini CLI (`.gemini/settings.json`)
et OpenCode (`opencode.json`) : `taches_en_attente`, `lire_tache`, `lire_journal`,
`prendre_tache`, `rendre_compte`, `deposer_tache`. Pas d'outil de suppression,
c'est voulu. Chaque client se présente par `AGENT_NAME` ; sans nom, lecture
seule. Détails et installation : `mcp/agent-tasks/README.md`.

Chaque écriture sur `agent_tasks` laisse une trace dans `agent_task_events`
(trigger `agent_tasks_journal`, migration
`20261029150000_journal_agent_task_events.sql`), avec l'état avant et après.
`lire_journal` la restitue. C'est ce qui permet de savoir qui a proposé quoi,
quand, et ce qui a été modifié — la fiche seule n'a qu'un état présent.

0. **Le Pre-flight avant de toucher une seule ligne.**
   Lancer systématiquement :
   ```bash
   npm run preflight
   ```
   Ce contrôle ultra-rapide (~1s) vérifie :
   - La synchronisation Git : alerte immédiatement si la branche locale est en retard sur `origin/main` (évite les régressions et les réinventions de code).
   - L'intégrité de l'espace de travail (modules critiques présents, pas de dossiers parasites).
   - La **parité stricte de la voix de marque TypeScript ↔ Python** (`scripts/check-brand-sync.mjs`) : `lib/brand-voice.ts` est la vérité absolue ; tout miroir Python (`brand.py`) doit avoir rigoureusement la même liste de mots bannis et de pronoms.
   - La fraîcheur des modèles d'IA (`scripts/check-ai-models.mjs`).
   - La sécurité des routes API et la lecture systématique des erreurs Supabase.

1. **Lire avant d'agir.** Au début d'une session, lister les tâches qui te sont
   adressées (`agent = ton nom`) ou ouvertes à tous, en `sent`. Lire aussi ce qui
   est `in_progress` chez les autres : tu ne touches pas à leurs fichiers.

2. **Prendre avant de toucher.** Passer la tâche en `in_progress` et poser
   `claimed_by = ton nom`, `claimed_at = now()` **avant** la première
   modification. Une tâche déjà prise par un autre agent ne se prend pas —
   on lui laisse, ou on dépose une nouvelle tâche qui la complète
   (`depends_on = son id`).

3. **Une tâche, une branche.** Nommer la branche `agent/<ton-nom>/<slug>` et la
   noter dans `branch`. Le dépôt `main` est l'arbitre : on y arrive par PR ou par
   push rebasé, jamais en écrasant. Deux agents ont déjà divergé sur `main` le
   10 septembre ; ça n'a rien cassé parce que leurs fichiers différaient. Un jour
   ils ne différeront pas.

4. **Rendre compte, honnêtement.** Clore avec le statut juste et un
   `actions_done` que le suivant peut reprendre sans relire ta session.

### Un dossier par agent, jamais le dossier partagé

Tous les agents travaillaient dans le même dossier, donc sur la même branche
active : le `git checkout` de l'un déplaçait les autres. Le 19/10/2026, un commit
de Claude est tombé sur la branche d'OpenCode, puis a été poussé sur la sienne.

1. **Prends ton worktree** avant de coder :
   `npm run worktree -- <ton-nom> <slug>` crée `../worktrees/<nom>-<slug>` sur la
   branche `agent/<nom>/<slug>`, depuis `origin/main`. Le dossier partagé sert à
   lire, pas à écrire.
2. **Annonce-toi** : `export AGENT_NAME=<ton-nom>` (la variable des outils MCP).
3. **Installe les hooks une fois** : `npm run hooks:install`. Ils refusent, pour
   un agent identifié, un commit sur `main` ou sur la branche d'un autre, et un
   push sur `main` ou sur la branche d'un autre.
4. **Gestes explicites** : `git branch --show-current` avant de commiter ;
   `git add <fichiers>` (jamais `-A`) ; `git push origin <ta-branche>` (jamais
   `git push` seul, qui pousse la branche courante, quelle qu'elle soit).

### Le vocabulaire des statuts

| Statut | Sens exact |
|---|---|
| `sent` | Déposée, personne ne l'a prise. |
| `in_progress` | Prise (`claimed_by` renseigné). Les fichiers qu'elle touche sont réservés. |
| `waiting_validation` | Le code est fait ; **une action humaine manque** — appliquer une migration, publier, poser un secret. La description commence par ce qui manque. |
| `blocked` | Impossible depuis le poste (permission, secret, réseau). La description dit quoi, et à qui. |
| `done` | Fait **et vérifié**. Jamais `done` sur la foi d'un `git push` ou d'un message d'application. |

`done` sans vérification est le mensonge le plus coûteux de ce projet : un
montage vidéo annoncé fini et jamais rendu, une CSP qui bloquait GA4 pendant des
semaines, des routes cron en 401 chaque nuit. Si tu n'as pas mesuré, écris
`waiting_validation` et dis ce qu'il reste à mesurer.

### La forme de `actions_done`

Un objet JSON à clés fixes, pour que n'importe quel agent — ou l'utilisateur —
reprenne là où tu t'es arrêté :

```json
{
  "corrige":       ["ce qui a été changé, avec le commit"],
  "verifie":       ["ce qui a été mesuré, et comment — pas 'testé', mais 'HTTP 200, 2 388 393 octets'"],
  "non_verifie":   ["ce qui aurait dû l'être et ne l'a pas été, et pourquoi"],
  "reste_a_faire": ["à qui, et la commande ou le geste exact"]
}
```

Les colonnes `risk_level`, `rollback_sql`, `allowed_tables`, `forbidden_ops`,
`files_modified`, `validated_by` existent pour les tâches qui touchent la base
ou la production : les remplir quand c'est le cas.

### Ce qu'on ne fait jamais

- Marquer `done` une tâche qu'on n'a pas prise.
- Modifier un fichier listé dans `files_modified` d'une tâche `in_progress`
  d'un autre agent.
- Éditer une tâche qui n'est pas la sienne autrement qu'en y ajoutant une
  `notes`.
- Supprimer des données de l'utilisateur sur la foi d'un nom ou d'un préfixe :
  le 11 septembre, quatre brouillons `paris-*` semblaient des doublons ; deux
  étaient des notes distinctes. On compare les octets, pas les slugs.
- Valider son propre travail : l'exécutant ne clôt jamais sa tâche en `done`
  sans preuves mesurables par un tiers (logs, diff, code, ports vérifiés).
  Le 08/10, une clôture automatique en 0,4 ms sans exécution a dû être
  requalifiée en `failed` — le théâtre de validation est une faute.
- Nettoyer l'inbox à plusieurs en même temps : un seul nettoyeur par tranche
  horaire (le 08/10, deux nettoyeurs simultanés ont posé des statuts inverses
  sur les mêmes fiches). On se coordonne avant de toucher aux statuts.
- Lancer `npm install` / `npm ci` à plusieurs dans le même `node_modules` :
  le 08/10, deux installs entrelacés ont produit un arbre Frankenstein
  (fichiers manquants, `.d.ts` fantômes, erreurs tsc contradictoires entre
  deux runs) + un bump furtif vite 8.0.8 → 8.3.4 hors lock. Un seul écrivain
  npm à la fois, jamais de bump majeur sans fiche, migration du code
  et suite verte sur install propre.

## Zones globales — le préfixe `_prive_` et la déclaration obligatoire

Toute zone de la page `global` (header, pied de page, popups, newsletter…) rendue dans le
HTML public doit être **déclarée**. `getGlobalZones()` (`lib/site-content.ts`) ne sert que ce
qui figure dans **`lib/public-global-zones.json`** — la source unique, lue à la fois par le
TypeScript (`lib/public-global-zones.ts`) et par `scripts/check-cms-zones.mjs`.

Ce n'est pas une liste blanche à maintenir clé par clé : elle déclare des **familles**, si
bien qu'une nouvelle entrée de menu passe sans toucher au code.

```jsonc
{
  "privatePrefix": "_prive_",
  "publicPrefixes": ["nav_item_", "header_", "footer_", "newsletter_", "stat_",
                     "cta_", "social_", "instagram_", "cookie_", "popup_", "contact_"],
  "publicKeys": ["nav_footer_title", "destinations_footer_title",
                 "guides_footer_title", "legal_footer_title"]
}
```

### Créer une zone `global` : deux cas, pas de troisième

- **Elle doit s'afficher** → vérifier que sa clé commence par un `publicPrefixes` ; sinon
  l'ajouter à `publicKeys`. Rien d'autre à faire : la famille couvre les clés suivantes.
- **Elle ne doit pas s'afficher** (brouillon, résidu d'un ancien projet, archive) → la
  nommer avec le préfixe réservé **`_prive_`** (ex. `_prive_monica_schneider`). Le préfixe
  vaut déclaration : la zone reste éditable au CMS, mais n'est **jamais** rendue et n'est
  pas comptée comme orpheline.

La raison d'être : ne pas sérialiser dans le HTML public une valeur qu'aucun composant
n'affiche. Les résidus « Monica Schneider / Executive Coach » d'un ancien projet sont restés
lisibles par Googlebot pendant des semaines faute de cette précaution.

### Ce que la CI affiche si on l'oublie

Une zone `global` **active** hors déclaration fait échouer `check:cms-zones` (exit 1) :

```
✗ 1 zone(s) global active(s) NON déclarée(s) publique(s) :
    ma_nouvelle_zone
Ces zones ne sont PAS rendues (getGlobalZones les écarte) et personne ne le signale.
Corriger, au choix :
  - les déclarer dans lib/public-global-zones.json (préfixe de famille ou clé exacte) ;
  - les renommer avec le préfixe réservé `_prive_` si elles doivent rester hors du rendu.
```

Le contrôle tourne sur l'état réel de la base (`npm run check:cms-zones`). Il est couvert par
`__tests__/scripts/check-cms-zones-declaration.test.ts` (5 cas) : un test retire une clé de la
déclaration et vérifie que le script échoue — le garde-fou est prouvé mordant, pas seulement
présent.

## Garde-fous CI (doivent rester au vert)

La suite de garde-fous s'exécute de façon identique et portable sous Windows PowerShell,
Linux et macOS via :

```bash
npm run garde-fous
```

Ce script exécute et récapitule dans un tableau clair l'ensemble des 16 contrôles :

| Contrôle | Ce qu'il attrape |
|---|---|
| `check:workspace` | Branche en retard sur `origin/main`, dépendances manquantes, pollution. |
| `check:brand-sync` | Désynchronisation de la voix de marque ou mots bannis entre TS et Python. |
| `check:ai-models` | Modèles d'IA dépréciés ou écrits en dur hors de `lib/ai-provider.ts`. |
| `check:api-auth` | Route maniant la clé service sans vérifier son appelant. |
| `check:erreurs-avalees` | Écriture Supabase dont l'erreur n'est pas lue — `const { data } = await`, `await` nu, `.catch(() => {})`. |
| `check:cms-migrations` | Table référencée par le code sans migration versionnée. Sans base : ne peut pas être sauté. |
| `check:cms-cache` | Page prérendue qui lit le CMS sans fenêtre de revalidation — une correction en base resterait invisible jusqu'au prochain déploiement. |
| `check:cms-zones` | Zones CMS actives qu'aucun composant n'affiche, et l'inverse ; **zone `global` active non déclarée publique** (voir « Zones globales »). |
| `check:cms-drift` | Tables en base absentes des migrations, ou l'inverse. |
| `check:content-coherence` | Voix éditoriale et mots bannis en production. |
| `check:content-pages` | Prose des pages statiques : mots bannis et fragments de brouillon. |
| `check:content-evidence` | Vécu qui n'est adossé à aucune photo. |
| `check:design-tics` | Emojis décoratifs et cartes « SaaS » sur les pages publiques. |
| `check:cms-hardcode` | Texte visible écrit en dur hors du CMS. Cliquet : le compte par fichier (`scripts/cms-hardcode-baseline.json`) ne peut que baisser ; après un gain, `node scripts/check-cms-hardcode.mjs --update`. |
| `typecheck` (`tsc`) | Erreurs de typage TypeScript strictes. |
| `vitest` (`vitest run`) | Intégrité des fichiers de tests unitaires et intégration. |

Ils sont le même juge pour tous les agents. Un garde-fou rouge n'est pas
« à corriger plus tard » : c'est une tâche qui n'est pas finie.
