# 📋 AUDIT COMPLET CMS — HELDONICA 2026-07-30

## Résumé exécutif

Heldonica est en **transition CMS incomplète** :
- ✅ Tables Supabase créées pour piliers, blog, settings
- ✅ Admin panel en place (`/admin`, `/cms-admin`)
- ✅ Branche `feat/cms-30-phase1` a posé une architecture solide (cms_editable_zones)
- ❌ **3 fichiers hardcodent 80% du contenu éditorial critique**
- ❌ Pages destinatons, POI, lieux, recettes pas centralisées
- ❌ Contenus hardcodés et CMS utilisés en parallèle (risque de désync)

**Conclusion:** Le CMS existe mais n'est pas utilisé comme source unique de vérité. Refactor requis pour unifier.

---

## 1. État actuel des tables Supabase

### Tables ACTIVES (utilisées en production)

| Table | Créée | Colonnes clés | Utilisation | État |
|-------|-------|---------------|-------------|------|
| `cms_pillar_pages` | 2026-07-19 | slug, name, intro[], itinerary[], budget, verdict | Destinations piliers (Madère, Monténégro, Roumanie) | ✅ LIVE |
| `cms_blog_posts` | 2026-06-08 | title, slug, content, featured_image, category, published_at | Articles blog | ✅ LIVE |
| `cms_settings` | 2026-06-02 | key, value, type | Settings globaux (contacts, footer, réseaux) | ⚠️ PARTIAL |
| `cms_editable_zones` | 2026-06-29 (feat/cms-30-phase1) | page, zone_key, zone_type, value, is_active | Page content zones (Header, Footer) | ✅ GOOD |
| `contact_messages` | 2025-06-23 | name, email, subject, message, created_at | Form submissions | ✅ ACTIVE |
| `demandes_travel` | 2026-07-09 | traveler_name, email, destination, dates, budget, created_at | Travel planning CRM | ✅ ACTIVE |
| `cms_categories` | 2026-07-03 | name, slug | Blog categories | ✅ OK |
| `carousel_history` | 2026-05-02 | video_url, transcript, created_at | Short videos/carousel | ✅ ACTIVE |

### Tables PARTIAL (créées mais peu exploitées)

| Table | But | État | Bloc |
|-------|-----|------|------|
| `cms_home_destinations` | Destinations affichées à la home | ⚠️ Existe mais jamais utilisée | HomeClient charge hardcode |
| `cms_testimonials` | Témoignages travel | ⚠️ Créée, seed data vide | Pas d'UI admin pour éditer |
| `cms_pricing` | Tarifs travel planning | ⚠️ Créée, peu populée | Admin pricing page supprimée |
| `cms_redirects` | URL redirects | ⚠️ Créée, non intégrée | Vercel redirects en dur |
| `guide_items` | Ressources/guides | ⚠️ Créée, mal structurée | Pas de relation avec destinations |

### Tables LEGACY (à consolider/supprimer)

| Table | Raison | Plan |
|-------|--------|------|
| `articles` | Anciens articles avant cms_blog_posts | Fusionner dans cms_blog_posts ou archiver |
| `destinations` | Destinations génériques pré-CMS | Créer cms_destinations, migrer contenu |

---

## 2. Audit des hardcodes critiques

### Fichier 🔴 CRITIQUE #1 : `lib/cms-page-defaults.ts`

**Taille :** ~200 lignes

**Contenu :**
```typescript
'home__hero_title': 'Slow travel vécu en duo, conçu pour toi',
'home__hero_subtitle': 'On ferme les ordis...',
'home__hero_cta_label': 'Planifier mon voyage',
'blog__title': 'Blog Slow Travel — Carnets de Route...',
'travel-planning__hero_title': 'Conçu sur mesure pour vous',
'a-propos__hero_title': 'Notre histoire',
'contact__hero_title': 'Contactez-nous',
... (~150 autres clés)
```

**Impact :**
- Home, blog, travel-planning, à-propos, contact **ne lisent pas le CMS**
- Tous les textes d'interface gelés dans le code
- Impossible de changer un CTA ou un titre sans redéployer

**Priorité :** 🔴 **CRITIQUE**

**Action :** Migrer dans `cms_editable_zones` (par page : `home`, `blog`, `travel-planning`, `a-propos`, `contact`)

---

### Fichier 🔴 CRITIQUE #2 : `lib/home-data.ts`

**Taille :** ~100 lignes

**Contenu :**
```typescript
export const FALLBACK_HOME_DESTINATIONS: HomeDestination[] = [
  { destination_slug: 'madere', title: 'Madère', tagline: 'Île de l\'Éternel Printemps', ... },
  { destination_slug: 'roumanie', title: 'Roumanie', ... },
  { destination_slug: 'montenegro', title: 'Monténégro', ... },
  { destination_slug: 'sicile', title: 'Sicile', ... },
];

export const FALLBACK_HOME_ZONES: Record<string, string> = {
  'hero_badge': 'Slow travel vécu en duo · Hors sentiers · Paris',
  'hero_title': 'Carnets de terrain, enfin vécu.',
  'hero_cta': 'Planifier mon voyage',
  ... (~20 autres zones)
};
```

**Impact :**
- Home page **toujours affiche fallback** même si `cms_home_destinations` existe en base
- Modifications cms_home_destinations ne remontent pas au front
- HomeClient.tsx charge hardcode plutôt que DB

**Priorité :** 🔴 **CRITIQUE**

**Action :** Remplacer par fetch depuis `cms_home_destinations` + `cms_editable_zones` (page='home')

---

### Fichier 🔴 CRITIQUE #3 : `lib/destinations-data.ts`

**Taille :** ~500 lignes

**Contenu :**
```typescript
export const destinationMarkers: DestinationMarker[] = [
  {
    slug: 'madere',
    title: 'Madère, l\'île de l\'éternel printemps',
    excerpt: 'Randonnées volcaniques, levadas...',
    latitude: 32.6669,
    longitude: -16.9241,
    category: 'nature',
    country: 'Portugal',
    region: 'Atlantique',
    url: '/destinations/madere',
  },
  // ... ~50 autres POI (Funchal, Porto Moniz, Taormine, Palerme, etc.)
];
```

**Impact :**
- Hub destinations `[slug]/page.tsx` affiche hardcode
- Maps ne peuvent pas afficher nouvelles destinations sans code
- POI figés, impossible d'en ajouter via CMS
- Descriptions, catégories, coordonnées pas modifiables en produit

**Priorité :** 🔴 **CRITIQUE**

**Action :** 
- Créer table `cms_destinations` (non-piliers)
- Créer table `cms_pois` (points d'intérêt)
- Migrer destinationMarkers en données

---

### Fichier 🟡 MOYENNE #4 : `lib/pillar-data.ts`

**Taille :** ~2000 lignes

**Contenu :**
```typescript
export const MADERE_FALLBACK: PillarData = {
  slug: 'madere',
  name: 'Madère',
  intro: ["Madère, c'est le genre d'endroit..."],
  itinerary: [{day: 1, title: 'Arrivée à Funchal', activities: [...], tip: '...'}],
  budget: 1200,
  faq: [{q: 'Quand partir ?', a: '...'}],
  verdict: {score: 9, forWho: '...', strengths: [...]},
};
// MONTENEGRO_FALLBACK, ROUMANIE_FALLBACK idem
```

**Impact :**
- Destinations piliers **ont fallback en dur** MAIS aussi en DB (cms_pillar_pages)
- Code charge fallback comme secours (bon pattern)
- Pas de problème immédiat, juste duplication

**Priorité :** 🟡 **MOYENNE**

**Action :** Garder fallback comme secours technique, ne pas modifier.

---

### Fichier 🟡 MOYENNE #5 : `lib/constants.ts`

**Contenu :**
```typescript
export const BLOG_CATEGORIES = ['Carnets Voyage', 'Guides Pratiques', 'Culture', 'Gastronomie'];
export const DESIGN_PRESETS = { ... };
```

**Priorité :** 🟡 **MOYENNE**

**Action :** Catégories → cms_categories (déjà créée)

---

### Composants/pages avec mock data

| Fichier | Problème | Action |
|---------|----------|--------|
| `components/HomeClient.tsx` | Destinations listées en dur | Charger depuis cms_home_destinations |
| `app/destinations/[slug]/page.tsx` | Fallback sur pillar-data.ts | Rendre pages entièrement dynamiques |
| `app/temoignages/page.tsx` | Testimonials mock | Créer UI admin pour cms_testimonials |
| `app/blog/*.tsx` | Fixtures, categories | Utiliser cms_blog_posts + cms_categories |

---

## 3. Ce que apporte `feat/cms-30-phase1`

### ✅ Apports réutilisables

**Table `cms_editable_zones` (bien pensée)**
```sql
CREATE TABLE cms_editable_zones (
  id uuid PRIMARY KEY,
  page text NOT NULL,           -- 'global', 'home', 'blog', etc.
  zone_key text NOT NULL,       -- 'hero_title', 'footer_cta', etc.
  zone_type text CHECK (IN ('text', 'image', 'cta', 'color', 'boolean')),
  value text,
  is_active boolean DEFAULT true,
  metadata jsonb,
  UNIQUE(page, zone_key)
);
```

**Avantages :**
- Flexibilité (page-specific ou global)
- Types zone bien définis
- Métadata pour champs riches
- Seed data header/footer déjà là

**Adoption :** ✅ À utiliser pour cms-page-defaults.ts

---

**Hooks `useContentLoader`, `useSiteSettings`**
```typescript
export async function fetchCmsZones(page?: string): Promise<CmsZonesData> {
  // Cascade: CMS zones → legacy site_settings → fallback
}
```

**Pattern :** ✅ Cache client, fallback structure cohérente

---

### ⚠️ Incomplet / À améliorer

**Admin pages supprimées :** `analytics`, `categories`, `destinations`, `media`, `pricing`, `testimonials`
- Branche a supprimé mais pas créé de remplacement
- Risque de régression si on merge sans relancer ces pages

**API routes partiellement refactorisées :** `/api/cms/*` changés, endroit confusion
- Certains endpoints cassés ou refactorisés sans documentation

**Pas de système pour :** destinations, POI, recettes, blocs modulaires
- Juste les zones éditables + settings

---

## 4. Tables manquantes → Schéma cible

### À créer

| Table | Colonnes clés | Utilisation | Note |
|-------|---------------|-------------|------|
| `cms_destinations` | slug, name, country, region, hero, intro, tagline, is_pillar, is_active, seo_* | Destinations non-piliers (Paris, Lisbonne, etc.) | Relationnel avec cms_pois, cms_places, cms_recipes |
| `cms_pois` | slug, name, destination_id, latitude, longitude, type, description, image, tags, is_active | Points d'intérêt sur cartes | Lié à destinations |
| `cms_places` | slug, name, destination_id, type (resto/café/lieu), adresse, description, note, budget, tags, is_active | Lieux, restaurants, cafés | Lié à destinations |
| `cms_recipes` | slug, title, destination_id, intro, story, ingredients[], steps[], time_min, difficulty, images[] | Recettes terrain | Lié optionnellement à destinations |
| `cms_media_assets` | url, alt_text, caption, credit, width, height, entity_type, entity_id, storage_path, is_featured | Images centralisées | Source unique pour toutes images |
| `cms_page_sections` | page_slug, section_type, content_json, order_index, is_active | Blocs modulaires de pages | JSONB pour flexibilité |
| `cms_tags` | name, slug, type (destination/blog/place) | Tags transversaux | Relation many-to-many |

---

## 5. Traçabilité complète des hardcodes

### À MIGRER

```
lib/cms-page-defaults.ts          → cms_editable_zones (by page)
lib/home-data.ts                  → cms_home_destinations + cms_editable_zones
lib/destinations-data.ts          → cms_destinations + cms_pois
lib/constants.ts (catégories)     → cms_categories
```

### À SUPPRIMER

```
(Rien actuellement, mais après migration:)
  - Fichiers data fallback s'ils ne sont plus utilisés
  - Legacy articles/destinations tables si migration OK
```

### À GARDER (Fallback technique)

```
lib/pillar-data.ts                → Garder comme secours DB
lib/brand-voice.ts                → Garder (pas éditorial durable)
lib/cms-settings-groups.ts        → Garder (structure)
```

---

## 6. Ordre d'implémentation (priorités)

### Phase 1 — CRITIQUE (semaine 1)

1. **Fusionner `feat/cms-30-phase1`** en main (cms_editable_zones)
2. **Créer `cms_destinations`** + `cms_pois`
3. **Remplir `cms_editable_zones`** avec contenu de cms-page-defaults.ts
4. **Remplacer HomeClient** pour charger cms_home_destinations
5. **Remplacer pages `/destinations/[slug]`** pour charger cms_destinations

### Phase 2 — MOYENNE (semaine 2)

1. Créer `cms_places`, `cms_recipes`
2. Créer `cms_media_assets` (centraliser images)
3. Relancer admin UI pour destinations, places, recipes, media

### Phase 3 — BAS (semaine 3+)

1. Nettoyer legacy tables (`articles`, `destinations`)
2. Créer `cms_page_sections` (blocs modulaires)
3. Optimiser performance queries

---

## 7. Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|-----------|
| Désync CMS/code pendant transition | HAUTE | Contenu montré deux fois ou manquant | Tester fetchs avant déployer |
| Slugs cassés pendant migration destinations | MOYENNE | 404 sur URL existantes | Créer redirects, tester URLs |
| RLS bloquer admin edits | BASSE | Admin ne peut pas sauvegarder | Vérifier policies avant merge |
| Admin pages disparues pendant merge | BASSE | CMS inopérant | Relancer pages parallèlement |

---

## 8. Dépendances

- ✅ Supabase CLI installé
- ✅ GitHub/Git pour migrations
- ✅ Node.js 18+ pour dev
- ⚠️ **Besoin:** Accès Admin Supabase pour migrations

---

**Prochaine étape :** Lire **DOCUMENT 2 — Schéma cible Supabase**
