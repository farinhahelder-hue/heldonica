# SOURCE OF TRUTH — Contenu Heldonica

> Document de référence créé le 2026-07-14.  
> **À mettre à jour à chaque décision architecturale touchant le contenu.**

---

## ✅ Table source de vérité : `cms_blog_posts`

### Pourquoi `cms_blog_posts` et pas `articles` ?

La table `cms_blog_posts` est la **source de vérité unique** pour tous les articles du blog Heldonica.

| Critère | `cms_blog_posts` | `articles` |
|---------|------------------|------------|
| Créée dans | Migration `20260327` (origine du projet) | Migration `20260608` |
| Alimentée par | CMS custom `/panel-manager` | Sync trigger depuis `cms_blog_posts` |
| Lue par | `lib/blog-supabase.ts` (toutes les routes) | — (résiduelle) |
| Éditée par | Éditeur CMS `/panel-manager` | JAMAIS directement |
| Statut | **ACTIVE — source de vérité** | **ARCHIVE — ne jamais modifier** |

### ⚠️ Risque : table `articles`

La table `articles` existe à cause d'une migration `20260608` qui a créé un **trigger de synchronisation** depuis `cms_blog_posts`. Ce trigger peut poser des problèmes :

1. **Divergence silencieuse** : si le trigger échoue, les deux tables divergent sans erreur visible
2. **Double source** : certains agents IA ont tenté de lire depuis `articles` (ex: `/api/guides/download` ligne 30)
3. **Confusion maintenabilité** : toute nouvelle dev doit savoir quelle table cibler

**Règle stricte** : Ne jamais insérer ou modifier directement dans `articles`. Ne jamais lire depuis `articles` pour du contenu éditorial.

---

## 📋 Schéma canonique `cms_blog_posts`

```sql
CREATE TABLE cms_blog_posts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  excerpt       TEXT,
  content       TEXT,                    -- HTML ou Markdown
  category      TEXT,
  tags          TEXT[],
  featured_image TEXT,                   -- URL image principale
  author        TEXT DEFAULT 'Heldonica',
  published     BOOLEAN DEFAULT false,
  published_at  TIMESTAMP WITH TIME ZONE,
  -- Champs SEO standardisés
  seo_title     TEXT,                    -- <title> override (max 60 chars)
  seo_description TEXT,                  -- <meta description> (max 160 chars)
  og_image      TEXT,                    -- OpenGraph image URL
  canonical_url TEXT,                    -- URL canonique si différente
  -- Champs CMS
  status        TEXT DEFAULT 'draft',    -- draft | published | scheduled | archived
  scheduled_at  TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Champs SEO obligatoires par article

Pour chaque article publié, ces 4 champs **doivent** être renseignés :

| Champ | Requis | Longueur max | Source |
|-------|--------|--------------|--------|
| `seo_title` | ✅ | 60 caractères | Titre SEO dédié (≠ title) |
| `seo_description` | ✅ | 160 caractères | Meta description accrocheur |
| `og_image` | ✅ | URL | Image 1200×630px |
| `slug` | ✅ | — | URL canonique `/blog/[slug]` |

---

## 🗂️ Autres tables de contenu

### Tables actives (à conserver)

| Table | Rôle | Éditée via |
|-------|------|-----------|
| `cms_destinations` | Pages destinations | CMS `/admin/destinations` |
| `cms_settings` | Config globale site | CMS `/admin/settings` |
| `site_content` | Zones éditables inline | CMS `EditableZone` |
| `cms_testimonials` | Témoignages clients | CMS `/admin/testimonials` |
| `cms_pricing` | Plans tarifaires Travel Planning | CMS `/admin/pricing` |
| `demandes_travel` | CRM demandes Travel Planning | CMS `/panel-manager` Kanban |
| `guide_downloads` | Tracking téléchargements PDF | Automatique (API) |
| `newsletter_subscribers` | Abonnés newsletter | Automatique (API) |
| `email_sequences` | Séquence drip emails | Automatique (cron) |

### Tables à surveiller (risque)

| Table | Risque | Action |
|-------|--------|--------|
| `articles` | Trigger de sync depuis `cms_blog_posts` — peut diverger | **Ne pas modifier** — surveiller le trigger |
| `cms_blog_categories` | Peut être dupliquée avec le champ `category` de `cms_blog_posts` | Vérifier cohérence |
| `cms_zone_history` | Croissance non bornée | Ajouter retention policy (> 90 jours → archiver) |

### Tables à archiver (inactives)

| Table | Raison |
|-------|--------|
| `agent_tasks` | Créée pour Jules/OpenHands, jamais utilisée en prod |
| `cms_carousel_history` | Feature Instagram désactivée |

---

## 🔌 Accès aux données blog — Fonctions officielles

Toute lecture du blog **doit passer par ces fonctions** dans [`lib/blog-supabase.ts`](file:///c:/Users/farin/StudioProjects/heldonica/lib/blog-supabase.ts) :

```typescript
// Récupérer un article par slug
getPostBySlug(slug: string): Promise<BlogPost | null>

// Récupérer tous les articles publiés
getAllPosts(options?: { category?: string; limit?: number }): Promise<BlogPost[]>

// Récupérer les articles en vedette
getFeaturedPosts(limit?: number): Promise<BlogPost[]>
```

**⚠️ Anti-pattern à éviter** :
```typescript
// ❌ NE PAS FAIRE — contourne la source de vérité
const { data } = await supabase.from('articles').select('*')

// ✅ FAIRE — utilise la source de vérité
import { getAllPosts } from '@/lib/blog-supabase'
const posts = await getAllPosts()
```

---

## 📁 Routes blog — Source de vérité

| Route | Fichier | Source données |
|-------|---------|----------------|
| `/blog` | `app/blog/page.tsx` | `lib/blog-supabase.ts` → `cms_blog_posts` |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | `lib/blog-supabase.ts` → `cms_blog_posts` |
| `GET /api/cms/articles` | CMS Articles list | `cms_blog_posts` directement |
| `GET /api/cms/articles/[id]` | CMS Article edit | `cms_blog_posts` directement |

---

## 🚦 Règles de gouvernance

1. **Une seule entrée par article** : toujours dans `cms_blog_posts`, jamais dans `articles` directement
2. **CMS = seul outil d'édition** : `/panel-manager` pour les articles, pas d'édition directe Supabase en prod
3. **SEO obligatoire avant publication** : `seo_title`, `seo_description`, `og_image` doivent être renseignés
4. **Slug = URL permanente** : ne jamais changer un slug après publication (302 si inévitable, via `cms_redirects`)
5. **Trigger `articles`** : ne pas supprimer le trigger avant d'avoir vérifié que rien ne le lit (audit prévu Q3 2026)

---

## 📌 Décisions d'architecture en suspens

| # | Question | Deadline | Responsable |
|---|----------|----------|-------------|
| 1 | Supprimer ou garder la table `articles` + trigger ? | Q3 2026 | Tech |
| 2 | Migrer `site_content` vers `cms_blog_posts` custom fields ? | Q4 2026 | Tech + Prod |
| 3 | Ajouter retention policy sur `cms_zone_history` ? | Urgent | Tech |

---

*Dernière mise à jour : 2026-07-14 par Antigravity Agent*  
*Prochaine révision prévue : 2026-10-01*
