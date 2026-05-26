# Audit Site Public heldonica.fr

**Date :** 26 mai 2026  
**Score global : 78/100**

---

## Résumé exécutif

| Catégorie | Nb | Status |
|-----------|-----|--------|
| Problèmes critiques 🔴 | 4 | Bloquants SEO ou UX |
| Problèmes importants 🟠 | 7 | Impact significatif |
| Améliorations 🟡 | 12 | Quick wins |
| Points forts ✅ | 15 | — |

### Points forts ✅
- **SEO metadata** : Page d'accueil, blog, destinations avec metadata complète
- **Schema.org JSON-LD** : BlogPosting, Organization, BreadcrumbList sur pages clés
- **ISR** : revalidate configuré sur blog (60s), destinations (3600s), a-propos
- **Canonical URLs** : Tous les canonicals pointent vers URLs absolues correctes
- **OG Tags** : OpenGraph complet sur page d'accueil et blog
- **Header/Footer** : Composants partagés et cohérents
- **Lexique Heldonica** : "bons plans" → "pépites" bien remplacé
- **Pas de placeholder** : Aucun Lorem ipsum ou texte placeholder
- **Breadcrumb** : Composant présent sur blog et destinations
- **Responsive** : Classes Tailwind md:/sm: utilisées correctement

---

## Rapport par page

### / (Home) — Score : 88/100

**URL :** `/`  
**Fichier :** `app/page.tsx` + `components/HomeClient.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title unique | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - og:title/description | ✅ | — | — | — |
| SEO - og:image | ✅ | URL absolue | — | — |
| SEO - canonical | ✅ | — | — | — |
| SEO - H1 unique | ✅ | — | — | — |
| SEO - hiérarchie H1>H2>H3 | ✅ | — | — | — |
| Schema.org JSON-LD | ✅ | WebPage + Organization | — | — |
| Contenu - ton Heldonica | ✅ | — | — | — |
| Contenu - lexique | ✅ | — | — | — |
| Images - next/image | 🟡 | Utilise `<img>` natif | `HomeClient.tsx:139,157` | Remplacer par next/image |
| Images - alt text | ✅ | — | — | — |
| Performance - ISR | ✅ | revalidate=60 | — | — |
| Performance - fonts | 🟡 | Google Fonts sans display:swap | `SiteTheme.tsx:52` | Ajouter `&display=swap` |
| UX - Header/Footer | ✅ | — | — | — |
| UX - CTA | ✅ | Liens vers /travel-planning | — | — |
| Contraste couleurs | ✅ | Bordeaux sur blanc > 4.5:1 | — | — |

**🟡 Points à améliorer :**
- `components/HomeClient.tsx:139,157` : Images `<img>` au lieu de `next/image`
- `components/SiteTheme.tsx:52` : Fonts Google sans `display=swap`

---

### /blog (Liste) — Score : 92/100

**URL :** `/blog`  
**Fichier :** `app/blog/page.tsx` + `components/BlogClientPage.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title unique | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - og:title/description | ✅ | — | — | — |
| SEO - og:image | ✅ | — | — | — |
| SEO - canonical | ✅ | — | — | — |
| SEO - H1 | ❓ | Vérifier H1 unique | — | — |
| Schema.org | 🟡 | Pas de JSON-LD sur liste | — | Ajouter CollectionPage schema |
| Contenu - lexique | ✅ | — | — | — |
| Images - next/image | ✅ | — | — | — |
| Performance - ISR | ✅ | revalidate=60 | — | — |
| UX - Header/Footer | ✅ | — | — | — |
| UX - Breadcrumb | ✅ | — | — | — |

---

### /blog/[slug] (Article) — Score : 85/100

**URL :** `/blog/[slug]`  
**Fichier :** `app/blog/[slug]/page.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title unique | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - og:title/description | ✅ | — | — | — |
| SEO - og:image | ✅ | — | — | — |
| SEO - canonical | ✅ | — | — | — |
| SEO - H1 unique | ✅ | — | — | — |
| Schema.org BlogPosting | ✅ | — | — | — |
| Schema.org BreadcrumbList | ✅ | — | — | — |
| Contenu - ton Heldonica | ✅ | — | — | — |
| Images - next/image | ❌ | `<img>` natif ligne 204, 338 | `app/blog/[slug]/page.tsx:204,338` | Remplacer par next/image |
| Performance - ISR | ✅ | revalidate=60 | — | — |
| Performance - fonts | 🟡 | Google Fonts sans display:swap | `SiteTheme.tsx:52` | Ajouter `&display=swap` |
| UX - Header/Footer | ✅ | — | — | — |
| UX - Breadcrumb | ✅ | — | — | — |
| Navigation - liens retour | ✅ | — | — | — |

**🔴 Problème critique :**
- `app/blog/[slug]/page.tsx:204,338` : Images `<img>` au lieu de `next/image` (2 occurrences)
  - Impact SEO : CLS (Cumulative Layout Shift) possible
  - Impact Performance : pas d'optimisation automatique

---

### /destinations (Liste) — Score : 85/100

**URL :** `/destinations`  
**Fichier :** `app/destinations/page.tsx` + `components/DestinationsClient.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title unique | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - og:image | ✅ | — | — | — |
| SEO - canonical | ✅ | — | — | — |
| Schema.org BreadcrumbList | ✅ | — | — | — |
| Schema.org CollectionPage | ✅ | — | — | — |
| Images - next/image | ✅ | — | — | — |
| Images - dimensions | 🟡 | `DestinationsClient.tsx:210` sans width/height | `components/DestinationsClient.tsx:210` | Ajouter dimensions |
| Performance - ISR | ✅ | revalidate par défaut | — | — |
| UX - Header/Footer | ✅ | — | — | — |
| UX - Breadcrumb | ✅ | — | — | — |
| Données - destinations complètes | 🟡 | À vérifier en production | — | — |

---

### /destinations/[slug] (Destination) — Score : 82/100

**URL :** `/destinations/[slug]`  
**Fichier :** `app/destinations/[slug]/page.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title unique | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - og:title/description | ✅ | — | — | — |
| SEO - og:image | ✅ | — | — | — |
| SEO - canonical | ✅ | — | — | — |
| SEO - H1 unique | ✅ | — | — | — |
| Schema.org TouristDestination | ✅ | — | — | — |
| Schema.org BreadcrumbList | ✅ | — | — | — |
| Images - next/image | ❌ | `<Image>` lignes 231, 325 sans dimensions | `app/destinations/[slug]/page.tsx:231,325` | Ajouter width/height |
| Performance - ISR | ✅ | revalidate=3600 | — | — |
| Performance - fonts | 🟡 | Google Fonts sans display:swap | `SiteTheme.tsx:52` | Ajouter `&display=swap` |
| UX - Header/Footer | ✅ | — | — | — |
| UX - Breadcrumb | ✅ | — | — | — |
| UX - liens retour | ✅ | — | — | — |

**🔴 Problème critique :**
- `app/destinations/[slug]/page.tsx:231,325` : `<Image>` sans width/height (CLS)

---

### /travel-planning — Score : 72/100

**URL :** `/travel-planning`  
**Fichier :** `app/travel-planning/page.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - canonical | ✅ | — | — | — |
| SEO - H1 | ✅ | — | — | — |
| Schema.org | ❌ | Aucun JSON-LD | — | Ajouter Service schema |
| Contenu - lexique | ✅ | — | — | — |
| Images - next/image | ✅ | — | — | — |
| Performance - ISR | ✅ | revalidate=60 | — | — |
| Performance - fonts | 🟡 | Google Fonts sans display:swap | `SiteTheme.tsx:52` | Ajouter `&display=swap` |
| UX - Header/Footer | ✅ | — | — | — |
| UX - Breadcrumb | ✅ | — | — | — |
| UX - CTA | ✅ | Formulaire contact | — | — |

**🟠 Problème important :**
- `app/travel-planning/page.tsx` : Pas de Schema.org Service ou FAQ

---

### /contact — Score : 85/100

**URL :** `/contact`  
**Fichier :** `app/contact/page.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - og:image | ✅ | — | — | — |
| SEO - canonical | ✅ | — | — | — |
| SEO - H1 | ✅ | — | — | — |
| Schema.org | 🟡 | ContactPage possible | — | Ajouter ContactPage schema |
| Formulaire - labels | ✅ | — | — | — |
| Performance - ISR | ✅ | revalidate implicite | — | — |
| UX - Header/Footer | ✅ | — | — | — |

---

### /a-propos — Score : 78/100

**URL :** `/a-propos`  
**Fichier :** `app/a-propos/page.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - canonical | ✅ | — | — | — |
| SEO - H1 | ✅ | — | — | — |
| Images - next/image | ❌ | `<img>` natif lignes 91, 159, 201, 223 | `app/a-propos/page.tsx` | Remplacer par next/image |
| Images - alt | ✅ | Tous avec alt text | — | — |
| Performance - ISR | ✅ | revalidate=3600 | — | — |
| Performance - fonts | 🟡 | Google Fonts sans display:swap | `SiteTheme.tsx:52` | Ajouter `&display=swap` |
| UX - Header/Footer | ✅ | — | — | — |

**🔴 Problème critique :**
- `app/a-propos/page.tsx:91,159,201,223` : 4 images `<img>` au lieu de `next/image`

---

### /mentions-legales — Score : 90/100

**URL :** `/mentions-legales`  
**Fichier :** `app/mentions-legales/page.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - H1 | ✅ | — | — | — |
| Performance | ✅ | — | — | — |
| UX - Header/Footer | ✅ | — | — | — |

---

### /politique-confidentialite — Score : 90/100

**URL :** `/politique-confidentialite`  
**Fichier :** `app/politique-confidentialite/page.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO - title | ✅ | — | — | — |
| SEO - description | ✅ | — | — | — |
| SEO - H1 | ✅ | — | — | — |
| Performance | ✅ | — | — | — |
| UX - Header/Footer | ✅ | — | — | — |

---

### /sitemap.xml — Score : 95/100

**URL :** `/sitemap.xml`  
**Fichier :** `app/sitemap.ts` + `lib/sitemap-supabase.ts`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| URLs absolues | ✅ | — | — | — |
| Priorités | ✅ | — | — | — |
| ChangeFrequency | ✅ | — | — | — |
| Articles inclus | ✅ | — | — | — |
| Destinations incluses | ✅ | — | — | — |
| lastModified | ✅ | — | — | — |

---

### /robots.txt — Score : 95/100

**URL :** `/robots.txt`  
**Fichier :** `app/robots.ts`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| Sitemap URL | ✅ | — | — | — |
| Allow/Disallow | ✅ | /api/, /cms/ | — | — |
| User-agent | ✅ | * | — | — |

---

### Page 404 & Error Boundary — Score : 50/100

**Fichiers :** `app/not-found.tsx`, `app/error.tsx`

| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| 404 personnalisée | ❌ | Fichier non trouvé | — | Créer `app/not-found.tsx` |
| Error boundary | ❌ | Fichier non trouvé | — | Créer `app/error.tsx` |
| Page non trouvée informative | ❌ | — | — | Ajouter liens retour |

**🔴 Problèmes critiques :**
- `app/not-found.tsx` : N'existe pas — utilise la page 404 par défaut de Next.js
- `app/error.tsx` : N'existe pas — pas de gestion d'erreur UI

---

## Problèmes transversaux

### 🔴 Critiques (toutes pages)

1. **Images `<img>` au lieu de `next/image`** — Présent sur :
   - `app/blog/[slug]/page.tsx:204,338` (hero + contenu)
   - `app/a-propos/page.tsx:91,159,201,223` (4 images)
   - `components/HomeClient.tsx:139,157`
   - Impact : CLS, pas d'optimisation, pas de lazy loading automatique

2. **Page 404 personnalisée manquante** — `app/not-found.tsx` absent
   - Impact UX : Page 404 générique Next.js

3. **Error boundary manquante** — `app/error.tsx` absent
   - Impact UX : Erreurs non gérées proprement

### 🟠 Importants

4. **Google Fonts sans `display=swap`** — `components/SiteTheme.tsx:52`
   - Impact Performance : Flash of Unstyled Text (FOUT)

5. **`<Image>` sans dimensions** — `app/destinations/[slug]/page.tsx:231,325`, `app/destinations/DestinationsClient.tsx:210`
   - Impact : CLS (Core Web Vital)

6. **Pas de Schema.org sur /travel-planning**
   - Impact SEO : Service schema manquant

7. **Pas de Schema.org sur /contact**
   - Impact SEO : ContactPage schema manquant

### 🟡 Améliorations

8. **Pas de JSON-LD CollectionPage sur /blog**
9. **`next/image` sur `app/destinations/madere/page.tsx:150,159`** : à vérifier
10. **Consistance `<img>` vs `next/image`** : harmoniser partout
11. **Liens "retour" manquants** : vérifier sur toutes les pages articles
12. **Skeleton loaders** : pas de loading state sur blog list et destinations

---

## Plan d'action priorisé

| Priorité | Problème | Pages | Fichier | Effort | Impact SEO |
|----------|----------|-------|---------|--------|------------|
| P1 | 404 personnalisée | Toutes | `app/not-found.tsx` | 30min | 🟡 Moyen |
| P1 | Error boundary | Toutes | `app/error.tsx` | 30min | 🟡 Moyen |
| P1 | Remplacer `<img>` par `next/image` | Blog slug | `app/blog/[slug]/page.tsx:204,338` | 20min | 🔴 Élevé |
| P1 | Remplacer `<img>` par `next/image` | A-propos | `app/a-propos/page.tsx` (4 images) | 30min | 🔴 Élevé |
| P2 | Ajouter dimensions aux `<Image>` | Destinations | `app/destinations/[slug]/page.tsx:231,325` | 15min | 🔴 Élevé |
| P2 | Google Fonts display:swap | Toutes | `components/SiteTheme.tsx:52` | 5min | 🟡 Moyen |
| P2 | Schema.org Service | /travel-planning | `app/travel-planning/page.tsx` | 20min | 🟡 Moyen |
| P2 | Schema.org ContactPage | /contact | `app/contact/page.tsx` | 15min | 🟡 Moyen |
| P3 | Schema.org CollectionPage | /blog | `app/blog/page.tsx` | 15min | 🟡 Moyen |
| P3 | Remplacer `<img>` par `next/image` | Home | `components/HomeClient.tsx:139,157` | 15min | 🟡 Moyen |
| P3 | Ajouter dimensions | Destinations list | `components/DestinationsClient.tsx:210` | 10min | 🟡 Moyen |

---

## Fichiers à créer

### `app/not-found.tsx` (nouveau)
```tsx
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
        <div className="text-center px-6">
          <h1 className="text-6xl font-serif text-mahogany mb-4">404</h1>
          <h2 className="text-2xl font-serif text-charcoal mb-6">Page introuvable</h2>
          <p className="text-charcoal/70 mb-8">
            La page que tu cherches semble avoir pris des chemins de traverse.
          </p>
          <Link href="/" className="text-eucalyptus font-semibold hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

### `app/error.tsx` (nouveau)
```tsx
'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-[#f7f6f2]">
        <div className="text-center px-6">
          <h1 className="text-4xl font-serif text-mahogany mb-4">Une erreur est survenue</h1>
          <p className="text-charcoal/70 mb-8">
            On a rencontré un problème technique. On s'en occupe.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-mahogany text-white rounded font-semibold mr-4"
          >
            Réessayer
          </button>
          <Link href="/" className="text-eucalyptus font-semibold hover:underline">
            ← Accueil
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

---

## Annexe : Pages avec `<img>` natif (à corriger)

| Fichier | Lignes | Contexte |
|---------|--------|----------|
| `app/blog/[slug]/page.tsx` | 204, 338 | Hero image + contenu article |
| `app/a-propos/page.tsx` | 91, 159, 201, 223 | Photos équipe/paysages |
| `components/HomeClient.tsx` | 139, 157 | Images section Food |
| `components/MediaLibrary.tsx` | 376, 674 | Médiathèque (CMS - acceptable) |

---

*Audit généré par OpenHands — 26 mai 2026*
*Basé sur l'audit CMS v2 (CMS_AUDIT_REPORT.md)*