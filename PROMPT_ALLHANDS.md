# PROMPT MASTER — AGENT ALLHANDS / OPENHANDS
# Repo : farinhahelder-hue/heldonica
# Mis à jour : mai 2026
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
- Email : Resend
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
  cms-admin/            → Interface CMS admin
    CmsAdminClient.tsx  → Composant principal ~2500 lignes (7 onglets)
    travel-planning/    → KanbanBoardClient.tsx (demandes travel)
  blog/                 → Pages publiques articles ([slug]/page.tsx)
  a-propos/
  nos-services/
  travel-planning/
  contact/
  hotel-consulting/
  slow-travel/
  destinations/
  temoignages/
  etudes-de-cas/
  ai-hotellerie/
  itineraire/[uuid]/    → Page itinéraire partageable (future)
components/
  admin/                → CarouselEditor, CarouselGenerator, BlogGenerator
  RichEditor.tsx        → Éditeur riche (dynamic import, ssr: false)
  EnhancedRichContent   → Rendu HTML sécurisé (dompurify)
  MediaLibrary.tsx      → Médiathèque Supabase
lib/
  supabase.ts           → Client Supabase
  sanitize-html.ts      → Sanitization HTML
  unsplash.ts           → Fallback images (getFallbackImageUrl)
supabase/migrations/    → Fichiers SQL de migration
skills/                 → Skills OpenHands
.jules/                 → Config Jules (Google)
```

## TABLES SUPABASE (schéma actuel)
```sql
-- Articles blog
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
  archived BOOLEAN DEFAULT FALSE
)

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

-- Tâches agents (à créer si pas encore présente)
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
_Mettre à jour ce fichier si la stack ou l'architecture change._
