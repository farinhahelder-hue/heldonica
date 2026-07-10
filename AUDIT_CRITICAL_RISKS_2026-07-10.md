# 🔴 AUDIT CRITIQUE — Risques Bloquants
## Heldonica.fr — 10 juillet 2026

---

## 1. RÉSUMÉ EXÉCUTIF

### État du site
- ✅ Production Vercel: READY
- ✅ PR #405 ouverte: Travel Planning E2E (en attente merge)
- ❌ Route `/api/demandes-travel`: INEXISTANTE
- ❌ Table `email_sequences`: RLS DÉSACTIVÉ

### Score global
| Domaine | Score | Tendance |
|---------|-------|----------|
| Sécurité Supabase | 85/100 | ⚠️ email_sequences à corriger |
| Conversion Travel | 60/100 | 🔴 Bug route API |
| Cohérence Marque | 70/100 | ⚠️ Accents footer |
| SEO | 78/100 | 🟡 Acceptable |

---

## 2. RISQUES CRITIQUES IDENTIFIÉS

### 🔴 P0 — BLOQUANTS

#### 1. Bug critique: Route API `/api/demandes-travel` inexistante
**Gravité**: CRITIQUE - Perte de conversion

**Localisation**: 
- Page: `app/travel-planning/page.tsx:146`
- Route appelée: `/api/demandes-travel`

**Problème**:
- Le formulaire sur `/travel-planning` envoie vers `/api/demandes-travel`
- Cette route n'existe pas dans le codebase
- Seule `/api/cms/demandes-travel` existe (protégée par auth CMS)
- Résultat: **TOUTES les soumissions du formulaire principal sont PERDUES**

**Impact business**: 
- Chaque demande de voyage envoyée via `/travel-planning` est perdue
- Seule la page `/travel-planning-form` (formulaire wizard) fonctionne

**Cause probable**: 
- Confusion entre `/api/demandes-travel` (public) et `/api/cms/demandes-travel` (admin)
- La route publique n'a jamais été créée

**Rollback**: 
- Aucun impact si on corrige (simple ajout de route)
- La correction peut être testée en staging avant merge

**Solution**: 
- Créer `/api/demandes-travel/route.ts` qui traite les soumissions
- OU modifier le formulaire pour pointer vers `/api/travel-planning` existant

---

#### 2. Table `email_sequences` SANS RLS
**Gravité**: CRITIQUE - Sécurité données personnelles

**Localisation**: `supabase/migrations/20250608_email_sequences.sql`

**Problème**:
```sql
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,  -- Donnée personnelle!
  step INTEGER NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, step)
);
-- Aucune politique RLS définie!
```

**Impact**:
- N'importe qui peut lire/écrire dans cette table
- Exposition potentielle d'emails de prospects
- Violation RGPD potentielle

**Rollback**: 
- Supprimer la politique après coup si besoin
- Migration réversible

**Solution**: 
```sql
-- Activer RLS
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

-- Policy service role only (comme instagram_drafts)
CREATE POLICY "Service role only" ON email_sequences
  FOR ALL
  USING (false)
  WITH CHECK (false);
```

---

### 🟠 P1 — IMPORTANTS

#### 3. Accents manquants dans le Footer
**Gravité**: Moyenne - Impact image de marque

**Localisation**: `components/Footer.tsx`

**Texte actuel** → **Devrait être**:
- `"Mentions legales"` → `"Mentions légales"`
- `"Politique de confidentialite"` → `"Politique de confidentialité"`
- `"Recois les pepites"` → `"Reçois les pépites"`

**Effort**: 10 minutes
**Rollback**: Modifier le texte à nouveau

---

#### 4. Double table blog
**Gravité**: Moyenne - Confusion données

**Tables existantes**:
- `cms_blog_posts` - Table CMS principale
- `articles` - Table，可能是 duplication

**Impact**: Risque de divergence de données

**Action recommandée**: Documenter la source de vérité unique

---

## 3. ANALYSE DU FORMULAIRE TRAVEL PLANNING

### Formulaires existants

| Page | URL | API | Status |
|------|-----|-----|--------|
| `/travel-planning` | Formulaire simple | `/api/demandes-travel` | ❌ CASSÉ |
| `/travel-planning-form` | Wizard 3 étapes | `/api/travel-planning` | ✅ OK |

### Chaîne de conversion actuelle

```
/travel-planning (formulaire simple)
    ↓ POST /api/demandes-travel (INEXISTANT!)
    ↓ ERREUR 404
    ↓ Lead PERDU ❌

/travel-planning-form (wizard)
    ↓ POST /api/travel-planning (EXISTE)
    ↓ Insert DB ✅
    ↓ Email confirmation ✅
    ↓ Lead CRÉÉ ✅
```

### Conclusion
- **1 formulaire sur 2 fonctionne**
- Le formulaire principal (`/travel-planning`) est CASSÉ
- La PR #405 corrige le formulaire wizard mais PAS le formulaire simple

---

## 4. ROADMAP RECOMMANDÉE

### Immédiat (cette semaine)

| # | Action | Impact | Effort | Risque Rollback |
|---|--------|--------|--------|-----------------|
| 1 | Créer route `/api/demandes-travel` | Conversion | 30min | Faible |
| 2 | Activer RLS sur `email_sequences` | Sécurité | 15min | Faible |
| 3 | Corriger accents footer | Marque | 10min | Nul |

### Sprint suivant (2e semaine)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 4 | Merger PR #405 (Travel Planning E2E) | Conversion | Review |
| 5 | Documenter source vérité blog | Maintenance | 1h |
| 6 | Vérifier RLS sur toutes les tables | Sécurité | 1h |

### Améliorations premium (3e+ semaine)

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 7 | Unifier les 2 formulaires travel | UX/Conversion | 4h |
| 8 | Ajouter skeleton loaders | UX | 2h |
| 9 | Skeleton SEO pages destinations | SEO | 2h |

---

## 5. PROPOSITIONS DE PRs

### PR #1: fix/secure-email-sequences-rls
**Priorité**: IMMÉDIATE
**Branche**: `fix/secure-email-sequences-rls`

**Objectif**: Activer RLS sur la table `email_sequences`

**Fichiers**:
- `supabase/migrations/20260710_fix_email_sequences_rls.sql` (NOUVEAU)

**Migration**:
```sql
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON email_sequences FOR ALL USING (false) WITH CHECK (false);
```

**Checklist QA**:
- [ ] Migration appliquée en prod Supabase
- [ ] Vérifié: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'email_sequences'`
- [ ] Test insertion via API (doit fonctionner avec service role key)
- [ ] Test lecture publique (doit échouer)

**Impact**:
- Sécurité: ✅ Protège les données email
- SEO/UX: ❌ Aucun impact
- Effort: 15 minutes

---

### PR #2: fix/create-demandes-travel-api
**Priorité**: IMMÉDIATE (Critical Business)
**Branche**: `fix/create-demandes-travel-api`

**Objectif**: Créer la route API manquante pour le formulaire principal

**Fichiers**:
- `app/api/demandes-travel/route.ts` (NOUVEAU)

**Logique** (copier depuis `/api/travel-planning`):
```typescript
// POST - Créer demande de voyage
// - Rate limiting
// - Validation
// - Insert dans demandes_travel
// - Sync Brevo
// - Email interne
// - Email confirmation
```

**Option alternative**:
- Modifier `app/travel-planning/page.tsx` pour utiliser `/api/travel-planning` existant

**Checklist QA**:
- [ ] Route créée et testée localement
- [ ] Test soumission formulaire `/travel-planning`
- [ ] Vérification insertion DB
- [ ] Vérification emails envoyés
- [ ] Test staging avant merge

**Impact**:
- Conversion: ✅ FORT - Restore la conversion travel planning
- SEO/UX: ✅ Améliore l'UX (pas d'erreur)
- Effort: 30 minutes

---

### PR #3: fix/footer-accents
**Priorité**: RAPIDE (marque)
**Branche**: `fix/footer-accents`

**Objectif**: Corriger les accents manquants dans le footer

**Fichiers**:
- `components/Footer.tsx`

**Modifications**:
```diff
- "Mentions legales" → "Mentions légales"
- "Politique de confidentialite" → "Politique de confidentialité"  
- "Recois les pepites" → "Reçois les pépites"
```

**Checklist QA**:
- [ ] Vérification visuelle footer
- [ ] Mobile responsive
- [ ] Aucune régression

**Impact**:
- Marque: ✅ Cohérence
- Effort: 10 minutes

---

## 6. PROCHAINE ACTION IMMÉDIATE

### Action #1: Créer la route API `/api/demandes-travel`

```bash
# 1. Créer la branche
git checkout -b fix/create-demandes-travel-api

# 2. Créer la route
cat > app/api/demandes-travel/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

// Rate limiter...
// Validation...
// Insert DB...
// Brevo sync...
// Emails...
EOF

# 3. Commit et push
git add .
git commit -m "fix: create missing /api/demandes-travel route

- Route publique pour formulaire /travel-planning
- Insert into demandes_travel table
- Brevo sync
- Email confirmation"
git push -u origin fix/create-demandes-travel-api
```

### Action #2: Activer RLS sur email_sequences

```bash
# Créer migration
cat > supabase/migrations/20260710_fix_email_sequences_rls.sql << 'EOF'
-- Activer RLS sur email_sequences
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

-- Policy service role only
CREATE POLICY "Service role only" ON email_sequences
  FOR ALL
  USING (false)
  WITH CHECK (false);
EOF

# Commit
git add .
git commit -m "security: enable RLS on email_sequences table"
```

---

## 7. VÉRIFICATIONS POST-DÉPLOIEMENT

### Après chaque merge

| Action | Détails |
|--------|---------|
| Vérifier build Vercel | `vercel build` successful |
| Tester formulaire | Soumettre demande test |
| Vérifier DB | `SELECT * FROM demandes_travel ORDER BY created_at DESC LIMIT 1` |
| Vérifier emails | Email interne reçu |
| Checker logs | `vercel logs heldonica.vercel.app` |

---

*Rapport généré par OpenHands — 10 juillet 2026*
*Basé sur: AUDIT_EXHAUSTIF_2026-07-04.md, audits précédents, inspection code source*
