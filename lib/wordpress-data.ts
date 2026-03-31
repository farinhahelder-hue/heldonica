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
];

// ── Fonctions utilitaires Blog ────────────────────────────────
export function getAllBlogSlugs() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  return blogPosts
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit);
}

// ── Fonctions utilitaires Destinations ───────────────────────
export function getAllDestinationSlugs() {
  return destinationPages.map((dest) => ({ slug: dest.slug }));
}

export function getDestinationBySlug(slug: string): DestinationPage | undefined {
  return destinationPages.find((dest) => dest.slug === slug);
}
