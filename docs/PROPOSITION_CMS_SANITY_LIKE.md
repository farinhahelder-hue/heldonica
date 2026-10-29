# Proposition — aller vers un CMS « Sanity-like » sans quitter Supabase

**Date :** 2026-10-29
**Branche :** `agent/freebuff/cms-sanity-like-tracabilite`
**Statut :** proposition à valider — aucun code de production n'est modifié par ce document.
**Méthode :** lecture du dépôt (pas de déduction depuis la mémoire d'une session) ; chiffres et
chemins cités vérifiables par `grep`/`wc -l` sur ce commit.

---

## 1. Où en est le CMS aujourd'hui (mesuré, pas supposé)

| Brique | État réel dans le dépôt | Fichier |
|---|---|---|
| Modèle de blocs | 12 types dans une union discriminée (`text`, `heading`, `image`, `gallery`, `button`, `list`, `video`, `vault_spot`, `photo_evidence`, `map`, `table_of_contents`, `hospitality_spot`) | `types/cms-blocks.ts` |
| Point focal image | déjà au format Sanity (`hotspot {x,y}` normalisé 0..1, rendu en `object-position`) | `types/cms-blocks.ts`, `components/blocks/ImageBlock.tsx`, `components/admin/media/HotspotPicker.tsx` |
| Sérialisation | HTML + commentaire `<!-- heldonica:blocks {json} -->` pour le round-trip | `lib/cms-blocks-converter.ts` |
| Éditeur | un seul composant de ~3 380 lignes (canvas, gabarits, FAQ/verdict, album, studio logos, inspecteur AST JSON) | `components/admin/blocks/BlockCanvas.tsx` |
| Schémas déclaratifs | 4 fichiers au format Sanity (`name`/`fields`/`validation`) — **importés nulle part** (`grep` : 0 occurrence) | `schemas/article.ts`, `schemas/page.ts`, `schemas/destination.ts`, `schemas/index.ts` |
| Dépendances | aucune dépendance `sanity` ni `@portabletext/*` ; `@tiptap/*` est présent (39 dépendances au total) | `package.json` |
| Audit contenu | table `cms_audit_log` + `logCmsAudit()` + panneau « Journal d'audit » ; acteur = utilisateur CMS, pas agent | `lib/cms-audit.ts`, `app/panel-manager/AuditLogPanel.tsx` |
| Révisions | `article_revisions` (purge à 10 par article) et `cms_post_revisions` (lecture des 20 dernières) — deux historiques pour la même idée | `supabase/migrations/20260526000001_article_revisions.sql`, `20261011120000_create_cms_backoffice_tables.sql` |
| PR #767 (kilo) | apporte `RichTextBlock`/`TextSpan`, `DocumentMetadata`, `BlockInspector`, `CommandPalette`, `PreviewPane`, `CmsDocumentEditor` | branche `kilo/hollow-cliff-ke7` |

**Ce que ces chiffres disent.** Heldonica a déjà la *surface* d'un Sanity (blocs modulaires,
hotspot, click-to-edit, audit) mais pas son *socle* : rien ne décrit un document de façon
déclarative, rien ne valide un bloc à l'écriture, rien ne relie un bloc à une ressource
(image, pépite du Coffre) autrement que par une URL en texte, et l'éditeur est un monolithe.
Les schémas au format Sanity existent déjà mais sont du code mort : c'est le point de départ
le moins coûteux du chantier.

---

## 2. L'écart réel avec Sanity (brique par brique)

| Brique Sanity | Heldonica aujourd'hui | Écart à combler |
|---|---|---|
| Schema declarative (`defineType`/`defineField`) | `schemas/*.ts` non consommés + types TS écrits à la main | une seule source, consommée par le validateur, l'inspecteur et le rendu |
| Portable Text normalisé (`_type`, `_key`, `markDefs`, `children`) | `content: string` (+ `richText` partiel dans la PR #767) | spécification v1 stricte, avec clés stables et `markDefs` |
| Références entre documents (`{_type:'reference', _ref}`) | URL/image en texte libre, `spotId?: string` non résolu | table de résolution + intégrité référentielle vérifiée en CI |
| Assets (image = document avec dimensions, LQIP, alt) | URL Supabase Storage + `alt` optionnel | `cms_media` comme document, pas comme chaîne |
| Drafts / published (`drafts.<id>`, `_rev`) | colonnes `status` ; deux tables de révisions non reliées | paire brouillon/publié + concurrence optimiste |
| Requêtes typées / projections | `select('*')` dispersés dans les routes API | couche de requêtes typées, une projection par usage |
| Studio (canvas + inspector + palette + preview + présence) | un composant de 3 380 lignes, PR #767 qui découpe à moitié | découpage complet, puis présence |
| Preview / liens signés | `LivePreview` et `ArticlePreview` maison, pas de jeton | jeton de prévisualisation par document |
| Webhooks / releases | `cms_webhooks`, `cms_releases` migrés mais peu utilisés | publication groupée + invalidation ciblée |

---

## 3. Les trois contrats à poser d'abord (le socle, non négociable)

Tout le reste du plan en découle. Tant que ces trois contrats ne sont pas écrits, chaque
phase suivante réinventera sa propre vérité.

### C1 — Un registre de schémas exécutable

Un seul fichier par type de bloc, qui décrit : nom, titre, champs, validation, rendu d'aperçu.
Le registre est la source unique consommée par :

- le validateur d'écriture (routes API et MCP),
- l'inspecteur de blocs (`BlockInspector`),
- la palette de commandes (blocs disponibles, libellés),
- un garde-fou CI (`check:cms-schema`) qui refuse un `BlockType` sans schéma, sans rendu ou sans éditeur.

Le type TS `CmsBlock` reste la projection TypeScript du registre (types dérivés, pas dupliqués).
`schemas/*.ts` devient la matière première de ce registre — ou disparaît, mais il ne reste pas
du code mort.

### C2 — Portable Text v1 strict, pas un `richText` opportuniste

La PR #767 introduit un `richText` utile mais incomplet : pas de `_key`, pas de `markDefs`
(les liens sont des `href` portés par le span), pas de blocs personnalisés dans le flux
(une image au milieu d'un paragraphe n'est pas représentable). Le contrat cible :

- `children[]` avec `_key` stable (obligatoire pour l'édition collaborative et les diffs),
- `markDefs[]` pour les annotations (lien, note),
- `block` + types personnalisés (`image`, `vault_spot`, `photo_evidence`) dans le même tableau,
- un seul rendu : `blocksToHtml` et `TextBlock` consomment ce contrat, pas deux variantes.

Tant que ce point n'est pas tranché, la PR #767 mergée en l'état crée un troisième format
(après `content` et le commentaire JSON), et la dette augmente au lieu de diminuer.

### C3 — Une enveloppe de document

Un document CMS n'est pas « une ligne d'article » : c'est `{_id, _type, _rev, _updatedAt,
status, body[]}`. `_rev` permet la concurrence optimiste (« ta sauvegarde est refusée :
un autre agent a écrit entre-temps »), et `_id` sépare le brouillon du publié
(`drafts.<id>` / `<id>`), ce qui rend le statut `status` actuel redondant à terme.

---

## 4. Plan par phases

Chaque phase a un critère de sortie **mesurable**, et une seule raison d'être. Une phase qui
n'a pas son garde-fou CI n'est pas finie (règle des 16 garde-fous, `docs/AGENTS.md`).

### P0 — Socle déclaratif (le plus petit pas rentable)

- Créer `lib/cms-schema/` : un module par type de bloc (12 fichiers) + `index.ts` (registre).
- Valider avec `zod` (déjà dans l'écosystème Next, à confirmer côté `package.json` avant ajout).
- Brancher le registre dans `POST`/`PATCH` des routes articles et zones : refus en 422 avec le
  chemin du champ fautif, au lieu d'un bloc silencieusement incohérent.
- Garde-fou `check:cms-schema` : parité `BlockType` ↔ registre ↔ `BlockRenderer`.

**Sortie :** `npm run check:cms-schema` échoue si on ajoute un `BlockType` sans schéma ; les 12
blocs actuels passent. Aucun changement visible côté visiteur.

### P1 — Portable Text v1 et fin du triple format

- Livrer C2, fusionner la PR #767 après correction (pas avant).
- Migrer les `content: string` existants en un bloc `text` unique (script de migration
  idempotent, une seule passe, réversible par le commentaire JSON déjà présent).
- `blocksToHtml` devient une fonction de *dérivation* : le HTML est un cache
  (`content_html` + `content_hash`), plus une source.
- Mise à jour de `lib/cms-reading-metrics.ts` pour compter sur le contrat, pas sur `content`.

**Sortie :** un article contenant du gras, un lien et une image intercalée se relit sans perte
après `htmlToBlocks(blocksToHtml(blocks))` — test de round-trip sur les 12 types.

### P2 — Assets et références

- `cms_media` devient un document (`_id`, dimensions, format, alt obligatoire, bucket).
- Les blocs image/galerie/photo portent `{_type:'reference', _ref}` + `hotspot`, pas une URL.
- Résolution en une requête par lot (jamais une requête par bloc).
- Garde-fou : `check:cms-references` — toute `_ref` doit exister ; toute image publiée doit
  avoir un `alt` non vide et ne pas pointer vers le bucket privé `prive/enfants/`.

**Sortie :** renommer un fichier dans Storage ne casse plus un article ; une image privée
publiée par erreur fait échouer la CI (règle AGENTS.md n°5, incident du 18/10/2026).

### P3 — Brouillons, publication, révisions

- C3 : enveloppe de document, `_rev`, paire brouillon/publié.
- `article_revisions` et `cms_post_revisions` fusionnent en un seul historique immuable,
  avec restauration (« revenir à la révision N ») et diff lisible.
- Publication = copie brouillon → publié, jamais une édition en place.

**Sortie :** deux onglets qui sauvegardent le même article produisent un conflit détecté, pas
un écrasement ; une restauration remet le document exact (comparaison d'empreinte).

### P4 — Studio : découper `BlockCanvas`

- Extraire `BlockCanvas` en `BlockCanvas` (rendu) + `BlockInspector` (propriétés) +
  `CommandPalette` (insertion) + `PreviewPane` (aperçu) + `useDocumentHistory` (undo/redo).
- La PR #767 fournit une base pour quatre de ces cinq pièces ; l'extraction doit se faire
  par petits commits, avec `vitest` vert à chaque étape, pas en un seul diff de 2 700 lignes.
- Ajouter la présence (« qui édite ce document ») **après** le découpage, pas avant.

**Sortie :** aucun fichier de `components/admin/blocks/` au-delà de 500 lignes ; le test
`SanityKillerCms3` reste vert sans être modifié.

### P5 — Requêtes typées, preview, publications groupées

- Une fonction par lecture (`getArticleForPublic`, `getArticleForEditor`), projection explicite.
- Jeton de prévisualisation par document (signé, expiration courte, `no-store`).
- `cms_releases` : publier N documents en une opération, invalider les tags correspondants.

**Sortie :** une page publique ne peut plus lire un brouillon (test), et une publication
groupée de 5 documents n'émet qu'une invalidation par tag.

---

## 5. Ce qu'on ne fait pas

- **Installer Sanity.** Le studio Sanity tourne hors Next, sur un autre hébergement, avec un
  autre modèle d'auth : ce serait un second CMS à côté du premier. On emprunte les concepts,
  pas le paquet.
- **GROQ.** Le moteur est PostgreSQL + PostgREST. Une couche de fonctions typées donne 90 %
  du bénéfice sans nouveau langage à apprendre ni à parser.
- **Une migration « big bang ».** La base est partagée avec une autre application
  (`docs/CMS_FOUNDATION_PHASE_0_INVENTAIRE.md` §2) : chaque migration nomme ses tables.
- **Créer une table sans migration versionnée** : `agent_tasks`, `cms_audit_log` et les
  5 tables legacy rattachées le 28/10 rappellent le coût de l'inverse.
- **Toucher au mode maintenance** : décision de mise en ligne, pas technique.

---

## 6. Décisions humaines à prendre avant P1

1. **Portable Text ou HTML assaini ?** Le contrat C2 est le bon choix pour un éditeur riche ;
   il coûte une passe de migration. Alternative moins chère : garder `content` en HTML et
   n'ajouter que des marks en ligne — mais on garde le triple format.
2. **PR #767 : merger avant ou après C2 ?** La merger avant fige un format intermédiaire.
   Recommandation : récupérer les quatre composants, corriger `richText` selon C2, merger après.
3. **Un ou deux historiques de révisions ?** Fusionner `article_revisions` et
   `cms_post_revisions` demande de choisir ce qu'on garde des deux (le trim à 10 vs 20).
4. **Périmètre du studio.** Le CMS édite aussi des zones `global` et des pages : le registre
   de schémas doit-il couvrir ces documents dès P0, ou seulement les articles ?

---

## 7. Ordre de merge recommandé

```
P0 (registre + garde-fou)  →  P1 (Portable Text v1, PR #767 corrigée)
   →  P2 (assets/références)  →  P4 (découpage du studio)
   →  P3 (brouillons/révisions)  →  P5 (requêtes/preview/releases)
```

P4 avant P3 est volontaire : découper l'éditeur rend les brouillons testables ; l'inverse
oblige à écrire la logique de conflit dans un composant de 3 380 lignes.
