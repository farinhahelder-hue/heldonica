# Le CMS édite-t-il tout le site ? — audit de couverture

Audit du **2026-10-16**. Question posée : l'app et le CMS peuvent-ils modifier
**tout** le contenu du site ?

**Réponse courte : non — « la plupart, mais pas tout »**, et la partie non
éditable n'est pas la même selon le type de page.

## Méthode

Croisement de quatre sources, en lecture seule :

1. les routes publiques (`app/**/page.tsx`, 94 routes statiques) ;
2. les zones CMS en base (`cms_editable_zones`, **2 415 lignes**, 86 pages) ;
3. les surfaces d'édition (`app/panel-manager/CmsAdminClient.tsx` + `app/admin/*`) ;
4. les chemins d'écriture (`app/api/cms/**`, tous protégés par `requireCmsAuth`).

## Ce qui est éditable (et sans redéploiement de code)

`CmsAdminClient.tsx` expose **28 sections**. Les types de zones en base :
`text` 1 622, `textarea` 671, `html` 65, `image` 54, `cta` 3.

| Contenu | Éditable ? | Où |
|---|---|---|
| Textes & images de page (~2 415 zones) | **oui** | section « Zones de Texte » |
| Articles de blog (création, édition, révisions) | **oui** | section « Articles » |
| Catégories, médias, témoignages, guides, carrousels, cartes, checklists, saisons, redirections | **oui** | sections dédiées |
| Pages piliers (Madère, Roumanie, Monténégro) | **oui** | « Destinations » → `DestinationPillarEditor` |
| Sous-destinations | **oui**, via « Sous-Destinations » | table dédiée |

Le HTML rendu est **piloté par la base** : le client relit `/api/cms/zones` au
chargement. Un administrateur connecté voit donc ses changements **immédiatement**
(Live Edit). Pour un visiteur public, la propagation suit la fenêtre de cache de
la page (`revalidate` = 60 s, 300 s ou 3 600 s selon la route).

## Ce qui n'est PAS éditable — les trous

### 1. Onze routes publiques sans aucune zone CMS

`ajouter`, `auth-login`, `auth-register`, `dashboard`, `nos-services`,
`retour-experience` (pages applicatives, sans enjeu éditorial) — **mais aussi
trois pages de destination** :

- `destinations-madere`, `destinations-montenegro`, `destinations-roumanie`

Ces trois piliers sont les seuls à lire la base (`cms_pillar_pages`) : leur
contenu s'édite via l'éditeur « Destinations », pas via des zones. C'est
cohérent — mais cela signifie que **le modèle d'édition des destinations
principales diffère** de celui des autres pages.

### 2. Sous-destinations non éditables : **2, pas un lot** (corrigé le 2026-10-16)

> **Correction d'une version antérieure de ce rapport.** J'avais écrit que
> « brasov, sibiu, cluj, maramures, apuseni, transylvanie, colombie-*, suisse »
> n'étaient pas éditables. **C'était faux**, et la vérification le montre :
> `SubDestinationTemplate` est **entièrement câblé en `EditableZone`**, et la
> migration `20260801000010_cms_sub_destinations_zones.sql` a seedé **42 pages
> (25 zones chacune)** — dont Brasov, Sibiu, Cluj, Transylvanie, les quatre pages
> colombiennes et la Suisse. Le garde-fou `check:cms-zones` le confirme :
> **aucune zone orpheline**.

Le vrai écart est de **deux pages** :

| Page | Zones en base | Cause |
|---|---|---|
| `destinations-roumanie-maramures` | **0** | page ajoutée après le seed |
| `destinations-roumanie-apuseni` | **0** | page ajoutée après le seed |

**Cause racine.** Le générateur `scripts/generate-subdest-cms.mjs` est un script
**PowerShell Windows** (`execSync('powershell …')`) : il n'est pas portable et
n'est pas rejoué automatiquement quand une page est ajoutée. Ces deux pages sont
donc passées à travers. Leur code est **déjà correct** (zones câblées,
`getPageZones`, `InlineEditProvider`) — seules les lignes en base manquent.

**Ce n'est pas un blocage absolu.** `PATCH /api/cms/zones` fait un `upsert` sur
`(page, zone_key)` : un administrateur qui ouvre la page et utilise le Live Edit
**crée** la zone. La gêne réelle est qu'elles n'apparaissent pas dans la liste
« Zones de Texte » du CMS tant qu'on ne les a pas visitées.

**Correctif préparé** (non appliqué — écriture en production) :
`supabase/migrations/20261016110000_seed_maramures_apuseni_zones.sql`,
idempotent, valeurs reprises **à l'identique** du code.

### 2 bis. Les trois piliers partagent un seul espace de zones

`components/DestinationPillar.tsx` code en dur `page="destinations"` pour
**toutes** les `EditableZone`. Madère, Monténégro et Roumanie rendent donc le
**même jeu de 21 zones** — vérifié : `page='madere'` → 0 zone, `page='destinations'`
→ 21 zones. Conséquence : les libellés génériques sont éditorialement justes
(« Pourquoi **{nom}** pour un couple slow travel ? »), mais **impossible de
donner un titre différent à un pilier** sans toucher au code.

### 3. Les données éditoriales profondes des destinations

La table `destinations` porte `intro_narrative`, `itinerary`, `budget_details`,
`faq`, `practical_info`, `local_insider_tips` — mais :

- **aucun formulaire d'admin ne les édite** (`app/admin/destinations` et l'API
  `api/cms/destinations` ne gèrent que `excerpt`, `tagline`, `teaser`,
  `featured_image`, `hero_unsplash_url`, `avg_budget_couple_week`) ;
- seul l'éditeur pilier écrit `cms_pillar_pages`, **une autre table**, sur
  **3 lignes** (madere, roumanie, montenegro), avec un modèle de champs propre
  (`intro`, `itinerary`, `faq`, `verdict`, `tested_by_heldonica`…).

Autrement dit, il existe **trois modèles d'édition** concurrents pour une
« destination » : `cms_editable_zones`, `cms_pillar_pages`, et les champs
`destinations` (ces derniers surtout consommés par l'IA / la recherche, pas par
le rendu). **C'est la principale incohérence structurelle relevée.**

### 4. Coquilles « code » qui échappent au CMS

- Le **sitemap** (`app/sitemap.ts`) est **codé en dur** : ajouter une page de
  destination exige une modification du fichier, pas une action CMS.
- Les **titres et métadonnées `Metadata`** de nombreuses pages sont dans le code.
- Le `DESTINATION_CONTENT` de `DestinationPage.tsx` (sicile, lisbonne, paris,
  suisse, zurich) reste un fallback de code — surchargé par les zones CMS quand
  elles existent, mais **édité par un développeur** sinon.

## Sécurité de l'écriture — vérifiée

Toutes les routes d'écriture testées (`content`, `articles`, `destinations`,
`pillar-pages`) appellent `requireCmsAuth`. `lib/cms-auth.ts` repose sur un
**cookie de session HMAC** (`heldonica_cms_session`, 8 h) et **sans mot de passe
de repli** : sans `CMS_PASSWORD`, l'auth renvoie `503 misconfigured` plutôt que
d'accepter un secret public. **Bonne pratique confirmée.**

## Conclusion honnête

- **Éditable sans toucher au code** : la quasi-totalité des textes et images
  (2 415 zones / 82 pages rendant des zones, dont 75 seedées), les articles, les
  médias, les 3 piliers, et **41 des 43 sous-destinations**.
- **Non éditable depuis le CMS** : 2 sous-destinations jamais seedées
  (Maramureș, Apuseni — correctif prêt), les métadonnées/sitemap (en dur), et les
  champs profonds `destinations.*` (sans formulaire dédié).
- **Risque principal** : trois modèles de données pour un même concept de
  destination — source de confusion et de divergences.

**Recommandation** : le bon énoncé est **« l'essentiel est éditable ; deux pages
et le modèle profond des destinations demandent encore le code »** — et non
« tout est éditable », ni « un lot de pages ne l'est pas » (erreur que j'ai
commise puis corrigée).
