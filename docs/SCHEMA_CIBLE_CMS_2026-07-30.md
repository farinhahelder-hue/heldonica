# 🏗️ SCHÉMA CIBLE SUPABASE — HELDONICA CMS

## Principes d'architecture

1. **Relationnel d'abord** — tables propres, clés étrangères, pas de doublons
2. **JSONB seulement pour le variable** — blocs modulaires, métadata souple
3. **Une source de vérité par entité** — pas de duplication fonctionnelle
4. **Pas d'hardcode durable** — tout éditable via CMS
5. **Traçabilité** — timestamps, audit trail basique

---

## Modèle de données FINAL

### 🌍 Destinations (3 niveaux)

#### `cms_pillar_pages` (EXISTE, À ENRICHIR)

```sql
CREATE TABLE cms_pillar_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,          -- 'madere', 'lisbonne', etc.
  name text NOT NULL,                 -- 'Madère', 'Lisbonne'
  country text NOT NULL,              -- 'Portugal', 'Portugal'
  region text,                        -- 'Atlantique', 'Île', etc.
  
  -- Contenu
  flag text,                          -- '🇵🇹'
  hero text,                          -- URL image hero
  tagline text,                       -- 1-line tagline
  hero_subtitle text,                 -- 2-3 lines sous-titre
  intro text,                         -- 3-4 paragraphes intro (text, pas array)
  
  -- Pratique
  budget integer,                     -- € / couple / semaine
  season text,                        -- 'Avril–juin / Sept–oct'
  flight text,                        -- '~2h30 depuis Paris'
  visa text,                          -- 'Non (UE)'
  currency text,                      -- 'Euro'
  language text,                      -- 'Portugais'
  
  -- Complexe (JSONB seulement ici)
  info_table jsonb DEFAULT '[]',      -- [{label, value}]
  itinerary jsonb DEFAULT '[]',       -- [{day, title, activities[], tip}]
  budget_breakdown jsonb DEFAULT '[]',-- [{label, pct, amount}]
  faq jsonb DEFAULT '[]',             -- [{q, a}]
  tested_by_heldonica jsonb,          -- {when, duration, withWho, highlights[], keyInsight}
  verdict jsonb,                      -- {score, forWho, strengths[], considerations[], finalWord}
  
  -- SEO
  seo_title text,
  seo_desc text,
  
  -- Meta
  is_active boolean DEFAULT true,
  is_pillar boolean DEFAULT true,     -- NEW: marquer explicitement
  display_order integer,              -- Pour tri home/hub
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX idx_pillar_slug (slug),
  INDEX idx_pillar_active (is_active, is_pillar)
);
```

**Notes :**
- Garder structure existante (JSONB pour itinerary, FAQ, verdict c'est bon — ce sont des blocs figés)
- Ajouter `is_pillar` pour distinction claire
- Ajouter `display_order` pour trier dans le hub

---

#### `cms_destinations` (CRÉER)

```sql
CREATE TABLE cms_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,          -- 'paris', 'lisbonne', 'hyeres'
  name text NOT NULL,                 -- 'Paris', 'Lisbonne', 'Hyères'
  country text NOT NULL,              -- 'France', 'Portugal', 'France'
  region text,                        -- 'Île-de-France', 'Stréjal', 'PACA'
  
  -- Contenu simple
  intro text,                         -- 3-4 lignes présentation
  tagline text,                       -- Phrase court
  hero text,                          -- URL image
  
  -- Metadata
  type text CHECK (type IN ('city', 'region', 'coastal', 'countryside')),
  tags text[],                        -- ['slow-travel', 'nature', 'food']
  
  -- SEO
  seo_title text,
  seo_desc text,
  
  -- Status
  is_active boolean DEFAULT true,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX idx_destinations_slug (slug),
  INDEX idx_destinations_active (is_active)
);
```

**Différence vs pillar :**
- Piliers = pages hero complètes (itinéraire, budget, verdict)
- Destinations régulières = intro + lien vers articles/POI connexes

---

#### `cms_pois` (CRÉER — Points d'Intérêt)

```sql
CREATE TABLE cms_pois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL REFERENCES cms_destinations(id) ON DELETE CASCADE,
  
  slug text UNIQUE NOT NULL,          -- 'funchal', 'porto-moniz', 'taormine'
  name text NOT NULL,                 -- 'Funchal', 'Porto Moniz', 'Taormine'
  
  -- Geo
  latitude decimal(10,6) NOT NULL,
  longitude decimal(10,6) NOT NULL,
  
  -- Contenu
  description text,                   -- 1-2 paragraphes
  excerpt text,                       -- 1 ligne résumé
  image text,                         -- URL photo
  
  -- Metadata
  type text CHECK (type IN ('landmark', 'viewpoint', 'nature', 'cultural', 'food')),
  tags text[],                        -- ['randonnée', 'vue', 'authenticité']
  
  -- Relations
  related_article_slug text,          -- FK optionnel vers cms_blog_posts
  related_place_id uuid,              -- FK optionnel vers cms_places
  
  -- Status
  is_active boolean DEFAULT true,
  display_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX idx_pois_destination (destination_id),
  INDEX idx_pois_coords (latitude, longitude),
  INDEX idx_pois_active (is_active)
);
```

**Usage :** Cartes destinations, listes POI, exploration locale

---

### 🏪 Lieux, Restaurants, Cafés

#### `cms_places` (CRÉER)

```sql
CREATE TABLE cms_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL REFERENCES cms_destinations(id) ON DELETE CASCADE,
  
  slug text UNIQUE NOT NULL,          -- 'cafe-lisboa-funchal'
  name text NOT NULL,                 -- 'Café Lisboa'
  
  -- Localisation
  city text,                          -- 'Funchal', 'Paris'
  address text,                       -- 'Rue Saint-André, 5ème'
  latitude decimal(10,6),
  longitude decimal(10,6),
  
  -- Contenu
  description text,                   -- Note éditoriale (2-3 paragraphes)
  image text,                         -- Photo principale
  
  -- Pratique
  type text CHECK (type IN ('restaurant', 'cafe', 'shop', 'stay', 'activity')),
  budget text,                        -- '€€', '€€€', 'gratuit'
  opening_hours text,                 -- JSON ou texte simple
  
  -- Relations
  tags text[],                        -- ['slow-travel', 'local', 'terrasse', 'gastronomie']
  related_recipe_id uuid,             -- FK optionnel vers cms_recipes
  website text,
  phone text,
  
  -- Status
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX idx_places_destination (destination_id),
  INDEX idx_places_type (type)
);
```

**Usage :** Lieux slow travel, restaurants testés, cafés à découvrir

---

### 🍳 Recettes

#### `cms_recipes` (CRÉER)

```sql
CREATE TABLE cms_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,          -- 'espetada-madere'
  title text NOT NULL,                -- 'Espetada de Madère'
  
  -- Contexte
  destination_id uuid REFERENCES cms_destinations(id) ON DELETE SET NULL,
  story text,                         -- Contexte/provenance (2-3 paragraphes)
  intro text,                         -- Présentation courte (1 ligne)
  
  -- Recette
  ingredients jsonb NOT NULL,         -- [{name, quantity, unit}]
  steps jsonb NOT NULL,               -- [{order, description}]
  
  -- Metadata
  time_minutes integer,               -- Temps total en minutes
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  servings integer DEFAULT 2,
  
  -- Visuel
  images text[],                      -- URLs photos (hero + étapes)
  featured_image text,                -- Image principale
  
  -- Éditorial
  origin text,                        -- 'Madère', 'Lisbonne', etc.
  tags text[],                        -- ['gastronomie', 'végétarien', 'slow-food']
  
  -- SEO
  seo_title text,
  seo_desc text,
  
  -- Status
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX idx_recipes_destination (destination_id),
  INDEX idx_recipes_active (is_active)
);
```

**Usage :** Guide gastronomique lié aux destinations, articles recettes

---

### 📸 Media Assets (centralisé)

#### `cms_media_assets` (CRÉER)

```sql
CREATE TABLE cms_media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fichier
  storage_path text NOT NULL,         -- 'images/madere/funchal-market.jpg'
  url text NOT NULL UNIQUE,           -- URL complète (Supabase Storage ou CDN)
  
  -- Métadata image
  alt_text text,                      -- Texte alternatif (requis)
  caption text,                       -- Légende optionnelle
  credit text,                        -- Crédit photographe
  width integer,
  height integer,
  file_size integer,                  -- En bytes
  mime_type text,                     -- 'image/jpeg', etc.
  
  -- Relation à entité
  entity_type text CHECK (entity_type IN ('pillar', 'destination', 'poi', 'place', 'recipe', 'blog_post', 'global')),
  entity_id uuid,                     -- ID de l'entité (si applicable)
  entity_slug text,                   -- 'madere', 'espetada-madere', etc. (pour lookup)
  
  -- Usage
  is_featured boolean DEFAULT false,  -- Image principale / hero
  order_index integer,                -- Pour galeries multi-images
  tags text[],                        -- ['hero', 'gallery', 'thumbnail']
  
  -- Status
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  INDEX idx_media_entity (entity_type, entity_id),
  INDEX idx_media_active (is_active)
);
```

**Usage :** 
- Centraliser toutes les images du site
- Éviter Unsplash/wp-content/og-default spread-out
- Traçabilité crédit et alt-text
- Galeries multi-images par entité

---

### 📄 Blog (déjà bon, étendre légèrement)

#### `cms_blog_posts` (EXISTE, À ENRICHIR)

```sql
-- Structure existante OK, ajouter:

ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS
  featured_image_id uuid REFERENCES cms_media_assets(id) ON DELETE SET NULL;

ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS
  related_destination_ids uuid[],     -- Destinations mentionnées

ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS
  related_place_ids uuid[],           -- Lieux mentionnés

ALTER TABLE cms_blog_posts ADD COLUMN IF NOT EXISTS
  related_recipe_ids uuid[],          -- Recettes mentionnées
```

**Usage :** Relations éditorielles entre contenus

---

### ⚙️ Settings Globaux (étendre)

#### `cms_editable_zones` (DE feat/cms-30-phase1, À ÉTENDRE)

```sql
-- Existant OK. Ajouter seeds pour :

INSERT INTO cms_editable_zones (page, zone_key, zone_type, value, is_active) VALUES
  -- Home
  ('home', 'hero_badge', 'text', 'Slow travel vécu en duo', true),
  ('home', 'hero_title', 'text', 'Carnets de terrain, enfin vécu.', true),
  ('home', 'hero_subtitle', 'text', 'On ferme les ordis...', true),
  ('home', 'hero_cta_label', 'cta', 'Planifier mon voyage', true),
  ('home', 'hero_image', 'image', '/og-default.jpg', true),
  
  -- Blog
  ('blog', 'hero_title', 'text', 'Blog Slow Travel', true),
  ('blog', 'empty_text', 'text', 'Aucun article pour le moment', true),
  
  -- Travel planning
  ('travel-planning', 'hero_title', 'text', 'Conçu sur mesure pour vous', true),
  
  -- À-propos
  ('a-propos', 'hero_title', 'text', 'Notre histoire', true),
  ('a-propos', 'values_title', 'text', 'Nos valeurs', true),
  
  -- Global
  ('global', 'header_site_name', 'text', 'Heldonica', true),
  ('global', 'footer_tagline', 'text', 'Slow travel vécu, conçu pour toi.', true),
  ('global', 'social_instagram', 'text', 'https://www.instagram.com/heldonica/', true),
  ('global', 'contact_email', 'text', 'contact@heldonica.fr', true),
  ... (hériter de cms-page-defaults.ts)
;
```

---

### 🏠 Home Destinations (déjà créée, à utiliser)

#### `cms_home_destinations` (EXISTE, À CHARGER)

**Usage :** HomeClient.tsx doit charger depuis là au lieu de home-data.ts

```sql
-- Structure existante OK
SELECT * FROM cms_home_destinations WHERE is_active = true ORDER BY display_order;
```

---

## Relations & Clés Étrangères

```
cms_pillar_pages (Madère, Monténégro, Roumanie)
    ↓
    ├→ cms_media_assets (hero, photos itinéraire)
    ├→ cms_pois (points intérêt: Funchal, Porto Moniz...)
    ├→ cms_places (restaurants testés)
    └→ cms_recipes (recettes locales)

cms_destinations (Paris, Lisbonne, Hyères, etc.)
    ↓
    ├→ cms_media_assets (hero, galerie)
    ├→ cms_pois
    ├→ cms_places
    ├→ cms_recipes
    └→ cms_blog_posts (articles liés)

cms_blog_posts
    ├→ cms_media_assets (featured_image)
    ├→ cms_destinations[]
    ├→ cms_places[]
    └→ cms_recipes[]

cms_editable_zones (global settings)
    └→ Page-specific values (home, blog, travel-planning, etc.)
```

---

## JSONB Usage Policy

### ✅ OUI, utiliser JSONB pour :

- **Itinéraire** (jours complexes, tips multiples) — `cms_pillar_pages.itinerary`
- **FAQ** (Q&A pairs variables) — `cms_pillar_pages.faq`
- **Verdict** (structure riche, variable) — `cms_pillar_pages.verdict`
- **Blocs de page** (sections modulaires) — future `cms_page_sections`
- **Ingredients/steps** (recettes variables) — `cms_recipes.ingredients`, `steps`
- **Metadata souple** — partout où config variable

### ❌ NON, utiliser relations/colonnes pour :

- **Destinations** (slug, name, country) → colonnes
- **POI** (latitude, longitude, type) → colonnes
- **Lieux** (address, phone, opening_hours) → colonnes (ou JSON texte simplifié)
- **Images** (alt_text, caption, credit) → colonnes (single source of truth)
- **Blog categories** → `cms_categories` table
- **Tags** → text[] (ou future `cms_tags` table pour relation many-to-many)

---

## Migrations Ordre

1. ✅ Merger `feat/cms-30-phase1` (cms_editable_zones)
2. ⚠️ Créer `cms_destinations`, `cms_pois`
3. ⚠️ Créer `cms_places`, `cms_recipes`
4. ⚠️ Créer `cms_media_assets`
5. ⚠️ Etendre `cms_editable_zones` avec seeds
6. ⚠️ Étendre `cms_pillar_pages` (ajouter `is_pillar`, `display_order`)
7. ⚠️ Optionnel : Archiver `articles`, `destinations` legacy

---

## Stratégie de migration de données

### Destinations existantes → `cms_destinations`

```sql
-- Destinations actuelles hardcodées dans destinations-data.ts
-- Migrer: slug, name, country, region, intro (généré), image (og-default.jpg)

INSERT INTO cms_destinations (slug, name, country, region, intro, intro, hero, is_active)
VALUES 
  ('paris', 'Paris', 'France', 'Île-de-France', 'Capitale française...', '/og-default.jpg', true),
  ('lisbonne', 'Lisbonne', 'Portugal', 'Lisbonne', 'Capitale portugaise...', '/og-default.jpg', true),
  ... (20+ destinations existantes)
;
```

### POI existants → `cms_pois`

```sql
-- destinationMarkers de destinations-data.ts
-- Migrer: slug, name, latitude, longitude, excerpt → description, category → type

INSERT INTO cms_pois (destination_id, slug, name, latitude, longitude, description, type, is_active)
SELECT 
  (SELECT id FROM cms_destinations WHERE slug = 'madere'), 
  'funchal', 'Funchal', 32.6499, -16.9077, 'Vieille ville...', 'city', true
FROM destinationMarkers
WHERE destination = 'Madère'
;
```

### Settings → `cms_editable_zones`

```sql
-- PAGE_DEFAULTS de cms-page-defaults.ts
-- Migrer clé/valeur en zones éditables par page

INSERT INTO cms_editable_zones (page, zone_key, zone_type, value, is_active)
VALUES ('home', 'hero_title', 'text', 'Slow travel vécu en duo...', true);
-- ... (~200 entrées)
```

---

## Prochaine étape

**Lire DOCUMENT 3 — Plan de migration**
