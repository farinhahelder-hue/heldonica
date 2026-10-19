# Validation qualité du contenu — Heldonica

Audit mené le **2026-10-16**, base Supabase joignable. Lecture seule.
Méthode : les **7 garde-fous de la marque** appliqués par la fonction du dépôt
`validateGardeFous()` (`lib/brand-voice.ts`) — pas une réimplémentation. Seuils
définis par le projet lui-même : `passe ≥ 85/100`, `excellent ≥ 95/100`.

Fichier de données complet : `qualite-contenu.csv` (41 articles, une ligne
chacun).

---

## 1. Résultat global — articles de blog (41)

| Mesure | Valeur |
|---|---|
| Articles lus | **41** |
| Score ≥ 85 (passe) | **38 / 41** |
| Score ≥ 95 (excellent) | **17 / 41** |
| Contenant un mot banni | **1** |
| `auto_generated` | **0 / 41** (tous `manual`) |

**Lecture honnête : la qualité de rédaction est globalement bonne.** 93 % des
articles passent le seuil de la marque. Ce n'est pas un chantier de réécriture.

## 2. Ce qui ne va pas — par ordre de gravité

### P1 — Deux articles quasi identiques, tous deux publiés et indexés

| id | slug | mots | statut |
|---|---|---|---|
| 1 | `stoos-ridge-notre-aventure-crete-panoramique` | 715 | publié |
| 91 | `stoos-ridge-notre-aventure-sur-la-crete-panoramique` | 1 067 | publié |
| 31 | `stoos-ridge-coucher-soleil-traversee-funiculaire` | 946 | publié |

**Preuve.** Les deux premiers partagent au moins **6 phrases entières** de plus de
8 mots, dont : « On avait vérifié la météo la veille : ciel dégagé prévu. »,
« En arrivant en haut, un tapis de nuages couvrait la vallée. », « On a hésité
dix minutes sur le banc du départ. », « On s'est arrêtés vingt minutes sans rien
dire. », « Pas la plus technique, pas la plus longue — la plus *juste*. ».
Les titres ne diffèrent que par « sur la » et « des Alpes suisses ».

**Les trois sont dans `sitemap.xml`** (vérifié en production). C'est un
signal de contenu dupliqué pour les moteurs, et deux entrées qui se concurrencent.

**Origine probable.** La différence de longueur (715 vs 1 067 mots) et la
similitude des phrases suggèrent un **enrichissement d'un article par-dessus un
autre** plutôt qu'une duplication accidentelle.

**Action.** *Validation propriétaire requise* : conserver l'article 91
(le plus complet), traiter 1 en redirection ou le supprimer. **Je n'ai rien
supprimé ni redirigé** — dépublication et changement d'URL sont hors de mon
périmètre sans accord.

### P1 — Du contenu de secours codé en dur s'affiche sur des pages publiées

**Observé, sur le rendu réel** (serveur local alimenté par la vraie base).
Page **`/destinations/paris`, publiée**, un conseil visible affiche :

> « Monter au Miradouro **(équivalent)** du Sacré-Cœur à l'aube »

Le mot « (équivalent) » est une **note de rédaction restée dans le texte**. La
formulation trahit la copie depuis la fiche Lisbonne (« Miradouro » est
portugais ; Paris n'en a pas).

**Cause racine.** `app/destinations/[slug]/DestinationPage.tsx` porte une carte
`DESTINATION_CONTENT` de 5 destinations (sicile, lisbonne, suisse, zurich,
paris) en **dur dans le code**, présentée comme « fallback technique tant que le
CMS n'a pas été appliqué/seeded ». Pour ces pages, le texte vient du **code**,
pas du CMS — contrairement à `madere`, `roumanie`, `montenegro` qui lisent la
base. Deux régimes de vérité cohabitent.

**Gravité modérée, à ne pas gonfler** : ce n'est pas du contenu inventé, c'est du
contenu **vrai mais figé et non pilotable**, avec une scorie de rédaction. Le
composant étant serveur, il ne fuit pas dans le bundle client.

**Action.** Retrait du « (équivalent) » = correction déterministe (faite dans la
branche). La migration de ces 5 pages vers le CMS est une décision de fond.

### P1 — Faux 404 : des pages inexistantes répondent HTTP 200

**Mesuré sur le serveur local :**

| URL | HTTP |
|---|---|
| `/destinations/bogota` (brouillon) | **200** |
| `/destinations/zzz` (inventé) | **200** |
| `/blog/inexistant-zzz` | **200** |
| `/xyz-inexistant` | 404 (correct) |

La page affiche « Destination introuvable », mais le code HTTP est **200**. Les
moteurs voient donc une page valide là où il n'y a rien : c'est la définition
d'un *soft 404*. À noter : `/xyz-inexistant` renvoie bien 404, le mécanisme
fonctionne ailleurs — la cause est donc locale à ces routes.

### P2 — `article_count` vaut 0 partout : la donnée n'est jamais écrite

**Observé.** Sur les 41 destinations, `article_count = 0`, y compris pour
`madere` et `roumanie` qui comptent pourtant de nombreux articles dédiés.

**Cause racine.** Le champ est **lu** (`DestinationCard.tsx:83`,
`DestinationComparison.tsx:155`) mais **aucun code ne l'écrit** (recherche dans
`app/` et `lib/`). Conséquences : le badge « N articles » ne s'affiche jamais sur
les cartes, et le tableau comparatif affiche 0 partout.

### P2 — « Notre regard Heldonica » : une formule d'usine dans 7 articles

**Observé.** La locution apparaît **à l'identique** dans 7 articles, toujours
introduisant un paragraphe de verdict :

> … (prix). **Notre regard Heldonica** Un voyage préservé qui suscite l'admiration…

Concernant : `maramures-roumanie-authentique`, `roumanie-villages-caches`,
`itineraire-slow-travel-roumanie-bucarest-apuseni`,
`les-meilleures-brasseries-authentiques-de-zurich-guide-2026`,
`lisbonne-ruelles-alfama-miradouros-azulejos`,
`kotor-a-laube-remparts-venitiens-bouches-de-kotor`,
`petrovac-na-moru-sentier-pins-criques-forteresse`.

**Interprétation prudente.** Cela ressemble à un **gabarit de verdict** appliqué
mécaniquement. Ce n'est pas une faute de marque en soi — c'est un tic de
génération qui uniformise la voix. **À confirmer par vous** : est-ce voulu ?

### P2 — Une fin de paragraphe coupée et un mot banni

- **`maramures-roumanie-authentique`** : contient « **au cœur de** », mot banni
  (`lib/brand-voice.ts`). Contexte : « un décor unique **au cœur de** la vallée
  sauvage ». Score 80, sous le seuil.
- **Fins non ponctuées** (8 articles) : le corps se termine sans ponctuation
  finale, signe d'un copier-coller tronqué. Dont `prego-no-bolo-do-caco`,
  `pepites-mystiques-de-madere`, `pudim-de-nata-recette`,
  `poncha-recette-authentique`, `ballade-du-vendredi-soir-…`.
  **À vérifier au cas par cas** : cela peut être un artefact de nettoyage HTML.

### P3 — Le CTA « Instagram » n'est pas tutoyé (1 article)

`ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature` (score **65**, le plus
bas) se termine par :

> « 👉 Retrouvez les photos et stories sur notre Instagram Heldonica 📸
> **Partagez vos souvenirs** et **vos recommandations** en commentaire ! »

Le corps est bien tutoyé (« tu »), mais le CTA final passe au **vouvoiement** —
rupture de voix sur un contenu publié. Correction simple : « Partage**s** **tes**
souvenirs ».

---

## 3. Deux alertes de méthode — le score seul trompe

**a) Le garde-fou « pronouns » produit des faux positifs.**
`lisbonne-ruelles-alfama-miradouros-azulejos` est signalé (score 80) à cause de
la regex `\bnous\s+en\b` qui capture « écris-**nous en** message ». Or c'est un
**tutoiement correct**. L'article est **faux positif** : ne pas le « corriger ».

**b) Le garde-fou « eeat » échoue sur 19 articles, mais ne prouve rien.**
La détection cherche des mots-clés de terrain (`on a testé`, `en 202`, `sur
place`…). Un article peut parfaitement être vécu sans employer ces mots. Ces
19 signalements sont donc **« à vérifier par un humain », pas des défauts**.
Exemple : `maramures-train-moitie-siecle` échoue « eeat » alors qu'il raconte un
trajet réel.

**Je ne présente donc pas « 19 articles non conformes »** : je présente 19
articles dont la conformité E-E-A-T **n'est pas démontrable automatiquement**.

---

## 4. Destinations — le vrai déséquilibre

| Mesure | Valeur |
|---|---|
| Destinations en base | 41 |
| Publiées | **7** |
| Brouillons | 28 |
| `coming_soon` | 6 |
| Avec contenu de fond (intro + itinéraire + budget + FAQ) | **3** |

**Les 3 seules destinations avec du contenu de fond** : `roumanie`, `madere`,
`montenegro`. Les intro_narrative sont authentiques et de bonne facture
(« On a découvert le Monténégro en fuyant la Croatie bondée de l'été… »).

**Les 4 autres publiées** (`paris`, `sicile`, `colombie`, `lisbonne`) ont
**0 champ de fond** : leur page est portée par le **code**, pas par la base.

**Champs vides sur l'ensemble** : `local_insider_tips` **0/41**,
`intro_narrative` **3/41**, `itinerary` **3/41**, `budget_details` **3/41**,
`faq` **3/41**. Seul `excerpt` est rempli (41/41).

**Ce n'est pas une anomalie technique** : les brouillons sont en cours de
rédaction, c'est normal. **Ce qui mérite attention**, c'est que 4 pages
**publiées** s'affichent avec du contenu codé en dur, sans contenu de fond en
base.

---

## 5. Ce que je n'ai pas pu valider

| Contrôle | Raison |
|---|---|
| Jugement visuel des photos | Aucun accès à la vision d'image depuis cette session |
| Vérification du « vécu » | Non vérifiable techniquement — votre parole seule |
| Rendu mobile réel | Pas d'appareil ; jugé par le code, pas à l'écran |
| Test des écritures en base | Exigerait une modification de production |
| Cohérence du contenu B2B | `/expert-hotelier` non audité en profondeur |

---

## 6. Décisions qui vous reviennent

1. **Articles Stoos dupliqués** : lequel garder ? (je recommande l'id 91)
2. **« Notre regard Heldonica »** : gabarit voulu, ou à varier ?
3. **5 pages à contenu codé en dur** : à migrer vers le CMS ?
4. **19 articles signalés « eeat »** : à relire humainement — le vécu est-il
   réellement documenté (dates, saisons) ?
5. **Faux 404** : faut-il renvoyer un vrai 404 ? (impact SEO)
