# AI Agent Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Heldonica CMS                          │
├─────────────────────────────────────────────────────────────┤
│  /api/ai/content     → READ/WRITE articles                │
│  /api/ai/enhance    → IMPROVE text/SEO/media              │
│  /api/ai/media     → OPTIMIZE images/videos              │
│  /api/cms/validate → VALIDATE before publish             │
└─────────────────────────────────────────────────────────────┘
           ↑                    ↑                    ↑
           │                    │                    │
    ┌──────┴──────┐     ┌──────┴──────┐     ┌──────┴──────┐
    │   n8n       │     │ AI Agents   │     │  Vercel     │
    │ (workflows) │     │ (Jules,etc) │     │ cron       │
    └─────────────┘     └────────────┘     └────────────┘
```

## Option 1: Connect n8n

### Step 1: Create Workflow in n8n

1. **n8n → New Workflow**
2. **Webhook Node** (trigger)
   - Method: POST
   - Path: `/api/webhooks/heldonica` (you define in n8n)
3. **HTTP Request** → Call Heldonica API

### Step 2: Example n8n Flow

```json
{
  "name": "Publish Article with AI Review",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "publish-article"
      }
    },
    {
      "name": "Validate",
      "type": "httpRequest",
      "parameters": {
        "url": "{{$env.HELDONICA_URL}}/api/cms/validate",
        "method": "POST",
        "body": "={{$json.article_id}}"
      }
    },
    {
      "name": "Publish",
      "type": "httpRequest",
      "parameters": {
        "url": "{{$env.HELDONICA_URL}}/api/cms/articles/{{$json.article_id}}",
        "method": "PUT",
        "body": "={{$json.published: true}}"
      }
    }
  ]
}
```

### Step 3: Environment Variables (in n8n)

```
HELDONICA_URL=https://www.heldonica.fr
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-service-role-key
```

---

## Option 2: Connect AI Agents (Jules, Claude, etc.)

### Using the Content API

```bash
# List all published articles
curl "https://www.heldonica.fr/api/ai/content?published=true"

# Filter by country
curl "https://www.heldonica.fr/api/ai/content?country=Portugal&published=true"

# Create new article
curl -X POST "https://www.heldonica.fr/api/ai/content" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "article": {
      "title": "Weekend à Lisbonne",
      "category": "destinations",
      "country": "Portugal",
      "content": "<p>Mon guide...</p>"
    }
  }'
```

### Using the Enhance API

```bash
# Get AI improvement suggestions
curl -X POST "https://www.heldonica.fr/api/ai/enhance" \
  -H "Content-Type: application/json" \
  -d '{
    "article_id": 42,
    "enhancements": ["text", "seo", "media", "forbidden"]
  }'
```

**Response:**
```json
{
  "article_id": 42,
  "enhancements": {
    "text": {
      "score": 70,
      "suggestions": ["Couper les paragraphes longs"]
    },
    "seo": {
      "score": 85,
      "meta_title": "Weekend Lisbonne...",
      "meta_description": "Guide complet..."
    },
    "media": {
      "suggestions": [{"type": "featured", "query": "Lisbonne travel"}]
    },
    "forbidden": {"found": [], "clean": true}
  }
}
```

---

## Option 3: Using Perplexity (for research)

### Step 1: Research a destination

Use Perplexity to get content, then create article via API:

```python
import requests

# 1. Research with Perplexity (external)
content = await perplexity.search("Que faire à Madère en 3 jours?")

# 2. Create article in CMS
response = requests.post(
  "https://www.heldonica.fr/api/ai/content",
  json={
    "action": "create",
    "article": {
      "title": "3 jours à Madère - Guide complet",
      "category": "destinations",
      "country": "Portugal",
      "city": "Funchal",
      "travel_style": "slow-travel",
      "content": content.html,
      "excerpt": content.summary
    }
  }
)
```

---

## Option 4: Jules/OpenHands Agent

### Using OpenHands SDK

```python
from openhands import Agent

# Create agent that manages Heldonica content
agent = Agent(
    name="heldonica-editor",
    instructions="""Tu es l'éditeur du blog Heldonica.
    - Utilise /api/ai/content pour lister et créer des articles
    - Utilise /api/ai/enhance pour améliorer le contenu avant publication
    -Respecte le brand voice (voir lib/brand-voice.ts)"""
)

# Agent can:
# 1. List articles needing review
articles = agent.run("Liste les articles destinations publiés")

# 2. Enhance an article  
result = agent.run("Améliore l'article 42 avec suggestions SEO")

# 3. Create new content
agent.run("Crée un nouvel article sur la Sicile")
```

---

## Security: API Keys

For external access, add API key protection:

```typescript
// app/api/ai/content/route.ts
const API_KEY = process.env.AI_AGENT_API_KEY

export async function GET(request: NextRequest) {
  const auth = request.headers.get('x-api-key')
  if (auth !== API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of handler
}
```

**Environment variables à définir dans Vercel:**
```
AI_AGENT_API_KEY=votre-cle-secrete
```

---

## Webhook pour n8n (automatisations)

### Quand un article est publié

```typescript
// app/api/cms/publish-scheduled/route.ts
if (process.env.N8N_WEBHOOK_URL) {
  await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'article.published',
      article: { id, title, slug, category, country }
    })
  })
}
```

### Envoyer vers n8n

```
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/heldonica-published
```

---

## Summary: Quick Start

| Tool | What faire | Endpoint |
|------|-----------|----------|
| **n8n** | Automatiser publish/schedule | `/api/cms/publish-scheduled` |
| **AI Agent** | Créer/modifier contenu | `/api/ai/content` |
| **AI Agent** | Améliorer texte/SEO | `/api/ai/enhance` |
| **AI Agent** | Optimiser médias | `/api/ai/media` |
| **Perplexity** | Rechercher contenu | Externe → `/api/ai/content` (create) |

---

## Prochaines idées

1. **Slack bot** — Commandes `/heldonica publish 42`
2. **Notion sync** — Créer articles depuis Notion
3. **Auto-reddit** — Poster automatiquement sur Reddit

---

## 🆕 Webhook System (v2)

Le CMS peut maintenant envoyer des webhooks automatiquement !

### Architecture

```
Heldonica CMS ──🔴 event ──▶ Webhook Dispatcher ──▶ n8n / Slack / Discord
                  (lib/webhook-dispatcher.ts)
```

### Events dispatchés

| Event | Quand | Payload |
|-------|-------|----------|
| `article.created` | Nouvel article créé | article data |
| `article.updated` | Article modifié | article data |
| `article.published` | Publication | article data |
| `validation.failed` | Échec validation | article + issues |

### Configuration Vercel

```
# Webhooks
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/heldonica
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
```

### API Manuelle

```bash
# Trigger un événement
curl -X POST "https://www.heldonica.fr/api/webhook/trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "article.published",
    "article_id": 42
  }'
```

### API n8n

```bash
#Liste les articles pour n8n
curl "https://www.heldonica.fr/api/n8n/articles?status=draft&days=7"

# Met à jour un article
curl -X PATCH "https://www.heldonica.fr/api/n8n/articles" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 42,
    "published": true,
    "travel_style": "slow-travel"
  }'
```

### Exemple n8n Workflow

```json
{
  "name": "Article Published Handler",
  "nodes": [
    {
      "name": "Webhook",
      "type": "webhook",
      "parameters": { "path": "heldonica-published" }
    },
    {
      "name": "Slack",
      "type": "slack",
      "parameters": {
        "channel": "#heldonica",
        "text": "={{$json.article.title}} publié !"
      }
    }
  ]
}
```