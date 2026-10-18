# Journal des corrections — Heldonica, 2026-10-15

Branche : `agent/openhands/audit-editorial-2026-10-15` (non poussée).

Chaque correctif est déterministe : substitution de chaîne ou ajout d'entrée,
sans réécriture éditoriale, sans écriture en base, sans changement d'URL.

---

## 1. Sept pages de destination : hero vide → photo servie

**Cause racine.** Les pages pointaient vers un chemin local `/images/…` alors
que le fichier n'existe que dans le bucket Supabase Storage. Aucun rewrite ne
relie `/images/…` au Storage. Le composant `ZoneImage`
(`components/inline-edit/EditableZone.tsx`) masque l'image en cas d'erreur : le
hero disparaissait donc sans message d'erreur.

**Preuve de la correspondance.** Pour chacun des 7 fichiers, le nom est identique
des deux côtés et la ligne CMS de la **même** destination référence déjà l'URL
Storage. Exemple : `destinations.porto-moniz.featured_image` pointe déjà vers
`media/destinations/madere/porto_moniz.jpg`. Aucune invention : on recopie une
correspondance déjà établie dans la base.

| Fichier modifié | Avant | Après |
|---|---|---|
| `app/destinations/madere/achadas-da-cruz/page.tsx` | `/images/destinations/madere/achadas_da_cruz.jpg` | `…/media/destinations/madere/achadas_da_cruz.jpg` |
| `app/destinations/madere/ponta-do-sol/page.tsx` | `/images/destinations/madere/ponta_do_sol.jpg` | `…/media/destinations/madere/ponta_do_sol.jpg` |
| `app/destinations/madere/porto-moniz/page.tsx` | `/images/destinations/madere/porto_moniz.jpg` | `…/media/destinations/madere/porto_moniz.jpg` |
| `app/destinations/roumanie/sibiu/page.tsx` | `/images/destinations/roumanie/IMG_20260827_135023.jpg` | `…/media/destinations/roumanie/IMG_20260827_135023.jpg` |
| `app/destinations/roumanie/maramures/page.tsx` | `/images/destinations/roumanie/IMG_20260827_135025.jpg` | `…/media/destinations/roumanie/IMG_20260827_135025.jpg` |
| `app/destinations/roumanie/bucarest/page.tsx` | `/images/destinations/roumanie/IMG_20260827_135618.jpg` | `…/media/destinations/roumanie/IMG_20260827_135618.jpg` |
| `app/destinations/roumanie/apuseni/page.tsx` | `/images/destinations/roumanie/IMG_20260827_135834.jpg` | `…/media/destinations/roumanie/IMG_20260827_135834.jpg` |

Chaque URL de remplacement a été sondée : `HTTP 200`, `image/jpeg`, dimensions
valides (`1200×896` pour Madère, `3472×4624` pour Roumanie).

**Vérification du rendu.** `next start` (port 3103, maintenance désactivée) puis
`curl` : le HTML de `/destinations/madere/achadas-da-cruz`,
`/destinations/roumanie/sibiu` et `/destinations/madere/ponta-do-sol` contient
bien `src="https://smxnruefmrmfyfhuxygq.supabase.co/storage/…"`.

**Non vérifié.** Le sujet photographique. L'image s'affiche ; je n'ai pas pu
contrôler qu'elle montre bien Achadas da Cruz.

---

## 2. Description corrompue — Costa Smeralda

**Fichier** : `app/destinations/sardaigne/costa-smeralda/page.tsx`.

**Observé.** La valeur servie était :

> « Le nord.millionnaires, plages incredible en Sardaigne. … »

soit deux fragments collés par un point, avec « incredible » en anglais.

**Correction.** La page contient par ailleurs le texte
`introText="Costa Smeralda, c'est les plages des stars. Mais entre Juin et
Septembre seulement."` et `highlights = ['Le centre.', 'La plage.', 'Cachée.']`.

La correction reprend **uniquement des mots déjà présents sur la page** :
« Le nord », « millionnaires », « plages », « Sardaigne ». Aucun fait nouveau
n'est introduit.

> « Le nord des millionnaires, plages incroyables en Sardaigne. Notre guide slow
> travel testé en couple : pépites locales, adresses insolites et conseils
> pratiques. »

**Vérifié** : `curl` sur la page locale renvoie la nouvelle valeur dans
`<meta name="description">`.

**À confirmer** : la formulation reste un bricolage de fragments. Cette
description **et les 36 autres** demandent une réécriture éditoriale.

---

## 3. Sitemap : deux pages réelles ajoutées

**Fichier** : `app/sitemap.ts`.

**Observé.** Les entrées de destination sont codées en dur. Comparaison avec
l'arborescence `app/` : 3 routes réelles manquaient.

**Corrigé** : `/destinations/roumanie/apuseni` et
`/destinations/roumanie/maramures` — deux pages complètes et publiées.

**Non corrigé** : `/destinations/lisbonne`, qui duplique
`/destinations/portugal/lisbonne`. Les deux pages se déclarent canonical sur
elles-mêmes : ajouter la première au sitemap créerait un doublon assumé.
**Décision propriétaire requise.**

**Vérifié** : `curl` sur `/sitemap.xml` local — les deux `<loc>` sont présents.

---

## 4. Hôte Supabase erroné — Coffre des savoirs

**Fichier** : `lib/cms-vault-spots.ts`.

**Observé.** Une URL Storage utilisait le project ref `smxnruefmrmfyfmuxygq`
(« muxygq ») au lieu de `smxnruefmrmfyfhuxygq` (« huxygq ») — un caractère.

**Correction** : ref corrigé. **Vérifié** : plus aucune occurrence de la faute
dans le fichier.

---

## 6. P0 — Repli de la maintenance quand la base est injoignable

**Constaté le 2026-10-15 vers 21:15 UTC, reproduit à chaque essai.**
Détail complet et preuves : `incident-p0-base-injoignable.md`.

- **Cause racine.** `getMaintenanceMode()` (`lib/supabase-edge.ts`) interrogeait
  la base **sans délai d'expiration**, et le middleware l'appelle **à chaque
  requête** non exclue. La base du projet étant devenue injoignable, l'appel
  pendait jusqu'à ce que Vercel tue la fonction Edge : **toutes les routes de
  contenu répondaient `504 MIDDLEWARE_INVOCATION_TIMEOUT`** au lieu de basculer
  sur la page de maintenance. Le repli annoncé dans le code (« Supabase
  injoignable → défaut ») ne s'exécutait jamais, faute de délai : on n'atteignait
  jamais le `catch`.
- **Correction.** Plafond de 3 s sur les lectures de réglage
  (`SETTINGS_TIMEOUT_MS` + `fetchWithTimeout`), appliqué à `getMaintenanceMode`
  et `getSetting`. 3 s reste sous la limite de la plateforme et laisse la marge
  nécessaire au repli.
- **Ce que cela ne fait pas.** Cela ne désactive pas la maintenance et n'en
  change pas la sémantique : la base reste la source de vérité quand elle
  répond. Cela ne masque pas non plus la panne — le site affiche sa page de
  maintenance (200) au lieu d'un 504 pour tout le monde.
- **Vérification.** Simulation locale d'une base injoignable
  (`NEXT_PUBLIC_SUPABASE_URL` pointant vers une adresse qui ne répond pas) :
  `/`, `/blog` et `/destinations/madere` renvoient **307 → /maintenance en 3,0 s**,
  et `/maintenance` répond **200**. Avant correction, le même scénario pendait.
  Test de non-régression : `__tests__/lib/supabase-edge-maintenance.test.ts`.
- **Non déployé.** Cette correction est dans la branche, pas en production.

## 7. Tests de non-régression

**Fichiers** : `__tests__/lib/sitemap-posts.test.ts` (sitemap) et
`__tests__/lib/supabase-edge-maintenance.test.ts` (repli maintenance, § 6).

Verrouille la règle de filtrage du sitemap des articles, dont la cause racine
(lecture d'un champ `status` inexistant sur `BlogPost`) avait exclu deux
articles publiés.

---

## Contrôles exécutés

| Contrôle | Résultat |
|---|---|
| `npx tsc --noEmit` | 0 erreur |
| `npx vitest run` | 647 tests / 81 fichiers — **tous verts** |
| `npm run build` | succès |
| `npm run garde-fous` | **12/12** après reprise de la base, en lecture avec la clé publique (voir plus bas) |
| `curl` rendu local | correctifs constatés dans le HTML |

## Contrôles rattrapés le 2026-10-16 (base revenue)

La clé **publique** du site (celle du bundle client) suffit à faire tourner les
deux contrôles qui étaient « ignorés » : le script de dérive accepte une clé anon
en repli, et la lecture des zones est publique. Aucun secret privilégié n'a été
nécessaire.

| Contrôle | Résultat | Méthode |
|---|---|---|
| `check:cms-zones` | ✓ 2 415 zones actives, aucune orpheline | clé publique, lecture seule |
| `check:cms-drift` | ✓ aucune dérive nouvelle (9 connues, inventoriées) | clé publique, lecture seule |
| `npm run garde-fous` | **12/12** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Nuance : « 12/12 » ici ne veut pas dire que la **clé de service** est inutile.
Elle reste nécessaire pour tout ce qui écrit, et pour le contrôle des **colonnes**
(le script signale « Schéma des colonnes illisible »). La clé publique suffit à
*ces deux contrôles-là*, pas à l'administration du CMS.

## Contrôles **non** exécutés

| Contrôle | Raison |
|---|---|
| Rendu de production | mode maintenance : tout renvoie `307` |
| Vérification visuelle des photos | outils indisponibles pour juger un contenu d'image |
| Tests sur mobile | pas de navigateur pilotable dans cet environnement |
| `check:cms-zones`, `check:cms-drift` | ignorés faute d'identifiants Supabase |
| Métadonnées sociales (`og:image`) en production | même raison que le rendu |

## Fichiers modifiés

- `app/destinations/sardaigne/costa-smeralda/page.tsx`
- `app/destinations/madere/{achadas-da-cruz,ponta-do-sol,porto-moniz}/page.tsx`
- `app/destinations/roumanie/{sibiu,maramures,bucarest,apuseni}/page.tsx`
- `app/sitemap.ts`
- `lib/blog-supabase.ts`
- `lib/cms-vault-spots.ts`
- `package-lock.json` (ajout d'`engines` uniquement — aucun bump de dépendance)
- `lib/supabase-edge.ts` (délai d'expiration sur les lectures de réglage)
- `__tests__/lib/sitemap-posts.test.ts` (nouveau)
- `__tests__/lib/supabase-edge-maintenance.test.ts` (nouveau)

## Fichiers d'audit (non destinés à être fusionnés en l'état)

- `.audit/` — captures de base, script d'inventaire, sitemap de production
- `docs/audit-2026-10-15/` — les quatre livrables


---

## Passage qualité éditoriale — 2026-10-16

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `app/destinations/[slug]/DestinationPage.tsx` | Fallback Paris : « Monter au Miradouro (équivalent) du Sacré-Cœur à l'aube » → « Monter au Sacré-Cœur à l'aube, avant les premiers groupes ». « Manger au **mercado** local » → « Manger dans les **marchés** de quartier ». |
| `app/destinations/sicile/taormine/page.tsx` | `introText` placeholder anglais → phrase factuelle neutre. |
| `supabase/migrations/20261016100000_remove_placeholder_zone_text.sql` | **Nouvelle migration, NON APPLIQUÉE.** Écriture en production → validation propriétaire requise. |

### Cause racine

Deux textes de rédaction provisoires sont restés dans les **données du CMS**
(et, par recopie, dans les fallbacks de code) :

1. `destinations-sicile-taormine/intro_text` —
   « Taormine, c'est le **spot tourism**. Le theatre grec avec vue sur la mer.
   **Incredible**. » Placeholder en anglais, avec fautes. **Rendu sur une page
   présente dans `sitemap.xml`** (vérifié).
2. `destinations-paris/tip_2` —
   « Monter au **Miradouro (équivalent)** du Sacré-Cœur à l'aube ». Note de
   rédaction restée dans le texte ; « Miradouro » est un mot **portugais**,
   copié depuis la fiche Lisbonne.

Balayage complet des **2 415 zones actives** : aucun autre placeholder de ce
type. Deux autres mentions relevées, **non fautives**, laissées en l'état :
`destinations-alentejo/pepite_4_desc` (« notre spot préféré » — à signaler, mot
banni dans le lexique) et `top-10-pepites-madere/cta_text` (« les tips »).

### Vérification — et une distinction importante

**Observé.** Après correction du **code seul**, la page `/destinations/paris`
rendue en local (serveur alimenté par la vraie base) affichait **toujours**
l'ancien texte : `(équivalent)` présent 2 fois. **Le rendu utilise la valeur du
CMS, pas le fallback du code.**

**Déduit.** La migration est donc le correctif effectif ; la correction de code
empêche seulement la réapparition du texte si la zone était vidée.

**Non vérifié.** La migration **n'a pas été appliquée** (écriture en production).
Son effet sur la page n'est pas constaté, il est déduit du mécanisme prouvé
ci-dessus. À confirmer après application.

### Contrôles exécutés après correction

| Contrôle | Résultat |
|---|---|
| `npm run build` | succès (aucune erreur) |
| `npm run garde-fous` | **12/12** |
| Rendu local `/destinations/paris`, `/destinations/sicile/taormine` | 200, textes corrigés présents dans le **fallback** |
| Rendu local après correction | placeholder **toujours servi** (valeur CMS) → migration requise |

---

## 2026-10-17 — correction structurelle des couvertures — PR #612 (Jules), VÉRIFIÉE

**Changement de méthode.** La correction précédente dépendait d'une migration
(valeur en base). La PR #612 apporte une correction **structurelle** : elle
apprend à `getPageZones()` à ne plus laisser un **placeholder** écraser le
fallback du composant.

`isPlaceholderZoneValue(val)` renvoie `true` pour `null`, `undefined`, une
chaîne vide ou d'espaces, et toute valeur se terminant par `og-default.jpg`.

**Étendue réelle (correction d'un constat antérieur).** Les **51** zones
`hero_image` actives valent toutes `/og-default.jpg` — pas 5. Le chiffre « 5 »
ne comptait que les pages dont le **code** porte une vraie photo :

| Cas | Nb | Affichage |
|---|---|---|
| code = vraie photo | **5** | placeholder (bug) |
| code = `/og-default.jpg` aussi | 22 | cohérent, rien à faire |
| code sans `heroImage` | 24 | placeholder assumé, contenu à fournir |

**Vérification conduite par un tiers (moi), worktree isolé au commit `815ea70` :**

| Contrôle | Résultat |
|---|---|
| Tests ciblés du PR | 16/16 |
| Suite complète `vitest run` | **86 fichiers, 711 tests, 0 échec** |
| `tsc --noEmit` | exit 0 |
| `next build` | succès |
| Effet sur la base réelle (5 pages) | retombent sur leur vraie photo ✅ |
| `og:image` du HTML prérendu | `…/madere/achadas_da_cruz.jpg` ✅ |

**Non-régression vérifiée — le point qui méritait l'attention.** Le filtre
s'applique à **toutes** les zones, dont `seo_og_image` (78 zones filtrées sur
79). Vérification que cela ne casse pas les métadonnées :
`lib/page-metadata.ts` fait `...(image ? { images: [{ url: image, … }] } : {})`.
Une zone filtrée retombe donc sur les métadonnées **du code**. Aucune balise
`og:image` ne disparaît — confirmé sur le HTML prérendu.

**Deux `og-default.jpg` subsistent** dans le HTML prérendu de la page testée :
ils sont dans un bloc **JSON-LD** (`thumbnailUrl` / `contentUrl`), hors du
périmètre de la PR. À traiter séparément si les propriétaires le souhaitent.

**Ce qui reste à faire :**

1. appliquer la migration `20261016170000` — **écriture en production,
   validation propriétaire requise** ;
2. arbitrer les 2 photos Roumanie (voir `verification-visuelle.md` §4 et §8) ;
3. fournir les couvertures des 24 pages sans photo dans le code.

**Limite honnête :** le rendu **visuel** n'a pas été contrôlé par moi (aucun
accès visuel — §5 de `verification-visuelle.md`). L'effet est prouvé sur le
**HTML prérendu** et la **valeur en base**, pas à l'œil.
