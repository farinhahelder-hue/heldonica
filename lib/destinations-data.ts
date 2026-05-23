/**
 * Destination data source with coordinates
 * Ready for future Supabase/CMS integration
 */

export interface DestinationMarker {
  slug: string;
  title: string;
  excerpt: string;
  latitude: number;
  longitude: number;
  category: 'nature' | 'culture' | 'city' | 'food';
  country: string;
  region: string;
  url: string;
}

export const destinationMarkers: DestinationMarker[] = [
  // Madère, Portugal
  {
    slug: 'madere',
    title: 'Madère, l\'île de l\'éternel printemps',
    excerpt: 'Randonnées volcaniques, levadas et villages atlantiques en mode slow travel.',
    latitude: 32.6669,
    longitude: -16.9241,
    category: 'nature',
    country: 'Portugal',
    region: 'Atlantique',
    url: '/destinations/madere',
  },
  {
    slug: 'funchal',
    title: 'Funchal, capitale de Madère',
    excerpt: 'Vieille ville, marchés, gastronomie et couchers de soleil sur l\'Atlantique.',
    latitude: 32.6499,
    longitude: -16.9077,
    category: 'city',
    country: 'Portugal',
    region: 'Madère',
    url: '/destinations/madere/funchal',
  },
  {
    slug: 'porto-moniz',
    title: 'Porto Moniz, baignoires volcaniques',
    excerpt: 'Piscines naturelles creusées dans la lave noire, nord-ouest de Madère.',
    latitude: 32.8225,
    longitude: -17.1680,
    category: 'nature',
    country: 'Portugal',
    region: 'Madère',
    url: '/destinations/madere/porto-moniz',
  },
  {
    slug: 'cabo-girao',
    title: 'Cabo Girão, à pic sur l\'Atlantique',
    excerpt: 'Une des plus hautes falaises d\'Europe, lever du soleil inoubliable.',
    latitude: 32.6308,
    longitude: -17.1960,
    category: 'nature',
    country: 'Portugal',
    region: 'Madère',
    url: '/destinations/madere/cabo-girao',
  },

  // Sicile, Italie
  {
    slug: 'sicile',
    title: 'Sicile, entre pierre et Méditerranée',
    excerpt: 'Le sud-est par la pierre, le ventre et les fins d\'après-midi qui durent.',
    latitude: 37.5999,
    longitude: 14.0154,
    category: 'food',
    country: 'Italie',
    region: 'Méditerranée',
    url: '/destinations/sicile',
  },
  {
    slug: 'palerme',
    title: 'Palerme, capitale baroque',
    excerpt: 'Marchés de rue, architecture arabo-normande et vie nocturne intense.',
    latitude: 38.1157,
    longitude: 13.3615,
    category: 'city',
    country: 'Italie',
    region: 'Sicile',
    url: '/destinations/sicile/palerme',
  },
  {
    slug: 'taormine',
    title: 'Taormine, perle de la Sicile',
    excerpt: 'Théâtre grec, ruelles élégantes et vue sur l\'Etna.',
    latitude: 37.8515,
    longitude: 15.2878,
    category: 'culture',
    country: 'Italie',
    region: 'Sicile',
    url: '/destinations/sicile/taormine',
  },
  {
    slug: 'cagliari',
    title: 'Cagliari, portes du sud',
    excerpt: 'Villas romaines, dunes roses et cuisine sarde authentique.',
    latitude: 39.2237,
    longitude: 9.1587,
    category: 'city',
    country: 'Italie',
    region: 'Sardaigne',
    url: '/destinations/sardaigne/cagliari',
  },

  // Roumanie
  {
    slug: 'roumanie',
    title: 'Roumanie, nature sauvage',
    excerpt: 'Delta du Danube, Transylvanie et villages qui n\'ont pas perdu leur rythme.',
    latitude: 45.9852,
    longitude: 24.6854,
    category: 'culture',
    country: 'Roumanie',
    region: 'Europe de l\'Est',
    url: '/destinations/roumanie',
  },
  {
    slug: 'bucarest',
    title: 'Bucarest, entre passé et présent',
    excerpt: 'Palais royal, jardins et scène culturelle en effervescence.',
    latitude: 44.4268,
    longitude: 26.1025,
    category: 'city',
    country: 'Roumanie',
    region: 'Valachie',
    url: '/destinations/roumanie/bucarest',
  },
  {
    slug: 'brasov',
    title: 'Brașov, porte des Carpates',
    excerpt: 'Ville moyenâgeuse, pistes de ski et accès à la Transylvanie.',
    latitude: 45.6428,
    longitude: 25.5879,
    category: 'culture',
    country: 'Roumanie',
    region: 'Transylvanie',
    url: '/destinations/roumanie/brasov',
  },
  {
    slug: 'cluj',
    title: 'Cluj-Napoca, ville universitaire',
    excerpt: 'Scène tech, bars alternatifs et architecture austro-hongroise.',
    latitude: 46.7712,
    longitude: 23.6236,
    category: 'city',
    country: 'Roumanie',
    region: 'Transylvanie',
    url: '/destinations/roumanie/cluj',
  },
  {
    slug: 'sibiu',
    title: 'Sibiu, joyau transylvanien',
    excerpt: 'Ville européenne de la culture 2007, architecture saxonne préservée.',
    latitude: 45.7967,
    longitude: 24.1453,
    category: 'culture',
    country: 'Roumanie',
    region: 'Transylvanie',
    url: '/destinations/roumanie/sibiu',
  },

  // Portugal continental
  {
    slug: 'lisbonne',
    title: 'Lisbonne, ville en gradins',
    excerpt: 'Fado, azulejos, Bairro Alto et couchers de soleil sur le Tage.',
    latitude: 38.7223,
    longitude: -9.1393,
    category: 'city',
    country: 'Portugal',
    region: 'Portugal continental',
    url: '/destinations/portugal/lisbonne',
  },
  {
    slug: 'porto',
    title: 'Porto, viñedos et Douro',
    excerpt: 'Architecture barcelonaise, vin de Porto et scène gastronomique.',
    latitude: 41.1579,
    longitude: -8.6291,
    category: 'city',
    country: 'Portugal',
    region: 'Portugal continental',
    url: '/destinations/portugal/porto',
  },

  // Île-de-France, France
  {
    slug: 'paris',
    title: 'Paris, le slow mode',
    excerpt: 'Rues qui ne demandent qu\'à être arpentées plus lentement.',
    latitude: 48.8566,
    longitude: 2.3522,
    category: 'city',
    country: 'France',
    region: 'Île-de-France',
    url: '/destinations/idf/paris',
  },
  {
    slug: 'versailles',
    title: 'Versailles, le classique en slow',
    excerpt: 'Jardins à la française, domaines cachés et chemins de traverse.',
    latitude: 48.8049,
    longitude: 2.1204,
    category: 'culture',
    country: 'France',
    region: 'Île-de-France',
    url: '/destinations/idf/versailles',
  },
  {
    slug: 'giverny',
    title: 'Giverny, chez Monet',
    excerpt: 'Jardins impressionnistes et villages de la vallée de la Seine.',
    latitude: 49.0775,
    longitude: 1.5346,
    category: 'culture',
    country: 'France',
    region: 'Île-de-France',
    url: '/destinations/idf/giverny',
  },
  {
    slug: 'fontainebleau',
    title: 'Fontainebleau, forêt et roche',
    excerpt: 'Sites d\'escalade, forêt historique et château royal.',
    latitude: 48.3965,
    longitude: 2.7000,
    category: 'nature',
    country: 'France',
    region: 'Île-de-France',
    url: '/destinations/idf/fontainebleau',
  },

  // Normandie, France
  {
    slug: 'cote-albatre',
    title: 'Côte d\'Albâtre, falaises bretonnes',
    excerpt: 'Fagnes blanches, villages de pêcheurs et airs marins.',
    latitude: 49.8000,
    longitude: 0.6500,
    category: 'nature',
    country: 'France',
    region: 'Normandie',
    url: '/destinations/normandie/cote-albatre',
  },
  {
    slug: 'le-havre',
    title: 'Le Havre, ville reconstruite',
    excerpt: 'Architecture patrimoine UNESCO, plage et art contemporain.',
    latitude: 49.4944,
    longitude: 0.1079,
    category: 'city',
    country: 'France',
    region: 'Normandie',
    url: '/destinations/normandie/le-havre',
  },

  // Colombie (nouveaux terrains)
  {
    slug: 'colombie',
    title: 'Colombie, Andes et Caraïbes',
    excerpt: 'Café, patrimoine colonial et écosystèmes diversifiés.',
    latitude: 4.5709,
    longitude: -74.2973,
    category: 'nature',
    country: 'Colombie',
    region: 'Amérique du Sud',
    url: '/destinations/colombie',
  },
  {
    slug: 'bogota',
    title: 'Bogotá, capitale andine',
    excerpt: 'Musée de l\'Or, Graffiti district et air de hauteur.',
    latitude: 4.7110,
    longitude: -74.0721,
    category: 'city',
    country: 'Colombie',
    region: 'Andes',
    url: '/destinations/colombie/bogota',
  },
  {
    slug: 'medellin',
    title: 'Medellín, vallée de l\'éternel printemps',
    excerpt: 'Transformation urbaine, jardins botaniques et innovation sociale.',
    latitude: 6.2442,
    longitude: -75.5812,
    category: 'city',
    country: 'Colombie',
    region: 'Antioquia',
    url: '/destinations/colombie/medellin',
  },
];

export const getCountries = () => {
  return Array.from(new Set(destinationMarkers.map(d => d.country))).sort();
};

export const getRegions = () => {
  return Array.from(new Set(destinationMarkers.map(d => d.region))).sort();
};

export const getCategories = () => {
  return Array.from(new Set(destinationMarkers.map(d => d.category)));
};