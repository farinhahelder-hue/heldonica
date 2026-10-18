# Décisions propriétaires — Heldonica

Liste courte. Rien ici n'a été tranché à votre place : ce sont les points qui
demandent votre autorité (fait vécu, publication, photo, URL).

Classés par ordre d'impact.

---

## 1. Les trois articles Stoos (P1)

Vous avez **5 versions** d'un article sur la crête de Stoos. Trois sont publiées et
pointent les unes vers les autres par redirection :

| article | statut | taille | destination |
|---|---|---|---|
| `stoos-ridge-coucher-soleil-traversee-funiculaire` | publiée | **19 170 car.** | redirigé → |
| `stoos-ridge-notre-aventure-sur-la-crete-panoramique` | publiée | 7 722 car. | redirigé → |
| `stoos-ridge-notre-aventure-sur-la-crete-panoramique` (cible) | publiée | 7 722 car. | reçoit 3 redirections |
| `stoos-ridge-la-crete-pano` | brouillon | 7 665 car. | — |
| `carnet-suisse-stoos-2025` | brouillon | 2 082 car. | — |

**Le problème :** votre article **le plus riche (19 170 caractères)** est
**redirigé vers** un article trois fois plus court. Le contenu long n'est plus
atteignable. Et la version cible partage **2 phrases mot pour mot** avec les deux
autres.

**Décisions possibles :** fusionner le contenu long dans la version cible, ou
republier le long sous sa propre URL. **Je n'ai rien touché** : cela change la
promesse éditoriale d'un contenu publié.

## 2. La date « Septembre 2024 » des itinéraires Roumanie (P2)

Les trois itinéraires Roumanie affichent un badge **« Septembre 2024 »**.

Ce que j'ai mesuré : les 6 articles Roumanie vont du **18/05/2026 au 29/09/2026**,
et les 147 photos du bucket sont d'**août 2026**. Aucune trace de 2024.

**Mais** vous m'avez dit avoir visité la Roumanie **plusieurs fois** et **ne pas
avoir tout téléversé**. Donc : je ne peux pas conclure que 2024 est faux.

**Décision :** le voyage de septembre 2024 a-t-il eu lieu ? Si oui, rien à
corriger. Si non, je corrige le badge.

## 3. La duplication Lisbonne (P1)

Deux pages servent la même ville, toutes deux indexables, avec deux `canonical`
différents :

- `/destinations/lisbonne` (page de premier niveau)
- `/destinations/portugal/lisbonne` (sous-destination, `parent=portugal`)

En base, `lisbonne` est bien une **sous-destination de `portugal`**. La page de
premier niveau semble être un reste. C'est la seule occurrence du schéma (35
sous-destinations vérifiées).

**Décision :** laquelle garder ? Cela implique une redirection, donc je n'ai pas agi.

## 4. Le statut de `/destinations/suisse` (P1)

La page `/destinations/suisse` est **servie publiquement** mais **absente de
`destinations_public`**. Elle n'a donc aucun statut : ni publiée, ni brouillon, ni
« bientôt ».

J'ai corrigé ses deux images (elles pointaient vers `stoos-01.jpg` et
`stoos-02.jpg`, qui n'existent ni sur le disque ni dans le bucket) en visuel neutre.
Mais **la page n'a toujours aucun statut en base**.

**Décision :** publier, passer en « bientôt », ou retirer.

## 5. Les 6 destinations « Bientôt » sans page (P2)

En base, 6 destinations sont en `coming_soon` : **naples, espagne, malte, corse,
bari, pologne**. Aucune n'a de route : pas de page, pas de capture d'email.

À l'inverse, les 14 autres `coming_soon` (Sicile, Sardaigne, Colombie) **ont** une
page de capture d'email — et sont indexables.

**Décision :** créer les 6 pages, ou les passer en `draft` ?

## 6. Photos à fournir (P2)

Aucun remplacement n'a été tenté, faute de correspondance exacte :

- **4 photos Suisse** (`IMG_20250712_154207.jpg`, `IMG_20250712_154303.jpg`,
  `AGC_20250712_194042959.jpg`, `AGC_20250712_220701363.jpg`) — le dossier
  `suisse/` n'existe **nulle part**.
- **3 photos de gabarit** : `fanal-arbres-centenaires.jpg`,
  `achadas-da-cruz-telepherique.jpg`, `stoos_sommet_croix.jpg`.
- **13 couvertures d'articles publiés** (Madère ×7, Monténégro ×5, Lisbonne ×1) qui
  désignent des fichiers absents. Le bucket ne contient que **5 photos Madère**,
  **4 Monténégro**, **0 Lisbonne**. Un choix est nécessaire.

**Pourquoi c'est plus qu'esthétique :** `app/sitemap.ts` publie `featured_image`
comme image de l'article. Ces **13 URL d'images inexistantes sont donc annoncées à
Google** dans votre sitemap. C'est le point le plus concret de cette liste.

## 7. Textes alternatifs faux dans le gabarit CMS (P2)

`lib/cms-templates.ts` contient des textes alternatifs **génériques** :

- « Atmosphère feutrée de la cour intérieure » / « La cour intérieure ombragée » →
  posé sur une photo de **forêt de Fanal**.
- « Chambre aux matières brutes et naturelles » / « Pierres apparentes et bois
  patiné » → posé sur une **tour d'horloge** (Sahat Kula).

Faux dès qu'appliqué à une autre destination. Corriger demande de **regarder les
photos** : l'outil de vision local (`scripts/vision_check.py`) a depuis été utilisé
(3e passe) — voir §11.

## 8. Promesses plus larges que le contenu (P2)

- `les-meilleures-brasseries-authentiques-de-zurich-guide-2026` : titre « Guide
  2026 » pour **1 357 caractères**.
- `ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature` : se termine par
  « Partagez vos souvenirs… **en commentaire** ! » alors que le site n'a pas de
  commentaires.
- `maramures-aube-portes-bois` : **650 caractères**, le plus court des publiés.
  Il n'est **pas tronqué** (fin propre), mais très bref.

**Décision :** étoffer, corriger, ou assumer le format.

## 9. Faits à confirmer dans l'intro Maramureș (P3)

Le texte dit « arpenté ces vallées **en toute saison** » et « nos voyages **en 2025
et 2026** ».

Mesuré : articles Roumanie du 18/05/2026 au 29/09/2026 ; photos d'août 2026.
**Aucune trace de 2025 ni d'hiver** — mais vous n'avez pas tout téléversé.

**Décision :** confirmer les saisons et 2025.

## 10. Prix et adresses des itinéraires Roumanie (P3)
Les itinéraires nomment des hébergements avec **prix au nuit** (« Hotel Belvedere —
3*, 50 €/nuit ») et des « pépites » (« terrasse du Ceai la Metrou », « Restaurant
din Turn ») **sans adresse ni lien**. Aucune source trouvée. Les prix ne sont pas
datés.

**Décision :** confirmer, dater, ou retirer les montants.

## 11. Album Roumanie — l'image ne correspond pas au texte (P2, NOUVEAU)

**Trouvé par vérification visuelle** (outil BLIP local, voir
`verification-visuelle-2.md`). L'album `roumanie-aout-2026`, intitulé
**« Roumanie — Bucarest & Transylvanie »**, contient 4 photos portant toutes
`location: 'Bucarest, Roumanie'`, avec des anecdotes de **ville** (« façades
d'époque », « cour intérieure », « passage piéton couvert », « ruelles calmes de la
capitale »). Or l'inspection visuelle décrit, pour les 4 :

| Fichier | Scène vue |
|---|---|
| `IMG_20260827_135023.jpg` | un champ, quelques arbres et maisons |
| `IMG_20260827_135025.jpg` | un champ, quelques arbres |
| `IMG_20260827_135618.jpg` | un champ, une clôture, une maison au loin |
| `IMG_20260827_135834.jpg` | une petite fille souriante tenant un gâteau |

**Aucune scène urbaine.** Le modèle sait reconnaître une ville (calibration réussie
sur des photos GPS-vérifiées de Podgorica), et répond ici « rural » aux quatre.

**C'est un faisceau, pas une preuve.** Deux lectures possibles, non tranchées :
l'association image ↔ lieu est fausse, **ou** les photos ont été prises aux abords
de Bucarest. Cette observation ne dit **rien** sur la réalité de votre voyage.

**Ces libellés ne sont pas internes** : `GET /api/cms/photos/albums` répond **sans
authentification** (vérifié) et renvoie le titre, les lieux et les anecdotes ; un
brouillon généré en fait des blocs `photo_evidence` publiables.

**Décision :** pour chacune des 4, le lieu est-il correct ?
- Si oui → réécrire l'anecdote pour décrire la scène réelle.
- Si non → retirer l'image de l'album (ne pas la réaffecter au hasard).

## 12. Couvertures d'articles sur la mauvaise destination (P1, NOUVEAU)

**14 articles non-roumains portent une couverture photographiée en Roumanie**, dont
**5 publiés** (Zurich, Grève, Limmat, guide slow travel, recette de crêpes). Aucune
de ces images ne montre le sujet annoncé : une petite fille au gâteau illustre la
réserve de la Grève, la pleine lune illustre les brasseries de Zurich, etc.

Détail complet : `couvertures-mauvaises-destinations.md`.

**Aggravant mesuré dans le code** : `app/blog/[slug]/page.tsx:97` retombe sur
`featured_image` quand `og_image_url` est vide — c'est le cas des 5 publiés. L'image
fautive part donc aussi dans les **aperçus de partage social**.

**Cause racine NON établie.** Aucune migration versionnée n'assigne ces images
(vérifié) : l'opération est donc venue de hors dépôt. Le repli
`VERIFIED_PHOTO_ALBUMS[0]` désigne le Monténégro, pas la Roumanie — il n'explique pas
ce cas.

**Décision :** pour chacun des 5 articles publiés :
- fournir une photo du bon lieu, **ou**
- autoriser le basculement sur `/og-default.jpg` (visuel de marque neutre, non
  trompeur) en attendant.

Aucune correction appliquée : choisir une image de remplacement sans savoir ce qui
convient serait inventer une illustration.

---

## Ce que je n'ai PAS fait, volontairement

- Aucune écriture en base pour ces points (sauf la migration Roumanie que vous avez
  validée).
- Aucune publication, dépublication ou suppression.
- Aucun changement d'URL, slug, canonical ou redirection.
- Aucun import ni achat de média.
- Aucun fait ajouté. Aucune expérience vécue inventée.
- Aucun déploiement, aucun push distant, aucune PR.
