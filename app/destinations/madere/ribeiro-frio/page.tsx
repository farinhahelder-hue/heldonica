import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Ribeiro Frio Madère | Centre montagne et levadas dans la laurisilva | Heldonica",
    description: "Ribeiro Frio à 860m d'altitude : le cœur montagneux de Madère. Levadas spectaculaires, truites d'élevage, Balcões et Portela. La forêt primitive de laurisilva au quotidien.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/ribeiro-frio' },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Funchal', href: '/destinations/madere/funchal' },
]

const pepites = [
  { 
    title: 'Levada do Furado', 
    description: 'Cette levada de 13 kilomètres relie Ribeiro Frio à Quehudas à travers la laurisilva. Le tunnel de 900 mètres creusé dans la roche volcanique constitue le point fort de la randonnée, avec parfois de l\'eau jusqu\'aux genoux. La marche complète prend 4 à 5 heures aller-retour. Le sentier, balisé et sécurisé, offre des vues constantes sur la forêt primitive avec ses fougères géantes et ses troncs couverts de mousse.', 
    icon: '🌿' 
  },
  { 
    title: 'Miradouro do Balcões', 
    description: 'Ce belvédère emblématique de Madère offre une vue spectaculaire sur la vallée de Funchal et les massifs environnants. Accessible en 30 minutes de marche depuis Ribeiro Frio, il permet d\'observer le pigeon de Madère (Columba trocaz) et le roitelet à front d\'or (Regulus ignicapilla), deux espèces endémiques de l\'archipel. Le matin, avant 9h, le silence et la brume matinale créent une atmosphère féérique.', 
    icon: '⛰️' 
  },
  { 
    title: 'Centre d\'élevage de truites', 
    description: 'La station piscicole de Ribeiro Frio, gérée par le service des forêts de Madère, élève des truites arc-en-ciel dans des bassins alimentés par les eaux cristallines des sources locales. Ouverte au public, elle permet d\'observer les poissons et d\'acheter de la truite fraîche ou fumée. Le restaurant adjacent propose une cuisine simple basée sur le poisson d\'eau douce, accompagnée de pommes de terre locales et de légumes du jardin.', 
    icon: '🐟' 
  },
  { 
    title: 'Portela et le plateau central', 
    description: 'Le village de Portela, accessible en 30 minutes de marche depuis Ribeiro Frio par un sentier panoramique, offre une immersion dans la vie traditionnelle de la montagne madérienne. Les anciennes cultures en terrasses, aujourd\'hui en partie abandonnées, témoignent d\'une agriculture de subsistance qui fit la richesse de ces hauteurs. Le café local, avec ses géraniums aux fenêtres et son patron taciturne, incarne l\'hospitalité simple de ces villages.', 
    icon: '🏘️' 
  },
]

export default function RibeiroFrioPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">Madère</span>
            <h1 className="text-4xl text-white font-serif">Ribeiro Frio</h1>
            <p className="text-stone-300">Le cœur montagneux de Madère : levadas, laurisilva et villages silencieux</p>
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
              Ribeiro Frio, littéralement la « rivière froide », occupe une position stratégique au centre de Madère, à 860 mètres d'altitude. Cette station de montagne, véritable porte d'entrée vers la laurisilva, attire les amateurs de nature et de randonnée depuis le XIXe siècle. Les sources qui jaillissent des flancs du Pico do Areeiro alimentent un réseau de levadas qui serpente à travers la forêt primitive, offrant des itinéraires adaptés à tous les niveaux de marcheurs.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Le village lui-même conserve une ambiance surannée, avec ses maisons de pierre volcanique aux toits de chaume ou de tuiles mécaniques. Le restaurant familial, le poste de secours de la protection civile et le centre d'élevage de truites constituent les seuls services disponibles. L'absence totale de commerces touristiques et la présence d'un restaurant unique où les locals viennent jouer aux cartes le dimanche créent une atmosphère d'authenticité rare sur une île de plus en plus tournée vers le tourisme de masse.
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
            <p className="text-stone-700">Le meilleur moment pour visiter Ribeiro Frio se situe entre mai et juillet, lorsque la bruyère en fleurs recouvre les sous-bois de violet et que les matinées offrent des vues dégagées sur la mer de nuages. Partez impérativement avant 8h pour avoir le Balcões pour vous seuls : les cars de touristes commencent à arriver vers 9h30. Emportez des vêtements de pluie même par temps ensoleillé, les averses brutales étant fréquentes l'après-midi. Le restaurant de la station piscicole, ouvert tous les jours, propose un déjeuner simple mais excellent : truite grillée avec pommes de terre sautées et salade verte.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Madère</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}