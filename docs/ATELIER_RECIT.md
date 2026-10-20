# Atelier récit — écrire un carnet depuis tes photos

> Pour le propriétaire. Tu ne rédiges rien. Tu réponds à quelques questions
> courtes, en vrac, et le texte se tisse depuis tes réponses.

## Pourquoi cet outil existe

L'« Interview Éclair » du CMS (`lib/cms-photo-interview.ts`) pose 3 questions
**par photo**. Avec 147 photos de Roumanie, cela fait 147 interviews — impraticable.
L'atelier récit pose les questions **par journée et par moment**, jamais par photo :
une dizaine de questions pour un voyage entier.

## Ce que l'outil ne peut pas faire

Il **n'invente rien**, et c'est garanti par construction :

- une réponse vide ne produit **aucune phrase** (vérifié par test) ;
- une question sans réponse n'est jamais comblée par une formule de remplissage ;
- les lieux ne viennent que de toi (les photos n'ont pas de GPS exploitable) ;
- les prix, odeurs, ressentis ne viennent que de toi.

Si tu ne réponds pas à la question « moins aimé », le paragraphe « ce qu'on a
moins aimé » **n'existe pas**. Le silence reste un silence.

## Les deux commandes

```bash
# 1. fabriquer le questionnaire depuis tes photos
npm run recit:questions

# 2. après avoir rempli questions.md, tisser le brouillon
npm run recit:tisser
```

Avant cela, il faut un `voyage.json` : voir « Reconstituer le voyage » plus bas.

## Remplir le questionnaire

Ouvre `imports/<slug>/questions.md`. Pour chaque moment, tu trouveras :

```
### Moment 2 — 19:07 -> 19:35 (71 photos)

- **Ou etiez-vous ? (2-4 mots : « centre de Brasov », « col de la Transfagarasan »)**
  REPONSE lieu :
- **Qu'est-ce que vous faisiez ? (une phrase, meme courte)**
  REPONSE faisait :
```

Tu écris après les deux-points. **En vrac, en abrégé, avec des fautes.** Une ligne
suffit. Exemple :

```
  REPONSE lieu : centre de Brasov
  REPONSE faisait : on cherchait un endroit pour manger
  REPONSE sensoriel : odeur de pain chaud, cloches a midi
  REPONSE moins_aime : la circulation
```

Laisse vide ce dont tu ne te souviens pas. C'est prévu, et c'est sans risque.

## Ce que produit `recit:tisser`

Un `brouillon.md` avec :

- le récit, une section par journée, écrit au « on » ;
- les blocs Heldonica (`<!-- heldonica:blocks [...] -->`) prêts à coller dans le
  BlockCanvas du CMS ;
- une liste d'alertes : moments sans réponse, mots bannis retirés.

**Rien n'est publié.** Le brouillon est un fichier local. Tu le relis, puis tu le
colles dans le CMS si tu le valides.

## Reconstituer le voyage

`voyage.json` est produit par le script existant :

```bash
# depuis les photos de la médiathèque CMS
python scripts/reconstituer_voyage.py --photos-cms roumanie --slug roumanie-2026

# ou depuis un export Timeline du téléphone (apporte les lieux)
python scripts/reconstituer_voyage.py --timeline Timeline.json --slug roumanie-2026
```

### Ce que les photos peuvent et ne peuvent pas dire

| Fait | Disponible ? |
|---|---|
| Date et heure de prise de vue | **Oui**, sur 159 photos sur 160 |
| Regroupement en moments (séries de prises de vue) | **Oui**, calculé automatiquement |
| Lieu | **Non** — Google retire le GPS des fichiers exportés par le Picker |
| Prix, ressenti, odeur | **Non** — seul toi peux les donner |

Le GPS manquant n'est pas un défaut de tes photos : c'est Google Photos qui
l'efface à l'export. Deux façons de récupérer les lieux :

1. **La question « Où étiez-vous ? »** — le plus simple, ça marche tout de suite.
2. **L'export Timeline du téléphone** — plus automatique, mais l'export n'existe
   que sur mobile (Google Maps → profil → Vos trajets → ⋮ → Paramètres de
   localisation et confidentialité → Exporter les données Timeline).

## Limites connues

- Les heures affichées sont celles stockées en base, étiquetées UTC mais
  correspondant à l'heure locale du lieu. Pour la Roumanie (UTC+3 en août),
  l'affichage est donc l'heure vécue. Vérifié sur photo : `IMG_20260827_134657`
  (Xiaomi) et `PXL_20260827_180658` (Pixel, réglé en UTC) donnent tous deux
  l'heure locale correcte.
- Le tissage est volontairement simple : il enchaîne tes phrases, il ne les
  reformule pas. C'est le prix de la garantie « rien n'est inventé ».
