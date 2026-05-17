# Audit UX / Produit / Contenu - Heldonica.fr

## Vue d'ensemble de la navigation
L'audit a couvert les pages clés du site pour évaluer la promesse de la marque ("slow travel vécu sur le terrain, dénicheurs de pépites"). Le design global est élégant, avec une typographie soignée et un discours fort. Toutefois, l'expérience est freinée par quelques confusions dans le maillage, un formulaire fragmenté et une gestion imparfaite des visuels.

---

## 1. Page Accueil
- **URL :** `https://www.heldonica.fr/`
- **Titre (H1) :** Heldonica hero (ou équivalent masqué) / "On ferme les ordis. On part."
- **Type de page :** Landing éditoriale & vitrine de marque.
- **Points forts :**
  - Proposition de valeur (Hero) percutante, texte très "voix Heldonica".
  - Design aéré, polices élégantes (Playfair / Inter).
  - Preuve sociale chiffrée (années de terrain, adresses vécues).
- **Problèmes / bugs :**
  - *Bug texte :* "Une fois par mois, on t'envoiece qu'on a vraiment trouvé." Espace manquant ("envoie ce").
  - *Incohérence des images :* Alternance d'images Unsplash et d'images uploadées, cassant la promesse de "photos du terrain vécues".
  - *Lien mort potentiel :* Le texte "Heldonica hero" semble remplacer un texte alternatif d'image non chargé ou une balise mal formatée.
- **Incohérences :**
  - La promesse met le focus très fort sur "Duo", mais le CTA redirige vers un service qui dit s'ouvrir à tout le monde. Un léger flou sur le cœur de cible (exclusivité couple vs généraliste).
- **Recos UX / contenu :** Corriger la coquille "t'envoiece". Rendre le bouton principal du hero plus descriptif que "Lire la suite →".
- **Recos design / visuel :** Remplacer les images Unsplash par des vraies photos des fondateurs sur le terrain pour asseoir la crédibilité.
- **Recos navigation / maillage :** Clarifier la distinction entre "Lire la suite" (vers le blog) et "Nous écrire" (vers le Travel planning).

---

## 2. Page À Propos
- **URL :** `https://www.heldonica.fr/a-propos`
- **Titre (H1) :** Notre histoire / Une histoire qui s'écrit sur le terrain
- **Type de page :** Présentation fondateurs et manifeste.
- **Points forts :**
  - Ton très sincère, storytelling accrocheur.
  - Explicitation claire du passage de l'expérience "Duo" à l'offre "pour tous".
  - Mise en valeur des profils complémentaires des fondateurs (Madère/Roumanie).
- **Problèmes / bugs :**
  - Aucune vraie photo des fondateurs, seulement des images d'illustration Unsplash ("Voyage en couple — silhouettes Heldonica" par ex.).
  - Le texte "Et maintenant ?" en bas flotte un peu seul avant les sections.
- **Incohérences :**
  - Différence entre les chiffres annoncés ici ("17+ carnets publiés") et la page Home ("0+ carnets"). Les données semblent statiques et non synchronisées avec la BDD.
- **Recos UX / contenu :** Mettre à jour les compteurs dynamiquement. Ajouter des vraies photos du couple pour incarner la page.
- **Recos design / visuel :** Uniformiser le traitement colorimétrique des photos.
- **Recos navigation / maillage :** Bon rebond vers "Blog" et "Travel Planning" en fin de page.

---

## 3. Blog & Articles (Ex: Lisbonne 72h)
- **URL :** `https://www.heldonica.fr/blog` & `https://www.heldonica.fr/blog/lisbonne-72h-sans-touristes`
- **Titre (H1) :** Blog Heldonica / Lisbonne en 72h sans les touristes
- **Type de page :** Hub de contenu et page Article.
- **Points forts :**
  - Catégorisation claire (Carnets, Pépites, Guides).
  - Temps de lecture affiché.
  - Accroches éditoriales immersives.
- **Problèmes / bugs :**
  - La page de l'article de Lisbonne est étonnamment courte, avec peu de contenu lisible sous le H1 ("Ouverture... Alfama, Baixa, Chiado"), ce qui donne l'impression d'un article vide ou "en construction".
  - Le widget de souscription newsletter a le même bug d'espacement potentiel, mais surtout le bouton s'affiche comme "____________________ (BUTTON) Je m’abonne".
- **Incohérences :**
  - Différence de traitement visuel entre les articles uploadés et ceux générés automatiquement.
- **Recos UX / contenu :** Étoffer le contenu de l'article de test (Lisbonne) pour prouver l'expertise annoncée.
- **Recos design / visuel :** L'article de test manque de corps de texte et d'images intégrées.
- **Recos navigation / maillage :** L'ajout d'articles liés à la fin ("Dans la même veine") est une excellente pratique. À conserver.

---

## 4. Destinations & Hub Madère
- **URL :** `https://www.heldonica.fr/destinations` & `https://www.heldonica.fr/destinations/madere`
- **Titre (H1) :** Hub destinations / Madere, l ile de l eternel printemps...
- **Type de page :** Index des destinations et page pilier (Madère).
- **Points forts :**
  - Cadrage direct : Budget, meilleure saison, et "Notre verdict" honnête.
  - Intégration de la carte interactive (Google Maps).
  - Formulaires spécifiques par destination (pratique).
- **Problèmes / bugs :**
  - *Fautes typographiques :* De nombreuses apostrophes et accents manquent sur la page Madère ("l ile de l eternel printemps", "s ennuyer", "Fenetre idéale", "a Madere"). Un problème d'encodage potentiel sur ce texte.
  - La distinction entre "Destinations" et "Inspirations" dans le menu peut prêter à confusion.
- **Incohérences :**
  - Le budget indicatif pour Madère est en euros ("1400-1800 EUR"), ce qui est concret, mais pour la Sicile il est écrit "Sur mesure", et pour Zurich "Court séjour premium", ce qui manque de cohérence dans la présentation des données.
- **Recos UX / contenu :** Corriger de toute urgence les problèmes d'apostrophes et d'accents sur la page Madère. Standardiser le format des budgets.
- **Recos design / visuel :** Aligner les formats des cartes destinations.
- **Recos navigation / maillage :** Intégrer un quiz interactif ("Quel slow traveler es-tu ?") est une bonne idée, mais il faut s'assurer qu'il mène bien à une conversion.

---

## 5. Services & Travel Planning
- **URL :** `https://www.heldonica.fr/travel-planning` & `https://www.heldonica.fr/planifier` & `https://www.heldonica.fr/travel-planning-form`
- **Titre (H1) :** Travel Planning / Planifier un voyage / Dis-nous où tu veux aller.
- **Type de page :** Landing d'offre B2C, page d'entrée, et formulaire Multi-steps.
- **Points forts :**
  - Découpage par bénéfices clair ("Sans / Avec Heldonica").
  - Formulaire découpé en étapes (Wizard) pour réduire la friction.
  - Témoignages clients rassurants.
- **Problèmes / bugs :**
  - Le formulaire (`/travel-planning-form`) démarre bien en étapes, mais certaines mentions "alternate" apparaissent en haut (problème de balises meta ou liens canoniques exposés).
  - Différence de routes : `/travel-planning` (la présentation du service) et `/planifier` (une landing intermédiaire plus philosophique). Les deux font doublon et diluent le trafic.
- **Incohérences :**
  - La page "Planifier" a une vocation éditoriale qui pourrait être intégrée à "Travel Planning" pour éviter de multiplier les clics avant le formulaire.
- **Recos UX / contenu :** Fusionner `/planifier` et `/travel-planning` en une seule landing forte, pointant directement vers `/travel-planning-form`.
- **Recos design / visuel :** Vérifier l'affichage du composant multi-step (retrait des "alternate").
- **Recos navigation / maillage :** Simplifier le menu principal en ne gardant que "Travel Planning" et en retirant "Planifier" pour plus de clarté.

---

## 6. Footer, Contact & Légales
- **URL :** `/contact`, `/mentions-legales`, `/politique-confidentialite`
- **Titre (H1) :** Parle-nous de ce qui est vrai / Mentions légales / Politique de confidentialité
- **Points forts :**
  - Mentions légales et RGPD claires et présentes.
  - Formulaire de contact minimaliste et bien cadré.
- **Problèmes / bugs :**
  - Manque d'accents sur les pages légales ("Politique de confidentialite", "Donnees collectees", "Duree"). Problème probable d'encodage (UTF-8).
  - Sur la page de contact, l'adresse email est présente (info@heldonica.fr), mais les pages légales mentionnent "contact@heldonica.fr", créant une incohérence.
- **Recos UX / contenu :** Unifier l'adresse de contact principale. Corriger les accents.

---

## SYNTHÈSE FINALE ET PRIORITÉS

### Top 10 problèmes transverses
1. Disparition d'accents et d'apostrophes (pages destinations et légales).
2. Typo bloquante en home : "t'envoiece".
3. Utilisation excessive d'images Unsplash alors que le discours promet de "l'authentique" et du "vécu".
4. Redondance des parcours de conversion (`/planifier` vs `/travel-planning`).
5. Incohérence des statistiques affichées (chiffres à 0 sur la Home vs chiffres remplis dans À Propos).
6. Articles de blog de démonstration (ex: Lisbonne) avec un contenu insuffisant.
7. Disparité dans le traitement des champs "Budget" sur les cartes de destination.
8. Balises "alternate" parasites visibles sur le formulaire de Travel Planning.
9. Confusion sur l'email officiel (info@ vs contact@).
10. Boutons de newsletter mal formattés textuellement dans le footer.

### 3 priorités "CRITIQUES" à corriger en premier
1. **Corriger les problèmes d'encodage / caractères :** Rétablir les accents et apostrophes sur les pages Destinations et Légales, ainsi que la faute "t'envoiece" sur la Home.
2. **Harmoniser les chiffres clés :** Brancher les compteurs de la Home sur les vraies statistiques de la BDD ou les unifier manuellement avec la page À Propos.
3. **Nettoyer le composant Formulaire :** Supprimer l'affichage des liens "alternate" en haut du formulaire `/travel-planning-form` pour rétablir une UI propre.

### 3 priorités "UX & conversion"
1. **Fusionner les pages d'appel :** Rediriger `/planifier` vers `/travel-planning` pour créer une seule landing page d'offre claire et efficace.
2. **Unifier le format budgétaire :** Assurer que toutes les destinations affichent une fourchette chiffrée ou un format cohérent, plutôt que des termes vagues comme "Sur mesure".
3. **Clarifier l'email :** Unifier tous les liens `mailto:` vers une adresse unique (ex: info@heldonica.fr).

### 3 priorités "Design & cohérence visuelle"
1. **Substituer les photos Stock :** Remplacer les images manifestement issues d'Unsplash par de véritables photos Heldonica pour soutenir le storytelling d'expertise terrain.
2. **Photos des fondateurs :** Ajouter au moins un vrai portrait de l'équipe sur la page À propos.
3. **Rendu Newsletter :** S'assurer que le composant de saisie email de la newsletter s'affiche sans espace blanc cassé.

### 3 priorités "Contenu & langage"
1. **Garnir les articles piliers :** Rédiger des corps de textes plus consistants pour les articles vitrines (Lisbonne).
2. **Clarifier le public cible :** Assumer le positionnement généraliste ou duo dans le hero header pour éviter que le texte ne se contredise sur les différentes sections.
3. **Uniformiser la voix :** Maintenir le "on" éditorial, même dans les mentions légales si possible (ou les séparer très clairement du reste du ton).

### 3 priorités "Navigation & routes"
1. **Épurer le menu principal :** Supprimer la distinction parfois floue entre Destinations/Inspirations si les deux mènent aux mêmes types de contenus.
2. **Simplifier le parcours de réservation :** Maintenir le CTA "Travel Planning" comme point de chute unique.
3. **Vérifier les balises H1 cachées :** S'assurer que le "Heldonica hero" sur l'accueil a bien une valeur SEO et ne casse pas la lisibilité des lecteurs d'écran.
