import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Porto Moniz en couple : piscines naturelles de lave | Guide Heldonica",
    description: "Porto Moniz, au nord-ouest de Madère : les fameuses piscines naturelles de lave, la plage de Seixal et les paysages épiques de la côte nord. Notre guide complet.",
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
      canonical: 'https://www.heldonica.fr/destinations/madere/porto-moniz'
    },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'São Vicente', href: '/destinations/madere/sao-vicente' },
]

const pepites = [
  { 
    title: 'Piscines Naturelles de Lave', 
    description: 'Des bassins naturels creusés dans la roche volcanique noire, remplis d\'eau cristalline de l\'Atlantique. L\'une des expériences les plus uniques de Madère. Entrée payante (8€/pers).', 
    icon: '🏊' 
  },
  { 
    title: 'Plage de Seixal', 
    description: 'La seule vraie plage de sable noir volcanique de Madère. Sauvage et authentique, elle est parfaite pour se baigner loin des piscines bondées en été.', 
    icon: '🏖️' 
  },
  { 
    title: 'Reserva Maritima', 
    description: 'Cette zone protégée offre des points de vue spectaculaires sur les falaises vertigineuses et l\'océan en furie. Sentier de découverte avec panneaux explicatifs.', 
    icon: '💧' 
  },
  { 
    title: 'Village de Seixal', 
    description: 'Ce petit village de pêcheurs au nord de Porto Moniz preserve une atmosphere d\'autre temps. L\'eglise locale et les maisons traditionnelles meritent le detour.', 
    icon: '⚓' 
  },
]

const accommodation = [
  { name: 'Quinta do Lorde', type: 'Resort 4 étoiles', price: '80-120€/nuit', highlight: 'Vue océan' },
  { name: 'Pension locale', type: 'Guesthouse', price: '50-70€/nuit', highlight: 'Accueil familial' },
]

export default function PortoMonizPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">🏊 Nord-Ouest</span>
            <h1 className="text-4xl text-white font-serif">Porto Moniz</h1>
            <p className="text-stone-300">Les piscines naturelles de lave volcanique</p>
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
              <strong>Porto Moniz</strong> est le village le plus spectaculaire de la côte nord de Madère. 
              Perché sur une falaise de lave noire, il est célèbre pour ses piscines naturelles — des bassins 
              creusés à même la roche volcanique où l'eau de l'Atlantique se réchauffe au soleil.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La route pour y arriver depuis Funchal est déjà une aventure en soi : une heure de virages 
              serrés, de tunnels percés dans la roche, et de points de vue à vous couper le souffle sur 
              l'océan en furie en contrebas. Mais une fois arrivé, les piscines naturelles récompensent 
              largement le voyage.
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
              Les piscines sont magnifique, mais elles sont envahies en été. Notre astuce : allez à 
              la plage de Seixal, à 10 minutes en voiture.是 plage de sable noir volcanique, 
              sauvage et gratuite — les y y vont et vous aurez la plage pour vous seuls.
            </p>
            <p className="text-stone-700">
              Pour les photographe, le lever du soleil depuis le miradouro de Lombinha est magique. 
              La lumière dorée sur les falaises de lave noire et l'océan crée des contrastes spectaculaires.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg mb-3 text-stone-800">🛏️ Où dormir</h3>
              <ul className="text-sm text-stone-600 space-y-2">
                {accommodation.map((a, i) => (
                  <li key={i}>
                    <strong>{a.name}:</strong> {a.price}<br/>
                    <span className="text-stone-500">{a.highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="font-serif text-lg mb-3 text-stone-800">⏰ Notre conseil</h3>
              <p className="text-sm text-stone-700">
                Partez impérativement le matin. Les piscines naturelles sont complètes dès 11h en haute saison.
                La lumière du matin est parfaite pour les photos et vous aurez les bassins presque pour vous.
              </p>
            </div>
          </section>

          <section className="mb-10 p-5 bg-white rounded-lg border border-stone-200">
            <h2 className="text-xl font-serif mb-4 text-stone-800">🚗 Depuis Funchal</h2>
            <p className="text-sm text-stone-600">
              1h15 de route via la ER101, la route panoramique qui longe la côte nord. 
              Route spectaculaire avec des dizaines de virages et tunnels. 
              Bus inter-iles depuis Funchal (comptez 2h).
            </p>
          </section>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">
              ← Retour à Madère
            </Link>
            <Link href="/destinations/madere/sao-vicente" className="text-stone-600 hover:text-stone-800 font-medium">
              São Vicente →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}