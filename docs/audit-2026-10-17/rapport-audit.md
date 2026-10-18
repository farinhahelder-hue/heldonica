# Rapport d'audit éditorial et médias — Heldonica

Date : 2026-10-17
Branche : `agent/openhands/audit-editorial-media-coherence`
Périmètre : contenus réellement présents (articles, pages destinations, itinéraires,
pages commerciales, cartes d'articles, médias associés).

---

## 1. Périmètre et sources inspectées

| source | accès | volume |
|---|---|---|
| `app/` (routes Next.js) | lecture fichiers | 119 `page.tsx`, 132 `route.ts` |
| `cms_blog_posts` (Supabase, lecture seule) | REST + clé projet | 55 articles (41 publiés, 14 brouillons) |
| `cms_editable_zones` | REST | zones de 40+ pages |
| `destinations_public` | REST | 40 lignes (7 published, 6 coming_soon, 27 draft) |
| `cms_sub_destinations` | REST | 35 sous-destinations actives |
| `app/sitemap.ts` | lecture | 81 URLs |
| `next.config.js` (redirections) | lecture | 25 redirections |
| `middleware.ts` | lecture | matcher, exclusions maintenance |
| bucket Supabase `media` | REST (list + GET) | 156 fichiers |
| `public/images/` | filesystem | 13 fichiers suivis par git |
| git | historique | 813 commits (`git fetch --deepen=300`) |

**Hors périmètre** : paiements, formulaires, analytics, secrets, configuration
Vercel. Non touchés.

## 2. Méthode

1. **Reconnaissance technique** avant toute modification : stack, routage, modèle de
   contenu, système de médias, environnements.
2. **Croisement** routes ↔ fichiers de contenu ↔ base ↔ sitemap ↔ liens internes.
3. **Comptage séparé** des contenus uniques et des occurrences d'affichage.
4. **Vérification systématique** de chaque hypothèse avant de la présenter comme un
   constat. Plusieurs pistes ont été **écartées** après vérification (voir §6).
5. Corrections appliquées **en environnement isolé**, avec sauvegarde préalable dans
   `.sauvegardes/`.

La distinction **observé / déduit / à confirmer** est maintenue dans tous les
livrables. Une absence de preuve n'est jamais présentée comme une preuve d'absence.

## 3. Architecture réelle (telle qu'observée)

- **Stack** : Next.js 15.5.16 (App Router), React 18.3.1, TypeScript 5.9.3,
  Tailwind 3.4.19, vitest 4.1.8, Node 24.21.0.
- **Source de vérité des contenus** : Supabase (`cms_editable_zones` pour les zones
  éditables, `cms_blog_posts` pour les articles, `destinations_public` pour les
  destinations). Les valeurs en dur dans le code servent de **fallback**.
- **Médias** : bucket Supabase `media`, servi par
  `…/storage/v1/object/public/media/destinations/…`.
- **Sitemap** : liste de 81 URLs **codée en dur** dans `app/sitemap.ts`, plus les
  articles publiés lus en base.
- **Redirections** : déclarées dans `next.config.js` (25 entrées).
- **Mode maintenance** : actif en production. **Toute** requête, y compris vers une
  image, renvoie `307` vers `/maintenance`. C'est pourquoi un test HTTP en production
  ne peut pas distinguer une image existante d'une image absente.

## 4. Constats prouvés

### 4.1 P1 — 17 articles publiés sur 41 pointaient vers des images inexistantes

Les photos vivent dans le bucket Supabase, mais les couvertures désignent un chemin
local `/images/destinations/…` qui n'existe pas (`public/images/destinations/` ne
contient que `montenegro/`). Aucune normalisation, aucune rewrite : le middleware
servait ces URL en 404.

Preuves : `find public/images -type d` ; `git log --all -- public/images/destinations/madere/*`
vide sur 813 commits ; contre-exemple : le contenu CMS utilise déjà les URL storage.

**Corrigé** : 11 références, uniquement là où le **nom de fichier exact** existait
dans le bucket (HTTP 200 + `image/jpeg` vérifiés). Détail : `registre-medias.md`.

**Aggravant** : `app/sitemap.ts` publie `featured_image` comme image de l'article
(`imageUrl = post.featured_image`). Les **13 URL d'images inexistantes étaient donc
annoncées à Google** dans le sitemap. Correction impossible sans choisir une autre
photo : décision propriétaire.

**Précision de méthode.** La liste de 81 URLs codée en dur ne concerne que les pages
statiques. Les articles publiés sont ajoutés **dynamiquement** par `getAllPosts()` —
c'est pour cela que les 41 articles apparaissent, y compris les 2 redirigés.

### 4.2 P1 — L'article Stoos le plus riche est redirigé vers un article 3× plus court

`stoos-ridge-coucher-soleil-traversee-funiculaire` (19 170 car.) → 301 →
`stoos-ridge-notre-aventure-sur-la-crete-panoramique` (7 722 car.).
Deux autres articles publiés sont également redirigés. La version cible partage
2 phrases mot pour mot avec les deux autres.

**Non corrigé** : change la promesse d'un contenu publié → décision propriétaire.

### 4.3 P1 — Duplication `/destinations/lisbonne`

Deux pages servent la même ville avec deux `canonical` distincts. En base, `lisbonne`
est une sous-destination de `portugal`. Seule occurrence du schéma sur 35
sous-destinations vérifiées. **Non corrigé** : implique une redirection.

### 4.4 P1 — `/destinations/suisse` servie sans statut

Page accessible publiquement, **absente** de `destinations_public`. Images OG
pointant vers des fichiers inexistants.

**Corrigé** : les 2 images → visuel neutre `/og-default.jpg`.
**Non corrigé** : le statut de la page.

### 4.5 P2 — Contradiction de date sur les itinéraires Roumanie

Les 3 itinéraires affichent « Septembre 2024 » ; les articles Roumanie vont du
18/05/2026 au 29/09/2026 et les photos sont d'août 2026. Le propriétaire signale
**ne pas avoir tout téléversé** : absence de preuve ≠ preuve d'absence.
**Non corrigé** : demande son autorité.

### 4.6 P2 — Bug de parseur qui perdait des données en silence

Le parseur de `VALUES` de `scripts/appliquer-plan-rest.mjs` s'arrêtait au premier `)`.
Une valeur peut en contenir (« UNESCO (Bârsana & Ieud) ») : le tuple était rejeté et
la zone **silencieusement omise**. **Corrigé**, avec refus explicite en cas d'écart de
comptage. Contrôle de non-régression sur la migration déjà appliquée `140000` :
**56/56 lignes correctes**.

### 4.7 P2 — 6 destinations « Bientôt » sans aucune page

`naples`, `espagne`, `malte`, `corse`, `bari`, `pologne` sont `coming_soon` en base
sans route. À l'inverse, les 14 autres `coming_soon` ont une page de capture d'email.

### 4.8 P2 — Textes alternatifs faux dans le gabarit CMS

`lib/cms-templates.ts` : « Atmosphère feutrée de la cour intérieure » sur une photo de
forêt ; « Chambre aux matières brutes » sur une tour d'horloge. Génériques, donc faux
dès qu'appliqués ailleurs.

## 5. Ce qui est sain (contrôlé, non supposé)

| contrôle | résultat |
|---|---|
| Placeholders (TODO, lorem, FIXME, XXX…) dans 55 articles | **0** |
| Corps d'articles tronqués | **0** |
| Jours annoncés vs itinéraire (4 pages) | conforme : 5/5, 7/7, 10/10, 7/7 |
| URLs du sitemap sans route | **0** |
| Liens internes cassés | **0** |
| Cohérence `package.json` ↔ lock | aucune dérive, `npm ci --dry-run` OK |
| `npm run garde-fous` | **12/12** |

## 6. Pistes vérifiées puis ÉCARTÉES

Pour éviter que d'autres sessions les rouvrent comme des bugs :

| piste | verdict | preuve |
|---|---|---|
| Icônes de carte Leaflet manquantes | **faux positif** | importées de `node_modules/leaflet/dist/images/` (présentes) |
| `/images/uploads/exemple.jpg` manquant | **faux positif** | `placeholder=` d'un champ de saisie, jamais chargé |
| `/cms-admin` lien cassé | **faux positif** | redirection 301 → `/panel-manager` |
| `/images/logo-heldonica.png` manquant | **inerte** | `lib/cms-seo-eeat.ts` n'est importé nulle part |
| 41/41 articles sans couverture | **erreur de ma requête** | colonne non sélectionnée ; en réalité 41/41 **ont** une couverture |
| 14 pages « Bientôt » indexables | **défendable** | capture d'email (`NewsletterForm`) ; l'infrastructure `noindex` existe (`/merci`, `/start`, `/auth/*`, `/maintenance`) mais n'est pas appliquée ici |
| 27 destinations `draft` | **normal** | état de chantier |

## 7. Limites

- **Inspection visuelle des images : EFFECTUÉE (3e passe).** L'outil de vision local
  `scripts/vision_check.py` (BLIP, sans clé) a été utilisé après installation de ses
  dépendances. Résultat : les 5 images Madère substituées sont **visuellement
  cohérentes** avec leur légende ; l'album Roumanie révèle un **écart image ↔ texte**
  (voir `verification-visuelle-2.md` et `decisions-proprietaires.md` §11).
  **Attention à l'outil** : il décrit correctement la *scène* mais **invente le nom du
  lieu** (calibration sur photos GPS-vérifiées de Podgorica) — seule la description de
  scène est exploitable. Restent **non inspectées** : 14 images sur 23.
- **Rendu navigateur desktop/mobile : NON EFFECTUÉ.** Les **statuts HTTP** ont en
  revanche été mesurés sur un serveur local **hors maintenance**
  (`MAINTENANCE_MODE=false`) : c'est ce qui a prouvé le soft 404 (200 → 404) et le 404
  des images absentes. Le rendu **visuel** (mise en page, mobile) n'a pas été regardé.
- **Aperçus sociaux (OG) réels : NON VÉRIFIÉS.**
- **23 `featured_image` en URL storage absolues** : non sondées une par une.
- **Historique git partiel** : approfondi à 813 commits ; au-delà, non vérifié.
- Les modules Python du second projet (`heldonica-brain`) sont **hors périmètre**.

## 8. Livrables

| fichier | contenu |
|---|---|
| `rapport-audit.md` | ce document |
| `inventaire.csv` | URL, source, type, statut, problème, preuve, priorité, confiance, action, validation |
| `registre-medias.md` | page, emplacement, média, anomalie, remplacement vérifié ou besoin |
| `journal-corrections.md` | fichiers modifiés, cause racine, pages affectées, tests |
| `decisions-proprietaires.md` | ce qui demande l'autorité des propriétaires |

## 9. Bilan

- Contenus découverts : 55 articles, 40 destinations, 35 sous-destinations, 4 pages
  itinéraires, 81 URLs de sitemap, 156 fichiers média.
- Contenus **réellement audités** : l'ensemble ci-dessus au niveau métadonnées,
  structure, statut, cohérence et médias.
- **Restant à auditer** : le **contenu rédactionnel article par article** (55 corps
  n'ont été lus que pour détecter placeholders, troncature et duplications) ;
  l'inspection **visuelle** des photos ; le rendu navigateur.
- Corrections réalisées : 11 références média, 3 textes charabia, 1 bug de parseur,
  24 zones Roumanie semées.
- Blocages : inspection visuelle impossible ; mode maintenance empêchant tout test
  HTTP discriminant ; décisions propriétaires en attente (12 points).
- État : branche à jour, arbre propre, **12/12 garde-fous verts**, build OK,
  **rien poussé, aucune PR**.
