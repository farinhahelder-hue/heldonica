# 🏗️ DIAGRAMME ARCHITECTURE CMS — HELDONICA

## Vue macroscopique

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL (CMS)                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ /admin/destinations    /admin/places    /admin/recipes       │   │
│  │ /admin/pois            /admin/media     /admin/settings      │   │
│  │ /admin/blog            /admin/categories                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                             ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ ÉDITEUR HELDONICA                                            │   │
│  │ - Crée/édite destinations, POI, lieux, recettes              │   │
│  │ - Upload images (Supabase Storage)                           │   │
│  │ - Change SEO, tags, status (is_active)                       │   │
│  │ - Trie blocs, réordonne                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                             │ POST/PATCH/DELETE
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ /api/cms/destinations      /api/cms/pois                    │   │
│  │ /api/cms/places            /api/cms/recipes                 │   │
│  │ /api/cms/media/upload      /api/cms/zones (editable)        │   │
│  │ /api/cms/settings          /api/cms/blog-posts              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  - Validation TypeScript                                            │
│  - RLS checks Supabase                                              │
│  - Auth (service_role / admin)                                      │
└─────────────────────────────────────────────────────────────────────┘
                             │ Supabase Client
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SUPABASE (Base de données)                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ TABLES CMS PRINCIPALES                                        │ │
│  │                                                                │ │
│  │  cms_destinations ──┬──► cms_pois                            │ │
│  │                     ├──► cms_places                          │ │
│  │                     ├──► cms_recipes                         │ │
│  │                     └──► cms_media_assets                    │ │
│  │                                                                │ │
│  │  cms_pillar_pages ──┬──► cms_media_assets (hero)             │ │
│  │                     ├──► cms_pois                            │ │
│  │                     ├──► cms_places                          │ │
│  │                     └──► cms_recipes                         │ │
│  │                                                                │ │
│  │  cms_editable_zones         (page-specific content)          │ │
│  │  cms_settings               (site-global)                    │ │
│  │  cms_home_destinations      (featured on home)               │ │
│  │  cms_blog_posts             (articles)                       │ │
│  │  cms_categories             (blog categories)                │ │
│  │  cms_media_assets           (images centralisées)            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  RLS Policies:                                                      │
│  - Public read (is_active = true)                                   │
│  - Admin write (auth.role() = 'service_role' OR admin auth)         │
│  - Audit trail (created_at, updated_at)                             │
└─────────────────────────────────────────────────────────────────────┘
                             │ supabase-js / RLS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (lib/)                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ lib/destinations-supabase.ts    getDestinations()           │   │
│  │ lib/pois-supabase.ts             getPoisByDestination()     │   │
│  │ lib/places-supabase.ts           getPlacesByDestination()   │   │
│  │ lib/recipes-supabase.ts          getRecipes()              │   │
│  │ lib/content-loader.ts            fetchCmsZones()           │   │
│  │ lib/media-supabase.ts            getMediaAssets()          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  - Fetch + cache client-side                                        │
│  - Type-safe (TypeScript)                                           │
│  - Error handling                                                   │
│  - Fallback si DB indisponible                                      │
└─────────────────────────────────────────────────────────────────────┘
                             │ React (SSG/SSR/ISR)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONT PUBLIC (Next.js)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Pages dynamiques:                                            │   │
│  │  / (home)              → charges cms_home_destinations       │   │
│  │  /destinations         → liste cms_destinations            │   │
│  │  /destinations/[slug]  → cms_pillar_pages OU cms_destinations│  │
│  │  /destinations/carte   → cms_pois + leaflet                 │   │
│  │  /blog                 → cms_blog_posts                     │   │
│  │  /a-propos             → cms_editable_zones (page=a-propos) │   │
│  │  /travel-planning      → cms_editable_zones (page=...)      │   │
│  │  /contact              → cms_editable_zones (page=contact)  │   │
│  │                                                               │   │
│  │ Composants:                                                  │   │
│  │  Header         → cms_editable_zones (global)               │   │
│  │  Footer         → cms_editable_zones (global) + settings   │   │
│  │  DestinationCard → cms_destinations + cms_media_assets      │   │
│  │  PoiMap         → cms_pois (geo display)                   │   │
│  │  PlacesList     → cms_places (by destination)              │   │
│  │  RecipeCard     → cms_recipes                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  Rendu:                                                             │
│  - ✅ HTML/CSS/JS (Vercel CDN)                                     │
│  - ✅ Images (Supabase Storage + Vercel cache)                    │
│  - ✅ SEO (canonical, meta tags, schema.org)                      │
└─────────────────────────────────────────────────────────────────────┘
                             │ HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    UTILISATEURS (Navigateurs)                       │
│  - Lisent contenu Heldonica                                         │
│  - Aucun changement côté UX                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Flux de données détaillé

### Scénario 1 : Créer une nouvelle destination

```
┌──────────────────────────────────────────┐
│ ADMIN: /admin/destinations               │
│ Clic "Ajouter une destination"          │
│ Remplie: nom, intro, hero (upload)      │
│ Clic "Sauvegarder"                      │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ POST /api/cms/destinations               │
│ {                                        │
│   name: "Crete",                        │
│   slug: "crete",                        │
│   country: "Greece",                    │
│   intro: "...",                         │
│   hero: "https://cdn/.../crete.jpg"    │
│ }                                        │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Supabase RLS check:                      │
│ - Is user authenticated? YES             │
│ - Is user admin? YES                     │
│ - Can INSERT into cms_destinations? YES  │
│ INSERT INTO cms_destinations(...) ...    │
│ → New row: id=uuid, slug=crete, ...      │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Frontend revalidate (ISR):               │
│ - Revalidate /destinations               │
│ - Revalidate /destinations/carte         │
│ - Revalidate / (if home featured)        │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Utilisateur visite /destinations/crete   │
│ → app/destinations/[slug]/page.tsx       │
│    - Fetch cms_destinations (slug=crete) │
│    - Render destination page             │
│    - Cache Vercel (ISR)                  │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Page publiée en ligne                    │
│ - Contenu depuis Supabase                │
│ - Images depuis Storage                  │
│ - SEO OK                                 │
└──────────────────────────────────────────┘
```

---

### Scénario 2 : Modifier un texte d'interface (home hero)

```
┌──────────────────────────────────────────┐
│ ADMIN: /admin/settings                   │
│ Édite: "home__hero_title"                │
│ Avant: "Slow travel vécu en duo..."      │
│ Après: "Voyage lentement, vivez plein..." │
│ Clic "Sauvegarder"                      │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ PATCH /api/cms/zones                     │
│ {                                        │
│   page: "home",                         │
│   zone_key: "hero_title",               │
│   value: "Voyage lentement..."          │
│ }                                        │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Supabase: UPDATE cms_editable_zones      │
│ WHERE page='home' AND zone_key='hero...' │
│ SET value='Voyage lentement...'          │
│ → ✅ Updated 1 row                       │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Frontend (client-side cache):            │
│ - useContentLoader() hook détecte change │
│ - Re-fetch cms_editable_zones (page='home')│
│ - HomeClient re-render                  │
│ → Hero title change immédiatement        │
│   (ou ISR revalidate après 60s)         │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Utilisateurs voient:                     │
│ "Voyage lentement, vivez plein..."       │
│ (pas de re-déploiement Vercel nécessaire)│
└──────────────────────────────────────────┘
```

---

### Scénario 3 : Ajouter une image à une destination

```
┌──────────────────────────────────────────┐
│ ADMIN: /admin/media                      │
│ Clic "Upload image"                     │
│ Sélectionne: crete-sunset.jpg           │
│ Remplit: alt text, caption              │
│ Associe: entity_type=destination        │
│          entity_slug=crete              │
│ Clic "Upload"                           │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ POST /api/cms/media/upload               │
│ - Upload à Supabase Storage              │
│ - Path: images/2026/07/crete-sunset.jpg  │
│ - Retour: public URL                     │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ INSERT INTO cms_media_assets              │
│ (storage_path, url, alt_text, entity...) │
│ → New row: id=uuid, url=https://...      │
└──────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────┐
│ Frontend affiche:                        │
│ - Galerie destination/crete               │
│ - Image chargée depuis Supabase Storage   │
│ - Alt text visible (accessibilité)       │
└──────────────────────────────────────────┘
```

---

## Flux de cache & revalidation

```
┌─────────────────────────────────────────┐
│        SUPABASE (Source de vérité)       │
│  - cms_destinations                     │
│  - cms_pois                             │
│  - cms_editable_zones                   │
└─────────────────────────────────────────┘
           ▲        │
    Write  │        │ Read
    (RLS)  │        ▼
           │    ┌──────────────────┐
           │    │ Client-side cache │
           │    │ (5 min TTL)      │
           │    │ useContentLoader │
           │    └──────────────────┘
           │           ▲
    Refresh├───────────┤
           │    ┌──────────────────┐
           │    │ Vercel ISR cache │
           │    │ (3600s or manual)│
           │    └──────────────────┘
           │           │
           │    ┌──────▼──────────┐
           └───►│ Browser cache   │
                │ (Vercel CDN)    │
                └─────────────────┘
```

**Stratégie :**
1. **Données éditées** → Supabase RLS OK
2. **Affichage** → useContentLoader (SSR/ISR) charge depuis Supabase
3. **Cache client** → 5 min (re-fetch si stale)
4. **Cache Vercel** → ISR avec revalidate manuel si admin change

---

## Types TypeScript (couche data)

```typescript
// lib/types.ts

// Destinations
export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  region?: string;
  intro?: string;
  tagline?: string;
  hero?: string;
  seo_title?: string;
  seo_desc?: string;
  is_active: boolean;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

// POI
export interface POI {
  id: string;
  destination_id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  excerpt?: string;
  image?: string;
  type: 'landmark' | 'viewpoint' | 'nature' | 'cultural' | 'food';
  tags: string[];
  is_active: boolean;
}

// Media Assets
export interface MediaAsset {
  id: string;
  url: string;
  alt_text: string;
  caption?: string;
  credit?: string;
  entity_type: 'destination' | 'poi' | 'place' | 'recipe' | 'blog_post' | 'global';
  entity_slug?: string;
  is_featured: boolean;
  tags: string[];
}

// Editable Zones
export interface CmsZone {
  id: string;
  page: string; // 'global', 'home', 'blog', 'a-propos'
  zone_key: string; // 'hero_title', 'hero_subtitle'
  zone_type: 'text' | 'image' | 'cta' | 'color' | 'boolean';
  value: string;
  is_active: boolean;
}
```

---

## Performance & Monitoring

```
┌──────────────────────────────────────────┐
│         MONITORING & PERF                │
├──────────────────────────────────────────┤
│ Query performance:                       │
│  - cms_destinations (indexed by slug)    │
│  - cms_pois (indexed by destination_id)  │
│  - cms_editable_zones (unique key)       │
│                                          │
│ Cache hit rate:                          │
│  - Client-side (useContentLoader)        │
│  - Vercel ISR                            │
│                                          │
│ Database connections:                    │
│  - Supabase free tier: 100 connections   │
│  - Next.js serverless (parallel routes)  │
│                                          │
│ Storage usage:                           │
│  - Images: Supabase Storage (5GB free)   │
│  - Database: Supabase (500MB free)       │
└──────────────────────────────────────────┘
```

---

## Fallback & Resilience

```
┌─ Fetching cms_destinations ─────────────┐
│                                         │
│ 1. Supabase API accessible?             │
│    YES → fetch data                     │
│    NO → Try fallback                    │
│                                         │
│ 2. Cache disponible (5 min)?            │
│    YES → use cached data                │
│    NO → Use hardcoded fallback          │
│                                         │
│ 3. Fallback suffisant?                  │
│    YES → display (Madère, Monténégro)   │
│    NO → 404                             │
│                                         │
└─────────────────────────────────────────┘
```

---

## Prochaines phases (future)

### Phase 4 — Blocs modulaires (futur)

```sql
CREATE TABLE cms_page_sections (
  id uuid PRIMARY KEY,
  page_slug text,                    -- 'travel-planning', 'a-propos'
  section_type text,                 -- 'hero', 'testimonials', 'cta', 'faq'
  content jsonb,                     -- {title, subtitle, blocks: [...]}
  order_index integer,
  is_active boolean,
  UNIQUE(page_slug, section_type)
);
```

→ Pages deviennent **100% éditables** (ajouter/retirer/réordonner sections)

### Phase 5 — Relations éditorialesavancées (futur)

```sql
-- Recommandations basées sur tags
CREATE TABLE cms_content_relations (
  source_type text,                  -- 'destination'
  source_id uuid,
  related_type text,                 -- 'recipe', 'article', 'place'
  related_id uuid,
  weight integer DEFAULT 1,          -- Pour ranking
);
```

→ Afficher "Articles sur cette destination", "Recettes liées", etc.

---

**FIN DE L'ARCHITECTURE**

✅ Tous les 4 livrables sont prêts :
- ✅ Document 1 : Audit complet
- ✅ Document 2 : Schéma cible
- ✅ Document 3 : Plan de migration
- ✅ Document 4 : Diagramme architecture

**Prochaine étape :** Validation et lancement implémentation
