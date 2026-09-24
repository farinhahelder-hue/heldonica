# 🎯 Guide de Configuration du CMS Heldonica

## **Étape 1 : Créer une Base de Données MongoDB Gratuite** 🗄️

### Option A : MongoDB Atlas (Recommandé - Gratuit)

1. **Allez sur** https://www.mongodb.com/cloud/atlas
2. **Cliquez sur "Try Free"** ou créez un compte
3. **Créez un nouveau projet** :
   - Nom du projet : `Heldonica`
   - Cliquez sur "Create Project"
4. **Créez un cluster** :
   - Sélectionnez le plan **FREE** (M0)
   - Région : Europe (ex: Frankfurt)
   - Cliquez sur "Create Cluster"
5. **Attendez 5-10 minutes** que le cluster soit créé

### Créer un Utilisateur de Base de Données

1. **Dans MongoDB Atlas**, allez à **Database Access**
2. **Cliquez sur "Add New Database User"**
3. **Remplissez** :
   - Username: `admin`
   - Password: `admin123` (ou un mot de passe sécurisé)
   - Sélectionnez "Autogenerate Secure Password" si préféré
4. **Cliquez sur "Add User"**

### Obtenir la Chaîne de Connexion

1. **Allez à "Databases"** dans le menu
2. **Cliquez sur "Connect"** pour votre cluster
3. **Sélectionnez "Drivers"**
4. **Choisissez "Node.js"** et la version appropriée
5. **Copiez la chaîne de connexion** (elle ressemble à) :
   ```
   mongodb+srv://admin:admin123@heldonica.mongodb.net/heldonica?retryWrites=true&w=majority
   ```

---

## **Étape 2 : Configurer les Variables d'Environnement** 🔐

### Sur Vercel

1. **Allez sur** https://vercel.com/dashboard
2. **Sélectionnez votre projet** `heldonica`
3. **Allez à "Settings"** → **"Environment Variables"**
4. **Ajoutez ces variables** :

```
MONGODB_URI = mongodb+srv://admin:admin123@heldonica.mongodb.net/heldonica?retryWrites=true&w=majority
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
```

5. **Cliquez sur "Save"**
6. **Redéployez** votre projet (Vercel le fera automatiquement)

---

## **Étape 3 : Accéder au CMS** 🚀

Une fois déployé sur Vercel :

### 1️⃣ **Créer votre compte admin**
- Allez à : `https://heldonica.vercel.app/admin/setup`
- Remplissez le formulaire :
  - Full Name: Votre nom
  - Email: votre@email.com
  - Password: Un mot de passe sécurisé
- Cliquez sur "Create Account"

### 2️⃣ **Se connecter**
- Allez à : `https://heldonica.vercel.app/admin/login`
- Entrez vos identifiants
- Cliquez sur "Login"

### 3️⃣ **Accéder au Dashboard**
- Vous verrez le dashboard avec deux onglets :
  - **Articles** : Gérer vos articles de blog
  - **Destinations** : Gérer vos destinations de voyage

---

## **Utiliser le CMS** 📝

### **Créer un Article**

1. **Allez à l'onglet "Articles"**
2. **Cliquez sur "New Article"**
3. **Remplissez les champs** :
   - **Title** : Titre de l'article
   - **Slug** : URL-friendly (ex: "mon-article")
   - **Excerpt** : Résumé court
   - **Content** : Contenu complet
   - **Category** : Choisissez une catégorie
   - **Author** : Nom de l'auteur
   - **Published** : Cochez pour publier
4. **Remplissez les SEO Settings** (optionnel) :
   - **Meta Title** : Titre pour Google
   - **Meta Description** : Description pour Google
5. **Cliquez sur "Save Article"**

### **Créer une Destination**

1. **Allez à l'onglet "Destinations"**
2. **Cliquez sur "New Destination"**
3. **Remplissez les champs** :
   - **Name** : Nom de la destination
   - **Slug** : URL-friendly
   - **Description** : Description courte
   - **Long Description** : Description détaillée
   - **Best Time to Visit** : Meilleure saison
   - **Duration** : Durée recommandée
   - **Difficulty** : Easy / Moderate / Challenging
   - **Highlights** : Points forts (séparés par des virgules)
4. **Cliquez sur "Save Destination"**

---

## **Éditer et Supprimer** ✏️

### **Éditer un Article/Destination**
1. **Cliquez sur "Edit"** dans la liste
2. **Modifiez les champs**
3. **Cliquez sur "Save"**

### **Supprimer un Article/Destination**
1. **Cliquez sur "Delete"** dans la liste
2. **Confirmez la suppression**

---

## **Troubleshooting** 🔧

### **Problème : "Unauthorized" lors de la création d'un article**
- Vérifiez que vous êtes connecté
- Vérifiez que le cookie `adminToken` est présent
- Essayez de vous reconnecter

### **Problème : Erreur de connexion à MongoDB**
- Vérifiez que la chaîne `MONGODB_URI` est correcte
- Vérifiez que votre IP est autorisée dans MongoDB Atlas
  - Allez à **Network Access** dans MongoDB Atlas
  - Cliquez sur "Add IP Address"
  - Sélectionnez "Allow access from anywhere" (0.0.0.0/0)

### **Problème : Les données ne s'enregistrent pas**
- Vérifiez la console du navigateur (F12 → Console)
- Vérifiez les logs Vercel
- Vérifiez que MongoDB est connecté

---

## **Sécurité** 🔒

⚠️ **Important** :
- Changez le `JWT_SECRET` en production
- Utilisez un mot de passe fort pour MongoDB
- Limitez l'accès IP à MongoDB Atlas
- Ne partagez jamais vos variables d'environnement

---

## **Prochaines Étapes** 🚀

- [ ] Ajouter l'upload d'images
- [ ] Intégrer les articles au site public
- [ ] Ajouter la pagination
- [ ] Ajouter la recherche
- [ ] Ajouter les utilisateurs (éditeurs)

---

**Besoin d'aide ?** Contactez-moi ! 💚
