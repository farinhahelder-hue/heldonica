# AUDIT EXHAUSTIF HELDONICA — 27 juillet 2026

## PHASE 1 — CARTOGRAPHIE

### Surfaces détectées
- Site live: https://www.heldonica.fr (ACTIF)
- Preview Vercel: https://heldonica2.vercel.app (INACTIVE 404)
- Panel admin: /panel-manager (PROTÉGÉ)
- Dashboard user: /dashboard (PROTÉGÉ)
- API CMS: /api/cms/* (47 routes)
- GitHub: github.com/farinhahelder-hue/heldonica
- Supabase: smxnruefmrmfyfhuxygq.supabase.co

## PHASE 2 — ACCÈS
### Accessible: GitHub, Code source, Site live, Mentions légales, Sitemap, Robots.txt
### Non accessible: Vercel Dashboard, Supabase Dashboard, Variables prod, Logs build

## PHASE 3 — AUDIT
### A. GitHub
- Repo: farinhahelder-hue/heldonica, Branche: main
- PRs ouvertes: 10, PRs mergées récentes: 10+

### B. Vercel
- Hébergeur: Vercel Inc. (confirmé mentions légales)
- Build command: npm run build, Crons: 5 jobs

### C. Supabase
- URL: smxnruefmrmfyfhuxygq.supabase.co
- Tables: cms_blog_posts (blog), destinations (destinations)

### D. Front Live
- Site accessible, 404 personnalisée, Blog fonctionnel
- Sitemap avec ERREUR XML ligne 468

## PHASE 4 — INCOHÉRENCES

### Variables NON documentées (14+)
ANTHROPIC_API_KEY, PERPLEXITY_API_KEY, NEXT_PUBLIC_OPENAI_API_KEY, SERVICE_ROLE_KEY, WEBHOOK_SECRET, BUFFER_ACCESS_TOKEN, AWS_S, NEXT_PUBLIC_N

### Tables SUPABASE problématiques
- destinations: 2 définitions SCHÉMAS DIFFÉRENTS
- articles: Legacy vs cms_blog_posts

## BLOQUANTS
1. Sitemap XML invalide (ligne 468) - CONFIRMÉ
2. Variables NON documentées - CONFIRMÉ
3. NEXT_PUBLIC_OPENAI_API_KEY potentiellement exposée - HYPOTHÈSE

## IMPORTANTS
1. Schéma destinations DUPLIQUÉ - CONFIRMÉ
2. Table articles LEGACY - CONFIRMÉ
3. Preview Vercel ORPHELINE - CONFIRMÉ
4. Code local désynchronisé - CONFIRMÉ

## PLAN D ACTION
1. Corriger sitemap XML (30 min)
2. Mettre à jour .env.example (15 min)
3. Vérifier NEXT_PUBLIC_OPENAI_API_KEY (1h)
4. Nettoyer projet Vercel orphelin
5. git fetch --unshallow

## ISSUES GITHUB
1. fix(seo): Corriger erreur XML dans sitemap.xml (P0)
2. docs: Ajouter variables manquantes au .env.example (P1)
3. refactor(db): Consolider tables destinations (P1)
4. chore(db): Clarifier source vérité articles (P2)
5. chore(vercel): Nettoyer déploiements expirés (P2)

## CONCLUSION
Niveau de confiance: 65%. Prochaine étape: obtenir accès Vercel/Supabase.
