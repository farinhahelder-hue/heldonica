#!/usr/bin/env node
/**
 * Script de seed pour les articles blog Heldonica
 * Usage: node scripts/seed-articles.js
 */

const ARTICLES = [
  {
    slug: "madere-slow-travel-guide",
    title: "Madère Slow Travel : Guide Complet Éco-Luxe 2026",
    category: "Carnets Voyage",
    tags: ["madère", "slow travel", "éco-luxe", "portugal", "levadas"],
    featured_image: "https://images.unsplash.com/photo-1555117343-8b28e6f14895?w=1200&q=85",
    excerpt: "Notre guide complet pour explorer Madère en slow travel éco-luxe : levadas hors des sentiers battus, hébergements authentiques, tables de pêcheurs et plénitude atlantique.",
    published_at: "2026-03-21",
    content: "<article class=\"prose-heldonica\"><p class=\"lead\">On avait réservé sept jours. On en a fait douze. Madère fait ça — elle te retient.</p><p>Pas avec des attractions, pas avec des animations de bord de piscine. Avec quelque chose de plus discret et de plus fort : l'impression que chaque vallée cache encore quelque chose que tu n'as pas vu, chaque chemin de levada s'enfonce un peu plus loin dans une forêt qui semble exister hors du temps.</p><h2>Pourquoi Madère est la destination slow travel par excellence</h2><p>Madère n'est pas conçue pour être pressée. Les routes en lacets qui contournent les falaises t'obligent à ralentir. Les levadas — ces canaux d'irrigation du XVe siècle creusés à flanc de montagne — ne se longent qu'à pied, pas à pas.</p><h2>✦ Verdict Heldonica</h2><blockquote><p>Madère est l'une des rares destinations en Europe où le slow travel n'est pas un choix — c'est une contrainte imposée par la géographie elle-même.</p><em>— Heldonica, testés sur place en mars 2026</em></blockquote></article>"
  },
  {
    slug: "guide-pratique-comment-debuter-le-slow-travel-en-duo",
    title: "Guide Pratique : Comment débuter le Slow Travel en Duo",
    category: "Guides Pratiques",
    tags: ["slow travel", "duo", "conseils", "débutants", "voyage en couple"],
    featured_image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85",
    excerpt: "On était comme toi : pressés, surbookés, deux semaines de vacances par an. Voilà comment on a tout réappris à ralentir — et comment tu peux commencer dès ton prochain voyage en duo.",
    published_at: "2026-03-20",
    content: "<article class=\"prose-heldonica\"><p class=\"lead\">Il y a quelques années, on planifiait nos vacances comme des missions : 7 jours, 4 pays, 14 musées, 3 vols intérieurs. On rentrait épuisés, avec des photos magnifiques et le sentiment de n'avoir rien vraiment vu.</p><h2>C'est quoi, vraiment, le slow travel ?</h2><p>Le slow travel n'est pas forcément voyager lentement au sens littéral. C'est un état d'esprit : choisir la profondeur plutôt que la largeur. Une destination plutôt que cinq.</p><h2>✦ Verdict Heldonica</h2><blockquote><p>Le slow travel en duo n'est pas un mode de voyage plus lent — c'est un mode de voyage plus honnête.</p><em>— Heldonica, appris sur la route depuis 2015</em></blockquote></article>"
  },
  {
    slug: "urbex-paris-safe",
    title: "Urbex Slow Paris : Pépites Légales & Éco pour Couples",
    category: "Découvertes Locales",
    tags: ["paris", "urbex", "slow travel", "duo", "lieux insolites"],
    featured_image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85",
    excerpt: "L'urbex parisien sans effraction — on t'emmène dans les friches légales, rooftops accessibles et lieux oubliés que les Parisiens gardent secrets.",
    published_at: "2026-03-15",
    content: "<article class=\"prose-heldonica\"><p class=\"lead\">Paris a deux visages. Celui des cartes postales, qu'on connaît tous. Et celui que la ville garde pour ses initiés — ses friches industrielles reconverties en jardins secrets, ses passages couverts endormis.</p><h2>La Petite Ceinture : notre terrain de jeu</h2><p>La Petite Ceinture est une ancienne ligne de chemin de fer qui ceinture Paris sur 32 km. Abandonnée en 1934, elle s'est transformée en coulée verte sauvage.</p><h2>✦ Verdict Heldonica</h2><blockquote><p>L'urbex slow, c'est explorer la ville avec les yeux d'un archéologue du quotidien.</p><em>— Heldonica, Parisiens depuis 2018</em></blockquote></article>"
  },
  {
    slug: "madere-quand-partir-sur-lile-de-leternel-printemps",
    title: "Madère : Quand partir sur l'île de l'éternel printemps",
    category: "Guides Pratiques",
    tags: ["madère", "météo", "saisons", "quand partir", "portugal"],
    featured_image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=85",
    excerpt: "On a exploré Madère sous la pluie, sous le soleil et dans la brume. Notre guide honnête pour savoir vraiment quand y aller selon ce que tu cherches.",
    published_at: "2026-03-05",
    content: "<article class=\"prose-heldonica\"><p class=\"lead\">Madère est surnommée l'île de l'éternel printemps. C'est vrai — et c'est trompeur. Le climat y est doux toute l'année, oui. Mais «éternel printemps» cache une réalité plus nuancée.</p><h2>Le paradoxe climatique de Madère</h2><p>Madère est une île volcanique très découpée. Les montagnes centrales atteignent 1800m. Résultat : le versant nord reçoit 3 fois plus de pluie que le versant sud.</p><h2>✦ Verdict Heldonica</h2><blockquote><p>Il n'y a pas de mauvaise saison à Madère — il y a des saisons différentes.</p><em>— Heldonica, trois saisons testées sur place</em></blockquote></article>"
  },
  {
    slug: "pepites-mystiques-de-madere",
    title: "Pépites mystiques de Madère : nos lieux secrets",
    category: "Découvertes Locales",
    tags: ["madère", "lieux secrets", "insolite", "forêt", "mystique"],
    featured_image: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=1200&q=85",
    excerpt: "Loin des levadas bondées, Madère cache des lieux chargés d'énergie et de mystère. Chapelles oubliées, forêts laurissilve au petit matin, falaises au coucher du soleil.",
    published_at: "2026-03-01",
    content: "<article class=\"prose-heldonica\"><p class=\"lead\">Il y a un endroit à Madère où on est restés silencieux pendant vingt minutes. Pas parce qu'on n'avait rien à dire. Parce que la forêt nous avait absorbés.</p><h2>Fanal : la forêt hors du temps</h2><p>Fanal est notre pépite absolue de Madère. Un plateau à 1236m d'altitude dans le nord-ouest de l'île, couvert de tilleuls séculaires.</p><h2>✦ Verdict Heldonica</h2><blockquote><p>Madère cache ses meilleurs endroits à ceux qui prennent le temps de chercher.</p><em>— Heldonica, pépites dénichées lors de trois séjours</em></blockquote></article>"
  },
  {
    slug: "prego-no-bolo-do-caco",
    title: "Prego no bolo do caco : Le sandwich madeiran qu'on n'oublie pas",
    category: "Découvertes Locales",
    tags: ["madère", "gastronomie", "street food", "prego", "bolo do caco"],
    featured_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85",
    excerpt: "Un steak mariné glissé dans un bolo do caco chaud — le prego est la pépite street food de Madère qu'on déniche dans les snacks de bord de route.",
    published_at: "2025-10-25",
    content: "<article class=\"prose-heldonica\"><p class=\"lead\">On a mangé beaucoup de choses à Madère. Des espadas à la sauce de fruit de la passion, du vin de Madère chaud sur les levadas, des poncha artisanales. Mais ce dont on parle encore à table, c'est d'un sandwich.</p><h2>C'est quoi le bolo do caco ?</h2><p>Le bolo do caco («pain de la pierre plate») est le pain traditionnel de Madère. Fait de patate douce, de farine de blé et de levure, il est cuit à plat sur une pierre de basalte.</p><h2>✦ Verdict Heldonica</h2><blockquote><p>Le prego no bolo do caco, c'est la quintessence de ce qu'on aime dans le slow travel alimentaire.</p><em>— Heldonica, recette reçue à Madère</em></blockquote></article>"
  }
];

console.log('📝 Heldonica - Seed Articles');
console.log('===========================');
console.log(`\n📊 ${ARTICLES.length} articles à insérer:\n`);

ARTICLES.forEach((a, i) => {
  console.log(`  ${i + 1}. ${a.title}`);
  console.log(`     Category: ${a.category}`);
  console.log(`     Slug: ${a.slug}`);
  console.log(`     Published: ${a.published_at}`);
  console.log('');
});

console.log('\n✅ Script prêt.');
console.log('\nPour exécuter le seed:');
console.log('1. Ouvrir le Dashboard Supabase');
console.log('2. Aller dans SQL Editor');
console.log('3. Copier le contenu de supabase/migrations/20260406010000_seed_articles_complets.sql');
console.log('4. Exécuter le SQL');
console.log('\nOu appeler GET /api/seed-articles avec auth CMS');
