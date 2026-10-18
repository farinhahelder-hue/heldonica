# Les 14 pages « pépites dégénérées » : peut-on les retravailler ?

Audit du **2026-10-16**. Question posée : « Peut-tu retravailler 14 pages ? »

> **⚠️ CORRECTION (2026-10-16, information propriétaire)**
> Les propriétaires confirment que ces destinations **ont été vécues**
> (« Toutes testées »). Ce document disait « aucune trace de voyage » : c'est
> faux au sens propre. Il n'y a **aucune trace au site** (ni photo, ni article,
> ni note) — mais le voyage, lui, a eu lieu. La conclusion opérationnelle ne
> change pas (on ne peut pas écrire ces pages **maintenant**), mais la raison
> change : ce n'est pas « on n'y est pas allés », c'est « **on n'a pas encore
> versé la matière** ». Ces pages sont à **alimenter**, pas à jeter.

## Réponse courte

**Non — pas en rédigeant du contenu.** Et ce n'est pas une question de temps ou
de compétence : c'est que **la matière n'est pas au site**.

Retravailler ces pages proprement demanderait d'écrire ce qu'on a vu, mangé,
payé, où on a dormi. Or pour ces 14 destinations, **le site ne contient aucune
trace** : ni photo, ni article, ni note. Écrire quand même serait **inventer du
détail non documenté** — la règle n°1 du dépôt, et exactement l'inverse de la
promesse de la marque (« slow travel vécu en duo »).

## Ce que j'ai vérifié (et non supposé)

J'ai cherché une source de contenu réel, à quatre endroits. Les quatre sont vides.

| Source cherchée | Résultat |
|---|---|
| **Photothèque** (`cms_media`, 1 601 photos) | **Aucune photo.** Seulement Monténégro (1 398), Roumanie (147), Lisbonne (50). Rien pour Sicile, Sardaigne, Colombie, Normandie. |
| **Articles de blog** (41) | **Aucun** sur Sicile, Sardaigne, Colombie, Normandie. (À titre de comparaison : Madère en a 6.) |
| **Champs riches** `destinations` (`intro_narrative`, `itinerary`, `faq`, `local_insider_tips`) | **Vides** (`None` / `[]` / `{}`). |
| **Image de couverture** des 14 pages | `/og-default.jpg` — **le placeholder générique**, pas une photo. |

**Conclusion factuelle :** ces 14 pages ne sont pas « mal écrites ». Ce sont des
**brouillons jamais remplis**. Le bloc « Pépites » contient des pense-bêtes
(`Theatre` / `Grec.`, `Etna` / `Volcan.`) — des notes de rédaction, pas du texte.

## Les 14 pages concernées

Sicile : `catane`, `etoile`, `palerme`, `syracuse`, `taormine`
Sardaigne : `alghero`, `asinara`, `cagliari`, `costa-smeralda`, `nuoro`
Colombie : `bogota`, `cali`, `cartago`, `medellin`

Toutes sont `is_active = true` : **visibles** dans la grille des
sous-destinations et **dans le sitemap**. Ce sont des `page.tsx` statiques, donc
le mécanisme `status = 'coming_soon'` (utilisé par la route `[slug]`) **ne
s'applique pas** à elles en l'état.

## Les options honnêtes

**Option 1 — « Bientôt » (recommandée).** Basculer les 14 sur le gabarit
`ComingSoonDestination` **déjà présent** dans le dépôt (celui de la Grèce). Il
dit clairement « en préparation », garde les URL et le sitemap, et a l'air
**intentionnel** plutôt que bâclé. Nécessite une phrase d'accroche par
destination — voir l'avertissement ci-dessous.

**Option 2 — Masquer.** `is_active = false` sur les 14 lignes
`cms_sub_destinations`, retrait du sitemap, et la page renvoie un vrai 404.
Propre, mais on perd le référencement des URL.

**Option 3 — Publier tel quel.** Non recommandé : « 🏛️ Theatre / Grec. » sur une
marque qui vend du vécu fait plus de dégâts qu'une page absente.

**Option 4 — Vous fournissez la matière.** Photos du voyage + quelques souvenirs
(une adresse, un plat, une galère), et je rédige des pages réelles. C'est la
seule voie vers de **vraies** pages.

## ⚠️ Un avertissement sur l'accroche « Bientôt »

Je peux écrire les accroches, **mais** elles doivent rester **documentaires ou
prospectives** (« ce qu'on prépare », la géographie, la saison) — **jamais** un
vécu. Le gabarit Grèce montre la bonne tonalité :

> « La Grèce qu'**on prépare**, c'est celle d'avant les foules. »

Ce n'est pas une affirmation de visite. Je peux reproduire ce registre pour les
14, et vous validez chaque phrase avant publication. **Je ne glisserai aucun
détail de terrain que vous ne m'ayez pas donné.**

## Ce que je peux faire sans rien inventer, dès maintenant

Indépendamment des 14 pages, ces réparations sont **déterministes** (aucun fait
ajouté) :

1. **Nettoyer les 7 descriptions SEO** : retirer les suffixes « ⭐ Hidden Gem » /
   « Secret Gem » et **restaurer** les accents et espaces mangés
   (« Le portype » → « Le port typique », « L ile prison » → « L'île prison »,
   « pecheurs » → « pêcheurs »).
2. **Corriger** la page Paris : « Miradouro (équivalent) » → formulation française.
3. **Retirer les 2 URLs Stoos obsolètes** du sitemap.
4. **Neutraliser** les blocs « Pépites » dégénérés : masquer la section plutôt
   que d'afficher des fragments (à combiner avec l'option 1 ou 2).

Tout cela touche la **production** → j'attends votre accord.
