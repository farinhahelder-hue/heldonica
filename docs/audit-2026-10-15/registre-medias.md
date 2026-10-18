# Registre des médias problématiques — Heldonica

Audit du 2026-10-15. Périmètre : images éditoriales référencées par le dépôt et par
le CMS (couvertures d'articles, images de corps d'article, couvertures de
destinations).

## Méthode

Pour chaque référence d'image **locale** (chemin commençant par `/images/…`)
trouvée dans le code, dans `cms_blog_posts` et dans `destinations`, deux
vérifications ont été faites :

1. **Présence dans le dépôt** — le fichier existe-t-il sous `public/` ?
2. **Présence dans Supabase Storage** — l'URL publique renvoie-t-elle `200` ?
   Deux préfixes testés : `media/…` et `blog-images/…`.

Une référence est déclarée **introuvable** seulement si les deux échouent.

> **Limite à connaître.** Le site est en mode maintenance : `middleware.ts`
> redirige tout, y compris `/images/…`, vers `/maintenance` en `307`. Une requête
> sur `heldonica.fr/images/...` renvoie donc `307` quel que soit le fichier —
> elle ne prouve ni sa présence ni son absence. La vérification « dépôt + Storage »
> est la seule qui soit concluante ici. Aucun test de rendu navigateur n'a été
> effectué pour cette raison.
>
> **Vérification visuelle : non effectuée.** Aucune image n'a été ouverte ni
> regardée. Le contenu réel des photos (est-ce bien la Costa Smeralda ?) n'est
> donc **pas** validé — seul le fait qu'un fichier existe à l'URL attendue l'est.

## Bilan chiffré

- 39 références d'images locales distinctes recensées.
- 14 résolues (dépôt ou Storage).
- **25 introuvables** : ni dans `public/`, ni dans le bucket Storage.

## Références introuvables

### Couvertures d'articles publiés (12) — priorité P1

Ces articles sont publiés et leur image de couverture ne se charge pas.

| Article | `featured_image` |
|---|---|
| `carnet-maderes-2025-2026` | `/images/destinations/madere/IMG_0101.JPG` |
| `prego-no-bolo-do-caco` | `/images/destinations/madere/IMG_0122.JPG` |
| `pepites-mystiques-de-madere` | `/images/destinations/madere/IMG_0197.JPG` |
| `madere-quand-partir-sur-lile-de-leternel-printemps` | `/images/destinations/madere/IMG_0207.JPG` |
| `madere-slow-travel-guide` | `/images/destinations/madere/IMG_0214.JPG` |
| `madere-guide-complet` | `/images/destinations/madere/IMG_0219.JPG` |
| `foret-fanal-levadas-mystiques-madere-slow-travel` | `/images/destinations/madere/IMG_0220.JPG` |
| `podgorica-capitale-oubliee-montenegro` | `/images/destinations/montenegro/IMG_20260528_211407.jpg` |
| `kotor-a-laube-remparts-venitiens-bouches-de-kotor` | `/images/destinations/montenegro/PXL_20260528_061212256.RAW-01.COVER.jpg` |
| `perazica-do-tunnels-falaise-baie-hotel-as` | `/images/destinations/montenegro/DSC_8044.JPG` |
| `cote-pastrovici-en-mer-falaises-criques-pleine-lune` | `/images/destinations/montenegro/DSC_8245.JPG` |
| `lisbonne-ruelles-alfama-miradouros-azulejos` | `/images/destinations/lisbonne/DSC_0085.JPG` |

### Autres références introuvables (13)

| Référence | Remarque |
|---|---|
| `/images/destinations/madere/fanal.jpg` | **Référencée par le corps d'un article** du Coffre des Savoirs |
| `/images/destinations/madere/achadas-da-cruz.jpg` (via `fanal_foret.jpg`) | utilisée par l'album de preuve « Madère — Fanal, Achadas da Cruz » |
| `/images/destinations/montenegro/PXL_20260528_082326237.RAW-01.COVER.jpg` | |
| `/images/destinations/montenegro/PXL_20260528_101805508.RAW-01.MP.COVER.jpg` | |
| `/images/destinations/montenegro/PXL_20260528_150212299.RAW-01.COVER.jpg` | |
| `/images/destinations/montenegro/PXL_20260528_174214721.RAW-01.MP.COVER.jpg` | |
| `/images/destinations/montenegro/PXL_20260530_105432448.RAW-01.COVER.jpg` | |
| `/images/destinations/montenegro/2026-05-31_08h-10h_PXL_20260531_085901077.RAW-01.COVER.jpg` | |
| `/images/destinations/montenegro/2026-05-31_18h-20h_PXL_20260531_190419321.RAW-01.COVER.jpg` | |
| `/images/destinations/montenegro/2026-05-31_20h-22h_PXL_20260531_203834291.NIGHT.RAW-01.COVER.jpg` | |
| `/images/destinations/suisse/stoos-02.jpg` | `stoos-01/03/04.jpg` résolvent, `stoos-02` non |
| `/images/uploads/exemple.jpg` | gabarit d'exemple |
| `/images/destinations/madere/IMG_0220.JPG` | voir tableau ci-dessus |

### Images strictement identiques dans le Storage (doublons)

`blog-images/stoos-03.jpg` et `blog-images/stoos-04.jpg` ont la **même empreinte
MD5** (`96ceb14f…`) et la même taille (397 434 octets). Deux emplacements
distincts servent donc la même photo — l'un des deux ne correspond pas à ce qu'il
annonce.

| Emplacement | URL | Constat |
|---|---|---|
| galerie Stoos | `blog-images/stoos-04.jpg` | identique à `stoos-03.jpg` |
| galerie Stoos | `blog-images/stoos-03.jpg` | référence |

**Action :** vérifier visuellement lequel des deux emplacements est erroné, puis
remplacer par la photo correcte — **photo à fournir**.

## Corrections effectuées dans cette branche

| Page / emplacement | Média | Anomalie | Correction |
|---|---|---|---|
| `lib/cms-vault-spots.ts` (spot Madère) | URL Storage du spot Fanal | hôte `smxnruefmrmfyfmuxygq.supabase.co` (project ref erroné) | **corrigé** → `smxnruefmrmfyfhuxygq.supabase.co` (vérifié : plus aucune occurrence) |

## Ce qui n'a pas été fait, et pourquoi

- **Aucun remplacement d'image n'a été effectué.** Aucune photo candidate n'a été
  vérifiée visuellement, et le dépôt ne contient pas de photo de remplacement
  dont la correspondance soit établie. Substituer une image « plausible » serait
  exactement l'erreur à éviter.
- **Aucune image externe n'a été importée** (pas de provenance ni de droits
  établis).
- **Aucune image générée** n'a été utilisée.

## Décisions propriétaires demandées

1. **Fournir ou valider 12 couvertures d'articles** (liste P1 ci-dessus).
2. **Fournir** `fanal.jpg` et `achadas-da-cruz.jpg` : deux albums de preuve
   terrain reposent sur ces fichiers, et l'un est cité dans le corps d'un article.
3. **Trancher le doublon `stoos-03` / `stoos-04`.**
4. **Confirmer** si `stoos-02.jpg`, présent dans les galeries, doit exister.
5. **Traiter `/images/uploads/exemple.jpg`** : gabarit encore référencé.

---

## Reprise du 2026-10-16 — vérification empirique

Le 2026-10-15, la vérification des images était **indirecte** : le mode
maintenance renvoyait `307` sur `/images/…`, ce qui ne prouvait ni présence ni
absence. Le rapport concluait « introuvable » sur la foi de la double
vérification dépôt + Storage.

**Ce qui change aujourd'hui.** Un serveur local a été lancé **hors mode
maintenance**, avec la vraie base. Les images statiques y sont servies
directement, sans middleware. Le test devient donc concluant.

### Ce qui est maintenant prouvé (et non plus déduit)

| Référence testée | Fichier dans `public/` | HTTP réel | Conclusion |
|---|---|---|---|
| `/images/destinations/madere/IMG_0101.JPG` | absent | **404** | couverture morte |
| `/images/destinations/madere/IMG_0122.JPG` | absent | **404** | couverture morte |
| `/images/destinations/montenegro/IMG_20260528_211407.jpg` | absent | **404** | couverture morte |
| `/images/destinations/montenegro/DSC_8044.JPG` | absent | **404** | couverture morte |
| `/images/destinations/lisbonne/DSC_0085.JPG` | absent | **404** | couverture morte |
| `/images/destinations/suisse/stoos-02.jpg` | absent | **404** | référence morte |

**Et ce n'est pas seulement une référence orpheline.** Les pages publiées
**servent** réellement ces URL cassées. Preuve :

- `/blog/carnet-maderes-2025-2026` → HTTP 200, contient
  `<img src="/images/destinations/madere/IMG_0101.JPG">` → **404**.
- `/blog/lisbonne-ruelles-alfama-miradouros-azulejos` → HTTP 200, contient
  `/images/destinations/lisbonne/DSC_0085.JPG` → **404**.

**Constat consolidé, P1.** Des articles publiés affichent une **couverture
cassée**. Ce n'est plus « l'image ne se charge pas dans mes tests », c'est
« l'image est absente du dépôt et le navigateur reçoit un 404 ».

### Ce qui reste non vérifié

- Le **contenu visuel** de toute image (aucun accès à l'analyse d'image).
- L'identité exacte des 12 articles cités le 2026-10-15 : je confirme le
  mécanisme et plusieurs cas nommés, **pas la liste complète** article par
  article.
- Le doublon `stoos-03` / `stoos-04` (même MD5) : non réexaminé visuellement.

### Recommandation inchangée

**Ne pas substituer une photo « plausible ».** Ces couvertures doivent être
**fournies par le propriétaire** (ce sont des photos de terrain : `IMG_…`,
`DSC_…`, `PXL_…` — des originaux qui n'ont pas été déposés dans `public/`).
Piste technique à explorer : elles existent peut-être dans Supabase Storage
(les autres images du même voyage y sont), au cas où la correction consiste à
repointer l'URL, pas à ressourcer la photo. **À confirmer avec le propriétaire.**

## Complément média du 2026-10-16 — associations d'images

**Observé** (41 articles, 38 images distinctes, 3 images partagées par 2 articles) :

| Image | Articles | Verdict |
|---|---|---|
| `media/mobile/1788552928863-yeye7e-heldonica_7812946419314841504.jpg` | `quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014` (**Paris**) **et** `cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine` (**Timișoara, Roumanie**) | **Erreur d'association très probable** — deux pays, deux sujets, deux dates de publication (2025-09-27 et 2026-09-29). |
| `/images/bacalhau-gomes-sa.jpg` | `bacalhau-a-lagareiro` et `bacalhau-gomes-sa-recette` | à confirmer — même sujet, partage plausible. |
| `media/destinations/roumanie/IMG_20260827_135618.jpg` | `maramures-roumanie-authentique` et `maramures-train-moitie-siecle` | à confirmer — même région. |

**Contrôle technique.** L'image partagée Paris/Timișoara répond bien **HTTP 200,
`image/jpeg`** : elle existe et se charge. Le problème n'est donc pas un lien
mort, mais une **association contestable**. Nom de fichier de type
`media/mobile/<horodatage>-…` : téléversement mobile, réutilisation plausible —
**non prouvé**.

**Image générique de partage.** `public/og-default.jpg` (1200 × 630) est
référencée par **127 zones CMS actives** : 74 `seo_og_image`, **51
`hero_image`**, 2 `hero_image_url`. Un visuel de partage générique est normal ;
ce qui l'est moins, c'est que **51 bannières de page** utilisent aussi ce
fichier. **À valider visuellement** (le visuel est-il neutre, ou suggère-t-il
une destination ?).

**Page Taormine.** Cumule un **texte placeholder** (« spot tourism … Incredible »)
et un **hero générique** (`/og-default.jpg`), sur une URL présente dans
`sitemap.xml`. `photo à fournir ou à valider`.


---

## Reprise du 2026-10-16 (2) — EXIF, images en 404, bug de réutilisation

### Ce que j'ai pu prouver sans regarder une seule image

**a) Trois images Unsplash en HTTP 404** (jamais signalé auparavant) :

| Page | URL | Statut |
|---|---|---|
| `/destinations/bari` | `images.unsplash.com/photo-1518715303843-…` | **404** |
| `/destinations/pologne` | `images.unsplash.com/photo-1529980308703-…` | **404** |
| `/destinations/corse` | `images.unsplash.com/photo-1533587955158-…` | **404** |

Les trois sont en `coming_soon` (non publiées) : l'impact public est donc
**limité**, mais l'erreur est réelle — ces URL sont mortes en amont.

**b) Attribution EXIF lisible, même sans GPS.** Les photos téléversées depuis
mobile portent encore leurs métadonnées de prise de vue :

| Fichier | Appareil | Date EXIF |
|---|---|---|
| `…/1790026207339-kzqjy8-…` (ballade Mouffetard) | **Pixel 8 Pro** | 2026-09-21 21:54 |
| `…/1788556506948-ij9cuw-…` (urbex-paris-safe) | **Pixel 8 Pro** | 2026-09-04 20:22 |
| `…/1788552928863-yeye7e-…` (partagée Paris/Timișoara) | *(bloc EXIF absent)* | — |

**c) GPS : inexploitable.** Sur 53 images testées en ligne, **2 seulement**
portent un bloc GPS — et il ne contient que des valeurs vides (`NaN`). Les
coordonnées sont donc **retirées**. Impossible de localiser une photo par ce
moyen.

**d) Bug de réutilisation — preuve par horodatage de téléversement.**
Le nom de fichier d'une image mobile commence par un **horodatage Unix**.
`1788552928863` = **2026-09-04 20:15:28 UTC**.

Or l'image `1788556506948` (`urbex-paris-safe`), téléversée **une heure plus
tard le même jour** (2026-09-04 21:15), a un EXIF de prise de vue
**2026-09-04 20:22** — même expédition, à Paris.

**Ce qui s'est passé, reconstitué sans spéculation :**
1. Une série de photos est téléversée le **2026-09-04 au soir** (Paris).
2. La photographie `1788552928863` est affectée à
   `cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine`, un article
   **roumain publié depuis le 2025-09-27**.
3. Plus tard, elle est affectée aussi à un article **Paris**
   (`quand-verdure-rime-…petite-ceinture`).

**Conclusion.** Ce n'est pas une « photo de Timișoara douteuse » : c'est **une
photo prise à Paris pendant la session du 2026-09-04**, appliquée à un article
roumain. Le constat est **certain en probabilité très forte**, non visuellement
confirmé. **Action : photo de Timișoara à fournir.**

### Légende, crédit, texte alternatif

**Observé** : aucune image éditoriale ne porte de champ de crédit ou de légende
structuré dans les données consultées (`featured_image` est une simple URL). Le
texte alternatif est fourni au niveau du composant, pas du média.

**Non vérifié** : le contenu des `alt` rendus, faute d'analyse visuelle de la
correspondance image ↔ texte alternatif.

