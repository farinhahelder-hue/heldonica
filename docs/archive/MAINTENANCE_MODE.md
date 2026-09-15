# Mode Maintenance - Guide Complet

## Résumé

Ce document explique comment activer/désactiver le mode maintenance pour heldonica.fr tout en gardant un accès privé.

## Architecture

1. **Middleware Next.js** (`middleware.ts`) intercepte toutes les requêtes
2. **3 sources de maintenance** (par ordre de priorité):
   - Variable `MAINTENANCE_MODE` (urgence, nécessite redéploiement)
   - Supabase `site_settings.maintenance_mode` (dynamique)
   - Cookie `heldonica_maintenance` (legacy)

3. **Bypass automatique**:
   - URLs preview Vercel (`*.vercel.app` avec `--`)
   - Token secret via cookie ou header

---

## Activer/Désactiver

### Option 1: Supabase (Recommandé)

```sql
-- Activer
UPDATE site_settings SET value = 'true', updated_at = NOW() WHERE key = 'maintenance_mode';

-- Désactiver  
UPDATE site_settings SET value = 'false', updated_at = NOW() WHERE key = 'maintenance_mode';

-- Vérifier
SELECT * FROM site_settings WHERE key = 'maintenance_mode';
```

### Option 2: Variable Vercel

`MAINTENANCE_MODE=1` dans Settings → Environment Variables.

---

## Accès Privé

### URLs Preview Vercel

Bypassent automatiquement la maintenance. Trouver sur Vercel Dashboard → Deployments.

### Token Bypass

1. Définir `MAINTENANCE_BYPASS_TOKEN=TON_SECRET` dans Vercel
2. Accéder à la prod avec:
   - Cookie: `heldonica_maintenance_bypass=TON_SECRET`
   - Console: `document.cookie="heldonica_maintenance_bypass=TON_SECRET; path=/"`

---

## Variables d'Environnement

| Variable | Description |
|----------|-------------|
| `MAINTENANCE_MODE` | Active maintenance |
| `MAINTENANCE_BYPASS_TOKEN` | Token accès privé |
| `DISABLE_MAINTENANCE` | Désactive forcé |
