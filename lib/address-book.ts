/**
 * Carnet d'adresses Heldonica — fiches vécues, prêtes à publier.
 *
 * Règle de la maison : on n'invente rien. Chaque fiche reprend un lieu déjà
 * documenté dans le Coffre des Savoirs (`lib/cms-vault-spots.ts`) ou sur une
 * page destination. Le champ `sourceId` garde le lien avec la fiche d'origine.
 *
 * Pour ajouter une adresse : d'abord le vécu dans le Coffre, puis la fiche ici.
 * Aucune adresse non testée ne doit entrer dans ce fichier.
 */

export type AddressCategory = 'voir' | 'faire' | 'manger' | 'gouter'

export interface AddressDestination {
  slug: string
  name: string
  intro: string
  destinationUrl: string
}

export interface AddressEntry {
  slug: string
  name: string
  destination: string
  city: string
  category: AddressCategory
  tags: string[]
  lived: string
  season?: string
  mobility?: string
  pitfall?: string
  sensory?: string
  sourceId: string
}

export const ADDRESS_CATEGORIES: {
  key: AddressCategory
  label: string
  shortLabel: string
}[] = [
  { key: 'voir', label: 'À voir', shortLabel: 'Voir' },
  { key: 'faire', label: 'À vivre', shortLabel: 'Vivre' },
  { key: 'manger', label: 'À table', shortLabel: 'Table' },
  { key: 'gouter', label: 'À goûter', shortLabel: 'Goûter' },
]

export const ADDRESS_DESTINATIONS: AddressDestination[] = [
  {
    slug: 'madere',
    name: 'Madère',
    intro:
      "Du Fanal aux bassins de Porto Moniz, les lieux qu'on a réellement traversés sur l'île. On dit la saison, l'accès et ce qu'on éviterait la prochaine fois.",
    destinationUrl: '/destinations/madere',
  },
  {
    slug: 'suisse',
    name: 'Suisse',
    intro:
      "Trois haltes vécues en Suisse, entre crête panoramique, funiculaire et vallée calme. De quoi choisir son rythme avant de partir.",
    destinationUrl: '/destinations/suisse',
  },
  {
    slug: 'montenegro',
    name: 'Monténégro',
    intro:
      "Trois adresses testées au Monténégro, entre confluent turquoise, ruelles ottomanes et cave creusée sous la montagne.",
    destinationUrl: '/destinations/montenegro',
  },
  {
    slug: 'paris',
    name: 'Paris',
    intro:
      "La Petite Ceinture, là où la nature a repris les rails. Une balade parisienne qu'on n'attendait pas, à quelques mètres des avenues.",
    destinationUrl: '/destinations/paris',
  },
  {
    slug: 'zurich',
    name: 'Zurich',
    intro:
      "La Limmat à la nage, du Wipkingerpark à Glanzenberg. Une journée d'été simple, à faire en famille ou entre amis.",
    destinationUrl: '/destinations/zurich',
  },
]

export const ADDRESS_BOOK: AddressEntry[] = [
  {
    slug: 'mad-fanal-laurisilva',
    name: 'Forêt de Fanal',
    destination: 'madere',
    city: 'Madère',
    category: 'voir',
    tags: ['forêt', 'brume', 'nature', 'laurisilva'],
    lived:
      "On a marché dans cette brume dense, l'humidité fraîche sur la peau, au lever du jour. Les lauriers centenaires tordus par le vent sortent de la brume comme des silhouettes.",
    season: "Toute l'année",
    mobility: 'Voiture',
    pitfall: "Éviter le plein après-midi, quand la brume se dissipe.",
    sensory:
      "Odeur de terre humide, silence pesant interrompu par le vent dans les feuilles.",
    sourceId: 'mad-fanal-laurisilva',
  },
  {
    slug: 'mad-achadas-faja',
    name: "Fajã d'Achadas da Cruz",
    destination: 'madere',
    city: 'Madère',
    category: 'faire',
    tags: ['fajã', 'téléphérique', 'océan', 'isolement'],
    lived:
      "Descente par câble vertigineuse vers un hameau agricole de galets marins. En bas, le vent salé, les vagues qui se brisent sur la roche noire.",
    season: 'Été',
    mobility: 'Téléphérique',
    pitfall: 'Vérifier les horaires du téléphérique pour la remontée.',
    sensory: 'Bruit puissant des vagues sur les galets, goût de sel sur les lèvres.',
    sourceId: 'mad-achadas-faja',
  },
  {
    slug: 'mad-ponta-do-sol-pier',
    name: 'Le vieux débarcadère de Ponta do Sol',
    destination: 'madere',
    city: 'Ponta do Sol',
    category: 'voir',
    tags: ['débarcadère', 'arche', 'crépuscule', 'océan'],
    lived:
      "On s'est assis sur l'arche de pierre, encore tiède, pendant que le soleil descendait derrière la ligne d'eau.",
    season: 'Automne',
    mobility: 'Voiture ou bus',
    pitfall: "Ne pas y aller aux heures chaudes en été pour garder la lumière du soir.",
    sensory: 'Chaleur résiduelle de la pierre sous les mains, lumière dorée rasante.',
    sourceId: 'mad-ponta-do-sol-pier',
  },
  {
    slug: 'mad-porto-moniz-pools',
    name: 'Piscines de lave de Porto Moniz',
    destination: 'madere',
    city: 'Porto Moniz',
    category: 'faire',
    tags: ['lave', 'piscines', 'océan', 'marée'],
    lived:
      "Bassins volcaniques naturels rafraîchis par la marée haute. Le contraste entre la fraîcheur de l'eau salée et la chaleur emmagasinée par le basalte noir.",
    season: 'Été',
    mobility: 'Voiture',
    pitfall: "Privilégier les bassins non aménagés pour plus de quiétude.",
    sensory:
      'Texture rugueuse de la roche volcanique sous les pieds, fraîcheur de l’eau.',
    sourceId: 'mad-porto-moniz-pools',
  },
  {
    slug: 'mad-seixal-plage',
    name: 'Plage de Seixal',
    destination: 'madere',
    city: 'Seixal',
    category: 'voir',
    tags: ['sable noir', 'falaises', 'atlantique'],
    lived:
      "Sable noir volcanique, falaises vert émeraude qui tombent dans l'Atlantique. On est restés face au large, sans rien dire.",
    sourceId: 'vault_22',
  },
  {
    slug: 'mad-o-galo',
    name: 'O Galo',
    destination: 'madere',
    city: 'Funchal',
    category: 'manger',
    tags: ['poisson frais', 'vieille ville', 'vin de Madère'],
    lived:
      "Le soir, dans la vieille ville de Funchal. Aucune carte imprimée : le patron apporte la pêche du matin et les légumes de son potager de montagne. 40 ans de passion à table.",
    sourceId: 'vault_22',
  },
  {
    slug: 'che-fronalpstock-crest',
    name: 'Crête de Fronalpstock',
    destination: 'suisse',
    city: 'Stoos',
    category: 'faire',
    tags: ['crête', 'lac des Quatre-Cantons', 'panorama', 'randonnée'],
    lived:
      "On a marché sur cette ligne de crête étroite, le vent nous glaçant le visage malgré l'effort, avec le lac des Quatre-Cantons en contrebas.",
    season: 'Été',
    mobility: 'Funiculaire et marche',
    pitfall: 'La vue est masquée en cas de couverture nuageuse basse.',
    sensory: "Vent froid et vif sur le visage, odeur végétale des herbes d'alpage.",
    sourceId: 'che-fronalpstock-crest',
  },
  {
    slug: 'che-stoosbahn-funiculaire',
    name: 'Funiculaire de Stoos',
    destination: 'suisse',
    city: 'Stoos',
    category: 'faire',
    tags: ['funiculaire', 'pente', 'montagne'],
    lived:
      "Montée à 110 % de pente dans des cabines sphériques auto-nivelantes. La forte inclinaison, la tension du câble qui gronde sous les pieds.",
    season: "Toute l'année",
    mobility: 'Funiculaire',
    pitfall: "L'attente au départ s'allonge les beaux week-ends.",
    sensory:
      'Grondement métallique sourd du mécanisme, impression de vide en regardant en bas.',
    sourceId: 'che-stoosbahn-funiculaire',
  },
  {
    slug: 'che-muotathal-valley',
    name: 'Vallée de Muotathal',
    destination: 'suisse',
    city: 'Muotathal',
    category: 'faire',
    tags: ['vallée', 'alpages', 'crépuscule', 'randonnée'],
    lived:
      "Randonnée crépusculaire dans les alpages calmes, loin du bruit. L'air piquant de la vallée pendant que la lumière déclinait sur les reliefs.",
    season: 'Automne',
    mobility: 'Voiture',
    pitfall:
      'Prendre une épaisseur supplémentaire : la température chute vite après le coucher du soleil.',
    sensory:
      'Bruit clair des cloches de vaches au loin, dans le calme de la soirée.',
    sourceId: 'che-muotathal-valley',
  },
  {
    slug: 'mne-sastavci-confluent',
    name: 'Sastavci et pont Adži-paša',
    destination: 'montenegro',
    city: 'Podgorica',
    category: 'voir',
    tags: ['confluent', 'Morača', 'pont', 'ruines ottomanes'],
    lived:
      "Le confluent turquoise de la Morača et les ruines ottomanes de Depedogen. On a marché sur les galets ronds, écoutant le brassage de l'eau claire.",
    season: 'Printemps',
    mobility: 'À pied',
    pitfall: "Le courant est vif et l'eau très froide si l'on tente de s'y tremper.",
    sensory: "Bleu éclatant de l'eau, bruit de ruissellement continu.",
    sourceId: 'mne-sastavci-confluent',
  },
  {
    slug: 'mne-stara-varos-pochoir',
    name: 'Ruelles de Stara Varoš',
    destination: 'montenegro',
    city: 'Podgorica',
    category: 'voir',
    tags: ['ruelles', 'vignes', 'ottoman', 'pochoir'],
    lived:
      "Pochoir mural de 1987, vignes suspendues et quiétude ottomane. On s'est faufilé dans ces petites rues pavées, le regard attiré par les détails des vieux murs.",
    season: 'Printemps',
    mobility: 'À pied',
    pitfall: "Privilégier la lumière du jour pour observer les pochoirs et l'architecture.",
    sensory:
      'Rugosité des murs anciens en pierre, chaleur stagnante entre les ruelles étroites.',
    sourceId: 'mne-stara-varos-pochoir',
  },
  {
    slug: 'mne-sipcanik-chai',
    name: 'Chai souterrain de Šipčanik',
    destination: 'montenegro',
    city: 'Podgorica',
    category: 'gouter',
    tags: ['chai', 'vin', 'souterrain', 'Vranac'],
    lived:
      "Ancien hangar d'aviation souterrain reconverti en cave de vieillissement du Vranac. On a goûté le vin puissant dans l'air frais et humide du long tunnel.",
    season: "Toute l'année",
    mobility: 'Voiture',
    pitfall: "Les visites s'anticipent : impossible d'entrer librement sans prévenir.",
    sensory:
      "Goût charpenté et tannique du Vranac, odeur de bois et d'humidité fermée.",
    sourceId: 'mne-sipcanik-chai',
  },
  {
    slug: 'par-petite-ceinture',
    name: 'La Petite Ceinture',
    destination: 'paris',
    city: 'Paris',
    category: 'faire',
    tags: ['friche', 'nature urbaine', 'balade', 'gares abandonnées'],
    lived:
      "L'ancienne ligne de chemin de fer circulaire fait presque le tour de Paris. La nature a repris les rails : des arbres poussent entre les traverses, des renards y ont leurs terriers.",
    mobility: 'À pied',
    pitfall: "Toutes les sections ne sont pas ouvertes au public.",
    sourceId: 'vault_34',
  },
  {
    slug: 'zur-limmat-flotter',
    name: 'Flotter sur la Limmat',
    destination: 'zurich',
    city: 'Zurich',
    category: 'faire',
    tags: ['nage', 'rivière', 'été', 'famille'],
    lived:
      "On est partis de Wipkingerpark avec les bouées, les snacks et la bonne humeur. À 14 h sur l'eau, familles, jeunes, solitaires : une ambiance simple et chaleureuse.",
    season: 'Été',
    mobility: 'Bouée, départ Wipkingerpark',
    pitfall:
      "Sortie obligatoire au barrage Hönggerwehr : 150 mètres de portage avant de reprendre l'eau.",
    sensory:
      'Barbecues sur la berge, musique sous un pont, canards et cygnes curieux.',
    sourceId: 'vault_68',
  },
]

export function getAddressDestinations(): AddressDestination[] {
  return ADDRESS_DESTINATIONS.filter((destination) =>
    ADDRESS_BOOK.some((entry) => entry.destination === destination.slug)
  )
}

export function getAddressDestination(slug: string): AddressDestination | undefined {
  return ADDRESS_DESTINATIONS.find((destination) => destination.slug === slug)
}

export function getAddressEntriesByDestination(destination: string): AddressEntry[] {
  return ADDRESS_BOOK.filter((entry) => entry.destination === destination)
}

export function getAddressEntry(destination: string, slug: string): AddressEntry | undefined {
  return ADDRESS_BOOK.find(
    (entry) => entry.destination === destination && entry.slug === slug
  )
}

export function getAddressCategory(category: AddressCategory) {
  return ADDRESS_CATEGORIES.find((item) => item.key === category)
}

export function isAddressCategory(value: string | undefined): value is AddressCategory {
  return ADDRESS_CATEGORIES.some((item) => item.key === value)
}

export function countAddressEntries(): number {
  return ADDRESS_BOOK.length
}

export function getAddressCountsByDestination(): Record<string, number> {
  return ADDRESS_BOOK.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.destination] = (counts[entry.destination] ?? 0) + 1
    return counts
  }, {})
}

export function getAddressCountsByCategory(
  entries: AddressEntry[] = ADDRESS_BOOK
): Record<AddressCategory, number> {
  return ADDRESS_CATEGORIES.reduce(
    (counts, item) => {
      counts[item.key] = entries.filter((entry) => entry.category === item.key).length
      return counts
    },
    { voir: 0, faire: 0, manger: 0, gouter: 0 }
  )
}
