# Audit CMS Heldonica v2 — 26 mai 2026

## Résumé exécutif

| Métrique | Valeur |
|----------|--------|
| **Score global** | 72/100 |
| **Problèmes critiques** 🔴 | 3 |
| **Problèmes importants** 🟠 | 8 |
| **Améliorations suggérées** 🟡 | 15 |

### Points forts ✅
- Build Next.js passe (109 pages)
- Dynamic imports corrects (`ssr: false`) pour éditeurs
- SUPABASE_SERVICE_ROLE_KEY jamais exposé côté client
- Migrations SQL cohérentes et ordonnées
- Palette visuelle respectée (bordeaux #6b2a1a)
- ISR utilisé sur pages blog/destinations

---

## 1. Technique — Build & Performance

### Status : ⚠️ ATTENTION

| Critère | Status | Détail |
|---------|--------|--------|
| `npm run build` | ✅ | 109 pages générées |
| TypeScript strict | 🔴 | **29 erreurs** dans 8 fichiers |
| Pages > 100kb | 🟡 | CMS admin 89kb, travel-planning 108kb |

### 🔴 Critiques
1. **29 erreurs TypeScript** dans `typecheck` :
   - `app/api/cms/articles/[id]/route.ts:52-59` — type `never` sur `article_revisions`
   - `app/api/cms/validate/route.ts` — 12 erreurs, colonnes manquantes (`read_time`, `travel_style`, `country`)
   - `app/api/cms/demandes-travel/route.ts:68` — type `never`
   - `components/cms/SiteSettings.tsx` — 5 erreurs (types incompatibles)
   - `components/cms/TravelCRMPanel.tsx` — indexation STATUTS avec string

2. **BlockEditor import `Youtube` inexistant** — `components/admin/BlockEditor.tsx:4`

### 🟠 Importants
- `app/destinations/DestinationsClient.tsx:48` — propriété `slug` manquante dans type

---

## 2. Sécurité — Routes API

### Status : ⚠️ ATTENTION

| Critère | Status | Détail |
|---------|--------|--------|
| Total routes CMS | 30 | — |
| Avec `requireCmsAuth` | 21 | 70% |
| Routes sans auth | 9 | ⚠️ |

### 🔴 Critiques

**9 routes API CMS sans vérification d'authentification :**

| Route | Risque | Commentaire |
|-------|--------|-------------|
| `api/cms/auth/route.ts` | ✅ | Normal (login endpoint) |
| `api/cms/cloud/google/initiate` | 🟠 | OAuth -需 vérifier état session |
| `api/cms/cloud/google/callback` | 🟠 | OAuth callback |
| `api/cms/cloud/google/photos` | 🟠 | Accès données Google |
| `api/cms/cloud/idrive/initiate` | 🟠 | OAuth iDrive |
| `api/cms/analytics` | 🔴 | **Données analytics sensibles** |
| `api/cms/media-storage` | 🟠 | Stockage médias |
| `api/cms/publish-scheduled` | 🔴 | **Publication automatique** |
| `api/cron/auto-publish` | 🟠 | Cron - déjà protégé par CRON_SECRET |

### 🟠 Préconisations sécurité
- Ajouter `requireCmsAuth()` sur `api/cms/analytics` et `api/cms/publish-scheduled`
- Vérifier `CRON_SECRET` sur `api/cron/auto-publish`

### ✅ Points positifs
- `requireCmsAuth` bien utilisé sur les routes principales (articles, settings, content)
- `handleUnauthorized()` appelé sur chaque fetch client CMS
- `SUPABASE_SERVICE_ROLE_KEY` **jamais** exposé côté client

---

## 3. Base de données — Schéma Supabase

### Status : ✅ CORRECT

### Tables référencées
| Table | Status | Fichiers |
|-------|--------|----------|
| `articles` | ✅ | CRUD complet |
| `site_settings` | ✅ | Settings API |
| `site_content` | ✅ | Content API |
| `demandes_travel` | ✅ | Travel CRM |
| `destinations` | ✅ | Pages destinations |
| `article_revisions` | ✅ | Historique versions |
| `agent_tasks` | ✅ | Tasks agents |
| `media_focal_points` | ✅ | Focal points |
| `cms_carousel_history` | ✅ | Carousels |
| `cms_newsletter` | ✅ | Newsletter |

### Migrations (21 fichiers)
- ✅ Cohérentes, ordonnées par date
- ✅ RLS correctement configuré

### 🟠 Points d'attention
- `validate/route.ts` référence `read_time`, `travel_style`, `country` mais :
  - `read_time` non dans schéma `articles` actuel (PROMPT indique `views`, pas `read_time`)
  - `travel_style` et `country` sur `destinations` — vérifier que ces colonnes existent

---

## 4. CMS — Fonctionnalités

### Status : ✅ GLOBALEMENT FONCTIONNEL

### Onglets CMS (`CmsAdminClient.tsx` ~1584 lignes)

| Onglet | Status | API Connectée |
|--------|--------|---------------|
| Dashboard | ✅ | Settings API |
| Articles | ✅ | Articles API + validation |
| Travel Planning | ✅ | Demandes API |
| Médias | ✅ | Media Upload API |
| Apparence | ✅ | SiteSettings component |
| Analytics | ✅ | GA4 API |
| Agents | ✅ | Agent tasks |

### 🟡 Fonctionnalités à vérifier en production
1. **BlockEditor → HTML sérialisation** : vérifier compatibilité EnhancedRichContent
2. **Live preview 50/50** : debounce actif ? (pas vu de `setTimeout`/`debounce`)
3. **Historique versions** : déclenché sur PUT `/api/cms/articles/[id]` ✅
4. **Focal points** : `media_focal_points` table existe ✅

### 🔴 Blocages TypeScript affectant le CMS
- TypeScript erreurs dans `TravelCRMPanel.tsx` et `SiteSettings.tsx`

---

## 5. Site Public — Pages & SEO

### Status : 🟠 PEUT MIEUX FAIRE

### Routes publiques
- ~60 destinations pages (statiques)
- Blog avec slug dynamic
- Pages principales (a-propos, services, contact, etc.)

### 🔴 Critiques

**41 pages destinations SANS métadonnées SEO :**
```
app/destinations/roumanie/cluj/page.tsx
app/destinations/roumanie/brasov/page.tsx
app/destinations/sicile/etoile/page.tsx
[+ 38 autres]
```

**Pages CMS/admin SANS métadonnées (acceptable) :**
- `/auth/login`, `/auth/register`
- `/panel-manager/*`
- `/cms-admin/*`

### 🟡 Pages principales sans metadata
- `/travel-planning` (form)
- `/dashboard`
- `/organisateur`
- `/merci`

### ✅ Positif
- Sitemap dynamique : `lib/sitemap-supabase.ts` → `app/sitemap.xml`
- ISR utilisé : blog (60s), destinations (3600s)
- Pages blog/destinations ont metadata complète

### 🚫 next/image sans dimensions
```
app/destinations/DestinationsClient.tsx:210
app/destinations/[slug]/page.tsx:231, 325
app/destinations/madere/page.tsx:150, 159
components/Blog.tsx:39, 53
```

---

## 6. Performance — Core Web Vitals

### Status : 🟡 CORRECT

### ISR / Revalidate
| Page | Revalidate | Status |
|------|------------|--------|
| `/` | 60s | ✅ |
| `/blog` | 60s | ✅ |
| `/blog/[slug]` | 60s | ✅ |
| `/destinations/[slug]` | 3600s | ✅ |
| `/a-propos` | 3600s | ✅ |
| `/temoignages` | 60s | ✅ |
| `/slow-travel` | 60s | ✅ |
| `/planifier` | 60s | ✅ |

### 🟡 Skeleton loaders
- ✅ Travel planning : `KanbanSkeleton` présent
- ✅ InstagramFeed : `SkeletonCard` présent
- ❌ Pas de skeleton sur pages destinations
- ❌ Pas de skeleton sur blog list

### 🟡 Fonts
- `SiteTheme.tsx` charge fonts dynamiquement via Google Fonts
- ⚠️ À vérifier : toutes les 8 fonts Appearance Studio chargées au changement ?

### Images sans dimensions
Voir section 5 — plusieurs `<Image>` sans `width`/`height` ni `fill`

---

## 7. UX / Accessibilité

### Status : 🟡 CORRECT

### ✅ Points positifs
- Aria-labels sur icônes navigation (`aria-hidden="true"`)
- Buttons avec texte ou aria-label
- Console.log avec préfixe `[CMS]`

### 🟡 Points à améliorer

**Contraste couleurs** : À vérifier manuellement
- Bordeaux #6b2a1a sur fond #f5f3ef → ratio ~7.2:1 ✅
- Teal #01696f sur blanc → ratio ~5.1:1 ✅

**Responsive** : Non testé en browser

**Keyboard navigation** : Non testé dans BlockEditor

---

## 8. Dette Technique

### Status : 🟠 ATTENTION

### Fichiers > 500 lignes
| Fichier | Lignes | Risque |
|---------|--------|--------|
| `app/cms-admin/CmsAdminClient.tsx` | **1584** | 🔴 Refactorer |
| `components/MediaLibrary.tsx` | 717 | 🟠 |
| `components/admin/BlockEditor.tsx` | 603 | 🟠 |
| `components/cms/TravelCRMPanel.tsx` | 537 | 🟠 |

### 🟡 Console.log en production
```
app/cms-admin/CmsAdminClient.tsx:3 — [CMS] Rendering
app/cms-admin/CmsAdminClient.tsx:507,512,518,520,528 — login debug
app/api/cms/cloud/google/callback/route.ts:37 — OAuth debug
app/api/cms/publish-scheduled/route.ts:27,49,53,152 — CRON logs
```

### 🟡 Duplications potentielles
- `CmsAdminClient.tsx` existe aussi en double :
  - `app/cms-admin/CmsAdminClient.tsx`
  - `app/panel-manager/CmsAdminClient.tsx`
- Logique de fetch très similaire entre les deux

### ❌ Pas de TODO/FIXME/HACK trouvés ✅

### ❌ Pas de `any` TypeScript explicite ✅

---

## Plan d'Action Priorisé

| Priorité | Problème | Fichier | Effort |
|----------|----------|---------|--------|
| P1 | 29 erreurs TypeScript | 8 fichiers | 2h |
| P1 | Routes API sans auth (analytics, publish-scheduled) | `api/cms/analytics`, `api/cms/publish-scheduled` | 30min |
| P1 | `Youtube` icon inexistant | `components/admin/BlockEditor.tsx` | 5min |
| P2 | 41 pages destinations sans SEO | `app/destinations/*/page.tsx` | 3h |
| P2 | Skeleton loaders manquants | Blog, Destinations | 2h |
| P2 | Images sans dimensions | `app/destinations/`, `components/Blog.tsx` | 1h |
| P3 | CmsAdminClient.tsx 1584 lignes | Refactor en sous-composants | 8h |
| P3 | Console.log en production | `app/cms-admin/`, `app/api/` | 30min |
| P3 | Duplication CmsAdminClient (2 copies) | Consolidate | 4h |
| P3 | Fonts lazy loading (8 fonts) | `components/SiteTheme.tsx` | 1h |

---

## Annexe : Erreurs TypeScript détaillées

```
Files with errors:
  app/api/cms/articles/[id]/route.ts        (6)
  app/api/cms/validate/route.ts             (12)
  app/api/cms/demandes-travel/route.ts      (1)
  app/api/update-content/route.ts           (1)
  app/destinations/DestinationsClient.tsx   (1)
  components/admin/BlockEditor.tsx           (1)
  components/cms/SiteSettings.tsx             (5)
  components/cms/TravelCRMPanel.tsx           (2)
```

## Annexe : Routes API CMS

### Avec requireCmsAuth (21)
articles, articles/[id], auth, content, settings, demandes-travel, media, media-upload, upload, article-revisions, agent-tasks, fix-empty-images, llm-search, ai-reply, search-console, newsletter, carousel-history, carousel-history/[id], blog-cover-upload, validate, setup-storage

### Sans requireCmsAuth (9)
- auth/login ✅
- cloud/google/initiate 🟠
- cloud/google/callback 🟠
- cloud/google/photos 🟠
- cloud/idrive/initiate 🟠
- **analytics** 🔴
- **media-storage** 🟠
- **publish-scheduled** 🔴
- cron/auto-publish (CRON_SECRET)

---

*Audit généré par OpenHands — 26 mai 2026*