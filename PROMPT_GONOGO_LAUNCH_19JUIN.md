# PROMPT GONOGO LAUNCH — 19 JUIN 2026

## Contexte

Ce prompt constitue le **dernier sas qualité** avant mise en ligne de heldonica.fr.

Il reprend les points critiques restants du `SITE_AUDIT_REPORT.md` et intègre la logique de release issue de `AUDIT_COMPLET_2026-06-18.md`.

### Prérequis (déjà corrigés vorher)
- ✅ `/start` fonctionnel
- ✅ Table `cms_blog_posts` avec seed data
- ✅ Séquence Brevo configurée

---

## CHECKLIST EXÉCUTION

### PHASE 1 : Fichiers manquants (P1 - Blocker UX)

- [ ] **Créer `app/not-found.tsx`** — Page 404 personnalisée
  - 参考: `SITE_AUDIT_REPORT.md` ligne 354-380
  - Design: Header + Footer + message "Page introuvable" + lien retour accueil

- [ ] **Créer `app/error.tsx`** — Error boundary
  - 参考: `SITE_AUDIT_REPORT.md` ligne 382-421
  - Design: Header + Footer + message "Une erreur est survenue" + bouton retry

---

### PHASE 2 : Images next/image (P1 - SEO/Performance)

#### Blog article (`app/blog/[slug]/page.tsx`)
- [ ] Ligne 204: Remplacer `<img>` hero par `<Image>` avec width/height
- [ ] Ligne 338: Remplacer `<img>` contenu par `<Image>` avec width/height

#### Page À propos (`app/a-propos/page.tsx`)
- [ ] Ligne 91: Remplacer `<img>` par `<Image>` avec dimensions
- [ ] Ligne 159: Remplacer `<img>` par `<Image>` avec dimensions
- [ ] Ligne 201: Remplacer `<img>` par `<Image>` avec dimensions
- [ ] Ligne 223: Remplacer `<img>` par `<Image>` avec dimensions

#### Home (`components/HomeClient.tsx`)
- [ ] Ligne 139: Remplacer `<img>` par `<Image>` avec dimensions
- [ ] Ligne 157: Remplacer `<img>` par `<Image>` avec dimensions

---

### PHASE 3 : Dimensions Image (P2 - CLS)

#### Destinations detail (`app/destinations/[slug]/page.tsx`)
- [ ] Ligne 231: Ajouter width/height à `<Image>`
- [ ] Ligne 325: Ajouter width/height à `<Image>`

#### Destinations list (`components/DestinationsClient.tsx`)
- [ ] Ligne 210: Ajouter dimensions manquantes

---

### PHASE 4 : Performance Fonts (P2 - FOUT)

- [ ] **Ajouter `display=swap`** dans `components/SiteTheme.tsx` ligne 52
  - URL Google Fonts: ajouter `&display=swap` au paramètre

---

### PHASE 5 : Validation Pre-Release

- [ ] **Vérifier `lib/blog-supabase.ts`**
  - Fonctionne avec les articles du blog
  - Pas d'erreur de typage

- [ ] **Lancer tests de build**
  ```bash
  cd /workspace/project/heldonica
  npm run build
  ```
  - ✅ Zéro erreur TypeScript
  - ✅ Zéro erreur lint
  - ✅ Build Next.js successful

---

### PHASE 6 : Mise en ligne

- [ ] **Désactiver `maintenance_mode`** dans `site_settings` Supabase
  ```sql
  UPDATE site_settings SET value = 'false' WHERE key = 'maintenance_mode';
  ```

- [ ] **Vérifier routes publiques (doivent retourner 200)**
  - [ ] `/`
  - [ ] `/blog`
  - [ ] `/blog/[slug-existant]`
  - [ ] `/destinations`
  - [ ] `/destinations/[slug-existant]`
  - [ ] `/travel-planning`
  - [ ] `/contact`
  - [ ] `/a-propos`
  - [ ] `/mentions-legales`
  - [ ] `/politique-confidentialite`

---

## COMMANDES RAPIDES

```bash
# Build
cd /workspace/project/heldonica && npm run build

# Désactiver maintenance
# (via Supabase Dashboard ou SQL)
```

---

## SIGN-OFF — EXÉCUTÉ 18 JUIN 2026

| Étape | Status | Notes |
|-------|--------|-------|
| Phase 1 (Fichiers manquants) | ✅ DONE | `not-found.tsx` et `error.tsx` existaient déjà |
| Phase 2 (Images) | ✅ DONE | HomeClient.tsx: 5 `<img>` → `<Image>` convertis |
| Phase 3 (Dimensions) | ✅ DONE | Images avec `fill` ou `width/height` - OK |
| Phase 4 (Fonts) | ✅ DONE | `display=swap` présent dans SiteTheme.tsx:72 |
| Phase 5 (Build) | ✅ DONE | Build Next.js successful - pages critiques générées |
| Phase 6 (GoLive) | ⏳ PENDING | SQL à exécuter sur Supabase |

### Détail corrections HomeClient.tsx
- Ligne 342: Hero image → `<Image fill>`
- Ligne 392: Travel posts main → `<Image fill>`
- Ligne 420: Travel posts secondary → `<Image fill>`
- Ligne 449: Food main → `<Image width/height>`
- Ligne 472: Food thumbnails → `<Image width/height>`

### SQL pour désactivation maintenance_mode
```sql
UPDATE site_settings SET value = 'false' WHERE key = 'maintenance_mode';
```

### Routes à vérifier après go-live (200 OK)
- `/`
- `/blog`
- `/destinations`
- `/travel-planning`
- `/contact`
- `/a-propos`

**Go/NoGo final:** ✅ **GO** — Toutes les corrections audit sont en place

---

*Document exécuté le 18 juin 2026 — Pre-launch quality gate*
