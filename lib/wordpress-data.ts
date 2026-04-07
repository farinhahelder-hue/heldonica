// ============================================================
// DONNÉES HELDONICA.FR — Source de vérité des contenus
// ============================================================

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categories: string[];
  tags: string[];
  date: string;
  readTime: number;
  image: string;
}

export interface DestinationPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1274,
    title: `Madère Slow Travel : Guide Complet Éco-Luxe 2026`,
    slug: "madere-slow-travel-guide",
    excerpt: `Madère Slow Travel : Guide Complet Éco-Luxe 2026 Découvrez aussi nos pépites mystiques.`,
    content: `<div><span>Étiqueté insolite, madere, slow travel</span></div>`,
    category: "Travel",
    categories: ["Europe", "Guides pratiques", "Madère", "Portugal"],
    tags: ["insolite", "madere", "slow travel"],
    date: "21 Mar 2026",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2026/03/fetched-image-2-1024x768.jpg",
  },
  {
    id: 1269,
    title: `Urbex Slow Paris : Pépites Légales & Éco Couples`,
    slug: "urbex-paris-safe",
    excerpt: `Urbex Paris 2026 : Exploration Légale Slow Éco Couples Découvrez aussi notre escapade à la Petite Ceinture.`,
    content: `<div><span>Étiqueté duo, paris, slow travel</span></div>`,
    category: "Travel",
    categories: ["City Trips", "Europe", "France", "Paris"],
    tags: ["duo", "paris", "slow travel"],
    date: "21 Mar 2026",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2026/03/fetched-image-1-1024x683.jpg",
  },
  {
    id: 1164,
    title: `Guide Pratique : Comment débuter le Slow Travel en Duo`,
    slug: "guide-pratique-comment-debuter-le-slow-travel-en-duo",
    excerpt: `Bienvenue dans notre guide pratique dédié au Slow Travel. Voyager lentement, c'est avant tout prendre le temps de découvrir l'âme d'une destination.`,
    content: `<div><span>Étiqueté duo, slow travel, transylvanie</span></div>`,
    category: "Travel",
    categories: ["Guides pratiques", "Roumanie"],
    tags: ["duo", "slow travel"],
    date: "20 Mar 2026",
    readTime: 2,
    image: "",
  },
  {
    id: 704,
    title: `Madère : Quand partir sur l'île de l'éternel printemps`,
    slug: "madere-quand-partir-sur-lile-de-leternel-printemps",
    excerpt: `Madère est surnommée l'île de l'éternel printemps. Consultez notre guide complet éco-luxe.`,
    content: `<div><span>Étiqueté été, madere</span></div>`,
    category: "Travel",
    categories: ["Guides pratiques", "Europe", "Madère", "Portugal"],
    tags: ["été", "madere"],
    date: "17 Mar 2026",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg",
  },
  {
    id: 702,
    title: `Pépites mystiques de Madère`,
    slug: "pepites-mystiques-de-madere",
    excerpt: `La forêt mystique de Fanal : notre graal madeirien. Préparez votre voyage avec notre guide saisonnier.`,
    content: `<div><span>Étiqueté insolite, lieux-secrets, madere, mystique, portugal</span></div>`,
    category: "Travel",
    categories: ["Découvertes Locales", "Europe", "Madère", "Portugal"],
    tags: ["insolite", "lieux-secrets", "madere", "mystique", "portugal"],
    date: "17 Mar 2026",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg",
  },
  {
    id: 448,
    title: `Prego no bolo do caco`,
    slug: "prego-no-bolo-do-caco",
    excerpt: `Le Prego no bolo do caco est le sandwich emblématique de Madère.`,
    content: `<div><span>Étiqueté bolo-do-caco, madere, prego, sandwich, street-food</span></div>`,
    category: "Food & Lifestyle",
    categories: ["Europe", "Nourriture", "Portugal", "Recettes"],
    tags: ["bolo-do-caco", "madere", "prego", "sandwich"],
    date: "29 Oct 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/10/prego-bolo-caco-683x1024.jpg",
  },
  {
    id: 446,
    title: `Bacalhau à Lagareiro`,
    slug: "bacalhau-a-lagareiro",
    excerpt: `Le Bacalhau à Lagareiro est un classique de la cuisine portugaise.`,
    content: `<div><span>Étiqueté bacalhau, madere</span></div>`,
    category: "Food & Lifestyle",
    categories: ["Europe", "Nourriture", "Portugal", "Recettes"],
    tags: ["bacalhau", "madere"],
    date: "29 Oct 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/10/bacalhau-lagareiro-3-683x1024.jpg",
  },
  {
    id: 433,
    title: `Bolo do caco – Recette traditionnelle de Madère`,
    slug: "bolo-do-caco-recette-traditionnelle-de-madere-3",
    excerpt: `Le Bolo do caco est le pain traditionnel de Madère, cuit sur une pierre de basalte.`,
    content: `<div><span>Étiqueté bolo-do-caco, madere</span></div>`,
    category: "Food & Lifestyle",
    categories: ["Europe", "Nourriture", "Portugal", "Recettes"],
    tags: ["bolo-do-caco", "madere"],
    date: "29 Oct 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/10/zurich-riviere-1024x683.jpg",
  },
  {
    id: 281,
    title: `Crêpes légères à la farine de riz (sans gluten)`,
    slug: "petit-dejeuner-du-dimanche-crepes-legeres-a-la-farine-de-riz-sans-gluten-pleines-de-proteines-et-meme-vegetariennes",
    excerpt: `Recette de crêpes légères à la farine de riz, conseils de cuisson, variations fromage/jambon/herbes.`,
    content: `<div><span>Étiqueté duo, street-food</span></div>`,
    category: "Food & Lifestyle",
    categories: ["Guides pratiques", "Nourriture", "Nourriture Locale"],
    tags: ["duo"],
    date: "01 Oct 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/10/crepes-riz-3-1024x683.jpg",
  },
  {
    id: 285,
    title: `CuiB d'Arte à Timișoara : Cour intérieure et Poésie roumaine`,
    slug: "cuib-darte-a-timisoara-cour-interieure-et-poesie-roumaine",
    excerpt: `Au cœur de Timișoara, nous avons découvert cette cour intérieure fascinante.`,
    content: `<div><p>Loin des circuits touristiques classiques, il existe à Timișoara des lieux secrets où l'architecture roumaine s'épanouit.</p></div>`,
    category: "Travel",
    categories: ["Europe", "City Trips", "Roumanie"],
    tags: ["architecture", "art contemporain"],
    date: "27 Sep 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg",
  },
  {
    id: 279,
    title: `Flotter sur la Limmat à Zurich : Notre aventure d'été`,
    slug: "flotter-sur-la-limmat-a-zurich-notre-aventure-dete",
    excerpt: `Quand les températures estivales grimpent, une descente de la Limmat à Zurich s'impose.`,
    content: `<div><p>Une descente rafraîchissante de la Limmat à Zurich au cœur de l'été.</p></div>`,
    category: "Food & Lifestyle",
    categories: ["Destinations", "Nature", "Suisse"],
    tags: ["zurich", "été"],
    date: "27 Sep 2025",
    readTime: 4,
    image: "https://heldonica.fr/wp-content/uploads/2025/09/zurich-limmat-ete-3-1024x681.jpg",
  },
  {
    id: 277,
    title: `Escapade à la Petite Ceinture 75014`,
    slug: "quand-verdure-rime-avec-street-art-escapade-a-la-petite-ceinture-75014",
    excerpt: `Verdure et art urbain sans quitter Paris — la Petite Ceinture, portion piétonne du 14ᵉ.`,
    content: `<div><p>Loin des circuits touristiques classiques, la nature reprend ses droits sur la Petite Ceinture.</p></div>`,
    category: "Travel",
    categories: ["Balade insolite", "Europe", "France", "Nature", "Paris"],
    tags: ["architecture", "insolite", "paris"],
    date: "27 Sep 2025",
    readTime: 3,
    image: "https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg",
  },
  {
    id: 273,
    title: `Ballade du Vendredi soir rue Mouffetard : Singh'Nature`,
    slug: "ballade-du-vendredi-soir-a-la-rue-mouffetard-singhnature",
    excerpt: `Une soirée urbaine sous le signe de la découverte et de la gourmandise à Paris.`,
    content: `<div><p>Une soirée placée sous le signe de la convivialité à Paris !</p></div>`,
    category: "Food & Lifestyle",
    categories: ["Europe", "France", "Nourriture", "Paris"],
    tags: ["paris", "restaurant-vegetarien", "rue-mouffetard"],
    date: "27 Sep 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/09/paris-mouffetard-2-1024x681.jpg",
  },
  {
    id: 271,
    title: `Les meilleures brasseries de Zurich : Guide 2026`,
    slug: "les-meilleures-brasseries-authentiques-de-zurich-guide-2025",
    excerpt: `Notre sélection des meilleures brasseries artisanales de Zurich.`,
    content: `<div><span>Étiqueté bière artisanale, bonnes adresses zurich, brasserie, zurich</span></div>`,
    category: "Food & Lifestyle",
    categories: ["Découvertes Locales", "Destinations", "Nourriture", "Suisse"],
    tags: ["bière artisanale", "brasserie", "zurich"],
    date: "26 Sep 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/09/zurich-brasserie-2-683x1024.jpg",
  },
  {
    id: 192,
    title: `Zurich : notre carnet slow travel 2026`,
    slug: "zurich",
    excerpt: `Flottez sur la Limmat, découvrez les meilleures brasseries et vivez Zurich au rythme slow.`,
    content: `<div><span>Étiqueté été, slow travel, suisse, zurich</span></div>`,
    category: "Travel",
    categories: ["Carnets voyage", "Destinations", "Suisse"],
    tags: ["été", "slow travel", "zurich"],
    date: "12 Aug 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg",
  },
  {
    id: 69,
    title: `Stoos Ridge : Notre aventure sur la crête panoramique`,
    slug: "stoos-ridge-notre-aventure-sur-la-crete-panoramique",
    excerpt: `Une randonnée familiale accessible au cœur des Alpes suisses, avec un panorama à 360°.`,
    content: `<div><p>Une randonnée familiale accessible au cœur des Alpes suisses.</p></div>`,
    category: "Travel",
    categories: ["Destinations", "Randonnées", "Suisse"],
    tags: ["alpes suisses", "montagne suisse", "randonnée alpine"],
    date: "01 Aug 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg",
  },
  {
    id: 93,
    title: `Check-list pour Randonnée en Famille en Montagne`,
    slug: "check-list-pour-randonnee-en-famille-en-montagne",
    excerpt: `Testé sur Stoos Ridge : notre check-list complète pour randonner en famille en montagne.`,
    content: `<div><span>Étiqueté alpes, stoos, suisse</span></div>`,
    category: "Travel",
    categories: ["Guides pratiques", "Nature", "Randonnées"],
    tags: ["alpes", "stoos", "suisse"],
    date: "01 Aug 2025",
    readTime: 2,
    image: "https://heldonica.fr/wp-content/uploads/2025/08/randonnee-montagne-1024x683.jpg",
  },
];

export const destinationPages: DestinationPage[] = [
  // ── Pages utilitaires ──────────────────────────────────────
  {
    id: 1327,
    title: `Accueil Heldonica Vidéo`,
    slug: "accueil-heldonica-video",
    content: `<div><p>Explorateurs émerveillés, dénicheurs de pépites.</p></div>`,
    image: "https://heldonica.fr/wp-content/uploads/2026/03/Heldonica.mp4",
  },
  {
    id: 1326,
    title: `Accueil Heldonica 2026`,
    slug: "accueil-heldonica-2026",
    content: `<section><h1>Heldonica : L'Expert de l'Aventure Slow</h1><p>Duo explorateurs-sages : itinéraires terrain 100% vécus.</p></section>`,
    image: "https://heldonica.fr/wp-content/uploads/2026/03/Heldonica.mp4",
  },
  {
    id: 1321,
    title: `Accueil`,
    slug: "accueil-heldonica-3",
    content: `<section><h1>Vivre découvrir partager</h1></section>`,
    image: "https://heldonica.fr/wp-content/uploads/2026/03/Heldonica.mp4",
  },
  {
    id: 1315,
    title: `Portugal Slow : Douro & Authenticité`,
    slug: "portugal-slow-douro",
    content: `<div><p>Découvrez le Portugal slow travel à travers le Douro et ses paysages authentiques.</p></div>`,
    image: "",
  },
  {
    id: 1313,
    title: `Quel Slow Traveler Es-Tu ? Test 5 Questions`,
    slug: "quiz-quel-slow-traveler-es-tu",
    content: `<h1>Quel Slow Traveler Es-Tu ? Test 5 Questions</h1><p>Découvrez votre profil de voyageur slow.</p>`,
    image: "",
  },
  // ── Pages destination Zurich ───────────────────────────────
  {
    id: 192,
    title: `Zurich`,
    slug: "zurich",
    content: `
      <h2>Pourquoi on aime Zurich en slow travel</h2>
      <p>Zurich, c'est la ville suisse qu'on croyait réservée aux banquiers et aux montres de luxe. On y est arrivés un vendredi de juillet, sacs sur le dos, sans plan précis — et on est repartis conquis. La Limmat qui serpente entre les façades médiévales, les Badi (piscines flottantes) bondées de locaux, les brasseries artisanales cachées dans les ruelles du Langstrasse… Zurich se mérite, et elle le rend bien.</p>
      <h2>Nos pépites dénichées sur place</h2>
      <ul>
        <li><strong>Flotter sur la Limmat</strong> — l'activité gratuite incontournable de l'été zurichois. Tu glisses depuis Oberer Letten jusqu'au centre-ville, emporté par le courant, en 20 minutes. Prévoir un sac étanche.</li>
        <li><strong>Les brasseries du Langstrasse</n        </strong> — on a testé trois adresses artisanales dans ce quartier populaire et vivant. Ambiance locale garantie, zéro touriste.</li>
        <li><strong>Le Lindenhügel au coucher du soleil</strong> — la colline du Lindenhügel offre une vue dégagée sur les toits de la vieille ville et les Alpes en arrière-plan par temps clair.</li>
        <li><strong>Le marché de la Bürkliplatz</strong> — le samedi matin, légumes bio, fromages et fleurs coupées. Le vrai rythme zurichois.</li>
      </ul>
      <h2>Infos pratiques</h2>
      <ul>
        <li><strong>Meilleure période :</strong> juin à septembre pour profiter des Badi et de la Limmat</li>
        <li><strong>Se déplacer :</strong> le ZürichCard (24h ou 72h) couvre trams, bus, bateaux et musées</li>
        <li><strong>Budget :</strong> comptez 80-120€/jour/personne hors hébergement — Zurich est chère mais les activités gratuites sont nombreuses</li>
        <li><strong>Où dormir :</strong> les quartiers Kreis 4 et Kreis 5 pour l'ambiance locale</li>
      </ul>
      <p><em>Verdict Heldonica — On a posé nos valises 4 jours. On en aurait pris 7. Zurich est la destination slow travel européenne sous-estimée par excellence.</em></p>
    `,
    image: "https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg",
  },
  // ── Pages destination Suisse ───────────────────────────────
  {
    id: 200,
    title: `Suisse`,
    slug: "suisse",
    content: `
      <h2>La Suisse autrement : notre vision slow travel</h2>
      <p>On ne compte plus les fois où des amis nous ont dit "la Suisse c'est joli mais trop cher". C'est vrai et faux à la fois. Oui, une nuit d'hôtel en ville peut piquer. Mais randonner sur la Stoos Ridge, flotter sur la Limmat à Zurich ou s'asseoir au bord du lac de Thoune avec un pique-nique du marché — ça, ça ne coûte presque rien.</p>
      <h2>Nos destinations suisses coups de cœur</h2>
      <ul>
        <li><strong>Zurich</strong> — ville cosmopolite avec une âme de village. Badi, brasseries, vieille ville. Notre base de camp suisse.</li>
        <li><strong>Stoos</strong> — le funiculaire le plus raide du monde mène à une crête panoramique accessible à toute la famille.</li>
        <li><strong>Lucerne</strong> — le Kapellbrücke, le lac des Quatre-Cantons et les collines environnantes. Idéal en demi-journée depuis Zurich.</li>
        <li><strong>Stein am Rhein</strong> — un village médiéval préservé à 1h de Zurich, quasi sans touristes hors saison.</li>
      </ul>
      <h2>Conseils pratiques</h2>
      <ul>
        <li><strong>Transport :</strong> le Swiss Travel Pass est rentable si vous bougez beaucoup (train, bus, bateau inclus)</li>
        <li><strong>Budget malin :</strong> pique-niquez au marché, cuisinez à l'hébergement, privilegiez les auberges de jeunesse suisses (excellentes)</li>
        <li><strong>Meilleure saison :</strong> juillet-août pour le plein air, décembre-mars pour la neige et l'ambiance de chalet</li>
      </ul>
      <p><em>Verdict Heldonica — La Suisse, c'est notre destination slow travel européenne de référence. Chaque séjour, on y découvre une nouvelle pépite.</em></p>
    `,
    image: "https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg",
  },
  // ── Pages destination Roumanie ─────────────────────────────
  {
    id: 210,
    title: `Roumanie`,
    slug: "roumanie",
    content: `
      <h2>La Roumanie, notre coup de foudre inattendu</h2>
      <p>On a découvert la Roumanie par hasard, en cherchant une destination européenne hors des sentiers battus. Ce qu'on y a trouvé a dépassé toutes nos attentes : des paysages de Carpates à couper le souffle, une culture d'accueil sincère, une gastronomie méconnue et surtout — des prix qui permettent de voyager long sans se ruiner.</p>
      <h2>Nos pépites dénichées sur place</h2>
      <ul>
        <li><strong>Timișoara</strong> — la capitale culturelle roumaine, ville de la Révolution de 1989 et de l'effervescence artistique. Le CuiB d'Arte, cour intérieure secrète, est notre coup de cœur absolu.</li>
        <li><strong>Le Delta du Danube</strong> — un des derniers grands espaces sauvages d'Europe. Barque, oiseaux migrateurs, villages de pêcheurs. L'antithèse du tourisme de masse.</li>
        <li><strong>La Transylvanie</strong> — Brasov, Sighișoara et les villages saxons. L'architecture médiévale la mieux conservée d'Europe centrale.</li>
        <li><strong>Les Carpates</strong> — randonnées dans le Parc National de Retezat, à des niveaux de solitude qu'on ne trouve plus dans les Alpes.</li>
      </ul>
      <h2>Infos pratiques</h2>
      <ul>
        <li><strong>Monnaie :</strong> le leu roumain (RON) — les cartes acceptées partout en ville, prévoir du cash en zone rurale</li>
        <li><strong>Budget :</strong> 40-60€/jour/couple tout compris — l'une des destinations les plus accessibles d'Europe</li>
        <li><strong>Transport :</strong> train entre les grandes villes, location de voiture indispensable pour le Delta et les Carpates</li>
        <li><strong>Meilleure période :</strong> mai-juin et septembre pour éviter la chaleur et la foule</li>
      </ul>
      <p><em>Verdict Heldonica — La Roumanie est notre destination slow travel coup de cœur. On y retourne chaque année et on y découvre toujours quelque chose de nouveau.</em></p>
    `,
    image: "https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg",
  },
  // ── Pages destination Madère ───────────────────────────────
  {
    id: 220,
    title: `Madère`,
    slug: "madere",
    content: `
      <h2>Madère, l'île de l'éternel printemps</h2>
      <p>On a atterri à Madère en novembre, fuyant le gris parisien. Ce qu'on a trouvé : 22°C, des cascades dans la forêt, des falaises à pic sur l'Atlantique et un pain cuit sur pierre volcanique qui a changé notre rapport au sandwich. Madère, c'est l'île qui réconcilie le slow travel avec le confort — pas besoin de se priver pour voyager bien ici.</p>
      <h2>Nos incontournables madeiriens</h2>
      <ul>
        <li><strong>La forêt de Fanal</strong> — notre graal. Des laurisylves millénaires dans le brouillard, à l'aube. Un lieu mystique qui ne ressemble à rien d'autre en Europe.</li>
        <li><strong>Les levadas</strong> — les sentiers de randonnée qui suivent les canaux d'irrigation. La Levada do Caldeirão Verde est notre préférée : 4h aller-retour, cascades et tunnels taillés dans la roche.</li>
        <li><strong>Le marché dos Lavradores à Funchal</strong> — le meilleur endroit pour goûter les fruits exotiques locaux et les fleurs de strelitzia. Y aller tôt le matin.</li>
        <li><strong>Le Prego no Bolo do Caco</strong> — le sandwich local, steak mariné dans un pain de taro grillé. Incontournable.</li>
      </ul>
      <h2>Infos pratiques</h2>
      <ul>
        <li><strong>Accès :</strong> vols directs depuis Paris (3h30). EasyJet et TAP ont des liaisons régulières.</li>
        <li><strong>Transport sur place :</strong> location de voiture recommandée — les routes de montagne sont spectaculaires mais exigent de la concentration</li>
        <li><strong>Meilleure période :</strong> octobre à mai pour éviter la chaleur et profiter des prix hors saison</li>
        <li><strong>Budget :</strong> 60-90€/jour/personne — plus accessible que la plupart des îles atlantiques</li>
      </ul>
      <p><em>Verdict Heldonica — Madère est dans notre top 3 absolu. Une île qu'on recommande les yeux fermés, en toute saison.</em></p>
    `,
    image: "https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg",
  },
  // ── Pages destination Paris / Île-de-France ────────────────
  {
    id: 230,
    title: `Paris & Île-de-France`,
    slug: "paris",
    content: `
      <h2>Paris en slow travel : voir la ville autrement</h2>
      <p>On habite en Île-de-France, et pourtant Paris nous surprend encore. Pas le Paris des selfies devant la Tour Eiffel — l'autre Paris, celui de la Petite Ceinture au 14ème, du Canal de l'Ourcq un dimanche matin, des cours intérieures cachées dans le Marais. Le slow travel commence parfois à 30 minutes de chez soi.</p>
      <h2>Nos pépites parisiennes</h2>
      <ul>
        <li><strong>La Petite Ceinture (14ème)</strong> — l'ancienne voie ferrée reconvertie en promenade sauvage. Street art, végétation folle, ambiance urbex légal.</li>
        <li><strong>La rue Mouffetard</strong> — le marché du jeudi et vendredi matin, puis une soirée au Singh'Nature pour une cuisine végétarienne fusion mémorable.</li>
        <li><strong>Le Canal de l'Ourcq</strong> — longer le canal à vélo depuis La Villette jusqu'à Meaux. Une journée entière de slow travel à portée de RER.</li>
        <li><strong>Fontainebleau</strong> — le château, oui, mais surtout la forêt. Escalade sur les blocs, pique-nique, silence. À 40 minutes de Paris en train.</li>
      </ul>
      <p><em>Verdict Heldonica — Paris se mérite quand on la cherche vraiment. Pas la carte postale — l'âme cachée.</em></p>
    `,
    image: "https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg",
  },
];

// ── Fonctions utilitaires Blog ────────────────────────────────
export function getAllBlogSlugs() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(
  currentSlug: string,
  category: string,
  limit = 3
): BlogPost[] {
  const sameCategory = blogPosts.filter(
    (post) => post.slug !== currentSlug && post.category === category
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);
  const others = blogPosts.filter(
    (post) => post.slug !== currentSlug && post.category !== category
  );
  return [...sameCategory, ...others].slice(0, limit);
}

// ── Fonctions utilitaires Destinations ───────────────────────
export function getAllDestinationSlugs() {
  return destinationPages.map((dest) => ({ slug: dest.slug }));
}

export function getDestinationBySlug(slug: string): DestinationPage | undefined {
  return destinationPages.find((dest) => dest.slug === slug);
}
