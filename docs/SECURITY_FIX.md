# Security Fix - RLS (Row-Level Security)

## 🚨 Issue Reported

Supabase a signalé que les tables CMS sont accessibles publiquement sans RLS.

## ✅ Fix Applied

### Fichier créé

`supabase/migrations/02_enable_rls.sql` — Active RLS sur toutes les tables CMS

### Comment appliquer

1. **Aller dans Supabase Dashboard**
   - https://supabase.com/dashboard/proj_smxnruefmrmfyfhuxygq

2. **Aller dans SQL Editor**

3. **Copier-coller le contenu de** `supabase/migrations/02_enable_rls.sql`

4. **Exécuter**

---

## 📋 Ce que fait le script

```sql
-- 1. Active RLS sur cms_blog_posts
ALTER TABLE public.cms_blog_posts ENABLE ROW LEVEL SECURITY;

-- 2. Crée des politiques d'accès
--    - authenticated: peut lire/écrire
--    - anon: peut seulement lire (si publié)

-- 3. Répétition pour cms_demandes, cms_settings, cms_site_content
```

---

## 🔐 Comment ça marche

| Client | Clé utilisée | Accès |
|--------|-------------|-------|
| **Browser** | ANON_KEY | RLS policies (restreint) |
| **API Server** | SERVICE_ROLE_KEY | Bypass RLS (complet) |
| **n8n** | SERVICE_ROLE_KEY | Bypass RLS (complet) |

Le client public utilise la clé anon et respecte les policies RLS.  
Les opérations serveur utilisent la service role key qui bypass RLS.

---

## ⚠️ À vérifier dans Vercel

Assure-toi que ces variables sont définies :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx (clé publique)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx (clé secrète - uniquement serveur)
```

**Ne jamais** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client !