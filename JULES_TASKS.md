# Tâches pour Jules

## Priorité Haute - SEO & Performance

### 1. Lazy Loading Images
**Pages affectées:** Normandie, Sicile, Sardaigne, Colombie, Roumanie, IDF, Portugal
**Action:** Ajouter `loading="lazy"` sur toutes les balises `<img>`
**Estimation:** 30 min

### 2. OG Images - Blog Posts
**Action:** Générer og-default.jpg pour tous les articles blog
**Estimation:** 1h

### 3. BreadcrumbList Schema
**Pages:** /destinations/*, /blog/*
**Action:** Ajouter JSON-LD breadcrumb sur toutes les pages
**Estimation:** 45 min

---

## Priorité Moyenne - Contenu

### 4. Articles Blog - Format SEO
**Action:** Ajouter schema Article sur chaque post blog
**Estimation:** 1h

### 5. FAQ Schema - Extension
**Pages:** /travel-planning, /destinations/*
**Action:** Ajouter plus de questions/réponses structurées
**Estimation:** 30 min

---

## Priorité Basse - Améliorations

### 6.next/image Migration
**Action:** Remplacer `<img>` par `next/image` pour les images locales
**Estimation:** 2h

### 7. Performance - Core Web Vitals
**Action:** Auditer LCP, CLS, FID
**Outil:** PageSpeed Insights

### 8. Internal Linking
**Action:** Densité de liens entre articles similaires
**Estimation:** 1h

---

## Vérifié - Fonctionne

- [x] Contact form (Resend integration)
- [x] Travel Planning multi-step form
- [x] Newsletter (Brevo)
- [x] Sitemap auto-généré
- [x] Robots.txt
- [x] Organization schema (homepage)
- [x] FAQPage schema (/travel-planning)
- [x] Person schema (/a-propos)
- [x] Badges "Testé par Heldonica"

---

## Ressources

- Analytics: GA4 configuré
- Email: Resend + Brevo
- Images CDN: WordPress (wp-content/uploads)
- Contact: https://www.heldonica.fr/contact



---

## Sprint W23 - 2026-06-10 | Automatisation IA

> Taches liees a la mise en place du pipeline Jules + AllHands + Gemini

### 9. [JULES] Lazy Loading images - SPRINT ACTUEL
**Pages affectees:** Normandie, Sicile, Sardaigne, Colombie, Roumanie, IDF, Portugal
**Action:** Ajouter `loading="lazy"` sur toutes les balises `<img>` + migrer vers `next/image`
**Label:** `jules`
**Estimation:** 1h30

### 10. [JULES] BreadcrumbList JSON-LD - SPRINT ACTUEL
**Pages:** /destinations/*, /blog/*
**Action:** Ajouter schema BreadcrumbList sur toutes les pages destinations et blog
**Label:** `jules`
**Estimation:** 45 min

### 11. [JULES] Article Schema - Blog posts
**Action:** Ajouter schema JSON-LD Article sur chaque post blog (author, datePublished, image)
**Label:** `jules`
**Estimation:** 1h

### 12. [ALLHANDS] Core Web Vitals - Audit complet
**Action:** Auditer LCP, CLS, FID sur toutes les pages principales via PageSpeed API
**Livrable:** Rapport dans docs/PERFORMANCE_REPORT.md
**Label:** `allhands`
**Estimation:** 2h

### 13. [ALLHANDS] Internal Linking automatise
**Action:** Creer un composant RelatedArticles qui detecte et lie les articles similaires
**Label:** `allhands`
**Estimation:** 3h

### 14. [GEMINI] Generation contenu destinations manquantes
**Action:** Generer via n8n + Gemini des brouillons pour 5 nouvelles destinations
**Label:** `gemini-content`
**Estimation:** Automatique via n8n

---

## Workflow Agent IA - Comment utiliser

1. **Jules**: Creer une issue GitHub + ajouter label `jules` → Jules code et ouvre une PR
2. **AllHands**: Ajouter label `allhands` sur une issue OU lancer manuellement via Actions
3. **Gemini**: Ajouter label `gemini-content` OU configurer webhook n8n
4. **Rapport**: Chaque lundi une issue `[Sprint W#]` est creee automatiquement

> Voir `.github/workflows/ai-automation.yml` pour le pipeline complet
> Voir `.jules/CONTEXT.md` pour le contexte stack complet
