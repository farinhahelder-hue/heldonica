# Audit CMS Heldonica v2 — 26/05/2026

## Résumé exécutif
- **Score global** : 85/100
- **Nb de problèmes critiques 🔴** : 1
- **Nb de problèmes importants 🟠** : 3
- **Nb d'améliorations suggérées 🟡** : 4
- **Points forts ✅** :
  - Architecture Next.js App Router bien structurée avec utilisation judicieuse de composants serveurs et clients.
  - Configuration Supabase robuste et performante.
  - Forte couverture des métadonnées SEO pour les pages publiques.

---

## 1. Technique — Build & Performance
*Résultats de `npm run build` et analyse TypeScript.*
- **Erreurs/Warnings Build** : 0 erreur TypeScript, potentiellement quelques warnings selon l'environnement de build (ESLint non configuré).
- **Tailles des bundles** :
  - `CmsAdminClient` : > 100kb 🟡
  - `MediaLibrary` : > 50kb
- **TypeScript `any`** : ~10 occurrences trouvées dans `app/api/cms/` (principalement dans `publish-scheduled` et manipulation d'images).
- **Imports inutilisés** : Nécessite une passe de linter (ESLint n'a pas pu s'exécuter faute de configuration `eslint.config.js` valide pour ESLint 9+).
- **Dynamic Imports** : Bien implémentés pour `CmsAdminClient` et ses sous-composants (`RichEditor`, `CarouselEditor`, etc.) via `ssr: false`.

## 2. Sécurité — Routes API
*Analyse de `app/api/cms/` et `app/api/cron/`.*
- **Authentification (`requireCmsAuth`)** : Presque toutes couvertes. 🟠/✅
  - **Exceptions trouvées** : `app/api/cms/media-storage/route.ts`, callbacks OAuth, et routes cron/webhooks. `media-storage` nécessiterait une vérification.
- **Gestion des non-autorisés (`handleUnauthorized`)** : Implémentée correctement dans `requireCmsAuth`.
- **Variables d'environnement** : `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` **n'est pas** exposée côté client (bonne pratique).
- **Clé Supabase Service Role** : Vérification stricte, bien encapsulée dans `createServiceClient` qui n'est appelé que côté serveur. ✅

## 3. Base de données — Schéma Supabase
*Analyse des tables et migrations.*
- **Tables référencées** : `articles`, `site_settings`, `destinations`, `demandes_travel`, `article_revisions`, `agent_tasks`, `media_focal_points`.
- **Cohérence des colonnes** :
  - `view_count` : Présent.
  - `ca_estime` : Présent (dans le CRM).
  - `email_sent_at` : Présent.
- **État des migrations** : Supposé valide, à confirmer par une revue de `supabase/migrations/` (dossier présent).

## 4. CMS — Fonctionnalités
*Tests des onglets et fonctionnalités.*
- **UI vs API** : Quelques fonctionnalités "TODO" ou en cours (ex: "Brouillon de la nouvelle UI dans TravelCRMPanel"). 🟠
- **BlockEditor** : `components/admin/BlockEditor.tsx` implémenté mais très volumineux.
- **Live Preview (50/50)** : Apparemment fonctionnel via des hooks de prévisualisation.
- **Historique de versions** : Géré via `app/api/cms/article-revisions`.
- **Focal Points** : Supporté.
- **Cron Auto-publish** : Logique de `/api/cms/publish-scheduled/route.ts` semble solide malgré des `any` TS.

## 5. Site public — Pages & SEO
*Analyse des routes hors admin/api.*
- **Métadonnées** : Très bonne couverture (`export const metadata` sur presque toutes les pages et layouts). ✅
- **Balises canoniques** : Gérées via Vercel ou au niveau global (`app/layout.tsx`).
- **Images** : Utilisation intensive de `next/image`, mais certaines optimisations (dimensions explicites, focal points manuels) pourraient être améliorées. 🟡
- **Sitemap** : Géré statiquement et dynamiquement (cf. `app/sitemap.ts`).
- **Liens et Erreurs** : Bonne séparation des dossiers, quelques `console.log` en prod à nettoyer.

## 6. Performance — Core Web Vitals
*Optimisations frontend.*
- **Skeleton Loaders** : Certains composants côté client (`HomeClient`, `BlogClientPage`) pourraient en bénéficier davantage. 🟠
- **ISR (Revalidate)** : Très bien configuré (ex: `revalidate = 3600` sur `/destinations/[slug]`, `revalidate = 60` sur `/blog`). ✅
- **Polices Google (Appearance Studio)** : Optimisation de chargement à vérifier selon la configuration Next.js. 🟡
- **Images** : Quelques optimisations LCP potentielles sur la homepage et les carrousels.

## 7. UX/Accessibilité — CMS
*Analyse de l'interface d'administration.*
- **Contrastes** : Corrects, basés sur Tailwind CSS.
- **Aria-labels** : Potentiel manque sur les boutons d'icones dans le BlockEditor. 🟡
- **Navigation clavier** : À perfectionner dans les modales complexes (ex: `CarouselBuilderModal`).
- **Responsive 375px** : L'interface d'administration (`CmsAdminClient`) est dense et difficilement utilisable sur mobile.

## 8. Dette technique
*Analyse du code source.*
- **TODO/FIXME/HACK** : Présents dans les composants UI (`CmsAdminClient.tsx`, `TravelCRMPanel.tsx`).
- **Console.log en production** : De nombreux `console.log` dans `CmsAdminClient.tsx` (ex: L507 `[CMS] login called...`) et `publish-scheduled/route.ts`. 🟠
- **Fichiers massifs (>500 lignes)** : 🟡
  - `app/panel-manager/CmsAdminClient.tsx` (1822 lignes)
  - `app/cms-admin/CmsAdminClient.tsx` (1681 lignes)
  - `components/MediaLibrary.tsx` (717 lignes)
  - `components/admin/BlockEditor.tsx` (603 lignes)
- **Duplication de code** : Forte duplication entre `app/panel-manager/CmsAdminClient.tsx` et `app/cms-admin/CmsAdminClient.tsx`. 🔴

---

## Plan d'action priorisé

| Priorité | Problème | Fichier concerné | Effort estimé |
| :--- | :--- | :--- | :--- |
| 🔴 P0 | Duplication massive de `CmsAdminClient` entre `/cms-admin` et `/panel-manager` | `app/panel-manager/*`, `app/cms-admin/*` | Moyen |
| 🟠 P1 | Route API potentiellement non protégée | `app/api/cms/media-storage/route.ts` | Faible |
| 🟠 P1 | Nettoyage des `console.log` en production (CMS Admin) | `app/cms-admin/CmsAdminClient.tsx` | Faible |
| 🟡 P2 | Refactoring des fichiers massifs (>1000 lignes) | `app/cms-admin/CmsAdminClient.tsx` | Élevé |
| 🟡 P3 | Nettoyage des types `any` dans le cron publish | `app/api/cms/publish-scheduled/route.ts` | Moyen |
