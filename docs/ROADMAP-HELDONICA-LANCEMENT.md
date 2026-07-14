# 🚀 Roadmap Opérationnelle — Lancement Heldonica.fr

**Version** : 1.0  
**Date** : 14 juillet 2026  
**Statut** : En cours  
**Scope** : Lancement B2C — Madère, Monténégro, Roumanie + socle technique + conversion

---

## 📐 Principes Directeurs

| Principe | Application |
|----------|-------------|
| **Ordre strict** | Socle → Contenu → UX → SEO → Conversion |
| **PR courte** | 1 objectif = 1 PR = 1 merge vérifié |
| **Pas de sprawl** | Chaque PR < 500 lignes modifiées |
| **Critère done** | Build vert + Vercel vert + check prod |
| **Ton Heldonica** | Tutoiement, "on", terrain, authenticité |

---

## 🗓️ Phases de Travail

---

### Phase 1 : SOCLE TECHNIQUE
**Semaines estimées** : S1–S2  
**Objectif** : Site stable, traçable, publiable sans dette

#### S1 — Vérification Build & Déploiement

| # | Tâche | Fichier(s) | Critère Done | PR | Statut |
|---|-------|------------|--------------|-----|--------|
| 1.1 | Vérifier que main build proprement | — | `npm run build` = 0 erreurs | — | ✅ |
| 1.2 | Confirmer Vercel vert sur PR #419 | — | Dashboard Vercel = Ready | — | ✅ |
| 1.3 | Lister variables d'environnement critiques | `.env.example` | Toutes documentées | — | ✅ |

**Livrable S1** : Rapport d'état build/déploiement ✅

#### S2 — Audit Variables & Structure

| # | Tâche | Fichier(s) | Critère Done | PR | Statut |
|---|-------|------------|--------------|-----|--------|
| 2.1 | Vérifier `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` | `lib/supabase.ts` | Connexion OK si présent | — | ✅ |
| 2.2 | Vérifier `BREVO_API_KEY` | `lib/brevo.ts` | Ping API OK si présent | — | ✅ |
| 2.3 | Vérifier `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `app/layout.tsx` | gtag présent si configuré | — | ✅ |
| 2.4 | Vérifier `/api/guides/download` route | `app/api/guides/download/route.ts` | Route POST avec email | — | ⚠️ **BUG** |
| 2.5 | Vérifier `/api/brevo/subscribe` route | `app/api/brevo/subscribe/route.ts` | Route existe | — | ✅ |
| 2.6 | Geler structure composants référence | `components/` | Pas de variante non maîtrisée | — | ✅ |

**Livrable S2** : Checklist variables + structure figée

#### 🐛 Bug Critique Détecté (S2) — PR #421

| Élément | État | Problème |
|---------|------|----------|
| Route `/api/guides/download` | POST uniquement | Attend `{ destinationSlug, email }` |
| CTA `LeadMagnetBlock` | Lien GET `<a>` | Envoie `?destination=...` en GET |

**Solution** : Refactor du CTA en formulaire POST avec capture email.

**PR** : https://github.com/farinhahelder-hue/heldonica/pull/421

#### Critère "Phase 1 Done"
- [x] Build local = 0 erreur (148 pages)
- [x] Vercel = Ready sur main (PR #419 mergée)
- [x] Toutes variables documentées (.env.example)
- [x] Structure composants validée
- [x] Bug tunnel PDF corrigé (PR #421 en review)

---

### Phase 2 : PAGES PILIERS
**Semaines estimées** : S2–S4  
**Objectif** : Madère, Monténégro, Roumanie irréprochables

#### S2 — Relecture Madère

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 3.1 | Relecture hero + heroSubtitle | `lib/pillar-data.ts` | Ton Heldonica, pas de formule IA | PR #422 |
| 3.2 | Relecture intro + testedByHeldonica | `lib/pillar-data.ts` | Vécu terrain, E-E-A-T | — |
| 3.3 | Relecture itinerary jour par jour | `lib/pillar-data.ts` | Tips concrets, pas de généricité | — |
| 3.4 | Relecture FAQ | `lib/pillar-data.ts` | Réponses directes, 2-3 lignes | — |
| 3.5 | Relecture verdict | `lib/pillar-data.ts` | Score justifié, considérations honnêtes | — |
| 3.6 | Vérifier LeadMagnetBlock | `components/LeadMagnetBlock.tsx` | PDF = micro-conversion, non agressive | — |
| 3.7 | Vérifier DestinationPillar CTA | `components/DestinationPillar.tsx` | Travel Planning = conversion principale | — |

**Livrable S2** : Page Madère validée, prête pour audit UX

#### S3 — Monténégro & Roumanie

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 4.1 | Relecture Monténégro complète | `lib/pillar-data.ts` | Ton Heldonica, données cohérentes | PR #423 |
| 4.2 | Relecture Roumanie complète | `lib/pillar-data.ts` | Ton Heldonica, données cohérentes | — |
| 4.3 | Uniformiser highlights entre 3 destinations | `lib/pillar-data.ts` | Format identique (action + lieu + heure si pertinent) | — |
| 4.4 | Uniformiser verdict pour 3 destinations | `lib/pillar-data.ts` | Score justifié, strengths/considerations équilibrés | — |

**Livrable S3** : 3 pages piliers validées

#### S4 — Cohérence & Contrôle

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 5.1 | Checklist E-E-A-T sur 3 pages | `lib/pillar-data.ts` | Chaque page = preuve terrain visible | PR #424 |
| 5.2 | Vérifier hiérarchie conversion | — | PDF après verdict, Travel Planning après tout | — |
| 5.3 | Audit final ton Heldonica | — | Tutoiement, "on", 0 formule IA | — |

**Livrable S4** : Pages piliers prêtes pour audit UX

#### Critère "Phase 2 Done"
- [ ] Madère relue et validée
- [ ] Monténégro relu et validé
- [ ] Roumanie relue et validée
- [ ] Ton Heldonica uniforme sur 3 pages
- [ ] Hiérarchie conversion respectée

---

### Phase 3 : UX ET IMAGES
**Semaines estimées** : S4–S5  
**Objectif** : Lisibilité, respiration, crédibilité visuelle premium

#### S4–S5 — Audit Images

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 6.1 | Audit hero Madère | `lib/pillar-data.ts` (hero URL) | Image faceless, lumière naturelle | PR #425 |
| 6.2 | Audit hero Monténégro | `lib/pillar-data.ts` (hero URL) | Image faceless, lumière naturelle | — |
| 6.3 | Audit hero Roumanie | `lib/pillar-data.ts` (hero URL) | Image faceless, lumière naturelle | — |
| 6.4 | Vérifier cohérence Unsplash | `lib/pillar-data.ts` | 1 image par destination, qualité premium | — |

**Livrable S5** : Catalogue images validées

#### S5 — Audit Mobile & Composants

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 7.1 | Test mobile /destinations/madere | — | Pas d'empilement brutal, CTA visible | PR #426 |
| 7.2 | Vérifier espacement sections | `components/DestinationPillar.tsx` | `py-16` minimum entre blocs | — |
| 7.3 | Vérifier CTA placement | `components/DestinationPillar.tsx` | CTA toujours au-dessus pli si possible | — |
| 7.4 | Harmoniser composants récurrents | `components/` | Badges, cartes, FAQ cohérents | — |

**Livrable S5** : UX mobile validée

#### Critère "Phase 3 Done"
- [ ] Images hero = faceless, premium
- [ ] Mobile = lisible, respiration correcte
- [ ] Composants harmonisés
- [ ] CTA bien placés

---

### Phase 4 : GEO ET SEO
**Semaines estimées** : S5–S6  
**Objectif** : Citabilité par Google, Perplexity, ChatGPT, AI Overviews

#### S5–S6 — Amélioration GEO

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 8.1 | Ajouter 2-4 lignes intro directes par section | `lib/pillar-data.ts` | Réponse directe avant liste | PR #427 |
| 8.2 | Ajouter 3+ listes structurées par page | `lib/pillar-data.ts` | `highlights`, `strengths`, `considerations` | — |
| 8.3 | Ajouter tableau budget/saison si pertinent | `lib/pillar-data.ts` | Tableau au lieu de paragraphe si comparaison | — |
| 8.4 | Renforcer H2 avec Qui/Quoi/Où/Quand | `components/DestinationPillar.tsx` | H2 = question utilisateur, pas titre marketing | — |

**Livrable S6** : Pages optimisées GEO

#### S6 — Validation Schema & Structure

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 9.1 | Vérifier FAQPage JSON-LD | `app/destinations/[slug]/page.tsx` | Schema présent et valide | PR #428 |
| 9.2 | Vérifier TouristAttraction JSON-LD | `app/destinations/[slug]/page.tsx` | Schema présent si pertinent | — |
| 9.3 | Audit crawlability | — | Pas de noindex accidentel | — |
| 9.4 | Vérifier canonical URLs | `app/destinations/[slug]/page.tsx` | Canonical = URL propre | — |

**Livrable S6** : SEO technique validée

#### Critère "Phase 4 Done"
- [ ] Réponses directes en début de section
- [ ] 3+ listes structurées par page
- [ ] H2 = questions utilisateurs
- [ ] FAQPage JSON-LD valide
- [ ] TouristAttraction JSON-LD si pertinent
- [ ] Canonical URLs correctes

---

### Phase 5 : CONVERSION ET PILOTAGE
**Semaines estimées** : S6–S7  
**Objectif** : Formulaires, PDF, Brevo, analytics = histoire exploitable

#### S6–S7 — Tunnel PDF

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 10.1 | Vérifier clic → `/api/guides/download` | `components/LeadMagnetBlock.tsx` | Lien pointant vers `/api/guides/download` | PR #429 |
| 10.2 | Vérifier capture email | `app/api/guides/download/route.ts` | Formulaire ou redirection Brevo | — |
| 10.3 | Vérifier insertion `guide_downloads` | `app/api/guides/download/route.ts` | INSERT Supabase si configuré | — |
| 10.4 | Vérifier tag Brevo | `app/api/guides/download/route.ts` | Tag `guide-madere` appliqué | — |
| 10.5 | Vérifier événement `guidepdftelecharge` | `components/LeadMagnetBlock.tsx` | gtag event déclenché | — |

**Livrable S7** : Tunnel PDF documenté

#### S7 — Tunnel Travel Planning

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 11.1 | Vérifier clarté promesse formulaire | `app/travel-planning/page.tsx` | Titre = problème client, pas "Contactez-nous" | PR #430 |
| 11.2 | Vérifier progression formulaire | `app/travel-planning/page.tsx` | Multi-step ou étapes claires | — |
| 11.3 | Vérifier `formulairetravelsoumis` event | — | gtag event sur submit | — |
| 11.4 | Vérifier `ctatravelplanningclique` event | — | gtag event sur CTA cliqué | — |

**Livrable S7** : Tunnel Travel Planning documenté

#### S7 — Tableau de Pilotage

| # | Tâche | Fichier(s) | Critère Done | PR |
|---|-------|------------|--------------|-----|
| 12.1 | Créer dashboard analytics simple | `docs/PILOTAGE.md` | Pages piliers, PDF, Travel Planning | — |
| 12.2 | Documenter KPIs à suivre | `docs/PILOTAGE.md` | Téléchargements, soumissions, bounces | — |
| 12.3 | Définir cadence de production | `docs/PILOTAGE.md` | 1 PR courte / semaine max | — |

**Livrable S7** : Roadmap production établie

#### Critère "Phase 5 Done"
- [ ] Tunnel PDF fonctionnel (clic → email → guide)
- [ ] Tag Brevo appliqué
- [ ] Événement GA `guidepdftelecharge` présent
- [ ] Tunnel Travel Planning clair
- [ ] Événements GA Travel Planning présents
- [ ] Tableau de pilotage documenté

---

## 📊 Résumé des Livrables

| Phase | Semaines | Livrables | PRs |
|-------|----------|-----------|-----|
| 1. Socle technique | S1–S2 | État build, checklist variables | 0 (audit) |
| 2. Pages piliers | S2–S4 | 3 pages validées, ton uniforme | #422, #423, #424 |
| 3. UX et images | S4–S5 | Images premium, mobile OK | #425, #426 |
| 4. GEO et SEO | S5–S6 | Pages citables, schema valide | #427, #428 |
| 5. Conversion | S6–S7 | Tunnels documentés, pilotage | #429, #430 |

---

## ✅ Critères Globaux "Lancement Done"

- [ ] Build = 0 erreur
- [ ] Vercel = Ready sur main
- [ ] Madère, Monténégro, Roumanie = pages piliers validées
- [ ] Ton Heldonica uniforme sur 3 pages
- [ ] Hiérarchie conversion : PDF < Travel Planning
- [ ] Images = faceless, premium
- [ ] Mobile = lisible
- [ ] FAQPage JSON-LD = valide
- [ ] Tunnel PDF = fonctionnel
- [ ] Tunnel Travel Planning = fonctionnel
- [ ] Analytics = événement sur chaque CTA
- [ ] Tableau de pilotage = documenté

---

## 🔄 Cadence de Production

| Fréquence | Action |
|-----------|--------|
| Hebdomadaire | 1 PR courte (< 500 lignes) |
| Avant merge | Build + Vercel vérifiés |
| Après merge | Test prod rapide sur `/destinations/madere` |
| Mensuel | Audit cohérence éditoriale + technique |

---

*Document vivant — Mettre à jour après chaque phase validée.*
