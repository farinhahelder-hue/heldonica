# Rapport de migration — 2026-07-28 21:01:44 UTC

## Portée

Application en production (Supabase, projet `smxnruefmrmfyfhuxygq`) des 3 migrations SQL préparées suite à l'audit du 28.07.2026 :

1. `supabase/migrations/20260728_fix_blog_category_taxonomy.sql`
2. `supabase/migrations/20260728_dedupe_stoos_ridge_articles.sql`
3. `supabase/migrations/20260728_fix_maramures_title_typos.sql`

## Méthode

Aucune connexion Postgres directe ni token Supabase Management API n'était disponible dans cet environnement (seulement les clés REST `anon` et `service_role` dans `.env.local`). Les migrations ont donc été appliquées via des requêtes REST `PATCH` avec la clé `service_role` (contourne RLS), en reproduisant exactement les `WHERE`/`SET` des fichiers SQL — logiquement équivalent à une exécution `psql`, mais sans passer par le fichier `.sql` lui-même.

## Sauvegarde préalable

`supabase/backups/20260728-210144.sql` — 30 lignes uniques par table (`articles`, `cms_blog_posts`) couvrant l'union des lignes touchées par les 3 migrations, capturées avant toute modification. Fichier de restauration au format `UPDATE ... WHERE id = ...` (état complet pré-migration, toutes colonnes). Ce n'est pas un dump complet de la base — seulement les lignes à risque.

## Migration 1 — Taxonomie blog

**Avant** (comptage `category`, vu via clé `service_role`, RLS contourné) :
- `articles` : mélange de `Carnets de voyage` (23), `Guides pratiques` (3), `Découverte`/` Découverte`/`Découvertes`/`Coulisses de marque` (4), plus `Découvertes Locales` (12), `City Trips` (1), `Nourriture` (5) déjà corrects/hors-scope.
- Idem pour `cms_blog_posts` avec des volumes proches.

**Action** : normalisation vers `Carnets Voyage`, `Guides Pratiques`, `Découvertes Locales` selon les règles du fichier de migration.

**Résultat** :
- `articles` : 23 lignes → `Carnets Voyage`, 3 → `Guides Pratiques`, 4 → `Découvertes Locales`.
- `cms_blog_posts` : mêmes volumes.

**Validation** : ✅ requête de contrôle sur les anciennes valeurs (`Carnets de voyage`, `Guides pratiques`, `Découverte` et variantes, `Coulisses de marque`) → **0 ligne restante** dans les deux tables.

**Découverte annexe (hors scope de cette migration)** : la clé `service_role` révèle deux catégories supplémentaires non gérées par les 3 onglets de filtre du blog — `City Trips` (1 ligne) et `Nourriture` (5 lignes dans `cms_blog_posts`). Elles n'étaient pas visibles depuis la clé `anon` utilisée lors de l'audit initial (probablement des lignes non publiées ou filtrées par RLS) et n'étaient donc pas dans le périmètre de la migration préparée. **Ces articles resteront invisibles sur `/blog`** (aucun onglet ne correspond) tant qu'une décision n'est pas prise : les rattacher à une catégorie existante, ou créer un nouvel onglet. Signalé mais non corrigé.

## Migration 2 — Dédoublonnage Stoos Ridge

**Action** : passage de `status = 'draft'` et `published = false` pour les 3 slugs doublons (`stoos-ridge-la-crete-pano`, `stoos-ridge-coucher-soleil-traversee-funiculaire`, `stoos-ridge-notre-aventure-crete-panoramique`), dans `articles` et `cms_blog_posts`.

**Résultat** : 3 lignes mises à jour par table (6 au total).

**Validation** : ✅ les 3 doublons sont bien `draft`/`published:false` dans les deux tables ; l'article canonique `stoos-ridge-notre-aventure-sur-la-crete-panoramique` reste `published`/`published:true` — vérifié explicitement pour écarter tout risque de dépublier le mauvais article. Les redirections 301 déjà en place dans `next.config.js` continuent de fonctionner pour les anciens liens.

## Migration 3 — Titre Maramureș

**Action** : correction de `title` (et `seo_title` pour `cms_blog_posts`) sur le slug `maramures-train-moitie-siecle` : « Maramuș : sur les traces du train du demi-siècle » / « Maramures : Sur les traces du Train delle 4h15 » → **« Maramureș : sur les traces du train de 4h15 »**.

**Résultat** : 1 ligne mise à jour par table.

**Validation** : ✅ titre et `seo_title` confirmés identiques et corrects dans les deux tables.

## Statut final

**Toutes les migrations ont réussi et sont validées. Aucun rollback nécessaire.**

## Recommandations de suivi

- Décider du sort des catégories `City Trips` / `Nourriture` découvertes en cours de route (voir ci-dessus).
- Le fichier de sauvegarde `supabase/backups/20260728-210144.sql` doit être conservé tant que le résultat de ces migrations n'est pas confirmé stable en production (au moins un cycle de vérification manuelle sur `/blog`).
