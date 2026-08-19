# Heldonica — repère pour agents IA

Ce fichier est le point d'entrée pour tout agent IA (Claude, Gemini, ou autre)
qui travaille sur ce repo. Plusieurs sessions/outils différents interviennent
en parallèle sur ce projet — lis ceci avant de toucher au code ou à la base.

## À lire ensuite, selon ce que tu fais

- **Tu écris ou corriges du contenu (article, caption, page)** → `docs/GUIDE_VOIX_HELDONICA_IA.md`
  (règles de voix, pronoms, garde-fous) et `lib/brand-voice.ts` (implémentation, mots bannis).
- **Tu veux savoir ce qui a changé récemment** → `CHANGELOG.md`. Ajoutes-y une entrée
  après tout changement notable, pour que les autres sessions ne redécouvrent pas
  ce que tu viens de faire.
- **Tu modifies la base Supabase** → règle absolue plus bas.

## Ce qu'est Heldonica

Média et concepteur de voyages slow travel, duo fondateur. Deux volets :
- **B2C** : carnets de route, guides destinations, Travel Planning sur-mesure.
- **B2B** : accompagnement d'hôteliers indépendants (`/expert-hotelier`).

Les prénoms des fondateurs ne sont jamais utilisés dans le contenu public —
portraits indéfinis ("l'un", "l'autre") si besoin de les évoquer.

## Règles absolues (non négociables)

1. **On n'invente rien.** Contenu éditorial, témoignages, images : tout doit
   correspondre à une réalité vécue ou vérifiable. Un témoignage désactivé
   (`is_active = false`) vaut mieux qu'un témoignage inventé — voir l'incident
   du 19/08 dans `CHANGELOG.md`.
2. **Toute écriture en base de production passe par une migration versionnée**
   dans `supabase/migrations/`, jamais par un script jetable exécuté à la main.
   C'est cette règle enfreinte pendant des mois qui a produit 56 migrations
   orphelines à rattraper en une seule session le 19/08 — ne pas recommencer.
3. **Ne jamais committer de clé Supabase (ou autre secret) en clair dans le code.**
   Un `service_role` legacy est resté exposé publiquement 2 mois avant d'être
   trouvé et révoqué le 19/08. Toujours lire depuis `process.env`.
4. **Le mode maintenance (`site_settings.maintenance_mode` + variable Vercel
   `MAINTENANCE_MODE`) est piloté intentionnellement.** Ne jamais le désactiver
   sans confirmation explicite de l'utilisateur — c'est une décision de mise en
   ligne, pas un détail technique.

## Pièges déjà rencontrés (pour ne pas les refaire)

- `supabase db push` et `supabase db query -f` peuvent exécuter les instructions
  d'un fichier **indépendamment les unes des autres** (pas toujours dans une
  transaction unique) : une instruction plus loin dans le fichier peut échouer
  sans annuler celles d'avant. Vérifier l'état réel après une migration
  multi-instructions plutôt que de supposer un tout-ou-rien.
- Les clés Supabase existent en deux formats en ce moment : legacy JWT (`eyJ...`)
  et nouveau format (`sb_publishable_...` / `sb_secret_...`). Le nouveau format
  n'est pas un JWT — ne pas l'envoyer dans `Authorization: Bearer`, seulement
  dans le header `apikey` (voir `lib/supabase-edge.ts` pour le pattern adaptatif).
- Plusieurs tables ont un schéma en base différent de ce que suggèrent d'anciens
  fichiers de migration (créations manuelles antérieures). Toujours vérifier le
  schéma réel (`information_schema.columns`) avant d'écrire une requête ou une
  nouvelle migration sur une table existante.

## Garde-fous CI (doivent rester au vert)

`.github/workflows/garde-fous.yml` exécute à chaque PR/push vers `main` :
`tsc --noEmit`, `check:cms-zones` (zones CMS orphelines), `check:cms-drift`
(dérive de schéma), `check:content-coherence` (voix éditoriale). Les lancer
en local avant de pousser : `npm run check:cms-zones && npm run check:cms-drift
&& npm run check:content-coherence && npx tsc --noEmit`.
