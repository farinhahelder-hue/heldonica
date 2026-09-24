# Création de contenu avec l'IA — Heldonica

## 1. Principes de base

- Ton de voix Heldonica (Sage + Explorateur)
- Archétypes de marque (Le Sage, L'Explorateur)
- Concept central : "L'Expert de l'Aventure"
- Slogan : "Vivre, découvrir, partager : embarquez dans notre histoire de slow travel en couple"

## 2. Types de contenu

### Articles de blog
- Structure type (voir `templates/article-template.md`)
- Longueur : 800-1500 mots
- Ton : tutoiement (B2C), narratif, sensoriel
- Lexique : "pépites dénichées", "joyaux cachés", "plénitude", "déconnexion"

### Posts Instagram
- Carrousels (10 slides, voir `prompts/instagram-carousel.md`)
- Reels (script 30-60s, voir `prompts/instagram-reel.md`)
- Stories (15s, behind-the-scenes)

### Newsletters
- Fréquence : hebdo ou bi-hebdo
- Structure : intro perso, 3-5 liens, CTA

## 3. Workflows

### Workflow article de blog
1. Idée (destination, expérience vécue)
2. Prompt IA (voir `prompts/blog-post.md`)
3. Relecture humaine (vérifier E-E-A-T : expérience réelle, détails sensoriels)
4. Publication CMS
5. Partage Instagram + newsletter

### Workflow carrousel Instagram
1. Idée (ex: "5 cafés à ne pas manquer à Lisbonne")
2. Prompt IA (voir `prompts/instagram-carousel.md`)
3. Génération images (Midjourney / DALL-E / Canva)
4. Relecture
5. Publication (n8n ou manuel)

## 4. Prompts prêts à l'emploi

Voir dossier `prompts/` :
- `blog-post.md`
- `instagram-carousel.md`
- `instagram-reel.md`
- `newsletter.md`

## 5. Templates

Voir dossier `templates/` :
- `article-template.md`
- `instagram-template.md`

## 6. Bonnes pratiques

- Toujours vérifier l'expérience terrain (E-E-A-T)
- Ne pas publier du contenu 100% IA sans relecture humaine
- Alterner les piliers éditoriaux : Découvertes locales / Carnets de voyage / Coulisses de marque / Expert hôtelier
- Règle 70/30 : 70% valeur gratuite, 30% mise en avant des services payants

## 7. Outils

- n8n : automatisation des workflows
- Supabase : stockage des brouillons, table `content_drafts`
- Vercel : déploiement auto
- GitHub : versioning des prompts et templates
