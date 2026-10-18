# Mémoire projet — Heldonica

Faits durables. Détails et récits datés : `YYYY-MM-DD.md`.

## Contenu

- **La vérité éditoriale est dans Supabase, pas dans le dépôt.** Corriger un texte =
  migration versionnée sur `cms_editable_zones` / `cms_blog_posts` / `cms_media` /
  `destinations`. **Une zone CMS écrase toujours le fallback du code** : éditer le code
  ne change pas la page si la zone existe en base.
- **« On n'invente rien » : ne JAMAIS déduire « pas vécu » d'une source vide.** Une
  photothèque vide prouve l'absence de **matière versée**, pas de **voyage**
  (2026-10-16 : Sicile/Sardaigne/Colombie « non visités » → faux). Le vécu se prouve en
  croisant `cms_media`, `cms_blog_posts`, `destinations.intro_narrative`,
  `lib/cms-vault-spots.ts` (Coffre ~78 fiches, dont ~35 d'**héritage Blogger** à exclure).
- **Pépites** (`highlight_1/2/3_title`) : texte générique ou notes télégraphiques =
  matière brute à rédiger, pas à jeter.
- **Photos : verser par `/panel-manager/photos`** (Picker Google Photos), qui est dans
  `maintenanceExcludes` — le CMS reste accessible **pendant** la maintenance, ne pas la
  désactiver pour ça.
- **OUVERT (décision propriétaire) : les 5 témoignages `cms_testimonials` sont actifs et
  rendus publiquement**, alors que la migration `20260819140000` (appliquée — prouvé par
  `home.hero_tagline`) les avait désactivés comme faux de démo. Textes réécrits le
  2026-10-14, **absents du dépôt** ⇒ saisis via le CMS. Identités = seed du 03/07, mais
  **ça ne prouve pas** que les clients n'existent pas. Ne rien toucher sans l'utilisateur.

## Environnement

- **Maintenance : `maintenance_mode = false` au 2026-10-18 (site public).** Quand elle
  est active, tout test HTTP devient non discriminant : toute URL, **images comprises**,
  reçoit `307 → /maintenance` — un `curl` ne distingue plus une image existante d'une
  absente (vérifier disque ou bucket). Rendu réel : `next start` local,
  `MAINTENANCE_MODE=false`. Ne jamais la basculer sans accord (règle absolue n° 4).
- **504 `MIDDLEWARE_INVOCATION_TIMEOUT` ≠ maintenance** : base injoignable, interrogée
  sans timeout. Clé bidon → 401 en < 0,2 s (passerelle saine, ne prouve rien) ; test
  décisif : `GET /storage/v1/bucket` avec la clé **valide**.
- **Un build vert ne prouve pas le rendu.** `.env.local` n'a **pas** de
  `SUPABASE_SERVICE_ROLE_KEY` : le build utilise un stub, `getPageZones()` ne lit rien,
  les pages prérendues montrent les **fallbacks en dur**. (Le serveur MCP `agent-tasks`
  ne démarre donc pas depuis `.env.local` seul.)
- **PostgREST** : plafonne à **1 000** lignes → compter avec `Prefer: count=exact` +
  `Range: 0-0`, lire `content-range`. Les filtres exigent `eq.` : `?status=in_progress` ou
  `?or=(...)` → `PGRST100`.
- **Clone git superficiel** : `git log -- <fichier>` peut dire « jamais committé » à tort
  → `git fetch --deepen=300`. Un processus extérieur peut changer de branche en session :
  `git reflog` avant de paniquer.
- **Ce runtime découpe mal les `heredoc` multi-commandes** → éditeur de fichiers ou un
  `python3 - <<'PY'` unique. Sur un fichier Unicode, les ancres `old_str` à indentation
  exacte échouent → Python.
- `npm run garde-fous` : les 2 contrôles base se contentent de la clé **publique**
  (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **12/12**). Sans elles,
  « ignorés » ≠ « réussi ». La clé service reste nécessaire pour **écrire** et lire le
  **schéma des colonnes**.

## CMS : couverture et trous prouvés

- `EditableZone` = clé `` `${page}__${zone}` `` ; **90 routes publiques sur 96**
  éditables. Le CMS ne liste que les zones **déjà en base** (2 595), mais `EditableZone`
  enregistre sa zone au montage → on peut en **créer**. **Un `grep` littéral de `page=`
  donne 4 faux positifs** : clé dynamique `` `destinations-${slug}` ``, helper `Z(...)`,
  variable `globalZones`, clé SEO tronquée `destinations-`.
- **10 tables référencées par le code sont absentes de la prod** : `cms_accommodations`,
  `cms_api_tokens`, `cms_audit_log`, `cms_post_revisions`, `cms_releases`,
  `cms_webhooks`, `cms_webhook_deliveries`, `cms_zone_variants`, `photo_blocks`, `media`
  (ce dernier = confusion `storage.from` → bucket). La migration
  `20261011120000_create_cms_backoffice_tables.sql` les crée et **n'est pas appliquée** ;
  `check:cms-drift` les liste dans `KNOWN_DRIFT` → CI verte malgré tout. **Sans
  `cms_audit_log`, aucune écriture CMS n'est traçable.**
- **5 routes appelées par le back-office n'existent pas** → 404 en prod :
  `/api/cms/{hospitality/accommodations,tokens,releases,releases/[id]/publish,agent-tasks}`.
  Sections « Hébergements B2B », « Jetons & Publications », « Contrôle des agents »
  inertes (route **et** table absentes). Détail :
  `docs/audit-2026-10-17/verification-capacites-cms.md`.
- `app/sitemap.ts` : pages statiques **codées en dur** (81 URL) ; publie `featured_image`
  — une mauvaise couverture part donc aussi au sitemap.
- `lib/home-data.ts` lit `destinations.published`, `DestinationsClient.tsx` lit
  `destinations.status` : **les 2 champs se contredisent** (41/41 `published=true` pour 7
  `status='published'`).
- **Deux régimes de rendu** : `madere`/`roumanie`/`montenegro` lisent la base
  (`fetchPillarData`) ; `sicile`/`lisbonne`/`suisse`/`zurich`/`paris` passent par
  `DestinationPage.tsx` (`DESTINATION_CONTENT` en dur). `/destinations/[slug]` ne sert que
  `coming_soon`.
- `ZoneImage` **masque l'image** si elle échoue (`onError`) → une image cassée fait un
  trou invisible ; sonder l'URL, pas le visuel. `destinations.article_count` est **lu**
  mais **jamais écrit** (vaut 0 partout).
- **Soft 404 (corrigé 2026-10-17)** : cause racine = un `app/loading.tsx` racine faisait
  partir la coquille en 200 **avant** `notFound()`. **Un `loading.tsx` à la racine casse
  les 404** — ne pas le recréer.
- `validateGardeFous` (`lib/brand-voice.ts`) a des **faux positifs** : `\bnous\s+en\b`
  capture « écris-nous en message » (tutoiement correct) ; `eeat` échoue sur la simple
  absence de mots-clés de terrain. Échec ≠ non-conformité.

## Médias

- Bucket `media` servi par
  `https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/...`.
  **Aucun rewrite `/images/...` → Storage** : un chemin local n'est servi que s'il existe
  dans `public/`. Le 2026-10-17 : **17 articles sur 41** désignaient ainsi leur couverture,
  **13 fichiers absents**, et ces URL partaient au sitemap.
- **14 articles non-roumains, dont 5 publiés, portaient une couverture photographiée en
  Roumanie** (toutes du 27/08/2026). **Cause racine non trouvée** ; aucune migration ne
  les assigne, donc **aucun garde-fou ne peut l'attraper** — croiser la base avec une
  inspection visuelle. Détail : `docs/audit-2026-10-17/couvertures-mauvaises-destinations.md`.
- **Inspection visuelle locale possible, sans clé** : `scripts/vision_check.py` (BLIP,
  CPU). ⚠️ Dépendances **non persistées** entre sessions ; le modèle **invente le nom du
  lieu** (« skopje » pour une photo GPS-vérifiée de Podgorica) — seule la description de
  *scène* est exploitable, un humain tranche. Procédure : `2026-10-17.md`.

## Coordination entre agents (`agent_tasks`)

- **Le registre Supabase `agent_tasks` est la vérité**, pas Discord/GitHub. Agents réels :
  `claude`, `jules`, `muse-spark`, `heldonica-brain`, `opencode`, `tous`, `gemini`,
  `discord-bot`, `antigravity`, `perplexity`. `done` = **fait ET vérifié**.
- **Serveur MCP `mcp/agent-tasks/server.mjs`** : 5 outils (`taches_en_attente`,
  `lire_tache`, `prendre_tache`, `rendre_compte`, `deposer_tache`), configuré par
  `.mcp.json` / `.gemini/settings.json` / `opencode.json`, identifié par `AGENT_NAME`.
  Pas de suppression, c'est voulu. **`test-client.mjs` écrit et supprime dans la table de
  production** : ne pas le lancer sans accord.
- **Le Brain (`heldonica-brain`) est un pont HTTP, pas un serveur MCP.** Il **poll**
  (`GET /api/brain/tasks?status=sent`, 30 s — il est derrière un NAT) et rend compte par
  `PATCH /api/brain/tasks/[id]`. Spec `.kiro/specs/brain-cms-bridge/` ; auth
  `lib/bridge-auth.ts` (`x-cms-auth` ou `Bearer $BRAIN_BRIDGE_TOKEN`) ; santé dans
  `site_settings.brain_heartbeat` (`online` = `last_seen` < 120 s). **Sa réponse arrive
  dans `actions_done.result`**, pas dans `notes`.
- **Corrigé le 2026-10-18** (PR #620) : `AGENTS_CONNUS` omettait `heldonica-brain`, et
  `deposer_tache` n'écrivait **ni `task_type` ni `payload`** — or le poller **dispatche
  sur `task_type`**. La tâche était dépilée puis **ignorée en silence** ; désormais
  refusée plutôt que perdue. **Écriture réelle vérifiée** (ligne `726bd019`, `task_type`
  et `payload` bien posés).
- **PR #620** (`agent/openhands/brain-mcp-propre`, ouverte le 2026-10-18) : open,
  mergeable, CI verte, **0 suppression**. Rebasee 2x sur `main` (PR #618 puis #619,
  qui touchaient les memes `CHANGELOG.md`/memoire -> fusions auto, sans conflit).
- **Le Brain était HORS LIGNE au 2026-10-18** : heartbeat figé au 2026-10-15T20:20:28Z
  (~61 h, seuil 120 s), BridgePoller arrêté sur la station Windows. Vérifier
  `site_settings.brain_heartbeat` **avant** de déposer une tâche : sinon elle reste `sent`.

## Base de données

- Écrire en production **uniquement** par migration versionnée dans
  `supabase/migrations/` (règle absolue n° 2). Vérifier le schéma réel via
  `information_schema.columns` : plusieurs tables diffèrent des anciens fichiers.
- Clés Supabase : 2 formats (JWT legacy `eyJ...`, et `sb_publishable_...` /
  `sb_secret_...`). Le nouveau va dans `apikey`, **pas** dans `Authorization: Bearer`.
- `supabase db push` peut exécuter les instructions d'un fichier **indépendamment** :
  vérifier l'état réel après coup. Piège de parseur : un `VALUES` SQL peut contenir `)`
  dans une valeur (`UNESCO (Bârsana & Ieud)`) → couper au premier `)` perd le tuple **en
  silence** (cf. `scripts/appliquer-plan-rest.mjs`).
- Les exports CMS (`.audit/`, dumps `db-*.json`) contiennent des **coordonnées de tiers**
  (e-mails clients dans `site_content` / `cms_editable_zones`). ⚠️ **`.audit/` et
  `.sauvegardes/` ne sont PAS dans `.gitignore`** (vérifié le 2026-10-18, alors que la
  mémoire affirmait le contraire) : ne **jamais** faire `git add -A` / `git add .` sur ce
  dépôt — stager les chemins explicitement. 0 fichier `.audit/` n'est suivi.

## Faux positifs déjà écartés (ne pas rouvrir)

- `/images/marker-icon*.png` : importés de `node_modules/leaflet`, bundlés par Next.
  `/images/uploads/exemple.jpg` : `placeholder=` d'un champ, jamais chargé.
- `/cms-admin` : redirection 301 vers `/panel-manager`. `lib/cms-seo-eeat.ts` : **code
  mort**. Pages « Bientôt » indexables : ce sont des **captures d'email**, ça se défend.

## Conventions

- `lib/brand-voice.ts` est la **vérité absolue** ; `brand.py` doit rester identique
  (`check:brand-sync`). B2C tutoie et dit « on » ; B2B vouvoie. Les prénoms des fondateurs
  n'apparaissent jamais dans le contenu public.
- Ajouter une entrée à `CHANGELOG.md` après tout changement notable.
