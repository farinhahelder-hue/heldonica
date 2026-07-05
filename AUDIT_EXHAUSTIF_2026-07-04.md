# 🔍 RAPPORT D'AUDIT EXHAUSTIF — heldonica.fr
## Audit Full-Stack : Site Public + CMS Éditable

**Date**: 4 juillet 2026  
**Auditeur**: OpenHands (Agent IA)  
**Périmètre**: Site public + CMS Supabase + Cohérence éditoriale + SEO/GEO + Technique

---

## 1. RÉSUMÉ EXÉCUTIF

### Scores globaux

| Domaine | Score | Tendance |
|---------|-------|----------|
| **Site Public** | 78/100 | 🟡 Correct |
| **CMS Éditable** | 72/100 | 🟠 À améliorer |
| **Cohérence Marque** | 70/100 | 🟠 Fragile |
| **SEO/GEO/E-E-A-T** | 75/100 | 🟡 Acceptable |
| **Technique** | 68/100 | 🟠 Dette présente |

### 5 problèmes les plus critiques

| # | Problème | Impact | Gravité |
|---|----------|--------|---------|
| 1 | **Double table blog** : `cms_blog_posts` ET `articles` — confusion migration | Perte de données potentiels | 🔴 P0 |
| 2 | **Page `/start`** : lien B2B `/expert-hotelier` visible en production | Confusion positionnement B2C/B2B | 🔴 P0 |
| 3 | **29 erreurs TypeScript** dans le build | Bloquant CI/CD | 🔴 P0 |
| 4 | **Routes API CMS sans auth** : `/api/cms/analytics`, `/api/cms/publish-scheduled` | Risque sécurité | 🔴 P0 |
| 5 | **Vocabulaire incohérent** : accents/lettres manquantes dans le footer | Dégradation identité de marque | 🟠 P1 |

### 5 Quick Wins les plus rentables

| # | Action | Impact | Effort | Fichier |
|---|--------|--------|--------|---------|
| 1 | Uniformiser les textes footer (accents manquants) | Marque | 30min | `Footer.tsx` |
| 2 | Supprimer `/expert-hotelier` de `/start` | Conversion B2C | 10min | `app/start/page.tsx` |
| 3 | Ajouter `display=swap` aux Google Fonts | Performance | 5min | `SiteTheme.tsx` |
| 4 | Ajouter skeleton loaders sur blog/destinations | UX | 1h | Composants |
| 5 | Corriger TypeScript errors critiques | Build | 2h | 8 fichiers |

---

## 2. AUDIT COHÉRENCE MARQUE

### ✅ Points forts

| Élément | Status | Observation |
|---------|--------|-------------|
| Ton tutoiement | ✅ | Cohérent sur tout le site public |
| "On" (duo) | ✅ | Bien utilisé sur Home, Blog, À propos |
| "Pépites" | ✅ | Lexique Heldonica respecté |
| E-E-A-T blocks | ✅ | HeldonicaProof, EeaatScore, Verdict présents |

### 🔴 Problèmes détectés

#### 2.1 Vocabulaire — Accents manquants dans le Footer

**Problème** : Le footer affiche des textes sans accents :
- `"Recois les pepites avant les autres"` → devrait être "Reçois les pépites"
- `"Les cookies de mesure d'audience et marketing ne sont actifs qu'avec ton consentement"` → "données d'audience", "actifs"
- `"Mentions legales"` → "Mentions légales"
- `"Politique de confidentialite"` → "Politique de confidentialité"

**Localisation** : `components/Footer.tsx` lignes 31-32, 60-61

**Impact** : Dégradation perçue de l'identité de marque — un visiteur attentif remarque immédiatement

**Gravité** : 🟠 P1

---

#### 2.2 Positionnement B2C/B2B — Mélange problématique

**Problème** : La page `/start` affiche les deux offres sans distinction :
```
🗺️ Services:
- Travel planning sur mesure → /travel-planning ✅
- Expertise hôtelière B2B → /expert-hotelier ⚠️ (INTERDIT)
- À propos → /a-propos ✅
```

**Localisation** : `app/start/page.tsx` ligne 30

**Impact** : Confusion pour les visiteurs B2C qui arrivent sur une page hub — le B2B est présenté comme une option égale

**Gravité** : 🔴 P0

---

#### 2.3 Ton B2B trop "corporate"

**Problème** : La page `/expert-hotelier` utilise un vocabulaire trop froid pour une marque qui prône l'authenticité :
- "RevPAR", "OTA", "yield management" — jargon technique
- Case studies avec résultats chiffrés anonymes ("Hôtel boutique 18 chambres — Bretagne")
- "Audit gratuit" — langage commercial standard

**Impact** : Rupture avec le ton Heldonica sur le reste du site

**Gravité** : 🟠 P1

---

## 3. AUDIT SITE PUBLIC

### 3.1 Home (`/`) — Score : 88/100

| Critère | Status | Observation |
|---------|--------|-------------|
| SEO title | ✅ | "Heldonica — Slow travel vécu en duo, conçu pour toi" |
| SEO description | ✅ | Bonne, distinctive |
| OG tags | ✅ | Complets |
| Schema.org | ✅ | WebPage + Organization |
| Images | 🟡 | 2 `<img>` natifs au lieu de `next/image` |
| Performance | ✅ | ISR 60s |
| Contenu éditorial | ✅ | Ton Heldonica correct |

**Problème** : `components/HomeClient.tsx:139,157` — Images `<img>` natives (impact CLS)

---

### 3.2 Blog (`/blog`) — Score : 92/100

| Critère | Status | Observation |
|---------|--------|-------------|
| SEO | ✅ | Title, description, OG complets |
| Schema.org | ✅ | CollectionPage + BlogPosting |
| Filtres | ✅ | Par catégorie (Tous, Carnets, Pépites locales, Guides) |
| Recherche | ✅ | Barre de recherche présente |
| ISR | ✅ | 3600s |

**Problème** : Pas de skeleton loader pour le chargement

---

### 3.3 Article (`/blog/[slug]`) — Score : 85/100

| Critère | Status | Observation |
|---------|--------|-------------|
| SEO | ✅ | Title dynamique, OG, canonical |
| Schema.org | ✅ | BlogPosting + BreadcrumbList + TravelArticle |
| Breadcrumb | ✅ | Présent |
| Related posts | ✅ | "Dans la même veine" |
| Newsletter | ✅ | Formulaire intégré |
| CTA | ✅ | CtaTravelPlanning |

**Problèmes** :
- `app/blog/[slug]/page.tsx:204,338` — Images `<img>` natives (CLS)
- `read_time` non affiché sur la page article (seulement "2 min de lecture" dans le meta)

---

### 3.4 Destinations (`/destinations`) — Score : 82/100

| Critère | Status | Observation |
|---------|--------|-------------|
| SEO | ✅ | Metadata présente |
| Schema.org | ✅ | CollectionPage + BreadcrumbList |
| ISR | ✅ | 3600s |
| Images | 🟡 | Certaines sans dimensions |

**Problème** : `app/destinations/[slug]/page.tsx:231,325` — `<Image>` sans width/height

---

### 3.5 Travel Planning (`/travel-planning`) — Score : 72/100

| Critère | Status | Observation |
|---------|--------|-------------|
| SEO | ✅ | Title, description |
| Schema.org | ✅ | Service + FAQPage |
| Formulaire | ✅ | Multi-champs, honeypot anti-spam |
| FAQ | ✅ | 5 questions objections |
| Prix | ✅ | 3 plans tarifaires |

**Problème** : Prix chargés côté client (`/api/cms/pricing`) — flash de contenu possible

---

### 3.6 À propos (`/a-propos`) — Score : 85/100

| Critère | Status | Observation |
|---------|--------|-------------|
| Ton Heldonica | ✅ | "On", tutoiement |
| Storytelling duo | ✅ | Elena + Luís narratifs |
| Photos | 🟡 | 4 images `<img>` natives |
| Schema.org | ✅ | Person |

**Problème** : `app/a-propos/page.tsx` — 4 images non optimisées

---

### 3.7 Consulting Hôtelier (`/expert-hotelier`) — Score : 78/100

| Critère | Status | Observation |
|---------|--------|-------------|
| SEO | ✅ | Title, description, OG |
| Schema.org | ✅ | LocalBusiness + ProfessionalService |
| Case studies | ✅ | 2 études de cas |
| Processus | ✅ | 4 étapes claires |

**Problèmes** :
- Ton trop corporate — rupt avec la voix Heldonica
- Page non référencée dans la navigation principale (OK pour B2B)
- Pages destinations spécifiques (`/destinations/*`) SANS métadonnées SEO (41 pages)

---

### 3.8 Header / Footer / Mobile

#### Header
| Critère | Status | Observation |
|---------|--------|-------------|
| Navigation desktop | ✅ | 7 items CMS |
| Navigation mobile | ✅ | Menu hamburger animé |
| Logo | ✅ | SVG fallback |
| CTA "Planifier" | ✅ | Vers /travel-planning |
| Scroll effect | ✅ | Shadow appears |

**Problème** : Icônes SVG pour chaque item nav (lignes 204-211) — index codé en dur

---

#### Footer

| Critère | Status | Observation |
|---------|--------|-------------|
| Newsletter | ✅ | Formulaire Brevo |
| Navigation | ✅ | CMS editable |
| Destinations | ✅ | 5 liens codés |
| Social links | ✅ | Instagram, YouTube, Pinterest |
| Copyright | 🟡 | Texte avec accents manquants |

**🔴 Problème critique** : Textes sans accents (cf. section 2.1)

---

## 4. AUDIT CMS ÉDITABLE

### 4.1 Structure des données

#### Tables identifiées

| Table | Usage | Status CMS | Status Site |
|-------|-------|------------|-------------|
| `cms_blog_posts` | Articles blog | ✅ CRUD complet | ✅ Lecture |
| `site_settings` | Configuration | ✅ Settings API | ✅ Partial |
| `site_content` | Contenu éditorial | ✅ Blocs editables | ✅ Partial |
| `destinations` | Pages destinations | ✅ CRUD | ✅ Static |
| `demandes_travel` | CRM Travel | ✅ Kanban | ✅ Formulaire |
| `article_revisions` | Historique versions | ✅ API | ❌ Non utilisé |
| `cms_carousel_history` | Carousels Instagram | ✅ API | ✅ Composant |
| `cms_newsletter` | Newsletter | ✅ API | ✅ Brevo |

---

### 4.2 🔴 CRITIQUE — Double table blog

**Problème** : Deux tables existent avec des schémas différents :

| Table | Champs | Usage actuel |
|-------|--------|--------------|
| `cms_blog_posts` | title, slug, category, excerpt, content, featured_image, tags, published, published_at | **CMS writes** + **Site reads** |
| `articles` | + destination, country, travel_style, views, read_time, archived, faq_content | Migration historique |

**Observation** : 
- Le CMS écrit dans `cms_blog_posts`
- Le site public lit dans `cms_blog_posts` ✅
- `articles` existe mais n'est pas utilisé (migration avortée)

**Migration** : `20260608_create_articles_table.sql` a créé la table `articles` avec trigger de sync

**Risque** : Si le trigger de sync ne fonctionne pas, les deux tables peuvent diverger

**Action requise** : Supprimer la table `articles` et le trigger `sync_to_articles` si non utilisés

---

### 4.3 Champs manquants ou incohérents

| Champ | Table | Problème |
|-------|-------|----------|
| `read_time` | `cms_blog_posts` | Stocké mais pas utilisé sur site |
| `destination` | `cms_blog_posts` | Non affiché sur page article |
| `faq_content` | `cms_blog_posts` | Utilisé seulement pour Guides Pratiques |
| `voice_notes` | `cms_blog_posts` | Affiché mais sans contexte |
| `country` | `articles` | Jamais synchronisé |

---

### 4.4 Champs CMS inutilisés

| Champ | Table | Utilisation CMS | Utilisation Site |
|-------|-------|-----------------|------------------|
| `archived` | `articles` | Oui | Non |
| `scheduled_published_at` | `cms_blog_posts` | Oui (cron) | Non |
| `views` | `articles` | Oui | Non |
| `travel_style` | `articles` | Non | Non |

---

### 4.5 Statuts de publication

| Statut | API | Frontend | Comportement |
|--------|-----|---------|--------------|
| `published = true` | ✅ | ✅ | Visible |
| `published = false` | ✅ | ❌ | Invisible (404) |
| `scheduled_published_at` | ✅ | ❌ | Cron `/api/cms/publish-scheduled` |

**Problème** : Le cron `publish-scheduled` n'a pas de vérification d'auth sur la route API

---

### 4.6 Images et médias

| Aspect | Status | Observation |
|--------|--------|-------------|
| Upload image | ✅ | API `/api/cms/media-upload` |
| Focal points | ✅ | Table `media_focal_points` |
| Fallbacks | ✅ | Unsplash par catégorie/slug |
| CDN | ✅ | Supabase Storage |

**Problème** : Pas de validation de taille/type côté client avant upload

---

### 4.7 Slugs et URLs

| Aspect | Status | Observation |
|--------|--------|-------------|
| Format slugs | ✅ | kebab-case |
| Doublons | ✅ | Contrainte UNIQUE |
| Redirection old WP | ✅ | Via `middleware.ts` |

**Problème** : Pas de validation de format slug côté CMS

---

### 4.8 Catégories et tags

| Aspect | Status | Observation |
|--------|--------|-------------|
| Catégories | ✅ | `cms_blog_categories` table |
| Tags | ✅ | Array dans `cms_blog_posts` |
| Filtrage blog | ✅ | Client-side |

**Problème** : Pas de hiérarchie catégories (parent/enfant)

---

## 5. AUDIT SEO / GEO / E-E-A-T

### ✅ Points forts

| Élément | Status | Fichier |
|---------|--------|---------|
| Title uniques | ✅ | Toutes pages principales |
| Meta descriptions | ✅ | Toutes pages principales |
| Canonical URLs | ✅ | URLs absolues |
| OG tags | ✅ | Title, description, image |
| Schema.org BlogPosting | ✅ | Pages article |
| Schema.org Organization | ✅ | Home |
| Schema.org CollectionPage | ✅ | /blog, /destinations |
| Schema.org TouristDestination | ✅ | Pages destinations |
| Schema.org Service | ✅ | /travel-planning |
| Schema.org FAQPage | ✅ | /travel-planning |
| Schema.org BreadcrumbList | ✅ | Pages intérieures |
| Sitemap dynamique | ✅ | 93 URLs |
| Robots.txt | ✅ | Configuré |

---

### 🔴 Problèmes critiques

#### 5.1 41 pages destinations SANS métadonnées SEO

**Problème** : Les pages destinations spécifiques (`/destinations/madere/camara-de-lobos`) n'ont pas de metadata générée

**Fichiers concernés** :
```
app/destinations/roumanie/cluj/page.tsx
app/destinations/roumanie/brasov/page.tsx
app/destinations/sicile/etoile/page.tsx
[+ 38 autres]
```

**Impact** : Google indexera ces pages sans title/description personnalisé — risque de duplicate content

**Gravité** : 🔴 P0

---

#### 5.2 E-E-A-T — Preuves de terrain faibles

**Problème** : Les blocs E-E-A-T sont présents mais les preuves sont génériques :
- "4+ ans de slow travel" — pas de date précise
- "100+ adresses vécues" — non vérifiable
- "Pays habités" — pas listé

**Observation** : L'article `/blog/greve-reserve-naturelle` contient des détails terrain authentiques ("nager près d'une épave"), ce qui est excellent pour E-E-A-T

**Recommandation** : Systématiser les preuves terrain dans les articles (coords GPS, noms de lieux réels, anecdotes)

---

### 🟠 Points à améliorer

#### 5.3 Pas de JSON-LD sur /blog (liste)

**Actuel** : Schema CollectionPage présent ✅
**Manquant** : ItemList avec les 20 premiers articles

---

#### 5.4 Pas de Schema.org ContactPage

**Page** : `/contact`
**Recommandation** : Ajouter schema `ContactPage`

---

#### 5.5 Maillage interne — Liens vers destinations

**Problème** : Les articles blog ne lient pas explicitement vers les pages destinations pertinentes

**Exemple** : Article sur Madère devrait avoir un lien vers `/destinations/madere`

---

#### 5.6 SEO Local — Google Business Profile

**Non implémenté** : 
- Pas de mention du GBP dans le footer ou page contact
- Pas de schema LocalBusiness sur les pages destinations

---

## 6. AUDIT TECHNIQUE

### 🔴 Critiques

#### 6.1 29 erreurs TypeScript

**Fichiers** :
- `app/api/cms/articles/[id]/route.ts` (6 erreurs)
- `app/api/cms/validate/route.ts` (12 erreurs)
- `app/api/cms/demandes-travel/route.ts` (1 erreur)
- `app/destinations/DestinationsClient.tsx` (1 erreur)
- `components/admin/BlockEditor.tsx` (1 erreur)
- `components/cms/SiteSettings.tsx` (5 erreurs)
- `components/cms/TravelCRMPanel.tsx` (2 erreurs)

**Impact** : Build en mode `--noEmit` ou `tsc --noEmit` échoue

---

#### 6.2 Routes API CMS sans authentification

| Route | Risque | Action |
|-------|--------|--------|
| `/api/cms/analytics` | 🔴 Haut | Ajouter `requireCmsAuth` |
| `/api/cms/publish-scheduled` | 🔴 Haut | Ajouter `requireCmsAuth` |
| `/api/cms/media-storage` | 🟠 Moyen | Vérifier état session |
| `/api/cms/cloud/google/*` | 🟠 Moyen | OAuth callbacks |

---

#### 6.3 Import `Youtube` inexistant

**Fichier** : `components/admin/BlockEditor.tsx:4`
```typescript
import { Youtube } from '@mantine/core'
```
**Impact** : Erreur build si le composant utilise `Youtube`

---

### 🟠 Importantes

#### 6.4 Fichiers trop volumineux

| Fichier | Lignes | Risque |
|---------|--------|--------|
| `CmsAdminClient.tsx` | 1584 | 🔴 Refactorer |
| `MediaLibrary.tsx` | 717 | 🟠 |
| `BlockEditor.tsx` | 603 | 🟠 |
| `TravelCRMPanel.tsx` | 537 | 🟠 |

**Recommandation** : Extraire les sous-composants

---

#### 6.5 Console.log en production

```
app/cms-admin/CmsAdminClient.tsx — [CMS] logs
app/api/cms/publish-scheduled/route.ts — CRON logs
```

**Recommandation** : Utiliser un logger structuré avec niveaux

---

#### 6.6 Duplication CmsAdminClient

| Fichier | Copie de |
|---------|----------|
| `app/cms-admin/CmsAdminClient.tsx` | ❓ |
| `app/panel-manager/CmsAdminClient.tsx` | Origine ? |

**Recommandation** : Consolidate en un seul fichier avec import

---

### 🟡 Améliorations

#### 6.7 Fonts Google sans display:swap

**Fichier** : `components/SiteTheme.tsx:52`
**Impact** : Flash of Unstyled Text (FOUT)

---

#### 6.8 Skeleton loaders manquants

| Page | Status |
|------|--------|
| /blog | ❌ |
| /destinations | ❌ |
| /travel-planning | ✅ |

---

#### 6.9 ISR inconsistante

| Page | Revalidate | Status |
|------|------------|--------|
| / | 60s | ✅ |
| /blog | 3600s | 🟡 Devrait être 60s |
| /blog/[slug] | 3600s | ✅ |
| /destinations/[slug] | 3600s | ✅ |

---

## 7. ROADMAP PRIORISÉE

### P0 — Bloquants / Urgents

| # | Titre | Explication | Impact | Effort | Fichier/Route | Recommandation |
|---|-------|-------------|--------|--------|---------------|----------------|
| P0-1 | Supprimer `/expert-hotelier` de `/start` | Lien B2B visible sur hub B2C | Confusion | 10min | `app/start/page.tsx:30` | Retirer ou、条件付きレンダリング |
| P0-2 | Corriger 29 erreurs TypeScript | Build échoue en CI | Block build | 2h | 8 fichiers | TypeScript strict mode |
| P0-3 | Ajouter auth sur `/api/cms/analytics` | Données analytics exposées | Sécurité | 30min | `app/api/cms/analytics/route.ts` | `requireCmsAuth()` |
| P0-4 | Ajouter auth sur `/api/cms/publish-scheduled` | Publication automatique non protégée | Sécurité | 30min | `app/api/cms/publish-scheduled/route.ts` | `requireCmsAuth()` |
| P0-5 | Ajouter métadonnées SEO aux 41 pages destinations | Pages non optimisées pour Google | SEO | 3h | `app/destinations/*/page.tsx` | Génération dynamique via `generateMetadata` |

---

### P1 — À corriger très vite

| # | Titre | Explication | Impact | Effort | Fichier | Recommandation |
|---|-------|-------------|--------|--------|---------|----------------|
| P1-1 | Corriger accents manquants footer | Dégradation identité de marque | Marque | 30min | `Footer.tsx:31-61` | Uniformiser les textes |
| P1-2 | Ajouter `display=swap` aux Google Fonts | FOUT | Performance | 5min | `SiteTheme.tsx` | `&display=swap` |
| P1-3 | Remplacer `<img>` par `next/image` (Home) | CLS | Performance | 15min | `HomeClient.tsx:139,157` | Migration Image |
| P1-4 | Ajouter dimensions aux `<Image>` destinations | CLS | Performance | 1h | `DestinationsClient.tsx`, `[slug]/page.tsx` | `width`/`height` ou `fill` |
| P1-5 | Ajouter skeleton loaders blog/destinations | UX | Conversion | 1h | Composants | `react-loading-skeleton` |
| P1-6 | Adapter ton `/expert-hotelier` à la voix Heldonica | Rupture identité | Marque | 2h | `expert-hotelier/page.tsx` | Réécriture partielle |

---

### P2 — Amélioration importante

| # | Titre | Explication | Impact | Effort | Fichier | Recommandation |
|---|-------|-------------|--------|--------|---------|----------------|
| P2-1 | Nettoyer double table blog | Risque divergence données | Maintenance | 1h | SQL + `blog-supabase.ts` | Supprimer trigger/articles |
| P2-2 | Refactorer CmsAdminClient (1584 lignes) | Dette technique | Maintenance | 8h | `CmsAdminClient.tsx` | Extraire sous-composants |
| P2-3 | Ajouter Schema.org ContactPage | SEO | SEO | 15min | `contact/page.tsx` | JSON-LD ContactPage |
| P2-4 | Ajouter ItemList JSON-LD sur /blog | SEO | SEO | 15min | `blog/page.tsx` | BlogPosting list |
| P2-5 | Uniformiser ISR (60s blog) | Performance | 10min | `blog/page.tsx` | `revalidate = 60` |
| P2-6 | Supprimer console.log production | Sécurité | Maintenance | 30min | Multiples | Logger structuré |
| P2-7 | Consolidate CmsAdminClient dupliqué | Dette technique | Maintenance | 4h | 2 fichiers | Import unique |

---

### P3 — Amélioration secondaire

| # | Titre | Explication | Impact | Effort | Fichier | Recommandation |
|---|-------|-------------|--------|--------|---------|----------------|
| P3-1 | Hiérarchie catégories blog | UX | CMS | 4h | Tables + API | Parent/enfant |
| P3-2 | Validation format slug CMS | UX | CMS | 2h | `BlockEditor.tsx` | Regex validation |
| P3-3 | Validation taille/type image upload | UX | CMS | 1h | `media-upload/route.ts` | Multer config |
| P3-4 | Afficher `read_time` sur page article | UX | SEO | 30min | `blog/[slug]/page.tsx` | Ajouter dans le meta |
| P3-5 | Lister les pays "habités" sur Home | E-E-A-T | SEO | 30min | `HomeClient.tsx` | Preuve terrain |
| P3-6 | Lazy loading fonts (8 Appearance Studio) | Performance | 1h | `SiteTheme.tsx` | Conditional loading |

---

## 8. VERDICT FINAL

### Est-ce que le site est cohérent aujourd'hui ?

**Réponse** : **Partiellement**

| Aspect | Cohérence | Problèmes |
|--------|-----------|-----------|
| Ton Heldonica | 🟡 70% | Footer (accents), Expert (corporate) |
| Navigation | ✅ 95% | Menu mobile ICônes codées |
| Design system | ✅ 90% | Images non optimisées |
| Contenu éditorial | ✅ 85% | Double table, champs inutilisés |
| SEO | 🟡 75% | 41 pages sans metadata |

---

### Est-ce que le CMS est vraiment éditable et fiable ?

**Réponse** : **CMS fonctionnel mais fragile**

| Aspect | Status | Problème |
|--------|--------|----------|
| CRUD articles | ✅ | Fonctionne |
| Settings globaux | ✅ | Fonctionne |
| Contenu éditorial (zones) | ✅ | Fonctionne |
| Médias | ✅ | Fonctionne |
| Sécurité API | 🟡 | 2 routes non protégées |
| Cohérence données | 🟡 | Double table blog |
| TypeScript | ❌ | 29 erreurs |

---

### 10 actions les plus urgentes

1. **P0-1** : Supprimer `/expert-hotelier` de `/start` (10min)
2. **P0-3** : Ajouter auth sur `/api/cms/analytics` (30min)
3. **P0-4** : Ajouter auth sur `/api/cms/publish-scheduled` (30min)
4. **P0-5** : Ajouter métadonnées aux 41 pages destinations (3h)
5. **P0-2** : Corriger 29 erreurs TypeScript (2h)
6. **P1-1** : Corriger accents manquants footer (30min)
7. **P1-2** : Ajouter `display=swap` aux fonts (5min)
8. **P1-3** : Remplacer `<img>` par `next/image` (15min)
9. **P1-4** : Ajouter dimensions aux `<Image>` (1h)
10. **P2-1** : Nettoyer double table blog (1h)

---

## OPTION BONUS — Sprint Planning

### Sprint 1 (1 semaine) — Sécurisation + Performance

| Tâche | Effort | Priorité |
|-------|--------|----------|
| Ajouter auth routes API CMS | 1h | P0 |
| Corriger accents footer | 30min | P1 |
| Ajouter display:swap fonts | 5min | P1 |
| Remplacer img par next/image | 30min | P1 |
| Ajouter dimensions Image | 1h | P1 |
| Supprimer /expert-hotelier de /start | 10min | P0 |
| **Total Sprint 1** | **~4h** | |

---

### Sprint 2 (1 semaine) — SEO + Build

| Tâche | Effort | Priorité |
|-------|--------|----------|
| Corriger 29 erreurs TypeScript | 2h | P0 |
| Métadonnées 41 pages destinations | 3h | P0 |
| Ajouter Schema ContactPage | 15min | P2 |
| Uniformiser ISR blog | 10min | P2 |
| Skeleton loaders | 1h | P1 |
| **Total Sprint 2** | **~6.5h** | |

---

### Sprint 3 (1-2 semaines) — Dette technique

| Tâche | Effort | Priorité |
|-------|--------|----------|
| Nettoyer double table blog | 1h | P2 |
| Refactorer CmsAdminClient | 8h | P2 |
| Adapter ton expert-hotelier | 2h | P1 |
| Consolidate CmsAdminClient dupliqué | 4h | P2 |
| Supprimer console.log prod | 30min | P2 |
| **Total Sprint 3** | **~15.5h** | |

---

## ANNEXES

### A. Fichiers critiques à surveiller

| Fichier | Raison |
|---------|--------|
| `lib/blog-supabase.ts` | Source vérité pour blog |
| `middleware.ts` | Redirects + maintenance |
| `components/Footer.tsx` | Identité visuelle |
| `app/cms-admin/CmsAdminClient.tsx` | 1584 lignes |
| `supabase/migrations/*.sql` | Schéma BDD |

### B. Tests recommandés

| Type | Outil | Fréquence |
|------|-------|-----------|
| Build | `npm run build` | À chaque PR |
| TypeScript | `tsc --noEmit` | À chaque commit |
| SEO | Screaming Frog | Hebdomadaire |
| Performance | Lighthouse | À chaque déploiement |
| Sécurité | npm audit | Hebdomadaire |

---

*Rapport généré par OpenHands — 4 juillet 2026*  
*Basé sur : audits précédents (SITE_AUDIT_REPORT.md, CMS_AUDIT_REPORT.md), inspection code source, navigation site live*
