# 📜 Journal des Modifications (CHANGELOG) — Heldonica

  Toutes les modifications du projet sont consignées ici pour assurer la coordination entre sessions et maintenir la traçabilité des évolutions.

## [2026-10-30] — Levée du mode maintenance : le site public est rouvert

Décision explicite du propriétaire. `site_settings.maintenance_mode` passe à `'false'` par une
migration versionnée (`20261030100000_levee_mode_maintenance.sql`, commit `ca779789`, branche
`agent/openhands/levee-maintenance`), reprise de l'archive du 26/10 ré-horodatée après la
dernière migration appliquée. Registre porté à 213 versions.

Prérequis re-vérifiés le 30/10 avant application : constats D (années d'expérience) et E (nombre
de pays) tranchés par la migration `20261028140000`, constat F (« 8+ » carnets) corrigé dans le
code, conflit `robots.txt` résolu, images de `public/` débloquées pendant la maintenance.
21/21 garde-fous verts.

Vérifié en production, sans bypass : `/`, `/guides`, `/travel-planning`, `/expert-hotelier`,
`/a-propos`, `/contact`, `/blog`, `/destinations/madere` → HTTP 200 (étaient 307 → `/maintenance`).
Navigateur réel : `h1` présent, 0 erreur JS. `/maintenance` reste en `noindex` et hors sitemap.
Détail : `.audit/audit-editorial-2026-10-20/LEVEE-MAINTENANCE-2026-10-30.md`.

Restent ouverts, non bloquants : constat G (six articles datés `2026-05-18`, import en bloc —
aucune date réelle attestée, fiche `agent_tasks` `a94ccaf7`) ; la page `/maintenance` en
production affiche encore l'ancienne version (correctif local `4cce6d8b`, non déployé) ;
l'accueil n'expose pas d'élément `<main>`.

## [2026-10-29] — Console de pilotage des agents : fil d'activité, file à valider, gouvernance

Le suivi des agents avait un socle (le journal `agent_task_events`, PR #769) mais aucun
poste pour le lire. Cette console est ce poste : elle rend observable ce que le journal
enregistre déjà, sur données réelles.

- **API `/api/admin/agents/journal`** (lecture seule) : rend le journal paginé (filtrable
  par `agent` et `event_type`), la vue agrégée `v_agent_governance` (présente en base depuis
  le 2026-09-03 sans aucun lecteur), et la file `waiting_validation`. Auth par session CMS.
  Aucune écriture : le geste du fondateur (valider/renvoyer) reste dans `/api/agent-tasks`,
  qui porte déjà la règle « une clé d'agent ne valide pas son propre travail ».
- **Console montée dans le CMS vivant** (`/panel-manager?section=console-agents`) +
  composant `ConsoleAgents` : trois vues (à valider, fil d'activité, gouvernance) et une
  fiche tâche avec PR, commit et timeline issue du journal. **Pas** sous `/admin/agents` :
  la redirection permanente `/admin/:path*` → `/panel-manager` (next.config.js, posée en
  avril) rend tout l'arbre `app/admin/*` inatteignable en production — vérifié sur
  `www.heldonica.fr` (308). `/panel-manager` est l'interface que le fondateur utilise.
- **`limit` borné à 1000** : l'API REST Supabase plafonne silencieusement à 1000 lignes ;
  au-delà, on croirait lire un journal complet qui ne l'est pas.
- **L'erreur est nommée** : un journal vide et un journal en panne ne se ressemblent pas.
  C'est le motif exact du bug « Aucun post programmé » — un écran qui affiche une absence là
  où la requête échoue.
- **Hors périmètre (v2, volontairement)** : détection d'anomalies et `audit_anomalies`. Les
  seuils (« 24 h », « 48 h ») doivent être calibrés sur des données réelles, pas inventés
  avant la première semaine d'usage.
- **Tests** : `__tests__/api/admin-agents-journal.test.ts` (7 cas — sources interrogées,
  erreurs nommées, borne de `limit`, filtre inconnu écarté, refus non authentifié sans
  lecture de base). Garde-fous : 21/21 verts.

## [2026-10-29] — Cohérence documentaire : journal d'agents appliqué, garde-fous, deux journaux

Corrections de documentation et de contenu uniquement (aucune migration, aucun changement du
serveur MCP). Elles rétablissent l'accord entre ce que le dépôt raconte et ce qui est vrai.

- **Journal d'agents `20261029150000` : appliqué en production** (le CHANGELOG disait encore
  « NON appliquée »). Amorçage 277 = 277 tâches, trigger prouvé, RLS vérifiée, version enregistrée.
- **Archivage committé** : le CHANGELOG « Dérive de schéma » affirmait que le déplacement de
  `levee_mode_maintenance` n'était « pas committé » — il l'est depuis `c169e1b3`.
- **« 12 pays »** : l'entrée du 28/10 disait « la base disait déjà 12 ». En réalité la base valait
  `7` ; le « 12 » n'était qu'un repli de code mesurant les pays *visités*. Formulation corrigée.
- **Attribution** : les replis `7`→`0` viennent du commit `0a92d446`, pas de la PR #768 (qui ajoute
  « Pays visités » et retire le suffixe `+`).
- **`AGENTS.md`** : annonçait 16 garde-fous ; il y en a **21** (22 avec la PR #770). Tableau complété
  (`content-known-errors`, `image-paths`, `cms-emojis`, `content-html-escapes`, `apk-signature`) et
  section « Deux journaux, deux rôles » ajoutée.
- **Deux journaux, deux rôles** (documenté ; **décision prise**, pas ouverte) : `agent_task_events` =
  vérité système (trigger, non contournable) ; `agent_actions` (#770, non fusionnée) = contexte
  d'intention, lié par `task_id`. `commit_sha` : celui d'`agent_tasks` = livrable validé ; celui
  d'`agent_actions` = action brute. `agent_actions` ne remplace jamais `agent_task_events`.
- **Contenu** : `lib/cms-page-defaults.ts` (`a-propos__bio_text`) ne dit plus « depuis plus de 10 ans »
  (année non attestée) ; le réglage `covered_countries` s'appelle « Nombre de pays habités ».

## [2026-10-29] — Suivi des agents : journal append-only des tâches + lien PR/commit

Le registre `agent_tasks` ne gardait que l'**état présent**. `rendre_compte` fait un `PATCH`, donc chaque
compte-rendu **écrasait** le précédent : impossible de reconstituer la trajectoire d'une tâche (qui l'a
prise, combien de fois elle est repassée en `waiting_validation`, ce qui a été proposé puis retiré), et
rien ne reliait une fiche aux commits ou à la PR qui l'ont réalisée — la PR #767 n'était rattachée à
**aucune** fiche.

- **Migration `20261029150000_journal_agent_task_events.sql`** (**appliquée en production** le
  2026-10-29) :
  table `agent_task_events`, alimentée par un trigger `AFTER INSERT OR UPDATE OR DELETE` sur
  `agent_tasks`. Chaque ligne garde l'état **avant et après** dans `payload`. Le trigger est **en base**,
  pas dans le MCP : tout ce qui écrit est capturé, même un script SQL ou un agent qui oublie de rendre
  compte. `task_id` en `ON DELETE SET NULL` : le journal survit à la disparition d'une fiche. Amorçage :
  un point de départ daté par tâche existante.
- **Volet rattachement** : colonnes `pr_url`, `commit_sha`, `created_by` sur `agent_tasks`.
- **MCP** : sixième outil `lire_journal` (trajectoire d'une tâche, ou pouls du registre) ;
  `rendre_compte` accepte `pr_url`/`commit_sha` ; `deposer_tache` pose `created_by`.
- **Vérifié** : migration testée dans un Postgres 15 jetable (schéma `agent_tasks` reproduit depuis
  `information_schema`) — deux bugs trouvés et corrigés par ce test (ordre du `CASE` qui rendait le label
  `compte_rendu` mort ; violation de clé étrangère au `DELETE`). Idempotence confirmée. `test-client.mjs`
  10/10. Garde-fous 21/21.
- **Vérifié en production** (2026-10-29) : amorçage **277 événements** = 277 tâches (unicité par
  tâche) ; trigger `agent_tasks_journal` prouvé (INSERT→`depose`, UPDATE→`edition`,
  DELETE→`suppression`, en transaction annulée) ; RLS active (anon : 0 ligne, service_role : 277) ;
  version enregistrée dans `supabase_migrations.schema_migrations` (`20261029150000`).

## [2026-10-28] — Audit éditorial lot 2 : cohérence des chiffres de l'accueil (constats D et E)

Deux chiffres de l'accueil se contredisaient, sur la **même page** : « dix ans » (`home/hero_tagline`)
contre « 4+ » (`global/stat_1_nb`), et un « 7+ pays » sous une liste de neuf terrains. Le « 12 pays »
affiché n'était qu'un **repli de code** (mesurant en réalité les pays *visités*) : en base,
`site_settings.covered_countries` valait bien `7`. Trois ancrages concurrents des années coexistaient
dans l'historique, aucun adossé à une preuve de terrain. Le propriétaire a tranché.

- **Migration `20261028140000_coherence_chiffres_accueil.sql`** (appliquée en production) : les années
  sont **retirées** (on ne choisit pas un chiffre non attesté) ; `site_settings.covered_countries` passe
  de `7` à **`12` pays habités ensemble** ; l'accueil affiche désormais deux mesures distinctes —
  **40 pays visités** et **12 pays habités** ; les trois zones figées `a-propos/stat_*_value` sont
  désactivées (`is_active=false`, jamais supprimées).
- **Code (PR #768, rebasée sur #746)** : ajout de la mesure distincte « Pays visités » (~40) sur
  l'accueil et **retrait du suffixe `+`** des compteurs « Pays habités » et « Carnets publiés »
  (constat F : « 8+ » pour 8 publiés). Les **replis `7`→`0`** dans `app/page.tsx` et
  `components/HomeClient.tsx` viennent en revanche du commit `0a92d446` (26/10, convention du dépôt :
  une lecture vide doit se voir, pas être masquée par une valeur inventée), déjà sur `main` — #768 ne
  touche pas `app/page.tsx`.
- **#746 fusionnée** après application de sa migration `20261026190000` (9 zones `article_*` alentejo
  désactivées) : sa CI rouge venait d'un ordre d'opérations manquant, pas d'un défaut de code.
- **Écart dépôt ↔ base : 0** (`supabase migration list`, 211 versions des deux côtés). Mode maintenance
  intact. Garde-fous 21/21.

## [2026-10-28] — Dérive de schéma : 5 tables legacy rattachées à une migration

Cinq tables étaient lues par le code (`.from('…')`) mais n'avaient **aucun** `CREATE TABLE`
dans `supabase/migrations/` : `cms_home_destinations`, `cms_seasons`, `site_content`,
`newsletter_subscribers`, `travel_requests`. Créées à la main — le motif « script jetable »
que `AGENTS.md` interdit. Une base reconstruite depuis le dépôt les aurait perdues, dont
**deux qui portent des données personnelles** (inscriptions, demandes de Travel Planning).

- **Migration `20261028120000_rattachement_tables_legacy.sql`** : le schéma n'est pas déduit
  du code, il est **relevé à l'identique en production** (`information_schema.columns`,
  `pg_constraint`, `pg_indexes`, `pg_policies`). Colonnes, types, valeurs par défaut,
  contraintes, index et **politiques RLS** reproduits — y compris le refus de lecture `anon`
  sur `travel_requests` et `newsletter_subscribers`.
- **Sans effet sur la base vivante** : `IF NOT EXISTS` partout. Vérifié en **transaction
  annulée** (`BEGIN … ROLLBACK`) : empreinte md5 des colonnes et des politiques **identique
  avant/après** pour les 5 tables. Et le DDL, rejoué dans un schéma jetable (base vide, où
  `IF NOT EXISTS` ne masque plus rien), reproduit exactement les **9 / 14 / 5 / 7 / 16**
  colonnes, **11 index**, **10 contraintes** et **8 politiques** de la production.
- **`LEGACY_UNMIGRATED` est vide.** La 6ᵉ entrée, `destinations_public`, était un **faux
  positif** : ce n'est pas une table mais une **vue**, déjà migrée (4 fichiers, le dernier
  `20261022200000`). La cause est corrigée : `collectMigratedTables` reconnaît désormais
  `CREATE VIEW`, avec un test unitaire dédié.

### Piège désamorcé : `db push --include-all` aurait levé le mode maintenance

`supabase db push` **échouait** avant ce lot, et pour une raison qui n'a rien à voir avec le
code : `supabase/migrations/20261026140000_levee_mode_maintenance.sql` — un fichier **rédigé
mais volontairement non appliqué** (règle n°4) — est horodaté *avant* des migrations déjà
appliquées. Le CLI refuse alors tout `db push` (« Found local migration files to be inserted
before the last migration on remote database ») et **suggère `--include-all`**.

Or `--include-all` **pousse ce fichier aussi** : vérifié en dry-run, il aurait appliqué
`20261026140000_levee_mode_maintenance.sql`, c'est-à-dire `maintenance_mode = 'false'`.
**La suggestion du CLI était le piège.** Suivre l'indication aurait levé la maintenance sans
décision du propriétaire.

Le fichier a d'abord été **parqué dans `supabase/archive/`** — la convention de
`EMERGENCY_FIX_20260602.sql`, dont le rôle est précisément de ne jamais être rejoué. Le CLI
**ignore** `supabase/archive/` : `db push` ne voit plus que la migration de rattachement.
**Contenu inchangé** (md5 `5d05d6677c2e54c2791cf0784129b936`, identique avant et après le
déplacement).

Le déplacement a ensuite été **committé** (`c169e1b3`, 2026-10-28), avec la consigne explicite de
rester hors de `main`. Il ne touche pas la règle n°4 : le mode maintenance est lu dans
`site_settings.maintenance_mode` (source de vérité, `middleware.ts`), pas dans ce fichier. Le jour
de la levée, il suffira de le remettre dans `supabase/migrations/` avec un horodatage postérieur —
la consigne de son propre en-tête.

**État : APPLIQUÉE le 2026-10-28.** `supabase db push --linked` a exécuté
`20261028120000_rattachement_tables_legacy.sql` et l'a journalisée. Écart dépôt ↔ base :
**0** (`migration list` : 209 appliquées des deux côtés, aucune orpheline).

Contrôle après application, comparé à un relevé pris **avant** le push :

| | avant | après |
|---|---|---|
| Colonnes (5 tables) | 9 / 14 / 5 / 7 / 16 | **9 / 14 / 5 / 7 / 16** |
| Politiques RLS | 8 | **8** |
| Lignes (`site_content`, `cms_seasons`, `cms_home_destinations`, `newsletter_subscribers`, `travel_requests`) | 55 / 14 / 4 / 2 / 2 | **55 / 14 / 4 / 2 / 2** |
| `maintenance_mode` | `true` | **`true`** |

Rien n'a bougé : la migration était bien un no-op sur la base vivante, elle n'a fait que
**journaliser** la version. `check:cms-drift` : aucune dérive. Règle n°4 intacte —
`/destinations/paris` → 307 → `/maintenance` → HTTP 200.

## [2026-10-28] — Contrôle CMS : la lecture des zones survit à une panne passerelle

Le 2026-10-15, « Zones et tables CMS » a échoué sur les PR **#596, #597 et #599**
avec `Lecture de cms_editable_zones impossible (HTTP 504)`. Ce n'était pas un défaut
de code : une panne passerelle Supabase passagère. La même lecture passe localement
en 2,5 s.

- **La fenêtre de reprise était trop courte** : 3 essais espacés de 400 puis 800 ms,
  soit **1,2 s** au total. Un 504 de quelques secondes suffisait à faire échouer le
  contrôle — et trois PR sont restées bloquées dessus.
- **Corrigé** : 5 essais espacés de 1,5 s à 6 s (~15 s cumulées) dans les trois
  scripts qui interrogent `cms_editable_zones` en pagination (`check-cms-zones`,
  `check-cms-emojis`, `check-cms-drift`). La sémantique ne change pas : au-delà, la
  panne est réelle et l'échec reste un échec.
- **Vérifié** : `node --check` sur les trois fichiers ; garde-fous 21/21 ; relance du
  job sur les trois PR (HTTP 201).
- **Complément** : `check-cms-drift.mjs` ne reprenait que sur une **exception réseau**, pas sur un
  statut 5xx — or un 504 passerelle arrive comme **réponse**. Ce cas précis tombait donc dans le
  `?(HTTP 504)` final sans aucune reprise. Corrigé en alignant `tableExists` sur les deux autres
  scripts (test du 5xx, 5 essais).

À noter : après relance, ces trois PR échouent de nouveau, mais **pour une autre
raison** — leur code date du 15/10 et ne consomme pas les zones CMS ajoutées depuis
(`contact_form_*`, `newsletter_*`, `destinations-*`). Le remède est un rebasage sur
`main`, pas une modification du contrôle.

## [2026-10-28] — Revue des PR : le filtrage par auteur est retiré (fin du goulot)

Le seul moteur qui fusionne, `scripts/revue-jules.mjs`, ne voyait que les PR de Jules
(`estPrDeJules` testait `/jules\.google\.com\/task/` dans le corps). Les PR des autres
agents lui étaient **invisibles** : elles s'accumulaient sans jamais être proposées.

- **Constat mesuré** : 45 PR ouvertes le 28/10, dont **33 de plus de 7 jours**.
- **Corrigé** : `estPrDeJules` est remplacé par `proposable`, qui ne regarde plus
  l'auteur mais l'état (`open`). Ce qui mérite une relecture humaine, c'est le
  **contenu** — brouillon, CI rouge, conflit, fichiers sensibles — et ces règles
  restent inchangées dans `recommander`. Les libellés ne mentionnent plus « Jules ».
- **Sûreté préservée** : le script ne fusionne rien seul. Il propose (tâche
  `agent_tasks`, `waiting_validation`), le fondateur valide dans le Poco, et
  l'exécution **re-vérifie** au passage suivant que la PR n'a pas bougé (même commit,
  toujours fusionnable, CI toujours verte). `--essai` n'écrit rien.
- **Vérifié** : `--essai` sur les données réelles voit les 38 PR ouvertes (contre 1
  seule PR de Jules auparavant) ; `vitest` 18/18 sur les règles ; `garde-fous` 21/21.

## [2026-10-28] — Signature APK : plus de release signée avec le keystore de debug public

Constat mesuré, pas supposé. `keystore/heldonica-debug.keystore` est versionné dans un
dépôt **public**, et son mot de passe (`heldonica`) était écrit en clair dans
`app/build.gradle.kts`. Le repli de signature de release y retombait quand les secrets
`RELEASE_*` manquaient. Résultat : **les 7 APK publiés** (le plus récent
`apk-2026.10.20-poco-ia`) sont signés avec cette clé publique.

- **Preuve** : l'APK publié extrait, son certificat de signature porte l'empreinte
  SHA-256 `15:71:BD:5C:CE:90:FF:94:32:79:C7:D2:D6:80:88:5B…`, `CN=Heldonica Mobile
  Debug` — identique à celle du keystore du dépôt. Le journal du build de release le
  dit lui-même : « aucun keystore de release fourni : repli sur le keystore de debug. »
- **Conséquence** : n'importe qui peut signer un APK de la même identité, qu'Android
  acceptera comme mise à jour légitime. La vérification du certificat Google Sign-In
  s'appuie sur le SHA-1 de cette même clé publique : elle ne prouve donc rien.
- **Corrigé** : le repli est **retiré** (`app/build.gradle.kts`). Sans keystore de
  release, la construction d'une release **échoue** (`GradleException`) au lieu de
  produire un APK falsifiable — sauf en validation de CI, qui construit une variante
  release **non signée** (`-PallowUnsignedRelease=true`) pour vérifier R8 et proguard
  sans engager de clé. Le verrou de publication vit dans `build-apk.yml` : l'appel de
  `release-apk.yml` pose `publier: true`, et sans `RELEASE_KEYSTORE_BASE64` le build
  de publication est refusé. Un build de validation (PR, push) n'est pas concerné —
  sans quoi tout PR touchant `heldonica-mobile/` serait rouge en permanence.
- **Garde-fou** : `scripts/check-apk-signature.mjs`, câblé dans `garde-fous` et la CI
  (21e contrôle). Il refuse toute référence au keystore de debug dans
  `signingConfigs.release`, tout mot de passe en dur, et tout repli silencieux.
- **Reste à faire (action humaine)** : poser les secrets `RELEASE_KEYSTORE_BASE64`,
  `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD` (une vraie
  identité de release) ; puis **régénérer l'identité Google Sign-In** — le SHA-1
  actuellement déclaré est celui du keystore de debug public, donc reproductible par
  un tiers. Un changement de clé impose une réinstallation manuelle des versions déjà
  installées. Le keystore de debug peut rester versionné : il ne signe plus aucune
  release (garde-fou), et un keystore de debug n'est pas un secret par nature.

## [2026-10-27 ter] — Briques « photo → contenu » : trois inventions retirées

Constat de départ : le propriétaire a des années de photos (Google Photos) et veut
en faire du contenu. En vérifiant le chemin existant avant de le brancher, trois
endroits se sont révélés **inventer** — contraires à la règle n°1.

- **`lib/cms-photo-interview.ts` — les « indices visuels » n'étaient pas vus.**
  `generatePhotoInterviewQuestions` est une fonction **pure, sans appel vision** :
  elle poussait pourtant `'Lumière naturelle & cadrage de terrain'` en dur, donc
  affirmait une observation sur une image jamais regardée. Sans analyse, la liste
  est désormais **vide** ; les observations réelles arrivent par le paramètre
  `visualClues`. La synthèse fabriquait aussi des phrases d'ambiance
  (« À `<lieu>`, on s'est posés un moment pour absorber le lieu. ») : le duo se
  voyait attribuer une action absente de ses réponses. Retirées — le paragraphe ne
  contient plus que ses réponses, dans leur ordre. Idem pour l'anecdote de repli
  (« Halte vécue à … ») et le lieu « Lieu vérifié ». La **date** des blocs suggérés
  venait de `new Date()` : elle datait du jour de rédaction une photo prise deux ans
  plus tôt — un faux qui a la forme d'une preuve. Elle n'est posée que si elle est
  connue (EXIF ou saisie).
- **`app/api/cms/import-trip/route.ts` — le bouton « Reconstituer Carnet » rédigeait
  sans matière.** La route demandait « un carnet de 1000 à 1200 mots » sans lui
  fournir **aucune photo ni aucun fait vérifié** : seulement la destination, des
  noms d'étapes et le **nombre** de photos. Elle inventait donc le récit, et
  produisait un brouillon d'apparence finie impossible à trier ensuite. Sans notes
  vécues, elle prépare maintenant un **squelette** (titre de travail, structure,
  balises `[À TOI : …]` qui disent quoi raconter) ; avec des notes, elle ne rédige
  qu'à partir d'elles et laisse des balises pour ce qui manque. La réponse porte
  `squelette: true` pour que l'écran le dise. `photosCount` est retiré : il n'a
  jamais servi qu'à habiller le prompt.
- **`app/panel-manager/photos/page.tsx`** passait
  `notes: 'Photos importées depuis Google Photos'` — un texte de remplissage
  présenté comme du vécu. Retiré ; le message de fin distingue « squelette à
  remplir » de « carnet ».
- **`app/api/cms/photos/interview/route.ts`** accepte et transmet `visualClues`,
  pour que l'analyse réelle (ex. `/api/cms/ai-vision`, qui envoie vraiment l'image
  à Gemini) puisse nourrir l'interview.

**Vérifié** : 1118 tests verts (136 fichiers), `tsc --noEmit` propre, ESLint propre,
garde-fous `check:erreurs-avalees`, `check:content-coherence`, `check:brand-sync`,
`check:api-auth` OK. 8 tests ajoutés
(`__tests__/lib/cms-photo-interview-sans-invention.test.ts`) ; l'ancien test
exigeait la phrase d'ambiance fabriquée (« Crête de Stoos »), il est mis à jour.

**Reste à faire (non fait ici)** : brancher `/api/cms/ai-vision` sur l'interview
pour que les questions parlent de la photo réelle ; configurer les 3 variables
Google Photos Picker ; porte web `/ajouter` ; porte Android.

## [2026-10-27 bis] — Lot emoji, périmètre administration : 70 emojis retirés de 32 fichiers

La décision #682 (« supprimer TOUS les emojis ») tranche ce que l'audit du 21/10
avait laissé ouvert : les composants **admin/CMS** gardaient leurs emojis
d'interface, « hors périmètre éditorial public, à trancher ». C'est tranché.

- **Périmètre** : `app/admin`, `app/panel-manager`, `components/admin`,
  `components/cms`, `components/inline-edit` — soit les 34 fichiers candidats que
  `check-design-tics` exclut volontairement ; **32** ont effectivement changé.
- **Retiré (70)** : emojis pictographiques d'interface (épingle, billet, clap,
  dossier, sablier, étincelle, fusée, boussole, éclair…) dans les libellés, boutons
  et titres.
- **Conservé, par la politique déjà arrêtée** : marques légales (`© ® ™`),
  flèches (`→ ← ↑ ↓ ➔`), et la convention de liste `✓` / `✗` / `⚠`.
  Les **drapeaux** (indicateurs régionaux, ex. le drapeau portugais) restent exclus : sémantiques,
  jamais décoratifs — même règle que `check-cms-emojis` et la migration de purge.
- **Laissé volontairement, et c'est le point à ne pas rater** : le glyphe `✦` de la
  signature carrousel **n'est pas un tic** mais le **wordmark de marque**, enregistré
  comme icône CMS et utilisé dans le contenu publié. Le retirer changerait la marque —
  même raison que le `flag_emoji` des destinations, qui est une donnée de contenu.
  Ces deux points avaient déjà été tranchés par l'audit ; le premier jet de ce lot les
  avait repris par erreur, puis restaurés.
- **Convention de remplacement** : icône `lucide-react` (`<Zap size={18} aria-hidden="true" />`),
  celle qu'avait posée le commit `0403353f` pour `Toast` et `OmnisearchPalette` —
  pas de suppression sèche qui laisserait un libellé orphelin.
- **Deux justesses corrigées au passage** : le placeholder de
  `destinations_tabs_json` proposait un globe en emoji comme valeur d'`icon`
  alors que `tabs[].icon` est rendu **tel quel** (`DestinationsClient.tsx:145`)
  et que la valeur par défaut est vide — il suggérait donc d'afficher le mot
  « globe ». Le champ `emoji` de `SeasonsManager` gardait un soleil en placeholder
  pour un champ vidé en base le 21/10.
- **Vérifié** : `garde-fous` **20/20** (dont `tsc` et `vitest`), `eslint` **0 erreur**
  (2 avertissements préexistants, lignes non touchées), **0** emoji restant au
  détecteur `DECORATIVE_EMOJI_RE` sur le périmètre admin.

  ## [2026-10-27] — Heldonica CMS 3.0 (in-house) : le back-office passe au niveau d'un vrai éditeur de blocs

  Périmètre volontairement limité au **back-office CMS**. Cette entrée documente ce que la branche `agent/freebuff/cms-inhouse` (PR #752) contenait réellement, désormais fusionné via la PR #753 (branche `agent/antigravity/cms-inhouse-editor`) ; le reste de la branche Gemini d'origine (APK Kotlin, studio musique et vidéo, dispatcher Jules, Instagram, hub SEO, pages publiques) est écarté et reste à traiter séparément.

  - **`BlockCanvas.tsx`** : simulateur de viewport (bureau, tablette 768, mobile 390 dans une coque), pile undo-redo de 30 états avec `Ctrl+Z` / `Ctrl+Y`, compteur de mots et temps de lecture, tiroir de réglages avancés.
  - **Studio des gabarits (`lib/cms-templates.ts`)** : 7 gabarits Slow Travel, filtres thématiques, prévisualisation en direct via `BlockRenderer`, insertion « remplacer tout » ou « ajouter à la suite », export et import JSON, gabarits personnels en `localStorage` (`heldonica_user_templates_v1`).
  - **Les cinq verrous de l'éditeur** : `OmnisearchPalette` (`Ctrl+K`), `BubbleToolbar` contextuelle, `AstJsonInspectorModal` (inspecteur du JSON du bloc), `EeatScorecardHud` (score E-E-A-T recalculé en direct) et `AgentPresenceBadge` (coordination multi-agents sur `agent_tasks`).
  - **`HotspotPicker`** : point focal de l'image choisi à la souris, repris par `ImageBlock` et `BlockRenderer`.
  - **Thèmes de bloc (`types/cms-blocks.ts`)** : `sand`, `parchment`, `terracotta`, `forest_fog`, `chalk`, `gold_accent`, `dark`, `default` — rendus papier, sans carte SaaS ni ombre.
  - **Cartouche de terrain** : champ `cameraInfo` porté par `PhotoEvidenceBlock` et par le convertisseur `lib/cms-blocks-converter.ts`.
  - **Onglets d'administration** : `hub`, `seo-geo`, `task-giver` et `branding` dans `CmsAdminClient`, plus le dock `CreatorQuickDock` monté dans `app/admin/layout.tsx` ; nouvelle route `app/api/admin/agent-task-giver/route.ts`.
  - **Hors périmètre assumé** : `.github/workflows/dispatch-jules.yml` n'est **pas** dans cette PR. Ce workflow n'existe que sur la branche Gemini, il lit `JULES_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY`, et le correctif d'autorisation de `agent/claude/securite-dispatch-jules` ne lui est pas encore appliqué. Le laisser dehors évite de publier la faille ; il fera l'objet d'une PR dédiée.

  ## [2026-10-27] — Reprise des apports de la PR #752 et retrait d'un code mort

  Deux agents (`freebuff` et `antigravity`) avaient produit la même fonctionnalité « CMS 3.0 » dans deux PR concurrentes. Mesure faite : la PR #753 est un **sur-ensemble strict** de la PR #752 (49 de ses 50 fichiers). #753 a été fusionnée ; cette entrée reprend les seuls apports de #752 qu'elle ne portait pas, et solde un reliquat.

  - **`lib/ai-provider.ts`** : commentaires de `JULES_MODEL` et `BRAIN_MODEL` (cibles non facturées du donneur de tâches ; Jules = endpoint `v1alpha/sessions`, Brain = service local port 8451). Aucun changement de code.
  - **`__tests__/lib/cms-templates.test.ts`** : deux gabarits de plus vérifiés (`terroir_artisan_table`, `train_escape_zero_carbon`).
  - **`lib/brand-customization.ts`** : **supprimé**. 93 lignes jamais importées (presets typographiques et packs d'icônes) — aucun composant, test ou script ne les référençait.

  ## [2026-10-26] — Lot 2 (A/B/C/I/F) : entrées sous maintenance, og:image:alt, JSON-LD, compte de carnets

  - **A — matcher du middleware** : il n'excluait pas les fichiers de `public/`. Pendant la maintenance, `og:image` et les favicons renvoyaient **307 -> /maintenance**. Le matcher exclut désormais tout chemin à extension ; `llms.txt` (seule route dont un segment contient un point) reste exclu aussi. Mesuré : `/og-default.jpg` **200**, `/favicon.ico` **200**, `/site.webmanifest` **200**, page `/` toujours **307** (protection intacte).
  - **B — `robots.txt` à source unique** : `public/robots.txt` supprimé (il provoquait un **500** en dev par conflit fichier/route, et divergeait de ce que la prod sert). `app/robots.ts` reste la source. Mesuré : `/robots.txt` **200**, contenu identique à la production.
  - **C — `og:image:alt`** : la zone CMS `seo_og_image` (active partout) reconstruisait `openGraph.images` en perdant l'`alt` du fallback, si bien que la balise n'était **jamais** émise. `lib/page-metadata.ts` reporte l'`alt`. Mesuré sur les 6 pages d'entrée : balise présente partout.
  - **I — `Organization` JSON-LD dédoublonné** : blocs nus supprimés dans `app/page.tsx` et `app/a-propos/page.tsx` ; l'Organization complet de `app/layout.tsx` reste seul. Mesuré : **1 seul** `"@type":"Organization"` par page.
  - **F — compte de carnets réel** : `publishedArticles = totalPosts` (accueil) et `carnetCount = posts.length` (`/a-propos`) ; repli silencieux `|| 25` et suffixe `+` trompeur retirés. Les deux pages affichent **8**.
  - **Découpage** (revue du propriétaire, « une PR = un sujet ») : les constats A/B/C/I/F restent ici ; la recherche D/E/G, la migration des compteurs morts et le correctif des zones `header_logo_*` partent en PR séparées.
  - **Vérifié** : `tsc` 0 ; `vitest` **1054/1054**.

  ## [2026-10-26 bis] — Hors-CMS : consentement RGPD, chiffres réels, routes jetables

- **Contexte** : site laissé en maintenance (décision du fondateur) ; le CMS Carnet 2.0 est confié à OpenHands. Cette session ne touche ni `app/panel-manager/**`, ni `app/api/cms/**`, ni `lib/cms-*`. Branche `agent/opencode/hors-cms`, rebasée sur `origin/main` `301e7553` (lot maintenance + garde-fou emojis).
- **Consentement explicite** :
  - `/api/newsletter` et `/api/brevo/subscribe` refusent toute inscription sans `consent === true` (HTTP 400), en plus du honeypot et du rate limit.
  - GA4/GTM ne sont plus posés dans le `<head>` pour tout le monde : `components/ConsentAwareAnalytics.tsx` ne monte les scripts qu'après `heldonica_cookie_consent_v1 = accepted`, et réagit à l'événement du bandeau sans rechargement. Le `<noscript>` GTM est retiré.
  - Footer, `NewsletterForm`, `NewsletterPopup`, `GuideDownloadForm` et le quiz portent une case de consentement reliée à l'envoi.
  - **4 tests neufs** sur `ConsentAwareAnalytics` (aucun script sans choix, refus `rejected`, chargement après acceptation, mise à jour en direct) + un test API sur le refus sans consentement dans `quiz-capture`.
- **Cohérence éditoriale (fin des chiffres inventés)** :
  - `/a-propos` et l'accueil n'affichent plus les replis « 25 carnets » ni « 7 pays » : les compteurs viennent des articles publiés, ou affichent 0 quand la donnée manque.
  - `/expert-hotelier` : retrait des pourcentages et résultats de cas clients non mesurés (25 %, 45 %, 12→45 %, +34 %, 78 %).
  - `/destinations/alentejo` : les trois faux liens « Nos carnets liés » sont remplacés par les vrais articles dont le titre ou la destination contient « alentejo » ; `getAllPosts` expose désormais `destination`.
- **Nettoyage** : suppression des routes jetables `POST /api/publish-podgorica` et `POST /api/fix-destinations` (plus aucune référence dans le code). `POST /api/cms/import-trip` reste en place : sa suppression appartient au lot CMS.
- **CMS Carnet 2.0 parqué, pas perdu** : la branche locale `agent/opencode/cms-2.0` (commit `82d588e0`, 32 fichiers) conserve le WIP CMS + consentement initial, dont `lib/cms-carnet-2.ts`, `lib/gemini-vision-interview.ts`, `app/api/cms/carnet/*` et `app/panel-manager/carnet/`. À confronter aux moteurs existants `lib/cms-photo-interview.ts` et `lib/cms-draft-from-evidence.ts` avant reprise.
- **Vérifié** : `tsc` 0 erreur ; tests ciblés consentement / newsletter XSS / analytics verts ; `check:cms-hardcode` 1 334 textes en dur, 2 fichiers en baisse (cliquet mis à jour) ; `preflight` **13/13**. Suite vitest complète : **1 015/1 019** ; les **4 échecs** sont la locale `fr-FR` absente de l'ICU Alpine (`HeldonicaVerdict`, 3 `formatDate`), **reproduits sur `origin/main` intact** ; aucun échec introduit. `npm run garde-fous` complet reste rouge localement pour ces 4 tests et pour des dépassements des 5 s par défaut sous PRoot (les mêmes fichiers passent avec `--testTimeout=30000`).
- **Build de production** : `npm run build` (Next 15.5.28) — compilation, lint/types, **160/160 pages statiques**, traces et table de routes générées, **0 erreur**. Les variables Supabase étant absentes de cette session, le build a utilisé le stub sécurisé de pré-rendu : il prouve la compilation, pas le rendu des données réelles.
- **Non vérifié** : rendu visuel, comportement en production, valeur réelle de `site_settings.maintenance_mode` (aucun identifiant Supabase dans cette session). Aucune écriture en base, aucune migration. Mode maintenance **non touché**.
- **Branche** : `agent/opencode/hors-cms`, basée sur `origin/main` `301e7553`.

  ## [2026-10-26 ter] — Audit hors-CMS : pages fantômes et promesses non prouvées

- **`lib/constants.ts` supprimé** : ce fichier n'était importé nulle part et portait des chiffres périmés/inventés (« 4 ans de slow travel depuis 2021 », « 25+ carnets », « 7 pays habités », « 100 adresses testées »). Les compteurs réellement affichés viennent désormais des articles publiés (`/a-propos`) ou de la base (`stat_*` de l'accueil) ; garder cette « source de vérité » morte ne pouvait que recontaminer une future page.
- **`/destinations` ne revendique plus les pages en quarantaine** : la description, l'OG/Twitter et le JSON-LD `CollectionPage` citaient Sicile et Paris comme « testées sur le terrain », alors que leurs pages sont servies en « Bientôt » et en `noindex` (`lib/unpublished-pages.ts`). Remplacés par Portugal (page publiée) ; les entrées Sicile et Paris retirées de `hasPart`.
- **`/destinations/roumanie/bucarest`** : la description SEO (`« Guide Bucarest: Macro, culture… »`) était un brouillon généré ; réécrite en français lisible, sans la formule boilerplate « testé en couple ». La page reste publiée (photo de terrain du 27/08/2026).
- **`/expert-hotelier`** : le libellé « Résultats observés » devient « Ce que ça change » (aucun résultat client mesuré n'est affiché), et la FAQ ne promet plus une « hausse mesurable » sans dossier source : elle énonce l'objectif et rappelle que les résultats dépendent du point de départ.
- **Reste à traiter, hors de cette session** :
  - `lib/cms-page-defaults.ts:78` (`a-propos__bio_text`) dit encore « depuis plus de 10 ans », en contradiction avec l'histoire publique ; fichier `lib/cms-*`, réservé à OpenHands.
  - Replis d'accueil `stat_1_nb = « 4+ »` et `stat_2_nb = « 100+ »` (`components/HomeClient.tsx`) : invérifiables sans base, et toujours affichés si `site_settings` ne les surcharge pas.
  - Les 37 sous-pages en quarantaine gardent leurs métadonnées de brouillon dans le code source ; `buildPageMetadata` les remplace bien par `DESCRIPTION_BIENTOT`, mais le nettoyage de fond appartient au lot CMS/éditorial.
  - `og-default.jpg` reste l'image de partage ou le hero de plusieurs pages publiées (Sardaigne, Zurich, guides…), faute de photo vérifiée.
- **Vérifié** : `tsc` 0 erreur ; `preflight` **13/13** ; `check:content-pages` vert (« aucune dérive éditoriale dans les pages publiées ») ; `check:image-paths` vert avec 4 chemins en dette connue (Suisse) ; `unpublished-pages` + `SubDestinationTemplate` **12/12**. Aucune écriture en base, mode maintenance non touché.
- **Rebasage final** : branche rebasée sur `origin/main` `301e7553` (#742 lot 2, #743 logo, #745 compteurs, #747 CI quotidienne, #748 règle secrets) ; conflits CHANGELOG résolus en conservant les deux lots ; contrôles rejoués après résolution.

  ## [2026-10-26 quater] — CI zones CMS : note de capture rétablie, zones Alentejo désactivées

- **`quiz.capture_email_note` réutilisée** : le remplacement de la note « Gratuit · Sans engagement · Zéro spam » par la case de consentement avait laissé la zone active sans lecteur. La note est rétablie au-dessus de la case ; `check:cms-zones` ne la compte plus comme orpheline.
- **Zones Alentejo** : la page rend désormais les vrais articles `getAllPosts` (filtre « alentejo ») ; les neuf zones `article_1_*` à `article_3_*` ne sont plus affichées. Migration `20261026190000_desactivation_zones_articles_alentejo.sql` : `is_active = false` pour ces neuf clés. **Non appliquée** — elle attend un `db push` (écriture de production réservée au propriétaire).
- **Version de migration unique** : le fichier Alentejo est renommé `20261026190000_...` car `20261026170000` est déjà pris par la migration amont #743 (`zones_header_logo_valeur_null`). Sans ce renommage, le CLI aurait considéré la migration comme déjà appliquée et l'aurait sautée en silence.
- **Zones logo** : le correctif amont #743 (`NULL` au lieu de chaîne vide) est inclus par le rebasage ; il ne reste que la migration Alentejo à appliquer pour que le garde-fou cesse de compter ces neuf zones.
- **Vérifié** : `tsc` 0 ; `preflight` **13/13** ; `check:content-pages` vert.

  ## [2026-10-25 quindecies] — Le filtre CMS n'est pas supprimé, il est déclaré

- **Le constat** : la levée du verrou de câblage (lot 1) a retiré `CONSUMED_ZONE_KEYS` de `getGlobalZones()`, avec pour seule contrepartie un commentaire renvoyant à `check-cms-zones.mjs`. Or ce garde-fou ne vérifie qu'une chose : qu'une zone active est **lue par un composant**. Il ne dit rien de ce qui part dans le HTML public. La précaution d'origine — ne pas sérialiser une valeur qu'aucun composant n'affiche (résidus « Monica Schneider / Executive Coach », lus par Googlebot) — n'était donc plus portée par personne.
- **`lib/public-global-zones.json`** (source unique, lisible par le TS et par le `.mjs`) : la liste des familles publiables (`nav_item_`, `header_`, `footer_`, `newsletter_`, `stat_`, `cta_`, `social_`, `instagram_`, `cookie_`, `popup_`, `contact_`), quatre clés hors famille (`nav_footer_title`, `destinations_footer_title`, `guides_footer_title`, `legal_footer_title`), et un **préfixe réservé `_prive_`** qui marque une exclusion assumée (brouillon, résidu, archive).
- **`lib/public-global-zones.ts`** : `isPublicGlobalZone` / `isPrivateZone`. `getGlobalZones()` n'écarte plus que ce qui n'est ni déclaré, ni réservé — une entrée de menu neuve passe toujours sans toucher au code, mais une clé inconnue ne fuit plus en silence.
- **Le garde-fou mord** : `check-cms-zones.mjs` échoue dès qu'une zone `global` **active** n'est ni déclarée publique ni préfixée `_prive_`. **Preuve par échec, deux fois** : (1) contre la vraie base, retirer `header_` de la déclaration → **12 zones signalées**, `header_site_name` en tête, exit 1 ; (2) `__tests__/scripts/check-cms-zones-declaration.test.ts` (5 cas, serveur HTTP local jouant la base) : retirer `nav_footer_title` → le cas « clé exacte » tombe, restauré → 5/5.
- **Mesuré** : `npm run check:cms-zones` → **2248 zones actives**, `✓ Zones global : 156 active(s), toutes déclarées publiques ou réservées` ; la déclaration couvre **156/156**. Aucune zone réelle n'a dû être renommée : la déclaration décrit l'existant.
- **Vérifié** : `garde-fous` **20/20** ; `tsc` 0 ; `vitest` **1054/1054** (126 fichiers).
- **Reste à faire (humain)** : rien. La migration `20261025190000` et `20261025200000` attendent toujours le feu vert `db push`.

## [2026-10-25 quaterdecies] — L'emoji survivant, et le trou de plage qu'il révélait

- **Le constat** : la fiche 91b54bbb (« des emojis interdits sont RENDUS en ligne ») n'était pas close. Le re-scan de la base donne **un seul** emoji décoratif restant : `destinations-sicile-syracuse / highlight_2_emoji` = `⌛` (sablier), `is_active = false` (donc non rendu). Tout le reste est propre : `cms_blog_posts` porte 18 articles à emoji mais **tous `published = false`** (filtrés par `getPostBySlug` → `.eq('published', true)`) ; `cms_pillar_pages.flag` porte des drapeaux (`🇵🇹`), qui sont des **indicateurs de pays sémantiques**, pas des tics — et le champ n'est lu que par l'admin.
- **La cause racine, plus intéressante que le symptôme** : la purge #687 (migration `20261022230000`) visait la plage `2600-27BF + 10000-1FAFF`, alors que le détecteur `scripts/check-design-tics.mjs` (`DECORATIVE_EMOJI_RE`) couvre **aussi** `231A-231B`, `23E9-23FF`, `2B1B-2B1C`, `2B50` et `2B55`. Quatre familles d'emojis échappaient donc à la purge **tout en étant refusées par la CI** : les sabliers (⌚-⌛), les chronomètres (⏩-⏿), l'étoile pleine (⭐) et le cercle épais (⭕). Le sablier de Syracuse est tombé exactement dans ce trou.
- **Preuve mesurée (lecture seule, caractères littéraux)** : `U+231B` → motif #687 `false`, motif détecteur `true` ; `A` (U+0041) → les deux `false`. PostgreSQL **comprend** `\uXXXX` / `\UXXXXXXXX` (ARE) — vérifié, mon premier test était faussé par une classe malformée.
- **Migration `20261025200000_complete_purge_emojis_cms_zones.sql`** : reprend la plage **complète** du détecteur (drapeaux exclus, ils sont sémantiques). `EXPLAIN` valide la syntaxe sans écrire, et la clause `WHERE` rejouée en `SELECT` vise **exactement 1 ligne** (le sablier). Idempotente. **Non appliquée** — le lot demandait la lecture seule avant tout `db push`.
- **Le trou structurel refermé** : `check-design-tics.mjs` lit les **fichiers**, pas la base — une zone CMS peut porter un emoji absent de tout le code. Nouveau garde-fou **`scripts/check-cms-emojis.mjs`** (`npm run check:cms-emojis`) : il lit `cms_editable_zones` en base (pagination `Range`, l'API plafonne à 1000 lignes), **importe la plage du détecteur** (source unique — les deux ne peuvent plus diverger), bloque (`exit 1`) sur une zone **active**, signale sans bloquer une zone inactive. Câblé dans l'agrégateur (`garde-fous.mjs`, `needsDb`) et dans la CI (`.github/workflows/garde-fous.yml`, derrière `if: secrets`).
- **Test anti-récidive** `__tests__/scripts/purge-emojis-plage.test.ts` : compare les classes Unicode des migrations de purge à la plage du détecteur. **Vérifié par échec** : migration retirée → 2 échecs nommant `U+231A, U+231B, U+23E9, U+23FF, U+2B1B, U+2B1C, U+2B50, U+2B55` ; restaurée → 5/5.
- **Vérifié** : `npm run garde-fous` **20/20** (19 → 20 : le nouveau contrôle s'ajoute) ; `tsc` 0 ; `vitest` **1031/1031** (124 fichiers) ; `check:cms-emojis` → **2703 zones lues, 0 emoji rendu**.
- **Périmètre élargi (même jour)** : le contrôle ne lisait que `cms_editable_zones`. Or **trois autres tables sont rendues** et n'étaient scannées par rien : `cms_blog_posts` (article `published = true`, lu par `getPostBySlug`), `cms_sub_destinations` (`is_active`, lu par `fetchSubDestinations`), `cms_guide_items` (`is_active`, lu par la page guide). Mesure : **18 articles** portent un emoji (les 18 en `draft`), **0** rendu. Un article publié à emoji serait passé avec la CI verte. Le garde-fou couvre désormais les **4 tables rendues** (`2703 → 2803 lignes lues`), avec `classerLignes`/`emojisDeco` exportées et testées (10 tests).
- **Corroboré par le CLI** : `supabase db push --dry-run --linked` (avec `SUPABASE_ACCESS_TOKEN=$supabase_access_token`) liste **exactement les 2 mêmes** migrations. Deux mesures indépendantes, aucun push.
- **Deux corrections de cadrage (revue du propriétaire, 26/10)** :
  - **Le second `UPDATE` de la migration a été retiré.** Il visait les marques « ✓ » et « ⚠ » en tête de texte, mais ne touchait déjà plus aucune ligne. Une migration est un événement ponctuel, pas un filet de sécurité : détecter une zone recréée avec un emoji est le rôle du garde-fou, qui tourne à chaque CI. Il ne reste que le premier `UPDATE` (la zone ⌛).
  - **Exception étroite pour les objets d'email.** `app/api` est scanné par `check-design-tics`, or le brief `docs/BREVO_SEQUENCE.md` prévoit « Ton guide est là 🌿 » comme objet du premier email : sans exception, le premier email à emoji ferait rougir la CI. `EMAIL_SUBJECT_EMOJI_ALLOWLIST` (🌿 seul) ne s'applique qu'à une ligne définissant un `subject`, et **seulement dans `app/api`**. Le **corps** des emails et le contenu du site restent refusés (6 tests : objet accepté, corps refusé, emoji hors allowlist refusé, hors `app/api` refusé, dans `lib/` refusé).
- **Preuve décisive — le HTML RÉELLEMENT SERVI** : mesure sur serveur de dev, maintenance **maintenue active** (`307 -> /maintenance` sans en-tête ; `maintenance_mode = true` en base, règle #4). Avec l'en-tête `x-maintenance-bypass`, **15 pages** ont été lues (accueil, les 8 articles publiés, madère, monténégro, roumanie, guide Madère, **sicile-syracuse**, sicile) : **0 emoji décoratif** dans le HTML (hors `<script>`), y compris sur la page de la zone `⌛` — ce qui prouve que la zone inactive n'est pas rendue. C'est la mesure que le projet exige, indépendante de ma lecture de la base.

- **Hors périmètre, assumé** : `lib/content-taxonomy.ts` porte des emojis de mois (❄️ 🌸 🔥…) et `cms_media`/`map_markers`/`cms_pillar_pages`/`cms_testimonials` sont propres. `content-taxonomy.ts` est un fichier de **données de référence** en liste blanche documentée de `check-design-tics` (182 signalements légitimes si on scannait tout `lib/`), et n'est importé par aucun composant public — ne pas le « purger ».

- **Écart de migrations (lecture seule)** : **206 locales / 204 distantes / 204 communes → 2 en local seulement** (`20261025190000_reglages_logo_entete.sql` du lot précédent, + `20261025200000` ci-dessus). **0 distante sans fichier**, aucune dérive. **Rien poussé.**

## [2026-10-25 terdecies] — Les libellés des zones enfin visibles dans l'admin

- **Le constat** : `cms_editable_zones.label` et `description` existaient depuis toujours mais n'étaient **lus par personne**. L'admin n'affichait que la clé technique (`header_logo_display`), et les 2 122 zones qui ont un libellé (`Newsletter — Titre`, `Pictogramme 1 — texte`…) le cachaient. Le propriétaire devait donc deviner à quoi servait une clé — le contraire de « tout modifier depuis le CMS ».
- **`lib/content-loader.ts`** + **`app/api/cms/zones/route.ts`** : `CmsZone` porte désormais `label` / `description`, et le `select` les ramène (ils étaient absents de la requête, donc perdus même quand la base les avait).
- **`components/admin/EditableZonesManager.tsx`** : le libellé s'affiche au-dessus de la clé (masqué quand il ne fait que répéter la clé — 2 122 libellés, dont beaucoup valent la clé brute). Une valeur **vide** montre désormais « Vide — repli du code » et la description, au lieu d'une case grise muette : c'est le cas des réglages logo, volontairement vides.
- **Vérifié** : `garde-fous` **19/19** ; `tsc` 0 ; `next build` OK. **API mesurée** : `GET /api/cms/zones?page=maintenance` → HTTP 200, 9 zones, **9 avec `label`** (`cta_label` → « Bouton Instagram »).
- **Effet immédiat** : les réglages logo déclarés par `20261025190000_reglages_logo_entete.sql` s'afficheront avec leur libellé et leur aide de saisie une fois la migration appliquée — sans quoi la déclaration seule restait muette.

## [2026-10-25 duodecies] — Emplacement du logo éditable, et les trois réglages déclarés dans l'admin

- **Le trou** : `header_logo_display` manquait. Le sceau et le nom du site étaient **toujours** affichés côte à côte (balises en dur dans `components/Header.tsx`) : le propriétaire ne pouvait pas choisir « sceau seul », « nom seul » ou « les deux ». C'est exactement l'« emplacement du logo » demandé.
- **`lib/cms-size.ts`** : `parseLogoDisplay` — liste fermée `both` / `icon` / `text`, **défaut `both`** (l'état actuel). Une valeur absente ou fautive ne fait jamais disparaître le logo.
- **`Header.tsx`** : le sceau est conditionné à `logoDisplay !== 'text'`, le nom à `logoDisplay !== 'icon'`.
- **Migration `20261025190000_reglages_logo_entete.sql`** : déclare `header_logo_height`, `header_logo_width` et `header_logo_display` (page `global`, type `text`, **valeur vide**, avec `label` et `description`). Motif : l'admin ne liste que les zones `is_active = true` — sans ligne, il fallait taper la clé exacte à la main. **Valeur vide = aucun changement visible** (`getCmsOrSetting` traite la chaîne vide comme absente), les tailles du code restent la référence. Idempotente (`ON CONFLICT DO NOTHING`).
- **Vérifié** : `npm run garde-fous` **19/19** ; `vitest` **1026/1026** (123 fichiers) ; `tsc` 0 erreur ; `next build` OK. **Rendu par défaut inchangé, mesuré dans le HTML servi** (serveur de dev, contournement maintenance par en-tête) : `<svg viewBox="-69.5 0 341 341">` **et** `<span>Heldonica</span>` sont tous deux présents.
- **Test qui mord** : `__tests__/components/Header-logo-display.test.tsx` (4 cas). Conditions retirées → **2 échecs** ; restaurées → 4/4.
- **Non appliquée** : la migration n'est **pas** poussée — le lot demandait la lecture seule avant tout `db push`. `db push --dry-run` confirme **une seule** migration en attente (la mienne), et son SQL est validé par `EXPLAIN` (arbitre d'unicité correct, 3 lignes), **sans écriture** : `header_logo*` ne contient toujours que l'ancienne ligne `header_logo_url` (inactive).

## [2026-10-25 undecies] — Cadrage des photos éditable depuis l'admin (chaînon manquant du lot 2)

- **Le constat** : le lot 2 pilotait le cadrage **au rendu** (`EditableZone` lit `<zone>_fit` / `_ratio` / `_position`), mais `components/admin/EditableZonesManager.tsx` ne proposait qu'un menu déroulant de types. Le propriétaire ne pouvait donc **rien régler sans écrire de SQL** — la fonctionnalité existait sans porte d'entrée.
- **`lib/image-framing.ts`** : traduit les trois réglages saisis dans le formulaire en écritures de zones, **validées avec les mêmes règles que le rendu** (`lib/image-adjustment.ts`). Un champ vidé **désactive** la zone compagne (`is_active = false`), convention du projet pour retirer un réglage sans supprimer la ligne. Une valeur refusée ne produit **aucune** écriture : on préfère ne rien enregistrer plutôt qu'un cadrage qui ne s'appliquera pas, et l'erreur est remontée à l'utilisateur.
- **`EditableZonesManager.tsx`** : bouton « Cadrage » sur les zones de type `image`, panneau prérempli depuis les zones compagnes existantes (remplissage, proportions, position).
- **Tests** : **7** (`__tests__/lib/image-framing.test.ts`) — normalisation (`16:9` → `16 / 9`), désactivation par champ vide, refus sans écriture, tentative d'injection CSS.
- **Vérifié** : `npm run garde-fous` **19/19** ; `next build` OK (170 pages) ; `tsc` 0 erreur ; `check-cms-zones` connaît déjà les zones compagnes (pas d'orpheline).
- **Non vérifié** : le pilotage **dans l'admin** n'a pas pu être exercé — l'authentification CMS échoue **fermée** sans `CMS_PASSWORD` (absente de l'environnement local), et je n'écris pas en base de production. La preuve est l'aller-retour statique : les clés écrites (`<zone>_fit/_ratio/_position`, page = celle de l'image) sont exactement celles lues par `EditableZone` (ligne 65).
- **Reste (lots 4-5)** : blocs et templates hors blog (`cms_content_blocks` vide, jamais lue ni écrite ; le blog persiste ses blocs en HTML), 10 pages sans CMS, `PAGE_DEFAULTS`.

## [2026-10-25 decies] — Câblage CMS, lot 2 : taille du logo et cadrage des photos

- **Taille du logo pilotée par le CMS** (`components/Header.tsx`) : `header_logo_height` / `header_logo_width`, appliquées aux **deux** branches du logo — l'image (`header_logo_url`) et le **SVG de repli**, qui est ce que le site sert réellement aujourd'hui (`header_logo_url` est vide en base). Sans ces zones, `h-8 w-auto` et `h-7 w-7` restent la référence : rien ne change tant que le CMS n'est pas renseigné.
- **Cadrage des photos** (`components/inline-edit/EditableZone.tsx`) : une zone `image` lit trois zones compagnes optionnelles — `<zone>_fit` (`cover`/`contain`), `<zone>_ratio` (`16/9`, `4/3`, `1/1`…), `<zone>_position` (`top`, `center`, `50% 20%`…). Elles produisent `object-fit`, `aspect-ratio` et `object-position`. **Aucun des 8 sites d'appel n'a été modifié** : le réglage passe par des clés, pas par des props.
- **Validation extraite et testée** : `lib/image-adjustment.ts` et `lib/cms-size.ts` portent la validation (listes fermées, entier simple borné). Ces valeurs finissent dans un attribut `style` ; une chaîne libre venue du CMS serait injectée dans la page. **20 tests unitaires** couvrent l'acceptation, le rejet et les tentatives d'injection.
- **Preuve de bout en bout** (serveur de dev, cache vidé) : image activée + trois réglages → le HTML porte `style="aspect-ratio:16 / 9;object-position:top;object-fit:contain"` (`16:9` normalisé en `16 / 9`). Logo réglé à 40×48 → `style="height:40px;width:48px"`. Une valeur piégée (`top; background:url(evil)`) est **rejetée** : absente de tout attribut `style`, seul le `object-fit` valide subsiste. Base **restaurée à l'identique** (2 703 lignes).
- **Garde-fou réparé** (`scripts/check-cms-zones.mjs`) : le lot 1 avait supprimé `CONSUMED_ZONE_KEYS`, ce qui faisait afficher « filtre introuvable — vérification ignorée » et **désactivait en silence** le contrôle des clés non servies. Il distingue désormais « filtre absent » (sans objet) de « filtre illisible » (anomalie, exit 1), et reconnaît les zones compagnes d'image pour ne pas les compter comme orphelines. **Vérifié par échec provoqué** : un filtre restreint réintroduit fait tomber le contrôle (155 clés signalées, exit 1).
- **Vérifié** : `npm run garde-fous` **19/19** ; `next build` OK ; `tsc` 0 erreur.
- **Reste (lots 3-5)** : blocs et templates hors blog, 10 pages sans CMS, `PAGE_DEFAULTS` (3e source fossile).

## [2026-10-25 nonies] — Câblage CMS, lot 1 : le menu et les zones ne sont plus figés dans le code

- **Verrou levé dans `lib/site-content.ts`** : la liste blanche `CONSUMED_ZONE_KEYS` filtrait la requête des zones `global`. Toute clé absente de cette liste était **invisible du site**, même créée depuis le CMS — c'est ce qui obligeait à passer par un développeur pour ajouter une entrée de menu. La requête charge désormais **toutes** les zones actives de la page `global`. Fichier : 245 → 78 lignes.
- **Mesuré avant de retirer** : les **156** zones actives de `global` figuraient **toutes** dans la liste — elle ne retirait donc rien, elle ne bloquait que les suivantes. Le « +80 Ko de HTML » redouté visait les 2 703 zones de toutes les pages, pas le global (3 932 octets de valeurs).
- **Plafond du menu 5 → 8** (`components/Header.tsx`, `NAV_MAX_ITEMS`). Au-delà, l'entrée n'est pas affichée ; il borne la largeur sur mobile.
- **Bouton « Nouvelle zone »** dans `components/admin/EditableZonesManager.tsx` (page, clé, type contraint à `text|textarea|html|image|icon|cta`, valeur). L'API `POST /api/cms/zones` savait déjà créer — il manquait l'interface.
- **Test de non-régression** (`__tests__/lib/site-content.test.ts`) : une zone neuve, absente de toute liste écrite dans le code, doit remonter. **Vérifié par échec provoqué** — en réintroduisant le filtre, le test tombe.
- **Preuve de bout en bout** : une entrée `nav_item_8` créée **uniquement** en base (clé jamais présente dans le code) s'affiche dans le menu, sur page dynamique puis après revalidation ISR de l'accueil. **Coût mesuré : +1,7 Ko** pour deux entrées. État de la base **restauré à l'identique** après le test (2 703 lignes, 156 actives inchangées).
- **Vérifié** : `npm run garde-fous` **19/19** ; `next build` OK (170 pages) ; `tsc` 0 erreur.
- **Reste (lots 2-5)** : logo (taille/place en dur), cadrage des photos, blocs et templates hors blog, 10 pages sans CMS, `PAGE_DEFAULTS` (3e source fossile). Plan local : `.audit/audit-editorial-2026-10-20/PLAN-cablage-cms.md`.
## [2026-10-25 octies] — Site public en mode maintenance (demande du propriétaire)

- **`supabase/migrations/20261025180000_activation_mode_maintenance.sql`** : passe `site_settings.maintenance_mode` à `'true'`. **Appliquée** via CLI `supabase db push --linked`.
- **Motif** : incohérences éditoriales relevées par l'audit du 2026-10-20 (photos mal attribuées, images de partage génériques, légendes en base contradictoires). Décision de mise en ligne du propriétaire, prise le 25/10.
- **Écart local/distant vérifié À ZÉRO avant push** : `supabase migration list --linked` = 203 lignes, **0 en attente**, **0 orpheline**, 0 divergence. Une seule migration poussée.
- **Vérifié après application** : `maintenance_mode = 'true'` ; migration journalisée (`20261025180000`) ; **204** migrations en base ; `site_settings` = **207 lignes** (aucune ajoutée ni supprimée).
- **Vérifié sur le site** : `/`, `/destinations`, `/guides`, `/a-propos`, `/travel-planning`, `/expert-hotelier`, `/destinations/madere`, `/blog` → **307 vers `/maintenance`**. Pages exclues intactes : `/admin` (308), `/panel-manager` (401), `/mentions-legales` et `/politique-confidentialite` (200).
- **Rappel** : la source de vérité est la base (`middleware.ts` → `getMaintenanceMode()`). La variable Vercel `MAINTENANCE_MODE` ne sert qu'en secours si Supabase est injoignable. **Pour remettre en ligne : nouvelle migration repassant la clé à `'false'`.**

## [2026-10-25 septies] — Image de partage du guide Madère : Pico do Arieiro (migration prête, non appliquée)

- **`supabase/migrations/20261025160000_og_guide_madere.sql`** : une instruction, remplace `/og-default.jpg` par `pico_do_arieiro.jpg` sur la zone `guides-top-10-pepites-madere` / `seo_og_image`. La page est publiée et indexable, `buildPageMetadata` lit la zone et prime sur le repli codé en dur.
- **Pico do Arieiro (pépite n°5) retenu** par le propriétaire. `fanal_foret` écarté (Fanal n'est pas une des 10 pépites du guide) ; `porto_moniz` (pépite n°3) était l'alternative.
- **Vérifié sans écrire** : requête rejouée avec `AND false` → HTTP 200, 0 ligne touchée (syntaxe et colonnes valides) ; cible = 1 ligne ; zone toujours `/og-default.jpg` en base.
- **Aucun `db push`** : la migration est prête mais pas appliquée — l'application attend un feu vert explicite.

## [2026-10-25 sexies] — Archivage de `EMERGENCY_FIX_20260602.sql` (hors dossier des migrations)

- **`supabase/migrations/EMERGENCY_FIX_20260602.sql` déplacé vers `supabase/archive/`** (`git mv`, SQL inchangé, en-tête d'archive ajouté). Aucune écriture en base.
- **Pourquoi déplacer et non renommer** : le CLI l'ignorait déjà (« Skipping migration… file name must match pattern »), son effet en base était donc nul. Le **renommer** au format `<timestamp>_nom.sql` l'aurait fait entrer dans le registre des migrations en attente — le prochain `db push` l'aurait **rejoué** (il porte 3 articles `test-article-*`). Le déplacer est le geste sûr.
- **Vérifié** : `check:cms-migrations` vert (les tables `site_settings` et `cms_blog_posts` restent couvertes par 25 et 57 autres migrations) ; `check:cms-drift` vert ; `check:content-html-escapes` vert ; `npm run garde-fous` **19/19**.

## [2026-10-25 quater] — Suppression du code mort E-E-A-T

- **`lib/cms-seo-eeat.ts` supprimé** (196 lignes) ainsi que son test orphelin `__tests__/lib/cms-seo-eeat.test.ts`. Ses 3 exports (`auditArticleEeat`, `generateAccommodationJsonLd`, `generateArticleJsonLd`) n'étaient appelés par **aucun** composant, route ou script de production — la seule référence restante était son propre test, qui les testait en vase clos. Le correctif de logo de l'entrée précédente vivait dans ce fichier : il ne pouvait donc rien changer au rendu.
- **`components/JsonLd.tsx` reste la seule source du JSON-LD servi** (`/images/badges-heldonica.svg`, HTTP 200). Aucun changement de sortie visible.
- **Vérifié** : `tsc` 0 erreur ; `vitest` **119 fichiers / 997 tests** verts. `grep` exhaustif (ts/tsx/mjs/json) : 0 référence hors CHANGELOG et hors le test supprimé.

## [2026-10-25 ter] — Lot 1 : images locales mortes (Madère, Suisse, Roumanie) + garde-fou

- **Défaut structurel corrigé** : 19 chemins d'image locaux (`/images/…`) étaient référencés dans le code **sans fichier dans `public/`**. Les pages répondaient 200, mais le hero restait vide et le `image:` du JSON-LD (`TouristDestination`, lu par Google) pointait une **URL en 404**.
  - **Madère** (`porto-moniz`, `ponta-do-sol`, `achadas-da-cruz`) : `heroImage` + `images` OG repointés sur le bucket `media/destinations/madere/` (5 photos réelles, HTTP 200 vérifié).
  - **Suisse** (`/destinations/suisse`, `DestinationPage` slug `suisse`) : repointés sur `blog-images/stoos-01.jpg` / `stoos-02.jpg` — les **seules** photos suisse qui existent.
  - **Roumanie** (`sibiu`, `bucarest`) : repointés sur `media/destinations/roumanie/` (mêmes noms de fichiers, présents dans le bucket).
  - **`lib/cms-photo-albums.ts`, `lib/cms-templates.ts`** : 13 chemins morts nettoyés (noms de fichiers de gabarit jamais livrés → photo réelle du même lieu, ou nom présent dans le bucket).
  - **`lib/cms-seo-eeat.ts:192`** : `logo` schema.org pointait `/images/logo-heldonica.png` (**404**) → `/images/branding/logo-seal.jpg` (200).
- **Nouveau garde-fou `scripts/check-image-paths.mjs`** : refuse tout chemin d'image **local** (`/images/…`, avec ou sans l'origine `heldonica.fr`) sans fichier correspondant dans `public/`. Il aurait attrapé les 19. Ignore les URL d'un autre domaine (cdnjs, unpkg, `*.supabase.co`) et les `placeholder` de formulaire. Câblé dans `scripts/garde-fous.mjs` (**18 → 19 contrôles**), `package.json` (`check:image-paths`) et `.github/workflows/garde-fous.yml`. **Preuve qu'il mord** : réintroduire `/images/destinations/madere/porto_moniz.jpg` fait échouer le contrôle (exit 1) sur `porto-moniz/page.tsx:58` ; restauré, il repasse vert.
- **4 chemins en dette connue, documentés dans le script** : `lib/cms-photo-albums.ts` référence 4 photos suisse (`IMG_20250712_*`, `AGC_*`) **qui n'ont jamais été livrées** (absentes du dépôt, de git et de tous les buckets). Les 4 photos réelles de Suisse (`stoos-01..04.jpg`) existent, mais leur correspondance avec les 4 légendes (Fronalpstock, Muotathal, coucher, nuit) est **invérifiée** — deux fichiers du bucket sont d'ailleurs **byte-identiques** (`sha256` égaux), donc décrire l'un comme « coucher » et l'autre comme « nuit » serait inventer. **Réattribution par le propriétaire.**
- **Coquille d'URL corrigée** : `smxnruefmrmfyf`**`m`**`uxygq` → `smxnruefmrmfyf`**`h`**`uxygq` dans `lib/cms-vault-spots.ts:575` **et** son miroir mobile `heldonica-mobile/…/knowledge_vault.json` (le projet fautif n'existe pas). La migration `20261018220000` qui *détecte* la coquille est laissée telle quelle (témoin historique).
- **Vérifié** : `check:image-paths` vert (14 chemins locaux présents, 4 dettes) ; `garde-fous` **13/13** en preflight ; `tsc` **0 erreur** ; 39/39 tests des modules touchés ; les 11 URLs Storage écrites + le logo répondent **200**.
- **Non vérifié** : le rendu visuel (pas de navigateur) ; l'effet après ISR sur les pages publiées. **Aucune écriture en base**, aucun `db push`.
- **Écarté volontairement** : `cms-templates.ts` porte un `alt`/`caption` « cour intérieure » sur une photo de forêt — **incohérence préexistante**, hors périmètre (signalée, pas corrigée).


  ## [2026-10-25 bis] — Traçabilité des migrations #622 + 2 correctifs de contenu

- **Défaut structurel** : 4 migrations dont l'**effet est en base** depuis le 18–20/10 n'existaient dans **aucun fichier de `main`**. Une base reconstruite depuis le dépôt n'aurait pas retrouvé ces états — violation de la règle absolue n°2 (« toute écriture passe par une migration versionnée »). Elles venaient de la branche #622 (`ddfd7e26`), jamais fusionnée.
- **Les 4 migrations tracées** (fichiers ajoutés, **effet vérifié en base** avant dépôt) : `20261018160000` témoignages fictifs (5 lignes, **0 active**), `20261018180000` doublons Stoos (**4 lignes, toutes `draft`**), `20261018200001` photos d'enfants (**8 fiches `cms_media` en `prive/enfants/`**, alt « PRIVÉE »), `20261020130000` mots bannis (**les 6 contrôles du fichier renvoient 0**).
- **Leur trace est posée par `migration repair --status applied`**, jamais par un rejeu : les fichiers ne sont pas purement idempotents (déplacements de fichiers, `UPDATE` de statut).
- **Collision de version résolue** : dans #622, **deux** fichiers portaient `20261018200000` (`brouillon_articles_photo_fausse`, seul journalisé, et `photos_enfants_bucket_prive`). Une version ne peut porter qu'une entrée — le CLI en aurait **ignoré un en silence**. Le second est renommé **`20261018200001`**.
- **2 migrations non appliquées, corrigées à la source** : `20261018235500` (`Évoramonsaraz` → `Évora et Monsaraz`, `agritourismes` → `agritourisme`) et `20261019120000` (**5** chaînes : `falaises bretonnes` → `normandes`, `Fagnes blanches` → `Falaises blanches`, `viñedos` → `vignobles`, `architecture barcelonaise` → retiré, `propietario` → `propriétaire`). **Pages publiées, valeurs fautives mesurées en ligne** (`/destinations/carte` servait `Fagnes`, `viñedos`, `barcelonaise` ; `/guides/top-10-pepites-madere` servait `propietario`).
- **Volontairement écartées** : `20261018170000` (périmée, réintroduirait des emojis) et `20261020120000` (remplacée par `20130000`).
- **Vérifié** : `db push --dry-run --include-all` liste **exactement** les 6 fichiers attendus, rien d'autre.

## [2026-10-25] — Revue des 92 PR ouvertes : 12 fusionnées, 2 défauts en ligne corrigés

- **Contexte** : 92 PR ouvertes, dont **67 brouillons** (ignorées par le moteur de fusion) et 59 en conflit. Le gisement réel était **14 non-brouillons sans conflit**, toutes mesurées par `git merge-tree --write-tree origin/main <sha>` (pas l'API), puis **vérifiées 17/17 sur `main` courant** en appliquant leur diff (`git apply --3way`) plutôt qu'en testant leur branche brute — six d'entre elles échouaient d'abord **par vieillissement** (« Zones CMS orphelines » lit la base, qui a changé), pas par défaut.
- **Deux défauts actifs corrigés et mesurés en production** :
  - **#696 — XSS dans `EditableZone`** (`components/inline-edit/EditableZone.tsx`). Le composant rendait du contenu CMS via `dangerouslySetInnerHTML` **sans assainissement**, alors que `sanitizeHtml` était déjà branché sur `/blog/[slug]` et `CmsAdminClient`. **Contre-épreuve** : en restaurant la version `main` du fichier en gardant le test, les **2 tests rougissent** (`<img src="x" onerror="alert(1)">` passait). Fusion `56686feb`.
  - **#480 — prix faux dans les données structurées**. `/travel-planning` servait **deux** schémas `Service` contradictoires : celui de `layout.tsx` annonçait des « Pack Essentiel/Confort/Premium » à **150/250/350 €**, alors que la page affiche **Formule Essentielle 250 €** et **Complète 450 €** et que le bon JSON-LD vit dans `TravelPlanningClient`. **Mesuré en ligne après déploiement** : blocs `ld+json` **3 → 2**, aucun « Pack Confort » ni prix 150 € restant. Fusion `44f88032`.
- **Dix autres fusionnées** (toutes 17/17 sur `main`) : #481 (`/blog` et `/quiz` branchés sur `buildPageMetadata`), #651 (`npm run worktree` + hooks git, remède à l'incident du 19/10), #661 (refus Brevo journalisés sur contact, expert-hotelier, guides), #695 (ISR 1 h sur 5 pages destinations), #697 (N+1 dans `verify_drafts`), #698 (constante Instagram morte), #699 (2 composants Newsletter morts, **0 import** vérifié), #700 (libellés ARIA panneaux), #479 (audit contenu codé en dur), #688 (tests `HeldonicaVerdict`).
- **#688 nettoyée avant fusion** : la branche portait un `submit.py` (`print("Submitting via simulated tool")`), artefact de harnais sans rapport avec les tests. Retiré sur la branche (`1f6398f4`, `--force-with-lease`), puis fusion `77b1ea04`.
- **Écartées, avec la raison** : #597 (CI rouge « Zones et tables CMS ») ; #710 (titre « aria-label » mais **+7 699 lignes de `pnpm-lock.yaml`**, artefact — le projet est npm, `package-lock.json` suivi, `pnpm-lock.yaml` non).
- **Vérifié** : `garde-fous` **17/17** sur `main` (`77b1ea04`) ; CI GitHub `Types`, `Zones et tables CMS`, `notify` **vertes** ; Vercel **success** ; `/`, `/blog`, `/quiz` en **200**.
- **Non vérifié** : le rendu visuel des articles (pas de navigateur) ; l'effet de l'ISR #695 sur le TTFB (non mesuré avant/après) ; les 80 autres PR ouvertes, non instruites.

## [2026-10-24] — Lot 4 : emojis des légendes Instagram (rendu + données héritées)

  - **Défaut** : `publierEntreeFile` (`lib/instagram.ts`) publie la légende **stockée** telle quelle (`const caption = entree.caption || ''`). La file `instagram_scheduled_posts` contient **8 brouillons** au format hérité `📍 <ville> … 🌍 <url>` (09/2026) : valider un ancien brouillon depuis le panneau aurait envoyé les emojis sur le compte Instagram — contre la charte « carnet » (décision #682). Le correctif de code du lot 3 (#714) ne compose que les légendes **nouvelles** sans emoji ; il ne protège pas la relecture des brouillons déjà en file.
  - **Périmètre mesuré** (lecture seule, 24/10) : **8 lignes sur 8** de la table visées par le motif, toutes `status = 'draft'`, dont une avec un `📍` **orphelin** seul sur sa ligne (`3b7875df`). **0** ligne visée sans pin/globe/lien ; **0** résidu après un passage (idempotent). Le reste des 311 cellules à emoji de la base (tables `emilie_*`, 274 ; brouillons blog, 4 ; zone CMS inactive `highlight_2_emoji` `⌛`) n'est **pas servi publiquement** et sort du périmètre.
  - **Source du format** : sur `main`, `autoScheduleInstagramPost` (`lib/instagram.ts:425,429,430`) **génère encore** `📍 <titre> … 🌍 heldonica.fr … 🔗 heldonica.fr/blog/<slug>` — c'est la cause racine des 8 lignes. Corrigé par le lot 3 (#714, garde-fou sur `lib/` + purge des émetteurs). Le lot 4 ferme la fuite **résiduelle** : le rendu et la donnée déjà en file.
  - **Corrigé** :
    - **`lib/instagram.ts`** : `captionSansEmoji` retire les emojis décoratifs **au moment de publier** (même plage que `DECORATIVE_EMOJI_RE` du garde-fou, hors flèches typographiques et étoile pleine) ; une ligne qui ne portait qu'un emoji disparaît plutôt que de laisser un blanc ; les doubles espaces laissés par le retrait sont résorbés. Branché dans `publierEntreeFile`.
    - **Migration `20261024130000_purge_emojis_file_instagram.sql`** : nettoie la donnée en file, pour qu'un autre consommateur de la colonne (n8n, script) ne serve plus les emojis. **Appliquée** après feu vert (voir plus bas).
  - **Choix : corriger au rendu ET en base.** Le filtre de rendu couvre toute légende, ancienne ou future, sans dépendre d'une migration ; la migration nettoie la source pour les autres lecteurs. Même approche que les lots 2 et 2 bis.
  - **Vérifié** : `tsc` 0 erreur ; `vitest` **969/969** (113 fichiers, dont **7 tests neufs** sur les légendes **réelles** de la base) ; `garde-fous` **17/17**. SQL de la migration prévisualisé en lecture seule sur les 8 lignes réelles : suppression du `📍` orphelin et des repères, texte/liens/hashtags intacts.
  - **Écart de migration montré avant tout `db push`** : `schema_migrations` distant = **193** ; fichiers locaux = **194** (le 194ᵉ est `EMERGENCY_FIX_20260602.sql`, préfixe non numérique, ignoré par la CLI). **Écart = 0**, aucune migration distante sans fichier local. La nouvelle migration `20261024130000` est la seule non appliquée.
  - **Branche et PR** : `agent/openhands/lot4-instagram-emojis` → **PR #715**, **fusionnée** (`main` → `3b669ad3`) avec la PR #714 (lot 3). CI `Garde-fous` **verte** sur les deux commits de fusion (`8960a4ae`, `3b669ad3`).
  - **Migration appliquée et mesurée en base** (feu vert du fondateur) : statement exécuté via l'API Management, puis `20261024130000` enregistrée dans `supabase_migrations.schema_migrations`. Contrôle **après** écriture : légendes à emoji = **0** (était 8), total de lignes = **8** (aucune perdue), texte/liens/hashtags intacts. `schema_migrations` distant = **194** ; écart local/distant = **1**, soit uniquement `EMERGENCY_FIX_20260602.sql` (préfixe non numérique, ignoré par la CLI).
  - **Non vérifié** : l'effet en production — la file ne contient que des `draft`, rien n'a été publié ; le filtre n'agit qu'au moment d'un clic « Publier », qui n'a pas été déclenché.

  ## [2026-10-24] — Suppression de `missions` et `reservations_seances` (app tierce)

  - **Décision explicite du fondateur**, même session que les tables `emilie_*`. Les deux tables, **vides** (0 ligne), appartenaient à l'autre application qui partage la base (`20260730000004_security_rls_hardening.sql:7`).
  - **Aucun consommateur dans le code Heldonica** : aucune requête `.from('missions')` ni `.from('reservations_seances')`, aucune route API, aucune référence dans `app/`, `lib/`, `components/`, `scripts/`.
  - **Dépendances relevées avant écriture** : `missions.hotel_id` → `hotels(id)` on delete cascade ; trigger `missions_updated_at` ; les enums `mission_type` et `mission_statut` ne servaient qu'à `missions` (vérifié sur tous les schémas). Aucune FK entrante, aucune vue saine, aucune fonction.
  - **`v_pipeline_b2b` n'est PAS une dépendance** : la vue est déjà cassée (« infinite recursion detected in rules for relation `v_pipeline_b2b` » — elle se référence elle-même) et n'apparaît nulle part dans le code. **Non touchée**, hors périmètre.
  - **Sauvegarde préalable** (tables vides : le schéma, pas des données) : `.audit/backup-missions-reservations-2026-10-24/` — `snapshot.json` (colonnes, policies, grants, FK, RLS) + `recreation.sql` (DDL de recréation, enums et trigger inclus), `sha256(snapshot.json)` = `047921ef1dfc4114440ed7fbb5a35524b0959533d105a1f75bf169834f9be180`. Dossier gitignoré.
  - **Migration `20261024150000_suppression_missions_reservations_seances.sql`** : `drop table if exists … cascade` pour les deux, puis `drop type` pour les deux enums.
  - **Vérifié après application** : tables **2 → 0**, enums **0**, policies **0**. `GET /rest/v1/missions` et `/rest/v1/reservations_seances` → **404**. `GET /rest/v1/hotels` et `cms_editable_zones` → **200** (base intacte).
  - **Écart de migration** : `schema_migrations` distant = **196** ; écart local/distant = **1** (`EMERGENCY_FIX_20260602.sql`, préfixe non numérique, ignoré par la CLI).
  - **Branche et PR** : `agent/openhands/suppression-missions-reservations` → **PR #720**, **fusionnée** (`main` → `6ad7e4d2`). CI `Garde-fous` **verte**.
  - **Conséquence** : si l'application tierce les utilise encore, recréer le schéma avec `recreation.sql` ou la re-pointer vers son propre projet Supabase.

  ## [2026-10-24] — Suppression des 24 tables `emilie_*` (décision fondateur)

  - **Décision explicite du fondateur** : « je veux bien que tu le supprimes ». Les 24 tables `emilie_*` (385 lignes de contenu scolaire) ont été **retirées de la base Heldonica**.
  - **Sauvegarde préalable obligatoire** (suppression irréversible) : `.audit/backup-emilie-2026-10-24/` — `donnees.json` (385 lignes, toutes colonnes), `donnees.sql` (`INSERT` restaurables), `sha256(donnees.json)` = `c2d4a9049bd33df80b7c8d37cb15210714e43c7f3b90a202663124512f1e7db7`. Le dossier `.audit/` est gitignoré : la sauvegarde n'est **pas** dans le dépôt, elle vit sur le poste.
  - **Contrôles avant écriture** : aucune FK entrante depuis une table hors `emilie_*` ; aucune vue ni fonction ne les lit ; aucune référence dans `app/`, `lib/`, `components/`, `scripts/`.
  - **Migration `20261024140000_suppression_tables_emilie.sql`** : 24 × `drop table if exists … cascade`, idempotente. `cascade` emporte les 24 séquences, les 4 FK internes et les 25 policies.
  - **Vérifié après application** : tables `emilie_*` **24 → 0**, séquences **0**, policies **0**, grants `anon` **0**. `GET /rest/v1/emilie_dictees?select=titre&limit=1` → **HTTP 404** (était 200 : les données scolaires d'une enfant étaient lisibles publiquement). Le reste de la base est intact (`cms_editable_zones` → **200**).
  - **Écart de migration** : `schema_migrations` distant = **195** ; écart local/distant = **1**, soit uniquement `EMERGENCY_FIX_20260602.sql` (préfixe non numérique, ignoré par la CLI).
  - **Branche et PR** : `agent/openhands/suppression-emilie` → **PR #718**, **fusionnée** (`main` → `e59442ad`). CI `Garde-fous` **verte**.
  - **Conséquence à connaître** : si l'autre application utilise encore ces tables, elle recevra désormais une erreur. Restaurer depuis `donnees.sql`, ou la re-pointer vers son propre projet Supabase. Les tables `missions` et `reservations_seances` (mêmes tables partagées) n'ont **pas** été touchées.

  ## [2026-10-24] — Données `emilie_*` : constat initial (avant décision)

  - **Constat, pas une action.** 24 tables `emilie_*` (385 lignes) vivent dans la base Heldonica : contenu scolaire (dictées, poésies, leçons, calcul mental). Elles appartiennent à **une autre application** qui partage la base — documenté dans `20260730000004_security_rls_hardening.sql:7` (« Base partagée avec une autre application (tables `emilie_*`, missions, reservations_seances) ») et `20261021130000_index_fk_manquantes.sql:23`.
  - **Aucune suppression effectuée.** Le dépôt l'interdit : « Ne jamais supprimer des données de l'utilisateur sur la foi d'un nom ou d'un préfixe » (AGENTS.md). Ces 385 lignes appartiennent à une application tierce ; les détruire la casserait. **Décision humaine requise.**
  - **Défaut réel mesuré, lui** : les 24 tables sont **lisibles avec la clé `anon` publique**. RLS est activée sur les 24, mais chacune porte une policy `SELECT USING (true)` pour le rôle `public` — RLS sans policy restrictive n'empêche rien. **Vérifié en direct** : `GET /rest/v1/emilie_dictees?select=titre,texte` → **HTTP 200** et renvoie le contenu. Ce sont des données rattachées à une personne mineure.
  - **Ce qui n'est PAS en cause** : `missions` et `reservations_seances` (les deux autres tables de l'app partagée citées par la migration) sont **vides** (0 ligne) ; 3 des 24 `emilie_*` sont vides (`emilie_exercices`, `emilie_lecons`, `emilie_progression`).
  - **Reste à décider (humain)** : soit fermer l'accès `anon` (retirer les policies `USING (true)`, garder le `service_role` pour l'autre app), soit déplacer ces tables dans un projet Supabase distinct. Les deux gestes touchent une application tierce : à arbitrer par le fondateur, pas par un agent.

## [2026-10-24] — Lot 3 : le garde-fou emoji couvre enfin `lib/` (agent/openhands/lot3-lib-emoji)

- **Contexte** : la branche `agent/openhands/emoji-lib-instagram` (commits du 23/10) avait corrigé trois fuites d'emojis dans `lib/`, mais **n'a jamais eu de PR** — le correctif dormait, orphelin, depuis un jour. Rapatriée par rebase sur `main` (conflit unique sur `CHANGELOG.md`, résolu en conservant les deux entrées à leur place chronologique).
- **Le trou, mesuré avant d'être bouché** : `API_EMOJI_TARGETS = ['app/api']` — le garde-fou ne lisait **jamais** `lib/`, d'où la fuite de `lib/instagram.ts`. L'audit proposait de « l'étendre à `lib/` ». **Prise au pied de la lettre, cette consigne est fausse** : mesuré le 24/10, scanner tout `lib/` produit **182 signalements**, presque tous légitimes — table de conversion emoji → icône (`cms-icons.ts`, 88 lignes), données de référence (`cms-vault-spots.ts`, `cms-slow-taxonomy.ts`, `content-taxonomy.ts`), invites de rédaction (`brand-voice.ts`), notifications Slack internes (`webhook-dispatcher.ts`), libellés d'administration (`cms-revisions-diff.ts`). Les refuser interdirait des fichiers qui n'affichent rien au visiteur.
- **Corrigé, autrement** : nouvelle liste blanche `LIB_EMOJI_TARGETS` — les **six modules `lib/` qui publient** (`instagram.ts`, `cms-blocks-converter.ts`, `markdown-to-html.ts`, `zone-text.ts`, `html-attributes.ts`, `cms-draft-from-evidence.ts`) — et `runLibEmojiCheck()`, câblé dans `main` à côté du contrôle `app/api`.
- **Exemption des emojis consommés** : `htmlToBlocks` doit rester tolérant au HTML historique déjà publié (`.replace('📍','')`) ; refuser ces lignes forcerait à casser la relecture des articles existants. `skipConsumedEmojis` épargne les seules opérations de **lecture** (`replace`, `includes`, `split`, `match`, `test`…) ; un gabarit ou une affectation qui contient l'emoji reste refusé.
- **Preuve que le garde-fou mord** (pas seulement qu'il passe) : rejoué sur le `lib/instagram.ts` de `main`, il signale **3 violations** (L425 📍, L429 🌍, L430 🔗) — il aurait donc attrapé la régression d'origine ; sur l'arbre corrigé, **0**. 4 tests neufs couvrent les deux sens (refus d'un emoji émis, épargne d'un emoji consommé).
- **Non couvert, à dessein** : un module `lib/` **nouveau** n'est pas scanné par défaut. Ce garde-fou protège la non-régression des chemins de publication connus ; il ne dispense pas de relire un module ajouté. Écrit dans le commentaire de `LIB_EMOJI_TARGETS`.
- **Vérifié** : `garde-fous` **17/17**, `tsc` 0 erreur, `vitest` vert (32/32 sur `check-design-tics.test.ts`). Écart de migrations mesuré en lecture seule : **0** (voir ci-dessous).
- **Branche et PR** : `agent/openhands/lot3-lib-emoji` → **PR #714**, 4 commits au-dessus de `main` (le correctif `lib/`, ses tests, les deux entrées de journal).

## [2026-10-24] — Écart de migrations re-mesuré : nul (lecture seule, Management API)

- **Test demandé** : `POST /v1/projects/smxnruefmrmfyfhuxygq/database/query` avec `$SUPABASE_ACCESS_TOKEN` (majuscules) → **HTTP 201** `[{"ok":1}]`. **Fonctionne.** (Les deux secrets font désormais 44 caractères ; les mesures précédentes qui voyaient 401 sur la forme majuscule ne se reproduisent plus.)
- **Mesure** : **193 migrations distantes** (`supabase_migrations.schema_migrations`) contre **194 fichiers locaux**. Le différentiel apparent est un artefact de nommage, pas un écart réel :
  - **180** fichiers versionnés (`\d{14}_`) → tous appliqués. **0 local sans remote.**
  - **13** fichiers à préfixe court (`02_enable_rls`, `20250608_email_sequences`, … `20260802_cms_destinations_zones`) → les 13 sont dans le registre sous leur préfixe. **0 orpheline.**
  - **1** fichier hors convention, `EMERGENCY_FIX_20260602.sql` : ignoré par le CLI (« file name must match pattern »). Son **effet est en base** — vérifié : `site_settings` existe, la clé `maintenance_mode` vaut `false`. Idempotent (`IF NOT EXISTS` / `ON CONFLICT DO NOTHING`).
- **Conclusion : rien à pousser.** Aucun `db push` lancé, aucun nécessaire.
- **Rappel de règle** : le mode maintenance est **piloté intentionnellement** (`maintenance_mode = false` en base) — non touché.

## [2026-10-24] — Lot 2 bis : guillemets échappés dans les balises (antislash littéral)

- **Défaut** : `sql/seed_cms_zones_complete.sql:49` écrivait `Un art du voyage <span class=\"italic text-eucalyptus\">autrement</span>` — réflexe JS/JSON — dans une chaîne SQL entre guillemets simples, où l'antislash **reste littéral**. Le HTML servi portait donc `class=\"…\"`. **Mesuré au parseur (jsdom)** : `<span class=\"italic text-eucalyptus\">` donne `class="\"italic"` **et** un attribut parasite `text-eucalyptus\"` — la classe Tailwind est perdue. « autrement » s'affichait sans italique ni eucalyptus, **sans aucune erreur visible**. **Confirmé en production** (`www.heldonica.fr`, corps rendu, hors `<script>`).
- **Périmètre mesuré** (641 colonnes texte de `public` balayées en lecture seule) : **une seule ligne fautive** — `cms_editable_zones` `home`/`section_story_title`, **active**, donc en ligne. `cms_blog_posts.content` : 0. Les 22 autres lignes de `cms_editable_zones` qui contiennent `\"` le portent **en prose** (libellés du quiz), où l'antislash est légitime et n'est pas touché.
- **Hors périmètre, à dessein** : la clé `home_cat_icons` de `site_settings` (type `json`) porte des tracés SVG où `\"` est un échappement **valide**. Vérifié : la substitution rend le JSON invalide (`json.loads` échoue). Le nettoyage reste donc limité aux deux tables de contenu, comme la migration précédente.
- **Corrigé** :
  - **`lib/html-attributes.ts`** : `normalizeHtmlAttributes` retire désormais l'antislash devant un guillemet **à l'intérieur d'une balise** (`<[^<>]*>`, donc jamais en prose). Branché sur les deux points d'injection existants (`normalizeZoneText`, `markdownToHtml`), il couvre d'un geste les valeurs stockées **et** les fallbacks.
  - **`components/NewsletterForm.tsx:208`** : `dangerouslySetInnerHTML` injectait `headingBlog` (valeur CMS brute) **sans** normalisation — trou du correctif précédent, désormais passé par `normalizeZoneText`.
  - **`sql/seed_cms_zones_complete.sql:49`** : cause racine corrigée (`\"` → `"`).
  - **Migration `20261024110000_purge_guillemets_echappes.sql`** : nettoie la base. `[^<>]*?` (non glouton) borne le remplacement à l'intérieur d'une balise ; le motif ne franchit jamais `<` ni `>`, donc un antislash en prose reste intact. Prévisualisé en lecture seule : **1 ligne** (la zone de l'accueil), 0 article.
  - **Garde-fou anti-récidive** : nouveau `scripts/check-content-html-escapes.mjs` (contrôle 17), câblé dans `garde-fous.mjs` et la CI. Refuse un `\"`/`\'` **dans une balise** d'un fichier SQL de contenu ; ignore les commentaires SQL (`--`), où citer le défaut est normal.
- **Vérifié** : `tsc` 0 erreur ; `vitest` **961/961** (112 fichiers, dont 5 tests neufs sur les guillemets échappés) ; `garde-fous` **17/17**. Preuve du défaut au parseur (jsdom) : `class="\"italic"` + attribut parasite contre `class="italic text-eucalyptus"` attendu.
- **Écart de migration montré avant tout `db push`** : `supabase migration list --linked` → **193 entrées, 192 des deux côtés**, `local sans remote` = **`20261024110000_purge_guillemets_echappes.sql`** (la seule), `remote sans local` = **aucune**. `db push --dry-run` confirmait la même liste.
- **Migration appliquée et mesurée en base** (feu vert du fondateur) : `20261024110000 purge_guillemets_echappes` journalisée dans `supabase_migrations.schema_migrations`. Contrôle **après** écriture : lignes fautives restantes = **0** sur les deux tables ; `home/section_story_title` porte désormais `Un art du voyage <span class="italic text-eucalyptus">autrement</span>`. `migration list` après coup : **193/193**, aucune orpheline.
- **Branche et PR** : `agent/openhands/lot2-guillemets-echappes` → **PR #713**.
- **Non vérifié** : le rendu de Kotor (`day_3_desc`) — la page est **volontairement « Bientôt »** (`isUnpublishedCmsPage('destinations-montenegro-kotor')` → `ComingSoonDestination`, page sans photo vérifiée) : le guide complet n'est pas rendu, donc le `<strong class="text-mahogany">` de la zone n'apparaît pas en ligne. Ce n'est pas un 404→200 accidentel.

## [2026-10-24] — La charte « carnet » étendue au corps des articles

- **Défaut** : la purge « carnet » s'était arrêtée aux pages. Les composants qui rendent le **corps des articles** (`components/blocks/*`), la FAQ et le verdict d'article, le formulaire de contact, les pages « Bientôt », le bandeau cookies, le retour en haut et la carte intégrée portaient encore `rounded-2xl`/`rounded-xl`, `bg-white`/`bg-stone-50` et des ombres. Sur un même article, le chapô était papier et les encadrés restaient « SaaS ».
- **Pourquoi la CI était verte** : `scripts/check-design-tics.mjs` ne surveillait ni `components/blocks`, ni `CookieConsentBanner`, `BackToTop`, `DestinationMapEmbed`, `EnhancedRichContent`, `PhotoEvidenceBlock`. Le périmètre est étendu de **6 entrées** — après alignement des fichiers, pas avant.
- **Cliquet des textes en dur** : le périmètre élargi fait entrer **9 fichiers** dans `check:cms-hardcode`, soit **26 textes préexistants** (replis des blocs, libellés de la carte, mentions de sécurité). Aucun n'est ajouté par cette passe. La CI l'a refusé sur `Zones et tables CMS` ; la référence `scripts/cms-hardcode-baseline.json` reçoit donc les comptes mesurés, comme `ArticleMap.tsx` en son temps. Les fichiers à **0** y sont inscrits aussi : sans entrée, une première hausse passerait pour une création.
- **Aligné** : rayons `rounded-sm` (2 px), surfaces `#FAF7F2`/`#EFE9DF`, filets `#DED5C6`/`#E2D9C8`, ombres retirées, icônes ambre → eucalyptus/mahogany. Le CSS inline de `EnhancedRichContent` (carrousel, pépite, verdict, étape, FAQ, preuve) et `PhotoEvidenceBlock.module.css` suivent la même règle : sans eux, les anciens articles restaient hors charte même une fois les composants React corrigés.
- **Bug trouvé en passant** : `HeadingBlock` posait `bg-terracotta/80`, couleur **absente de `tailwind.config.ts`** → la règle décorative des H2 ne rendait rien du tout. Remplacée par `bg-mahogany/60` ; `border-stone-100` → `border-[#E2D9C8]`. Les titres des blocs passent aussi de `font-medium` à `font-normal`, conformément à la charte (graisse régulière).
- **Contraste corrigé** : `text-teal` (`#4ECDC4`) sur fond crème plafonnait à **1,75:1**, très en dessous du seuil AA (4,5:1). Les étiquettes posées sur clair passent à `text-eucalyptus` (`#006D77`, **5,4:1**) : cartes Portugal (4), Île-de-France (4), « À lire aussi » (2), lien mail de `/merci` (1), soit **10 fichiers et 20 classes**. `text-eucalyptus/80` des pages 404 et erreur (3,8:1) repasse en plein. Les `hover:text-teal` sur clair deviennent `hover:text-mahogany` (7:1) — Mentions légales, Confidentialité, bandeau cookies, lien Blog. Aucun nouveau token : `eucalyptus` est déjà la primaire accessible du projet.
- **Conservé volontairement** : les usages de `teal` sur fonds **sombres** (héros destinations, section verdict, bandeaux mahogany, newsletter, citation de `/slow-travel`) restent tels quels : là, le ratio est bon et le teal porte la voix visuelle.
- **Mode sombre réparé, pas désactivé** : `charcoal`, `eucalyptus`, `mahogany` et `teal` passent par des variables inversées sous `html.dark`, mais les surfaces de la charte sont écrites en hexadécimal littéral (`bg-[#FAF7F2]`, `bg-[#F7F3EC]`, `bg-[#EFE9DF]`, `border-[#DED5C6]`) et échappaient à la couverture globale, qui ne vise que `stone` et `white`. Conséquence mesurée : `text-stone-900` sur `bg-[#FAF7F2]` rendait #F4F1EB sur crème, soit **1,05:1** — le titre de `SeasonalTable` (pages Madère, Monténégro, Roumanie), les cartes « Bientôt » et les pages destinations étaient illisibles. Les surfaces et filets sont désormais inversés par des sélecteurs d'attribut **exacts** (`[class~="…"]`), qui épargnent les voiles translucides `/10`, `/70`, `/92` et `/98` posés sur fond sombre ; les encres écrites en dur (`text-[#241D1A]`, `#5C5349`, `#6E655C`, `#4A413A`, `#3D5A47`) suivent dans le même bloc. Les séparateurs et pistes posés en `bg-[#DED5C6]` sont couverts aussi ; les deux camaïeux d'attente de `DestinationCard` avaient déjà leurs variantes `dark:`.
- **Vérifié** : `app/globals.css` relu au parseur (96 règles, 0 erreur) ; couverture recalculée sur les 1 349 jetons hexadécimaux du périmètre public — tout fond clair portant du texte est désormais couvert. Jobs `Types` (dont `vitest`) et `Zones et tables CMS` **verts**, build Vercel **vert**. **Non vérifié** : la preview Vercel est protégée par SSO, le rendu sombre n'a donc pas pu être inspecté au navigateur — seuls le build et le CSS le prouvent.
- **Reste ouvert** : `ThemeToggle` n'est monté nulle part — un visiteur dont l'OS est sombre reçoit le thème sans pouvoir en changer. Et la migration des **1 349 jetons hexadécimaux** du périmètre public vers des jetons nommés reste à faire : les sélecteurs d'attribut prolongent la stratégie existante, ils ne la remplacent pas.
- **Vérifié statiquement** : motifs du garde-fou recherchés sur le périmètre élargi (`rounded-2xl/3xl`, `bg-white`/`bg-stone-50` + ombre, `rounded-full` + ombre, emojis, flèche trailing) → **0 occurrence** ; `git diff` relu fichier par fichier.
- **Vérifié en CI** (PR #717) : job `Types` **vert** — `tsc --noEmit` **et** `vitest run` —, job `Zones et tables CMS` **vert** — il exécute `check:design-tics` **sur le périmètre élargi** et `check:cms-hardcode` avec les 26 comptes. C'est la validation qui manquait : les six nouvelles cibles sont réellement contrôlées, pas seulement déclarées. Premier passage **rouge**, sur `check:cms-hardcode` seul (référence incomplète), corrigé au commit suivant. `next build` n'est pas dans ce workflow : le rendu reste vérifié par Vercel au déploiement.

## [2026-10-24] — Lot 2 : du JSX stocké comme du HTML (attribut `className`)

- **Défaut** : du JSX (`className="text-mahogany"`) avait été saisi dans des zones CMS et des articles comme si c'était du HTML. Le contenu est injecté par `dangerouslySetInnerHTML` : le navigateur reçoit un attribut `className` qu'il ne connaît pas, l'ignore, et la classe Tailwind ne s'applique **jamais**. La couleur voulue est absente, sans aucune erreur visible — défaut silencieux, pas rendu cassé. Relevé du 24/10 sur `/destinations/alentejo` (`<strong className="text-stone-900">La première fois</strong>`).
- **Périmètre mesuré** (641 colonnes texte de `public` balayées en lecture seule) : **deux sources seulement** — `cms_editable_zones.value` (18 lignes, une occurrence chacune) et `cms_blog_posts.content` (5 lignes, dont l'article **publié** `itineraire-slow-travel-roumanie-bucarest-apuseni` ; `flotter-sur-la-limmat-zurich-aventure` en porte 25, dans un tableau). Balises concernées : `strong`, `em`, `span`, `img`, `a`, `table`, `tr`, `th`, `td` — aucun `<code>`/`<pre>`, donc **risque de faux positif nul**.
- **Deux points d'injection, pas un** : les zones CMS passent par `normalizeZoneText` (`lib/zone-text.ts` → `EditableZone.tsx`), les articles par `markdownToHtml` (`lib/markdown-to-html.ts` → `sanitizeHtml` → `app/blog/[slug]/page.tsx`). `sanitizeHtml` (DOMPurify, côté client) **supprime** `className` : le correctif doit donc agir **avant** sanitisation.
- **Corrigé** :
  - **Nouveau `lib/html-attributes.ts`** (`normalizeHtmlAttributes` : `className=` → `class=`, avec `\s` requis devant, pour ne pas toucher un identifiant finissant par « className »), branché sur les deux points d'injection.
  - **19 chaînes dans les fallbacks du code** : `app/destinations/alentejo/page.tsx` (4), `app/destinations/montenegro/kotor/page.tsx` (13), `components/HomeClient.tsx` (2, en guillemets simples). Les 446 `className=` de JSX légitime (hors chaîne) sont intacts.
  - **Migration `20261024100000_purge_jsx_classname.sql`** : nettoie la source pour que la base ne serve plus jamais l'attribut fautif à un autre consommateur que le site (export, email, application mobile). **Appliquée le 24/10** après validation humaine.
- **Choix : corriger au rendu, pas seulement en base.** Le correctif de rendu couvre d'un même geste les valeurs stockées **et** les fallbacks, et survit à une régénération de ces pages par `scripts/generate-*-cms.mjs`. Même approche que la correction du `\n` littéral, qui avait été retenue pour cette raison.
- **Garde-fou anti-récidive** : `scripts/check-design-tics.mjs` refuse désormais un `className` **à l'intérieur d'un littéral de chaîne** (`kind: jsx-in-string`). L'analyse isole chaque littéral (guillemets échappés compris) et ne refuse que ceux qui contiennent à la fois une balise et un `className=` : le JSX légitime hors chaîne n'est pas visé. Le mode `emojiOnly` (routes API) n'est pas affecté.
- **Vérifié** : `tsc` 0 erreur ; `vitest` **956/956** (112 fichiers, dont 19 tests neufs) ; `garde-fous` **16/16**. SQL de la migration prévisualisé en lecture seule : 18 zones et 5 articles, **0 à revoir**, **0 faux positif**.
- **Écart de migration montré avant tout `db push`** : `migration list` → **192 locales / 191 distantes**, écart d'une seule migration (`20261024100000`), `remote sans local` : aucune. `db push --dry-run` confirme : « Would push these migrations: • 20261024100000_purge_jsx_classname.sql ».
- **Migration appliquée et mesurée en base** : `20261024100000 purge_jsx_classname` journalisée dans `supabase_migrations.schema_migrations`. Contrôle **après** écriture : `className` restant = **0** sur les deux tables ; contrôle strict des attributs malformés (`class` sans `=`) = **0**. Les « 5 articles malformés » d'un premier comptage étaient des faux positifs (`classique`, `classées`, `classée UNESCO`) — le mot français, pas l'attribut.
- **Vérifié en production** (`www.heldonica.fr`) : le HTML **rendu** porte bien `<strong class="text-stone-900">La première fois</strong>` (alentejo), `<em class='text-eucalyptus'>en 2 minutes</em>` (accueil, guillemets simples) et `class="w-full rounded-lg my-6 shadow-md"` (article publié). Balayage de 10 pages : **0 `className` dans le HTML rendu** (les occurrences restantes sont toutes dans le payload RSC `<script>`, côté client, sans effet sur le style serveur). 4 articles du périmètre sont des **brouillons** (404) : correctif appliqué en base, non visible.
- **Non vérifié** : le rendu de Kotor n'a pas été confronté au HTML d'avant (page passée de 404 à 200 entre-temps, sans lien avec cette correction).
- **Branche et PR** : `agent/openhands/lot2-jsx-classname` → **PR #711**, **fusionnée en rebase** (`main` → `f04ac531`), branche supprimée. La branche `agent/openhands/audit-editorial-lot2` existait déjà mais était périmée (269 fichiers de retard sur `main`) : non réutilisée.
- **Contrôlé après fusion** : `git diff` vide entre la tête de la branche et `main` (contenu identique ; le rebase a seulement réécrit les SHA). CI sur `main` : `Types` et `Zones et tables CMS` **vertes**, Vercel **success**. Production re-mesurée après déploiement : **0 `className` dans le HTML rendu** sur 6 pages, et les trois attributs corrigés sont présents (`<strong class="text-stone-900">`, `<em class='text-eucalyptus'>`, `class="w-full rounded-lg my-6 shadow-md"`).
- **Observation de session** : le jeton du remote git est en clair dans `.git/config` (ghu_...). Ce n'est pas un fait exprès mais c'est le genre de chose que l'équipe voudrait extraire. Les notes de mémoire sont locales et ignorées par git, donc elles ne sont pas visibles des autres agents. Si l'on veut que ce constat profite aux autres sessions, il faudrait le passer dans CHANGELOG.md.

## [2026-10-23] — Cohérence des textes de destinations (agent/freebuff/coherence-destinations)

- **Défaut** : quatre incohérences visibles en ligne, relevées sur la branche `agent/freebuff/coherence-destinations`. Trois sont réelles et corrigées ; la quatrième reposait sur une prémisse fausse et a été retirée (voir plus bas).
- **Corrigé** :
  - **Prépositions devant les lieux** — les gabarits écrivaient « à » devant tous les noms : « Quand partir à Roumanie », « Où dormir à Monténégro ». Juste pour une ville ou une île (« à Madère »), faux pour un pays (« en Roumanie », « au Monténégro », « aux Pays-Bas »). Nouveau `lib/french-prepositions.ts` (source unique : `prepositionForDestination`, `inDestination`, `fixDestinationPrepositions`), branché sur `DestinationPillar`, `TestedByHeldonica` et les gabarits de `QuickAnswersBlock` (correction après substitution des jetons, donc les gabarits personnalisés en CMS sont couverts). Le correcteur ne touche qu'à des lieux connus : « au bord de l'eau », « au lait », « à deux » restent intacts (verrouillé par test).
  - **Familles** — `/travel-planning` excluait les familles (« Les voyages en famille : notre cœur de métier, c'est le slow travel à deux ») alors que l'accueil dit « Solo, famille curieuse » et que le formulaire propose « En famille ». La frontière est désormais le tourisme de masse (séjours « resort », parcs d'attractions), pas les enfants.
  - **Blog** — un onglet de catégorie vide (« Guides (0) ») promettait un contenu inexistant. « Tous » et la catégorie active restent visibles pour ne pas casser un lien partagé.
- **Retiré (prémisse fausse)** : le reframe du bandeau « Terrains de jeu » de l'accueil. Il affirmait ne plus lister que du contenu publié, mais la nouvelle liste contenait **Lisbonne**, qui est `status = 'coming_soon'` en base, et **Portugal**, **Suisse**, **Île-de-France**, sans aucune ligne `destinations` publiée (Suisse et Portugal sans article publié non plus ; l'Île-de-France n'en a qu'un, « Petite ceinture ») — Sicile, Sardaigne et Colombie (même statut que Lisbonne) partant pourtant en « Bientôt ». La contradiction et l'invention sont exactement ce que la règle « on n'invente rien » interdit. Ce bloc vit dans la section « Notre histoire » (« les endroits où on a vraiment posé nos sacs ») : il décrit des lieux vécus, pas le catalogue des destinations ouvertes — lequel est déjà rendu juste en dessous par « Nos territoires ». La liste d'origine est donc conservée, sans ligne « Bientôt ».
- **Migration** : `supabase/migrations/20261023190000_coherence_textes_destinations.sql`. Version initialement posée à `20261023160000`, **en collision** avec `20261023160000_purge_fleches_trailing_cta.sql` (déjà en base et en `main`) : deux fichiers de même version bloquaient `supabase db push` pour tous les agents et le contenu n'aurait jamais été appliqué. Renommée en `20261023190000` (libre). Chaque `UPDATE` ne s'applique que si la valeur est encore l'ancienne : une réécriture faite depuis l'admin n'est jamais écrasée.
- **Rebase** : la branche était en retard de 4 commits sur `main`. Conflit unique sur `components/DestinationPillar.tsx` — la branche réintroduisait la flèche `→` retirée par #705 (P2, décision #682). Résolu en gardant la préposition `inDestination(query)` **sans** la flèche. Le garde-fou `check:design-tics` l'aurait signalé : la CI de la branche ne l'a pas vu car elle est antérieure au garde-fou.
- **Fusion** : PR #708 fusionnée en rebase (7 commits, `main` → `de8d9d0e`). Avant fusion, `mergeable_state = clean`, `main` ancêtre direct de la branche (fast-forward possible), aucune règle de protection sur `main`. Suite rejouée sur l'arbre exact de fusion : `garde-fous` **16/16**, `vitest` **937/937** (108 fichiers), `tsc` 0 erreur, `preflight` 10/10, `db push --dry-run` ne voyant plus que la migration renommée.
- **Migration appliquée** : `supabase db push` → `20261023190000 coherence_textes_destinations` journalisée. `migration list` : **écart 0 des deux côtés sur 191 migrations**. Effet mesuré en base : les 4 zones ciblées mises à jour (`travel-planning/personas_not_1`, `travel-planning/faq_5_a`, `destinations/seasons_title_prefix`, `destinations/itinerary_title_prefix`).
- **Vérifié en production** (`www.heldonica.fr`, déploiement Vercel `success`) : aucun emoji visible (hors la notation d'effort `★` de Madère, légitime) ; 0 flèche en fin de CTA ; prépositions justes par destination — « à Madère », « au Monténégro », « en Roumanie » ; `/travel-planning` dit bien « même en famille » ; le bandeau « Terrains de jeu » de l'accueil affiche la liste d'origine ; les 5 pages répondent 200.
- **Non vérifié** : `/travel-planning/faq_5_a` n'apparaît pas dans le HTML initial — c'est un accordéon fermé par défaut, la réponse ne se rend qu'à l'ouverture (comportement attendu, pas un défaut).

## [2026-10-23] — Lot 2, priorité 4 : les zones actives à valeur vide (agent/openhands/zones-vides)

- **Défaut** : une zone active dont la valeur est une chaîne vide n'affiche pas son fallback. Le composant calcule `zones[zoneKey] ?? fallback`, et `''` n'est pas `null` — le fallback ne joue donc pas et le bloc se rend vide. Constat en base le 2026-10-23 : **37 zones actives à valeur vide**, dont 23 `local_tip` et 3 `day_N_accommodation`.
- **Portée réelle** : sur les 23 `local_tip`, **22 sont sur des pages « Bientôt »** (`lib/unpublished-pages.ts` → `ComingSoonDestination`, le bloc vide n'est jamais rendu) ; une seule est publiée, `/destinations/roumanie/bucarest`. Le même défaut touche `destinations-alentejo intro_label` (kicker blanc). Soit **2 zones visibles**.
- **Répartition avec la priorité 1 (PR #704)** : #704 corrige la **lecture** (`lib/cms-zones.ts` écarte désormais les valeurs blanches, donc le fallback joue) et pose la règle « pour retirer une zone, on la passe en `is_active = false`, pas en valeur vide ». Cette priorité-ci corrige l'**écriture** : les générateurs n'émettent plus ces lignes, et la migration désactive celles qui existent — exactement le geste que #704 décrit. Les deux sont complémentaires, pas redondantes.
- **Cause racine (écriture)** : les générateurs `scripts/generate-subdest-cms.mjs` et `scripts/generate-itineraries-cms.mjs` émettaient une ligne `cms_editable_zones` même pour une valeur vide, avec `is_active = true` et un `ON CONFLICT DO UPDATE ... is_active = true` qui **réactivait** au passage toute zone vide désactivée à la main. Le geste éditorial était annulé par la génération.
- **Correction** : les deux générateurs n'émettent plus de ligne vide (et plus de bloc `VALUES` vide) ; `scripts/check-cms-zones.mjs` signale désormais les zones actives à valeur vide et sort en échec ; `supabase/migrations/20261023180000_zones_actives_vides_desactivees.sql` désactive les 37 zones existantes, qui retombent sur le fallback rédigé dans le code (les 23 `local_tip` reprennent le conseil déjà servi sur 20 autres pages). **Aucun contenu inventé.**
- **Application** : la migration a d'abord été bloquée par l'écart de version `20261023160000` (P2, PR #705). Les PR #705 et #706 fusionnées, l'écart est refermé et la migration est poussée — **37 zones désactivées, 2285 → 2248 actives**, vérifié en base ; écart de migrations **0 des deux côtés**.
- **Vérifié** : `vitest` 101/101 sur `__tests__/scripts/`, `tsc` 0 erreur, `node --check` OK sur les trois scripts, `check:cms-zones` « aucune zone active à valeur vide ». Nouveau test `__tests__/scripts/generate-cms-zones.test.ts` (7 cas) et 2 cas ajoutés à `check-cms-zones.test.ts`.

## [2026-10-23] — Lot 2, priorité 1 : une zone active vide écrasait le fallback (agent/openhands/cms-zone-vide-ecrase-fallback)

- **Contexte** : audit éditorial, lot 2. Le bloc « Notre conseil » de `/destinations/roumanie/bucarest` s'affichait sans texte, et le kicker de `/destinations/alentejo` était blanc.
- **Cause racine** : `lib/cms-zones.ts` ne filtrait que `value == null`. Or `EditableZone` fait `zones[clé] ?? fallback` : une **chaîne vide n'est pas `undefined`**, elle écrasait donc le fallback et le bloc se rendait blanchi. Le commentaire du code annonçait pourtant l'inverse (« on laisse le fallback jouer »).
- **Correctif** : `if (row.value == null || row.value.trim() === '') continue` — une valeur blanche n'est pas une valeur. Même garde-fou dans `lib/cms-targeting.ts` (les variantes ciblées passaient par `Object.assign` sans filtre ; 0 variante en base aujourd'hui, défaut latent). Pour retirer une zone, on la passe en `is_active = false`.
- **Portée mesurée** : **37** zones actives et vides en base ; **12** sur des pages visibles, dont **2 seulement** se rendaient blanches (`bucarest local_tip`, `alentejo intro_label`). Les 9 champs de `mentions-legales` sont déjà gérés par un conditionnel (un seul repli), `header_logo_url` a un repli texte, et 25 des 37 zones vides sont sur des pages « Bientôt » (invisibles).
- **Vérifié** : `__tests__/lib/cms-zones-vide.test.ts` (4 tests) échoue sans le correctif (2 échecs) et passe avec ; `tsc` 0 erreur ; `vitest` 916/916 ; garde-fous 16/16.
- **Reste à faire** : le rendu public est corrigé après déploiement ; `/api/cms/zones` (chemin admin) conserve volontairement les valeurs vides, pour que l'éditeur puisse remplir le champ.

## [2026-10-23] — Lot 2, priorité 3 : l'emoji du réglage de maintenance (agent/openhands/maintenance-emoji)

- **`app/maintenance/page.tsx`** : fallback JSX « Merci de ta patience 🌿 » → sans emoji. La page est rendue en production quand le mode maintenance est actif, et n'était contrôlée par aucun garde-fou.
- **`scripts/check-design-tics.mjs`** : `app/maintenance` et `app/nos-services` entrent dans le périmètre (156 fichiers publics + 138 routes API).
- **Migration `20261023170000`** : retire le 🌿 de `site_settings.maintenance_message`, valeur héritée de `20260527_maintenance_mode.sql` et réinsérée par six migrations. Seeds et placeholder admin alignés.
- **Cliquet `check:cms-hardcode`** : `app/maintenance` entrant dans le périmètre design, le cliquet y a révélé le nom du site écrit en dur. Il passe désormais par `<EditableZone page="maintenance" zone="site_name" />`. Le cliquet ne se relève pas (`--update` refuse toute hausse) : il se corrige.
- **Constat, non corrigé** : `maintenance_message` est **orphelin** — sept migrations l'écrivent, aucune ligne de code ne le lit. `app/maintenance` lit la zone CMS `page='maintenance', zone_key='message'`, déjà sans emoji. Supprimer le champ est une décision produit, hors P3.
- **Écarté après vérification** : `lib/instagram.ts` (légende publiée avec 📍 🌍 🔗, canal externe, à valider côté voix de marque) ; `lib/perplexity-carousel.ts`, `lib/content-taxonomy.ts`, `getStyleEmoji` (code mort, aucun appelant) ; `lib/webhook-dispatcher.ts` (notifications Slack internes) ; `lib/cms-icons.ts` (table de conversion emoji → icône, c'est sa raison d'être).

## [2026-10-23] — Lot 2, priorité 2 : les flèches décoratives de CTA, récidive comprise (agent/openhands/fleches-cta)

- **Décision appliquée** : #682, migration `20261022220000` — « Retrait de la flèche et de la casse haute pour une typographie apaisée et cohérente ». Elle n'avait été appliquée qu'aux **10 CTA de l'accueil**.
- **Récidive prouvée par horodatage** : `20261022230800_cms_destination_labels.sql`, appliquée **8 minutes après** la purge `20261022230000`, a réinséré en dur `'Voir le guide →'` (`subdest_cta`) et `'Planifier ce voyage avec Heldonica →'` (`cta_button`) sur 5 pages. Sur `suisse` et `zurich`, **publiées**, la valeur de base écrase le fallback JSX : la flèche restait visible malgré une purge annoncée « 0 flèche trailing CTA ».
- **Code** : flèches trailing retirées de **36 fichiers publics** (CTA, boutons, formulaires, `lib/home-data.ts`).
- **Base** : migration `20261023160000_purge_fleches_trailing_cta.sql`, 10 zones actives concernées. Vérifié après push : **0 zone active finissant par une flèche**, flèches de trajet intactes.
- **Garde-fou anti-récidive** : `scripts/check-design-tics.mjs` gagne la règle `trailing-arrow`. Elle ne vise **ni** les flèches de trajet (« Évora → Monsaraz »), **ni** les flèches de tête (« ← Retour »), **ni** la puce CSS `content: '→'` du FAQ, **ni** les flèches isolées en pastille. 11 tests ajoutés.
- **Vérifié** : `tsc` 0 erreur, `vitest` 919/919, garde-fous 16/16, écart migrations 188/188.

## [2026-10-23] — Corrections des défauts perplexity : noms propres & compteur (agent/openhands/corrections-perplexity)

- **Contexte** : la migration `20261023120000` (PR #702) a capitalisé mécaniquement des noms propres sans accent ni vérification, et annoncé un compteur dynamique tout en écrivant un instantané figé.
- **Noms propres** : `Isole Eoliennes` → `Îles Éoliennes` (nom officiel), `Bogota` → `Bogotá`, `Medellin` → `Medellín` (cohérent avec les titres en base et le reste du site). 9 zones actives corrigées, +2 zones `intro_text` inactives.
- **Compteur À propos** : `a-propos/stat_2_value` était figée à `8`. Zone désactivée : `EditableZone` retombe sur `${carnetCount}+`, qui suit les articles publiés.
- **Canonical** : `/destinations/sicile/etoile` déclarait `…/sicile/isole-eoliennes`, qui renvoie 404 (aucune redirection). Corrigé vers `…/sicile/etoile`.
- **Migrations appliquées en production** (vérifiées après coup) : `20261023110000` (drift #701 : 7 `destinations.flag_emoji` → NULL), `20261023140000` (noms propres + compteur), `20261023150000` (intro_text inactifs). `supabase migration list` : 187 entrées, **0 écart**.
- **Registre** : tâche fantôme `41000c16` (perplexity, `in_progress`, branche disparue, PR #691 fusionnée) requalifiée en `done` par un tiers, avec preuves.
- **Vérifié** : garde-fous 16/16, `tsc` 0 erreur, `vitest` vert.
- **Reste à faire** : le rendu public de `/destinations/sicile/etoile` (`<title>`, `og:title`, `canonical`) vient encore du code déployé — la zone `seo_title` étant inactive, `buildPageMetadata` retombe sur le fallback du code. Correction effective après déploiement de la branche.

## [2026-10-23] — Emojis des sorties `lib/` purgés + écart migrations re-mesuré avec le CLI (agent/openhands/emoji-lib-instagram)

- **`lib/instagram.ts`** : `autoScheduleInstagramPost` composait la légende avec `📍` (titre), `🌍` (domaine) et `🔗` (lien). Ces trois emojis partaient dans `instagram_scheduled_posts` à chaque publication d'article (appelé par `app/api/cms/articles/[id]`). Le lot 3 avait purgé `app/api/cms/mobile-publish` mais **manqué ce module** : le garde-fou `check-design-tics` ne scanne que `app/api` (`API_EMOJI_TARGETS`), jamais `lib/`.
- **`lib/cms-blocks-converter.ts`** : `blocksToHtml` écrivait `<figcaption>📍 lieu – 📅 date</figcaption>` dans le **HTML publié** des articles. Emojis retirés ; le parseur `htmlToBlocks` reste **tolérant** au HTML historique (il fait `.replace('📍','')`), donc les articles déjà enregistrés se relisent sans perte. Un test le prouve.
- **`lib/travel-styles.ts`** : `STYLE_EMOJIS` (🏛️ 🌿 🏙️ 🍽️) et `getStyleEmoji` (fallback `📍`) n'étaient **importés nulle part** — code mort porteur d'emojis, retiré. Seul `getStyleLabel` (sans emoji) est utilisé, par 4 composants.
- **`__tests__/lib/cms-blocks.test.ts`** : +1 test — le HTML produit ne contient aucun emoji, et le HTML historique `📍 … – 📅 …` se relit correctement.
- **Écart migrations re-mesuré avec le CLI réel** (`supabase` v2.121.0, `migration list`, lecture seule) : **183 entrées, 183 appariées, 0 en local seulement, 0 en distant seulement → rien à pousser**. Le rapport du 22/10 concluait « ne pas lancer `db push` » en supposant que le CLI rejouerait `EMERGENCY_FIX_20260602.sql` et les 13 fichiers à préfixe court : la mesure **réfute** cette supposition (`EMERGENCY_FIX` est *ignoré* — « file name must match pattern » — et les 13 fichiers courts sont tous déjà dans le registre). Conclusion corrigée dans `.audit/audit-editorial-2026-10-20/ecart-migrations-2026-10-20-lot2.md` §4.
- **Vérifié** : `tsc` 0 erreur, `vitest` 912/912 (+1), `check:design-tics` 0 tic, `preflight` 10/10.

## [2026-10-22] — ArticleMap : emojis remplacés par des icônes lucide (agent/openhands/emojis-articlemap)

- **`components/ArticleMap.tsx`** : les 14 emojis de catégorie (`🟢 🔴 ⚠️ ℹ️ 🅿️ 🍽️ 🏊 🎒 👁️ 🚌 🏠 🎯`, plus `⏱ 📏` des popups de tracé) sont remplacés par les icônes lucide correspondantes, rendues via `renderToStaticMarkup` — Leaflet n'accepte que des chaînes HTML, mais recopier les tracés SVG en dur faisait échouer `check:cms-hardcode` (24 chaînes comptées comme texte visible). Coût mesuré : **+1 Ko** de First Load JS (337 → 338 Ko) sur des pages qui chargent déjà Leaflet ; le chunk reste paresseux (`react-loadable-manifest.json`, hors bundle initial).
- **`scripts/check-design-tics.mjs`** : `components/ArticleMap.tsx` entre dans `PUBLIC_DESIGN_TARGETS` (il portait des emojis hors du périmètre initial).
- **`scripts/cms-hardcode-baseline.json`** : `ArticleMap.tsx` ajouté à la référence du cliquet pour ses **9 textes préexistants** — aucun ajouté par ce changement (9 avant, 9 après), comme les autres fichiers du périmètre.
- **Vérifié** : pré-vol 10/10, `tsc` 0 erreur, `vitest` 911/911, `next build` OK, 0 emoji dans le fichier.

## [2026-10-22] — Correctif traçabilité CMS & purge des tics visuels (fiches cf31fe6d & 91b54bbb)

- **Fiche cf31fe6d : Réparation de l'historisation des zones (`cms_zone_history`)** :
  - Dans `app/api/cms/zones/route.ts` (PATCH), correction des 3 noms de colonnes erronés (`zone_id` -> retiré, `previous_value` -> `old_value`, `created_at` -> `changed_at`). Les modifications de zones échouaient silencieusement en `ERROR 42703 (column "zone_id" of relation "cms_zone_history" does not exist)` depuis le 19/08.
  - Ajout de `revalidateTag('cms-zones')` sur PATCH et POST pour bust instantanément le cache `unstable_cache` en plus de `revalidateCmsTarget`.
  - 5 tests unitaires dédiés ajoutés dans `__tests__/api/cms-zones.test.ts`.

- **Fiche 91b54bbb : Purge des emojis décoratifs & flèches en base, câblage en CI** :
  - **Câblage en CI** : Ajout du step `Tics visuels et emojis hors charte` (`npm run check:design-tics`) dans `.github/workflows/garde-fous.yml` (job `cms`), verrouillé par test unitaire dans `__tests__/scripts/garde-fous-outillage.test.ts`.
  - **Migration 20261022230000_purge_raw_emojis_cms_zones.sql** :
    - Purge des symboles `✓` et `⚠` en tête de libellé sur les 10 zones de destinations (`destinations-sardaigne` `period_N`, `destinations-montenegro-kotor` `verdict_adore_N`, `destinations-colombie` `info_1_item_N`).
    - Remplacement des 42 emojis résiduels dans les zones d'icônes `highlight_%_emoji` et `pepite_%_icon` par le nom d'icône Lucide `'Compass'`.
    - Suppression des flèches trailing ` →` sur les 17 boutons et CTA (`global.instagram_cta_text`, `popup_cta`, `contact_form_submit`, etc.).
  - Mesure après application en base de production : 0 emoji résiduel, 0 marque `✓`/`⚠`, 0 flèche trailing CTA.

## [2026-10-22] — Intégration du nouveau logo Heldonica : sceau officiel & symbole deux feuilles (gent/gemini/nouveau-logo-heldonica)

- **Système de marque à double niveau (Grand format éditorial & Icône compacte)** :
  - **Sceau officiel rond (détouré sans faux damier)** :
    - public/images/branding/logo-seal-transparent.png : version encre ardoise/sauge (#4C6063) sur fond 100% transparent (extraction sans résidu de quadrillage). Intégré en signature officielle sous le récit du duo fondateur sur la page /a-propos (pp/a-propos/page.tsx).
    - public/images/branding/logo-seal-light.png : déclinaison encre lin (#E6DEC8) sur fond transparent. Intégré dans le pied de page (components/Footer.tsx) à côté du nom de marque et de la mention *Slow travel vécu*.
  - **Icône compacte des deux feuilles (SVG vectoriel pur)** :
    - Tracé vectoriel extrait des deux feuilles centrales du sceau (public/images/branding/leaves.svg, public/images/branding/leaves-square.svg).
    - Intégré dans la barre de navigation (components/Header.tsx) pour remplacer le vieux monogramme géométrique provisoire « H », et synchronisé avec public/logo.svg.
- **Réparation environnement local** : suppression de la jonction orpheline output pointant vers un volume F: déconnecté, bloquant 
ext build en ENOENT. 
ext build compile désormais 163/163 pages statiques avec succès.
- **Vérifications** : preflight 9/9 réussi, 	ypecheck (tsc) 0 erreur, build Next.js 163/163 pages générées avec succès.

## [2026-10-22] — Lot 3 : zéro emoji dans les routes API, garde-fou étendu, README rétabli

- **Douze routes API portaient encore des emojis**, hors du périmètre initial de `check-design-tics` (qui ne visait que les pages publiques). Ils n'étaient pas décoratifs : ils partaient chez le client. `✈️`/`🗺️`/`🧳`/`✨`/`📅`/`💶` dans le **sujet et le corps des emails** de `/api/travel-planning` ; `🌿`/`✨` dans l'**email de bienvenue** de `/api/newsletter` ; `📍`/`🌍` dans les **légendes Instagram publiées** de `/api/cms/mobile-publish` ; `✦` dans le **HTML des articles** de `/api/update-content` ; les drapeaux `🇵🇹…` stockés dans `_taxonomy.country_flag` de `/api/ai/content`. Les autres (`⚫ ❌ ✅ ⚡ ➔ ✓`) vivaient dans des messages d'administration, des commentaires ou des sorties de script.
- **Drapeaux → codes ISO 3166-1 alpha-2.** Le dépôt avait déjà tranché (`flag_emoji="CO"` sur les destinations, `CmsIcon` documenté « aucun emoji n'est jamais rendu »). `getCountryFlag` renvoie désormais `PT`, `FR`… et `XX` par défaut, au lieu de l'emoji.
- **Légende Instagram recomposée.** La concaténation `📍 ${placeTitle}\n🌍 …` laissait une ligne blanche quand `place_title` était vide ; les lignes sont maintenant filtrées avant jointure.
- **Garde-fou étendu aux routes API** (`runApiEmojiCheck`, mode `emojiOnly`). Les règles « carte SaaS » n'ont pas de sens sur du code sans JSX : seuls les emojis y sont refusés. Prouvé par trois tests neufs (refus d'un emoji, non-application des règles SaaS, zéro emoji sur les 138 routes réelles). `check-design-tics` couvre désormais 150 fichiers publics + 138 routes.
- **README rétabli.** Il faisait 47 octets et ne contenait que `# Deployment test Thu May 21 20:30:58 UTC 2026`, écrit par le commit `f35ba453` « chore: trigger redeploy ». `git log -S Heldonica -- README.md` est vide : il n'a jamais eu de contenu. Remplacé par un vrai README (démarrage, commandes, pré-vol, règles du projet, renvois vers `AGENTS.md` et `docs/`).
- **Deux points du lot n'existent pas ici** et venaient d'un rapport décrivant un **autre projet** : le build n'est **pas** cassé (`next build` sort en 0) et `/expert-hotelier` est saine (435 lignes, 0 emoji). Le rapport annonçait Next 16/React 19 (réels 15.5.16/18.3.1), Tailwind 4 (réel 3.4.0), 3 pages (réel 119), 0 test (réel 892) et des couleurs `warm-mahogany`/`forest-sage` absentes du dépôt (elles n'existent que dans `PROMPT_ALLHANDS.md` à l'état du 16/05/2026).
- Vérifié : `tsc` 0, `vitest` 892/892 (dont 3 neufs), `garde-fous` 15/15, `next build` exit 0.

## [2026-10-22] — next 15.5.16 → 15.5.28 : RCE critique corrigée

- `npm audit` signalait une vulnérabilité **critique** dans `next` 15.5.16 : RCE non authentifiée via l'API Image Optimization quand des fichiers AVIF sont utilisés (`GHSA-2xp9-vwfh-vxw4`, CVSS 9.0), corrigée en `>=15.5.24`. Une seconde, modérée mais exploitable, touchait le cache poisoning des pages SSG/ISR (`GHSA-4jqv-mc3x-m676`), corrigée en `>=15.5.27`.
- Correctif de **patch** dans la plage `^15.5.16` : aucun saut de version majeure. Le diff du lockfile ne touche que `next` et ses binaires `@next/swc-*` — pas de bump furtif, contrairement à l'incident du 08/10.
- `npm audit --omit=dev` passe de **1 critique à 0**. Les 44 avis restants (33 moderate, 11 high) sont des dépendances transitives, hors de cette tâche.
- Vérifié : `tsc` 0, `vitest` 892/892, `garde-fous` 15/15, `next build` exit 0.

## [2026-10-22] — Réparation de l'encodage des séquences email (`fix/encodage-sequences-email`)

- **Le français partait garbled.** `app/api/send-email-sequences/route.ts` avait été ré-encodé (UTF-8 relu en cp1252) au commit `3b6067f0` : les abonnés recevaient « Cette adresse Ã  MadÃ¨re » et « PÃ©pite de la semaine » dans l'email J+3. Le cron tourne chaque nuit à 4 h, donc le défaut se répétait à chaque envoi.
- **Réparation** : 29 lignes ré-encodées (0 mojibake résiduel, accents et flèches `→` intacts), 4 emojis retirés des commentaires HTML (ADRESSE, TIMING, AVERTISSEMENT, CARTE), BOM initial retiré. Diff strictement d'encodage, aucun changement de contenu.
- Vérifié : `tsc` 0, `vitest` 889/889, `garde-fous` 15/15.

## [2026-10-21] — Le « carnet » étendu aux ~50 pages secondaires + garde-fou `check:design-tics` (`agent/gemini/design-upgrade-2-0`)

- **Correction d'une erreur de cohérence éditoriale** : la purge du mot « pépites » annoncée plus bas était fausse. *Pépites dénichées* est le vocabulaire préféré de la marque (`lib/brand-voice.ts`, `docs/GUIDE_VOIX_HELDONICA_IA.md`) et aucun garde-fou ne le bannit. Le mot est restauré (commit `2ccdb755`) ; la ligne « purge des 6 dernières occurrences » de l'entrée suivante est caduque.
- **Pages secondaires alignées sur le carnet** (destinations, sous-destinations, `/expert-hotelier`, `/organisateur`, `/guides`, `/quiz`, `/merci`, `/start`, `/retour-experience`, `/politique-affiliation`, composants partagés) : `bg-white` → `#FAF7F2`, `bg-stone-50` → `#F7F3EC`, `border-stone-200` → filet lin `#DED5C6`, `rounded-xl/2xl/3xl` → `rounded-sm`, ombres `shadow-*` retirées. Passe mécanique : relire les pages dans un navigateur reste à faire.
- **Plus d'emoji décoratif sur les pages publiques** : les emojis de données (`icon:`, `emoji:`, zones `*_emoji` / `*_icon`) deviennent des noms d'icônes Lucide rendus par `CmsIcon` / `EditableZone` ; les emojis isolés ou inline sont supprimés ; les drapeaux deviennent des codes ISO ; `⭐⭐⭐` → `★★★`.
- **Nouveau garde-fou `scripts/check-design-tics.mjs`** (`npm run check:design-tics`, inclus dans `garde-fous` et `--preflight`) : refuse un emoji décoratif, `bg-white`/`bg-stone-50` combiné à `rounded-2xl/3xl` ou `shadow-*`, `rounded-2xl/3xl` seul, et une pilule `rounded-full` + ombre lourde. Prouvé sur cas fautif par `__tests__/scripts/check-design-tics.test.ts` (13 tests) ; l'agrégateur passe de 14 à 15 contrôles.

## [2026-10-21] — Design Upgrade 2.0 : séquence éditoriale de l'accueil, bandeau de preuves et cartes E-E-A-T (`agent/gemini/design-upgrade-2-0`)

## [2026-10-21] — Préchargement universel des zones CMS (100% pages) & mise en cache `/api/cms/zones` (`agent/gemini/zones-preload-cache`)

- **Soulagement de la charge Postgres / suppression des requêtes redondantes (2e goulot identifié : 26 462 appels)** :
  - **Préchargement serveur `initialZones` sur les 6 pages clientes publiques orphelines** :
    - `app/destinations/carte/page.tsx` + `MapClientPage.tsx`
    - `app/organisateur/page.tsx` + `TravelOrganizerClient.tsx`
    - `app/temoignages/TemoignagesClient.tsx`
    - `app/merci/page.tsx` + `MerciClient.tsx`
    - `app/quiz/page.tsx` + `QuizClient.tsx`
    - `app/travel-planning-form/page.tsx` + `TravelPlanningFormClient.tsx`
  - **Résultat** : 100% des pages montant `InlineEditProvider` reçoivent désormais `initialZones` au rendu initial SSR/ISR. Zéro appel client à `/api/cms/zones` n'est déclenché par un visiteur normal.
  - **Mise en cache Data Cache Next.js (`unstable_cache`)** dans `lib/cms-zones.ts` et `app/api/cms/zones/route.ts` : tag `cms-zones`, fenêtre de 300s, revalidation instantanée via `revalidateCmsTarget` sur tout `PATCH` / `POST` / `DELETE`.
  - **Vérifications** : `check-cms-cache` vert (119 pages), `tsc --noEmit` vert (0 erreur), `vitest run` 100/100 fichiers passés (862 tests), `garde-fous --preflight` 8/8 réussi.

## [2026-10-21] — Heartbeat Brain : écrire seulement quand l'état change

- **Séquence éditoriale réorganisée (`components/HomeClient.tsx`, `app/page.tsx`)** : passage à la séquence *Hero immersif → Bandeau horizontal Preuve de terrain (4+ ans · 100+ adresses · 7+ pays · 8+ carnets) → Notre histoire → Carnet à la une (split 7/5 photo/texte) → Nos territoires (remontés juste après la Une) → Carnets de route (grille harmonisée 3 colonnes) → Tables & refuges → Travel Planning sur-mesure → Boussole Slow Travel → B2B Hôtelier*.
- **Suppression de la répétition d'articles sur l'accueil (`app/page.tsx`)** : retrait du repli `if (filteredLatest.length === 0) filteredLatest = allPosts...` qui réaffichait les mêmes carnets et recettes une deuxième fois en bas de page.
- **Hiérarchie des CTA et micro-preuves E-E-A-T (`components/HomeClient.tsx`)** : CTA principal plein (`bg-mahogany`, pleine largeur sur mobile) + second CTA en lien éditorial souligné discret ; cartes `ArticleCard` harmonisées (`aspect-[4/3]`, hauteur de titre constante, mention *Vécu sur le terrain*, durée de lecture et date en pied de carte) ; conservation du vocabulaire signature *« pépites dénichées »* (`lib/brand-voice.ts`).

## [2026-10-21] — Le « carnet » atteint les pages secondaires : `/a-propos` et `/travel-planning`

- **Le trou : la passe du 20/10 s'était arrêtée à l'accueil.** Elle avait touché
  `HomeClient`, `Header`, `Footer`, `DestinationCard` et `DestinationsClient`, mais
  `/a-propos` et `/travel-planning` gardaient le vocabulaire IA/SaaS
  (`bg-white`, `bg-stone-50`, `rounded-2xl`, `rounded-full`, `shadow-sm/lg`) et des
  emojis en guise d'icônes (🐢 ✨ 🎯 🗺️ 📖 🎁 🕰️ 🧭 💍 🏡 📞 ✉️).
- **Fonds et encres papier (`app/a-propos/page.tsx`, `app/travel-planning/TravelPlanningClient.tsx`)** :
  `#F7F3EC` / `#EFE9DF` / `#FAF7F2` pour les surfaces, `#241D1A` / `#2A1D18` pour
  l'encre, filets lin `#DED5C6` / `#E2D9C8`, `rounded-sm`, petites capitales
  `tracking-[0.16–0.22em]`, titres `font-serif` en graisse régulière.
- **Icônes au trait au lieu des emojis** : `lucide-react` (déjà dans le projet),
  `strokeWidth={1.25}` — cohérent avec le monogramme `public/logo.svg` (trait 1.4 px).
  `Footprints`, `Feather`, `PenTool`, `BookOpen`, `Map`, `Gift` sur `/a-propos` ;
  `Clock`, `Compass`, `Gem`, `Map`, `BedDouble`, `PhoneCall`, `Mail`, `Check` sur
  `/travel-planning`. Plus un seul emoji visible sur les deux pages.
- **Tics « IA » retirés** : encadrés colorés à coins ronds, dégradés
  (`bg-gradient-to-*`), ombres lourdes, boutons pilule `rounded-full` et survols
  qui translatent (`hover:-translate-y-1`, `hover:shadow-2xl`). Les CTA passent en
  petites capitales sur `rounded-sm`.
- **Zones CMS préservées à l'identique** : 29 `EditableZone` sur `/a-propos`,
  41 sur `/travel-planning`, mêmes clés — aucun contenu éditable perdu.
- **Pas de variante `dark:` ajoutée** : `HomeClient` laisse volontairement ses 11
  sections papier sans variante sombre, et `ThemeToggle` n'est rendu nulle part
  côté public. On suit la référence plutôt que d'inventer un traitement isolé.

## [2026-10-20] — Connexion au CMS par compte Google (propriétaire uniquement)

Première brique du remplacement du mot de passe partagé sur le téléphone : au lieu
d'un secret unique recopié sur chaque appareil, l'identité devient le **compte Google
du propriétaire**. Le mot de passe reste en place comme voie de secours — refuser une
connexion Google ne doit jamais enfermer le propriétaire hors de son site.

- **Nouveau** `lib/cms-google-signin.ts` : vérifie un jeton d'identité Google
  (signature, audience, expiration via `google-auth-library`, déjà présent) **et**
  l'adresse autorisée. Sans ce second contrôle, n'importe quel compte Google entrerait.
- **Nouvelle route** `POST /api/cms/auth/google` : reçoit `{ idToken }`, vérifie,
  puis émet la session CMS habituelle (cookie 8 h). Bornée à 10 tentatives/minute
  par IP ; le middleware la laisse passer, c'est le jeton qui fait office de preuve.
- **2FA** : celle du compte Google, appliquée en amont à l'émission du jeton. On ne
  la refait pas ici.
- **Configuration** : `GOOGLE_SIGNIN_CLIENT_ID` (repli sur `GOOGLE_PHOTOS_CLIENT_ID`)
  et `CMS_ALLOWED_EMAIL` (une seule adresse). Sans les deux, la route répond 503.
- **Refus générique** : un échec ne dit jamais au visiteur quelle adresse est attendue.
- **Tests** : 10 cas sur le vrai module (seul l'appel réseau à Google est simulé) —
  mutation vérifiée, désactiver le contrôle d'adresse fait bien échouer la suite.
- **Reste à faire (action humaine)** : `keystore/heldonica-debug.keystore` est
  versionné et son mot de passe est en clair dans `build.gradle.kts` (dépôt public) :
  les APK de release sont donc signés par une clé publique. Un keystore de release
  privé est requis **avant** d'enregistrer l'empreinte du client OAuth Android.


## [2026-10-20] — Direction artistique « Carnet de route imprimé » (branche `agent/gemini/design-organique-humain`)

- **Papier coton chaud & grain analogique (`app/globals.css`)** : abandon des fonds blancs cliniques (`#FFFFFF`) et gris froids (`stone-50`) au profit d'un papier coton ivoire chaud (`#F7F3EC`) et sable (`#EFE9DF`), d'une encre chaude (`#2A2522`), d'un grain papier SVG subtil (`feTurbulence` à `opacity: 0.024`) et de titres `Playfair Display` en graisse régulière (`font-weight: 400`) façon revue imprimée (*Kinfolk* / *Cereal* / *Bouts du Monde*).
- **Suppression intégrale des tics visuels « IA / SaaS » (`components/HomeClient.tsx`, `components/Header.tsx`, `components/Footer.tsx`, `components/DestinationCard.tsx`, `app/destinations/DestinationsClient.tsx`)** : retrait de toutes les étoiles `✦` et emojis (`✨`, `⭐`, `🌍`, drapeaux), des pilules `rounded-full` flottantes sur les photos, des cartes `rounded-2xl` à ombres portées lourdes, et des surcouches sombres qui étouffaient les photographies.
- **Cartes d'articles et de destinations façon tirages papier (`components/HomeClient.tsx`, `components/DestinationCard.tsx`)** : photographies plein cadre non obstruées (`aspect-[4/3] rounded-sm`), métadonnées en petites capitales sous l'image (`DESTINATION · X MIN DE LECTURE`), filets fins couleur lin (`border-[#DED5C6]`), cadres photos Polaroid/tirage sur l'accueil (`bg-[#FAF7F2] p-2.5`) et colophon expresso chaud (`bg-[#1E1A17]`).

## [2026-10-20] — Restauration visuelle du site (`heldonica.fr`) : polices, couleurs avec opacité, en-tête et cartes territoires

- **Couleurs de marque et modificateurs d'opacité (`tailwind.config.ts`)** : les 5 couleurs CSS variables (`mahogany`, `eucalyptus`, `teal`, `cloud-dancer`, `charcoal`) passent par `color-mix(in srgb, var(--color-*, #...) calc(<alpha-value> * 100%), transparent)`. Corrige la suppression silencieuse par Tailwind v3 de toutes les classes `/5`, `/10`, `/20`, `/60`, `/70`, `/80`, `/90` qui rendait les cartes d'articles (`bg-mahogany/80`) délavées sur fond blanc et les badges (`bg-eucalyptus/90`) transparents.
- **Polices éditoriales (`app/layout.tsx`, `components/SiteTheme.tsx`, `app/globals.css`, `lib/design-presets.ts`)** : retour au duo historique **Playfair Display** (romain + italique) et **DM Sans** auto-hébergées via `next/font/google`, en neutralisant aussi les valeurs `Fraunces` / `Source Sans 3` résiduelles en base pour éviter tout chargement tiers inutile.
- **En-tête & Logo (`components/Header.tsx`, `public/logo.svg`)** : suppression du doublon « Heldonica » (où `<Image src="/logo.svg">` affichait déjà un `<text>` en police système à côté du `<span>Heldonica</span>`). Le monogramme vectoriel adaptatif précède désormais un unique mot-marque en `Playfair Display`.
- **Cartes « Nos territoires » sur l'accueil (`lib/home-data.ts`, `components/HomeClient.tsx`)** : lecture de `featured_image` depuis `destinations`, filtrage des destinations non publiées (`zurich`, `suisse`), et remplacement des 4 boîtes grises à icônes filaires par de vraies cartes photos éditoriales (Madère, Roumanie, Monténégro).
- **Couverture éditoriale des destinations « Bientôt » (`components/DestinationCard.tsx`)** : remplacement du rectangle gris à drapeau emoji géant par une couverture boussole en dégradé `mahogany`/`eucalyptus`.
- **Migration versionnée** : `supabase/migrations/20261020230000_restauration_polices_et_territoires_accueil.sql`.

## [2026-10-20] — APK Poco X6 Pro : IA locale (`CerveauLocal`) câblée sur Instagram, Memoria Imperium et Rédaction

- **Instagram & Carnets (`MainActivity.kt`, `CerveauLocal.kt`)** : ajout de `PromptLocal.construirePromptInstagram` (respect strict de la voix Heldonica `on`/`tu`, fiches pertinentes du Coffre embarqué, zéro invention, balise `[À TOI : …]` si détail manquant, hashtags `#slowtravel #heldonica`). Bouton dédié **« 📱 Légende IA Poco (hors-ligne) »** dans les écrans *Publier* et *Écrire un carnet*, + repli automatique vers `CerveauLocal.repondre` dans `analyserPhotoAvecIa` lorsque le serveur CMS ou la station PC sont injoignables.
- **Memoria Imperium (`MemoriaImperium.kt`)** : ajout de `ScenarioMemoria` (`construirePrompt` + `parserScenario` avec repli résilient multi-paragraphes) et d'un champ de sujet historique libre dans `OngletMemoriaImperium()` (**« 🧠 IA Poco »**) qui génère un scénario complet 4 scènes 9:16 avec le modèle local du Poco X6 Pro en mode libre (`libre = true`, ou repli `BrainClient`) avant le rendu visuel Pollinations FLUX 9:16 gratuit.
- **Rédaction (`RedactionBrouillon.kt`, `RedactionClient.kt`)** : ajout de `construirePromptCompletionLocale` et d'un repli vers `CerveauLocal.repondre` dans `RedactionClient.completer` (protégé par `RedactionBrouillon.refuserProposition`).
- **Tests JVM** : ajout de `MemoriaImperiumTest.kt` et enrichissement de `PromptLocalTest.kt` et `RedactionBrouillonTest.kt`.

## [2026-10-20] — Lot 2 : deux trous du garde-fou de cohérence éditoriale refermés

- **Champs meta jamais scannés.** `scripts/check-content-coherence.mjs` ne lisait
  que `title / excerpt / content`. Un mot banni publié dans `meta_title`,
  `meta_description`, `seo_title` ou `seo_description` partait dans les balises
  `<meta>` (Google, aperçus de partage) **avec la CI au vert**. Mesuré en base : sur
  47 brouillons, le garde-fou en voit **5**, et **11** une fois les champs meta
  inclus. Aucun article **publié** touché aujourd'hui (0/8), mais rien ne l'empêchait.
  Corrigé par `CHAMPS_META` + `articlesPubliesAvecMotBanniMeta()` (fonction pure) +
  blocage `exit 1` : un publié bloque, un brouillon reste de la dette. **Vérifié par
  échec** (enregistrement empoisonné injecté dans le flux réel → `exit 1`, mots nommés).
- **Liste de mots bannis recopiée à la main.** Le script portait une **copie de
  30 mots**, divergente de `lib/brand-voice.ts` (**48**) — la dérive que
  `check:brand-sync` interdit, mais il ne surveille que les miroirs Python. La liste
  vient désormais de la source unique (`extraireMotsBannisTS`).
- **Clés Supabase.** Les clés **legacy** (`anon`, `service_role`, JWT `eyJ…`) sont
  **désactivées** depuis le 19/08 (HTTP 401 `Legacy API keys are disabled`) : un
  secret legacy en CI fait sortir le contrôle en « ignoré » (exit 2), pas en vert. Le
  format `sb_secret_…` (non-JWT) fonctionne en `apikey` et en `Authorization: Bearer`.
- **PR #664** : https://github.com/farinhahelder-hue/heldonica/pull/664. `tsc` 0 ;
  `vitest run` **862/862** ; `preflight` 8/8.

## [2026-10-20] — Lot 2 : le cache ISR servait encore l'ancien texte 10 h après la correction

- **Symptôme.** Sept mots bannis purgés en base le 20/10 (lot 2) restaient servis
  par la production. Base propre, mais `x-vercel-cache: HIT`, `age ≈ 38 000 s`.
  Un query string (`?v=1`, `?nocache=`) ne contourne pas le cache Vercel.
- **Cause racine.** Les pages destinations étaient prérendues **statiques sans
  `export const revalidate`** (build : `○` sans colonne Revalidate) → mises en
  cache **pour toujours**. Le CMS appelle `revalidateCmsTarget()` (`lib/revalidate.ts`)
  à chaque écriture, mais **revalider une page qui n'expire jamais ne fait rien**.
  La purge du lot 2 étant passée par SQL direct, elle n'a déclenché aucune
  revalidation. Portée réelle : *toute* correction CMS sur ces pages restait
  invisible jusqu'au prochain déploiement — et rien ne le signalait.
- **Corrigé.** `app/destinations/layout.tsx` : `revalidate = 300`. Next.js fait
  descendre la fenêtre d'un layout vers ses enfants : **un seul fichier couvre les
  ~70 pages** du segment (vérifié au build, `5m` au lieu de figé). Plus 10 pages
  publiques lisant le CMS (`guides`, `guides/merci`, `guides/top-10-pepites-madere`,
  `contact`, `expert-hotelier`, `mentions-legales`, `politique-affiliation`,
  `politique-confidentialite`, `start`, `travel-planning`). `app/maintenance`
  exempté : piloté par `site_settings.maintenance_mode`, pas par l'éditorial.
- **Garde-fou.** `scripts/check-cms-cache.mjs` (statique, ~1 s) : une page prérendue
  qui lit le CMS doit avoir une fenêtre, la sienne ou celle d'un layout parent.
  **Vérifié par échec** — correctif retiré, 59 pages signalées. Câblé `preflight`
  (8 contrôles) et `garde-fous` (14 contrôles ; la table de `AGENTS.md` annonçait
  « 12 » et omettait déjà `content-pages`, corrigée à 14).
- **Vérifié.** `tsc` 0 ; `vitest run` **858/858** (3 runs) ; `preflight` 8/8 ;
  build local `/destinations/alentejo` et `/destinations/portugal` → `circuit=0 |
  sentiers battus=4`. PR #663.

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
- **P2 — `/quiz` sans `og:image`. CORRIGÉ.** Le partage social de cette page
  n'affichait aucune image (`twitter:card=summary`). Ajout de `images` en
  `openGraph`/`twitter` dans `app/quiz/layout.tsx`, avec `og-default.jpg` déjà
  utilisée ailleurs.

## [2026-10-20] — Migrations réconciliées : 22 orphelines soldées, hardening appliqué sans le DROP

Suite de l'audit lot 2. Les 22 versions présentes en fichier mais absentes de
`schema_migrations` ont été traitées **en mesurant l'effet de chacune en base**
avant toute écriture de trace — jamais en supposant. **Écart soldé : base 144 → 167,
0 orphelin, 0 collision.**

- **20 versions enregistrées** (effet présent en base, SQL exécuté hors migration
  un jour) : `schema_migrations` passe de 144 à **165** lignes. Vérifié par requête
  SQL de contrôle (colonnes, index, lignes, policies) pour chacune.
- **2 versions restantes appliquées le soir même**, après mesure :
  `20260929120000_supabase_security_hardening` (sans son `DROP`) et
  `20261011120000_create_cms_backoffice_tables`. Base → **167**.
- **`20260929120000_supabase_security_hardening` appliquée SANS son `DROP`** (soir) :
  le fichier supprimait `backup_articles_20260915`, qui contient 50 lignes dont
  **10 uniques** (dont les notes `paris-*` de l'incident AGENTS.md) → `DROP` retiré,
  export conservé, table intacte. Le reste appliqué : `REVOKE` anon sur
  `match_articles`/`match_destinations`/`check_auth_role` (**faille refermée** :
  `match_destinations` est `SECURITY DEFINER` sans filtre `status` → 38 destinations
  non publiées étaient lisibles avec la clé publique), vue `security_invoker`, 4
  policies `service_role_all_*`. `service_role` conserve l'accès (testé : 3 lignes).
- **`20261011120000_create_cms_backoffice_tables` appliquée** (purement additive :
  9 `CREATE TABLE IF NOT EXISTS`, aucun `DROP TABLE`/`TRUNCATE`/`DELETE`, aucun seed) :
  les **9 tables back-office** sont créées, RLS activée. Les 9 entrées **retirées de
  `KNOWN_DRIFT`** (`scripts/check-cms-drift.mjs`) → le garde-fou signale désormais toute
  disparition future. Base → **167**.
- **Collision de version résolue** : `20261019000000` portait deux fichiers
  (PR #642 et #654). Le second est renommé
  `20261019000001_polices_marque_fraunces_source_sans.sql`.
- **Aucun `db push`** : l'état réel est déjà conforme, pousser rejouerait des
  effets existants.
- Détail : `.audit/audit-editorial-2026-10-20/reconciliation-migrations-2026-10-20.md`.
- Vérifié : `check:cms-migrations` 0, `check:cms-drift` 0, `check:cms-zones` 0,
  `check:erreurs-avalees` 0, `preflight` 7/7.

## [2026-10-20] — Audit éditorial lot 2 : 7 mots bannis servis en ligne, troncature hero (OpenHands)

Branche `agent/openhands/hero-description-troncature`. `.audit/` reste non versionné.

- **Cause racine des mots bannis en ligne** : les replis code de plusieurs zones
  avaient été corrigés (commit `2b6f121`), mais **la base prime sur le repli**
  (`EditableZone` : `zones[k] ?? fallback`). Corriger le `.tsx` seul ne change rien
  tant que la valeur existe en base. Un re-scan **par sous-chaîne** (la CI cherche
  ainsi ; mon premier scan à frontières de mot ratait `circuits`/`spots`/`incroyables`)
  a trouvé **7 lignes actives rendues et indexables** : `destinations-alentejo`
  (faq_1_a), `destinations-portugal` (cta_text), `top-10-pepites-madere`
  (hero_text, intro_text), `guides-top-10-pepites-madere` (seo_description),
  `cms_guide_items` Porto Moniz #3, `cms_home_destinations` madere (eyebrow).
- `supabase/migrations/20261020120000_purge_mots_bannis_zones_actives.sql` (nouveau) :
  7 `UPDATE … replace()` idempotents et neutres, sans rien inventer. **Appliquée**
  via l'endpoint SQL direct, puis **enregistrée** dans `supabase_migrations` (144 versions).
- `scripts/check-content-coherence.mjs` : ne lisait QUE `cms_blog_posts` — un mot
  banni en zone/accueil/sous-destination/guide ne faisait pas rougir la CI. Étendu
  aux quatre tables de contenu, avec pagination `limit/offset` (l'API REST plafonne
  à 1000 lignes en silence). Deux seaux : **fuite** (active, page publiée) → `exit 1` ;
  **dette** (inactive ou page quarantainée) → signalée sans bloquer. Test :
  `__tests__/scripts/check-content-coherence.test.ts`.
- `app/destinations/[slug]/DestinationPage.tsx` : `.slice(0, 200)` + `'...'` codé en
  dur retirés du hero (coupait un mot sous 200 car.). Test de régression :
  `__tests__/app/DestinationPage-hero-description.test.tsx`.
- Vérifié : `check:content-coherence` rouge **avant** la migration (7 fuites), vert
  après ; `preflight` 7/7 ; `tsc --noEmit` 0 ; `vitest run` **827/827**.
- **Non vérifié en ligne** : les pages servies restent l'ancien HTML (ISR statique,
  `x-vercel-cache: HIT`, `age ≈ 30 000 s`) — l'écriture directe en base n'a pas
  déclenché de `revalidatePath`. La base est corrigée ; les pages le seront à la
  prochaine revalidation.

## [2026-10-20] — Brevo : les trois dernières routes ne taisent plus un refus (OpenCode)

Branche `agent/opencode/brevo-res-ok`, suite de la tâche `703d9426`. Le
correctif du 16/09 (`3330f06`) ne couvrait que `/api/travel-planning` ; les
trois autres routes qui synchronisent un contact lisaient `res.ok` sans jamais
dire pourquoi Brevo refusait.

- `app/api/guides/download/route.ts` : la réponse Brevo est maintenant lue ;
  un refus (401 « IP non autorisée », etc.) est journalisé avec son corps. Le
  téléchargement du PDF reste non bloquant.
- `app/api/contact/route.ts` : les refus contact (hors 400 « déjà inscrit ») et
  notification sont journalisés avec statut et corps.
- `app/api/expert-hotelier/route.ts` : idem avant le repli Resend.
- Test : `__tests__/api/brevo-res-ok.test.ts` vérifie que le 401 est bien
  journalisé, pas seulement avalé.
- Vérifié : `vitest` 10/10 sur ce fichier, `typecheck`, `check:api-auth`,
  `check:erreurs-avalees`. **La restriction d'IP reste à désactiver dans Brevo**
  (tableau de bord, action utilisateur) : aucune synchro réelle ne peut être
  mesurée tant qu'elle est active.

## [2026-10-20] — Brevo : les trois dernières routes ne taisent plus un refus (OpenCode)

Branche `agent/opencode/brevo-res-ok`, suite de la tâche `703d9426`. Le
correctif du 16/09 (`3330f06`) ne couvrait que `/api/travel-planning` ; les
trois autres routes qui synchronisent un contact lisaient `res.ok` sans jamais
dire pourquoi Brevo refusait.

- `app/api/guides/download/route.ts` : la réponse Brevo est maintenant lue ;
  un refus (401 « IP non autorisée », etc.) est journalisé avec son corps. Le
  téléchargement du PDF reste non bloquant.
- `app/api/contact/route.ts` : les refus contact (hors 400 « déjà inscrit ») et
  notification sont journalisés avec statut et corps.
- `app/api/expert-hotelier/route.ts` : idem avant le repli Resend.
- Test : `__tests__/api/brevo-res-ok.test.ts` vérifie que le 401 est bien
  journalisé, pas seulement avalé.
- Vérifié : `vitest` 10/10 sur ce fichier, `typecheck`, `check:api-auth`,
  `check:erreurs-avalees`. **La restriction d'IP reste à désactiver dans Brevo**
  (tableau de bord, action utilisateur) : aucune synchro réelle ne peut être
  mesurée tant qu'elle est active.

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

## [2026-10-19] — Les agents ne se marchent plus dessus (worktrees + hooks)

Incident du jour : tous les agents partagent un dossier, donc une branche active. Un
`checkout` d'OpenCode a déplacé la session de Claude, dont le commit puis le `git push` sont
partis sur `agent/opencode/brand-look`.

- `npm run worktree -- <agent> <slug>` : dossier à soi (`../worktrees/<agent>-<slug>`),
  branche `agent/<agent>/<slug>` depuis `origin/main`.
- Hooks `.githooks/` (`npm run hooks:install`, une fois) : pour un agent annoncé par
  `AGENT_NAME`, refus d'un commit sur `main` ou sur la branche d'un autre, et d'un push
  sur `main` ou sur la branche d'un autre. Sans `AGENT_NAME`, rien n'est contrôlé.
- `npm run preflight` avertit si les hooks manquent ou si l'agent travaille dans le dossier partagé.
- Règles ajoutées à `AGENTS.md` (« Un dossier par agent »). Tests : `__tests__/scripts/`.

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

> **ANNONCÉ, NON LIVRÉ — vérifié le 21/10/2026.** Les 4 sessions ci-dessous ont
> été *créées* via l'API Jules, mais **aucun de leurs livrables n'existe dans ce
> dépôt** : `git log --all` ne trouve **aucun commit** pour
> `BrainHealthMonitor`, `ShortsGalleryPanel`, `hybrid_knowledge_retriever`,
> `brand-voice-autofix` ni `validate-voice`. Les deux scripts de dispatch cités
> au point 5 sont absents eux aussi. Cette section décrit des **intentions**, pas
> des fonctionnalités. Ne rien construire dessus sans vérifier d'abord le fichier
> dans l'arborescence. Suivi : fiche `agent_tasks` `f206ca15` (`scope=tracabilite-changelog`).

4 nouvelles sessions à fort impact ont été créées via l'API Google Jules pour enrichir et monitorer le Cerveau (Heldonica Brain II & Copilote CMS) :

1. **Session #31** (`heldonica`, ID `6473189658887798322`, URL : https://jules.google.com/session/6473189658887798322) — *non livré* :
   - *Titre* : `feat(brain-cms): Tableau de bord temps reel et moniteur de sante Brain II dans le Panel Manager`
   - *Périmètre* : Composant `BrainHealthMonitor.tsx` dans `components/cms/` interrogeant `/api/brain/status` (CPU %, RAM %, statut vert/rouge, latence ms, modèle LLM actif, tâches en cours), intégré à `app/panel-manager/brain/page.tsx` avec tests Vitest.

2. **Session #32** (`heldonica`, ID `9859007501490998508`, URL : https://jules.google.com/session/9859007501490998508) — *non livré* :
   - *Titre* : `feat(brain-shorts): Galerie de visualisation et declencheur de Shorts 9:16 dans le Panel Manager`
   - *Périmètre* : `ShortsGalleryPanel.tsx` et page `app/panel-manager/brain/shorts/page.tsx` pour prévisualiser les shorts verticaux 9:16 produits par le Brain II (parallaxe 3D, badges or, sous-titres, audio), téléchargement MP4, et déclencheur direct `ShortsProductionModal.tsx` avec tests Vitest.

3. **Session #33** (`history-content-studio`, ID `4234061000811524343`, URL : https://jules.google.com/session/4234061000811524343) — *non vérifié ici* :
   - *Titre* : `feat(brain-rag): Moteur de recherche semantique hybride BM25 et vecteur pour le Coffre des Savoirs`
   - *Périmètre* : Outil CLI `tools/hybrid_knowledge_retriever.py` combinant indexation textuelle BM25 (dates et entités précises) et similarité vectorielle cosinus via Reciprocal Rank Fusion (RRF k=60) avec tests pytest.

4. **Session #34** (`heldonica`, ID `12645695234480873273`, URL : https://jules.google.com/session/12645695234480873273) — *non livré* :
   - *Titre* : `feat(brand-guard): Service de conformite et auto-correction editoriale selon la voix Heldonica`
   - *Périmètre* : Module `lib/brand-voice-autofix.ts` et route API `/api/brain/validate-voice` vérifiant la conformité stricte avec `lib/brand-voice.ts` (mots bannis, anonymat des fondateurs, ton slow travel) avec suggestions et correction automatique, et tests Vitest.

5. **Coordination & Traçabilité** — *scripts absents du dépôt* :
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
