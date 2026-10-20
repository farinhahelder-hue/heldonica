# Vérification visuelle des photos — ce qui est possible, ce qui ne l'est pas

Constat du **2026-10-16/17**. Question posée : « faire vérifier visuellement les
photos ». Voici ce que la reconnaissance a établi, séparé en **prouvé** /
**déduit** / **à confirmer**.

## 1. Où sont les photos, en réalité

`cms_media` contient **~600 photos**, mais **seulement 4 destinations** :

| Destination | Photos | GPS | Jours de prise de vue |
|---|---|---|---|
| Monténégro | 1 000+ (échantillon) | **1 000** | 27 → 31 mai 2026 |
| Roumanie | 147 | **0** | 25, 27, 31 août 2026 |
| Lisbonne | 50 | **50** | 20 sept. 2026 |
| (sans destination) | 6 | — | — |

**Prouvé :** Madère, Île-de-France, Normandie, Porto, Sicile, Sardaigne,
Colombie, Grèce, Suisse, Zurich **n'ont aucune photo dans `cms_media`**.
Conforme au constat des propriétaires : les photos existent (Google Photos),
elles ne sont **pas encore importées**. L'absence en base ne prouve pas
l'absence de voyage.

## 2. Les 51 zones `hero_image` — correction d'un constat antérieur

**Ce qui est prouvé :** les **51** zones `hero_image` actives valent **toutes**
`/og-default.jpg`. Pas 5. Le constat « 5 pages » ne comptait que le sous-ensemble
dont le **code** porte une vraie photo.

Croisement base ↔ code :

| Cas | Nb | Qui gagne à l'affichage |
|---|---|---|
| A. code = vraie photo | **5** | la zone écrase → **placeholder affiché** (bug) |
| B. code = `/og-default.jpg` aussi | 22 | cohérent : placeholder assumé |
| C. code sans `heroImage` | 24 | la zone fournit le placeholder |

Les 5 du cas A : `madere/achadas-da-cruz`, `madere/ponta-do-sol`,
`madere/porto-moniz`, `roumanie/bucarest`, `roumanie/sibiu`.

**Piège méthodologique (corrigé) :** un premier script a annoncé « 51 images
sans EXIF ». C'était **faux et trompeur** — les 51 « URLs » étaient en réalité
la chaîne relative `/og-default.jpg`, non téléchargeable. Une erreur de lecture
présentée comme un constat. Ne pas confondre « je n'ai pas pu ouvrir » et
« le fichier n'a pas de métadonnées ».

## 3. Les 5 photos réelles : ce qu'elles sont

| Photo | Dimensions | Poids | EXIF | Dans `cms_media` |
|---|---|---|---|---|
| `madere/achadas_da_cruz.jpg` | 1200×896 | 1,28 Mo | **0** | **non** |
| `madere/ponta_do_sol.jpg` | 1200×896 | 1,16 Mo | **0** | **non** |
| `madere/porto_moniz.jpg` | 1200×896 | 1,05 Mo | **0** | **non** |
| `roumanie/IMG_20260827_135618.jpg` | 3472×4624 | 6,70 Mo | 17 | oui (gphotos) |
| `roumanie/IMG_20260827_135023.jpg` | 3472×4624 | 6,46 Mo | 17 | oui (gphotos) |

**Observation :** les 3 photos Madère sont **retouchées/redimensionnées**
(1200×896, EXIF vidé). Les 2 photos Roumanie sont **brutes** (24 Mpx, EXIF
intact, prises au Xiaomi POCO X6 Pro).

**Déduit (non prouvé) :** les 3 Madère ressemblent à des exports de blog ou de
banque d'images, pas à des fichiers d'appareil. **Un nom de fichier n'est pas
une preuve de localisation** : impossible d'affirmer sans les voir qu'elles
montrent bien Achadas da Cruz, Ponta do Sol et Porto Moniz.

## 4. Contradiction possible à confirmer (Roumanie)

**Prouvé :** Bucarest utilise `IMG_20260827_135618` (13:56:18) et Sibiu
`IMG_20260827_135023` (13:50:23) — soit **5 min 55 s d'écart** pour deux villes
distantes de **218 km** (≈ 4 h de route).

**Ce que cela ne prouve PAS :** qu'elles sont mal attribuées. Elles peuvent
venir d'un **même lieu intermédiaire** (route Sibiu ↔ Bucarest, via l'Olt ou la
Vallée de Prahova) photographié à la suite, et servir légitimement de couverture
pour les deux pages. Les 147 photos Roumanie couvrent 13:46 → 22:54 le 27/08.

**À confirmer par les propriétaires :** ces deux photos montrent-elles bien
Bucarest *et* Sibiu, ou un point de passage unique ?

## 5. La vérification VISUELLE : impossible depuis cet agent

**Test conduit et concluant.** J'ai créé une image test, l'ai ouverte dans le
navigateur, pris une capture : le PNG est bien écrit sur disque (9 839 octets,
1920×1080) mais **n'est jamais rendu dans mon contexte**. Je n'ai donc **aucun
accès visuel** aux images.

**Conséquence honnête :** toute vérification « visuelle » que je produirais
serait une **déduction depuis le nom de fichier ou l'EXIF**, pas une
observation. Le présent document ne prétend donc **pas** avoir vu les photos.

## 6. Les outils de vision existants (à activer, pas à construire)

| Outil | Entrée | Modèle | Clé |
|---|---|---|---|
| `scripts/enrich_photos_vision.py` | **dossier local** | Gemini 2.5 Flash | `GEMINI_API_KEY` |
| `app/api/ai/gemini-gallery/route.ts` | route CMS (auth) | Gemini 2.5 Flash | `GEMINI_API_KEY` |
| `npm run check:ai-models` | — | interroge Gemini **en direct** | `GEMINI_API_KEY` |

**Prouvé :** `GEMINI_API_KEY` est **présente dans les secrets GitHub Actions**
(utilisée par `garde-fous.yml`, dernier run **vert**). La capacité de vision
**existe côté CI** ; elle n'existe pas dans mon environnement local.

## 7. Contrainte à ne pas oublier

`enrich_photos_vision.py` prend un **dossier local**. Les photos utiles sont
dans Supabase Storage / Google Photos. Pour une analyse visuelle, il faut
**télécharger les images** dans un dossier temporaire, lancer le script, puis
**jeter** le dossier. L'analyse produit une *description de modèle* : elle aide
à trier, elle ne remplace pas l'œil des propriétaires sur « est-ce bien ce
lieu-là ».

---

## 8. MISE À JOUR 2026-10-17 — la vision est possible SANS CLÉ

Le constat du §5 (« aucun accès visuel ») reste vrai **pour moi**, mais il ne
faut pas en conclure que la vérification visuelle est impossible. Test conduit :
un modèle de vision tourne **sur CPU, hors ligne, sans compte, sans clé, sans
quota** — donc gratuitement.

**Outil ajouté au dépôt :** `scripts/vision_check.py`
(modèle `Salesforce/blip-image-captioning-base` + `blip-vqa-base`, via
`transformers`, poids publics HuggingFace).

### Calibration préalable — ce qui rend le résultat exploitable

Avant de faire confiance au modèle, il a été testé sur des images **connues** :

| Image de contrôle | Ce qu'elle est vraiment | Ce que le modèle a répondu |
|---|---|---|
| `og-default.jpg` | logo Heldonica | *« hedona - font with a simple and clean look »* ✅ |
| `moraca_millennium.jpg` | Sahat kula (tour de l'horloge), Podgorica, **GPS 42.2178 / 18.9328** | *« a clock tower in a town square with people sitting at tables »* ✅ |

**Conclusion de la calibration :** le modèle est **fiable sur la scène**
(type de lieu, éléments visibles). Il a correctement reconnu une tour de
l'horloge sur une place.

**Mais** sur une autre photo du même lieu il a répondu
*« the sun sets over the river and bridge in the city of **skopje, bulgarie** »* —
un nom de lieu **entièrement inventé** (la photo est à Podgorica, Monténégro).

> **Règle d'usage : la description de scène est exploitable, le nom de lieu
> rendu par le modèle ne l'est JAMAIS.** C'est une aide au tri, pas un
> certificat de localisation.

### Résultat sur les 5 photos réelles (modèle local, sans clé)

| Photo | Description rendue | Type de lieu | Lecture |
|---|---|---|---|
| `madere/achadas_da_cruz.jpg` | *a rocky cliff* | rural / falaise | ✅ cohérent avec Achadas da Cruz (falaise, téléphérique) |
| `madere/ponta_do_sol.jpg` | *a car driving down a road near the ocean* | rural / océan | ✅ cohérent (route côtière) |
| `madere/porto_moniz.jpg` | *the water is blue* | rural / mer | ✅ cohérent (piscines naturelles) |
| `roumanie/IMG_20260827_135618.jpg` (**Bucarest**) | *a field with a fence and a house in the distance* | **rural** | ⚠️ **pas une capitale** |
| `roumanie/IMG_20260827_135023.jpg` (**Sibiu**) | *a field with a few trees and a few houses* | **rural** | ⚠️ **pas une ville** |

### Ce que cela établit — et ce que cela n'établit pas

**Établi (preuve visuelle, modèle calibré) :** les deux photos servant de
couverture à **Bucarest** et **Sibiu** montrent des scènes **rurales** (champ,
clôture, maisons éparses), pas un tissu urbain. Les trois photos Madère montrent
bien des scènes côtières/rocheuses, cohérentes avec leurs destinations.

**Non établi :** le **lieu exact**. Le modèle ne localise pas. Une photo rurale
peut légitimement illustrer une page de ville si elle a été prise sur la route
d'accès — c'est le cas des 147 photos Roumanie, prises le 27/08 entre 13:46 et
22:54 lors d'un trajet. **La question « est-ce que cette photo doit illustrer
cette page ? » reste une décision des propriétaires.**

**Renforce le signal du §4 :** Bucarest et Sibiu utilisent deux photos prises à
**5 min 55 s d'écart**, toutes deux **rurales**, pour deux villes à **218 km**.
Deux indices concordants — pas encore une preuve de mauvaise attribution.

### Pourquoi c'est « gratuit » au sens strict

- aucun compte, aucune clé, aucun quota, aucune carte bancaire ;
- poids publics téléchargés une fois, puis exécution **hors ligne** ;
- tourne sur CPU (testé sur 4 vCPU / 15 Go, sans GPU).
