# Décisions propriétaires — Heldonica

Liste courte et actionnable. Chaque ligne est une chose que **je ne peux pas
trancher** : elle dépend d'un fait que vous seuls détenez. Rien ici n'est un
jugement de valeur sur le contenu.

## 0. Résolu — la panne de base du 2026-10-15 (deux décisions restent)

**Résolu le 2026-10-16 à 09:00 UTC : la base a repris du service.** Le site
répond de nouveau en moins d'une seconde, en redirection de maintenance normale.
Le contenu est intact (41 articles, 41 destinations).

Ce qui s'était passé : le 2026-10-15, `heldonica.fr` répondait **504** sur toutes
ses pages de contenu. Ce n'était **pas** le mode maintenance — la base Supabase du
projet était injoignable, et le middleware l'interrogeait à chaque requête sans
délai d'expiration. Preuve et méthode : `incident-p0-base-injoignable.md`.

Deux décisions restent de votre côté :

1. **Sortir (ou non) du mode maintenance.** `site_settings.maintenance_mode`
   vaut `"true"` depuis le 2026-08-19. C'est une décision de mise en ligne : je
   n'y touche pas sans votre accord.
2. **Déployer le correctif défensif** de la branche (délai de 3 s : une prochaine
   panne de base ferait retomber le site sur sa page de maintenance au lieu d'un
   504 général). Il n'est pas déployé.

## 1. Photos à fournir (12 couvertures d'articles)

Ces articles sont publiés ; leur couverture ne se charge pas (fichier absent du
dépôt **et** du Storage). Je n'ai remplacé aucune d'elles : aucune photo
candidate n'a été vérifiée visuellement.

`carnet-maderes-2025-2026` · `prego-no-bolo-do-caco` ·
`pepites-mystiques-de-madere` · `madere-quand-partir-sur-lile-de-leternel-printemps` ·
`madere-slow-travel-guide` · `madere-guide-complet` ·
`foret-fanal-levadas-mystiques-madere-slow-travel` ·
`podgorica-capitale-oubliee-montenegro` ·
`kotor-a-laube-remparts-venitiens-bouches-de-kotor` ·
`perazica-do-tunnels-falaise-baie-hotel-as` ·
`cote-pastrovici-en-mer-falaises-criques-pleine-lune` ·
`lisbonne-ruelles-alfama-miradouros-azulejos`

Détail des chemins attendus : `registre-medias.md`.

## 2. Vécu à confirmer

- **Durées de voyage** : la même fiche (`cms_pillar_pages`) annonce 8 jours pour
  Madère mais un itinéraire de 7 ; 10 jours pour le Monténégro mais 7 ;
  9 jours pour la Roumanie mais 7. Quelle valeur est la bonne ?
- **Témoignages** : 5 témoignages sont actifs. Aucun n'est rattaché à un client
  identifiable. Existent-ils réellement, et les personnes ont-elles donné leur
  accord pour la publication ?
- **`maramures-roumanie-authentique`** : l'article affirme « on y est allés en
  avril 2026 ». Il est publié et absent du sitemap. Le voyage a-t-il eu lieu ?
  L'article doit-il rester en ligne ?

## 3. Texte à compléter ou à réécrire

- **37 descriptions SEO** identiques et terminées par la phrase gabarit ; 9
  affichent en plus une étiquette interne (« ⭐ Secret Gem », « ⭐ Hidden Gem »)
  que le public ne devrait pas lire.
- **37 conseils locaux identiques** sur 43 pages, et 44 mises en avant de moins
  de 28 caractères (`« Or. »`, `« Vue. »`).
- **11 articles** portent encore un libellé de consigne en titre de section
  (`Repères pratiques GEO-friendly`, `Accroche vécue`, etc.).

## 4. Informations factuelles à valider

- **`viscri` et `sighisoara`** : leurs champs `link` pointent vers des routes qui
  n'existent pas. Aucun composant public ne lit ce champ, donc rien n'est cassé à
  l'écran : faut-il corriger la donnée, ou supprimer le champ devenu inutile ?
- **Lisbonne** : `/destinations/lisbonne` et `/destinations/portugal/lisbonne`
  se déclarent toutes deux canonical sur elles-mêmes. Laquelle doit rester ?
- **Stoos** : deux articles sont au sitemap alors que `next.config.js` les
  redirige en 301. Retirer l'entrée du sitemap, ou retirer la redirection ?
- **`app/api/publish-maramures/route.ts`** : route qui insère un article écrit en
  dur. Déjà passée en brouillon par une session précédente, mais elle reste
  appelable. La supprimer ou la garder ?
- **Clé CMS `destinations-`** (tiret final) : trois zones orphelines. À
  supprimer ou à renommer ?

## 5. Ce qui n'a pas besoin de vous

Les correctifs déterministes (7 images, description Costa Smeralda, sitemap,
hôte Supabase) sont appliqués et vérifiés localement. Aucune action de votre
part n'est nécessaire pour ceux-là — hormis leur déploiement.

---

## 6. Passage qualité éditoriale du 2026-10-16 — décisions ajoutées

Ces cinq points viennent de la validation qualité menée sur les 41 articles et
les 41 destinations. Chacun demande **votre arbitrage**, pas une correction
technique.

### 6.1 Deux articles Stoos quasi identiques, tous deux publiés

`stoos-ridge-notre-aventure-crete-panoramique` (id=1, 715 mots) et
`stoos-ridge-notre-aventure-sur-la-crete-panoramique` (id=91, 1 067 mots)
partagent au moins six phrases entières. Les deux sont publiés et présents dans
`sitemap.xml`.

**Ce que je recommande** : garder l'id=91 (le plus complet), traiter l'autre
(redirection ou dépublication). **Je n'ai rien supprimé ni redirigé** — changer
une URL est une décision qui vous appartient.

### 6.2 « Notre regard Heldonica » — gabarit ou tic de génération ?

La formule ouvre un paragraphe de verdict **à l'identique dans 7 articles**.
Est-ce un gabarit que vous assumez, ou un effet de génération à varier ?

### 6.3 Un placeholder anglais supprimé — à réécrire par vous

La page `/destinations/sicile/taormine` affichait :

> « Taormine, c'est le spot tourism. Le theatre grec avec vue sur la mer.
> Incredible. »

La migration proposée le remplace par une phrase **factuelle et neutre**
(« Taormine, son théâtre grec antique ouvert sur la mer. »). Si vous voulez une
intro incarnée, **à vous de l'écrire** — je n'invente pas de vécu.

### 6.4 19 articles signalés « E-E-A-T » — votre relecture

Le garde-fou automatique cherche des mots-clés de terrain (« on a testé »,
« en 202… »). **Un article peut être authentiquement vécu sans ces mots.** Ces 19
signalements ne sont donc **pas** des défauts prouvés : ils demandent votre œil.
La vraie question : ces articles portent-ils des dates, saisons et détails que
vous pouvez assumer ?

### 6.5 Le CTA Instagram d'un article est au vouvoiement

`ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature` (score marque
65/100) termine par « **Partagez** vos souvenirs » alors que le corps tutoie.
Passage au tutoiement ? (correction d'une ligne)

### 6.6 Un faux 404 sur des pages inexistantes

`/destinations/zzz` et `/blog/inexistant-zzz` répondent **HTTP 200** alors que la
page dit « introuvable ». Les moteurs voient une page valide là où il n'y a
rien. Faut-il renvoyer un vrai 404 ? (impact référencement)

---

## 7. Deux décisions CMS (ajoutées le 2026-10-16)

### 7.1 Deux sous-destinations invisibles dans le CMS

`/destinations/roumanie/maramures` et `/destinations/roumanie/apuseni` sont
**publiées, dans le sitemap et dans la grille des sous-destinations**, mais
n'apparaissent **pas** dans la section « Zones de Texte » du CMS : leurs clés de
page n'ont jamais été créées en base (oubli du générateur, qui est un script
Windows non rejoué).

**Ce n'est pas bloquant** : en ouvrant la page avec le Live Edit, la zone se crée
toute seule. Mais pour les voir dans la liste, il faut appliquer la migration
`20261016110000_seed_maramures_apuseni_zones.sql` — **prête, non appliquée**.

**Décision demandée : appliquer cette migration ?** (aucun contenu nouveau, les
valeurs sont recopiées du code à l'identique)

### 7.2 Les trois pages piliers ne peuvent pas avoir de titre distinct

Madère, Monténégro et Roumanie partagent **le même jeu de 21 zones CMS**. Le
libellé est donc forcément générique (« Pourquoi **{destination}** pour un couple
slow travel ? »), et il est **impossible** de donner un titre différent à Madère
sans que Monténégro et Roumanie changent aussi.

C'est probablement **voulu** (cohérence), mais si vous voulez personnaliser un
pilier, cela demande une modification de code. **À confirmer : générique
assumé, ou personnalisation souhaitée ?**

