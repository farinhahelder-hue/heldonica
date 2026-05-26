# Audit CMS Heldonica v2 — 2026-05-26

## Résumé exécutif
- Score global : 75/100
- Nb de problèmes critiques 🔴 : 4 (Routes API CMS non sécurisées, Usage du type `any`, Mauvaise table SQL `articles` au lieu de `cms_blog_posts`, Robots.txt n'exclut pas `/cms-admin`)
- Nb de problèmes importants 🟠 : 2 (Images sans dimensions, Rendu 50/50 non détecté formellement dans l'UI)
- Nb d'améliorations suggérées 🟡 : 4 (Skeletons manquants, revalidate/ISR absents sur certaines pages, nettoyage console.log de prod, fichiers trop longs)
- Points forts ✅ : Build Next.js 14 passe sans typecheck, de nombreuses erreurs TypeScript levées par tsc, SEO et sitemaps bien configurés globalement.

## 1. Technique
- **Build Next.js & Typecheck** 🔴 : Le build (sans typecheck strict) passe avec succès. En revanche, `npm run typecheck` lève de nombreuses erreurs TypeScript (TS2339, TS2769, TS2345) liées aux types Supabase dans les routes API et des propriétés manquantes dans les composants UI. Une installation des paquets avec `npm install` est requise en premier lieu.
- **Bundle size** : Les bundles sont globalement optimisés, avec `app/cms-admin/travel-planning` étant la plus lourde (First Load JS ~108 kB). Les autres sont en dessous de 100kb.
- **Dynamic Imports** : Les composants lourds comme `RichEditor`, `CarouselEditor`, `CarouselGenerator` et `BlogGenerator` utilisent bien `ssr: false`.
- **TypeScript `any`** 🔴 : Plusieurs routes dans `app/api/cms/` (e.g. `publish-scheduled/route.ts`, `google-photos/route.ts`, `fix-empty-images/route.ts`, `upload/route.ts`, `articles/route.ts`) utilisent le type `any`, contredisant la règle de typage strict.
- **Imports inutilisés** : Pas de problème majeur identifié dans `CmsAdminClient.tsx`, quelques warnings mineurs lors du build sur des paquets obsolètes (`inflight`, `glob`).

## 2. Sécurité
- **`requireCmsAuth()`** 🔴 : Manquant sur plusieurs routes sensibles :
  - `app/api/cms/cloud/idrive/initiate/route.ts`
  - `app/api/cms/cloud/google/callback/route.ts`
  - `app/api/cms/cloud/google/photos/route.ts`
  - `app/api/cms/cloud/google/initiate/route.ts`
  - `app/api/cms/publish-scheduled/route.ts`
  - `app/api/cms/media-storage/route.ts`
- **`handleUnauthorized()`** ✅ : Correctement utilisé côté client (`app/cms-admin/CmsAdminClient.tsx`) pour intercepter les erreurs 401.
- **Variables d'environnement** 🟡 : Certaines variables utilisées dans le code (ex: `CMS_ADMIN_KEY`, `WEBHOOK_CUSTOM`) ne sont pas dans toutes les références croisées.
- **`SUPABASE_SERVICE_ROLE_KEY`** ✅ : N'est utilisé que côté serveur (lib/supabase.ts) via `createServiceClient()`.

## 3. Base de données
- **Incohérence du nom des tables** 🔴 : Le code fait appel à `articles` et `travel_requests` (e.g. `app/api/cms/llm-search/route.ts`, `app/api/cms/articles/route.ts`, `app/dashboard/page.tsx`), alors que les instructions précisent que les tables correctes pour le CMS sont `cms_blog_posts` et `demandes_travel`.
- **Cohérence des migrations** : Les fichiers `supabase/migrations/*.sql` créent bien `cms_blog_posts`, `demandes_travel`, `media_focal_points`, etc., ce qui confirme l'incohérence avec les appels côté code.

## 4. CMS Fonctionnalités
- **Live Preview 50/50** 🟠 : Pas de mention claire du comportement de scission 50/50 avec `debounce` identifiée dans le code source de l'éditeur riche.
- **Cron API** ✅ : Le fichier `publish-scheduled/route.ts` gère la logique de publication automatique, mais doit être sécurisé (actuellement sans `requireCmsAuth` approprié pour un cron sécurisé ou utilise le `CRON_SECRET`).
- **Historique et Revisions** : `article_revisions` est référencé, mais son intégration sur chaque `PUT` nécessite validation manuelle poussée.

## 5. Site public SEO
- **SEO & Méta** ✅ : Les balises de métadonnées sont bien déclarées via `export const metadata` sur presque toutes les pages publiques (ex: `/contact`, `/a-propos`, `/destinations/*`).
- **Images** 🟠 : Le composant `next/image` est utilisé, mais manque de `width` / `height` explicites sur certaines pages (e.g., `app/destinations/madere/page.tsx`, `app/travel-planning/page.tsx`, `components/InstagramFeed.tsx`).
- **Sitemap** ✅ : `app/sitemap.ts` inclut exhaustivement toutes les destinations et sous-destinations statiques.
- **Robots.txt** 🔴 : `/cms-admin`, `/auth`, `/dashboard`, `/panel-manager` ne sont pas explicitement exclus dans le tableau `disallow`, contrairement aux consignes de sécurité/SEO.

## 6. Performance
- **Skeleton Loaders** 🟡 : Utilisés dans `KanbanBoard` et `InstagramFeed`, mais manquants sur des listes lourdes côté CMS (e.g., dashboard d'articles) qui bloquent le rendu.
- **ISR / Revalidate** 🟡 : Présent sur `/blog/page.tsx` et dynamiques, mais pourrait être systématisé sur les pages statiques comme `/contact` ou `/planifier` pour du TTFB optimisé (`export const revalidate = 3600`).

## 7. UX/Accessibilité
- **Contrastes et couleurs** : Le bordeaux Heldonica (`#6b2a1a`) est bien présent dans le CMS.
- **Accessibilité** ✅ : De nombreux `aria-label` sont intégrés sur le Header, Footer, et les boutons de partage.
- **Responsive** : Pas de problème de responsive bloquant à 375px noté en analyse statique.

## 8. Dette technique
- **Logs oubliés** 🟡 : Présence de `console.log` non préfixés par `[CMS]` dans des fichiers liés aux crons et OAuth (`publish-scheduled/route.ts`, `google/callback/route.ts`).
- **Fichiers volumineux** 🟡 : `app/panel-manager/CmsAdminClient.tsx` (1822 lignes), `app/cms-admin/CmsAdminClient.tsx` (1681 lignes) et `MediaLibrary.tsx` (717 lignes) nécessiteraient une segmentation pour plus de maintenabilité.

## Plan d'action priorisé

| Priorité | Problème | Fichier concerné | Effort estimé |
| -------- | -------- | ---------------- | ------------- |
| 🔴 P1 | Sécuriser toutes les routes API CMS (`requireCmsAuth`) | `app/api/cms/*/route.ts` | 1h |
| 🔴 P1 | Exclure les routes internes du crawl dans `robots.txt` | `app/robots.ts` | 15m |
| 🔴 P1 | Corriger les noms de tables Supabase (`articles` -> `cms_blog_posts`, `travel_requests` -> `demandes_travel`) | `app/api/cms/*`, `lib/blog-supabase.ts` | 2h |
| 🔴 P2 | Retirer tous les `any` dans le code TypeScript | `app/api/cms/publish-scheduled/route.ts`, etc. | 2h |
| 🟠 P3 | Ajouter les dimensions aux images Next.js | `app/destinations/*`, `components/*` | 1h |
| 🟡 P4 | Ajouter `export const revalidate = 3600` aux pages statiques (planifier, contact, etc.) | `app/planifier/page.tsx`, etc. | 30m |
| 🟡 P4 | Refactoring des fichiers `CmsAdminClient.tsx` | `app/cms-admin/CmsAdminClient.tsx` | 1j |
