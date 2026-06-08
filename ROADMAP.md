# 🗺️ Roadmap Heldonica - 2026

## Cap Final
**100% B2C** - Marque éditoriale avec un seul tunnel : inspiration → conversion Travel Planning

## Arborescence Cible

| Page | Statut |
|------|--------|
| Accueil | ✅ Refait |
| Carnets de voyage (blog) | ✅ Fonctionnel (43 articles) |
| /destinations | ✅ Hub + DestinationsClient.tsx |
| /destinations/madere | ✅ Page pilier 403 lignes, JSON-LD |
| Travel Planning | ✅ Refait |
| Travel Planning Form | ✅ Fonctionnel |
| Page /merci | ✅ Créée |
| À propos / Notre histoire | ✅ Incarnation duo Hélder + Elena |
| Contact | ✅ OK |
| Newsletter capture | ✅ Brevo + Resend bienvenue |

---

## Sprint 1 : Recentrage B2C
**Statut : ✅ COMPLÉTÉ (08/06/2026)**

- [x] Navigation recentrée B2C
- [x] Bug blog 0 articles corrigé (1e6bfe3)
- [x] Compteurs homepage corrigés — 12 pays, 25 carnets (c9598a5)
- [x] "Pépites dénichées" remplace "Inspirations gourmandes" (c9598a5)
- [x] 43 articles sync Supabase + trigger auto

---

## Sprint 2 : Tunnel Conversion
**Statut : ✅ COMPLÉTÉ (08/06/2026)**

- [x] Page Travel Planning refaite avec FAQ, livrables, processus
- [x] Route API /api/travel-planning : Supabase + Brevo + emails (3a2fe64)
- [x] Page /merci : héro, étapes, upsell blog, réassurance (2d7e046)
- [x] Email confirmation client + notification interne (2d7e046)
- [x] 5 templates CMS Agents + copier + historique (2d7e046)
- [x] Honeypot anti-spam + GA4 event formulaire_travel_soumis
- [x] Newsletter capture Brevo (liste [2]) + email bienvenue Resend
- [x] NewsletterForm.tsx 3 variantes branché homepage

---

## Sprint 3 : Autorité Éditoriale
**Statut : ✅ COMPLÉTÉ (08/06/2026)**

- [x] Page /a-propos : duo Hélder + Elena, 3 piliers, JSON-LD Person (8ff9033)
- [x] CtaTravelPlanning dans articles Carnets + Découvertes (8ff9033)
- [x] ReadingProgress dans blog/[slug]/page.tsx
- [x] HeldonicaVerdict + HeldonicaFAQ créés
- [x] JSON-LD ArticleJsonLd + BreadcrumbJsonLd + FAQJsonLd
- [x] Sitemap priorités + robots.txt
- [x] /destinations/madere : 403 lignes, JSON-LD TouristDestination + FAQPage,
      toutes sections (Hero, E-E-A-T, Infos, Pépites, Hébergement, Transport, CTA)
- [x] Card Madère dans DestinationsClient.tsx + hub /destinations

---

## Sprint 4 : Croissance
**Statut : 🟡 PROCHAIN**

### Livrables prioritaires
- [ ] **Séquence email Brevo** — 3 emails post-inscription newsletter :
        Email 1 (J+0) : bienvenue + lien meilleur article
        Email 2 (J+3) : "Notre philosophie slow travel" + lien /a-propos
        Email 3 (J+7) : offre Travel Planning douce + témoignage
- [ ] **Guide PDF** "Slow Travel en couple : nos 10 règles" —
        créé dans le CMS et envoyé automatiquement à l'inscription
- [ ] **Feed Instagram** embed homepage — preuve sociale
- [ ] **Tracking avancé** : scroll depth articles, clics CTA Travel Planning,
        downloads guide PDF (GA4 events)
- [ ] **Quiz destination** interactif (3 questions → suggestion Madère/Portugal/etc.)
- [ ] **Calculateur budget** voyage (durée × style → fourchette)
- [ ] **Performance** : Core Web Vitals, images WebP, lazy loading
- [ ] **Destinations à ajouter** : Portugal (Alentejo), Balkans (Montenégro),
        Italie (Sicile/Sardaigne)
- [ ] **Monétisation** douce : affiliations (Booking, GetYourGuide), guide premium

---

## Résumé commits 08/06/2026
| Commit | Mission |
|--------|---------|
| a805e69 | PROMPT_ALLHANDS master plan |
| 1e6bfe3 | Fix blog 0 articles |
| c9598a5 | Compteurs homepage + Pépites dénichées |
| 3a2fe64 | Typos travel-planning + API emails |
| 2d7e046 | /merci + emails + templates CMS |
| 8ff9033 | /a-propos + CtaTravelPlanning |
| 738a082 | ROADMAP Sprint 1+2 |
| d3012a5 | ROADMAP Sprint 3 |

---

*Dernière mise à jour : 08 juin 2026 — Session Perplexity*
*Sprints 1, 2, 3 + audit 3bis complétés par : OpenHands + Perplexity*
*Cap stratégique : Propriétaire*
