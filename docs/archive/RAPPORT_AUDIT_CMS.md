# AUDIT CMS — Rapport complet Heldonica

> Date : 2 juillet 2026 | Build : 190 pages, 0 erreurs

---

## 1. ÉTAT ACTUEL DU CMS

### Architecture
```
3 niveaux de cascade : cms_editable_zones > site_settings > fallback hardcodé
```

### Tables actives
| Table | Rôle | Statut |
|---|---|---|
| `cms_editable_zones` | Zones éditoriales (CMS 3.0) | **Canonique, active** |
| `site_settings` | Paramètres globaux (clé/valeur) | Fallback legacy |
| `site_content` | Contenu legacy par page (block_key) | Obsolète, 3e source |
| `cms_settings` | Très vieux CMS | Orphelin, 0 référence |

### Données
- **303 zones actives** dans Supabase, 17 pages couvertes
- **~120 zones seedées** dans `sql/seed_cms_zones_complete.sql` sur 13 pages
- **7 mappings zone→setting** dans `ZONE_TO_SETTING_MAP`

### Ce qui marche
- `EditableZone` : text, textarea, image, html (inline editing)
- `useContentLoader` + `getCmsOrSetting` : cascade zone > setting > fallback
- `InlineEditProvider` : bascule admin/édition sur pages publiques
- Auth : HMAC session, 8h, httpOnly cookie
- API : GET/PATCH zones, GET/PATCH settings

### BUG CRITIQUE — `zone_type` CHECK constraint
```
DB CHECK : 'text', 'image', 'cta', 'color', 'boolean'
Seed SQL : 'textarea', 'text' (textarea REJETÉ par la DB)
Component: 'text', 'textarea', 'image', 'html'
```
**Conséquence** : tout INSERT avec `zone_type='textarea'` échoue silencieusement en upsert (ou échoue si pas d'existant). Les zones `textarea` existantes dans Supabase ont peut-être été inserées avant l'ajout du CHECK, ou via un contournement.

---

## 2. CE QUI RESTE HARDCODÉ — Inventaire complet

### 2.1 Pages avec contenu 100% hardcodé (0 zone CMS)

| Page | Fichier | Contenu bloqué |
|---|---|---|
| **Nos Services** | `app/nos-services/page.tsx` | Hero, 3 cartes services, FAQ, CTAs, métadonnées |
| **Travel Planning Form** | `app/travel-planning-form/page.tsx` | Formulaire complet 3 étapes, labels, placeholders, options |
| **Expert Hôtelier** | `app/expert-hotelier/page.tsx` | (à vérifier mais probablement 100% hardcodé) |
| **Merci** | `app/merci/page.tsx` | Texte de confirmation |
| **Mentions Légales** | `app/mentions-legales/page.tsx` | Contenu légal |
| **Politique Confidentialité** | `app/politique-confidentialite/page.tsx` | Contenu légal |
| **Destinations** (page liste) | `app/destinations/page.tsx` | Hero, intro |
| **Quiz** | `app/quiz/page.tsx` | Quiz complet |

### 2.2 Composants avec contenu 100% hardcodé (0 zone CMS)

| Composant | Éléments hardcodés |
|---|---|
| **NewsletterForm.tsx** | Badge, titre, description, placeholder, bouton, disclaimer, messages succès/erreur (~20 chaînes) |
| **ContactForm.tsx** | Labels, placeholders, options sujet, messages validation/erreur/succès (~18 chaînes) |
| **TravelPlanningForm.tsx** | Labels, placeholders, options durée/budget/voyageurs, messages (~50 chaînes) |
| **SlowTravelQuiz.tsx** | 5 questions, 15 options, 4 profils résultats, CTAs (~50 chaînes) |
| **CtaTravelPlanning.tsx** | Titre, sous-titre, bouton, SVG icône |
| **InstagramFeed.tsx** | Titre section, CTA, username hardcodé |
| **BlogClientPage.tsx** | Hero, titres sections, descriptions, labels catégories, search placeholder, empty state (~25 chaînes) |
| **Blog.tsx** (legacy) | Titre, sous-titre, CTAs |
| **BlogFilters.tsx** | Labels catégories |

### 2.3 Images éditoriales hardcodées (~50 URLs uniques)

| Source | Usage | Nombre |
|---|---|---|
| Unsplash dans `Hero.tsx` DEFAULT_IMAGES | Héros par page | 10 |
| Unsplash dans `lib/cms-page-defaults.ts` | Héros CMS fallback | 3 |
| Unsplash dans `app/blog/[slug]/page.tsx` HERO_FALLBACK | Fallback catégories blog | 6 |
| Unsplash dans `components/BlogClientPage.tsx` | Fallback backgrounds catégories | 4 |
| Unsplash dans `lib/unsplash.ts` | Fallback catégories (qualité haute) | 5 |
| Unsplash dans `components/Destinations.tsx` | Images destinations statiques | 4 |
| Unsplash dans `app/destinations/[slug]/DestinationPage.tsx` | Héros destinations | 7 |
| Unsplash dans `lib/pillar-data.ts` | Héros piliers destinations | 3 |
| Supabase Storage (blog-images/) | Backgrounds catégories blog | 2 |
| WordPress (`heldonica.fr/wp-content/`) | Images destinations, articles legacy | ~30 |

### 2.4 Métadonnées SEO hardcodées (par page)

Chaque page a un bloc `metadata` export avec :
- title, description, keywords
- openGraph (title, description, url, image)
- twitter (card, title, description, image)
- alternates.canonical

Pages concernées : **toutes sauf blog/[slug]** (qui a `generateMetadata` dynamique).

### 2.5 Stats / compteurs hardcodés

| Emplacement | Valeurs | Type |
|---|---|---|
| `HomeClient.tsx` | `4+` ans, `100+` adresses, `7` pays, `25+` carnets | Stats section |
| `app/a-propos/page.tsx` | `7` pays, `25+` carnets, `4` ans (via EditableZone, mais fallbacks) | Stats (déjà zone CMS) |
| `app/destinations/[slug]/page.tsx` | Durées, prix, notes | Stats diverses |

### 2.6 Navigation / Footer / Liens

| Emplacement | Éléments hardcodés |
|---|---|
| `Header.tsx` | 7 liens nav (labels + URLs) — via `nav_item_1..7` (zones existent dans seed) |
| `Footer.tsx` | 18 liens (nav, destinations, guides, legal), 6 réseaux sociaux |
| `Footer.tsx` | Texte newsletter, copyright, email |

---

## 3. CE QUI DOIT ÊTRE MIGRÉ VERS `EditableZone`

### Priorité Haute — Pages sans aucune zone

| Page | Zones à créer | Estimation |
|---|---|---|
| **nos-services** | `hero_badge`, `hero_title`, `hero_text`, `card_1/2/3_title`, `card_1/2/3_text`, `card_1/2/3_cta`, `faq_title`, `faq_1/2/3_q`, `faq_1/2/3_a`, `cta_title`, `cta_text`, `cta_primary`, `cta_secondary` | ~25 zones |
| **travel-planning-form** | `step_1/2/3_title`, `page_title`, `page_desc`, `page_subtext` (le formulaire lui-même a trop de champs pour être entièrement dynamique — priorité aux textes visibles) | ~8 zones |
| **expert-hotelier** | Audit complet nécessaire mais probablement `hero_*`, `section_*`, `cta_*` | ~20 zones |
| **merci** | `page_title`, `page_text`, `cta_label` | ~3 zones |
| **destinations** (liste) | `hero_badge`, `hero_title`, `hero_text`, `intro_text` | ~4 zones |
| **blog** (liste) | `hero_badge`, `hero_title`, `hero_text`, `section_titles`, `search_placeholder`, `empty_state_title`, `empty_state_text` | ~10 zones |
| **quiz** | `page_title`, `intro_text`, `cta_label` | ~3 zones |

### Priorité Haute — Composants sans zone

| Composant | Zones à créer | Estimation |
|---|---|---|
| **NewsletterForm** | `newsletter_badge`, `newsletter_title`, `newsletter_desc`, `newsletter_placeholder`, `newsletter_cta`, `newsletter_disclaimer`, `newsletter_success_title`, `newsletter_success_text` | ~8 zones (page: global) |
| **CtaTravelPlanning** | `cta_travel_planning_title`, `cta_travel_planning_text`, `cta_travel_planning_label` | ~3 zones (page: global) |
| **InstagramFeed** | `instagram_section_title`, `instagram_cta_text` | ~2 zones (page: home) |
| **ContactForm** | `contact_form_name_label`, `contact_form_email_label`, `contact_form_subject_label`, `contact_form_message_label`, `contact_form_subject_options`, `contact_form_submit`, `contact_form_success` | ~10 zones (page: contact) |

### Priorité Haute — Métadonnées SEO

Toutes les pages doivent passer en `generateMetadata` avec lecture depuis CMS :

| Page | Zones metadata | Estimation |
|---|---|---|
| home | `meta_title`, `meta_description`, `meta_keywords`, `og_title`, `og_description`, `og_image` | ~6 zones |
| a-propos | idem | ~6 zones |
| slow-travel | idem | ~6 zones |
| temoignages | idem | ~6 zones |
| contact | idem | ~6 zones |
| travel-planning | idem | ~6 zones |
| nos-services | idem | ~6 zones |
| destinations | idem | ~6 zones |
| blog | idem | ~6 zones |
| mentions-legales | `meta_title`, `meta_description` | ~2 zones |
| politique-confidentialite | `meta_title`, `meta_description` | ~2 zones |
| expert-hotelier | idem | ~6 zones |
| quiz | idem | ~2 zones |
| merci | idem | ~2 zones |

**Total zones metadata : ~66**

### Priorité Haute — Images héro éditoriales

| Page | Zone image | Statut |
|---|---|---|
| home | `hero_video_url`, `hero_poster_image` | ✅ Déjà zones |
| a-propos | `hero_image_url` | ✅ Déjà zone |
| slow-travel | `hero_image_url` | ❌ Manquante |
| temoignages | `hero_image_url` | ❌ Manquante |
| contact | `hero_image_url` | ❌ Manquante |
| travel-planning | `hero_image_url` | ✅ Déjà zone |
| nos-services | `hero_image_url` | ❌ Manquante |
| destinations | `hero_image_url` | ❌ Manquante |
| blog | `hero_image_url` | ❌ Manquante |

### Priorité Moyenne — Contenu de section

| Page | Contenu | Zones |
|---|---|---|
| **Home** | Section destinations (texte + images), section latest | ✅ déjà zones |
| **Blog** | Catégories (labels), descriptions de section | ~6 zones |
| **Destinations** | Liste destinations + descriptions | ~8 zones |

### Priorité Faible — Images décoratives / structurelles

- Backgrounds de section (bois, motifs) — à traiter si pertinent
- Icônes inline SVG — à garder techniques

---

## 4. CE QUI DOIT RESTER TECHNIQUE (NE PAS DEVENIR CMS)

### 4.1 Images et actifs techniques
- `public/images/badges-heldonica.svg` — logo structurel
- `public/images/placeholder-blog.svg` — placeholder technique
- `public/images/placeholder-destination.svg` — placeholder technique
- Favicons, apple-touch-icon, PWA icons
- `og-default.jpg` — fallback technique OG
- Icônes SVG inline dans composants (flèches, puces, marqueurs)
- Tuiles OpenStreetMap, marqueurs Leaflet

### 4.2 Composants d'infrastructure
- `AuthProvider.tsx` — logique auth
- `InlineEditProvider.tsx` — fournisseur de contexte
- Route handlers API (`/api/cms/*`)
- Middleware
- Layouts (sauf métadonnées)
- Composants purement techniques (skeleton, loading, error boundary)

### 4.3 Logique applicative
- `lib/blog-supabase.ts` — logique de requêtage
- `lib/content-loader.ts` — logique de cache
- `lib/cms-auth.ts` — logique auth
- `lib/supabase-client.ts` — client Supabase

### 4.4 Fallbacks techniques à conserver
| Fallback | Raison |
|---|---|
| `SLUG_IMAGES` (HomeClient.tsx) | Article sans image → image par slug |
| `CAT_IMAGES` (HomeClient.tsx) | Article sans image → image par catégorie |
| `HERO_FALLBACK` (blog/[slug]) | Article sans featured_image → héros par catégorie |
| `CATEGORY_FALLBACK_BG` (BlogClientPage) | Carte sans image → background par catégorie |
| `postImage()` cascade | Image article > slug > catégorie > badge |
| `DEFAULT_IMAGES` (Hero.tsx) | Page sans héro CMS → héros par défaut |

Ces fallbacks sont des **sécurités techniques** qui évitent les images cassées. Ils ne sont pas du contenu éditorial.

### 4.5 Texte légal (à confirmer)
Mentions légales et Politique de confidentialité :
- Soit CMS avec versionning (recommandé pour maintenance)
- Soit édition GitHub (plus sûr juridiquement)
- **À discuter** : mettre dans `cms_editable_zones` avec `zone_type='html'` et versionnage, OU laisser en code avec PR.

---

## 5. PLAN DE MIGRATION — Page par page

### Phase 1 — Pages sans aucune zone (priorité haute)
```
Semaine 1 : nos-services
Semaine 2 : travel-planning-form (textes visibles uniquement)
Semaine 3 : expert-hotelier
Semaine 4 : merci, quiz, destinations, blog (liste)
```

### Phase 2 — Composants sans zone (priorité haute)
```
Semaine 1 : NewsletterForm → zones globales
Semaine 2 : CtaTravelPlanning → zones globales
Semaine 3 : InstagramFeed → zones home
Semaine 4 : ContactForm → zones contact
```

### Phase 3 — Métadonnées SEO (parallèle)
```
Semaine 1-2 : Créer helper generateMetadataFromCMS(page)
Semaine 2-3 : Migrer home, a-propos, slow-travel
Semaine 3-4 : Migrer temoignages, contact, travel-planning
Semaine 4-5 : Migrer nos-services, destinations, blog, expert-hotelier, autres
```

### Phase 4 — Images héro manquantes (parallèle)
```
Semaine 1-2 : Ajouter hero_image_url aux pages sans
Semaine 2-3 : Uploader images via interface admin
```

### Phase 5 — Contenu avancé (priorité moyenne)
```
Semaine 3-4 : Catégories blog CMS
Semaine 4-5 : Images décoratives éditoriales
Semaine 5-6 : Newsletter et formulaires avancés
```

---

## 6. PLAN DE MIGRATION — Composant par composant

### NewsletterForm.tsx — Migration
1. Ajouter zones `global__newsletter_*` dans seed SQL
2. Remplacer chaînes hardcodées par `getCmsOrSetting()` ou contexte EditableZone
3. Fallbacks : valeurs actuelles

### ContactForm.tsx — Migration (partielle)
1. Les labels, placeholders, messages succès/erreur deviennent des zones contact
2. Les options de sujet (voyage, partenariat, autre) → zones admin ou tableau DB
3. Les messages de validation (email invalide, champ requis) → peuvent rester techniques

### TravelPlanningForm.tsx (component) — Migration (partielle)
1. Les textes de section, titres, descriptions deviennent zones travel-planning
2. Les options (destinations, durées, budgets) → mieux dans une table DB ou site_settings
3. Les messages de validation → techniques

### SlowTravelQuiz.tsx — Migration (partielle)
1. Questions et options → zones ou table DB
2. Profils et recommandations → zones ou table DB
3. Logique de scoring → technique

### CtaTravelPlanning.tsx — Migration simple
1. 3 zones globales (`cta_travel_planning_*`)
2. Fallbacks = valeurs actuelles

### InstagramFeed.tsx — Migration simple
1. 2 zones home (`instagram_section_title`, `instagram_cta_text`)
2. Fallbacks = valeurs actuelles

### BlogClientPage.tsx — Migration
1. Hero : zones blog (`hero_*`)
2. Sections catégories : zones blog (`section_carnets_title`, `section_carnets_desc`, etc.)
3. Search placeholder : zone blog
4. Empty state : zone blog

### Header.tsx — ✅ Déjà partiellement migré (7 nav items, site_name, cta)
- À ajouter : `nav_item_*` manquants (contact, à propos déjà dans seed)
- Footer links restants à migrer

### Footer.tsx — Migration à compléter
- ✅ Déjà : `footer_tagline`, `footer_cta_label`, `footer_cta_url`, newsletter fields
- ❌ Manque : navigation links (18 liens), réseaux sociaux (6 liens), copyright, email

---

## 7. ZONES À AJOUTER DANS LE SEED SQL

### 7.1 Nouvelles pages

```sql
-- NOS-SERVICES
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('nos-services', 'hero_badge', 'text', 'Ce qu''on propose'),
('nos-services', 'hero_title', 'text', 'Des services pensés pour voyager autrement.'),
('nos-services', 'hero_text', 'text', 'Du voyage sur mesure à l''expertise hôtelière, on vous accompagne.'),
('nos-services', 'card_1_title', 'text', 'Travel Planning'),
('nos-services', 'card_1_text', 'textarea', 'Un itinéraire conçu sur mesure...'),
('nos-services', 'card_1_price', 'text', 'À partir de 149€'),
('nos-services', 'card_1_cta', 'text', 'Découvrir →'),
('nos-services', 'card_2_title', 'text', 'Expertise Hôtelière B2B'),
('nos-services', 'card_2_text', 'textarea', '...'),
('nos-services', 'card_2_cta', 'text', 'En savoir plus →'),
('nos-services', 'card_3_title', 'text', 'Carnets de Voyage'),
('nos-services', 'card_3_text', 'textarea', '...'),
('nos-services', 'card_3_cta', 'text', 'Lire le blog →'),
('nos-services', 'faq_title', 'text', 'Tout ce que tu veux savoir'),
('nos-services', 'faq_subtitle', 'text', 'Les questions qu''on nous pose le plus souvent'),
('nos-services', 'faq_1_q', 'text', 'Question 1'),
('nos-services', 'faq_1_a', 'textarea', 'Réponse 1'),
('nos-services', 'faq_2_q', 'text', 'Question 2'),
('nos-services', 'faq_2_a', 'textarea', 'Réponse 2'),
('nos-services', 'faq_3_q', 'text', 'Question 3'),
('nos-services', 'faq_3_a', 'textarea', 'Réponse 3'),
('nos-services', 'cta_title', 'text', 'Prêt à voyager autrement ?'),
('nos-services', 'cta_text', 'text', 'Dis-nous où tu veux aller. On s''occupe du reste.'),
('nos-services', 'cta_primary', 'text', 'Demander un voyage sur mesure →'),
('nos-services', 'cta_secondary', 'text', 'Découvrir l''offre B2B')
ON CONFLICT (page, zone_key) DO NOTHING;
```

### 7.2 Zones globales manquantes
```sql
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('global', 'footer_copyright', 'text', '© {year} Heldonica. Tous droits réservés.'),
('global', 'footer_email', 'text', 'contact@heldonica.fr'),
('global', 'social_instagram_label', 'text', 'Instagram'),
('global', 'social_instagram_url', 'text', 'https://www.instagram.com/heldonica/'),
('global', 'social_youtube_label', 'text', 'YouTube'),
('global', 'social_youtube_url', 'text', 'https://www.youtube.com/@heldonica'),
('global', 'social_pinterest_label', 'text', 'Pinterest'),
('global', 'social_pinterest_url', 'text', 'https://fr.pinterest.com/heldonica'),
('global', 'nav_footer_item_1_label', 'text', 'Accueil'),
('global', 'nav_footer_item_1_url', 'text', '/'),
... (18 items navigation footer)
ON CONFLICT (page, zone_key) DO NOTHING;
```

### 7.3 Newsletter zones
```sql
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('global', 'newsletter_badge', 'text', 'Chaque semaine'),
('global', 'newsletter_title', 'text', 'Ce qu''on a vraiment trouvé, directement dans ta boîte mail'),
('global', 'newsletter_desc', 'textarea', 'Une adresse, un timing, une erreur à éviter. Rien de plus.'),
('global', 'newsletter_success_title', 'text', 'C''est noté !'),
('global', 'newsletter_success_text', 'text', 'Vérifie ta boîte mail, on arrive doucement.'),
('global', 'newsletter_disclaimer', 'text', 'En t''inscrivant, tu acceptes de recevoir nos carnets. Désinscription possible à tout moment.')
ON CONFLICT (page, zone_key) DO NOTHING;
```

### 7.4 Zones héro manquantes par page
```sql
-- slow-travel, temoignages, contact, nos-services, blog, destinations
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('slow-travel', 'hero_image_url', 'image', '...fallback...'),
('temoignages', 'hero_image_url', 'image', '...fallback...'),
('contact', 'hero_image_url', 'image', '...fallback...'),
('blog', 'hero_image_url', 'image', '...fallback...'),
('destinations', 'hero_image_url', 'image', '...fallback...'),
('nos-services', 'hero_image_url', 'image', '...fallback...')
ON CONFLICT (page, zone_key) DO NOTHING;
```

### 7.5 Métadonnées SEO
```sql
-- Pour chaque page, un bloc comme celui-ci :
INSERT INTO cms_editable_zones (page, zone_key, zone_type, value) VALUES
('home', 'meta_title', 'text', 'Heldonica — Slow travel vécu en duo, conçu pour toi'),
('home', 'meta_description', 'textarea', 'Un duo Paris-Madère-Roumanie qui voyage lentement...'),
('home', 'meta_keywords', 'text', 'slow travel, voyage sur mesure, ...'),
('home', 'og_title', 'text', 'Heldonica — Slow travel vécu en duo, conçu pour toi'),
('home', 'og_description', 'textarea', 'On ferme les ordis. On part. On revient avec des pépites...'),
('home', 'og_image_url', 'image', 'https://images.unsplash.com/...')
ON CONFLICT (page, zone_key) DO NOTHING;
```
À répéter pour chaque page (~12 pages × 6 zones = ~72 zones metadata)

**Total nouvelles zones seed : ~180-200**

---

## 8. RISQUES ET POINTS À CONFIRMER

### 8.1 Risques critiques

| Risque | Impact | Mitigation |
|---|---|---|
| **BUG zone_type CHECK** | Seed SQL `textarea` rejeté par DB | ALTER TABLE DROP CHECK + ajouter 'textarea','html' |
| **Double cache** (content-loader vs InlineEditProvider) | Édition inline → global cache stale | Ajouter `invalidateZonesCache()` dans InlineEditProvider après save |
| **site_content table = 3e source** | Confusion sur quelle source est canonique | Déprécier `getPageContent()` de blog-supabase, migrer vers zones |
| **Service role key en public** | Sur-authorisation | Ajouter RLS + anon key pour reads publics |
| **Pas d'audit trail zones** | Qui a changé quoi ? | Ajouter `updated_by` dans PATCH zones |
| **Header/Footer links en dur** | Menu non administrable malgré zones seed | Vérifier que `nav_item_*` sont bien lus dans Header/Footer |

### 8.2 Points à confirmer

| Question | Décision attendue |
|---|---|
| Mentions légales et confidentialité : CMS ou GitHub ? | Préfère CMS (pratique) ou GitHub (sécurité juridique) ? |
| Images actuelles Unsplash : les remplacer par des uploads réelles ou garder en fallback ? | Remplacer progressivement |
| `textarea` : préfères-tu un éditeur wysiwyg ou textarea simple en admin ? | textarea suffit ou wysiwyg ? |
| FAQ : gérées en zones CMS ou dans une table dédiée ? | Zones CMS ok pour quelques FAQs |
| Formulaires : les messages de validation doivent-ils être CMS aussi ? | Uniquement messages visibles, pas techniques |
| Noms de couples dans témoignages : vrais ou fictifs ? | ✅ Déjà zones CMS, tu peux modifier |
| Stats homepage : valeurs réelles ou indicatives ? | ✅ Déjà zones CMS |
| Destinations : les images doivent-elles être uploadées ou Unsplash suffit ? | Upload pour contrôle éditorial |
| Blog categories : noms éditables depuis CMS ? | Oui si tu veux renommer plus tard |

### 8.3 Dépendances techniques
- `getPageContent()` dans `lib/blog-supabase.ts` lit `site_content` → à remplacer par `cms_editable_zones`
- `loadContent()` legacy dans `content-loader.ts` → déprécier au profit de `getCmsOrSetting()`
- `Hero.tsx` component utilise `DEFAULT_IMAGES` → remplacer par lecture zones par page

---

## 9. VÉRIFICATION BUILD

**Statut actuel : ✅ Build OK — 0 erreurs, 190 pages**

Après chaque migration, checker :
```bash
npm run build
```

Les vérifications spécifiques :
- `EditableZone` avec `fallback` string : **jamais d'erreur si zone manquante**
- `getCmsOrSetting` avec fallback : **jamais d'erreur si zone/setting manquant**
- Images avec `|| fallback` chaîne : **toujours une image valide en dernier recours**
- Metadata générée dynamiquement : **tester que les métadonnées statiques restent si CMS vide**

---

## 10. TOP 10 DES PROCHAINES ACTIONS

### Priorité absolue (bloquant)

| # | Action | Effort | Pages concernées |
|---|---|---|---|
| **1** | **🔥 Fix CHECK constraint zone_type** — ALTER TABLE pour inclure `textarea`, `html` | 30 min | Toutes les zones textarea |
| **2** | **Migrer `nos-services/page.tsx`** vers EditableZone (héros, 3 cartes, FAQ, CTA) | 4h | `nos-services` |
| **3** | **Migrer NewsletterForm** vers zones globales | 2h | Toutes les pages avec newsletter |

### Priorité haute

| # | Action | Effort | Pages concernées |
|---|---|---|---|
| **4** | **Compléter Footer** — migrer 18 liens nav + 6 réseaux sociaux + copyright + email | 4h | Footer |
| **5** | **Ajouter hero_image_url** aux pages manquantes (slow-travel, temoignages, contact, blog, destinations, nos-services) | 3h | 6 pages |
| **6** | **Migrer métadonnées SEO** vers CMS (créer helper + migrer 1 page pilote → home) | 6h | Toutes les pages |

### Priorité moyenne

| # | Action | Effort | Pages concernées |
|---|---|---|---|
| **7** | **Migrer CtaTravelPlanning + InstagramFeed** vers zones | 1h | Home |
| **8** | **Migrer BlogClientPage** — hero, sections, empty state | 4h | Blog |
| **9** | **Migrer ContactForm** — labels, messages (partiel) | 3h | Contact |
| **10** | **Ajouter invalidateZonesCache()** dans InlineEditProvider après save | 1h | Infrastructure |

### Estimation totale
- **~35-40h de migration** pour couvrir l'ensemble du site
- **~200 nouvelles zones** à créer dans le seed SQL
- **~20 fichiers** à modifier (pages + composants)
- **~50 images** à rendre uploadables via le CMS

---

**Prochaine étape suggérée :** Commencer par le fix du CHECK constraint (`#1`), puis attaquer `nos-services` en priorité (`#2`) car c'est la page la plus visible sans aucune zone CMS.
