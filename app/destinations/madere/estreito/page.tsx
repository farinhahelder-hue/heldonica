import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Estreito de Câmara de Lobos | Guide levadas et cascades Madère | Heldonica",
    description: "Estreito de Câmara de Lobos : la vallée secrète de Madère. Levadas spectaculaires, cascades impressionnantes et forêt de laurisilva. Randonnée inoubliable loin des sentiers battus.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/estreito' },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Câmara de Lobos', href: '/destinations/madere/camara-de-lobos' },
]

const pepites = [
  { 
    title: 'Levada do Furado et Levada Nova', 
    description: 'Ces deux levadas constituent le réseau le plus spectaculaire de Madère. La Levada Nova serpente à 900 mètres d\'altitude pendant 13 kilomètres à travers la laurisilva, cette forêt subtropicale humide classée au patrimoine mondial de l\'UNESCO depuis 1999. Le tunnel de 3 kilomètres creusé dans la roche volcanique offre une expérience unique, avec parfois de l\'eau jusqu\'aux chevilles. Prévoyez 3 à 4 heures pour la boucle complète.', 
    icon: '🌿' 
  },
  { 
    title: 'Cascata do Barreiro', 
    description: 'Cette cascade majestueuse de 100 mètres de hauteur se dresse au cœur de la vallée d\'Estreito. Accessible par un sentier qui longe la Levada do Norte, elle constitue le point d\'orgue d\'une randonnée mémorable. La puissance de l\'eau, particulièrement impressive après les pluies d\'hiver, crée un brouillard permanent au pied de la chute. L\'arc-en-ciel qui apparaît dans ce brouillard offre un spectacle naturel que peu de visiteurs de Madère découvrent.', 
    icon: '💦' 
  },
  { 
    title: 'Levada do Norte', 
    description: 'Cette levada historique, construite entre 1850 et 1870 pour transporter l\'eau des montagnes vers les cultures de la côte sud, traverse des paysages variés. Les points de vue sur la vallée de Estreito et la mer sont particulièrement spectaculaires. La partie entre Ribeiro Frio et Portela offre une randonnée de 2 heures avec un dénivelé positif modéré, adaptée aux marcheurs de niveau intermédiaire.', 
    icon: '⛰️' 
  },
  { 
    title: 'Laurisilva de Estreito', 
    description: 'La forêt de laurisilva couvrant les pentes au-dessus d\'Estreito représente l\'un des derniers vestiges de la forêt subtropicale humide qui couvrait l\'Europe méridionale il y a 15 millions d\'années. Les troncs couverts de mousse, les fougères arborescentes et le parfum intense des bruyères en fleurs créent une atmosphère féérique. Cette forêt primitive, antérieure aux dernières glaciations, abrite des espèces endémiques introuvables ailleurs sur la planète.', 
    icon: '🌲' 
  },
]

export default function EstreitoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Secret Gem</span>
            <h1 className="text-4xl text-white font-serif">Estreito de Câmara de Lobos</h1>
            <p className="text-stone-300">La vallée des levadas spectaculaires, des cascades et de la laurisilva primitive</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-stone-500 hover:text-amber-700">{l.label}</Link>
          ))}
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Estreito de Câmara de Lobos représente le sanctuaire des amoureux de la nature à Madère. Cette vallée encaissée, située à 400 mètres d'altitude dans le centre-nord de l'île, conserve des trésors naturels que les circuits touristiques ignorent largement. Les levadas qui serpentent sur ses flancs constituent un réseau hydraulique spectaculaire, conçu au XIXe siècle pour transporter l'eau des montagnes vers les cultures en contrebas.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La forêt de laurisilva qui recouvre les pentes d'Estreito constitue un patrimoine vivant unique au monde. Ces arbres centenaires, vestiges d'une forêt pré-glaciaire, créent un écosystème complexe abritant des oiseaux endémiques comme le pigeon de Madère et leorous noir. Les cascades qui naissent des falaises rocheuses complètent un tableau naturel d'une beauté sauvage, bien loin des jardins botaniques cultivés qui attirent la majorité des visiteurs.
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
            <p className="text-stone-700">Partez impérativement avant 8h30 du matin pour avoir les levadas pour vous seuls. Les groupes guidée commencent à arriver vers 10h et le parking devient vite saturé. Emportez des Chaussures de randonnée avec une bonne accroche, les sentiers glissants étant nombreux. La meilleure période court d'avril à juin lorsque les bruyères en fleurs tapissent le sous-bois de violet. En été, le tunnel de la Levada Nova peut être inondé après les orages.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Madère</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}