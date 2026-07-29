# Architecture Heldonica — Vue d'ensemble

## Stack Technique

| Composant | Technologie | Usage |
|-----------|-------------|-------|
| Framework | Next.js 15 | SSR, SSG, API Routes |
| Hebergement | Vercel Inc. | Deployments, Edge Functions |
| Base de donnees | Supabase (PostgreSQL) | CMS, Auth, Storage |
| Auth CMS | JWT + HMAC-SHA256 | Cookie + header auth |
| Auth Users | Supabase Auth | Utilisateurs finaux |
| Email | Resend | Notifications, Contact |
| Email marketing | Brevo (ex Sendinblue) | Newsletter |
| AI APIs | OpenAI, Gemini, Groq, Perplexity, Claude, Jules | Contenu, agents |
| Images | Unsplash, Supabase Storage, Behold | Media |
| Analytics | Google Analytics 4 | Trafic |

## Arborescence

```
heldonica/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── cms/           # Routes CMS (protegees)
│   │   ├── agents/        # Routes agents IA
│   │   ├── blog/          # Blog public
│   │   ├── newsletter/    # Newsletter
│   │   └── ...
│   ├── admin/            # Dashboard admin
│   ├── panel-manager/    # CMS UI
│   ├── destinations/      # Pages destinations
│   ├── blog/             # Blog articles
│   └── ...
├── lib/                   # Bibliotheques partagées
│   ├── supabase.ts       # Client Supabase (serveur)
│   ├── supabase-client.ts # Client Supabase (client)
│   ├── supabase-storage.ts # Storage utilities
│   ├── blog-supabase.ts  # Blog queries
│   ├── auth.ts           # Auth utilities
│   ├── env.ts            # Environment validation
│   └── ...
├── components/            # Composants React
├── content/              # Contenu markdown statique
│   ├── articles/         # Articles MDX
│   └── salvaged/         # Legacy (non utilise)
├── supabase/
│   └── migrations/       # Migrations SQL
├── docs/                 # Documentation
└── .github/
    └── workflows/        # CI/CD
```

## Sources de verite

| Donnee | Source | Methode |
|--------|--------|---------|
| Articles blog | `cms_blog_posts` | Supabase |
| Pages CMS | `cms_pillar_pages` | Supabase |
| Destinations | `destinations` | Supabase |
| Temoignages | `cms_testimonials` | Supabase |
| Parametres | `site_settings` | Supabase |
| Contenu statique | `content/*.md` | Fichiers MD |
| Images | `media`, `blog-images` buckets | Supabase Storage |

## API Routes Principales

### Routes CMS (protegees par `requireCmsAuth`)

```
/api/cms/articles/          # CRUD articles
/api/cms/media/             # Gestion media
/api/cms/settings/          # Parametres site
/api/cms/newsletter/        # Newsletter
/api/cms/destinations/      # Destinations
/api/cms/testimonials/      # Temoignages
/api/cms/ai-*/             # Outils IA
/api/cms/upload/            # Upload fichiers
/api/cms/validate/           # Validation
```

### Routes Publiques

```
/api/newsletter/            # Inscription newsletter
/api/contact/               # Formulaire contact
/api/demandes-travel/       # Demandes voyage
/api/webhooks/              # Webhooks
/api/blog/                  # Blog public
```

### Routes Agents IA

```
/api/agents/dispatch/       # Dispatch agent
/api/agents/status/         # Status agent
/api/jules/                 # Jules agent
```

## Authentification

### CMS Admin
- Password: `CMS_PASSWORD`
- Session: Cookie HMAC-SHA256 signe
- Expiration: Configurable

### Utilisateurs
- Supabase Auth (email/password, OAuth)
- RLS policies sur les tables

## Environment Variables Requises

Voir `.env.example` pour la liste complete.

### Variables Critique
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # Serveur ONLY
CMS_PASSWORD=                  # CMS admin
CMS_SESSION_SECRET=             # Signer sessions
RESEND_API_KEY=                # Emails
```

### Variables Optionnelles
```bash
OPENAI_API_KEY=               # AI
GEMINI_API_KEY=               # AI alternative
GROQ_API_KEY=                 # AI alternative
BREVO_API_KEY=                # Newsletter
GOOGLE_ANALYTICS_PROPERTY_ID= # Analytics
```

## Maintenance Mode

Le mode maintenance peut etre active via:
1. **Vercel:** Variable `MAINTENANCE_MODE=true`
2. **Supabase:** Table `site_settings`, cle `maintenance_mode`

Priorite: Vercel > Supabase > Fallback (true)

Pages exclues du maintenance:
- `/maintenance`
- `/panel-manager`
- `/api/*`
- `/_next/*`
- `/robots.txt`, `/sitemap.xml`

## Performance

- **ISR:** Revalidation 1h sur blog
- **Edge:** Middleware sur Edge Runtime
- **Cache:** CloudFront via Vercel
- **Images:** Optimisees via Next.js Image

## CI/CD

- **Deploy:** Automatique sur push vers `main`
- **Preview:** Deploy preview sur chaque PR
- **Secrets:** GitHub Actions + Vercel

## Securite

- RLS active sur toutes les tables
- Auth CMS sur routes sensibles
- Rate limiting sur API publiques
- CSP header configure
- CORS limite aux domaines autorises

---

*Derniere mise a jour: 2026-07-27*
