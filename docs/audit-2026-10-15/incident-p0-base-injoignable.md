# INCIDENT P0 — Le site est DOWN (504), il n'est pas « en maintenance »

Constaté le **2026-10-15 vers 21:15 UTC**, reproduit à chaque essai depuis.

> Ce document ne rapporte pas un défaut éditorial. C'est une **panne de
> production en cours**. Il prime sur tout le reste de l'audit.

---

## 1. Le fait brut

**Toutes les pages de contenu de `heldonica.fr` répondent `504`.** Pas `307`
vers `/maintenance` — `504`, avec l'en-tête suivant :

```
HTTP/2 504
x-vercel-error: MIDDLEWARE_INVOCATION_TIMEOUT
server: Vercel
```

Le délai est **exactement 25,1 s** à chaque appel, de façon reproductible.

| Chemin | Réponse | Temps |
|---|---|---|
| `/` | **504** | 25,1 s |
| `/blog` | **504** | 25,1 s |
| `/destinations` | **504** | 25,1 s |
| `/destinations/madere` | **504** | 25,1 s |
| `/destinations/lisbonne` | **504** | 25,1 s |
| `/travel-planning` | **504** | 25,1 s |
| `/expert-hotelier` | **504** | 25,1 s |
| `/maintenance` | 200 | 0,15 s |
| `/sitemap.xml` | 200 | 0,11 s |
| `/robots.txt` | 200 | 0,16 s |
| `/politique-confidentialite` | 200 | 0,39 s |
| `/mentions-legales` | 200 | 0,34 s |
| `/politique-affiliation` | 200 | 0,33 s |
| `/ajouter` | 200 | 0,28 s |
| `/panel-manager` | 401 | 0,13 s |
| `/admin` | 308 | 0,18 s |

**Déduit.** Le site n'est pas en maintenance : il est **indisponible** pour tout
visiteur et pour tout moteur de recherche. Un crawler qui reçoit un `504` ne voit
aucune page — ni contenu, ni redirection de maintenance.

---

## 2. Ce n'est pas un état de maintenance — c'est une base injoignable

### 2.1 Le motif est net : tout ce qui interroge la base se bloque

| Endpoint | Interroge Supabase ? | Résultat |
|---|---|---|
| `/api/destinations` | oui | **aucune réponse > 75 s** |
| `/api/cms/pricing` | oui | **aucune réponse > 75 s** |
| `/api/cms/settings` | oui | **aucune réponse > 12 s** |
| `/api/og` | **non** | **200** en 3,2 s |
| `/api/cms/auth` | non (rejet immédiat) | 401 en 0,16 s |
| `/api/media` | non (rejet immédiat) | 401 en 0,29 s |
| `/api/supabase-media` | non (rejet immédiat) | 401 en 0,16 s |
| `/api/guides/download` | non | 405 en 0,16 s |
| `/api/testimonials/submit` | non | 405 en 0,21 s |
| `/api/blog/generate` | non | 405 en 0,91 s |

Aucune exception : **un endpoint qui interroge la base se bloque ; un endpoint
qui répond sans la base répond vite.** Le test décisif est `/api/og` — 200 en
3,2 s, et son code ne contient aucun appel Supabase.

### 2.2 La base elle-même : preuve directe

Interrogation directe de l'instance Supabase du projet, sans passer par le site.

| Appel | Clé | Résultat |
|---|---|---|
| `GET /rest/v1/site_settings?select=value` | **valide** | **aucune réponse > 90 s** |
| `GET /auth/v1/health` | **valide** | **aucune réponse > 20 s** |
| `GET /storage/v1/bucket` | **valide** | **HTTP 544** en 5,5 s |
| `GET /rest/v1/` (racine) | valide | 401 en 0,17 s |
| `GET /rest/v1/site_settings` | **bidon** | 401 en 0,07 s |
| `GET /rest/v1/site_settings` | format invalide | 401 en 0,07 s |
| `GET /storage/v1/object/public/media/...jpg` | aucune (public) | **200** en 0,27 s |

Le corps de la réponse `544` est explicite :

```json
{"statusCode":"544","error":"DatabaseTimeout",
 "message":"The connection to the database timed out","code":"DatabaseTimeout"}
```

**Lecture.** La passerelle Supabase (qui valide la clé) **répond vite** : une clé
bidon est refusée en 0,07 s. Dès que la clé est valide et qu'il faut **toucher la
base**, la requête ne revient pas. Ce n'est donc ni une clé erronée, ni un hôte
mal orthographié, ni un problème réseau depuis le poste : **c'est la base de
données du projet qui est injoignable.**

Les fichiers déjà stockés dans le bucket public restent servis (200 en 0,27 s),
car ils ne passent pas par la base. C'est cohérent, et cela explique pourquoi les
images de l'audit répondaient encore.

---

## 3. Pourquoi cela produit un 504 au lieu de la page de maintenance

Le `middleware.ts` interroge la base **à chaque requête** sur une route non
exclue, via `getMaintenanceMode()` (`lib/supabase-edge.ts`) :

```ts
const response = await fetch(`${supabaseUrl}/rest/v1/site_settings?key=eq.maintenance_mode&select=value`, {
  headers: { ... },
  next: { revalidate: 30 }
});
```

Cette requête n'a **aucun délai d'expiration**. La base ne répond pas ; l'attente
dépasse la limite de 25 s du runtime Edge de Vercel ; la fonction est tuée ;
Vercel renvoie `504 MIDDLEWARE_INVOCATION_TIMEOUT`.

C'est pourquoi les routes **exclues de la maintenance** (`/maintenance`,
`/politique-confidentialite`, `/admin`, `/sitemap.xml`…) fonctionnent : elles ne
passent pas par cet appel. Et c'est pourquoi le `504` touche **précisément** les
routes de contenu.

**Conséquence contre-intuitive à retenir :** le filet de sécurité de la
maintenance est inopérant quand la base tombe — alors que c'est exactement le
moment où il servirait. Le commentaire du code prévoit ce repli (« Supabase
injoignable → défaut fail-closed »), mais il ne s'exécute jamais, faute de
délai d'expiration : on n'atteint jamais le `catch`.

---

## 4. Quand la base a-t-elle cessé de répondre ?

| Moment (UTC) | Observation |
|---|---|
| 2026-10-15 **16:31–16:43** | Les captures d'audit (`.audit/db-*.json`) ont été prises **avec succès** : 41 articles, 41 destinations, 1 000 zones, données réelles complètes. **La base répondait.** |
| 2026-10-15 **19:25** | Dernière écriture d'un fichier d'audit local. |
| 2026-10-15 **21:15–21:35** | Base injoignable ; site en 504 sur toutes les routes de contenu. |

**Déduit** : la base est devenue injoignable **entre ~16:43 et 21:15 UTC le
15/10/2026**. Je ne peux pas resserrer davantage la fenêtre avec ce que j'ai
observé.

---

## 5. Ce que je ne peux pas confirmer

- **La cause interne à Supabase.** Le tableau de bord public de Supabase annonce
  « All Systems Operational » (dernière mise à jour 2026-10-13), ce qui oriente
  vers un problème **propre à ce projet** plutôt qu'une panne mondiale. Causes
  possibles, non départageables sans le tableau de bord du propriétaire :
  épuisement du pool de connexions, projet en pause, espace disque saturé,
  incident au niveau du projet.
- **L'étendue réelle pour les visiteurs** : je constate le `504` depuis ce poste ;
  je n'ai pas d'autre point de vue (pas de CDN tiers, pas de monitoring).
- **Si d'autres routes, non testées, se comportent différemment.**

Je n'ai **pas** d'identifiants Supabase pour ce projet et je n'ai **rien tenté**
pour le remettre en route : ce n'est pas une action d'audit, et cela exige le
tableau de bord du propriétaire.

---

## 6. Actions recommandées

### Immédiat (propriétaire)
1. Ouvrir le tableau de bord Supabase du projet `smxnruefmrmfyfhuxygq` :
   état du projet, connexions actives, espace disque, journaux.
2. Si le projet est en pause ou en limite de ressources, le remettre en service.
3. Vérifier ensuite `https://www.heldonica.fr/blog` : doit repasser en 200 ou en
   redirection de maintenance, pas en 504.

### Défensif (code — préparé dans cette branche, **non déployé**)
`getMaintenanceMode()` doit échouer **vite** au lieu de pendre. Ajouter un délai
d'expiration à l'appel de la base fait retomber le middleware sur son repli
prévu : la page de maintenance (200) au lieu d'un `504` pour tout le site. Voir
`journal-corrections.md`, § 6. Cela ne désactive pas la maintenance et ne change
pas sa sémantique — cela rétablit le comportement que le code annonce déjà.

### Enseignement d'architecture
Faire dépendre **chaque requête publique** d'un aller-retour vers la base, sans
délai d'expiration ni repli local, transforme une panne de base en panne de site
totale. Une valeur de maintenance mise en cache côté Edge, ou un délai
d'expiration court, aurait laissé le site servir au moins sa page de maintenance.


---

## Résolution — 2026-10-16 09:00 UTC

**La base a repris du service.** Constaté et vérifié :

- `GET /storage/v1/bucket` avec la clé valide : **HTTP 200** en 0,19–0,72 s sur
  quatre essais consécutifs (contre `544 DatabaseTimeout` la veille à 21:44).
- Contenu intact : `cms_blog_posts` = **41 lignes**, `destinations` = **41 lignes**
  (`content-range` exact), soit les mêmes volumes que les captures du 15/10 à
  16:33.
- Toutes les routes de contenu répondent désormais en **moins d'une seconde**
  (`/blog` 0,66 s, `/destinations` 0,66 s, `/travel-planning` 0,47 s).

**Le site n'est plus en 504** : les routes renvoient `307 → /maintenance`, ce qui
est le comportement attendu.

**Valeur enfin lisible** (elle ne l'était pas, base injoignable) :
`site_settings.maintenance_mode = true`, dernière modification
**2026-08-19**. La maintenance est donc **voulue et en place** ; le 504 était un
incident **distinct**, superposé au mode maintenance, et non sa conséquence.

Reste à décider par le propriétaire : la remise en ligne publique (sortie de
maintenance) et le déploiement du correctif défensif de cette branche, qui
éviterait qu'une prochaine panne de base reproduise un 504 site entier.
