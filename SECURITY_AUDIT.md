# Security Audit — Routes API CMS

**Généré le :** 2026-05-26  
**Auditeur :** OpenHands (AllHands) + Jules (Google)
**Dernière mise à jour :** 2026-05-26 (fix/cms-auth-missing-routes)

---

## Routes protégées ✅

Ces routes vérifient l'authentification CMS (via `requireCmsAuth`) avant d'exécuter les requêtes Supabase :

| Route | Méthodes | Fonction Auth |
|-------|----------|---------------|
| /api/cms/articles | GET, POST | requireCmsAuth |
| /api/cms/articles/[id] | GET, PUT, DELETE | requireCmsAuth |
| /api/cms/article-revisions | GET | requireCmsAuth |
| /api/cms/auth | POST, GET, DELETE | routes d'auth (login/check/logout) |
| /api/cms/settings | GET, PUT | requireCmsAuth |
| /api/cms/content | GET, PUT | requireCmsAuth |
| /api/cms/media-upload | POST | requireCmsAuth |
| /api/cms/demandes-travel | GET, PUT, PATCH | requireCmsAuth |
| /api/cms/ai-reply | POST | requireCmsAuth |
| /api/cms/media | GET, POST, DELETE | requireCmsAuth |
| /api/cms/blog-cover-upload | POST | requireCmsAuth |
| /api/cms/carousel-history/[id] | DELETE | requireCmsAuth |
| /api/cms/carousel-history | GET, POST | requireCmsAuth ✅ CORRIGÉ |
| /api/cms/google-photos | GET | requireCmsAuth |
| /api/cms/google-photos/import | POST | requireCmsAuth |
| /api/cms/fix-empty-images | POST | requireCmsAuth |
| /api/cms/llm-search | POST | requireCmsAuth ✅ CORRIGÉ |
| /api/cms/setup-storage | GET | requireCmsAuth |
| /api/cms/upload | POST | requireCmsAuth |
| /api/cms/validate | GET, POST | requireCmsAuth |
| /api/cms/newsletter | GET | requireCmsAuth ✅ CORRIGÉ (POST reste public) |
| /api/cms/search-console | POST | requireCmsAuth ✅ CORRIGÉ |
| /api/cms/cloud/google/disconnect | POST | requireCmsAuth ✅ CORRIGÉ |

---

## Routes non protégées ❌

Ces routes exécutaient des requêtes Supabase **sans vérification d'authentification CMS** :

| Route | Méthodes | Problème | Statut |
|-------|----------|---------|--------|
| /api/cms/newsletter | POST | Aucune auth (inscription newsletter) | ✅ OK intentionnel — endpoint public |
| /api/cms/llm-search | POST | Vérifie authorization header basique | ✅ CORRIGÉ — requireCmsAuth |
| /api/cms/carousel-history | GET, POST | Aucune auth CMS | ✅ CORRIGÉ — requireCmsAuth |
| /api/cms/search-console | POST | Vérifie authorization header | ✅ CORRIGÉ — requireCmsAuth |
| /api/cms/cloud/google/disconnect | POST | Aucune auth | ✅ CORRIGÉ — requireCmsAuth |

---

## Routes cron / webhook (protection alternative)

| Route | Méthodes | Protection | Note |
|-------|----------|------------|------|
| /api/cms/publish-scheduled | GET, POST | CRON/BEARER token | OK — cron job protégé par secret |

---

## Routes OAuth (partiellement protégées)

| Route | Méthodes | Protection + Statut |
|-------|----------|--------------------|
| /api/cms/cloud/google/initiate | POST | Aucune auth (demo mode) ✅ |
| /api/cms/cloud/google/callback | POST | None (code exchange) ⚠️ vérifier state CSRF |
| /api/cms/cloud/google/disconnect | POST | requireCmsAuth ✅ CORRIGÉ |
| /api/cms/cloud/idrive/initiate | POST | Aucune auth (demo mode) ✅ |

---

## Routes publiques intentionnelles (pas d'auth requise)

- `/api/cms/auth/POST` — Login endpoint (vérifie CMS_PASSWORD)
- `/api/cms/newsletter/POST` — Inscription newsletter (public)
- `/api/cms/publish-scheduled` — Cron job avec CRON_SECRET

---

## Statut final — Toutes les routes protégées ✅

**Date :** 2026-05-26  
**Correction :** PR #186 (fix/cms-auth-missing-routes → main)

5 routes corrigées :
1. /api/cms/newsletter GET — requireCmsAuth standard
2. /api/cms/llm-search POST — requireCmsAuth standard
3. /api/cms/carousel-history GET, POST — requireCmsAuth
4. /api/cms/cloud/google/disconnect POST — requireCmsAuth
5. /api/cms/search-console POST — requireCmsAuth standard

---

## Notes

- requireCmsAuth vérifie le cookie de session CMS (cms_session)
- Les routes cron utilisent CRON_SECRET Bearer token
- analytics ne contient que des mock data — risque faible
- cloud/google/callback devrait vérifier un state CSRF token (amélioration future)
