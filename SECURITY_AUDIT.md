# Security Audit — Routes API CMS

**Généré le :** 2026-05-26  
**Auditeur :** OpenHands (AllHands)

---

## Routes protégées ✅

Ces routes vérifient l'authentification CMS (via `requireCmsAuth`) avant d'exécuter les requêtes Supabase :

| Route | Méthodes | Fonction Auth |
|-------|----------|---------------|
| /api/cms/articles | GET, POST | requireCmsAuth |
| /api/cms/articles/[id] | GET, PUT, DELETE | requireCmsAuth |
| /api/cms/auth | POST, GET, DELETE | routes d'auth (login/check/logout) |
| /api/cms/settings | GET, PUT | requireCmsAuth |
| /api/cms/content | GET, PUT | requireCmsAuth |
| /api/cms/media-upload | POST | requireCmsAuth |
| /api/cms/demandes-travel | GET, PUT, PATCH | requireCmsAuth |
| /api/cms/ai-reply | POST | requireCmsAuth |
| /api/cms/media | GET, POST, DELETE | requireCmsAuth |
| /api/cms/blog-cover-upload | POST | requireCmsAuth |
| /api/cms/carousel-history/[id] | DELETE | requireCmsAuth |
| /api/cms/google-photos | GET | requireCmsAuth |
| /api/cms/google-photos/import | POST | requireCmsAuth |
| /api/cms/fix-empty-images | POST | requireCmsAuth |
| /api/cms/setup-storage | GET | requireCmsAuth |
| /api/cms/upload | POST | requireCmsAuth |
| /api/cms/validate | GET, POST | requireCmsAuth |

---

## Routes non protégées ❌

Ces routes exécutent des requêtes Supabase **sans vérification d'authentification CMS** :

| Route | Méthodes | Problème | Recommandation |
|-------|----------|---------|---------------|
| /api/cms/analytics | POST | Aucune auth requise | Acceptable si c'est vraiment des mock data |
| /api/cms/newsletter | POST | Aucune auth (inscription newsletter) | OK intentionnel — endpoint public |
| /api/cms/newsletter | GET | Vérifie CMS_ADMIN_KEY via query param | ⚠️ CORRIGER : utiliser requireCmsAuth |
| /api/cms/llm-search | POST | Vérifie authorization header basique | ⚠️ CORRIGER : utiliser requireCmsAuth |
| /api/cms/carousel-history | GET, POST | Aucune auth CMS | ⚠️ CORRIGER : ajouter requireCmsAuth |
| /api/cms/media-storage | GET, DELETE | Vérifie x-cms-password header custom | ⚠️ CORRIGER : utiliser requireCmsAuth standard |
| /api/cms/search-console | POST | Vérifie authorization header | ⚠️ CORRIGER : utiliser requireCmsAuth |

---

## Routes cron / webhook (protection alternative)

| Route | Méthodes | Protection | Note |
|-------|----------|------------|------|
| /api/cms/publish-scheduled | GET, POST | CRON/BEARER token | OK — cron job protégé par secret |

---

## Routes OAuth (partiellement protégées)

| Route | Méthodes | Protection | Note |
|-------|----------|------------|------|
| /api/cms/cloud/google/initiate | POST | Aucune auth (demo mode) | OAuth initiate — pas de donnée sensible |
| /api/cms/cloud/google/callback | POST | Aucune auth (code exchange) | OAuth callback — vérifier state pour CSRF |
| /api/cms/cloud/google/disconnect | POST | Aucune auth | ⚠️ CORRIGER : ajouter requireCmsAuth |
| /api/cms/cloud/idrive/initiate | POST | Aucune auth (demo mode) | OAuth initiate |

---

## Routes publiques intentionnelles (pas d'auth requise)

- `/api/cms/auth/POST` — Login endpoint (vérifie CMS_PASSWORD)
- `/api/cms/newsletter/POST` — Inscription newsletter
- `/api/cms/publish-scheduled` — Cron job avec CRON_SECRET

---

## Priorités de correction

1. **Haute** : /api/cms/newsletter/GET
2. **Haute** : /api/cms/llm-search/POST
3. **Haute** : /api/cms/carousel-history/GET,POST
4. **Moyenne** : /api/cms/cloud/google/disconnect
5. **Moyenne** : /api/cms/search-console
6. **Faible** : /api/cms/cloud/google/callback (state CSRF)

---

## Notes

- requireCmsAuth vérifie le cookie de session CMS (cms_session)
- Les routes cron utilisent CRON_SECRET Bearer token
- analytics ne contient que des mock data — risque faible
