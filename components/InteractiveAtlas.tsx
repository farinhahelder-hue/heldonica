'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Compass, MapPin, Download, Search, Star, Car, Clock,
  Quote, Copy, Check, ChevronRight, Bed, Eye, Mountain,
  Waves, UtensilsCrossed, ArrowUpDown, ArrowDown, ArrowUp
} from 'lucide-react'

export interface AtlasSpot {
  id: string
  territory: 'madeira' | 'montenegro' | 'romania' | 'italy' | 'switzerland' | 'portugal'
  name: string
  region: string
  category: 'trail' | 'cove' | 'table' | 'base'
  catLabel: string
  lat: number
  lng: number
  alt: string
  duration: string
  access: string
  quote: string
  photo: string
  photoAlt: string
  link: string
}

export interface CampDeBase {
  id: string
  dest: 'madeira' | 'montenegro' | 'romania' | 'italy' | 'switzerland' | 'portugal'
  destLabel: string
  name: string
  location: string
  type: 'masseria' | 'maison-hotes' | 'villa-falaise' | 'campement' | 'refuge-alpin'
  typeLabel: string
  bâti: string
  score: number
  scoreTag: string
  duration: string
  experience: string
  price: number
  accessVehicle: string
  img: string
  link: string
}

export const ATLAS_SPOTS: AtlasSpot[] = [
  // --- MADÈRE ---
  {
    id: 'mad-1',
    territory: 'madeira',
    name: 'Forêt Mystique de Fanal',
    region: 'Madère · Portugal',
    category: 'trail',
    catLabel: 'Sentier Oublié',
    lat: 32.8091,
    lng: -17.1422,
    alt: '1150 m',
    duration: '3 à 4 heures',
    access: 'Route ER209 (bitume soigné)',
    quote: '« Y monter à l\'aube quand le brouillard atlantique s\'infiltre entre les troncs tordus de laurisilva. Pas un bruit hormis les gouttes qui percutent la bruyère. L\'un de nos plus puissants silences vécus. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/pico_do_arieiro.jpg',
    photoAlt: 'Arbres centenaires tortueux dans la brume du plateau de Fanal Madère',
    link: '/blog/madere-slow-travel-guide',
  },
  {
    id: 'mad-2',
    territory: 'madeira',
    name: 'Téléphérique d\'Achadas da Cruz',
    region: 'Madère · Portugal',
    category: 'cove',
    catLabel: 'Crique & Falaise',
    lat: 32.8524,
    lng: -17.2141,
    alt: '450 m de chute',
    duration: 'Demi-journée',
    access: 'Piste côtière ouest',
    quote: '« Une descente vertigineuse à flanc de falaise pour toucher des galets battus par l\'Atlantique et quelques jardins potagers suspendus hors du monde. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/achadas_da_cruz.jpg',
    photoAlt: 'Falaise basaltique plongeant dans l\'océan atlantique avec minuscule cabane de pêcheur',
    link: '/blog/madere-slow-travel-guide',
  },
  {
    id: 'mad-3',
    territory: 'madeira',
    name: 'Piscines Naturelles de Seixal',
    region: 'Madère · Portugal',
    category: 'cove',
    catLabel: 'Baignade Secrète',
    lat: 32.8242,
    lng: -17.1128,
    alt: 'Niveau de la mer',
    duration: '2 heures',
    access: 'Descente vers le port',
    quote: '« Bien plus intimes que Porto Moniz : des arches d\'eau de mer tiédie par la lave noire sous une falaise couverte de végétation subtropicale ruisselante. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/seixal.jpg',
    photoAlt: 'Piscine naturelle de roche volcanique noire avec eau turquoise translucide',
    link: '/blog/madere-slow-travel-guide',
  },
  {
    id: 'mad-4',
    territory: 'madeira',
    name: 'Belvédère de Bica da Cana',
    region: 'Madère · Portugal',
    category: 'trail',
    catLabel: 'Col Panoramique',
    lat: 32.7562,
    lng: -17.0583,
    alt: '1560 m',
    duration: '1h30 (lever du jour)',
    access: 'Plateau Paul da Serra',
    quote: '« L\'alternative secrète au Pico do Arieiro très fréquenté. Vous y surplombez une mer de nuages cotonneuse avec le Pico Ruivo en silhouette solennelle. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/pico_do_arieiro.jpg',
    photoAlt: 'Mer de nuages au lever du soleil vue depuis un sommet de montagne à Bica da Cana',
    link: '/blog/madere-slow-travel-guide',
  },

  // --- MONTÉNÉGRO ---
  {
    id: 'mne-1',
    territory: 'montenegro',
    name: 'Crique Oubliée de Perazića Do',
    region: 'Monténégro',
    category: 'cove',
    catLabel: 'Baignade Sauvage',
    lat: 42.2173,
    lng: 18.9348,
    alt: 'Niveau de la mer',
    duration: 'Après-midi entier',
    access: 'Sentier des tunnels de Petrovac',
    quote: '« Un tunnel piétonnier percé dans le roc qui débouche sur un squelette d\'hôtel brut et une eau si limpide que les bateaux semblent léviter. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    photoAlt: 'Crique aux eaux cristallines émeraude entourée de falaises blanches au Monténégro',
    link: '/destinations/montenegro',
  },
  {
    id: 'mne-2',
    territory: 'montenegro',
    name: 'Les 25 Lacets du Mont Lovćen',
    region: 'Monténégro',
    category: 'trail',
    catLabel: 'Route Panoramique',
    lat: 42.4011,
    lng: 18.7845,
    alt: '980 m',
    duration: '2 heures de route lente',
    access: 'Ancienne route Kotor-Cetinje',
    quote: '« Chaque épingle dévoile un angle neuf sur les bouches de Kotor. Conduire en première, s\'arrêter aux murets de pierre sèche et respirer le thym chaud. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    photoAlt: 'Route sinueuse de montagne en lacets dominant un fjord marin',
    link: '/destinations/montenegro',
  },
  {
    id: 'mne-3',
    territory: 'montenegro',
    name: 'Caves Monumentales de Šipčanik',
    region: 'Monténégro',
    category: 'table',
    catLabel: 'Terroir & Vranac',
    lat: 42.3789,
    lng: 19.3082,
    alt: '50 m sous terre',
    duration: '2 heures',
    access: 'Plaine viticole de Podgorica',
    quote: '« Un ancien bunker militaire aérien reconverti en cathédrale d\'élevage pour le puissant cépage Vranac. Unique en Europe. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    photoAlt: 'Immense galerie voûtée souterraine bordée de fûts de chêne illuminés',
    link: '/destinations/montenegro',
  },
  {
    id: 'mne-4',
    territory: 'montenegro',
    name: 'Méandres du Lac Skadar',
    region: 'Monténégro',
    category: 'trail',
    catLabel: 'Sanctuaire Lacustre',
    lat: 42.2472,
    lng: 19.0911,
    alt: '12 m',
    duration: 'Matinée en barque',
    access: 'Embarcadère des pêcheurs de Virpazar',
    quote: '« Glisser au ras des nénuphars sur une barque traditionnelle en bois pendant que les pélicans frisés s\'envolent dans la brume du matin. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    photoAlt: 'Méandre sinueux d\'une rivière se jetant dans un grand lac paisible encadré de montagnes',
    link: '/destinations/montenegro',
  },

  // --- ROUMANIE ---
  {
    id: 'rou-1',
    territory: 'romania',
    name: 'Hameau Préservé de Breb',
    region: 'Roumanie',
    category: 'base',
    catLabel: 'Camp de Base Vivant',
    lat: 47.7472,
    lng: 23.9014,
    alt: '510 m',
    duration: '3 nuits recommandées',
    access: 'Voie pastorale Maramureș',
    quote: '« Réveil au son de la faux qui coupe l\'herbe couverte de rosée. Dormir dans une grange réhabilitée au parfum de bois de mélèze séché. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg',
    photoAlt: 'Village roumain avec maisons traditionnelles en rondins de bois et collines brumeuses',
    link: '/destinations/roumanie',
  },
  {
    id: 'rou-2',
    territory: 'romania',
    name: 'Église en Bois d\'Ieud Deal',
    region: 'Roumanie',
    category: 'trail',
    catLabel: 'Trésor du Patrimoine',
    lat: 47.6775,
    lng: 24.2322,
    alt: '440 m',
    duration: '2 heures',
    access: 'Ruelle montante du cimetière',
    quote: '« Édifiée en 1364 entièrement sans clous métalliques. Ses fresques peintes sur lin au XIVe siècle dégagent une intensité spirituelle bouleversante. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135618.jpg',
    photoAlt: 'Flèche effilée d\'une église médiévale en bois de chêne noirci',
    link: '/destinations/roumanie',
  },
  {
    id: 'rou-3',
    territory: 'romania',
    name: 'Village Fortifié Saxon de Viscri',
    region: 'Roumanie',
    category: 'base',
    catLabel: 'Camp de Base Saxon',
    lat: 46.0547,
    lng: 25.0931,
    alt: '480 m',
    duration: '2 nuits',
    access: 'Chemin de terre battue',
    quote: '« Les oies qui traversent la grand-rue non goudronnée à 18h, la soupe au cumin partagée chez l\'habitant et les vergers de prunes bleues. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg',
    photoAlt: 'Maison saxonne aux façades pastel bleu et ocre en Transylvanie',
    link: '/destinations/roumanie',
  },

  // --- SICILE & POUILLES ---
  {
    id: 'ita-1',
    territory: 'italy',
    name: 'Crique de Calamosche (Vendicari)',
    region: 'Sicile · Italie',
    category: 'cove',
    catLabel: 'Baignade Sauvage',
    lat: 36.8244,
    lng: 15.0933,
    alt: 'Niveau de la mer',
    duration: 'Demi-journée',
    access: '25 min de marche dans la garrigue',
    quote: '« Une anse fermée par deux promontoires rocheux. La mer y est un lagon immobile où nagent des bancs de dorades au milieu des posidonies. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/seixal.jpg',
    photoAlt: 'Petite baie vierge avec sable doré et eau limpide turquoise en Sicile',
    link: '/destinations',
  },
  {
    id: 'ita-2',
    territory: 'italy',
    name: 'Masseria aux Oliviers (Ostuni)',
    region: 'Pouilles · Italie',
    category: 'base',
    catLabel: 'Camp de Base d\'Exception',
    lat: 40.7388,
    lng: 17.5752,
    alt: '120 m',
    duration: '3 nuits recommandées',
    access: 'Contrada Morrone',
    quote: '« L\'épure architecturale absolue : murs à la chaux blanche, patio intérieur ouvert sur des oliviers séculaires et dîner sous les étoiles. »',
    photo: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg',
    photoAlt: 'Cour intérieure d\'une masseria blanche aux Pouilles avec oliviers anciens',
    link: '/destinations',
  },

  // --- SUISSE (STOOS) ---
  {
    id: 'sui-1',
    territory: 'switzerland',
    name: 'Arête du Fronalpstock (Stoos)',
    region: 'Schwyz · Suisse',
    category: 'trail',
    catLabel: 'Crête Alpine',
    lat: 46.9744,
    lng: 8.6472,
    alt: '1922 m',
    duration: 'Journée entière',
    access: 'Funiculaire le plus raide du monde (47,7°)',
    quote: '« Marcher sur le fil de l\'arête avec 10 lacs miroitant simultanément sous nos yeux et les falaises du lac des Quatre-Cantons qui plongent dans l\'émeraude. »',
    photo: '/images/destinations/suisse/IMG_20250712_154207.jpg',
    photoAlt: 'Arête panoramique alpine avec vue plongeante sur le lac des Quatre-Cantons',
    link: '/destinations/suisse/stoos',
  },

  // --- PORTUGAL (SINTRA & ÓBIDOS) ---
  {
    id: 'por-1',
    territory: 'portugal',
    name: 'Couvent des Capuchos (Serra de Sintra)',
    region: 'Sintra · Portugal',
    category: 'trail',
    catLabel: 'Sanctuaire de Liège',
    lat: 38.7844,
    lng: -9.4372,
    alt: '380 m',
    duration: '2h30',
    access: 'Route forestière EN247-3',
    quote: '« Les cellules monastiques tapissées d\'écorce de liège dans le silence de la brume atlantique. Le contraste absolu avec les foules de Pena. »',
    photo: '/images/destinations/portugal/sintra/etape1_sintra_regaleira.jpg',
    photoAlt: 'Murs de pierre couverts de mousse et portes basses tapissées de liège dans la forêt de Sintra',
    link: '/destinations/portugal/sintra',
  },
  {
    id: 'por-2',
    territory: 'portugal',
    name: 'Remparts Médiévaux d\'Óbidos',
    region: 'Óbidos · Portugal',
    category: 'base',
    catLabel: 'Cité Fortifiée',
    lat: 39.3621,
    lng: -9.1572,
    alt: '120 m',
    duration: '2 nuits recommandées',
    access: 'Porta da Vila piétonne',
    quote: '« Faire le tour complet des remparts crénelés au crépuscule quand les bus d\'excursion sont partis et que les tascas allument leurs lanternes. »',
    photo: '/images/destinations/portugal/obidos/etape1_obidos_castelo.jpg',
    photoAlt: 'Chemin de ronde sur remparts de pierre dominant ruelles blanches et toits de tuiles',
    link: '/destinations/portugal/obidos',
  },
]

export const CAMPS_DE_BASE: CampDeBase[] = [
  {
    id: 'camp-1',
    dest: 'romania',
    destLabel: 'Roumanie',
    name: 'Gîte Traditionnel de Breb',
    location: 'Maramureș Pastoral · 47.7472° N, 23.9014° E',
    type: 'campement',
    typeLabel: 'Campement de charme',
    bâti: 'Grange & bardeaux d\'épicéa restaurée par des artisans',
    score: 10,
    scoreTag: 'Isolation totale',
    duration: '4 nuits',
    experience: 'Réveil au tintement des cloches de brebis, poêle en fonte crépitant et pălincă avec le charpentier.',
    price: 65,
    accessVehicle: 'Duster ou SUV',
    img: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg',
    link: '/destinations/roumanie',
  },
  {
    id: 'camp-2',
    dest: 'romania',
    destLabel: 'Roumanie',
    name: 'Maison Saxonne à Viscri',
    location: 'Viscri Saxon · 46.0547° N, 25.0931° E',
    type: 'maison-hotes',
    typeLabel: 'Maison d\'hôtes traditionnelle',
    bâti: 'Torchis bleu pastel & poutres de chêne séculaire',
    score: 9.9,
    scoreTag: 'Calme séculaire',
    duration: '3 nuits',
    experience: 'Petit-déjeuner beurre de baratte, confiture d\'églantier et ruelles en terre battue traversées par les oies.',
    price: 70,
    accessVehicle: 'Citadine ou SUV',
    img: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135618.jpg',
    link: '/destinations/roumanie',
  },
  {
    id: 'camp-3',
    dest: 'madeira',
    destLabel: 'Madère',
    name: 'Quinta do Jardim do Mar',
    location: 'Jardim do Mar · 32.7381° N, 17.2114° W',
    type: 'villa-falaise',
    typeLabel: 'Villa & Falaise côtière',
    bâti: 'Bâti de basalte noir, terrasse océane sans voitures',
    score: 9.8,
    scoreTag: 'Silence insulaire',
    duration: '4 nuits',
    experience: 'Coucher de soleil sur l\'océan sans aucune voiture dans le village. Ruelle pavée menant à la houle.',
    price: 110,
    accessVehicle: 'Citadine',
    img: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/achadas_da_cruz.jpg',
    link: '/blog/madere-slow-travel-guide',
  },
  {
    id: 'camp-4',
    dest: 'montenegro',
    destLabel: 'Monténégro',
    name: 'Refuge du Lac de Skadar',
    location: 'Virpazar / Godinje · 42.2312° N, 19.1124° E',
    type: 'maison-hotes',
    typeLabel: 'Maison d\'hôtes traditionnelle',
    bâti: 'Maison vigneronne, caves médiévales et dalles calcaires',
    score: 9.7,
    scoreTag: 'Lacustre & brume',
    duration: '2 nuits',
    experience: 'Embarquement à l\'aube en barque de bois parmi les nénuphars et dégustation de carpe fumée.',
    price: 75,
    accessVehicle: 'Citadine',
    img: 'https://smxnruefmrmfyfmuxygq.supabase.co/storage/v1/object/public/media/destinations/montenegro/sahat_kula.jpg',
    link: '/destinations/montenegro',
  },
  {
    id: 'camp-5',
    dest: 'madeira',
    destLabel: 'Madère',
    name: 'Refuge Minéral de São Vicente',
    location: 'Côte Nord Sauvage · 32.8025° N, 17.0489° W',
    type: 'campement',
    typeLabel: 'Campement de charme',
    bâti: 'Gîte volcanique & lauriers au creux de la vallée',
    score: 9.6,
    scoreTag: 'Brume & silence',
    duration: '3 nuits',
    experience: 'Accès direct à l\'aube pour la forêt mystique de Fanal et les piscines de lave noire de Seixal.',
    price: 95,
    accessVehicle: 'Citadine agile',
    img: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/seixal.jpg',
    link: '/blog/madere-slow-travel-guide',
  },
  {
    id: 'camp-6',
    dest: 'italy',
    destLabel: 'Pouilles',
    name: 'Masseria aux Oliviers d\'Ostuni',
    location: 'Vallée d\'Itria · 40.7388° N, 17.5752° E',
    type: 'masseria',
    typeLabel: 'Masseria & Domaine agricole',
    bâti: 'Chaux blanche, murets de pierre sèche et cour intime',
    score: 9.5,
    scoreTag: 'Cigales & brise',
    duration: '3 nuits',
    experience: 'Dégustation d\'huile d\'olive coratina pressée sur place et silence minéral des champs d\'Ostuni.',
    price: 140,
    accessVehicle: 'Fiat 500',
    img: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg',
    link: '/destinations',
  },
  {
    id: 'camp-7',
    dest: 'switzerland',
    destLabel: 'Suisse',
    name: 'Auberge d\'Alpage du Stoos',
    location: 'Stoos / Fronalpstock · 46.9744° N, 8.6472° E',
    type: 'refuge-alpin',
    typeLabel: 'Refuge alpin sans voitures',
    bâti: 'Chalet de bois mélèze perché à 1300 m d\'altitude',
    score: 9.6,
    scoreTag: 'Silence d\'altitude',
    duration: '2 nuits',
    experience: 'Dormir au-dessus des nuages dans un village 100% piéton, fondue au fromage d\'alpage et départ matinal sur les crêtes.',
    price: 120,
    accessVehicle: 'Funiculaire piéton',
    img: '/images/destinations/suisse/IMG_20250712_154207.jpg',
    link: '/destinations/suisse/stoos',
  },
  {
    id: 'camp-8',
    dest: 'portugal',
    destLabel: 'Portugal',
    name: 'Maisonnette Historique d\'Óbidos',
    location: 'Intramuros · 39.3621° N, 9.1572° W',
    type: 'maison-hotes',
    typeLabel: 'Maison d\'hôtes traditionnelle',
    bâti: 'Maison blanchie à la chaux, plinthes bleu indigo',
    score: 9.4,
    scoreTag: 'Remparts nocturnes',
    duration: '2 nuits',
    experience: 'Calme absolu le soir quand la herse du château se referme sur les ruelles pavées de bougainvilliers.',
    price: 85,
    accessVehicle: 'Accès piéton intramuros',
    img: '/images/destinations/portugal/obidos/etape1_obidos_castelo.jpg',
    link: '/destinations/portugal/obidos',
  },
]

export default function InteractiveAtlas() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersGroupRef = useRef<any>(null)
  const polylineGroupRef = useRef<any>(null)

  const [selectedTerritory, setSelectedTerritory] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeSpot, setActiveSpot] = useState<AtlasSpot>(ATLAS_SPOTS[0])
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false)

  // Camps table state
  const [campDestFilter, setCampDestFilter] = useState<string>('all')
  const [campTypeFilter, setCampTypeFilter] = useState<string>('all')
  const [sortCriterion, setSortCriterion] = useState<'score-desc' | 'price-asc' | 'price-desc'>('score-desc')

  // Territoires pour les onglets
  const TERRITORIES = [
    { id: 'all', label: 'Tous les Territoires', center: [41.5, 12.0], zoom: 4 },
    { id: 'madeira', label: 'Madère', center: [32.78, -16.98], zoom: 11 },
    { id: 'montenegro', label: 'Monténégro', center: [42.28, 19.05], zoom: 10 },
    { id: 'romania', label: 'Roumanie', center: [47.30, 24.50], zoom: 8 },
    { id: 'italy', label: 'Sicile & Pouilles', center: [38.50, 16.00], zoom: 7 },
    { id: 'switzerland', label: 'Suisse (Stoos)', center: [46.97, 8.65], zoom: 12 },
    { id: 'portugal', label: 'Portugal (Sintra & Óbidos)', center: [39.05, -9.30], zoom: 9 },
  ]

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return

      const L = (await import('leaflet')).default

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [41.5, 12.0],
          zoom: 4,
          zoomControl: false,
          scrollWheelZoom: true,
        })

        L.control.zoom({ position: 'bottomright' }).addTo(map)

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CARTO &copy; OpenStreetMap',
          subdomains: 'abcd',
          maxZoom: 19,
        }).addTo(map)

        const markersLayer = L.layerGroup().addTo(map)
        const polyLayer = L.layerGroup().addTo(map)

        mapInstanceRef.current = map
        markersGroupRef.current = markersLayer
        polylineGroupRef.current = polyLayer
      }

      if (isMounted) {
        renderMap()
      }
    }

    initLeaflet()

    return () => {
      isMounted = false
    }
  }, [])

  // Re-render markers and routes whenever filters change
  useEffect(() => {
    renderMap()
  }, [selectedTerritory, selectedCategory, searchQuery])

  function renderMap() {
    if (!mapInstanceRef.current || !markersGroupRef.current || !polylineGroupRef.current) return

    import('leaflet').then((LModule) => {
      const L = LModule.default
      const map = mapInstanceRef.current
      const markersLayer = markersGroupRef.current
      const polylineLayer = polylineGroupRef.current

      markersLayer.clearLayers()
      polylineLayer.clearLayers()

      const filtered = ATLAS_SPOTS.filter((spot) => {
        const matchTerritory = selectedTerritory === 'all' || spot.territory === selectedTerritory
        const matchCategory = selectedCategory === 'all' || spot.category === selectedCategory
        const matchSearch =
          searchQuery === '' ||
          spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.catLabel.toLowerCase().includes(searchQuery.toLowerCase())

        return matchTerritory && matchCategory && matchSearch
      })

      // Add markers
      filtered.forEach((spot) => {
        const isSelected = activeSpot?.id === spot.id
        const size = isSelected ? 32 : 24
        const bgColor = isSelected ? '#9A442D' : '#E07A5F'

        const customIcon = L.divIcon({
          className: 'custom-atlas-marker',
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background-color: ${bgColor};
              border: 2px solid #FAF9F5;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              cursor: pointer;
            ">
              <span style="width: 6px; height: 6px; background-color: #FAF9F5; border-radius: 9999px;"></span>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const marker = L.marker([spot.lat, spot.lng], {
          icon: customIcon,
          title: spot.name,
        })

        marker.on('click', () => {
          setActiveSpot(spot)
          map.flyTo([spot.lat, spot.lng], Math.max(map.getZoom(), 10), { duration: 0.8 })
        })

        markersLayer.addLayer(marker)
      })

      // Draw dashed trajectory lines connecting spots within the filtered territory
      if (selectedTerritory !== 'all' && filtered.length > 1) {
        const coords: [number, number][] = filtered.map((s) => [s.lat, s.lng])
        const polyline = L.polyline(coords, {
          color: '#E07A5F',
          weight: 2,
          opacity: 0.85,
          dashArray: '4, 6',
          lineCap: 'round',
        })
        polylineLayer.addLayer(polyline)
      }
    })
  }

  function handleTerritoryChange(tId: string) {
    setSelectedTerritory(tId)
    const target = TERRITORIES.find((t) => t.id === tId)
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 1.2 })
    }
  }

  function handleCopyCoords() {
    if (activeSpot) {
      const text = `${activeSpot.lat.toFixed(4)}, ${activeSpot.lng.toFixed(4)}`
      navigator.clipboard.writeText(text).then(() => {
        setCopiedCoords(true)
        setTimeout(() => setCopiedCoords(false), 2000)
      })
    }
  }

  function handleDownloadGpx() {
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Heldonica Slow Travel">
  <metadata>
    <name>Tracés de Terrain Heldonica</name>
    <desc>Repères et itinéraires vérifiés par le duo Heldonica.</desc>
  </metadata>
  ${ATLAS_SPOTS.map(
    (s) => `<wpt lat="${s.lat}" lon="${s.lng}">
    <name>${s.name}</name>
    <desc>${s.quote.replace(/[«»"]/g, '')}</desc>
  </wpt>`
  ).join('\n  ')}
</gpx>`

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'heldonica_atlas_bundle_traces.gpx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filtered & sorted camps
  const filteredCamps = CAMPS_DE_BASE.filter((camp) => {
    const matchDest = campDestFilter === 'all' || camp.dest === campDestFilter
    const matchType = campTypeFilter === 'all' || camp.type === campTypeFilter
    return matchDest && matchType
  }).sort((a, b) => {
    if (sortCriterion === 'score-desc') return b.score - a.score
    if (sortCriterion === 'price-asc') return a.price - b.price
    if (sortCriterion === 'price-desc') return b.price - a.price
    return 0
  })

  return (
    <div className="w-full flex flex-col bg-[#FAF9F5] text-charcoal">
      {/* ── 1. EN-TÊTE ÉDITORIAL & MÉTRIQUES ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-10 md:pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFECE6] border border-[#DED5C6] text-mahogany text-xs uppercase tracking-widest font-semibold mb-4">
          <Compass className="w-4 h-4 text-terracotta" />
          <span>Atlas Cartographique Slow Travel · Territoires Vécus</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif text-mahogany tracking-tight leading-tight mb-4">
          L&apos;Atlas Heldonica : Nos Territoires &amp; Tracés Hors Sentiers
        </h1>

        <p className="text-sm md:text-base text-charcoal/75 max-w-2xl mx-auto leading-relaxed mb-8">
          Toutes nos routes arpentées en duo, camps de base confidentiels, criques sans musique et sentiers de crête réunis sur une carte vivante. Sélectionnez une région pour explorer le tracé précis et les coordonnées réelles.
        </p>

        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] text-center">
            <span className="text-2xl md:text-3xl font-serif text-mahogany block">6</span>
            <span className="text-xs uppercase tracking-wider text-charcoal/60">Territoires explorés</span>
          </div>
          <div className="p-4 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] text-center">
            <span className="text-2xl md:text-3xl font-serif text-mahogany block">2 800+</span>
            <span className="text-xs uppercase tracking-wider text-charcoal/60">km arpentés à deux</span>
          </div>
          <div className="p-4 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] text-center">
            <span className="text-2xl md:text-3xl font-serif text-mahogany block">24</span>
            <span className="text-xs uppercase tracking-wider text-charcoal/60">Pépites vérifiées</span>
          </div>
          <div className="p-4 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] text-center">
            <span className="text-2xl md:text-3xl font-serif text-mahogany block">100%</span>
            <span className="text-xs uppercase tracking-wider text-charcoal/60">Tracés terrain vécus</span>
          </div>
        </div>
      </section>

      {/* ── 2. BARRE D'OUTILS & FILTRES ───────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-6 w-full">
        <div className="p-4 md:p-6 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] flex flex-col gap-4">
          {/* Ligne 1 : Onglets Territoires + Bouton GPX */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {TERRITORIES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTerritoryChange(t.id)}
                  className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider whitespace-nowrap transition-colors font-medium border ${
                    selectedTerritory === t.id
                      ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                      : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal hover:border-mahogany/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadGpx}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm bg-mahogany hover:bg-mahogany/90 text-[#FAF9F5] text-xs font-medium uppercase tracking-wider transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Exporter Bundle GPX</span>
            </button>
          </div>

          {/* Ligne 2 : Recherche & Catégories */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2 border-t border-[#DED5C6]/60">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un village, un col, une crique..."
                className="w-full pl-9 pr-4 py-2 rounded-sm bg-[#FAF9F5] border border-[#DED5C6] text-xs text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-mahogany"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'Tous', icon: Compass },
                { id: 'base', label: 'Camps de base', icon: Bed },
                { id: 'cove', label: 'Baignades & Criques', icon: Waves },
                { id: 'table', label: 'Terroir & Tables', icon: UtensilsCrossed },
                { id: 'trail', label: 'Sentiers & Cols', icon: Mountain },
              ].map((c) => {
                const IconComponent = c.icon
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider whitespace-nowrap transition-colors border ${
                      selectedCategory === c.id
                        ? 'bg-eucalyptus text-[#FAF9F5] border-eucalyptus'
                        : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{c.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CARTE INTERACTIVE CENTRALE & PANNEAU D'INSPECTION ────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-12 w-full">
        <div className="relative w-full h-[580px] rounded-sm border border-[#DED5C6] overflow-hidden bg-[#FAF7F2]">
          {/* Map canvas */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Panneau latéral d'inspection */}
          {activeSpot && (
            <aside className="absolute top-4 right-4 bottom-4 w-80 md:w-96 max-w-[calc(100%-2rem)] z-20 bg-[#FAF9F5]/95 backdrop-blur-md border border-[#DED5C6] rounded-sm p-5 flex flex-col justify-between overflow-y-auto shadow-sm">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#DED5C6]/60">
                  <span className="px-2 py-0.5 rounded-sm bg-mahogany/10 text-mahogany font-semibold text-[10px] uppercase tracking-wider">
                    {activeSpot.catLabel}
                  </span>
                  <span className="text-xs font-medium text-charcoal/60">
                    {activeSpot.region}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-mahogany mt-2 leading-snug">
                  {activeSpot.name}
                </h3>
                <p className="text-[11px] uppercase tracking-wider text-charcoal/50 mt-1">
                  {activeSpot.lat.toFixed(4)}° N, {activeSpot.lng.toFixed(4)}° W · {activeSpot.alt}
                </p>

                {/* Vignette Photo */}
                <div className="relative w-full h-36 rounded-sm overflow-hidden mt-3 bg-[#241D1A]">
                  <Image
                    src={activeSpot.photo}
                    alt={activeSpot.photoAlt}
                    fill
                    sizes="400px"
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-sm bg-[#FAF9F5]/90 text-[10px] text-charcoal uppercase tracking-wider">
                    Cliché terrain
                  </div>
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2 rounded-sm bg-[#FAF7F2] border border-[#DED5C6]">
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-charcoal/50">
                      <Clock className="w-3 h-3 text-terracotta" />
                      <span>Temps conseillé</span>
                    </span>
                    <span className="font-medium text-charcoal mt-0.5 block">{activeSpot.duration}</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[#FAF7F2] border border-[#DED5C6]">
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-charcoal/50">
                      <Car className="w-3 h-3 text-terracotta" />
                      <span>Accès</span>
                    </span>
                    <span className="font-medium text-charcoal mt-0.5 block truncate">{activeSpot.access}</span>
                  </div>
                </div>

                {/* Citation */}
                <div className="mt-3 p-3 rounded-sm bg-[#FAF7F2] border border-[#DED5C6]">
                  <div className="flex items-center gap-1.5 text-mahogany mb-1">
                    <Quote className="w-3.5 h-3.5 text-terracotta" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Le carnet d&apos;Elle &amp; Lui :</span>
                  </div>
                  <p className="text-xs text-charcoal/75 italic leading-relaxed">
                    {activeSpot.quote}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#DED5C6]/60 flex flex-col gap-2 mt-3">
                <Link
                  href={activeSpot.link}
                  className="w-full py-2.5 rounded-sm bg-mahogany hover:bg-mahogany/90 text-[#FAF9F5] text-xs font-medium text-center uppercase tracking-wider transition-colors"
                >
                  Ouvrir le carnet de route
                </Link>

                <button
                  onClick={handleCopyCoords}
                  className="w-full py-2 rounded-sm bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#DED5C6] text-xs text-charcoal/70 flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedCoords ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-eucalyptus" />
                      <span className="text-eucalyptus font-medium">Coordonnées copiées !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-charcoal/50" />
                      <span>Copier les coordonnées GPS</span>
                    </>
                  )}
                </button>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* ── 4. COMPARATIF DES CAMPS DE BASE & HÉBERGEMENTS VÉRIFIÉS ────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-16 w-full">
        <div className="p-6 md:p-8 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mahogany/10 text-mahogany text-xs uppercase tracking-widest font-semibold mb-2">
                <Bed className="w-3.5 h-3.5 text-terracotta" />
                <span>Camps de Base &amp; Adresses de Terrain</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif text-mahogany">
                Comparer nos Camps de Base &amp; Hébergements Vérifiés
              </h2>
              <p className="text-xs md:text-sm text-charcoal/75 mt-1 max-w-2xl leading-relaxed">
                Chaque adresse a été vécue, testée et approuvée en duo pour son silence, son ancrage architectural et sa déconnexion totale.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-sm bg-[#FAF9F5] border border-[#DED5C6] text-xs text-mahogany font-medium">
              {filteredCamps.length} camp(s) de base vérifié(s)
            </div>
          </div>

          {/* Filtres de la table */}
          <div className="flex flex-col gap-3 pt-3 border-t border-[#DED5C6]">
            {/* Par destination */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-charcoal/50 w-28 shrink-0">Destination :</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'madeira', label: 'Madère' },
                  { id: 'montenegro', label: 'Monténégro' },
                  { id: 'romania', label: 'Roumanie' },
                  { id: 'italy', label: 'Pouilles & Sicile' },
                  { id: 'switzerland', label: 'Suisse' },
                  { id: 'portugal', label: 'Portugal' },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setCampDestFilter(d.id)}
                    className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider whitespace-nowrap transition-colors border ${
                      campDestFilter === d.id
                        ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                        : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tri */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DED5C6]/60">
              <span className="text-xs uppercase tracking-wider text-charcoal/50 w-28 shrink-0 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-terracotta" />
                <span>Trier par :</span>
              </span>
              <button
                onClick={() => setSortCriterion('score-desc')}
                className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                  sortCriterion === 'score-desc'
                    ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                    : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6]'
                }`}
              >
                ★ Slow Score
              </button>
              <button
                onClick={() => setSortCriterion('price-asc')}
                className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                  sortCriterion === 'price-asc'
                    ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                    : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6]'
                }`}
              >
                Prix croissant
              </button>
              <button
                onClick={() => setSortCriterion('price-desc')}
                className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                  sortCriterion === 'price-desc'
                    ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                    : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6]'
                }`}
              >
                Prix décroissant
              </button>
            </div>
          </div>

          {/* Tableau */}
          <div className="w-full overflow-x-auto rounded-sm border border-[#DED5C6] bg-[#FAF9F5]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#EFECE6] border-b border-[#DED5C6] text-charcoal/70 uppercase tracking-wider font-semibold">
                  <th className="p-3">Hébergement &amp; Région</th>
                  <th className="p-3">Typologie &amp; Bâti</th>
                  <th className="p-3 text-center">Slow Score</th>
                  <th className="p-3">Durée conseillée</th>
                  <th className="p-3">Expérience Signature</th>
                  <th className="p-3 text-right">Budget indicatif</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED5C6]">
                {filteredCamps.map((camp) => (
                  <tr key={camp.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-3">
                      <div className="font-serif text-sm text-mahogany">{camp.name}</div>
                      <div className="text-[11px] text-charcoal/60 mt-0.5">{camp.location}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-charcoal">{camp.typeLabel}</div>
                      <div className="text-[11px] text-charcoal/60 mt-0.5">{camp.bâti}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-sm bg-mahogany/10 text-mahogany font-bold">
                        ★ {camp.score}/10
                      </span>
                      <div className="text-[10px] text-charcoal/50 mt-0.5">{camp.scoreTag}</div>
                    </td>
                    <td className="p-3 font-medium text-charcoal whitespace-nowrap">
                      {camp.duration}
                    </td>
                    <td className="p-3 text-charcoal/75 max-w-xs leading-relaxed">
                      {camp.experience}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="font-semibold text-mahogany text-sm">~{camp.price} € <span className="text-[10px] text-charcoal/50 font-normal">/ nuit</span></div>
                      <div className="text-[10px] text-charcoal/50 mt-0.5">{camp.accessVehicle}</div>
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <Link
                        href={camp.link}
                        className="inline-block px-3 py-1 rounded-sm bg-mahogany hover:bg-mahogany/90 text-[#FAF9F5] text-[11px] font-medium uppercase tracking-wider transition-colors"
                      >
                        Consulter
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-charcoal/60 pt-2 flex items-center justify-between">
            <span>Réservation directe en circuit court sans commission de plateforme.</span>
            <Link href="/travel-planning#formulaire" className="text-mahogany hover:underline font-medium">
              Confier la privatisation de votre hébergement
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
