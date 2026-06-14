# PROMPT SPRINT 2 — HELDONICA
> Version 1.0 — 14 juin 2026  
> À coller en début de session avec n'importe quel assistant IA

---

## 1. CONTEXTE DU PROJET

Tu travailles sur **heldonica.fr**, un site hybride B2C/B2B porté par un duo d'entrepreneurs :
- **B2C** : Blog Slow Travel + service de Travel Planning sur mesure (couples écoresponsables, hors sentiers battus)
- **B2B** : Consulting hôtelier indépendant (Revenue Management, SEO local, expérience client)

**Stack technique :**
- Frontend : Next.js 14 (App Router) — deployé sur Vercel
- Backend/DB : Supabase (PostgreSQL) — tables principales : `cms_blog_posts`, `articles`, `destinations`, `cms_newsletter`
- CMS maison : routes `/api/cms/*` protégées par `requireCmsAuth`
- Styles : Tailwind CSS — palette Mahogany / Eucalyptus Green / Teal / Cloud Dancer
- Analytics : GA4 + GTM + Search Console
- Email : Brevo (séquence bienvenue 3 emails)
- Sécurité : RLS Supabase activée partout, honeypot newsletter, Cloudflare CDN

**Double archétype de marque :**
- Le Sage (expert, analytique, rigoureux) + L'Explorateur (libre, authentique, sensoriel)
- Concept : "L'Expert de l'Aventure"
- Slogan : "Vivre, découvrir, partager : embarquez dans notre histoire de slow travel en couple"

**Règles de ton absolues :**
- B2C : tutoiement, narratif, sensoriel — lexique : "pépites dénichées", "joyaux cachés", "plénitude", "déconnexion"
- B2B : vouvoiement, analytique, chiffré — lexique : "RevPAR", "mix canaux", "ROI", "E-E-A-T"
- INTERDIT : "bons plans" → "pépites dénichées" / "organisation de séjour" → "conception sur mesure"
- Règle 70/30 : 70% valeur gratuite, 30% mise en avant des services payants
- Différenciation anti-IA : toujours ancrer dans le vécu terrain (nombre de visites, saison, conditions réelles)

---

## 2. ÉTAT DU SITE AU DÉBUT DU SPRINT 2

### Ce qui est en place (Sprint 1 validé)
- [x] Page Accueil V1
- [x] Page À propos + charte éditoriale
- [x] Pages légales (mentions, confidentialité, affiliés)
- [x] Formulaire Travel Planning (Tally.so 3 steps)
- [x] Formulaire Audit hôtelier (Tally.so)
- [x] Séquence email bienvenue 3 emails (Brevo)
- [x] GA4 + GTM + Search Console opérationnels
- [x] Cloudflare + Imagify (WebP) + Core Web Vitals
- [x] Axeptio RGPD
- [x] Sécurité Supabase : RLS partout, honeypot newsletter — score 9/10
- [x] Trigger `sync_to_articles()` actif (cms_blog_posts → articles)
- [x] Table `destinations` seedée avec RLS

### Ce qui n'existe pas encore
- [ ] Page destination pilier complète (Madre ou Roumanie)
- [ ] Itinéraires 5j / 7j / 10j structurés
- [ ] Page Travel Planning complète (comment ça marche + témoignages + formulaire)
- [ ] Page Expert Hôtelier V1
- [ ] Google Maps embed sur les guides
- [ ] Liens affiliés Booking.com + GetYourGuide actifs
- [ ] Instagram feed embed sur l'accueil
- [ ] `destination` / `country` / `travel_style` remplis dans la table `articles`

---

## 3. OBJECTIFS DU SPRINT 2 (mois 2-3)

### Priorité A — Destination vitrine complète

Créer la première destination pilier (Madre **ou** Roumanie) avec la structure suivante :

**Page Destination** (`/destinations/[slug]`) :
```
Hero ← H1 résumé GEO 2-4 lignes en tête (extractible IA)
Pourquoi cette destination ? ← narratif sensoriel + encadré E-E-A-T
Ce qu'on a aimé / moins aimé ← 2 listes honnêtes
Nos itinéraires slow ← vignettes cliquables 5j / 7j / 10j
Où dormir ← H3 par type (charme / nature / budget) + liens affiliés
Carte interactive ← Google Maps embed + téléchargement
Quand partir ← tableau comparatif saisonnier
Budget ← liste chiffrée par poste
FAQ ← 5-7 questions GEO-friendly (Qui/Quoi/Où/Quand)
Verdict Heldonica ← bloc signé, note, phrase mémorable
CTA final ← formulaire newsletter + lien Travel Planning
```

**Page Itinéraire** (`/destinations/[slug]/itineraire-7-jours`) :
```
Hero ← durée, budget estimé, rythme, saison idéale
Encadré "Testé par Heldonica" ← date, conditions, nombre de visites
Tableau récapitulatif J1→Jn
H3 par jour ← activités, adresses, détail sensoriel, option slow, pépite dénichée
Hébergements recommandés ← budget total estimé + liens affiliés
Carte interactive
FAQ + Verdict Heldonica
CTA ← PDF téléchargeable + formulaire Travel Planning
```

**Standards SEO/GEO sur chaque page :**
- Réponse directe 2-4 lignes en tête de chaque grande section
- Minimum 3 listes structurées par page
- FAQ 5-7 questions formulées naturellement
- Tableau si comparaison ≥ 2 éléments
- Titres H2 explicites intégrant Qui/Quoi/Où/Quand
- Schema.org : `TouristAttraction` + `FAQPage` + `Article`
- `title` : 55-60 caractères / `description` : 150-160 caractères / `og:image` : WebP 1200×630

### Priorité B — Page Travel Planning complète

URL : `/travel-planning`

Structure :
```
Hero ← promesse + sous-titre sensoriel
La promesse ← ce qu'on prend en charge (liste)
Comment ça marche ← 3 étapes visuelles
Pour qui ? ← profils de couples cibles (2-3 personas)
Témoignages ← widget Trustmary ou Senja (Sprint 3) / placeholder Sprint 2
FAQ objections ← 5 questions avec réponses directes
Formulaire ← lien Tally.so 3 steps
CTA principal ← "Demander une conception sur mesure"
```

**Ton B2C strict :** tutoiement, "on", narratif. JAMAIS "organisation de séjour".

### Priorité C — Page Expert Hôtelier V1

URL : `/expert-hotelier`

Structure :
```
Hero ← accroche chiffrée (RevPAR, OTAs, problématique)
3 offres ← Revenue Management / SEO local / Expérience client couple
Études de cas ← 2 minimum avec résultats chiffrés
Formulaire audit ← 5 champs / lien Tally.so
CTA ← "Parlons de votre établissement"
```

**Ton B2B strict :** vouvoiement, données chiffrées, structure P-A-S (Problème/Agitation/Solution).
Schema.org : `LocalBusiness`

### Priorité D — Intégrations Sprint 2

| Intégration | Fichier cible | Priorité |
|---|---|---|
| Google Maps embed | composant `ArticleMap` existant | Haute |
| Booking.com affilié | liens dans pages destination | Haute |
| GetYourGuide affilié | liens dans itinéraires | Haute |
| Instagram feed embed | page Accueil | Moyenne |
| Komoot GPX embed | pages randonnées | Moyenne |
| Awin/Effiliation | remplacement Pretty Links | Basse |

### Priorité E — Contenu `articles` table

Remplir les colonnes créées aujourd'hui sur les articles existants :
```sql
UPDATE articles SET
  destination = 'madere',  -- ou 'roumanie'
  country = 'Portugal',    -- ou 'Roumanie'
  travel_style = 'slow-nature'  -- slow-nature / slow-culture / road-trip
WHERE slug = 'ton-article-slug';
```

---

## 4. STANDARDS TECHNIQUES À RESPECTER

### Composants récurrents à utiliser
- `NewsletterForm` — variantes `blog` / `article` / `inline` (honeypot inclus)
- `ArticleMap` — tables `article_map_routes`, `article_map_pois`, `article_map_route_points`
- Blocs récurrents : `Pépite dénichée` / `Testé par Heldonica` / `Verdict Heldonica` / `La prochaine étape pour toi`
- UX lecture : sidebar sticky ToC + barre de progression + boutons partage Pinterest

### Règles Supabase
- Toutes les lectures publiques passent par la table `articles` (pas `cms_blog_posts`)
- Toutes les écritures CMS passent par `cms_blog_posts` → trigger `sync_to_articles()` actif
- Ne jamais exposer la `service_role` key côté client
- Toute nouvelle table créée → activer RLS immédiatement

### Performance
- Images : WebP uniquement, lazy loading systématique
- Cible : LCP < 2.5s, CLS < 0.1 sur mobile
- Pas d'iframe sans `loading="lazy"`

### GA4 Events à tracker sur les nouvelles pages
```
formulaire_travel_soumis   ← conversion principale B2C
guide_pdf_telecharge        ← micro-conversion
cta_travel_planning_clique  ← intention d'achat
carte_interactive_utilisee  ← engagement
faq_ouverte                 ← engagement
article_lu (scroll 75%)     ← engagement contenu
```

---

## 5. KPIs SPRINT 2 (objectifs à atteindre avant Sprint 3)

| Indicateur | Objectif |
|---|---|
| Sessions organiques | +300% vs démarrage |
| Formulaires Travel Planning | 5-10/mois (Q4) |
| Inscriptions newsletter | 500 contacts (Q3) |
| Taux complétion formulaire | ≥ 60% |
| Clics affiliés | 200/mois (Q4) |
| Formulaires audit B2B | 2-3/mois (Q4) |
| Articles E-E-A-T complets | +10 nouveaux |
| Core Web Vitals | Vert sur toutes pages pilier |

---

## 6. CE QU'IL NE FAUT PAS FAIRE

- ❌ Créer une nouvelle table Supabase sans RLS
- ❌ Écrire dans `articles` directement depuis le CMS (passer par `cms_blog_posts`)
- ❌ Utiliser le mot "bons plans" ou "organisation de séjour"
- ❌ Contenu générique sans ancrage terrain (date, conditions, ressenti réel)
- ❌ Images stock photo ou visages identifiables
- ❌ Routes CMS sans `requireCmsAuth`
- ❌ Exposer les clés API avec préfixe `NEXT_PUBLIC_`
- ❌ Supprimer `cms_blog_posts` (source d'écriture du CMS)

---

*Document généré le 14 juin 2026 — base : brief_complet_heldonica.md + état réel du codebase*
