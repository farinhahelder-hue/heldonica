# 🚀 PLAN DE MIGRATION CMS — HELDONICA

## Timeline & phases

```
┌─ SEMAINE 1 ─────────────────────────────────┐
│ ✅ Phase 0: Fusion feat/cms-30-phase1       │
│ ✅ Phase 1: Tables destinations + POI       │
│ ✅ Phase 1b: Charger donnée CMS front       │
└─────────────────────────────────────────────┘

┌─ SEMAINE 2 ─────────────────────────────────┐
│ ✅ Phase 2: Tables places + recipes + media │
│ ✅ Phase 2b: Relancer admin UI              │
│ ✅ Phase 2c: Valider end-to-end             │
└─────────────────────────────────────────────┘

┌─ SEMAINE 3+ ────────────────────────────────┐
│ ✅ Phase 3: Cleanup + optimisations         │
│ ✅ Phase 3b: Blocs modulaires (futur)       │
└─────────────────────────────────────────────┘
```

---

## PHASE 0 : Fusion `feat/cms-30-phase1`

### Objectif
Embarquer l'architecture cms_editable_zones + hooks dans main.

### Étapes

**0.1 — Vérifier branche**
```bash
git fetch origin feat/cms-30-phase1
git log main..origin/feat/cms-30-phase1 --oneline | head -30
git diff main..origin/feat/cms-30-phase1 --stat
```

**Checklist :**
- ✅ Arrivée à 843fba7 (CMS 3.0 Phase 1 commit)
- ✅ cms_editable_zones table OK
- ✅ useContentLoader, useSiteSettings hooks OK
- ✅ Header/Footer refactor OK
- ⚠️ Admin pages supprimées → à relancer après

**0.2 — Merge en local, test**
```bash
git checkout main
git pull origin main
git merge origin/feat/cms-30-phase1 --no-ff --signoff
# Test build, typecheck
npm run build
npx tsc --noEmit
```

**Risques :**
- Admin pages cassées (attendu, seront refaites)
- API routes peuvent avoir changé
- RLS policies peuvent être dures

**Rollback :**
```bash
git reset --hard main
git merge --abort
```

**0.3 — Push + PR**
```bash
git push origin main
# Ou si pas de CI:
git push -u origin main
```

---

## PHASE 1 : Tables critiques (destinations, POI)

### Migrations SQL (ordre exécution)

#### **Migration 1.1** — Créer `cms_destinations`

```sql
-- File: supabase/migrations/20260730_create_cms_destinations.sql

CREATE TABLE IF NOT EXISTS cms_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  country text NOT NULL,
  region text,
  intro text,
  tagline text,
  hero text DEFAULT '/og-default.jpg',
  type text DEFAULT 'region' CHECK (type IN ('city', 'region', 'coastal', 'countryside')),
  tags text[] DEFAULT '{}',
  seo_title text,
  seo_desc text,
  is_active boolean DEFAULT true,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slug)
);

ALTER TABLE cms_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active destinations" ON cms_destinations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin write destinations" ON cms_destinations
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_destinations_slug ON cms_destinations(slug);
CREATE INDEX idx_destinations_active ON cms_destinations(is_active);

-- Seed: destinations existantes
INSERT INTO cms_destinations (slug, name, country, region, intro, hero, is_active, display_order)
VALUES
  ('paris', 'Paris', 'France', 'Île-de-France', 'Capitale française...', '/og-default.jpg', true, 1),
  ('lisbonne', 'Lisbonne', 'Portugal', 'Lisbonne', 'Capitale portugaise...', '/og-default.jpg', true, 2),
  ('hyeres', 'Hyères', 'France', 'Provence', 'Perle côtière méditerranéenne...', '/og-default.jpg', true, 3),
  ('le-havre', 'Le Havre', 'France', 'Normandie', 'Port historique atlantique...', '/og-default.jpg', true, 4),
  ... (autres 15+ destinations existantes)
;
```

**Validation :**
```sql
SELECT slug, name, is_active FROM cms_destinations WHERE is_active = true ORDER BY display_order;
-- Expect: 20+ rows
```

**Rollback :**
```sql
DROP TABLE IF EXISTS cms_destinations CASCADE;
```

---

#### **Migration 1.2** — Créer `cms_pois`

```sql
-- File: supabase/migrations/20260730_create_cms_pois.sql

CREATE TABLE IF NOT EXISTS cms_pois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL REFERENCES cms_destinations(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  latitude decimal(10,6),
  longitude decimal(10,6),
  description text,
  excerpt text,
  image text,
  type text DEFAULT 'landmark' CHECK (type IN ('landmark', 'viewpoint', 'nature', 'cultural', 'food')),
  tags text[] DEFAULT '{}',
  related_article_slug text,
  related_place_id uuid,
  is_active boolean DEFAULT true,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_pois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active pois" ON cms_pois
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin write pois" ON cms_pois
  FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_pois_destination ON cms_pois(destination_id);
CREATE INDEX idx_pois_coords ON cms_pois(latitude, longitude);

-- Seed: POI de destinations-data.ts (50+ points)
INSERT INTO cms_pois (destination_id, slug, name, latitude, longitude, description, excerpt, type, is_active)
SELECT 
  d.id,
  'funchal',
  'Funchal',
  32.6499,
  -16.9077,
  'Vieille ville, marchés, gastronomie...',
  'Vieille ville et cuisines atlantique',
  'city',
  true
FROM cms_destinations d WHERE d.slug = 'madere'
UNION ALL
SELECT 
  d.id,
  'porto-moniz',
  'Porto Moniz',
  32.8225,
  -17.1680,
  'Piscines naturelles volcaniques...',
  'Baignoires naturelles creusées dans lave',
  'nature',
  true
FROM cms_destinations d WHERE d.slug = 'madere'
... (tous les POI existants)
;
```

**Validation :**
```sql
SELECT COUNT(*) FROM cms_pois WHERE is_active = true;
-- Expect: ~50 rows
```

---

### Front-end changes (Phase 1b)

#### **Changement 1.1** — Remplacer `destinations-data.ts`

**Avant :** `components/DestinationCard.tsx` et pages chargeaient depuis `lib/destinations-data.ts`

**Après :** Charger depuis Supabase

```typescript
// lib/destinations-supabase.ts (CRÉER)

import { supabase } from './supabase-client';

export async function getDestinations() {
  const { data, error } = await supabase
    .from('cms_destinations')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data;
}

export async function getPoisByDestination(destination_id: string) {
  const { data, error } = await supabase
    .from('cms_pois')
    .select('*')
    .eq('destination_id', destination_id)
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data;
}
```

#### **Changement 1.2** — Remplacer `HomeClient.tsx`

```typescript
// components/HomeClient.tsx — remplacer destinationMarkers hardcodé

export default async function HomeClient() {
  // Avant : utiliser FALLBACK_HOME_DESTINATIONS
  // Après :
  
  const { data: homeDestinations } = await supabase
    .from('cms_home_destinations')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  
  const { data: zones } = await supabase
    .from('cms_editable_zones')
    .select('*')
    .eq('page', 'home')
    .eq('is_active', true);
  
  // Render avec données CMS au lieu de hardcode
  return <DestinationGrid destinations={homeDestinations} />;
}
```

#### **Changement 1.3** — Pages destinations dynamiques

```typescript
// app/destinations/[slug]/page.tsx

export default async function DestinationPage({ params }: any) {
  // Avant : charge depuis pillar-data.ts (fallback)
  // Après : charge depuis cms_destinations OU cms_pillar_pages
  
  const { data: pillar } = await supabase
    .from('cms_pillar_pages')
    .select('*')
    .eq('slug', params.slug)
    .single();
  
  if (!pillar) {
    const { data: regular } = await supabase
      .from('cms_destinations')
      .select('*')
      .eq('slug', params.slug)
      .single();
    
    if (!regular) return <NotFound />;
    
    // Render regular destination
    return <DestinationPage destination={regular} />;
  }
  
  // Render pillar page
  return <PillarPage pillar={pillar} />;
}
```

### Déploiement Phase 1

**Checklist avant deploy :**
- ✅ Migrations runées en dev
- ✅ Data migré de destinations-data.ts
- ✅ Build OK
- ✅ Pages destinations testées (load, SEO, images)
- ✅ Hub destinations affiche nouvelle data
- ✅ Maps chargent POI depuis Supabase
- ✅ Slugs intacts, pas de 404

**Ordre :**
1. Merger code (HomeClient, pages destinations)
2. Exécuter migrations Supabase (1.1, 1.2)
3. Vérifier data migrée
4. Déployer Vercel
5. Test production

---

## PHASE 2 : Tables supplémentaires (places, recipes, media)

### Migrations SQL

#### **Migration 2.1** — Créer `cms_places`

```sql
-- File: supabase/migrations/20260730_create_cms_places.sql

CREATE TABLE IF NOT EXISTS cms_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL REFERENCES cms_destinations(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  city text,
  address text,
  latitude decimal(10,6),
  longitude decimal(10,6),
  description text,
  image text,
  type text DEFAULT 'restaurant' CHECK (type IN ('restaurant', 'cafe', 'shop', 'stay', 'activity')),
  budget text,
  opening_hours text,
  tags text[] DEFAULT '{}',
  website text,
  phone text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active places" ON cms_places FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write places" ON cms_places FOR ALL USING (auth.role() = 'service_role');
CREATE INDEX idx_places_destination ON cms_places(destination_id);
CREATE INDEX idx_places_type ON cms_places(type);
```

**Seed :** Lieux testés Heldonica (à enrichir manuellement)

---

#### **Migration 2.2** — Créer `cms_recipes`

```sql
-- File: supabase/migrations/20260730_create_cms_recipes.sql

CREATE TABLE IF NOT EXISTS cms_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  destination_id uuid REFERENCES cms_destinations(id) ON DELETE SET NULL,
  story text,
  intro text,
  ingredients jsonb NOT NULL DEFAULT '[]',
  steps jsonb NOT NULL DEFAULT '[]',
  time_minutes integer,
  difficulty text DEFAULT 'medium',
  servings integer DEFAULT 2,
  featured_image text,
  images text[] DEFAULT '{}',
  origin text,
  tags text[] DEFAULT '{}',
  seo_title text,
  seo_desc text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active recipes" ON cms_recipes FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write recipes" ON cms_recipes FOR ALL USING (auth.role() = 'service_role');
CREATE INDEX idx_recipes_destination ON cms_recipes(destination_id);
```

---

#### **Migration 2.3** — Créer `cms_media_assets`

```sql
-- File: supabase/migrations/20260730_create_cms_media_assets.sql

CREATE TABLE IF NOT EXISTS cms_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  url text NOT NULL UNIQUE,
  alt_text text,
  caption text,
  credit text,
  width integer,
  height integer,
  file_size integer,
  mime_type text,
  entity_type text CHECK (entity_type IN ('pillar', 'destination', 'poi', 'place', 'recipe', 'blog_post', 'global')),
  entity_id uuid,
  entity_slug text,
  is_featured boolean DEFAULT false,
  order_index integer,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cms_media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active media" ON cms_media_assets FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write media" ON cms_media_assets FOR ALL USING (auth.role() = 'service_role');
CREATE INDEX idx_media_entity ON cms_media_assets(entity_type, entity_id);
CREATE INDEX idx_media_active ON cms_media_assets(is_active);
```

**Seed :** Images existantes (manuel ou script)

---

### Admin UI relance (Phase 2b)

Recréer admin pages supprimées par feat/cms-30-phase1 :

- `/admin/destinations` — CRUD cms_destinations
- `/admin/places` — CRUD cms_places
- `/admin/recipes` — CRUD cms_recipes
- `/admin/media` — CRUD cms_media_assets, upload Supabase Storage

(Détails de UI dans prochain document spécialisé)

---

## PHASE 3 : Cleanup + optimisations

### 3.1 — Archiver legacy tables

```sql
-- Option 1 : Supprimer
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;

-- Option 2 : Archiver (plus sûr)
ALTER TABLE articles RENAME TO articles_archive_20260730;
ALTER TABLE destinations RENAME TO destinations_archive_20260730;
```

### 3.2 — Nettoyer hardcodes

**Fichiers à supprimer :**
```bash
rm lib/destinations-data.ts        # Migré en cms_destinations
rm lib/home-data.ts                # Migré en cms_home_destinations + cms_editable_zones
# Garder lib/pillar-data.ts (fallback)
# Garder lib/cms-page-defaults.ts (fallback)
```

**Fichiers à modifier :**
```bash
lib/constants.ts                   # Retirer catégories hardcodées
lib/brand-voice.ts                 # Optionnel
# Garder tout fallback comme secours
```

### 3.3 — Optimisations queries

```typescript
// lib/destinations-cache.ts (CRÉER)

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function getDestinations(forceRefresh = false) {
  if (!forceRefresh && cache.has('destinations')) {
    return cache.get('destinations');
  }
  
  const data = await supabase.from('cms_destinations')...;
  cache.set('destinations', data);
  setTimeout(() => cache.delete('destinations'), CACHE_TTL);
  return data;
}
```

---

## Stratégie de migration DONNÉES

### Destinations

```sql
-- Script: migrate_destinations_data.sql

INSERT INTO cms_destinations (slug, name, country, region, intro, hero, is_active, display_order)
VALUES
  ('paris', 'Paris', 'France', 'Île-de-France', '...', '/og-default.jpg', true, 1),
  ('lisbonne', 'Lisbonne', 'Portugal', 'Lisbonne', '...', '/og-default.jpg', true, 2),
  ... (tous les 20+ destinations de destinations-data.ts)
;

-- Vérifier
SELECT COUNT(*) FROM cms_destinations;
-- Expect: 20+
```

### POI

```sql
-- Script: migrate_pois_data.sql

-- À partir de destinationMarkers dans destinations-data.ts
INSERT INTO cms_pois (destination_id, slug, name, latitude, longitude, description, excerpt, type, is_active)
SELECT 
  (SELECT id FROM cms_destinations WHERE slug = <dest_slug>),
  <marker_slug>,
  <marker_title>,
  <marker_latitude>,
  <marker_longitude>,
  <marker_excerpt>,
  <marker_excerpt>,
  <marker_category>,
  true
... (migrer tous les ~50 POI)
;

-- Vérifier
SELECT COUNT(*) FROM cms_pois;
-- Expect: ~50
```

### Settings

```sql
-- Script: migrate_settings.sql

-- De cms-page-defaults.ts → cms_editable_zones
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value, is_active)
VALUES
  ('home', 'hero_title', 'text', 'Slow travel vécu en duo...', true),
  ('home', 'hero_subtitle', 'text', 'On ferme les ordis...', true),
  ('blog', 'title', 'text', 'Blog Slow Travel...', true),
  ... (~200 zones)
;

-- Vérifier
SELECT COUNT(*) FROM cms_editable_zones WHERE page IN ('home', 'blog', 'travel-planning', 'a-propos', 'contact');
-- Expect: ~200
```

---

## Précautions & Rollback

### Avant migration

1. **Backup Supabase** (manuel)
   ```bash
   pg_dump -h <supabase-host> -U <user> <db> > backup_20260730.sql
   ```

2. **Test en staging** avec données réelles
   ```bash
   vercel env pull
   npm run build
   npm run dev
   # Tester pages destinations, home, POI on maps
   ```

3. **Vérifier SEO**
   ```bash
   # URLs doivent être identiques
   # Slugs pas changés
   # Canonical tags OK
   ```

### Rollback complet

```sql
-- Si catastrophe
DROP TABLE cms_destinations CASCADE;
DROP TABLE cms_pois CASCADE;
DROP TABLE cms_places CASCADE;
DROP TABLE cms_recipes CASCADE;
DROP TABLE cms_media_assets CASCADE;

-- Restaurer depuis backup
psql -h <supabase-host> -U <user> <db> < backup_20260730.sql
```

**Temps rollback :** ~10 min (manuels)

---

## Validation end-to-end

### Checklist de test

**Après Phase 1 :**
- ✅ Home page charge destinations depuis cms_home_destinations
- ✅ `/destinations/[slug]` pages load (piliers + régulières)
- ✅ `/destinations/carte` affiche POI depuis cms_pois
- ✅ Slugs identiques (aucun 404)
- ✅ SEO titles/descriptions OK
- ✅ Images chargent (og-default.jpg)

**Après Phase 2 :**
- ✅ Lieux affichent sur cartes
- ✅ Recettes listent et renderent
- ✅ Admin panel relancé (destinations, places, recipes, media)
- ✅ Upload image fonctionne

**Après Phase 3 :**
- ✅ Aucun hardcode en `/lib/destinations-data.ts`, `/lib/home-data.ts`
- ✅ Performances OK (pas de N+1 queries)
- ✅ No console errors
- ✅ Lighthouse score stable

---

## Ordre d'implémentation EXACT

```
JOUR 1 — Phase 0
  ✅ Merger feat/cms-30-phase1

JOUR 2 — Phase 1 (Migrations)
  ✅ Migration 1.1 (cms_destinations)
  ✅ Migration 1.2 (cms_pois)
  ✅ Seed data (destinations + POI)

JOUR 3 — Phase 1 (Code)
  ✅ Créer lib/destinations-supabase.ts
  ✅ Modifier HomeClient.tsx
  ✅ Modifier app/destinations/[slug]/page.tsx
  ✅ Test local

JOUR 4 — Phase 1 (Deploy)
  ✅ Build + typecheck
  ✅ Deploy Vercel
  ✅ Smoke tests production

JOUR 5-6 — Phase 2 (Migrations + Code)
  ✅ Créer tables places, recipes, media
  ✅ Relancer admin UI
  ✅ Deploy

JOUR 7 — Phase 3 (Cleanup)
  ✅ Archiver legacy tables
  ✅ Nettoyer hardcodes
  ✅ Optimiser queries
  ✅ Final tests
```

---

## Document suivant

**Lire : DIAGRAMME ARCHITECTURE CMS** (image/diagram)
