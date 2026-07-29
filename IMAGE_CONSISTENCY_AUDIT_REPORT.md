# 🖼️ Audit de Cohérence des Images — Heldonica

Généré le: 16/07/2026 10:28:27

## 📊 Bilan Global
- **Images OK** (uniques, valides et uniques dans leur contexte) : 37
- **Images Vides/Manquantes** : 0
- **Images Brisées (404/Inaccessibles)** : 0
- **Images Génériques / Fallbacks / Placeholders** : 14
- **Doublons d'images (Même ID Unsplash partagé)** : 20 groupes de doublons

---

## ❌ 1. Images Brisées (404/Inaccessibles)
*Aucune image brisée détectée ! Toutes les URLs répondent correctement.* ✅

## ⚠️ 2. Images Génériques / Fallbacks / Placeholders
*Ces images utilisent des IDs Unsplash génériques ou des fallbacks définis comme blacklistés pour la production éditoriale.*

| Source | Élément | Champ | ID Unsplash | URL |
|---|---|---|---|---|
| `cms_blog_posts` | `Roumanie : les villages que les guides ne mentionnent pas` | `featured_image` | `1476514525535-07fb3b4ae5f1` | [Lien](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjE2MDh8MHwxfHNlYXJjaHw1fHx0cmF2ZWwlMjBsYW5kc2NhcGV8ZW58MHwwfHx8MTc4NDE5MDM3MXww&ixlib=rb-4.1.0&q=80&w=1080) |
| `cms_blog_posts` | `Guide Pratique : Comment débuter le Slow Travel en Duo` | `featured_image` | `1476514525535-07fb3b4ae5f1` | [Lien](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85) |
| `cms_blog_posts` | `Urbex Slow Paris : Pépites Légales & Éco pour Couples` | `featured_image` | `1502602898657-3e91760cbb34` | [Lien](https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85) |
| `cms_blog_posts` | `Bolo do caco - Recette traditionnelle de Madère` | `featured_image` | `1501785888041-af3ef285b470` | [Lien](https://images.unsplash.com/photo-1501785888041-af3ef285b470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjE2MDh8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBsYW5kc2NhcGV8ZW58MHwwfHx8MTc4NDE5MDM3MXww&ixlib=rb-4.1.0&q=80&w=1080) |
| `cms_blog_posts` | `Bolo do caco - Recette traditionnelle de Madère` | `og_image` | `1501785888041-af3ef285b470` | [Lien](https://images.unsplash.com/photo-1501785888041-af3ef285b470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjE2MDh8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBsYW5kc2NhcGV8ZW58MHwwfHx8MTc4NDE5MDM3MXww&ixlib=rb-4.1.0&q=80&w=1080) |
| `cms_blog_posts` | `Bolo do caco - Recette traditionnelle de Madère` | `og_image_url` | `1501785888041-af3ef285b470` | [Lien](https://images.unsplash.com/photo-1501785888041-af3ef285b470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MjE2MDh8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBsYW5kc2NhcGV8ZW58MHwwfHx8MTc4NDE5MDM3MXww&ixlib=rb-4.1.0&q=80&w=1080) |
| `lib/cms-page-defaults.ts` | `Default Value: home__hero_image` | `value` | `1469474968028-56623f02e42e` | [Lien](https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=85) |
| `lib/cms-page-defaults.ts` | `Default Value: travel-planning__hero_image` | `value` | `1501785888041-af3ef285b470` | [Lien](https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=85) |
| `lib/cms-page-defaults.ts` | `Default Value: a-propos__hero_image` | `value` | `1506905925346-21bda4d32df4` | [Lien](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85) |
| `lib/instagram-static.ts` | `Instagram Story #1` | `image` | `1560719887-fe3105fa1e55` | [Lien](https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=1200&q=80) |
| `lib/instagram-static.ts` | `Instagram Story #2` | `image` | `1559494007-9f5847c49d94` | [Lien](https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=1200&q=80) |
| `lib/instagram-static.ts` | `Instagram Story #3` | `image` | `1515488764276-beab7607c1e6` | [Lien](https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80) |
| `lib/instagram-static.ts` | `Instagram Story #4` | `image` | `1464822759023-fed622ff2c3b` | [Lien](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80) |
| `lib/instagram-static.ts` | `Instagram Story #6` | `image` | `1520939817895-060bdaf4fe1b` | [Lien](https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=80) |

## 👯 3. Doublons d'images (Même ID Unsplash partagé)
*Chaque article ou destination devrait avoir une image unique pour conserver l'aspect qualitatif et l'immersion terrain.*

### Groupe de Doublons: Unsplash ID `1641659735894-45046caad624`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1641659735894-45046caad624?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Poncha : le liquide doré des montagnes` (`poncha-recette-authentique`) | `featured_image` |
| `cms_blog_posts` | `Poncha : le liquide doré des montagnes` (`poncha-recette-authentique`) | `og_image` |
| `cms_blog_posts` | `Poncha : le liquide doré des montagnes` (`poncha-recette-authentique`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1734631621470-d7eebf4d164b`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1734631621470-d7eebf4d164b?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Madère : Découverte d'une île volcanique` (`test-article-1-madere-decouverte`) | `featured_image` |
| `cms_blog_posts` | `Madère : Découverte d'une île volcanique` (`test-article-1-madere-decouverte`) | `og_image` |
| `cms_blog_posts` | `Madère : Découverte d'une île volcanique` (`test-article-1-madere-decouverte`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1738303462619-f31858670857`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1738303462619-f31858670857?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Petit-déjeuner du dimanche : crêpes légères à la farine de riz (sans gluten, pleines de protéines et même végétariennes)` (`petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten-pleines-de-proteines-et-meme-vegetariennes`) | `featured_image` |
| `cms_blog_posts` | `Petit-déjeuner du dimanche : crêpes légères à la farine de riz (sans gluten, pleines de protéines et même végétariennes)` (`petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten-pleines-de-proteines-et-meme-vegetariennes`) | `og_image` |
| `cms_blog_posts` | `Petit-déjeuner du dimanche : crêpes légères à la farine de riz (sans gluten, pleines de protéines et même végétariennes)` (`petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten-pleines-de-proteines-et-meme-vegetariennes`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1559496975-0a9b2fe8b919`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1559496975-0a9b2fe8b919?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Flotter sur la Limmat à Zurich : Notre aventure d'été` (`flotter-sur-la-limmat-a-zurich-notre-aventure-dete`) | `featured_image` |
| `cms_blog_posts` | `Flotter sur la Limmat à Zurich : Notre aventure d'été` (`flotter-sur-la-limmat-a-zurich-notre-aventure-dete`) | `og_image` |
| `cms_blog_posts` | `Flotter sur la Limmat à Zurich : Notre aventure d'été` (`flotter-sur-la-limmat-a-zurich-notre-aventure-dete`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1476514525535-07fb3b4ae5f1`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Roumanie : les villages que les guides ne mentionnent pas` (`roumanie-villages-caches`) | `featured_image` |
| `cms_blog_posts` | `Guide Pratique : Comment débuter le Slow Travel en Duo` (`guide-pratique-comment-debuter-le-slow-travel-en-duo`) | `featured_image` |

### Groupe de Doublons: Unsplash ID `1433838552652-f9a46b332c40`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Madère en mars : ce que personne ne te dit` (`madere-en-mars`) | `featured_image` |
| `cms_blog_posts` | `Madère en mars : ce que personne ne te dit` (`madere-en-mars`) | `og_image` |
| `cms_blog_posts` | `Madère en mars : ce que personne ne te dit` (`madere-en-mars`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1775676143321-ca3fc08916ba`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1775676143321-ca3fc08916ba?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Madère en 4 jours : le guide anti-touristique` (`madeire-4-jours-guide-anti-touristique`) | `featured_image` |
| `cms_blog_posts` | `Madère en 4 jours : le guide anti-touristique` (`madeire-4-jours-guide-anti-touristique`) | `og_image` |
| `cms_blog_posts` | `Madère en 4 jours : le guide anti-touristique` (`madeire-4-jours-guide-anti-touristique`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1600528667656-7ef8602b4c15`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1600528667656-7ef8602b4c15?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Les meilleures brasseries de Zurich : Guide 2026` (`les-meilleures-brasseries-authentiques-de-zurich-guide-2025`) | `featured_image` |
| `cms_blog_posts` | `Les meilleures brasseries de Zurich : Guide 2026` (`les-meilleures-brasseries-authentiques-de-zurich-guide-2025`) | `og_image` |
| `cms_blog_posts` | `Les meilleures brasseries de Zurich : Guide 2026` (`les-meilleures-brasseries-authentiques-de-zurich-guide-2025`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1527668752968-14dc70a27c95`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Stoos Ridge : Notre aventure sur la crête panoramique` (`stoos-ridge-notre-aventure-sur-la-crete-panoramique`) | `featured_image` |
| `cms_blog_posts` | `Stoos Ridge : Notre aventure sur la crête panoramique` (`stoos-ridge-notre-aventure-sur-la-crete-panoramique`) | `og_image` |
| `cms_blog_posts` | `Stoos Ridge : Notre aventure sur la crête panoramique` (`stoos-ridge-notre-aventure-sur-la-crete-panoramique`) | `og_image_url` |
| `destinations` | `Suisse slow travel : Stoos Ridge & lacs de montagne` (`suisse-stoos`) | `featured_image` |

### Groupe de Doublons: Unsplash ID `1644148627223-784e49af78d7`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1644148627223-784e49af78d7?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Flotter sur la Limmat à Zurich : Notre aventure d'été` (`test-article-2-zurich-flotte`) | `featured_image` |
| `cms_blog_posts` | `Flotter sur la Limmat à Zurich : Notre aventure d'été` (`test-article-2-zurich-flotte`) | `og_image` |
| `cms_blog_posts` | `Flotter sur la Limmat à Zurich : Notre aventure d'été` (`test-article-2-zurich-flotte`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1589859609023-2482d354a072`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1589859609023-2482d354a072?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `CuiB d'Arte à Timișoara : Cour intérieure et Poésie roumaine` (`cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine`) | `featured_image` |
| `cms_blog_posts` | `CuiB d'Arte à Timișoara : Cour intérieure et Poésie roumaine` (`cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine`) | `og_image` |
| `cms_blog_posts` | `CuiB d'Arte à Timișoara : Cour intérieure et Poésie roumaine` (`cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1581262208435-41726149a759`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1581262208435-41726149a759?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Quand verdure rime avec street art – Escapade à la Petite Ceinture 75014` (`quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014`) | `featured_image` |
| `cms_blog_posts` | `Quand verdure rime avec street art – Escapade à la Petite Ceinture 75014` (`quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014`) | `og_image` |
| `cms_blog_posts` | `Quand verdure rime avec street art – Escapade à la Petite Ceinture 75014` (`quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1697899245842-b75fee1ba17c`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1697899245842-b75fee1ba17c?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Ballade du Vendredi soir à la rue Mouffetard : Singh'Nature` (`ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature`) | `featured_image` |
| `cms_blog_posts` | `Ballade du Vendredi soir à la rue Mouffetard : Singh'Nature` (`ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature`) | `og_image` |
| `cms_blog_posts` | `Ballade du Vendredi soir à la rue Mouffetard : Singh'Nature` (`ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1501785888041-af3ef285b470`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Bolo do caco - Recette traditionnelle de Madère` (`bolo-do-caco-recette-traditionnelle-de-madere-3`) | `featured_image` |
| `cms_blog_posts` | `Bolo do caco - Recette traditionnelle de Madère` (`bolo-do-caco-recette-traditionnelle-de-madere-3`) | `og_image` |
| `cms_blog_posts` | `Bolo do caco - Recette traditionnelle de Madère` (`bolo-do-caco-recette-traditionnelle-de-madere-3`) | `og_image_url` |
| `lib/cms-page-defaults.ts` | `Default Value: travel-planning__hero_image` (`travel-planning__hero_image`) | `value` |

### Groupe de Doublons: Unsplash ID `1551632811-561732d1e306`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1551632811-561732d1e306?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Check-list pour Randonnée en Famille en Montagne` (`check-list-pour-randonnee-en-famille-en-montagne`) | `featured_image` |
| `cms_blog_posts` | `Check-list pour Randonnée en Famille en Montagne` (`check-list-pour-randonnee-en-famille-en-montagne`) | `og_image` |
| `cms_blog_posts` | `Check-list pour Randonnée en Famille en Montagne` (`check-list-pour-randonnee-en-famille-en-montagne`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1724697723575-1ad28a2c2a7e`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1724697723575-1ad28a2c2a7e?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Podgorica : ce que personne ne te dit sur la capitale du Monténégro` (`podgorica-capitale-oubliee-montenegro`) | `featured_image` |
| `cms_blog_posts` | `Podgorica : ce que personne ne te dit sur la capitale du Monténégro` (`podgorica-capitale-oubliee-montenegro`) | `og_image` |
| `cms_blog_posts` | `Podgorica : ce que personne ne te dit sur la capitale du Monténégro` (`podgorica-capitale-oubliee-montenegro`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1525891618908-24765267dab7`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1525891618908-24765267dab7?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Madère — Tout ce qu'on a déniché` (`madere-guide-complet`) | `featured_image` |
| `cms_blog_posts` | `Madère — Tout ce qu'on a déniché` (`madere-guide-complet`) | `og_image` |
| `cms_blog_posts` | `Madère — Tout ce qu'on a déniché` (`madere-guide-complet`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1764333580740-b327847301b1`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1764333580740-b327847301b1?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Bacalhau à Lagareiro` (`bacalhau-a-lagareiro`) | `featured_image` |
| `cms_blog_posts` | `Bacalhau à Lagareiro` (`bacalhau-a-lagareiro`) | `og_image` |
| `cms_blog_posts` | `Bacalhau à Lagareiro` (`bacalhau-a-lagareiro`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1620563092215-0fbc6b55cfc5`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1620563092215-0fbc6b55cfc5?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Zurich : notre carnet slow travel 2026` (`zurich`) | `featured_image` |
| `cms_blog_posts` | `Zurich : notre carnet slow travel 2026` (`zurich`) | `og_image` |
| `cms_blog_posts` | `Zurich : notre carnet slow travel 2026` (`zurich`) | `og_image_url` |

### Groupe de Doublons: Unsplash ID `1621261574254-b3f12a818202`
*Image concernée:* [Visualiser sur Unsplash](https://images.unsplash.com/photo-1621261574254-b3f12a818202?w=600)

| Source | Élément / Page | Champ |
|---|---|---|
| `cms_blog_posts` | `Madère Slow Travel : Guide Complet Éco-Luxe 2026` (`madere-slow-travel-guide`) | `featured_image` |
| `cms_blog_posts` | `Madère Slow Travel : Guide Complet Éco-Luxe 2026` (`madere-slow-travel-guide`) | `og_image` |
| `cms_blog_posts` | `Madère Slow Travel : Guide Complet Éco-Luxe 2026` (`madere-slow-travel-guide`) | `og_image_url` |

## 📁 4. Images Vides / Manquantes (Champs obligatoires)
*Aucun champ d'image obligatoire n'est vide.* ✅

