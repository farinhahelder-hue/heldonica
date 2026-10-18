# Verser les photos Google Photos dans le site

Constat : **le chemin existe déjà, il a déjà servi.** Pas besoin de script, pas de
terminal, pas de clé à manipuler. Tout se fait depuis le CMS.

## La page

**`/panel-manager/photos`** — « Import Google Photos depuis le CMS ».

Vérifié dans `middleware.ts` : `/panel-manager` est dans la liste
`maintenanceExcludes`. **Le CMS reste accessible pendant la maintenance** —
tu peux verser tes photos sans remettre le site en ligne.

## Comment ça marche (3 temps)

1. Tu ouvres une session → Google affiche **ta** photothèque dans une fenêtre de
   sélection.
2. Tu coches les photos que tu veux.
3. Le CMS les télécharge, extrait **GPS + horodatage**, et les range dans
   `cms_media`.

C'est la voie officielle : depuis mars 2025, Google **interdit** de lister une
photothèque entière par API (`albums.list` et `mediaItems.search` → 403). Le
Picker est la seule voie restante. L'application ne voit que ce que tu coches —
elle n'accède jamais au reste.

## ⚠️ Le point à ne pas rater : le champ « Destination »

Le champ `destination` ne désigne pas la page : il désigne le **dossier** de
rangement. Le code fait :

```
dossier = destination → destinations/<dossier>/
```

Donc, pour les pages qui posent problème aujourd'hui :

| Ce que tu veux illustrer | À taper dans « Destination » |
|---|---|
| Les 12 sous-pages de Madère (Funchal, Faial, Ponta do Sol…) | **`madere`** |
| Les 4 pages Île-de-France (Paris, Versailles, Giverny, Fontainebleau) | **`idf`** |
| Les 3 pages Normandie | **`normandie`** |
| Porto | **`porto`** |

Le champ est libre : c'est toi qui décides du nom de dossier. **Prends un nom
simple et cohérent**, sinon tu obtiendras `destinations/Madère/` et
`destinations/madere/` côte à côte.

## Rien n'est automatique ensuite

Vérifié : **aucun code ne rattache une photo importée à une page**. L'import
remplit la photothèque, c'est tout. Il reste **deux gestes manuels** :

1. **La couverture de chaque page.** Les 23 pages du groupe A ont encore
   `heroImage="/og-default.jpg"` en dur dans leur `page.tsx`. Il faut choisir
   l'image de couverture dans l'éditeur de la page (zone `hero_image`).
2. **Les pépites.** Les trois titres (« Découvertes calmes », « Artisanat &
   Nature », « Points de vue ») sont **écrits en dur** dans `page.tsx` **et**
   dans les zones CMS. Les zones CMS sont prioritaires : c'est donc en base
   qu'il faut les remplacer, pas dans le code.

## Ce que ça débloque

Une fois `madere` alimenté, tu peux :
- illustrer les 12 pages (couvertures + images de corps) ;
- remplacer les 3 pépites génériques par de vraies pépites ;
- **et le registre de preuves fonctionne** : `scripts/photos_evidence.py` lit
  les GPS + horodatages des photos pour produire `content/evidence/<lieu>.json`,
  qui autorise enfin le garde-fou `check:content-evidence` à valider les
  affirmations de vécu — aujourd'hui il ne couvre que la Roumanie, faute de
  registre ailleurs.

## Le seul point non vérifié

Le jeton d'accès Google (`GOOGLE_PHOTOS_REFRESH_TOKEN`) peut avoir été révoqué.
Ce cas s'est déjà produit : le commentaire du code note qu'un jeton mort est
resté **19 jours sans être remarqué**, et rien n'avait été importé pendant ce
temps. C'est justement pour ça que la page affiche désormais l'état de la
connexion **au chargement** : si tu vois « non connecté », il faut régénérer le
jeton avec `scripts/auth_google_picker.py` (une fois).

Je n'ai pas pu tester l'import moi-même : la sélection se fait dans l'interface
Google, avec ton compte. **La vérification de bout en bout t'appartient.**

## Ordre suggéré

1. Ouvrir `/panel-manager/photos`, vérifier que la connexion est verte.
2. Importer **`madere`** en premier (12 pages concernées, c'est le plus gros gain).
3. Poser les couvertures des 12 pages dans l'éditeur.
4. Puis `idf`, `normandie`, `porto`.
5. Remplir les pépites au fur et à mesure.
