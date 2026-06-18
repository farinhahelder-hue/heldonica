import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Portela Madère | Village panoramique entre Ribeiro Frio et la forêt | Heldonica",
    description: "Portela, village perché à 650m avec vue à 360° sur Madère. Sentiers de laurisilva, cimetières fleuris et eucalyptus centenaires. L'authenticité préservée du centre de l'île.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/portela' },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Ribeiro Frio', href: '/destinations/madere/ribeiro-frio' },
]

const pepites = [
  { 
    title: 'Miradouro de Portela', 
    description: 'Ce point de vue remarquable offre un panorama à 360 degrés sur le centre de Madère. D\'un côté, la vallée de Funchal s\'étale jusqu\'à l\'océan Atlantique ; de l\'autre, les crêtes du Pico do Areeiro et du Pico Ruivo se découpent contre le ciel. Le matin, la brume qui remonte des vallées crée un effet de mer de nuages particulièrement photogénique. Le crépuscule transforme le paysage en une palette de couleurs chaudes, avec les lumières de Funchal qui s\'allument en contrebas.', 
    icon: '🌄' 
  },
  { 
    title: 'Église Nossa Senhora da Conceição', 
    description: 'Cette église de plain-pied, construite au XVIe siècle, incarne l\'architecture religieuse traditionnelle de Madère. La façade de pierre volcanique, sobre mais élégante, s\'ouvre sur un intérieur richement décoré de retables baroques dorés. Le saint patron du village, honoré chaque année lors de la fête patronale en août, attire les habitants des villages environnants pour une procession fleurie qui traverse les ruelles pavées.', 
    icon: '⛪' 
  },
  { 
    title: 'Sentier vers Ribeiro Frio', 
    description: 'La Levada do Furado traverse le plateau entre Portela et Ribeiro Frio sur 3 kilomètres. Cette randonnée de 1h30 traverse une forêt de laurisilva où les fougères arborescentes atteignent 4 mètres de hauteur. Le sentier, damé et sécurisé par des gardes-fous en bois, convient aux marcheurs de tous niveaux. Les points de vue sur les cultures en terrasses abandonnées rappellent l\'époque où ces pentes nourrissaient des centaines de familles.', 
    icon: '🌳' 
  },
  { 
    title: 'Cimetière de Portela', 
    description: 'Le petit cimetière surplombe le village depuis une crête rocheuse. Les tombes traditionnelles madériennes, ornées de carrelages colorés représentant des scènes bibliques, témoignent d\'un artisanat local qui disparaît. En mai et novembre, les chrysanthèmes sauvages et les bruyères en fleurs parent les sépultures d\'une élégance naturelle. Les allées fleuries de jacaranda, dont les pétales violets tapissent le sol au printemps, créent une atmosphère sereine.', 
    icon: '🪦' 
  },
]

export default function PortelaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Secret Gem</span>
            <h1 className="text-4xl text-white font-serif">Portela</h1>
            <p className="text-stone-300">Le village où la brume des montagnes rencontre la lumière de l'Atlantique</p>
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
              Portela incarne cette Madère secrète que les guides touristiques négligent délibérément. À 650 mètres d'altitude, ce village de quelques dizaines de foyers occupe un balcon naturel suspendu entre deux mondes : la forêt dense des montagnes et la vaste étendue de l'océan. Les maisons de construction modeste, aux volets colorés défraîchis par les embruns et le temps, semblent avoir poussé organiquement du sol volcanique, comme si la nature elle-même les avait placées là pour qu'elles surveillent le paysage.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La vie à Portela suit le rythme immuable des saisons et des travaux agricoles. Au printemps, les femmes cueillent les asperges sauvages sur les versants exposés au sud. En été, les hommes harvestent le raisin des petites parcelles qui subsistent sur les terrasses millénaires. L'automne voit les champignons apparaître dans les sous-bois de laurisilva, convoités par les cuisiniers des restaurants familiaux qui préparent des plats traditionnels à base de champignons sautés à l'ail et au persil. L'hiver enfin, apporte la pluie qui alimente les levadas et fait reverdir les pentes brûlées par le soleil d'été.
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
            <p className="text-stone-700">Venez à Portela pour le coucher du soleil un soir de printemps ou d'automne. Installez-vous au miradouro avec un pique-nique préparé au village : pain frais, fromage de chèvre, tomatoes cerises et un verre de vinho verde regional. Les lumières de Funchal qui s'allument graduellement en contrebas, le rouge orangé du soleil qui embrase les crêtes, et le silence ponctué uniquement par le chant des oiseaux créent un moment d'émotion pure. Restez encore 20 minutes après le coucher du soleil : le ciel se pare alors de nuances indigo qui resteront gravées dans votre mémoire.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Madère</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}