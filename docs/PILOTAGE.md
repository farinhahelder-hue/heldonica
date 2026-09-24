# 📊 Tableau de Pilotage — Heldonica.fr

**Version** : 1.0  
**Date** : 14 juillet 2026  
**Objectif** : Suivre les KPIs de conversion B2C

---

## 🎯 KPIs Principaux

### Pages Piliers

| Destination | URL | Statut | Priorité |
|-------------|-----|--------|----------|
| Madère | `/destinations/madere` | ✅ Live | Haute |
| Monténégro | `/destinations/montenegro` | ✅ Live | Haute |
| Roumanie | `/destinations/roumanie` | ✅ Live | Haute |

### Conversions à Suivre

| Type | Event GA4 | Tunnel | Fréquence |
|------|-----------|--------|-----------|
| **PDF Download** | `guidepdftelecharge` | Email → PDF | Chaque téléchargement |
| **CTA Travel Click** | `cta_travel_planning_click` | Page Pilier → Formulaire | Chaque clic |
| **Formulaire Soumis** | `formulaire_travel_soumis` | Formulaire → Demande | Chaque soumission |

---

## 📈 Tableau de Bord Google Analytics 4

### Vues à Créer

1. **Vue "Piliers Destinations"**
   - Filtre : Page contient `/destinations/madere` OU `/destinations/montenegro` OU `/destinations/roumanie`

2. **Vue "Conversions PDF"**
   - Event : `guidepdftelecharge`
   - Dimensions : `destination`, `guide_name`

3. **Vue "Conversions Travel"**
   - Event : `formulaire_travel_soumis`
   - Dimensions : `destination`, `event_category`

### Funnels à Configurer

#### Funnel PDF
```
Page Pilier
    ↓
LeadMagnetBlock visible
    ↓
Clic "Je veux le guide"
    ↓
formulaire_travel_soumis = guidepdftelecharge (ratio target: >30%)
```

#### Funnel Travel Planning
```
Page Pilier (Hero CTA)
    ↓
Clic "Demander mon voyage sur mesure"
    ↓
Page /travel-planning-form
    ↓
formulaire_travel_soumis (ratio target: >20%)
```

---

## 📋 Checklist Lancement

### Technique
- [ ] Build Vercel = Ready
- [ ] Variables d'environnement configurées (Supabase, Brevo, GA4)
- [ ] Route `/api/guides/download` fonctionnelle
- [ ] Route `/api/brevo/subscribe` fonctionnelle
- [ ] Schemas JSON-LD validés

### Contenu
- [ ] Pages piliers : Madère, Monténégro, Roumanie publiées
- [ ] Ton Heldonica uniforme
- [ ] Images hero fonctionnelles
- [ ] E-E-A-T visible (testé par Heldonica, highlights, verdict)

### Conversion
- [ ] Tunnel PDF : Email → Supabase `guide_downloads` → PDF ✅ (PR #421)
- [ ] Tunnel Travel Planning : CTA → Formulaire → Tracking ✅
- [ ] Événements GA4 configurés et testés

---

## 🔄 Cadence de Production

| Fréquence | Action |
|-----------|--------|
| **Hebdomadaire** | 1 PR courte (< 500 lignes) |
| **Avant merge** | Build + Vercel vérifiés |
| **Après merge** | Test rapide sur `/destinations/madere` |
| **Mensuel** | Audit cohérence : contenu, technique, UX |

---

## 📁 PRs du Lancement

| PR | Titre | Statut | Merge |
|----|-------|--------|-------|
| #419 | fix(destinations): add missing LeadMagnetBlock, fix typos | ✅ Mergée | 13/07/2026 |
| #421 | fix(lead-magnet): add email capture form to LeadMagnetBlock | 🔄 En review | — |
| #422 | fix(images): replace broken Unsplash hero images | 🔄 En review | — |

---

## ⚠️ Points de Vigilance

1. **Images Unsplash** : Vérifier régulièrement que les URLs sont accessibles
2. **Supabase** : Vérifier que la table `guide_downloads` existe et a les bonnes colonnes
3. **Brevo** : Vérifier que les tags sont créés (`guide-madere`, etc.)
4. **GA4** : Vérifier que les événements sont captés dans le tableau de bord

---

## 📝 Notes

- Les events GA4 utilisent des underscores (`cta_travel_planning_click`) pour la compatibilité standard
- Le tunnel PDF capture l'email AVANT de générer le PDF
- La conversion principale reste Travel Planning, le PDF est une micro-conversion

---

*Document vivant — Mettre à jour après chaque phase validée.*
