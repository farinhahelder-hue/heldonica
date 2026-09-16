# Instagram — publier depuis le panneau (Option A)

Ce que le code sait déjà faire (`lib/instagram.ts`, `POST /api/instagram/publish`) :
publier une **image**, un **carrousel** (2 à 10 photos) ou un **reel** depuis la
file `instagram_scheduled_posts`, celle que remplit le téléphone avec
« Brouillon + Ouvrir Instagram ». Le bouton « Publier sur Instagram » du
panneau (`/panel-manager` → Instagram → File Instagram) appelle cette route.

Ce qui manque, et que seul le compte Meta d'Heldonica peut fournir : **deux
variables Vercel**. Tant qu'elles n'y sont pas, le panneau l'affiche en bandeau
et le bouton reste inactif — il ne fait pas semblant.

## Une étape à la fois

1. **Le compte Instagram doit être professionnel** (Business ou Créateur) et
   relié à une Page Facebook. Instagram → Paramètres → Compte → « Passer à un
   compte professionnel », puis « Centre de comptes » pour lier la Page.

2. **Créer l'app Meta** sur <https://developers.facebook.com/apps> →
   « Créer une app » → type *Business*. Dans le tableau de bord de l'app,
   ajouter le produit **Instagram** (Graph API).

3. **Obtenir un token court** avec l'Explorateur Graph API
   (<https://developers.facebook.com/tools/explorer>) : choisir l'app, cliquer
   « Générer un token d'accès », cocher les autorisations
   `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`,
   `pages_show_list`, `pages_read_engagement`. Copier le token (il dure 1 h).

4. **L'échanger contre un token longue durée** (60 jours) :

   ```
   https://graph.facebook.com/v20.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id=<ID de l'app>
     &client_secret=<Clé secrète de l'app, onglet Paramètres → Général>
     &fb_exchange_token=<token court>
   ```

   La réponse contient `access_token` : c'est **`INSTAGRAM_ACCESS_TOKEN`**.

5. **Trouver l'identifiant du compte professionnel** :
   `GET https://graph.facebook.com/v20.0/me/accounts?access_token=<token>`
   donne l'`id` de la Page ; puis
   `GET https://graph.facebook.com/v20.0/<id page>?fields=instagram_business_account&access_token=<token>`
   renvoie `instagram_business_account.id` : c'est
   **`INSTAGRAM_BUSINESS_ACCOUNT_ID`**.

6. **Poser les deux variables dans Vercel** (Project → Settings → Environment
   Variables, cocher *Sensitive*), puis redéployer.

7. **Vérifier** : connecté au panneau, ouvrir
   `https://heldonica.fr/api/instagram/publish` → `{"configured":true}`.
   Le bandeau disparaît, le bouton « Publier sur Instagram » s'active.

## À savoir

- Un premier essai se fait sur une entrée **image** de la file, pas un
  carrousel : une seule requête Meta, une seule chose à lire si ça échoue.
  La raison exacte renvoyée par Meta s'affiche sous l'entrée.
- Les URLs des médias doivent être **publiques** (bucket `media` Supabase) :
  Meta va les télécharger lui-même.
- Le token longue durée expire au bout de 60 jours. Le bouton « Rafraîchir le
  token Meta » du panneau utilise `ig_refresh_token`, prévu pour les tokens du
  flux *Instagram Login* ; pour un token obtenu par le flux *Facebook Login*
  ci-dessus, le renouvellement se fait en refaisant l'étape 4. À vérifier au
  premier renouvellement, et ajuster le bouton si besoin.
- Rien n'est publié sans clic : le cron `/api/instagram/cron` ne traite que les
  entrées `scheduled` dont l'heure est passée, jamais les `draft`.
