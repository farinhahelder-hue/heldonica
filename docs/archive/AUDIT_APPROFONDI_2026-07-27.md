# AUDIT APPROFONDI HELDONICA - 27 juillet 2026

## RAPPORT DETAILLE

---

## 1. SECURITE - ALERTES CRITIQUES

### ALERTE 1: Routes API SANS AUTHENTIFICATION

| Route | Methode | Protection | Impact |
|-------|---------|-----------|--------|
| /api/publish-articles | POST | AUCUNE | Permet de publier n'importe quel article |
| /api/webhook/trigger | POST | AUCUNE | Permet de declencher des webhooks |
| /api/publish-maramures | POST | Non verifie | - |
| /api/publish-podgorica | POST | Non verifie | - |

**Preuve /api/publish-articles:**
```typescript
export async function POST() {
  // Aucun check d'auth
  const { error } = await supabase
    .from('cms_blog_posts')
    .update({ status: 'published', published_at: ... })
    .eq('id', maramures[0].id)
}
```

**Impact**: Un attaquant peut publier des articles malveillants sur le blog.

---

### ALERTE 2: Variable NEXT_PUBLIC_OPENAI_API_KEY

| Element | Valeur |
|---------|--------|
| Fichier | lib/whisper.ts:136 |
| Usage actuel | Fonction isWhisperConfigured() non utilisee |
| Risque | Incoherence: verifie NEXT_PUBLIC_ mais utilise OPENAI_API_KEY |

**Note**: La fonction n'est utilisee nulle part. Ce n'est pas une vulnerabilite critique mais une incoherence de code.

---

## 2. VARIABLES D'ENVIRONNEMENT

### Variables dans .env.example MAIS potentiellement inutilisées

| Variable | Usage detecte | Status |
|----------|--------------|--------|
| MONGODB_URI | Aucun | Probablement morte |
| BUFFER_ACCESS_TOKEN | lib/buffer.ts | A verifier |
| AWS_S | Probablement AWS_S3_BUCKET | Incomplet |
| NEXT_PUBLIC_N | Probablement NEXT_PUBLIC_N8N_WEBHOOK_URL | Incomplet |

### Variables correctement documentees (NEXT_PUBLIC_*)

| Variable | Usage |
|----------|-------|
| NEXT_PUBLIC_SUPABASE_URL | Client Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Client Supabase |
| NEXT_PUBLIC_SITE_URL | URLs absolues |
| NEXT_PUBLIC_UNSPLASH_ACCESS_KEY | Unsplash API |
| NEXT_PUBLIC_BEHOLD_FEED_ID | Flux Instagram |

---

## 3. SCHEMA BASE DE DONNEES

### Tables principales

| Table | Usage | Source verite |
|-------|-------|---------------|
| cms_blog_posts | Blog | OUI |
| destinations | Destinations | OUI |
| cms_home_destinations | Destinations affichees | OUI |
| destinations_public | Vue (destinations) | OUI |
| site_settings | Settings | OUI |
| cms_editable_zones | Zones editables | OUI |
| demandes_travel | Formulaire travel | OUI |
| contact_messages | Formulaire contact | OUI |
| cms_newsletter | Newsletter | OUI |
| newsletter_subscribers | Abonnes newsletter | OUI |
| cms_testimonials | Temoignages | OUI |

### Tables legacy/inutilisees

| Table | Observation |
|-------|------------|
| articles | Legacy (trigger sur elle pour destinations) |
| cms_settings | Doublon possible de site_settings |
| cms_destinations | Alternative a destinations |
| cms_media | Gestion medias |

### Relations detectees

| Relation | Description |
|----------|-------------|
| articles -> destinations | Trigger auto_star_destination |
| cms_blog_posts -> destinations | Via destination dans articles |
| cms_home_destinations -> destinations | Foreign key sur destination_slug |

---

## 4. SEO - ANALYSE DETAILLEE

### Home page (/): SEO COMPLET

| Element | Status | Valeur |
|---------|--------|--------|
| Title | OK | "Heldonica - Slow travel vecu en duo, concu pour toi" |
| Meta description | OK | "Un duo Paris-Madera-Roumanie..." |
| Canonical | OK | https://www.heldonica.fr |
| OG title | OK | Present |
| OG description | OK | Present |
| OG image | OK | Unsplash image |
| Twitter card | OK | summary_large_image |
| Schema.org | OK | WebSite, VideoObject, Organization, WebPage |
| Geo tags | OK | Paris coordinates |

### Routes publiques sans canonical visible

| Route | Accessible | Dans sitemap | Probleme |
|-------|------------|--------------|----------|
| /start | OUI | NON | Page hub alternative visible |
| /organisateur | OUI | OUI | Outil avec localStorage |
| /nos-services | REDIRECT | NON | Redirect vers /travel-planning |
| /expert-hotelier | OUI | NON | Page B2B accessible |

### Sitemap: ERREUR XML

| Element | Valeur |
|---------|--------|
| URL | https://www.heldonica.fr/sitemap.xml |
| Erreur | "EntityRef: expecting ;" ligne 468 |
| Cause probable | Caractere & non echappe dans un article |

---

## 5. ROUTES LEGACY

### Redirects actifs (middleware.ts)

| Source | Destination | Status |
|--------|-------------|--------|
| /a-propos-2 | /a-propos | OK |
| /hello-biz-360 | /travel-planning | OK |
| /b2b | /travel-planning | OK |
| /offre-b2b | /travel-planning | OK |
| /travel-planner | /travel-planning | OK |
| /nos-services | /travel-planning | OK |
| /bons-plans | /blog | OK |
| /zurich | /destinations/zurich | OK |
| /suisse | /destinations/suisse | OK |
| /roumanie | /destinations/roumanie | OK |
| /madere | /destinations/madere | OK |
| /etiquettes/* | /blog | OK |
| /sujets/* | /blog | OK |
| /admin | /panel-manager | OK |
| /admin/* | /panel-manager | OK |
| /cms-admin | /panel-manager | OK |

### Pages legacy accessibles

| Page | Contenu | Indexable | Dans sitemap |
|------|---------|----------|--------------|
| /start | Hub liens | OUI | NON |
| /organisateur | Outil trip planner | OUI | OUI |
| /expert-hotelier | Page B2B | OUI | NON |
| /nos-services | Redirect 301 | - | - |
| /temoignages | Temoignages | OUI | OUI |
| /quiz | Quiz slow travel | OUI | OUI |

---

## 6. API ROUTES - 103 TOTAL

### Par categorie

| Categorie | Count | Protege |
|----------|-------|--------|
| CMS | ~50 | OUI (requireCmsAuth) |
| Agents | 3 | ? |
| AI | 4 | Non |
| Public | ~40 | N/A (ex: contact, newsletter) |
| Webhooks | 2 | Non |
| Cron | 3 | Non |

### Routes publiques sans auth (normal)

| Route | Usage |
|-------|-------|
| /api/contact | Formulaire contact |
| /api/newsletter | Inscription newsletter |
| /api/demandes-travel | Formulaire travel |
| /api/brevo/subscribe | Inscription Brevo |
| /api/destinations | Liste destinations |
| /api/guides/download | Telechargement guide |

---

## 7. AUTHENTIFICATION

### CMS Admin (/panel-manager)

| Element | Status |
|---------|--------|
| Protection | OK - Password + HMAC-SHA256 |
| Cookie session | OK |
| Header x-cms-auth | OK |
| Fallback secret | WARNING - CMS_SESSION_SECRET -> CMS_PASSWORD -> ERREUR |

### User Auth (/dashboard, /auth/*)

| Element | Status |
|---------|--------|
| Provider | Supabase Auth |
| Login | /auth/login |
| Register | /auth/register |
| Protected | OK |

---

## 8. PRESENCE PUBLIQUE

### Sites detectes

| URL | Status | Redirect |
|-----|--------|----------|
| https://www.heldonica.fr | LIVE | - |
| https://heldonica.fr | Test | Redirect vers www |
| https://heldonica2.vercel.app | INACTIVE (404) | - |
| https://heldonica-git-main.vercel.app | INACTIVE (404) | - |

### Domaines vercel non actifs

| Domaine | Status |
|---------|--------|
| heldonica2.vercel.app | INACTIVE (404) |
| heldonica-git-main.vercel.app | INACTIVE (404) |

---

## 9. CONTENUS ET IMAGES

### Sources d'images

| Source | Usage |
|--------|-------|
| Unsplash | Photos hero, articles |
| Supabase Storage | Medias uploades |
| Behold | Flux Instagram |
| CDN CloudFront | Video hero |

### Stockage Supabase

| Bucket | Usage |
|--------|-------|
| blog-images | Images articles |
| media | Medias uploades |

---

## SYNTHESE DES PROBLEMES

### CRITIQUE (a corriger immediatement)

1. Routes API sans auth: /api/publish-articles, /api/webhook/trigger
2. Sitemap XML invalide: Erreur ligne 468

### ELEVÉ

1. Pages non canonicalisees: /start, /expert-hotelier indexables
2. Code local desynchronise: 1 commit vs 10+ PRs mergees
3. Variables NON documentees: 14+ dans .env.example

### MOYEN

1. Preview Vercel orphelines: 2 URLs 404
2. Table legacy non verifiee: articles vs cms_blog_posts
3. Routes legacy accessibles: /start, /organisateur, /expert-hotelier

---

## RECOMMANDATIONS PRIORITAIRES

### Immediat (1-2 jours)

1. Ajouter auth a /api/publish-articles et /api/webhook/trigger
2. Corriger sitemap XML
3. Ajouter Disallow pour /start et /expert-hotelier dans robots.txt

### Court terme (1 semaine)

1. Nettoyer variables .env.example
2. Verifier utilisation table articles
3. git fetch --unshallow

### Moyen terme (1 mois)

1. Consolider tables destinations
2. Documenter buckets storage
3. Nettoyer projet Vercel

---

## NIVEAU DE CONFIANCE

| Zone | % Verifie | Connaissance |
|------|-----------|--------------|
| GitHub | 80% | Confirme |
| Vercel | 30% | Code + mentions legales |
| Supabase | 40% | Schema local uniquement |
| SEO | 60% | Tests navigation |
| Securite API | 70% | Analyse code |
| Contenu | 50% | Navigation public |

**Niveau de confiance global**: 55%
