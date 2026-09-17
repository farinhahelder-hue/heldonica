# 📜 Journal des Modifications (CHANGELOG) — Heldonica

Toutes les modifications du projet sont consignées ici pour assurer la coordination entre sessions et maintenir la traçabilité des évolutions.

---

## [2026-09-17] — Règle 1 : la chaîne de production demandait d'inventer (commit `60f5c31`)

### Ce qui l'a révélé
Une autre session a « réécrit dans le modèle Limmat » le brouillon 120 (Madère) : **+500 mots, 98 %, 450 m, 35 €/kg, 19 °C, l'odeur du maracujá, l'espada au couperet, Fajã da Quebrada Nova** — aucun de ces faits fourni par l'autrice, score 100 % au garde-fou. Rien n'a été écrit en base (ligne 120 intacte) ; les fichiers `content/articles/brouillons/carnet-maderes-2025-2026.{original.json,rewritten.md}` restent non versionnés, **la réécriture ne doit pas être appliquée**. Et 120 lui-même est une sortie brute du générateur (titres = consignes du prompt), comme 119 et deux Stoos : **4 des 17 brouillons**.

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
