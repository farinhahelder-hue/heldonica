# Workflow : Pipeline de contenu Heldonica

## 1. Idée → Brouillon

### Étape 1.1 : Capturer l'idée
- Outil : Notion / Google Sheets / Discord
- Format : 1 phrase (ex: "5 cafés cachés à Lisbonne")

### Étape 1.2 : Générer le brouillon avec l'IA
- Prompt : `prompts/blog-post.md` (ou `instagram-carousel.md`, etc.)
- Outil : Claude Code / Gemini CLI / OpenCode
- Sortie : brouillon dans `content/drafts/[date]-[titre].md`

### Étape 1.3 : Stocker le brouillon
- Table Supabase : `content_drafts`
- Champs : `title`, `content`, `type` (blog/instagram/newsletter), `status` (draft/review/published)

## 2. Brouillon → Relecture

### Étape 2.1 : Notification
- Outil : Discord / Slack / Email
- Message : "Nouveau brouillon prêt : [titre] — à relire"

### Étape 2.2 : Relecture humaine
- Vérifier E-E-A-T : expérience réelle, détails sensoriels, données factuelles
- Corriger le ton (Sage + Explorateur)
- Ajouter des détails personnels (ex: "3 visites sur 6 mois")

### Étape 2.3 : Validation
- Statut : `draft` → `review` → `approved`

## 3. Relecture → Publication

### Étape 3.1 : Publication CMS
- Outil : `/panel-manager` ou API
- Champs : `title`, `content`, `published_at`, `featured_image`, `status: published`

### Étape 3.2 : Déploiement Vercel
- Auto à chaque push sur `main`
- Vérifier : `https://www.heldonica.fr/blog/[slug]`

### Étape 3.3 : Partage réseaux
- Instagram : carrousel/reel (voir `prompts/instagram-*.md`)
- Newsletter : résumé hebdo (voir `prompts/newsletter.md`)

## 4. Automatisation (optionnel)

### n8n workflow
- Trigger : nouvelle ligne dans `content_drafts` (status = `approved`)
- Action 1 : générer le brouillon avec Gemini API
- Action 2 : notifier sur Discord
- Action 3 : publier sur CMS (via webhook)

### GitHub Actions cron
- Trigger : tous les lundis 8h
- Action : générer un brouillon d'article à partir d'une destination aléatoire dans `destinations`

## 5. Mesure

### Outils
- Google Analytics : pages vues, temps passé
- Instagram Insights : impressions, engagements, saves
- Newsletter : open rate, click rate

### KPI
- Blog : 1000 pages vues/mois
- Instagram : 500 impressions/post
- Newsletter : 30% open rate
