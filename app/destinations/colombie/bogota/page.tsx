import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Bogotá Colombie | Guide slow travel, Candelaria, grafitti, Monserrate | Heldonica",
    description: "Bogotá à 2600m d'altitude : Candelaria, musées de l'or, street art, Monserrate. Guide slow travel pour découvrir la capitale colombienne comme un local.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/colombie/bogota' },
  };
}

const pepites = [
  { 
    title: 'La Candelaria', 
    description: 'Le quartier historique de Bogotá, fondé en 1538 par Gonzalo Jiménez de Quesada, constitue le cœur colonial de la capitale. Ses rues pavées, bordées de maisons colorées aux balcons de fer forgé, racontent cinq siècles d\'histoire. La plaza de Bolívar, dominée par le Capitole national et flanquée de la cathédrale primée, accueille chaque dimanche des démonstrations de danses traditionnelles. Les murs couverts de graffitis monumentaux transforment les façades délabrées en galeries d\'art à ciel ouvert, œuvres de collectifs locaux comme Los Berraquero et JEF.',
    icon: '🎨' 
  },
  { 
    title: 'Musée de l\'Or (Museo del Oro)', 
    description: 'Ce muséeappartenantà la Banque de la République, abrite la plus grande collection d\'art précolombien au monde avec 34 000 pièces en or, turquoises et coquillages. Les salles thématiques présentent les trésors des cultures Muisca, Quimbaya, Calima et Tumaco, dont le célèbre Balsa Muisca, représentation de la légende de El Dorado. Le musée organise des démonstrations de travail de l\'or selon les techniques ancestrales.',
    icon: '🏛️' 
  },
  { 
    title: 'Monserrate', 
    description: 'Ce sommet de 3 152 mètres, accessible par teleférique ou funiculaire depuis le centre-ville, offre un panorama à 360 degrés sur Bogotá et les vallées environnantes. Le sanctuaire de Nuestra Señora de Monserrate, construit au choeur du XVIIe siècle, attire chaque année des milliers de pèlerins. Le sentier de randonnée de 4 kilomètres, traversant la páramo, cette écosystème de haute altitude unique aux Andes, permet d\'observer des espèces végétales endémiques comme les frailejones aux feuilles argentées.',
    icon: '🗿' 
  },
  { 
    title: 'Street Art et Grafiti', 
    description: 'Bogotá possède l\'une des scènes de street art les plus dynamiques d\'Amérique latine. Le quartier de la Candelaria, la carrera 7 et la calle 13 constituent les parcours officiels de graffitis autorisés. Des artistes internationaux comme Inti Castro, Blu et ROA ont réalisés des fresques monumentales sur les murs de brique rouge. Les visites guidées en español proposées par des collectifs d\'artistes permettent de comprendre les codes visuels et les messages politiques cachés derrière chaque œuvre.',
    icon: '🎭' 
  },
]

export default function BogotaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Colombie</span>
            <h1 className="text-4xl text-white font-serif">Bogotá</h1>
            <p className="text-stone-300">La capitale colombienne à 2 600 mètres d'altitude entre Andes et modernité</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/colombie" className="text-stone-500 hover:text-amber-700">Colombie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Bogotá, capitale de la République de Colombie, concentre sur ses hauteurs andines la diversité fascinante d'un pays aux multiples visages. Avec ses 8 millions d'habitants, la ciudad impose par son échelle et sa vitalité culturelle. La altitude de 2 640 mètres confère au climat une fraîcheur constante, permettant aux habitants de profiter des espaces extérieurs toute l'année. Cette caractéristique unique, combinée à une scène artistique florissante, fait de Bogotá une destination captivante pour les voyageurs en quête d'authenticité.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La ville se divise en plusieurs univers distincts. Le centre historique de la Candelaria conserve l'âme coloniale avec ses édifices religieux, ses places ombragées et ses échoppes d'antiquités. Le nord, autour de la Zona Rosa et de Parque 93, présente une autre facette : celle d'une metropolis moderne où gratte-ciel de verre abritent galeries d'art, restaurants gastronomiques et clubs branchés. Les comunas, ces quartiers populaires qui descendent les collines, offrent quant à elles l'immersion dans la vie quotidienne des Bogotanais.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-6 text-stone-800">Nos pépites</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pepites.map((p, i) => (
                <div key={i} className="p-6 bg-white rounded-lg border border-stone-200">
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-10 bg-gradient-to-r from-amber-50 to-stone-50 p-6 rounded-xl border border-amber-100">
            <h2 className="text-xl font-serif mb-4 text-stone-800">💡 Le secret de Heldonica</h2>
            <p className="text-stone-700">Pour découvrir le vrai Bogotá, prenez le temps de descendre la carrera 7 à pied depuis la Candelaria jusqu'au Parque de la Independencia. Ce parcours de 3 kilomètres traverse des quartiers aux ambiances contrastées où se mêlent misère et élégance. Arrêtez-vous dans une venta de emulate pour un aguapanela con queso, cette bebida traditionnelle qui réchauffe les soirées fraîches de la capitale. Le dimanche, la Jornada Continuous permet de profiter des cerramientas, ces brocantes qui investissent les avenues fermées à la circulation.</p>
          </section>
          <Link href="/destinations/colombie" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Colombie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}