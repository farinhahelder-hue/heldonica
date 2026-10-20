# Vérification indépendante des 25 propositions du Cerveau

Mesure du 20/10/2026, avec un jeton GitHub en écriture (le mien était en 401).
Le Cerveau affirme « CI verte ». **Je l'ai mesuré moi-même**, via l'API GitHub :
`/commits/<sha>/check-runs` et `/commits/<sha>/status`, plus `mergeable` et
`draft` sur chaque PR.

## Ce que la mesure confirme

- **Les 16 « à fermer » sont justifiées.** 4 PR vides (#166, #501, #576, #588 —
  `changed_files = 0`, ce que `git` confirmait déjà) et 12 doublons.
- **5 des 9 « à fusionner » sont propres et non-brouillons** : #591, #600, #607,
  #616, #645 — fusionnables, CI verte.
- **#565 et #567 sont bien des doublons de #554** (même fichier,
  `components/inline-edit/EditableZone.tsx`), et leurs titres se recoupent.

## Deux défauts trouvés dans le moteur de tri

### 1. #645 cache 7 699 lignes de `pnpm-lock.yaml` (P1)

Le Cerveau annonce « CI verte, **3 fichiers, +7709/−6** ». Le détail :

| fichier | lignes |
|---|---|
| `components/ShareButtons.tsx` | +7 / −6 |
| `.jules/palette.md` | +3 |
| **`pnpm-lock.yaml`** | **+7 699** |

Or **`main` ne suit que `package-lock.json`** (vérifié : `git ls-tree`), et
`package.json` ne mentionne ni `pnpm` ni `packageManager`. Le projet est **npm**.
Cette PR introduit donc un **second gestionnaire de paquets** sous un titre
d'accessibilité. `AGENTS.md` documente déjà l'incident d'août : « deux installs
entrelacés ont produit un arbre Frankenstein » + un bump furtif de vite hors lock.

Le motif `SENSIBLES` de `revue-jules-regles.mjs` couvrait
`/(^|\/)package(-lock)?\.json$/` — donc `package.json` et `package-lock.json` —
mais **pas** `pnpm-lock.yaml`. La PR était donc proposée à la fusion en un geste.

**Corrigé** : le motif couvre maintenant `pnpm-lock.yaml`, `yarn.lock`,
`bun.lockb?` et `npm-shrinkwrap.json`.

### 2. Les brouillons étaient écartés, mais leurs doublons proposés à la fermeture (P2)

`enrichir()` ne transmettait **jamais** `draft` aux règles. Le motif n'apparaît
nulle part dans `revue-jules.mjs` ni dans `revue-jules-regles.mjs`.

Conséquence mesurée sur #554 — le **vrai correctif XSS** sur `EditableZone` :

| PR | brouillon | proposée |
|---|---|---|
| #554 (le vrai correctif) | oui | `blocked`, jamais proposée |
| #565, #567 (ses doublons) | oui | **proposées à la fermeture** |

Le tri proposait de fermer les copies et laissait dormir l'originale. Et comme
`mergeable` ne se calcule que par un appel d'API, le script a besoin du champ
`draft` pour distinguer « en travail » de « prête ».

**Corrigé** : `draft` est transmis ; `recommander()` ne propose jamais de
fusionner un brouillon (il le signale) ; et `doublons()` ne prend plus un
brouillon comme gardien de groupe.

## Vérification

- `npx vitest run __tests__/scripts/revue-jules-regles.test.ts` → **17/17**
  (4 tests ajoutés : verrouillage non-npm, brouillon non fusionné, brouillon
  redevient proposable une fois décoché, brouillon jamais gardien de groupe).
- `npm run garde-fous` → **13/13**.
- Un premier jet de mon test était faux : j'attendais
  `fichiersSensibles(['package-lock.json']) === []`, or `package-lock.json` était
  **déjà** sensible (règle `package(-lock)?.json`) — et c'est correct, un lockfile
  se relit. C'est mon assertion qui était fausse, pas le code.

## Ce que je n'ai pas mesuré

- **La « CI verte » des 9 « à fusionner »** : je l'ai mesurée sur 25 PR et elle
  concorde, mais je n'ai pas relu le contenu de chaque PR ligne à ligne. Fusionner
  reste une décision sur pièces.
- **`#451` et `#503`** sont des brouillons : mon correctif les rend désormais
  « à revoir » au lieu de « à fusionner ». C'est le comportement voulu, mais ça
  change ce que le fondateur verra.
