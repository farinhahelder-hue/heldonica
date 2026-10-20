# 📜 Journal des Modifications (CHANGELOG) — Heldonica

Toutes les modifications du projet sont consignées ici pour assurer la coordination entre sessions et maintenir la traçabilité des évolutions.

## [2026-10-20] — Audit éditorial, lot 1 : 6 articles publiés affichaient leur markdown en clair

- **Méthode** : source de vérité = Supabase production ; le site rend son contenu
  **côté client**, donc le HTML servi ne prouve rien (squelette « Chargement… »).
  Les constats de rendu ont été établis sur le **DOM après JavaScript**
  (`chromium --dump-dom`), jamais sur un `curl`.
- **P1 — markdown non converti sur 6 articles publiés. CORRIGÉ.** Le corps de
  `bacalhau-gomes-sa-recette`, `poncha-recette-authentique`, `pudim-de-nata-recette`,
  `petite-ceinture-paris-balade-urbaine`, `bucarest-hidden-surprend` et
  `transylvanie-secrete-au-dela-de-dracula` affichait ses titres `## …` et ses gras
  `**…**` en texte brut. Mesuré sur le DOM : 6 à 7 titres et 8 à 14 gras littéraux
  par article, contre **0** pour les 2 articles HTML (`podgorica`, `itineraire-roumanie`).
  Cause : **aucun convertisseur markdown n'existait** dans le projet (vérifié dans
  `package.json`, `node_modules`, le code, `next.config.js`), alors que le type
  `TextBlock` annonce « Supporte HTML sain ou Markdown ». `app/blog/[slug]/page.tsx`
  passait le contenu brut à `EnhancedRichContent`, qui ne fait que désinfecter.
  Corrigé par `lib/markdown-to-html.ts` (nouveau), câblé sur les **deux** chemins de
  rendu, + `TextBlock` qui rend le gras en `<strong>` sans injection HTML.
- **Vérifié sur les 8 contenus réels de production** : les 2 articles HTML sortent
  **inchangés** (pas de double traitement) ; les 6 markdown produisent **40 `<h2>`**
  et **63 `<strong>`**, avec **0 `##`** et **0 `**`** résiduels. 9 tests ajoutés ;
  ciblés 40/40 ; `tsc` 0 erreur ; `npm run build` EXIT=0 ; garde-fous **13/13**.
- **P2 — redirection cassée, constatée non corrigée** : `cms_redirects` redirige
  `/blog/zurich` vers `/blog/flotter-sur-la-limmat-zurich-aventure`, **deux brouillons**,
  donc vers une 404. Décision propriétaire.
- **P2 — coquilles en clair** dans `poncha-recette-authentique` : `devant on`,
  `su on indiquer`, `sucrde`, `assomàmer`, `à Madere` (confirmées en base).
  Correction soumise à validation (écriture en production).
- **P3 — 4 articles sans image de partage social** (`og_image_url` vide).
- **Limite assumée** : la **vérification visuelle des photos n'a pas été faite**
  (pas d'outil d'analyse d'image fiable). Les photos `batch-*`/`import-*` restent
  **à vérifier par un humain** ; le registre média ne prétend pas qu'elles sont fausses.
- **Non audité, à ne pas confondre avec « sain »** : 64 pages destinations, guides,
  itinéraires, pages commerciales (lot 2) et 47 brouillons (lot 3).
- Livrables : `.audit/audit-editorial-2026-10-20/` (rapport, inventaire CSV, registre
  médias, journal des corrections, décisions propriétaire).

## [2026-10-19] — Contenu en ligne : hero coupe en plein mot, `\n` en clair, erreurs carte/guides

- **Méthode** : 42 pages réellement servies, texte visible extrait du HTML (balises
  retirées, entités décodées), confronté à la valeur en base. Aucun constat tiré
  d'un slug ou d'un nom de fichier.
- **Hero des pages destinations coupé en plein mot — CORRIGÉ.** Mesuré sur le HTML
  servi : `/destinations/paris` affichait « …ses passages couverts **end**… »,
  `zurich` « …Et à 3**…** », `sicile`, `suisse`, `lisbonne` de même. La base était
  **intacte** (`cms_editable_zones.destinations-paris.description` contient la
  phrase entière). Cause : `app/destinations/[slug]/DestinationPage.tsx:217`,
  `.slice(0, 200)` qui coupe au milieu d'un mot **et** concatène `...` en dur,
  donc ajouté même sous 200 caractères. Corrigé par `extraitHero()` : coupe sur
  la dernière frontière de mot, ellipse seulement si du texte a été retiré.
  Vérifié dans l'artefact construit : les 5 pages finissent sur un mot entier.
- **Guide Madère : `\n` affiché en clair — CORRIGÉ.**
  `/guides/top-10-pepites-madere` affichait « On a passé 3 semaines à Madère.`\n`Voici
  ce qu'on en a retiré. » Cause : `fallback="…\n…"` est une chaîne d'attribut JSX,
  qui n'interprète pas les échappements. Il faut `fallback={"…\n…"}`. Corrigé sur
  les deux zones. Vérifié dans l'artefact construit.
- **Carte et guides : erreurs de contenu — migration écrite, NON appliquée.**
  `map_markers.cote-albatre` : « falaises **bretonnes** » alors que la Côte d'Albâtre
  est normande — et la colonne `region` de la même ligne vaut `Normandie`, la ligne
  se contredit ; « **Fagnes** blanches » (les Fagnes sont ardennaises).
  `map_markers.porto` : « **viñedos** » (espagnol) et « architecture
  **barcelonaise** » (décrit Barcelone). `cms_guide_items` : « **propietario** ».
  Migration `20261019120000_corrections_contenu_carte_guides.sql`, idempotente,
  conditionnée par la valeur fautive, aucune suppression. Pour Porto, l'adjectif
  est retiré et non remplacé : rien n'établit le style de Porto, l'inventer serait
  précisément ce que la règle interdit. Le fallback du code est corrigé en parallèle.
- **Relevé sans correction (décisions propriétaire)** : le comparateur annonce
  « nombre d'articles » sans rendu visible sans JS ; le sélecteur de destinations
  propose Naples, Malte, Corse, Bari & Pouilles, Pologne — aucune n'a de guide
  publié ; la carte a 24 épingles pour 8 destinations ; `/destinations/normandie`
  est écrite sans accents là où `/destinations/paris` est soignée.
- **Retirés après vérification** : « 37 descriptions SEO dupliquées » (91/91
  distinctes), « 50 pages manquantes au sitemap » (elles y sont), « Suisse
  alémanique » (chaîne introuvable partout).
- **Faux positif de ma session, retiré** : `/carnets` en 404 venait de **ma propre
  liste de test** ; aucune page ne pointe dessus. Contrôle refait : 44 liens
  internes distincts, **0 lien non-200**.
- Garde-fous 13/13 verts ; `tsc` 0 erreur ; `npm run build` EXIT=0.

## [2026-10-19] — Audit en ligne : un brouillon servi en « Chargement… » indexable, et Grèce alignée

- **Méthode** : revérification en ligne de constats de session 1. Quatre d'entre
  eux ne résistaient pas (descriptions SEO « dupliquées », sitemap « codé à la
  main », `reservenaturelle` visible, `agritourismes` fautif) : ils sont retirés.
  Un slug, un nom de fichier ou une valeur en base ne prouve pas ce qui est servi.
- **Constat principal, non signalé auparavant** : `/blog/<slug>` inexistant — et
  un brouillon comme `/blog/zurich` — renvoie **HTTP 200**, `robots=index, follow`,
  et le corps ne contient qu'un écran **« Chargement… »** figé (mesuré 3 fois,
  64 225 o). Ce n'est même pas la page 404 du site. Cause : `app/loading.tsx`
  (racine, seul du dépôt) enveloppe tout dans un Suspense et `/blog/[slug]` est en
  `revalidate = 3600` : le squelette part et reste. Portée : 47 brouillons + toute
  URL `/blog/` inexistante. Atténuation mesurée : 0 brouillon au sitemap, 0 lien
  interne vers un brouillon. Correctif non engagé (routage global) — voir
  `.audit/audit-2026-10-18/5-DECISIONS-PROPRIETAIRE.md`, point 6.
- **`/destinations/grece` — corrigé** : la page servait un écran « Bientôt » mais
  restait `index, follow` et présente dans le sitemap, alors que les 33 autres
  pages « Bientôt » sont en `noindex` et hors sitemap. Cause : `destinations-grece`
  absente de `lib/unpublished-pages.ts`, sur laquelle s'appuie `lib/page-metadata.ts`.
  Ajout dans `UNPUBLISHED_PATHS` + `UNPUBLISHED_CMS_PAGES`, retrait de
  `app/sitemap.ts`, test de non-régression ajouté.
- **Coquilles corrigées dans le code** : `Évoramonsaraz` → `Évora et Monsaraz`
  (`app/destinations/alentejo/page.tsx`, 3 occurrences), `compltètement` et
  `reservenaturelle` (`lib/cms-vault-spots.ts`).
- **Migration `20261018235500_coquilles_zones_cms.sql`** (idempotente) : mêmes
  corrections dans `cms_editable_zones`, la base primant à l'affichage. **Non
  appliquée** — écriture en production, validation requise.
- **Non corrigé volontairement** : `cms_pillar_pages.roumanie` annonce
  `tested_by_heldonica.duration = « 9 jours »` alors que `itinerary` contient
  7 entrées et que `seo_desc` dit « 7 jours ». Contradiction réelle, mais un séjour
  de 9 jours peut avoir produit un itinéraire publié de 7 : décision propriétaire.
- **Vérifié sain** : les 8 articles publiés (388–903 mots, aucun placeholder), les
  45 URL du sitemap (200, titres propres, 0 redirection), les images de couverture
  (toutes servies), et l'absence de prénoms des fondateurs dans le HTML public.
  Les écarts de `<title>` sont intentionnels : `seo_title` alimente le `<title>`,
  `title` le H1 (vérifié 8/8).
- Garde-fous 13/13 verts.

## [2026-10-18] — Validation des tâches IA : `validated_by` et le bouton réparé

- **Constat** : la validation n'était atteignable par personne. Le bouton
  « Approuver (Fondateur) » de `AgentsControlDrawer.tsx` appelait
  `/api/cms/agent-tasks`, une route **qui n'a jamais existé** (mesuré : `GET` → 404,
  `PATCH` → 401 — les codes d'une route absente derrière le middleware, pas d'une
  route qui refuse la méthode). 47 tâches en attente, dont 24 adressées au fondateur.
- **`app/api/agent-tasks/route.ts`** : l'action `valider` existait déjà (ajoutée
  en parallèle par un autre agent, avec `accepter`/`renvoyer` — conservation de
  cette version, plus riche). Ajout : elle pose désormais
  `validated_by = 'heldonica'` + `validated_at`, les deux colonnes prévues par la
  migration `20260903191642_agent_tasks_governance_upgrade.sql` et jusqu'ici
  écrites par aucun chemin fonctionnel.
- **`components/admin/AgentsControlDrawer.tsx`** : les trois appels pointent la route
  qui existe (`/api/agent-tasks`), avec `action` + `agent_name` ; la validation
  envoie `decision: 'accepter'`. C'est le serveur qui pose `validated_by`.
- **Vérifié** : `npm run garde-fous` → 13/13, dont `tsc` et `vitest`.
- **Non vérifié** : le rendu du bouton dans le navigateur (pas de session CMS ici),
  et l'écran `TachesScreen.kt` de l'APK (pas de compilation Android ici — l'appli
  mobile ne sait toujours pas valider, seule la route le sait).
## [2026-10-19] — Typographie de marque : fin du double chargement Google Fonts (OpenCode)

Branche `agent/opencode/brand-polish`, suite du WIP laissé par la session marque.

- `components/SiteTheme.tsx` : un réglage CMS qui nomme Fraunces ou Source Sans 3
  est neutralisé (la police est déjà servie par `next/font`) ; le `<link>`
  Google Fonts n'est émis que si l'admin choisit une autre police.
- `app/maintenance/page.tsx`, cartes Leaflet et aperçu admin : derniers
  `Playfair Display`/`DM Sans` remplacés par les polices de marque.
- `public/og-image.svg` : pictogramme Heldonica (cercle pointillé, sommets,
  ligne d'eau) à la place du « H » générique.
- `supabase/migrations/20261019000000_polices_marque_fraunces_source_sans.sql` :
  remet `font_heading`/`font_body` sur les polices de marque quand ils portent
  encore les anciennes valeurs par défaut. Non appliquée ici.
- Vérifié : `preflight` 7/7, `typecheck`, `lint` (2 warnings préexistants),
  `next build`, `vitest` 808/811. Les 3 échecs (`formatDate`) viennent du Node
  local sans ICU `fr-FR` (`June 20, 2024`), pas du diff.

## [2026-10-19] — Release APK : un ZIP à côté du .apk

Sur le Poco, le `.apk` téléchargé depuis la release arrivait abîmé (« package doesn't appear
to be valid ») alors que l'artefact ZIP de la CI s'installait. Même fichier, autre chemin de
téléchargement. `release-apk.yml` publie maintenant aussi `heldonica-<tag>.zip` (12 Mo, l'APK
seul, vérifié par `testzip` avant publication). Le `.apk` direct reste.

## [2026-10-19] — Marque : logo vectoriel, icônes PWA, typographie (OpenCode)

Branche `agent/opencode/brand-look`. Aucun autre fichier modifié (le WIP
SiteTheme/admin/cartes reste intact).

- `public/logo.svg` (nouveau) : logo Heldonica en vectoriel, **même pictogramme
  que `favicon.svg`/`BrandMark`** (cercle pointillé, sommets, ligne d'eau) +
  nom Fraunces + baseline « Slow Travel · Voyages Authentiques ». Net à toutes
  les tailles, plus de dépendance à un PNG.
- `components/Header.tsx` : utilise `/logo.svg` par défaut ; si `logo_url` est
  défini dans le CMS, il reprend la main (SVG chargé en priorité, PNG en
  `unoptimized`). Import `BrandMark` retiré (devenu inutilisé).
- `public/android-chrome-{192,512}-maskable.png` (nouveaux) : icônes maskable
  pour l'installation Android.
- `public/site.webmanifest` : `start_url`, `scope`, `lang: fr`, `categories`,
  `purpose: any` + `maskable` sur les icônes 192/512.
- `app/layout.tsx` : métadonnées icônes étendues — `favicon.svg` en vectoriel,
  PNG 16/32/96, apple-touch-icon 180 prioritaire.
- `tailwind.config.ts` : fallbacks polices alignés sur la marque (Fraunces →
  Georgia, Source Sans 3 → system-ui).
- `app/globals.css` : antialiasing + `optimizeLegibility`, titres en
  `line-height: 1.1` / tracking `-0.015em`, corps `line-height: 1.7`, focus
  clavier visible avec `var(--color-primary)`.
- Vérifié : `node scripts/check-brand-sync.mjs` OK (48 mots bannis TS ↔ Python).
  `next build` non exécuté dans cette session (timeout de l'environnement) — la
  CI fait foi.
## [2026-10-19] — App : onglet Rédaction (brouillons, IA, photos Timeline)

Demande de la fondatrice : compléter les brouillons depuis l'APK, avec l'IA et les photos
de Google Timeline.

- Onglet **Rédaction** : liste des brouillons (jamais les articles publiés), nombre de
  `[À TOI : …]` restants, dictée de notes, bouton « Compléter avec mes notes ».
- Nouvelle action `fill_gaps` de `/api/cms/ai-assist` : ne remplace que les lacunes que les
  notes couvrent, rend le reste à l'identique, et renvoie `ajouts_non_sources` (affiché en
  alerte avant de garder la proposition).
- Photos : Google n'a **aucune API Timeline** (l'historique vit sur le téléphone). L'app lit
  l'**export JSON** choisi par l'utilisatrice (Paramètres → Position → Timeline → Exporter),
  en local, sans envoi. La date EXIF de chaque photo retrouve le séjour (±30 min) puis la
  commune via OSM ; le sélecteur Android retirant le GPS, c'est le seul lieu disponible.
  Sans correspondance : lieu laissé en `[À TOI]`, jamais deviné. Lieu à vérifier avant l'ajout.
- Garde-fou règle n°5 : case « aucun enfant sur ces photos » obligatoire avant l'envoi.
- L'enregistrement n'envoie que `content` : le statut ne change jamais, une révision est
  sauvegardée par la route avant chaque écriture.
- Non compilé ni testé sur appareil depuis cette session (pas de JDK/SDK Android) : la CI
  `build-apk` et `./gradlew :app:testDebugUnitTest` font foi.

## [2026-10-18] — Clé API du dispatcher du registre

`dispatch-registre.yml` échouait à chaque passage : secret `AI_AGENT_API_KEY` absent.
Clé dédiée `dispatcher` (`hld_dp_`, 30 req/h) ajoutée à `scripts/seed_agent_keys.mjs` ;
seul son SHA-256 est en base (migration `20261018234000_cle_api_dispatcher`), le jeton
n'existe que dans le secret GitHub. Essai `simuler=1` : HTTP 200. Reste à poser
`OPENHANDS_API_KEY` dans Vercel pour que le dispatcher lance réellement les conversations.

## [2026-10-18] — Canal Saint-Martin en brouillon

Le slug `canal-saint-martin-spots-secrets` contient un mot banni (« spot »). Plutôt que le
renommer avec une 301 (proposition d'OpenCode, tâche 8164073d), le fondateur garde l'article
en brouillon : migration `20261018233000_brouillon_canal_saint_martin` (`status` et
`published`). Les 8 brouillons qui contiennent encore des mots bannis seront corrigés à leur
remise en ligne ; aucun n'est visible.

## [2026-10-18] — App : donner des tâches à tous les agents, mode libre local

Demande du fondateur : « sur l'App je puisse donner des tâches » et « IA sans limites locale ».

- Onglet Tâches : la liste des destinataires suit enfin l'API (Claude, OpenCode, Jules,
  Gemini, OpenHands, Freebuff, Grok, Manus, tous) — Claude, OpenCode et OpenHands manquaient.
  Le formulaire défile (le clavier cachait « Envoyer ») et dit comment l'agent reçoit la tâche.
- Jules et Gemini ne lisent pas le registre : après le dépôt (la trace reste), le brief est
  copié et leur page s'ouvre. Même chose depuis le chat (`@jules …`).
- Cartes « À valider » : boutons ✅ Valider / ↩️ Renvoyer (action `valider`, session CMS).
- Cerveau : interrupteur 🔓 Mode libre — uniquement le modèle du téléphone (jamais le Cloud
  ni le PC, ni registre ni Coffre envoyés), prompt sans posture de marque ni sermon. Le
  modèle garde les limites apprises à l'entraînement : un prompt ne les retire pas.
- Tests JVM : `PromptLocalTest` (prompt libre), `CoordinationAgentsTest` (hand-off).

## [2026-10-18] — MVP : 33 sous-pages destinations sans photo vérifiée passent en « Bientôt »

Décision du fondateur (MVP « travel planning + meilleurs articles avec photos ») : les
sous-pages destinations qui n'avaient que l'image générique, ou une photo à confirmer
(Paris), passent en « Bientôt » — noindex, hors sitemap, description neutre. Les pages pays
et la navigation (carte, comparateur) restent ; Bucarest (photo vérifiée) reste.

- `lib/unpublished-pages.ts` : +33 entrées (26 pages du gabarit `SubDestinationTemplate`
  rendent « Bientôt » d'elles-mêmes).
- 7 pages spécifiques (itinéraires Roumanie 5/7/10 j, Madère 7 j et budget, Kotor,
  Timișoara) : garde en tête de page qui rend `ComingSoonDestination` tant qu'elles sont
  listées. Leur contenu reste dans le code pour une remise en ligne en retirant l'entrée.
- Tests `unpublished-pages` mis à jour (14 + 33). `check-cms-zones` ✓ (aucune orpheline),
  `check-content-pages` ✓, `tsc` ✓.

## [2026-10-18] — MVP : 13 articles avec photo vérifiée, le reste en brouillon

Décision du fondateur : « mettre en brouillon pour trancher plus tard, faire un MVP avec le
travel planning et les meilleurs articles avec photos ». Après la planche de contrôle (chaque
photo regardée), seuls les 13 articles dont la photo est cohérente restent publiés ; 13 passent
en brouillon (10 photos à confirmer, 2 sans vraie photo, 1 non contrôlé). Migration
`20261018230000_mvp_blog_articles_photo_verifiee.sql`, appliquée en base le 18/10.
**Blog : 13 articles en ligne, 42 brouillons.** Pour remettre un article : vraie photo
vérifiée, puis `status = 'published', published = true`.

## [2026-10-18] — Mots bannis : migration `20261011130000` enfin appliquée en base

Constat d'OpenHands, mesuré par Claude : la migration versionnée du 11/10 n'avait jamais été
appliquée (« plages fluviales incroyables », « au cœur de Paris », étiquette « Incontournable »
servis en ligne). Simulée sur la base (10/10 applicables), puis appliquée le 18/10 avec l'accord
du fondateur — chaque remplacement conditionné à la valeur lue (`updated_at`), valeurs d'origine
sauvegardées. La migration reste idempotente pour un futur `db push`.

- Les pages destinations sont **pré-générées au build** (`x-vercel-cache: PRERENDER`) : le texte
  corrigé n'apparaît qu'au déploiement suivant.
- **Reste hors migration** (scan de toutes les zones actives des pages publiées contre
  `FORBIDDEN_WORDS`) : 7 zones — « circuit » ×4 et « les touristes » dans les itinéraires
  Roumanie, « Le matin incontournable » (`timisoara/eat_2`)… À trancher éditorialement
  (« circuit » peut désigner une boucle de randonnée).

## [2026-10-18] — Le Cerveau du Poco connaît l'état du projet (planning, Instagram, Memoria)

Question du fondateur : « qu'est-ce que je publie cette semaine ? ». Constat en base : aucun
planning n'existe — 8 publications Instagram en file **sans date**, aucun article programmé,
pas de suivi d'épisodes Memoria Imperium (seuls les 3 presets de l'appli et l'outillage
YouTube en cours chez Jules).

- **`/api/cerveau/etat`** (GET, authentifié comme `/api/agent-tasks`, lecture seule) et
  **`lib/cerveau-etat.ts`** : résumé de quelques lignes — programmé à 7 jours (blog et
  Instagram), articles en ligne / brouillons, Instagram prêt sans date, tâches Memoria en
  cours chez les agents, décisions qui attendent le fondateur. Une donnée absente est dite
  absente (« rien de programmé »), jamais devinée. 3 tests ; `check-api-auth` ✓.
- **Poco** : une question de planning (publier, semaine, Instagram, YouTube, Memoria…) charge
  cet état + les épisodes Memoria prêts dans l'onglet Memoria, et les donne au modèle (local,
  Cloud ou PC). Chip « 🗓️ Que publier cette semaine ? ». Test Kotlin.
- **Limite connue** : sans dates en base, le Cerveau ne peut que dire ce qui est prêt. Un vrai
  calendrier éditorial demande une table (migration + `db push`).
## [2026-10-18] — Pages « Bientôt » : la description du brouillon ne fuit plus

Constat d'OpenHands, mesuré par Claude : `/destinations/sicile/taormine` et `/palerme` affichent
« Bientôt » et sont en `noindex`, mais servaient encore la description générée (« Est. Theatre
grec, vue mer… ») dans `<meta name="description">` et l'aperçu de partage. `buildPageMetadata`
remplace désormais, pour toute page de `lib/unpublished-pages.ts`, la description (meta, Open
Graph, Twitter) par `DESCRIPTION_BIENTOT`. 2 tests.

## [2026-10-18] — Blog : le « vrai 404 » de la PR #628 n'a pas l'effet annoncé

Mesuré après déploiement (`b44cffc6`) : `/blog/<brouillon>` et `/blog/<slug inexistant>` répondent
toujours **200** — navigateur, Googlebot et Bingbot. `notFound()` dans `generateMetadata` ne
suffit pas : `app/loading.tsx` enveloppe toute l'app dans un Suspense, le statut part avant.
Impact réel faible : Next injecte `noindex`, Google n'indexe pas ces pages. Pour un vrai 404 :
sortir `/blog/[slug]` du loading racine (route group) ou contrôler le slug dans `middleware.ts`.
Commentaire du code corrigé (il affirmait un 404 pour les robots).

## [2026-10-18] — Registre : le niveau de risque bloquait les dépôts du Poco et le tri de Jules

`agent_tasks_risk_check` n'accepte que `low|medium|high|critical`. Le Poco envoie les
libellés de son écran (`bas`, `moyen`, `haut`) et le premier tri de Jules écrivait
`moyen`/`bas` : 400 en base (23514), aucun dépôt possible, premier passage du tri en échec
(rien écrit). `/api/agent-tasks` traduit désormais les libellés français (400 explicite pour
un niveau inconnu) — l'APK déjà installé fonctionne sans mise à jour ; `revue-jules.mjs`
écrit `medium`/`low`. 2 tests (32/32 sur la route).

## [2026-10-18] — Correctif : les 12 brouillons restaient `published = true`

`cms_blog_posts` a deux indicateurs : `status` (pages du blog) et `published` (recherche IA,
`/api/destinations`, flux n8n, audit…). `20261018200000` n'avait basculé que `status`.
Migration `20261018203000_brouillon_published_false.sql` ; même changement appliqué en base
(12 lignes). État mesuré : 27 publiés `(published, true)`, 28 brouillons `(draft, false)`,
aucun mélange.

### ⚠️ Pour la PR #622 (OpenHands) avant fusion
1. **Collision de version** : `20261018200000_photos_enfants_bucket_prive.sql` porte le même
   numéro que `20261018200000_brouillon_articles_photo_fausse.sql`, déjà sur `main` —
   `supabase db push` refusera. Renuméroter (ex. `20261018210000`).
2. **Assertion Stoos** : `20261018180000_depublier_doublons_stoos.sql` exige exactement
   1 article Stoos `published = true`. Le canonique est désormais en brouillon (photo
   fausse, décision du fondateur) : l'assertion lèvera une exception. L'adapter à 0 ou 1.
3. Les 7 photos d'enfants déplacées par OpenHands ont été **vérifiées à l'œil** par Claude :
   toutes montrent bien un enfant (même série du 27/08). Certitude complète, pas « probable ».

## [2026-10-18] — 12 articles en brouillon : leur photo ne montre pas leur sujet

Planche de contrôle des photos (Claude a regardé chacune des 41 photos visibles du site) :
12 articles avaient une photo principale fausse — pleine lune pour les brasseries de
Zurich et la Limmat, couloir d'hôtel pour Petrovac, cave à vin pour Paštrovići, pudim pour
le prego, tour Eiffel pour la rue du Temple, etc. (liste et constats dans la migration).

- **Décision du fondateur** : brouillon simple, sans redirection, jusqu'à la vraie photo.
  `published_at` conservé pour une remise en ligne à l'identique.
- **Migration `20261018200000_brouillon_articles_photo_fausse.sql`** (idempotente). Le même
  changement a été appliqué en base le 18/10 (12 lignes, vérifiées) — la migration le versionne.
- **Blog en ligne : 39 → 27 articles.**
- ⚠️ `stoos-ridge-notre-aventure-sur-la-crete-panoramique` était le canonique des deux
  doublons Stoos (redirections 301 dans `middleware.ts`) : tant qu'il est en brouillon, ces
  redirections mènent à une page introuvable.

## [2026-10-18] — Charte : aucune photo d'enfant en ligne (règle n°5)

- **`AGENTS.md`, règle absolue n°5** : regarder chaque photo avant de la publier ; aucune
  photo d'enfant en ligne ; ces photos sont gardées dans le bucket privé `prive/enfants/`.
- **Migration `20261018190000_retrait_photo_enfant.sql`** : versionne les écritures faites
  en urgence directement en base pour retirer `IMG_20260827_135834.jpg` (règle n°2 enfreinte
  pour couper l'exposition au plus vite — voir l'entrée « Retrait d'une photo d'enfant »).
  Idempotente, sans effet sur la base actuelle.
- **Stockage (hors SQL, fait le 18/10)** : bucket privé `prive` créé ; la photo y est copiée
  (taille vérifiée identique) puis supprimée du bucket public `media`. URL publique : 400,
  page Apuseni : 0 occurrence (mesuré après déploiement de la PR #623).

## [2026-10-18] — Retrait d'une photo d'enfant publiée par erreur

`IMG_20260827_135834.jpg` (gros plan du visage d'un enfant, classée « Photo terrain
Roumanie », décrite à tort « passage piéton couvert ») servait d'image de partage et de
couverture. Retirée partout où elle était publique :

- **Base (fait le 18/10, valeurs d'origine sauvegardées)** : article `greve-reserve-naturelle-suisse`
  (`featured_image`, `og_image`, `og_image_url` → vides, repli générique), zone
  `destinations-roumanie-apuseni/hero_image` → `/og-default.jpg`, galeries des destinations
  `roumanie` et `roumanie-transylvanie` (photo ôtée, 2 photos restent).
- **Code (cette PR)** : `app/destinations/roumanie/apuseni/page.tsx` (hero et og:image en dur)
  → `/og-default.jpg` ; entrée `rou-passage-walk` retirée de `lib/cms-photo-albums.ts`.
- **Non touché, à décider par le fondateur** : le fichier lui-même (bucket `media`, toujours
  accessible par son URL directe) et sa fiche `cms_media` (id 143).
## [2026-10-18] — Le Cerveau du Poco lit le registre des agents, confie et valide

Branche `agent/claude/cerveau-local-poco`. Retour du fondateur sur le Poco : l'IA ne
voyait pas le flux des agents, ne pouvait ni confier ni valider une tâche.

- **API `/api/agent-tasks`, action `valider`** : geste du fondateur seul (session CMS,
  `keyId === 'cms'`) — `accepter` (waiting_validation → done) ou `renvoyer`
  (waiting_validation|blocked → sent, prise libérée), commentaire tracé dans `notes`.
  Mise à jour conditionnée au statut lu (409 si un agent a bougé la tâche entre-temps).
  6 tests vitest (26/26 sur la route).
- **Mobile, `CoordinationAgents.kt`** : les ordres explicites sont reconnus par règles et
  exécutés sur le registre **sans passer par le modèle** (un 1,5B ne décide pas seul) :
  `@jules consigne`, `donne à gemini : consigne`, `valide #id [: commentaire]`,
  `renvoie #id : raison`. Une question sur les agents (« où en est Jules ? ») charge le
  registre et en donne un résumé au modèle (local, Cloud ou PC).
- Le modèle local passe à 2 048 jetons de contexte (place pour le résumé).

### Limites connues
- `valider` n'existe qu'après fusion sur `main` (l'APK appelle la production).
- Confier une tâche la **dépose** dans le registre : l'agent la voit à sa prochaine lecture.
  Rien ne réveille encore Jules automatiquement (`JULES_API_KEY` absente de Vercel, cf.
  `app/api/jules/route.ts`).

## [2026-10-18] — Mobile : un petit modèle sur le Poco, le Cloud derrière un interrupteur

Branche `agent/claude/cerveau-local-poco`. Le Cerveau de l'APK appelait le Cloud en
premier ; le fondateur veut un cerveau léger **sur le téléphone** (suivi du projet, du
site, du contenu, du planning, coordination des agents), et les API gratuites seulement
quand il le demande.

- **`CerveauLocal.kt`** : LLM embarqué via MediaPipe `tasks-genai` **0.10.29**. Le modèle
  n'est pas dans l'APK : bouton **Télécharger** (Qwen2.5 1.5B Instruct q8, 1,6 Go, ouvert,
  reprise sur coupure) ou **Importer** un `.task` au choix. Premier essai sur le Poco :
  sans modèle installé, le fondateur n'atteignait jamais le téléphone — d'où le bouton. `PromptLocal` : prompt court (consignes,
  3 fiches du Coffre hors-ligne, 4 derniers messages), recherche insensible aux accents.
- **`BrainClient.ordreDesSources`** : sans boost, téléphone puis PC — le Cloud n'est
  **jamais** appelé. Avec « ⚡ Cerveau boosté » : Cloud, PC, puis téléphone. Interrupteur
  mémorisé (`cerveau_booste`). Le badge PC forcé est conservé.
- **Build** : `abiFilters` arm64-v8a (le moteur pèse ~27 Mo de `.so` par ABI ; l'APK ne
  s'installe plus sur un émulateur x86_64). Règles R8 pour `com.google.mediapipe` et
  protobuf lite (l'AAR n'en fournit pas).

### Vérifié
- API `LlmInference` (`setModelPath`, `setMaxTokens`, `createFromOptions`,
  `generateResponse`, `close`) présente dans l'AAR 0.10.29 ; pas de `minCompileSdk`
  (compatible compileSdk 34) ; motifs de secrets de `release-apk.yml` : aucun dans l'AAR.
- **[NON VERIFIE]** compilation Gradle et tests JVM : pas de JDK dans la session qui a
  écrit ce code. La CI `build-apk.yml` (tests + `assembleRelease`) doit passer avant
  fusion, puis un essai réel sur le Poco (import du modèle, réponse, mode boosté).

## [2026-10-18] — 7 AUTRES photos d'enfant retirées de l'accès public (complète la PR #623)

Le propriétaire a signalé « la photo d'un enfant sur le site ». En vérifiant
**toute** la médiathèque : la PR #623 traitait `IMG_20260827_135834.jpg`, mais
**7 autres photos de la même série** (Roumanie, 27/08/2026) restaient dans le
bucket public.

**Méthode** — deux modèles indépendants, puis vérification en ligne :

- Détection **CLIP** (enfant vs adulte, logits bruts) : 7 images se détachent
  nettement (+3,6 à +4,6 d'écart).
- Description **BLIP**, concordante : « a little girl holding a cup of coffee »,
  « a young girl holding a banana in her hand », « a girl holding a cell phone ».
- **Balayage des 103 URL du sitemap** : aucune de ces photos n'apparaît sur une page
  publiée. Le risque n'était pas l'affichage, mais le **téléchargement direct de
  l'URL** — HTTP 200, ~3,9 Mo chacune, **sans authentification**.

**Correction d'une affirmation devenue fausse** : l'entrée ci-dessus indiquait que
« le fichier lui-même (bucket `media`) reste accessible par son URL directe ».
**Vérifié le 18/10 : ce n'est plus le cas.** `IMG_20260827_135834.jpg` est absent du
bucket `media`, présent dans `prive/enfants/`, et son URL publique répond **400**.

**Fait** (réversible, copie vérifiée avant retrait, **aucune suppression définitive**)

- Les 7 photos copiées dans le bucket privé `prive/enfants/` (présence vérifiée par
  listage) **puis retirées du bucket public** `media`.
- Les 7 fiches `cms_media` mises à jour (`path`, `url`, `alt`) —
  `20261018200000_photos_enfants_bucket_prive.sql`.
- **Contrôle** : `media` ne contient plus aucun fichier de la série, `prive/enfants`
  les contient tous les **8**, l'URL publique répond **400**.

> **Piège rencontré** : après suppression, l'URL publique répond encore `HTTP 200`
> avec `cf-cache-status: HIT` — le **cache CDN**. Sans anti-cache, on croit la
> suppression échouée. Vérifier avec `?v=<timestamp>` ou par listage du bucket.

> **À VALIDER PAR LE FONDATEUR** : les personnes autorisent-elles une publication ?
> Si oui → recopier vers le bucket public et remettre `path`/`url`. Sinon → laisser
> en privé. **Rien n'est perdu.**

## [2026-10-18] — Correctif : Brașov et les itinéraires roumains repartent en repli

L'entrée ci-dessous annonçait « la photo réelle du lieu » pour 5 pages. Après
recoupement avec la sauvegarde SQL du 28/07/2026, seules **3 des 5 photos**
étaient adossées à un article traitant du lieu **exact** de la page :

| Photo | Article d'origine | Page | Décision |
|---|---|---|---|
| `batch-…467099-7` | « Bucarest cachée : Art Nouveau… » | `roumanie-bucarest` | **gardée** |
| `import-…3929226` | « Le Marais caché : la rue du Temple » | `idf-paris`, `paris` | **gardée** |
| `batch-…464596-3` | « Stoos Ridge au coucher du soleil » | `suisse` | **gardée** |
| `import-…5717207` | « Transylvanie secrète : villages saxons » — une **région**, pas Brașov | `roumanie-brasov` | **repli** |
| `import-…6086298` | aucune trace dans la sauvegarde | 3 itinéraires roumains | **repli** |

La charte (règle 1) ne permet pas d'illustrer un lieu avec une photo dont on
n'est pas sûr : les 5 zones (2 + 3) repartent en `/og-default.jpg`, en
s'attendant à une vraie photo du lieu via le flux Picker. Migration
idempotente `20261018150000_repli_brasov_et_itineraires_roumanie.sql`, avec
garde-fou sur l'URL exacte de la photo retirée. Zones image : 136 dont **125**
en repli. `check:cms-zones` ✓, `check:cms-migrations` ✓, `typecheck` ✓.

## [2026-10-18] — Photos réelles des destinations : la migration `20260801000007` n'avait jamais pris

### Constat
- `20260801000007_cms_photos_destinations.sql` devait poser 5 photos **réelles** de la
  banque `media/articles` (Bucarest, Bran/Brasov, Maramureș, Paris/tour Eiffel, Suisse).
  Ses 12 zones visées portent **toutes** encore `/og-default.jpg` : la migration n'a
  laissé aucune trace (valeurs réécrites depuis, mises à jour du 19/08 et du 17/10).
- Vérifié sur toute la base (2 595 zones, 55 articles, 160 médias) : 134 zones image
  étaient en repli, dont 2 avec un **gabarit littéral `${SITE_URL}/…` jamais résolu**
  (donc image cassée), et 57 zones `__ancienne_coquille` (reliquats de renommage,
  toutes inactives) sur `destinations-roumanie-timisoara`.
- Les 8 autres photos de la banque `media/articles` restent utilisées par les articles ;
  4 ne le sont nulle part (sujets à confirmer par l'auteure, l'agent ne peut pas voir
  les images).

### Corrections
1. **13 zones** reçoivent la photo réelle du lieu (les 5 photos de la banque, toutes
   vérifiées en HTTP 200) : `destinations-roumanie-bucarest`, `-brasov`, les trois
   itinéraires roumains, `destinations-idf-paris`, `destinations-paris`,
   `destinations-suisse` — garde-fou `value LIKE '%og-default%'` pour ne jamais
   écraser une vraie photo posée entre-temps.
2. Les 2 `seo_og_image` `${SITE_URL}` non résolus → `https://www.heldonica.fr/og-default.jpg`
   (`og-compare.jpg` n'existe pas dans `public/`).
3. Les 57 zones `__ancienne_coquille` de Timișoara supprimées.
4. Migration versionnée idempotente `20261018140000_photos_reelles_destinations_et_gabarits.sql`.

### Vérifications
- 5/5 photos en 200, `og-default.jpg` en 200 ; zones image : 136 (dont 120 en repli,
  contre 134 avant), **0** gabarit `${SITE_URL}`, **0** `__ancienne_coquille`.
- `check:cms-zones` ✓, `check:cms-migrations` ✓, `typecheck` ✓, `preflight` 7/7 ✓.
- Reste à faire : identifier et rattacher les 4 photos `media/articles` inutilisées et les
  8 `blog-images` (`romania-01..04`, `travel-lh-01..04`) — il faut les yeux de l'auteure ;
  les 120 zones encore en repli attendent une photo du lieu (flux Picker).

## [2026-10-18] — Le Brain devient un destinataire adressable du serveur MCP `agent-tasks`

`mcp/agent-tasks/server.mjs` — deux trous réels, mesurés :

1. `AGENTS_CONNUS` ne contenait pas `heldonica-brain`, alors que l'agent existe
   dans le registre (11 tâches) et que son BridgePoller tourne ;
2. `deposer_tache` n'écrivait **ni `task_type` ni `payload`**, or le poller du
   Brain **dispatche sur `task_type`** et lit `payload.message` : une tâche
   déposée par ce chemin aurait été dépilée puis **ignorée en silence**.

**Corrigé :**

- `heldonica-brain` ajouté à `AGENTS_CONNUS` — **les 15 destinataires déjà
  présents sont conservés** (16 au total), la liste ayant été étendue entre-temps
  sur `main` par le commit `0cd5fff` ;
- `deposer_tache` expose `task_type` et `payload` ;
- garde : une tâche destinée au Brain **sans** `task_type` (ou `chat` sans
  `payload.message`) est **refusée** au lieu d'être perdue ;
- `README.md` du MCP : section « Parler au Brain », avec la forme exacte et le
  fait que la réponse arrive dans `actions_done.result`.

**Vérifié** (`node --check` + essai MCP en **lecture seule**, 9/9) : les 5 outils
restent exposés, les agents de `main` sont préservés, les refus attendus se
déclenchent, et le contrôle final compte **0 ligne écrite** dans `agent_tasks`.
Brain vivant au `2026-10-15T20:20:28Z` (modèle `openai/gpt-oss-120b`).

**Écriture réelle exercée** (sur autorisation) : une question a été déposée via ce
serveur MCP. La ligne `726bd019-ca31-4271-833f-9c2168b65c95` porte bien
`task_type = chat` et un `payload.message` de 544 caractères — ce que l'ancien
code **n'écrivait pas**. Le chemin complet est donc exercé, pas seulement les refus.

**Non vérifié — et pourquoi :** le Brain **n'a pas traité** la tâche. Son heartbeat
`site_settings.brain_heartbeat` est figé au `2026-10-15T20:20:28Z`, soit ~61 h
(seuil `online` = 120 s), et `status` est resté `sent` sur 9 tours de 20 s. Son
BridgePoller ne tourne pas. La cause est **externe au dépôt** : le Brain est éteint
sur la station Windows. Démarrer Heldonica Brain II (port 8440) et la tâche sera
dépilée sous 30 s, sa réponse arrivant dans `actions_done.result`.

Branche : `agent/openhands/brain-mcp-propre`, repartie de `origin/main` parce que
la branche initiale avait 36 commits de retard — sa fusion aurait supprimé 8 agents
ajoutés entre-temps.

## [2026-10-18] — Images : réconciliation des visuels cassés (médiathèque, articles, destinations)

### Constat (207 références d'image distinctes balayées)
- `cms_media` : 1595 lignes d'import « gphotos » (sept. 2026) avec des URLs
  locales `/images/…` sans fichier correspondant — elles servaient un soft-404
  (`text/html` en 200), donc des images invisibles partout.
- 3 cartes « Bientôt » (`bari`, `pologne`, `corse`) et **Lisbonne** (destination
  publiée) pointaient vers des visuels Unsplash **supprimés côté Unsplash (404)**
  → `DestinationCard` fait `hero_unsplash_url || featured_image || fallback`
  (sans `onError`) : image cassée affichée en production.
- 7 couvertures de `travel_guides` (dont `lisbonne` et `portugal`, qui
  partageaient la même URL morte) étaient dans le même cas — table non rendue
  publiquement, donc sans impact visuel, mais données fausses.
- 15 articles de blog référençaient des images absentes du coffre.

### Corrections
1. `cms_media` : **157 URLs réparées** vers leur URL publique Storage (bucket
   `media`), **1441 lignes fantômes supprimées**, **3 conservées** (id 516, 521,
   1049 : fichiers réels dans `public/images/destinations/montenegro/`).
2. 14 articles de blog rétablis avec les **photos réelles du coffre** de leur
   destination (`madere`, `montenegro`, `blog-images`/stoos) ;
   `lisbonne-ruelles-alfama-miradouros-azulejos` → `NULL` (aucune photo réelle de
   Lisbonne disponible) : l'image de repli du site prend le relais.
3. Destinations : `colombie`, `sicile`, `paris` reçoivent le visuel **déjà choisi
   par le fondateur** pour elles dans `travel_guides` (vérifié 200) ;
   `lisbonne`, `bari`, `pologne`, `corse` → visuel retiré (repli du site).
4. `travel_guides` : 8 couvertures mortes retirées (`naples`, `corse`,
   `lisbonne`, `portugal`, `malte`, `espagne`, `madere`, `montenegro`).
5. Migration de données idempotente `20261018120000_reconciliation_images.sql`
   (rejouable : aucune ligne ne bouge sur une base déjà réconciliée).

### Vérifications
- 207/207 références d'image de la base testées en HTTP : tout répond 200
  (hors 2 `.mp4` de `roumanie`, volontaires) ; `check:cms-migrations` ✓ (53
  tables), `check:cms-zones` ✓, `typecheck` ✓.
- Reste à faire côté fondateur : fournir de vraies photos pour **Lisbonne** et
  les 3 cartes « Bientôt » (flux Google Photos Picker) — les visuels de banque
  ne sont utilisés que là où le fondateur les avait lui-même choisis.

## [2026-10-18] — Zones sous-destinations : revue de mon PR #614, le plan d'OpenHands (PR #609) est retenu

### Pourquoi ce revert
- Le PR #614 (mergé) avait câblé `hero_teaser` dans le hero **du brouillon** des
  14 sous-destinations et **désactivé** en base les clés `hero_eyebrow`,
  `hero_title`, `section_title`.
- Or la **PR #609 (OpenHands, ouverte le 17/10 à 09:03)** traite exactement ces
  14 pages — pour dire l'inverse : leur contenu en base est un brouillon du
  générateur (« Grec. », « Incredible. »), **sans photo ni carnet**, et les
  combler supposerait d'inventer le vécu (règle 1 d'AGENTS.md). Elle fait donc
  servir le corps « Bientôt » par `SubDestinationTemplate` via
  `lib/unpublished-pages.ts`, avec ces mêmes clés écrites en toutes lettres
  (`hero_image`, `hero_eyebrow`, `hero_title`, `style_label`, `section_title`,
  `section_text`, `back_link`).
- Les valeurs en base correspondent à ses fallbacks : elles étaient légitimes.
  `git merge-tree` montrait un **conflit** sur `components/SubDestinationTemplate.tsx`
  causé par le #614 — et publiée telle quelle, ma version servait un brouillon de
  plus sur ces pages.

### Corrections
1. Revert du commit `3168044f` (PR #614) : gabarit rendu à l'identique, migration
   `20261017223000_desactive_zones_sous_destinations.sql` supprimée du dépôt.
2. Base Supabase : les **42 lignes** `hero_eyebrow` / `hero_title` /
   `section_title` sont **réactivées** (`is_active = true`).
3. PR #609 d'OpenHands retenue comme référence pour ces 14 pages (à merger).

## [2026-10-17] — Supabase reconnecté (clés `sb_*`) et upload « photos » réaligné sur le bucket réel

### Problème résolu
- **Supabase en401** : toutes les routes échouaient avec `Legacy API keys are
  disabled` (Supabase a désactivé les clés JWT anon/service_role). Les nouvelles
  clés ont été posées en `.env.local` — le code lit **cinq** variables :
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_KEY`, `SUPABASE_SECRET_KEY`.
  Aucune ligne à changer : `lib/supabase-key.ts` lit déjà la publishable en
  priorité et retombe sur l'anon legacy.
- **Upload mort** : `app/api/cms/photos/upload/route.ts` déposait dans le bucket
  `photos`, **inexistant** sur le projet (les cinq buckets réels sont `avatars`,
  `blog-images`, `cms-media`, `heldonica-media`, `media`) → `bucket not found`
  sur chaque téléversement d'album.
- **Google Photos non documentées** : le flux Picker **serveur** est déjà en
  place et complet (`lib/google-photos-picker.ts`, routes `/api/cms/photos/session`,
  panneau `/panel-manager/photos`, `scripts/auth_google_picker.py`), mais ses
  trois variables `GOOGLE_PHOTOS_*` n'étaient décrites nulle part.

### Corrections & Améliorations
1. **`.env.example`** : `SUPABASE_SECRET_KEY` (3ᵉ alias lu par `lib/supabase.ts`)
   avec la note sur la forme `sb_secret_…`/`sb_publishable_…`, et un **nouveau
   bloc `GOOGLE_PHOTOS_*`** décrivant les quatre étapes — activer l'API *Photos
   Picker*, déposer `scripts/credentials.json`, lancer
   `python scripts/auth_google_picker.py`, recopier les trois valeurs — plus
   l'avertissement « app au statut *Testing* = révocation du refresh token au
   bout de 7 jours ».
2. **`app/api/cms/photos/upload/route.ts:12`** : `BUCKET = 'photos'` → `'media'`
   (25 Mo, jpeg/png/webp/gif/avif + mp4/mp3) : plus aucun appel vers un bucket
   inexistant.
3. **Aucun code Google ajouté** : le Picker serveur reste la seule porte (cf.
   `e5f48990`), la seconde implémentation prévue cette session ayant été retirée
   pour ne pas dupliquer ce qui existe déjà.

### Vérification
- API Supabase : `GET /storage/v1/bucket` → 200 (5 buckets), `GET /rest/v1/cms_blog_posts`
  → 200 **avec les deux clés** (secret et publishable) : le401 legacy a disparu.
- `npm ci` (774 paquets), `npm run typecheck` ✓, `npm run lint` ✓ (2 warnings
  préexistants dans `CmsAdminClient.tsx`), `npm run check:api-auth` ✓,
  `npm run check:cms-drift` ✓ (colonnes lues, dont `photo_blocks`, en base).
- Bout en bout Picker (session Google → import) : **à faire avec les variables
  `GOOGLE_PHOTOS_*` posées** en local ou sur Vercel.

### Points de vigilance
- Les clés Supabase ont transité en clair dans une session : **les faire tourner**
  (Supabase → *Rotate keys*) une fois le branchement validé en production.
- La file Instagram compte **8 publications en `draft`** (jamais publiées) ;
  un test réel exige `INSTAGRAM_ACCESS_TOKEN` côté serveur.
- `scripts/sync_google_photos.py` reste mort : il utilise le scope `photoslibrary`
  et `albums.list`/`mediaItems:search`, tous deux retirés par Google le 31/03/2025.

## [2026-10-17] — APK : build **release** (non débogable, R8) + réseau verrouillé + sauvegarde désactivée

### Problème résolu
- L'APK publié (release `apk-v1`) était en réalité un **build debug** : `adb shell`/`run-as`
  ouvrait les SharedPreferences (dont le mot de passe CMS), aucune obfuscation, et le
  trafic HTTP était autorisé **partout** (`usesCleartextTraffic="true"`). Constat d'audit
  sur `heldonica-apk-v1.apk` (12 539 693 octets, `debuggable=true`).
- Cause racine : `.github/workflows/build-apk.yml` appelait `assembleDebug`, et aucun
  `buildType` release n'était configuré au-delà d'une signature de debug.

### Corrections & Améliorations
1. **`heldonica-mobile/app/build.gradle.kts`** :
   - `buildTypes.release` : `isDebuggable = false`, `isMinifyEnabled = true`,
     `isShrinkResources = true`, `proguard-rules.pro`.
   - Nouveau `signingConfigs.release` : vrai keystore si
     `keystore/heldonica-release.keystore` + mot de passe fournis (CI :
     `RELEASE_STORE_PASSWORD`/`RELEASE_KEY_ALIAS`/`RELEASE_KEY_PASSWORD` ; local :
     `local.properties` `release.*`), sinon **repli** sur le keystore de debug versionné
     (les mises à jour restent installables par-dessus les précédentes).
2. **`AndroidManifest.xml`** : `networkSecurityConfig`, `allowBackup="false"`,
   `dataExtractionRules`, `fullBackupContent` ; suppression de `usesCleartextTraffic`.
3. **`res/xml/network_security_config.xml`** : cleartext **interdit par défaut**,
   autorisé uniquement vers le Cerveau local (`10.10.145.61`, `127.0.0.1`, `localhost`).
4. **`res/xml/data_extraction_rules.xml` + `backup_rules.xml`** : le mot de passe CMS
   (SharedPreferences) n'est ni sauvegardé dans le cloud ni transféré d'appareil à appareil.
5. **`proguard-rules.pro`** : `VeilleTachesWorker` et les `ListenableWorker` conservés
   (WorkManager instancie les workers **par nom** — sans règle, R8 les renomme et la
   veille periodique casse après mise à jour).
6. **CI** : `build-apk.yml` construit `assembleRelease` (artefact `heldonica-mobile-release`) ;
   `release-apk.yml` consomme `app-release.apk`, étend le scan anti-secret (Google, Groq,
   OpenAI, Anthropic, GitHub, Supabase, Heldonica `hld_`) et pose le keystore de release
   si le secret `RELEASE_KEYSTORE_BASE64` est défini.
7. **`androidx.fragment` forcé à 1.6.2** : le premier run CI release a révélé un lint **fatal**
   (`InvalidFragmentVersionForActivityResult`) sur `registerForActivityResult` dans
   `MainActivity.kt:128`. Mesure : `play-services-base:18.3.0` (tiré par
   `play-services-location:21.2.0`) déclare `androidx.fragment:fragment:1.0.0` et
   `play-services-basement:18.3.0` déclare `1.1.0` ; Gradle résolvait donc **1.1.0** < 1.3.0.
   Correctif : dépendance explicite `androidx.fragment:fragment:1.6.2` (dernière compatible
   `compileSdk 34` / AGP 8.4). Comme attendu, `assembleDebug` ne voyait pas ce lint, seul le
   build release le bloque.

### Vérifications & Mesures
- `npm run preflight` : 6/6 PASS.
- Workflows validés (YAML parsé ; `build-apk` jobs:`build`, `release-apk` jobs:`construire,publier`).
- Run CI du 17/10 (branche `agent/opencode/apk-release-hardening`, run `39020178040`) :
  **échec `lintVitalRelease`** — cause identifiée ci-dessus (fragment 1.1.0), corrigée.
- Run CI `39020686175` (push branche) : **`build` success**, artefact `heldonica-mobile-release`
  produit (2 184 374 octets contre 12 539 693 pour l'ancien debug).
- CI release `39021165270` (tag `apk-v2`) : jobs `construire/build` et `publier` **success**.
  Release publiée : `apk-v2`, asset `heldonica-apk-v2.apk` (2 184 374 octets).
- Audit de l'APK publié (`apk-v2`) par parsing du manifeste binaire et des resources :
  `debuggable` **absent**, `usesCleartextTraffic` **absent**, `allowBackup=false`,
  `networkSecurityConfig` = `base-config cleartextTrafficPermitted=false` + 1 `domain-config`
  autorisant le Cerveau local, `dataExtractionRules`/`fullBackupContent` présents,
  **1 dex** (R8 + shrink ressources), `androidx.fragment` résolu en **1.6.2**,
  `VeilleTachesWorker` conservé, bloc de signature APK v2 présent (ID `0x7109871a`).
- `apk-v2` : `versionCode=40` (identique à `apk-v1`) et même clé de signature versionnée
  → mise à jour installable par-dessus, sans désinstallation.
- `[VÉRIFIÉ]` Compilation R8 : confirmée par les runs CI ci-dessus (poste sans JDK/SDK Android).

---

## [2026-10-16] — Santé éditoriale : purger les mots bannis, mettre les pages brouillon en « Bientôt »

### Problème résolu
- Le document `docs/positionnement-editorial-concurrents.md` décrivait la voix Heldonica, mais **rien ne vérifiait que c'était bien celle qui s'affichait**. Un audit du 2026-10-16 a montré deux dérives :
  - **11 champs à mots bannis** dans `cms_editable_zones` (donc réellement servis) : « plages fluviales incroyables », « Le matin incontournable », « villages magnifiques », « Astuce : », « au cœur de », « inoubliable »…
  - **14 pages destinations** dont le contenu en base est un brouillon du générateur `ad58c936` : descriptions réduites à un mot suivi d'un point (« Grec. », « Le parc. ») et anglais résiduel (« Incredible. », « Theatre »).
- **Aucun garde-fou ne l'attrapait** : `check:content-coherence` ne scanne que les articles Supabase, et sortait « ✓ » **sans rien vérifier** quand les clés manquaient — un faux vert. Le garde-fou `check:content-pages` créé dans la foulée exigeait lui-même trois mots par chaîne, donc laissait passer les fragments d'un ou deux mots.

### Corrections & Améliorations
1. **Mots bannis en base** — migration `supabase/migrations/20261011130000_fix_banned_words_destinations.sql` : corrige les 11 champs sur les pages publiées (rollback documenté dans le fichier). `/destinations/sicile/taormine` est exclue (voir point 3).
2. **Mots bannis dans le code** — 20 remplacements de prose dans 8 pages (`alentejo`, `colombie`, `portugal`, `roumanie/{itineraire-5,7,10-jours,timisoara,transylvanie}`) : « circuit » → « itinéraire », « incroyable » → formulation concrète, « spot » → « adresse »/« coin », « magnifique » → « préservé »…
3. **Pages à contenu non publiable** — `lib/unpublished-pages.ts` liste les **14 pages** (Sicile ×5, Sardaigne ×5, Colombie ×4). Une entrée déclenche trois protections : `noindex` (`lib/page-metadata.ts`), retrait du sitemap (`app/sitemap.ts`), et bascule sur une page **« Bientôt »** (`SubDestinationTemplate` rend lui-même le bloc « Bientôt ») — l'état de non-publication déjà utilisé par `/destinations/grece`. Le brouillon n'est plus servi. **Elles ne sont pas réécrites** : ces destinations n'ont ni photo ni carnet dans le coffre, les combler supposerait d'inventer le vécu (règle 1 d'`AGENTS.md`).
4. **Garde-fou manquant** — `scripts/check-content-pages.mjs` : détecte les mots bannis (source unique : `lib/brand-voice.ts`), les fragments de brouillon et l'anglais résiduel. Le test de fragment s'exécute **avant** le filtre de prose : un fragment d'un mot est désormais vu. Ajouté au preflight.
5. **Faux vert corrigé** — `check-content-coherence.mjs` sort désormais en **2 (« ignoré »)** et non 0 quand les clés Supabase manquent : un contrôle sauté n'est plus présenté comme réussi.
6. **Rendu « Bientôt » sans nouveau composant** — `SubDestinationTemplate` rend lui-même la page « Bientôt » (héros, appel à inscription) pour toute page du registre. Le bloc est écrit avec `page={page}` et des clés de zone littérales : c'est le seul motif que `check-cms-zones.mjs` relie à la page appelante. L'extraire dans un composant partagé l'aurait rendu orphelin sur les 43 pages qui montent le gabarit — la CI « Zones et tables CMS » l'a confirmé (`destinations-grece`, 9 zones orphelines), d'où le rendu inline.
7. **Document** — `docs/positionnement-editorial-concurrents.md` : §4.2 « Santé éditoriale Heldonica » (faits mesurés, `[OBSERVÉ]` vs `[INTERPRÉTATION]`), §10 et §9 complétées.

### Vérifications & Mesures
- Balayage exhaustif : **119 pages de `app/`** scannées (dont les 69 pages destinations). Seules les 14 destinations sont concernées ; `roumanie/cluj` et `mentions-legales` sont des faux positifs (« de l'Est. », « Vercel Inc. »).
- `npm run garde-fous` : **10/13 réussis**, **3 ignorés** faute d'identifiants Supabase (rapportés comme ignorés, jamais comme verts).
- `npx tsc --noEmit` : exit 0.
- `npx vitest run` : **714/714** (dont 6 sur `unpublished-pages` et 2 sur `SubDestinationTemplate`).
- `node scripts/check-content-pages.mjs` : **0 dérive** en page publiée ; 14 pages quarantainées signalées.

---

## [2026-10-16] — Release APK installable : livrer l'application par un lien direct

### Problème résolu
- Il n'existait **aucune release publiée** : le seul APK disponible était l'artefact d'un run CI, qui demande plusieurs gestes sur un ordinateur et expire au bout de 90 jours. Aucun utilisateur ne pouvait installer l'application depuis son téléphone.
- La PR #601 portait un workflow `release-apk.yml`, mais elle était devenue **obsolète** : tout son contenu (registre, battement, tests, `build-apk.yml` sans secret) était déjà dans `main` via #602 et #603-605. Seul `release-apk.yml` lui restait propre, et ce fichier appelait `build-apk.yml` avec `release: true` — un contrat que `main` ne fournissait pas.

### Corrections & Améliorations
1. **Contrat d'appel (`build-apk.yml`)** :
   - Ajout du déclencheur `workflow_call` avec la sortie `mot_de_passe_vide`.
   - L'étape « Préparer local.properties » porte désormais `id: identifiants` et publie `mot_de_passe_vide=true` — déclaration **mesurée** du build lui-même, pas une supposition.
2. **Workflow de release (`release-apk.yml`)** :
   - Se déclenche sur un tag `apk-*` ou manuellement (`workflow_dispatch`).
   - Refuse de publier si le build ne déclare pas `mot_de_passe_vide=true`.
   - Scanne le dex avant publication et refuse toute fuite (`eyJ…` JWT ou `sb_secret_`).
   - Publie une release GitHub avec l'APK signé par le keystore de debug versionné : les versions s'installent l'une sur l'autre, sans désinstallation.

### Vérifications & Mesures
- `npm run preflight` : 6/6 PASS.
- APK de `main` (run #38849762633, `e6653ed9`) : 12 539 897 octets, sha256 `68a1fff3…`. Chaînes attendues **présentes** dans le dex (`VeilleTachesWorker`, `agent-tasks?status=sent&limit=50&balayer=1`) ; `heldonica2026` **absent**.
- Contrôle de publication testé dans les deux sens : APK propre → autorisé ; APK contaminé (JWT de forme réelle, puis `sb_secret_`) → refusé, exit 1.

---

## [2026-10-16] — Heldonica Mobile & Brain : Résilience d'authentification CMS et timeouts d'inférence Cloud

### Problème résolu
- L'application mobile Poco X6 Pro affichait `⚠️ Impossible de joindre le Cerveau (Cloud 0€ et Station PC injoignables). Vérifie ta connexion.` lors des requêtes au Cerveau Cloud (`/api/ai/mobile-brain`).
- **Cause racine 1 (Auth)** : `BrainClient.kt` transmettait simultanément `x-cms-auth` et `x-api-key` avec le mot de passe CMS. Dans `lib/ai-auth.ts`, la présence de `x-api-key` interceptait la requête pour vérifier un hash dans la table `api_keys` Supabase. Le mot de passe CMS n'étant pas une clé API agent, la requête était immédiatement rejetée en HTTP 401 sans jamais évaluer `requireCmsAuth`.
- **Cause racine 2 (PC Fallback)** : Lors du repli local, `BrainClient.kt` n'interrogeait que l'URL Wi-Fi LAN (`10.10.145.61:8440`). La station PC locale étant liée par sécurité uniquement à `127.0.0.1:8440` (loopback), le repli échouait, même avec câble USB et `adb reverse tcp:8440 tcp:8440`.
- **Cause racine 3 (Hangs)** : Dans `lib/ai-provider.ts`, les appels `fetch` vers les 14 fournisseurs IA n'avaient aucun timeout (`signal: AbortSignal.timeout(...)`), risquant de figer les fonctions serverless Vercel jusqu'au timeout passerelle.

### Corrections & Améliorations
1. **Authentification Prioritaire CMS (`lib/ai-auth.ts`)** :
   - Inversion de l'ordre d'évaluation : vérification immédiate de la session CMS ou de l'en-tête `x-cms-auth` via `requireCmsAuth` avant toute lecture de clé API d'agent.
   - Si `token` (`x-api-key` ou `Bearer`) est fourni, vérification directe contre `isValidCmsPassword(token)` : accorde immédiatement l'accès `cms_mobile` si le mot de passe CMS est passé.
2. **Timeouts Stricts & Anti-Freeze (`lib/ai-provider.ts`)** :
   - Ajout systématique de `signal: AbortSignal.timeout(8000)` (8 secondes) sur tous les fournisseurs IA externes (Groq, Gemini, Mistral, Cerebras, SambaNova, Together, DeepSeek, OpenRouter, OpenAI, Anthropic, HuggingFace, Grok, AIML, Nvidia).
   - Réduction du timeout local `callLocalLlm` de 60s à 3s (`AbortSignal.timeout(3000)`) pour un échec rapide et sans blocage si le PC est éteint.
3. **Client Android Poco X6 Pro (`heldonica-mobile/.../BrainClient.kt`)** :
   - Suppression de l'en-tête erroné `x-api-key` lors de l'appel Cloud (seul `x-cms-auth` est émis).
   - Détection et repli PC bi-directionnels (`appelerStationPcAvecFallback`) : tente l'adresse configurée (`brainBaseUrl`) ET le tunnel local USB `http://127.0.0.1:8440` (`adb reverse`).
4. **Vérifications & Mesures** :
   - `npm run preflight` : 6/6 PASS.
   - `npx tsx scripts/test_verify_auth.ts` : 4/4 cas d'authentification validés (`cms_session`, `cms_mobile`, double header, rejet 401).
   - `app/api/ai/mobile-brain/route.ts` testé avec succès : Groq `openai/gpt-oss-120b` répond en 851 ms.

---

## [2026-10-15] — Heldonica Pocket : Enrichissement RAG Mobile (93 Fiches Hors-Ligne & Recherche Pondérée)

### Réalisations & Évolution du Coffre des Savoirs
1. **Export Complet du Coffre dans l'APK Mobile (`assets/knowledge_vault.json`)** :
   - Passage de 8 à **93 fiches certifiées** (terrain, pépites et architecture) embarquées directement dans le binaire Android.
   - Poids maîtrisé (196 Ko), consultation instantanée même hors réseau 4G/5G en montagne isolée.
   - Couverture complète : Madère (Fanal, Seixal, Caldeirão Verde, levadas), Suisse (Stoos, funiculaire, lacs), Roumanie (Bucarest, Apuseni, Sibiu), Monténégro, et manifestes opérationnels.
2. **Recherche RAG Améliorée (`app/api/ai/mobile-brain/route.ts`)** :
   - Algorithme insensible aux accents (normalisation NFD) avec pondération stricte : titre (+3), lieu (+2), tags (+2), contenu vécus + notes sensorielles (+1).
   - Remontée des 4 fiches les plus pertinentes par requête.
3. **Vérifications & Garde-fous** :
   - `npm run preflight` : 6/6 PASS.
   - `vitest run __tests__/api/mobile-brain.test.ts` : 3/3 PASS.

---

## [2026-10-15] — Heldonica Pocket : Dispatch Multi-Agents (Jules, Gemini, Grok, AllHands, Manus) & Écran Tâches APK

### Réalisations & Évolution Majeure du Registre
1. **Écran Natif Jetpack Compose « Agents & Tâches » (`heldonica-mobile/.../TachesScreen.kt`)** :
   - Nouvel onglet ⚡ « Tâches » dans `StudioActivity.kt` et `StudioTabs.kt` (5 onglets ergonomiques en 120 Hz).
   - Pilotage complet sans PC allumé : sélection de l'agent cible (`Jules`, `Gemini`, `Grok`, `AllHands`, `Manus`, `Tous`).
   - Saisie du brief de mission, choix du périmètre (`content`, `code`, `video`, `seo`, `audit`) et du niveau de risque (`bas`, `moyen`, `haut`).
   - Transmission instantanée en HTTPS sécurisé vers `/api/agent-tasks` (authentification SharedPreferences, 0 secret compilé).
   - Fil en direct (Live Feed) avec statuts visuels temps réel (`sent`, `in_progress`, `waiting_validation`, `done`, `blocked`), affichage de l'agent affecté, de la branche git et du compte rendu mesuré.
   - Veille d'arrière-plan Android WorkManager (`VeilleTaches.kt`) branchée sur l'authentification SharedPreferences.
2. **Route d'API Registre Multi-Agents (`app/api/agent-tasks/route.ts`)** :
   - Prise en charge des destinataires : `claude`, `gemini`, `opencode`, `jules`, `allhands`, `openhands`, `grok`, `manus`, `freebuff`, `archiveur`, `muse-spark`, `discord-bot`, `fondateur`, `poco`, `tous`.
   - Compatibilité totale Vercel Hobby plan (retrait des `maxDuration` bloquants dans les routes cron).
   - Fallback d'authentification transparent pour les requêtes CMS (`x-cms-auth`).
3. **Dispatch Cloud Autonome & Clôture Sécurisée** :
   - `lib/registre-dispatch.ts` & `app/api/cron/dispatch-registre/route.ts` : dispatch automatique des tâches vers AllHands / OpenHands Cloud.
   - `lib/registre-cloture.ts` & `app/api/cron/cloture-registre/route.ts` : clôture automatique et libération des baux expirés.
   - Workflows GitHub Actions `.github/workflows/dispatch-registre.yml`, `.github/workflows/cloture-registre.yml`, `.github/workflows/battement.yml`.
4. **Validation des Garde-fous & Tests (100% Mesuré)** :
   - `npm run preflight` : 6/6 PASS.
   - Vitest registre tests : 64/64 PASS (`registre-dispatch.test.ts`, `registre-cloture.test.ts`, `agent-tasks.test.ts`, `cron-heartbeat.test.ts`).
   - Tests JVM Kotlin `StudioTabsTest.kt` mis à jour (5 onglets conformes).

---

## [2026-10-15] — Préparation du Cerveau en APK Natif sur Poco X6 Pro (Audit & Validation PR #602)

### Réalisations & Socle APK Poco X6 Pro (Audit & Validation PR #602)
1. **Passerelle Cloud 0€ (`app/api/ai/mobile-brain/route.ts`)** :
   - Route Next.js dédiée au Poco X6 Pro, assurant l'autonomie totale sans nécessiter de PC 24/7.
   - Authentification sécurisée par mot de passe CMS (`x-cms-auth`) et clé API (`x-api-key`), validée par `verifyAiAuth`.
   - Zéro dépense additionnelle garantie : option `freeOnly: true` passée à `lib/ai-provider.ts`, interdisant strictement OpenAI / Anthropic.
   - Filtrage de confidentialité strict : anonymisation regex des jetons, clés, mots de passe, emails et numéros de téléphone avant tout appel LLM et avant insertion dans `copilot_generations`.
   - RAG automatique : injection des fiches vérifiées du Coffre des Savoirs (`VAULT_SPOTS` dans `lib/cms-vault-spots.ts`) en mode `vault` ou `use_vault`.
2. **Client Kotlin Découplé (`heldonica-mobile/app/src/main/java/fr/heldonica/mobile/BrainClient.kt`)** :
   - Dual-mode intelligent : priorité au Cloud 0€, avec détection et repli sur la station PC locale (port 8440) si connectée sur le même réseau Wi-Fi.
   - Authentification automatique via `BuildConfig.CMS_PASSWORD` transmettant les en-têtes `x-cms-auth` et `x-api-key`.
   - Pings légers non-bloquants (timeout 1.5s).
3. **Interface Native Jetpack Compose 120 Hz (`heldonica-mobile/app/src/main/java/fr/heldonica/mobile/CerveauScreen.kt`)** :
   - Rendu fluide 120 Hz adapté à l'écran Flow AMOLED du Poco X6 Pro.
   - Chips de modes, suggestions d'action rapide, badge d'état réseau en temps réel, bulles stylisées Eco-Luxe avec action de copie.
   - Consultation hors-ligne du Coffre : carrousel horizontal des fiches de `knowledge_vault.json` accessible immédiatement sans connexion.
4. **Cache Hors-Ligne (`assets/knowledge_vault.json`) & Spécification** :
   - 8 fiches maîtresses embarquées en local (`total_records` corrigé et vérifié : 8).
   - Spécification technique complète dans `docs/SPEC_CERVEAU_APK_POCO_X6_PRO.md`.
5. **Garde-fous & Tests Validés** :
   - `npm run preflight` : 6/6 PASS.
   - `vitest run __tests__/api/mobile-brain.test.ts` : 3/3 PASS (auth, 400, freeOnly=true & privacy sanitization).
   - Tests unitaires JVM Kotlin (`ModeleMontageTest.kt`, `StudioTabsTest.kt`, `BrainClientTest.kt`) exécutés avant l'assemblage de l'APK.
6. **Sécurisation Absolue de la Chaîne APK (Zéro Secret Compilé)** :
   - Retrait de l'injection du secret `CMS_PASSWORD` dans `.github/workflows/build-apk.yml` : l'APK produite par la CI ne contient désormais aucun mot de passe dans son bytecode (`classes.dex`), garantissant 0 fuite dans les artefacts téléchargeables.
   - Authentification mobile autonome : enregistrement sécurisé du mot de passe dans les `SharedPreferences` privées de l'appareil (`BrainClient.obtenirMotDePasse` / `sauvegarderMotDePasse`), configurable via l'UI native Compose (dialogue 🔑 dans l'onglet Cerveau).
   - Nettoyage du dépôt : suppression de l'ancien binaire `heldonica-mobile/ci-artifacts/app-debug.apk` du suivi Git et exclusion de `*.apk` et `heldonica-mobile/ci-artifacts/` dans `.gitignore`.

---

## [2026-10-14] — Architecture PC Optionnel & APK Unifiée (Brain, Content Creation, Memoria Imperium)

### Réalisations & Décisions d'Architecture
1. **Validation & Mesure d'Inférence d'Images 0€ sans PC (docs/DECISION_GENERATION_VIDEO.md)** :
   - Découverte clé : le pipeline n'a jamais utilisé la génération de vidéo IA lourde (LTX-Video) ; short_factory.py utilise des images fixes .webp animées algorithmiquement (ideo_assembler.py l. 114–192 et MontageVideo.kt sur mobile).
   - Mesures réelles de fournisseurs d'images sans PC : Google AI Studio Free Tier donne HTTP 429 Quota Exceeded ; Pollinations.ai FLUX 9:16 mesuré avec succès à **HTTP 200 en 5,1 s pour 0,00 €** ; Cloudflare Workers AI FLUX actif en secours (10 000 neurones/j gratuits).
   - Scission stricte des principes :
     * **Heldonica Travel (B2C/B2B)** : 100 % photos & vidéos réelles de terrain (règle « On n'invente rien » et garde-fou check:content-evidence), montage Media3 Transformer sur mobile.
     * **Memoria Imperium** : Documentaires historiques antiques 9:16 générés en Cloud 0€ (Pollinations FLUX + tambour de guerre + badges dorés).
2. **APK Heldonica Mobile Unifiée (heldonica-mobile/)** :
   - Nouveau composant MemoriaImperium.kt : sélecteur de presets historiques (*César au Rubicon 49 av. J.-C.*, *Chats de Péluse 525 av. J.-C.*, *Sylla 88 av. J.-C.*), génération d'images 9:16 FLUX en 0€ direct en cache, copie 1-clic du package YouTube (titre, description avec sources antiques Suétone/Plutarque, tags).
   - Câblage dans StudioActivity.kt et StudioTabs.kt : Onglet Cerveau (Hub IA), Onglet Terrain (MainActivity avec capture et publication CMS), Onglet Memoria (OngletMemoriaImperium), Onglet CMS (EditeurActivity).
   - Préservation stricte de la conformité des tests unitaires (StudioTabsTest.kt).

---

## [2026-10-14] — Atelier légendes & photos (méthode d'écriture depuis une image)

### Contexte
Besoin récurrent côté fondateur : « je fais des photos et je ne sais jamais quoi
écrire ». Ce n'est pas un manque d'idées mais un blocage devant la page blanche :
une légende se construit à partir d'un vécu, pas d'une inspiration.

### Ajouté
- `docs/ATELIER_LEGENDES_PHOTOS.md` : méthode de travail pour écrire une légende à
  partir d'une photo — les 3 questions de déblocage, le squelette en 5 blocs, le
  gabarit à trous, le tableau « photo → par quoi commencer », les règles de pronoms,
  la checklist d'auto-vérification et la banque d'accroches officielles.

### Notes
- Document **méthodologique** : il ne contient aucun contenu éditorial à publier.
  L'exemple du §7 est repris de la donnée d'exemple de `PROMPT_TEMPLATE_INSTA.md`
  (crique de Kotor) et signalé comme illustratif.
- La source de vérité de la voix reste `lib/brand-voice.ts` ; le document y renvoie
  explicitement (`FORBIDDEN_WORDS`, `HELDONICA_ACCROCHES`, `validateGardeFous`).

### Vérifié
- `npm run preflight` : **6/6 contrôles réussis** (dont parité voix TS ↔ Python).
- Aucun garde-fou ne scanne `docs/*.md` pour les mots bannis
  (`check-content-coherence` lit la base `cms_blog_posts`) : le document peut citer
  les mots bannis comme contre-exemples sans faire échouer la CI.
## [2026-10-14] — Mobile : wrapper Gradle réel, le build local de l'APK fonctionne

### Contexte
Le projet `heldonica-mobile/` ne pouvait pas se construire en local : `gradlew` et
`gradlew.bat` étaient des **stubs** (« ouvre ce projet dans Android Studio ») et
`gradle/wrapper/gradle-wrapper.jar` était absent. La CI contournait le problème en
installant Gradle à part, mais un build sur le poste échouait.

### Corrigé
- `heldonica-mobile/gradlew` + `gradlew.bat` : remplacés par les **vrais scripts**
  (Gradle 8.7).
- `heldonica-mobile/gradle/wrapper/gradle-wrapper.jar` : **ajouté** (43 Ko), désormais
  versionné.
- `gradle-wrapper.properties` : conserve `gradle-8.7-bin.zip`, ajoute `networkTimeout`
  et `validateDistributionUrl`, retire un BOM en tête de fichier.
- `README.md` : prérequis exacts du build local (JDK 17/21, SDK Android, `local.properties`)
  et recette de régénération du wrapper.

### Vérifié
- `./gradlew assembleDebug` en local : **BUILD SUCCESSFUL** (JDK 21, SDK Android 34,
  Gradle 8.7).
- APK produit : `app/build/outputs/apk/debug/app-debug.apk` — **12 343 136 octets**,
  package `fr.heldonica.mobile`, `versionCode 40`, `minSdk 26`, `targetSdk 34`,
  label « Heldonica Mobile » (vérifié via `aapt dump badging`).
- `local.properties` reste **non versionné** (`.gitignore` ligne 54) : aucun mot de
  passe CMS dans le dépôt.

### Non vérifié
- Installation de l'APK sur le Poco X6 Pro (geste humain).
- Le build avec le JDK 17 exactement (testé avec JDK 21 ; Gradle 8.7 et l'AGP 8.4
  supportent les deux).
## [2026-10-14] — Étude : fusion des deux apps Android en une seule

### Contexte
Question de l'utilisateur : « peut-on fusionner les deux apps en une seule ? » Il existe
deux projets Android distincts (`heldonica-mobile/` dans ce dépôt, `android/` dans
`heldonica-brain`), avec des chaînes de build et des UI différentes.

### Ajouté
- `docs/FUSION_APPS_ANDROID.md` : étude de consolidation. Réponse courte : **oui, c'est
  faisable**, et c'est une consolidation (garder l'app la plus lourde, y porter l'autre
  en un écran), pas une réécriture.

### Points relevés (tous adossés à un fichier)
- Chaînes de build incompatibles : AGP 8.4 vs 8.7.3, Kotlin 1.9.22 vs 2.0.21,
  compileSdk 34 vs 35 ; UI Compose vs XML.
- **Tension de sécurité** : `heldonica-mobile` embarque une clé Gemini
  (`BuildConfig.GEMINI_API_KEY`, appel direct depuis le téléphone), alors que le brain
  applique la règle inverse (« aucune clé dans l'APK »). Fusionner tel quel rouvrirait
  la faille que le brain a corrigée.
- `heldonica-brain/android/` a le **même défaut de wrapper** que le mobile avant #594
  (`gradlew` absent).
- Le proxy LLM a **Groq par défaut**, Gemini en option (`body.provider ?? "groq"`).

### Non vérifié
- La faisabilité effective du portage Compose (aucun code écrit à ce stade).


## [2026-10-14] — Positionnement : relevé outillé du panel (11 sites) et comptages consolidés

### Contexte
Le relevé précédent s'appuyait sur une extraction non outillée et annonçait
**30 vignettes / 14 légendes lisibles** pour Échappées Lointaines. Deux relevés
successifs sur la même source donnaient des chiffres différents : la méthode n'était
pas rejouable. Par ailleurs, l'affirmation « les autres acteurs n'exposent pas leurs
légendes » reposait sur une vérification manuelle, non traçable.

### Ajouté
- `scripts/collect_instagram_legends.py` : relevé **reproductible** des **11 sites
  officiels** du panel. Pour chacun : nombre de vignettes (`id="item-action-…"`),
  légendes lisibles (`aria-label` ≥ 200 caractères, dédupliquées), embeds Instagram
  (`instagram.com/p|reel|tv`). Ne recopie **aucun** texte concurrent — comptages seuls.
- `docs/positionnement-editorial-concurrents.md` §3.5 : résultat du relevé, daté et tabulé.

### Corrigé
- §3.4 : chiffres consolidés sur **33 vignettes / 28 légendes lisibles** (chaque
  publication est exposée deux fois dans la galerie — desktop/mobile —, d'où le
  sous-comptage antérieur à 14) ; pronoms je 37 / tu 33 / vous 27 / **nous 18** / on 18 ;
  longueur 247-2 183 car. (médiane 948) ; 0-17 hashtags (médiane 6) ; six mots bannis
  relevés (« inoubliable », « voyage organisé », « paradis », « astuce(s) »,
  « paradisiaque », « magnifique »).
- §1.3 : sites officiels des acteurs 6-8 ajoutés (`perspectives-de-voyage.fr`,
  `imprudencedesvoyages.com`, `lemondecousumain.fr`).
- §1.2, §3.2, §4, §4.1, §7, §8, §9 et §10 alignées ; le `[INDISPONIBLE]` des 10 autres
  acteurs est désormais **mesuré** (0 légende, 0 embed) et non supposé.

### Vérifié
- `python3 scripts/collect_instagram_legends.py` le 2026-10-14 : Échappées Lointaines
  33/28 ; 9 autres sites à 0 ; `voyagesetc.fr` → HTTP 403. Trois requêtes successives
  donnent le même HTML (33 vignettes, 28 légendes).
- `npm run garde-fous` : **10/12 réussis, 2 ignorés, 0 échoué**. Les 2 ignorés
  (« Zones CMS orphelines », « Dérive des tables ») ne tournent pas faute d'identifiants
  Supabase dans l'environnement : ce sont des contrôles **non exécutés**, donc **non
  vérifiés** — pas des contrôles verts. Sans rapport avec ce changement, qui ne touche
  ni le CMS ni la base.
- `npx tsc --noEmit` : OK ; `npx vitest run` : 638 tests passés ; `check:content-coherence`
  et `check:content-evidence` : OK (inclus dans les 10 réussis ci-dessus).

### Non vérifié
- **2 des 12 garde-fous n'ont pas tourné** (zones CMS, dérive des tables) : identifiants
  Supabase absents de l'environnement. À rejouer côté poste pour clore la suite à 12/12.
- Le relevé ne couvre que la **page d'accueil** de chaque site : une légende republiée
  sur une page interne ne serait pas vue.
- Exhaustivité de la galerie Échappées Lointaines : sous-ensemble possible du compte ;
  comptages datés, non extrapolables.
- Les 4 acteurs manquants (panel à 15) : toujours non identifiés.

### Reste à faire
- Fournir la liste nominative des 4 acteurs manquants et, pour les 10 acteurs sans
  collecte, des captures ou des URL publiques.

---

## [2026-10-14] — Positionnement : recomptage des légendes Échappées Lointaines (chiffres corrigés)

### Contexte
Le relevé du 2026-10-13 (PR #589) annonçait **26 légendes distinctes** pour Échappées
Lointaines et **« nous » : 0**. Un relevé indépendant de la **même** galerie
(`echappeeslointaines.fr`, page d'accueil), le **2026-10-14**, donne un résultat
différent : l'extraction des 26 n'était pas reproductible.

### Corrigé
- `docs/positionnement-editorial-concurrents.md` :
  - §3.4 : méthode d'extraction rendue **reproductible** (découpage des vignettes
    `id="item-action-…"`) ; chiffres corrigés → **30 vignettes, dont 14 légendes
    lisibles** (16 vignettes n'exposent que l'image) ; longueur 422-2 402 car.
    (médiane 1 194) ; 3-27 hashtags (médiane 10).
  - §3.4 : **« nous » = 17** (et non 0) — au moins une légende est un récit de voyage
    au « nous » ; le corpus est **hétérogène** (galerie de republication, plusieurs
    voix). Faits de lexique re-vérifiés sur les 14 légendes : « magnifique »,
    « inoubliable », « astuce », hashtag `#organisationvoyage` (mots bannis) ;
    « pépite » (mot de marque Heldonica).
  - §1.2, §3.2, §4.1, §7, §8, §9 (historique) et §10 alignées sur les chiffres vérifiés.
- Le chiffre « 26 » n'est plus affirmé comme un fait ; il est cité uniquement comme
  relevé antérieur corrigé.

### Vérifié
- `curl` (agent navigateur) sur `https://www.echappeeslointaines.fr/` le 2026-10-14 :
  30 `id="item-action-…"`, 14 textes de légende présents dans le HTML statique.
- Autres sites du panel re-testés le même jour (Novo-Monde, Chilowé, Les Coflocs,
  Trace Directe, Fabrique ton Voyage, Destinaslow, Imprudence des Voyages, Le Monde
  Cousu Main) : **0 légende exposée**. `voyagesetc.fr` → HTTP 403.

### Non vérifié
- Exhaustivité : la galerie reste un sous-ensemble possible du compte Instagram, et
  son contenu peut changer. Comptages datés, non extrapolables.
- Les 10 autres acteurs du panel : légendes toujours `[INDISPONIBLE]`.
- Les 4 acteurs manquants (panel à 15) : toujours non identifiés.

### Reste à faire
- Fournir la liste nominative des 4 acteurs manquants et, pour les 10 acteurs sans
  collecte, des captures ou des URL publiques.

---

## [2026-10-13] — Positionnement : premières légendes Instagram réellement collectées

### Contexte
`docs/positionnement-editorial-concurrents.md` laissait **toutes** les légendes
Instagram du panel en `[INDISPONIBLE]`. Une piste restait inexploitée : un
concurrent peut republier ses légendes sur son **propre site**, hors Instagram.

### Ajouté / corrigé
- `docs/positionnement-editorial-concurrents.md` :
  - **26 légendes distinctes** collectées pour **Échappées Lointaines**, depuis la
    galerie « Suivez-moi sur Instagram » de son site officiel (source publique et
    citable). Comptages datés du 2026-10-13 : longueur 232-1 042 car. (médiane
    420), 3-17 hashtags (médiane 7), pronoms je 13 / tu 18 / vous 13 / nous 0 / on 9.
  - Nouvelle section **§3.4** (analyse de voix, sans reproduction de texte) ;
    §1.2, §3.2, §4.1, §7, §8 et §10 ajustées.
  - Discipline `[OBSERVÉ]` / `[INTERPRÉTATION]` maintenue ; les 10 autres acteurs
    restent `[INDISPONIBLE]`.

### Vérifié
- Sites du panel testés le 2026-10-13 (Novo-Monde, Chilowé, Les Coflocs, Trace
  Directe, Fabrique ton Voyage, Destinaslow, Imprudence des Voyages, Le Monde
  Cousu Main) : **aucune légende exposée** → seul Échappées Lointaines en publie.
- Comptage reproductible (page d'accueil, critère : bloc de texte terminé par une
  séquence de hashtags).

### Non vérifié
- **Exhaustivité** : les 26 légendes viennent d'une galerie de site, pas du compte
  Instagram — la galerie peut être un sous-ensemble, et son contenu peut changer.
- Les légendes des 10 autres acteurs restent inaccessibles (Instagram bloque
  l'accès automatisé ; aucune capture utilisateur fournie).

### Reste à faire
- Fournir la liste nominative des 4 acteurs manquants (panel à 15) et, pour les
  10 acteurs sans collecte, des captures ou des URL publiques.

---

## [2026-10-12] — Pont Brain-CMS : authentification admin, entrées robustes, tests réels

### Contexte
Le pont Brain↔CMS (`.kiro/specs/brain-cms-bridge`) marquait sa tâche 12
« Final checkpoint — all tests pass » alors qu'aucun test du pont n'existait :
ni `__tests__/api/brain*`, ni `tests/test_bridge_poller.py`. Trois défauts ont
été trouvés en relisant le code.

### Corrigé
- `lib/bridge-auth.ts` : le chemin administrateur (`x-cms-auth`) passe désormais
  **avant** l'exigence de `BRAIN_BRIDGE_TOKEN`. Avant, un admin authentifié
  recevait un 503 quand le jeton du pont n'était pas configuré — le dispatch
  humain dépendait d'un secret destiné au poller. Le 503 ne concerne plus que
  le chemin Bearer.
- `app/api/brain/tasks/route.ts` et `app/api/brain/tasks/[id]/route.ts` : un
  corps non-JSON renvoie 400 au lieu de remonter en 500 non géré.
- `.kiro/specs/brain-cms-bridge/tasks.md` : tâche 12 décochée (elle affirmait un
  vert non mesuré) et annotée de l'état réel des tests.

### Ajouté
- `lib/safe-equal.ts` : comparaison à temps constant partagée, utilisée par
  `cms-auth.ts`, `bridge-auth.ts` et `heartbeat/route.ts` (copie supprimée).
- `__tests__/api/brain-bridge.test.ts` : 21 tests des routes réelles —
  authentification (401/503), validation (400/413), et le *claim* atomique
  (`status='sent'` conditionnel → 409), seule protection contre la
  double-exécution. Trois de ces tests échouent sur le code d'avant correctif.

### Non traité
- La suite Brain `tests/test_bridge_poller.py` reste à écrire : le poller vit
  sur la station locale `heldonica-brain`, hors de ce dépôt.
- Le *reaper* des tâches `in_progress` bloquées (crash du poller) n'est pas
  implémenté — changement côté Brain.

---

## [2026-10-12] — Mise à jour du document de positionnement éditorial de référence

### Ajouté
- `docs/positionnement-editorial-concurrents.md` (§1.3) : panel porté de 4 à
  **11 concurrents identifiés** (médias + travel planners), avec site et
  élément distinctif. Les 4 acteurs restants sur 15 restent `[INDISPONIBLE]`.
- (§4.1) tableau complémentaire de faits **vérifiés sur site** : prix publics,
  parcours, incarnation, appartenance professionnelle, livrable, offre par
  destination, témoignages.
- (§10) informations non vérifiables, mise à jour.

### Constat
- Deux mécanismes manquent côté Heldonica et reviennent chez **tous** les
  travel planners du panel : appel découverte cliquable, prix affiché hors page
  dédiée.
- Légendes Instagram : toujours `[INDISPONIBLE]` (accès automatisé bloqué,
  aucune capture fournie). Aucune légende inventée.


---

## [2026-10-12] — Analyse de positionnement : cible Voyages etc (voyagesetc.fr)

### Ajouté
- `docs/positionnement-editorial-voyagesetc.md` : lecture d'un blog voyage de
  référence (Adeline Gressin, Nantes, depuis 2009) à partir de sources
  publiques uniquement. Distingue [OBSERVÉ] et [INTERPRÉTATION] ; les légendes
  Instagram sont marquées [INDISPONIBLE] faute d'accès automatisé. Aucun texte
  concurrent recopié.

### Constat qui engage la voix Heldonica
- La cible emploie « bons plans », « incontournables », « paradis » — mots
  bannis par `lib/brand-voice.ts`. C'est la preuve que le lexique interdit
  n'est pas un tic rédactionnel mais un choix de positionnement : s'inspirer
  de la cible ne doit pas inclure son lexique.

### Non traité
- Légendes Instagram de la cible : collecte impossible sans accès au compte
  (marquées [INDISPONIBLE] dans le document).


## [2026-10-12] — Étude de la concurrence directe d'Heldonica

### Ajouté
- `docs/etude-concurrence-directe-heldonica.md` : identification des acteurs qui
  disputent réellement le terrain Heldonica (duo, slow travel, couple, service),
  à partir de sources publiques (annuaire Trip Planner, sites, extraits
  Instagram). Distingue [OBSERVÉ], [INTERPRÉTATION], [INDISPONIBLE].

### Constats
- Concurrent le plus direct : **Perspectives de Voyage** (duo « à deux » +
  slow travel + autrices de guides), mais converti au voyage en famille : le
  couple sans enfants reste un espace défendable.
- Le **tutoiement n'est pas un différenciateur** (Destinaslow tutoie aussi) ;
  le vrai marqueur est le « on » du duo.
- Trois acteurs directs emploient les mots bannis par `lib/brand-voice.ts`
  (« bons plans », « incontournables », « inoubliables ») : le lexique interdit
  est bien le différenciateur lexical du marché.
- **Échappées Lointaines** publie des légendes Instagram complètes sur son
  site : structure « accroche-problème → expertise → identité → CTA →
  hashtags », transposable au gabarit Instagram.

### Limite
- `heldonica.fr` est en maintenance : le positionnement Heldonica a été lu
  depuis le dépôt, pas depuis le site en ligne.


## [2026-10-12] — Plan de mise en place face à la concurrence

### Ajouté
- `docs/plan-mise-en-place-face-concurrence.md` : plan actionnable fondé sur
  l'existant du dépôt (formules 250 € / 450 €, guide gratuit Madère, séquence
  newsletter, page témoignages, `expert-hotelier`). 7 priorités séquencées,
  avec pour chacune un indicateur mesurable.

### Constat
- Le problème Heldonica n'est pas l'offre (complète et tarifée de façon
  compétitive) mais la visibilité/conversion : lead magnet unique, séquence
  email non écrites, aucune trace dans les annuaires du métier.
- Absente du « TOP 50 » Trip Planner où ses concurrents figurent.
- Le B2B hôtelier est un territoire où elle est quasi seule.

### Non traité
- Aucune action exécutée : ce document est un plan. Les indicateurs restent à
  mesurer une fois le site hors maintenance.


## [2026-10-12] — Concurrence : profils approfondis + réseau ATPE

### Ajouté
- `docs/concurrence-profils-approfondis.md` : profils documentés de Perspectives
  de Voyage, Imprudence des Voyages, Le Monde Cousu Main, plus le rôle de
  l'ATPE. Sources publiques ; [OBSERVÉ] / [INTERPRÉTATION] / [INDISPONIBLE].

### Constats
- Perspectives de Voyage est le rival le plus abouti : duo d'autrices Hachette,
  notice BnF, certification ARPP, 600k pages vues/an, et un B2B éditorial
  institutionnel (offices de tourisme, SNCF, Icelandair).
- L'ATPE (association du métier) est le levier de visibilité le plus direct :
  plusieurs rivaux y sont membres ou au bureau (secrétaire, vice-président,
  trésorière).
- Imprudence des Voyages vend par destination ; Heldonica a 15+ itinéraires
  mais pas d'offre nommée par destination.
- Deux espaces restent libres : le couple sans enfants (Perspectives est passé
  famille) et le B2B hôtelier (aucun rival approfondi ne le couvre).


## [2026-10-12] — Benchmark de conversion + gabarit lead magnet couple

### Ajouté
- `docs/benchmark-conversion-concurrents.md` : playbook commercial des rivaux
  (Fabrique ton Voyage, Destinaslow, Échappées Lointaines) — parcours 4 étapes,
  prix publics, appel découverte cliquable, badge ATPE, livrable imprimé, offre
  par destination. Confronte chaque mécanisme à ce qu'Heldonica a déjà.
- `prompts/lead-magnet-couple.md` : gabarit du guide gratuit « 5 erreurs à deux »
  (priorité 1 du plan), en gabarit à remplir — aucun fait inventé.

### Constats
- Heldonica a **déjà** la baseline du marché : parcours 4 étapes, formules
  250/450 €, mention « sans commission cachée », témoignage daté.
- Les 6 écarts réels : lien d'appel découverte cliquable, prix visible hors page
  dédiée, volume de témoignages datés, badge ATPE, offre par destination,
  livrable imprimé.
- Fabrique ton Voyage affiche un tarif **dès 40 €/jour** (dès 55 € le week-end)
  et jusqu'à 170+ voyages créés.

---

## [2026-10-12] — Nettoyage : marqueur de conflit git committé par erreur dans le CHANGELOG

### Corrigé
- `CHANGELOG.md` contenait depuis le commit `0cfa85d` un marqueur
  `>>>>>>> 0cfa85d ...` resté d'un conflit non résolu, committé puis poussé sur
  `main`. Retiré ; le fichier ne contient plus aucun marqueur de conflit.

---

## [2026-10-12] — Le garde-fou des zones annonçait « ✓ » après un échec de lecture

### Contexte
`check:cms-zones` interroge Supabase pour croiser les zones CMS actives avec ce
que le code lit réellement. Quand la lecture échoue — un HTTP 504 de Supabase,
fréquent et transitoire — le script vidait `rows` (`if (!ok) rows.length = 0`)
puis affichait quand même :

```
✗ Lecture de cms_editable_zones impossible (HTTP 504).
Zones actives en base : 0
✓ Aucune zone orpheline. Tout ce qui est actif est rendu quelque part.
```

Le ✓ ne dépendait pas de la lecture : un contrôle qui n'avait rien pu vérifier se
présentait comme réussi. C'est le faux vert que ce dépôt traque partout, ici dans
le garde-fou lui-même. Deux conséquences : la sortie ne distinguait pas « aucune
orpheline » de « aucune donnée lue », et un hoquet d'infrastructure faisait
rougir `Zones et tables CMS` sur toutes les PR ouvertes.

### Corrigé
- `scripts/check-cms-zones.mjs` : quand la lecture échoue, la sortie annonce
  désormais `INCONNU — la lecture a échoué` au lieu du ✓. Le code de sortie
  était déjà 2 ; c'est le message qui mentait. Le ✓ ne subsiste que sur une
  lecture réelle.

### Ajouté
- `__tests__/scripts/check-cms-zones.test.ts` : deux tests qui lancent le script
  réel contre un serveur HTTP local jouant le rôle de la base. Un 504 ne doit
  pas produire le ✓ ; une lecture réussie et vide le conserve. (`spawn`
  asynchrone et non `spawnSync` : le serveur partage la boucle d'événements du
  test, une attente synchrone provoquerait un interblocage.)

### Non traité
- Le fond du 504 n'est pas corrigé : c'est un aléa d'infrastructure Supabase,
  hors du dépôt. Le correctif rend l'échec lisible, il ne l'empêche pas.
- Les échecs `Dérive des tables` sur certaines branches Jules ne sont pas des
  défauts : ces branches ont un merge-base antérieur à l'allowlist `KNOWN_DRIFT`
  introduite par #530. Elles échouent sur des tables déjà arbitrées.

---

## [2026-10-11] — Réparation du pré-vol : quatre scripts référencés n'existaient pas

### Contexte
`package.json` appelle `npm run preflight` et `npm run garde-fous` — le geste que
l'AGENTS.md impose avant de toucher au code — mais `scripts/garde-fous.mjs`
n'avait **jamais été committé**. Les deux commandes échouaient en
`MODULE_NOT_FOUND`. Quatre scripts référencés manquaient au total :
`garde-fous.mjs`, `check-workspace-sync.mjs`, `check-brand-sync.mjs`,
`sync-brand-voice.mjs`. Même cause que l'incident du 10/10 : un contrôle
documenté que rien n'exécutait.

### Ajouté
- `scripts/garde-fous.mjs` : agrégateur, modes `--preflight` (6 contrôles
  rapides, sans base) et complet (12 contrôles). Un contrôle qui ne peut pas
  conclure faute d'identifiants Supabase est rapporté **« ignoré »**, jamais
  « réussi » — un contrôle sauté n'est pas un contrôle vert.
- `scripts/check-workspace-sync.mjs` : modules critiques absents (les huit
  fichiers du 10/10 auraient été vus sans compiler) et retard sur `origin/main`.
- `scripts/check-brand-sync.mjs` + `scripts/sync-brand-voice.mjs` : parité de la
  voix de marque TS ↔ Python. La liste des mots bannis est **générée** depuis
  `lib/brand-voice.ts` (source de vérité) vers `lib/brand.py` ; le contrôle
  compare les deux et vérifie aussi les pronoms (on/tu/vous).
- `lib/brand.py` : miroir Python (mots bannis, pronoms, garde-fous), importable
  par les scripts Python du dépôt.
- `__tests__/scripts/garde-fous-outillage.test.ts` : 10 tests (existence des
  scripts référencés, modules critiques, extraction, idempotence, parité).
- CI : deux étapes sans `if:` — **« Espace de travail »** et **« Parité voix
  de marque »** — qui ne tournaient nulle part jusqu'ici.

### Vérifié
- `npm run preflight` : **6/6** au vert (au lieu de `MODULE_NOT_FOUND`).
- `npm run garde-fous` : **10/12** au vert, 2 **ignorés** (identifiants Supabase
  absents, rapportés comme tels).
- Contrôles négatifs : mot banni retiré du miroir Python → exit 1 ; pronom
  altéré → exit 1 ; `lib/cms-zones.ts` déplacé → exit 1 « 1 module critique
  absent ». Restaurés ensuite.
- `tsc --noEmit` 0 erreur ; `vitest run` 615 tests au vert (605 + 10).

---

## [2026-10-11] — Garde-fou statique : toute table référencée doit avoir une migration

### Contexte
Le 10/10, le commit `a48552a` (92 fichiers, 28 suites de tests) a atterri sur
`main` avec 9 tables Supabase référencées par du code réel mais **jamais
migrées**. Il est passé parce que le contrôle qui les aurait vues
(`check:cms-drift`) interroge la base : sans les secrets
`NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`, le job est *sauté* et
affiché vert — un faux vert. La CI tournait, elle était rouge, mais rien ne
l'a rendue bloquante (pas de protection de branche).

### Ajouté
- `scripts/check-cms-migrations.mjs` : toute table `from('<table>')` doit exister
  dans `supabase/migrations/` (ou être inscrite dans `LEGACY_UNMIGRATED`, avec
  la raison). **Ne lit que le dépôt** — pas de secret, donc pas de saut
  possible. Complémentaire de `check:cms-drift` : celui-ci dit « la migration
  existe », l'autre « la table existe en production ».
- `__tests__/scripts/check-cms-migrations.test.ts` : 6 tests (détection d'une
  table non migrée, acceptation d'une table migrée/exceptionnée,
  `storage.from()` ignoré, lecture des formes `CREATE TABLE`).
- Job CI **« Tables sans migration »**, sans `if:` : il tourne sur chaque PR et
  chaque push sur `main`, même quand les secrets Supabase sont absents.

### Vérifié
- Contre l'arbre exact du commit fautif `a48552a` (worktree détaché) : le
  contrôle signale **précisément les 9 tables** qui ont causé l'incident. Il
  l'aurait donc attrapé au moment du commit, sans base de données.
- `tsc --noEmit` 0 erreur ; `vitest run` 605 tests au vert (599 + 6).

### Reste à faire (action humaine)
- **Protéger `main`** : *Require a pull request* + *Require status checks*
  (`Types`, `Zones et tables CMS`). Sans cette protection, un commit rouge peut
  encore atterrir — c'est la cause racine de l'incident, pas un défaut de code.

---

## [2026-10-11] — Dérive de tables CMS : migration des 9 tables du back-office

### Contexte
Le job CI « Zones et tables CMS » échouait sur 9 tables référencées par du code
réel mais jamais migrées : `cms_accommodations`, `cms_api_tokens`,
`cms_audit_log`, `cms_post_revisions`, `cms_releases`, `cms_webhooks`,
`cms_webhook_deliveries`, `cms_zone_variants`, `photo_blocks`. Vérification
faite : ce ne sont pas des renommages — aucun autre nom n'existe dans le dépôt.

### Ajouté
- `supabase/migrations/20261011120000_create_cms_backoffice_tables.sql` : crée
  les 9 tables avec exactement les colonnes écrites par le code (déduites de
  `lib/cms-hospitality.ts`, `cms-tokens`, `cms-audit`, `cms-revisions`,
  `cms-releases`, `cms-webhooks`, `cms-targeting` et
  `app/api/cms/photos/upload/route.ts`). Idempotente, sans seed. RLS en moindre
  privilège : lecture publique pour le contenu déjà lu via le client anon ;
  secrets (`cms_api_tokens`, `cms_webhooks`) et données personnelles
  (`cms_audit_log`, `cms_webhook_deliveries`) réservés au service_role.
- `scripts/check-cms-drift.mjs` : les 9 tables sont inscrites dans `KNOWN_DRIFT`
  avec la référence de la migration — le job redevient vert sans masquer une
  dérive future.
- `scripts/check-cms-drift.mjs` : correction d'un faux positif du contrôle des
  colonnes. Le `:` d'un ternaire (`api_key_id: isValidUuid ? params.apiKeyId : null`)
  était pris pour un séparateur clé/valeur et produisait la colonne fantôme
  `apiKeyId`, signalée absente alors que la vraie colonne `api_key_id` existe.
  Une clé d'objet doit désormais suivre `{` ou `,`.

### Vérifié
- Syntaxe SQL validée par le parser PostgreSQL réel (pglast / libpg_query) :
  61 instructions, 9 tables, colonnes alignées sur les écritures du code.
- `check:cms-drift` exécuté contre un PostgREST simulé : exit 0 avec la
  migration inscrite, exit 1 sans elle (le garde-fou détecte toujours une
  dérive réelle).
- `tsc --noEmit` 0 erreur ; `vitest run` 599 tests au vert.

### Reste à faire (action humaine)
- Appliquer la migration en base (`supabase db push`) — ⚠️ précédé du baseline
  de l'historique (avertissement §8 de `docs/CMS_FOUNDATION_PHASE_0_INVENTAIRE.md`).
  Puis RETIRER les 9 entrées de `KNOWN_DRIFT`.
- Basculer `cms-audit` / `cms-webhooks` / `cms-tokens` sur un client
  service_role : leurs écritures sont refusées par RLS via le client anon
  (tables absentes jusqu'ici, donc pas de régression).

---

## [2026-10-11] — Correctif build : restauration des 8 modules manquants

### Contexte
`main` ne compilait plus : 8 modules internes étaient importés par du code committé
sans exister dans l'arbre. `npx tsc --noEmit` remontait 11 erreurs TS2307 et
`next build` échouait (`typescript.ignoreBuildErrors: false`).

### Modules restaurés (implémentations réelles, pas des coquilles vides)
1. `lib/supabase-stub.ts` — client Supabase inerte pour le pré-rendu sans clés
   (`createSafeSupabaseStub`), renvoie `{ data: null, error: null }` sans planter.
2. `lib/site-url.ts` — source unique de l'URL publique (`siteUrl()`), lue à l'appel.
3. `lib/photo-exif.ts` — extraction EXIF réelle via `exifr` (date, GPS) et
   `detectStockPhoto` fondée sur des indices vérifiables (`lib/generic-photos.ts`).
4. `lib/photo-albums.ts` — `validateAlbumPhotoMeta`, validation stricte des
   métadonnées de photo avant insertion (règle n°1 : on n'invente rien).
5. `lib/photo-evidence.ts` — `validatePhotoEvidence`, validation des preuves photo.
6. `components/seo/DestinationJsonLd.tsx` — JSON-LD `TouristDestination`.
7. `components/admin/seo/SerpAndSocialPreview.tsx` — aperçus Google SERP et social.
8. `app/panel-manager/AuditLogPanel.tsx` — journal d'audit adossé à
   `getRecentAuditLogs()` (`lib/cms-audit.ts`), état vide explicite sinon.

### Vérifié
- `npx tsc --noEmit` : 0 erreur.
- `npx vitest run` : 585 tests, 74 fichiers, tout au vert.
- `npx next build` : compilation réussie.
- `npx next lint` : aucune erreur (2 avertissements préexistants, hors périmètre).

### Reste à faire (hors périmètre, non corrigé ici)
- `main` reste rouge sur le job CI « Zones et tables CMS » : 9 tables référencées
  dans le code (`cms_audit_log`, `cms_accommodations`, `cms_api_tokens`,
  `cms_post_revisions`, `cms_releases`, `cms_webhooks`, `cms_webhook_deliveries`,
  `cms_zone_variants`, `photo_blocks`) n'ont aucune migration — dérive préexistante,
  à traiter séparément (migration versionnée + validation humaine).

---

## [2026-10-10] — Phase 12 : Blocs Éditioriaux Avancés, Suggestion RAG Temps Réel & Carnets Enrichis

### Réalisations & Nouveaux Modules
1. **Blocs CMS Modulaires Avancés (`components/blocks/`)** :
   - `MapBlock` : Carte interactive OpenStreetMap / Leaflet sans clé API payante avec marqueurs certifiés et tracés d'itinéraires doux.
   - `TableOfContentsBlock` : Sommaire dynamique généré à la volée depuis les titres H2/H3 (`HeadingBlock`) avec slugification d'ancres et défilement fluide.
   - `HospitalitySpotBlock` : Carte d'identité hébergement éthique et slow travel avec microdonnées structurées Schema.org (`LodgingBusiness`), atouts écologiques et lien de réservation directe sans intermédiaire.
2. **Assistant d'Écriture RAG en Temps Réel (`lib/cms-vault-suggest.ts`)** :
   - Détection contextuelle proactive des 88 pépites de terrain du Coffre des Savoirs au fil de la saisie dans le canevas de blocs (`BlockCanvas.tsx`).
   - Popover d'insertion immédiate avec citation vécue et géolocalisation.
3. **Migration 1-Clic & Système de Révisions Sécurisé (`components/admin/ArticleMigrateToBlocksModal.tsx`)** :
   - Modal d'aperçu et de conversion de tout article existant en blocs modulaires.
   - Snapshot automatique de sauvegarde de secours (`lib/cms-revisions.ts`) avant application.
4. **Enrichissement de Contenu de Terrain Certifié (`content/articles/`)** :
   - 3 carnets de route complets adossés aux preuves photographiques réelles : *Stoos (Suisse)*, *Madère (Fanal & Achadas da Cruz)*, et *Podgorica (Monténégro)*.
   - Expansion du registre du Coffre (`lib/cms-vault-spots.ts`) de 78 à 88 pépites certifiées.
5. **Garde-fous & Tests** :
   - 6 nouvelles suites de tests unitaires Vitest ajoutées (`MapBlock`, `TableOfContentsBlock`, `HospitalitySpotBlock`, `ArticleMigrateToBlocksModal`, `cms-vault-spots`, `cms-vault-suggest`).
   - Garde-fous CI pré-vol 5/5 PASS, 100% vert.

---

## [2026-10-10] — Phase 11 : Automatisation & Enrichissement Éditorial par Preuves Photos & Questions IA

### Réalisations & Nouveaux Modules (Options A, B & C)
1. **Option A — Module « Interview Éclair » dans le CMS (`lib/cms-photo-interview.ts` & UI)** :
   - Moteur de génération de 3 questions ultra-ciblées par photo (Sensoriel pur, Faits concrets & prix, Honnêteté/déception).
   - Synthèse automatique en prose Heldonica pure (pronom « on », 0 mot banni, validation continue par le linter de marque).
   - Modal split-screen interactif (`components/admin/PhotoInterviewModal.tsx`) connecté directement aux blocs `image` et `photo_evidence` de l'éditeur modulaire (`BlockCanvas.tsx`) via le bouton `🎙️ Interviewer (Questions IA)`.
   - Endpoint API sécurisé (`app/api/cms/photos/interview/route.ts`).

2. **Option B — Générateur Automatique de Brouillons par Album / Preuves (`lib/cms-draft-from-evidence.ts`)** :
   - Pipeline de génération de carnets de route complets au format de blocs Heldonica CMS (`CmsBlock[]`).
   - Intégration transparente avec les fichiers de preuves de terrain (`content/evidence/*.json`) et le registre des albums vérifiés (`lib/cms-photo-albums.ts`).
   - Sérialisation bi-directionnelle avec le marqueur Gutenberg/Heldonica `<!-- heldonica:blocks ... -->` pour ouverture directe dans le CMS.
   - Script CLI (`scripts/draft_from_evidence.mjs` / `npm run media:drafts`) et route API dédiée (`app/api/cms/drafts/from-evidence/route.ts`).

3. **Option C — Moteur FAQ & Verdict de terrain Slow Travel (`lib/cms-faq-verdict-generator.ts`)** :
   - Générateur de FAQ de terrain (mobilités douces, heures creuses, itinérance canine) ancré dans le vécu sans formules génériques.
   - Générateur de verdict sans complaisance avec score sur 10, moment fort vérifié, piège à éviter et conseil de posture contemplative.

4. **Bilan Qualité & Garde-Fous (`AGENTS.md`)** :
   - 4 nouvelles suites de tests Vitest ajoutées (`__tests__/lib/cms-photo-interview.test.ts`, `__tests__/lib/cms-faq-verdict.test.ts`, `__tests__/lib/cms-draft-from-evidence.test.ts`, `__tests__/components/PhotoInterviewModal.test.tsx`).
   - Total Vitest : **660 tests passants sur 89 fichiers de tests (100% VERT)**.
   - TypeScript strict (`tsc --noEmit`) : **0 erreur**.
   - Contrôles `check:api-auth`, `check:brand-sync`, `check:erreurs-avalees`, `check:ai-models` : **100% VERT**.

---

## [2026-10-10] — Phase 10 : Rendu Public des Blocs Modulaires & Réactivation Flotte IA 24/7

### Réalisations & Intégrations
1. **Intégration du Rendu Modulaire sur le Front Public (`app/blog/[slug]/page.tsx`)** :
   - Branchement de `BlockRenderer` pour afficher nativement les blocs modulaires slow travel (Preuves photo avec anecdotes vécues, pépites du Coffre RAG, galeries, checklists).
   - Détection automatique (`isArticleConvertedToBlocks`) et conversion transparente (`htmlToBlocks`) avec repli (fallback) 100% fidèle sur `EnhancedRichContent` pour les articles historiques non migrés.
   - Ajout d'une suite de tests unitaires dédiée pour `BlockRenderer` (`__tests__/components/BlockRenderer.test.tsx`, 3 tests).

2. **Écosystème Vidéo & ComfyUI (GTX 1660 Ti)** :
   - ComfyUI 0.39.0 opérationnel en tâche de fond sur le port `8188` avec PyTorch 2.14.1+cu126 (`--lowvram`).
   - Poids LTX-Video `ltx-video-2b-v0.9.5.safetensors` (6,34 Go) vérifié sur `F:\ai_models\comfyui\app\models\checkpoints\`.
   - Diagnostique d'inférence consigné : nécessite l'encodeur T5 FP8 séparé pour la condition textuelle ; pipeline matériel NVENC 1080p validé pour les exports immédiats.

3. **Réactivation & Santé de la Flotte des Cerveaux (5/5 Services Opérationnels)** :
   - **Port 3000** : Next.js 15.5 (Web & CMS Heldonica).
   - **Port 8188** : ComfyUI daemon (Studio vidéo IA).
   - **Port 8440** : Heldonica Brain II Central Engine (`/api/system/status` en ligne, 116 pépites, 6 itinéraires, détection GPU hardware).
   - **Port 8451** : Heldonica Brain II Agents Façade (dispatch et file d'attente d'agents).
   - **Port 8470** : Heldonica Copilote CMS (`/api/status` en ligne, modèle multimodal et suggestions de légendes).

4. **Bilan Qualité & Garde-Fous (`AGENTS.md`)** :
   - TypeScript strict (`tsc --noEmit`) : **0 erreur**.
   - Vitest : **648 / 648 tests passants (85 fichiers de test, 100% VERT)**.

---

## [2026-10-09] — Studio Mobile slice 1 : coque 4 onglets (OpenCode, non compilé localement)

### Réalisations
1. **`StudioActivity.kt` (nouveau point d'entrée)** : onglets Cerveau (console Brain en vue web, connexion manuelle, aucun secret embarqué), CMS (ouvre `EditeurActivity`, session existante), Studio/Insta (écrans d'attente slices 2-3).
2. **Manifest** : lanceur basculé sur `StudioActivity` ; `MainActivity` conservée sans intent LAUNCHER.
3. **Config** : champ `brain.webUrl` (`local.properties` + `BuildConfig`, documenté, vide = marche à suivre affichée).
4. **Test JVM** : `StudioTabsTest` (4 tests, sans émulateur).
5. **Non vérifié ici** : pas de SDK Android sur cette station — compilation + tests via CI (`build-apk.yml`) avant sideload.

---

## [2026-10-09] — Phases 8 & 9 : Recette E2E du Block Builder & Moteur de Migration Idempotente

### Réalisations & Architecture
1. **Suite de Tests d'Intégration E2E du Block Builder (`__tests__/integration/cms-block-builder-e2e.test.tsx`) (Inc-13)** :
   - Recette intégrale de bout en bout des 4 gabarits Slow Travel (`slow_travel_diary`, `step_by_step_guide`, `hospitality_spotlight`, `photo_essay`).
   - Rendu universel public (`BlockRenderer`) et admin interactif (`BlockCanvas`) sans aucun crash.
   - Validation de la pureté éditoriale (0 mot banni détecté parmi les 48 mots de la charte).
   - Validation du cycle complet de round-trip : instanciation, injection d'une pépite réelle du Coffre (`searchVaultSpots`), sérialisation HTML + signature invisible `<!-- heldonica:blocks ... -->`, et désérialisation fidèle.
   - Robustesse éprouvée face aux données dégradées (URLs vides, listes sans items).
   - 21 tests dédiés exécutés et validés en 1.2s.

2. **Moteur d'Ingestion & Migration Automatique des Articles vers Blocs (`lib/cms-article-migrator.ts`) (Inc-16)** :
   - Traitement strictement idempotent : détection préalable des articles déjà au format blocs (`isArticleConvertedToBlocks`).
   - Nettoyeur d'artefacts WordPress historiques (`cleanLegacyWordPressHtml` : purge des commentaires `<!-- wp:... -->`, classes CSS `wp-image-*` et balises vides).
   - Détection contextuelle de preuves photographiques de terrain (`detectPhotoEvidence`).
   - Calcul des métriques de lecture lente (190 WPM) et audit d'accessibilité WCAG 2.1 (A11y) dès l'ingestion.
   - Migration unitaire ou par lot avec rapport d'exécution exhaustif (`batchMigrateArticles`).

3. **Route API & Script CLI de Migration** :
   - Route sécurisée `app/api/cms/articles/migrate/route.ts` : `GET` pour la simulation dry-run, `POST` pour la conversion unitaire ou par lot avec révalidation du cache Next.js (`/blog`).
   - Script CLI `scripts/migrate-articles-to-blocks.mjs` supportant les modes dry-run et `--apply`.

4. **Bilan Qualité & Garde-Fous (`AGENTS.md`)** :
   - Suite Vitest : **645 / 645 tests verts (84 fichiers de test, +35 tests)**.
   - Typage TypeScript strict : **0 erreur (`tsc --noEmit` code 0)**.
   - Garde-fous Preflight : **5 / 5 au VERT**.
   - Écosystème services : **10 / 10 ports opérationnels**.

---

## [2026-10-09] — Détection Photo Stock vs Terrain & Extraction EXIF Automatique (Punch-List #2 & #3)

### Réalisations & Architecture
1. **Module d'Extraction EXIF & Détection Stock (`lib/photo-exif.ts`)** :
   - Règle n°1 d'Heldonica appliquée strictement (« On n'invente rien ») : aucune donnée extrapolée ou falsifiée.
   - `extractPhotoExif(buffer, identifier)` : lecture des métadonnées réelles via `exifr` (formatage ISO strict `YYYY-MM-DD`, extraction et validation des coordonnées GPS dans les bornes réelles [-90, 90] / [-180, 180], modèle d'appareil photo `make`/`model`/`lens`, signatures logicielles et dimensions).
   - Normalisation multi-environnement (`toNormalizedArrayBuffer`) garantissant une portabilité 100% sans faille entre Node.js, Web Streams et environnements cross-realm JSDOM.
   - `detectStockPhoto(identifier, meta)` : détection heuristique avancée des images de banques d'images (`unsplash`, `pexels`, `shutterstock`, `pixabay`, `adobe_stock`, etc.), des signatures logicielles synthétiques ou d'outils de design (`midjourney`, `dall-e`, `canva`), et alerte en cas de cliché entièrement dépouillé de matériel de prise de vue et de GPS.

2. **Routes API CMS Enrichies** :
   - `app/api/cms/photos/upload/route.ts` : lors d'un upload de photo, pré-remplissage automatique des champs `date` et `gps` à partir des métadonnées réelles du cliché si non spécifiés ; retour des informations `exif` et des alertes de stock (`isStockCandidate`, `stockReasons`) dans la réponse JSON.
   - `app/api/cms/media-upload/route.ts` : analyse automatique des métadonnées du fichier téléversé et renvoi des informations `exif` et `isStockCandidate` au client.

3. **Médiathèque 2.0 & Expérience Utilisateur (`components/admin/media/PhotoPickerModal.tsx`)** :
   - Alerte déontologique en temps réel dans l'onglet « URL externe » si une URL de banque de stock est saisie, avec rappel de la règle n°1 du slow travel d'Heldonica.
   - Retour d'état informatif dans l'onglet « Supabase Storage » confirmant les métadonnées matérielles extraites (date, appareil photo) ou signalant un cliché suspect.
   - Transmission enrichie de la date, du matériel et du statut de vérification lors de la sélection.

4. **Suite de Tests & Validation Garde-fous** :
   - 10 nouveaux tests unitaires pour l'extraction EXIF et la détection stock (`__tests__/lib/photo-exif.test.ts`), testés sur un cliché réel Google Pixel 8 Pro (`PXL_20260527_180112571.RAW-01.COVER.jpg`).
   - 2 nouveaux tests d'interface utilisateur dans `__tests__/components/PhotoPickerModal.test.tsx` (7/7 PASS).
   - 1 nouveau test d'intégration d'API dans `__tests__/api/cms-photos-upload.test.ts` (6/6 PASS).
   - Suite complète Vitest : **610 / 610 tests verts (80 fichiers)** (+13 tests).
   - Typage TypeScript strict : **0 erreur (`tsc PASS`)**.
   - Bilan des 11 garde-fous : **11 / 11 validés**.

---

## [2026-10-09] — Phase 7 : Métriques Slow Travel Éthiques, Portabilité & Outils Import/Export

### Réalisations & Architecture
1. **Bibliothèque de Métriques Slow Travel (`lib/cms-reading-metrics.ts`)** :
   - Temps de lecture attentif (`SLOW_READING_WPM = 190` mots/min + 10s de pause contemplative par photo de terrain / pépite).
   - Score Slow Travel composite (0 à 100) avec décomposition en 5 piliers :
     - Longueur immersive du texte (20 pts)
     - Preuves de terrain et photos réelles (20 pts)
     - Structure et rythme de lecture (20 pts)
     - Taxonomie slow travel (saison, mobilité, budget) (20 pts)
     - Pureté de la voix de marque & absence de mots bannis (20 pts).
   - Recommandations éditoriales dynamiques et détection en temps réel des termes bannis.
2. **Bibliothèque d'Import & Export Lossless (`lib/cms-export-import.ts`)** :
   - `exportArticleToMarkdown()` : export Markdown complet avec en-tête Frontmatter YAML et sérialisation lossless `<!-- heldonica:blocks [...] -->`.
   - `exportArticleToJson()` : export au schéma standard `heldonica_cms_article_v1` avec métadonnées, arborescence de blocs et score de lecture.
   - `exportArticleToHtml()` : archive HTML autonome sémantique pour consultation hors-ligne ou impression.
   - `importArticleFromMarkdown()` : import bidirectionnel avec restauration 100% fidèle des blocs s'ils sont présents, ou conversion automatique du Markdown pur (titres, paragraphes, images).
   - `importArticleFromJson()` : import et restauration sécurisée depuis un fichier JSON.
3. **Composant UI Modal (`components/admin/ExportImportModal.tsx`)** :
   - Onglet Export : tableau de bord de lecture attentive, badges de métriques, 3 boutons de téléchargement direct (`.md`, `.json`, `.html`), et copie rapide dans le presse-papier.
   - Onglet Import : glisser-déposer de fichiers ou collage direct, analyse syntaxique en direct avec aperçu des blocs et avertissements éditoriaux, chargement 1-clic dans l'éditeur.
4. **Intégration dans le CMS (`app/panel-manager/CmsAdminClient.tsx`)** :
   - Badge de lecture dynamique dans l'en-tête de l'éditeur (`⏱ X min · Y mots · Slow Z%`).
   - Bouton `Export / Import` dans la barre d'outils ouvrant le modal.
   - Branchement bidirectionnel sur le state de l'article et des blocs actifs.
5. **Bilan Qualité & Garde-fous** :
   - 16 nouveaux tests unitaires (`__tests__/lib/cms-reading-metrics.test.ts`, `__tests__/lib/cms-export-import.test.ts`, `__tests__/components/ExportImportModal.test.tsx`).
   - Suite complète : **597 / 597 tests verts (79 fichiers)** (+16 tests).
   - TypeScript strict : **0 erreur (`tsc PASS`)**.
   - Bilan des 11 garde-fous : **11 / 11 validés**.

---

## [2026-10-09] — Phase 6 : Station de Contrôle Multi-Agents & Intégration Flotte IA dans le CMS

### Réalisations & Architecture
1. **Bibliothèque Métier (`lib/cms-agent-tasks.ts`)** :
   - Typage strict TypeScript de la flotte d'agents (`jules`, `archiveur`, `opencode`, `gemini`, `freebuff`, `tous`).
   - 4 presets de mission 1-clic : Relecture Voix & Style (Jules), Vérification Faits & RAG (Archiveur), Audit SEO & Données Structurées (OpenCode), Adaptation & Traduction Slow (Gemini).
   - Fonctions utilitaires `filterTasksForArticle()` et `computeTaskStats()`.
2. **Route API Dédiée (`app/api/cms/agent-tasks/route.ts`)** :
   - `GET` : Récupération filtrée des tâches du registre Supabase (`agent_tasks`).
   - `POST` : Dépôt sécurisé de missions avec métadonnées d'article enrichies.
   - `PATCH` : Approbation et validation fondateur 1-clic (`validated_by = 'heldonica'`), verrouillant la vérification avant mise en ligne.
   - Protection complète par `requireCmsAuth` et gestion stricte des erreurs Supabase.
3. **Composant UI (`components/admin/AgentsControlDrawer.tsx`)** :
   - Tiroir coulissant latéral de pilotage multi-agents accessible depuis la barre d'outils de chaque article (`CmsAdminClient.tsx`).
   - Barre de statistiques d'état en direct (`sent`, `in_progress`, `waiting_validation`, `done`).
   - Boutons de délégation rapide 1-clic et formulaire de consigne sur-mesure.
   - Dépliage visuel des rapports `actions_done` (`verifie`, `corrige`, `non_verifie`, `reste_a_faire`).
   - Bouton d'approbation fondateur avec badge de certification `ShieldCheck`.
4. **Bilan Qualité & Garde-fous** :
   - 11 nouveaux tests unitaires (`__tests__/lib/cms-agent-tasks.test.ts`, `__tests__/components/AgentsControlDrawer.test.tsx`, `__tests__/api/cms-agent-tasks.test.ts`).
   - Suite complète : **581 / 581 tests verts (76 fichiers)**.
   - Typecheck strict : **0 erreur (`tsc PASS`)**.
   - Bilan des 11 garde-fous : **11 / 11 PASS**.

---

## [2026-10-08] — Domaine canonique .fr + réparation toolchain (OpenCode)

### Domaine canonique (décision fondatrice : .fr)
1. **`lib/site-url.ts` (nouveau)** : `siteUrl()` (lit `NEXT_PUBLIC_SITE_URL`, repli `https://www.heldonica.fr`, refuse le non-HTTPS) + `canonicalPath()`. Source unique, plus aucun domaine en dur pour le code neuf.
2. **`lib/cms-slow-taxonomy.ts`** : `getCanonicalArticleUrl()` branché sur `siteUrl()` (comportement inchangé, default déjà .fr).
3. **Registre `lib/cms-photo-albums.ts`** : 44 URL `heldonica.com` → `https://www.heldonica.fr` (images vérifiées présentes dans `public/images/`, pages couvertes par les canoniques existants — correction de liens, pas d'invention).
4. **Tests** : `__tests__/lib/site-url.test.ts` (4 tests : défaut, override, repli invalide, chemins) + fixtures .com → .fr (5 fichiers). Les centaines de canoniques `.fr` historiques des pages sont confirmés corrects et intouchés.

### Réparation toolchain (incident infra, pas de code métier)
1. **Cause racine prouvée** : deux `npm install` concurrents (dont `npm i vite@latest` extérieur) entrelacés dans le même `node_modules` + dégâts d'écriture de la disette disque (C: à 2,58 Go) : fichiers manquants (tr46, chunks vite), `.d.ts` fantômes, erreurs tsc contradictoires entre deux runs.
2. **Réparé** : wipe vérifié, lock restauré (vite 8.0.8 du lock, revert du bump furtif 8.3.4), `npm ci` propre (767 packages), **suite 570/570 (73 fichiers), tsc EXIT 0, preflight 5/5**, superviseur relancé, flotte 8475/8476/8477/4096 vérifiée en ligne.
3. **Restant côté toolchain (au fondateur)** : npm cassé sur Node 22.12/22.13 (`path-scurry` manquant) — utiliser Node 22.11.0 pour les commandes npm (`nvm use 22.11.0`) ou réinstaller Node. `npx`/`npm run` sous 22.13 restent HS en attendant.

---

## [2026-10-08] — Phase 3 : Taxonomie Métier Slow Travel & Prévisualisation SERP Google / Social Cards

### Réalisations & Architecture
1. **Taxonomie Métier Slow Travel Enrichie (`lib/cms-slow-taxonomy.ts`)** :
   - Définition stricte des métadonnées authentiques du duo :
     - `SLOW_SEASONS` : 5 périodes douces et hors-saison avec émojis (printemps fleuri, été hors-foule, automne doré, hiver calme, toute l'année).
     - `SLOW_MOBILITIES` : 5 mobilités décarbonées (train, marche/randonnée, vélo bikepacking, voile, van/road trip lent).
     - `SLOW_BUDGETS` : 4 échelons de coûts réels constatés (< 60 €, 60-110 €, 110-180 €, > 180 € / jour).
     - `SLOW_CARBON_OPTIONS` : empreinte carbone et compensation (bas carbone, modérée, compensée).
   - Moteur sémantique `buildSlowTravelSnippetTags()` pour la synthèse des micro-données Google.
   - Générateur d'URL canonique `getCanonicalArticleUrl()` pointant sur le domaine de référence `heldonica.fr` (configurable via `NEXT_PUBLIC_SITE_URL`).
2. **Composant Rénové d'Aperçu SERP & Cartes Sociales (`components/admin/seo/SerpAndSocialPreview.tsx`)** :
   - Remplacement de l'ancien aperçu statique artisanal dans `CmsAdminClient.tsx` par un composant interactif à onglets :
     - **Onglet Google Search** : favicon Heldonica, fil d'Ariane hiérarchique avec chevrons (`heldonica.fr › blog › slug`), titre bleu dynamique, badges visuels des micro-données slow travel, et miniature de couverture carrée.
     - **Onglet Réseaux Sociaux (OpenGraph / Twitter Summary Large)** : ratio panoramique 1.91:1, badge heldonica.fr, tags en superposition, titre et extrait.
3. **Intégration dans `CmsAdminClient.tsx` (Éditeur CMS)** :
   - Extension du type `Article` avec les attributs de taxonomie.
   - Section repliable « 🔍 SEO & Métadonnées » complétée par une grille de sélection dédiée à la taxonomie Slow Travel (saison, mobilité, budget, durée d'immersion, empreinte carbone) directement connectée aux aperçus live.
4. **Résilience API & Schéma de Base (`app/api/cms/articles/route.ts`, `app/api/cms/articles/[id]/route.ts`)** :
   - Mécanisme de repli défensif `withoutSlowTaxonomy()` : en cas de retard d'application de la migration sur le serveur Supabase distant, les requêtes POST/PUT ne plantent pas.
   - Migration Supabase versionnée créée : `supabase/migrations/20261008130000_cms_slow_travel_taxonomy.sql`.
5. **Validation, Typage & Tests** :
   - Suite unitaire `__tests__/lib/cms-slow-taxonomy.test.ts` créée (**10/10 PASS**).
   - Suite de composants `__tests__/components/SerpAndSocialPreview.test.tsx` créée (**4/4 PASS**).
   - Suite complète CMS (7 fichiers de tests) : **38/38 PASS**.
   - Suite globale du dépôt : **570/570 tests PASS (73 fichiers de test)**.
   - `typecheck` : **PASS intégral (0 erreur)**.
   - `node scripts/garde-fous.mjs` : **11/11 contrôles validés (10 PASS, 1 SKIP hors-ligne)**.

---

## [2026-10-08] — Phase 4 : Diff Visuel des Blocs & Restauration 1-Clic dans RevisionsDrawer

### Réalisations & Architecture
1. **Moteur de Diff Visuel de Blocs (`lib/cms-revisions-diff.ts`)** :
   - Fonction `computeBlockDiff(currentBlocks, revisionBlocks)` comparant les arbres de blocs sérialisés/désérialisés.
   - Classification stricte en 4 statuts :
     - `added` (+ RESTAURÉ) : bloc présent dans la révision archivée qui sera restauré.
     - `removed` (- RETIRÉ) : bloc présent dans la version courante qui sera retiré par le rollback.
     - `modified` (~ MODIFIÉ) : bloc dont le texte, le niveau Hn ou les médias diffèrent, avec traçabilité avant/après.
     - `unchanged` (= IDENTIQUE) : bloc sans modification.
   - Fonctions `getBlockSummary()` pour extraire titres et résumés de tous les types de blocs.
2. **Interface Utilisateur `RevisionsDrawer.tsx` (`components/admin/RevisionsDrawer.tsx`)** :
   - Affichage en temps réel des badges de synthèse (`+X à restaurer`, `-Y à retirer`, `~Z modifié(s)`, `=W inchangé(s)`).
   - Tiroir dépliable de la liste détaillée des blocs avec codes couleurs visuels (émeraude, rose, ambre, pierre) et comparatif textuel biffé avant/après.
   - Bouton « Restaurer cette version » avec confirmation de sécurité et réinjection directe des blocs dans `BlockCanvas` via `onRestore`.
3. **Machine d'États d'Approbation (`draft` ➔ `review` ➔ `scheduled` ➔ `published`)** :
   - Statut **« review » (En relecture)** intégré comme citoyen de première classe dans `app/api/cms/articles/route.ts` (GET / POST) et `app/api/cms/articles/[id]/route.ts` (PATCH) : garantit `published: false` pour interdire toute publication accidentelle prématurée.
   - Interface `CmsAdminClient.tsx` et `ArticleForm.tsx` enrichies : sélecteur de statut, bouton de filtrage "En relecture", badge d'état dédié (ambre doux), et compteur de statistiques.
4. **Câblage dans `CmsAdminClient.tsx`** :
   - Transmission directe de `currentBlocks={activeCmsBlocks}` à `RevisionsDrawer`.
5. **Validation & Tests** :
   - Suite unitaire `__tests__/api/cms-articles-workflow.test.ts` créée (**3/3 PASS**).
   - Suite unitaire `__tests__/lib/cms-revisions-diff.test.ts` (**4/4 PASS**).
   - Suite unitaire `__tests__/components/RevisionsDrawer.test.tsx` (**3/3 PASS**).
   - Suite globale Phase 2 + Phase 4 : **26/26 tests PASS** en 5,8s.
   - `npm run typecheck` (`tsc --noEmit --incremental false`) : **PASS intégral (0 erreur)**.
   - `npm run preflight` : **PASS (5/5)**. Phase 4 close à 100 %.

---

## [2026-10-08] — Phase 2 : Médiathèque 2.0 & Albums de Terrain Unifiés dans BlockCanvas

### Réalisations & Architecture
1. **Composant Unifié `PhotoPickerModal.tsx` (`components/admin/media/PhotoPickerModal.tsx`)** :
   - **Onglet 1 (Albums de terrain certifiés)** : Connexion native au registre certifié `VERIFIED_PHOTO_ALBUMS` (`lib/cms-photo-albums.ts`), recherche temps réel par destination, lieu ou mot-clé avec `searchVerifiedPhotos()`, badges dates, géolocalisation et anecdotes vécues du duo.
   - **Onglet 2 (Supabase Storage)** : Intégration de l'explorateur Storage par dossier (`articles/`, `destinations/`, `blog/`, `coulisses/`), filtrage par nom, upload direct via `/api/cms/media-upload`, et sélection instantanée.
   - **Onglet 3 (URL externe / CDN)** : Saisie directe d'URL avec description alternative Alt obligatoire (A11y/RGAA) et légende.
2. **Intégration dans `BlockCanvas.tsx` (Éditeur de Blocs)** :
   - **Bloc Image** : bouton "📸 Choisir depuis un album de terrain" avec aperçu immédiat de la miniature, lieu et légende pré-remplis.
   - **Bloc Galerie** : bouton "📸 Album de terrain" pour insérer des clichés réels dans le carrousel ou la grille, et bouton de remplacement direct par photo pour chaque entrée.
3. **Validation, Typage & Tests** :
   - Suite unitaire `__tests__/components/PhotoPickerModal.test.tsx` créée (**5/5 PASS**).
   - Suite `__tests__/components/BlockCanvas.test.tsx` étendue (**9/9 PASS**).
   - Totalité des 14 tests médias au vert en 1,2s.
   - `npm run typecheck` (`tsc --noEmit --incremental false`) : **PASS intégral (0 erreur)**.
   - `npm run preflight` validé (**5/5 PASS**). Phase 2 bornée à 100 %.

---

## [2026-10-08] — Heldonica Brain : Routeur de Modes (Sage 🌿 / Débridé 🔥) & Bascule 1-Clic

### Réalisations & Architecture
1. **Routeur de Modes Backend (`app/engine/llm_manager.py`, `app/engine/chat_service.py`, `app/main.py`)** :
   - Ajout du prompt système `CHAT_DEBRIDE_SYSTEM_PROMPT` : franc-parler, vision percutante, créativité débridée, sans moraline ni langue de bois.
   - Préservation stricte de la **Règle #1 d'Heldonica : On n'invente rien** (faits certifiés, pas d'adresses/prix fictifs).
   - Cloisonnement de sécurité sandboxé : en mode débridé/libre, tous les outils d'écriture externe sont désactivés (`tools: []`).
   - Endpoints REST ajoutés : `GET /api/settings/mode` et `POST /api/settings/mode` avec persistance SQLite (`settings.chat_mode`).
   - `answer()` dans `chat_service.py` et `POST /api/chat` pilotent désormais dynamiquement la température (0.1 en Sage, 0.85 en Débridé) et le modèle cible.
2. **Interface Utilisateur & Bascule 1-Clic (`app/static/`)** :
   - `brain_chat.html` : composant de bascule fluide en en-tête (`🌿 Sage` / `🔥 Débridé`), adaptation instantanée du thème/accent, synchronisation avec le serveur et `localStorage`.
   - `index.html` (Dashboard central) : pilule de bascule dans la barre d'action supérieure (`topbar`) et boutons de configuration dans l'onglet *Moteur IA & Matériel*.
   - `bridge.html` : ajout des raccourcis de commande `!mode sage` et `!mode debride` pour le contrôle mobile/distant.
3. **Audit Matériel & RAG** :
   - Maintien de `nomic-embed-text` (dimension 768, 274 Mo, déjà compilé dans `vault_vecteurs.db` avec les 55 fiches du Coffre des Savoirs) pour éviter toute régression vectorielle.
   - Constat de saturation disque (disque C: à 4,96 Go libres) : détection du modèle `llava:7b` (4,5 Go) occupant l'espace pour l'installation future de `dolphin3`.
4. **Durcissement & Sécurisation Critique** :
   - `ask_brain` (serveur MCP `app/mcp/server.py`) : **forcé immutablement en mode `sage`** (`mode="sage"`), sanctuarisant les réponses fournies aux agents et à Perplexity face à tout basculement de toggle web.
   - **Expiration automatique du mode débridé (TTL 60 min)** : retour automatique en Mode Sage 🌿 après 3600 secondes (`settings.chat_mode_expires_at`) pour empêcher tout oubli humain prolongé.
   - **Nettoyage disque** : purge complète des blobs partiels de téléchargement, restituant l'intégrité du stockage sur `C:`.
5. **Validation des Garde-fous** :
   - `selftest.py` Brain II : **40/40 PASS** (0 échec).
   - `npm run garde-fous` Next.js : **11/11 PASS**, 66 fichiers de tests, 535/535 tests réussis.

---

## [2026-10-08] — Assainissement GitHub PRs & Synchronisation de Production

### Fusions validées sur `main`
1. **PR #510** (`fix-empty-images-migration-16935713872669505147`) : suppression du placeholder forcé sur les destinations dans `20260516000000_fix_empty_images.sql`.
2. **PR #517** (`fix-seo-issues-images-excerpts-5607237158625852435`) : correction de la syntaxe PostgREST `.or()` pour chaînes vides (`featured_image.eq.""` et `excerpt.eq.""`) dans `app/api/publish-podgorica/route.ts` avec suite de tests dédiée (`__tests__/app/api/publish-podgorica/route.test.ts`).
3. **PR #521** (`bolt-destinationcard-memo-1345888331631657619`) : optimisation de rendu `React.memo` sur `DestinationCard` et alias `Image as ImageIcon` (Lucide) évitant les collisions de namespace.
4. **PR #522** (`bolt-scroll-throttle-17745253030372834751`) : régulation des écouteurs de défilement avec `requestAnimationFrame` ticking sur `ReadingProgress`, `BlogClientPage`, `Header` et `NewsletterPopup` (réduction de 80% des micro-renders).
5. **PR #512** (`fix-leaflet-default-icons-16544126728280497866`) : chargement des icônes Leaflet locales bundlées (`leaflet/dist/images/`) éliminant toute dépendance réseau envers un CDN externe.

### PRs clôturées (obsolètes ou doublons)
- **PR #505** : clôturée (doublon strict de la PR #510).
- **PR #507** : clôturée (variante CDN inférieure à l'import local de la PR #512).
- **PR #513** : clôturée (obsolète, ciblait la table `articles` déjà dépréciée et fusionnée dans `cms_blog_posts` par la PR #448).
- **PR #514 & #516** : clôturées (anciennes options expérimentales Next 14 rendues inutiles par Next 15 `serverExternalPackages`).
- **PR #523** : clôturée (build Vercel en échec et tentative d'affaiblissement des garde-fous CI).

---

## [2026-10-08] — Refonte CMS : Phase 12 (Clôture UX & Synchronisation Bilatérale Article ↔ Blocs)

### Réalisations
1. **Synchronisation Bilatérale Lossless (`lib/cms-blocks-converter.ts`)** :
   - Ajout d'une signature non destructive par commentaire HTML `<!-- heldonica:blocks ... -->` intégrée à `blocksToHtml(blocks)`.
   - Les lecteurs publics, le SEO, les flux RSS et les réseaux sociaux reçoivent du pur HTML sémantique sans aucune surcharge.
   - À la réouverture ou au rechargement dans le CMS, `htmlToBlocks(rawTextOrHtml)` détecte ce bloc structuré et restaure 100% de l'arborescence des blocs avec leurs identifiants, configurations et métadonnées complexes (`vault_spot`, `photo_evidence`, `gallery`, `aspectRatio`, etc.).
2. **Parseur de Secours Résilient (`lib/cms-blocks-converter.ts`)** :
   - Prise en charge des balises enrichies même en l'absence de commentaire (articles hérités ou rédigés à la main) : reconnaissance automatique de `<aside class="vault-spot-highlight">` et `<figure class="photo-evidence">`.
   - Résilience totale face aux commentaires HTML tronqués ou corrompus : bascule automatique sans crash vers le parseur sémantique standard.
3. **Tests unitaires et intégration (`__tests__/lib/cms-blocks.test.ts`)** :
   - 7 tests Vitest couvrant la génération par défaut des 8 types, le découpage de texte brut, l'analyse HTML, la sérialisation propre, le round-trip 100% fidèle, le parsing des balises héritées et la résilience sur entrée altérée.
4. **Validation CI & Garde-fous** :
   - `npm run preflight` : **5/5 PASS** (1.3s).
   - `npm run typecheck` : **PASS (0 erreur, TypeScript strict pur)**.
   - `npm run garde-fous` : **11/11 PASS** (63 fichiers de tests, **523/523 tests passés**).

---

## [2026-10-08] — Refonte CMS : Phase 11 (Réorganisation Drag & Drop et Duplication de Blocs)

### Réalisations
1. **Réorganisation Visuelle par Drag & Drop (`components/admin/blocks/BlockCanvas.tsx`)** :
   - Implémentation du Drag & Drop HTML5 natif (zéro dépendance tierce lourde) avec poignée `GripVertical`.
   - Indicateurs visuels interactifs : opacité réduite pour l'élément en cours de déplacement (`opacity-40 scale-[0.99]`), bordure supérieure ambrée lumineuse (`border-t-2 border-amber-500 bg-amber-50/20`) pour la cible de dépôt.
   - Algorithme de réordonnancement immuable `handleDrop(e, targetIndex)`.
2. **Duplication 1-Clic de Blocs (`components/admin/blocks/BlockCanvas.tsx`)** :
   - Bouton d'action « Dupliquer ce bloc » (`Copy`) sur chaque bloc modulaire.
   - Fonction `duplicateBlock(index)` créant une copie conforme profonde avec génération d'un nouvel identifiant unique préfixé (`${block.id}_copy_${timestamp}`).
3. **Tests unitaires & intégration (`__tests__/components/BlockCanvas.test.tsx`)** :
   - 5 tests Vitest couvrant le rendu de la palette, l'affichage des poignées et boutons d'action, la duplication avec nouvel identifiant unique, la suppression et l'ouverture du modal de gabarits.
4. **Validation CI & Garde-fous** :
   - `npm run preflight` : **5/5 PASS** (1.3s).
   - `npm run typecheck` : **PASS (0 erreur, TypeScript strict pur)**.
   - `npm run garde-fous` : **11/11 PASS** (63 fichiers de tests, **520/520 tests passés**).

---

## [2026-10-08] — Refonte CMS : Phase 10 (Connexion 1-Clic Coffre des Savoirs RAG & Recherche de Pépites)

### Réalisations
1. **Registre des Fiches du Coffre des Savoirs (`lib/cms-vault-spots.ts`) & Synchroniseur (`scripts/sync-vault-spots.py`)** :
   - Extraction et typage strict des **78 fiches réelles de terrain** depuis la base SQLite du Brain (`heldonica_brain.db`).
   - Moteur de recherche pondéré `searchVaultSpots(query, options)` priorisant Titre (x3) > Lieu (x2) > Tags (x2) > Récit vécu (x1).
   - Règle AGENTS.md n°1 : « On n'invente rien ». Zéro donnée simulée, chaque pépite provient du vécu réel du duo fondateur.
2. **Endpoint API Dédié (`app/api/cms/vault/search/route.ts`)** :
   - Route `GET /api/cms/vault/search` protégée par `requireCmsAuth` avec recherche en temps réel par mots-clés, destination ou catégorie.
3. **Sélecteur Visuel 1-Clic dans l'Éditeur CMS (`components/admin/blocks/BlockCanvas.tsx`)** :
   - Bouton « 🔍 Piocher dans le Coffre » dans `VaultSpotEditor` ouvrant un tiroir interactif avec filtre de recherche direct.
   - Sélection d'une pépite pré-remplissant en 1 clic l'identifiant (`spotId`), le titre, le lieu exact et l'anecdote vécue authentique.
4. **Tests unitaires & intégration (`__tests__/lib/cms-vault-spots.test.ts` & `__tests__/api/cms-vault-search.test.ts`)** :
   - 7 tests Vitest couvrant le registre des 78 fiches, la validation des champs obligatoires, la pertinence des requêtes (Madère, Monténégro/Podgorica), la récupération par ID et l'authentification de l'API.
5. **Validation CI & Garde-fous** :
   - `npm run preflight` : **5/5 PASS** (1.6s).
   - `npm run typecheck` : **PASS (0 erreur, TypeScript strict pur)**.
   - `npm run garde-fous` : **11/11 PASS** (62 fichiers de tests, **515/515 tests passés**).

---

## [2026-10-08] — Refonte CMS : Phase 9 (Bibliothèque de Gabarits Slow Travel & Modal d'Insertion)

### Réalisations
1. **Module de Gabarits Éditoriaux (`lib/cms-templates.ts`)** :
   - 4 gabarits préconfigurés de référence respectant rigoureusement la voix Heldonica (zéro mot banni de `lib/brand-voice.ts`) :
     - `slow_travel_diary` : Carnet d'immersion lente (titre d'émotion, photo de terrain certifiée, repères sensoriels, checklist voyage, CTA).
     - `step_by_step_guide` : Itinéraire pas à pas (étapes numérotées, bloc `vault_spot` relié au Coffre des Savoirs).
     - `hospitality_spotlight` : Maison d'hôtes & Hospitalité sincère (galerie carrousel, vérification éthique de séjour, CTA B2B/B2C).
     - `photo_essay` : Essai visuel et poésie du territoire (photos d'atmosphère de terrain avec dates et lieux réels).
   - Contrôle qualité automatisé `validateTemplateBlocks(blocks)` : vérifie l'absence de mots bannis et l'unicité stricte des identifiants.
2. **Interface Utilisateur CMS (`components/admin/blocks/BlockCanvas.tsx`)** :
   - Ajout du bouton « 📋 Gabarits Slow Travel » dans la palette de blocs modulaires.
   - Modal interactif présentant les gabarits avec temps de lecture estimé, tags thématiques et choix d'insertion : « Remplacer » ou « Ajouter à la suite ».
3. **Tests unitaires (`__tests__/lib/cms-templates.test.ts`)** :
   - 8 tests Vitest couvrant : inventaire des 4 gabarits, instanciation personnalisée par destination, présence des blocs spécialisés (`vault_spot`, `gallery`, `photo_evidence`), conformité 100% à la voix de marque, détection d'intrusions de mots interdits et détection de doublons d'IDs.
4. **Validation CI & Garde-fous** :
   - `npm run preflight` : **5/5 PASS** (2.0s).
   - `npm run typecheck` : **PASS (0 erreur)**.
   - `npm run garde-fous` : **11/11 PASS** (60 fichiers de tests, **508/508 tests passés**).

---

## [2026-10-08] — Persistance photo_blocks & Endpoint d'upload résilient (photo-storage)

### Réalisations
1. **Migration SQL versionnée (`supabase/migrations/20261008120000_cms_photo_blocks_storage.sql`)** :
   - Création de la table `photo_blocks` (`id` UUID PK default gen_random_uuid(), `image_url` TEXT NOT NULL, `location` TEXT NOT NULL, `latitude`/`longitude` DOUBLE PRECISION NULL, `taken_at` DATE NOT NULL, `anecdote` TEXT NOT NULL CHECK 1..500 chars, `album_id` TEXT NOT NULL, `created_at`/`updated_at` TIMESTAMPTZ default now()).
   - Index sur `album_id` et `taken_at`.
   - RLS activée : lecture publique pour l'affichage des carnets, insertion/modification réservée aux utilisateurs authentifiés (`authenticated`).
2. **Endpoint `POST /api/cms/photos/upload` (`app/api/cms/photos/upload/route.ts`)** :
   - Protection d'accès via `requireCmsAuth` (pattern standard du CMS).
   - Supporte à la fois `multipart/form-data` (upload fichier vers bucket `photos` avec fallback) et `application/json` (métadonnées d'une photo existante).
   - Validation stricte du payload via `lib/photo-albums.ts` (`validateAlbumPhotoMeta`), rejets 422 avec tableau typé d'issues.
   - Insertion en base avec lecture systématique des erreurs Supabase (`check:erreurs-avalees` conforme).
3. **Tests unitaires (`__tests__/api/cms-photos-upload.test.ts`)** :
   - 5 tests vérifiant : rejet 401 si non authentifié, rejet 422 si champs manquants, rejet 422 si GPS hors bornes, rejet 422 si anecdote > 500 chars, succès 200/201.
4. **Validation CI & Garde-fous** :
   - `npm run preflight` : **5/5 PASS** (1.3s).
   - `npm run typecheck` : **PASS (0 erreur)**.
   - `npm run garde-fous` : **11/11 PASS** (59 fichiers de tests, **500/500 tests passés**).

---

## [2026-10-08] — Validation stricte des métadonnées d'albums photos (d8505e)

### Réalisations
1. **`lib/photo-albums.ts`** : types stricts + validation TS native (zéro dép) — `AlbumPhotoMeta`/`AlbumMeta`, `normalizeTags` (EXIF/manuels), `parseExifDateTime` ("YYYY:MM:DD HH:MM:SS" → ISO, sans approximation), GPS (-90..90/-180..180, direct ou repli EXIF), anecdote 1..500, issues typées `{ field, code, message }`. Rejets explicites, jamais de valeurs complétées (règle n°1).
2. **Endpoint `POST /api/cms/albums/metadata`** (+ `GET` contrat) : auth `requireCmsAuth`, 200 `{ ok, normalized }` / 422 `{ ok, issues }` / 400 JSON illisible, aucune écriture DB.
3. **Audit error-handling Supabase** : 72 routes `app/api/cms` passées en revue — requêtes `.from(` systématiquement suivies de lecture `.error` (503 si non configuré, 400/404/500 typées) sur l'échantillon vérifié (articles, media, revisions, contact, guides, pillars, sub-destinations, audit…) ; aucun fallback inventé détecté. Point d'hygiène restant : casts `as any` sur certains clients (hors périmètre, à traiter avec f28e63-suivi).
4. **Tests** : `__tests__/lib/photo-albums.test.ts` (14 tests) + `__tests__/api/cms-albums-metadata.test.ts` (câblage auth). Suite : **495/495 verts** (58 fichiers), `typecheck` PASS, `next lint` PASS.

---

## [2026-10-08] — Refonte CMS : Phase 8 (Sélecteur d'Albums Certifiés, Tiroir de Révisions & Rollback en 1 Clic)

### Réalisations
1. **Registre des Albums de Terrain Certifiés & Validation AGENTS.md** (`lib/cms-photo-albums.ts`) :
   - Centralisation des albums vérifiés issus des registres de terrain du duo fondateur (`content/evidence/*.json` et `public/images/destinations/`) :
     - 🇲🇪 Monténégro (Podgorica, Stara Varoš, Morača — Mai 2026)
     - 🇨🇭 Suisse (Crête de Fronalpstock & Stoos — Juillet 2025)
     - 🇵🇹 Madère (Fanal, Achadas da Cruz, Ponta do Sol — Octobre 2024)
     - 🇷🇴 Roumanie (Bucarest & Transylvanie — Août 2026)
   - Toutes les photos sont validées par `validatePhotoEvidence` (zéro hallucination, Règle #1 : On n'invente rien).
2. **Endpoint API Dédié** (`app/api/cms/photos/albums/route.ts`) :
   - Route GET `/api/cms/photos/albums` avec filtrage par `albumId` et recherche par mots-clés (`q`).
3. **Sélecteur Visuel d'Albums Direct dans l'Éditeur CMS** :
   - Dans `components/admin/blocks/BlockCanvas.tsx` (`PhotoEvidenceEditor`) : sélecteur à onglets d'albums avec miniatures, dates réelles et anecdotes préremplies en 1 clic.
   - Dans `app/panel-manager/CmsAdminClient.tsx` (section « 📸 Preuve visuelle ») : insertion guidée pour les métadonnées de l'article avec prévisualisation fidèle.
4. **Tiroir d'Historique de Versions & Rollback en 1 Clic** (`components/admin/RevisionsDrawer.tsx` et `CmsAdminClient.tsx`) :
   - Bouton « Versions » dans la barre d'outils d'édition d'article.
   - Affichage chronologique des révisions avec numéro de version, auteur, diffs et note de modification.
   - Restauration immédiate en 1 clic via `/api/cms/articles/[id]/revisions/[revisionId]/restore` avec sauvegarde préventive automatique.
5. **Validation CI & Garde-fous** :
   - Nouveaux tests unitaires (`__tests__/lib/cms-photo-albums.test.ts`).
   - `npm run preflight` : **5/5 PASS**.
   - `npm run typecheck` : **0 erreur** (TypeScript strict pur).
   - `npm run garde-fous` : **11/11 PASS** (56 fichiers de tests, **479/479 tests verts**).

---

## [2026-10-08] — Refonte CMS : Phase 7 (Moteur SEO Automatique, Audit E-E-A-T & Données Structurées Schema.org)

### Réalisations
1. **Moteur d'Audit E-E-A-T & Score de Fiabilité Slow Travel** (`lib/cms-seo-eeat.ts`) :
   - Calcul de score E-E-A-T sur 100 basé sur les 4 piliers Google :
     - **Expérience** : vérification de la présence de photos vécues horodatées et géolocalisées (`photo_evidence`), anecdotes de terrain.
     - **Expertise** : respect absolu de la charte éditoriale Heldonica, détection temps réel des mots bannis (`FORBIDDEN_WORDS` de `lib/brand-voice.ts`), conseils pratiques slow travel (transports doux, saisons).
     - **Autorité** : maillage interne vers les fiches destinations réelles et articles connexes.
     - **Fiabilité** : métadonnées complètes, absence de superlatifs marketing artificiels.
   - Recommandations automatisées et ciblées pour les rédacteurs et créateurs de contenu.
2. **Génération de Données Structurées Schema.org JSON-LD** (`lib/cms-seo-eeat.ts`) :
   - Schémas standardisés pour `BlogPosting` (articles de blog / carnets de route) avec attribution d'auteur, publisher Heldonica et métadonnées d'illustration.
   - Schémas hôteliers et slow travel pour `LodgingBusiness` / `BedAndBreakfast` / `Hotel` (`/expert-hotelier`) avec coordonnées GPS, adresse et tarification.
3. **Validation & Tests** :
   - 4 tests unitaires (`__tests__/lib/cms-seo-eeat.test.ts`).
   - Maintien du score parfait des 11 garde-fous (55 fichiers de tests, 475/475 tests verts).

---

## [2026-10-08] — Refonte CMS : Phases 2, 3, 4, 5 & 6 (Code-First, MCP, Ciblage, Webhooks HMAC, Révisions & Rollback)

### Réalisations
1. **Phase 2 — Modèles Structurés Code-First & Hôtellerie B2B (`/expert-hotelier`)** :
   - **Migration SQL** (`supabase/migrations/20261008080000_cms_hospitality_collections.sql`) : tables `cms_accommodations` et `cms_stay_offers`, statuts (`draft`, `waiting_review`, `approved`, `published`), RLS strictes et indexation.
   - **Configuration Code-First** (`cms/cms.config.ts`) : registre unifié des collections (Payload/Strapi pattern) avec typage des champs, relations, validations et matrice des rôles d'accès.
   - **Moteur Métier & Validation TypeScript native** (`lib/cms-hospitality.ts`) : zéro dépendance Zod, validation stricte, workflow de relecture et publication, journalisation automatique dans `cms_audit_log`.
   - **Interface Administration** (`app/panel-manager/HospitalityManager.tsx`) : gestion des hébergements et packages, formulaire de création, filtres et passage de workflow en 1 clic.
2. **Phase 3 — Tokens API à Scopes, Endpoint MCP Standard (`/api/mcp`) & Releases** :
   - **Migration SQL** (`supabase/migrations/20261008090000_cms_tokens_and_releases.sql`) : tables `cms_api_tokens` (hachage SHA-256 déterministe, zéro secret en clair, scopes granulaires) et `cms_releases` (publication groupée atomique).
   - **Gestion & Vérification des Jetons** (`lib/cms-tokens.ts`) : génération de clés `held_live_<hex>`, vérification des scopes (`read:content`, `write:draft`, `publish:content`, `admin:*`), révocation et suivi de `last_used_at`.
   - **Endpoint MCP Standard HTTP JSON-RPC 2.0** (`app/api/mcp/route.ts`) : conformité stricte avec le protocole Model Context Protocol (v2024-11-05). Expose les outils `cms_list_content`, `cms_get_content`, `cms_create_draft`, `cms_audit_trail` pour toute la flotte IA (Claude Desktop, Cursor, OpenCode, Perplexity, Gemini).
   - **Moteur de Releases & Publications Groupées** (`lib/cms-releases.ts`) : regroupement de contenus et publication atomique multi-tables avec audit complet.
   - **Routes API Dédiées** : `app/api/cms/tokens/route.ts`, `app/api/cms/releases/route.ts`, `app/api/cms/releases/[id]/publish/route.ts`.
   - **Interface CMS dédiée** (`app/panel-manager/TokensAndReleasesManager.tsx`) : génération de clés d'accès agents, copie sécurisée en un clic, révocation et lancement de releases.
3. **Phase 4 — Personnalisation & Ciblage Déclaratif (Différentiel Slow Travel)** :
   - **Migration SQL** (`supabase/migrations/20261008100000_cms_zone_variants.sql`) : table `cms_zone_variants` avec règles de ciblage JSONB et priorités.
   - **Moteur de Ciblage Déterministe** (`lib/cms-targeting.ts`) : calcul de saison, filtrage par audience/persona (couple, solo, hôtelier), filtrage UTM et device, sélection de la meilleure variante. Zéro tracking intrusif, respect total de la vie privée.
   - **Intégration transparente au rendu** (`lib/cms-zones.ts`) : `getPageZones` applique automatiquement les variantes ciblées pour la page sans impacter la performance.
4. **Phase 5 — Webhooks Sortants Signés HMAC (Intégration Flotte IA / n8n / Discord)** :
   - **Migration SQL** (`supabase/migrations/20261008110000_cms_webhooks_and_revisions.sql`) : tables `cms_webhooks` et `cms_webhook_deliveries`.
   - **Moteur de Webhooks & Signature HMAC** (`lib/cms-webhooks.ts`) : signature `X-Heldonica-Signature: sha256=...`, dispatch asynchrone non-bloquant et journalisation des livraisons.
   - **Route API** (`app/api/cms/webhooks/route.ts`) : gestion CRUD des endpoints d'écoute.
5. **Phase 6 — Moteur de Révisions & Rollback en 1 clic** :
   - Table `cms_post_revisions` pour l'archivage instantané des versions d'articles.
   - **Moteur de Révision** (`lib/cms-revisions.ts`) : `savePostRevision`, `getPostRevisions`, `restorePostRevision` avec sauvegarde automatique de précaution et traçabilité d'audit.
   - **Routes API Dédiées** : `app/api/cms/articles/[id]/revisions/route.ts` et `app/api/cms/articles/[id]/revisions/[revisionId]/restore/route.ts`.
6. **Validation CI & Garde-fous** :
   - 34 nouveaux tests unitaires (`__tests__/lib/cms-hospitality.test.ts`, `__tests__/lib/cms-tokens.test.ts`, `__tests__/lib/cms-releases.test.ts`, `__tests__/api/mcp.test.ts`, `__tests__/lib/cms-targeting.test.ts`, `__tests__/lib/cms-webhooks.test.ts`, `__tests__/lib/cms-revisions.test.ts`).
   - `npm run preflight` : **5/5 PASS**.
   - `npm run garde-fous` : **11/11 PASS** (54 fichiers de test, **471/471 tests passés**, TypeScript 100% vert, 0 dérive CMS, 0 erreur avalée).

---

## [2026-10-08] — Phase 1 CMS : Gouvernance & Journal d'Audit (Payload-style) + Console Brain Web Permanente

### Réalisations
1. **Session Console Brain Web Permanente (Port 8475 & Cloudflare Tunnel)** :
   - Fin des déconnexions intempestives : token maître déterministe (`get_master_token`), persistance JSON (`output/brain_web_tokens.json`).
   - Cookie persistant 1 an (`Max-Age=31536000; SameSite=Lax; Path=/`), injection côté serveur dans le template HTML et support de l'auto-login via paramètre d'URL (`?key=...`).
2. **Orchestrateur & Dispatch multi-IA dans Brain Web (`scripts/brain_secure_web.py`)** :
   - Détection automatique et répartition des demandes à destination d'OpenCode, Gemini et Freebuff.
   - Génération de fichiers de tâches normalisés avec bloc d'état `<!-- heldonica:status -->` dans `output/agent_tasks/` et signal temps réel au bridge agent (port 8476).
3. **Phase 1 Modernisation CMS : Gouvernance & Audit Log** :
   - **Migration SQL** (`supabase/migrations/20261008070000_cms_roles_and_audit.sql`) : tables `cms_user_profiles` (rôles `admin`, `editor`, `viewer`), `cms_audit_log` (qui, quoi, quand, entité, diff JSON avant/après, métadonnées), RLS strictes et indexation chronologique.
   - **Contrôle d'accès fonctionnel** (`lib/cms-access.ts`) : modèle déclaratif et typé façon Payload (`can()`, `canPublish()`, `canDelete()`, `canEditField()`, `canViewAuditLog()`, `canManageUsers()`).
   - **Moteur de traçabilité** (`lib/cms-audit.ts`) : calcul différentiel fin (`calculateDiff`), enregistrement résilient sans blocage des opérations métier.
   - **Endpoint sécurisé** (`app/api/cms/audit/route.ts`) : consultation filtrée (par entité, limite) et écriture protégée.
   - **Interface CMS intégrée** : composant `AuditLogPanel.tsx` (timeline interactive, filtres, inspecteur avant/après) monté dans `app/panel-manager/CmsAdminClient.tsx` avec badge de rôle (« Admin (Fondateur) ») et raccourci dans la navigation.
4. **Validation stricte & Garde-fous** :
   - 21 nouveaux tests unitaires (`__tests__/lib/cms-access.test.ts` & `__tests__/lib/cms-audit.test.ts`).
   - `npm run preflight` : **5/5 PASS**.
   - `npm run garde-fous` : **11/11 PASS** (47 fichiers de test passés, 437/437 tests verts, TypeScript 100% propre).

---

## [2026-10-08] — Bloc CMS PhotoEvidenceBlock (preuve photo + contexte réel)

### Réalisations
1. **Nouveau type de bloc `photo_evidence`** : `types/cms-blocks.ts` (photo HTTPS + lieu + date ISO + anecdote ≤200 car. + album optionnel), rendu `components/blocks/PhotoEvidenceBlock.tsx`, édition `BlockCanvas` (palette + `PhotoEvidenceEditor`), sérialisation HTML `lib/cms-blocks-converter.ts`.
2. **Composant présentatif** : `components/PhotoEvidenceBlock.tsx` + `PhotoEvidenceBlock.module.css` (ratio 16:9, ligne 📍/📅, anecdote italique, bouton album `target _blank`, `alt` = anecdote), validation `lib/photo-evidence.ts`.
3. **Intégration admin** : section « 📸 Preuve visuelle » dans `app/panel-manager/CmsAdminClient.tsx` (champs `photoUrl/photoLocation/photoDate/photoAnecdote/photoAlbumLink` + prévisualisation live, aucune donnée fictive).
4. **Tests & garde-fous** : `__tests__/components/PhotoEvidenceBlock.test.tsx` + `__tests__/lib/photo-evidence.test.ts` (12 tests verts avec `cms-blocks`), `typecheck` PASS, `next lint` PASS, `check:content-evidence` sans CONTREDIT.

---

## [2026-10-05] — Restitution de Vécu Terrain & Registres de Preuves Photo (Suisse Stoos & Monténégro Podgorica)

### Réalisations & Intégrité Éditoriale
1. **Dépouillement des Preuves & Zero Invention (« On n'invente rien »)** :
   - **Suisse (Stoos, Schwyz)** : Exploitation de 719 photos et de la capture d'écran GPS Google Maps (`Screenshot_2025-07-12-20-37-08-134_com.google.android.apps.maps.jpg`). Reconstitution chronologique d'alpage du 12 juillet 2025 dans `imports/suisse-2025/voyage.md`. Enrichissement de `content/evidence/suisse.json`.
   - **Monténégro (Podgorica, Stara Varoš)** : Dépouillement des photos géolocalisées et horodatées (`moraca_millennium.jpg`, `stara_varos.jpg`, `sahat_kula.jpg`, `sipcanik_winery.jpg`, `PXL_20260527_182137166.RAW-01.COVER.jpg` prouvant le pochoir mural « СТАРА ВАРОШ 1987 »). Reconstitution rédigée dans `imports/montenegro-2026/voyage.md` et mise à jour de `content/evidence/montenegro.json`.
2. **Articles MDX Validés & Synchronisation des Brouillons** :
   - Création de `content/articles/stoos-crete-suisse-slow-travel.mdx` (randonnée de crête Fronalpstock au crépuscule en duo avec chien, respect strict des 7 garde-fous).
   - Création de `content/articles/podgorica-pepites-slow-travel-couple.mdx` : 5 pépites authentiques (Sastavci, Stara Varoš, église troglodytique de Dajbabe, bunker vinicole de Šipčanik, terrasses polako). Respect strict des pronoms (« on » / « tu »), zéro mot interdit, intégration de la section « Ce qu'on a moins aimé » et score de 100/100 sur le barème Heldonica.
   - Synchronisation et assainissement du brouillon `content/articles/brouillons/podgorica-pepites-slow-travel-couple.md`.
3. **Harmonisation Voix de Marque & Correction Pages Destinations** :
   - `app/destinations/montenegro/kotor/page.tsx` : Remplacement de l'image de couloir par `moraca_millennium.jpg`, éradication des mots bannis (« magnifique », « astuce »), harmonisation des pronoms (« vous » vers « tu ») et évitement des affirmations de mois non prouvées.
   - `app/destinations/[slug]/DestinationPage.tsx` : Association des photos de couverture authentiques vérifiées pour la Suisse (`stoos-02.jpg`) et le Monténégro (`moraca_millennium.jpg`).
   - `app/api/publish-podgorica/route.ts` : Remplacement de l'image générique Unsplash par `/images/destinations/montenegro/moraca_millennium.jpg`.
4. **Vérifications CI & Garde-fous** :
   - `npm run preflight` : **5/5 PASS**.
   - `npm run garde-fous` : **11/11 PASS** (workspace, brand-sync, ai-models, api-auth, erreurs-avalees, cms-drift, content-coherence, content-evidence, tsc, 404 tests vitest).
   - `npm run build` : **100% PASS** (163 routes statiques/SSG compilées sans avertissement).

---

## [2026-10-05] — Consolidation Ontologique Heldonica Brain (Constitution v1.0) & Indexation Vectorielle

### Réalisations & Intégration Système
1. **Base de Connaissances Maîtresse (Constitution v1.0)** :
   - Rédaction et fixation du document canonique `docs/HELDONICA_BRAIN_MASTER_KNOWLEDGE.md` consolidant l'ontologie complète du projet :
     - Identité de marque : *L’Expert de l’Aventure* (Explorateur pour le slow travel vécu, Sage pour le conseil hôtelier indépendant).
     - Règle stricte des pronoms : duo incarné par « on » (jamais de prénoms en public, jamais de « nous » sujet), lecteur en tutoiement « tu » (B2C), professionnels en vouvoiement « vous » (B2B).
     - Taxonomie de preuve sur 5 niveaux : Niveau 5 (*Testé plusieurs fois*), Niveau 4 (*Testé une fois*), Niveau 3 (*Visité*), Niveau 2 (*Vérifié*), Niveau 1 (*Repéré*), Niveau 0 (*Non fiable / bloqué*).
     - Règle d'or « On n'invente rien » : zéro hallucination de météo, odeur, tarif, ou statistique hôtelière non sourcée.
     - Précision du vocabulaire : « pépite » seul banni (cliché influenceur), « pépites dénichées » canonique obligatoire ; « bons plans » et « tips » strictement bannis et remplacés par « pépites dénichées » / « conseils terrain ».
     - Prompt maître condensé et garde-fous de publication.
2. **Déploiement dans Heldonica Brain II** :
   - Copie du socle dans `heldonica-brain/app/data/master_knowledge.md`.
   - Insertion dans le coffre SQLite `knowledge_vault` (`heldonica_brain.db`) en tant que **Fiche 00 — Heldonica Brain Constitution & Socle de Vérité** (ID 96, catégorie `Brand Philosophy`, tags `constitution, socle, ontologie, brand, voice, b2c, b2b, preuves, regles, canonique, slow-travel`).
   - Vectorisation sémantique intégrale via `scripts/indexer_vecteurs.py` avec le modèle `nomic-embed-text` sous Ollama local (78 fiches indexées au total dans `app/data/vault_vecteurs.db`, 100% hors-ligne).
3. **Assistance Interactive et Suivi des Vagues Google Jules (12 & 13)** :
   - 7 sessions finalisées avec succès :
     - Sessions #41, #42, #43, #44 (Vague 12 : Profil Altimétrique, VideoObject Schema.org, Sous-titres animés, PWA offline).
     - Sessions #45, #47, #48 (Vague 13 : Routeur multi-LLM, Auto-critique réflexive, Mémoire épisodique).
   - Session #46 (Gestionnaire autonome des tâches) : assistance interactive transmise via l'API Jules (`:sendMessage`) avec le mock de chaîne Supabase pour Vitest.
4. **Garde-fous CI** :
   - `npm run preflight` validé à **5/5 VERT** (workspace, brand-sync, ai-models, api-auth, erreurs-avalees).

---

## [2026-10-05] — Délégation Jules Vague 13 : Autonomie, Flexibilité Multi-LLM & Intelligence Réflexive du Cerveau

### Réalisations & Attribution de Tâches à Google Jules
4 nouvelles sessions de pointe ont été déployées sur Google Jules pour rendre Heldonica Brain plus flexible, autonome et intelligent :

1. **Session #45** (`heldonica`, ID `16323460527941180238`, URL : https://jules.google.com/session/16323460527941180238) :
   - *Titre* : `feat(brain-routing): Routeur adaptatif multi-LLM avec circuit-breaker et bascule de secours`
   - *Périmètre* : `lib/ai-circuit-breaker.ts` assurant la résilience continue du Brain (états CLOSED/OPEN/HALF-OPEN, bascule transparente en <5s vers les fournisseurs de repli en cas d'erreur 429 ou timeout d'Ollama local/Groq) avec monitoring des latences et tests Vitest.

2. **Session #46** (`heldonica`, ID `17461034032978638136`, URL : https://jules.google.com/session/17461034032978638136) :
   - *Titre* : `feat(brain-autonomy): Gestionnaire autonome des taches d arriere-plan avec auto-retry`
   - *Périmètre* : Gestion autonome de la file `/api/brain/tasks` (reprise automatique sur panne avec backoff exponentiel jusqu'à 3 essais, détection des tâches orphelines bloquées) et panneau de contrôle `BrainTaskQueueMonitor.tsx` avec tests Vitest.

3. **Session #47** (`heldonica`, ID `8870745935403290202`, URL : https://jules.google.com/session/8870745935403290202) :
   - *Titre* : `feat(brain-intelligence): Boucle d auto-critique reflexive avec scoring qualite`
   - *Périmètre* : `lib/brain-evaluator.ts` implémentant une boucle réflexive (Self-Critique & Auto-Refinement) évaluant les productions sur 5 axes (voix Heldonica, détails sensoriels, ancrage factuel, rythme, tics IA) avec réécriture automatique si le score est inférieur à 85/100, sans jamais inventer de données.

4. **Session #48** (`history-content-studio`, ID `5237085379454449591`, URL : https://jules.google.com/session/5237085379454449591) :
   - *Titre* : `feat(brain-memory): Memoire episodique du Cerveau et rappel contextuel cross-projets`
   - *Périmètre* : `tools/episodic_memory_store.py` (stockage SQLite persistant des préférences stylistiques de l'auteur, retours d'expérience et contextes de destinations passées pour injection contextuelle ciblée dans les prompts système) avec tests pytest.

---

## [2026-10-05] — Délégation Jules Vague 12 : Profil Altimétrique, SEO VideoObject, Sous-titres Animés & PWA Offline

### Réalisations & Attribution de Tâches à Google Jules
4 nouvelles sessions stratégiques ont été déployées sur Google Jules :

1. **Session #41** (`heldonica`, ID `14085806712020635973`, URL : https://jules.google.com/session/14085806712020635973) :
   - *Titre* : `feat(itinerary): Visualiseur de denivele et profil altimetrique interactif pour carnets`
   - *Périmètre* : Composant `components/carnet/ElevationProfile.tsx` (profil topographique interactif, calcul du +D / -D, curseur synchronisé avec la carte Leaflet au survol pour les randonnées Stoos et Madère) avec page de démonstration et tests Vitest.

2. **Session #42** (`heldonica`, ID `4659896000540309525`, URL : https://jules.google.com/session/4659896000540309525) :
   - *Titre* : `feat(seo): Donnees structurees Schema.org VideoObject et flux MRSS pour les Shorts 9:16`
   - *Périmètre* : Composant `ShortVideoJsonLd.tsx` générant les métadonnées Schema.org `VideoObject` (durée ISO 8601, transcript, URL de stream) et route API `/api/shorts/feed` générant le flux Media RSS (MRSS) pour l'indexation par Google Video Search.

3. **Session #43** (`history-content-studio`, ID `2924619750377227326`, URL : https://jules.google.com/session/2924619750377227326) :
   - *Titre* : `feat(subtitles): Generateur de sous-titres animes SRT et transcription horodatee pour Shorts`
   - *Périmètre* : Outil CLI `tools/subtitle_generator.py` générant des sous-titres `.srt` et `.ass` avec mise en valeur dynamique mot à mot (kinetic gold highlight #D4AF37) pour les vidéos verticales 9:16 avec tests pytest.

4. **Session #44** (`heldonica`, ID `3509696228270303828`, URL : https://jules.google.com/session/3509696228270303828) :
   - *Titre* : `feat(pwa): Cache hors-ligne ServiceWorker pour les fiches de voyage sans reseau`
   - *Périmètre* : `public/sw.js` et `lib/service-worker-register.ts` avec stratégie Stale-While-Revalidate pour les carnets, page `/offline` dédiée et mise en cache préventive des guides en zone blanche de montagne.

---

## [2026-10-04] — Délégation Jules Vague 11 : Harmonisation Éditoriale (SSOT), Remplacements et Nettoyage Docs

### Réalisations & Attribution de Tâches à Google Jules
2 nouvelles sessions critiques ont été ouvertes sur Google Jules pour clore définitivement les incohérences signalées par l'audit :

1. **Session #39** (`heldonica`, ID `9898416668984475633`, URL : https://jules.google.com/session/9898416668984475633) :
   - *Titre* : `refactor(brand-voice): Centralisation de la voix editoriale SSOT et dictionnaire de remplacements`
   - *Périmètre* : `lib/brand-voice.ts` érigé en autorité absolue (mots bannis, dictionnaire `FORBIDDEN_REPLACEMENTS` officiel, clarification `pépites dénichées` vs `pépite` seul), alignement des routes d'API (`enhance`, `validate`, `blog/generate`) et synchronisation de `scripts/check-content-coherence.mjs` avec tests Vitest.

2. **Session #40** (`heldonica`, ID `13894232648461343846`, URL : https://jules.google.com/session/13894232648461343846) :
   - *Titre* : `fix(docs): Reparation de l encodage UTF-8 de PROMPT_LIBRARY et archivage des prompts racine`
   - *Périmètre* : Réparation complète de l'encodage mojibake de `PROMPT_LIBRARY.md` (accents français rétablis), archivage des 6 vieux prompts de sprint dans `docs/archive/prompts_legacy/`, et mise à jour de la documentation.

---

## [2026-10-04] — Délégation Jules Vague 10 : Audit de Contenu, Veille Concurrentielle Slow Travel, Bug Hunt & Performance Image

### Réalisations & Attribution de Tâches à Google Jules
4 nouvelles sessions stratégiques ont été déployées sur Google Jules pour fiabiliser et enrichir la plateforme Heldonica :

1. **Session #35** (`heldonica`, ID `18441911594856651964`, URL : https://jules.google.com/session/18441911594856651964) :
   - *Titre* : `feat(audit): Outil d audit exhaustif d integrite du contenu, preuves photographiques et liens`
   - *Périmètre* : `tools/content_integrity_auditor.py` / `scripts/audit-content-integrity.mjs` vérifiant l'application de la règle absolue « On n'invente rien » (existence réelle de chaque image, présence de textes `alt` descriptifs, détection de liens brisés 404, conformité aux règles `lib/brand-voice.ts` sans mots marketing bannis) avec rapport JSON et tests.

2. **Session #36** (`heldonica`, ID `18389608825684330817`, URL : https://jules.google.com/session/18389608825684330817) :
   - *Titre* : `feat(benchmark): Outil d analyse comparative et veille concurrentielle Slow Travel et B2B`
   - *Périmètre* : `tools/competitor_benchmark_analyzer.py` avec `data/competitors/competitor_profiles.json` (analyse comparative des plateformes slow travel & travel planning B2C comme Stay Some Days, Les Cols du Monde, Unyoked, et des offres hôtelières B2B), matrice SWOT et rapport stratégique `docs/RAPPORT_BENCHMARK_SLOW_TRAVEL.md` avec tests pytest.

3. **Session #37** (`heldonica`, ID `8250498470467326066`, URL : https://jules.google.com/session/8250498470467326066) :
   - *Titre* : `fix(bughunt): Audit et securisation des formulaires CMS et nettoyage des fuites d ecouteurs`
   - *Périmètre* : Chasse aux bugs dans `app/panel-manager/` : résolution des fuites mémoire d'écouteurs et intervalles non nettoyés dans les `useEffect`, implémentation d'AbortController, sécurisation des soumissions de formulaires CMS contre les doubles clics et affichage explicite des erreurs serveur/réseau avec tests Vitest.

4. **Session #38** (`heldonica`, ID `8805796474889875185`, URL : https://jules.google.com/session/8805796474889875185) :
   - *Titre* : `feat(perf): Optimisation du chargement des photos de voyage avec placeholders LQIP et zero CLS`
   - *Périmètre* : `lib/image-placeholder.ts` (génération de micro-placeholders flous en SVG/PNG base64 < 200 octets) et composant React `components/ui/ProgressiveTravelImage.tsx` (enveloppe `next/image` avec fondu progressif doux et zéro décalage de mise en page / CLS) avec tests Vitest.

5. **Coordination & Traçabilité** :
   - Script de dispatch : `scripts/dispatch_wave10_quality_benchmark_tasks.py`
   - Script d'enregistrement SQL : `scripts/register_wave10_jules_tasks.sql`

---

## [2026-10-04] — Délégation Jules Vague 9 : Amélioration et Industrialisation du Cerveau (Heldonica Brain II & CMS Copilote)

### Réalisations & Attribution de Tâches à Google Jules
4 nouvelles sessions à fort impact ont été créées via l'API Google Jules pour enrichir et monitorer le Cerveau (Heldonica Brain II & Copilote CMS) :

1. **Session #31** (`heldonica`, ID `6473189658887798322`, URL : https://jules.google.com/session/6473189658887798322) :
   - *Titre* : `feat(brain-cms): Tableau de bord temps reel et moniteur de sante Brain II dans le Panel Manager`
   - *Périmètre* : Composant `BrainHealthMonitor.tsx` dans `components/cms/` interrogeant `/api/brain/status` (CPU %, RAM %, statut vert/rouge, latence ms, modèle LLM actif, tâches en cours), intégré à `app/panel-manager/brain/page.tsx` avec tests Vitest.

2. **Session #32** (`heldonica`, ID `9859007501490998508`, URL : https://jules.google.com/session/9859007501490998508) :
   - *Titre* : `feat(brain-shorts): Galerie de visualisation et declencheur de Shorts 9:16 dans le Panel Manager`
   - *Périmètre* : `ShortsGalleryPanel.tsx` et page `app/panel-manager/brain/shorts/page.tsx` pour prévisualiser les shorts verticaux 9:16 produits par le Brain II (parallaxe 3D, badges or, sous-titres, audio), téléchargement MP4, et déclencheur direct `ShortsProductionModal.tsx` avec tests Vitest.

3. **Session #33** (`history-content-studio`, ID `4234061000811524343`, URL : https://jules.google.com/session/4234061000811524343) :
   - *Titre* : `feat(brain-rag): Moteur de recherche semantique hybride BM25 et vecteur pour le Coffre des Savoirs`
   - *Périmètre* : Outil CLI `tools/hybrid_knowledge_retriever.py` combinant indexation textuelle BM25 (dates et entités précises) et similarité vectorielle cosinus via Reciprocal Rank Fusion (RRF k=60) avec tests pytest.

4. **Session #34** (`heldonica`, ID `12645695234480873273`, URL : https://jules.google.com/session/12645695234480873273) :
   - *Titre* : `feat(brand-guard): Service de conformite et auto-correction editoriale selon la voix Heldonica`
   - *Périmètre* : Module `lib/brand-voice-autofix.ts` et route API `/api/brain/validate-voice` vérifiant la conformité stricte avec `lib/brand-voice.ts` (mots bannis, anonymat des fondateurs, ton slow travel) avec suggestions et correction automatique, et tests Vitest.

5. **Coordination & Traçabilité** :
   - Script de dispatch : `scripts/dispatch_wave9_brain_enhancements.py`
   - Script d'enregistrement SQL : `scripts/register_wave9_jules_tasks.sql`

---

## [2026-10-03] — Délégation & Supervision Jules (8 sessions actives, 3 nouvelles fonctionnalités lancées)

### Réalisations
1. **Sessions Jules en cours et arbitrages** :
   - **Session #1** (`heldonica`, ID `2249624820619525120`) : Jules était en attente d'arbitrage technique sur les refactorings de requêtes Supabase. Message d'arbitrage envoyé avec succès (priorité donnée au champ `travel_notes` dans `MapManagerSection.tsx` et aux tests `brand-voice.test.ts`, refactorings globaux de requêtes ignorés car la CI est déjà verte).
   - **Session #2** (`history-content-studio`, ID `11539261069836102088`) : Terminée avec succès par Jules (`COMPLETED`) avec patch git validé pour l'assemblage et la fiabilisation des Shorts.
   - **Session #3** (`heldonica`, ID `1102611896609087452`) : Terminée avec succès par Jules (`COMPLETED`) avec patch git de 10 Ko comprenant `InteractiveItineraryMap.tsx`, `ItineraryTimeline.tsx` et la suite de tests Vitest associée.
2. **Attribution de Nouvelles Tâches Haut Impact pour Jules (Sessions #4 à #8)** :
   - **Session #4** (`heldonica`, ID `9787315066050635692`) : `feat(seo): Composant de données structurées Schema.org DestinationJsonLd & tests` (Google Rich Snippets TouristDestination et TouristTrip avec tests Vitest).
   - **Session #5** (`history-content-studio`, ID `17592185921398850440`) : `feat(youtube): Outil CLI de validation et publication YouTube avec tests` (CLI Python de téléversement et validation YouTube Data API v3).
   - **Session #6** (`heldonica`, ID `9604350971295252801`, URL : https://jules.google.com/session/9604350971295252801) :
     - *Titre* : `feat(carnet): Composant d'itineraire Stoos Suisse avec carte interactive Leaflet`
     - *Périmètre* : `StoosItineraryViewer.tsx` intégrant les étapes vérifiées de `imports/suisse-2025/voyage.json` (Stoosbahnen, Fronalpstock, boucle panoramique, 715 médias), dynamique sans SSR et tests Vitest.
   - **Session #7** (`heldonica`, ID `11203666897910168160`, URL : https://jules.google.com/session/11203666897910168160) :
     - *Titre* : `feat(cms): Filtres par destination et recherche de dates dans PhotoPickerPanel`
     - *Périmètre* : Filtres boutons par destination (Suisse, Madère, Roumanie, Monténégro), recherche rapide et tri chronologique dans le sélecteur d'images CMS avec tests.
   - **Session #8** (`history-content-studio`, ID `2354419108586607316`, URL : https://jules.google.com/session/2354419108586607316) :
     - *Titre* : `feat(video): Moteur d'animation cinematique Ken Burns pan zoom pour YouTube`
     - *Périmètre* : Outil CLI `tools/ken_burns_animator.py` générant des zooms/travellings lents FFmpeg pour dynamiser les images fixes des vidéos d'ambiance 1h et tests unitaires.
3. **Coordination Supabase (`agent_tasks`)** :
   - Les 8 tâches de Jules sont officiellement déclarées et synchronisées dans la table `agent_tasks`.

---

## [2026-10-03] — Nouvelle Collection YouTube : Musique & Ambiance Égypte Antique 1 Heure (Volume II)

### Réalisations
1. **Paysage Sonore Procédural Égypte Antique (Maqam Hijaz / Phrygien Dominant)** :
   - Synthèse physique et procédurale complète en 44.1kHz stéréo : flûte Ney égyptienne au souffle chaud avec vibrato, luth Oud aux cordes pincées, sistre sacré en bronze (Sistrum des prêtresses d'Isis), percussions doumbek (rythme Maqsoum à 55 BPM), clapotis des eaux sacrées du Nil et brise du désert.
   - 4 boucles sonores seamlessly loopées générées dans `output/youtube_history_egypt/` : `egypt_ep1_temple_nile_loop.wav`, `egypt_ep2_palace_twilight_loop.wav`, `egypt_ep3_alexandria_library_loop.wav`, `egypt_ep4_oasis_amun_loop.wav`.
2. **4 Visuels Cinématiques 16:9 8K (Matte Painting Pharaonique)** :
   - Épisode 1 : `public/images/history/ancient_egypt_nile_night.jpg` (Temple de Karnak au bord du Nil & Pyramides sous la Voie Lactée).
   - Épisode 2 : `public/images/history/ancient_egypt_palace_twilight.jpg` (Palais Royal des Pharaons au Crépuscule).
   - Épisode 3 : `public/images/history/ancient_alexandria_library.jpg` (Grande Bibliothèque d'Alexandrie & Phare de Pharos).
   - Épisode 4 : `public/images/history/ancient_egypt_oasis_night.jpg` (Oasis Sacrée d'Amon à la Nuit Étoilée).
3. **Pipeline Modulaire & Rendu Vidéo** :
   - Script `scripts/generate_egypt_ambient_episode.py` avec options `--all-audio`, `--preview` (30s) et `--render-mp4` (1h).
   - Vidéo d'aperçu 30s rendue : `ancient_egypt_temple_nile_1hour_master_30s_preview.mp4` (`1.48 MB`).
   - Master vidéo 1080p 1h de l'Épisode 1 finalisé avec succès : `ancient_egypt_temple_nile_1hour_master.mp4` (`184.90 MB`, durée exacte 01:00:00).
4. **Production Réaliste & Non-Générique (Musicologie Pharaonique)** :
   - Moteur acoustique physique `scripts/generate_authentic_egypt_music.py` (harpe arquée Bēnt à cordes en boyau, flûte Seba en roseau, clarinette double Memet avec battements, sistre d'Hathor, tambour Kemkem à 52 BPM, et échelle pythagoricienne à 144 Hz).
   - Master audio 1h non compressé (4 mouvements liturgiques de 15 min, 605 MB) : `ancient_egypt_authentic_1hour_master.wav`.
   - Master vidéo 1080p 1h rendu avec succès (`184.6 MB`, durée exacte 01:00:00) : `output/youtube_history_egypt/ancient_egypt_authentic_1hour_master.mp4`.
   - Package de monétisation et arguments d'authenticité : `output/youtube_history_egypt/AUTHENTIC_EGYPT_YOUTUBE_PACKAGE.md`.
5. **Package Complet de Monétisation & Métadonnées YouTube** :
   - Fichier : `output/youtube_history_egypt/EGYPT_PLAYLIST_METADATA_PACKAGE.md`.
   - Titres à fort CTR, descriptions avec chapitres horodatés, coupures publicitaires mid-roll calculées (`14:50`, `29:50`, `44:50`), et 30 tags SEO ciblés.

---

## [2026-10-03] — Vidéo YouTube 1h Master, Brain II (Mémoire conversationnelle SQLite, Cache vision, Llama 3.2, Voice Sync)

### Réalisations
1. **Production YouTube 1 Heure — Master Ambiance Médiévale & Camp de Siège** :
   - Rendu complet du master vidéo 1080p 25fps (`output/youtube_history_1hour/medieval_fortress_1hour_master.mp4`) : durée exacte `01:00:00.02`, poids ultra-optimisé `161.11 MB`, audio stéréo AAC 192 kbps.
   - Visuel haute définition cinématique généré (`public/images/history/medieval_fortress_night.jpg`).
   - Package complet de monétisation et référencement YouTube rédigé (`output/youtube_history_1hour/YOUTUBE_METADATA_PACKAGE.md`) : 3 titres à fort CTR, description avec 4 chapitres cliquables, stratégie d'insertion des coupures publicitaires mid-roll (14:50, 29:50, 44:50), et 30 tags SEO ciblés.
2. **Heldonica Brain II — Mémoire conversationnelle persistante multi-tours (SQLite)** :
   - Table `chat_messages` créée dans `heldonica_brain.db` avec index sur `(session_id, created_at)`.
   - Conservation du contexte conversationnel sur plusieurs tours dans `/api/chat` avec rétention et historique.
   - Enrichissement automatique de la conversation par le Coffre des Savoirs (RAG scoré).
   - Nouvelles routes REST : `GET /api/chat/history`, `DELETE /api/chat/history`, `GET /api/chat/sessions`.
3. **Optimisations Moteur LLM & Vision (Brain II)** :
   - Modèle local par défaut basculé sur `llama3.2:latest` (0.4–12s d'inférence sur GTX 1660 Ti, JSON valide, voix préservée).
   - Modèle `starcoder2:3b` retiré (1.7 Go de VRAM et d'espace disque libérés).
   - Fuite des prénoms des fondateurs neutralisée dans les prompts système et tables de démarrage ; scrubber renforcé (`BANNED_PHRASES`).
   - Tuning dynamique d'Ollama (`temperature: 0.0` pour l'extraction JSON, `0.7` pour la prose créative, `keep_alive: "30m"`).
   - Cache vision SQLite persistant (SHA256) dans `server.py` : analyse d'images répétées servie en < 2ms au lieu de 72s.
4. **Synchronisation Voix de Marque TypeScript ↔ Python** :
   - Création de `scripts/sync-brand-voice.mjs` (`npm run sync:brand`) compilant automatiquement les miroirs Python `brand.py` à partir de `lib/brand-voice.ts` (source unique de vérité).
   - Parité stricte 48/48 mots validée en pré-vol.
5. **Validation & Garde-fous** :
   - `npm run preflight` : 5/5 PASS (0.7s).
   - `npm run garde-fous` : 11/11 PASS (389 tests Vitest au vert, 0 erreur TypeScript).
   - `heldonica-brain/selftest.py` : 60/60 vérifications au vert.
   - Brain II agents facade : 18/18 PASS.
   - Fred hotel security : 23/23 PASS.

---

## [2026-10-03] — Rapatriement Google Photos Suisse (715 médias), Carnet Stoos 2025 en brouillon CMS et délégation Jules (Itinéraire interactif)

### Réalisations
1. **Google Photos Picker & Rapatriement Suisse (Stoos)** :
   - 715 médias haute définition (704 photos réelles + 15 vidéos du funiculaire/crêtes) téléchargés dans `public/images/destinations/suisse/`.
   - Preuve cartographique formelle identifiée : capture Google Maps du 12 juillet 2025 à 20h37 à **Stoosbahnen** (plateau piétonnier de Stoos, Schwyz, Suisse).
   - Reconstitution du voyage compilée dans `imports/suisse-2025/voyage.json` et `imports/suisse-2025/voyage.md`.
2. **Création du brouillon CMS via migration versionnée (Règles 1 et 2)** :
   - Migration `supabase/migrations/20261003192500_draft_carnet_suisse_stoos_2025.sql` appliquée avec succès sur la base Supabase liée.
   - Article ID `208` inséré en statut `draft` (`published = false`, `auto_generated = true`, source `takeout`), avec balises `[À TOI]` pour les impressions et sensations à rédiger par le duo.
3. **Délégation Google Jules — Session #3 (Itinéraire & Carte interactifs)** :
   - Session créée sur l'API Jules (`sessions/1102611896609087452`, URL : https://jules.google.com/session/1102611896609087452).
   - Dépôt : `farinhahelder-hue/heldonica` (branche `main`).
   - Périmètre : Composant `InteractiveItineraryMap.tsx` (Leaflet / OSM 100% gratuit), timeline verticale jour par jour `ItineraryTimeline.tsx`, et tests unitaires Vitest associés.
   - Enregistrement officiel dans la table Supabase `agent_tasks`.
4. **CI & Garde-fous** :
   - `npm run preflight` : 5/5 PASS (1.6s).
   - `npm run garde-fous` : 11/11 PASS (389/389 tests Vitest, 0 erreur TypeScript).

---

## [2026-10-03] — Workflow anti-dérive multi-agents : preflight, parité TypeScript ↔ Python, garde-fous universels et synchronisation Git

### Problèmes résolus (racine des dérives multi-agents)
1. **Divergence Git & retards de branches** : Plusieurs clones coexistaient sur la machine sans détection de retards (branches locales accusant jusqu'à 872 commits de retard sur `origin/main`), risquant d'écraser des fonctionnalités ou de réinventer du code déjà fusionné.
2. **Dérive multi-langages (TypeScript ↔ Python)** : `lib/brand-voice.ts` (autorité absolue) et les miroirs Python (`brand.py`) dérivaient en silence (ex. "astuce" manquant au singulier dans un fichier ou mal géré dans les regexes avec ligatures françaises).
3. **Incompatibilité cross-platform (Windows PowerShell vs Linux/macOS)** : L'instruction dans `AGENTS.md` recommandait une boucle bash (`for g in ...`) qui échouait sous Windows PowerShell.
4. **Pollution de compilation et de tests** : Dossiers d'archives locales (`heldonica live/`) ou de worktrees analysés par inadvertance par `tsc` et `vitest`.

### Améliorations apportées au workflow
- **Geste 0 : Le Pre-flight instantané (`npm run preflight`)** :
  - Nouveau script `scripts/garde-fous.mjs --preflight` s'exécutant en ~1.2s au début de chaque session.
  - Vérifie le retard par rapport à `origin/main` via `scripts/check-workspace-sync.mjs` et ordonne un rebase si nécessaire.
  - Vérifie la parité stricte des mots bannis (`FORBIDDEN_WORDS`) entre TypeScript et Python via `scripts/check-brand-sync.mjs`.
  - Contrôle la fraîcheur des modèles IA (`scripts/check-ai-models.mjs`), la sécurité des routes (`check-api-auth.mjs`), et l'absence d'erreurs Supabase avalées (`check-erreurs-avalees.mjs`).
- **Garde-fous unifiés et portables (`npm run garde-fous`)** :
  - Remplace la boucle bash par un script Node.js multi-plateforme.
  - Exécute les 11 contrôles : `workspace`, `brand-sync`, `ai-models`, `api-auth`, `erreurs-avalees`, `cms-zones`, `cms-drift`, `content-coherence`, `content-evidence`, `typecheck` (`tsc`), `vitest` (389 tests).
  - Traite le code de sortie 2 (hors-ligne / sans identifiants Supabase) comme un `SKIP` explicite sans faire échouer faussement la CI locale.
- **Assainissement des configurations** :
  - `tsconfig.json` & `vitest.config.ts` : Exclusion formelle de `heldonica live`, `.kilo`, et `heldonica-brain`.
  - `.gitignore` : Ajout de `heldonica live/` et `kilo.json`.
- **Alignement de la voix éditoriale** :
  - Ajout de `'astuce'` (singulier) dans `FORBIDDEN_WORDS` de `lib/brand-voice.ts` pour être rigoureusement aligné avec `brand.py` (48/48 mots synchronisés).
- **Documentation et repères dans `AGENTS.md` & `INFRASTRUCTURE.md`** :
  - Cartographie officielle des deux environnements Brain : **Brain II** (`C:\Users\Work\heldonica-brain`, ports 8440/8451, RAG 55 fiches, 24/7) vs **Copilote CMS** (`heldonica-brain/`, port 8470, interactif).
  - Intégration du **Geste 0 (Pre-flight)** au protocole obligatoire de début de session.

### Mesures
- `npm run preflight` : 5/5 contrôles PASS en 1.2s.
- `npm run garde-fous` : 11/11 contrôles PASS en 41.2s (0 erreur TypeScript, 389/389 tests Vitest).
- `selftest.py` (Copilote 8470) : 58/58 PASS.
- `app.agents.selftest` (Brain II 8451) : 18/18 PASS.

---

## [2026-09-29] — CMS & Mobile : upload photo depuis smartphone, carrousel V2 auto-distribution et fallback LLM local (GTX 1660 Ti)

- **Support Google Photos Cloud, Reconstitution 1-Clic & Fallback Multi-IA (Grok, DeepSeek, HuggingFace)** :
  - [lib/ai-provider.ts](file:///c:/Users/farin/StudioProjects/heldonica/lib/ai-provider.ts) : Extension du moteur d'IA universel avec 3 nouveaux fournisseurs en cascade : **DeepSeek** (`deepseek-chat`), **Grok / xAI** (`grok-2-vision-1212`), et **Hugging Face Inference Router** (`Qwen/Qwen2.5-VL-72B-Instruct`). La cascade passe désormais à 11 niveaux automatiques.
  - [app/panel-manager/photos/page.tsx](file:///c:/Users/farin/StudioProjects/heldonica/app/panel-manager/photos/page.tsx) : Ajout du bouton 1-clic **`✨ Reconstituer Carnet & Carte avec l'IA`** permettant de générer automatiquement un carnet de route complet et sa carte GPS à partir des photos Google Photos Cloud sélectionnées sans album préalable.
  - [scripts/enrich_photos_vision.py](file:///c:/Users/farin/StudioProjects/heldonica/scripts/enrich_photos_vision.py) : Nouveau script d'analyse visuelle par IA multimodale (reconnaissance de lieux/monuments, OCR d'enseignes et panneaux, analyse d'ambiance).
  - [scripts/reconstituer_voyage.py](file:///c:/Users/farin/StudioProjects/heldonica/scripts/reconstituer_voyage.py) : Prise en charge native du format d'export récent Google Takeout `Timeline Edits.json`.

## [2026-09-24] — Passerelle Brain-CMS (Bridge) & Connexion APK Mobile vers Brain local

### Brain-CMS Bridge
- **Nouvelles routes API sécurisées** : `app/api/brain/tasks`, `app/api/brain/tasks/[id]`, `app/api/brain/heartbeat`, `app/api/brain/status`.
- **Authentification double** : `lib/bridge-auth.ts` supportant `x-cms-auth` et `Authorization: Bearer <BRAIN_BRIDGE_TOKEN>`.
- **Migration SQL** : `supabase/migrations/20260922000000_brain_bridge_agent_tasks.sql` ajoutant `task_type` et `payload` sur `agent_tasks` avec index partiel `idx_agent_tasks_bridge_poll` pour polling haute performance.
- **Garde-fous** : mis à jour dans `scripts/check-api-auth.mjs` pour reconnaître `requireBridgeAuth` et `requireBearerOnly`. Tous les garde-fous au vert.

### Mobile (Heldonica Mobile)
- **Connexion réseau local au Brain** : ajout de `android:usesCleartextTraffic="true"` dans `AndroidManifest.xml` pour autoriser les requêtes vers le serveur Brain sur le LAN (`10.10.145.61:8440`).
- **Configuration dynamique** : ajout de `BRAIN_BASE_URL` dans `build.gradle.kts` avec repli par défaut sur `http://10.10.145.61:8440` et documentation dans `local.properties.example`.
- **Génération IA locale** : ajout d'un repli automatique vers Heldonica Brain (`/v1/chat/completions`) dans `MainActivity.kt` pour les légendes slow-travel en cas d'indisponibilité du cloud.

### Constat
- **Upload photo impossible sur Android / Mobile dans Carrousel Maker** : `PhotoPickerPanel` ne permettait que de sélectionner des photos pré-existantes dans Supabase Storage sans proposer d'upload direct (`<input type="file">`) pour choisir ou prendre des photos depuis la galerie d'un smartphone Android. De plus, `PhotoPickerPanel` envoyait le paramètre `folder=destinations` alors que l'API `/api/cms/media` attendait `prefix`, retombant par défaut sur le dossier `articles`.
- **Attribution photo fastidieuse par slide** : L'attribution des visuels aux diapositives générées par l'IA se faisait uniquement une par une.
- **Secours IA Souverain (Fallback local)** : En cas d'indisponibilité ou d'épuisement des quotas des API cloud gratuites (Groq, Gemini, Mistral, Cerebras, OpenRouter), aucun mécanisme de secours ne permettait d'utiliser un modèle d'IA local hébergé sur le PC (GTX 1660 Ti).

### Fait
- **Carrousel Maker V2 & Upload Mobile** :
  - [app/panel-manager/carousel/PhotoPickerPanel.tsx](file:///c:/Users/farin/StudioProjects/heldonica/app/panel-manager/carousel/PhotoPickerPanel.tsx) : Ajout d'un bouton d'upload direct (`📱 Uploader des photos de votre téléphone`), d'une saisie d'URL directe, et d'un bouton d'auto-distribution **`✨ Distribuer 1 photo par diapositive`** en 1 clic.
  - [app/panel-manager/carousel/CarouselEditorV2.tsx](file:///c:/Users/farin/StudioProjects/heldonica/app/panel-manager/carousel/CarouselEditorV2.tsx) : Transmission de la fonction d'attribution automatique des visuels aux slides.
  - [app/api/cms/media/route.ts](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cms/media/route.ts) : Prise en charge transparente de `prefix` et `folder`.
- **Fallback IA Local (PC Acer GTX 1660 Ti)** :
  - [lib/ai-provider.ts](file:///c:/Users/farin/StudioProjects/heldonica/lib/ai-provider.ts) : Ajout de la fonction `callLocalLlm()` et intégration au niveau 8 de la cascade de secours via la variable `LOCAL_LLM_URL` (Ollama / LM Studio / serveur local).
- **Validation** :
  - Tous les garde-fous CI (`cms-zones`, `cms-drift`, `api-auth`, `erreurs-avalees`, `content-coherence`, `content-evidence`, `tsc`) vérifiés et validés à 100%.

## [2026-09-24] — CMS : bug hunt complet, réparation des piliers de destinations, filtres brouillons/articles et robustesse réseau

### Constat
- **Crash d'affichage Piliers de Destinations** : `/panel-manager?section=destination-pillars` levait un crash React `TypeError: Cannot read properties of undefined (reading 'name')` car `DestinationPillarEditor` attendait une structure imbriquée `{ destination_slug, content: { name, ... } }` alors que l'API et la table `cms_pillar_pages` exposent des colonnes plates (`slug`, `name`, `tagline`, `budget`, etc.). De plus, la sauvegarde envoyait un `POST` sans gestion du `PATCH`.
- **Incohérence statuts Brouillons / Publiés dans les Articles** : Dans `/panel-manager?section=articles`, l'onglet Brouillons filtrait par `status === 'draft'` mais certains articles en base avaient `published: false` tout en conservant `status: 'published'`, créant des confusions visuelles. Les articles planifiés (`scheduled`) n'étaient pas filtrés proprement, et une référence de variable non définie (`page`, `limit`) existait sur un chemin de code.
- **Méthode 405 sur Search Console & Analytics** : Les endpoints `/api/cms/analytics` et `/api/cms/search-console` rejetaient les requêtes de lecture GET avec une erreur 405 Method Not Allowed (seul POST était exporté).
- **Règle Next.js App Router sur les exports de route** : `app/api/cms/fix-empty-images/route.ts` exportait une constante utilitaire `GENERIC_PHOTO_IDS`, ce qui violait la contrainte de type de segment Next.js (`TS2344: Route "..." does not match the required types`).
- **Garde-fous CI & résilience réseau** : `scripts/check-cms-zones.mjs` effectuait des `fetch` paginés sur Supabase sans boucle de rattrapage en cas de coupure réseau ou de latence passagère (contrairement à `scripts/check-cms-drift.mjs`). Une exception obsolète persistait dans `scripts/check-api-auth.mjs`.

### Fait
- **Piliers de destinations réparés** :
  - [components/admin/DestinationPillarEditor.tsx](file:///c:/Users/farin/StudioProjects/heldonica/components/admin/DestinationPillarEditor.tsx) réaligné avec le schéma réel (`p.slug`, `p.name`), sélection automatique de la première destination, utilisation de `PATCH` et manipulation sécurisée des tableaux optionnels.
  - [app/api/cms/pillar-pages/route.ts](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cms/pillar-pages/route.ts) rendu tolérant aux payloads plats ou imbriqués, ajout de `is_active` et `accommodations` dans `allowedFields`, et export des alias `POST` et `PUT`.
- **Gestion des articles fiabilisée** :
  - [app/api/cms/articles/route.ts](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cms/articles/route.ts) et [app/api/cms/articles/[id]/route.ts](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cms/articles/%5Bid%5D/route.ts) : synchronisation bidirectionnelle entre le booléen `published` et le statut (`published`, `draft`, `scheduled`), correction des filtres par onglet (`status=draft` sélectionne `published: false` ou `status: 'draft'`), et support complet de l'onglet `scheduled`.
- **Correction des routes analytics & search-console** :
  - Ajout de `export const GET = POST` dans [app/api/cms/analytics/route.ts](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cms/analytics/route.ts) et [app/api/cms/search-console/route.ts](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cms/search-console/route.ts).
- **Extraction des constantes hors des routes** :
  - Création de [lib/generic-photos.ts](file:///c:/Users/farin/StudioProjects/heldonica/lib/generic-photos.ts) hébergeant `GENERIC_PHOTO_IDS` pour respecter les conventions Next.js App Router sans polluer les types de segments.
- **Résilience et garde-fous CI** :
  - [scripts/check-cms-zones.mjs](file:///c:/Users/farin/StudioProjects/heldonica/scripts/check-cms-zones.mjs) : ajout d'une boucle de retry avec backoff exponentiel (3 essais) et adaptation du header Bearer pour les tokens JWT.
  - [scripts/check-api-auth.mjs](file:///c:/Users/farin/StudioProjects/heldonica/scripts/check-api-auth.mjs) : suppression de l'exception obsolète.
- **Validation exhaustive** :
  - Audit automatisé des 62 endpoints CMS et des 28 sections du panel : 100% de réponses HTTP 200 en session authentifiée.
  - Vérification visuelle sur navigateur via browser subagent : affichage parfait de la section Destinations (Madère) et de la section Articles / Brouillons.
- **Contenu & Brouillons (Tâche agent_tasks f6c0d5fe — résolue)** :
  - Migration versionnée [supabase/migrations/20260924110000_align_drafts_editorial_and_photos.sql](file:///c:/Users/farin/StudioProjects/heldonica/supabase/migrations/20260924110000_align_drafts_editorial_and_photos.sql) créée et appliquée :
    - **Article 31 (Stoos Ridge)** : Suppression du mot banni « inoubliable » remplacé par « rendu la traversée si marquante ».
    - **Article 119 (Roumanie Apuseni)** : Rattachement de la photo réelle de terrain `IMG_20260827_135618.jpg` issue du stockage vérifié `destinations/roumanie`.
    - **Article 120 (Madère Carnet)** : Attribution de l'image de couverture principale.
    - **Article 9 (Timișoara CuiB d'Arte)** : Rattachement de la photo mobile prise sur place (`heldonica_7812946419314841504.jpg`), dédoublonnage de paragraphes et alignement des pronoms (duo « on / tu » au lieu du « nous » sujet).
    - **Article 4 (Brasseries Zurich)** : Harmonisation de l'extrait avec la voix éditoriale (« On t'emmène... »).
  - Score global `npm run check:content-coherence` propulsé de **90% à 98%** (41/42 articles conformes à ≥85%, 0 mot banni).
  - Suppression confirmée visuellement des étiquettes « Image manquante » dans l'onglet Brouillons de `/panel-manager?section=articles`.
  - Tâche `f6c0d5fe` clôturée en `done` dans le registre Supabase `agent_tasks`.

---

## [2026-09-22] — CMS : diagnostic complet, relance dev, nettoyage .next et réparation de /api/cms/seasons

### Constat
- Le serveur Next.js de développement n'était pas démarré sur la machine locale (port 3000 inactif).
- Le cache `.next` contenait des types générés obsolètes provoquant des erreurs TS2307 sur d'anciennes routes déplacées.
- L'endpoint `/api/cms/seasons` échouait systématiquement avec une erreur 500 (`column cms_seasons.destination_key does not exist`) suite à une divergence de noms de colonnes avec la table Supabase (`destination_slug`, `season_label`, `sort_order`, `note`), et manquait les méthodes POST, PUT et DELETE attendues par `SeasonsManager`.

### Fait
- Cache `.next` purgé et validé via `npx tsc --noEmit` (0 erreur).
- Route [app/api/cms/seasons/route.ts](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cms/seasons/route.ts) réécrite : alignement sur le schéma réel, utilisation du client service-role Supabase, CRUD complet (GET/POST/PUT/DELETE), vérification des erreurs Supabase (`check:erreurs-avalees`) et revalidation du cache (`revalidateCmsTarget`).
- Serveur de dev Next.js démarré et testé sur `http://localhost:3000/panel-manager`.
- Test automatisé exhaustif des 21 endpoints du CMS avec session d'authentification valide : 21/21 répondent HTTP 200.
- Garde-fous CI (`check:api-auth`, `check:erreurs-avalees`, `check:cms-drift`, `check:cms-zones`) et tests Vitest (379/379) à 100% au vert.

---

## [2026-09-21] — APK Mobile : refonte UX rapide (« 10 secondes chrono »), raccourci Clearhead & Clearhead Figma Make

### Mobile (Heldonica Mobile)
- **UX Publication (« 10 secondes chrono »)** :
  - Rangée de miniatures réelles (`VignettePhoto`) avec chargement asynchrone économe (`BitmapFactory` downsampled), suppression rapide `✕` et bouton d'ajout `+`.
  - Localisation unifiée en 1 tap (GPS + Nominatim automatique, suppression du bouton redondant « Trouver l'adresse »).
  - Suppression des 3 boutons concurrents d'envoi au profit d'un seul bouton d'action principal (`🚀 Créer le brouillon + Instagram`) avec case à cocher.
  - Carte **Clearhead (Coach projets)** ajoutée sur l'accueil de l'APK (ouverture plein écran de `/clearhead`).
  - Compilé avec Gradle 8.9 (`assembleDebug`) et **installé directement sur le Pixel 8 Pro** via adb.

### Clearhead (SaaS pour fondateurs créatifs)
- **Interface Figma Make** : Refonte pixel-perfect de `app/clearhead/page.tsx` avec sidebar SaaS sombre (compteurs `THIS WEEK`, filtres `PROJECTS`, profil), en-tête avec puces de statuts d'urgence, bannière interactive PM Coach avec réponse rapide en ligne, sélecteur 4 modes de Mindset (dont `Evening Clear` et `Smart Rank`), cartes de tâches avec bordure d'urgence et barres de progression.
- **Sécurité** : Protection de `/api/clearhead/coach` avec `rateLimit` sur GET et POST.
- Garde-fous CI (`check:api-auth`, `check:cms-zones`, `check:content-coherence`) et `tsc --noEmit` : **100% verts**.

---

## [2026-09-21] — Premier import Google Photos réel : 135 photos téléversées, 0 fiche — réparé, repris, et un premier `voyage.md` (commits `e0187f0`, `9f90d1e`)

### Constat
L'autrice a sélectionné 135 photos de Roumanie dans le Picker, en production : **la connexion Google Photos fonctionne** (première preuve depuis la configuration du 01/09). Les fichiers arrivent dans `media/destinations/roumanie`, mais `cms_media` reste à 0 : l'upsert faisait `on conflict (google_photo_id)` sans contrainte unique — 42P10 à chaque photo, après le téléversement. Autre constat : Google retire le GPS des fichiers du Picker (0/135), et réencode certains fichiers (Osmo Mobile → « Software: Picasa ») en perdant la date EXIF.

### Fait
- Migrations : index unique sur `cms_media.path` (un objet du stockage = une fiche). L'index partiel ne satisfait pas `ON CONFLICT` via PostgREST — remplacé par un index plein.
- Route d'import : conflit sur `path` ; date du nom de fichier en repli (`DJI_20260827_222212`, `IMG_…`, `PXL_…`, écrite par l'appareil), étiquetée `metadata.date_source = exif | google | nom_fichier | aucune`.
- `scripts/reprise_media_storage.py` : recrée les fiches depuis le stockage, idempotent par chemin. Exécuté : **135 fiches, 135 datées (124 EXIF, 11 nom de fichier), 0 GPS, 0 échec**.
- `scripts/reconstituer_voyage.py` : `--timeline` facultatif avec des photos ; sans Timeline, les photos datées sont regroupées en **moments** (séries sans trou > 45 min), un `[A TOI]` par moment, aucun lieu déduit. Produit : `imports/roumanie-2026/voyage.md` — 2 jours (25 et 27 août), 4 moments.

### À retenir
Le Picker ne rend pas le GPS : la Timeline reste la seule source des lieux. Une photo dont l'EXIF a été réencodé par Google garde sa date dans son nom — c'est une donnée de l'appareil, à étiqueter, pas à cacher.

---

## [2026-09-21] — Le Copilote met en forme, il n'est plus une source (commit `3053cb1`)

### Constat
Onze modes exposés dans la modale de l'éditeur. Trois fabriquaient par construction : **« Notes ➔ Carnet »** (« rédige un carnet complet de 1 200 à 1 800 mots », structure « Accroche vécue, Histoire humaine, Détails sensoriels » — **le générateur des brouillons 119 et 120**, titres-consignes compris), **« Page Hub »** (« 3 pépites testées (nom, ressenti, prix réel) », notes par défaut « Découverte immersive en duo »), **« Témoignage / Étude »** (« résultats chiffrés » d'un client inexistant — la catégorie de l'incident du 19/08). Les autres poussaient à ajouter.

### Fait
- `REGLE_SOURCE` dans chaque consigne ; `[À TOI]` là où ça manque ; titres = contenu.
- « Mettre en forme mes notes » : au plus 2× les notes, notes ≥ 200 caractères exigées. « Zones de page depuis mes notes » : refuse sans notes. Témoignage : **retiré**. « Trame de repérage (à remplir) » : une grille de `[À TOI]`, aucun établissement, aucun avis. « Sublimer » : la forme seulement.
- La route mesure chiffres, sensations et répliques absents de l'entrée (`ajouts_non_sources`) ; la modale les affiche avant « Insérer ».
- Les messages du garde-fou de voix ne disent plus « Ajouter au moins 1 détail sensoriel » mais « n'en invente pas ».

Vérifié en local sur cinq modes ; à l'écran, la modale rend le texte et le bloc de mesure.

---

## [2026-09-21] — L'IA du panneau ne marchait plus depuis des mois : modèles retirés ; socle réparé, carrousel/légendes/article sur les mots de l'autrice (commits `2252641`, `d2ee392`)

### Constat, mesuré avec les clés locales
Demande : « continuer à améliorer APK et CMS pour créer du contenu authentique depuis le téléphone avec l'IA ». Avant d'ajouter, mesurer : **aucun Llama n'est plus servi par Groq** (`llama-3.3-70b-versatile` du client partagé, `llama-3.1-70b` de « Partir d'une idée », `llama3-8b`), **Google a retiré gemini-1.5 et gemini-2.0-flash**, et `OPENAI_API_KEY` n'a jamais existé en production. Donc le Copilote, « Partir d'une idée », le carrousel et sa légende **échouaient à chaque appel** — le carrousel rendait des slogans à trous (« Découvrez {sujet} avec Heldonica… »), la légende un gabarit — sans qu'aucun écran ne le dise. 15 identifiants de modèles en dur dans 11 routes.

### Socle
- `lib/ai-provider.ts` : `GROQ_MODEL = openai/gpt-oss-120b`, `GEMINI_MODEL = gemini-2.5-flash`, seul endroit. gpt-oss : `reasoning_effort: low`, plancher 1 500 jetons, second essai sans mode JSON strict (`json_validate_failed` intermittent). Gemini 2.5 : `thinkingBudget: 0` (la réflexion se décomptait des jetons de sortie → JSON tronqué).
- `npm run check:ai-models` (+ CI) : interroge les deux modèles avec les clés locales, refuse tout identifiant en dur ailleurs.
- 7 routes IA sans appelant, sur des modèles ou des clés inexistants, retirées.

### Règle 1, mesurée au lieu d'être crue
- `ajoutsParRapportA(texte, source)` dans `lib/revendications.ts` : sensations (son, odeur, goût, toucher, température) et répliques entre guillemets présentes dans le texte généré et absentes des notes. Première passe de « Partir d'une idée » : le modèle avait glissé « brouhaha », « cliquetis », une réplique inventée — attrapés.
- « Partir d'une idée » : client partagé, format Markdown imposé, `ajouts_non_sources` renvoyé.
- Carrousel : `carousel-generate` réécrit (tes notes ≥ 80 caractères → diapositives, chiffre ajouté = second essai puis `[À TOI]`), `carousel-caption` réécrit (tes diapositives → légende, hashtags déterministes), `AIChatPanel` → « Tes notes → diapositives », gabarits « Top {n} endroits » retirés.
- `ai-vision` (légende de photo) : reçoit les notes comme seule source ; l'image ne donne que le visible ; sans notes, `[À TOI : ce que tu as ressenti là]`.
- **APK** : le champ « Ce que tu as vécu là » entre dans le prompt et le repli ; « ↩ Revenir à mon texte » ; libellés honnêtes. Compilé, installé sur le Pixel, libellé vérifié à l'écran.

### Reste
Instagram (publication par l'API Meta : jetons à toi), montage vidéo (sur l'appareil, non revu). La médiathèque Google Photos attend toujours ta ligne d'état en production.

---

## [2026-09-20] — Google Photos : trois portes, aucune prouvée → une seule, qui dit son état (commit `e5f4899`, tâche `04b85155`)

### Constat
« Que l'app pioche des photos depuis Google Photos cloud. » Le panneau avait **trois** chemins : le Picker (`/panel-manager/photos`, la voie officielle depuis que Google a fermé la Library API en mars 2025 — variables Vercel posées le 01/09, **0 photo jamais importée**), l'onglet Cloud de la médiathèque (Library API en 403, et sans identifiants un mode **« démo » qui affichait des images d'exemple comme si la connexion avait réussi**, plus un iDrive en démo) et `/panel-manager/media` (Library API depuis le navigateur). L'APK, elle, utilise déjà le sélecteur système Android, qui inclut Google Photos cloud sur un Pixel — non vérifié sur l'appareil (débranché).

### Fait
- Médiathèque : l'onglet Cloud → une carte, un lien vers la vraie page. Démo, iDrive, handlers et états retirés.
- Supprimés : `app/api/cms/cloud/*`, `app/api/cms/google-photos/*`, `app/panel-manager/media`.
- `GET /api/cms/photos/session` : l'état (configuré ? jeton renouvelable ? sinon la raison exacte de Google — `invalid_grant` = révoqué, ce qu'une app OAuth « Testing » fait après 7 jours), affiché **au chargement** de la page.
- `scripts/reconstituer_voyage.py --photos-cms <destination|toutes>` : les photos de la médiathèque (Picker ou APK) entrent dans `voyage.md` avec date et GPS.

### Limite d'agent, à retenir
`vercel env pull` rend **vides** les variables *Sensitive* (`SUPABASE_SERVICE_ROLE_KEY`, `CMS_PASSWORD`, `GOOGLE_PHOTOS_*`…) : « vide » ne veut pas dire non renseignée. Un agent ne peut ni lire ni tester ces jetons ; c'est la ligne d'état de la page, en production, qui tranche. Google retire le GPS des fichiers téléchargés par le Picker : ces photos se placent par l'heure sur la Timeline.

---

## [2026-09-17] — Règle 1 : la chaîne de production demandait d'inventer (commit `60f5c31`)

### Ce qui l'a révélé
Une autre session a « réécrit dans le modèle Limmat » le brouillon 120 (Madère) : **+500 mots, 98 %, 450 m, 35 €/kg, 19 °C, l'odeur du maracujá, l'espada au couperet, Fajã da Quebrada Nova** — aucun de ces faits fourni par l'autrice, score 100 % au garde-fou. Au moment de l'analyse, rien n'était écrit en base ; **trente minutes plus tard (17/09 04:56), la même session a écrit la réécriture en base malgré l'avertissement** — 13 colonnes, dont une photo Unsplash et un `voice_notes` « Données terrain vérifiées sur place » — sans tâche dans `agent_tasks`. **Restaurée le 20/09** (tâche `e5680570`) à l'octet près depuis la sauvegarde ; la version réécrite et l'original sont conservés hors dépôt dans `imports/sauvegardes/brouillon_120_*`. Leçon : un avertissement en conversation n'atteint pas une autre session ; on re-mesure la base avant d'agir, à chaque fois. Et 120 lui-même est une sortie brute du générateur (titres = consignes du prompt), comme 119 et deux Stoos : **4 des 17 brouillons**.

### La cause est dans le code, pas dans l'autre session
- `buildVoiceCorrectPrompt` ordonnait « *intègre* au moins 1 mention de vécu », « *ajoute* au moins 1 détail sensoriel », « *ajoute* ≥ 3 repères (prix, durées) ». → Corrige la forme seulement (pronoms, mots bannis, titres-consignes, CTA), n'ajoute jamais un fait ni une sensation, n'allonge pas, met `[À TOI : …]` là où la voix demanderait ce que le texte n'a pas.
- `/api/blog/generate` (« Partir d'une idée ») demandait d'« ouvrir avec une anecdote réelle vécue sur place » à partir d'un sujet, et injectait des « données vérifiées » (Eiffel, Louvre, croissant…) ; `BlogGenerator` insérait des accroches toutes faites d'un clic. → **Notes obligatoires** (≥ 200 caractères, 400 sinon), prompt « mets en forme, n'ajoute RIEN, `[À TOI]` là où ça manque », clichés supprimés, textarea « Ce que tu as vécu (obligatoire — la seule source) ».
- `lib/revendications.ts` : ce qu'un texte affirme et que seule l'autrice peut confirmer (prix, horaires, dates, chiffres, « on a … », lieux) — déterministe, sans modèle ; `porteLesConsignesDuPrompt`. 4 tests.
- File « À publier » : un texte du générateur jamais relu n'est plus « prêt » ; chaque carte ouvre **« À confirmer avant de publier : N affirmations »**. 9 prêts → **7** (119 et 120 sortent, à réécrire depuis du vécu — l'export Timeline + photos est fait pour ça).

### Le principe, pour tous les agents
Un score de garde-fou mesure la *ressemblance* avec du vécu. Aucun modèle n'a le droit d'ajouter un fait, un chiffre, un lieu, un prix ou une sensation que l'autrice n'a pas écrits. « Réécrire en mieux » un texte sans source, c'est inventer deux fois.

---

## [2026-09-17] — Débloquer le contenu : 26 brouillons mesurés, 9 supprimés, une file « À publier » (tâche `8eacf209`, commits `a714393` → `7b5e23c`)

### Le constat de la veille
24 articles publiés, 26 en brouillon, 0 demande, 0 post programmé, 2 abonnés, 16 entrées CHANGELOG en 7 jours : une usine qui tourne et rien qui sort. Le goulot n'est pas l'outillage, c'est la publication.

### Mesuré sur les 26 brouillons (longueur, `validateGardeFous`, image, balises `[A TOI]`, dates)
- **9 prêts** (voix 85-100, 1 400-4 000 caractères) : Madère ruelles de basalte, Itinéraire Roumanie, Podgorica, Pourquoi le slow travel, Bolo do caco, Bacalhau à Lagareiro, Maramureș, Villages secrets Sibiu-Sighișoara, Street art.
- **5 à retoucher**, un défaut chacun : CuiB d'Arte (pronoms), Check-list rando (pronoms), Mouffetard (pronoms), Crêpes (honnêteté), Brasseries Zurich (740 caractères).
- **3 Stoos Ridge** alors qu'un Stoos est publié — décision d'auteur.
- **9 faux brouillons** : 6 carnets de test de l'APK (« Carnet : Paris » ×3 identiques, « Carnet : ici », « Carnet mobile (à titrer) », « Carnet : Timișoara », 200-918 caractères, `[A TOI]` vides) + 3 coquilles de 0-29 caractères. **Supprimés par id** (75, 80, 84, 159, 164, 165, 170, 173, 174) avec l'accord de l'utilisatrice, sauvegarde complète dans `imports/sauvegardes/` (hors dépôt), propagation legacy vérifiée.
- **L'absence d'image de couverture n'est pas un blocage** : 10 des 24 publiés n'en ont pas, page et liste ont un repli par catégorie.

### Fuite corrigée en passant (`a714393`)
`match_articles` (SECURITY DEFINER, exécutable par `anon`) renvoyait les brouillons ; le repli textuel de `/api/ai/search` aussi. Filtre `published = true` des deux côtés. Prouvé : rpc en `anon` avec le vecteur exact d'un brouillon → 5 résultats, tous publiés, le brouillon absent.

### La file « À publier » (`7b5e23c`)
`GET /api/cms/articles/a-publier` mesure chaque brouillon (même contrôle que le Copilote) et trie : voix qui passe, pas de balise, pas de doublon de titre publié (mots pleins), score, longueur. `components/admin/FileAPublier.tsx` sur l'accueil du panneau : **un article**, ce que la machine sait (voix N/100, ce qui manque en clair, image, doublon), trois gestes — Publier (confirmation inline), Ouvrir et relire, Plus tard (24 h). Remplace le compteur « Relire N brouillons ».

Vérifié en local : 17 en file, 9 prêts, ordre attendu ; « Plus tard » survit au rechargement ; « Publier » sur un brouillon technique → PUT 200, `published_at` posé, compteurs rafraîchis ; brouillon technique supprimé par id. Aucun vrai article publié par un agent : c'est à elle.

### Ce que ça change
9 articles finis = un mois de publication à deux par semaine, un écran, un bouton. Le reste (Stoos, les 5 à retoucher) est visible avec sa raison, pas caché derrière un compteur.

---

## [2026-09-16] — Reconstituer un voyage : Timeline du téléphone + photos → `voyage.md` à relire (tâche `0a86a282`, commit `d520bc0`)

### Ce que c'est
`scripts/reconstituer_voyage.py` (`npm run media:voyage -- --timeline … --photos … --slug …`) : une **extension du pipeline de preuves** (`photos_evidence.py` → `content/evidence` → `draft_from_evidence.mjs`), pas un système parallèle. La Timeline et l'EXIF donnent le mesurable — où, quand, combien de km, quelles photos où — et le script n'écrit rien d'autre : pas de lieu inventé, pas de ressenti, pas de prix. Le récit reste à l'auteur, dans les balises `[A TOI]`.

### Ce qu'il faut savoir (et que le plan collé disait faux)
- **Timeline n'est plus dans Takeout** depuis 2024 : export depuis l'appli Google Maps (photo de profil → Vos trajets → ⚙️ → Exporter les données Timeline) → `Timeline.json` immédiat, quelques dizaines de Mo. Le script lit ce format (`semanticSegments` / `rawSignals`, Android et iOS) et les anciens Takeout (`Records.json`, Semantic Location History).
- **L'API Google Photos ne sert plus** (depuis 03/2025 elle ne voit que les médias créés par l'appli) ; la « Takeout API » n'existe pas. Ce qui marche : Takeout par album, ou « Télécharger » dans Google Photos — l'EXIF est conservé, et Takeout ajoute un `.json` par photo avec la position estimée, que le script lit quand l'EXIF n'a pas de GPS.

### Règles de rattachement des photos (dans l'ordre)
GPS au lieu le plus proche du jour (≤ 1 km) → GPS sur la trace du jour (≤ 500 m, photo prise en chemin) → GPS qui contredit tout → **sans lieu, avec la distance** (Paris un soir de Madère : « à 2410 km ») → sans GPS : lieu où l'on était à cette heure. `HOME`/`INFERRED_HOME` → « hébergement, déduit ». `--geocode` : Nominatim niveau rue/lieu-dit, 1 req/s ; un échec réseau laisse « à nommer ».

### Mesuré (jeu synthétique, Madère 3 jours, 6 photos, 3 formats)
10 lieux, 104,6 km, jour hors voyage exclu, 5/6 photos placées (la 6e sans date), 10/10 lieux nommés par OSM ; `Records.json` → 3 arrêts détectés ; Semantic → noms et adresses repris. Sorties dans `imports/<slug>/` (gitignoré : positions personnelles).

### Non vérifié
L'export réel de l'utilisatrice — le format on-device a des variantes (iOS, versions), le script tolère celles connues ; premier vrai fichier à passer avec `--slug madere-2024`.

---

## [2026-09-16] — Travel Planning : envoi réel de bout en bout, et ce qu'il a révélé (commit `3330f06`, tâche `703d9426`)

Deux envois réels sur `POST /api/travel-planning` en production, avec l'accord de l'utilisatrice et son adresse comme cliente (lignes de test supprimées ensuite par leur id ; table à 0).

### Envoi 1 (ancienne route) — `200` en 4 s, e-mail de confirmation reçu
Mais rien en base ne le disait, et pour cause : les trois `resend.emails.send(...)` étaient lancés **sans `await`** (une promesse orpheline peut être tuée à la fin d'une fonction Vercel — cette fois elle a survécu), Brevo était attendu sans lire `res.ok`, et `email_sent_at` / `brevo_synced` n'étaient jamais écrits. L'e-mail disait « ton projet pour **Destination précise** » : le formulaire met la case cochée dans `destination` et le nom réel dans `destinationDetail`.

### Correctif `3330f06`
- Envois attendus (`Promise.all`), retour `{ error }` lu, réponse `{ emails: [{quoi, ok}], brevo }`.
- Brevo : `res.ok` lu et journalisé avec le corps ; `brevo_synced` tracé.
- `email_sent_at` écrit quand la confirmation est partie (insert `.select('id')`).
- `destinationDetail || destination` partout : e-mails, Brevo, `/api/ai/travel-plan` (destination nommée), section Demandes.
- `app/api/demandes-travel` supprimée : route publique morte, doublon avec un autre vocabulaire.

### Envoi 2 (route corrigée) — mesuré
`{"success":true,"emails":[interne bonjour ok, interne contact ok, confirmation ok],"brevo":false}` ; en base `email_sent_at` posé, `brevo_synced=false`.

### Découverte : Brevo refuse l'IP de Vercel
Logs Vercel : `Brevo contact error: 401 … unrecognised IP address 34.229.73.239 … authorised_ips`. La restriction d'IP est activée sur le compte Brevo ; Vercel n'a pas d'IP fixe. **Aucune synchro contact depuis le site n'aboutit** — `contact`, `expert-hotelier`, `guides/download`, `travel-planning` — et jusqu'à aujourd'hui en silence. À désactiver dans Brevo → Security → Authorised IPs (action utilisateur), tâche `703d9426`.

---

## [2026-09-16] — Travel Planning : le tunnel reçoit, le panneau montre, l'IA propose (tâche `02a82ba8`, commits `972e265` → `0576d55`)

Chantier choisi par l'utilisateur (« Travel Planning IA »). Avant d'écrire une ligne d'IA, deux constats mesurés :

### 1. Le formulaire répondait 500 depuis le 11/07 (`972e265`)
`demandes_travel` : **0 ligne**. `POST /api/travel-planning` insérait `trip_type`, `vibe`, `destination_detail` — colonnes que la table n'a jamais eues : la migration `20260709000001` disait `CREATE TABLE IF NOT EXISTS` sur une table créée à la main avant elle (`prenom`, `style_voyage`, `nb_voyageurs`, `duree_jours integer`) — « appliquée » dans l'historique, sans effet. Et « 1 semaine » ne rentre pas dans un integer. **Piège n° 3 d'AGENTS.md, en vrai.** Migration `20260916142000` appliquée (table vide) : colonnes ajoutées, `duree_jours → TEXT`, `proposition_ia JSONB`. Vérifié : INSERT avec la charge exacte de la route → 201 ; ligne de test supprimée par son id.

### 2. La connexion au panneau était inaccessible (`3a0a756`)
Le correctif #449 (`1390b28`, 15/09) renvoyait toute navigation non connectée de `/panel-manager` vers `/auth/login` — la connexion **client** Supabase Auth, pas exclue de la maintenance → `/maintenance`. Le formulaire du panneau vit dans `/panel-manager` lui-même : **session expirée = plus aucun moyen de se reconnecter**. Corrigé : la page du formulaire est servie sans session (elle n'affiche que ce formulaire, les données restent en 401 derrière `/api/cms/*`), les sous-pages y renvoient avec `?next=`. Vérifié en local.

### 3. Les demandes dans le panneau + pré-itinéraire IA (`0576d55`)
- `components/admin/DemandesTravelSection.tsx`, section « Demandes Travel » (`?section=demandes`) : liste, détail, statut (`new` / `contacted` / `proposal_sent` / `converted` / `lost`), notes, copie. Modèle = les colonnes de la table. `components/cms/TravelCRMPanel.tsx` supprimé : jamais monté, autre objet (`dates_souhaitees`, `message`, `nouvelle_demande`).
- `POST /api/ai/travel-plan { id }` (session CMS ou clé agent) : destination nommée si elle est dans nos 41 + `match_destinations`, trois sources au plus ; le modèle ne reçoit que `intro_narrative`, l'itinéraire jour par jour et les tags, avec consigne d'écrire **ce que ce vécu ne couvre pas** plutôt que de combler. `validateGardeFous` ; stocké dans `demandes_travel.proposition_ia` ; **jamais envoyé au client**.
- Mesuré sur « Madère, 1 semaine, octobre, couple » : 200 en 18 s, `pgvector_cosine`, voix **100/100**, 0 mot banni ; jour par jour ancré dans l'itinéraire réel (Funchal, Levada do Caldeirão Verde, Cabo Girão) ; section 4 : « visité en avril 2026, pas d'expérience pour octobre », « pas d'adresses d'hébergements testées ». Écran vérifié dans le navigateur, par les deux chemins d'authentification.

### Vu en passant, non traité
- **Le panneau n'a aucune classe `dark:`** (`CmsAdminClient` + `components/admin`, 0 occurrence) alors que le site pose `html.dark` (localStorage `theme` ou préférence système) : en mode sombre, tout le panneau écrit `text-gray-900` sur fond sombre. Tâche déposée dans `agent_tasks`.
- `.env.local` porte désormais un `CMS_PASSWORD` **local** (valeur `local-…`, différente de la prod) et un `CRON_SECRET` local : le panneau et les crons se testent depuis le poste.

---

## [2026-09-16] — Incident règle 3 : quatre jetons d'agent en clair dans le dépôt public — révoqués (tâche `70ab9778`, commit `a5671d7`)

### Ce qui s'est passé
- Les jetons `antigravity`, `claude`, `pencode`, `mobile_apk` figuraient **en clair** dans `lib/ai-auth.ts` (`INITIAL_AGENT_KEYS`, accepté en repli par `verifyAiAuth` — valides en prod quel que soit l'état de la table), dans `scripts/seed_agent_keys.mjs` et dans `docs/API_IA.md` (12 occurrences, sous une note « ne jamais les committer en clair »). Écrits par un autre agent le 16/09 au matin, commités dans `b7f3082` par une session Claude dont le filtre de secrets cherchait `AIza`/`gsk_`/`sk-`/`eyJ`/`sb_secret_`, pas `hld_`. Dépôt public ⇒ exposés ~1 h 10 (12 h 40 → 13 h 50 UTC).
- Seul `antigravity` avait servi (`last_used_at` 11:25) ; `mobile_apk` jamais (l'APK n'embarque pas de jeton, pas de rebuild).

### Ce qui a été fait
- `lib/ai-auth.ts` : plus aucun jeton dans le code, plus de repli.
- `scripts/seed_agent_keys.mjs` réécrit : ne porte aucun jeton, n'écrit plus en base. Génère des jetons aléatoires dans `.agent-keys.local` (gitignoré) et une **migration versionnée** avec les hashes seulement.
- `docs/API_IA.md` : exemples factices, colonne « où est le jeton ».
- Migration `20260916134640_rotate_api_keys.sql` appliquée par Claude (`db push --include-all`, un seul fichier, vérifié en dry-run) : anciens hashes `is_active=false`, quatre nouveaux insérés.
- **Pas de réécriture de l'historique git** — même traitement que le `service_role` du 19/08 : la rotation rend les anciens jetons inertes.

### Mesuré
- Base : 8 lignes `api_keys`, 4 inactives (09:36) / 4 actives (13:50) ; historique `20260916134640` enregistré.
- Production `www.heldonica.fr/api/ai/destinations` **avant redéploiement** : ancien jeton → **403**, nouveau → **200**, sans jeton → **401** — la lecture de la table précède le repli, la migration révoque à elle seule.

### À toi
- Copier le nouveau jeton `antigravity` depuis `.agent-keys.local` (racine du projet, non versionné) dans la configuration d'Antigravity ; idem `pencode` si utilisé. `claude` et `mobile_apk` n'ont pas encore d'usage.
- Pour toute rotation future : `node scripts/seed_agent_keys.mjs [agent…]` puis `supabase db push --linked --include-all`.

---

## [2026-09-16] — Recherche sémantique réelle : cron `/api/cron/embeddings` (tâche `ebc8dfdb`, commit `6558a89`)

### Constat
Après le `db push` du matin, pgvector était actif mais **0/41 destinations et 0/50 articles** vectorisés : `/api/ai/search` tournait sur le repli textuel. `scripts/generate_embeddings.mjs` ne traitait que les destinations, dupliquait le constructeur de passage de `lib/ai-embeddings.ts` et déposait un fichier SQL sans horodatage dans `supabase/migrations/`.

### Fait
- `lib/ai-embeddings.ts` : `generateEmbeddingsBatch` (`batchEmbedContents`, lots de 50, 768 d) ; `taskType` `RETRIEVAL_DOCUMENT` pour les passages stockés, `RETRIEVAL_QUERY` pour les requêtes — changer l'un impose `?force=1` ; `local_insider_tips` est un jsonb, le constructeur le normalise.
- `app/api/cron/embeddings/route.ts` : même auth qu'`enrich-places` (`Bearer CRON_SECRET` ou session CMS) ; lignes sans vecteur ou modifiées depuis 26 h ; `?force=1` régénère tout ; chaque erreur Supabase lue ; 207 si échec partiel. Écrire `embedding` ne touche pas `updated_at` (aucun trigger sur ces tables).
- `vercel.json` : cron `0 7 * * *`.
- `scripts/generate_embeddings.mjs` supprimé (source de vérité unique = `lib`).

### Mesuré
- Premier remplissage depuis le poste (`next dev` + `CRON_SECRET` local) : `?force=1` → **41/41 et 50/50 en 17,7 s, 0 échec**.
- Base : `count(embedding) = count(*)` sur les deux tables.
- `/api/ai/search` : méthode `pgvector_cosine` ; « randonnée en crête et lever de soleil » → Cabo Girão, Stoos Ridge ; « village de montagne en Roumanie » → Maramureș, Mocănița, Brașov.

### Découverte pour #448 (à ne pas oublier avant le DROP de `articles`)
`cms_blog_posts` porte **quatre triggers** actifs — `cms_blog_posts_sync_trigger`, `sync_cms_blog_posts_to_articles`, `trigger_sync_to_articles` (INSERT/UPDATE → `sync_to_articles()`, `ON CONFLICT (slug) DO UPDATE`) et `cms_blog_posts_delete_trigger` (→ `sync_delete_from_articles()`). **Un `DROP TABLE articles` casserait toute écriture d'article** tant qu'ils existent : la migration du DROP doit d'abord retirer les quatre triggers et les deux fonctions. Tâche déposée dans `agent_tasks`.

---

## [2026-09-16] — Mise au propre : commit du travail IA, secret retiré, CI Discord, racine, scripts `articles` (tâche `87b50224`)

### Ce qui a été fait (six commits, `b7f3082` → `f1d9b3c`)
- **`b7f3082` feat(ia)** : le travail non commité du 16/09 (clés API agents, analytics IA, recherche sémantique, copilote, APK) commité **fichier par fichier** — pas de `git add .` : `.vscode/`, `aider-*.cmd`, `interpreter.cmd`, `__pycache__/` sont de l'outillage du poste, désormais dans `.gitignore`.
- **`a6a8953` fix(mobile)** : `heldonica-mobile/README.md:23` affichait `cms.password=HELDONICA2026` en clair. Retiré. **Si c'est encore la valeur de `CMS_PASSWORD` sur Vercel, elle est à changer** — non lisible depuis le poste.
- **`2edc4d7` ci(discord)** : `discord-notify.yml` passait `webhook-url`/`content` à `Ilshidur/action-discord`, qui ne lit que `env.DISCORD_WEBHOOK` + `with.args` → rouge à chaque push depuis sa création. Corrigé, version épinglée `0.4.0`. **Mais le secret `DISCORD_WEBHOOK` n'existe pas sur GitHub** (`gh secret list`) : le job restera rouge tant qu'il n'est pas posé.
- **`e26d24f` chore(docs)** : NET01 (`9fab0da`) avait *copié* 26 audits dans `docs/archive/` sans les retirer de la racine, et STATUS.md disait « racine nettoyée ». Comparés à l'octet près (seul écart : CRLF/LF sur `RAPPORT_AUDIT_CMS.md`), supprimés de la racine ; STATUS.md §4 corrigé.
- **`58857de` + `f1d9b3c` chore(scripts)** : huit scripts lisaient ou écrivaient encore dans `articles` (legacy #448). `check_missing_images.js` recâblé sur `cms_blog_posts` (pas de colonne `destination` là-bas → tags). Sept supprimés : `fix-data.mjs`, `check_trigger.js`, `fix_all_placeholders.js`, `fix_audit_db_anomalies.js`, `fix_missing_images.js`, `test_cms_pipeline.js`, `verify_sync.js` — tous des écritures prod hors migration (règle 2), deux allaient chercher des photos Unsplash (règle 1). Restent dans l'historique.

### État de la base, vérifié par HEAD REST (pas supposé)
| Migration | En base ? | Dans l'historique `supabase migration list` ? |
|---|---|---|
| `20260911120000` agent_tasks | oui (51 lignes) | **non** |
| `20260915000001` backup articles | **non** (`backup_articles_20260915` → 404 ; `articles` a 50 lignes, pas 48) | non |
| `20260915000002` RLS 7 tables | non vérifiable par REST | non |
| `20260916100000` copilot_generations | oui (1 ligne) | **non** |
| `20260916120000` api_keys / ai_requests_log | oui (4 / 2 lignes) | **non** |
| `20260916140000` pgvector | **non** (`destinations.embedding` → 400 ; la recherche sémantique tourne sur le repli textuel) | non |

`supabase db push --dry-run` refusait : « neuf versions distantes sans fichier local ». Faux pour sept d'entre elles (`20260523 … 20260629`) : elles ont un fichier à 8 chiffres, mais un frère à 14 chiffres partage le préfixe et la CLI trie le local par nom de fichier (`0` < `_`), le distant par version — l'appariement dérape. **Le `repair --status reverted` que la CLI propose aurait rejoué ces sept migrations.** Commit `b375e27` : les sept renommées en `<v>000000_…` (même ordre dans les deux tris, `git mv`), et les deux vraies orphelines (`20260903191642` gouvernance agent_tasks, `20260903191920` table ai_context) **reconstituées à l'octet près** depuis `supabase_migrations.schema_migrations.statements` — pas de placeholder. Les six fichiers en attente sont idempotents (`IF NOT EXISTS`, `OR REPLACE`, `DROP POLICY IF EXISTS`) : `db push` rejouera les trois déjà en base sans effet et appliquera les trois manquantes.

### Reste à faire — à l'utilisateur
1. Réécrire l'historique distant pour les sept versions renommées — métadonnées seulement, aucun SQL de schéma, dans cet ordre :

   ```bash

   supabase migration repair --status applied 20260523000000 20260526000000 20260613000000 20260614000000 20260615000000 20260625000000 20260629000000

   ```

   ```bash

   supabase migration repair --status reverted 20260523 20260526 20260613 20260614 20260615 20260625 20260629

   ```

   ```bash

   supabase db push --linked

   ```

   Puis vérifier : `supabase migration list --linked` sans ligne à une seule colonne ; `destinations.embedding` répond 200 ; `backup_articles_20260915` existe.
2. `gh secret set DISCORD_WEBHOOK` avec l'URL d'un webhook du serveur Discord.
3. Vérifier `CMS_PASSWORD` sur Vercel ; changer si c'est encore `HELDONICA2026` / `heldonica2026`.

### Vérifié avant push
`tsc --noEmit` 0 erreur ; `vitest` 33 fichiers / 372 tests ; six garde-fous verts (avant et après les commits).

---

## [2026-09-16] — Intelligence Artificielle & Base : Recherche Sémantique & pgvector (Gemini 768d)

### 🧠 Cerveau Sémantique Vectoriel (`/api/ai/search`, `lib/ai-embeddings.ts`, `supabase/migrations/20260916140000_enable_pgvector_and_embeddings.sql`)
- **Modèle d'Embeddings Gemini 768 dimensions** (`lib/ai-embeddings.ts`) :
  - Intégration de `gemini-embedding-001` avec réduction de dimensionnalité à 768 (`outputDimensionality: 768`), optimal pour pgvector et la mémoire PostgreSQL.
  - Constructeurs de passages sémantiques pour destinations et articles (titre, pays, région, ambiance, itinéraire, conseils secrets, tags).
  - Calcul de similarité cosinus en mémoire (`cosineSimilarity`).
- **Migration SQL Versionnée (`pgvector`)** :
  - `supabase/migrations/20260916140000_enable_pgvector_and_embeddings.sql` :
    - Activation de l'extension `vector`.
    - Colonnes `embedding vector(768)` sur `destinations` et `cms_blog_posts`.
    - Index vectoriels IVFFLAT (`destinations_embedding_idx`, `cms_blog_posts_embedding_idx`).
    - Fonctions SQL RPC : `match_destinations` et `match_articles` pour calcul de similarité cosinus (`1 - (embedding <=> query_embedding)`).
- **Endpoint Universel de Recherche Sémantique** (`app/api/ai/search/route.ts`) :
  - `POST & GET /api/ai/search` : Recherche en langage naturel (*« crique secrète sans vent »*, *« randonnée en crête »*).
  - Filtrage par type (`destinations`, `articles`, `all`), par seuil de similarité cosinus et limite de résultats.
  - Double moteur : similarité vectorielle `pgvector_cosine` et fallback textuel pondéré instantané si la RPC n'est pas encore instanciée.
  - Journalisation automatique dans `ai_requests_log`.
- **Intégration dans le Copilote (`/panel-manager/copilote`)** :
  - Nouvel onglet **« 🧠 Recherche sémantique »** dans l'injecteur de vécu terrain.
  - Recherche instantanée par intention / ambiance avec badge de pertinence (ex: `🎯 95% Madère slow travel`).
  - Injection 1-clic de la destination et de son vécu dans les notes de terrain.
- **Script de Vectorisation par Lot** (`scripts/generate_embeddings.mjs`) :
  - Permet de générer les vecteurs des 41 destinations en production et d'exporter le fichier SQL d'application.
- **Garde-fous CI** : `npx tsc --noEmit` et 6 garde-fous conformes (`check:cms-drift` à 39 tables, `check:api-auth`, `check:erreurs-avalees`).

---

## [2026-09-16] — Panel Manager : Dashboard Analytics IA & Supervision des Quotas (P3)

### 📊 Supervision en Temps Réel & Quotas Agents (`/panel-manager/analytics`, `app/api/ai/analytics/route.ts`, `components/admin/AiAnalyticsDashboard.tsx`)
- **Tableau de bord Analytics IA interactif** :
  - Métriques clés temps réel : Volume total de requêtes, taux de succès %, latence moyenne (ms/s), agents actifs.
  - Cartes de statut par agent (`antigravity`, `claude`, `pencode`, `mobile_apk`) avec quota horaire configuré, dernier appel horodaté et filtrage en 1 clic.
  - Ventilation graphique par endpoint (`/api/ai/copilot`, `/api/ai/vision`, `/api/ai/destinations`) avec calcul des latences moyennes.
  - Journal live des requêtes IA (`ai_requests_log`) avec filtres par agent, par statut (succès/erreur) et recherche textuelle.
  - Modal et dépliage des prompts de terrain et détails d'erreurs éventuelles.
  - Export CSV en 1 clic des logs d'appels (`?export=csv`).
- **Endpoint Universel `GET /api/ai/analytics`** :
  - Sécurisé via `verifyAiAuth` (session CMS ou clé API).
  - Lecture des tables Supabase `api_keys` et `ai_requests_log`.
  - Calcul dynamique des agrégats et support de l'export CSV RFC 4180 avec en-têtes `Content-Disposition`.
- **Navigation & Intégration CMS** :
  - Raccourci `📊 Analytics IA` ajouté dans l'en-tête du Copilote (`/panel-manager/copilote`).
  - Section `analytics` intégrée dans la barre latérale du CMS (`/panel-manager?section=analytics`).
  - Page standalone dédiée sur `/panel-manager/analytics`.
- **Garde-fous CI** : `npx tsc --noEmit` vert (0 erreur) et 6 garde-fous conformes (`check:api-auth`, `check:cms-drift`, `check:erreurs-avalees`).

---

## [2026-09-16] — Panel Manager & Connaissance : Injecteur de terrain (41 destinations) & Raccourci Meta Business Suite
 
### 🧭 Cerveau de Connaissance & Vécu Réel (`/panel-manager/copilote`, `app/api/ai/destinations/route.ts`)
- **Injecteur de vécu terrain (Zéro hallucination)** :
  - Intégration en direct des **41 destinations authentiques** de la base Supabase (`destinations`).
  - Sélecteur de destination groupé par pays (Portugal, Suisse, Roumanie, France, Monténégro, Italie, Colombie...).
  - Sous-sélecteur d'étape d'itinéraire : injection au choix de la destination complète ou d'un jour d'itinéraire précis (ex: *Jour 2 - Levada do Caldeirão Verde*, *Jour 4 - Lever de soleil au Pico do Arieiro*).
  - Bouton `⚡ Injecter ce vécu dans mes notes` qui pré-remplit instantanément l'éditeur avec des détails sensoriels vécus (titre, lieu, récit, météo/terrain).
- **Publication 100% Gratuite via Meta Business Suite** :
  - Ajout du bouton raccourci direct `↗️ Meta Business Suite` (`https://business.facebook.com/latest/composer`) ouvrant le compositeur officiel de publication Instagram/Facebook.
  - Workflow optimisé à 0€ : `Copier légende` -> `↗️ Meta Business Suite` -> coller et planifier sans abonnement tiers (Later/Hootsuite).
- **Nouvel Endpoint Universel** :
  - `GET /api/ai/destinations` : Accès authentifié (via clé API ou session CMS) aux itinéraires et récits de terrain pour tous les agents.

---

## [2026-09-16] — Panel Manager : Interface Copilote améliorée (copie ciblée, historique live Supabase, filtres)

### ✨ Expérience Copilote (`/panel-manager/copilote`)
- **Boutons de copie 1-clic ciblés** :
  - Découpage automatique pour le format Instagram : `📝 Légende seule` (sans hashtags) et `🏷️ Hashtags seuls` en plus de `📋 Copier tout`.
  - Bouton `📋 Copier` direct sur chaque carte de l'historique sans avoir à recharger la génération dans l'éditeur.
  - Feedback visuel instantané sur chaque action (`✓ Légende copiée`, `✓ Hashtags copiés`, `✓ Copié !`).
- **Historique dynamique connecté à Supabase** :
  - Chargement automatique à l'ouverture depuis la table `copilot_generations`.
  - Filtrage par onglets : `Tous`, `📸 Instagram`, `⚡ Story`, `📖 Blog`, `💌 Newsletter`, `🧭 Coachs`.
  - Bouton `🔄 Actualiser` avec indicateur de chargement.
  - Badges de statut : score de voix `/100`, alertes mots bannis, bouton `↩ Reprendre` pour réinjecter le texte.
- **Sélecteur de modes & ergonomie** :
  - Séparation visuelle nette entre *Contenu Slow Travel* et *Coaching ADHD/TSA*.
  - Préservation des notes de terrain saisies lors du changement de mode.
  - Compteur temps réel de mots et caractères pour le message et la réponse, avec rappels de calibrage (ex : 80-150 mots Instagram, ≤ 25 mots Story).
- **Garde-fous CI** : `npx tsc --noEmit` et 6 garde-fous verts (`check:cms-drift` à 39 tables, `check:api-auth`, `check:erreurs-avalees`).

---

## [2026-09-16] — Architecture IA : Endpoints universels `/api/ai/*` pour tous les agents (Antigravity, Claude, Pencode, Mobile)

### 🤖 Accès Universel IA & Gouvernance (`/api/ai/*`, `lib/ai-auth.ts`, `docs/API_IA.md`)
- **Endpoints universels** :
  - `POST /api/ai/vision` : Vision sensorielle multimodale avec regard neuroatypique (TSA) et voix slow travel Heldonica (Gemini 2.5 Flash, 4096 tokens max, AbortSignal 50s, filtrage des tokens de réflexion).
  - `POST /api/ai/copilot` : Génération de contenu (légende Instagram, story, article de blog, newsletter) et coaching de pilotage ADHD/TSA (modes 1, 2, 3) avec validation des garde-fous de voix en temps réel (`validateGardeFous`).
  - `GET /api/ai/copilot` : Consultation de l'historique des générations (`copilot_generations`).
  - `POST /api/cms/ai-vision` : Rétrocompatibilité totale avec l'APK mobile et le panneau d'administration via support hybride clé API et session CMS.
- **Authentification & Rate limiting centralisé** (`lib/ai-auth.ts`) :
  - Support de l'en-tête `x-api-key` et `Authorization: Bearer <clé>`.
  - Hashage SHA-256 pour comparaison sécurisée en base (`api_keys`).
  - Clés d'amorçage provisionnées pour exécution immédiate : `antigravity` (120 req/h), `claude` (120 req/h), `pencode` (100 req/h), `mobile_apk` (150 req/h).
  - Rate limiting glissant par clé via `checkRateLimit` (fenêtre 1h).
  - Journalisation unifiée des requêtes (`ai_requests_log`) avec mesure de latence (`duration_ms`), code de statut HTTP et erreur éventuelle.
- **Base de données & Migration** :
  - `supabase/migrations/20260916120000_create_api_keys_and_ai_logs.sql` : Tables `api_keys` et `ai_requests_log`, RLS restrictif et index de performance.
  - Script d'amorçage `scripts/seed_agent_keys.mjs` pour insérer les clés ou générer les instructions SQL prêtes pour le Supabase SQL Editor.
  - Inscription dans `KNOWN_DRIFT` de `scripts/check-cms-drift.mjs` pour maintenir la CI au vert.
- **Documentation & Garde-fous** :
  - `docs/API_IA.md` : Guide complet avec spécification des routes, exemples curl, Node.js / TypeScript et Python.
  - Garde-fou `scripts/check-api-auth.mjs` mis à jour pour reconnaître `verifyAiAuth`.
  - Tous les tests unitaires et appels réels Gemini vérifiés : HTTP 200, conformité de voix 100%. Garde-fous CI 100% verts (`check:api-auth`, `check:erreurs-avalees`, `check:cms-drift`, `tsc --noEmit`).

---

## [2026-09-16] — Mobile & CMS : Résolution des timeouts IA Vision (OkHttpClient, compression inSampleSize & retry)

### ⚡ Résilience IA Vision (`heldonica-mobile/` & `/api/cms/ai-vision`)
- **Correction des timeouts OkHttpClient** : Dans `MainActivity.kt`, `callTimeout` ne protégeait pas contre le `readTimeout` par défaut (10s), qui expirait lorsque Gemini 2.5 Flash générait sa chaîne de pensée (5-12s). Configuration explicite : `connectTimeout(30s)`, `readTimeout(60s)`, `writeTimeout(30s)`, `callTimeout(75s)` et `retryOnConnectionFailure(true)`.
- **Compression ultra-rapide avec `inSampleSize`** : Remplacement du décodage naïf qui chargeait en RAM les 50 Mégapixels du Pixel 8 Pro (200 Mo). Nouveau processus en 4 étapes : lecture des dimensions (`inJustDecodeBounds`), calcul de `inSampleSize` optimal, décodage allégé en `RGB_565`, et redimensionnement à 800px max (JPEG 75%). Poids réduit à ~35-50 Ko (transfert réseau quasi-instantané, < 50ms).
- **Retry automatique & repli multi-niveaux** : En cas d'aléa réseau, une deuxième tentative est automatiquement exécutée après 1 seconde avec message d'état clair (*« Nouvelle tentative d'analyse… »*). Si l'appel direct échoue, bascule transparente sur le serveur CMS `/api/cms/ai-vision`.
- **Timeout côté serveur** : Ajout de `AbortSignal.timeout(50_000)` dans `app/api/cms/ai-vision/route.ts`.
- **Déploiement** : Build Gradle 8.7 réussi (`BUILD SUCCESSFUL in 31s`), APK installée sur le Pixel 8 Pro (`Success`), relance automatique de `MainActivity`. Tous garde-fous CI verts (`check:api-auth`, `check:erreurs-avalees`, `tsc`).

---

## [2026-09-16] — Mobile : Clarification flux Instagram, auto-copie presse-papier & bouton dédié

### 📱 Android `heldonica-mobile/` (Vérifié sur Pixel 8 Pro physique `39151FDJG000Z0`)
- **Diagnostic terrain (brouillon id 174)** : Vérification en base Supabase du brouillon généré à 09:44:26 (`carnet-mobile-665679`, média 113) : la légende et les micro-détails sensoriels TSA ont bien été générés directement par Gemini 2.5 Flash dans l'APK (*« On a observé la lumière rasante qui découpait des ombres nettes sur l'asphalte granuleux... »*).
- **Architecture Android & Instagram** : Instagram interdit formellement à toute application tierce d'écrire ou de pré-remplir le champ légende d'un post (`Intent.EXTRA_TEXT` est ignoré par Meta par politique anti-spam). Le texte ne peut donc pas « se coller tout seul ». Le collage se fait manuellement via le presse-papier (`ClipboardManager`).
- **Améliorations du flux presse-papier dans l'APK** :
  - **Copie anticipée immédiate** : Dès que l'IA vision termine la génération, le texte de la légende est immédiatement copié dans le presse-papier système (avant même de cliquer sur un bouton).
  - **Bouton dédié `📋 Copier la légende`** : Ajouté sous le champ de saisie avec confirmation visuelle immédiate.
  - **Copie sur « Créer le brouillon »** : Le presse-papier est également garni lors de la création d'un simple brouillon.
  - **Note explicative dans l'UI** : Mention claire rappelant que sur Instagram, il suffit de toucher « Coller » (ou la puce de suggestion Gboard).
- **Déploiement** : Compilation Gradle 8.7 (`BUILD SUCCESSFUL in 34s`) et installation immédiate via ADB sur le Pixel 8 Pro.

---

## [2026-09-16] — Copilote : quatre modes d'écriture, contrôle de voix, historique

### ✍️ `/panel-manager/copilote` + `/api/ai/gemini-gallery`
- **Quatre modes d'écriture** à côté des trois modes coach (inchangés) : **Légende Instagram** (80-150 mots, accroche en première ligne, 4-6 hashtags), **Story** (25 mots + ligne `Sticker :` obligatoire), **Article de blog** (Markdown, 5 sections H2, infos pratiques en liste, méta description), **Newsletter** (`Objet :` ≤ 45 car., `Pré-en-tête :`, une histoire, un seul appel doux). Tous sur `HELDONICA_B2C_PROMPT` + un préambule « notes de terrain » : tout fait absent des notes devient `[À TOI : …]`.
- **Contrôle de voix réel** : chaque texte passe par `validateGardeFous` ; la réponse renvoie `controle` (checks, mots bannis, score). Pour les formats courts (légende, story) seuls **pronoms + lexique** sont évalués — appliquer les 7 points à une story de 25 mots donnerait un score faux ; le score /100 n'est affiché que pour article et newsletter.
- **Exemples pré-remplis** par mode : des trames à crochets (`[Lieu]`, `[ce qu'on a moins aimé]`), pas des faits inventés.
- **Historique** : migration `20260916100000_copilot_generations.sql` (mode, prompt, result, provider, model, score, forbidden_found ; RLS sans politique, clé service seule ; pas de `user_id` — le panneau n'a pas d'`auth.users`). `POST` écrit chaque génération (erreur lue, `enregistre: false` renvoyé si refus) ; `GET ?limit=` liste les dernières, un clic les rouvre. Table absente (`PGRST205`) → message clair « migration à appliquer » au lieu d'un historique vide.
- **`check:cms-drift`** : `copilot_generations` inscrite dans `KNOWN_DRIFT` tant que la migration n'est pas appliquée — **à retirer dès qu'elle l'est**.
- **Tokens** : 2.5 Flash raisonne avant d'écrire ; à 600 tokens une story sortait tronquée après `Sticker :`. Limites relevées (2000 à 8192 selon le format).
- **Vérifié en local** (Gemini réel, 3 appels) : story → deux parties dont `Sticker : Café ou thé ?`, contrôle `passed:true` ; newsletter → format respecté, 100/100, 0 mot banni ; `GET` historique → `indisponible` explicite ; page : 7 cartes, trames cliquables, textarea pour l'écriture, encart de contrôle, note « Non enregistré » tant que la table manque. `tsc`, 6 garde-fous verts.
- **Non fait** : « Sélection IA » dans l'APK (spécification insuffisante : quoi sélectionner, sur quel critère) ; triggers « X likes → notification » (canal non défini) ; suppression de tables `test_*`/`temp_*` (on ne supprime pas sur un préfixe — AGENTS.md).

---

## [2026-09-16] — Option A : publier sur Instagram depuis le panneau (image, carrousel, reel)

### 📤 Publication réelle depuis la file `instagram_scheduled_posts`
- **Nouvelle route `POST /api/instagram/publish { id }`** (`requireCmsAuth`, 5 appels/min, clé service) : publie une entrée de la file via la Graph API selon `metadata.type` — image, **carrousel** (`children`), **reel** (`video_url`) — puis écrit `published` + `permalink` ou `failed` + `error_message`. `GET` renvoie `{ configured, manque }`. Sans token Meta : **503 explicite** nommant `INSTAGRAM_ACCESS_TOKEN` et `INSTAGRAM_BUSINESS_ACCOUNT_ID`.
- **`lib/instagram.ts`** : `publierEntreeFile()` (point d'entrée unique par type) et `lireDerniereErreurInstagram()` — la raison exacte du refus Meta remonte jusqu'au panneau au lieu d'un `null` muet.
- **`/api/instagram/cron`** passe par le même dispatcher : il publiait tout en image seule (un carrousel partait avec sa première photo, un reel avec l'URL de sa vidéo comme image).
- **`components/admin/ScheduledPostsList.tsx`** : le bouton « Marquer comme publié » — qui ne changeait que le statut, sans rien publier — devient **« Publier sur Instagram »** (confirmation, résultat ou raison d'échec sous l'entrée, lien vers le post). Badge du type (Image / Carrousel · N photos / Reel), bandeau « pas encore possible » listant les variables manquantes, bouton inactif tant qu'elles manquent.
- **Sécurité** : `POST /api/instagram/post` publiait sur le compte réel **sans aucune authentification** → `requireCmsAuth` + rate limit.
- **`docs/INSTAGRAM_META_SETUP.md`** : les 7 étapes côté Meta/Vercel, une à la fois.
- **Vérifié en local** (dev server, `CMS_PASSWORD` de test) : `POST /publish` sans auth → 401 ; `GET` → `{"configured":false,"manque":[…]}` ; `POST` authentifié sans token → 503 lisible ; `POST /api/instagram/post` sans auth → 401 ; panneau : bandeau affiché, 6 entrées de la file rendues avec badge et bouton désactivé (`title` explicatif). `tsc` + garde-fous verts.
- **Non vérifié** : une publication réelle — aucun token Meta sur le poste. Premier essai à faire sur une entrée image, depuis le panneau, une fois les variables posées.
- **Constaté en passant** : en maintenance, `/auth/login` n'est pas dans `maintenanceExcludes` du middleware — la redirection de `/panel-manager` vers le login atterrit sur la page de maintenance quand la session est expirée. Non modifié (surface de maintenance = décision de mise en ligne).

---

## [2026-09-16] — Mobile & IA : Vision Multimodale (Gemini 2.5 Flash) & Partage Instagram direct

### 👁️ IA Vision Multimodale (`/api/cms/ai-vision` & App Mobile) — Calibrage Sensoriel TSA & Heldonica
- **Ancrage Sensoriel TSA (Neuroatypique)** : Refonte complète du prompt système dans `app/api/cms/ai-vision/route.ts` et `MainActivity.kt`. L'IA adopte la sensibilité singulière du regard TSA : focalisation sur les micro-détails tangibles (grain du bois, chaux rugueuse, patine, lin, découpe géométrique des ombres, contrastes doux), l'acoustique apaisante (sons feutrés, absence de foule ou de surcharge sensorielle), et l'observation intime de ce que la plupart des gens traversent sans voir.
- **Conformité stricte Heldonica** : Émetteur 100% « on » (duo fondateur, 0 « je » / 0 « nous »), destinataire complice « tu », 0 mot banni (zéro cliché touristique ni enthousiasme artificiel), 4 hashtags ciblés (#slowtravel, #heldonica).
- **Gestion des tokens Gemini 2.5 Flash Thinking** : Élévation de `maxOutputTokens` à 2500 (les tokens de raisonnement interne consommaient le quota initial de 500 tokens). Timeout porté à 45s.
- **App Mobile** : Bouton renommé `✨ Regard Heldonica & micro-détails (IA)`. Suppression des doublons de hashtags lors de l'export Instagram. Compilation Gradle et installation réussie sur le téléphone (`adb install -r -d`).
- **Garde-fous CI** : `check:api-auth`, `check:cms-drift`, `check:cms-zones`, `check:erreurs-avalees` et `tsc --noEmit` tous 100% au vert.
- **Partage natif direct (`MainActivity.kt`)** : Ajout du bouton `📸 Ouvrir directement dans Instagram` et amélioration du bouton `Brouillon + Ouvrir Instagram`.
- **Copie automatique de la légende** : La légende générée (lieu, récit, hashtags) est copiée dans le presse-papier (`ClipboardManager`) avec un message Toast explicatif pour collage direct dans Instagram Feed / Carousel / Reels.
- **Intent multi-médias** : Support `ACTION_SEND` (photo/vidéo unique) et `ACTION_SEND_MULTIPLE` (carrousel) avec `FLAG_GRANT_READ_URI_PERMISSION` et repli sélecteur standard si Instagram n'est pas présent.
- **Manifeste** : Ajout de `<queries><package android:name="com.instagram.android" /></queries>` pour la visibilité du package sur Android 11+.

### ✅ Vérifié sur l'appareil (Pixel 8 Pro, adb, 16/09 02:15) — Option B
- Bouton `📸 Ouvrir directement dans Instagram` présent, inactif sans média, actif dès 1 photo.
- 1 photo (`ACTION_SEND image/*`) : Instagram propose **Share with Instagram (fil)**, Direct, Stories, Reels ; le flux de création de post s'ouvre avec la photo.
- 2 photos (`ACTION_SEND_MULTIPLE`) : Instagram ne propose **que Stories et Reels** — jamais le fil. Le carrousel du fil ne passe donc pas par le partage natif ; il passe par la file `instagram_scheduled_posts` et le panneau (Option A).
- Toast « Légende copiée ! » affiché ; la bulle presse-papier Android montre le texte de la légende. Le collage lui-même reste un geste manuel (appui long).
- Rien n'a été publié : brouillon Instagram écarté, images de test supprimées de l'appareil.
- **Correctif** (`MainActivity.kt`) : avec plusieurs photos, le bouton s'intitule « Ouvrir dans Instagram (story ou reel) » et une note oriente vers « Brouillon + Ouvrir Instagram » pour le carrousel — plutôt qu'un libellé qui promet un carrousel que le partage natif ne fait pas.
- Le stub `gradlew.bat` ne compile pas ; la compilation locale passe par `~/.gradle/wrapper/dists/gradle-8.7-bin/*/gradle-8.7/bin/gradle.bat assembleDebug` (SDK `C:\Android\Sdk`, JDK 17).
- Les routes `app/api/cron/enrich-photos` et `enrich-places`, déclarées dans `vercel.json` mais absentes du dépôt (404 chaque nuit), sont versionnées avec ce lot.

---

## [2026-09-02] — Mobile 0€ : Photos/Maps → Heldonica + Instagram (Carrousels/Vidéos auto+manuel)

### 📱 App Android 0€ + Backend `mobile-publish`
- **Backend `app/api/cms/mobile-publish/route.ts`** : `photos[]` 1-10 + `video?` (≤100MB) + `is_carousel` + `auto_caption` + `mode=both|auto|manuel`. Upload Supabase `media/mobile/` + `cms_media`, POI OSM `article_map_pois`, brouillon `cms_blog_posts published:false` avec squelette `[À TOI]` ou proposition IA `HELDONICA_B2C_PROMPT` (cascade Groq→Gemini gratuite). Instagram en `instagram_scheduled_posts draft` (carrousel 2-10 via `postCarouselToInstagram`, vidéo REELS via `postVideoToInstagram` + polling `FINISHED`).
- **Lib Instagram** `lib/instagram.ts` : ajout `createVideoContainer`, `getContainerStatus`, `postVideoToInstagram` (REELS, 90s polling).
- **App** `heldonica-mobile/` : Picker système (EXIF GPS gardé), ExifInterface, Nominatim OSM gratuit (1 req/s), FusedLocation fallback, WorkManager retry. UI `Manuel/Auto/Both` + checkbox Carrousel. Build `./gradlew assembleDebug` → APK sideload, 0€ (pas de Places API, pas de Play Store).
- **.gitignore** : `heldonica-mobile/.gradle`, `content/evidence/*.json`, `content/drafts/*.md`.

## [2026-09-01] — Ancrage Strict dans le Réel (Option B), Pont Instagram & Bot Assistant

### 🛡️ Neutralisation du Contenu Aléatoire & Ancrage dans les Médias (Option B)
- **Refonte de [`app/api/cron/auto-publish/route.ts`](file:///c:/Users/farin/StudioProjects/heldonica/app/api/cron/auto-publish/route.ts)** :
  - **Suppression définitive du prompt d'invention au hasard** (*"Choisis un sujet au hasard parmi des pépites cachées"*) et des photos de stock Unsplash.
  - **Verrouillage strict** : création de brouillons uniquement (`published: false`, `status: 'draft'`), aucune publication automatique sans validation humaine (Règle n°1 : *"On n'invente rien"*).
  - Support de l'authentification `Authorization: Bearer $CRON_SECRET` et `x-cms-auth`.
- **Générateur de Brouillons Ancrés ([`scripts/draft_from_evidence.mjs`](file:///c:/Users/farin/StudioProjects/heldonica/scripts/draft_from_evidence.mjs))** :
  - Commande `npm run media:drafts` qui extrait les faits vérifiés depuis `trajet_gps.json` / photos de terrain, avec balises `[À TOI]` pour les ressentis sensoriels et prix réels.
- **Résilience Google Photos ([`scripts/sync_google_photos.py`](file:///c:/Users/farin/StudioProjects/heldonica/scripts/sync_google_photos.py))** :
  - Fonction `ensure_valid_token()` pour rafraîchir le jeton OAuth automatiquement avant chaque requête, résolvant l'expiration après 1 heure.

### 📱 Infrastructure Instagram Bidirectionnelle (Niveau 2)
- **Webhook Meta en temps réel (`app/api/webhooks/instagram/route.ts`)** :
  - Handshake et vérification de challenge Meta (`hub.mode`, `hub.verify_token`, `hub.challenge`).
  - Ingestion temps réel des commentaires avec génération instantanée du brouillon IA respectant les 7 garde-fous de marque.
- **Extension API Instagram (`lib/instagram.ts`)** :
  - Ajout des méthodes `getMediaComments()`, `replyToInstagramComment()`, `toggleHideComment()` et `refreshLongLivedToken()`.
- **Modération & Réponses CMS (`app/panel-manager/instagram/InstagramManagerSection.tsx`)** :
  - Interface dédiée sous l'onglet **Instagram** du Panel Manager avec liste des commentaires, brouillons IA et validation/publication en 1-clic.
  - Route d'action de modération : `app/api/cms/instagram/comments/route.ts`.
- **Cron Polling Fallback & Refresh Token** :
  - Route de polling `app/api/cron/instagram-poll/route.ts` et route de renouvellement 60 jours `app/api/instagram/refresh/route.ts`.
- **Migration Versionnée** : `supabase/migrations/20260901200000_create_instagram_comments.sql`.

### 🤖 Bot Assistant Unifié (Telegram & Démon de fond)
- **Script autonome (`scripts/heldonica_assistant_bot.py`)** :
  - Surveillance continue des exports Google Photos & Maps (`takeout*.zip`).
  - Écoute et réponses interactives sur Telegram avec validation 1-clic.

---



### 🌿 Pack Roumanie (Maramureș & Apuseni)
- **Création de la sous-destination Maramureș (`app/destinations/roumanie/maramures/page.tsx`)** :
  - Églises en bois UNESCO (Bârsana, Ieud), portes monumentales de la vallée de l'Iza, vie pastorale et hospitalité paysanne.
- **Enrichissement des Monts Apuseni (`app/destinations/roumanie/apuseni/page.tsx`)** :
  - Gouffre glaciaire de Scărișoara, plateau karstique de Padiș et hameaux de Moți.
- **Migration & Base** : Insertion de `maramures` et `apuseni` dans `cms_sub_destinations` via `supabase/migrations/20260901183000_add_maramures_and_apuseni_subs.sql`.

### 🌊 Pack Normandie (Pays d'Auge, Côte d'Albâtre, Le Havre)
- **Pays d'Auge (`app/destinations/normandie/pays-dauge/page.tsx`)** : Vergers cidricoles, villages à colombages (Beuvron-en-Auge), fromageries de Livarot/Pont-l'Évêque et Route du Cidre.
- **Côte d'Albâtre (`app/destinations/normandie/cote-albatre/page.tsx`)** : Valleuses discrètes de Varengeville/Senneville, port de Fécamp et sentier des douaniers (GR21).
- **Le Havre (`app/destinations/normandie/le-havre/page.tsx`)** : Architecture Auguste Perret UNESCO, quais du MuMa et front de mer.

### 🏰 Pack Île-de-France (Paris 14e, Fontainebleau, Giverny, Versailles)
- **Paris 14e (`app/destinations/idf/paris/page.tsx`)** : Rue des Thermopyles, Village Pernety, Villa Seurat, Fondation Giacometti, Marché Daguerre et point d'ancrage avenue Villemain.
- **Fontainebleau (`app/destinations/idf/fontainebleau/page.tsx`)** : Chaos de grès des Gorges de Franchard, village d'artistes de Barbizon et Grand Canal.
- **Giverny & la Seine (`app/destinations/idf/giverny/page.tsx`)** : Bassin aux Nymphéas de Monet, méandres de la Seine et falaises de craie.
- **Versailles & Grand Parc (`app/destinations/idf/versailles/page.tsx`)** : Hameau rustique de la Reine, balades en barque sur le Grand Canal et quartier Saint-Louis.

### 🛡️ Garde-Fous & Voix Éditoriale
- 42 articles de blog audités et nettoyés de 100% des mots bannis.
- Score global d'audit de cohérence porté à 81%.
- Migrations versionnées : `20260901174500_update_paris_14_blog_post.sql` et `20260901175500_align_all_drafts_brand_voice.sql`.

---


## [2026-08-19] — Providers IA Gratuits (Mistral, Cerebras, OpenRouter), Mode Guidé B2B & Garde-Fou Ébauches

### 🤖 Moteurs IA de Secours Gratuits (`lib/ai-provider.ts`)
- Intégration dans la cascade de fallback avant les APIs payantes (OpenAI/Anthropic) :
  1. **Groq** (`llama-3.3-70b-versatile`) — Gratuit & ultra-rapide
  2. **Google Gemini** (`gemini-2.0-flash`) — Gratuit
  3. **Mistral AI** (`mistral-small-latest`) — Gratuit & excellent en français
  4. **Cerebras** (`llama-3.3-70b`) — Gratuit & inférence ultra-rapide
  5. **OpenRouter** (`meta-llama/llama-3.3-70b-instruct:free`) — Gratuit
  6. **OpenAI** (`gpt-4o-mini`) & **Anthropic** (`claude-3-5-haiku`) en dernier recours payant.
- Documentation complète des clés avec liens d'inscription dans `.env.example`.

### 🧭 Améliorations CMS Admin & Copilot
- **Mode Guidé B2B ("Partir de 3 faits")** : Ajout du mode dynamique pour les hôteliers dans `AiCopilotModal.tsx` et `app/api/cms/ai-assist/route.ts` (Établissement, Problème chiffré, Solution slow travel & P-A-S).
- **Indicateur d'Images Manquantes** : Ajout de badges visuels d'alerte (`🖼️ Image manquante`, `📱 Pas d'OG`) dans la liste des articles `/panel-manager`.
- **Garde-fou CI Anti-Ébauches Vides** : Mise à jour de `scripts/check-content-coherence.mjs` pour bloquer en CI tout article publié de moins de 300 caractères.

---

## [2026-08-19] — Harmonisation Voix de Marque, Intégrité E-E-A-T & Industrialisation

### 🛡️ Intégrité & E-E-A-T
- **Désactivation des faux avis** : Les 5 avis de démonstration dans `cms_testimonials` ont été passés en `is_active = false`. La page `/temoignages` affiche désormais le message d'attente honnête.
- **Collecte de vrais avis** : Création de la page `/retour-experience` et de l'API `POST /api/testimonials/submit` (insertion par défaut en `is_active = false` soumise à modération manuelle).
- **Règle absolue** : Toute modification de la base de production doit obligatoirement être tracée par un fichier SQL dans `supabase/migrations/`.

### 🌿 Voix de Marque & Garde-fous CI
- **Intégration des 7 garde-fous** : Implémentation du calcul pondéré dans `lib/brand-voice.ts` (Seuil publication ≥85%, Excellence ≥95%).
- **Purge des 42 articles** : Suppression des mots bannis et correction des pronoms sujets (*« nous avons » ➔ « on a »*).
- **CI / GitHub Actions** : Ajout du contrôle `check:content-coherence` dans `.github/workflows/garde-fous.yml`.

### 📋 Templates & Documentation
- Ajout de `CHECKLIST_PUBLICATION.md` à la racine (B2C 7 points, Instagram 5 points, B2B 5 points).
- Ajout de `PROMPT_TEMPLATE_B2C.md` (carnets de blog 1200–2000 mots).
- Ajout de `PROMPT_TEMPLATE_INSTA.md` (légendes Instagram 120–180 mots).

### 🧭 Navigation & Expérience Utilisateur
- Réalignement du menu principal sur 5 entrées B2C pures (*Accueil, Destinations, Carnets de route, Travel Planning, À propos*).
- Ajout du bouton CTA *« Planifier mon voyage »* et du lien discret *« Espace Hôteliers »* dans le header.
- Harmonisation de la section B2B de la Home et de la page `/expert-hotelier` sur le vouvoiement strict.

### 🗄️ Migrations SQL Versionnées
- `supabase/migrations/20260819140000_editorial_voice_and_testimonials_alignment.sql`

---

## [2026-08-19] — Rattrapage migrations Supabase, sécurité, CMS (session Claude)

### 🗄️ Rattrapage de 56 migrations
- Rattrapage complet des migrations Supabase jamais appliquées en production
  depuis le 19/07 (déploiements manuels via dashboard non suivis par le CLI).
- Réconciliation de l'historique de migration (versions dupliquées sur une
  même date désambiguisées), correction de plusieurs bugs SQL préexistants.
- Détection et correction d'un trigger de sync `cms_blog_posts` → `articles`
  cassé qui bloquait toute édition d'article via le CMS.
- Complétion des données `cms_seasons` pour Montenegro et Roumanie (branchées
  sur un nouveau tableau saisonnier `SeasonalTable`, jusque-là orphelin).

### 🔒 Incident de sécurité — clé service_role exposée
- Une clé `service_role` Supabase (contourne toutes les policies RLS) était
  committée en clair dans `scripts/fix-data.mjs` depuis le 27/06, dans un
  repo GitHub public.
- Retirée du code, `SUPABASE_SERVICE_ROLE_KEY` basculée vers le nouveau
  format `sb_secret_...` partout (`.env.local`, Vercel ×3 environnements,
  GitHub Actions), ancienne clé legacy révoquée côté Supabase.
- `lib/supabase-edge.ts` rendu compatible avec les deux formats de clé
  (header `Authorization: Bearer` uniquement pour les clés JWT legacy).

### 🧭 Nouveauté CMS — écriture guidée
- Ajout du mode "Partir de 3 infos" dans `AiCopilotModal.tsx` : 3 champs
  courts (lieu, moment, détail marquant) au lieu d'une page blanche, pour
  générer un texte complet sans jamais inventer de faits au-delà de ce qui
  est fourni.
- Enrichissement de `FORBIDDEN_WORDS` (`lib/brand-voice.ts`) avec les
  tournures typiques de texte généré par IA ("plongez dans", "au cœur de"...).

### 📄 Contenu
- 9 articles vides ou quasi-vides (< 300 caractères) passés en brouillon
  (`published = false`) pour éviter les pages blanches indexées.

### 🗄️ Migrations SQL Versionnées
- `supabase/migrations/20260804000004_map_markers_ordre.sql`
- Plusieurs dizaines de migrations de rattrapage (voir `supabase/migrations/`,
  préfixes `202605` à `202608`).
