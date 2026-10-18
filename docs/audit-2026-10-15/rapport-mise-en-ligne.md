# Peut-on mettre le site en ligne ? — diagnostic de mise en ligne

Audit du **2026-10-16**. Question : mettre le site en ligne « au plus vite »,
malgré des incohérences.

## Verdict en une phrase

**Le site n'est pas cassé — mais une quinzaine de pages affichent du texte de
remplissage visible.** Ce n'est pas un problème de code : c'est un problème de
**contenu en base**. Les corrections sont courtes, mais elles touchent la
production et demandent ton accord.

## Ce qui va bien (mesuré, pas supposé)

- **121 pages sur 123** du sitemap se rendent proprement, sans placeholder,
  sans `undefined`, sans `NaN`, sans page d'erreur.
- Les deux seules exceptions sont **déjà redirigées** (HTTP 308) vers la bonne
  URL — c'est du ménage SEO, pas une casse visiteur.
- Les 12 garde-fous passent (dont `tsc` et 77 fichiers de tests).
- L'authentification CMS est saine (session HMAC, pas de mot de passe de repli).

Autrement dit : **l'ossature est bonne**. Ce qui reste, c'est du contenu.

## ⚠️ Une limite de méthode que je dois signaler

**Mon aperçu local n'a pas de Supabase configuré** (`/api/cms/zones` répond
`Supabase not configured`). Le rendu local montre donc les **fallbacks du code**,
pas ce que verra un visiteur en production, où la base fait autorité.

J'ai donc **vérifié directement en base** les mêmes points. Résultat : la base
contient **les mêmes défauts, et davantage**. **La production est au moins aussi
dégradée que ce que je décris — jamais moins.** Aucun chiffre ci-dessous ne
repose sur le seul rendu local.

---

## Les problèmes, par gravité

### P1 — Contenu de remplissage **visible** par le visiteur

**1. Quatorze pages affichent des « pépites » réduites à des mots-clés.**
C'est le défaut le plus choquant : le bloc s'appelle « Pépites dénichées à X »,
et il affiche des fragments. Exemples **relevés en base** :

| Page | Ce qui s'affiche |
|---|---|
| Taormine | 🏛️ *Theatre* / *Grec.* — 🌊 *Isola Bella* / *Plage.* — 🚌 *Corvette* / *Gare.* |
| Catane | *Etna* / *Volcan.* — *Duomo* / *Cathedrale.* |
| Palerme | *Palazzo* / *Normans.* — *Capo* / *Marche.* |
| Étoile (Sicile) | *Vulcano* / *Boue.* — *Malvasia* / *Vin.* |
| Asinara | *Anes* / *Blanchis. Partout.* — *Prison* / *Ex-colonie.* |
| Syracuse, Cagliari, Nuoro, Alghero, Costa Smeralda, Bogota, Cali, Cartago, Medellin | même schéma |

Ce texte est **aussi dans le code** (`const highlights = […]`) : ce n'est donc
pas un problème d'affichage, c'est bien le contenu qui est inachevé.

**2. Sept descriptions SEO sont du charabia.** Elles alimentent le `<title>`, la
`meta description`, OpenGraph et Twitter (`lib/page-metadata.ts`) :

| Page | Description en base |
|---|---|
| Costa Smeralda | « Le nord.millionnaires, plages incredible en Sardaigne… » |
| Pays d'Auge | « Le portype. Mais hors saison, c'est magic. Lesaufs sur le port… » |
| São Vicente | « Le nord forgotten. Grottes, plage noire, eoliennes en ⭐ Hidden Gem… » |
| Camara de Lobos | « Le village de pecheurs. Le plus authentique en ⭐ Hidden Gem… » |
| Asinara | « L ile prison. Ane blanchis, exclusivite en ⭐ Hidden Gem… » |
| Achadas da Cruz, Faial, Santos, Ponta do Sol, Étoile | suffixe « ⭐ Secret Gem » |

**Cause racine** : un gabarit automatique a collé un suffixe marketing anglais
(« ⭐ Hidden Gem ») derrière un **fragment d'introduction tronqué**. La troncature
a mangé les espaces et les accents (« Le port typique » → « Le portype »,
« L'île prison » → « L ile prison », « pêcheurs » → « pecheurs »). Ces valeurs
sont figées dans `supabase/migrations/20260804000002_cms_seo_zones.sql` **et**
dans les `page.tsx`.

**3. Trente-sept pages partagent la même phrase de « conseil local »**,
générique et sans valeur :

> « Prends le temps de visiter les lieux d'intérêt en début de matinée et
> d'échanger avec les habitants pour dénicher les meilleures adresses de
> quartier. »

Sur une marque qui vend du **vécu**, un conseil identique sur 37 destinations
détruit la crédibilité. Seules 5 pages ont un vrai conseil spécifique.

**4. Une coquille « intraduisible »** : page Paris, conseil n°2 —
« Monter au **Miradouro (équivalent)** du Sacré-Cœur à l'aube ». « Miradouro »
est portugais, le « (équivalent) » est une note de rédaction restée en clair.

### P2 — Finitions

- **Sitemap** : 2 URLs Stoos obsolètes (elles redirigent en 308, mais un sitemap
  ne devrait lister que les URLs canoniques).
- **Faux 404** : `/destinations/zzz` et `/blog/inexistant-zzz` répondent
  **HTTP 200** en affichant « introuvable ».

### P3 — Déjà traité

- Taormine : l'intro en code a été nettoyée (commit `43f6cf2`), mais **la base
  garde l'ancienne valeur** — voir la recommandation ci-dessous.

---

## Ce que je recommande, dans l'ordre

**Option rapide et honnête (recommandée).** Publier avec les pages saines, et
**retirer du menu/sitemap les 14 pages aux pépites dégénérées** le temps de les
rédiger. Un site de 100 pages solides vaut mieux que 120 dont 14 sont
visiblement bâclées — surtout pour une marque dont l'argument est le vécu.

**Option complète.** Rédiger les pépites des 14 pages + les 7 descriptions +
les 37 conseils. C'est du travail éditorial réel : **je ne peux pas l'inventer**
(la règle absolue du dépôt est qu'on n'invente rien). Il faut vos souvenirs de
voyage.

**Ce que je peux faire sans rien inventer :**

1. **Supprimer les suffixes marketing** (« ⭐ Hidden Gem ») des 7 descriptions et
   **restaurer les accents/espaces** perdus — c'est de la réparation, pas de la
   création.
2. **Neutraliser** les 14 blocs de pépites dégénérés (masquer la section plutôt
   que d'afficher des fragments) — un bloc absent vaut mieux qu'un bloc bâclé.
3. **Dédupliquer** les 37 conseils : garder un conseil générique **honnête** là
   où il n'y a rien de spécifique, et supprimer la fausse promesse.
4. Corriger « Miradouro (équivalent) » et les 2 URLs du sitemap.

Tout cela touche **la base de production** ou le contenu publié : **j'attends
votre feu vert** avant d'écrire.

---

## Correction d'un constat antérieur

Dans mon premier rapport j'avais écrit que « 12 articles publiés ont des images
de couverture manquantes ». **Ce constat venait d'un aperçu local sans Supabase**
et n'est **pas confirmé en production** — je le retire tant qu'il n'est pas
revérifié contre la base réelle. Je préfère vous le dire que vous laisser
publier sur une base fausse.

---

## État technique

- Branche `agent/openhands/audit-editorial-media-coherence`, arbre propre,
  14 commits, **rien de poussé**, aucun PR, mode maintenance **intact**.
- Garde-fous : **12/12**.
- Aperçu local : serveur sur le port 12005 (sans Supabase — d'où la limite
  ci-dessus), arrêtable à tout moment.
