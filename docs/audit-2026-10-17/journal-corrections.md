# Journal des corrections — audit éditorial et médias

Session du 2026-10-17. Branche `agent/openhands/audit-editorial-media-coherence`.

Aucune écriture en production, aucune publication, aucune modification d'URL ou de
slug, aucun import de média, aucun déploiement. Les corrections ci-dessous sont
**locales** à la branche.

## 1. Défaut de fond : 17 articles publiés sur 41 pointaient vers des images inexistantes

**Cause racine.** Les photos vivent dans le bucket Supabase `media`
(`…/storage/v1/object/public/media/destinations/…`), mais les couvertures d'articles
désignent un **chemin local** `/images/destinations/…`. Ce dossier n'existe pas :
`public/images/destinations/` ne contient que `montenegro/`.

Il n'existe **aucune** normalisation `/images/…` → bucket, et **aucune** rewrite
`/images` dans `next.config.js`. Le middleware n'exclut pas `/images` de son matcher,
donc ces URL étaient servies en 404.

**Portée mesurée :** 13 couvertures d'articles publiés (17 références `featured_image`
au total en chemin local, dont certaines partagées) + 11 références dans le code.

**Correction.** Vérifié d'abord que le **nom de fichier exact** existait dans le
bucket, puis remplacé le chemin local par l'URL storage. Chaque remplacement a été
contrôlé en HTTP : `200` + `image/jpeg` + taille non nulle.

| fichier modifié | remplacements | vérification |
|---|---|---|
| `lib/cms-photo-albums.ts` | 11 URL (5 Madère + 4 Roumanie, dont 2 en double) | HTTP 200, image/jpeg, 867 ko à 6,7 Mo |
| `app/destinations/suisse/page.tsx` | 2 URL (OG + twitter) | dossier `suisse/` absent partout → visuel neutre `/og-default.jpg` |
| `app/destinations/[slug]/DestinationPage.tsx` | 1 URL (hero par défaut de `suisse`) | idem |

Aucune photo externe importée. Aucune image générée. Aucune substitution « plausible » :
soit le **même fichier**, soit le visuel neutre de la marque.

**Pages affectées.** Albums photos Madère et Roumanie (CMS), page `/destinations/suisse`.

## 2. Détection d'un bug de parseur qui aurait perdu des données en silence

**Fichier :** `scripts/appliquer-plan-rest.mjs` (outil d'application des migrations).

**Cause racine.** Le parseur de `VALUES` s'arrêtait au **premier `)`**. Or une valeur
peut en contenir : « Les Églises en bois UNESCO (Bârsana & Ieud) ». Le tuple était
alors rejeté (nombre de valeurs incorrect) et la zone **silencieusement omise**.

**Correction.** Le parseur suit désormais les littéraux **et** la profondeur des
parenthèses. Garde-fou ajouté : le script **refuse de continuer** (`exit 4`) si le
nombre de tuples lus diffère du nombre de zones attendues, au lieu de continuer en
silence.

**Contrôle de non-régression sur les migrations déjà appliquées.** Comparaison base
réelle vs fichier de migration pour `20261016140000_subdest_coming_soon.sql` :
**56/56 lignes, 0 manquante, 0 valeur différente**. L'ancien parseur ne l'avait pas
touchée (aucune de ses valeurs ne contient de parenthèse).

**Bug secondaire du même outil.** `indexOf('ON CONFLICT')` matchait le **commentaire
d'en-tête** et non la clause réelle, tronquant le corps à zéro. Corrigé en ne retenant
que l'occurrence située **après** `VALUES`.

## 3. Trois textes « charabia » manqués par le plan de correction

`20261016120000_fix_seo_descriptions` ne corrigeait que `seo_description`. Le même
charabia vivait aussi dans `intro_text`, et une 10e page manquait à la liste.

| page | avant | après | source de la valeur |
|---|---|---|---|
| Sao Vicente | « Le nord forgotten » | « Le nord oublié : grottes, plage noire, éoliennes. » | reprise du `seo_description` de la même page |
| Ponta do Sol | « Le plus west » | « Le bout de l'île, le plus à l'ouest, le moins connu. » | idem |
| Pays d'Auge | « Le portype. Lesaufs sur le port » | « Manoirs à colombages, vergers et cidre de terroir. » | reprise du teaser `cms_sub_destinations` |

Aucune valeur inventée : chacune est reprise d'un texte **déjà écrit** par les
propriétaires. Migration `20261016160000_fix_remaining_charabia.sql` + mêmes chaînes
dans le code.

## 4. Migration Roumanie appliquée

`20261016110000_seed_maramures_apuseni_zones` — 24 zones (12 Maramureș + 12 Apuseni).
Validation obtenue du propriétaire (Roumanie visitée plusieurs fois). La migration
**recopie en base des zones dont le contenu est déjà dans le code et déjà en ligne** :
rien de nouveau n'est publié, les 2 pages deviennent éditables.

Valeurs vérifiées **identiques au code** après écriture (accents `ș`, apostrophe
échappée, 268 caractères).

## 5. Inventaire : ce qui est sain

Pour éviter de laisser croire que tout est cassé, ce qui a été **contrôlé et trouvé
correct** :

| contrôle | résultat |
|---|---|
| Placeholders (TODO, lorem, FIXME, XXX…) dans les 55 articles | **0** |
| Corps d'articles tronqués (article publié finissant en pleine phrase) | **0** |
| Nombre de jours annoncé vs itinéraire présenté (4 pages) | conforme : 5/5, 7/7, 10/10, 7/7 |
| Couvertures d'articles publiés présentes en base | 41/41 (l'absence apparente était une erreur de ma requête, corrigée) |
| Cohérence `package.json` ↔ `package-lock.json` | aucune dérive ; `npm ci --dry-run` OK |
| URLs du sitemap sans route correspondante | 0 |
| Liens internes vers une route inexistante | 0 (les 2 suspects sont une redirection déclarée et un fixture de test) |

## 6. Faux positifs écartés (pour ne pas les rouvrir)

| signalement apparent | verdict | preuve |
|---|---|---|
| `/images/marker-icon*.png` manquants (carte Leaflet) | **faux positif** | importés depuis `node_modules/leaflet/dist/images/` (présents), bundlés par Next |
| `/images/uploads/exemple.jpg` manquant | **faux positif** | c'est un `placeholder=` de champ de saisie, jamais chargé |
| `/cms-admin` lien cassé (`app/admin/layout.tsx`) | **faux positif** | redirection 301 déclarée vers `/panel-manager` (`next.config.js:113`) |
| `/images/logo-heldonica.png` manquant (`lib/cms-seo-eeat.ts`) | **inert** | le module n'est importé nulle part : code mort |
| 14 pages « Bientôt » indexables | **défendable, pas un bug** | la page est une capture d'email (`NewsletterForm`) : indexer se défend |
| 27 destinations en `draft`, 14 articles en `draft` | **normal** | état d'un chantier, pas une anomalie |

## Tests exécutés

| test | résultat |
|---|---|
| `npm run check:migrations` | 6/6 ✓ |
| `npm run garde-fous` (12 contrôles) | **12/12 ✓** |
| `npm run check:cms-zones` | **vert** (était rouge avant application des migrations) |
| `tsc` (TypeScript strict) | ✓ |
| `vitest` (77 fichiers) | ✓ |
| Build production | `exit=0`, compile en 11,7 s |
| Valeurs 110000 en base vs code | identiques |
| Migration 140000 en base vs source | 56/56 |
| Remplacements d'images | HTTP 200 + image/jpeg, 11/11 |

## Contrôles NON effectués (état à la fin de la 1re passe)

- **Inspection visuelle des photos** : **effectuée en 3e passe** (voir plus bas et
  `verification-visuelle-2.md`). Au moment de la 1re passe, aucun outil n'était
  disponible et les 11 remplacements reposaient sur l'**identité du nom de fichier**.
- **Rendu navigateur desktop/mobile** : non réalisé (mode maintenance actif renvoie
  307 sur tout, y compris les images ; un test HTTP ne peut donc rien distinguer).
- **Métadonnées sociales réellement rendues** (aperçu OG) : non vérifiées dans un
  aperçu de réseau social.
- **23 `featured_image` en URL storage absolues** : supposées bonnes (HTTP 200
  vérifié sur les 9 utilisées comme remplacement), mais toutes n'ont pas été sondées
  une par une.

## 2e passe — deux défauts supplémentaires prouvés par mesure

Mesure faite sur un **serveur local sans maintenance** (`next dev`,
`MAINTENANCE_MODE=false`), seul moyen d'obtenir un statut discriminant.

| Constat | Preuve |
|---|---|
| Une image absente répond **404** (et non un repli) | `/images/destinations/madere/IMG_0197.JPG` → **HTTP 404** ; `/images/poncha-madere.jpg` → **HTTP 200 image/jpeg** |
| Les pages inconnues répondaient **200** au lieu de 404 | `/blog/<inconnu>` → **200**, `/destinations/<inconnue>` → **200** |

### Correction A — soft 404 : `app/loading.tsx` retiré

**Cause racine prouvée par expérience réversible** : un `app/loading.tsx` à la
racine bascule l'application en rendu par flux ; la coquille est envoyée en 200
**avant** que le `notFound()` des pages `[slug]` ne s'exécute. Le corps contenait
bien la page 404, mais l'en-tête annonçait 200 → **soft 404**, indexable par Google.

Expérience : fichier déplacé, serveur relancé →
`/blog/<inconnu>` passe de **200 à 404**, `/destinations/<inconnue>` de **200 à 404**,
et `/blog`, `/destinations/madere`, `/destinations/suisse`, `/destinations/lisbonne`
restent **200**. Aucun test ne dépendait de ce fichier ; les pages d'article et de
destination sont prérendues (`generateStaticParams`), donc la coquille n'apportait
rien en échange. Sauvegarde : `.sauvegardes/loading.tsx.avant-fix`.

### Correction B — repli d'image manquant sur la carte à la une

Les cartes de la grille gèrent `onError` ; **la carte à la une ne le faisait pas**.
Une couverture cassée y laissait un cadre vide, sans icône ni légende — exactement
le cas des 13 couvertures cassées identifiées. Alignement sur le motif existant
(`components/BlogClientPage.tsx`, `featuredImageError`).

### Non-régression ajoutée

`__tests__/app/soft-404.test.ts` : échoue si `app/loading.tsx` réapparaît à la
racine, et vérifie que les deux pages `[slug]` appellent bien `notFound()`.

---

## 3e passe — vérification visuelle réelle des photos

La limite annoncée plus haut a été **levée**. `scripts/vision_check.py` (BLIP caption
+ VQA, local, sans clé) existait déjà ; seules ses dépendances manquaient. Après
`pip install torch` (index CPU PyTorch) puis `pip install transformers pillow`, l'outil
a analysé les images.

### Résultat sur les 5 images Madère que j'avais substituées

| Fichier | Scène décrite | Verdict |
|---|---|---|
| `fanal_foret.jpg` | chemin en forêt dans la brume | **exacte** |
| `achadas_da_cruz.jpg` | falaise rocheuse, bord de mer | cohérente |
| `pico_do_arieiro.jpg` | randonneur en montagne | cohérente |
| `ponta_do_sol.jpg` | route en bord d'océan | cohérente |
| `porto_moniz.jpg` | eau bleue, bord de mer | cohérente |

La confirmation qui manquait : les substitutions reposaient sur le seul nom de
fichier. Elles sont désormais **validées visuellement**.

### Calibration — à faire avant toute conclusion

Sur des photos **GPS-vérifiées** de Podgorica, le modèle décrit correctement la scène
mais **invente le nom du lieu** (« skopje, bulgarie ») et répond « rural » pour une
place urbaine. **Seule la description de scène est exploitable.**

### Anomalie trouvée — album Roumanie (P2, NON corrigée)

Les 4 photos de l'album « Roumanie — Bucarest & Transylvanie » portent
`location: 'Bucarest'` et des anecdotes de **ville** ; l'inspection décrit 3 champs et
une enfant tenant un gâteau. **Aucune scène urbaine.** Faisceau, pas preuve :
association image ↔ lieu fausse **ou** photos prises aux abords de Bucarest.

**Exposition mesurée** : `GET /api/cms/photos/albums?albumId=roumanie-aout-2026` répond
**sans authentification** et renvoie titre, `location` et anecdotes.

**Non corrigée volontairement** : modifier `location` ou les anecdotes reviendrait à
inventer une localisation (règle n°1). Décision demandée :
`decisions-proprietaires.md` §11.

