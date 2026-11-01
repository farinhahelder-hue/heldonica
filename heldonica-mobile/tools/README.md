# heldonica-mobile/tools — mesurer un montage vidéo avant de le publier

Quatre scripts de diagnostic pour les vidéos verticales (Reels 9:16) produites
pour le mobile. Ils servent la règle n°1 : **on ne publie pas ce qu'on n'a pas
regardé**. Un journal d'application qui annonce « fondu appliqué » ne prouve
rien ; ces outils lisent les pixels du fichier rendu.

## Pourquoi ils existent

Une mesure aveugle se lit trop facilement comme une preuve d'absence. C'est
écrit en tête de `soustitres.py`, et c'est l'erreur qui a motivé ces outils :

- une moyenne de luminance qui ne bouge pas ne prouve pas qu'un calque est
  absent — elle prouve seulement que la région mesurée est trop grossière ;
- une image lue sans sa matrice de rotation est **couchée** : le bas de l'écran
  part sur le côté, et on cherche un sous-titre au mauvais endroit.

Chaque script a été écrit après avoir conclu à tort une fois. Ils rendent la
vérification possible, pas seulement l'intention.

## Dépendances

`rotation.py` n'utilise **que la bibliothèque standard** — il tourne partout,
sans rien installer. Les trois autres lisent les pixels :

```bash
pip install -r heldonica-mobile/tools/requirements.txt
```

(`av` pour décoder, `numpy` pour les tableaux, `pillow` pour écrire les images.)

## Les outils

### `rotation.py <montage.mp4>`

Lit la matrice d'affichage de la piste vidéo (boîte `tkhd`) et affiche l'angle.

```
python rotation.py montage.mp4
→ rotation de la piste video : 90 deg
```

Un téléphone écrit l'image à plat et pose la rotation dans la piste : le
décodeur brut l'ignore, le lecteur l'applique. Les deux autres scripts
importent `angle_de()` pour ne jamais mesurer une image couchée.

### `images.py <montage.mp4> <instant> [<instant> …]`

Extrait une image PNG par instant demandé, **redressée** selon la rotation de la
piste, réduite au tiers (la pleine résolution d'un Reel pèse pour rien à l'écran).

```
python images.py montage.mp4 1.5 4.0 7.2
→ image-1_50.png : image a 1.51 s
```

Pour regarder ce qui est réellement écrit sur l'image : texte fixe, sous-titres,
incrustations.

### `luminosite.py <montage.mp4>`

Trace la luminance moyenne au fil du temps, une mesure par demi-seconde, puis
détaille autour du creux le plus sombre.

```
python luminosite.py montage.mp4
```

À la coupe, on attend un creux net vers zéro. Un profil qui ne descend jamais
sous la centaine veut dire que le fondu au noir **n'est pas appliqué** — quoi
qu'en dise le journal de l'application.

### `soustitres.py <montage.mp4>`

Cherche la signature d'un sous-titre incrusté dans le bas de l'image : du blanc
franc posé sur du noir franc, dans la même région, au même instant. Une scène
naturelle ne produit presque jamais les deux ensemble.

```
python soustitres.py montage.mp4
→ Signature la plus forte : 3.13 s (noir 0.1099, blanc 0.0008)
```

Une signature proche de zéro sur toute la durée = aucun sous-titre incrusté.

## Ordre d'usage conseillé

1. `rotation.py` — savoir si l'image est couchée (conditionne tout le reste).
2. `luminosite.py` — vérifier les fondus.
3. `soustitres.py` — vérifier la présence des sous-titres.
4. `images.py` — regarder de ses yeux les instants douteux.

## Vérifié

Les quatre scripts ont été exécutés sur les trois clips de
`public/videos/destinations/montenegro/` : `rotation.py` renvoie 0 deg (aucune
piste tournée), `luminosite.py` mesure 240 images sur 7,97 s, `soustitres.py`
conclut à aucune signature franche, `images.py` écrit ses PNG.
