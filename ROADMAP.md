# 🗺️ Roadmap Heldonica - 2026

## Cap Final
**100% B2C** - Marque éditoriale avec un seul tunnel : inspiration → conversion Travel Planning

## Arborescence Cible

| Page | Statut |
|------|--------|
| Accueil | ✅ Refait |
| Carnets de voyage (blog) | ✅ Fonctionnel |
| Destinations | 🟡 À renforcer |
| Travel Planning | ✅ Refait |
| Travel Planning Form | ✅ Fonctionnel |
| Page /merci | ✅ Créée |
| À propos / Notre histoire | 🟡 À incarner |
| Contact | ✅ OK |

### ❌ À RETIRER (toujours en attente)
- Expert hôtelier / Hotel Consulting
- Revenue management
- SEO local hôtel
- Demande d'audit B2B
- Études de cas B2B

---

## Sprint 1 : Recentrage B2C
**Objectif** : Site lisible, crédible, cohérent autour d'une seule promesse
**Statut : ✅ COMPLÉTÉ (08/06/2026)**

### Livrables
- [x] Navigation recentrée : Accueil, Carnets, Destinations, Travel Planning, À propos, Contact
- [x] Masquer/retirer entrées B2B du menu
- [x] Bug blog 0 articles corrigé (commit 1e6bfe3)
- [x] Compteurs homepage corrigés — 12 pays, 25 carnets (commit c9598a5)
- [x] Section "Inspirations gourmandes" renommée "Pépites dénichées" (commit c9598a5)
- [x] 43 articles sync Supabase cms_blog_posts → articles + trigger auto
- [x] Master plan PROMPT_ALLHANDS mis à jour avec audit prod

### Reste à faire (Sprint 1 bis)
- [ ] Page À propos incarnation duo (pas de doublons)
- [ ] Supprimer pages parasites B2B (hotel-consulting, etudes-de-cas, ai-hotellerie)
- [ ] Fallbacks image sur cartes blog

---

## Sprint 2 : Tunnel Conversion
**Objectif** : Vrai tunnel B2C
**Statut : ✅ COMPLÉTÉ (08/06/2026)**

### Livrables
- [x] Page Travel Planning refaite : pour qui, comment, ce que tu reçois, FAQ (commit précédent)
- [x] Typos travel-planning corrigées (commit 3a2fe64)
- [x] Route API /api/travel-planning : Supabase + Brevo + emails (commit 3a2fe64)
- [x] Page /merci créée : héro, étapes, upsell blog, réassurance (commit 2d7e046)
- [x] Email confirmation client : personnalisé, récap voyage, ton humain (commit 2d7e046)
- [x] Email notification interne : tous champs formulaire (commit 2d7e046)
- [x] Templates rapides CMS onglet Agents (5 templates + copier + historique)
- [x] Honeypot anti-spam sur formulaire
- [x] GA4 event formulaire_travel_soumis
- [ ] Capture email Brevo newsletter + guide PDF + séquence bienvenue
- [ ] CTA contextuels dans articles (CtaTravelPlanning.tsx à intégrer)

---

## Sprint 3 : Autorité Editoriale
**Objectif** : Densité de preuves terrain
**Statut : 🟡 À LANCER**

### Livrables
- [ ] Page À propos refaite : histoire du duo, valeurs, photos, incarnation
- [ ] 1-2 destinations vitrines (page pilier, guide budget, où dormir, itinéraire 7 jours)
  - Candidats : Madère (articles existants), Montenegro/Podgorica
- [ ] Blocs "Testé par Heldonica" et "Verdict Heldonica" intégrés dans les articles
  (composants créés : HeldonicaVerdict.tsx, HeldonicaFAQ.tsx — à brancher)
- [ ] Hub destinations avec filtres et maillage interne
- [ ] Lecture longue améliorée : related posts, ReadingProgress.tsx (créé), sidebar
- [ ] Métadonnées complètes, JSON-LD articles, sitemap
- [ ] Supprimer pages parasites B2B du menu et du repo

---

## Sprint 4 : Croissance
**Objectif** : Moteur de croissance
**Statut : 🔴 EN ATTENTE**

### Livrables
- [ ] Tracking : formulaires, newsletter, downloads, clics CTA
- [ ] Capture email Brevo + guide PDF "Slow Travel en couple" + séquence bienvenue
- [ ] Enrichissements : Instagram feed, quiz destination, calculateur budget voyage
- [ ] Monétisation douce : affiliations, guide premium
- [ ] Publications 70/30 (gratuit/premium)
- [ ] Performance : Core Web Vitals, images WebP, lazy loading

---

## Priorité Sprint 3 (prochaine session)
1. Page À propos incarnation duo
2. Supprimer pages parasites B2B
3. Destination vitrine Madère (page pilier)
4. Intégrer CtaTravelPlanning.tsx dans les articles existants
5. Capture email Brevo newsletter

---

*Dernière mise à jour : 08 juin 2026 — Session Perplexity*
*Sprints 1 & 2 complétés par : OpenHands + Perplexity*
*Cap stratégique : Propriétaire*
