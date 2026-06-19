import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Faial Madère | Le village de montagne dans les nuages | Heldonica",
    description: "Faial, village perché à 900m dans les montagnes de Madère. Funiculaire, laurisilva, miel de bruyère et silence. L'authenticité montagnarde loin des circuits touristiques.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/faial' },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Ribeiro Frio', href: '/destinations/madere/ribeiro-frio' },
]

const pepites = [
  { 
    title: 'Le funiculaire de Monte', 
    description: 'Le Teleférico do Funchal, inauguré en 2010, permet de rejoindre Monte depuis le centre de Funchal en 15 minutes. Les cabines panoramiques offrent une vue imprenable sur la baie et les toits de la capitale madérienne. Monte, autrefois quartier des demeures aristocratiques, conserve son église Nossa Senhora do Monte où repose le dernier empereur du Brésil, Pierre II, mort en exil en 1891.', 
    icon: '🚡' 
  },
  { 
    title: 'Jardins de Monte', 
    description: 'Les jardins tropicaux autour de Monte abritent plus de 3 000 espèces de plantes exotiques. Le Jardin Botanique de Madère, créé en 1960, occupe 35 hectares avec des collections thématiques incluant des oiseaux exotiques, des cactus et des plantes médicinales. Le Jardin des Fleurs endémiques propose une promenade guidée à travers les espèces protégées de l\'archipel, certaines existant uniquement à Madère.', 
    icon: '☁️' 
  },
  { 
    title: 'La forêt de laurisilva', 
    description: 'Les pentes au-dessus de Faial sont couvertes de laurisilva, cette forêt subtropicale humide relicte du Tertiaire. Les troncs massifs des Ocotea foetens, appelés Til au local, peuvent atteindre 30 mètres de hauteur. La couche de mousse qui les recouvre absorbe jusqu\'à 10 fois son poids en eau, créant un écosystème unique où prolifèrent fougères arborescentes, champignons bioluminescents et orchidées sauvages.', 
    icon: '🌲' 
  },
  { 
    title: 'Apiculture traditionnelle', 
    description: 'Faial et ses environs comptent encore une dizaines d\'apiculteurs pratiquant l\'élevage traditionnel. Le miel de bruyère de Madère, protégé par une indication géographique depuis 1996, se distingue par sa texture gélatineuse et son goût puissant. La coopérative locale, fondée en 1987, rassemble 120 producteurs et produit annuellement environ 15 tonnes de miel, dont une partie est exportée vers le Portugal continental et l\'Europe.', 
    icon: '🍯' 
  },
]

export default function FaialPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Hidden Gem</span>
            <h1 className="text-4xl text-white font-serif">Faial</h1>
            <p className="text-stone-300">Le village de montagne où les nuages embrassent les crêtes</p>
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
              Faial représente l'un de ces villages de Madère où le temps semble suspendu. Perché à 900 mètres d'altitude sur les flancs du Pico do Areeiro, ce hameau de quelques centaines d'habitants offre une expérience radicalement différente de la frénésie côtière. Les maisons de pierre volcanique, aux toits de chaume ou de tuiles rouges, se confondent avec le paysage montagneux. La brume matinale enveloppe régulièrement le village, créant une atmosphère irréelle où les silhouettes des eucalyptus se découpent comme des fantômes.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              L'accès au village s'effectue depuis Ribeiro Frio par une route sinueuse traversant la laurisilva. Les amateurs de tranquillité y trouvent leur bonheur absolu : ruelles désertes, cafés de quartier où les anciens jouent aux cartes, et points de vue spectaculaires sur la vallée de Funchal en contrebas. Les producteurs de miel locaux perpétuent un savoir-faire apicole ancestral, récoltant chaque automne un miel de bruyère aux propriétés uniques, reconnu Indication Géographique Protégée depuis 1996.
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
            <p className="text-stone-700">Visitez Faial un matin de printemps lorsque la bruyère en fleurs recouvre les pentes voisines. Le dimanche, le café du village organise un déjeuner communautaire où les habitants partagent pain, fromage de chèvre et miel locaux. C'est l'occasion unique de plonger dans l'authenticité madérienne, loin des restaurants touristiques de Funchal. N'hésitez pas à demander votre chemin aux anciens : leur Hospitalité simplicité ne connaît aucune limite.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Madère</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}