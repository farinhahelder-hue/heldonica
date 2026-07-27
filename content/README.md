# Content Directory

Ce répertoire contient les fichiers de contenu statiques pour Heldonica.

## Structure

```
content/
├── articles/           # Articles markdown source (migration en cours vers Supabase)
│   ├── brouillons/     # Brouillons d'articles en cours de rédaction
│   └── *.mdx          # Articles publiés en format MDX
├── salvaged/          # ⚠️ LEGACY - Ancien contenu non migré en base
│                      # Fichiers markdown孤 avant migration vers Supabase CMS
│                      # Conservés pour référence uniquement
│                      # Source de vérité actuelle: Supabase (cms_blog_posts)
├── *.md              # Contenu éditorial: FAQ, guides, histoire, manifeste
└── writing-prompt-final.md  # Prompt de rédaction pour les agents IA
```

## Migration Status

- [x] Articles principaux migrés → `cms_blog_posts` (Supabase)
- [ ] Contenu `salvaged/` non migré (ancien contenu test/draft)
- [ ] Contenu `.md` principal non migré

## Recommandations

1. **Conserver `salvaged/`** jusqu'à validation que le contenu est bien dans Supabase
2. **Supprimer `salvaged/`** après vérification via CMS que tous les articles sont présents
3. **Migrer le contenu `.md`** restant vers Supabase ou archiver

## Sources de vérité

| Contenu | Source actuelle | Migration |
|---------|----------------|-----------|
| Blog articles | `cms_blog_posts` (Supabase) | ✅ Complète |
| Pages CMS | `cms_pillar_pages` (Supabase) | ✅ Complète |
| Destinations | `destinations` (Supabase) | ✅ Complète |
| Contenu statique | `content/*.md` | ⏳ En cours |
| Ancien contenu | `content/salvaged/` | ❌ Legacy |

---

*Dernière mise à jour: 2026-07-27*
