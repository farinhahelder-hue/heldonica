import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Côte Est Madère | Guide slow travel Machico, Caniçal, Ponta de São Lourenço | Heldonica",
    description: "Découvrez la côte est de Madère : Machico, Caniçal, Ponta de São Lourenço. Plages de galets, falaises spectaculaires, et la réserve naturelle de la péninsule.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/cote-est' },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Funchal', href: '/destinations/madere/funchal' },
]

const pepites = [
  { 
    title: 'Ponta de São Lourenço', 
    description: 'La péninsule de 8 km offre des paysages lunaires uniques à Madère. Les falaises rouges et ocre contrastent avec l\'océan Atlantique. La randonnée aller-retour prend 2h30 et traverse cette réserve naturelle protégée depuis 1982. Le vent y est souvent présent, rappel constant que vous êtes à l\'extrémité orientale de l\'Atlantique.', 
    icon: '🏝️' 
  },
  { 
    title: 'Machico', 
    description: 'Deuxième ville de Madère avec 25 000 habitants. Fondée en 1419 par João Gonçalves Zarco, elle précède Funchal de deux ans. La plage de galets noirs, protégée par une digue artificielle, offre un bain de soleil typique portugais. Le quartier historique conserve des ruelles pavées et une atmosphère portuaire authentique, loin des circuits touristiques de la capitale.', 
    icon: '🏖️' 
  },
  { 
    title: 'Caniçal et le port de pêche', 
    description: 'Ce village de 3 000 habitants vit de la pêche au thon et de l\'élevage dethon. Les dauphins fréquents les eaux proches attirent parfois des excursions depuis le port. Le Musée de la Baleine retrace l\'histoire de la chasse baleinière qui fit la richesse de la région jusqu\'en 1981. Le restaurant local propose du poisson grillé directement sorti des filets des pêcheurs.', 
    icon: '🐬' 
  },
  { 
    title: 'Aéroport de Madère (CR7)', 
    description: 'L\'aéroport international de Madère, rebaptisé Cristiano Ronaldo en 2017, figure parmi les plus spectaculaires au monde. Sa piste de 2 800 mètres, soutenue par 180 pylônes, a nécessité 5 ans de travaux et fut inaugurée en 2000. Les atterrissages face à l\'océan offrent un spectacle inoubliable. Le nouveau terminal, inauguré en 2016, a doublé la capacité de l\'infrastructure.', 
    icon: '✈️' 
  },
]

export default function CoteEstPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">Madère</span>
            <h1 className="text-4xl text-white font-serif">Côte Est</h1>
            <p className="text-stone-300">Machico, Caniçal, la côte sauvage et la réserve naturelle de Ponta de São Lourenço</p>
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
              La côte est de Madère représente le territoire le plus méconnu de l'île. Là où l'ouest attire les foules vers Porto Moniz et ses piscines naturelles, cette façade atlantique conserve une authenticité préservée. Les plages de galets noirs volcanicushésitant entre le basalte et l'obsidienne, les falaises ocre striées de rouge, et les villages de pêcheurs où le temps semble suspendu constituent l'essence même de Madère traditionnelle.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              L'arrivée à Madère par l'est offre un premier aperçu saisissant. L'aéroport de Cristiano Ronaldo, construit sur un plateau vertigineux au-dessus de l'océan, impressionne par son audace architecturale. Les visiteurs découvrent ensuite Machico, deuxième agglomération de l'île, blottie dans une baie protectrice. Plus au nord, Caniçal demeure le sanctuaire des amateurs de poisson frais et d'observations de cétacés. Enfin, la péninsule de Ponta de São Lourenço, réserve naturelle depuis 1982, constitue l'indispensable excursion de la côte est avec ses paysages qui n'ont aucun équivalent sur l'île.
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
            <p className="text-stone-700">Prévoyez une journée entière pour la côte est. Partez tôt le matin vers Caniçal pour le petit déjeuner au port avec les pêcheurs. Ensuite, longez la côte nord vers Machico en vous arrêtant aux points de vue. Terminez l'après-midi par la randonnée de Ponta de São Lourenço, mais partez avant 14h pour éviter le vent qui se lève généralement en fin d'après-midi. Les couchers de soleil depuis la péninsule offrent des teintes orangées spectaculaires sur l'océan.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Madère</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}