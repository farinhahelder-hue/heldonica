import { getDestinationBySlug, getAllDestinationSlugs, blogPosts } from '@/lib/wordpress-data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EnhancedRichContent from '@/components/EnhancedRichContent'
import { sanitizeHtml } from '@/lib/sanitize-html'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'
import Breadcrumb from '@/components/Breadcrumb'

interface Props {
  params: { slug: string }
}

type SeasonRow = { period: string; weather: string; vibe: string }
type Base = { name: string; description: string; bookingUrl: string }
type ItineraryDay = { day: string; label: string }
type FaqItem = { question: string; answer: string }
type BudgetLine = { label: string; value: string }

type DestinationMeta = {
  description: string
  heroImage: string
  region: string
  duration: string
  budget: string
  bestSeason: string
  verdict: string
  intro: string
  budgetIntro?: string
  budgetLines?: BudgetLine[]
  seasons?: SeasonRow[]
  bases?: Base[]
  itinerary?: ItineraryDay[]
  faq?: FaqItem[]
  mapQuery?: string
  geo?: { latitude: number; longitude: number }
  touristType?: string[]
  planningLabel?: string
  datePublished?: string
}

const DEST_META: Record<string, DestinationMeta> = {
  zurich: {
    description: 'Badi flottantes, brasseries artisanales et vieille ville dense. Zurich se révèle quand on ralentit assez pour la laisser venir.',
    heroImage: 'https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg',
    region: 'Suisse',
    duration: '3 à 4 jours',
    budget: 'Court séjour premium',
    bestSeason: 'Juin à septembre',
    verdict: 'Une ville plus sensuelle que sa réputation.',
    intro: 'On y est venus avec des idées toutes faites. Elles ont sauté dès la première baignade dans la Limmat.',
    datePublished: '2025-08-01',
    budgetIntro: 'Zurich est chère, mais mieux cadrer ses dépenses change tout : on mange bien pour moins cher qu’on ne croit si on sort des zones touristiques.',
    budgetLines: [
      { label: 'Hébergement', value: '120–220 € / nuit' },
      { label: 'Repas + cafés', value: '60–100 € / jour / duo' },
      { label: 'Transports ZVV', value: '10–20 € / jour' },
      { label: 'Activités', value: 'Beaucoup sont gratuites' },
    ],
    seasons: [
      { period: 'Juin — Septembre', weather: '22 à 28 °C, ensoleillé', vibe: 'Idéal : badi, terrasses, lac' },
      { period: 'Octobre — Novembre', weather: '10 à 16°C, doux', vibe: 'Parfait pour les musées et la vieille ville' },
      { period: 'Décembre — Mars', weather: 'Froid, marchés de Noël', vibe: 'Ambiance unique, mais moins slow' },
    ],
    bases: [
      { name: 'Zurich Centre (Altstadt)', description: 'Vieille ville piétonne, cafés de quartier, accès à pied partout. Base idéale pour un premier séjour.', bookingUrl: 'https://www.booking.com/city/ch/zurich.fr.html?aid=2420035' },
      { name: 'Quartier Langstrasse', description: 'Plus alternatif, plus vivant le soir. Idéal pour un duo qui veut le vrai rythme de la ville.', bookingUrl: 'https://www.booking.com/city/ch/zurich.fr.html?aid=2420035' },
      { name: 'Zürichberg (collines)', description: 'Plus calme, vue sur la ville. Parfait si tu veux sortir du centre sans perdre l’accès.', bookingUrl: 'https://www.booking.com/city/ch/zurich.fr.html?aid=2420035' },
    ],
    itinerary: [
      { day: 'J1', label: 'Arrivée, Altstadt, première badi sur la Limmat.' },
      { day: 'J2', label: 'Musée des Beaux-Arts + quartier West, dîner local.' },
      { day: 'J3', label: 'Lac de Zurich en bateau, Uetliberg au coucher du soleil.' },
      { day: 'J4', label: 'Marché du matin, flânerie Langstrasse, départ.' },
    ],
    faq: [
      { question: 'Zurich est-elle vraiment trop chère ?', answer: 'Chère, oui — mais moins qu’on ne le croit si on mange dans les restaurants de quartier (Beiz) et qu’on utilise le pass ZVV inclus dans beaucoup d’hôtels.' },
      { question: 'Combien de jours suffit-il ?', answer: '3 nuits donnent un rythme confortable pour Zurich. 4 si vous voulez ajouter une excursion lac ou montagne.' },
      { question: 'Quoi faire gratuit à Zurich ?', answer: 'Baignade dans la Limmat (badi), vieille ville, marché Bürkliplatz, promenade Uetliberg, collections permanentes de certains musées.' },
      { question: 'Zurich convient-elle au slow travel ?', answer: 'Oui, à condition de ne pas vouloir tout voir. Elle récompense ceux qui restent dans un quartier plutôt que ceux qui s’épuisent à couvrir la carte.' },
    ],
    mapQuery: 'Zurich,Switzerland',
    geo: { latitude: 47.3769, longitude: 8.5417 },
    touristType: ['City traveler', 'Slow traveler', 'Culture seeker'],
    planningLabel: 'Zurich',
  },

  suisse: {
    description: 'Montagnes, lacs, trains impeccables et détours qui demandent du temps. La Suisse devient juste quand on cesse de la résumer à son prix.',
    heroImage: 'https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg',
    region: 'Europe centrale',
    duration: '7 à 12 jours',
    budget: 'Moyen à élevé',
    bestSeason: 'Juillet à septembre',
    verdict: 'Une destination lente, si on la laisse respirer.',
    intro: 'On y revient pour les crêtes, puis on reste pour tout ce qu’on n’avait pas prévu entre deux trajets.',
    datePublished: '2025-08-01',
    budgetIntro: 'La Suisse se maîtrise avec un Swiss Travel Pass : trains, bateaux et musées inclus, qui rentabilise vite le prix de départ.',
    budgetLines: [
      { label: 'Swiss Travel Pass 7j', value: '~310 € / personne' },
      { label: 'Hébergement', value: '100–200 € / nuit' },
      { label: 'Repas', value: '50–90 € / jour / duo' },
      { label: 'Activités montagne', value: '20–60 € / personne' },
    ],
    seasons: [
      { period: 'Juillet — Août', weather: '20 à 28 °C en altitude', vibe: 'Idéal : randonnées, lacs, trains panoramiques' },
      { period: 'Septembre — Octobre', weather: '12 à 20°C, feuillage', vibe: 'Parfait : foules réduites, couleurs d’automne' },
      { period: 'Décembre — Mars', weather: 'Neige en altitude', vibe: 'Pour le ski ou la Suisse hivernale enneigée' },
    ],
    bases: [
      { name: 'Interlaken', description: 'Porte des Alpes, entre deux lacs. Base parfaite pour la Jungfrau et les vallées.', bookingUrl: 'https://www.booking.com/city/ch/interlaken.fr.html?aid=2420035' },
      { name: 'Lucerne', description: 'Lac, pont historique, montagne proche. La ville la plus qualitative pour un duo slow.', bookingUrl: 'https://www.booking.com/city/ch/lucerne.fr.html?aid=2420035' },
      { name: 'Locarno (Tessin)', description: 'Suisse italienne, palmiers, lac Majeur. Doux, méditerranéen, inattendu.', bookingUrl: 'https://www.booking.com/city/ch/locarno.fr.html?aid=2420035' },
    ],
    itinerary: [
      { day: 'J1–2', label: 'Zurich ou Genève : arrivée, installation, rythme urbain.' },
      { day: 'J3–4', label: 'Lucerne + lac des Quatre-Cantons en bateau.' },
      { day: 'J5–6', label: 'Interlaken + Grindelwald, randonnée selon niveau.' },
      { day: 'J7–8', label: 'Vallée du Rhône ou Tessin selon tempo souhaité.' },
      { day: 'J9+', label: 'Retour progressif, dernière ville, slow morning.' },
    ],
    faq: [
      { question: 'Vaut-il mieux prendre le Swiss Travel Pass ?', answer: 'Oui si vous prévoyez 4+ trajets en train. Il inclut aussi les bateaux et les musées — il se rentabilise vite.' },
      { question: 'Peut-on faire la Suisse en étant éco-responsable ?', answer: 'C’est l’une des destinations les plus faciles à faire sans voiture : le réseau ferroviaire est exceptionnel et couvre même les vallées retirées.' },
      { question: 'Quelle région choisir pour un premier voyage ?', answer: 'Zurich + Lucerne + Interlaken forment le triangle le plus accessible et le plus complet pour une première fois.' },
      { question: 'La Suisse est-elle adaptée au slow travel ?', answer: 'Parfaitement. Les trains panoramiques, les bateaux sur les lacs et les villages d’altitude sont conçus pour qu’on s’y attarde.' },
    ],
    mapQuery: 'Switzerland',
    geo: { latitude: 46.8182, longitude: 8.2275 },
    touristType: ['Nature lover', 'Slow traveler', 'Train traveler'],
    planningLabel: 'Suisse',
  },

  roumanie: {
    description: 'Timișoara, Delta du Danube, Carpates : la Roumanie donne beaucoup à celles et ceux qui acceptent de lui laisser de l’espace.',
    heroImage: 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
    region: 'Europe de l’Est',
    duration: '8 à 14 jours',
    budget: 'Accessible',
    bestSeason: 'Mai, juin, septembre',
    verdict: 'Le genre de pays qui déplace ton regard.',
    intro: 'On pensait partir vers une destination discrète. On a trouvé un terrain immense, vivant, parfois brut, souvent bouleversant.',
    datePublished: '2025-09-01',
    budgetIntro: 'La Roumanie est une des destinations européennes les plus accessibles. Un budget modéré permet de vivre très bien et de dormir dans des maisons d’hôtes authentiques.',
    budgetLines: [
      { label: 'Hébergement', value: '35–80 € / nuit' },
      { label: 'Repas locaux', value: '20–40 € / jour / duo' },
      { label: 'Transport intérieur', value: '15–30 € / jour' },
      { label: 'Activités', value: '10–25 € / personne' },
    ],
    seasons: [
      { period: 'Mai — Juin', weather: '18 à 26 °C, campagne verte', vibe: 'Idéal : fleurs, villages vivants, foules nulles' },
      { period: 'Septembre — Octobre', weather: '14 à 22°C, automne doux', vibe: 'Parfait : couleurs, vendanges, calme' },
      { period: 'Juillet — Août', weather: '25 à 35°C', vibe: 'Chaud mais vivant : festivals, Delta du Danube' },
    ],
    bases: [
      { name: 'Timișoara', description: 'Capitale culturelle européenne, architecture austro-hongroise, cafés vivants. Porte d’entrée parfaite.', bookingUrl: 'https://www.booking.com/city/ro/timisoara.fr.html?aid=2420035' },
      { name: 'Brașov', description: 'Au pied des Carpates, vieille ville médiévale, accès aux sentiers. La base la plus polyvalente.', bookingUrl: 'https://www.booking.com/city/ro/brasov.fr.html?aid=2420035' },
      { name: 'Sibiu', description: 'Plus intime, plus préservée. Idéale pour ralentir et sentir le rythme transylvanien.', bookingUrl: 'https://www.booking.com/city/ro/sibiu.fr.html?aid=2420035' },
    ],
    itinerary: [
      { day: 'J1–2', label: 'Timișoara : arrivée, place de l’Union, cafés et architecture.' },
      { day: 'J3–4', label: 'Route vers la Transylvanie, Sibiu ou Brașov.' },
      { day: 'J5–6', label: 'Carpates : villages de montagne, sentiers, pain local.' },
      { day: 'J7–8', label: 'Delta du Danube ou retour via Bucarest selon tempo.' },
      { day: 'J9+', label: 'Slow morning, dernière adresse, retour.' },
    ],
    faq: [
      { question: 'Faut-il une voiture en Roumanie ?', answer: 'Pour les zones rurales et les Carpates, oui. Les villes se font à pied ou en uber local très accessible.' },
      { question: 'La Roumanie est-elle sûre ?', answer: 'Oui. C’est un pays de l’UE, généralement accueillant et calme. Les précautions habituelles s’appliquent comme partout.' },
      { question: 'Quelle ville commencer pour une première fois ?', answer: 'Timișoara ou Brașov. L’une pour l’ambiance urbaine et culturelle, l’autre pour la nature et le charme médiéval.' },
      { question: 'La Roumanie convient-elle au slow travel ?', answer: 'C’est l’une des destinations européennes les plus adaptées : espaces préservés, rythme lent, prix accessibles, habitants chaleureux.' },
    ],
    mapQuery: 'Romania',
    geo: { latitude: 45.9432, longitude: 24.9668 },
    touristType: ['Culture traveler', 'Nature lover', 'Slow traveler'],
    planningLabel: 'Roumanie',
  },

  paris: {
    description: 'Paris et l’Île-de-France se lisent mieux quand on sort des grandes phrases. Un canal, une friche, une rue, et le rythme change.',
    heroImage: 'https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg',
    region: 'France',
    duration: '2 à 5 jours',
    budget: 'Variable',
    bestSeason: 'Toute l’année',
    verdict: 'La preuve qu’on peut ralentir sans partir loin.',
    intro: 'Le slow travel commence parfois à une station de métro de chez soi. C’est peut-être pour ça qu’on y tient autant.',
    datePublished: '2025-09-01',
    budgetIntro: 'Paris peut être aussi cheap ou aussi premium que tu le décides. Le vrai slow travel parisien se fait à pied et dans les marchés de quartier.',
    budgetLines: [
      { label: 'Hébergement', value: '80–200 € / nuit' },
      { label: 'Repas brasserie / marché', value: '30–70 € / jour / duo' },
      { label: 'Transports (Navigo)', value: '8–16 € / jour' },
      { label: 'Musées / expos', value: '0–25 € (1er dimanche gratuit)' },
    ],
    seasons: [
      { period: 'Avril — Juin', weather: '14 à 22°C, floraison', vibe: 'Idéal : parcs, terrasses, lumière douce' },
      { period: 'Septembre — Novembre', weather: '12 à 20°C', vibe: 'Parfait : rentrée culturelle, expos, moins de touristes' },
      { period: 'Décembre — Février', weather: '3 à 10°C', vibe: 'Paris hivernal : musées, marchés couverts, Noël' },
    ],
    bases: [
      { name: 'Canal Saint-Martin (10e–11e)', description: 'Le quartier qui concentre le mieux l’énergie slow : cafés indépendants, marchés, bords de canal.', bookingUrl: 'https://www.booking.com/city/fr/paris.fr.html?aid=2420035' },
      { name: 'Marais (3e–4e)', description: 'Architecturalement riche, galeries, marchés couverts. Idéal pour un séjour court et dense.', bookingUrl: 'https://www.booking.com/city/fr/paris.fr.html?aid=2420035' },
      { name: 'Buttes-Chaumont (19e)', description: 'Plus local, moins touristique. Le vrai rythme parisien du quotidien.', bookingUrl: 'https://www.booking.com/city/fr/paris.fr.html?aid=2420035' },
    ],
    itinerary: [
      { day: 'J1', label: 'Canal Saint-Martin : café, marché couvert, flânerie.' },
      { day: 'J2', label: 'Petite Ceinture + Buttes-Chaumont, déjeuner de quartier.' },
      { day: 'J3', label: 'Marais + expo du moment, île Saint-Louis en fin de journée.' },
      { day: 'J4', label: 'Journée libre selon énergie : marché d’Aligre, Belleville, Montmartre hors sentiers.' },
    ],
    faq: [
      { question: 'Paris vaut-elle un voyage slow travel ?', answer: 'Oui, à condition de sortir des circuits touristiques. La Petite Ceinture, les marchés de quartier et les cours intérieures révèlent une autre ville.' },
      { question: 'Quels quartiers éviter pour un rythme lent ?', answer: 'Champs-Élysées, Montmartre sommet, tour Eiffel — pas pour leur manque d’intérêt, mais pour la densité touristique qui casse le rythme.' },
      { question: 'Comment visiter Paris sans se ruiner ?', answer: 'Navigo semaine, repas en brasserie de quartier ou marché, musées le 1er dimanche du mois (gratuits), parcs à volonté.' },
      { question: 'Paris en couple, quelle durée idéale ?', answer: '3 nuits permettent un rythme non pressé. 5 nuits si vous voulez explorer au-delà du centre — Vincennes, Versailles, banlieue créative.' },
    ],
    mapQuery: 'Paris,France',
    geo: { latitude: 48.8566, longitude: 2.3522 },
    touristType: ['City traveler', 'Slow traveler', 'Culture seeker'],
    planningLabel: 'Paris',
  },

  normandie: {
    description: 'Étretat, Honfleur, Deauville : la Normandie côtière demande moins de cases à cocher et plus de temps entre deux marées.',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600',
    region: 'France',
    duration: '3 à 5 jours',
    budget: 'Modulable',
    bestSeason: 'Mai à septembre',
    verdict: 'La côte marche mieux quand on accepte ses détours.',
    intro: 'Ici, le bon rythme vient souvent du vent, de l’heure de la marée et d’une table trouvée plus tard que prévu.',
    datePublished: '2026-05-06',
    budgetIntro: 'La Normandie est accessible avec une voiture louée depuis Paris ou Caen. Le homard local coûte moins cher que dans les restaurants parisiens.',
    budgetLines: [
      { label: 'Location voiture', value: '40–60 € / jour' },
      { label: 'Hébergement', value: '70–140 € / nuit' },
      { label: 'Repas (produits locaux)', value: '40–80 € / jour / duo' },
      { label: 'Activités côtières', value: '0–20 €' },
    ],
    seasons: [
      { period: 'Mai — Juin', weather: '14 à 20 °C, lumière atlantique', vibe: 'Idéal : falaises désertes, marchés vivants' },
      { period: 'Juillet — Août', weather: '18 à 24°C', vibe: 'Plus de monde, mais plages vivantes' },
      { period: 'Septembre', weather: '14 à 20°C, doux', vibe: 'Parfait : foules parties, mer encore douce' },
    ],
    bases: [
      { name: 'Honfleur', description: 'Vieux-bassin pittoresque, galeries, cafés. Point d’entrée idéal pour la côte fleurie.', bookingUrl: 'https://www.booking.com/city/fr/honfleur.fr.html?aid=2420035' },
      { name: 'Étretat', description: 'Pour les falaises et les couchers de soleil sur la Manche. Logez au village, pas au camping.', bookingUrl: 'https://www.booking.com/city/fr/etretat.fr.html?aid=2420035' },
      { name: 'Bayeux', description: 'Ville médiévale, tapisserie célèbre, proche des plages du Débarquement. Base intérieure.', bookingUrl: 'https://www.booking.com/city/fr/bayeux.fr.html?aid=2420035' },
    ],
    itinerary: [
      { day: 'J1', label: 'Arrivée Honfleur : vieux-bassin, marché, première table locale.' },
      { day: 'J2', label: 'Côte fleurie : Deauville, Trouville, plages au rythme de la marée.' },
      { day: 'J3', label: 'Étretat : falaises le matin (avant les bus), déjeuner en ville.' },
      { day: 'J4', label: 'Option : plages du Débarquement + Bayeux ou retour progressif.' },
    ],
    faq: [
      { question: 'Faut-il une voiture en Normandie ?', answer: 'Oui, pour la liberté entre les falaises, villages et plages. Les transports en commun existent mais sont lents et limités hors saison.' },
      { question: 'Quand aller à Étretat pour éviter la foule ?', answer: 'Tôt le matin (avant 9h) ou en septembre. Les falaises se vivent mieux dans le silence que dans la masse.' },
      { question: 'La Normandie convient-elle au slow travel ?', answer: 'Parfaitement : les horaires de marée imposent un rythme naturel, les marchés dictent les repas, et les petites routes côtières invitent aux détours.' },
      { question: 'Que manger absolument en Normandie ?', answer: 'Camembert chaud, cidre brut, sole meunière, huîtres de Saint-Vaast, crème et beurre en toutes circonstances.' },
    ],
    mapQuery: 'Normandy,France',
    geo: { latitude: 49.1829, longitude: 0.3707 },
    touristType: ['Coast lover', 'Slow traveler', 'Food lover'],
    planningLabel: 'Normandie',
  },

  bretagne: {
    description: 'Sentiers côtiers, crêperies, lumière changeante et Saint-Malo comme point d’appui. La Bretagne gagne à être laissée tranquille.',
    heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600',
    region: 'France',
    duration: '4 à 7 jours',
    budget: 'Modulable',
    bestSeason: 'Mai à septembre',
    verdict: 'Une destination qui se donne mieux à pied qu’en programme serré.',
    intro: 'On y va pour la côte, puis on reste pour ce que la météo déplace dans une même journée.',
    datePublished: '2026-05-06',
    budgetIntro: 'La Bretagne est une des destinations françaises les plus accessibles en voiture depuis Paris. Les crêperies locales sont généreuses pour pas grand chose.',
    budgetLines: [
      { label: 'Location voiture', value: '35–55 € / jour' },
      { label: 'Hébergement', value: '65–130 € / nuit' },
      { label: 'Repas (crêperies + fruits de mer)', value: '35–75 € / jour / duo' },
      { label: 'GR34 + activités', value: '0–15 €' },
    ],
    seasons: [
      { period: 'Mai — Juin', weather: '14 à 20 °C, vert intense', vibe: 'Idéal : côte déserte, ajoncs en fleurs' },
      { period: 'Juillet — Août', weather: '18 à 24°C', vibe: 'Vivant mais chargé : choisir l’intérieur des terres' },
      { period: 'Septembre', weather: '14 à 20°C, mer douce', vibe: 'Parfait : calme revenu, lumière rasante magnifique' },
    ],
    bases: [
      { name: 'Saint-Malo', description: 'Cité corsée, remparts, grandes marées. Point d’entrée idéal pour la côte d’Émeraude.', bookingUrl: 'https://www.booking.com/city/fr/saint-malo.fr.html?aid=2420035' },
      { name: 'Vannes', description: 'Porte du Morbihan. Vieille ville médiévale + golfe du Morbihan à portée de main.', bookingUrl: 'https://www.booking.com/city/fr/vannes.fr.html?aid=2420035' },
      { name: 'Quimper', description: 'Bretagne profonde, cathédrale gothique, faïence locale. La ville la plus authentique de l’intérieur.', bookingUrl: 'https://www.booking.com/city/fr/quimper.fr.html?aid=2420035' },
    ],
    itinerary: [
      { day: 'J1', label: 'Arrivée Saint-Malo : remparts au coucher du soleil, huîtres.' },
      { day: 'J2', label: 'Cap Fréhel + Fort la Latte : falaises et vue 360°.' },
      { day: 'J3', label: 'GR34 Crozon ou presqu’île de Rhuys selon position.' },
      { day: 'J4', label: 'Golfe du Morbihan en bateau : îles, oiseaux, silence.' },
      { day: 'J5+', label: 'Intérieur des terres (Monts d’Arrée) ou retour progressif.' },
    ],
    faq: [
      { question: 'Peut-on faire la Bretagne sans voiture ?', answer: 'Partiellement : Saint-Malo et Rennes sont accessibles en TGV. Mais pour le GR34 et les presqu’îles, une voiture ou un vélo reste nécessaire.' },
      { question: 'Quelle partie de la Bretagne pour un premier voyage ?', answer: 'Côte Nord (Saint-Malo, Cap Fréhel) pour les falaises et les grandes marées. Côte Sud (Morbihan) pour le calme et les îles.' },
      { question: 'La météo bretonne gâche-t-elle le voyage ?', answer: 'Non si on l’intègre au rythme. La pluie du matin qui laisse place au soleil de l’après-midi est souvent le meilleur moment pour la lumière.' },
      { question: 'Où manger les meilleures crêpes ?', answer: 'Dans les crêperies de village, pas dans les ports touristiques. Demandez aux habitants — ils ont toujours une adresse que les guides ne mentionnent pas.' },
    ],
    mapQuery: 'Brittany,France',
    geo: { latitude: 48.2020, longitude: -2.9326 },
    touristType: ['Coast lover', 'Slow traveler', 'Nature lover'],
    planningLabel: 'Bretagne',
  },
}

const SLUG_ALIASES: Record<string, string> = {
  'suisse-heldonica': 'suisse',
  'roumanie-heldonica-slow': 'roumanie',
  'madere-heldonica': 'madere',
  'ile-de-france-heldonica': 'paris',
  'normandie-heldonica': 'normandie',
  'bretagne-heldonica-slow': 'bretagne',
}

const TODAY = new Date().toISOString().split('T')[0]

export async function generateStaticParams() {
  return getAllDestinationSlugs()
}

export async function generateMetadata({ params }: Props) {
  const resolvedSlug = SLUG_ALIASES[params.slug] ?? params.slug
  const isAlias = Boolean(SLUG_ALIASES[params.slug])
  const page = getDestinationBySlug(params.slug)
  const meta = DEST_META[resolvedSlug]
  const title = page?.title || resolvedSlug
  const description = meta?.description || `Découvre ${title} avec Heldonica, depuis le terrain et sans vernis inutile.`
  const canonicalUrl = `https://heldonica.fr/destinations/${isAlias ? resolvedSlug : params.slug}`

  return {
    title: `${title} | Heldonica`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | Heldonica`,
      description,
      url: canonicalUrl,
      siteName: 'Heldonica',
      locale: 'fr_FR',
      type: 'article',
      images: meta?.heroImage ? [{ url: meta.heroImage, width: 1024, height: 683, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Heldonica`,
      description,
      creator: '@heldonica',
      images: meta?.heroImage ? [meta.heroImage] : [],
    },
  }
}

export default function DestinationPage({ params }: Props) {
  const resolvedSlug = SLUG_ALIASES[params.slug] ?? params.slug
  const page = getDestinationBySlug(params.slug)
  if (!page) notFound()

  const meta = DEST_META[resolvedSlug]
  const heroImage = page.image || meta?.heroImage || ''
  const safeContent = sanitizeHtml(page.content)

  const titleWords = page.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
  const related = blogPosts
    .filter((post) => {
      const haystack = `${post.title} ${post.categories.join(' ')} ${post.tags.join(' ')}`.toLowerCase()
      return titleWords.some((w) => haystack.includes(w))
    })
    .slice(0, 6)

  const facts = meta
    ? [
        { label: 'Durée idéale', value: meta.duration },
        { label: 'Budget indicatif', value: meta.budget },
        { label: 'Meilleure saison', value: meta.bestSeason },
        { label: 'Notre verdict', value: meta.verdict },
      ]
    : []

  const schemaDestination = meta?.geo
    ? {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name: page.title,
        description: meta.description,
        url: `https://heldonica.fr/destinations/${resolvedSlug}`,
        geo: { '@type': 'GeoCoordinates', latitude: meta.geo.latitude, longitude: meta.geo.longitude },
        touristType: meta.touristType ?? ['Slow traveler'],
        bestSeasonToVisit: meta.bestSeason,
        datePublished: meta.datePublished ?? '2026-01-01',
        dateModified: TODAY,
      }
    : null

  const schemaFaq = meta?.faq
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: meta.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null

  return (
    <>
      {schemaDestination && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaDestination) }} />
      )}
      {schemaFaq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq) }} />
      )}
      <Header />

      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Destinations', href: '/destinations' },
          { label: page.title },
        ]}
      />

      <main className="min-h-screen bg-cloud-dancer">

        {/* Hero */}
        <div className="relative min-h-[60vh] flex items-end overflow-hidden bg-stone-900 md:min-h-[70vh]">
          {heroImage && (
            <img
              src={heroImage}
              alt={page.title}
              width={1600}
              height={900}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover opacity-65"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="relative container py-14 md:py-20">
            {meta?.region && (
              <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-4">{meta.region}</p>
            )}
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-4xl mb-5 leading-tight">{page.title}</h1>
            {meta?.description && (
              <p className="text-white/80 max-w-2xl text-lg leading-relaxed">{meta.description}</p>
            )}
          </div>
        </div>

        {/* Facts */}
        {facts.length > 0 && (
          <section className="bg-white border-b border-stone-200">
            <div className="container grid md:grid-cols-4 gap-4 py-8">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-2xl border border-stone-200 bg-cloud-dancer/60 p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">{fact.label}</p>
                  <p className="text-sm leading-relaxed text-charcoal">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Saisons + Budget */}
        {meta?.seasons && (
          <section className="bg-cloud-dancer section-spacing">
            <div className="container">
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
                <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8">
                  <h2 className="text-3xl font-serif text-mahogany mb-4">Quand partir</h2>
                  <p className="text-charcoal/80 leading-relaxed mb-6">{meta.description}</p>
                  <div className="space-y-4">
                    {meta.seasons.map((row) => (
                      <div key={row.period} className="rounded-xl border border-stone-200 p-4 bg-cloud-dancer/50">
                        <p className="font-semibold text-mahogany">{row.period}</p>
                        <p className="text-sm text-charcoal/80 mt-1">{row.weather}</p>
                        <p className="text-sm text-eucalyptus mt-1">{row.vibe}</p>
                      </div>
                    ))}
                  </div>
                </article>
                {meta.budgetLines && (
                  <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8">
                    <h2 className="text-3xl font-serif text-mahogany mb-4">Budget et cadrage</h2>
                    {meta.budgetIntro && <p className="text-charcoal/80 leading-relaxed mb-4">{meta.budgetIntro}</p>}
                    <ul className="space-y-2 text-charcoal/80 mb-6">
                      {meta.budgetLines.map((line) => (
                        <li key={line.label}>— <span className="font-medium">{line.label}</span> : {line.value}</li>
                      ))}
                    </ul>
                    <Link href={`/travel-planning-form?destination=${params.slug}`} className="inline-flex px-5 py-2.5 rounded-full bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors">
                      Obtenir un cadrage sur mesure
                    </Link>
                  </article>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Bases dormir */}
        {meta?.bases && (
          <section className="bg-white section-spacing">
            <div className="container">
              <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">Où dormir : 3 bases pertinentes</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {meta.bases.map((base) => (
                  <article key={base.name} className="rounded-2xl border border-stone-200 p-6">
                    <h3 className="text-xl font-serif text-mahogany mb-2">{base.name}</h3>
                    <p className="text-sm text-charcoal/75 mb-4">{base.description}</p>
                    <a href={base.bookingUrl} target="_blank" rel="noreferrer noopener" className="text-eucalyptus font-semibold text-sm">
                      Voir les hébergements partenaires
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Itinéraire + Carte */}
        {meta?.itinerary && (
          <section className="bg-cloud-dancer section-spacing">
            <div className="container">
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
                <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8">
                  <h2 className="text-3xl font-serif text-mahogany mb-4">Itinéraire : version Heldonica</h2>
                  <p className="text-charcoal/75 text-sm mb-5">Sur mesure selon vos dates et contraintes — ceci est une base de départ.</p>
                  <ul className="space-y-3 text-charcoal/80 mb-6">
                    {meta.itinerary.map((day) => (
                      <li key={day.day}><span className="font-semibold text-mahogany">{day.day} :</span> {day.label}</li>
                    ))}
                  </ul>
                  <Link href={`/travel-planning-form?destination=${params.slug}`} className="inline-flex px-5 py-2.5 rounded-full bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors">
                    Adapter cet itinéraire à mes dates
                  </Link>
                </article>
                {meta.mapQuery && (
                  <aside className="rounded-2xl overflow-hidden border border-stone-200 bg-white">
                    <iframe
                      title={`Carte ${page.title}`}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(meta.mapQuery)}&output=embed`}
                      className="w-full h-[360px]"
                      loading="lazy"
                    />
                  </aside>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Contenu WordPress */}
        {safeContent && (
          <section className="bg-white section-spacing">
            <div className="container max-w-4xl">
              {meta?.intro && (
                <div className="mb-10 rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 px-6 py-6 md:px-8">
                  <p className="text-lg font-light leading-relaxed text-charcoal">{meta.intro}</p>
                </div>
              )}
              <EnhancedRichContent
                html={safeContent}
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:font-light prose-headings:text-mahogany
                  prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-3xl
                  prose-p:mb-6 prose-p:text-charcoal/80 prose-p:leading-8
                  prose-a:text-eucalyptus prose-a:no-underline hover:prose-a:underline
                  prose-img:mx-auto prose-img:my-10 prose-img:rounded-2xl prose-img:shadow-lg
                  prose-strong:text-charcoal prose-strong:font-semibold
                  prose-ul:space-y-3 prose-li:text-charcoal/80
                  prose-li:marker:text-eucalyptus"
              />
            </div>
          </section>
        )}

        {/* FAQ */}
        {meta?.faq && (
          <section className="bg-white section-spacing">
            <div className="container max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">FAQ {page.title}</h2>
              <div className="space-y-4">
                {meta.faq.map((item) => (
                  <details key={item.question} className="rounded-xl border border-stone-200 p-5 bg-cloud-dancer/40">
                    <summary className="font-semibold text-charcoal cursor-pointer">{item.question}</summary>
                    <p className="text-charcoal/75 text-sm mt-3 leading-relaxed">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Articles liés */}
        {related.length > 0 && (
          <section className="bg-white section-spacing">
            <div className="container">
              <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-2">À lire aussi</p>
              <h2 className="text-3xl font-serif text-mahogany mb-3">Carnets autour de {page.title}</h2>
              <p className="text-charcoal/70 text-sm leading-relaxed mb-8 max-w-2xl">
                Les articles qui prolongent la destination avec ce qu’on a vu, raté, retenu et vraiment traversé.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <article className="rounded-2xl border border-stone-200 overflow-hidden bg-cloud-dancer/40 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-1">
                      {post.image
                        ? <img src={post.image} alt={post.title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" width={400} height={176} />
                        : <div className="flex h-44 items-center justify-center bg-stone-100 text-sm text-charcoal/50">Carnet Heldonica</div>
                      }
                      <div className="p-5">
                        <span className="text-xs font-semibold text-eucalyptus uppercase tracking-[0.12em]">{post.category}</span>
                        <h3 className="mt-2 text-base font-semibold text-charcoal leading-snug group-hover:text-mahogany transition-colors">{post.title}</h3>
                        <p className="mt-3 text-xs text-charcoal/40">{post.date} · {post.readTime} min</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quiz */}
        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <SlowTravelQuiz />
          </div>
        </section>

        {/* CTA Planning */}
        <section className="bg-mahogany text-white section-spacing">
          <div className="container text-center max-w-3xl">
            <p className="text-sm uppercase tracking-[0.16em] text-teal mb-3">Voyage sur mesure</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Tu veux un carnet {meta?.planningLabel ?? page.title} conçu pour ton rythme ?
            </h2>
            <p className="text-white/80 mb-8">
              On transforme tes contraintes réelles — dates, budget, envies, énergie — en un itinéraire concret avec adresses testées et séquence logique.
            </p>
            <Link
              href={`/travel-planning-form?destination=${params.slug}`}
              className="inline-flex px-7 py-3 rounded-full bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
            >
              Démarrer ma demande {meta?.planningLabel ?? page.title}
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
