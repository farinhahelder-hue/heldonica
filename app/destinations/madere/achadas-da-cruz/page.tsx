import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Achadas da Cruz en couple : le funiculaire à pic | Guide Heldonica",
    description: "Le funiculaire vertigineux d'Achadas da Cruz : 1000m de chute verticale sur les falaises de Madère. Notre guide complet pour une visite réussie.",
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
      canonical: 'https://www.heldonica.fr/destinations/madere/achadas-da-cruz'
    },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Porto Moniz', href: '/destinations/madere/porto-moniz' },
]

const pepites = [
  { 
    title: 'Funiculaire des Achadas', 
    description: 'Ce funiculaire suisse plonge à pic dans la vallée sur plus de 1000m. Une expérience unique à Madère, réservée aux visiteurs téméraires.', 
    icon: '🚡' 
  },
  { 
    title: 'Village de Fajã da Quebrada', 
    description: 'Au bout de la ligne, ce village de pêcheurs isolé offre une atmosphère d\'un autre temps. Rares sont les touristes à s\'y aventurer.', 
    icon: '🏘️' 
  },
  { 
    title: 'Levada do Norte', 
    description: 'Le sentier des levadas serpente entre les terrasses cultivées et les ravins. Une balade nature loin des sentiers battus.', 
    icon: '🌿' 
  },
  { 
    title: 'Point de vue Pico da Cruz', 
    description: 'À 800m d\'altitude, la vue panoramique sur la côte nord et l\'océan Atlantique laisse sans voix.', 
    icon: '🏔️' 
  },
]

const practicalInfo = {
  price: 'Funiculaire : environ 15€ A/R par personne',
  duration: 'Comptez 2 à 3 heures pour la visite complète',
  bestTime: 'Matin tôt ou fin d\'après-midi pour éviter les groupes',
  access: 'Route sinueuse depuis São Vicente. Pas de bus publics directs.'
}

export default function AchadasPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Spot Rare</span>
            <h1 className="text-4xl text-white font-serif">Achadas da Cruz</h1>
            <p className="text-stone-300">Le funiculaire vertigineux de Madère</p>
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
              <strong>Achadas da Cruz</strong> est l'un des secrets les mieux gardés de Madère. 
              Ce petit village suspendu au-dessus de l'océan Atlantique se reached uniquement 
              par un funiculaire suisse qui plonge dans le vide sur plus de 1000 mètres de chute verticale.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Le voyage aller-retour en funiculaire est déjà une aventure en soi. Mais une fois en bas, 
              le village de Fajã da Quebrada vous transporte dans une autre époque, celle des villages 
              de pêcheurs isolés où le temps semble s'être arrêté.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-6 text-stone-800">Nos pépites à Achadas da Cruz</h2>
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
            <h2 className="text-xl font-serif mb-4 text-stone-800">💡 Notre conseil</h2>
            <p className="text-stone-700 mb-4">
              Partez impérativement le matin. Non seulement la lumière est meilleure pour les photos, 
              mais le village reprend son calme vers 14h quand les bus de touristes repartent.
            </p>
            <p className="text-stone-700">
              Emportez de l'eau et des chaussures de marche. Le sentier des levadas demande 
              1h30 à 2h de marche, avec des passages étroits au-dessus du vide.
            </p>
          </section>

          <section className="mb-10 p-5 bg-white rounded-lg border border-stone-200">
            <h2 className="text-xl font-serif mb-4 text-stone-800">📋 Pratiquement</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><strong className="text-stone-700">Prix :</strong> <span className="text-stone-600">{practicalInfo.price}</span></div>
              <div><strong className="text-stone-700">Durée :</strong> <span className="text-stone-600">{practicalInfo.duration}</span></div>
              <div><strong className="text-stone-700">Mejor moment :</strong> <span className="text-stone-600">{practicalInfo.bestTime}</span></div>
              <div><strong className="text-stone-700">Accès :</strong> <span className="text-stone-600">{practicalInfo.access}</span></div>
            </div>
          </section>

          <section className="mb-8 p-5 bg-red-50 rounded-lg border border-red-100">
            <h3 className="font-serif mb-2 text-red-800">⚠️ Précautions</h3>
            <p className="text-sm text-red-700">
              Par vent fort, le funiculaire peut être suspendu pour raisons de sécurité. 
              Vérifiez la météo avant de vous déplacer. Enfants en bas âge non recommandés 
              pour les randonnées sur les levadas.
            </p>
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