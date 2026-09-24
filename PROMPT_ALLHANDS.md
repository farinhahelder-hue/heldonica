# PROMPT ALLHANDS — HELDONICA
## Sprint Prioritaire · Juin 2026

---

## 🎯 CONTEXTE & MISSION

Tu travailles sur le site **heldonica.fr** — blog Slow Travel & service de Travel Planning sur mesure, construit en **Next.js 14 App Router + Supabase + Vercel**.

Le site est en production. Le build passe. Il existe un backlog massif de **PRs draft non mergées** (PRs #166 à #221, majoritairement créées automatiquement par des agents IA) qui doivent être **triées, dédupliquées et traitées** avant toute nouvelle feature.

**Ta mission est en 5 volets, à traiter dans l'ordre de priorité ci-dessous.**

---

## ⚡ VOLET 0 — NETTOYAGE DES PRs (PRIORITÉ ABSOLUE)

**Avant toute chose :**

1. **Fermer sans merger** toutes les PRs draft en doublon sur `useDeferredValue` blog search : PRs #206, #207, #208, #209, #210, #211, #213, #215, #217, #218, #219, #220 — elles sont toutes identiques
2. **Merger dans `main`** les PRs suivantes (déjà validées) :
   - **#221** : `useDeferredValue` blog search (garder celle-ci, la plus récente)
   - **#214** : `fix(typescript): resolve strict typecheck errors` — bloquant build TS
   - **#179** : `fix: update supabase table name in sitemap generation` — bug fonctionnel
   - **#174** : `copy: hero subtitle + identity intro` — contenu éditorial prêt
3. **Vérifier** que `npm run build` et `npm run typecheck` passent à 100% après ces merges
4. **Ne pas toucher** aux PRs #166–#177 (features, migrations DB) tant que les fix ci-dessus ne sont pas en prod

---

## 🔍 VOLET 1 — SEO TECHNIQUE + GEO OPTIMIZATION

### Contexte
Le site cible les requêtes slow travel en couple, destinations hors sentiers battus, et travel planning sur mesure. Il doit être **extractible par ChatGPT, Perplexity, Google SGE** (GEO = Generative Engine Optimization).

### Tâches à réaliser

#### 1.1 — Métadonnées & JSON-LD
- Vérifier que **chaque page** (`/`, `/blog`, `/blog/[slug]`, `/destinations`, `/travel-planning`, `/a-propos`, `/contact`) possède un `generateMetadata()` complet avec :
  - `title` unique (format : `[Titre page] | Heldonica`)
  - `description` entre 140 et 160 caractères, rédigée en voix Heldonica (tutoiement, sensoriel)
  - `openGraph` avec `type`, `title`, `description`, `url`, `images` (og:image 1200×630)
  - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Ajouter sur chaque article de blog (`/blog/[slug]`) un **JSON-LD `Article`** structuré :
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[titre article]",
  "description": "[excerpt]",
  "author": { "@type": "Person", "name": "Heldonica" },
  "publisher": { "@type": "Organization", "name": "Heldonica", "url": "https://heldonica.fr" },
  "datePublished": "[published_at]",
  "dateModified": "[updated_at]",
  "image": "[cover_image_url]",
  "url": "https://heldonica.fr/blog/[slug]"
}
```
- Ajouter un **JSON-LD `Organization`** sur la homepage :
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Heldonica",
  "url": "https://heldonica.fr",
  "description": "Blog Slow Travel & Travel Planning sur mesure pour voyager en couple, hors des sentiers battus",
  "sameAs": ["https://instagram.com/heldonica"]
}
```
- Ajouter un **JSON-LD `Service`** sur `/travel-planning` :
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Travel Planning sur mesure — Heldonica",
  "provider": { "@type": "Organization", "name": "Heldonica" },
  "description": "Conception sur mesure d'itinéraires de voyage en couple, slow travel, hors des sentiers battus",
  "areaServed": "FR",
  "url": "https://heldonica.fr/travel-planning"
}
```

#### 1.2 — Sitemap & robots.txt
- Vérifier que `lib/sitemap-supabase.ts` utilise bien la table `destinations` (pas `cms_destinations`) — déjà corrigé en PR #179, à confirmer mergé
- S'assurer que `app/sitemap.ts` inclut **toutes les routes statiques** + les slugs dynamiques blog + destinations
- Vérifier que `robots.txt` est bien servi à `https://heldonica.fr/robots.txt` (pas de redirect 307)
- Ajouter `sitemap: https://heldonica.fr/sitemap.xml` dans robots.txt si absent

#### 1.3 — GEO : Structure extractible par les IA
Pour que ChatGPT/Perplexity puissent citer Heldonica comme source :
- **Titres H1/H2** : utiliser des formulations questions/réponses (ex: "Que faire à Madère en couple ?", "Combien coûte un travel planning sur mesure ?")
- **Listes et tableaux** : privilégier les bullet lists factuelles avec données chiffrées dans les articles
- **Chaque article de blog** doit commencer par un paragraphe "chapeau" de 2-3 phrases qui résume la valeur principale de l'article — extractible comme snippet
- **Balise `<article>`** : vérifier que le contenu des articles est bien enveloppé dans une balise sémantique `<article>` dans `app/blog/[slug]/page.tsx`

---

## ✍️ VOLET 2 — COHÉRENCE VOIX HELDONICA

### Règles de voix (à appliquer sur tout texte UI présent dans le code)

**B2C (blog, homepage, travel-planning, a-propos) :**
- Tutoiement systématique
- "On" pour parler du duo (jamais "nous")
- Lexique interdit → à remplacer : "bons plans" → "pépites dénichées" | "organisation de séjour" → "conception sur mesure" | "nous" → "on" | "clients" → "voyageurs"
- Lexique cible : "pépites dénichées", "testé terrain", "joyaux cachés", "hors des sentiers battus", "slow travel", "déconnexion vraie"

**B2B (pages non publiques, CMS admin) :**
- Vouvoiement
- Ton analytique, orienté résultats

### Pages à auditer et corriger
1. `app/page.tsx` (homepage) — hero, section Notre histoire, CTA
2. `app/travel-planning/page.tsx` — sections "Pour qui", "Comment ça marche", "Ce que tu reçois", FAQ
3. `app/a-propos/page.tsx` — bio duo, valeurs
4. `app/contact/page.tsx` — texte intro formulaire
5. Composants header/footer : libellés navigation, tagline

### Règle anti-générique (E-E-A-T)
Sur la homepage et la page travel-planning, vérifier qu'il y a au moins **une mention d'expérience terrain vécue** :
- Ex : "On a testé ça en mars 2024 sous la pluie de Madère"
- Ex : "Après 7 pays habités et non juste visités…"
Si absent, ajouter une micro-phrase de crédibilité E-E-A-T dans la section hero ou la section "Notre histoire".

---

## 🗄️ VOLET 3 — CMS SUPABASE : STABILISATION

### Contexte
Le CMS custom est dans `app/api/cms/` et `components/cms/`. La table principale est `cms_blog_posts` dans Supabase. Des migrations sont en attente dans le dossier `supabase/`.

### Tâches

#### 3.1 — Audit des routes API CMS
- Lire `SECURITY_AUDIT.md` (déjà présent dans le repo)
- Vérifier que **toutes les routes** `app/api/cms/**` utilisent la vérification auth Supabase (`getSession()` ou `getUser()`)
- Routes qui doivent être protégées : POST, PUT, PATCH, DELETE sur tous les endpoints
- Routes qui peuvent être publiques : GET sur `/api/cms/posts` et `/api/cms/destinations` (lecture seule)

#### 3.2 — Champs manquants dans `cms_blog_posts`
Vérifier et ajouter si absent :
- `seo_title` (text, nullable) — titre SEO override
- `seo_description` (text, nullable) — meta description override
- `reading_time` (integer, nullable) — calculé côté serveur au save
- `status` (enum: 'draft' | 'published' | 'archived') — vérifier que c'est bien géré dans le CMS UI

#### 3.3 — Calcul automatique du `reading_time`
Dans la route `app/api/cms/posts/[id]/route.ts` (ou équivalent), au moment du save/update d'un article :
```typescript
const wordCount = content.trim().split(/\s+/).length
const readingTime = Math.ceil(wordCount / 200) // ~200 mots/min
```
Sauvegarder cette valeur dans `reading_time`.

#### 3.4 — Afficher le `reading_time` dans les cards blog
Dans `components/BlogCard.tsx` (ou équivalent), afficher :
```tsx
{post.reading_time && (
  <span className="text-sm text-eucalyptus">{post.reading_time} min de lecture</span>
)}
```

#### 3.5 — Éditeur CMS : champ SEO override
Dans le formulaire d'édition d'article (CMS admin), ajouter un accordion "SEO" avec :
- Input `seo_title` (placeholder: "Titre SEO personnalisé — laisse vide pour utiliser le titre de l'article")
- Textarea `seo_description` (placeholder: "Description meta — 140-160 caractères recommandés")
- Compteur de caractères en live sur `seo_description`

---

## 🤖 VOLET 4 — AUTOMATISATION

### Contexte existant
Le repo contient déjà :
- `n8n-instagram-workflow.json` — workflow Instagram
- `n8n-workflow-carousel.json` — carousel
- `n8n-workflow-manual.json` — workflow manuel
- `instagram_creator.py` — script Python création posts

### Tâches

#### 4.1 — Webhook de publication automatique
Créer `app/api/webhooks/publish-post/route.ts` :
- Route POST protégée par header `x-webhook-secret` (variable env `WEBHOOK_SECRET`)
- Payload attendu : `{ slug: string, action: 'publish' | 'unpublish' }`
- Action : met à jour le champ `status` dans `cms_blog_posts` + déclenche une revalidation ISR via `revalidatePath('/blog')` et `revalidatePath('/blog/' + slug)`
- Retourne `{ success: true, revalidated: ['/blog', '/blog/slug'] }`

#### 4.2 — API Route pour le reading_time en masse
Créer `app/api/cms/recalculate-reading-times/route.ts` :
- Route POST protégée (admin seulement)
- Récupère tous les articles, recalcule le `reading_time` pour chacun, update en batch dans Supabase
- Utile pour initialiser le champ sur les articles existants

#### 4.3 — Vérification workflow n8n Instagram
Relire `n8n-instagram-workflow.json` et documenter dans un fichier `docs/N8N_WORKFLOWS.md` :
- Ce que fait chaque workflow
- Quels champs Supabase il lit/écrit
- Les variables d'environnement requises (Brevo, Instagram token, etc.)
- Comment le déclencher manuellement vs automatiquement

#### 4.4 — Cron Vercel pour revalidation ISR
Dans `vercel.json`, vérifier/ajouter un cron qui revalide le sitemap quotidiennement :
```json
{
  "crons": [{
    "path": "/api/cron/revalidate-sitemap",
    "schedule": "0 3 * * *"
  }]
}
```
Créer `app/api/cron/revalidate-sitemap/route.ts` qui revalide `/sitemap.xml`.

---

## 📐 CONTRAINTES TECHNIQUES GLOBALES

- **Stack** : Next.js 14 App Router, TypeScript strict, Tailwind CSS, Supabase (PostgreSQL), Vercel
- **Palette couleurs** (Tailwind) : Cloud Dancer (blanc cassé `#F8F4F0`), Eucalyptus Green (`#4A7C59`), Transformative Teal (`#2D6A7A`), Warm Mahogany (`#8B4513`)
- **Pas de `any` TypeScript** — utiliser des types stricts partout
- **ISR par défaut** : préférer `export const revalidate = 3600` à `force-dynamic` sauf nécessité absolue
- **Pas de breaking change** sur le schéma Supabase sans migration versionnée dans `supabase/migrations/`
- **Tests** : tout nouveau composant ou API route doit avoir au minimum un test dans `__tests__/`
- **Commits conventionnels** : `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

---

## ✅ DÉFINITION DE DONE

Un volet est considéré terminé quand :
1. Le code est mergé dans `main`
2. `npm run build` et `npm run typecheck` passent sans erreur
3. Le déploiement Vercel est vert
4. Les changements sont visibles sur `https://heldonica.fr`

---

## 📋 ORDRE D'EXÉCUTION RECOMMANDÉ

```
Volet 0 (nettoyage PRs)  →  Volet 1 (SEO/GEO)  →  Volet 2 (voix)  →  Volet 3 (CMS)  →  Volet 4 (auto)
```

Chaque volet peut être traité en PR séparée pour faciliter les reviews.

---

*Prompt généré le 09/06/2026 — version 3.0*
*Repo : farinhahelder-hue/heldonica | Branch cible : main*
