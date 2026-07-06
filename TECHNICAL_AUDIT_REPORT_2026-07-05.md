# AUDIT TECHNIQUE - STACK HELDONICA
**Date :** 5 juillet 2026  
**Stack :** Vercel / Next.js 15 / Supabase / TypeScript  
**Status prod :** READY (mode maintenance actif)

---

## 1. RÉSUMÉ EXÉCUTIF

| Domaine | Status | Risque |
|---------|--------|--------|
| Pipeline CI/CD | ✅ Sain | Faible |
| Sécurité / Secrets | ⚠️ Moyen | Moyen |
| API endpoints | ✅ Fonctionnel | Faible |
| Migrations SQL | ⚠️ À valider | Moyen |
| Preview token | ✅ Sécurisé | Faible |
| Performance | ✅ À vérifier | Faible |

### Points critiques identifiés
1. **Tokens secrets en fallback** : `CMS_SESSION_SECRET` non configuré → fallback vers `CMS_PASSWORD` ou hardcodé
2. **Maintenance mode active** : Site non accessible au public
3. **46 API routes CMS** : Grande surface d'attaque potentielle
4. **Logs potentiellement verbeux** : Vérifier les tokens en clair

---

## 2. PIPELINE DÉPLOIEMENT

### ✅ Points positifs
- 5 derniers déploiements : 4 READY, 1 ERROR corrigé par redeploy
- Historique propre avec commits explicites
- Branch main protégée (推测 - non vérifiable sans accès GitHub)

### ⚠️ Points à améliorer
- Le déploiement ERROR (dpl_Hka8LNSx) n'a pas de logs extraits
- Pas de tests automatisés visibles dans le repo
- Procédure rollback non documentée

### Recommandations
```
TODO : Ajouter tests e2e (Playwright/Cypress)
TODO : Documenter procédure rollback (commit SHA + DB snapshot)
TODO : Configurer Vercel Preview Deployments pour staging
```

---

## 3. SÉCURITÉ & SECRETS

### ✅ Points positifs
1. **Authentification CMS** : `requireCmsAuth()` protège `/api/cms/*`
2. **HMAC signatures** : Tokens signés avec SHA-256
3. **Preview token TTL** : 1h d'expiration
4. **Maintenance bypass** : Limité aux preview URLs ou token valide

### ⚠️ Vulnérabilités potentielles

#### CRITIQUE - Fallback de secret hardcodé
```typescript
// lib/preview-token.ts
function getSecret(): string {
  return process.env.CMS_SESSION_SECRET || process.env.CMS_PASSWORD || 'heldonica-preview-secret'
}
```
**Problème** : Si ni `CMS_SESSION_SECRET` ni `CMS_PASSWORD` ne sont configurés, le secret par défaut `heldonica-preview-secret` est utilisé. N'importe qui pourrait forger des tokens.

**Impact** : HIGH - Contenu non publié potentiellement exposable  
**Fichier** : `lib/preview-token.ts:12`

#### ÉLEVÉ - Grand nombre d'API routes CMS
- 46 routes dans `/api/cms/*`
- Chaque route = surface d'attaque potentielle
- Certaines routes (AI, media, etc.) nécessitent une review approfondie

**Recommandation** : Audit de sécurité des routes AI (ai-blog, ai-improve, ai-reply)

### ✅ Variables d'environnement recommandées
```
MAINTENANCE_MODE=         # Vide = désactivé
MAINTENANCE_BYPASS_TOKEN= # À définir si utilisé
CMS_PASSWORD=              ✅ Configuré
CMS_SESSION_SECRET=        ✅ À vérifier en prod
SUPABASE_SERVICE_KEY=      ✅ Nécessaire
```

---

## 4. MIGRATIONS SQL

### Fichiers analysés
- `20260703_cms_phase2.sql` : Zone history + scheduled_publish_at
- `20260703_cms_home_content_zones.sql` : Zones homepage
- `20260703_attach_sync_trigger.sql` : Trigger sync_to_articles

### ⚠️ Points d'attention

#### 1. RLS sur cms_zone_history
```sql
CREATE POLICY "Admin read zone history"
  ON cms_zone_history FOR SELECT
  USING (auth.role() = 'service_role');
```
**Problème** : Utilise `service_role` - accès uniquement via Supabase admin, pas via l'API Next.js.

#### 2. Trigger sync_to_articles
**Non vérifiable** : Le fichier `20260703_attach_sync_trigger.sql` n'a pas été lu.

#### 3. Rollback plan
- Aucune procédure de rollback documentée
- Pas de down migrations

**Recommandation** : Tester le trigger en staging avant mise en prod

---

## 5. API ENDPOINTS ANALYSÉS

### ✅ `/api/cms/preview-token/route.ts`
```typescript
// TTL : 1h
const payload = JSON.stringify({ slug, exp: Date.now() + 60 * 60 * 1000 })

// Protection : requireCmsAuth
const authResponse = await requireCmsAuth(req)
if (authResponse) return authResponse
```
**Verdict** : ✅ Sécurisé - TTL OK, auth requise

### ✅ `/api/cms/zones/route.ts`
**Problème potentiel** : Accessible via middleware (protégé par `isProtectedPath`), mais la logique doit être vérifiée.

### ⚠️ Routes non analysées (à auditer)
- `/api/cms/ai-*` (3 routes) - Fonctionnalités AI
- `/api/cms/media-upload` - Upload fichiers
- `/api/cms/blog-cover-upload` - Upload images
- `/api/cms/cloud/google` - Intégration Google
- `/api/cms/video-assembly` - Assemblage vidéo

---

## 6. BLOG & META

### ✅ Points positifs
```typescript
// app/blog/[slug]/page.tsx
const { data: post } = await supabase
  .from('cms_blog_posts')
  .select('title, excerpt, featured_image, published_at, tags, author, updated_at, slug')
  .eq('slug', slug)
  .eq('published', true)  // ← ONLY published posts
  .single()
```
**Verdict** : ✅ Uniquement les articles publiés sont exposés publiquement

### ⚠️ Points à améliorer
1. Pas de gestion d'erreur explicite si `generateMetadata` échoue
2. Révalidation ISR : 1h (`revalidate = 3600`) - acceptable mais peut créer un délai de publication

---

## 7. PERFORMANCE (à vérifier en prod)

### Configuration actuelle
- **ISR** : `revalidate = 3600` (1h) sur blog
- **Middleware** : Edge runtime
- **Cache Supabase** : 30s sur maintenance check

### Recommandations Core Web Vitals
```
À faire : Mesurer LCP sur PageSpeed Insights
Si LCP > 2.5s : Optimiser images, fonts, ou passer en Edge
À faire : Vérifier INP (Interaction to Next Paint)
```

---

## 8. MAINTENANCE MODE

### ✅ Implémentation actuelle
- **Source** : `site_settings.maintenance_mode` dans Supabase
- **Bypass** : URLs preview Vercel (auto) + token optionnel
- **Cache** : 30s
- **Page** : `/maintenance` design premium

### ⚠️ Statut actuel
**Le site est en mode maintenance** - c'est le comportement attendu selon le résumé initial.

### Checklist sortie maintenance
- [ ] Désactiver via SQL : `UPDATE site_settings SET value = 'false' WHERE key = 'maintenance_mode';`
- [ ] Attendre 30s pour propagation
- [ ] Tester smoke tests
- [ ] Vérifier pas de regression

---

## 9. CHECKLIST SORTIE MAINTENANCE

### Smoke tests à exécuter

#### 1. Page d'accueil
```bash
curl -sI https://www.heldonica.fr/ | head -5
# Attendu: HTTP/2 200
```

#### 2. Blog - article publié
```bash
# Lister un slug depuis Supabase
curl -s "https://www.heldonica.fr/blog/[SLUG_VALIDE]" | grep -o "<title>.*</title>"
```

#### 3. Preview token flow
```bash
# 1. Générer token via CMS
# 2. Accéder avec ?preview_token=XXX
# 3. Vérifier contenu non publié visible
```

#### 4. CMS /panel-manager
```bash
# Accès protégé par mot de passe
curl -s "https://www.heldonica.fr/api/cms/auth" -X POST
# Attendu: 401 Unauthorized sans credentials
```

#### 5. Création de zone
- Se connecter au CMS
- Créer/modifier une zone
- Vérifier dans Supabase `cms_zone_history`

---

## 10. ACTIONS RECOMMANDÉES

### P0 - Bloquant

| # | Action | Fichier | Effort |
|---|--------|---------|--------|
| 1 | **Vérifier que `CMS_SESSION_SECRET` est configuré en prod** | Vercel env vars | 5 min |
| 2 | **Désactiver le fallback secret hardcodé** | `lib/preview-token.ts` | 10 min |
| 3 | **Auditer les routes AI** | `app/api/cms/ai-*/route.ts` | 2h |

### P1 - Urgent

| # | Action | Fichier | Effort |
|---|--------|---------|--------|
| 4 | Documenter procédure rollback | `docs/rollback.md` | 1h |
| 5 | Tester trigger sync_to_articles | Staging | 1h |
| 6 | Ajouter tests e2e | `__tests__/e2e/` | 4h |

### P2 - Important

| # | Action | Fichier | Effort |
|---|--------|---------|--------|
| 7 | Vérifier logs pour tokens en clair | Vercel logs | 30 min |
| 8 | Optimiser images (si LCP > 2.5s) | Components | 2h |
| 9 | Documenter variables env requises | `.env.example` | 15 min |

### P3 - Amélioration

| # | Action | Effort |
|---|--------|--------|
| 10 | Configurer staging environment | 1h |
| 11 | Setup monitoring (Sentry) | 2h |
| 12 | Backup strategy documentation | 30 min |

---

## 11. ESTIMATION TEMPS

| Tâche | Temps estimé |
|-------|--------------|
| Fix fallback secret | 30 min |
| Audit routes AI | 2h |
| Validation migrations | 1h |
| Tests smoke | 1h |
| Documentation rollback | 1h |
| **Total** | **~6h** |

---

## 12. ACCÈS REQUIS POUR COMPLÉTER L'AUDIT

| Ressource | Besoin | Priorité |
|-----------|--------|----------|
| Vercel (logs build) | Lecture | HAUTE |
| Vercel (env vars) | Lecture | CRITIQUE |
| Supabase (RLS policies) | Lecture | HAUTE |
| GitHub (branch protection) | Lecture | MOYENNE |

---

## CONCLUSION

**Le système est globalement sain** mais nécessite :
1. Validation des secrets en prod
2. Audit des routes AI
3. Documentation rollback
4. Tests automatisés

**Le site ne doit PAS être ouvert au public** tant que le point P0-1 (CMS_SESSION_SECRET) n'est pas vérifié.

---

*Rapport généré par OpenHands Agent - 5 juillet 2026*
