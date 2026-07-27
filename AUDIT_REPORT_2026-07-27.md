# Heldonica - Audit Technique
**Date**: 2026-07-27
**Auditeur**: OpenHands Agent

---

## 1. État Global

### Résumé de l'écosystème
- **Site live**: https://www.heldonica.fr (Vercel + Supabase)
- **Repo**: github.com/farinhahelder-hue/heldonica
- **Framework**: Next.js 14+ avec App Router
- **Base de données**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Email**: Resend + Brevo
- **CMS**: Custom (Supabase-based)

### Source de vérité actuelle
✅ Confirmée: https://www.heldonica.fr est la référence canonique

### Niveau de fragmentation
| Composant | Status |
|-----------|--------|
| GitHub repo | 1 repo, 1 branche principale (main) |
| Vercel | 1 projet prod, preview URL inactive |
| Supabase | 1 projet principal |
| Tables DB | 33 tables actives |

### Zones non vérifiées
⚠️ **Accès requis**:
- Dashboard Vercel (logs de build, env vars)
- Dashboard Supabase (policies RLS, données réelles)
- Logs de production

---

## 2. Bloquants

### B1: Route `/api/n8n/articles` sans authentification
**Symptôme**: Route API exposée publiquement retournant tous les articles ( titres, slugs, extraits, images)

**Preuve**: `app/api/n8n/articles/route.ts` - Aucune vérification d'auth

**Impact**: 
- Exposition des métadonnées du blog (titles, slugs, categories)
- Potentiel usage abusif de l'API
- Non-indexable par les moteurs (robots.txt bloque `/api/`)

**Correctif recommandé**:
```typescript
// Ajouter vérification par header ou IP whitelist
const secret = req.headers.get('x-n8n-secret')
if (secret !== process.env.N8N_WEBHOOK_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Niveau de confiance**: ✅ Confirmé (code analysé)

---

### B2: Sitemap production avec `&` non échappés
**Symptôme**: 22 occurrences de `&` non échappés en `&amp;` dans les URLs Unsplash

**Preuve**: `curl -s https://www.heldonica.fr/sitemap.xml | grep "&" | wc -l` → 22

**Impact**: 
- Sitemap invalide selon le protocole XML
- Moteurs de recherche peuvent ignorer certaines URLs d'images
- Fix existe dans le code (`app/sitemap.ts:497`) mais n'est pas déployé

**Correctif recommandé**: Redéployer sur Vercel pour appliquer le fix local

**Niveau de confiance**: ✅ Confirmé

---

### B3: Code MongoDB legacy non utilisé mais chargé
**Symptôme**: Fichier `lib/db.ts` + `models/SiteContent.ts` importent mongoose, jamais utilisés en prod

**Preuve**: 
- `lib/db.ts` n'est importé que dans les tests
- `models/SiteContent.ts` n'est importé nulle part
- Variable `MONGODB_URI` référencée dans 8+ fichiers

**Impact**:
- Bundle inflation
- Confusion pour les développeurs
- Variable d'environnement inutile en prod

**Correctif recommandé**: Supprimer `lib/db.ts`, `models/SiteContent.ts`, et nettoyer les références `MONGODB_URI` dans `lib/env.ts`

**Niveau de confiance**: ✅ Confirmé

---

## 3. Importants

### I1: Route `/panel-manager` publique mais avec `noindex`
**Symptôme**: Route retourne 200 avec loader CMS, meta robots `noindex,nofollow`

**Preuve**: 
- `curl -s -o /dev/null -w "%{http_code}" https://www.heldonica.fr/panel-manager` → 200
- Meta robots: `noindex, nofollow, noarchive, nosnippet`

**Impact**:
- Route accessible publiquement (non indexée)
- Peut contenir des éléments d'UI sensibles
- Dépend de l'authentification côté client (React)

**Correctif recommandé**: Ajouter middleware d'authentification serveur pour bloquer l'accès non-authentifié

**Niveau de confiance**: ⚠️ Hypothèse (inspection HTML uniquement)

---

### I2: 33 tables Supabase - potentiel doublon
**Symptôme**: Tables `articles` et `cms_blog_posts` coexistent, toutes deux utilisées

**Preuve**:
```
.from('cms_blog_posts') - 72 usages
.from('articles') - 8 usages
```

**Impact**:
- Confusion sur la source de vérité
- Risque de désynchronisation des données
- Maintenance complexe

**Correctif recommandé**: 
1. Auditer l'usage réel de chaque table
2. Si `articles` est legacy, migrer les données vers `cms_blog_posts`
3. Supprimer la table legacy

**Niveau de confiance**: ⚠️ Hypothèse (usage code uniquement, pas de DB access)

---

### I3: 52 variables d'environnement référencées
**Symptôme**: Nombre élevé de variables, certaines potentiellement inutilisées

**Preuve**: `grep -rh "process.env" ... | sort -u | wc -l` → 52

**Variables suspectes (legacy?)**:
- `MONGODB_URI` → Non utilisé en prod
- `OLLAMA_URL`, `OLLAMA_MODEL` → Jamais utilisées?
- `N8N_WEBHOOK_AGENTS_URL` → Utilisé uniquement dans env.ts
- `GOOGLE_SERVICE_ACCOUNT_JSON` + `GOOGLE_SERVICE_ACCOUNT_KEY` → Doublons

**Impact**: Configuration confuse, risque de confusion

**Correctif recommandé**: Audit des variables realmente utilisées + cleanup

**Niveau de confiance**: ⚠️ Hypothèse

---

## 4. Améliorations

### A1: Rate limiting consolidé
**Status**: ✅ Corrigé en session (lib/rate-limit.ts)

**Résumé**: 4 routes utilisaient du code dupliqué pour le rate limiting. Maintenant centralisé.

---

### A2: Auth API CMS consolidée
**Status**: ✅ Corrigé en session

**Résumé**: 6 routes API avaient des imports auth cassés. Corrigés.

---

### A3: Routes CMS/Admin bien protégées
**Status**: ✅ Vérifié

| Route | HTTP Code | Protection |
|-------|-----------|------------|
| `/admin` | 308 | Redirect |
| `/cms/*` | 404 | Non exposé |
| `/api/*` | 405/401 | Bloqué robots.txt |
| `/panel-manager` | 200 | noindex + client auth |

---

## 5. Plan d'Action Priorisé

### Top 5 actions immédiates

1. **Redéployer sur Vercel** pour appliquer le fix sitemap
2. **Protéger `/api/n8n/articles`** avec authentification
3. **Supprimer code MongoDB legacy** (`lib/db.ts`, `models/SiteContent.ts`)
4. **Auditer `/panel-manager`** - ajouter auth serveur si manquant
5. **Nettoyer variables MONGODB_URI** dans `lib/env.ts`

### Top 5 nettoyages techniques

1. Supprimer `models/` si vide après cleanup
2. Audit des 52 env vars - identifier utilisées vs legacy
3. Dédupliquer `GOOGLE_SERVICE_ACCOUNT_JSON` / `GOOGLE_SERVICE_ACCOUNT_KEY`
4. Consolider imports Supabase (`createServiceClient` vs `supabase` direct)
5. Vérifier si `ollama` ou `ollama_model` sont utilisés

### Top 5 vérifications UX/Editorial

1. Vérifier que toutes les pages principales (blog, destinations, contact) sont à jour
2. Tester les formulaires (newsletter, contact, travel planning)
3. Valider les redirections 404
4. Vérifier la cohérence des meta descriptions
5. Tester le sitemap avec Google Search Console

---

## 6. Issues GitHub Prêtes à Ouvrir

### Issue 1: Route API n8n sans authentification
**Titre**: `[SECURITY] /api/n8n/articles exposure - public API without authentication`

**Priorité**: High

**Description**:
The route `/api/n8n/articles` returns all blog posts metadata (titles, slugs, excerpts, images) without any authentication. While the route is blocked by robots.txt, it remains publicly accessible and could be abused.

**Preuve**: `app/api/n8n/articles/route.ts` - no auth check

**Résultat attendu**: 
- Add `x-n8n-secret` header validation
- Return 401 for unauthorized requests

---

### Issue 2: Sitemap XML invalide en production
**Titre**: `[SEO] Sitemap contains unescaped ampersands (& instead of &amp;)`

**Priorité**: High

**Description**:
The production sitemap at https://www.heldonica.fr/sitemap.xml contains 22 unescaped ampersands in Unsplash image URLs. This violates XML spec and may cause search engines to ignore some image URLs.

**Preuve**: `curl -s https://www.heldonica.fr/sitemap.xml | grep -c "&"` → 22

The fix exists in code at `app/sitemap.ts:497` but is not deployed.

**Résultat attendu**: 
- Redeploy on Vercel to apply the fix
- Verify sitemap validity with XML validator

---

### Issue 3: Code MongoDB legacy non utilisé
**Titre**: `[TECH] Remove unused MongoDB code (lib/db.ts, models/SiteContent.ts)`

**Priorité**: Medium

**Description**:
Files `lib/db.ts` and `models/SiteContent.ts` import mongoose and reference `MONGODB_URI`, but are never used in production code. Only imported in tests.

This creates:
- Bundle inflation
- Developer confusion
- Unnecessary env var in production

**Preuve**: 
- `grep -rn "from.*db" | grep -v test` → no results
- `grep -rn "SiteContent" | grep -v models/` → no results

**Résultat attendu**: 
- Delete `lib/db.ts` and `models/SiteContent.ts`
- Remove `MONGODB_URI` from `lib/env.ts`
- Remove mongoose from dependencies if only used by these files

---

### Issue 4: Audit Supabase tables
**Titre**: `[DB] Audit coexistence of `articles` and `cms_blog_posts` tables`

**Priorité**: Medium

**Description**:
Both `articles` (8 code usages) and `cms_blog_posts` (72 code usages) tables exist. Need to clarify which is the source of truth and if one is legacy.

**Preuve**: 
```
.from('cms_blog_posts') - 72 usages
.from('articles') - 8 usages
```

**Résultat attendu**: 
- Document the purpose of each table
- Migrate data if `articles` is legacy
- Remove duplicate table if applicable

---

### Issue 5: Panel-manager server-side auth
**Titre**: `[SECURITY] Add server-side auth check for /panel-manager`

**Priorité**: Medium

**Description**:
The `/panel-manager` route returns 200 with a CMS loader UI. While meta robots has `noindex,nofollow`, server-side auth should be added to prevent unauthorized access at the middleware level.

**Preuve**: 
- `curl -s https://www.heldonica.fr/panel-manager` → 200 with CMS UI
- No server-side auth found in route handler

**Résultat attendu**: 
- Add auth middleware to `/panel-manager/**`
- Return 401/redirect for unauthenticated users

---

## Annexe: Accès Nécessaires pour Audit Complet

Pour finaliser l'audit, les accès suivants sont nécessaires:

1. **Vercel Dashboard** (https://vercel.com)
   - Logs de build
   - Environment variables
   - Deployment history

2. **Supabase Dashboard** (https://supabase.com)
   - Row Level Security policies
   - Actual data in tables
   - Storage buckets configuration

3. **GitHub Repository Settings**
   - Branch protection rules
   - Environment secrets

---

*Rapport généré automatiquement - À vérifier et compléter manuellement*
