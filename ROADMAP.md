# 🗺️ Roadmap Heldonica - 2026

## Cap Final
**100% B2C** - Marque éditoriale avec un seul tunnel : inspiration → conversion Travel Planning

## Arborescence Cible

| Page | Statut |
|------|--------|
| Accueil | ✅ Refait |
| Carnets de voyage (blog) | ✅ Fonctionnel (43 articles) |
| Destinations | 🟡 À renforcer |
| Travel Planning | ✅ Refait |
| Travel Planning Form | ✅ Fonctionnel |
| Page /merci | ✅ Créée |
| À propos / Notre histoire | ✅ Incarnation duo |
| Contact | ✅ OK |

---

## Sprint 1 : Recentrage B2C
**Statut : ✅ COMPLÉTÉ (08/06/2026)**

- [x] Navigation recentrée B2C
- [x] Bug blog 0 articles corrigé (1e6bfe3)
- [x] Compteurs homepage corrigés — 12 pays, 25 carnets (c9598a5)
- [x] "Pépites dénichées" remplace "Inspirations gourmandes" (c9598a5)
- [x] 43 articles sync Supabase + trigger auto
- [x] PROMPT_ALLHANDS master plan mis à jour

---

## Sprint 2 : Tunnel Conversion
**Statut : ✅ COMPLÉTÉ (08/06/2026)**

- [x] Page Travel Planning refaite avec FAQ, livrables, processus
- [x] Typos corrigées travel-planning (3a2fe64)
- [x] Route API /api/travel-planning : Supabase + Brevo + emails (3a2fe64)
- [x] Page /merci créée : héro, étapes, upsell blog, réassurance (2d7e046)
- [x] Email confirmation client personnalisé avec récap voyage (2d7e046)
- [x] Email notification interne tous champs (2d7e046)
- [x] 5 templates rapides CMS onglet Agents + copier + historique (2d7e046)
- [x] Honeypot anti-spam + GA4 event formulaire_travel_soumis
- [ ] Capture email Brevo newsletter + guide PDF + séquence bienvenue
- [ ] CTA contextuels dans articles — CtaTravelPlanning.tsx à optimiser

---

## Sprint 3 : Autorité Éditoriale
**Statut : ✅ COMPLÉTÉ (08/06/2026)**

- [x] Page /a-propos réécrite : duo Hélder + Elena, histoire, 3 piliers,
      2 colonnes Blog/Travel, blockquote, JSON-LD Person (8ff9033)
- [x] Pages B2B (hotel-consulting, etudes-de-cas, ai-hotellerie)
      n'existaient pas dans le repo — vérifié
- [x] CtaTravelPlanning.tsx branché dans articles :
      affiché uniquement catégories "Carnets Voyage" + "Découvertes Locales" (8ff9033)
- [x] ReadingProgress.tsx déjà présent dans blog/[slug]/page.tsx
- [x] HeldonicaVerdict.tsx + HeldonicaFAQ.tsx créés (sprint précédent)
- [x] JSON-LD ArticleJsonLd + BreadcrumbJsonLd + FAQJsonLd
- [x] Sitemap priorités ajustées, robots.txt mis à jour

### Reste Sprint 3 (à lancer)
- [ ] Destination vitrine Madère : page pilier + guide budget + où dormir
- [ ] Hub destinations avec filtres et maillage interne
- [ ] Intégrer faq_content JSONB dans les articles existants

---

## Sprint 4 : Croissance
**Statut : 🔴 EN ATTENTE**

- [ ] Capture email Brevo newsletter + guide PDF "Slow Travel en couple"
- [ ] Séquence email bienvenue (3 emails Brevo)
- [ ] Tracking avancé : clics CTA, downloads, scroll depth
- [ ] Instagram feed embed homepage
- [ ] Quiz destination interactif
- [ ] Calculateur budget voyage
- [ ] Monétisation douce : affiliations, guide premium
- [ ] Performance : Core Web Vitals, images WebP, lazy loading

---

## Priorité prochaine session (Sprint 3 bis + Sprint 4)
1. 🇯🇵 **Destination vitrine Madère** — page pilier SEO
2. 📧 **Capture Brevo newsletter** — formulaire homepage fonctionnel
3. 🏗️ **Hub /destinations** — filtres, maillage, cards destinations
4. 📸 **Feed Instagram** — preuve sociale homepage
5. 📊 **Tracking avancé** — clics CTA Travel Planning mesurés

---

## Résumé commits du 08/06/2026
| Commit | Mission |
|--------|---------|
| a805e69 | PROMPT_ALLHANDS master plan |
| 1e6bfe3 | Fix blog 0 articles |
| c9598a5 | Compteurs homepage + Pépites dénichées |
| 3a2fe64 | Typos travel-planning + API emails |
| 2d7e046 | Page /merci + emails + templates CMS |
| 8ff9033 | Page /a-propos + CtaTravelPlanning |
| 738a082 | ROADMAP Sprint 1+2 |

---

*Dernière mise à jour : 08 juin 2026 — Session Perplexity*
*Sprints 1, 2 & 3 complétés par : OpenHands + Perplexity*
*Cap stratégique : Propriétaire*
