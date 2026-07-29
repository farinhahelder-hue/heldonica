# Content Directory

Ce répertoire contient les fichiers de contenu statiques pour Heldonica.

## Structure

```
content/
├── articles/           # Articles markdown source (migration en cours vers Supabase)
│   ├── brouillons/     # Brouillons d'articles en cours de rédaction
│   └── *.mdx          # Articles publiés en format MDX
├── salvaged/          # ⚠️ SUPPRIMÉ 2026-07-27 - Contenu migré vers Supabase
├── *.md              # Contenu éditorial: FAQ, guides, histoire, manifeste
└── writing-prompt-final.md  # Prompt de rédaction pour les agents IA
```

## Migration Status

- [x] Articles principaux migrés → `cms_blog_posts` (Supabase)
- [x] Contenu `salvaged/` supprimé (2026-07-27) — non utilisé, migré vers Supabase
- [ ] Contenu `.md` principal non migré

## Recommandations

1. **Nettoyage effectu\u00e9** — `salvaged/` supprim\u00e9 (2026-07-27)
2. **Migrer le contenu `.md`** restant vers Supabase ou archiver

## Sources de vérité

| Contenu | Source actuelle | Migration |
|---------|----------------|-----------|
| Blog articles | `cms_blog_posts` (Supabase) | ✅ Complète |
| Pages CMS | `cms_pillar_pages` (Supabase) | ✅ Complète |
| Destinations | `destinations` (Supabase) | ✅ Complète |
| Contenu statique | `content/*.md` | ⏳ En cours |
| Ancien contenu | `content/salvaged/` | ❌ Supprimé 2026-07-27 |

---

*Dernière mise à jour: 2026-07-27*
