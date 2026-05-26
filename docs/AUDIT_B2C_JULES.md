# 🕵️‍♂️ Audit Heldonica B2C - Réalisé par Jules

## 1. La structure du site
- **État actuel :** Le menu de navigation principal (Header) a été recentré sur les entrées B2C : *Accueil, Destinations, Inspirations, Services, À propos*.
- **Constat :** L'architecture s'est améliorée, mais il reste une redondance majeure au niveau du tunnel de conversion. L'utilisateur est exposé à plusieurs portes d'entrée pour la même action : `/travel-planning` (landing page de l'offre), `/planifier` (une landing intermédiaire plus éditoriale) et `/travel-planning-form` (le formulaire final).
- **Recommandation :** Unifier le tunnel. Conserver uniquement `/travel-planning` comme landing page complète de vente, qui redirige vers le composant `/travel-planning-form`. Supprimer la page `app/planifier/page.tsx` et mettre à jour les liens (notamment dans le footer et Header).

## 2. Les pages publiques B2C
- **Accueil (`/`) :** La page est globalement bien structurée. Les requêtes CMS sont en place. Cependant, le Hero section devrait être plus explicite et direct. La section "Travel Planning" utilise le bon vocabulaire B2C.
- **Travel Planning (`/travel-planning`) :** Bon découpage par bénéfices, présentation claire des preuves de la méthode.
- **À Propos (`/a-propos`) :** Le storytelling est bon ("Une histoire qui s'écrit sur le terrain").
- **Blog (`/blog`) & Destinations (`/destinations`) :** Les hubs de contenu sont clairs. La page Madère sert de bon modèle, bien qu'entachée de bugs de texte.

## 3. La cohérence éditoriale
- **Voix de la marque :** Le ton ("On", "Tu") et le vocabulaire (vécu, sans filtre, slow travel) sont bien respectés. On lit bien la volonté de transparence ("On n'a pas de témoignages. Ce qu'on a : des années de route").
- **Problèmes identifiés :** Des bugs de caractères (apostrophes, accents) sont fréquents sur les pages importées/statiques (ex. page destination Madère : "l ile de l eternel printemps", pages légales). La faute de frappe "t'envoie" sur le composant HomeClient est problématique. L'email est aussi incohérent (info@ vs contact@).

## 4. La cohérence visuelle
- **Typographie et Couleurs :** Bonne cohérence d'ensemble avec Playfair Display / Inter et la palette Eucalyptus / Mahogany / Cloud Dancer.
- **Photographie :** C'est le point faible. L'abus d'images génériques "Stock" (Unsplash) dans les fallbacks du code (`HomeClient.tsx` notamment) contredit frontalement la promesse de "vécu sur le terrain". Il faut des visuels plus personnels.
- **UI :** Le formatage du formulaire Newsletter dans le Footer est défaillant ("____ Je m'abonne").

## 5. Les doublons et éléments parasites
- **À supprimer :** La route `/planifier` fait doublon avec `/travel-planning`.
- **Vestiges B2B :** Il ne semble plus y avoir de liens publics pointant vers du B2B, mais il faut continuer de s'assurer qu'aucune page type B2B ne persiste dans l'arborescence indexée.
- **Bugs visuels :** Le composant multi-step du formulaire laisse transparaître des balises meta/alternate en texte brut.

## 6. La hiérarchie des contenus
- **Problème :** Sur mobile, certains titres (H1/H2) prennent toute la place et repoussent les Call to Action (CTA).
- **Problème :** Distinction floue entre les parcours "Destinations" et "Inspirations" (Blog). Le maillage est présent mais peut prêter à confusion.

## 7. Les éléments à risque pour la conversion ou la lisibilité
- Le formulaire de contact B2C (`/travel-planning-form`) génère de la friction. Il faut s'assurer qu'il fonctionne parfaitement sans fuite de style.
- L'affichage des budgets sur la page "Destinations" est incohérent ("1400-1800 EUR" vs "Sur mesure").
- Les coquilles et fautes de frappe (dont les accents/apostrophes) érodent la confiance de l'utilisateur prêt à payer pour un service d'organisation.

---

# 📋 Plan d'Action & Priorités

Voici les tâches concrètes qui découlent de cet audit, classées par priorité et confrontées à la ROADMAP du Sprint 1 et 2.

### 🔴 PRIORITÉ 1 : Sécurité, Bugs bloquants & Nettoyage B2C (Sprint 1)
1. **Unification du tunnel de conversion (Doublon) :**
   - Supprimer le fichier `app/planifier/page.tsx` et `app/planifier`.
   - Modifier le `Header.tsx` et `Footer.tsx` pour rediriger "Planifier" vers `/travel-planning`.
2. **Corriger l'encodage et la typographie :**
   - Rétablir tous les accents et apostrophes cassés sur les pages de destinations (Madère) et les pages légales.
   - Corriger les textes dans `HomeClient.tsx` (ex: "Une fois par mois, on t'envoie").
3. **Unifier les contacts :**
   - Harmoniser les `mailto:` pour n'utiliser qu'une seule adresse partout (soit `info@heldonica.fr`, soit `contact@heldonica.fr`), idéalement `contact@heldonica.fr` comme dans le layout.
4. **Correction UI Formulaire & Newsletter :**
   - Nettoyer le formulaire (`/travel-planning-form`) des balises alternate.
   - Réparer l'affichage du champ Newsletter dans le footer.

### 🟠 PRIORITÉ 2 : Amélioration UX & Navigation (Sprint 1 & 2)
5. **Dynamiser les compteurs :**
   - Raccorder les statistiques sur l'Accueil et À Propos à la BDD ou les unifier manuellement pour éviter d'afficher "0+".
6. **Harmoniser les données de Destination :**
   - Normaliser l'affichage du champ "Budget" sur les cartes de destinations (chiffres vs texte vague).
7. **Remplacement photographique (Fallbacks) :**
   - Remplacer les images Unsplash par défaut dans `HomeClient.tsx` par de vraies images uploadées sur Supabase.

### 🟡 PRIORITÉ 3 : Cohérence Visuelle (Sprint 3)
8. **Ajustements typographiques responsives :**
   - Redimensionner l'échelle typographique des titres H1/H2 sur mobile.

---

**Notes pour AllHands / Validation :**
L'audit confirme les axes de la Roadmap (Sprint 1 et 2). La tâche la plus urgente est d'éliminer la redondance entre `/planifier` et `/travel-planning` pour clarifier le tunnel B2C, suivie de près par les correctifs de texte et d'UI.

J'attends ta validation complète avant de commencer toute modification sur le code (création du plan d'exécution `set_plan` et début des actions sur les branches).
