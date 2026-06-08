# PROMPT MASTER — AGENT ALLHANDS / OPENHANDS
# Repo : farinhahelder-hue/heldonica
# Mis à jour : 08 juin 2026
# Usage : copier ce fichier dans le champ "Tâche" du panneau Agents du CMS,
#         puis remplacer uniquement le bloc ## MISSION en bas.

---

═══════════════════════════════════════════════════════
  HELDONICA — CONTEXTE PROJET COMPLET POUR AGENT IA
═══════════════════════════════════════════════════════

## IDENTITÉ DU PROJET
- Nom : Heldonica (heldonica.fr)
- Repo GitHub : farinhahelder-hue/heldonica
- Branche principale : main
- Déploiement : Vercel (auto-deploy sur push main)
- Backend : Supabase (PostgreSQL + Storage)
- CMS custom : /app/cms-admin/ (auth par mot de passe, session cookie)
- URL production : heldonica.fr

## STACK TECHNIQUE EXACTE
- Framework : Next.js 14.2.x (App Router — PAS Pages Router)
- Language : TypeScript 5.3 strict (tsconfig: strict: true)
- React : 18.3.x
- Styling : Tailwind CSS 3.4 pour les pages publiques
             CSS inline (style={{...}}) UNIQUEMENT dans le CMS admin — pas de classes Tailwind dans /cms-admin
- Base de données : Supabase PostgreSQL via @supabase/supabase-js 2.39
- Stockage médias : Supabase Storage (bucket "media")
- Auth CMS : cookie session + bcryptjs — PAS next-auth, PAS Supabase auth
- Email : Resend + Brevo (BREVO_API_KEY avec fallback Resend)
- Analytics : Google Analytics 4 via @google-analytics/data
- Drag & Drop : @dnd-kit/core + @dnd-kit/sortable
- Icons : lucide-react 1.14
- Forms : react-hook-form 7.48
- Tests : Vitest 4.x + @testing-library/jest-dom
- HTTP client : fetch natif (PAS axios)
- Maps : Leaflet + leaflet.markercluster
- Sanitize HTML : dompurify
- Automatisations : n8n (webhook NEXT_PUBLIC_N8N_WEBHOOK_URL)
- Agents IA : OpenHands (AllHands), Jules (Google), Gemini, Perplexity

## ARCHITECTURE DES DOSSIERS
```
app/
  api/cms/              → API Routes CMS
    articles/           → GET/POST liste + GET/PUT/DELETE par id
    auth/               → POST login, DELETE logout, GET check session
    settings/           → GET/PUT paramètres site
    content/            → GET/PUT contenu pages
    media-upload/       → POST upload vers Supabase Storage (FormData: file, folder)
    demandes-travel/    → GET/PUT demandes travel planning
    analytics/          → POST métriques GA4
    llm-search/         → POST recherche sémantique
    agent-tasks/        → GET historique tâches agents, POST sauvegarder
    jules/              → POST envoi tâche Jules directement
    publish-podgorica/  → POST publier article Podgorica, PUT fix SEO
  cms-admin/            → Interface CMS admin
    CmsAdminClient.tsx  → Composant principal ~2500 lignes (7 onglets)
    travel-planning/    → KanbanBoardClient.tsx (demandes travel)
  blog/                 → Pages publiques articles ([slug]/page.tsx)
  a-propos/
  travel-planning/      → Page service Travel Planning
  travel-planning-form/ → Formulaire demande Travel Planning
  contact/
  slow-travel/
  destinations/
  temoignages/
  merci/
  mentions-legales/
  politique-confidentialite/
  organisateur/
  planifier/
  maintenance/
components/
  admin/                → CarouselEditor, CarouselGenerator, BlogGenerator
  RichEditor.tsx        → Éditeur riche (dynamic import, ssr: false)
  EnhancedRichContent   → Rendu HTML sécurisé (dompurify)
  MediaLibrary.tsx      → Médiathèque Supabase
  BlogFilters.tsx       → Filtres catégories avec URL params
  CtaTravelPlanning.tsx → CTA en fin d'article
  ReadingProgress.tsx   → Barre de progression lecture
  HeldonicaVerdict.tsx  → Bloc verdict terrain
  HeldonicaFAQ.tsx      → FAQ avec JSON-LD FAQPage schema
lib/
  supabase.ts           → Client Supabase
  sanitize-html.ts      → Sanitization HTML
  unsplash.ts           → Fallback images (getFallbackImageUrl)
  readingTime.ts        → getReadingTime() + formatReadingTime()
supabase/migrations/    → Fichiers SQL de migration
skills/                 → Skills OpenHands
.jules/                 → Config Jules (Google)
```

## TABLES SUPABASE (schéma actuel)
```sql
-- Articles blog (TABLE PRINCIPALE — utiliser EXCLUSIVEMENT cette table)
articles (
  id SERIAL PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  category TEXT,
  excerpt TEXT,
  content TEXT,           -- HTML
  featured_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  scheduled_published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  voice_notes TEXT,
  views INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  faq_content JSONB       -- FAQ structurée pour HeldonicaFAQ + JSON-LD
)

⚠️ NOTE CRITIQUE : Il existe aussi une table legacy "cms_blog_posts" dans Supabase.
NE PAS utiliser cms_blog_posts pour les pages publiques.
Toutes les pages publiques (blog, destinations, home) lisent UNIQUEMENT depuis "articles".
La confusion entre ces deux tables est la CAUSE du bug 0 articles affiché sur /blog.

-- Demandes Travel Planning
demandes_travel (
  id UUID PRIMARY KEY,
  prenom TEXT, nom TEXT, email TEXT, telephone TEXT,
  destination TEXT, style_voyage TEXT,
  duree_jours INTEGER, budget_fourchette TEXT,
  nb_voyageurs INTEGER, mois_depart TEXT,
  notes TEXT, statut TEXT, created_at TIMESTAMPTZ
)

-- Paramètres du site
site_settings (id SERIAL, key TEXT UNIQUE, value TEXT, label TEXT, type TEXT)

-- Contenu des pages
site_content (id SERIAL, page TEXT, block_key TEXT, value TEXT, label TEXT, type TEXT)

-- Tâches agents
agent_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent TEXT, task TEXT, repo TEXT, branch TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

## ROUTES API CMS (toutes sous /api/cms/)
- GET/POST   /api/cms/articles             → liste paginée / création article
- GET        /api/cms/articles/[id]         → lecture article
- PUT        /api/cms/articles/[id]         → mise à jour (titre, contenu, published, scheduled...)
- DELETE     /api/cms/articles/[id]         → suppression définitive
- POST       /api/cms/auth                  → login (body: {password})
- DELETE     /api/cms/auth                  → logout
- GET        /api/cms/auth                  → vérification session
- GET/PUT    /api/cms/settings              → paramètres site (logo, couleurs, SEO, réseaux)
- GET/PUT    /api/cms/content               → contenu par page (hero, titres, textes)
- POST       /api/cms/media-upload          → upload fichier (FormData: file, folder)
- GET/PUT    /api/cms/demandes-travel       → demandes travel planning
- POST       /api/cms/analytics             → métriques GA4 (body: {startDate, endDate})
- POST       /api/cms/llm-search            → recherche sémantique IA
- GET/POST   /api/cms/agent-tasks           → historique tâches agents

## IDENTITÉ VISUELLE HELDONICA (respecter IMPÉRATIVEMENT)
```
Palette principale :
  Bordeaux     : #6b2a1a  → headers CMS, boutons primaires, accents
  Teal         : #01696f  → boutons secondaires, highlights
  Fond app     : #f5f3ef  → background général
  Fond clair   : #faf9f7  → inputs, cards, formulaires
  Vert édito   : #4A7C59  → piliers éditoriaux, tags catégories
  Texte fort   : #1a1a1a
  Texte moyen  : #555
  Texte léger  : #888
  Bordure      : #e8e0d8

Conventions UI dans le CMS admin :
  TOUS les styles en CSS inline : style={{...}}
  PAS de classes Tailwind dans app/cms-admin/
  Border-radius : 0.5rem (cards), 1rem (panels), 9999px (pills/badges)
  Box-shadow cards : 0 1px 4px rgba(0,0,0,.06)
  Box-shadow modals : 0 2px 12px rgba(0,0,0,.07)
  Font : DM Sans (avec system-ui comme fallback)
```

## CONVENTIONS DE CODE
- TypeScript strict : typer toutes les fonctions, pas de `any` implicite
- Composants "use client" avec hooks React (useState, useEffect, useCallback, useRef)
- Dynamic imports avec `{ ssr: false }` pour composants lourds (éditeur, carousels)
- Feedback utilisateur : toujours via showToast() — jamais d'alert() natif
- Fetch : vérifier handleUnauthorized(res) après chaque appel API CMS
- Pas de librairies npm supplémentaires sans justification explicite
- Commits conventionnels : `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- PAS de console.log ajoutés (sauf préfixés [CMS] pour debug)
- Langue de l'interface CMS : français

## RÈGLES MÉTIER
- Le CMS est accessible à /cms-admin, protégé par mot de passe (env CMS_PASSWORD)
- Auth via cookie httpOnly — jamais stocker mdp en localStorage
- Articles : brouillon / publiés / planifiés (scheduled_published_at) / archivés
- Images sans URL → fallback via getFallbackImageUrl(category, title)
- Slug auto-généré depuis le titre (normalisation NFD, kebab-case)
- Autosave toutes les 30s si article en cours d'édition avec un titre
- 4 piliers éditoriaux : "Découvertes locales", "Carnets de voyage", "Coulisses", "Expert hôtelier"
- INTERDITS dans l'interface : "bons plans" → "pépites dénichées" / "organisation de séjour" → "conception sur mesure"

## VARIABLES D'ENVIRONNEMENT REQUISES
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       ← côté serveur uniquement, JAMAIS client
CMS_PASSWORD
JWT_SECRET
RESEND_API_KEY
BREVO_API_KEY
GOOGLE_ANALYTICS_PROPERTY_ID
NEXT_PUBLIC_N8N_WEBHOOK_URL
```

## SÉCURITÉ
- Utiliser SUPABASE_SERVICE_ROLE_KEY pour toutes les écritures (API Routes uniquement)
- Vérifier l'authentification sur TOUTES les routes /api/cms/* avant exécution
- Ne JAMAIS exposer SERVICE_ROLE_KEY côté client
- Routes publiques utilisent anon key avec RLS strict

## DÉPLOIEMENT
- Push sur main → Vercel déploie automatiquement
- Commande build : `next build` (standard, pas d'étape spéciale)
- Tests : `npm run test` (vitest) — faire passer avant commit si possible
- TypeCheck : `npm run typecheck`

═══════════════════════════════════════════════════════
  MASTER PLAN — AUDIT 08 JUIN 2026
  (Bugs constatés en prod + améliorations prioritaires)
═══════════════════════════════════════════════════════

## ÉTAT DU SITE AU 08/06/2026

### ✅ Ce qui fonctionne
- Homepage : identité de marque, sections Travel Planning, newsletter, articles récents visibles
- Article Podgorica publié et visible en home
- Routes publiques toutes accessibles : /blog, /travel-planning, /a-propos, /contact, /destinations
- SEO technique : JSON-LD, sitemap, robots.txt en place
- Composants UX livrés : BlogFilters, ReadingProgress, CtaTravelPlanning, HeldonicaVerdict, HeldonicaFAQ

### 🔴 Bugs critiques confirmés en prod
1. **Blog /blog : 0 articles affichés** — BlogFilters affiche "0 Carnets, 0 Pépites locales, 0 Guides"
   → Cause probable : blog/page.tsx ou lib/blog-supabase.ts lit depuis `cms_blog_posts` au lieu de `articles`
   → À corriger EN PRIORITÉ ABSOLUE

2. **Homepage : compteurs stats à 0** — "0 Pays habités", "0 Carnets publiés" dans section Notre histoire
   → Vérifier app/page.tsx : les valeurs dynamiques ne sont pas hydratées
   → Soit hardcoder les valeurs réelles (ex: 12 pays, 25+ carnets), soit corriger la requête Supabase

3. **Incohérence éditoriale home** — Section nommée "Inspirations gourmandes" affiche un article
   de randonnée (Stoos Ridge, Suisse) — aucun rapport avec la food
   → Corriger le filtre de catégorie de cette section OU renommer la section

═══════════════════════════════════════════════════════
  MISSION (REMPLACER CE BLOC PAR TA TÂCHE SPÉCIFIQUE)
═══════════════════════════════════════════════════════

## MISSION
[DÉCRIS ICI TA TÂCHE PRÉCISE — sois le plus explicite possible :
 - Quel fichier modifier / créer
 - Quel comportement exact attendu
 - Ce qui doit changer vs l'état actuel]

## PÉRIMÈTRE
- Fichiers autorisés : [LISTE]
- Fichiers à NE PAS toucher : [LISTE]

## CRITÈRES DE SUCCÈS
- [ ] `npm run build` passe sans erreur TypeScript
- [ ] Aucun `any` implicite introduit
- [ ] Style respecte la palette Heldonica (CSS inline dans CMS, Tailwind dans pages publiques)
- [ ] Responsive mobile vérifié (min 375px)
- [ ] [AJOUTE TES CRITÈRES SPÉCIFIQUES]

## OUTPUT ATTENDU
Crée un ou plusieurs commits sur `main` :
- Format message : `feat: [description courte]` ou `fix: [description courte]`
- Body du commit : liste des fichiers modifiés + résumé des changements
- Si migration SQL nécessaire : créer le fichier dans supabase/migrations/

═══════════════════════════════════════════════════════
  TEMPLATES MISSIONS PRÊTS À L'EMPLOI
═══════════════════════════════════════════════════════

### TEMPLATE PRIORITÉ 1 — Fix blog 0 articles
```
## MISSION
Correction critique : la page /blog affiche 0 articles alors que des articles publiés existent en Supabase.

1. Inspecter app/blog/page.tsx et tous les fichiers lib/ utilisés (blog-supabase.ts, supabase.ts)
2. Identifier si la requête cible `cms_blog_posts` ou `articles`
3. Corriger pour utiliser UNIQUEMENT la table `articles` (published = true, archived = false)
4. Vérifier que BlogFilters.tsx reçoit les bonnes données et que les compteurs par catégorie sont corrects
5. Vérifier que app/blog/[slug]/page.tsx lit aussi depuis `articles` (cohérence)

Comportement attendu :
- /blog affiche tous les articles publiés avec filtres fonctionnels
- Compteurs par catégorie reflètent les vraies données
- Les slugs des articles fonctionnent

## PÉRIMÈTRE
- app/blog/page.tsx
- app/blog/[slug]/page.tsx
- lib/blog-supabase.ts (ou tout fichier lib lié au blog)
- components/BlogFilters.tsx

## CRITÈRES DE SUCCÈS
- [ ] /blog affiche au moins 10 articles en prod
- [ ] Filtres par catégorie fonctionnels
- [ ] build TypeScript sans erreur
```

### TEMPLATE PRIORITÉ 2 — Fix compteurs homepage
```
## MISSION
Correction : les stats de la section "Notre histoire" en homepage affichent 0.

1. Inspecter app/page.tsx — trouver les blocs de stats dynamiques
2. Si les valeurs viennent de Supabase : corriger la requête COUNT
3. Si les valeurs sont hardcodées à 0 : remplacer par les vraies valeurs (à confirmer avec le propriétaire)
   Valeurs de référence : ~12 pays visités, ~25 carnets publiés, ~4 ans de slow travel
4. S'assurer que les valeurs s'affichent correctement en SSR (pas d'hydration mismatch)

## PÉRIMÈTRE
- app/page.tsx uniquement

## CRITÈRES DE SUCCÈS
- [ ] Stats non nulles et cohérentes affiché en prod
- [ ] Pas d'hydration warning dans la console
```

### TEMPLATE PRIORITÉ 3 — Fix section "Inspirations gourmandes"
```
## MISSION
Correction éditoriale : la section "Inspirations gourmandes" de la homepage affiche
un article de randonnée (Stoos Ridge, Suisse) — incohérence de contenu.

1. Dans app/page.tsx, trouver la section "Inspirations gourmandes"
2. Option A : corriger le filtre de catégorie pour n'afficher que les articles catégorie "Découvertes locales" ou "food"
3. Option B : renommer la section en "Pépites dénichées" pour couvrir toutes les découvertes
   (recommandé car plus cohérent avec l'identité Heldonica)

## PÉRIMÈTRE
- app/page.tsx uniquement

## CRITÈRES DE SUCCÈS
- [ ] Section affiche du contenu cohérent avec son titre
- [ ] Aucune rupture de style ou de layout
```

### TEMPLATE A — Templates de prompt intégrés dans le panneau Agents
```
## MISSION
Dans app/cms-admin/CmsAdminClient.tsx, onglet 'agents' :
Ajouter un sélecteur "Template rapide" au-dessus du textarea agentTask.
Définir une constante AGENT_TEMPLATES en haut du fichier avec 5 templates :
  1. "Amélioration UI" — retouches visuelles CSS inline
  2. "Nouvelle feature" — ajout fonctionnalité
  3. "Fix bug" — correction d'un problème
  4. "Refactoring" — nettoyage de code TypeScript
  5. "SEO / Blog" — modifications liées aux articles
Chaque template pré-remplit agentTask avec le contexte projet minimal + un bloc MISSION vide.
Le sélecteur se réinitialise à "" après sélection.
Style : pills bordeaux #6b2a1a cohérent avec le reste de l'onglet.

## PÉRIMÈTRE
- app/cms-admin/CmsAdminClient.tsx uniquement

## CRITÈRES DE SUCCÈS
- Build TypeScript sans erreur
- Style cohérent avec le panneau Agents existant
- Chaque template contient le contexte Heldonica minimal (stack, palette, conventions)
```

### TEMPLATE B — Synchroniser l'historique agents avec Supabase
```
## MISSION
Migrer l'historique des tâches agents de localStorage vers Supabase.
1. Créer supabase/migrations/XXXX_agent_tasks.sql :
   CREATE TABLE IF NOT EXISTS agent_tasks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     agent TEXT NOT NULL, task TEXT NOT NULL,
     repo TEXT, branch TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
2. Créer app/api/cms/agent-tasks/route.ts :
   GET → SELECT * FROM agent_tasks ORDER BY created_at DESC LIMIT 20
   POST → INSERT INTO agent_tasks (agent, task, repo, branch)
3. Modifier CmsAdminClient.tsx : charger l'historique depuis l'API au mount,
   sauvegarder via POST après chaque tâche envoyée.
   Conserver le fallback localStorage si la requête Supabase échoue.

## PÉRIMÈTRE
- app/cms-admin/CmsAdminClient.tsx
- app/api/cms/agent-tasks/route.ts (NOUVEAU)
- supabase/migrations/XXXX_agent_tasks.sql (NOUVEAU)
```

### TEMPLATE C — Améliorer l'analyse SEO dans l'éditeur d'article
```
## MISSION
Dans app/cms-admin/CmsAdminClient.tsx, fonction analyzeSEO() :
1. Ajouter détection balises H2/H3 (< 2 H2 → warning)
2. Vérifier longueur excerpt (idéal 120-160 caractères)
3. Ajouter score lisibilité Flesch simplifié (longueur moyenne des phrases)
4. Refactoriser le rendu SEO en 3 niveaux : ✅ Bien / ⚠️ À améliorer / ❌ Problème
5. Chaque item = tooltip expliquant comment corriger

## PÉRIMÈTRE
- app/cms-admin/CmsAdminClient.tsx uniquement (fonction analyzeSEO + JSX)
```

---

_Ce fichier est la référence unique pour tous les agents IA travaillant sur le repo Heldonica._
_Mettre à jour ce fichier après chaque audit ou changement majeur d'architecture._
_Dernière mise à jour : 08 juin 2026 — Audit prod Perplexity_
