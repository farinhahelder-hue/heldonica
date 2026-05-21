# MISSION : Amélioration complète du CMS Heldonica
# Repo GitHub : farinhahelder-hue/heldonica
# Stack : Next.js 15 App Router · TypeScript · Tailwind CSS · Supabase PostgreSQL · Vercel
# CMS Admin : /cms-admin (custom Manus, 7 onglets, branché sur Supabase)
# URL Production : heldonica.fr

---

## CONTEXTE ARCHITECTURAL ACTUEL

### Tables Supabase existantes
- `cms_blog_posts` : id, title, slug, excerpt, content, category, tags (TEXT[]), featured_image, author, published (BOOLEAN), published_at, created_at, updated_at
- `cms_destinations` : id, name, slug, description, country, image_url, featured
- `cms_settings` : paramètres globaux du site (hero, contact_email, etc.)
- `cms_demandes_travel` : demandes de Travel Planning reçues via formulaire

### Routes existantes
- `/cms-admin` : interface CMS principale (7 onglets)
- `/api/cms/content` : lecture/écriture Supabase (branché)
- `/api/cms/upload` : upload fichiers (logo, vidéo hero)
- `/api/publish-scheduled` : cron job Vercel (publie les articles programmés)
- `/blog/[slug]` : page article dynamique (ISR 60s)
- `/travel-planning-form` : formulaire de demande (à vérifier si connecté end-to-end)

### Intégrations IA existantes
- Groq API : génération de contenu, suggestions
- Perplexity API : recherche enrichie
- Automatisations réseaux sociaux (workflows Instagram carousel, newsletter)

### RLS Supabase
- `cms_blog_posts` : lecture publique uniquement sur `published = TRUE`
- Admin : service role key côté serveur pour les écritures

---

## ACTIONS À IMPLÉMENTER — LISTE COMPLÈTE ET ORDONNÉE

---

### ACTION 1 : QUICK-ACTION DASHBOARD — Landing page /cms-admin
**Priorité : P0 — Immédiat**
**Fichier cible** : `app/cms-admin/page.tsx` (remplacer la landing actuelle)

#### Ce qu'il faut construire
Une page d'accueil dashboard qui s'affiche en premier lors de la connexion à /cms-admin, avant les 7 onglets. Elle doit contenir 4 widgets :

**Widget 1 — Brouillons en attente**
- Requête : `SELECT id, title, slug, category, updated_at FROM cms_blog_posts WHERE published = FALSE ORDER BY updated_at DESC LIMIT 5`
- Affichage : liste avec titre, catégorie, date de dernière modification, bouton "Éditer" qui navigue vers l'onglet Blog du CMS en présélectionnant l'article

**Widget 2 — Nouvelles demandes Travel Planning**
- Requête : `SELECT id, prenom, nom, email, destination, budget_fourchette, style_voyage, statut, created_at FROM cms_demandes_travel WHERE statut = 'nouveau' ORDER BY created_at DESC LIMIT 5`
- Affichage : liste avec prénom+nom, destination, budget, date de réception, badge statut coloré, bouton "Voir" qui ouvre un modal de détail

**Widget 3 — Alertes articles programmés bloqués**
- Requête : `SELECT id, title, slug, published_at FROM cms_blog_posts WHERE published = FALSE AND published_at < NOW() AND published_at IS NOT NULL`
- Affichage : alerte orange si des articles ont une date de publication passée mais sont encore en brouillon. Bouton "Publier maintenant" qui appelle `PATCH /api/cms/content` avec `{ id, published: true }`

**Widget 4 — Statistiques rapides**
- Total articles publiés : `SELECT COUNT(*) FROM cms_blog_posts WHERE published = TRUE`
- Total brouillons : `SELECT COUNT(*) FROM cms_blog_posts WHERE published = FALSE`
- Demandes Travel Planning non traitées : `SELECT COUNT(*) FROM cms_demandes_travel WHERE statut = 'nouveau'`
- Affichage : 3 KPI cards côte à côte (chiffre + label)

#### Contraintes de design
- Palette Heldonica : `--eucalyptus-green: #2D6A4F`, `--cloud-dancer: #F8F5F0`, `--warm-mahogany: #8B4513`, `--teal: #1A7A7A`
- Tailwind uniquement, pas de lib externe
- Mobile-first, responsive 375px → 1280px
- Skeleton loaders pendant le chargement des données Supabase
- Aucun état "vide" sans message informatif + action suggérée

---

### ACTION 2 : KANBAN TRAVEL PLANNING
**Priorité : P0 — Immédiat**
**Fichier cible** : `app/cms-admin/travel-kanban/page.tsx` (nouvelle route)

#### Migration Supabase nécessaire
Exécuter ce SQL dans Supabase avant tout :
```sql
ALTER TABLE cms_demandes_travel
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'nouveau'
CHECK (statut IN ('nouveau', 'en_discussion', 'conception_sur_mesure', 'livré'));

ALTER TABLE cms_demandes_travel
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_cms_demandes_statut ON cms_demandes_travel(statut);
```

#### Ce qu'il faut construire
Un board Kanban drag-and-drop avec 4 colonnes :
1. **Nouveau** (badge bleu)
2. **En discussion** (badge orange)
3. **Conception sur mesure** (badge teal — NE PAS écrire "organisation de séjour")
4. **Livré** (badge vert)

**Librairie** : `@dnd-kit/core` + `@dnd-kit/sortable` (compatible Next.js 15, pas de window au SSR)

**Chaque carte doit afficher** :
- Nom du client
- Destination souhaitée
- Budget
- Vibe / style de voyage
- Email + téléphone (au survol ou click expand)
- Date de réception
- Nombre de jours depuis la création (badge rouge si > 48h sans réponse)
- Bouton "Notes internes" (textarea sauvegardée dans la colonne `notes`)

**Interactions** :
- Drag d'une carte entre colonnes → `UPDATE cms_demandes_travel SET statut = $1, updated_at = NOW() WHERE id = $2` via `PATCH /api/cms/travel-requests`
- Clic sur une carte → modal de détail complet avec toutes les infos du formulaire
- Bouton "Envoyer email" → `mailto:` pré-rempli avec le nom du client et la destination

**Route API à créer** : `app/api/cms/travel-requests/route.ts`
```typescript
// GET : récupère toutes les demandes groupées par status
// PATCH : met à jour le statut et/ou les notes d'une demande
// DELETE : archive une demande (soft delete avec deleted_at)
```

---

### ACTION 3 : CALENDRIER ÉDITORIAL VISUEL
**Priorité : P1 — Court terme**
**Fichier cible** : `app/cms-admin/calendar/page.tsx` (nouvelle route)

#### Migration Supabase nécessaire
```sql
CREATE TABLE IF NOT EXISTS cms_social_schedule (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('instagram_carousel', 'newsletter', 'reels', 'story')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'planifié' CHECK (status IN ('planifié', 'publié', 'annulé')),
  related_post_id UUID REFERENCES cms_blog_posts(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Ce qu'il faut construire
Un calendrier mensuel qui superpose :
- **Articles programmés** (depuis `cms_blog_posts WHERE published_at IS NOT NULL AND published = FALSE`) → badge vert
- **Articles publiés** (depuis `cms_blog_posts WHERE published = TRUE`) → badge teal
- **Posts sociaux planifiés** (depuis `cms_social_schedule`) → badge violet (Instagram), badge orange (Newsletter)

**Librairie** : composant calendrier custom en CSS Grid (pas de lib externe lourde comme FullCalendar pour éviter les conflits SSR)

Structure CSS Grid :
- 7 colonnes (lun→dim)
- Chaque cellule = un jour du mois
- Les événements s'empilent verticalement dans la cellule

**Interactions** :
- Clic sur un article dans le calendrier → lien vers l'éditeur de l'article dans l'onglet Blog
- Clic sur "+ Ajouter" sur une date → modal de création rapide d'un post social (titre, type, heure, lien vers article existant optionnel)
- Navigation mois précédent/suivant avec requête Supabase filtrée sur la plage de dates

**Navigation** : ajouter un lien "Calendrier" dans la sidebar ou le header du CMS admin

---

### ACTION 4 : ANALYSEUR SEO LIVE DANS L'ÉDITEUR
**Priorité : P1 — Court terme**
**Fichier cible** : modifier `app/cms-admin/components/ArticleEditor.tsx` (ou équivalent actuel dans l'onglet Blog)

#### Ce qu'il faut construire
Une sidebar SEO à droite de l'éditeur d'article, visible en temps réel pendant la rédaction. Calcul 100% côté client (pas d'API externe).

**Métriques calculées** :
1. **Longueur titre** : vert si 50-60 caractères, orange si 40-50 ou 60-70, rouge sinon. Afficher compteur live.
2. **Meta description** : même système pour 120-160 caractères.
3. **Mot-clé principal** : champ de saisie manuel. Calculer la densité dans le contenu (% d'occurrences / total mots). Cible : 0.5% – 2.5%.
4. **Structure des headings** : vérifier que H1 est présent (= le titre), que des H2 existent, qu'il n'y a pas de H3 avant H2. Afficher l'arborescence détectée.
5. **Longueur de l'article** : compteur de mots live. Badge vert si > 800 mots (SEO minimal), orange 500-800, rouge < 500.
6. **Images avec alt** : parser le HTML du contenu, détecter les `<img>` sans attribut `alt` ou avec `alt=""`. Afficher la liste des images manquantes.
7. **Liens internes** : compter les liens `href` commençant par `/` dans le contenu.

**Score global** : calculer un score /100 basé sur les métriques ci-dessus (chaque point positif = +10 à +20 selon l'importance). Afficher un cercle de progression coloré (vert > 70, orange 40-70, rouge < 40).

**Aperçu Google** : simuler le snippet Google (titre en bleu, URL en vert, meta en gris) avec les vraies données de l'article.

**Implémentation React** :
```typescript
// Hook useArticleSEO(content: string, title: string, metaDescription: string, keyword: string)
// Retourne { wordCount, titleLength, metaLength, keywordDensity, headingStructure, imagesWithoutAlt, internalLinks, score }
// Recalculer avec useMemo + debounce 300ms sur les inputs pour éviter les recalculs trop fréquents
```

---

### ACTION 5 : ASSISTANT DE MAILLAGE INTERNE (IA)
**Priorité : P1 — Court terme**
**Fichier cible** : même `ArticleEditor.tsx`, section en bas de la sidebar SEO

#### Ce qu'il faut construire
Un bouton "Suggestions de liens internes" dans la sidebar SEO qui, au clic, interroge Groq avec le contenu de l'article en cours et la liste des articles existants.

**Route API à créer** : `app/api/cms/internal-links/route.ts`
```typescript
// POST body: { currentArticleTitle, currentContent, existingArticles: [{title, slug, excerpt, category}] }
// 1. Récupérer tous les articles publiés depuis Supabase : SELECT title, slug, excerpt, category FROM cms_blog_posts WHERE published = TRUE
// 2. Construire le prompt Groq :
//    "Tu es un expert SEO spécialisé slow travel francophone.
//     Voici l'article en cours : [titre + extrait]
//     Voici les articles existants du site : [liste JSON]
//     Suggère 3 à 5 liens internes pertinents à ajouter dans le texte.
//     Pour chaque suggestion, fournis : le texte ancre exact à utiliser, le slug cible, et une phrase d'explication courte.
//     Format de réponse : JSON array [{anchorText, targetSlug, reason}]"
// 3. Parser la réponse JSON de Groq et la retourner
```

**Affichage** : liste de suggestions avec :
- Texte ancre suggéré (en gras)
- Lien cible (slug)
- Raison courte
- Bouton "Copier le lien Markdown" → copie `[texte ancre](/blog/slug)` dans le presse-papier

---

### ACTION 6 : IMAGE CROPPER UNIVERSEL
**Priorité : P3 — Long terme**
**Contexte actuel** : l'outil de crop d'image n'existe que dans l'onglet Articles

#### Ce qu'il faut construire
Extraire le composant `ImageCropper` existant en un composant réutilisable et l'exposer dans :
- Onglet **Destinations** (image de couverture de destination)
- Onglet **Pages statiques** (images hero)
- Module **Instagram feed** (format carré 1:1 forcé)

**Ratios pré-configurés par contexte** :
- Articles blog : 16:9
- Destinations : 3:2
- Instagram : 1:1
- Hero pages : 21:9 (ultra-wide)

**Librairie** : `react-image-crop` (déjà probablement dans le projet, sinon `npm install react-image-crop`)

**Composant universel** :
```typescript
// <UniversalImageCropper
//   src={imageUrl}
//   aspect={aspectRatio}
//   onCropComplete={(croppedBlob) => handleUpload(croppedBlob)}
//   uploadPath="blog" | "destinations" | "pages" | "instagram"
// />
```
Upload vers Supabase Storage dans le bucket correspondant.

---

### ACTION 7 : ALT TEXT IA & AUTO-TAGGING
**Priorité : P3 — Long terme**
**Fichier cible** : modifier `app/api/cms/upload/route.ts`

#### Ce qu'il faut construire
Au moment de l'upload d'une image, appeler automatiquement un modèle de vision IA pour générer l'alt text et les tags suggérés.

**Modèle recommandé** : `llama-3.2-90b-vision-preview` via Groq (vision multimodal)

**Flux** :
1. Image uploadée → stockée dans Supabase Storage
2. URL publique récupérée
3. Appel Groq vision : `"Décris cette image en 10 mots maximum pour le SEO d'un blog slow travel francophone. Ensuite, propose 3 à 5 tags pertinents."`
4. Parser la réponse → alt text + tags
5. Retourner dans la réponse API : `{ url, altText, suggestedTags }`
6. Pré-remplir automatiquement le champ alt de l'image dans l'éditeur et proposer les tags

---

### ACTION 8 : ANALYTICS DASHBOARD UNIFIÉ
**Priorité : P2 — Moyen terme**
**Fichier cible** : `app/cms-admin/analytics/page.tsx` (nouvelle route)

#### Ce qu'il faut construire
Un dashboard analytics consolidé qui affiche sans quitter le CMS :

**Section 1 — Performance des articles (GA4)**
- Récupérer depuis GA4 Data API : pageviews, sessions, bounce rate des 30 derniers jours par slug
- Route API : `app/api/cms/analytics/route.ts` → appel GA4 avec les credentials service account
- Afficher un tableau triable : titre article / vues / sessions / taux de rebond
- Graphique line chart (Chart.js léger) des pageviews totales sur 30 jours

**Section 2 — Top contenus**
- Top 5 articles les plus vus (depuis GA4)
- Top 3 catégories (agrégation côté serveur)

**Section 3 — Demandes Travel Planning**
- Graphique bar : nombre de demandes reçues par semaine (depuis `cms_demandes_travel`)
- Taux de conversion estimé (demandes "livrées" / total demandes)

**Note** : si les credentials GA4 ne sont pas configurés, afficher un état "non configuré" avec les instructions pour connecter le compte de service Google.

---

### ACTION 9 : ITINERARY BUILDER + EXPORT PDF
**Priorité : P2 — Moyen terme**
**Fichier cible** : `app/cms-admin/itinerary-builder/page.tsx` (nouvelle route)

#### Migration Supabase nécessaire
```sql
CREATE TABLE IF NOT EXISTS cms_itineraires (
  id BIGSERIAL PRIMARY KEY,
  uuid TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  title TEXT NOT NULL,
  destination TEXT,
  duration_days INTEGER,
  blocks JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoyé', 'archivé')),
  related_request_id UUID REFERENCES cms_demandes_travel(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cms_itineraires ENABLE ROW LEVEL SECURITY;
-- Pas de lecture publique sauf via le lien UUID
```

#### Structure d'un bloc itinéraire (JSONB)
```json
{
  "type": "day" | "accommodation" | "activity" | "transport" | "restaurant" | "tip",
  "day": 1,
  "title": "Arrivée à Madère",
  "description": "...",
  "duration": "2h",
  "related_post_slug": "madere-slow-travel-guide",
  "related_destination_slug": "madere",
  "image_url": "...",
  "practical_info": { "address": "...", "price": "...", "booking_url": "..." }
}
```

#### Interface builder
- Interface drag-and-drop (encore `@dnd-kit`) pour réorganiser les blocs par jour
- Panneau gauche : bibliothèque de blocs à glisser (piocher dans `cms_destinations` et `cms_blog_posts`)
- Panneau droite : canvas de l'itinéraire avec les blocs organisés

#### Export PDF
- Librairie : `@react-pdf/renderer`
- Template PDF brandé Heldonica : logo, palette Cloud Dancer / Eucalyptus Green, typo Serif
- Chaque jour = une "page" ou section
- Footer : "Itinéraire conçu sur mesure par Heldonica.fr" (NE PAS écrire "organisé")

#### Lien partageable privé
- Route publique : `app/itineraire/[uuid]/page.tsx`
- Lecture via `SELECT * FROM cms_itineraires WHERE uuid = $1` sans auth
- Page HTML élégante, imprimable, avec bouton "Télécharger en PDF"
- RLS : policy permettant SELECT uniquement par UUID exact (pas de liste publique)

---

### ACTION 10 : HISTORIQUE DE VERSIONS (REVISIONS)
**Priorité : P2 — Moyen terme**
**Fichier cible** : modifier `app/api/cms/content/route.ts` + nouvelle table

#### Migration Supabase nécessaire
```sql
CREATE TABLE IF NOT EXISTS cms_blog_posts_revisions (
  id BIGSERIAL PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES cms_blog_posts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  revised_at TIMESTAMPTZ DEFAULT NOW(),
  revision_note TEXT
);

CREATE INDEX idx_revisions_post_id ON cms_blog_posts_revisions(post_id, revised_at DESC);
```

#### Logique
- À chaque `PATCH` sur un article, AVANT d'écraser le contenu : insérer une snapshot dans `cms_blog_posts_revisions` avec le contenu ACTUEL (avant modification)
- Conserver les 10 dernières révisions par article (`DELETE FROM cms_blog_posts_revisions WHERE post_id = $1 AND id NOT IN (SELECT id FROM cms_blog_posts_revisions WHERE post_id = $1 ORDER BY revised_at DESC LIMIT 10)`)

#### Interface dans l'éditeur d'article
- Bouton "Historique" (icône horloge) → sidebar ou modal affichant les 10 dernières versions
- Chaque version : date, heure, nombre de mots (calculé)
- Bouton "Restaurer cette version" → charge le contenu dans l'éditeur sans sauvegarder (l'utilisateur doit confirmer manuellement)

---

### ACTION 11 : DARK MODE — PANEL ADMIN
**Priorité : P3 — Bonus**
**Fichier cible** : `app/cms-admin/layout.tsx` + `styles/admin.css`

#### Ce qu'il faut construire
Toggle lune/soleil dans le header du CMS admin.

**Variables CSS dark mode** :
```css
[data-theme="dark"] {
  --admin-bg: #1a1a1a;
  --admin-surface: #242424;
  --admin-border: #333;
  --admin-text: #e0e0e0;
  --admin-text-muted: #999;
  --admin-primary: #4fa88a; /* eucalyptus green adapté dark */
}
```

Stocker la préférence dans `localStorage` sous la clé `heldonica-admin-theme`.
Appliquer `data-theme` sur le `<html>` uniquement quand l'URL commence par `/cms-admin` pour ne pas affecter le site public.

---

## CONTRAINTES GÉNÉRALES À RESPECTER DANS TOUT LE CODE

### Langue et marque
- Tout le texte visible dans l'admin doit être en français
- Remplacer systématiquement "organisation de séjour" → "conception sur mesure"
- Remplacer "bons plans" → "pépites dénichées"
- Utiliser "on" pour les messages de l'interface (cohérent avec la voix Heldonica)

### TypeScript
- Tout le code doit être typé (pas de `any`)
- Créer les interfaces dans `types/cms.ts` : `BlogPost`, `TravelRequest`, `Destination`, `Itinerary`, `Revision`, `SocialSchedule`

### Performance
- Toutes les requêtes Supabase côté serveur (Server Components ou API Routes) sauf celles nécessitant de la réactivité client
- Skeleton loaders sur tous les composants asynchrones
- `revalidatePath('/cms-admin')` après chaque mutation

### Sécurité
- Utiliser la `SUPABASE_SERVICE_ROLE_KEY` (variable d'environnement serveur, JAMAIS exposée côté client) pour toutes les écritures
- Vérifier l'authentification sur toutes les routes `/api/cms/*` avant d'exécuter les requêtes
- Les routes publiques (`/itineraire/[uuid]`) utilisent la `anon key` avec RLS strict

### Navigation CMS admin
Mettre à jour la sidebar ou le menu de navigation du CMS pour inclure les nouveaux liens :
- 🏠 Tableau de bord (Quick-Action Dashboard)
- ✍️ Articles (existant)
- 📋 Travel Planning (Kanban)
- 📅 Calendrier éditorial
- 🗺️ Itinéraires
- 📊 Analytics
- ⚙️ Paramètres (existant)

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

1. Migrations SQL Supabase (toutes en une fois)
2. Action 1 : Quick-Action Dashboard
3. Action 2 : Kanban Travel Planning
4. Action 3 : Calendrier éditorial
5. Action 4 : Analyseur SEO live
6. Action 5 : Assistant maillage interne
7. Action 10 : Historique de versions
8. Action 6 : Image Cropper universel
9. Action 9 : Itinerary Builder + PDF
10. Action 8 : Analytics Dashboard
11. Action 7 : Alt Text IA
12. Action 11 : Dark Mode

---

## LIVRABLES ATTENDUS PAR ACTION

Pour chaque action, fournir :
1. Les fichiers SQL de migration Supabase
2. Les fichiers TypeScript/TSX nouveaux ou modifiés
3. Les variables d'environnement à ajouter dans Vercel
4. Un commentaire en haut de chaque fichier indiquant : action concernée, date, description

---

## TESTS À EFFECTUER AVANT COMMIT

- [ ] `npm run build` passe sans erreur TypeScript
- [ ] Chaque nouvelle route `/cms-admin/*` est accessible et ne casse pas le routing existant
- [ ] Les requêtes Supabase utilisent bien la `service_role_key` côté serveur
- [ ] Le site public `heldonica.fr` n'est pas affecté (pages blog, destinations, travel-planning)
- [ ] Mobile 375px : toutes les nouvelles interfaces sont utilisables sur petit écran
- [ ] Skeleton loaders visibles pendant < 200ms puis remplacés par le contenu

Commence par l'Action 1, puis enchaîne dans l'ordre. Pour chaque action, commit séparé avec message clair : "feat(cms): [nom de l'action]"
