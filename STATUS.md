# STATUT HELDONICA — snapshot pour humains & IA

_Derniere mise a jour : 14 septembre 2026 — a rafraichir chaque lundi (Sprint Review)_

## 1. Ou on en est

### Site (heldonica.fr — projet Vercel `heldonica`)
- PROD ready, dernier deploiement le 11/09 (commit `98725bf`, registre MCP agent_tasks)
- Le CMS n'est PAS dans le repo separe `heldonica-cms` : il est integre ici, sous `/panel-manager`, `/admin`, `/cms/*`, `/ajouter`
- Fixes recents : GA4 bloque par la CSP (corrige), upload web sans passer par l'API pour eviter le 413 Vercel, 23 endroits ou des erreurs Supabase etaient avalees silencieusement (corrige)

### CMS
- Le repo standalone `heldonica-cms` archivé le 15/09/2026 (GitHub Archived + Vercel projet supprimé) → considéré abandonné, rien à fusionner
- Projet Vercel `heldonica2` déjà supprimé (404 DEPLOYMENT_NOT_FOUND vérifié)

### APK / app mobile (`heldonica-mobile/`)
- Ecrans natifs progressifs : publier une photo, monter une video, ecrire un carnet sans photo/texte seul
- Bug de doublons de brouillons corrige (verrouillage des boutons pendant l'envoi, isFinished)
- Bandeau de session affiche avant l'ecriture pour eviter les pertes sur 401 tardif

### Base de donnees (Supabase, projet `smxnruefmrmfyfhuxygq`)
- Statut : ACTIVE_HEALTHY
- Dette de securite reperee par les advisors : 7 tables avec RLS active mais sans policy (cms_pricing_plans, jules_memory, newsletter_subscribers...), 1 vue SECURITY DEFINER (v_agent_governance), 13 fonctions a search_path mutable, protection mot de passe compromis (HaveIBeenPwned) desactivee
- La table `agent_tasks` est le registre officiel de coordination IA (voir section 3)

### Securite / dette technique connue (issues GitHub ouvertes)
- #449 — pas de verification d'auth serveur sur /panel-manager (200 public, depend du client React)
- #448 — deux tables articles coexistent (`articles` 8 usages vs `cms_blog_posts` 72 usages), source de verite pas claire
- #446 — sitemap.xml avec des `&` non echappes, fix ecrit en local mais pas deploye
- #442 — audit RLS et buckets Supabase jamais fait par manque d'acces dashboard
- #441 — projet Vercel `heldonica2` orphelin (DEPLOYMENT_NOT_FOUND) a nettoyer
- #443 — routes API de migration ponctuelles a auditer et supprimer

## 2. Ou on doit aller (priorites, a reviser chaque lundi)
1. [SECURITY] Middleware auth serveur sur /panel-manager (#449)
2. [DB] Trancher articles vs cms_blog_posts, migrer et supprimer le legacy (#448)
3. [CMS] Decider du sort de heldonica-cms + heldonica2 : fusion ou suppression (#441)
4. [SEO] Deployer le fix sitemap deja ecrit (#446)
5. [SECURITY] Audit RLS Supabase sur les tables sensibles (#442, plus les 7 tables sans policy)

## 3. Comment les IA se coordonnent ici (deja en place, ne pas dupliquer)
- La verite = table Supabase `agent_tasks` (migration `20260911120000_agent_tasks_coordination.sql`)
- Acces via le serveur MCP local (dossier `mcp/`), lu en stdio par Claude Code, Gemini CLI / Anti-Gravity, OpenCode — protocole decrit dans `AGENTS.md`, renvoi simple depuis `CLAUDE.md`
- Cinq statuts du protocole : sent -> claimed -> in_progress -> waiting_validation -> done (done = fait ET verifie, jamais l'un sans l'autre)
- Discord et les issues GitHub sont des notifications, pas la verite
- Regle : ne pas recreer de systeme parallele pour assigner des taches (pas de bot Discord de coordination, pas de Google Sheet, pas de Cloud Function externe) — tout passe par `agent_tasks` + MCP, que les agents lisent en local sur le poste de travail

## 4. Nettoyage fait (15-16/09/2026)
26 fichiers d'audit copiés vers `docs/archive/` le 15/09 (commit NET01) — mais NET01 avait copié sans retirer les originaux : les 26 doublons ont été supprimés de la racine le 16/09 (identiques à l'octet près, CRLF ignoré). Restent à la racine : `STATUS.md`, `TASKS.md`, `AGENTS.md`, `CLAUDE.md`, `INFRASTRUCTURE.md`, `ROADMAP.md`, `CHANGELOG.md`, `README.md`, `SECURITY_AUDIT.md`, `TESTS_APP_ET_CMS.md` et 7 `PROMPT_*.md` — ces derniers n'ont pas été tranchés.
