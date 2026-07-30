# CMS Foundation — Phase 0 : inventaire d'exécution

**Date :** 2026-07-30
**Branche :** `cms-foundation-phase-0`
**Méthode :** lecture du repo + interrogation directe de l'API REST Supabase de prod (service role) — pas de déduction depuis les fichiers de migration.

---

## 1. Constat n°1 — le dossier `supabase/migrations/` n'est PAS l'état de la base

Aucun workflow CI n'applique les migrations (`.github/workflows/` = `agent-dispatch.yml` + `ai-automation.yml` uniquement, aucun `supabase db push`). Les migrations sont appliquées à la main, donc partiellement.

**Tables déclarées dans le repo mais absentes de la base de prod :**

| Table attendue | Migration présente dans le repo | Existe en prod |
|---|---|---|
| `cms_destinations` | `20260327050811_create_cms_tables.sql` | ❌ |
| `cms_pillar_pages` | `20260719_create_cms_pillar_pages.sql` | ❌ |
| `cms_guide_items` | `20260719_create_cms_guide_items.sql` | ❌ |
| `cms_redirects` | `20260703_cms_redirects.sql` | ❌ |
| `cms_pricing_plans` | `20260704_cms_pricing.sql` | ❌ |
| `cms_testimonials` | `20260703000000_cms_testimonials_checklists.sql` | ❌ |
| `cms_checklist_templates` | `20260703000000_cms_testimonials_checklists.sql` | ❌ |

Ce n'est pas une découverte isolée : la migration `20260625_fix_destinations_view.sql` documente elle-même en commentaire que `20260615_destinations_v2.sql` « n'a pas été appliquée en production ». Le problème est structurel et ancien.

**Conséquence directe : 10 tables référencées par le code sont absentes de la base.** Mesuré automatiquement par `npm run check:cms-drift` (voir §11) :

| Table manquante | Points d'appel | Impact réel |
|---|---|---|
| `cms_pillar_pages` | `/api/cms/pillar-pages`, `lib/pillar-data.ts` | Pages piliers 100 % hardcodées (voir §3) + édition impossible |
| `cms_pricing_plans` | `/api/cms/pricing` | `/admin/pricing` inopérant |
| `cms_redirects` | `/api/cms/redirects` | `/admin/redirects` inopérant |
| `cms_checklist_templates` | `/api/cms/checklist-templates` | inopérant |
| `cms_guide_items` | `/api/cms/guide-items`, **`/guides/top-10-pepites-madere`** | page publique servie depuis `PEPITES_FALLBACK` hardcodé |
| `cms_testimonials` | `/api/cms/testimonials`, **`/temoignages`** | page publique renvoie une liste vide |
| `instagram_scheduled_posts` | `/api/instagram/cron`, `/api/instagram/scheduled`, `lib/instagram.ts` | planification Instagram hors service |
| `jules_sessions` | `/api/jules` | intégration Jules hors service |
| `jules_memory` | `/api/jules` | intégration Jules hors service |
| `media` | `/api/cms/video-assembly` | nom de table probablement erroné (`cms_media` ?) |

Aucune de ces pannes n'est visible côté visiteur : les deux pages publiques concernées dégradent proprement (`catch` → fallback ou tableau vide). C'est précisément ce qui a permis à la dérive de durer des mois.

**Nuance importante sur `/temoignages` :** la page affiche une liste vide *parce que* la table manque. La décision A2 « pas de faux témoignages » ne tient donc pas à un choix de contenu mais à une panne. Créer `cms_testimonials` avec un seed réintroduirait mécaniquement de faux avis → voir question bloquante Q4.

---

## 2. Constat n°2 — le projet Supabase est partagé avec une autre application

69 tables exposées, dont **une trentaine n'appartiennent pas à Heldonica** : `emilie_*` (24 tables : anglais, conjugaison, géométrie, poésies… = application scolaire), `missions`, `reservations_seances`, `test_attachement_results`, `emilie_badges`, `emilie_progression`.

**Règle à graver pour toutes les phases suivantes :** aucune opération globale sur le schéma `public` (pas de `DROP SCHEMA`, pas de boucle `FOR tablename IN information_schema.tables`, pas de RLS appliquée en masse). Toute migration doit nommer explicitement ses tables.

---

## 3. Constat n°3 — les pages piliers ne sont pas pilotées par le CMS

`lib/pillar-data.ts` (22 Ko) expose `fetchPillarData(slug)` qui lit `cms_pillar_pages`. Cette table n'existant pas, la requête échoue systématiquement et retourne `FALLBACK_MAP[slug] || MADERE`.

**Autrement dit : les pages `/destinations/madere`, `/destinations/montenegro`, `/destinations/roumanie` servent aujourd'hui 100 % du contenu hardcodé du fichier TypeScript, à chaque requête.** Le "fallback" est la source de vérité réelle. Le commentaire en tête de fichier (« Source de vérité : table Supabase `cms_pillar_pages` ») est faux.

Effet de bord : le `catch` silencieux masque complètement la panne — aucun log, aucune alerte, la page s'affiche correctement. C'est pour ça que ça n'a pas été vu.

---

## 4. Constat n°4 — 68 pages destinations en dur vs 9 lignes en base

| Surface | Volume |
|---|---|
Pages `app/destinations/**/page.tsx` | 68 fichiers
Lignes dans `destinations` (table) | 9
Lignes visibles sur le hub | **3** (`madere`, `roumanie`, `montenegro` — les seules en `status='published'`)
URLs destinations dans `app/sitemap.ts` | ~68, écrites à la main

Le hub `/destinations` fonctionne déjà côté CMS : `DestinationsClient` → `GET /api/destinations` → vue `destinations_public`. Il filtre sur `status` (`starred` / `published` / `coming_soon`), donc les 6 lignes `draft` ne s'affichent pas. **La décision A2 « hub limité aux entrées fiables » est bien effective en prod — ne pas y retoucher.**

En revanche il y a un vrai décalage éditorial : Sicile, Sardaigne, Portugal, Normandie, Colombie, Île-de-France, Alentejo, Grèce, Zurich, Suisse, Paris, Timișoara existent comme pages réelles, sont dans le sitemap et sont indexables, mais sont **invisibles depuis le hub**. Ce sont des pages orphelines de navigation interne. C'est une décision métier, pas technique → question bloquante n°1 en fin de document.

Décalage inverse à noter : 6 slugs en base (`lisbonne-hors-sentiers`, `suisse-stoos`, `sicile-interieure`, `montenegro-podgorica`, `paris-canal-marais`, `roumanie-transylvanie`) ne correspondent à **aucun** dossier de route ni à aucune entrée de `wordpress-data.ts`. Ils sont en `draft` donc non liés aujourd'hui, mais les passer en `published` produirait directement des 404. À traiter avant toute promotion de statut.

---

## 5. Constat n°5 — plusieurs sources de vérité concurrentes (violation règle 3)

Comptage des références `from('<table>')` dans `app/`, `components/`, `lib/`, `hooks/` :

| Entité | Tables concurrentes | Lignes | Réfs code | Verdict |
|---|---|---|---|---|
| Articles | `cms_blog_posts` | 42 | **72** | ✅ source de vérité |
| | `articles` | 46 | 8 | ⚠️ résiduel (API IA, catégories) |
| | `cmsblogposts` | 3 | **0** | 🗑️ table morte |
| Zones éditables | `cms_editable_zones` | 393 | **6** | ✅ source de vérité (CMS 3.0) |
| | `site_content` | 55 | 3 | ⚠️ résiduel (`/api/cms/content`, `blog-supabase.ts`) |
| | `cms_home_content_zones` | 6 | **0** | 🗑️ table morte |
| Réglages | `site_settings` | 181 | **16** | ✅ source de vérité |
| | `cms_settings` | 43 | **0** | 🗑️ table morte |
| Destinations | `destinations` + vue `destinations_public` | 9 | 10 + 4 | ✅ source de vérité |
| POI | `destination_pois` | 6 (Madère only) | **0** | 🗑️ jamais lue par le front |
| Médias | `cms_media` | 0 | **0** | 🗑️ vide et jamais lue |
| Guides | `travel_guides` | 22 | **0** | ⚠️ 22 lignes orphelines |
| Témoignages | `temoignages` | 5 | **0** | 🗑️ jamais lue (cohérent avec A2) |

**Point important pour la Phase 1 :** le brief demande de créer `cms_destinations`, `cms_pois`, `cms_media_assets`. Or `destinations` (+ sa vue, + son API, + son admin) sert déjà la prod, `destination_pois` existe déjà, et `cms_media` existe déjà. Créer les tables `cms_*` en parallèle **fabriquerait la double source de vérité que la règle 3 interdit**. Recommandation détaillée au §8.

---

## 6. Constat n°6 — les fallbacks visuels

- **`/og-default.jpg` : 242 occurrences** dans `app/`, `components/`, `lib/`, dont **65 des 68 pages destinations** l'utilisent comme `heroImage`. C'est le fallback visuel pauvre principal.
- **`destinations.featured_image` : 9 lignes sur 9 pointent vers `images.unsplash.com`.** Le nettoyage A2 (commit `b96306d`) a traité les `og_image` des articles de blog, pas les images des destinations. Le hub affiche donc aujourd'hui exclusivement des photos de stock.
- 22 références `images.unsplash.com` encore en dur dans le code.
- ⚠️ **Piège identifié :** la migration `20260719_create_cms_pillar_pages.sql`, si on l'applique telle quelle, réinjecte une URL Unsplash (`photo-1570126618953` pour le Monténégro) et deux URLs WordPress legacy (`heldonica.fr/wp-content/uploads/...`). Elle contredit les décisions A2 et ne doit **pas** être appliquée sans correction du seed.
- Autre défaut de cette migration : ses `CREATE POLICY` sont sans garde d'existence → elle plante au second passage. Non idempotente.

---

## 7. Ce qui est déjà en prod et qu'on ne refait pas

- ✅ `cms_editable_zones` — 393 zones sur 17 pages, 15 valeurs vides seulement (96 % rempli). CMS 3.0 Phase 1 solide.
- ✅ `hooks/useContentLoader.ts` + `lib/content-loader.ts` + `/api/cms/zones` — chaîne de lecture des zones fonctionnelle.
- ✅ Hub destinations piloté par `destinations_public` avec filtrage par statut.
- ✅ `site_settings` (181 clés) alimente header, footer, hub, métadonnées.
- ✅ Articles sur `cms_blog_posts` (42 lignes, 72 points d'appel).
- ✅ Décisions A2 : pas de faux témoignages (table `temoignages` non lue), réseaux sociaux confirmés uniquement, anonymat du duo, hub filtré.

---

## 8. Recommandation d'architecture pour la Phase 1

Le brief liste des tables cibles `cms_*`. Confrontées au réel, voici ce que je recommande — l'écart est volontaire et justifié :

| Brief | Recommandation | Raison |
|---|---|---|
| créer `cms_destinations` | **Ne pas créer.** Garder `destinations` + `destinations_public` | Sert déjà la prod (API + hub + admin). Créer une jumelle = 2 sources de vérité (viole règle 3) et casse le hub le temps de la bascule |
| créer `cms_pillar_pages` | **Créer** (migration corrigée, seed sans Unsplash ni URL WP) | Table réellement absente, code déjà écrit pour elle, admin déjà écrit pour elle. Débloque le vrai legacy (`pillar-data.ts`) |
| créer `cms_pois` | **Ne pas créer.** Étendre `destination_pois` (+ FK vers `destinations`) | Table existe, 6 lignes réelles. Elle a juste besoin d'une FK propre et d'être lue par le front |
| créer `cms_places` | **Reporter.** Périmètre non défini | Aucun usage front identifié, aucune donnée. Créer une table vide = dette |
| créer `cms_recipes` | **Reporter.** Voir question bloquante n°3 | Les recettes existent aujourd'hui comme articles de blog (`bolo-do-caco`, `bacalhau-a-lagareiro`, `prego-no-bolo-do-caco`). Extraire une entité dédiée est une décision produit |
| créer `cms_media_assets` | **Ne pas créer.** Utiliser `cms_media` (existe, vide) | Nom différent, besoin identique. Renommer/dupliquer n'apporte rien |
| normaliser `site_settings` | **Ne pas toucher maintenant** | 181 clés, 16 points d'appel, fonctionne. Risque > gain à ce stade |
| consolider zones éditables | **Rien à faire** | Déjà consolidé sur `cms_editable_zones` |

Ajouts que je recommande et qui ne sont pas dans le brief :

1. **Un garde-fou anti-dérive automatisé.** Fait : `npm run check:cms-drift` (§11). C'est lui qui a trouvé 4 des 10 tables cassées que ma lecture manuelle avait manquées.
2. **Retirer les `catch` silencieux** de `fetchPillarData` / `fetchAllPillarData` au profit d'un log d'erreur. Le fallback reste, mais la panne devient visible.
3. **Un CI qui applique les migrations — mais PAS avant d'avoir baseliné l'historique.** ⚠️ Voir l'avertissement ci-dessous.

### ⚠️ Avertissement critique — ne pas brancher `supabase db push` en l'état

C'est le réflexe naturel face à la dérive, et ce serait un incident de production.

87 fichiers de migration existent dans le repo, appliqués de façon partielle et inconnue sur une base **partagée avec une autre application**. Un `supabase db push` naïf rejouerait tout le backlog, dont :

- `20260613_maintenance_ON.sql` et `20260613_120000_maintenance_ON_and_fix_rls.sql` → **basculent le site en mode maintenance**
- `20260527_maintenance_mode.sql`, `20260610000001_maintenance_mode.sql`, `20260611_maintenance_mode_toggle.sql` → idem
- `02_enable_rls.sql`, `20260519_rls_security_fix.sql`, `20260603000000_rls_optimisation_fixes.sql` → réécrivent les policies RLS, potentiellement sur les tables de l'autre application
- `20260406010001_rls_bypass_seed.sql` → désactive des protections
- `EMERGENCY_FIX_20260602.sql` → recrée `site_settings`
- plusieurs `seed_*` → réinjecteraient du contenu, dont les images Unsplash nettoyées en A2

**Ordre correct :** (1) établir la liste exacte des migrations déjà appliquées, (2) baseliner l'historique (`supabase migration repair --status applied` sur les anciennes), (3) archiver les migrations one-shot / dangereuses hors du dossier actif, (4) seulement ensuite brancher le CI. Cette étape demande un accès DB et une validation — elle n'est pas faite dans cette phase.

En attendant, `check:cms-drift` couvre le besoin immédiat : détecter la dérive sans rien appliquer.

---

## 9. Checklist exécutable

### Fait dans cette phase (livré, non appliqué en base)
- [x] Garde-fou anti-dérive `scripts/check-cms-drift.mjs` + `npm run check:cms-drift` — a détecté 4 tables cassées supplémentaires
- [x] Migration `cms_pillar_pages` corrigée : `20260730_cms_pillar_pages_idempotent.sql` — idempotente, seed **sans** URL Unsplash ni WordPress, `ON CONFLICT DO NOTHING`, contenu strictement repris de `lib/pillar-data.ts`. **Fichier écrit, volontairement PAS appliqué en base.**
- [x] Requêtes de validation post-migration : `20260730_cms_pillar_pages_VALIDATION.sql` (8 tests, lecture seule)

### À faire dès validation (non destructif)
- [ ] Appliquer `20260730_cms_pillar_pages_idempotent.sql` puis lancer le fichier de validation
- [ ] Logging des échecs de lecture CMS (suppression des `catch` muets dans `pillar-data.ts`)
- [ ] Migration `destination_pois` : FK `destination_slug → destinations(slug)`, dédoublonnage `latitude/lat` et `longitude/lng`
- [ ] Baseline de l'historique des migrations (préalable obligatoire à tout CI — voir avertissement §8)

### On fait après validation métier (questions §10)
- [ ] Couche data centralisée `lib/cms/` (Phase 2) — l'API cible dépend de la réponse à Q1
- [ ] Bascule des pages piliers sur `cms_pillar_pages` avec fallback conservé (Phase 3)
- [ ] Traitement des images destinations (Phase 4) — dépend de Q2
- [ ] Statut des 12 destinations orphelines du hub (dépend de Q1)

### On ne touche pas maintenant
- ❌ Tables `emilie_*`, `missions`, `reservations_seances` — autre application
- ❌ `site_settings` — fonctionne, 16 points d'appel
- ❌ `cms_editable_zones` — CMS 3.0 validé en prod
- ❌ Filtrage du hub par statut — décision A2 en place
- ❌ Suppression de `wordpress-data.ts`, `pillar-data.ts`, `sub-destinations.ts` — tant que la lecture CMS n'est pas prouvée en preview (règle 8)
- ❌ Slugs des pages publiques existantes (règle 9)
- ❌ Suppression des tables mortes (`cmsblogposts`, `cms_settings`, `cms_home_content_zones`) — Phase 5, après preuve

---

## 10. Garde-fou anti-dérive livré

```bash
npm run check:cms-drift
```

`scripts/check-cms-drift.mjs` scanne tous les `from('<table>')` de `app/`, `components/`, `lib/`, `hooks/` puis interroge l'API REST Supabase pour vérifier que chaque table existe réellement.

- Les dérives déjà inventoriées sont listées dans `KNOWN_DRIFT` : rapportées, mais sans faire échouer le run. Le script est donc utilisable en CI immédiatement.
- Toute dérive **nouvelle** → sortie en code 1 avec le nom de la table et les fichiers fautifs.
- Un `401`/`403` est traité comme « table présente mais RLS bloquante », pas comme une dérive de schéma.

Quand une migration est appliquée, retirer son entrée de `KNOWN_DRIFT` : le script protège alors contre la régression.

État mesuré au 2026-07-30 : **25 tables présentes, 10 dérives connues, 0 dérive nouvelle.**

---

## 11. Questions bloquantes (décisions métier)

**Q1 — Les 12 destinations absentes du hub.** Sicile, Sardaigne, Portugal, Normandie, Colombie, Île-de-France, Alentejo, Grèce, Zurich, Suisse, Paris, Timișoara ont des pages publiées et indexées mais n'apparaissent pas sur `/destinations`. Trois options : (a) les créer en base avec `status='published'` pour les afficher — mais le contenu de leurs pages est mince (fiches de ~56 lignes, 3 « highlights » de 1 à 3 mots) ; (b) les laisser hors hub et les désindexer du sitemap ; (c) les laisser exactement en l'état. Je ne peux pas trancher : ça touche au positionnement « testé sur le terrain ».

**Q2 — Images des destinations.** Les 9 lignes de `destinations` utilisent des photos Unsplash, et 65 pages utilisent `/og-default.jpg`. Y a-t-il un stock de photos réelles (Google Photos, Drive, Supabase Storage) à brancher ? Sinon la Phase 4 ne peut que remplacer un placeholder par un autre, et il faudra choisir entre garder Unsplash ou assumer un traitement graphique sans photo.

**Q3 — Recettes.** `cms_recipes` est au périmètre. Les recettes existent aujourd'hui comme articles de blog. Est-ce qu'on veut une vraie entité recette (ingrédients, temps, schema.org `Recipe`, rattachement à une destination), ou est-ce que les articles suffisent ? Créer la table sans réponse produirait une table vide de plus.

**Q4 — Onglets admin cassés.** `/admin/pricing`, `/admin/redirects`, `/admin/testimonials` pointent vers des tables inexistantes depuis des mois. On crée les tables manquantes (et alors il faut du contenu réel à y mettre — or A2 dit pas de faux témoignages), ou on retire ces onglets du back-office ? Mon avis : retirer `testimonials` (cohérent A2), créer `cms_redirects` (utile SEO, se remplit tout seul), trancher `pricing` selon l'offre B2B réelle.
