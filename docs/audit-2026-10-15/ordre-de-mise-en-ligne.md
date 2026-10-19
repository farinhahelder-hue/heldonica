# Ordre de mise en ligne — Heldonica

État au **2026-10-16**. Branche `agent/openhands/audit-editorial-media-coherence`.

## ⚠️ Deux points de couplage code ↔ base

Ces deux contraintes ne sont pas négociables : les ignorer casse le rendu.

### 1. Les 14 pages « Bientôt » exigent leur migration

Le code des 14 pages lit maintenant `ComingSoonDestination`, qui n'utilise plus
les 25 anciennes zones. **Tant que la migration n'est pas appliquée, ces zones
sont orphelines** → `check:cms-zones` est rouge (11/12).

Pire, dans l'autre sens : **si on applique la migration avant de déployer le
code**, l'ancien code lit des zones désactivées et retombe sur ses props en dur —
c'est-à-dire **le charabia** (« Theatre » / « Grec. »). Le défaut reviendrait
le temps du décalage.

**Donc : déployer le code et appliquer la migration ensemble**, jamais l'un sans
l'autre.

### 2. Les descriptions SEO existent en double (code + base)

Les 9 descriptions réparées le sont **dans le code et dans une migration**. La
base fait autorité (`lib/page-metadata.ts` lit `cms_editable_zones`). Si on
applique la migration sans déployer le code, ou l'inverse, les deux versions
divergent — sans casse visible, mais le CMS et le code ne diraient plus la même
chose.

## État vérifié le 2026-10-17 (lecture seule)

**Le site est en mode maintenance** : `site_settings.maintenance_mode = "true"`.
Toutes les URLs publiques servent la page « En maintenance » (vérifié :
`/destinations/sicile/taormine` → HTTP 200, 84 582 octets, texte « En
maintenance… On prépare quelque chose pour toi »). **C'est une décision de mise
en ligne, pas un bug** — voir la règle n°4 d'`AGENTS.md`. Ne pas la désactiver
sans accord explicite.

**Aucune des 6 migrations n'est appliquée.** Vérifié par
`scripts/check-migrations-appliquees.mjs` (lecture seule) :

| Migration | État | Preuve lue en base |
|---|---|---|
| `…100000_remove_placeholder_zone_text` | ✗ | `taormine.intro_text` = « spot tourism… » |
| `…110000_seed_maramures_apuseni_zones` | ✗ | aucune zone pour `roumanie-maramures` |
| `…120000_fix_seo_descriptions` | ✗ | `seo_description` contient « ⭐ Secret Gem » |
| `…130000_fix_paris_tip` | ✗ | `paris.tip_2` contient « (équivalent) » |
| `…140000_subdest_coming_soon` | ✗ | `bogota.intro_text.is_active = true` |
| `…150000_blank_generic_local_tip` | ✗ | conseil générique actif sur **37 pages** |

**Garde-fous : 11/12.** Seul `check:cms-zones` échoue — c'est le couplage décrit
plus haut : le code de la branche utilise `ComingSoonDestination`, les 25 zones
des 14 pages sont encore actives en base. **Normal tant que la migration n'est
pas appliquée.** Une fois `…140000` appliquée, ce contrôle repasse au vert.

**Le site public tourne donc sur un contenu non corrigé** : charabia SEO
(« portype », « ⭐ Secret Gem »), conseil générique dupliqué sur 37 pages,
notes de rédaction (« Theatre » / « Grec. ») sur 14 pages. Rien de tout cela
n'est visible aujourd'hui — le mode maintenance masque tout.

## Deux façons d'appliquer (2026-10-17)

### A. Le bundle, en une transaction — recommandé

`docs/audit-2026-10-15/bundle-migrations.sql` (régénéré par `npm run migrations:bundle`)
contient les 6 migrations dans **une seule transaction**. À coller dans
**Supabase → SQL Editor → Run**. Si une instruction échoue, **rien** n'est appliqué.

Pourquoi pas `supabase db push` : il s'appuie sur l'historique de migrations. Les
156 fichiers du dépôt n'ont pas tous été appliqués par la CLI — 56 migrations
orphelines ont été rattrapées à la main le 19/08 — et l'historique n'est pas
lisible avec la clé publique (`supabase_migrations.schema_migrations` → 404). Un
`db push` pourrait donc **rejouer des dizaines de migrations déjà appliquées
manuellement**. Le bundle ne contient que le plan.

### B. Le script PowerShell

```bash
powershell -ExecutionPolicy Bypass -File scripts\appliquer-migrations.ps1
```
Préflight → push → vérification. Écarte les 2 migrations de vécu fabriqué.

### Après, dans les deux cas

```bash
npm run check:migrations     # doit afficher « appliquées »
npm run garde-fous           # check:cms-zones doit repasser au vert
```

Puis déployer le code, puis désactiver la maintenance (décision propriétaire).

## Ordre recommandé

1. **Appliquer les 6 migrations** (dans l'ordre des horodatages) :
   - `20261016100000_remove_placeholder_zone_text.sql` — 2 placeholders retirés
   - `20261016110000_seed_maramures_apuseni_zones.sql` — zones Roumanie
   - `20261016120000_fix_seo_descriptions.sql` — 9 descriptions réparées
   - `20261016130000_fix_paris_tip.sql` — conseil Paris
   - `20261016140000_subdest_coming_soon.sql` — les 14 pages « Bientôt »
   - `20261016150000_blank_generic_local_tip.sql` — 23 conseils génériques vidés
2. **Déployer le code** de la branche (build vert, `tsc` vert).
3. **Vérifier** que `check:cms-zones` repasse au vert (0 orpheline).
4. **Désactiver la maintenance** — décision propriétaire uniquement.

Les migrations sont réversibles (rollback en commentaire dans chaque fichier).
Elles ne suppriment rien : elles réécrivent des valeurs et désactivent des zones.

## Ce qui est prêt, ce qui reste

**Prêt dans la branche :**
- 9 descriptions SEO réparées (accents/espaces restaurés, suffixe marketing retiré)
- conseil Paris corrigé
- 14 pages sans matière basculées en « Bientôt », teasers des propriétaires
- 23 conseils génériques dupliqués retirés (bloc masqué proprement)
- 6 migrations au total (dont remove_placeholder et le seed maramures/apuseni)

**Reste à décider / faire par les propriétaires :**
- **Stoos** : 3 articles distincts, 2 redirigés en 301 vers le plus court — à
  trancher (obsolètes ou distincts ?). Je ne tranche pas : le dépôt prévient
  contre la suppression sur la foi d'un slug.
- **« Testé et vécu, loin de l'agitation »** (41 pages) : **vérifié — les
  propriétaires confirment que toutes les destinations ont été testées.** La
  mention est vraie, rien à retirer. Reste un arbitrage éditorial : **23 pages**
  portent 3 « pépites » identiques (creux mais vrais) — les garder ou masquer
  le bloc en attendant du contenu réel.
- **Photos** : les 14 pages « Bientôt » n'ont **aucune photo au site** (le voyage
  a bien eu lieu). Il faut **verser la matière** : photos du voyage, notes,
  adresses. Pas d'images génériques en attendant.
- **Coquille alentejo** : « les bus de tourists » → « les bus de touristes ».

## Contrôles

- Build : **OK** (`next build`, exit 0)
- TypeScript : **OK**
- 14/14 pages rendent « Bientôt », **0 charabia** dans le HTML prérendu
- Garde-fous : **11/12** — le 12e (`check:cms-zones`) passe au vert à l'étape 3
