# Heldonica - Contexte Projet pour Agents IA

> Ce fichier est le cerveau partagé entre Jules, AllHands et Gemini.
> Mis a jour a chaque sprint. Derniere MAJ: 2026-06-10

## Identite du projet

- **Nom**: Heldonica
- **URL production**: https://heldonica.vercel.app (domaine: heldonica.fr)
- **Type**: Plateforme de voyage B2C (contenus, destinations, blog)
- **Langue principale**: Francais
- **Owner**: farinhahelder-hue
- **Repo**: farinhahelder-hue/heldonica

## Stack technique

### Frontend
- **Framework**: Next.js 14 App Router (TypeScript)
- **Styling**: Tailwind CSS
- **Composants**: React 18, composants server-side par defaut
- **Images**: next/image (en cours de migration depuis <img>)
- **SEO**: Metadata API Next.js, JSON-LD schemas, sitemap auto-genere

### Backend / Base de donnees
- **BDD**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (si applicable)
- **ORM**: Direct SQL via Supabase client
- **API**: Routes API Next.js (/app/api/)
- **ATTENTION**: Eviter les N+1 queries - toujours utiliser .upsert(array) en batch

### Integrations
- **Email transactionnel**: Resend (formulaire contact)
- **Newsletter**: Brevo
- **Automatisation**: n8n (workflows Instagram, contenu)
- **Analytics**: (a confirmer)
- **CMS**: Sanity (schemas dans /schemas/)

### Deploy / DevOps
- **Hosting**: Vercel (500+ deployments)
- **CI/CD**: GitHub Actions (.github/workflows/)
- **Branch principale**: main
- **Strategie branches**: feature/xxx, fix/xxx, content/xxx

### Tests
- **Unit tests**: Jest (dossier __tests__/)
- **E2E**: Playwright (si applicable)
- **Linting**: ESLint + eslintrc.json

## Structure du repo

```
heldonica/
  .github/workflows/   # CI/CD GitHub Actions
  .jules/              # Contexte et memoire pour Jules
  __tests__/           # Tests unitaires
  app/                 # Next.js App Router (pages, routes API)
  components/          # Composants React reutilisables
  content/             # Articles blog (MDX/JSON)
  docs/                # Documentation projet
  lib/                 # Utilitaires, helpers
  models/              # Modeles de donnees MongoDB/Supabase
  public/              # Assets statiques
  schemas/             # Schemas Sanity CMS
  scripts/             # Scripts utilitaires
  skills/              # (domaine specifique)
  styles/              # CSS global
  supabase/            # Config Supabase, migrations
```

## Conventions de code

- **TypeScript strict**: Toujours typer les props et retours de fonction
- **Server Components**: Privilegier les composants serveur (pas de 'use client' sauf necessite)
- **ISR**: Utiliser `export const revalidate = 60` pour les pages statiques avec contenu dynamique
- **Images**: Toujours `next/image` avec width/height explicites + `loading="lazy"`
- **JSON-LD**: Ajouter schemas sur toutes les pages importantes (Article, FAQ, BreadcrumbList)
- **Commits**: Conventional commits (feat:, fix:, docs:, ci:, refactor:)

## Regles metier importantes

- Le site est B2C uniquement (pas de section B2B)
- Contenus: destinations de voyage, articles blog, travel planning
- Badges "Teste par Heldonica" sur les recommandations
- Newsletter via Brevo, formulaire contact via Resend
- Pas de fausses testimonials - utiliser du contenu reel uniquement

## Agents IA - Workflow

| Agent | Acces | Declencheur | Role |
|-------|-------|-------------|------|
| Jules | GitHub repo | Label `jules` sur issue | Fix bugs, SEO, performance, tests |
| AllHands | Repo complet | Manuel via PROMPT_ALLHANDS.md | Features complexes, refactoring |
| Gemini | n8n webhook | Label `gemini-content` ou cron | Generation contenu SEO, articles |

## Fichiers de reference agents

- `JULES_TASKS.md` - Backlog taches pour Jules (priorite haute/moyenne/basse)
- `JULES_MEMORY.md` - Historique des sessions et learnings
- `PROMPT_ALLHANDS.md` - Instructions systeme pour AllHands
- `PROMPT_ALLHANDS_SPRINT.md` - Prompt sprint AllHands
- `.jules/bolt.md` - Learnings techniques de Jules (ISR, N+1, etc.)

## Performances actuelles (ref 2026-05)

- ISR active sur blog index (revalidate: 60s)
- N+1 Supabase corrige sur /api/cms/settings
- Lazy loading images: en cours
- Core Web Vitals: audit en attente

## Variables d'environnement requises

Voir `.env.example` pour la liste complete.
Principales:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `BREVO_API_KEY`
