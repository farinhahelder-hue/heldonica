# Heldonica CMS

## Nouvelles fonctionnalités (Feature: UI / Versionnage / Image)

### 1. Interface d'édition simplifiée
- Nouveau composant `EditHeader` avec titre, slug, et extrait (markdown preview) côte à côte.
- Génération de slug automatique avec bouton "Regénérer".
- Design responsive (stack vertical sur mobile).

### 2. Versionnage et Snapshots
- Sauvegarde instantanée de l'état d'un article via "Créer un snapshot".
- Historique conservé dans la table `article_versions`.
- Visualisation et restauration des versions en 1 clic depuis la liste des articles.

### 3. Optimisation des images à l'upload
- Utilisation de `sharp` pour réduire le poids des images.
- Redimensionnement automatique (1200px largeur max).
- Conversion automatique en WebP (qualité 80).
- Validation côté client pour bloquer les fichiers > 5 Mo.
