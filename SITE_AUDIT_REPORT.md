# Audit Site Public heldonica.fr
## Date : 26 mai 2026
## Score global : 65/100

## Résumé exécutif
- Problèmes critiques 🔴 (bloquants SEO ou UX)
  - Manque de métadonnées SEO (`<title>`, `<meta>`) sur la majorité des pages secondaires de destinations (ex: `/destinations/colombie/bogota`).
  - Manque de métadonnées SEO sur des pages importantes comme `/travel-planning`, `/travel-planning-form`, `/merci`.
  - Oubli de l'export `generateMetadata` sur `/blog/[slug]/page.tsx`, rendant le SEO dynamique inopérant.
- Problèmes importants 🟠 (impact significatif)
  - Utilisation de balises `<img>` natives au lieu de `next/image` dans plusieurs composants (ex: `HomeClient.tsx`, `app/blog/[slug]/page.tsx`, etc.), impactant les performances et les Core Web Vitals (absence de largeur/hauteur explicites pouvant causer du CLS).
  - Typage TypeScript incomplet ou incorrect causant des erreurs au build (cf. `CMS_AUDIT_REPORT.md`).
- Améliorations 🟡 (quick wins)
  - Ajouter des Skeleton loaders sur les pages dynamiques.
  - S'assurer du bon contraste et du focus visible au clavier sur tous les éléments interactifs.
- Points forts ✅
  - ISR bien configuré (revalidate = 60 ou 3600) sur les pages principales pour de bonnes performances.
  - JSON-LD correctement implémenté sur les pages majeures (`/`, `/destinations`, `/blog/[slug]`).
  - Charte graphique et ton de voix bien respectés (tutoiement, lexique "pépites").

## Rapport par page

### Accueil — Score 85/100
**URL :** /
**Fichier :** app/page.tsx, components/HomeClient.tsx
| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| Performance | 🟠 | Balises `<img>` natives sans next/image | components/HomeClient.tsx | Remplacer par `<Image>` de `next/image` |
| SEO | ✅ | JSON-LD, metadata complets | app/page.tsx | - |

### Blog Index — Score 90/100
**URL :** /blog
**Fichier :** app/blog/page.tsx, components/BlogClientPage.tsx
| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| Performance | 🟡 | Skeleton loaders manquants | components/BlogClientPage.tsx | Ajouter des squelettes pendant le chargement |
| SEO | ✅ | generateMetadata présent, ISR configuré | app/blog/page.tsx | - |

### Article Individuel (ex: /blog/[slug]) — Score 85/100
**URL :** /blog/[slug]
**Fichier :** app/blog/[slug]/page.tsx
| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO | 🔴 | generateMetadata manquant | app/blog/[slug]/page.tsx | Ajouter `export async function generateMetadata` basé sur le slug |
| Performance | 🟠 | Balises `<img>` natives (hero image, related images) | app/blog/[slug]/page.tsx | Utiliser `next/image` |

### Destinations Index — Score 90/100
**URL :** /destinations
**Fichier :** app/destinations/page.tsx
| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO | ✅ | JSON-LD BreadcrumbList et CollectionPage présents | app/destinations/page.tsx | - |
| Performance | 🟡 | dynamic = 'force-dynamic' utilisé, pourrait être ISR | app/destinations/page.tsx | Changer pour ISR si possible (revalidate) |

### Pages Destinations Secondaires (ex: /destinations/madere/budget) — Score 40/100
**URLs :** /destinations/madere/budget, /destinations/colombie/bogota, etc.
**Fichiers :** app/destinations/**/page.tsx
| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO | 🔴 | Métadonnées (title, description, canonical) absentes | app/destinations/**/page.tsx | Ajouter `export const metadata` sur toutes les pages |

### Travel Planning & Contact — Score 60/100
**URLs :** /travel-planning, /travel-planning-form, /contact
**Fichiers :** app/travel-planning/page.tsx, app/travel-planning-form/page.tsx, app/contact/page.tsx
| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO | 🔴 | Métadonnées absentes sur Travel Planning / Form | app/travel-planning/page.tsx, etc. | Ajouter `export const metadata` |
| UX | ✅ | Formulaires clairs, progression par étapes | app/travel-planning-form/page.tsx | - |

### Pages Légales — Score 85/100
**URLs :** /mentions-legales, /politique-confidentialite
**Fichiers :** app/mentions-legales/page.tsx, etc.
| Dimension | Statut | Problème | Fichier | Fix suggéré |
|-----------|--------|----------|---------|-------------|
| SEO | 🟡 | SEO minimal, mais adéquat pour ces pages | - | - |

## Problèmes transversaux
- **Absence globale de `next/image`** : L'utilisation de balises `<img src=...>` natives sans optimisation de taille, format (WebP) ni lazy-loading natif affecte les performances générales.
- **Oubli des métadonnées SEO** : De nombreuses pages (plus de 40 identifiées) n'ont pas d'export `metadata` défini, ce qui nuit gravement à l'indexation.
- **Erreurs TypeScript (typecheck)** : Une trentaine d'erreurs TypeScript subsistent, majoritairement dans les routes API et les composants CMS, compromettant la stabilité de la build.

## Plan d'action priorisé
| Priorité | Problème | Pages concernées | Effort | Impact SEO |
|----------|----------|-----------------|--------|------------|
| P1 | Ajouter `export const metadata` manquant | Toutes les pages destinations (40+), travel-planning, forms | Moyen | Élevé |
| P1 | Implémenter `generateMetadata` pour blog/[slug] | /blog/[slug] | Faible | Élevé |
| P2 | Migrer les `<img>` vers `next/image` | Toutes les pages (Home, Blog, Destinations) | Moyen | Moyen |
| P3 | Ajouter des Skeleton loaders | Blog, Destinations | Moyen | Faible (UX) |
| P3 | Corriger les erreurs TypeScript (typecheck) | api/cms/*, components/* | Moyen | N/A (Stabilité) |
