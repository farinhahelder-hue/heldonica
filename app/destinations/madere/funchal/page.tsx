import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const faqFunchalSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Que faire à Funchal ?", "acceptedAnswer": { "@type": "Answer", "text": "Marché des travailleurs, vieille ville colorée, Téléférique du Palais, jardins botaniques." }},
    { "@type": "Question", "name": "Où manger à Funchal ?", "acceptedAnswer": { "@type": "Answer", "text": "Mercado dos Ladários pour poisson grillé, rue de Santa Maria pour l'atmosphère." }},
    { "@type": "Question", "name": "Transport à Funchal ?", "acceptedAnswer": { "@type": "Answer", "text": "Bus ASTA dépasse marché central. Téléférique pour Monte depuis le centre." }}
  ]
};

export function generateMetadata(): Metadata {
  return {
    title: "Funchal Madère | Guide slow travel capitale, vieille ville, teleférique | Heldonica",
    description: "Funchal, capitale de Madère : vieille ville colorée, Mercado dos Lavradores, teleférique vers Monte, vignobles de Santana. Guide complet slow travel pour 2-3 jours.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/funchal' },
  };
}

const pepites = [
  {
    title: 'Mercado dos Lavradores',
    description: 'Le marché couvert municipal, inauguré en 1940, constitue le cœur battant de Funchal. Les étals regorgent de fruits tropicaux : bananes dorées, ananas, goyaves, fruits de la passion et mangues s\'entassent dans une explosion de couleurs. Le rez-de-chaussée accueille les poissonniers aux poissons iridescents, tandis que l\'étage supérieur présente fleurs, plantes et épices. Arrivez avant 10h pour découvrir le marché dans son authenticité, avant l\'arrivée des cars de touristes.',
    icon: '🍊',
  },
  {
    title: 'Zona Velha (Vieille Ville)',
    description: 'Le quartier historique de Funchal, appelé Zona Velha, s\'étend autour de la rue de Santa Maria. Ses ruelles pavées, bordées de maisons aux volets colorés, abritent des galeries d\'art, des ateliers de poterie et des restaurants où les locaux prennent leur café du matin. La rue de Santa Maria, piétonne depuis 2011, fut décorée de 200 portes peintes par des artistes locaux : chaque panneau raconte une scène de l\'histoire de Madère.',
    icon: '🚶',
  },
  {
    title: 'Teleférico do Funchal',
    description: 'Le teleférique reliant Funchal à Monte, inauguré en 2010, parcourt 3 200 mètres en 15 minutes de montée. Les cabines panoramiques offrent des vues spectaculaires sur la baie, le port de croisière et les toits de la ville. Monte, quartier historique des demeures aristocratiques, conserve son église Nossa Senhora do Monte où repose l\'empereur du Brésil Pierre II, mort en exil en 1891.',
    icon: '🚡',
  },
  {
    title: 'Jardins et promenades',
    description: 'Funchal justifie son surnom de « ville-jardin » par ses espaces verts entretenus avec soin. Le Jardin Botanique de 35 hectares présente plus de 3 000 espèces de plantes subtropicales. Le Jardin Tropical Monte Palace, véritable palais des expos, expose des collections de plantes aquatiques, des arbres centenaires et une mine d\'or africaine reconvertie en jardin. Le long de l\'Avenida do Infante, les promenades ombragées invitent à la flânerie.',
    icon: '🌺',
  },
]

const navLinks = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Portugal', href: '/destinations/portugal' },
  { label: 'Madère', href: '/destinations/madere' },
]

export default function FunchalPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqFunchalSchema) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Madère
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Funchal et ses environs
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              La capitale de Madère : marchés, vieille ville colorée et vues panoramiques depuis Monte
            </p>
          </div>
        </section>

        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-stone-500 hover:text-amber-700">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Funchal, capitale de Madère depuis 1508, accueille chaque année plus d'un million de visiteurs, dont 400 000 croisiéristes qui débarquent au port pour quelques heures. Cette affluence massive pourrait rebuter, mais la ville révèle ses trésors à qui prend le temps de s'écarter des sentiers battus. Derrière les devantures touristiques du front de mer, la ville authentique perdure : les quartiers résidentiels où les femmes étendent leur linge aux balcons, les marchés de quartier et les cafés où les hommes lisent leur journal en sirotant un bica, l'expresso local.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Deux à trois jours suffisent pour découvrir Funchal et ses environs immédiats. Le premier jour, explorez la vieille ville et le marché des travailleurs le matin, avant de monter en teleférique vers Monte dans l'après-midi. Le deuxième jour, visittez les jardins botaniques ou le Monte Palace, puis descendez vers Camacha pour découvrir la fabrication des paniers en osier qui fit la réputation de ce village. Le troisième jour, déplacez-vous vers Santana pour ses maisons traditionnelles typiques ou vers Curral das Freiras, ce village niché au cœur d'un cratère inaccessible par la mer.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Nos pépites
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {pepites.map((pepite, idx) => (
                <div key={idx} className="p-6 bg-white rounded-lg border border-stone-200">
                  <div className="text-2xl mb-3">{pepite.icon}</div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">
                    {pepite.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {pepite.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10 bg-gradient-to-r from-amber-50 to-stone-50 p-6 rounded-xl border border-amber-100">
            <h2 className="text-xl font-serif mb-4 text-stone-800">💡 Le secret de Heldonica</h2>
            <p className="text-stone-700">Pour vivre Funchal comme un local, oubliez les restaurants du front de mer et foncez vers la rue de Santa Maria le vendredi soir, jour du marché nocturne. Les producteurs locaux vendent fromage de chèvre, chorizo fumé, miel de bruyère et vin de Madère sous des lanternes colorées. Goûtez le lapas, ces patelles grillées à l'ail et au citron, et terminez par une bola de melancia, ce gâteau à la pastèque signature de l'île. Le dimanche matin, assistez à la procession de l'église do Carmo : les fidèles en costume traditionnel traversent les rues pavées au rythme des hymns.</p>
          </section>

          <section className="mb-12">
            <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">
              ← Retour Madère
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}