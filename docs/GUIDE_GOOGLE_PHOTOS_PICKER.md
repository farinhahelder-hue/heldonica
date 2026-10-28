# Obtenir les 3 variables Google Photos Picker

Ce guide produit les trois valeurs que lit `lib/google-photos-picker.ts` :

```
GOOGLE_PHOTOS_CLIENT_ID
GOOGLE_PHOTOS_CLIENT_SECRET
GOOGLE_PHOTOS_REFRESH_TOKEN
```

À faire **une seule fois**. Compter 15 minutes.

Pourquoi c'est nécessaire : depuis le 31/03/2025, Google a retiré le scope d'accès
continu `photoslibrary`. Le CMS ne peut donc plus lire une photothèque entière. Le
**Picker** est la seule voie restante : c'est l'utilisateur qui coche ses médias
dans l'interface Google, et l'application ne voit que la sélection. Ce n'est pas
une limite du CMS — c'est une règle de Google.

---

## A. Activer l'API

1. Aller sur <https://console.cloud.google.com> et **choisir le projet** (ou en créer un).
2. Menu → **APIs & Services** → **Library**.
3. Chercher **`Photos`**.
4. Activer **« Google Photos Picker API »**.

> **Piège** : la recherche propose aussi une **« Google Picker API »**. C'est un
> **autre produit** (sélection de fichiers Drive), il ne sert à rien ici. Le bon
> contient le mot **Photos**.

## B. Créer le client OAuth → `CLIENT_ID` + `CLIENT_SECRET`

5. Menu → **APIs & Services** → **Credentials**.
6. **Create Credentials** → **OAuth client ID**.
   - Si Google demande d'abord de configurer l'écran de consentement, le faire :
     type **Externe**, nom de l'application `Heldonica`, et **ajouter son propre
     compte Google dans « Utilisateurs test »**.
7. Type d'application : **Application de bureau** (Desktop app).
   C'est ce que documente `.env.example`. Un client **Web application** fonctionne
   aussi — le script accepte les deux (`installed` ou `web`) — mais il exige alors
   de déclarer l'URI de redirection à l'étape 9. **Application de bureau** évite
   cette déclaration.
8. **Create**. Google affiche **Client ID** et **Client secret**.
   → ce sont les valeurs n° 1 et n° 2.
9. *Seulement si l'on a choisi « Web application »* : ajouter dans
   **Authorized redirect URIs** exactement :
   ```
   http://localhost:8080/callback
   ```
   Cette valeur est **codée en dur** dans `scripts/auth_google_picker.py`
   (`redirect_uri = "http://localhost:8080/callback"`). Toute autre valeur produit
   une erreur `redirect_uri_mismatch`.

## C. Produire le `REFRESH_TOKEN`

10. Télécharger le JSON du client (bouton de téléchargement à côté du client créé).
11. Le renommer **`credentials.json`** et le placer dans **`scripts/`**.
    Le script le lit au chemin **relatif** `scripts/credentials.json` : il faut
    donc lancer la commande **depuis la racine du dépôt**, pas depuis `scripts/`.
12. Lancer :
    ```bash
    cd <racine du depot>
    python scripts/auth_google_picker.py
    ```
    Dépendances : `requests` (déjà dans l'environnement du projet ; sinon
    `pip install requests`).
13. Le navigateur s'ouvre sur l'écran de consentement Google → **Autoriser**.
14. Le script écrit **`scripts/token_picker.json`**. Le `REFRESH_TOKEN` est le champ
    **`refresh_token`** de ce fichier.

## D. Poser les variables

15. Dans **Vercel** → Settings → Environment Variables, ajouter les trois valeurs.
16. **Redéployer** (les variables ne sont prises en compte qu'au déploiement suivant).

Vérification, sans rien créer : ouvrir `/panel-manager/photos`. La page appelle
`GET /api/cms/photos/session`, qui renvoie :
- `jeton_ok: true` → tout est bon ;
- `jeton_ok: false` avec une raison → le message de Google est affiché tel quel
  (`invalid_grant` = jeton révoqué ou expiré ; `invalid_client` = client id/secret
  erronés).

---

## Les deux pièges qui coûtent le plus de temps

**1. Une application en statut « Testing » révoque les refresh tokens après 7 jours.**
La connexion semble marcher, puis casse une semaine plus tard. Pour que ça tienne,
**publier l'application** (OAuth consent screen → *Publier l'application*). Tant
qu'elle reste en « Testing », il faudra refaire l'étape C chaque semaine.

**2. Ne jamais committer ces fichiers.** `credentials.json` et `token_picker.json`
contiennent des secrets. Ils sont déjà dans `.gitignore` (lignes 36-44) — ne pas
les forcer avec `git add -f`. Les valeurs se lisent depuis `process.env`, jamais
en dur dans le code (règle n° 3 du projet).
