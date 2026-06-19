import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Câmara de Lobos en couple : le village de pêcheurs authentique | Guide Heldonica",
    description: "Câmara de Lobos, le village de pêcheurs le plus authentique de Madère. Couleurs vives des bateaux, falaises impressionnantes et coucher de soleil inoubliable.",
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
      canonical: 'https://www.heldonica.fr/destinations/madere/camara-de-lobos'
    },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Cabo Girao', href: '/destinations/madere/cabo-girao' },
]

const pepites = [
  { 
    title: 'Port de Câmara de Lobos', 
    description: 'Les bateaux de pêche colorés qui se balancent doucement dans le port créent le plus beau tableau de Madère. Venez le matin pour voir les pêcheurs décharger la catch du jour.', 
    icon: '⚓' 
  },
  { 
    title: 'Miradouro de Câmara de Lobos', 
    description: 'Le point de vue emblématique offre une vue imprenable sur le village, le port et la falaise du Cabo Girao en arrière-plan. C\'est le spot parfait pour le coucher du soleil.', 
    icon: '🌅' 
  },
  { 
    title: 'Casa do Povo', 
    description: 'Cette ancienne école transformée en espace culturel organise parfois des expositions d\'art local. L\'architecture traditionnelle madérienne vaut le détour.', 
    icon: '🏛️' 
  },
  { 
    title: 'Praia Formosa', 
    description: 'La plage de galets noirs au pied des falaises. Moins fréquentée que celles de Funchal, elle offre un cadre sauvage pour se baigner loin des foules.', 
    icon: '🏖️' 
  },
]

const practicalInfo = {
  parking: 'Parking gratuit près du port, mais complet avant 10h en été',
  restaurants: 'Plusieurs restaurants de poisson frais le long du front de mer',
  bestTime: 'Matin pour l\'ambiance du port, soir pour le coucher de soleil',
  tip: 'Winston Churchill a peint ici en 1949. Une plaque commemorative au miradouro retrace sa visite.'
}

export default function CamaraPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Incontournable</span>
            <h1 className="text-4xl text-white font-serif">Câmara de Lobos</h1>
            <p className="text-stone-300">Le village de pêcheurs le plus authentique de Madère</p>
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
              <strong>Câmara de Lobos</strong> est le village de pêcheurs le plus authentique de Madère, 
              et celui qui a inspiré Winston Churchill lors de sa visite en 1949. L'artiste, émerveillé 
              par la beauté du lieu, y a passé plusieurs semaines à peindre les falaises vertigineuses 
              et les centaines de bateaux colorés qui dansent dans le port.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Aujourd'hui, le village conserve son âme traditionnelle malgré l'afflux de visiteurs. 
              Les pêcheurs repartent chaque matin en mer et reviennent avec des thons, espadons et 
              sardines qui finiront dans les assiettes des restaurants locaux.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-6 text-stone-800">Nos pépites à Câmara de Lobos</h2>
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

          <section className="mb-10 bg-gradient-to-r from-amber-50 to-stone-50 p-6 rounded-xl border border-amber-100">
            <h2 className="text-xl font-serif mb-4 text-stone-800">💡 Le secret de Heldonica</h2>
            <p className="text-stone-700 mb-4">
              Le meilleur bolo do caco de Madère se mange au petit bar près du port, 
              là où les pêcheurs eux-mêmes prennent leur café. Demandez le барко 
              com manteiga de alho — du pain typique avec de l'ail, simplement délicieux.
            </p>
            <p className="text-stone-700">
              Pour les fotos, positionnez-vous au miradouro au coucher du soleil. 
              La lumière orange qui frappe les falaises du Cabo Girao crée un spectacle inoubliable.
            </p>
          </section>

          <section className="mb-10 p-5 bg-white rounded-lg border border-stone-200">
            <h2 className="text-xl font-serif mb-4 text-stone-800">📋 Pratiquement</h2>
            <div className="space-y-3 text-sm">
              <div><strong className="text-stone-700">Parking :</strong> <span className="text-stone-600">{practicalInfo.parking}</span></div>
              <div><strong className="text-stone-700">Restaurants :</strong> <span className="text-stone-600">{practicalInfo.restaurants}</span></div>
              <div><strong className="text-stone-700">Mejor moment :</strong> <span className="text-stone-600">{practicalInfo.bestTime}</span></div>
              <div><strong className="text-stone-700">Histoire :</strong> <span className="text-stone-600">{practicalInfo.tip}</span></div>
            </div>
          </section>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">
              ← Retour à Madère
            </Link>
            <Link href="/destinations/madere/cabo-girao" className="text-stone-600 hover:text-stone-800 font-medium">
              Cabo Girao →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}