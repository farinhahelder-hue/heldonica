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

