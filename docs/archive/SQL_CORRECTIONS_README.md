# Correction CMS — À Exécuter dans Supabase

## Contexte

Après le déploiement du commit `996d6e6`, le code est corrigé mais les **valeurs CMS** (stockées dans Supabase) sont encore les anciennes.

## Instructions d'exécution

### Option 1 : Via Supabase SQL Editor (Recommandé)

1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet Heldonica
3. Aller dans **SQL Editor**
4. Copier-coller le contenu de `sql/fix_cms_values_2026-07-04.sql`
5. Cliquer **Run**

### Option 2 : Via Supabase CLI

```bash
npx supabase db execute -f sql/fix_cms_values_2026-07-04.sql
```

### Option 3 : Via curl (si token disponible)

```bash
curl -X POST "https://xxxx.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "UPDATE site_settings SET value = '/nos-services' WHERE key = 'nav_item_5_url';"}'
```

## Structure des tables CMS

| Table | Colonnes | Requête SQL |
|-------|---------|------------|
| `site_settings` | `key`, `value`, `updated_at` | `WHERE key = '...'` |
| `cms_editable_zones` | `page`, `zone_key`, `value`, `is_active` | `WHERE zone_key = '...'` |
| `site_content` | `page`, `block_key`, `value` | `WHERE block_key = '...'` |

## Valeurs corrigées

| Table | Champ | Ancienne valeur | Nouvelle valeur |
|-------|-------|-----------------|-----------------|
| `site_settings` | `nav_item_5_url` | `/expert-hotelier` | `/nos-services` |
| `site_settings` | `nav_item_5_label` | `Consulting hotelier` | `Services` |
| `cms_editable_zones` | `newsletter_title` | `Recois les pepites...` | `Reçois les pépites...` |
| `cms_editable_zones` | `footer_legal_item_1_label` | `Mentions legales` | `Mentions légales` |
| `cms_editable_zones` | `footer_legal_item_2_label` | `Politique de confidentialite` | `Politique de confidentialité` |

## Vérification après exécution

Après l'exécution, vérifier sur https://heldonica.fr :
- `/start` : Plus de lien "Expertise hôtelière B2B"
- Footer : Accents corrects (pépites, légales, confidentialité)
- Header : Navigation "Services" pointe vers `/nos-services`

## Rollback (si nécessaire)

```sql
-- Rollback navigation
UPDATE site_settings SET value = '/expert-hotelier' WHERE key = 'nav_item_5_url';
UPDATE site_settings SET value = 'Consulting hotelier' WHERE key = 'nav_item_5_label';

-- Rollback accents
UPDATE site_content SET value = 'Recois les pepites avant les autres' WHERE key = 'newsletter_title';
UPDATE site_content SET value = 'Mentions legales' WHERE key = 'footer_legal_item_1_label';
UPDATE site_content SET value = 'Politique de confidentialite' WHERE key = 'footer_legal_item_2_label';
```
