# Vérification visuelle des photos — 2e passe, avec outil de vision

**Date** : 2026-10-17. **Ce document comble la principale limite de l'audit
précédent** (« inspection visuelle NON effectuée »). L'outil `scripts/vision_check.py`
(BLIP, local, sans clé) a été utilisé après installation de ses dépendances.

## 1. Ce que l'outil prouve, et ce qu'il ne prouve pas

**Prouve** : le *type de scène* (forêt, champ, littoral, rue urbaine).
**Ne prouve pas** : la localisation. Calibration du jour, sur des photos
**GPS-vérifiées** de Podgorica :

| Photo (vérifiée) | Ce que le modèle décrit |
|---|---|
| `sahat_kula.jpg` (tour de l'horloge, centre-ville) | « a clock tower in a town square with people sitting at tables » → **correct** |
| `podgorica-b.jpg` (mur à pochoir) | « a white wall with graffiti on it » → **correct** |
| `moraca_millennium.jpg` (pont) | « the city of **skopje, bulgarie** » → **nom inventé** |

→ La **description de scène est exploitable** ; le **nom de lieu rendu est faux**.
Le modèle lit correctement un sujet net, mais se trompe sur une scène large/complexe
(il a répondu « rural » pour une place urbaine). Toute conclusion reste donc un
**faisceau d'indices**, jamais une preuve de localisation.

## 2. Résultat sur les images que la 1re passe avait substituées

Cinq URL corrigées vers le bucket, puis inspectées visuellement :

| Fichier | Scène décrite | Cohérence avec la légende |
|---|---|---|
| `fanal_foret.jpg` | « a path through the forest in the fog » | ✅ **exacte** — « brume matinale… forêt primaire de Fanal » |
| `achadas_da_cruz.jpg` | « a rocky cliff », bord de mer | ✅ **cohérente** — falaise plongeant vers l'océan |
| `pico_do_arieiro.jpg` | « a man walking up a mountain with a sign » | ✅ **cohérente** — randonnée en altitude |
| `ponta_do_sol.jpg` | « a car driving down a road near the ocean » | ✅ **cohérente** — route en bord d'océan |
| `porto_moniz.jpg` | « the water is blue », bord de mer | ✅ **cohérente** — piscines naturelles volcaniques |

**Les 5 substitutions sont visuellement cohérentes.** C'est la confirmation qui
manquait en 1re passe (elles reposaient sur l'identité du nom de fichier).

## 3. Anomalie trouvée sur les images Roumanie — NON corrigée

L'album `roumanie-aout-2026` est intitulé **« 🇷🇴 Roumanie — Bucarest & Transylvanie »**
et ses **4 photos** portent toutes `location: 'Bucarest, Roumanie'`. Or :

| Fichier | Scène décrite par le modèle |
|---|---|
| `IMG_20260827_135023.jpg` | « a field with a few trees and a few houses » |
| `IMG_20260827_135025.jpg` | « a field with a few trees » |
| `IMG_20260827_135618.jpg` | « a field with a fence and a house in the distance » |
| `IMG_20260827_135834.jpg` | « a little girl is smiling while holding a piece of cake » |

**Aucune scène urbaine.** Deux éléments renforcent le constat :
- Le modèle est **capable** de reconnaître une ville (calibration ci-dessus), et il
  répond ici **« rural »** aux quatre.
- Les anecdotes écrites décrivent un tout autre sujet : « façades d'époque », « cour
  intérieure », « passage piéton couvert », « ruelles calmes de la capitale ».

**Conclusion — c'est un FAISCEAU, pas une preuve :** l'intitulé et les anecdotes
décrivent une **ville**, les images montrent une **campagne**. Deux lectures possibles,
**non tranchées** :
1. l'association image ↔ lieu est fausse (mauvais fichier rattaché à la fiche) ;
2. les photos ont été prises aux abords de Bucarest, en zone rurale.

⚠️ **Les propriétaires ont visité la Roumanie plusieurs fois** (confirmé) : cette
observation ne dit **rien** sur la réalité du voyage, seulement sur la **cohérence
entre l'image et le texte qui l'accompagne**. Seuls eux peuvent trancher.

### Exposition publique — mesurée

`GET /api/cms/photos/albums?albumId=roumanie-aout-2026` répond **sans aucune
authentification** (vérifié sur serveur local) et renvoie le titre, la période, les
`location` et les anecdotes. `middleware.ts` laisse volontairement passer les **GET**
sous `/api/cms` (ils alimentent le contenu public). Ces libellés ne sont donc **pas
internes** : ils sont lisibles par quiconque appelle l'API, et un brouillon généré
(`cms-draft-from-evidence`) en fait des blocs **`photo_evidence`** publiables.

## 4. Décision demandée aux propriétaires

Pour chacune des 4 images Roumanie : **le lieu est-il correct ?**
- Si oui → corriger les anecdotes pour qu'elles décrivent la scène réelle (champ,
  clôture, maison isolée, enfant au gâteau) au lieu d'une ville.
- Si non → retirer l'image de l'album plutôt que de la réaffecter au hasard.

**Aucune correction n'a été appliquée** : toucher à `location` ou aux anecdotes
reviendrait à inventer une localisation, ce que la règle n°1 interdit.

## 5. Limites qui subsistent

- Les **23 `featured_image`** d'articles en URL storage n'ont pas toutes été
  inspectées visuellement (échantillon : 5 Madère + 4 Roumanie).
- Les **13 couvertures cassées** ne peuvent pas être remplacées : aucune photo
  correspondante n'existe dans le bucket.
- Les dépendances de vision (`torch`, `transformers`) **ne sont pas persistées** :
  elles ont disparu en cours de session et ont dû être réinstallées. À réinstaller
  à chaque session qui veut refaire ce contrôle.
