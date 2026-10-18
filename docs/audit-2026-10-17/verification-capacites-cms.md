# Vérification des capacités du CMS — constats mesurés

**Date** : 2026-10-17. **Objet** : vérifier l'état réel des capacités du CMS, et
distinguer ce qui **fonctionne**, ce qui **est cassé**, et ce qui **n'existe qu'en
code**.

> **Règle de lecture.** Chaque affirmation porte une étiquette : **MESURÉ**
> (reproductible avec la commande citée), **DÉDUIT** (hypothèse cohérente, non
> prouvée), **À CONFIRMER** (décision ou fait que je ne peux pas établir).

---

## 1. Méthode

| Source | Comment |
|---|---|
| Tables référencées | `grep -rhoE "from\('[a-z_]+'\)"` sur `app/ components/ lib/ hooks/` → 50 tables |
| Existence en base | `GET /rest/v1/<table>?select=*&limit=0` + `Prefer: count=exact` (clé service) |
| Routes API | 131 `route.ts` sous `app/api/**` |
| Appels du back-office | extraction des `fetch('/api/…')` des 27 sections de `CmsAdminClient.tsx` |
| Comportement public | `curl` sur `https://www.heldonica.fr` (le site **n'est pas** en maintenance) |

---

## 2. Constat A — 10 tables référencées par le code sont absentes de la production

**MESURÉ** (HTTP 404 sur l'API REST) :

| Table absente | Référencée par | Conséquence |
|---|---|---|
| `cms_accommodations` | `lib/cms-hospitality.ts` | section « Hébergements B2B » inerte |
| `cms_api_tokens` | `lib/cms-tokens.ts` | section « Jetons » inerte |
| `cms_releases` | `lib/cms-releases.ts` | section « Publications » inerte |
| `cms_audit_log` | `lib/cms-audit.ts` | **aucune trace d'audit des écritures CMS** |
| `cms_post_revisions` | `lib/cms-revisions.ts` | historique de révision indisponible |
| `cms_webhooks` | `lib/cms-webhooks.ts` | webhooks inactifs |
| `cms_webhook_deliveries` | `lib/cms-webhooks.ts` | idem |
| `cms_zone_variants` | `lib/cms-targeting.ts` | variantes de zone inactives |
| `photo_blocks` | `app/api/cms/photos/upload/route.ts` | blocs photo indisponibles |
| `media` | `app/api/cms/video-assembly` | nom de table erroné (confond `storage.from`) |

La migration qui les crée existe et **n'est pas appliquée** :
`supabase/migrations/20261011120000_create_cms_backoffice_tables.sql` (écrite le
11/10). Le garde-fou `check:cms-drift` les connaît et ne fait donc pas échouer la CI.

**Conséquence directe la plus grave : l'absence de `cms_audit_log` signifie qu'aucune
écriture via le CMS n'est journalisée.** C'est ce qui rend le constat C (§4) non
traçable.

---

## 3. Constat B — deux sections du back-office appellent des routes qui n'existent pas

**MESURÉ** — l'appel est fait côté client, la route est absente côté serveur, la
production répond **HTTP 404** :

| Section du CMS | Appel | Route serveur | Réponse prod |
|---|---|---|---|
| Hébergements B2B | `/api/cms/hospitality/accommodations` | absente | **404** |
| Jetons & Publications | `/api/cms/tokens` | absente | **404** |
| Jetons & Publications | `/api/cms/releases` | absente | **404** |
| Jetons & Publications | `/api/cms/releases/[id]/publish` | absente | **404** |
| Contrôle des agents | `/api/cms/agent-tasks` | absente | **404** |

Les tables manquantes (§2) **et** les routes manquantes (§3) : ces sections ne
peuvent pas fonctionner, à deux niveaux. **MESURÉ** : sur les 65 appels
`/api/cms/*` du back-office, **55 aboutissent** à une route existante, **5 non**
(le reste étant des faux positifs de mon extraction, corrigés après vérification
fichier par fichier).

**Section « Journal d'activité »** : elle appelle `getRecentAuditLogs()`
(`lib/cms-audit.ts`) → `cms_audit_log`, table absente. La section s'ouvre et affiche
une erreur de chargement. **DÉDUIT** : elle n'affichera rien tant que la table
n'existe pas.

---

## 4. Constat C — cinq témoignages sont publiés alors qu'une migration les avait désactivés

C'est le constat le plus sensible. Je le présente **fait par fait**.

### 4.1 Ce qui est mesuré

| # | Fait | Preuve |
|---|---|---|
| 1 | `cms_testimonials` **existe** et contient **5 lignes**, toutes `is_active = true` | REST `?select=name,is_active` |
| 2 | Elles ont été **créées le 2026-08-19** et **modifiées le 2026-10-14** | colonnes `created_at` / `updated_at` |
| 3 | La migration `20260819140000_editorial_voice_and_testimonials_alignment.sql` **a bien été appliquée** | sa 2ᵉ instruction a réécrit `home.hero_tagline` ; la valeur en base correspond **caractère pour caractère** |
| 4 | Cette migration s'intitule « Désactivation des faux témoignages de démonstration » et exécute `UPDATE cms_testimonials SET is_active = false WHERE is_active = true` | fichier, lignes 10-13 |
| 5 | Les **identités** actuelles sont **identiques** au seed du 03/07 : mêmes noms, mêmes villes, mêmes destinations | comparaison ligne à ligne |
| 6 | Les **textes** actuels **diffèrent** du seed et **n'existent nulle part dans le dépôt** | `grep` sur tout le repo (hors `node_modules`) : 0 occurrence |
| 7 | `Marie` → `Marie & Antoine` ; `Jean-Luc` → `Jean-Luc & Élodie` | REST |
| 8 | La page `/temoignages` les **rend publiquement** | `curl` : les 5 noms sont dans le HTML, HTTP 200 |
| 9 | Le site **n'est pas en maintenance** (`maintenance_mode = false`) | `site_settings` ; `/` répond 200 |
| 10 | `/temoignages` est **dans le sitemap** | `app/sitemap.ts:488` |
| 11 | **Aucune trace d'audit** : `cms_audit_log` n'existe pas | HTTP 404 |

### 4.2 Ce que j'en déduis — et que je ne peux pas prouver

**DÉDUIT** : le 2026-10-14, quelqu'un a **réécrit les 5 textes et réactivé** les 5
témoignages. Le texte n'étant présent dans aucun fichier, l'écriture est passée par
le **CMS** (`components/admin/TestimonialsManager.tsx` édite bien `is_active`), pas
par une migration. C'est cohérent avec la règle absolue n° 2 du dépôt (« toute
écriture en base passe par une migration versionnée »), qui aurait donc été enfreinte
ici.

**Ce que je ne peux pas établir** :

- **Qui** l'a fait : aucune table d'audit, aucun commit, aucune migration.
- **Pourquoi** : intention inconnue.
- **Si ces 5 clients sont réels.** Techniquement indécidable depuis ce poste.

### 4.3 L'élément qui empêche de conclure

Les identités (noms, villes, destinations) sont **celles du seed de démonstration du
03/07**. Un seed de démonstration sert, par construction, à peupler une base vide.

**Mais** « même nom et même ville que le seed » **ne prouve pas** que le client
n'existe pas : la personne a pu conserver les noms et réécrire les textes parce que
ces clients **existent vraiment**, et que les textes du seed, eux, étaient inventés.

Les deux lectures sont compatibles avec les faits mesurés. **Je ne tranche pas** :
c'est votre décision, pas la mienne.

### 4.4 Ce qui est vérifiable, en revanche

- Les textes publiés **ont bien été désactivés** comme faux le 19/08, puis **remis en
  ligne** le 14/10.
- Le formulaire `/retour-experience` existe et permet à un client réel de déposer un
  avis (`source = 'manual'`, `is_active` à confirmer par le back-office).

---

## 5. Ce qui fonctionne — mesuré

| Capacité | État | Preuve |
|---|---|---|
| Zones de texte (`cms_editable_zones`) | **OK** — 2 595 zones | API 200, 475 754 octets |
| Articles (`cms_blog_posts`) | **OK** — 55 articles | API 401 (protégée), table 55 lignes |
| Médias (`cms_media`) | **OK** — 160 médias | table |
| Réglages (`site_settings`) | **OK** — 207 clés | API 200 |
| Piliers (`cms_pillar_pages`) | **OK** — 3 piliers | API 200, 37 670 octets |
| Témoignages (`cms_testimonials`) | **OK techniquement** — 5 lignes (voir §4) | API 200 |
| Guides pépites (`cms_guide_items`) | **OK** — 10 entrées | API 200 |
| Sous-destinations (`cms_sub_destinations`) | **OK** — 35 lignes | table |
| Catégories, saisons, carrousels, cartes, checklists | **OK** | tables présentes |
| Écriture CMS | **protégée** — `requireCmsAuth`, session HMAC | 401 sans session |

**Note** : 11 des 20 endpoints testés renvoient **401 sans session** — c'est le
comportement attendu d'une route protégée, pas une panne. Je n'ai pas ouvert de
session CMS, donc je n'ai pas exercé ces routes en écriture.

---

## 6. Limites de cette vérification

- **Je n'ai pas ouvert le back-office dans un navigateur** : mes constats viennent du
  code, de la base et de la production, pas de la manipulation de l'interface.
- **Je n'ai testé aucune écriture** : je n'ai pas créé, modifié ni supprimé de
  contenu. Les 5 appels 404 sont des lectures.
- **Aucun test de bouton** : je n'affirme pas que « Enregistrer » fonctionne ou non.
- Je ne peux pas dire ce que « Claude Code » avait pour consigne, ni ce qu'il a livré
  au-delà de ce qui est présent dans le dépôt et la base.

---

## 7. Décisions qui vous reviennent

1. **Les 5 témoignages (§4)** — sont-ils des clients réels ? Trois issues :
   (a) réels → les garder, et **enfin** les écrire par migration versionnée ;
   (b) fictifs → les repasser en `is_active = false`, comme le 19/08 ;
   (c) incertain → les désactiver le temps de vérifier avec les intéressés.
   **Je n'ai touché à rien.**
2. **Les 10 tables absentes (§2)** — appliquer
   `20261011120000_create_cms_backoffice_tables.sql` ? Elle est idempotente et sans
   seed, mais c'est une écriture en production, donc à vous de valider.
3. **Les 2 sections inertes (§3)** — appliquer la migration **et** écrire les 5 routes
   API manquantes, ou retirer ces sections du back-office.
4. **L'audit des écritures** — sans `cms_audit_log`, aucune écriture CMS n'est
   traçable. C'est ce qui a rendu le constat C impossible à attribuer.
