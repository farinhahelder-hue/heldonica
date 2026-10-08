# INFRASTRUCTURE HELDONICA — Cadre Supabase + Vercel + GitHub

_Derniere mise a jour : 15 septembre 2026 — a garder a jour si un projet/ID change_

## 1. GitHub (code source + CI/CD)

**Repo principal** : `farinhahelder-hue/heldonica` (branche `main`)
- C'est ici que vivent le site, le CMS integre, l'APK (`heldonica-mobile/`), et les scripts MCP
- Fichiers cles : `STATUS.md` (snapshot), `TASKS.md` (priorites hebdo), `AGENTS.md` + `CLAUDE.md` (protocole IA), `INFRASTRUCTURE.md` (ce fichier)

**Autres repos** :
- `heldonica-cms` : archivé le 15/09/2026 (GitHub Archived, Vercel projet supprimé) → abandonné
- `heldonica-skills`, `heldonica-travel-companion`, `heldonica-content-factory-next` : prives, utilitaires

**CI/CD** : GitHub Actions → deploiement auto sur Vercel a chaque push sur `main`

---

## 2. Vercel (hebergement + deploiements)

**Team** : `farinhahelder-1210s-projects` (ID : `team_ML6tkTKb5s1Nuo3ZjERGA5BS`)

**Projets actifs** :
| Nom | ID Vercel | Repo lie | URL prod | Statut |
|-----|-----------|----------|----------|--------|
| `heldonica` | `prj_4d7Oa5uwMyF0i5jYOYHPzmNZfmxl` | `heldonica` | `heldonica-dmcjfvc3w-farinhahelder-1210s-projects.vercel.app` | PROD (site + CMS integre) |
| `heldonica-cms` | `prj_V7sHJ3fN2O0dUg8aUHvUkfkm0BTb` | `heldonica-cms` | `heldonica-ga5rpwr1l-farinhahelder-1210s-projects.vercel.app` | Fige depuis 13/06/2026 → a archiver |

**Projets a nettoyer** :
- `heldonica2` : orphelin, retourne `DEPLOYMENT_NOT_FOUND` (voir issue #441)

**Variables d'environnement Vercel** (a ne pas modifier sans validation) :
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` (pour le coordinateur, si active)
- `CRON_SECRET` (rotation recente, voir commit `c7d8425`)

---

## 3. Supabase (base de donnees + auth + storage)

**Projet principal** : `farinhahelder-hue's Project` (ref : `smxnruefmrmfyfhuxygq`, region `eu-west-1`)
- Statut : `ACTIVE_HEALTHY`
- Host DB : `db.smxnruefmrmfyfhuxygq.supabase.co`
- Postgres 17.6.1.084

**Tables cles** :
- `agent_tasks` : registre de coordination IA (via MCP, voir `AGENTS.md`)
- `cms_blog_posts` : source de verite pour les articles (74 usages, 8 migrés #448)
- `articles` : legacy → backup `backup_articles_20260915` (48 lignes), 0 usage restant, DROP prévu après 7j (#448)
- `destinations`, `cms_pillar_pages`, `cms_settings` : contenu CMS
- `instagram_drafts`, `instagram_scheduled_posts`, `instagram_comments` : pipeline Instagram
- `newsletter_subscribers` : mailing

**Alertes securite** (Supabase Advisors, 12/09/2026) :
- 7 tables avec RLS active mais **aucune policy** : `cms_pricing_plans`, `instagram_comments`, `instagram_scheduled_posts`, `instagram_webhook_logs`, `jules_memory`, `jules_sessions`, `newsletter_subscribers`
- 1 vue `SECURITY DEFINER` : `v_agent_governance`
- 13 fonctions avec `search_path` mutable (ex : `check_auth_role`, `sync_cms_to_articles`, `update_updated_at_column`...)
- Protection mot de passe compromis (HaveIBeenPwned) : **desactivee**

**Actions requises** :
1. Ajouter des policies RLS sur les 7 tables sans policy
2. Revoquer `EXECUTE` sur `check_auth_role()` ou passer en `SECURITY INVOKER`
3. Fixer `search_path` dans les 13 fonctions
4. Activer HaveIBeenPwned dans Auth Settings

---

## 4. Flux de deploiement

```
Push sur main (GitHub)
  → GitHub Actions (build Next.js)
    → Vercel (deploiement prod auto)
      → Site live : heldonica.fr (ou URL Vercel en attendant le domaine custom)
```

**Rollback** : chaque deploiement Vercel a un `isRollbackCandidate: true` → cliquer sur "Redeploy" depuis le dashboard Vercel si besoin

---

## 5. Regles d'or

1. **Ne jamais modifier la prod sans passer par `main`** (pas de push direct sur Vercel, pas de modif SQL en direct sans migration)
2. **Toute migration DB** → fichier SQL dans `supabase/migrations/` + commit sur `main`
3. **Toute variable d'env** → documentee ici + ajoutee dans Vercel + GitHub Secrets
4. **Toute table nouvelle** → policy RLS ecrite des le depart (pas de "on verra apres")

---

## 6. Contacts / acces

- **GitHub** : `farinhahelder-hue` (owner)
- **Vercel** : team `farinhahelder-1210s-projects` (plan Hobby)
- **Supabase** : org `lthnhijqpgswsgpqakua`, projet `smxnruefmrmfyfhuxygq`

**Secrets a ne jamais commiter** :
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `CRON_SECRET`
- `GITHUB_TOKEN` (PAT)

---

## 7. Architecture IA & « Brain » (Deux Composants Complémentaires)

Deux projets distincts coexistent sur la station locale pour les opérations IA :

1. **Heldonica Brain II (Backbone & Opérations 24/7)** : `C:\Users\Work\heldonica-brain`
   - **Rôle** : Système central autonome (serveur principal port `8440` + façade agents port `8451`).
   - **Composants** :
     - Base SQLite locale (`heldonica_brain.db` & `agent_jobs.db`).
     - **Coffre des Savoirs (RAG)** : 55 fiches de référence (manifeste, pépites, articles publiés, et flux Atom Blogger d'origine pour la voix authentique du duo).
     - **Pont CMS (BridgePoller)** : Écoute et dépile les requêtes d'agents depuis la table Supabase `agent_tasks`.
     - **Façade Agents (Port 8451)** : File d'attente locale token-gated produisant des brouillons autonomes sans jamais publier directement vers la production.
     - **Gestionnaire Hardware** : Supervision GTX 1660 Ti et Ollama local.
   - **Service Windows** : Lancé automatiquement au démarrage via la tâche planifiée `HeldonicaBrain` (script `scripts/start_brain_service.ps1`).

2. **Copilote Brain 8470 (Assistant Interactif CMS)** : `C:\Users\Work\heldonica\heldonica-brain`
   - **Rôle** : Micro-service local léger (port `8470`, `server.py`) dédié à l'interface d'édition CMS (`/panel-manager/brain`).
   - **Composants** :
     - Analyse visuelle instantanée par glisser-déposer de photo (`/api/analyze-image`).
     - Rédaction immédiate de légendes Instagram et carrousels dans le respect strict de la charte de voix (`brand.py`, validation offline `selftest.py` 58/58).
     - Règle anti-invention : les éléments incertains ou absents de la photo sont balisés `[👉 TOI : ce qui manque]`.
     - Mémoire d'apprentissage de style locale (`memory.json`, gitignorée).

**Source de vérité partagée** :
- La voix de marque canonique est définie dans `lib/brand-voice.ts` et répliquée dans `brand.py`.
- Le corpus historique de référence est `content/voix/blogger-heldonica-feed.atom`.
- Tout contenu généré reste systématiquement au statut brouillon (`draft`) — la mise en ligne nécessite toujours une validation humaine.

---

Voir `STATUS.md` pour l'etat courant (priorites, issues ouvertes, dette technique).
