# Audit du contenu éditorial codé en dur — app/ et components/

## 1. Portée, méthode et contexte

Cet audit scanne les **274 fichiers `.tsx`** sous `app/` et `components/` à la recherche de contenu éditorial encore codé en dur (texte visible, tableaux/objets statiques qui pilotent une liste, une grille ou un accordéon).

**Ce projet n'est pas un chantier CMS qui démarre de zéro.** Au moment de cet audit :
- **2429 zones** existent déjà dans `cms_editable_zones`.
- **48 fichiers sur 274** utilisent déjà `<EditableZone>` — souvent de façon quasi exhaustive sur toute la page.
- Deux mécanismes CMS coexistent : le pattern `<EditableZone page="..." zone="...">` (le plus répandu, avec badge visuel CMS/Fallback en mode édition), et un mécanisme parallèle plus léger `getCmsOrSetting()` / `getZoneLinks()` / une fonction locale `val()`/`cz()` (utilisé par `Header.tsx`, `Footer.tsx`, `ContactForm.tsx`, `NewsletterForm.tsx`, `CtaTravelPlanning.tsx`, `Breadcrumb.tsx`, `InstagramFeed.tsx`…) qui lit `cms_editable_zones` + `site_settings` avec fallback JS, sans passer par le composant `EditableZone`.
- `scripts/check-cms-zones.mjs` / `check-cms-drift.mjs` gardent ces deux mécanismes synchronisés avec la base — toute zone déclarée dans le code mais jamais servie (ou l'inverse) casse la CI.

**Méthode** : chaque répertoire a été parcouru systématiquement (`app/` par sous-dossier, puis `components/`). Pour les fichiers déjà dans la liste des 48 migrés, seul ce qui reste réellement en dur est signalé — le contenu déjà câblé n'est pas re-listé. Pour les templates partagés par plusieurs pages (ex. `SubDestinationTemplate.tsx`, `DestinationPillar.tsx`, `[slug]/DestinationPage.tsx`), une lacune n'est décrite **qu'une fois**, avec la liste des pages affectées, plutôt que dupliquée par page.

**Principe de regroupement des lignes** : pour rester lisible, une ligne du tableau correspond à une **unité de contenu distincte** (un titre, un paragraphe, un CTA, un bloc de labels). Les répétitions strictement identiques d'un même motif (ex. "Voir le guide →" répété sur 4 cartes dans un même fichier) sont regroupées en une seule ligne avec mention du nombre d'occurrences, plutôt que dupliquées.

**Hors périmètre volontaire** : les 274 fichiers incluent l'interface d'administration du CMS elle-même (`app/admin/**`, `app/panel-manager/**`, `components/admin/**`, `components/cms/**` — 77 fichiers, ~6800 lignes). Ce sont les outils que l'équipe utilise pour éditer le contenu ; leur propre texte d'interface (boutons "Enregistrer", en-têtes de tableau, labels de formulaire admin) n'est pas du contenu éditorial public et n'a pas vocation à être piloté par le CMS qu'il constitue. Un sondage ciblé (grep sur les motifs de contenu marketing + lecture de plusieurs fichiers représentatifs) n'y a révélé aucun contenu public codé en dur — voir section 5.

---

## 2. Résumé chiffré

| Indicateur | Valeur |
|---|---|
| Fichiers `.tsx` sous `app/` et `components/` | 274 |
| Fichiers scannés dans cette passe | 274 (188 en lecture ligne à ligne / analyse détaillée, 86 en sondage ciblé — voir §5) |
| Fichiers déjà entièrement migrés (zéro contenu en dur restant) | ~130 (dont 41 pages destination via `SubDestinationTemplate`, home, a-propos, contact, expert-hotelier, travel-planning, guides, quiz, slow-travel, start, maintenance, merci, la plupart des composants techniques) |
| Fichiers avec du contenu encore en dur (findings ci-dessous) | ~55 fichiers/composants distincts |
| Composants **morts** trouvés (jamais importés) | 6 (`Hero.tsx`, `HeroVideo.tsx`, `Services.tsx`, `Pillars.tsx`, `Destinations.tsx`, `Blog.tsx`, `Newsletter.tsx`, `NewsletterBrevo.tsx` — 8 en tout, voir §6) |
| Nombre approximatif d'items de contenu individuels recensés | ~210 |

Le chantier de migration est donc **très avancé** : l'essentiel des lacunes restantes se concentre sur (a) des titres de section (h2) et CTA de fin de page dans une famille de ~10 pages "pilier" destination construites sur un pattern similaire mais pas totalement homogène, (b) une poignée de composants partagés réutilisés sur beaucoup de pages (badges "Testé par Heldonica", formulaires B2B/lead magnet, quiz), et (c) quelques pages annexes jamais raccordées (dashboard, auth, pages légales — titres de section).

---

## 3. Détail par zone

### 3.1 Accueil

| Fichier source | Lignes | Type de contenu | Extrait | Suggestion de migration |
|---|---|---|---|---|
| `components/HomeClient.tsx` | 209 | CTA carte article ("Dernières pépites") | "Lire le carnet →" | EditableZone `page="home" zone="section_latest_card_cta"` — le reste de la page est déjà à ce niveau de granularité |
| `components/HomeClient.tsx` | 687-691 | Donnée structurée (fallback) | 4 destinations par défaut (slug/titre/emoji) si `homeDestinations` est vide | Fallback technique, priorité basse — garder tel quel ou aligner sur la table `destinations_public` déjà utilisée en amont |
| `app/not-found.tsx` | 38, 41-42, 54, 60 | Titre + paragraphe + 2 CTA (page 404) | "Cette page s'est perdue en chemin...", "Retour à l'accueil", "Découvrir nos destinations" | EditableZone `page="system" zone="404_*"` (nouvelle page CMS "système", partagée par les pages d'erreur) |
| `app/error.tsx` | 48, 51-52, 64, 73 | Titre + paragraphe + 2 boutons (erreur applicative) | "Une erreur inattendue s'est produite", "Réessayer", "Accueil" | idem — `page="system" zone="error_*"` |
| `app/global-error.tsx` | 20-21, 23-24, 31, 37 | Titre + paragraphe + 2 boutons (erreur racine, sans Header/Footer) | "Une erreur critique s'est produite", "Réessayer" | idem, avec prudence : ce composant peut se déclencher quand le reste de l'app (donc les providers CMS) a planté — fallback en dur nécessaire par construction, ne pas migrer vers EditableZone ici |
| `app/loading.tsx` | 16 | Texte de chargement | "Chargement…" | Priorité très basse (affiché < 1s), laisser en dur |

### 3.2 Destinations (`app/destinations/**`, 72 fichiers + composants partagés)

**Contexte** : 41 des 72 fichiers sont des pages "leaf" identiques (66 lignes chacune) qui passent uniquement des valeurs de fallback (`highlights`, `introText`, `localTip`) à `SubDestinationTemplate.tsx`, lequel enveloppe **tout** en `EditableZone`. Ces 41 fichiers n'ont donc **aucun** contenu réellement affiché en dur — ils sont exclus du tableau ci-dessous. Idem pour `[slug]/page.tsx` (route "coming soon" pilotée par la table `destinations_public`), `grece/page.tsx`, `carte/MapClientPage.tsx`, `madere/budget/*`, `madere/itineraire-7-jours/page.tsx`, `compare/page.tsx`, `paris.tsx`/`lisbonne.tsx`/`zurich.tsx`/`suisse.tsx`/`sicile.tsx` (wrappers fins), `layout.tsx`, `page.tsx` (listing).

| Fichier source | Lignes concernées | Type de contenu | Extrait court | Suggestion de migration |
|---|---|---|---|---|
| `components/DestinationPillar.tsx` (affecte `/destinations/madere`, `/roumanie`, `/montenegro`) | 79 | Titre H1 | "{name} en couple — notre guide slow travel" | EditableZone `page="destinations" zone="hero_title_suffix"` avec `{name}` interpolé, comme le fait déjà `intro_title`/`intro_title_suffix` juste en dessous |
| idem | 94-95, 451-452 | CTA répété (hero + CTA final) | "Demander mon voyage sur mesure →" | EditableZone `zone="cta_button_main"`, réutilisée aux 2 endroits |
| idem | 224-229 | Titre + paragraphe section hébergement | "Où dormir à {name} ?" + "On dort rarement au même endroit..." | EditableZone `zone="lodging_title"` / `zone="lodging_intro"` |
| idem | 245, 260, 272 | CTA affiliés (3) | "Voir les disponibilités à {query} →", "Chercher un hébergement à {name}", "Réserver une activité à {name}" | EditableZone, 3 zones dédiées |
| idem | 290-296 | Titre + paragraphe section carte | "Où se situe {name} ?" + "Repère les étapes de l'itinéraire..." | EditableZone `zone="map_title"` / `zone="map_intro"` |
| idem | 339-350 | Liste structurée (4 items) "Ce qu'on a vraiment payé sur place" | Vols / Hébergement / Restaurant / Activités | **Content block** `cms_content_blocks` (liste de 4 items titre+texte) plutôt que 4 zones séparées : la structure (icône ✓ + libellé + fourchette) est identique pour toutes les destinations pilier |
| idem | 363-364 | Kicker + titre section articles | "Nos carnets" / "Articles sur {name}" | EditableZone, 2 zones |
| idem | 393 | Titre section FAQ | "Questions fréquentes" | EditableZone `zone="faq_title"` |
| idem | 397-427 | Tableau structuré saisons (3 lignes, 2 codées en dur) | "Juillet–août" / "Nov–mars" + verdicts ("À éviter pour slow travel"...) | **Content block** dédié — tableau saison/affluence/avis, réutilisable tel quel sur les 3 pages pilier |
| idem | 446-448 | 2e bloc CTA (kicker + titre + texte) | "Voyage sur mesure" / "Prêt à découvrir {name} à ton rythme ?" | EditableZone, 3 zones (doublon fonctionnel du 1er bloc CTA plus haut dans le fichier — à vérifier si les deux sont nécessaires) |
| idem | 461 | Blurb newsletter | "{name} et nos autres guides slow — reçois les prochains en avant-première." | EditableZone `zone="newsletter_blurb"` |
| `app/destinations/[slug]/DestinationPage.tsx` (affecte `/sicile`, `/lisbonne`, `/suisse`, `/zurich`, `/paris`) | 220-221 | Kicker hero | "Destination testée" | EditableZone `page="destinations-${slug}" zone="hero_kicker"` |
| idem | 278 | Titre section récit | "On y est allés" | EditableZone `zone="story_title"` |
| idem | 292-296 | Titre + sous-titre section pépites | "Explorer les pépites de la région" / "Nos guides détaillés..." | EditableZone — **incohérence à corriger** : `DestinationPillar.tsx` câble déjà ces mêmes libellés (`zone="subdests_title"/"subdests_subtitle"`), ce composant-ci ne le fait pas alors qu'il rend le même bloc |
| idem | 313 | CTA carte pépite | "Voir le guide →" | EditableZone — même incohérence : `DestinationPillar.tsx` a `zone="subdests_cta"`, celui-ci ne l'a pas |
| idem | 326 | Titre section conseils | "Ce qu'on te recommande" | EditableZone `zone="tips_title"` |
| idem | 347 | Signature verdict | "— Heldonica, testés sur place" | EditableZone `zone="verdict_signature"` |
| idem | 354-358 | Titre + paragraphe CTA final | "Tu veux un voyage adapté à ton rythme ?" + texte | EditableZone, 2 zones |
| idem | 364 | CTA final | "Planifier ce voyage avec Heldonica →" | EditableZone `zone="final_cta"` |
| `app/destinations/alentejo/page.tsx` | 143, 184-186, 282-285, 339, 398, 444-446, 389, 509 | ~8 titres/kickers/CTA de section restés en dur ("Bon à savoir", "Nos pépites dénichées", "Où dormir selon ton style"+intro, "Comment se déplacer", "Questions fréquentes", "Nos carnets liés", CTA "Dis-nous ton projet →", "Voir tous nos carnets →") alors que hero/intro/FAQ/cartes pépites sont bien câblés | — | EditableZone pour chacun (pattern `Z()` déjà utilisé dans le fichier, il suffit d'étendre aux titres de section manquants) |
| `app/destinations/colombie/page.tsx` | 11-16, 127, 137/146/155/164, 211 | SUBNav (4 labels villes) + titre "Nos villes favorites" + CTA répétée "Voir le guide →" (x4) + lien retour | — | EditableZone pour les titres/CTA ; SUBNav = navigation interne, priorité basse |
| `app/destinations/idf/page.tsx` | 32-37, 104/110, 134, 150-151, 194-195, 254-255, 296, 312 | subNav (4 labels) + CTA hero (2) + kickers "Notre angle"/"Ce qu'on a vraiment aimé" + titres "Nos pépites en Île-de-France"/"Par secteur"/"Explorer par zone"/"Côté pratique"/"Ce qu'il faut savoir" + "Questions fréquentes" + lien retour | — | EditableZone, pattern déjà en place à étendre |
| `app/destinations/normandie/page.tsx` | 11-15, 126, 198, boutons | SUBNav (3 labels) + "Nos régions" + "En voir plus" + boutons "Le Havre et environs →"/"Articles Normandie →" | — | EditableZone |
| `app/destinations/portugal/page.tsx` | 11-16, 134, 188, 235, 276-286 | SUBNav (4 labels) + "Où aller au Portugal" + kicker "Côté pratique" + kicker "Questions fréquentes" + bloc CTA final complet (titre+texte+bouton) | — | EditableZone |
| `app/destinations/sardaigne/page.tsx` | 49-55, 94, 131, 137/143/149/155, 162/170 | subNav (5 labels) + kicker hero "Destination testée" (incohérent : seul ce champ n'est pas wrap alors que le reste du hero l'est) + "Nos zones favorites" + CTA répétée "Voir le guide →" (x4) + titres "Meilleure période"/"Budget indicatif" | — | EditableZone |
| `app/destinations/montenegro/kotor/page.tsx` | 134-140, 164, 209, 250, 269/274/280/289, 305-317, 325-338 | ~7 titres de section + bloc verdict (4 sous-titres) + CTA finale (titre+texte+2 boutons) + bloc "Autres destinations Heldonica" (3 cartes de nav en dur) — alors que hero/intro/FAQ/infos pratiques sont bien câblés via le helper `Z()` du fichier | — | EditableZone pour chaque titre manquant ; le bloc "Autres destinations" (3 cartes statiques) pourrait devenir une liste pilotée (`related_destinations`) |
| `app/destinations/roumanie/timisoara/page.tsx` | 124-125, 180-181, 184/192, 204, 220, 226-233, 239 | Kickers "Ce qu'on a déniché"/"Côté pratique" + titres h3 "Où dormir"/"Où manger" (alors que les items de liste en dessous SONT câblés) + kicker "Questions fréquentes" + kicker "À proximité" + 2 blocs statiques "Budapest"/"Belgrade" (non-liens) + bloc CTA final (titre+texte+bouton "Concevoir mon voyage →") | — | EditableZone |
| `app/destinations/roumanie/itineraire-{5,7,10}-jours/page.tsx` (3 fichiers) | Titres "Aperçu du circuit", label répété "Pépite dénichée" (1x/jour), "Carte interactive du circuit"+intro, "Télécharge le PDF de cet itinéraire"+texte, (10 jours) "Pas assez de temps ?"+texte, 2 blocs CTA finaux | — chaque jour individuel EST câblé via `Z()`, seuls les titres de section fixes et les 2 CTA de fin ne le sont pas | EditableZone — motif identique dans les 3 fichiers, à traiter comme un seul chantier |
| `components/DestinationsClient.tsx` | 156-159, 175-179, 252, 17-23 | CTA "Comparer →" / état vide (titre+texte+bouton) / CTA "Voir la carte interactive →" / `CONTINENT_TABS_DEFAULT` (5 labels d'onglets, fallback si `site_settings.destinations_tabs_json` absent) | — | EditableZone pour les CTA/état vide ; les onglets ont déjà un mécanisme JSON en settings, pas un vrai trou |
| `components/ComingSoonDestination.tsx` | 74, 80, 86 | Labels de champs ("Style", "Meilleure saison", "Budget indicatif") | — | Mineur — EditableZone si on veut aller au bout, sinon acceptable tel quel |

### 3.3 Blog (`app/blog/**`, `components/BlogClientPage.tsx`)

| Fichier source | Lignes | Type de contenu | Extrait | Suggestion de migration |
|---|---|---|---|---|
| `app/blog/page.tsx` | 56-92 | **SEO title/description en dur** (litéral, pas via `buildPageMetadata`) | title "Carnets de voyage \| Heldonica" | Aligner sur le mécanisme utilisé partout ailleurs (`buildPageMetadata('blog', metadata)`), qui lit `cms_editable_zones.seo_title/seo_description` — incohérence à corriger, pas juste un ajout de zone |
| `app/blog/[slug]/page.tsx` | 335, 436 | Lien retour (dupliqué 2x) | "← Retour aux carnets" | EditableZone `page="blog" zone="back_link"` |
| idem | 373 | Kicker extrait article | "Ouverture" | EditableZone |
| idem | 396-397 | État vide article sans contenu | "Le récit n'est pas encore publié en entier." | EditableZone |
| idem | 406 | Kicker notes terrain | "Détail terrain" | EditableZone |
| idem | 417 | Label | "Tags" | EditableZone |
| `components/BlogClientPage.tsx` | 263-264, 533 | CTA carte article (2 variantes) | "Lire le carnet →" / "Lire →" | EditableZone `page="blog" zone="card_cta"` |
| idem | 298 | Placeholder recherche | "Rechercher un carnet, un lieu, un détail" | EditableZone |
| idem | 322-323 | Bouton | "Effacer" | EditableZone |
| idem | 338-350 | État vide recherche (titre+texte+bouton) | "Rien de juste pour cette recherche, pour l'instant." | EditableZone, 3 zones |

### 3.4 Travel Planning / Organisateur (`app/travel-planning*`, `app/organisateur/**`)

| Fichier source | Lignes | Type de contenu | Extrait | Suggestion de migration |
|---|---|---|---|---|
| `app/travel-planning/TravelPlanningClient.tsx` | formulaire final | Labels de formulaire + `FORM_DESTINATIONS` (13 options select) + RGPD + reassurance | "Ton prénom", "Destination souhaitée"... | EditableZone pour les labels ; `FORM_DESTINATIONS` est une liste de choix technique, priorité basse |
| `app/travel-planning/layout.tsx` | 45-101 | **JSON-LD `schemaService` avec des prix qui divergent du contenu affiché** | "Pack Essentiel" 150€/"Pack Confort" 250€/"Pack Premium" 350€ dans le JSON-LD, vs "Essentielle" 250€/"Complète" 450€/"Sur-Mesure" dans `TravelPlanningClient.tsx` (`PRICING_PLANS`, lui-même pilotable via `/api/cms/pricing`) | **Bug de dérive de contenu** (deux sources de vérité indépendantes pour la même donnée) plutôt qu'un simple trou CMS — à corriger en générant le JSON-LD à partir de `pricingPlans` plutôt que d'un objet dupliqué dans le layout |
| `components/TravelOrganizerClient.tsx` (page `/organisateur`) | `PRICE_PROFILES` (14 destinations x tarifs+conseil), `CHECKLIST_TEMPLATES` (4 types x 7-10 items) | Données de référence d'un calculateur interactif | — | Plus proche de données produit que de contenu éditorial (cf. `MadereBudgetClient.tsx` qui garde ses barèmes en dur en assumant ce choix). Si on veut les rendre pilotables : **table dédiée** `cms_organizer_price_profiles`, pas des zones individuelles |
| `app/travel-planning-form/page.tsx` | placeholders | 2 placeholders de champ libre non wrap | "Ex : Madère, Sicile, Colombie…" | Mineur, EditableZone si besoin |

### 3.5 À propos / Contact / Expert Hôtelier

Ces trois pages sont **quasi intégralement migrées** — aucun titre, paragraphe ou CTA de page laissé en dur au-delà de ce qui suit :

| Fichier source | Type de contenu | Détail | Suggestion |
|---|---|---|---|
| `components/HotelierForm.tsx` (page `/expert-hotelier`) | Formulaire B2B complet, **zéro mécanisme CMS** | Tous les labels ("Votre nom *", "Nom de l'établissement *"...), 2 select (5 types d'hébergement, 5 tranches de % réservation directe), messages succès/erreur, texte RGPD, CTA "Échanger sur mon projet →", reassurance finale | EditableZone `page="expert-hotelier" zone="form_*"` — le reste de la page l'est déjà, ce composant fait exception |

### 3.6 Guides / Quiz / Slow Travel / Start / Témoignages

| Fichier source | Type de contenu | Détail | Suggestion |
|---|---|---|---|
| `app/quiz/layout.tsx` | **SEO non pilotable** | `app/quiz/page.tsx` est un composant `'use client'` sans `generateMetadata` — la métadonnée statique du layout est donc la seule source, jamais passée par `buildPageMetadata` | Ajouter un `generateMetadata` côté page (nécessite de convertir la page ou d'ajouter un layout serveur intermédiaire) |
| `app/temoignages/TemoignagesClient.tsx` | État vide non wrap | "On construit nos retours clients en ce moment..." + sous-texte (L81-86) | EditableZone `page="temoignages" zone="empty_state_*"` |

`app/guides/page.tsx`, `app/guides/merci/page.tsx`, `app/guides/top-10-pepites-madere/page.tsx` (les 10 items sont déjà en base via `cms_guide_items`), `app/quiz/page.tsx` (questions/profils entièrement câblés), `app/slow-travel/page.tsx`, `app/start/page.tsx` : **aucun finding** au-delà de ce qui précède.

### 3.7 Pages légales (`mentions-legales`, `politique-confidentialite`, `politique-affiliation`)

| Fichier source | Type de contenu | Détail | Suggestion |
|---|---|---|---|
| `app/mentions-legales/page.tsx`, `app/politique-confidentialite/page.tsx`, `app/politique-affiliation/page.tsx` | Titres de section (h2) du corps juridique | Chaque page utilise un composant wrapper local (`LegalSection`/`PrivacySection`) qui reçoit son `title` en **prop littérale**, jamais via `EditableZone` — alors que le contenu de chaque section (paragraphes, listes) l'est en grande partie. Ex. politique-confidentialite : "Données collectées", "Finalités du traitement"... | EditableZone pour chaque titre de section (une dizaine par page) — même mécanique que le reste de la page, juste pas encore étendue aux titres |
| `app/mentions-legales/page.tsx` | `EDITOR_LEGAL_FIELDS` (9 labels fixes) | "Forme juridique", "Capital social", "SIREN"... (le contenu de chaque champ, lui, est en zone) | Labels de champ légaux, priorité basse — stables par nature |

### 3.8 Authentification / Espace client

| Fichier source | Type de contenu | Détail | Suggestion |
|---|---|---|---|
| `app/dashboard/page.tsx` | Page compte connecté, **zéro EditableZone** | Kicker "Mon espace", h1 "Tes voyages sauvegardés", description, bouton "Déconnexion", états vides/erreurs, CTA "Démarrer un Travel Planning"/"Télécharger le carnet PDF", labels de statut "Confirmé"/"Brouillon" | Priorité modérée — page produit plus que marketing, mais visible par tout client connecté. EditableZone `page="dashboard"` si on veut l'aligner sur le reste |
| `app/auth/login/page.tsx`, `app/auth/register/page.tsx` | Formulaires d'authentification, **zéro EditableZone** | Kicker "Espace client", h1, sous-texte, labels de champs, messages d'erreur ("Le mot de passe doit contenir au moins 8 caractères."...), CTA, liens croisés | Priorité basse (UI technique standard), mais cohérence avec le reste du site si on veut uniformiser |

### 3.9 Composants partagés (`components/*.tsx` racine)

| Fichier source | Type de contenu | Détail | Suggestion |
|---|---|---|---|
| `components/Header.tsx` | Labels non couverts par `getCmsOrSetting` | "Mon espace"/"Connexion" (L18), "Menu" (L187), liens rapides mobile "Contact"/"Mentions légales"/"Confidentialité" (L259-263) | Étendre le mécanisme `getCmsOrSetting` déjà utilisé dans ce même fichier |
| `components/Footer.tsx` | Paragraphe + état succès + bouton newsletter | "Chaque semaine : un lieu qu'on a aimé..." (L156-157), "C'est noté !" (L165-166), "Je m'inscris"/"Envoi..." (L185) | idem, mécanisme déjà en place dans le fichier |
| `components/CookieConsentBanner.tsx` | Bannière RGPD site-wide, **zéro mécanisme CMS** | "Cookies et vie privée", texte explicatif, "Refuser"/"Accepter" | EditableZone `page="global"` (mécanisme `getGlobalZones()` déjà utilisé par `app/layout.tsx` pour d'autres éléments sitewide) — bon candidat, s'affiche sur tout le site |
| `components/NewsletterPopup.tsx` | Popup site-wide, **zéro mécanisme CMS** | Badge "Guide gratuit", titre "Reçois les 10 meilleures adresses Madère", texte, RGPD, CTA, message succès | EditableZone `page="global" zone="newsletter_popup_*"` |
| `components/HeldonicaProof.tsx`, `components/HeldonicaVerdict.tsx`, `components/TestedByHeldonica.tsx` | Badges/blocs UI réutilisés sur de nombreux articles/pages destination, **zéro mécanisme CMS** | "Testé par Heldonica", "Pépite", "Verdict Heldonica", note bas de bloc "Tous nos verdicts sont basés sur des visites terrain réels..." | Pas de contexte `page=` unique (composants réutilisés partout) → suivre le même mécanisme que `DestinationVerdict.tsx`/`QuickAnswersBlock.tsx` (labels dans `site_settings` en JSON, déjà utilisé pour des composants très proches) |
| `components/SeasonalTable.tsx` | Labels UI fixes, réutilisé sur plusieurs pages destination | "Meilleure période pour {destination}", "Clique sur une saison...", labels Faible/Modéré/Élevé, Économique/Intermédiaire/Premium | idem — mécanisme `site_settings` JSON |
| `components/GuideDownloadForm.tsx`, `components/GuideDownloadModal.tsx`, `components/LeadMagnetBlock.tsx` | Blocs lead-magnet PDF, réutilisés sur plusieurs pages destination, **zéro mécanisme CMS** | CTA "Je veux le guide →", titre modal "Télécharge ton guide {destination}", 3 "benefits" (Budget réaliste/Adresses testées/Itinéraire clé en main), disclaimers | EditableZone si contexte de page disponible, sinon `site_settings` JSON comme ci-dessus (composants partagés multi-pages) |
| `components/SlowTravelQuiz.tsx` | **Donnée structurée majeure**, réutilisée sur la home et plusieurs pages destination, zéro mécanisme CMS | 5 questions x 3 options (15 options avec scores), 4 profils résultat (titre/sous-titre/recommandation/liens) | Voir §4 — candidat table dédiée. Noter le **doublon fonctionnel** avec `app/quiz/page.tsx`, un 2e quiz totalement différent et lui entièrement câblé en EditableZone |
| `components/RelatedArticles.tsx` | Kicker + titre, zéro mécanisme CMS | "À lire aussi" / "Nos articles sur {destination}" | EditableZone si contexte dispo |
| `components/DestinationCard.tsx` | Badges statut | "⭐ Coup de cœur" / "Bientôt" | Mineur |
| `components/itinerary/DayAccommodationBox.tsx` | Labels fixes (pages itinéraire Roumanie) | "On a dormi chez", "Voir les disponibilités →", "Départ" | Mineur, EditableZone si besoin |
| `components/api/og/route.tsx` (génération d'image OG) | Textes de secours techniques | "Carnets de Route", badge type Article/Destination/Blog | Priorité très basse — n'est jamais vu comme "page" par un visiteur |

---

## 4. Patterns justifiant une nouvelle table dédiée

Ces propositions regroupent des motifs **répétés à l'identique** sur plusieurs fichiers — la bonne unité de migration est une table, pas N zones individuelles.

1. **`cms_faq_items`** — des blocs FAQ apparaissent en dur ou en zones dispersées sur au moins 8 pages destination différentes (`alentejo`, `idf`, `normandie`, `portugal`, `sardaigne`, `colombie`, `montenegro/kotor`, `roumanie/timisoara`, + `travel-planning`, `expert-hotelier`) avec la même forme `{question, réponse}`. Colonnes suggérées : `id, page_slug, display_order, question, answer, is_active`. Bénéfice : une seule interface d'édition FAQ au lieu de N paires de zones `faq_N_q`/`faq_N_a` par page, et un seul schéma JSON-LD FAQPage généré depuis la même source.

2. **`cms_quiz_definitions`** (+ `cms_quiz_questions`, `cms_quiz_profiles`) — il existe **deux quiz totalement indépendants** avec la même mécanique (questions à choix multiples → score → profil recommandé) : `components/SlowTravelQuiz.tsx` (4 profils : Explorateur Sensoriel/Contemplatif Alpin/Méditerranéen Gourmand/Curieux Patrimoine, zéro CMS) et `app/quiz/page.tsx` (4 profils différents : Aventurier/Curieux Culturel/Slow Traveler/Amateur de Bien-être, entièrement câblé en EditableZone avec des clés `question_N_opt_M_label`). Une table dédiée unifierait les deux, remplacerait le pattern de zones à clé composée du second, et permettrait de piloter `SlowTravelQuiz.tsx` sans dupliquer 15 zones par instance.

3. **`cms_verdict_labels`** (généralisation de ce qu'ont déjà `DestinationVerdict.tsx` et `QuickAnswersBlock.tsx` via `site_settings.verdict_labels`/`quickanswers_templates`) — étendre ce même mécanisme de labels JSON à `HeldonicaProof.tsx`, `HeldonicaVerdict.tsx`, `TestedByHeldonica.tsx`, `SeasonalTable.tsx` : ce sont 6 composants qui affichent des badges/labels UI identiques sur des dizaines de pages, sans qu'aucun n'ait de `page=` propre pour justifier des `EditableZone` individuelles.

4. **`cms_price_reference_profiles`** — `TravelOrganizerClient.tsx` (`PRICE_PROFILES`, 14 destinations) et `MadereBudgetClient.tsx` (`styleRanges`) sont deux calculateurs de budget avec des barèmes en dur, dans un esprit similaire aux 3 "packs" tarifaires de `TravelPlanningClient.tsx`/`travel-planning/layout.tsx` (déjà partiellement en table via `/api/cms/pricing`, cf. le bug de dérive noté en §3.4). Une table de référence commune barème/destination éviterait les 3 sources de vérité actuelles pour "combien coûte un voyage à X".

5. **`cms_legal_sections`** — les 3 pages légales (`mentions-legales`, `politique-confidentialite`, `politique-affiliation`) partagent un composant wrapper local (`LegalSection`/`PrivacySection`) avec des titres en dur. Une table `{page_slug, display_order, title, body_html}` permettrait d'ajouter/retirer des sections légales sans toucher au code — utile en particulier pour les mentions légales, qui changent avec la structure juridique de l'entreprise.

---

## 5. Non couvert en profondeur dans cette passe

Les répertoires suivants constituent l'**interface d'administration du CMS elle-même** (77 fichiers, ~6800 lignes) : ce sont les écrans que l'équipe utilise pour éditer tout le contenu documenté ci-dessus. Ils ont été sondés (recherche ciblée de motifs de contenu marketing + lecture de plusieurs fichiers représentatifs : `app/admin/settings/page.tsx`, `app/panel-manager/page.tsx`, `components/admin/LivePreview.tsx`, `components/admin/DesignEditor.tsx`) sans y trouver de contenu public codé en dur — uniquement des libellés d'interface d'administration (en-têtes de tableau, boutons "Enregistrer"/"Supprimer", labels de formulaire de configuration) et, dans `LivePreview.tsx`, un texte d'exemple générique pour prévisualiser une police/couleur, sans rapport avec le contenu réel du site. Ils n'ont **pas** été lus ligne à ligne :

- `app/admin/**` (9 fichiers : `analytics`, `categories`, `destinations`, `layout`, `media`, `pricing`, `redirects`, `settings`, `testimonials`)
- `app/panel-manager/**` (18 fichiers : `CmsAdminClient.tsx` et les sous-outils `carousel/*`, `maps/*`, `media`, `video`, `subtitles`, `fast-trim`, `auto-shorts`, `studio-video`)
- `components/admin/**` (40 fichiers : éditeurs d'articles, de destinations, de vidéos, de carrousels, gestion des médias, etc.)
- `components/cms/**` (10 fichiers : `PageEditor`, `SiteSettings`, `SeoAudit`, `MediaManager`, `TravelCRMPanel`...)

Également non lus individuellement (primitives UI génériques ou chrome de l'éditeur inline, sans texte éditorial propre) :
- `components/ui/Button.tsx`, `input.tsx`, `tabs.tsx`, `textarea.tsx`
- `components/web-vitals/WebVitalsReporter.tsx`
- `components/inline-edit/EditModeToggle.tsx`, `ZonesSidebar.tsx`, `UndoToast.tsx`, `AiImproveModal.tsx` (chrome de l'éditeur CMS lui-même, pas du contenu public)

Si un audit futur souhaite couvrir ces 86 fichiers, la même méthode s'applique — mais leur contenu (s'il existe) serait des libellés d'outillage interne, pas des zones candidates à `cms_editable_zones` au même titre que le reste de ce document.

---

## 6. Composants morts trouvés en cours d'audit

Non liés à la migration CMS, mais découverts par la recherche systématique d'imports lors de cet audit (vérifié par `grep` de chaque nom de composant sur tout `app/`+`components/`, zéro résultat d'import) :

| Composant | Constat |
|---|---|
| `components/Hero.tsx` | Jamais importé nulle part |
| `components/HeroVideo.tsx` | Jamais importé nulle part (contient un objet `HARDCODED` de titre/sous-titre/CTA, jamais affiché) |
| `components/Services.tsx` | Jamais importé nulle part |
| `components/Pillars.tsx` | Jamais importé nulle part |
| `components/Destinations.tsx` | Jamais importé nulle part |
| `components/Blog.tsx` | Jamais importé nulle part |
| `components/Newsletter.tsx` | Jamais importé nulle part (`NewsletterForm.tsx` est le composant réellement utilisé partout) |
| `components/NewsletterBrevo.tsx` | Jamais importé nulle part |

Conformément au principe du projet ("neutraliser plutôt que câbler" pour les doublons et routes mortes), ces 8 fichiers sont candidats à suppression plutôt qu'à migration — leur contenu ne sera jamais vu par un visiteur en l'état actuel du routage.
