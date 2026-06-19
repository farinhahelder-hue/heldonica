import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Ponta do Sol en couple : le bout du monde à Madère | Guide Heldonica",
    description: "Ponta do Sol, à l'extrémité sud de Madère : phare emblématique, jetée panoramique et maisons blanches. Notre guide pour découvrir ce village méconnu du bout du monde.",
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
      canonical: 'https://www.heldonica.fr/destinations/madere/ponta-do-sol'
    },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Porto Moniz', href: '/destinations/madere/porto-moniz' },
]

const pepites = [
  { 
    title: 'Phare de Ponta do Sol', 
    description: 'Ce phare rouge et blanc au bout de la péninsule offre une vue à 360° sur l\'océan. Construit en 1861, il marque le point le plus au sud de Madère.', 
    icon: '🚦' 
  },
  { 
    title: 'Jetée panoramique', 
    description: 'Une longue jetée de pierre s\'avance dans l\'océan, parfaite pour admirer le lever ou le coucher du soleil. C\'est l'endroit le plus photogénique de Madère.', 
    icon: '🌊' 
  },
  { 
    title: 'Maisons blanches traditionnelles', 
    description: 'Le village est parsemé de petites maisons blanches aux volets colorés qui créent un décor mediterranéen charmant. Parfait pour une balade photographique.', 
    icon: '🏡' 
  },
  { 
    title: 'Point de coucher de soleil', 
    description: 'Face à l'Atlantique, sans obstacle à l'horizon, c'est l'un des meilleurs spots de Madère pour regarder le soleil disparaître dans la mer.', 
    icon: '🌅' 
  },
]

export default function PontaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Spot Secret</span>
            <h1 className="text-4xl text-white font-serif">Ponta do Sol</h1>
            <p className="text-stone-300">Le bout du monde à Madère</p>
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
              <strong>Ponta do Sol</strong> signifie littéralement "pointe du soleil" en portugais, et ce nom 
              parfaitement choisi décrit mieux que tout ce village niché à l'extrémité sud de Madère. 
              C'est ici que le soleil se lève sur l'île, baignant les falaises de lumière dorée dès les premières heures du jour.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Contrairement aux villages touristiques de la côte sud, Ponta do Sol a préservé son authenticité. 
              Les maisons blanches aux volets colorés, le phare rouge et blanc centenaire, et la longue jetée 
              de pierre qui s'avance dans l'océan créent un cadre idyllique pour les couples en quête de calme 
              et de romantisme.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-6 text-stone-800">Nos pépites</h2>
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
              Le petit café au bout de la jetée sert le meilleur café de Madère avec une vue imprenable 
              sur l'Atlantique. Asseyez-vous en terrasse et commandez un galão — ce café latte portugais 
              — tout en regardant les vagues se briser sur les rochers en contrebas.
            </p>
            <p className="text-stone-700">
              Pour les photos parfaites, venez 30 minutes avant le coucher du soleil. La lumière orange 
              sur le phare rouge et blanc est absolument magique.
            </p>
          </section>

          <section className="mb-10 p-5 bg-white rounded-lg border border-stone-200">
            <h2 className="text-xl font-serif mb-4 text-stone-800">📋 Pratiquement</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><strong className="text-stone-700">Accès :</strong> <span className="text-stone-600">25 min en voiture de Funchal vers le sud</span></div>
              <div><strong className="text-stone-700">Parking :</strong> <span className="text-stone-600">Gratuit au village</span></div>
              <div><strong className="text-stone-700"> Meilleur moment :</strong> <span className="text-stone-600">Coucher de soleil</span></div>
              <div><strong className="text-stone-700">Durée :</strong> <span className="text-stone-600">2-3 heures</span></div>
            </div>
          </section>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">
              ← Retour à Madère
            </Link>
            <Link href="/destinations/madere/porto-moniz" className="text-stone-600 hover:text-stone-800 font-medium">
              Porto Moniz →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}