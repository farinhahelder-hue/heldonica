export interface SubDestinationInfo {
  title: string
  slug: string
  parentSlug: string
  teaser: string
  emoji: string
}

export const SUB_DESTINATIONS: Record<string, SubDestinationInfo[]> = {
  madere: [
    { title: 'Funchal', slug: 'funchal', parentSlug: 'madere', teaser: 'La capitale côtière et ses ruelles fleuries.', emoji: '🌸' },
    { title: 'Porto Moniz', slug: 'porto-moniz', parentSlug: 'madere', teaser: 'Baignade dans les piscines naturelles de roche volcanique.', emoji: '🌊' },
    { title: 'Cabo Girão', slug: 'cabo-girao', parentSlug: 'madere', teaser: 'La passerelle de verre sur la falaise côtière.', emoji: '🧗' },
    { title: 'Câmara de Lobos', slug: 'camara-de-lobos', parentSlug: 'madere', teaser: 'Village typique de pêcheurs.', emoji: '⛵' },
    { title: 'Ponta do Sol', slug: 'ponta-do-sol', parentSlug: 'madere', teaser: 'Le village le plus ensoleillé de l\'île.', emoji: '☀️' },
    { title: 'São Vicente', slug: 'sao-vicente', parentSlug: 'madere', teaser: 'Grottes volcaniques et vallée verdoyante.', emoji: '🌋' },
    { title: 'Ribeiro Frio', slug: 'ribeiro-frio', parentSlug: 'madere', teaser: 'Forêt de lauriers et point de vue magique.', emoji: '🌲' },
    { title: 'Portela', slug: 'portela', parentSlug: 'madere', teaser: 'Point de vue spectaculaire sur le rocher de Penha d\'Aguia.', emoji: '⛰️' },
    { title: 'Achadas da Cruz', slug: 'achadas-da-cruz', parentSlug: 'madere', teaser: 'Le téléphérique le plus raide d\'Europe.', emoji: '🚠' },
    { title: 'Estreito', slug: 'estreito', parentSlug: 'madere', teaser: 'Vignobles en terrasses du vin de Madère.', emoji: '🍇' },
  ],
  roumanie: [
    { title: 'Brașov', slug: 'brasov', parentSlug: 'roumanie', teaser: 'Citadelle médiévale au cœur de la Transylvanie.', emoji: '🏰' },
    { title: 'Bucarest', slug: 'bucarest', parentSlug: 'roumanie', teaser: 'Le contraste entre architecture royale et friches industrielles.', emoji: '🏙️' },
    { title: 'Cluj-Napoca', slug: 'cluj', parentSlug: 'roumanie', teaser: 'La capitale vivante et universitaire de la Transylvanie.', emoji: '🎓' },
    { title: 'Sibiu', slug: 'sibiu', parentSlug: 'roumanie', teaser: 'La ville aux maisons qui ont des yeux.', emoji: '👁️' },
    { title: 'Timișoara', slug: 'timisoara', parentSlug: 'roumanie', teaser: 'Le berceau de la révolution et capitale culturelle.', emoji: '🎭' },
    { title: 'Transylvanie', slug: 'transylvanie', parentSlug: 'roumanie', teaser: 'Forêts sauvages, châteaux médiévaux et routes alpines.', emoji: '🌲' },
  ],
  sicile: [
    { title: 'Palerme', slug: 'palerme', parentSlug: 'sicile', teaser: 'Marchés de rue animés et joyaux arabo-normands.', emoji: '🍕' },
    { title: 'Catane', slug: 'catane', parentSlug: 'sicile', teaser: 'La cité baroque au pied de l\'Etna.', emoji: '🌋' },
    { title: 'Syracuse', slug: 'syracuse', parentSlug: 'sicile', teaser: 'L\'île d\'Ortygie et vestiges grecs légendaires.', emoji: '🏛️' },
    { title: 'Taormine', slug: 'taormine', parentSlug: 'sicile', teaser: 'Le théâtre antique face à la mer ionienne.', emoji: '🎭' },
  ],
  sardaigne: [
    { title: 'Cagliari', slug: 'cagliari', parentSlug: 'sardaigne', teaser: 'Bastions de pierre, flamants roses et lagunes.', emoji: '🦩' },
    { title: 'Alghero', slug: 'alghero', parentSlug: 'sardaigne', teaser: 'La cité catalane fortifiée face au couchant.', emoji: '🌅' },
    { title: 'Costa Smeralda', slug: 'costa-smeralda', parentSlug: 'sardaigne', teaser: 'Eaux turquoises et criques de granit sculptées.', emoji: '🏖️' },
    { title: 'Nuoro', slug: 'nuoro', parentSlug: 'sardaigne', teaser: 'Le cœur sauvage et traditionnel de la Barbagia.', emoji: '🏔️' },
  ],
  portugal: [
    { title: 'Lisbonne', slug: 'lisbonne', parentSlug: 'portugal', teaser: 'Collines pavées, fado envoûtant et pasteis de nata.', emoji: '🚃' },
    { title: 'Porto', slug: 'porto', parentSlug: 'portugal', teaser: 'Caves de porto, pont Dom Luís et vieux quartiers côtiers.', emoji: '🍷' },
  ],
  colombie: [
    { title: 'Bogota', slug: 'bogota', parentSlug: 'colombie', teaser: 'Cité andine perchée à 2600 mètres d\'altitude.', emoji: '⛰️' },
    { title: 'Medellin', slug: 'medellin', parentSlug: 'colombie', teaser: 'La ville de l\'éternel printemps et de la transformation.', emoji: '🌸' },
    { title: 'Cali', slug: 'cali', parentSlug: 'colombie', teaser: 'Capitale mondiale de la salsa et joie de vivre.', emoji: '💃' },
    { title: 'Cartago', slug: 'cartago', parentSlug: 'colombie', teaser: 'Héritage colonial au cœur de la région du café.', emoji: '☕' },
  ],
  normandie: [
    { title: 'Côte d\'Albâtre', slug: 'cote-albatre', parentSlug: 'normandie', teaser: 'Falaises de craie blanche spectaculaires et galets.', emoji: '🌊' },
    { title: 'Le Havre', slug: 'le-havre', parentSlug: 'normandie', teaser: 'Architecture moderne classée UNESCO en bord de mer.', emoji: '🚢' },
    { title: 'Pays d\'Auge', slug: 'pays-dauge', parentSlug: 'normandie', teaser: 'Manoirs à colombages, vergers et cidre de terroir.', emoji: '🍎' },
  ],
}
