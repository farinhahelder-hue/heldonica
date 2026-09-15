# PROMPTS IA — Heldonica

Prompts prêts à copier-coller pour Claude Code, Gemini CLI, OpenCode.

---

## #441 — Supprimer projet Vercel orphelin heldonica2 (⭐ 2 min)

```text
Tu es l'agent IA de Heldonica. Mission : nettoyer le projet Vercel orphelin heldonica2.

1. Lire STATUS.md (#441), INFRASTRUCTURE.md (Vercel), AGENTS.md
2. Prendre #441 dans agent_tasks via MCP (sent → claimed → in_progress)
3. Aller sur https://vercel.com/farinhahelder-1210s-projects
4. Trouver heldonica2 (orphelin, DEPLOYMENT_NOT_FOUND)
5. Supprimer le projet (Settings → Delete Project)
6. Mettre à jour agent_tasks : done, preuve : capture ou lien Vercel
7. Fermer issue #441 avec commentaire

Rè«§gle : ne pas toucher aux autres projets Vercel.
Preuve : issue #441 ferm ée, agent_tasks done.
```

---

## #449 — Middleware auth /panel-manager (⭐⭐ 15-30 min)

```text
Tu es l'agent IA de Heldonica. Mission : auth serveur sur /panel-manager.

1. Lire STATUS.md (#449), INFRASTRUCTURE.md (Supabase), AGENTS.md
2. Prendre #449 dans agent_tasks via MCP
3. Lire middleware.ts (racine)
4. Ajouter règle /panel-manager/** : vérifier session Supabase, sinon 401 ou redirect /login
5. Tester : curl localhost:3000/panel-manager → 401 sans cookie
6. Commit : Fix: #449 [ton-agent] Middleware auth sur /panel-manager
7. Push main → Vercel auto
8. Vérifier prod : curl https://www.heldonica.fr/panel-manager → 401
9. agent_tasks : done, preuve : commit + test curl

Rè«§gle : ne pas casser l'accè¨§s pour les connect ées.
Preuve : issue #449 ferm ée, Vercel READY, test curl OK.
```

---

## #448 — Fusion articles → cms_blog_posts (⭐⭐⭐ 30-60 min)

```text
Tu es l'agent IA de Heldonica. Mission : auditer et fusionner articles vs cms_blog_posts.

1. Lire STATUS.md (#448), INFRASTRUCTURE.md (Supabase), AGENTS.md
2. Prendre #448 dans agent_tasks via MCP
3. grep -r "from('articles')" et "from('cms_blog_posts')" → compter usages
4. SELECT COUNT(*) FROM articles; et FROM cms_blog_posts;
5. Décider : laquelle est legacy ? Migrer vers l'autre, DROP TABLE legacy
6. Écrire migration SQL dans supabase/migrations/
7. Tester : npm run dev → blog OK
8. Commit : Fix: #448 [ton-agent] Fusion articles → cms_blog_posts
9. Push main, Vercel auto
10. agent_tasks : done, preuve : commit + migration SQL

Rè«§gle : backup avant DROP, valider avec humain si données différentes.
Preuve : migration SQL, issue #448 ferm ée.
```

---

## #442 — Policies RLS sur 7 tables (⭐⭐⭐ 45-60 min)

```text
Tu es l'agent IA de Heldonica. Mission : RLS policies sur 7 tables sans policy.

Tables : cms_pricing_plans, instagram_comments, instagram_scheduled_posts, instagram_webhook_logs, jules_memory, jules_sessions, newsletter_subscribers

1. Lire STATUS.md (Supabase Advisors), INFRASTRUCTURE.md, AGENTS.md
2. Prendre #442 dans agent_tasks via MCP
3. Pour chaque table : CREATE POLICY "Lecture publique" FOR SELECT TO anon, authenticated USING (true); (ou adapter)
4. Écrire migration SQL : supabase/migrations/20260915000000_add_rls_policies.sql
5. Tester via dashboard Supabase
6. Commit : Fix: #442 [ton-agent] Ajout policies RLS sur 7 tables
7. Push main
8. agent_tasks : done, preuve : commit + capture dashboard
9. Mettre à jour INFRASTRUCTURE.md (cocher les 7 tables)

Rè«§gle : moindre privilè¨§ge, valider avec humain si table publique/priv ée.
Preuve : migration SQL, 7 tables avec policies, issue #442 ferm ée.
```

---

## Comment utiliser

1. Copier le prompt de la tâche
2. Coller dans Claude Code / Gemini CLI / OpenCode
3. Agent lit STATUS.md, INFRASTRUCTURE.md, AGENTS.md
4. Prend la tâche dans agent_tasks via MCP
5. Code, teste, commit, push, Vercel
6. Met à jour agent_tasks avec preuve

Rè«§gle d'or : une tâche = un agent à la fois. Vérifier agent_tasks avant.
