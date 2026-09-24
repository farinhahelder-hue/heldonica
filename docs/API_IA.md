# API IA Universelle — Heldonica

Cette documentation décrit l'API IA centralisée (`/api/ai/*`) permettant à tous les agents et outils du projet Heldonica (Antigravity IDE, Claude Code CLI, Pencode, APK Mobile) d'accéder aux modèles IA (Gemini 2.5 Flash) avec le respect strict de la voix de marque Heldonica et du regard sensoriel (TSA / slow travel).

---

## 🔑 1. Authentification & Clés API

Chaque agent dispose d'une clé API dédiée avec rate limiting indépendant et journalisation centralisée dans Supabase (`api_keys` et `ai_requests_log`).

### Format de l'en-tête
Fournir la clé soit via l'en-tête `x-api-key`, soit via `Authorization: Bearer` :
```http
x-api-key: hld_ag_<32 caractères hexadécimaux>
```
ou
```http
Authorization: Bearer hld_ag_<32 caractères hexadécimaux>
```

### Clés pré-provisionnées par agent

| Agent | Préfixe | Quota (req/h) | Où est le jeton |
|---|---|---|---|
| **Antigravity (IDE local)** | `hld_ag_` | 120 | `.agent-keys.local` du poste qui a lancé `scripts/seed_agent_keys.mjs` |
| **Claude Code (CLI)** | `hld_cl_` | 120 | `.agent-keys.local` du poste qui a lancé `scripts/seed_agent_keys.mjs` |
| **Pencode (éditeur distant)** | `hld_pe_` | 100 | `.agent-keys.local` du poste qui a lancé `scripts/seed_agent_keys.mjs` |
| **Mobile APK (Heldonica App)** | `hld_mb_` | 150 | `.agent-keys.local` du poste qui a lancé `scripts/seed_agent_keys.mjs` |

*Sécurité : les clés n'existent en base que sous forme de hash SHA-256 (`api_keys.key_hash`) et ne sont écrites nulle part dans le dépôt — ni ici, ni dans le code, ni dans les migrations. Le 16/09/2026, quatre jetons figuraient dans ce fichier, dans `lib/ai-auth.ts` et dans `scripts/seed_agent_keys.mjs` d'un dépôt public ; ils ont été révoqués (migration `20260916134640_rotate_api_keys.sql`). Pour créer ou faire tourner une clé : `node scripts/seed_agent_keys.mjs [agent…]` puis `supabase db push --linked`.*

---

## 📡 2. Endpoints Disponibles

### A. `POST /api/ai/vision` — Analyse visuelle sensorielle (Gemini 2.5 Flash)

Analyse une photo de terrain selon le regard sensoriel TSA et la voix slow travel Heldonica.

#### Paramètres (JSON ou `multipart/form-data`)
- `image` : Image encodée en base64 (avec ou sans préfixe data URL) OU fichier via FormData (`multipart/form-data`).
- `mimeType` *(optionnel)* : Type MIME (défaut `image/jpeg`).
- `placeTitle` *(optionnel)* : Ancrage géographique ou nom du lieu pour guider la narration.

#### Exemple de réponse (HTTP 200)
```json
{
  "success": true,
  "agent": "antigravity",
  "caption": "À Timișoara, on s'est posés sous la tonnelle aux lattes de bois patiné. Le cliquetis feutré des cloches de la cathédrale au loin accompagne la fraîcheur de l'eau infusée à la menthe. Les pavés irréguliers gardent la tiédeur de la mi-journée. As-tu déjà ressenti ce moment où la rumeur de la ville s'efface d'un coup ?",
  "hashtags": ["#slowtravel", "#heldonica", "#timisoara", "#roumanie"],
  "fullText": "À Timișoara, on s'est posés...\n\n#slowtravel #heldonica #timisoara #roumanie"
}
```

---

### B. `POST /api/ai/copilot` — Génération de contenu & Copilote

Génère un contenu calibré ou fournit une recommandation de pilotage.

#### Paramètres (JSON)
- `mode` *(requis)* :
  - Modes contenu : `'instagram'`, `'story'`, `'blog'`, `'newsletter'`.
  - Modes coach ADHD/TSA : `'1'` (création contenu), `'2'` (planification & pilotage), `'3'` (développement & site).
- `message` *(requis)* : Notes de terrain réelles, contexte ou question de pilotage.

#### Exemple de réponse (HTTP 200)
```json
{
  "success": true,
  "agent": "claude",
  "reply": "Texte généré...",
  "controle": {
    "niveau": "essentiel",
    "score": null,
    "passed": true,
    "forbiddenFound": [],
    "checks": [
      { "id": "pronouns", "ok": true, "message": "Pronom 'on' respecté" },
      { "id": "forbidden", "ok": true, "message": "Aucun mot banni détecté" }
    ]
  },
  "enregistre": true
}
```

---

### C. `GET /api/ai/copilot` — Historique des générations

Consulte l'historique des générations stockées en base (`copilot_generations`).

#### Paramètres (Query params)
- `limit` *(optionnel)* : Nombre de résultats (défaut 10, max 50).
- `mode` *(optionnel)* : Filtrer par mode (`instagram`, `blog`, etc.).

---

### D. `GET /api/ai/destinations` — Connaissance structurée & Itinéraires de terrain

Accède aux 41 destinations authentiques stockées en base Supabase (itinéraires réels jour par jour, narrations, extraits, FAQs). Idéal pour injecter du vécu réel dans les prompts sans hallucination.

#### Paramètres (Query params)
- `slug` *(optionnel)* : Slug précis de la destination (ex: `madere-7-jours-slow-travel`).
- `country` *(optionnel)* : Filtrer par pays (ex: `Portugal`, `Suisse`, `Roumanie`).
- `limit` *(optionnel)* : Nombre de résultats (défaut 50).

#### Exemple de réponse (HTTP 200)
```json
{
  "success": true,
  "count": 41,
  "destinations": [
    {
      "id": "...",
      "slug": "madere-7-jours-slow-travel",
      "title": "Madère en 7 jours slow travel",
      "country": "Portugal",
      "excerpt": "Itinéraire testé sur le terrain...",
      "itinerary": [
        { "day": 1, "title": "Arrivée à Funchal et Mercado dos Lavradores", "desc": "..." }
      ]
    }
  ]
}
```

---

### E. `GET /api/ai/analytics` — Statistiques, supervision des quotas et logs

Fournit les métriques globales de consommation des modèles IA, les quotas par agent, la ventilation par endpoint et l'historique détaillé des appels (`ai_requests_log`).

#### Paramètres (Query params)
- `agent` *(optionnel)* : Filtrer par agent (`antigravity`, `claude`, `mobile_apk`, `pencode`, `cms_session`).
- `endpoint` *(optionnel)* : Filtrer par endpoint.
- `limit` *(optionnel)* : Nombre de logs récents (défaut 100, max 500).
- `export=csv` *(optionnel)* : Exporte directement les logs sous forme de fichier CSV téléchargeable (`Content-Type: text/csv`).

#### Exemple de réponse JSON (HTTP 200)
```json
{
  "success": true,
  "summary": {
    "totalRequests": 42,
    "successRequests": 41,
    "errorRequests": 1,
    "successRate": 97.6,
    "avgDurationMs": 1450,
    "requestsLast24h": 12,
    "activeKeysCount": 4
  },
  "agents": [
    {
      "name": "antigravity",
      "quota": 120,
      "isActive": true,
      "lastUsedAt": "2026-09-16T10:48:23.718Z",
      "requestsCount": 18,
      "errorsCount": 0,
      "avgDurationMs": 1200
    }
  ],
  "endpoints": [
    { "endpoint": "/api/ai/copilot", "count": 28, "errors": 0, "avgDurationMs": 1800 }
  ],
  "recentLogs": [ ... ]
}
```

---

### F. `POST & GET /api/ai/search` — Recherche Sémantique & Vectorielle (Gemini 768d + pgvector)

Permet de rechercher des destinations et articles par similarité sémantique en langage naturel (au-delà des simples mots-clés). Utilise le modèle Gemini `gemini-embedding-001` (768 dimensions) et la fonction de similarité cosinus.

#### Paramètres (Query params en GET ou JSON en POST)
- `q` *(requis)* : Question ou description d'ambiance en langage naturel (ex: *« crique secrète avec peu de vent »*, *« bières artisanales en terrasse »*).
- `type` *(optionnel)* : `'all'` | `'destinations'` | `'articles'` (défaut `'all'`).
- `limit` *(optionnel)* : Nombre de résultats max (défaut 6, max 30).
- `threshold` *(optionnel)* : Seuil de similarité cosinus minimal (défaut 0.45).

#### Exemple de réponse JSON (HTTP 200)
```json
{
  "success": true,
  "query": "crique secrète avec peu de vent à Madère",
  "count": 3,
  "method": "pgvector_cosine",
  "results": [
    {
      "type": "destination",
      "id": "uuid-madere",
      "slug": "madere-7-jours-slow-travel",
      "title": "Madère slow travel | Guide Heldonica",
      "subtitle": "Portugal · Atlantique",
      "excerpt": "Itinéraire testé sur le terrain...",
      "similarity": 0.892,
      "matchScorePercent": 89,
      "url": "/destinations/madere-7-jours-slow-travel"
    }
  ]
}
```

---

## 💻 3. Exemples d'Appel par Langage

### cURL
```bash
# Copilote Heldonica (Mode Instagram)
curl -X POST https://heldonica.com/api/ai/copilot \
  -H "Content-Type: application/json" \
  -H "x-api-key: hld_ag_<32 caractères hexadécimaux>" \
  -d '{
    "mode": "instagram",
    "message": "Bord de mer à Madère, galets polis par les vagues, odeur d iode et embruns froids. Fin d apres-midi silencieuse."
  }'
```

### TypeScript / Node.js
```typescript
import fs from 'node:fs';

const API_KEY = process.env.HELDONICA_AI_KEY || 'hld_ag_<32 caractères hexadécimaux>';
const BASE_URL = process.env.HELDONICA_BASE_URL || 'https://heldonica.com';

// 1. Analyse Vision
async function analyserPhoto(imagePath: string, placeTitle: string) {
  const base64Image = fs.readFileSync(imagePath).toString('base64');

  const res = await fetch(`${BASE_URL}/api/ai/vision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      image: base64Image,
      mimeType: 'image/jpeg',
      placeTitle,
    }),
  });

  return await res.json();
}

// 2. Rédaction Copilote
async function genererLegende(notesDeTerrain: string) {
  const res = await fetch(`${BASE_URL}/api/ai/copilot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      mode: 'instagram',
      message: notesDeTerrain,
    }),
  });

  return await res.json();
}
```

### Python
```python
import os
import requests
import base64

API_KEY = os.getenv("HELDONICA_AI_KEY", "hld_cl_<32 caractères hexadécimaux>")
BASE_URL = os.getenv("HELDONICA_BASE_URL", "https://heldonica.com")

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# Appel Copilote
payload = {
    "mode": "instagram",
    "message": "Rue pavée et calme à Timișoara, soleil bas, parfum de tilleul."
}

response = requests.post(f"{BASE_URL}/api/ai/copilot", json=payload, headers=headers)
print(response.json())
```

---

## 🛠 4. Configuration dans chaque Agent

### Antigravity (IDE local)
La clé est provisionnée par défaut dans `lib/ai-auth.ts`.
Dans vos scripts locaux ou sidecars, définissez dans `.env.local` :
```env
AI_AGENT_API_KEY=hld_ag_<32 caractères hexadécimaux>
```

### Claude Code (CLI)
Ajoutez la variable d'environnement dans votre shell (`~/.bashrc`, `~/.zshrc` ou session CLI) :
```bash
export HELDONICA_AI_KEY="hld_cl_<32 caractères hexadécimaux>"
```

### Pencode (éditeur distant)
Renseignez dans la configuration des secrets de l'environnement :
`HELDONICA_AI_KEY = hld_pe_<32 caractères hexadécimaux>`

---

## 📋 5. Migration & Amorçage en Base

Pour activer la persistance complète des clés et des logs de requêtes dans Supabase :
1. Exécuter la migration : `supabase/migrations/20260916120000_create_api_keys_and_ai_logs.sql`
2. Lancer le script d'insertion ou copier le SQL généré :
```bash
node scripts/seed_agent_keys.mjs
```
