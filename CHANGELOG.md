# 📜 Journal des Modifications (CHANGELOG) — Heldonica

Toutes les modifications du projet sont consignées ici pour assurer la coordination entre sessions et maintenir la traçabilité des évolutions.

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
