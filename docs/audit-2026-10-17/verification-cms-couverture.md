# Le site est-il entièrement modifiable via le CMS ? — vérification

**Question posée le 2026-10-17** : « vérifier que Claude a bien rendu tout le site
modifiable via CMS ».

**Réponse courte : non, pas « tout » — mais largement oui, et les trous sont
circonscrits.** **90 routes publiques sur 96** sont éditables ; les 6 restantes sont
des formulaires ou des redirections. Trois trous réels subsistent (détail §5).

---

## 1. Méthode

Ce qui a été inspecté :

1. **Cartographie des routes** : `find app -name page.tsx` → 119 routes, dont **96
   publiques** (exclusion de `/admin/*` et `/panel-manager/*`, qui sont des back-offices).
2. **Résolution des imports** : pour chaque `page.tsx`, on suit récursivement les
   imports locaux (`@/…`, `./…`) et on regarde si un composant d'édition
   (`EditableZone` / `ZoneText` / `ZoneImage`) est atteint. Un `page.tsx` qui ne
   l'atteint jamais n'est pas éditable.
3. **Base de production** : `cms_editable_zones` lue par REST (`count=exact` →
   **2 595 zones**, **89 clés `page`**). C'est la **source de vérité** : le CMS ne liste
   que ce qui est déjà en base (`EditableZonesManager` lit `/api/cms/zones`).
4. **Confrontation** des clés `page=` écrites dans le code avec les clés en base.
5. **Vérification de la précédence** base → code (§4).

## 2. Ce qui est prouvé éditable

| Mesure | Valeur |
|---|---|
| Routes publiques | 96 |
| **Routes atteignant `EditableZone`** | **90** |
| Zones en base | **2 595** |
| Clés `page` en base | 89 |
| Clés `page` écrites dans le code | 80 — **toutes présentes en base** |

Les **articles de blog** ont une surface d'édition distincte et complète
(`components/admin/ArticleForm.tsx`) : titre, slug, extrait, image de couverture,
`og_image_url`, catégorie, auteur, tags, date, statut, mise en avant, corps.

## 3. Le mécanisme, en clair

Deux surfaces d'édition coexistent :

- **Zones de contenu** (`cms_editable_zones`) — clé composite `` `${page}__${zone}` ``.
  Le composant `EditableZone` enregistre sa zone au montage
  (`components/inline-edit/EditableZone.tsx:47`), ce qui alimente la barre latérale :
  on peut donc **créer** une zone absente de la base, pas seulement modifier une zone
  existante.
- **Formulaires du back-office** (`/panel-manager`) pour les articles, photos,
  destinations, témoignages.

## 4. Précédence base → code : vérifiée par mesure

La valeur en base **écrase** le `fallback` codé. Contrôle fait sur `home`, où les 4
zones testées **diffèrent** entre base et code :

| Zone | Valeur en base | Fallback dans le code |
|---|---|---|
| `hero_line_1` | « On ferme les ordis. » | « On ferme » |
| `hero_line_2` | « On part. » | « les ordis. » |
| `hero_tagline` | « Deux voyageurs, dix ans de terrain… » | idem (tronqué) |
| `hero_badge` | « Slow travel vécu en duo… » | idem (tronqué) |

**Conséquence opérationnelle** : modifier un texte dans le code **ne change pas** la
page si la zone existe en base. Il faut une migration sur `cms_editable_zones`. C'est
déjà consigné dans la mémoire du projet.

## 5. Les trous réels

### 5.1 Zones orphelines — `nos-services` (P2, corrigeable)

`/nos-services` est une **redirection 301** vers `/travel-planning`
(`app/nos-services/page.tsx`, 5 lignes). Elle ne contient aucun `EditableZone`.

Or la base porte **6 zones** sous la clé `nos-services` :

| Clé en base | Clé attendue par `/travel-planning` |
|---|---|
| `faq_1_question` / `faq_1_answer` | `faq_1_q` / `faq_1_a` |
| `faq_2_question` / `faq_2_answer` | `faq_2_q` / `faq_2_a` |
| `faq_3_question` / `faq_3_answer` | `faq_3_q` / `faq_3_a` |

Ces 6 zones (dont « Le tarif du Travel Planning commence à 149€… ») sont donc
**invisibles** : la page est une redirection, et la page cible utilise d'autres clés.
**Elles apparaissent pourtant dans le CMS** sous une page qui n'existe pas — un
éditeur peut les modifier sans effet.

**Non corrigé** : déplacer une valeur d'une clé à une autre dans une table partagée est
une écriture en base, donc soumise à validation.

### 5.2 Texte en dur dans les gabarits partagés (P2)

Ces gabarits servent **plusieurs dizaines de pages** : ce qui reste en dur n'est
modifiable nulle part.

| Gabarit | Zones | Phrases en dur |
|---|---|---|
| `app/destinations/[slug]/DestinationPage.tsx` | 10 | **5** — ex. « Explorer les pépites de la région », « Tu veux un voyage adapté à ton rythme ? » |
| `components/DestinationPillar.tsx` | 23 | **7** — ex. « Demander mon voyage sur mesure → », « TOTAL estimé / semaine / couple » |
| `components/SubDestinationTemplate.tsx` | 16 | 0 |
| `components/ComingSoonDestination.tsx` | 9 | 0 |

### 5.3 Deux pages publiques sans aucune zone

| Route | Nature | Dans le sitemap ? | Liée depuis le site ? |
|---|---|---|---|
| `/ajouter` | formulaire « Écrire un carnet » | non | non |
| `/retour-experience` | formulaire de témoignage | non | non |

Leur contenu visible est en dur : `/retour-experience` affiche « Carnet de retour »,
« Votre retour d'expérience » et un paragraphe d'introduction. Ce sont des
**formulaires**, non indexés et non liés, mais ce ne sont pas de simples redirections —
le texte affiché n'est pas modifiable.

## 6. Faux positifs écartés — dont deux de mes propres hypothèses

- **`destinations-suisse`, `-lisbonne`, `-paris`, `-zurich`, `-sicile` : éditables.**
  J'ai d'abord cru à des zones orphelines. Faux : `DestinationPage` construit sa clé
  dynamiquement, `` page={`destinations-${slug}`} `` (ligne 170). Vérifié.
- **`destinations-` (clé tronquée) : légitime.** Ce n'est pas une clé malformée :
  `app/destinations/page.tsx:52` appelle `buildPageMetadata('destinations-', …)`, et
  `lib/page-metadata.ts:23` lit `seo_title` / `seo_description` / `seo_og_image`. Les 3
  zones sont **utilisées**.
- **`guides-top-10-pepites-madere` : légitime** — même mécanisme
  (`app/guides/top-10-pepites-madere/page.tsx:48`).
- **`global` : légitime** — `app/layout.tsx` appelle `getPageZones` avec une variable
  (`globalZones`), invisible à un `grep` littéral.
- **`/guides` et `/quiz` : éditables.** Leur comptage par `grep <EditableZone` est
  trompeur : ils passent par un helper `Z(...)` (8 et 14 usages), qui rend un
  `EditableZone`. Vérifié.
- `/auth/login`, `/auth/register`, `/dashboard`, `/ajouter` : hors périmètre éditorial
  (authentification, tableau de bord). Leur absence est **normale**.
- `/admin/*` et `/panel-manager/*` : back-offices, exclus du décompte.

## 7. Ce que je ne peux pas affirmer

- **Rendu visuel non observé.** Le mode maintenance renvoie 307 sur tout : je n'ai pas
  ouvert les pages dans un navigateur. La couverture est établie par **lecture du code
  et de la base**, pas par manipulation de l'interface d'édition.
- **Non testé** : qu'un clic sur « Enregistrer » dans le CMS écrit bien la valeur et la
  fait remonter sur la page. La précédence base → code est prouvée (§4) ; le
  fonctionnement du bouton d'enregistrement ne l'est pas.
- Je ne peux pas dire ce que « Claude » (une autre session) avait pour consigne :
  j'observe l'état du code et de la base, pas l'intention.

## 8. Recommandations

1. **P2** — Migrer les 6 zones `nos-services` vers les clés `faq_*_q` / `faq_*_a` de
   `travel-planning`, **puis** supprimer la clé orpheline. À valider (écriture en base).
2. **P2** — Transformer en zones les 5 + 7 phrases en dur des gabarits partagés, en
   commençant par `DestinationPage.tsx` (le plus grand nombre de pages touchées).
3. **P3** — Décider si `/retour-experience` et `/ajouter` doivent être éditables. Si
   oui, les passer sous `EditableZone` ; sinon, l'absence est assumée et à documenter.
4. **Garde-fou proposé** — un contrôle CI qui échoue quand une clé `page` de
   `cms_editable_zones` n'est référencée nulle part dans le code (ou l'inverse). Cela
   aurait attrapé `nos-services` automatiquement.
