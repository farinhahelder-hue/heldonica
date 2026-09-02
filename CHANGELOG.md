# 📜 Journal des Modifications (CHANGELOG) — Heldonica

Toutes les modifications du projet sont consignées ici pour assurer la coordination entre sessions et maintenir la traçabilité des évolutions.

---

## [2026-09-02] — Mobile 0€ : Photos/Maps → Heldonica + Instagram (Carrousels/Vidéos auto+manuel)

### 📱 App Android 0€ + Backend `mobile-publish`
- **Backend `app/api/cms/mobile-publish/route.ts`** : `photos[]` 1-10 + `video?` (≤100MB) + `is_carousel` + `auto_caption` + `mode=both|auto|manuel`. Upload Supabase `media/mobile/` + `cms_media`, POI OSM `article_map_pois`, brouillon `cms_blog_posts published:false` avec squelette `[À TOI]` ou proposition IA `HELDONICA_B2C_PROMPT` (cascade Groq→Gemini gratuite). Instagram en `instagram_scheduled_posts draft` (carrousel 2-10 via `postCarouselToInstagram`, vidéo REELS via `postVideoToInstagram` + polling `FINISHED`).
- **Lib Instagram** `lib/instagram.ts` : ajout `createVideoContainer`, `getContainerStatus`, `postVideoToInstagram` (REELS, 90s polling).
- **App** `heldonica-mobile/` : Picker système (EXIF GPS gardé), ExifInterface, Nominatim OSM gratuit (1 req/s), FusedLocation fallback, WorkManager retry. UI `Manuel/Auto/Both` + checkbox Carrousel. Build `./gradlew assembleDebug` → APK sideload, 0€ (pas de Places API, pas de Play Store).
- **.gitignore** : `heldonica-mobile/.gradle`, `content/evidence/*.json`, `content/drafts/*.md`.

## [2026-09-01] — Ancrage Strict dans le Réel (Option B), Pont Instagram & Bot Assistant

### 🛡️ Neutralisation du Contenu Aléatoire & Ancrage dans les Médias (Option B)
- **Refonte de [`app/api/cron/auto-publish/route.ts`](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cron/auto-publish/route.ts)** :
  - **Suppression définitive du prompt d'invention au hasard** (*"Choisis un sujet au hasard parmi des pépites cachées"*) et des photos de stock Unsplash.
  - **Verrouillage strict** : création de brouillons uniquement (`published: false`, `status: 'draft'`), aucune publication automatique sans validation humaine (Règle n°1 : *"On n'invente rien"*).
  - Support de l'authentification `Authorization: Bearer $CRON_SECRET` et `x-cms-auth`.
- **Générateur de Brouillons Ancrés ([`scripts/draft_from_evidence.mjs`](file:///c:/Users/farin/StudioProjects/heldonica/scripts/draft_from_evidence.mjs))** :
  - Commande `npm run media:drafts` qui extrait les faits vérifiés depuis `trajet_gps.json` / photos de terrain, avec balises `[À TOI]` pour les ressentis sensoriels et prix réels.
- **Résilience Google Photos ([`scripts/sync_google_photos.py`](file:///c:/Users/farin/StudioProjects/heldonica/scripts/sync_google_photos.py))** :
  - Fonction `ensure_valid_token()` pour rafraîchir le jeton OAuth automatiquement avant chaque requête, résolvant l'expiration après 1 heure.

### 📱 Infrastructure Instagram Bidirectionnelle (Niveau 2)
- **Webhook Meta en temps réel (`app/api/webhooks/instagram/route.ts`)** :
  - Handshake et vérification de challenge Meta (`hub.mode`, `hub.verify_token`, `hub.challenge`).
  - Ingestion temps réel des commentaires avec génération instantanée du brouillon IA respectant les 7 garde-fous de marque.
- **Extension API Instagram (`lib/instagram.ts`)** :
  - Ajout des méthodes `getMediaComments()`, `replyToInstagramComment()`, `toggleHideComment()` et `refreshLongLivedToken()`.
- **Modération & Réponses CMS (`app/panel-manager/instagram/InstagramManagerSection.tsx`)** :
  - Interface dédiée sous l'onglet **Instagram** du Panel Manager avec liste des commentaires, brouillons IA et validation/publication en 1-clic.
  - Route d'action de modération : `app/api/cms/instagram/comments/route.ts`.
- **Cron Polling Fallback & Refresh Token** :
  - Route de polling `app/api/cron/instagram-poll/route.ts` et route de renouvellement 60 jours `app/api/instagram/refresh/route.ts`.
- **Migration Versionnée** : `supabase/migrations/20260901200000_create_instagram_comments.sql`.

### 🤖 Bot Assistant Unifié (Telegram & Démon de fond)
- **Script autonome (`scripts/heldonica_assistant_bot.py`)** :
  - Surveillance continue des exports Google Photos & Maps (`takeout*.zip`).
  - Écoute et réponses interactives sur Telegram avec validation 1-clic.

---



### 🌿 Pack Roumanie (Maramureș & Apuseni)
- **Création de la sous-destination Maramureș (`app/destinations/roumanie/maramures/page.tsx`)** :
  - Églises en bois UNESCO (Bârsana, Ieud), portes monumentales de la vallée de l'Iza, vie pastorale et hospitalité paysanne.
- **Enrichissement des Monts Apuseni (`app/destinations/roumanie/apuseni/page.tsx`)** :
  - Gouffre glaciaire de Scărișoara, plateau karstique de Padiș et hameaux de Moți.
- **Migration & Base** : Insertion de `maramures` et `apuseni` dans `cms_sub_destinations` via `supabase/migrations/20260901183000_add_maramures_and_apuseni_subs.sql`.

### 🌊 Pack Normandie (Pays d'Auge, Côte d'Albâtre, Le Havre)
- **Pays d'Auge (`app/destinations/normandie/pays-dauge/page.tsx`)** : Vergers cidricoles, villages à colombages (Beuvron-en-Auge), fromageries de Livarot/Pont-l'Évêque et Route du Cidre.
- **Côte d'Albâtre (`app/destinations/normandie/cote-albatre/page.tsx`)** : Valleuses discrètes de Varengeville/Senneville, port de Fécamp et sentier des douaniers (GR21).
- **Le Havre (`app/destinations/normandie/le-havre/page.tsx`)** : Architecture Auguste Perret UNESCO, quais du MuMa et front de mer.

### 🏰 Pack Île-de-France (Paris 14e, Fontainebleau, Giverny, Versailles)
- **Paris 14e (`app/destinations/idf/paris/page.tsx`)** : Rue des Thermopyles, Village Pernety, Villa Seurat, Fondation Giacometti, Marché Daguerre et point d'ancrage avenue Villemain.
- **Fontainebleau (`app/destinations/idf/fontainebleau/page.tsx`)** : Chaos de grès des Gorges de Franchard, village d'artistes de Barbizon et Grand Canal.
- **Giverny & la Seine (`app/destinations/idf/giverny/page.tsx`)** : Bassin aux Nymphéas de Monet, méandres de la Seine et falaises de craie.
- **Versailles & Grand Parc (`app/destinations/idf/versailles/page.tsx`)** : Hameau rustique de la Reine, balades en barque sur le Grand Canal et quartier Saint-Louis.

### 🛡️ Garde-Fous & Voix Éditoriale
- 42 articles de blog audités et nettoyés de 100% des mots bannis.
- Score global d'audit de cohérence porté à 81%.
- Migrations versionnées : `20260901174500_update_paris_14_blog_post.sql` et `20260901175500_align_all_drafts_brand_voice.sql`.

---


## [2026-08-19] — Providers IA Gratuits (Mistral, Cerebras, OpenRouter), Mode Guidé B2B & Garde-Fou Ébauches

### 🤖 Moteurs IA de Secours Gratuits (`lib/ai-provider.ts`)
- Intégration dans la cascade de fallback avant les APIs payantes (OpenAI/Anthropic) :
  1. **Groq** (`llama-3.3-70b-versatile`) — Gratuit & ultra-rapide
  2. **Google Gemini** (`gemini-2.0-flash`) — Gratuit
  3. **Mistral AI** (`mistral-small-latest`) — Gratuit & excellent en français
  4. **Cerebras** (`llama-3.3-70b`) — Gratuit & inférence ultra-rapide
  5. **OpenRouter** (`meta-llama/llama-3.3-70b-instruct:free`) — Gratuit
  6. **OpenAI** (`gpt-4o-mini`) & **Anthropic** (`claude-3-5-haiku`) en dernier recours payant.
- Documentation complète des clés avec liens d'inscription dans `.env.example`.

### 🧭 Améliorations CMS Admin & Copilot
- **Mode Guidé B2B ("Partir de 3 faits")** : Ajout du mode dynamique pour les hôteliers dans `AiCopilotModal.tsx` et `app/api/cms/ai-assist/route.ts` (Établissement, Problème chiffré, Solution slow travel & P-A-S).
- **Indicateur d'Images Manquantes** : Ajout de badges visuels d'alerte (`🖼️ Image manquante`, `📱 Pas d'OG`) dans la liste des articles `/panel-manager`.
- **Garde-fou CI Anti-Ébauches Vides** : Mise à jour de `scripts/check-content-coherence.mjs` pour bloquer en CI tout article publié de moins de 300 caractères.

---

## [2026-08-19] — Harmonisation Voix de Marque, Intégrité E-E-A-T & Industrialisation

### 🛡️ Intégrité & E-E-A-T
- **Désactivation des faux avis** : Les 5 avis de démonstration dans `cms_testimonials` ont été passés en `is_active = false`. La page `/temoignages` affiche désormais le message d'attente honnête.
- **Collecte de vrais avis** : Création de la page `/retour-experience` et de l'API `POST /api/testimonials/submit` (insertion par défaut en `is_active = false` soumise à modération manuelle).
- **Règle absolue** : Toute modification de la base de production doit obligatoirement être tracée par un fichier SQL dans `supabase/migrations/`.

### 🌿 Voix de Marque & Garde-fous CI
- **Intégration des 7 garde-fous** : Implémentation du calcul pondéré dans `lib/brand-voice.ts` (Seuil publication ≥85%, Excellence ≥95%).
- **Purge des 42 articles** : Suppression des mots bannis et correction des pronoms sujets (*« nous avons » ➔ « on a »*).
- **CI / GitHub Actions** : Ajout du contrôle `check:content-coherence` dans `.github/workflows/garde-fous.yml`.

### 📋 Templates & Documentation
- Ajout de `CHECKLIST_PUBLICATION.md` à la racine (B2C 7 points, Instagram 5 points, B2B 5 points).
- Ajout de `PROMPT_TEMPLATE_B2C.md` (carnets de blog 1200–2000 mots).
- Ajout de `PROMPT_TEMPLATE_INSTA.md` (légendes Instagram 120–180 mots).

### 🧭 Navigation & Expérience Utilisateur
- Réalignement du menu principal sur 5 entrées B2C pures (*Accueil, Destinations, Carnets de route, Travel Planning, À propos*).
- Ajout du bouton CTA *« Planifier mon voyage »* et du lien discret *« Espace Hôteliers »* dans le header.
- Harmonisation de la section B2B de la Home et de la page `/expert-hotelier` sur le vouvoiement strict.

### 🗄️ Migrations SQL Versionnées
- `supabase/migrations/20260819140000_editorial_voice_and_testimonials_alignment.sql`

---

## [2026-08-19] — Rattrapage migrations Supabase, sécurité, CMS (session Claude)

### 🗄️ Rattrapage de 56 migrations
- Rattrapage complet des migrations Supabase jamais appliquées en production
  depuis le 19/07 (déploiements manuels via dashboard non suivis par le CLI).
- Réconciliation de l'historique de migration (versions dupliquées sur une
  même date désambiguisées), correction de plusieurs bugs SQL préexistants.
- Détection et correction d'un trigger de sync `cms_blog_posts` → `articles`
  cassé qui bloquait toute édition d'article via le CMS.
- Complétion des données `cms_seasons` pour Montenegro et Roumanie (branchées
  sur un nouveau tableau saisonnier `SeasonalTable`, jusque-là orphelin).

### 🔒 Incident de sécurité — clé service_role exposée
- Une clé `service_role` Supabase (contourne toutes les policies RLS) était
  committée en clair dans `scripts/fix-data.mjs` depuis le 27/06, dans un
  repo GitHub public.
- Retirée du code, `SUPABASE_SERVICE_ROLE_KEY` basculée vers le nouveau
  format `sb_secret_...` partout (`.env.local`, Vercel ×3 environnements,
  GitHub Actions), ancienne clé legacy révoquée côté Supabase.
- `lib/supabase-edge.ts` rendu compatible avec les deux formats de clé
  (header `Authorization: Bearer` uniquement pour les clés JWT legacy).

### 🧭 Nouveauté CMS — écriture guidée
- Ajout du mode "Partir de 3 infos" dans `AiCopilotModal.tsx` : 3 champs
  courts (lieu, moment, détail marquant) au lieu d'une page blanche, pour
  générer un texte complet sans jamais inventer de faits au-delà de ce qui
  est fourni.
- Enrichissement de `FORBIDDEN_WORDS` (`lib/brand-voice.ts`) avec les
  tournures typiques de texte généré par IA ("plongez dans", "au cœur de"...).

### 📄 Contenu
- 9 articles vides ou quasi-vides (< 300 caractères) passés en brouillon
  (`published = false`) pour éviter les pages blanches indexées.

### 🗄️ Migrations SQL Versionnées
- `supabase/migrations/20260804000004_map_markers_ordre.sql`
- Plusieurs dizaines de migrations de rattrapage (voir `supabase/migrations/`,
  préfixes `202605` à `202608`).
