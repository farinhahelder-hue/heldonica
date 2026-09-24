# Documentation des Workflows n8n — Heldonica

Ce document documente les workflows n8n existants pour l'automatisation du contenu Instagram.

---

## Workflow 1: `n8n-instagram-workflow.json`

### Nom
**Instagram Carousel - Planifié**

### Description
Génère automatiquement des carrousels Instagram toutes les heures en utilisant des images Unsplash et du contenu généré par IA (Groq).

### Déclencheur
- **Type**: Planifié (schedule)
- **Fréquence**: Toutes les heures (`hoursInterval: 1`)

### Étapes du workflow

1. **Planificateur** — Déclenche le workflow toutes les heures
2. **Brief** — Définit les paramètres du carrousel:
   - `topic`: Sujet du carrousel (ex: "que faire a paris")
   - `angle`: Angle éditorial (ex: "authentique")
   - `format`: Format (ex: "carousel")
3. **Unsplash** — Recherche d'images via l'API Unsplash
4. **Photo** — Sélectionne la meilleure image selon les likes
5. **Groq** — Génère le contenu du carrousel via LLM
6. **Parse** — Parse la réponse JSON du LLM
7. **Sauvegarde** — Enregistre le draft dans Supabase (`instagram_drafts`)

### Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `UNSPLASH_KEY` | Clé API Unsplash |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_KEY` | Clé API Supabase (anon ou service_role) |
| `GROQ_KEY` | Clé API Groq |

### Champs Supabase utilisés

**Table: `instagram_drafts`**
| Champ | Type | Description |
|-------|------|-------------|
| `topic` | text | Sujet du carrousel |
| `slides` | jsonb | Contenu des diapositives |
| `status` | text | Statut (draft, published) |

---

## Workflow 2: `n8n-workflow-carousel.json`

### Nom
**Instagram Carousel Generator**

### Description
Version alternative du générateur de carrousel avec étapes simplifiées.

### Déclencheur
- **Type**: Schedule trigger

### Étapes du workflow

1. **Schedule Trigger** — Déclencheur planifié
2. **Search Unsplash** — Recherche d'images
3. **Generate Content (Groq)** — Génère le contenu via Groq
4. **Post to Buffer** — Publie sur Buffer (optionnel)

### Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `UNSPLASH_KEY` | Clé API Unsplash |
| `GROQ_KEY` | Clé API Groq |
| `BUFFER_ACCESS_TOKEN` | Token API Buffer (si utilisé) |

---

## Workflow 3: `n8n-workflow-manual.json`

### Nom
**Instagram Carousel Generator**

### Description
Version manuelle du générateur avec workflow complet incluant la sauvegarde Supabase.

### Déclencheur
- **Type**: Manuel (Lanceur)

### Étapes du workflow

1. **Lanceur** — Point d'entrée manuel
2. **Brief** — Paramètres du carrousel
3. **Recherche Unsplash** — Recherche d'images
4. **Meilleure Photo** — Sélection de la meilleure image
5. **Génère Contenu (Groq)** — Génération LLM
6. **Parse JSON** — Parsing de la réponse
7. **Sauvegarde Supabase** — Enregistrement du draft

### Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `UNSPLASH_KEY` | Clé API Unsplash |
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_KEY` | Clé API Supabase |
| `GROQ_KEY` | Clé API Groq |

---

## Configuration des Variables n8n

Pour configurer les workflows dans n8n:

1. Ouvrir le fichier JSON du workflow
2. Aller dans **Settings > Variables**
3. Ajouter les variables suivantes:

```bash
UNSPLASH_KEY=your_unsplash_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_api_key
GROQ_KEY=your_groq_api_key
```

## Sécurité

- Les clés API ne doivent jamais être commitée dans le repository
- Utiliser les variables d'environnement n8n pour les secrets
- Les workflows accèdent à Supabase via les clés configurées

## Statut actuel

Les workflows sont configurés mais non actifs. Pour les activer:

1. Importer le JSON dans n8n
2. Configurer les variables d'environnement
3. Activer le trigger automatique ou laisser en mode manuel

---

*Document généré le 09/06/2026*
