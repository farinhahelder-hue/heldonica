# Couvertures d'articles associées à de mauvaises destinations (P1)

**Constat du 2026-10-17, 4e passe.** Trouvé en croisant la base de production
(`cms_blog_posts`) avec une inspection **visuelle** des images (outil BLIP local,
voir `verification-visuelle-2.md`).

## 1. Ce qui est prouvé

**14 articles non-roumains portent une couverture photographiée en Roumanie**
(fichiers `…/media/destinations/roumanie/…`, tous datés du 27/08/2026), dont
**5 sont publiés**.

### Publiés — visibles par le public

| Article | Couverture actuelle | Ce que l'image montre vraiment |
|---|---|---|
| `greve-reserve-naturelle-suisse` | `IMG_20260827_135834.jpg` | une petite fille tenant un gâteau |
| `flotter-sur-la-limmat-zurich-aventure` | `DJI_20260827_222212_341.jpg` | un bateau sous la pleine lune |
| `les-meilleures-brasseries-authentiques-de-zurich-guide-2026` | `DJI_20260827_222245_344.jpg` | la pleine lune dans les nuages |
| `guide-pratique-comment-debuter-le-slow-travel-en-duo` | `IMG_20260827_191138.jpg` | un pré, des arbres, des montagnes |
| `petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine` | `IMG_20260827_191155.jpg` | un homme et une femme en randonnée |

Aucune de ces 5 images ne montre un sujet suisse, zurichois ou culinaire.

### Brouillons — non publiés

`bomaye-burger-paradis`, `check-list-pour-randonnee-en-famille-en-montagne`,
`les-restaurants-a-faire`, `nos-experiences`, `nos-recettes`,
`petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine` (2e ligne),
`petits-pains-fromagers-express-a-la-poele-inspiration`, `slow-travel-retour`,
`zurich`.

### Propagation à l'aperçu social — mesurée dans le code

`app/blog/[slug]/page.tsx:97` :

```ts
const ogImageUrl = post.og_image || post.featured_image || ogFallbackUrl(...)
```

Les 5 articles publiés ont `og_image_url` **vide** en base : l'image de partage
social retombe donc **sur la couverture fautive**. Le défaut n'est pas seulement
visuel sur la page, il part aussi dans les aperçus de partage.

## 2. Ce qui est déduit

- L'ampleur (14 articles) **dépasse une erreur de saisie isolée** : le motif est
  systémique.
- Les images fautives proviennent **toutes** du même dossier et de la même journée
  (27/08/2026), ce qui suggère une sélection par défaut plutôt qu'un choix manuel
  répété.

## 3. Ce qui reste à confirmer — cause racine NON établie

Je n'ai **pas** trouvé la cause racine. Ce qui a été écarté, par vérification :

- **Aucune migration versionnée** n'assigne ces images (`grep` sur
  `supabase/migrations/*.sql` : vide). Ce n'est donc pas reproductible depuis le
  dépôt, ce qui explique qu'aucun garde-fou ne l'ait attrapé.
- La migration `20260924110000_align_drafts_editorial_and_photos.sql` écrit bien des
  `featured_image` roumaines, mais **uniquement sur des articles roumains** (`id`).
- Le repli global `VERIFIED_PHOTO_ALBUMS[0]` (`lib/cms-draft-from-evidence.ts:157`)
  désigne le **Monténégro**, pas la Roumanie — il **n'explique pas** ce cas, même
  s'il reste un motif fragile à corriger séparément.

**Hypothèse non vérifiée** : une opération manuelle (script jetable, import) hors
dépôt. Non prouvable depuis cette session.

## 4. Pourquoi ce n'est PAS corrigé automatiquement

Choisir une couverture de remplacement suppose de savoir **quelle photo convient à
quel article** — pour Zurich, la Grève, la Limmat, un guide générique ou une recette.
Aucune photo correspondante n'existe dans le bucket pour ces sujets (voir
`registre-medias.md`). Substituer une image « plausible » serait exactement ce que la
règle n°1 interdit.

**Recommandation neutre, sans invention** : basculer ces articles sur
`/og-default.jpg` (visuel de marque non trompeur), le temps que les bonnes photos
soient fournies. Cela supprime l'erreur sans affirmer quoi que ce soit de faux.

## 5. Décision demandée

Pour chacun des 5 articles publiés :
- fournir une photo du bon lieu, **ou**
- autoriser le passage à `/og-default.jpg` en attendant.

**Non fait** : toute écriture en base, toute dépublication, tout changement de slug.
