# Plan de test — application mobile et panneau d'édition

> Une chose à la fois. Chaque test dit quoi faire, et à quoi on voit que ça a marché.
> Si un test échoue, note-le et passe au suivant : ils sont indépendants.

**Version d'application concernée : 1.0.18 ou plus récente.**
Le numéro est visible dans Paramètres Android → Applications → Heldonica Mobile.

---

## Le lieu s'écrit à la main — ce n'est pas un bug

Android retire les coordonnées GPS des photos que son sélecteur transmet à une
application, et il n'existe aucun moyen documenté de les récupérer. Vérifié sur le
téléphone : la photo portait bien ses coordonnées, l'application n'en recevait
aucune.

Ce qui arrive quand même : **la date de prise de vue**. C'est elle qui date le
carnet et alimente le registre de preuves.

Pour le lieu, deux moyens sous le champ :

- **« Je suis sur place »** — prend la position actuelle du téléphone. Juste
  seulement si tu publies depuis l'endroit même.
- **« Trouver l'adresse »** — complète l'adresse une fois la position connue.

Sinon, tu écris le lieu. C'est une ligne à taper, pas une panne.

> Les coordonnées du voyage, elles, entrent par la carte **Photos du voyage** :
> ce chemin passe par Google Photos et rapatrie le fichier d'origine, EXIF complet.

---

## 1. Publier une photo depuis le téléphone

| Étape | Ce que tu fais | Ce que tu dois voir |
|---|---|---|
| 1.1 | Ouvrir l'application | Cinq cartes, sous « Que veux-tu faire ? » |
| 1.2 | Toucher **Publier une photo** | L'écran « Publier », avec un bouton violet |
| 1.3 | **Choisir des photos** → en prendre 2 ou 3 de Roumanie | « 2 photo(s) sélectionnée(s) » sous le bouton |
| 1.4 | Regarder le champ **Lieu** | Vide, et l'application dit pourquoi. Écris le lieu, ou touche « Je suis sur place » |
| 1.5 | Écrire une phrase dans **Ce que tu as vécu là** | Le texte s'affiche |
| 1.6 | Toucher **Créer le brouillon** | « Envoi en cours… », puis un message de réussite |
| 1.7 | Toucher la touche **Retour** d'Android | Tu reviens à l'accueil de l'application — elle ne se ferme pas |

**Vérification finale** : carte **Articles et carnets** → le brouillon apparaît en tête,
marqué `draft`. Il ne part pas en ligne tant que tu ne l'as pas publié toi-même.

---

## 2. Les quatre écrans d'édition

Chaque carte doit ouvrir **directement** sa section, sans passer par le tableau de bord.

| Carte | Ce qui doit s'afficher |
|---|---|
| **Articles et carnets** | Le titre « Articles », la liste, le bouton « Nouvel article » |
| **Carrousels Instagram** | L'éditeur de diapositives, format carré 1080×1080 |
| **Photos du voyage** | « Import Google Photos », avec le champ Destination |
| **Apparence du site** | « Personnalisation du site », onglets Theme / Presets / Couleurs / Polices |

En haut à droite, un bouton porte le nom de la section (« Articles », « Design »…).
Il ouvre la liste complète des sections, et « Fermer » la referme.

---

## 3. Un carrousel Instagram, de bout en bout

| Étape | Ce que tu fais | Ce que tu dois voir |
|---|---|---|
| 3.1 | Carte **Carrousels Instagram** | L'éditeur, une diapositive vide |
| 3.2 | Écrire un titre sur la diapositive 1 | Le texte apparaît dans l'aperçu |
| 3.3 | **Photo de fond** | Une grille de vignettes issues de la médiathèque |
| 3.4 | Choisir une photo | Elle passe en fond de la diapositive |
| 3.5 | Ajouter une deuxième diapositive | Deux vignettes dans la pellicule, en bas |
| 3.6 | Exporter | Les images se téléchargent |

> Si la grille de l'étape 3.3 est vide, passe d'abord par **Photos du voyage** pour
> importer des photos depuis Google Photos.

---

## 4. Le montage vidéo (sur ordinateur)

L'export vidéo se fait dans le navigateur, en direct : **l'onglet doit rester au
premier plan** pendant tout l'enregistrement. Réduit ou passé en arrière-plan, le
fichier produit est vide — c'est une limite du navigateur, pas un réglage.

| Étape | Ce que tu fais | Ce que tu dois voir |
|---|---|---|
| 4.1 | Panneau → **Montage vidéo** | La ligne de temps |
| 4.2 | Ajouter deux vidéos | Leur durée réelle s'affiche, pas 10 s pour tout |
| 4.3 | Couper un extrait | Les bornes se déplacent |
| 4.4 | Mettre une transition (fondu, glissé, zoom) | L'aperçu la montre |
| 4.5 | Exporter, sans quitter l'onglet | Un fichier vidéo qui s'ouvre et se lit |

---

## Ce qui n'est pas prêt, et ce qu'il faut savoir

| Fonction | État |
|---|---|
| **Auto-Shorts IA** | Non branché. Le bouton le dit. Il ne découpe rien : il inventait des extraits et des légendes. |
| **Sous-titres automatiques** | Non branché. Les sous-titres s'écrivent à la main ; la saisie et l'export fonctionnent. |
| **Brouillons Instagram** | Fonctionne. Vérifié : le bouton « Brouillon + Instagram » crée l'entrée dans la file, liée à l'article. |
| **Envoi réel vers Instagram** | Jamais testé. Il demande une validation de Meta qui n'a pas été faite. Le bouton « Marquer comme publié » du panneau ne fait que changer l'étiquette. |
| **Assemblage vidéo côté serveur** | Ne peut pas fonctionner en l'état : l'hébergement n'a pas ffmpeg. Le montage se fait dans le navigateur. |
| **Site public** | Toujours en maintenance, par choix. Les brouillons se préparent sans que rien ne soit visible. |

---

## Si quelque chose ne marche pas

Note trois choses : **quel écran**, **ce que tu attendais**, **ce qui s'est passé**.
Une capture d'écran suffit le plus souvent.
