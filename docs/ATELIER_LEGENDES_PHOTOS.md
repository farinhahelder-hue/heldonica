# Atelier Légendes & Photos — Heldonica

> **À quoi sert ce document.** Un guide de travail pour écrire une légende à partir
> d'une photo qu'on a déjà prise. Il ne remplace pas la source de vérité de la voix
> (`lib/brand-voice.ts`, `docs/GUIDE_VOIX_HELDONICA_IA.md`) : il l'applique à un cas
> concret, celui du blocage devant une image.

---

## 1. La règle d'or (avant tout le reste)

> **« On n'invente rien. On raconte ce qu'on a vécu. »**

Une légende se construit à partir d'un **souvenir**, jamais d'une idée. Si un détail
n'a pas été vécu, il ne s'écrit pas. Un bloc en moins vaut mieux qu'un détail inventé.

---

## 2. Pourquoi on bloque (et pourquoi ce n'est pas un manque d'idées)

On ne bloque pas parce qu'on n'a rien à dire. On bloque parce qu'on fixe une **page
blanche** et qu'on attend une « inspiration ». Or une légende n'est pas une création
ex nihilo : c'est **répondre à quelques questions sur une photo qu'on a déjà prise**.

Le travail n'est pas d'inventer, c'est de **se souvenir à voix haute**.

---

## 3. Les 3 questions à se poser devant la photo

1. **Qu'est-ce que je regarde en premier** sur cette image ?
   → donne le détail d'accroche.
2. **Qu'est-ce que j'ai senti, entendu, goûté** à cet instant ?
   → donne le sensoriel.
3. **Qu'est-ce que je dirais à un ami** qui veut y aller ?
   → donne le repère pratique.

Répondre aux trois, c'est déjà tenir ~80 % de la légende. Le reste n'est que de la
mise en forme.

---

## 4. Le squelette en 5 blocs (toujours le même)

| Bloc | Rôle | Longueur |
| :--- | :--- | :--- |
| 1 | **Le détail qui accroche** — un fait concret, jamais un jugement | 1 phrase |
| 2 | **Ce qu'on a ressenti** — matière, odeur, son, goût, vent | 2 à 3 phrases |
| 3 | **Le repère pratique** — lieu exact, meilleure heure, durée, prix réel | 1 phrase |
| 4 | **La question à « tu »** — pour ouvrir les commentaires | 1 phrase |
| 5 | **CTA doux + 6 à 8 hashtags ciblés** | 1 ligne |

---

## 5. Le gabarit à trous (à copier-coller)

```
[Bloc 1 — un détail précis, pas une opinion]
[Bloc 2 — ce qu'on a vu / entendu / senti là, à ce moment]

[Bloc 3 — le repère utile : lieu exact, meilleure heure, durée ou prix réel]

[Bloc 4 — et toi, tu [question liée à la photo] ?]

[Bloc 5 — CTA doux : « Lien en bio pour le carnet complet »]
#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6
```

---

## 6. Le tableau « photo → par quoi commencer »

Quand tu ne sais pas où attaquer, lis la colonne de gauche et démarre par la droite.

| Ce que tu vois sur la photo | Commence par (bloc 1) |
| :--- | :--- |
| Une assiette, une table | Le détail qui donne faim : texture, vapeur, geste |
| Un paysage, une ruelle | Le détail qu'une carte ne montre pas |
| Une façade, une porte | Ce qui se passe derrière, ou l'heure à laquelle on y était |
| Un détail (mains, tasse, tissu) | Le geste, le rythme, ce qu'il a fait remarquer |
| Un artisan, une personne | La rencontre : prénom, métier, la phrase dite |
| Un contre-jour, une lumière | L'heure, la saison, ce que la lumière changeait |

---

## 7. Démo de mécanique

> **Exemple illustratif**, repris de la donnée d'exemple de
> `PROMPT_TEMPLATE_INSTA.md` (crique près de Kotor, Monténégro). Ce n'est **pas** un
> contenu Heldonica à publier : c'est la mécanique des 5 blocs, à blanc.

```
Le sentier s'arrête net sur un escalier taillé dans la roche.

Quarante minutes de marche pour le trouver, et à l'arrivée : que le bruit des pins
et une eau translucide qui glace les chevilles dès le premier pas.

Gare-toi au village avant 10 h — après, la crique se remplit et le silence part avec.

Et toi, tu serais resté combien de temps avant de repartir ?

Lien en bio pour le carnet complet.
#SlowTravel #Montenegro #Kotor #BaignadeSauvage #HorsDesSentiersBattus #CarnetDeRoute
```

Chaque phrase sort d'un souvenir. Le bloc 3 est le seul qui « informe » ; les autres
font ressentir.

---

## 8. Les 3 règles non négociables (sinon le garde-fou refuse)

| Règle | Correct | À bannir |
| :--- | :--- | :--- |
| **Le duo = « on »** | « on a trouvé », « on est restés 2 heures » | « je », « nous » |
| **Le lecteur B2C = « tu »** | « si tu passes par là » | « vous », « les voyageurs », « les touristes » |
| **Le B2B = « vous »** | « votre établissement » | « tu », « les clients » |

Mots bannis les plus fréquents dans une légende de photo : **incontournable,
magnifique, incroyable, bon plan, spot, paradis, must-see, inoubliable**. La liste
complète et à jour est `FORBIDDEN_WORDS` dans `lib/brand-voice.ts` — c'est elle qui
fait foi, pas une liste recopiée à la main.

---

## 9. Auto-vérification avant publication

Cocher les 5 points :

- [ ] J'utilise **« on »** pour le duo, **« tu »** pour le lecteur — aucun « je », aucun « nous ».
- [ ] **Zéro mot banni** (relire la liste `FORBIDDEN_WORDS`).
- [ ] Au moins **un détail sensoriel** (odeur, texture, son, goût, matière).
- [ ] Un **repère pratique réel** (lieu exact, heure, durée ou prix).
- [ ] Une **question à « tu »** et un **CTA doux** (jamais agressif).

En cas de doute sur un mot, la fonction `validateGardeFous(text, 'b2c')`
(`lib/brand-voice.ts`) rend un score pondéré et liste les manquements. Un score
**≥ 85 %** est le seuil utilisé par le garde-fou `check:content-coherence`.

---

## 10. Banque d'accroches officielles (pour débloquer)

Ces accroches sont celles du manifeste éditorial (`HELDONICA_ACCROCHES`,
`lib/brand-voice.ts`). Les réutiliser comme point de départ quand rien ne vient :

- « On a décidé de partir en moins de deux heures »
- « C'est pas dans les guides — c'est sur place qu'on l'a trouvé »
- « On aurait pu rester assis devant notre écran, mais... »
- « Ce qu'on a vécu ce jour-là — aucune appli nous aurait soufflé ça »
- « Franchement, on pensait pas que ça nous marquerait autant »
- « On s'est regardés et on s'est dit : et si on en profitait ? »

---

## 11. Note pour les agents IA

- Ce document **décrit une méthode**, il ne contient aucun contenu éditorial destiné
  à publication. Les exemples du §7 sont illustratifs.
- La **source de vérité** de la voix reste `lib/brand-voice.ts` ; en cas de divergence,
  c'est elle qui l'emporte, et `scripts/check-brand-sync.mjs` vérifie que son miroir
  Python ne dérive pas.
- Ne jamais publier une légende qui n'est pas adossée à un vécu réel ou vérifiable
  (règle d'or, §1).
