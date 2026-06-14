# Supabase Schema — Heldonica (2026-06-14)

## Sources de vérité

### Articles

| Table | Usage | Règle |
|-------|-------|-------|
| `cms_blog_posts` | Édition CMS (`/api/cms/articles/*`) | ✅ Table d'écriture |
| `articles` | Pages publiques, sitemap, OG, SEO | ✅ Source de vérité public |

**Flux attendu** :
1. L'éditeur CMS écrit dans `cms_blog_posts`
2. Le trigger `sync_cms_blog_posts_to_articles` synchronise automatiquement vers `articles`
3. Les pages publiques lisent **uniquement** dans `articles`

**Règle absolue** : Ne jamais modifier `articles` directement en SQL.
Toujours passer par `cms_blog_posts`.

---

### Destinations

| Table | Usage | Règle |
|-------|-------|-------|
| `destinations` | Carte interactive, sitemap | ✅ Source de vérité |
| `cms_destinations` | Archivage / lecture seule | ⚠️ Legacy — ne plus écrire |

---

## Tables de contenu

### `guides_pdf` (NOUVELLE TABLE — 2026-06-14)

Lead magnets PDF (guides slow travel).

- **Lecture** : publique (`is_active = true`) — lead magnet accessible à tous
- **Écriture** : `service_role` uniquement (via API routes)

```sql
-- Exemple d'insertion (via service role)
INSERT INTO guides_pdf (title, slug, description, filename, storage_path)
VALUES ('Guide Madère Slow Travel', 'guide-madere-slow-travel', '...', 'guide-madere.pdf', 'guides/guide-madere.pdf');
```

### `cms_media`

Médiathèque du CMS. RLS activée, lecture/écriture service_role.

### `article_map_routes` / `article_map_pois` / `article_map_route_points`

Itinéraires interactifs sur les articles.

- **Lecture** : service_role uniquement (géré côté serveur)
- **Écriture** : service_role uniquement

---

## Sécurité

### Champs supprimés

| Champ | Raison |
|-------|--------|
| `cms_carousel_history.cms_password` | Mot de passe en clair → supprimé 2026-06-14 |

### RLS activé

Toutes les tables sensibles ont RLS activé :

| Table | Lecture | Écriture |
|-------|---------|----------|
| `articles` | `published = true` | service_role |
| `cms_blog_posts` | service_role | service_role |
| `destinations` | `published = true` | authenticated |
| `cms_media` | service_role | service_role |
| `guides_pdf` | `is_active = true` (public) | service_role |
| `article_map_*` | service_role | service_role |
| `cms_newsletter` | service_role (admin) | publique (INSERT avec validation email) |
| `cms_carousel_history` | service_role (service_role only — pas authenticated) | service_role |
| `cms_settings` | publique | service_role |

### Newsletter

- Table : `cms_newsletter` (officielle)
- `newsletter_subscribers` : supprimée (doublon non utilisé)
- INSERT public autorisé avec validation email (`is_valid_email()`)

---

## Migrations à exécuter

```bash
# Via Supabase CLI
supabase db push

# Ou manuellement dans le SQL Editor :
# 1. Copier le contenu de 20260614_security_schema_cleanup.sql
# 2. Exécuter
```

---

## Checklist post-migration

- [ ] Vérifier que RLS est actif sur `guides_pdf` (requête de vérification dans la migration)
- [ ] Tester l'insertion newsletter avec un email invalide → doit échouer
- [ ] Tester l'insertion newsletter avec un email valide → doit réussir
- [ ] Vérifier que `cms_carousel_history.cms_password` est bien supprimé
- [ ] Confirmer que les pages publiques lisent toujours les articles (table `articles`)
- [ ] Confirmer que le CMS (api/cms/articles) écrit toujours dans `cms_blog_posts`
- [ ] Vérifier que l'admin newsletter (GET /api/cms/newsletter) fonctionne toujours — la policy SELECT est maintenant service_role only