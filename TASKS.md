# TASKS.md — vue humaine du backlog (lecture seule en semaine)

> La verite est dans la table Supabase `agent_tasks` (voir AGENTS.md et le serveur MCP dans `mcp/`).
> Ce fichier est une photo lisible, mise a jour chaque lundi lors de la Sprint Review de 15 min.
> Ne pas y ecrire pendant la semaine : utiliser `agent_tasks` via MCP depuis Claude Code / Gemini CLI / OpenCode.

## Priorite de la semaine (S37 — 14/09/2026)

| Rang | Sujet | Issue GitHub | Statut dans agent_tasks |
|------|-------|--------------|--------------------------|
| 1 | Auth serveur sur /panel-manager | #449 | a creer |
| 2 | Trancher articles vs cms_blog_posts | #448 | a creer |
| 3 | Sort de heldonica-cms / heldonica2 | #441 | a creer |
| 4 | Deployer le fix sitemap (& non echappes) | #446 | a creer |
| 5 | Audit RLS Supabase | #442 | a creer |

## Rituel hebdo (lundi, 15 min)
1. Ouvrir `agent_tasks` (via MCP ou Supabase dashboard) : qu'est-ce qui est `done`, qu'est-ce qui est bloque ?
2. Comparer avec STATUS.md : l'etat a-t-il change (nouveau deploiement, nouvelle issue) ?
3. Choisir 3 a 5 taches max pour la semaine, les creer dans `agent_tasks` avec un `agent_name` assigne
4. Mettre a jour le tableau ci-dessus

## Historique
- S36 (07-13/09) : serveur MCP `agent_tasks` livre pour Claude Code / Gemini CLI / OpenCode, bot Discord 0e, 23 erreurs Supabase avalees corrigees, ecran web /ajouter, fix GA4/CSP

Voir `STATUS.md` pour l'etat complet (site, CMS, APK, DB, securite).
