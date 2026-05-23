# MISSION ALLHANDS — SPRINT HELDONICA
# Repo : farinhahelder-hue/heldonica
# Stack : Next.js 15 App Router · TypeScript · Tailwind CSS · Supabase · Vercel
# Date : 2026-05-22

---

## RÔLE D'ALLHANDS

Tu es l'agent principal de ce sprint.
- Tu lis ce fichier en entier avant de commencer
- Tu exécutes les tâches dans l'ordre de priorité indiqué
- Pour les tâches marquées `[JULES]`, tu crées une issue GitHub claire et tu assignes Jules
- Pour les tâches marquées `[ALLHANDS]`, tu les traites toi-même
- Chaque tâche terminée = une PR séparée avec le message de commit indiqué
- Tu ne touches pas au site public (pages blog, destinations, travel-planning) sauf si explicitement demandé

---

## SPRINT 1 — SÉCURITÉ (BLOCKER, FAIRE EN PREMIER)

### TASK S1 — Fix auth fail-open API IA [ALLHANDS]
**Fichiers cibles** : `app/api/cms/ai/route.ts` et toutes routes `/api/cms/*`
**Problème** : si la vérification d'auth échoue, les endpoints retournent 200 au lieu de 401
**Fix** :
```typescript
// Remplacer tout pattern "if (!session) { /* continue quand même */ }" par :
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```
**Vérifier** : chaque route `/api/cms/*` retourne bien 401 si non authentifié
**Commit** : `fix(auth): fail-closed on all CMS API routes`

---

### TASK S2 — Supprimer credentials hardcodés [JULES]
**Issue GitHub à créer** :
- Titre : `fix(security): remove hardcoded API keys and client IDs`
- Body :
  - Chercher dans tout le repo les patterns : `AIza`, `client_id`, `UNSPLASH_ACCESS_KEY` écrits en dur dans le code (pas dans `.env`)
  - Les remplacer par `process.env.VARIABLE_NAME`
  - Ajouter les variables manquantes dans `.env.example` avec une valeur placeholder
  - Ne JAMAIS committer les vraies valeurs
- **Labels** : `security`, `good first issue`
- **Commit attendu** : `fix(security): move hardcoded credentials to env vars`

---

### TASK S3 — Fix XSS dans EnhancedRichContent [JULES]
**Issue GitHub à créer** :
- Titre : `fix(security): sanitize HTML output in EnhancedRichContent with DOMPurify`
- Body :
  - Installer DOMPurify : `npm install dompurify @types/dompurify`
  - Dans le composant qui render du HTML brut avec `dangerouslySetInnerHTML`, wrapper par `DOMPurify.sanitize()`
  - Exemple :
    ```typescript
    import DOMPurify from 'dompurify';
    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
    ```
  - Vérifier que le rendu des articles blog n'est pas altéré
- **Labels** : `security`, `good first issue`
- **Commit attendu** : `fix(security): sanitize rich content HTML with DOMPurify`

---

## SPRINT 2 — PERFORMANCE (FAIRE APRÈS SÉCURITÉ)

### TASK P1 — Batch fetch publish-scheduled [ALLHANDS]
**Fichier cible** : `app/api/publish-scheduled/route.ts`
**Problème** : N requêtes Supabase en boucle (N+1 problem)
**Fix** : remplacer la boucle de requêtes individuelles par un seul `UPDATE ... WHERE published_at <= NOW() AND published = FALSE`
```typescript
// Remplacer :
for (const post of posts) {
  await supabase.from('cms_blog_posts').update({ published: true }).eq('id', post.id)
}
// Par :
await supabase
  .from('cms_blog_posts')
  .update({ published: true, updated_at: new Date().toISOString() })
  .lt('published_at', new Date().toISOString())
  .eq('published', false)
```
**Gain estimé** : ~95% de requêtes en moins sur le cron
**Commit** : `perf(cron): batch publish-scheduled with single UPDATE query`

---

### TASK P2 — Promise.all dans update-content [JULES]
**Issue GitHub à créer** :
- Titre : `perf(cms): parallelize independent Supabase fetches with Promise.all`
- Body :
  - Dans les API routes qui font plusieurs fetches Supabase séquentiels indépendants, les paralléliser
  - Exemple :
    ```typescript
    // Avant (séquentiel) :
    const posts = await supabase.from('cms_blog_posts').select()
    const destinations = await supabase.from('cms_destinations').select()
    // Après (parallèle) :
    const [posts, destinations] = await Promise.all([
      supabase.from('cms_blog_posts').select(),
      supabase.from('cms_destinations').select()
    ])
    ```
  - Identifier tous les endroits avec des `await` consécutifs indépendants
- **Labels** : `performance`, `good first issue`
- **Commit attendu** : `perf(cms): parallelize independent Supabase fetches`

---

### TASK P3 — Bulk upsert seed-articles [JULES]
**Issue GitHub à créer** :
- Titre : `perf(seed): replace loop inserts with bulk upsert`
- Body :
  - Dans les scripts de seed (dossier `scripts/` ou `lib/seed*`), remplacer les boucles d'insert par un seul `upsert`
  - Exemple :
    ```typescript
    // Avant :
    for (const article of articles) {
      await supabase.from('cms_blog_posts').insert(article)
    }
    // Après :
    await supabase.from('cms_blog_posts').upsert(articles, { onConflict: 'slug' })
    ```
- **Labels** : `performance`, `good first issue`
- **Commit attendu** : `perf(seed): bulk upsert articles instead of loop inserts`

---

## SPRINT 3 — FEATURES CMS (PRIORITÉ PRODUIT)

### TASK F1 — Quick-Action Dashboard /cms-admin [ALLHANDS]
**Fichier cible** : `app/cms-admin/page.tsx`
**Description complète** : voir section `ACTION 1` dans `PROMPT_ALLHANDS.md`
**Résumé** : 4 widgets sur la landing du CMS (brouillons, demandes travel, articles bloqués, stats KPI)
**Commit** : `feat(cms): add quick-action dashboard with 4 widgets`

---

### TASK F2 — Kanban Travel Planning [ALLHANDS]
**Fichier cible** : `app/cms-admin/travel-kanban/page.tsx`
**Description complète** : voir section `ACTION 2` dans `PROMPT_ALLHANDS.md`
**Migration SQL à exécuter AVANT** :
```sql
ALTER TABLE cms_demandes_travel
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'nouveau'
  CHECK (statut IN ('nouveau', 'en_discussion', 'conception_sur_mesure', 'livré'));
ALTER TABLE cms_demandes_travel
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_cms_demandes_statut ON cms_demandes_travel(statut);
```
**Commit** : `feat(cms): add travel planning kanban board`

---

### TASK F3 — Analyseur SEO live [JULES]
**Issue GitHub à créer** :
- Titre : `feat(cms): add live SEO analyzer sidebar in article editor`
- Body :
  - Créer un hook `useArticleSEO(content, title, metaDescription, keyword)` dans `hooks/useArticleSEO.ts`
  - Métriques : longueur titre, longueur meta, densité mot-clé, structure H1/H2/H3, compteur de mots, images sans alt, liens internes
  - Score global /100
  - Aperçu snippet Google simulé
  - Sidebar droite dans l'éditeur d'article
  - Tout côté client, debounce 300ms
  - Description complète : voir section `ACTION 4` dans `PROMPT_ALLHANDS.md`
- **Labels** : `feature`, `seo`
- **Commit attendu** : `feat(cms): live SEO analyzer in article editor`

---

### TASK F4 — Calendrier éditorial visuel [JULES]
**Issue GitHub à créer** :
- Titre : `feat(cms): add visual editorial calendar`
- Body :
  - Nouvelle route `app/cms-admin/calendar/page.tsx`
  - Calendrier CSS Grid (7 colonnes, lun→dim), composant custom sans FullCalendar
  - Superpose articles programmés (vert), articles publiés (teal), posts sociaux (violet/orange)
  - Migration SQL : créer table `cms_social_schedule` (voir section `ACTION 3` dans `PROMPT_ALLHANDS.md`)
  - Modal création rapide au clic sur une date
- **Labels** : `feature`
- **Commit attendu** : `feat(cms): visual editorial calendar with social schedule`

---

### TASK F5 — Historique de versions articles [JULES]
**Issue GitHub à créer** :
- Titre : `feat(cms): add article revision history`
- Body :
  - Migration SQL : créer table `cms_blog_posts_revisions`
  - Modifier `PATCH /api/cms/content` : sauvegarder snapshot avant chaque modification
  - Conserver les 10 dernières révisions par article
  - Interface : bouton "Historique" dans l'éditeur → sidebar avec liste + bouton "Restaurer"
  - Description complète : voir section `ACTION 10` dans `PROMPT_ALLHANDS.md`
- **Labels** : `feature`
- **Commit attendu** : `feat(cms): article revision history with restore`

---

## SPRINT 4 — CONTENU DESTINATIONS (SEO LONG TERME)

### TASK C1 — Merger les branches destinations ouvertes [ALLHANDS]
**Branches à traiter dans l'ordre** :
1. `add-normandie-subpages` → vérifier build, merger dans main
2. `add-madere-subpages` → vérifier build, merger dans main
3. `add-italie` → vérifier build, merger dans main
4. `add-colombie` → vérifier build, merger dans main

**Vérification avant chaque merge** :
- `npm run build` passe
- Pas de conflit avec main
- Les nouvelles pages sont accessibles

**Commit** : pour chaque merge, utiliser le message de la PR existante

---

### TASK C2 — Recherche niches Travel Planning [ALLHANDS]
**Contexte** : la PR #131 contient une analyse de niches (Paris anti-touristique, séjours déconnexion, villes secondaires, train-first, immersion culinaire)
**Action** : merger la PR #131 si le contenu est correct, puis créer les articles de base pour chaque niche dans le CMS

---

## CONTRAINTES POUR TOUTES LES TÂCHES

### Code
- TypeScript strict, zéro `any`
- Texte UI en français
- "conception sur mesure" (jamais "organisation de séjour")
- "pépites dénichées" (jamais "bons plans")
- Server Components pour les fetches Supabase
- `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur, jamais exposée au client

### Tests avant chaque commit
- [ ] `npm run build` passe sans erreur TypeScript
- [ ] La route modifiée est accessible
- [ ] Le site public (blog, destinations) n'est pas cassé
- [ ] Mobile 375px : l'interface est utilisable

### PRs
- Une PR par tâche (pas de PR fourre-tout)
- Titre de PR = message de commit
- Description de PR = résumé de ce qui a changé + captures si UI

---

## ORDRE D'EXÉCUTION RECOMMANDÉ POUR ALLHANDS

1. **S1** — Fix auth fail-closed (toi)
2. **Créer les issues Jules** — S2, S3, P2, P3, F3, F4, F5 (toi → Jules)
3. **P1** — Batch publish-scheduled (toi)
4. **F1** — Dashboard CMS (toi)
5. **F2** — Kanban Travel Planning (toi)
6. **C1** — Merger branches destinations (toi)
7. **C2** — Merger PR niches (toi)

Les tâches Jules peuvent tourner en parallèle pendant que tu traites les tâches Allhands.
