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

## Coordination entre agents — la table `agent_tasks`

Plusieurs agents travaillent sur ce dépôt sans se parler : Claude Code, Gemini,
OpenCode, Jules, Muse Spark… Ils n'ont aucune session commune. Ce qui les
coordonne, c'est **un registre, un dépôt git et une CI** — les mêmes pour tous.

Le registre est la table Supabase `agent_tasks`. Discord, les issues GitHub et
`CHANGELOG.md` sont des **notifications** ; la table est la **vérité**. Si ce
n'est pas dans la table, ça n'a pas été demandé ni fait.

### Les quatre gestes

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

## Garde-fous CI (doivent rester au vert)

`.github/workflows/garde-fous.yml` exécute à chaque PR et chaque push vers
`main` : `tsc --noEmit`, `vitest`, et six contrôles —

| Script | Ce qu'il attrape |
|---|---|
| `check:cms-zones` | Zones CMS actives qu'aucun composant n'affiche, et l'inverse. |
| `check:cms-drift` | Tables en base absentes des migrations, ou l'inverse. |
| `check:api-auth` | Route maniant la clé service sans vérifier son appelant. |
| `check:erreurs-avalees` | Écriture Supabase dont l'erreur n'est pas lue — `const { data } = await`, `await` nu, `.catch(() => {})`. |
| `check:content-coherence` | Voix éditoriale et mots bannis. |
| `check:content-evidence` | Vécu qui n'est adossé à aucune photo. |

Les lancer **tous** en local avant de pousser :

```bash
for g in cms-zones cms-drift api-auth erreurs-avalees content-coherence content-evidence; do npm run check:$g --silent || echo "ROUGE : $g"; done; npx tsc --noEmit
```

Ils sont le même juge pour tous les agents. Un garde-fou rouge n'est pas
« à corriger plus tard » : c'est une tâche qui n'est pas finie.
