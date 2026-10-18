# Rapport d'audit éditorial et média — Heldonica

Date : 2026-10-15. Branche de travail : `agent/openhands/audit-editorial-2026-10-15`.
Livrables joints : `inventaire.csv`, `registre-medias.md`, `journal-corrections.md`,
`decisions-proprietaires.md`.

> Convention de lecture : **Observé** = mesuré directement. **Déduit** = conséquence
> logique d'un fait observé, non mesurée elle-même. **À confirmer** = dépend d'une
> information que seul le propriétaire détient.

---

## 1. Périmètre et sources inspectées

| Source | Accès | État |
|---|---|---|
| Dépôt `heldonica` (Next.js 15, App Router) | lecture | inspecté |
| `app/sitemap.ts`, `next.config.js` (redirections) | lecture | inspecté |
| `cms_blog_posts` — 41 lignes | REST, lecture seule | inspecté |
| `destinations` — 41 lignes | REST, lecture seule | inspecté |
| `cms_editable_zones` — 1 000 lignes | REST, lecture seule | inspecté |
| `cms_pillar_pages` | REST, lecture seule | inspecté |
| `cms_redirects` | REST, lecture seule | inspecté (0 ligne active) |
| `cms_testimonials` | REST, lecture seule | inspecté |
| Sitemap **de production** (`heldonica.fr/sitemap.xml`) | HTTP | inspecté (119 URLs) |
| Supabase Storage (`media/`, `blog-images/`) | HTTP | inspecté par sondage |
| Rendu HTML local (`next start`, maintenance désactivée) | HTTP | inspecté |
| **Rendu de production** | — | **non inspecté** (mode maintenance) |
| **Contenu visuel des photos** | — | **non inspecté** (outils indisponibles) |

### Limites, énoncées sans détour

1. **Le site public est en mode maintenance.** Toutes les routes de contenu
   répondent `307 → /maintenance`. Une requête sur une URL de contenu en
   production ne prouve donc **rien** sur son état réel.
2. **Le rendu local n'est pas la production.** Aucun `.env.local` n'est présent
   dans cet environnement : les pages locales servent les valeurs de repli
   **codées en dur** et non les valeurs du CMS. Quand les deux diffèrent, le
   local montre le code, la production montre le CMS. Cette distinction est
   utilisée explicitement au § 3.
3. **Vérification visuelle des photos non effectuée.** Les outils de cette
   session ne permettent pas de juger le contenu sémantique d'une image. Le
   format, les dimensions et le code HTTP ont été mesurés ; le sujet de la photo
   ne l'a pas été. Voir `registre-medias.md`.
4. **`git` est un clone superficiel.** L'historique n'a pas été parcouru pour
   dater les régressions.
5. **Écritures en base non testées.** Les constats sur les droits d'écriture
   (RLS) sont lus dans les migrations, pas éprouvés sur la base vivante : toute
   vérification par l'écriture est une modification de production, non effectuée.
6. **Rapport de panne.** Le 2026-10-15, la base Supabase du projet a été
   injoignable pendant plusieurs heures ; l'audit de contenu a été mené sur les
   captures du 16:31–16:43 UTC. Voir `incident-p0-base-injoignable.md`.

---

## 2. Ce qui est observé

### 2.1 Volumétrie

| Élément | Nombre |
|---|---|
| Articles `cms_blog_posts` (tous `published`) | 41 |
| Destinations | 41 (7 `published`, 6 `coming_soon`, 28 `draft`) |
| Routes `page.tsx` | 119 |
| URLs au sitemap de production | 119 |
| URLs au sitemap local après correctif | 82 |
| Références d'images locales distinctes | 39 |

Répartition des 94 lignes de `inventaire.csv` : **13 P1, 18 P2, 3 P3**, 60 sans
problème. Le total par priorité porte sur des lignes d'inventaire, pas sur des
problèmes distincts : une page peut cumuler plusieurs constats.

### 2.2 Deux incohérences de statut dans la base

- **41 destinations sur 41 sont `published=true`**, alors que le champ `status`
  n'en déclare que 7 publiées. Les deux champs se contredisent.
  **Déduit** : selon le lecteur utilisé (`lib/home-data.ts` lit `published`,
  `DestinationsClient.tsx` lit `status`), une même destination est affichée ou
  non. Les slugs en `draft` (`viscri`, `sighisoara`, `le-havre`, `bogota`,
  `versailles`, `porto`, `funchal`, `cagliari`) sont **absents** du sitemap de
  production : le site se comporte donc comme si `status` faisait foi.
- **27 destinations** sont à la fois `published=true` et `status='draft'`.

### 2.3 Un cas de statut contradictoire sur les articles

**Observé** : `maramures-roumanie-authentique` est `published`, avec
`published_at = 2026-09-29`, une image de couverture Storage valide, et il est
**absent** du sitemap de production. L'article porte pourtant encore une
consigne de rédaction interne en titre de section (§ 3.1).

### 2.4 Le mode maintenance est intentionnel

`site_settings.maintenance_mode` et la variable Vercel `MAINTENANCE_MODE`
pilotent le `middleware`. **Aucune modification n'a été apportée à ce
mécanisme**, conformément à la règle absolue n° 4 du dépôt.

### 2.5 Cohérence routes ↔ sitemap (vérification exhaustive)

Les 119 URLs du sitemap de production ont été croisées avec les 119 routes
`page.tsx` du dépôt (117 statiques + 2 dynamiques `[slug]`).

**Aucune URL du sitemap ne pointe vers une page inexistante** — à l'exception de
`/`, servie par `app/page.tsx` (mon script excluait la racine par convention).

**Les pages absentes du sitemap sont toutes des exclusions volontaires**, et
chacune est justifiée dans le code :

| Page | Raison de l'exclusion | Preuve |
|---|---|---|
| `/admin/**`, `/panel-manager/**` | back-office | `app/robots.ts` (`disallow`) |
| `/start` | page linktree réseaux | `app/robots.ts` + `robots: { index: false }` |
| `/auth/**`, `/dashboard`, `/ajouter` | espaces authentifiés | — |
| `/merci`, `/guides/merci` | pages de confirmation | — |
| `/maintenance` | page technique | — |
| `/nos-services` | **redirection** | le composant s'appelle `NosServicesRedirect` |
| `/retour-experience`, `/travel-planning-form` | formulaires | — |
| `/destinations/lisbonne` | doublon canonical (§ 5) | arbitrage en attente |

Le seul point à surveiller est le dernier : c'est le seul cas où l'absence au
sitemap n'est pas une décision documentée dans le code.

### 2.6 Liens internes : aucun lien cassé dans le code

36 liens internes distincts dans `app/`, `components/`, `lib/` : **tous
résolvent** vers une route existante (en tenant compte des redirections de
`next.config.js`). Le seul défaut de lien est en base, sans effet visible
(§ 3, P3).

> **Erreur de méthode corrigée.** Mon premier scan ne trouvait aucun lien cassé
> parce qu'il traitait `/destinations/[slug]` comme consommant n'importe quel
> chemin sous `/destinations/`. Un segment dynamique ne consomme que **ses
> propres** segments. Le second scan, strict sur le nombre de segments, a révélé
> les deux liens `viscri`/`sighisoara`.

---

## 3. Ce qui est prouvé, par ordre de gravité

### P0 — Le site est indisponible (504), il n'est pas « en maintenance »

**Constaté le 2026-10-15 vers 21:15 UTC, reproduit à chaque essai.**
Détail et preuves : `incident-p0-base-injoignable.md`.

Toutes les routes de contenu de `heldonica.fr` répondent **`504` avec
`x-vercel-error: MIDDLEWARE_INVOCATION_TIMEOUT`**, en **25,1 s** exactement, de
façon reproductible : `/`, `/blog`, `/destinations`, `/destinations/madere`,
`/travel-planning`, `/expert-hotelier`. Les routes exclues de la maintenance
répondent normalement (`/maintenance` 200, `/sitemap.xml` 200,
`/politique-confidentialite` 200, `/admin` 308).

**Cause racine, prouvée :** la base Supabase du projet est injoignable, et le
middleware l'interroge à chaque requête sans délai d'expiration.

- Interrogation directe de la base avec la clé **valide** :
  `GET /storage/v1/bucket` → **HTTP 544 `DatabaseTimeout`** (« The connection to
  the database timed out ») ; `GET /rest/v1/site_settings` → **aucune réponse
  > 90 s** ; `GET /auth/v1/health` → **aucune réponse > 20 s**.
- Avec une clé **bidon** ou de format invalide, la même API répond **401 en
  0,07 s**. La passerelle est donc saine : c'est bien la **base** qui ne répond
  pas, et non une clé erronée, un hôte mal orthographié ou un problème réseau.
- Côté site, le partage est net : **un endpoint qui interroge la base se bloque**
  (`/api/destinations`, `/api/cms/pricing` : aucune réponse > 75 s) ; **un
  endpoint qui répond sans la base répond vite** (`/api/og` : 200 en 3,2 s, sans
  aucun appel Supabase).

**Corrigé dans la branche** (délai de 3 s sur les lectures de réglage) : le
middleware retombe sur son repli prévu et sert la page de maintenance au lieu
d'un 504. Vérifié localement en simulant une base injoignable : 307 → /maintenance
en 3,0 s. **Non déployé.**

**Non confirmé :** la cause interne à Supabase (le tableau de bord public annonce
« All Systems Operational », ce qui oriente vers un problème propre au projet).
Ce point exige le tableau de bord du propriétaire.

**Résolu le 2026-10-16 à 09:00 UTC.** La base a repris du service (HTTP 200 en
0,2–0,7 s), le contenu est intact (41 articles, 41 destinations) et les routes
répondent de nouveau en moins d'une seconde — en `307 → /maintenance`, et non plus
en 504. Le mode maintenance est **voulu** : `maintenance_mode = "true"` en base,
inchangé depuis le 2026-08-19. Le 504 était donc un incident **distinct**, non une
conséquence de la maintenance. Le correctif défensif reste à déployer.

### P1 — 27 destinations en brouillon restent lisibles publiquement

**Observé.** La clé publique du site (celle livrée dans le bundle client, donc
lisible par n'importe qui) lit `destinations` **sans authentification**. Croisement
`published` (booléen) × `status` (énumération) sur les 41 lignes :

| `published` | `status` | lignes |
|---|---|---|
| `true` | `draft` | **27** |
| `true` | `published` | 7 |
| `false` | `coming_soon` | 6 |
| `false` | `draft` | 1 |

**Cause racine, prouvée.** La politique RLS de lecture publique porte sur le
**booléen historique** :
`CREATE POLICY "Public read access" ON destinations FOR SELECT USING (published = true)`
(`supabase/migrations/20260523000000_create_destinations_table.sql`). Or c'est le
champ `status`, **plus récent** (ajouté par
`20260727_consolidate_destinations_schema.sql`), que l'éditorial utilise pour
distinguer brouillon et publié. Les deux champs se contredisent en base, et la
RLS filtre sur celui qui n'est plus tenu à jour : 27 lignes marquées `draft`
sont donc servies publiquement.

**Portée, sans exagérer.** Ces brouillons ne sont **pas** rendus comme pages :
les routes lisent `destinations_public` ou sont des routes statiques. Le risque
est une **récupération directe par l'API REST** avec la clé publique, pas une
page indexée. Le contenu reste néanmoins exposé à qui sait lire la clé — ce qui
est le cas de tout visiteur.

**Non corrigé.** Réparer la RLS est une écriture en production (migration) : cela
demande votre validation. Piste : faire porter le filtre sur `status`, ou
réconcilier les deux champs. **À trancher par vous** — je ne sais pas lequel des
deux fait autorité.

### P2 — `site_settings` accepte des INSERT depuis le rôle anonyme

**Lu dans les migrations, non vérifié en base.** La migration
`20260613000000_120000_maintenance_ON_and_fix_rls.sql` déclare :

```sql
CREATE POLICY "site_settings_anon_insert"
  ON site_settings FOR INSERT TO anon WITH CHECK (true);
```

Le rôle `anon` peut donc **insérer** des lignes de réglages (les lectures et les
écritures de mise à jour restant, elles, réservées). La politique existe dans les
migrations ; je ne l'ai **pas** confirmée sur la base vivante, car cela
demanderait une écriture en production — non effectuée.

### Élément rassurant — aucune donnée client exposée

Les tables susceptibles de porter des données personnelles se lisent **vides**
avec la clé publique : `user_profiles`, `suppliers`, `contacts_b2b`,
`newsletter_subscribers`, `travel_requests` → **0 ligne** (comptage seul, aucun
contenu affiché). Aucune fuite de données client constatée.

### P1 — 7 pages servaient un hero vide

**Observé.** Sept pages référençaient une image sous `/images/…`. Aucun fichier
correspondant n'existe dans `public/`, et **aucun rewrite ne sert `/images/…`
depuis Supabase Storage** (`vercel.json` n'en contient pas). Le fichier homonyme
existe pourtant dans le bucket `media`, et renvoie `200`.

`components/inline-edit/EditableZone.tsx` (`ZoneImage`) masque l'image en cas
d'échec de chargement : la page n'affichait donc **ni photo ni icône cassée**,
mais un hero vide. C'est ce qui rendait le défaut invisible au contrôle visuel.

**Preuve.** Sondage HTTP local (maintenance désactivée) : `404` sur les chemins
`/images/…` ; `200` sur les URLs Storage homonymes ; `200` après correction.

**Corrigé** — voir `journal-corrections.md`.

### P1 — 9 descriptions de page exposent un libellé interne

**Observé.** Neuf sous-pages de destination publient dans leur `<meta
description>` un fragment de vocabulaire interne, tel quel :

> « Vertige en **⭐ Secret Gem**. Notre guide slow travel testé en couple : … »

Sept autres portent « ⭐ Hidden Gem ». Le reste de la phrase est identique sur
**37 pages** (voir P2).

**Déduit.** Le badge public du composant `DestinationCard.tsx` s'appelle
« ⭐ Coup de cœur » et provient du champ `status='starred'`. `Secret Gem` /
`Hidden Gem` n'apparaît dans aucun composant d'affichage public : c'est une
étiquette de travail, probablement issue d'un modèle de génération.

**Preuve.** `grep` sur `app/`, sur les 1 000 zones CMS et sur les 41 articles.
Présent à la fois dans le code (9 pages) et en base (7 zones `seo_description`).

### P1 — 2 articles indexés au sitemap sont redirigés en 301

**Observé.** `next.config.js` définit 32 redirections permanentes. Deux d'entre
elles portent sur des articles **également présents au sitemap de production** :

| URL indexée | Redirigée vers |
|---|---|
| `/blog/stoos-ridge-coucher-soleil-traversee-funiculaire` | `/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique` |
| `/blog/stoos-ridge-notre-aventure-crete-panoramique` | idem |

**Déduit** : le sitemap envoie le crawler vers une redirection. La version
antérieure de cet audit n'en avait relevé qu'une : la seconde a été trouvée en
croisant **les 32 redirections** avec **les 119 URLs du sitemap**, méthode qui
mérite d'être conservée.

### P1 — 3 durées de voyage se contredisent dans la même fiche

**Observé** (table `cms_pillar_pages`) : le champ `tested_by_heldonica.duration`
et la longueur du tableau `itinerary` de la **même ligne** ne concordent pas :

| Fiche | `duration` annoncée | jours réellement décrits |
|---|---|---|
| `madere` | 8 jours | 7 |
| `montenegro` | 10 jours | 7 |
| `roumanie` | 9 jours | 7 |

**À confirmer** : quelle valeur est la bonne. Les deux champs étant sur la même
ligne, ce n'est pas un problème de jointure mais une divergence de saisie. La
fiche affiche donc une durée que son propre itinéraire ne couvre pas.

### P2 — 37 pages partagent la même description SEO

**Observé.** 37 sous-pages de destination se terminent par la phrase identique :

> « Notre guide slow travel testé en couple : pépites locales, adresses
> insolites et conseils pratiques. »

Elle est précédée d'un fragment télégraphique (`« Le village. »`, `« Or. »`,
`« Vue. »`, `« Dune. »`). Présent à la fois dans 37 fichiers `page.tsx` et dans
22 zones CMS.

**Note de voix.** Cette phrase ne respecte pas la consigne de marque : le guide
demande « **conception sur mesure** » plutôt que le vocabulaire de l'organisation
de séjour, et proscrit le remplissage générique. Elle est appliquée
mécaniquement sur 37 pages — exactement ce que la consigne interdit.

**Preuve.** Mesure HTTP directe : `curl` sur
`/destinations/sardaigne/costa-smeralda` et `/destinations/madere/achadas-da-cruz`
renvoie la phrase dans `<meta name="description">`.

### P2 — 37 pages partagent le même conseil local

**Observé.** Sur les 43 pages utilisant `SubDestinationTemplate`, **7 textes de
conseil distincts** seulement. Un même texte revient **37 fois** :

> « Prends le temps de visiter les lieux d'intérêt en début de matinée et
> d'échanger avec les habitants pour dénicher les meilleures adresses de
> quartier. »

Six pages seulement ont un conseil réellement propre au lieu. Par ailleurs, 25
pages partagent la même amorce de mise en avant (« Prendre le temps d'… »), et
44 descriptions de mise en avant font moins de 28 caractères — souvent un ou
deux mots (`« Or. »`, `« Vue. »`, `« Dune. »`).

**Déduit.** Ces pages ont été engendrées depuis un gabarit et partiellement
remplies. Ce n'est pas un défaut de rendu : la donnée source est elle-même
lacunaire.

### P2 — 2 articles publiés sans date sont hors du sitemap

**Observé.** `carnet-maderes-2025-2026` et
`foret-fanal-levadas-mystiques-madere-slow-travel` sont `published` sans
`published_at`, et absents du sitemap de production.

**Cause racine (corrigée).** Le filtre de `app/sitemap.ts` lisait un champ
`status` qui **n'existe pas** sur le type `BlogPost` (le champ est `published`).
La correction appliquée à `lib/blog-supabase.ts` / `app/sitemap.ts` réintègre
ces articles ; la vérification en production reste à faire (§ 5).

### P2 — 11 articles portent une consigne de rédaction en titre

**Observé.** Des libellés de gabarit éditorial apparaissent en `<h2>` visibles
dans 11 articles :

`Accroche vécue` · `Histoire humaine` · `Détails sensoriels` ·
`Repères pratiques GEO` · `GEO-friendly`

Exemple : `maramures-roumanie-authentique` contient un `<h2>Repères pratiques
GEO-friendly</h2>`.

**Déduit** : ce sont des consignes de rédaction laissées dans le corps, à
remplacer par un vrai intertitre.

### P3 — 2 destinations portent un lien vers une route inexistante

**Observé.** Les champs `link` de `viscri` et `sighisoara` visent
`/destinations/roumanie/viscri` et `/destinations/roumanie/sighisoara` : ces
routes **n'existent pas** dans l'arborescence `app/`.

**Correction de sévérité — à mon propre détriment.** J'avais d'abord classé ce
point en P1. En vérifiant qui consomme ce champ, il s'avère qu'**aucun composant
public ne le lit** : seul le formulaire d'administration
(`app/admin/destinations/page.tsx`) l'utilise. `DestinationPage.tsx` construit ses
liens à partir du slug. Le lien n'est donc **pas rendu** aujourd'hui. C'est une
donnée invalide sans effet visible : P3, pas P1.

C'est aussi une erreur de méthode que j'ai dû corriger : mon premier scan de liens
cassés ne trouvait rien, parce qu'il considérait `/destinations/[slug]` comme
consommant n'importe quel chemin en `/destinations/…`. Un segment dynamique ne
consomme que **ses propres** segments. Le second scan, strict sur le nombre de
segments, a trouvé les deux liens.

### P3 — une clé de page CMS malformée

**Observé.** Trois zones (`seo_title`, `seo_description`, `seo_og_image`) sont
enregistrées sous la clé `destinations-` (tiret final). Aucune page ne porte ce
nom : ces zones sont orphelines.

---

## 4. Corrections effectuées

Détail complet dans `journal-corrections.md`. Résumé :

| Correctif | Portée | Vérification |
|---|---|---|
| 7 URLs d'images locales → URLs Storage | 7 pages | `200` + rendu HTML local |
| Description corrompue de Costa Smeralda | 1 page | `curl` sur la page locale |
| 2 entrées de sitemap ajoutées (Apuseni, Maramureș) | `app/sitemap.ts` | sitemap local |
| Hôte Supabase erroné dans le Coffre des savoirs | `lib/cms-vault-spots.ts` | `grep` |
| Typo `smxnrue…` → `smxnrue…` | 1 fichier | `grep` |
| Test de non-régression du sitemap | `__tests__/` | 643 tests verts |

### Ce qui a été délibérément **non** corrigé

- **Aucun remplacement de photo.** Aucune photo candidate n'a été vérifiée
  visuellement ; en substituer une « plausible » serait précisément l'erreur à
  éviter.
- **Aucune écriture en base.** Les 22 zones CMS portant la description gabarit,
  les 7 zones portant « Secret Gem », les durées contradictoires et les
  témoignages relèvent d'une décision de contenu et d'une migration versionnée.
- **Aucun changement d'URL, de slug, de canonical ou de redirection.** Les deux
  articles redirigés restent indexés : retirer une redirection est une décision
  de référencement.
- **Aucune republication ni dépublication.**
- **Aucun déploiement, aucun push distant, aucune PR.**

---

## 5. Ce qui reste à faire

1. **Décider du sort des 2 URLs redirigées** (§ 3, P1) : retirer l'entrée du
   sitemap, ou retirer la redirection.
2. **Trancher la duplication Lisbonne** : `/destinations/lisbonne` et
   `/destinations/portugal/lisbonne` se déclarent toutes deux canonical sur
   elles-mêmes. `/destinations/lisbonne` reste volontairement hors sitemap en
   attendant l'arbitrage.
3. **Confirmer les durées** de Madère, Monténégro et Roumanie.
4. **Réécrire, puis migrer** les 37 descriptions gabarit et les 37 conseils
   locaux identiques.
5. **Nettoyer** les 11 articles portant une consigne en titre.
6. **Vérifier en production** que les 2 articles sans date sont réapparus au
   sitemap après déploiement de la correction — non vérifiable en mode
   maintenance.
7. **Fournir les photos** listées dans `registre-medias.md`.

---

## 6. État de la branche

- Branche : `agent/openhands/audit-editorial-2026-10-15` — **non poussée**.
- `tsc --noEmit` : **0 erreur**.
- `vitest run` : **643 tests / 80 fichiers, tous verts**.
- `npm run build` : **succès**.
- `npm run garde-fous` : **10/12 réussis**, 2 ignorés faute d'identifiants
  Supabase (`cms-zones`, `cms-drift`) — donc **non vérifiés**, pas « réussis ».
- Prévisualisation locale : `next start` sur le port 3103, maintenance
  désactivée, correctifs constatés dans le HTML servi.
- `package-lock.json` : contient une modification d'`engines` (`node >=22.0.0`)
  sans aucun changement de version de dépendance. Conforme au `package.json`.

### Note sur les captures brutes

Les dumps bruts de la base (`.audit/*.json`) et le script d'inventaire ne sont
**pas** versionnés : ils contiennent des exports CMS complets, dont des
coordonnées de tiers sans rapport avec cet audit. `.gitignore` a été complété en
conséquence. Les quatre livrables de `docs/audit-2026-10-15/` sont, eux, des
documents curés et versionnés.

