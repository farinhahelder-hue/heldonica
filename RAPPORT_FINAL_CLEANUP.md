# RAPPORT FINAL — Cleanup Heldonica

## 1. Résumé exécutif

Audit et correction complets du repo Heldonica. 5 lots de correction appliqués, build local OK, branche poussée.

## 2. Causes racines

| Problème | Cause |
|---|---|
| Build cassé si vars Supabase manquantes | Non-null assertions (`!`) sur `process.env` dans temoignages/page.tsx |
| Sanity schemas morts | Migration Sanity → Supabase incomplète, schemas jamais nettoyés |
| Blog.tsx inutilisé mais importe wordpress-data | Composant remplacé par BlogClientPage mais jamais supprimé |
| MAINTENANCE_ACTIVE = true par défaut | Si ni env var Vercel ni CMS configuré, le site tombe en maintenance |
| Lien B2B cassé vers /travel-planning | Copier-coller du bloc B2C dans Services.tsx |
| CDN Sanity dans remotePatterns + CSP | Résidu de l'ancien CMS Sanity |
| `wordpresss old/` dans gitignore | Typo + résidu WordPress jamais nettoyé |
| Aucun guard `server-only` | createServiceClient exporté sans protection côté client |

## 3. Corrections appliquées

### Lot 1 — Legacy mort
- Suppression `schemas/` (4 fichiers Sanity orphelins)
- Suppression `scripts/` (12 scripts de migration WordPress obsolètes)
- Suppression `CMS_SETUP_GUIDE.md` (guide MongoDB/ancien CMS)
- Suppression `components/Blog.tsx` (composant inutilisé)
- Nettoyage `.gitignore` et `.vercelignore` (entrées `wordpresss old/`, `twillo.txt`, `OLLAMA_MEMORY.md`)

### Lot 2 — next.config.js
- Retrait `cdn.sanity.io` des remotePatterns images
- Nettoyage CSP (retrait `unpkg.com` inutilisé)

### Lot 3 — Supabase
- Ajout `import 'server-only'` dans `lib/supabase.ts`
- Ajout fallback `SUPABASE_SERVICE_KEY` dans `createServiceClient()`
- Correction non-null assertions dans `app/temoignages/page.tsx`

### Lot 4 — Middleware
- `MAINTENANCE_ACTIVE` passe de `true` à `false` par défaut

### Lot 5 — Branding
- Correction lien B2B Consulting : `/travel-planning` → `/expert-hotelier`

## 4. Fichiers modifiés

| Fichier | Action |
|---|---|
| `.gitignore` | Nettoyé (3 entrées supprimées) |
| `.vercelignore` | Nettoyé (1 entrée supprimée) |
| `next.config.js` | remotePatterns + CSP |
| `middleware.ts` | MAINTENANCE_ACTIVE false |
| `lib/supabase.ts` | server-only + fallback |
| `app/temoignages/page.tsx` | Type-safe env vars |
| `components/Services.tsx` | Lien B2B corrigé |
| `schemas/` (4 fichiers) | **Supprimé** |
| `scripts/` (12 fichiers) | **Supprimé** |
| `CMS_SETUP_GUIDE.md` | **Supprimé** |
| `components/Blog.tsx` | **Supprimé** |

## 5. Variables d'environnement requises sur Vercel

### Essentielles (production)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### CMS
```
CMS_PASSWORD=
CMS_SESSION_SECRET=
```

### Email
```
RESEND_API_KEY=
ADMIN_EMAIL=contact@heldonica.fr
```

### Optionnelles
```
NEXT_PUBLIC_SITE_URL=https://www.heldonica.fr
MAINTENANCE_MODE=false
SUPABASE_SERVICE_KEY=   # alias, non requis si SUPABASE_SERVICE_ROLE_KEY défini
```

## 6. Changements Supabase / SQL

Aucune migration SQL nécessaire. Les changements sont purement côté code :
- `SUPABASE_SERVICE_KEY` est maintenant reconnu comme fallback partout (déjà le cas dans 25+ fichiers, manquait dans `createServiceClient()`)

## 7. Risques restants

1. **wordpress-data.ts** toujours utilisé par `app/destinations/[slug]/page.tsx` et `lib/related-articles.ts`. La suppression nécessite une migration complète vers Supabase.
2. **Newsletter.tsx** stub non fonctionnel (pas d'appel API réel). Seul le Footer.tsx a une intégration Brevo fonctionnelle.
3. **17+ fichiers audit** (.md) à la racine du repo. Sans danger mais polluent la navigation.
4. **wordpress-data.ts** contient 443 lignes de données hardcodées WordPress.

## 8. URL de la PR

Push effectué sur : `fix/master-cleanup-heldonica-20260728`

Créer la PR ici :
https://github.com/farinhahelder-hue/heldonica/pull/new/fix/master-cleanup-heldonica-20260728

## 9. Statut build local

✅ **Build OK** — 0 erreurs, 4 warnings (alt text admin, non-bloquants)

## 10. Statut preview Vercel

Non vérifié (pas d'accès au dashboard Vercel). Déclencher un déploiement depuis la PR.

## 11. Actions manuelles restantes

- [ ] Créer la PR via le lien ci-dessus
- [ ] Vérifier la preview Vercel
- [ ] Migrer `lib/wordpress-data.ts` vers Supabase
- [ ] Finaliser `components/Newsletter.tsx` (appel API Brevo)
- [ ] Nettoyer les 17+ fichiers audit à la racine
- [ ] Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est bien défini dans Vercel (le fallback `SUPABASE_SERVICE_KEY` ne doit pas être utilisé comme唯一 source)