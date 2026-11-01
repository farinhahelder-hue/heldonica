# Sécurité de la CI — ce que le code ne peut pas protéger

Constat du 2026-11-01. Ce document existe parce qu'une partie du correctif
n'est **pas** dans le dépôt : elle est dans les réglages GitHub, et personne
d'autre que la propriétaire ne peut la poser.

## Le problème

`garde-fous.yml` et `build-apk.yml` se déclenchent sur `pull_request`. Deux
faits de GitHub Actions se combinent mal :

1. Pour un évènement `pull_request`, GitHub exécute **le workflow tel qu'il est
   dans la branche de la pull request**, pas celui de `main`. C'est la raison
   d'être de `pull_request_target`, qui fait l'inverse.
2. Les secrets du dépôt **sont fournis** à ces exécutions. GitHub ne les retient
   que pour les pull requests venant d'un *fork*.

Une dizaine d'agents (jules, bolt, openhands, opencode, palette, claude,
gemini…) poussent des branches **dans** ce dépôt, pas depuis des forks. Chacun
pouvait donc :

- modifier `scripts/check-cms-zones.mjs`, `package.json` ou `garde-fous.yml`
  dans sa branche, et lire `SUPABASE_SERVICE_ROLE_KEY` — qui contourne la RLS,
  donc la base entière, en lecture et en écriture ;
- ajouter un `doFirst {}` dans `heldonica-mobile/app/build.gradle.kts` et
  repartir avec le keystore de release et ses trois mots de passe. Qui tient le
  keystore signe des APK qui s'installent par-dessus les vraies.

## Ce que le code fait désormais (fait, dans ce dépôt)

- Les six contrôles qui lisent Supabase ne tournent plus sur `pull_request`, et
  ne reçoivent plus les identifiants : double verrou, sur leur `if:` **et** sur
  leur `env:`. Ils tournent sur `push` vers `main` — du code déjà relu — et
  chaque matin via `controles-base-quotidien.yml`.
- `check:cms-ai-images-db`, seul contrôle de base qui n'avait pas d'autre
  passage, a été ajouté au contrôle quotidien : aucune couverture n'est perdue.
- Le keystore de release et ses mots de passe ne sont plus fournis sur
  `pull_request`. La validation construit alors un APK **non signé**, ce que le
  workflow savait déjà faire (`-PallowUnsignedRelease=true`). Le verrou dur qui
  refuse de *publier* sans keystore est inchangé.
- Les deux workflows déclarent `permissions: contents: read`. Sans ce bloc le
  jeton héritait du réglage par défaut du dépôt, qui peut être « lecture et
  écriture ».

## Ce qu'il reste à faire, et que seul un réglage du dépôt peut faire

**Les verrous ci-dessus ne suffisent pas à eux seuls.** La branche de la pull
request contrôle aussi ces fichiers de workflow : elle peut les réécrire pour
retirer les conditions, ou ajouter `pull_request:` au déclencheur d'un autre
workflow qui, lui, reçoit les secrets. Tant que les secrets sont des *secrets
de dépôt*, aucune ligne de YAML ne les met hors de portée.

La protection réelle passe par un **Environment** GitHub :

1. `Settings` → `Environments` → `New environment`, par exemple `base-prod`.
2. Dans cet environnement, `Deployment branches and tags` → `Selected branches
   and tags` → n'autoriser que `main`. **Ne pas** ajouter `refs/pull/*/merge` :
   la documentation GitHub précise que cette règle rouvrirait l'accès aux
   exécutions déclenchées par `pull_request`.
3. Déplacer `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` des
   secrets du dépôt vers les secrets de cet environnement, et les **retirer**
   des secrets du dépôt.
4. Dans `controles-base-quotidien.yml` et dans le job `cms` de
   `garde-fous.yml`, déclarer `environment: base-prod` sur le job.
5. Même geste pour les quatre secrets `RELEASE_*`, dans un environnement
   restreint aux tags de release (`apk-*`), déclaré par `release-apk.yml`.

Un job qui demande un environnement depuis une branche non autorisée n'obtient
pas ses secrets. C'est la seule barrière qu'une branche de pull request ne peut
pas contourner en modifiant le dépôt.

## À vérifier aussi, dans les réglages

`Settings` → `Actions` → `General` → `Workflow permissions` : si le réglage est
resté sur « Read and write », tout workflow sans bloc `permissions:` explicite
reçoit un jeton en écriture. Les deux workflows corrigés ici déclarent le leur ;
`discord-notify.yml` n'en a toujours pas.

## Pourquoi on ne garde pas les contrôles de base sur les pull requests

On y perd l'immédiateté : une zone orpheline introduite par une PR n'est vue
que le lendemain matin, ou au push sur `main`. C'est le prix assumé. La
contrepartie serait de laisser la clé de service à portée de toute branche
poussée dans le dépôt — et ce dépôt est public, avec une dizaine d'agents qui y
poussent sans relecture humaine systématique.
