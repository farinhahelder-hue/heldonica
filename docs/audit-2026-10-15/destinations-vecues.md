# Destinations vécues — ce que disent les sources

> ## ⚠️ CORRECTION — information propriétaire du 2026-10-16
>
> **Les propriétaires confirment : « Toutes testées. »**
>
> Toutes les destinations du site ont été **vécues** par le duo. Les sources
> ci-dessous ne disent donc **pas** où le duo est allé — elles disent
> **où le site dispose de matière** (photo, article, note) pour l'écrire.
>
> Ce document a été écrit en supposant que l'absence de trace = absence de
> voyage. **C'était une inférence, et elle est fausse.** Les tableaux sont
> conservés (les chiffres restent exacts) mais leur lecture est corrigée :
> « aucune trace » signifie « **rien au site pour l'écrire** », jamais
> « pas vécu ».
>
> **Conséquence directe** : la mention « Testé et vécu » est **légitime sur les
> 41 pages**. Il n'y a rien à retirer. La seule question qui reste est
> éditoriale : comment écrire ces pages **quand la matière arrivera**.

État au **2026-10-16**. Question posée : où la mention « Testé et vécu » est-elle
légitime ?

## Méthode

J'ai cherché une liste de « destinations vécues » dans **quatre** sources
indépendantes, sans en supposer aucune :

| Source | Ce qu'elle prouve |
|---|---|
| `cms_media` (photos en base) | Un lieu a été photographié → GPS + horodatage |
| `cms_blog_posts` (articles) | Un carnet a été écrit sur place |
| `destinations.intro_narrative` | Le « Ce qu'on a vécu » rédigé par les propriétaires |
| `lib/cms-vault-spots.ts` (78 fiches) | Le Coffre des Savoirs — « données vécues certifiées » |

Le fichier `scripts/photos_evidence.py` confirme la doctrine du projet : **une
photo (GPS + horodatage) est la seule preuve de vécu autorisée.**

## Ce qui est OBSERVÉ

| Destination | Photos | dont GPS | Articles | Fiches Coffre | « Ce qu'on a vécu » |
|---|---|---|---|---|---|
| **Monténégro** | 1 398 | 1 398 | 5 | 4 | oui |
| **Roumanie** | 147 | 0 | 11 | 8 | oui |
| **Lisbonne** | 50 | 50 | 1 | 4 | — |
| **Madère** | 0 | 0 | 10 | 10 | oui |
| **Suisse / Stoos / Zurich** | 0 | 0 | 6 | 10 | — |
| **Paris / Île-de-France** | 0 | 0 | 5 | 8 | — |
| **Transylvanie / Maramureș** | 0 | 0 | 6 | 4 | — |

Les trois `intro_narrative` (les seuls récits de vécu écrits en base) :
Monténégro, Madère, Roumanie.

## Ce qui est DÉDUIT

**Le partage est net, mais il ne dit pas ce que je croyais :**

- **Matière déjà au site** : Monténégro, Roumanie, Lisbonne, Madère,
  Suisse/Stoos/Zurich, Paris, Transylvanie/Maramureș.
- **Rien au site, alors que le voyage a eu lieu** : **Sicile, Sardaigne,
  Colombie, Normandie, Porto** (les propriétaires confirment le vécu).

Fait notable : les **14 pages déjà basculées en « Bientôt »** (Sicile ×5,
Sardaigne ×5, Colombie ×4) sont **exactement** celles sans matière au site. La
décision « Bientôt » était donc juste — non parce que le voyage n'a pas eu lieu,
mais parce qu'**il n'y a rien à raconter encore**. C'est une distinction qui
compte : ces pages ne sont pas à jeter, elles sont à **alimenter**.

## Les 3 cas à confirmer (désormais secondaires)

| Destination | Photos | Articles | Statut |
|---|---|---|---|
| **Normandie** (3 pages) | 0 | 0 | Vécue (confirmation propriétaire) ; matière à réunir |
| **Porto** (1 page) | 0 | 0 | Vécue ; matière à réunir |
| **Fontainebleau / Giverny / Versailles** (3 pages) | 0 | 0 | Vécues ; matière à réunir |

La question n'est donc plus « est-ce vécu ? » (oui, partout) mais
« **avez-vous des photos et des notes** à verser pour ces lieux ? ».

## Conséquence concrète (corrigée)

La mention « **Testé et vécu, loin de l'agitation** » s'affiche sur **41 pages**.
Elle est **vraie partout** : rien à retirer.

Ce qui reste discutable n'est **pas** la véracité de la mention, c'est sa
**valeur éditoriale** :

- **23 pages** affichent **trois « pépites » identiques** (« Découvertes
  calmes », « Artisanat & Nature », « Points de vue »). Ce n'est pas faux — c'est
  **creux**. Trois pépites identiques sur 23 pages ne renseignent personne.
  Madère (12), IdF (4), Normandie (3), Roumanie (3), Porto (1).

## Les 3 « pépites » : mesure exacte, page par page

Vérifié zone par zone (`highlight_1/2/3_title`) sur les 41 pages. **Deux groupes
nets :**

**Groupe A — 23 pages, texte 100 % générique** (identique au caractère près) :
« Découvertes calmes » / « Artisanat & Nature » / « Points de vue ».

| Région | Pages |
|---|---|
| Madère | achadas-da-cruz, cabo-girao, camara-de-lobos, cote-est, estreito, faial, funchal, ponta-do-sol, portela, ribeiro-frio, santos, sao-vicente (12) |
| Île-de-France | fontainebleau, giverny, paris, versailles (4) |
| Normandie | cote-albatre, le-havre, pays-dauge (3) |
| Roumanie | bucarest, sibiu, transylvanie (3) |
| Porto | porto (1) |

**Groupe B — 18 pages, notes spécifiques mais télégraphiques** (noms de lieux
réels, non rédigés) :

- Sicile (5) : `Etna | Duomo | Marche`, `Vulcano | Malvasia | Découvertes calmes`…
- Sardaigne (5) : `Remparts | Neptune | Vermentino`, `Gennes… | Transhumance | Orgosolo`…
- Colombie (4) : `Grafitti | Musee | Monserrate`, `Salsa | Feria | Canqui`…
- Madère/Porto Moniz, Lisbonne, Roumanie/Brașov, Roumanie/Cluj (4)

Les 14 pages du groupe B situées en Sicile/Sardaigne/Colombie sont **déjà en
« Bientôt »** : leurs notes sont donc masquées aujourd'hui.

**Ce que ça dit** : le groupe A n'a **rien** de spécifique à afficher — d'où le
texte générique. Le groupe B a des **notes de terrain** (« Etna », « Anes »,
« Prison ») : de la matière brute, à rédiger, pas à jeter.

**Action proposée** : demander aux propriétaires de **remplir les 23 pages du
groupe A** avec de vraies pépites (ils y sont allés — la matière est dans leurs
souvenirs et leurs photos). En attendant, décider si on garde le bloc générique
(creux mais vrai) ou si on le masque.

## Limites

- La photothèque ne contient **que 1 601 photos** (Monténégro 1 398, Roumanie 147,
  Lisbonne 50). Ce sont les photos **importées**, pas les photos **existantes**.
  Madère a 10 articles et 0 photo importée : les photos existent probablement,
  elles ne sont pas au site.
- `cms_media` dit ce qui a été **versé**, pas ce qui a été **vécu**.
- Les sources disent où le duo est allé ; elles ne disent pas **quand** pour
  Madère/Suisse/Paris (pas d'horodatage importé).
