# Heldonica - Audit Technique
**Date**: 2026-07-27
**Auditeur**: OpenHands Agent
**Dernière mise à jour**: 2026-07-27 (après corrections)

---

## Corrections Appliquées

| Commit | Description | Status |
|--------|-------------|--------|
| 8e1c83b | fix(auth): corriger imports et signatures requireCmsAuth | ✅ |
| 0ebfc30 | fix(security): ajouter rate limiting sur routes email/newsletter | ✅ |
| e3afcc6 | refactor: extraire rate limiting dans lib/rate-limit.ts | ✅ |
| 0aff6ca | refactor: migrer demandes-travel et travel-planning | ✅ |
| 4d8c955 | fix: securiser route n8n et nettoyer code legacy MongoDB | ✅ |

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

1. **Redéployer sur Vercel** pour appliquer le fix sitemap ⚠️ Action requise
2. ~~**Protéger `/api/n8n/articles`**~~ ✅ Corrigé (commit 4d8c955)
3. ~~**Supprimer code MongoDB legacy**~~ ✅ Corrigé (commit 4d8c955)
4. **Auditer `/panel-manager`** - vérifier auth serveur
5. ~~**Nettoyer variables MONGODB_URI**~~ ✅ Corrigé (commit 4d8c955)

### Top 5 nettoyages techniques

1. ~~Supprimer `models/`~~ ✅ Fait
2. **Audit des 52 env vars** - identifier utilisées vs legacy
3. **Dédupliquer** `GOOGLE_SERVICE_ACCOUNT_JSON` / `GOOGLE_SERVICE_ACCOUNT_KEY`
4. Consolider imports Supabase (`createServiceClient` vs `supabase` direct)
5. Vérifier si `OLLAMA_URL` / `OLLAMA_MODEL` sont utilisés en prod

### Top 5 vérifications UX/Editorial

1. Vérifier que toutes les pages principales sont à jour
2. Tester les formulaires (newsletter, contact, travel planning)
3. Valider les redirections 404
4. Vérifier la cohérence des meta descriptions
5. Tester le sitemap avec Google Search Console

---

## 6. Issues GitHub

### Issue 1: Route API n8n sans authentification
**Titre**: `[SECURITY] /api/n8n/articles sans authentification`

**Priorité**: High | **Status**: ✅ Corrigé (commit 4d8c955)

**Description**: Route `/api/n8n/articles` exposée sans authentification.

**Action**: Ajout validation header `x-n8n-secret` avec `N8N_WEBHOOK_SECRET`.

---

### Issue 2: Sitemap XML invalide en production
**Titre**: `[SEO] Sitemap contient des esperluettes non echappees`

**Priorité**: High | **Status**: ⚠️ En attente de redéploiement

**Description**: 22 esperluettes non échappées dans le sitemap production.

**Action requise**: Redéployer sur Vercel pour appliquer le fix (`app/sitemap.ts:497`).

---

### Issue 3: Code MongoDB legacy non utilisé
**Titre**: `[TECH] Supprimer le code MongoDB legacy non utilise`

**Priorité**: Medium | **Status**: ✅ Corrigé (commit 4d8c955)

**Description**: `lib/db.ts` et `models/SiteContent.ts` supprimés.

**Action**: `MONGODB_URI` nettoyé de `lib/env.ts`.

---

### Issue 4: Audit Supabase tables
**Titre**: `[DB] Auditer coexistence tables articles et cms_blog_posts`

**Priorité**: Medium | **Status**: ⚠️ Accès Supabase requis

**Description**: Deux tables coexistent avec usage différencié.

**Action requise**: Accès Dashboard Supabase pour audit complet.

---

### Issue 5: Panel-manager server-side auth
**Titre**: `[SECURITY] Ajouter verification auth serveur pour /panel-manager`

**Priorité**: Medium | **Status**: ⚠️ Non vérifié

**Description**: Route retourne 200 avec CMS UI, pas de vérif auth serveur.

---

## Nouvelles Découvertes

### Tables Supabase Identifiées

| Table | Usage | Status |
|-------|-------|--------|
| `cms_blog_posts` | 72 | ✅ Principale |
| `site_settings` | 14 | ✅ Active |
| `destinations` | 10 | ✅ Active |
| `demandes_travel` | 9 | ✅ Active |
| `cms_editable_zones` | 9 | ✅ Active |
| `articles` | 8 | ⚠️ Legacy (sync?) |
| `site_content` | 3 | ⚠️ À vérifier |

### Routes API Actives (34 routes)

Routes CMS/API principales:
- `/api/cms/*` - Protected par middleware
- `/api/blog/*` - Blog API
- `/api/destinations/*` - Destinations API
- `/api/demandes-travel/*` - Formulaire voyage
- `/api/newsletter/*` - Newsletter
- `/api/contact/*` - Contact

Routes de migration/script (protégées):
- `/api/fix-destinations/*` - Script migration
- `/api/publish-articles/*` - Publication
- `/api/update-content/*` - Update contenu
- `/api/revalidate-articles/*` - Revalidation cache

Routes webhook:
- `/api/webhook/trigger` - Trigger webhook
- `/api/webhooks/publish-post` - Publication post

### Sécurité

✅ Middleware protège `/api/cms/**` et `/api/agents/**`
⚠️ `/panel-manager` protégé côté client uniquement (choix documenté)

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
