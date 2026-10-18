# 5 couvertures réelles masquées par un placeholder

Constat du **2026-10-16**, vérifié en base **et** dans le code.

## Le constat

Cinq sous-destinations affichent `/og-default.jpg` (placeholder neutre) comme
image de couverture, **alors que leur propre `page.tsx` porte déjà une vraie
photo**, vérifiée joignable (HTTP 200).

| Page | Photo présente dans le code | Zone en base |
|---|---|---|
| `/destinations/madere/achadas-da-cruz` | `madere/achadas_da_cruz.jpg` (1,28 Mo) | `/og-default.jpg` |
| `/destinations/madere/ponta-do-sol` | `madere/ponta_do_sol.jpg` (1,16 Mo) | `/og-default.jpg` |
| `/destinations/madere/porto-moniz` | `madere/porto_moniz.jpg` (1,05 Mo) | `/og-default.jpg` |
| `/destinations/roumanie/bucarest` | `roumanie/IMG_20260827_135618.jpg` (6,70 Mo) | `/og-default.jpg` |
| `/destinations/roumanie/sibiu` | `roumanie/IMG_20260827_135023.jpg` (6,46 Mo) | `/og-default.jpg` |

## La cause racine (prouvée)

`EditableZone` résout sa valeur ainsi :

```
value = zones[`${page}__hero_image`] ?? fallback
```

`getPageZones()` (`lib/cms-zones.ts`) lit la table **via le client service**
(`createServiceClient()`, `lib/supabase.ts`). En production la zone est donc
présente et **écrase le fallback** du composant. Le code a beau contenir la
bonne URL, c'est la base qui s'affiche.

Les 5 zones ont été écrites le **2026-08-19T00:39:39** — soit **avant** que les
photos ne soient posées dans le code. La zone n'a jamais été mise à jour depuis.

## La preuve, et son piège

Le HTML prérendu de ces pages contient **les deux** URL, ce qui peut tromper :

- l'`<img>` du hero porte la **vraie photo** ;
- `/og-default.jpg` apparaît ailleurs (métadonnées, payload RSC).

Autrement dit : **le build ne reproduit pas la production.** `npm run build` ici
n'a pas de clé service (`SUPABASE_SERVICE_ROLE_KEY` absente de `.env.local`,
3 variables seulement) et journalise « Variables d'environnement manquantes […]
Utilisation du stub sécurisé pour le pré-rendu ». Les zones ne sont donc pas
lues au build, et le HTML prérendu montre les fallbacks.

**Conclusion méthodologique :** un build vert ne prouve pas le rendu de
production. Pour juger une couverture, il faut soit la valeur en base, soit
`next start` avec la clé service.

## Correctif préparé (non appliqué)

`supabase/migrations/20261016170000_restore_masked_hero_photos.sql` — idempotent,
il ne touche que les lignes encore sur `/og-default.jpg` et remet l'URL de la
photo **déjà présente dans le code**. Aucune invention, aucun média importé :
on remonte une photo existante que la base masquait.

**Validation propriétaire requise** (écriture en base de production).

## Vérification effectuée

- Les 5 URL répondent **HTTP 200** avec des tailles plausibles (1,0 → 6,7 Mo).
- Valeur stockée confirmée au caractère près : `'/og-default.jpg'`.
- Périmètre balayé : **51 pages** portant une zone `hero_image` active → **5**
  présentent ce cas, pas plus.

## Non vérifié

- Le rendu **visuel** des photos (je n'ai pas pu les afficher) : les fichiers
  sont nommés d'après le lieu (`achadas_da_cruz`, `ponta_do_sol`, `porto_moniz`)
  mais **un nom de fichier n'est pas une preuve de localisation**. La
  correspondance visuelle reste à confirmer par les propriétaires.
