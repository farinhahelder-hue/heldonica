# Architecture sans PC — le téléphone comme poste de commande

> **Statut.** Étude du **2026-10-15**. Elle répond à une décision du fondateur :
> « le PC doit disparaître — il n'est pas assez puissant pour générer des vidéos
> et des musiques localement ». La cible : **le Poco X6 Pro porte la base de
> connaissances, le dispatch et la coordination des tâches** ; le PC devient une
> option, éteinte par défaut.
>
> **Règle appliquée :** `AGENTS.md` — « On n'invente rien. » Chaque affirmation est
> adossée à un fichier du dépôt, avec un statut `[OBSERVÉ]`, `[INTERPRÉTATION]`,
> `[NON VÉRIFIÉ]` ou `[INDISPONIBLE]`.
>
> Ce document **fixe la direction avant le code**. Il est modifiable, mais on le
> modifie exprès — pas par accident.

---

## 1. La découverte qui change le coût du chantier

`[OBSERVÉ]` Le « Cerveau » du PC est **beaucoup plus léger que son nom ne le
laisse croire**. La lecture des fichiers du dépôt `heldonica-brain` montre que les
trois fonctions visées (base de connaissances, coordination, dispatch) **tournent
déjà sans le PC** :

| Fonction visée | Où elle tourne réellement aujourd'hui | Preuve |
|---|---|---|
| Base de connaissances (RAG) | **Cloud** — Supabase `pgvector` + embeddings Gemini 768d | `lib/ai-embeddings.ts`, `app/api/ai/search/route.ts`, `app/api/cron/embeddings/route.ts` |
| Registre des tâches | **Cloud** — table Supabase `agent_tasks` | `supabase/migrations/20260526000000_agent_tasks.sql` |
| API de coordination | **Cloud** — routes Next.js | `app/api/brain/tasks/route.ts`, `app/api/brain/tasks/[id]/route.ts` |
| Dispatch vers agents | **Cloud** — API REST distantes | `heldonica-brain/app/engine/agent_dispatch.py` (`jules`, `opencode`, `openhands`) |
| Montage vidéo / audio | **PC** (GPU) | `heldonica-brain/app/engine/video_assembler.py`, `comfy_manager.py` |
| Inférence LLM locale | **PC** (Ollama, GTX 1660 Ti) | `heldonica-brain/app/engine/llm_manager.py` |

`[INTERPRÉTATION]` Sur les six briques, **quatre ne dépendent pas du PC** : elles
sont déjà dans le cloud et accessibles par HTTP. Le PC ne garde que le GPU lourd.
Le chantier n'est donc pas « déplacer le cerveau » — c'est **donner un client
mobile aux API qui existent déjà**, puis retirer le poller.

`[OBSERVÉ]` Le RAG du PC n'est pas un moteur vectoriel : `knowledge_vault.py` fait
un `LIKE` SQLite + un score par mots (`_score_fiche`), avec un cosinus
*optionnel* qui appelle un service d'embeddings externe. Le vrai RAG sémantique
est côté site, dans `lib/ai-embeddings.ts` (Gemini 768d, `outputDimensionality: 768`).

---

## 2. Les quatre verrous techniques (chacun avec sa solution)

### 2.1 Le registre n'est pas exposé de façon générique

`[OBSERVÉ]` `app/api/brain/tasks/route.ts` et `[id]/route.ts` sont **figés sur un
seul destinataire** : le `GET` filtre `.eq('agent', 'heldonica-brain')`, et le
`POST` insère `agent: 'heldonica-brain'` en dur. Ces routes servent **le poller du
PC**, pas un client mobile générique.

`[OBSERVÉ]` Le serveur MCP (`mcp/agent-tasks/server.mjs`) est, lui, **générique**
(les cinq gestes : `taches_en_attente`, `lire_tache`, `prendre_tache`,
`rendre_compte`, `deposer_tache`) — mais il parle **directement à Supabase avec la
clé service** (`pg()` → `${URL_BASE}/rest/v1/...`).

`[INTERPRÉTATION]` C'est le verrou principal : **la clé service ne peut pas aller
dans un APK**. Un APK est décompilable ; y embarquer `SUPABASE_SERVICE_ROLE_KEY`
serait la réédition de l'incident « clé Gemini dans l'APK » fermé le 2026-10-15.
Il faut donc une **route serveur générique** qui porte la clé, et un client mobile
qui ne porte qu'un jeton révocable.

**Solution retenue.** Créer une API de registre **générique** (tous agents, pas
seulement `heldonica-brain`), authentifiée par le mécanisme **`verifyAiAuth`**
(`lib/ai-auth.ts`) — clés `hld_...` révocables, déjà utilisé par `/api/ai/search`.
L'APK envoie `x-api-key: hld_...` ; la clé service reste côté serveur.

### 2.2 L'authentification du pont est trop large pour un téléphone

`[OBSERVÉ]` `lib/bridge-auth.ts` accepte deux chemins : `x-cms-auth` (= mot de
passe CMS **admin**, accès total) ou `Authorization: Bearer $BRAIN_BRIDGE_TOKEN`
(un jeton partagé **unique**, non révocable, valable pour tout le pont).

`[INTERPRÉTATION]` Aucun des deux ne convient à un client mobile : le premier donne
les pleins pouvoirs d'administration, le second est un secret partagé qu'on ne peut
pas révoquer par appareil. Une clé API `hld_...` par appareil est révocable
individuellement — c'est le bon niveau.

### 2.3 La table `agent_tasks` n'a pas de RLS

`[OBSERVÉ]` `supabase/migrations/20260526000000_agent_tasks.sql`, ligne 14 :
« Pas de RLS — table interne CMS uniquement. Lecture via `SUPABASE_SERVICE_ROLE_KEY`
côté serveur ». Aucune politique RLS dans les migrations `agent_tasks`.

`[INTERPRÉTATION]` C'est cohérent avec un accès serveur uniquement. **Tant que
l'APK ne parle qu'à la route serveur**, l'absence de RLS n'est pas un problème.
Elle **deviendrait** un problème si un jour l'APK parlait à Supabase en direct —
ce que cette étude écarte précisément.

### 2.4 Le vocabulaire de statuts et de rôles est plus riche que les routes actuelles

`[OBSERVÉ]` Le MCP connaît cinq statuts (`sent`, `in_progress`,
`waiting_validation`, `blocked`, `done`) et huit destinataires (`claude`, `gemini`,
`opencode`, `jules`, `muse-spark`, `discord-bot`, `openhands`, `tous`).
`[id]/route.ts` n'accepte que `in_progress`, `done`, `blocked`.

`[INTERPRÉTATION]` L'écran mobile doit reprendre **le vocabulaire du MCP**, pas
celui de la route du poller — sinon deux vocabulaires coexistent, exactement ce que
la migration de coordination voulait éviter.

---

## 3. La cible

```
        ┌──────────────────────────────┐
        │   Poco X6 Pro (APK)          │
        │   • écran « Tâches »         │
        │   • écran « Savoirs »        │
        │   • montage vidéo (Media3)   │
        └───────────────┬──────────────┘
                        │  HTTPS + x-api-key: hld_...
                        ▼
        ┌──────────────────────────────┐
        │   Site Next.js (Vercel)      │
        │   • /api/agent-tasks  (NEUF) │  ← registre générique
        │   • /api/ai/search    (existe)│  ← RAG pgvector
        │   • /api/ai/generate  (existe)│  ← texte (Groq/Gemini)
        └───────────────┬──────────────┘
                        │  clé service (jamais dans l'APK)
                        ▼
        ┌──────────────────────────────┐
        │   Supabase (pgvector + table │
        │   agent_tasks)               │
        └──────────────────────────────┘

        PC = option « GPU lourd » (vidéo, musique, ComfyUI),
             éteint par défaut, appelé à la demande.
```

`[INTERPRÉTATION]` Le PC n'est pas supprimé du jour au lendemain : il devient un
**fournisseur optionnel** parmi d'autres. Le poller (`bridge_poller.py`) est le
seul composant à retirer, puisqu'il n'existe que pour surveiller la table depuis
une machine allumée en permanence — rôle que le téléphone tient désormais.

---

## 4. Plan par phases

### Phase 1 — Coordination depuis l'APK *(cette livraison : l'étude)*

- **Route neuve** `/api/agent-tasks` : cinq gestes alignés sur le MCP, tous
  agents, `verifyAiAuth`.
- **Écran « Tâches »** dans l'APK : lister (`sent` + `in_progress`), lire, prendre,
  rendre compte, déposer.
- **Pourquoi c'est sûr** : lecture d'abord ; toute écriture passe par la route,
  qui garde la clé service.

### Phase 2 — Base de connaissances depuis l'APK

- Écran « Savoirs » → `/api/ai/search` (existe déjà, `verifyAiAuth`).
- `[OBSERVÉ]` Aucune route à créer ; c'est un client à écrire.

### Phase 3 — Repli IA locale (hors-ligne)

- `[NON VÉRIFIÉ]` Le Poco X6 Pro peut exécuter un petit modèle. `[OBSERVÉ]`
  (source externe MediaTek/POCO) : Dimensity 8300 Ultra, APU 7ᵉ génération,
  jusqu'à 12 Go LPDDR5X. `[INTERPRÉTATION]` Suffisant pour un modèle 1–3B ; pas
  pour la qualité éditoriale Heldonica. Le cloud reste la voie principale, le
  local le repli.

### Phase 4 — Retrait du PC

- `bridge_poller.py` s'éteint (le téléphone le remplace).
- `agent_dispatch.py` est appelé depuis la route serveur, pas depuis le PC.
- Le PC reste branché uniquement pour la vidéo/musique, à la demande.

---

## 5. Ce que cette étude ne fait pas

- `[OBSERVÉ]` Elle n'écrit aucune ligne de code Kotlin ni de route : c'est une
  étude, comme `docs/FUSION_APPS_ANDROID.md` l'a été avant elle.
- `[NON VÉRIFIÉ]` Elle n'a pas été testée contre la base de production (pas
  d'identifiants Supabase dans l'environnement de rédaction).
- `[INDISPONIBLE]` Le débit réel de `/api/ai/search` depuis un téléphone en 4G
  n'a pas été mesuré.

---

## 5bis. Décision du fondateur : le worker, c'est le Poco

> **Statut.** Décision prise le **2026-10-15** : « on fait sur ce téléphone alors
> le Poco ». Elle tranche la question du worker qui surveille le registre.

`[OBSERVÉ]` Aujourd'hui, ce rôle est tenu par `bridge_poller.py` : une boucle
`while True` sur le PC, qui interroge `/api/brain/tasks?status=sent` toutes les
30 s (`_poll_and_execute`, `_base_url/api/brain/tasks`). Le PC doit donc rester
**allumé en permanence** — c'est exactement ce que la décision cherche à éviter.

### Pourquoi le PC ne peut pas devenir un worker mobile

`[OBSERVÉ]` Le code du Cerveau n'est pas portable vers Android :

| Obstacle | Preuve |
|---|---|
| Chemins Windows en dur | `video_assembler.py:29` `FFMPEG_EXE = BIN_DIR / "ffmpeg.exe"` ; `comfy_manager.py:19` `C:\Users\Work\ComfyUI` ; `audio_narrator.py:51` `Path(r"C:\Users\Work\heldonica-brain\bin\piper")` |
| Dépendances non installables | `opencv-python`, `numpy`, `pillow` (requirements.txt) — pas de roue Android pour `opencv-python` ; `edge-tts` demande des roues non fournies |
| GPU/CUDA | `comfy_manager.py` lance ComfyUI (`pytorch 2.6.0+cu124`) en sous-processus : hors de portée d'un téléphone |

`[INTERPRÉTATION]` **Le code du Cerveau reste sur le PC.** Ce qui va sur le
téléphone n'est pas le code Python : c'est **le rôle** — lire le registre, prendre
une tâche, rendre compte. L'APK fait déjà les trois (PR #601).

### La contrainte Android qui commande tout le reste

`[OBSERVÉ]` `app/build.gradle.kts` : `compileSdk = 34`, `targetSdk = 34` →
Android 14. Depuis **Android 12 (API 31)**, un `WorkManager` périodique est
soumis aux restrictions de veille : la période minimale de 15 min n'est **pas**
garantie, et le système reporte ou annule les exécutions. Depuis **Android 14**,
un `foregroundServiceType` est **obligatoire** pour un service de premier plan.

`[OBSERVÉ]` Aucune permission `FOREGROUND_SERVICE` n'est déclarée dans
`AndroidManifest.xml` aujourd'hui.

`[INTERPRÉTATION]` Un worker 24/7 sur le Poco exige donc : un **service de premier
plan** avec `foregroundServiceType`, une **notification permanente** (obligatoire
depuis Android 8), et l'exemption de l'optimisation de batterie. Ce n'est pas une
option technique parmi d'autres : sans ces trois pièces, Android tue le worker et
la coordination s'arrête sans le dire.

### Le trou trouvé en écrivant cette section

`[OBSERVÉ]` La table `agent_tasks` a `claimed_at` (`20260911120000_agent_tasks_coordination.sql`)
mais **aucun bail, aucune expiration, aucun mécanisme de reprise**. Le heartbeat
du poller (`_send_heartbeat`) parle au PC, pas à Supabase : rien en base ne dit
qu'un worker est mort.

`[INTERPRÉTATION]` Avec un PC allumé, la question ne se posait pas. Avec un
téléphone qu'Android tue (veille, batterie, mémoire), **elle se pose à chaque
fois** : une tâche prise par un worker mort resterait `in_progress` pour toujours.

**Corrigé dans cette PR** : `BAIL_MINUTES = 90` dans `app/api/agent-tasks/route.ts`.
Une prise expire au bout de 90 minutes, redevient `sent`, et le nom de
l'abandonnaire part dans `payload.bail_expire`. Balayage à la demande
(`GET ?balayer=1`, pour un cron) et à la prise (pour un worker qui redémarre).
5 tests ajoutés, vérifiés par mutation (2 échecs ciblés en désactivant le bail).

### Ce que le Poco peut porter, et ce qu'il ne peut pas

| Brique | Sur le Poco ? | Pourquoi |
|---|---|---|
| Registre des tâches (lire/prendre/rendre) | ✅ Fait (PR #601) | HTTP + OkHttp, déjà embarqué |
| RAG / savoirs | ✅ Possible | `/api/ai/search` existe ; c'est un client à écrire |
| Montage vidéo | ✅ Déjà là | Media3 Transformer, `MontageVideo.kt` — même outil qu'Android |
| Dispatch vers agents distants | ✅ Possible | Les cibles sont déjà des API (Jules, OpenHands Cloud) |
| Rendu ffmpeg lourd (`video_assembler`) | ❌ | ffmpeg.exe Windows + numpy/opencv ; à réécrire en Media3 |
| Musique (ComfyUI) | ❌ | CUDA, hors de portée |
| Inférence LLM locale | ⚠️ `[NON VÉRIFIÉ]` | Dimensity 8300 Ultra : 1–3B possible, pas la qualité éditoriale |

`[INTERPRÉTATION]` **Le Poco remplace le PC comme poste de commande, pas comme
usine.** La coordination, le RAG et le dispatch tiennent dans sa poche. La vidéo
tient aussi, par un autre outil (Media3 au lieu de ffmpeg). Restent la musique et
l'inférence lourde : elles passent au cloud, ou meurent.

### Décision qui en découle

Le PC peut être **éteint** pour tout ce qui est coordination, RAG et publication.
Il ne se rallume que pour la musique (ComfyUI) ou une inférence locale. Le
`bridge_poller.py` devient inutile dès que le service de premier plan de l'APK
sait lire le registre — c'est la Phase 4.

---

## 6. Décisions demandées au fondateur

1. **Cloud-first ou local-first pour le RAG ?** *(Recommandation : cloud d'abord,
   local en repli — c'est la formule « on peut toujours ajouter un fallback ».)*
2. **L'APK dispatche-t-elle, ou seulement crée-t-elle des tâches ?**
   *(Recommandation : créer et prendre ; le dispatch d'agents reste serveur.)*
3. **Le PC garde-t-il la vidéo/musique, ou on loue du GPU cloud ?**
   *(Coût récurrent contre matériel déjà là.)*

---

## 7. Journal des vérifications

- `[OBSERVÉ]` `npm run preflight` : **6/6** contrôles réussis avant rédaction.
- `[OBSERVÉ]` Toutes les preuves de la §1 sont des chemins de fichiers lus dans le
  dépôt à la date du 2026-10-15.
- `[NON VÉRIFIÉ]` Aucun appel réseau n'a été fait pour confirmer l'état de
  production des routes.
