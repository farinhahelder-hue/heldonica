import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Cabo Girao en couple : la falaise vertigineuse de Madère | Guide Heldonica",
    description: "Cabo Girao, la plus haute falaise d'Europe avec ses 580m à pic sur l'océan Atlantique. Notre guide pour une visite inoubliable de ce site époustouflant.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: {
      card: "summary_large_image"
    },
    alternates: {
      canonical: 'https://www.heldonica.fr/destinations/madere/cabo-girao'
    },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Câmara de Lobos', href: '/destinations/madere/camara-de-lobos' },
]

const pepites = [
  { 
    title: 'Belvédère principal', 
    description: 'La plateforme panoramique suspendue au-dessus du vide offre une vue vertigineuse sur les 580m de falaise directe. Le sol en verre vous permet de voir le fond de la vallée — pas pour les sujets au vertige !', 
    icon: '🪨' 
  },
  { 
    title: 'Église de Nossa Senhora do Pilar', 
    description: 'Cette petite chapelle blanche au bord du précipice date du 17e siècle. Un lieu de paix avec une vue extraordinaire sur la côte sud de Madère.', 
    icon: '⛪' 
  },
  { 
    title: 'Village de Faial en contrebas', 
    description: 'Accessible par un escalier de 1500 marches, ce village de montagne preserve un mode de vie traditionnel. Les terrasses de vignobles produisent le célèbre vinho verde local.', 
    icon: '🏘️' 
  },
  { 
    title: 'Points photo secrets', 
    description: 'Contournez la plateforme principale vers l\'est pour découvrir des points de vue moins fréquentés avec une luminosité matinale parfaite.', 
    icon: '📸' 
  },
]

const cafes = [
  { name: 'Skybar Cabo Girao', specialty: 'Cocktails au coucher du soleil', price: '€€' },
  { name: 'Café do Cabo', specialty: 'Café portugais et pastedéis', price: '€' },
]

export default function CaboGiraoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">🌟 Incontournable</span>
            <h1 className="text-4xl text-white font-serif">Cabo Girao</h1>
            <p className="text-stone-300">La plus haute falaise d'Europe à pic sur l'Atlantique</p>
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
              <strong>Cabo Girao</strong> est l'une des attractions naturelles les plus spectaculaires d'Europe. 
              Cette falaise de 580 mètres de hauteur verticale — la plus haute d'Europe et la deuxième du monde — 
              plonge directement dans l'océan Atlantique, créant un spectacle naturel à couper le souffle.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Une plateforme panoramique avec un sol en verre a été installée au sommet, permettant aux visiteurs 
              de marcher au-dessus du vide et de contempler la vallée en contrebas. L'effet est saisissant, 
              surtout au lever ou au coucher du soleil quand la lumière orange embrase les parois rocheuses.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-6 text-stone-800">Nos pépites à Cabo Girão</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pepites.map((p, i) => (
                <div key={i} className="p-5 bg-white rounded-lg border border-stone-200 hover:border-amber-300 transition-colors">
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <h3 className="font-serif text-lg mb-2 text-stone-800">{p.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg mb-3 text-stone-800">☕ Les cafés</h3>
              <ul className="text-sm text-stone-600 space-y-2">
                {cafes.map((c, i) => (
                  <li key={i}><strong>{c.name}:</strong> {c.specialty} ({c.price})</li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="font-serif text-lg mb-3 text-stone-800">💡 Notre conseil</h3>
              <p className="text-sm text-stone-700">
                Venez soit à l'ouverture (9h) soit en fin d'après-midi. Entre 11h et 15h, 
                les bus de touristes envahissent le site. Le skybar offre les meilleurs couchers de soleil.
              </p>
            </div>
          </section>

          <section className="mb-8 p-5 bg-white rounded-lg border border-stone-200">
            <h2 className="text-xl font-serif mb-4 text-stone-800">🚗 Depuis Funchal</h2>
            <p className="text-sm text-stone-600">
              20 minutes en voiture vers l'ouest de Funchal. Route panoramique magnifique. 
              Parking gratuit sur place mais complet en haute saison. Bus linea 115 depuis Funchal.
            </p>
          </section>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">
              ← Retour à Madère
            </Link>
            <Link href="/destinations/madere/camara-de-lobos" className="text-stone-600 hover:text-stone-800 font-medium">
              ← Câmara de Lobos
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}