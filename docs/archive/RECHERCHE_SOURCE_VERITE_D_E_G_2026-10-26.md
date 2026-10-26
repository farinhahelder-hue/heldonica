# Recherche de source de vérité — constats D, E, G de l'audit éditorial

**Date de relevé : 2026-10-26. Branche `main` @ `9341329a`.**
Rien n'est corrigé ici : ce document rassemble les traces trouvées et désigne la
plus ancienne. Les valeurs factuelles appartiennent au propriétaire.

Méthode : recherche par sous-chaîne dans le dépôt (`grep`) et dans l'historique
git (`git log --all -S`, qui date chaque apparition et nomme son auteur).

---

## D — Années d'expérience : « dix ans » contre « 4+ »

### Ce qui est en base aujourd'hui

| Source | Valeur | Affichée ? |
|---|---|---|
| zone `home/hero_tagline` | « Deux voyageurs, **dix ans** de terrain… » | oui, accueil |
| zone `global/stat_1_nb` | **`4+`** + label « Ans de slow travel » | oui, accueil |
| zone `a-propos/stat_3_value` | **`4`** | oui, /a-propos |
| zone `a-propos/bio_text_3` | « **En 2019**, on a décidé de faire autrement. » | oui, /a-propos |
| `docs/HOME_BRIEF_2026.md:19` | « Deux voyageurs, dix ans de terrain… » | non (doc) |

`bio_text_3` est la seule **date d'ancrage** présente en base : 2019. C'est le
seul point de départ que le site revendique lui-même.

### Traces les plus anciennes, datées et attribuées

| Formulation | Occurrence la plus ancienne | Commit | Auteur |
|---|---|---|---|
| « appris sur la route **depuis 2015** » | 2026-04-06 | `7063aee5` | farinhahelder-hue |
| « Parisiens **depuis 2018** » | 2026-04-06 | `7063aee5` | farinhahelder-hue |
| « appliqué **depuis 2019**, affiné à chaque voyage » | 2026-04-06 | `0fa53534` | farinhahelder-hue |
| « En **2019**, on a décidé de faire autrement » (bio) | 2026-06-08 | `8ff9033b` | OpenHands |
| « **dix ans** de terrain » (hero) | 2026-05-25 | `fff6c97f` (doc) / `4a0a03eb` (code, 2026-08-19) | openhands / farinhahelder-hue |
| « **10 ans de terrain** » | 2026-05-06 | `a2d95055` | farinhahelder-hue |
| « **4+** ans de slow travel » | 2026-06-08 | `0cbff83d` | OpenHands |

**La plus ancienne est « depuis 2015 » (2026-04-06, `7063aee5`, farinhahelder-hue).**
Elle apparaît dans le contenu d'un article seedé, à la signature :
« *Heldonica, appris sur la route depuis 2015* ».

### Ce que dit l'historique de l'audit

Un audit antérieur, `AUDIT_EXHAUSTIF_2026-07-04.md` (commité le 2026-07-05 dans
`fecfe383`), écrivait déjà, section 5.2 « Preuves de terrain faibles » :

> - "4+ ans de slow travel" — pas de date précise
> - "100+ adresses vécues" — non vérifiable
> - "Pays habités" — pas listé

Autrement dit : **le « 4+ » était déjà signalé comme non étayé il y a près de
quatre mois**, et le « dix ans » du hero est apparu après (mai 2026). Aucune des
deux valeurs n'a jamais été rattachée à une date de départ explicite — sauf
`bio_text_3` (« En 2019 »).

### Ce qu'on peut en dire sans trancher

- Les ancrages **2015**, **2018** et **2019** coexistent dans les contenus.
- « dix ans » et « 4+ » ne peuvent pas être vrais tous les deux à la même date.
- Si l'ancrage retenu est **2019** (le seul affiché sur une page de fond), alors
  en 2026 l'ancienneté est de **~7 ans**, pas « dix » ni « 4+ ».

**La décision (date de départ réelle) appartient au propriétaire.** Aucun chiffre
n'a été modifié.

---

## E — Nombre de pays : 7 contre 6 contre 9 terrains

### Ce qui est en base aujourd'hui

| Source | Valeur | Lue par le code ? |
|---|---|---|
| `site_settings.covered_countries` | **`7`** | oui → accueil « 7+ Pays habités » |
| `site_settings.stat_countries_lived` | **`6`** | **non — clé morte** |
| zone `a-propos/stat_1_value` | **`7`** | oui, /a-propos |
| zone `home/stats_playgrounds` | **9 terrains** : *Madère · Roumanie · Monténégro · Suisse · Lisbonne · Sicile · Sardaigne · Colombie · Île-de-France* | oui, accueil |

Vérification « clé morte » : `grep -rn "stat_countries_lived"` sur tout le dépôt
(hors `node_modules`, `.git`, `.audit`) → **0 occurrence de lecture**.
`stat_notebooks_published` (constat F) est dans le même cas.

### Traces, datées et attribuées

| Formulation | Occurrence la plus ancienne | Commit | Auteur |
|---|---|---|---|
| « 7 pays habités » (doc) | 2026-05-06 | `68ce768c` | farinhahelder-hue |
| « 7 pays » (code) | 2026-05-06 | `0daccfaa` | farinhahelder-hue |
| « 12 pays, 25 carnets » (compteurs corrigés) | 2026-06-08 | `c9598a5` / `738a0082` | OpenHands / farinhahelder-hue |
| « Après 7 pays habités et non juste visités… » (doc) | 2026-05-16 | `PROMPT_ALLHANDS.md` | openhands |

**La plus ancienne trace est « 7 pays » (2026-05-06).** Mais l'historique montre
aussi un état intermédiaire à **12 pays** (`ROADMAP.md`, 2026-06-08 : « Compteurs
homepage corrigés — 12 pays, 25 carnets »), revenu ensuite à 7.

Aucune occurrence de « 9 pays » ni de « 6 pays » dans l'historique : ces deux
valeurs n'ont jamais été écrites comme revendication, elles viennent de la liste
des terrains (9) et d'un réglage mort (6).

**La décision appartient au propriétaire** : ni 7, ni 6, ni 9 n'est confirmé par
une trace de terrain. Aucun chiffre n'a été modifié.

---

## G — Les 8 articles publiés, avec toutes leurs dates

Instantané du **2026-10-26**, `cms_blog_posts` où `published = true` (**8 lignes** ;
47 brouillons, 55 au total). « Date dans le contenu » = recherche des motifs
`20xx`, « mois AAAA », « depuis AAAA » dans `content`, `excerpt`, `meta_*`,
`voice_notes`.

| # | Article (slug) | Catégorie | `published_at` | `created_at` | `updated_at` | `publish_date` | Date dans le contenu |
|---|---|---|---|---|---|---|---|
| 1 | `transylvanie-secrete-au-dela-dracula` | Carnets Voyage | **2026-05-18 15:02** | 2026-04-17 | 2026-09-29 | 2026-04-17 | « depuis 1999 » (Sighișoara, UNESCO) ; « maison vieille de 200 ans » |
| 2 | `bucarest-hidden-surprend` | Carnets Voyage | **2026-05-18 15:04** | 2026-04-17 | 2026-09-29 | 2026-04-17 | « vieux de plus de 170 ans » (jardins Cișmigiu) |
| 3 | `petite-ceinture-paris-balade-urbaine` | Carnets Voyage | **2026-05-18 15:06** | 2026-04-17 | 2026-09-29 | 2026-04-17 | aucune |
| 4 | `pudim-de-nata-recette` | Découvertes Locales | **2026-05-18 15:08** | 2026-04-17 | 2026-09-29 | 2026-04-17 | aucune |
| 5 | `poncha-recette-authentique` | Découvertes Locales | **2026-05-18 15:09** | 2026-04-17 | 2026-10-23 | 2026-04-17 | aucune |
| 6 | `bacalhau-gomes-sa-recette` | Découvertes Locales | **2026-05-18 15:11** | 2026-04-17 | 2026-09-29 | 2026-04-17 | aucune |
| 7 | `podgorica-capitale-oubliee-montenegro` | Carnets Voyage | 2026-06-02 12:21 | 2026-06-02 | 2026-10-23 | *(vide)* | aucune |
| 8 | `itineraire-slow-travel-roumanie-bucarest-apuseni` | Carnets Voyage | 2026-09-29 23:15 | 2026-09-01 | 2026-10-24 | *(vide)* | aucune |

### Ce que le tableau établit

- **6 des 8 articles** (les #1 à #6) portent exactement la même date de
  publication, le **2026-05-18**, répartie sur ~9 minutes (15:02 → 15:11) : c'est
  une **écriture en bloc**, pas six publications distinctes.
- Ces 6 articles ont tous été **créés le 2026-04-17**, un mois avant leur date de
  publication. La date de publication affichée (18 mai) ne correspond donc pas à
  la date de création (17 avril).
- Seuls deux articles ont des dates cohérentes avec un travail réel :
  `podgorica` (publié et créé le 2026-06-02) et l'`itineraire…roumanie`
  (créé le 2026-09-01, publié le 2026-09-29).
- Les seules dates **dans le contenu** portent sur des **faits de lieu**
  (« Sighișoara est inscrite à l'UNESCO depuis 1999 », « jardins vieux de 170
  ans ») — aucune n'est une date de publication d'article. Il n'y a donc, dans le
  contenu, aucun indice d'une vraie date de publication à rétablir.

**Recommandation de méthode (non appliquée) :** les six dates « 18 mai 2026 »
sont un artefact d'import. Les vraies dates restent inconnues ; les reconstituer
demanderait une décision du propriétaire (ou l'usage des `created_at` comme
approximation assumée). Aucune date n'a été modifiée.

### G-bis — Dates de séjour : ce qui existe déjà, sans invention (ajout du 2026-10-26)

Le propriétaire demande d'afficher la date du **séjour** plutôt que la date de
publication importée. Bonne nouvelle : des traces de séjour existent, mais elles
sont **éparses et non publiées**. Aucune n'a été inventée ; elles sont listées ici.

| Séjour | Date attestée | Où c'est écrit | Publié ? |
|---|---|---|---|
| Stoos (Suisse) | **12 juillet 2025** | carnet `carnet-suisse-stoos-2025` : « *Date constatée : 12 juillet 2025 · 704 photos* » | non (`published = false`) |
| Monténégro | **27 mai 2026** | carnet `carnet-montenegro-mai-2026` : « *Jour 1 — 27/05/2026* » (1 000 photos) | non |
| Madère | « première fois en octobre 2023 » | `content/articles/madere-automne-voyage-couple.mdx` (corps) | oui, mais dans un `.mdx`, pas en base |

**Indices dans les noms de fichiers photo** (aucune EXIF exploitable : les images
publiées n'en portent plus) :

- `public/images/destinations/montenegro/PXL_20260527_180112571…jpg` →
  `2026-05-27`, cohérent avec le carnet.
- `content/articles/stoos-crete-suisse-slow-travel.mdx` référence
  `/images/destinations/suisse/IMG_20250712_154207.jpg` → **2025-07-12**,
  cohérent avec « 12 juillet 2025 ».

**Dates de séjour déclarées dans les en-têtes `.mdx`** (`date:`, qui est une date
de rédaction, pas forcément de séjour) : Madère-automne `2025-09-15`,
Madère-carnet `2024-10-22`, Podgorica `2026-07-01`, Stoos `2025-07-20`.

**Ce qui manque** : six des huit articles publiés (recettes et balades) n'ont
**aucune** date de séjour, ni en base ni dans le contenu. Pour ceux-là, la seule
information disponible est la date de publication importée.

**Ce que le propriétaire doit fournir** : le mois/année du séjour pour chacun des
8 articles publiés (ou au minimum pour les 6 importés en bloc). Tant qu'il ne l'a
pas fourni, on ne peut afficher que la date de publication — ou la masquer.

---

## H — Suisse et Zurich : inventaire (sans trancher)

Relevé du **2026-10-26** (serveur local, avec bypass de maintenance).

### Les URL

| URL | HTTP | Octets | canonical | title | H1 |
|---|---|---|---|---|---|
| `/destinations/suisse` | **200** | 162 517 | `…/destinations/suisse` | « Suisse slow travel \| Guide Heldonica » | « Suisse, les Alpes par leurs crêtes et leurs bains » |
| `/destinations/zurich` | **200** | 161 660 | `…/destinations/zurich` | « Zurich slow travel \| Guide Heldonica » | « Zurich, la Suisse financière et ses villages cachés » |

Les deux figurent au **sitemap**. Le carrousel d'accueil (`cms_home_destinations`)
les a retirées (`is_active = false` pour les deux, id=2 Zurich et id=3 Suisse,
désactivées le 2026-10-21).

### Le contenu (distinct)

- **Suisse** — `meta description` : « Montagnes, lacs, trains impeccables et
  détours qui demandent du temps… ». Corps visible **2 537 caractères**. Axe :
  montagne / Stoos, « le funiculaire le plus raide du monde », crêtes à 2000 m.
- **Zurich** — `meta description` : « Badi flottantes, brasseries artisanales et
  vieille ville dense… ». Corps visible **2 460 caractères**. Axe : ville /
  Limmat, Kunsthaus, vieille ville dense.

Ce ne sont **pas des doublons de texte** : deux sujets différents (un pays, une
ville). Le chevauchement porte sur l'entité géographique (« Suisse » couvre
« Zurich »), pas sur le contenu.

### Les liens internes sortants

Les deux pages émettent **le même jeu de 24 liens internes**, à une exception
près (l'URL du formulaire de contact, qui porte le paramètre de destination) :

```
/  ·  /a-propos  ·  /blog  ·  /blog?categorie=Carnets Voyage
/blog?categorie=Guides Pratiques  ·  /contact  ·  /destinations
/destinations/madere  ·  /destinations/montenegro  ·  /destinations/roumanie
/expert-hotelier  ·  /guides/top-10-pepites-madere  ·  /travel-planning
/mentions-legales  ·  /politique-affiliation  ·  /politique-confidentialite
/auth/login  ·  + favicons/manifeste
```

Différence entre les deux :

| Page | Lien propre |
|---|---|
| `/destinations/suisse` | `/travel-planning-form?destination=suisse` |
| `/destinations/zurich` | `/travel-planning-form?destination=zurich` |

**Aucune des deux pages ne renvoie vers l'autre.** Elles ne se citent pas
mutuellement : un visiteur de l'une ne découvre pas l'autre par un lien interne.

### Rappel (déjà relevé)

`/destinations/suisse-stoos` renvoie **404** alors que la redirection `/suisse`
du middleware (`middleware.ts:18`) pointe vers `/destinations/suisse`.

**Aucune décision prise ici** (fusionner, rediriger ou désindexer).
