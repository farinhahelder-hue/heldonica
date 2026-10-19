# Registre des médias problématiques — Heldonica

Généré le 2026-10-17.

## Le défaut de fond, en une phrase

Le stockage réel des photos est le **bucket Supabase `media`**
(`…/storage/v1/object/public/media/destinations/…`), mais **17 articles publiés sur 41**
désignent leur couverture par un **chemin local** (`/images/destinations/…`) qui n'existe
pas : `public/images/destinations/` ne contient que `montenegro/` (7 fichiers).

Il n'existe **aucune** normalisation `/images/…` → bucket, et **aucune** rewrite
`/images` dans `next.config.js`. Le middleware sert donc ces URL en **404**.

**Preuves**
- `find public/images -type d` → `public/images/destinations/montenegro` seulement.
- `git log --all -- public/images/destinations/madere/*` → vide sur **813 commits** :
  ces fichiers n'ont jamais été versionnés.
- `grep -rn "replace.*images\|storage.*resolve" lib/` → aucune normalisation.
- Contre-exemple : le contenu CMS (`lib/cms-vault-spots.ts`) utilise **déjà** les URL
  storage complètes — c'est la convention correcte.

## Ce qui a été corrigé (remplacement vérifié)

Règle appliquée : remplacement **uniquement** quand le **nom de fichier exact** existe
dans le bucket, avec vérification HTTP 200 + `content-type: image/jpeg`.

| page | emplacement | média actuel | anomalie | remplacement |
|---|---|---|---|---|
| albums photos Madère | `lib/cms-photo-albums.ts` | `/images/destinations/madere/achadas_da_cruz.jpg` | fichier absent du disque | `…/media/destinations/madere/achadas_da_cruz.jpg` — HTTP 200, image/jpeg, 1 275 996 o |
| albums photos Madère | idem | `/images/destinations/madere/fanal_foret.jpg` (×2) | idem | `…/media/destinations/madere/fanal_foret.jpg` — HTTP 200, 1 050 072 o |
| albums photos Madère | idem | `/images/destinations/madere/pico_do_arieiro.jpg` | idem | `…/media/destinations/madere/pico_do_arieiro.jpg` — HTTP 200, 867 091 o |
| albums photos Madère | idem | `/images/destinations/madere/ponta_do_sol.jpg` | idem | `…/media/destinations/madere/ponta_do_sol.jpg` — HTTP 200, 1 158 626 o |
| albums photos Madère | idem | `/images/destinations/madere/porto_moniz.jpg` | idem | `…/media/destinations/madere/porto_moniz.jpg` — HTTP 200, 1 049 598 o |
| albums photos Roumanie | idem | `/images/destinations/roumanie/IMG_20260827_135023.jpg` (×2) | idem | `…/media/destinations/roumanie/IMG_20260827_135023.jpg` — HTTP 200, 6 460 393 o |
| albums photos Roumanie | idem | `/images/destinations/roumanie/IMG_20260827_135025.jpg` | idem | `…/media/destinations/roumanie/IMG_20260827_135025.jpg` — HTTP 200, 6 737 427 o |
| albums photos Roumanie | idem | `/images/destinations/roumanie/IMG_20260827_135618.jpg` | idem | `…/media/destinations/roumanie/IMG_20260827_135618.jpg` — HTTP 200, 6 695 270 o |
| albums photos Roumanie | idem | `/images/destinations/roumanie/IMG_20260827_135834.jpg` | idem | `…/media/destinations/roumanie/IMG_20260827_135834.jpg` — HTTP 200, 3 996 880 o |
| /destinations/suisse | `app/destinations/suisse/page.tsx` (OG + twitter) | `/images/destinations/suisse/stoos-01.jpg` | fichier inexistant, dossier `suisse/` absent du disque **et** du bucket | `/og-default.jpg` — traitement neutre de la marque, non trompeur |
| /destinations/suisse | `app/destinations/[slug]/DestinationPage.tsx` (hero par défaut) | `/images/destinations/suisse/stoos-02.jpg` | idem | `/og-default.jpg` |

**11 références corrigées.** Aucune image externe importée. Aucune image générée.
Aucune photo « plausible » substituée : dans les 11 cas, c'est **le même fichier**
(correspondance exacte par nom), ou le visuel neutre de la marque.

**Contrôle visuel de ces 11 remplacements** (2e passe) : les 5 images Madère ont été
inspectées visuellement et sont **cohérentes** avec leur légende. Les 4 images
Roumanie sont techniquement valides (HTTP 200) mais révèlent un **écart image ↔ texte**
propre à cet album — voir la section « Vérification visuelle » plus bas et
`decisions-proprietaires.md` §11. Les 2 références Suisse pointent vers un traitement
neutre, non concernées.

## Ce qui reste à fournir ou à valider (pas de correspondance exacte)

Aucun remplacement n'a été tenté : rien ne prouve que ces fichiers existent.

| page | emplacement | média actuel | anomalie | besoin |
|---|---|---|---|---|
| /destinations/suisse | `lib/cms-photo-albums.ts` | `…/suisse/IMG_20250712_154207.jpg` (couverture) | absent du disque et du bucket | photo à fournir (le dossier suisse n'existe nulle part) |
| album Suisse | idem | `…/suisse/IMG_20250712_154303.jpg` | idem | photo à fournir |
| album Suisse | idem | `…/suisse/AGC_20250712_194042959.jpg` | idem | photo à fournir |
| album Suisse | idem | `…/suisse/AGC_20250712_220701363.jpg` | idem | photo à fournir |
| gabarit CMS | `lib/cms-templates.ts` | `…/suisse/stoos_sommet_croix.jpg` | idem | photo à fournir |
| gabarit CMS | `lib/cms-templates.ts` | `…/madere/fanal-arbres-centenaires.jpg` | absent ; pas d'équivalent exact | photo à fournir ou à valider |
| gabarit CMS | `lib/cms-templates.ts` | `…/madere/achadas-da-cruz-telepherique.jpg` | absent ; pas d'équivalent exact | photo à fournir ou à valider |
| 13 articles publiés | `cms_blog_posts.featured_image` | `/images/destinations/madere/IMG_0101.JPG`, `IMG_0122.JPG`, `IMG_0197.JPG`, `IMG_0207.JPG`, `IMG_0214.JPG`, `IMG_0219.JPG`, `IMG_0220.JPG`, `/images/destinations/montenegro/DSC_8044.JPG`, `DSC_8245.JPG`, `IMG_20260528_211407.jpg`, `PXL_20260528_061212256.RAW-01.COVER.jpg`, `/images/destinations/lisbonne/DSC_0085.JPG` | aucun de ces noms n'existe dans le bucket | **décision propriétaire** : choisir une photo du bucket (le bucket Madère n'a que 5 fichiers, Monténégro 4, pas de Lisbonne) — édition en base, donc validation requise |

## Textes alternatifs à reprendre

| page | emplacement | média | anomalie |
|---|---|---|---|
| gabarit CMS « galerie » | `lib/cms-templates.ts:207` | photo de la forêt de Fanal | alt = « Atmosphère feutrée de la cour intérieure » et légende « La cour intérieure ombragée » : décrit une cour, pas une forêt |
| gabarit CMS « galerie » | `lib/cms-templates.ts:212` | tour de l'horloge (Sahat Kula) | alt = « Chambre aux matières brutes et naturelles », légende « Pierres apparentes et bois patiné » : décrit une chambre |

Ces textes sont **génériques** (gabarit) et donc faux dès qu'ils sont appliqués à une
autre destination. Correction impossible sans regarder les photos : à valider.

## Vérification visuelle : EFFECTUÉE (2e passe, 2026-10-17)

Mise à jour — la limite annoncée ci-dessous a été **levée**. L'outil
`scripts/vision_check.py` (BLIP caption + VQA, local, **sans clé**) existait déjà dans
le dépôt ; seules ses dépendances (`torch`, `transformers`, `pillow`) manquaient. Elles
ont été installées et l'outil a tourné.

### Résultat sur les 11 remplacements

Les 5 images du bucket réellement inspectées visuellement sont **cohérentes** avec
leur légende :

| Fichier | Scène décrite par le modèle | Verdict |
|---|---|---|
| `fanal_foret.jpg` | chemin en forêt dans la brume | **exacte** (anecdote = « brume matinale ») |
| `achadas_da_cruz.jpg` | falaise rocheuse, bord de mer | cohérente |
| `pico_do_arieiro.jpg` | randonneur en montagne | cohérente |
| `ponta_do_sol.jpg` | route en bord d'océan | cohérente |
| `porto_moniz.jpg` | eau bleue, bord de mer | cohérente |

Les 4 restantes (Roumanie) sont traitées ci-dessous : elles révèlent un autre problème.

### Calibration obligatoire de l'outil

Sur des photos **GPS-vérifiées** de Podgorica, le modèle décrit correctement la scène
(« clock tower in a town square ») mais **invente le nom du lieu** (« skopje,
bulgarie ») et se trompe sur une scène large (place urbaine → « rural »). **Seule la
description de scène est exploitable ; le nom de lieu rendu ne l'est jamais.**

### Nouvelle anomalie trouvée — album Roumanie (P2, non corrigée)

L'album `roumanie-aout-2026` (« Roumanie — Bucarest & Transylvanie ») porte 4 photos
toutes étiquetées `location: 'Bucarest, Roumanie'` avec des anecdotes de **ville**.
L'inspection visuelle décrit :

| Fichier | Scène vue |
|---|---|
| `IMG_20260827_135023.jpg` | un champ, quelques arbres et maisons |
| `IMG_20260827_135025.jpg` | un champ, quelques arbres |
| `IMG_20260827_135618.jpg` | un champ, une clôture, une maison au loin |
| `IMG_20260827_135834.jpg` | une petite fille souriante tenant un gâteau |

**Aucune scène urbaine.** Faisceau, pas preuve : association image ↔ lieu fausse **ou**
photos prises aux abords de Bucarest. **Non corrigé** — toucher à `location` serait
inventer une localisation. Détail et décision demandée :
`verification-visuelle-2.md` et `decisions-proprietaires.md` §11.

### Ce qui reste NON vérifié visuellement

- Les **23 `featured_image`** d'articles en URL storage : seules 9 ont été inspectées
  (5 Madère + 4 Roumanie).
- Les images locales `public/images/destinations/montenegro/` (7 fichiers).

### Ancienne limite (conservée pour mémoire, désormais levée)

Ce qui était prouvé sans vision : existence du fichier, code HTTP, type MIME, taille,
nom exact. Ce qui ne l'était pas : que la photo **représente** le lieu annoncé — d'où
le contrôle ci-dessus.

## Cas particuliers : faux positifs écartés

- `/images/marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`
  (`DestinationMap.tsx`, `OrganizerMap.tsx`, `MapBlock.tsx`) : **faux positif**.
  Ces fichiers sont importés depuis `leaflet/dist/images/` (présents dans
  `node_modules/leaflet/dist/images/`) puis bundlés par Next.
- `/images/uploads/exemple.jpg` (`components/admin/ArticleForm.tsx`) : **placeholder
  de champ de saisie** (`placeholder=`), jamais chargé. Non problématique.
- `/images/logo-heldonica.png` (`lib/cms-seo-eeat.ts`) : **non résolu dans cette
  session** — référence dans un module SEO eE-A. À vérifier séparément.
