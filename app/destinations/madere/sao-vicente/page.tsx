import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "São Vicente Madère | Grottes volcaniques et plage noire du nord | Heldonica",
    description: "São Vicente sur la côte nord de Madère : grottes de lave spectaculaires, plage de sable noir, vignobles en terrasses et parc éolien. Le nord authentique loin des foules.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/sao-vicente' },
  };
}

const navLinks = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Porto Moniz', href: '/destinations/madere/porto-moniz' },
]

const pepites = [
  { 
    title: 'Grutas e Centro do Vulcanismo de São Vicente', 
    description: 'Ces grottes de lave, formées voilà 890 000 ans lors d\'une éruption sous-marine, constituent l\'un des seuls sites volcaniques accessibles au public à Madère. Les tunnels de 700 mètres de long, éclairés par un jeu de lumières tamisées, révèlent des formations de lave figée spectaculaires : colonnes hexagonales, bulles de gaz solidifiées, et marmites de géant. Le centre d\'interprétation présente l\'histoire géologique de l\'archipel à travers des maquettes interactives.', 
    icon: '🌋' 
  },
  { 
    title: 'Praia de São Vicente', 
    description: 'Cette plage de sable noir volcanique, l\'une des rares de la côte nord, offre une expérience de baignade atypique. Les galets basaltiques, polis par des millénaires d\'action marine, créent un sol ferme sous les pieds. La plage est protégée des vagues les plus fortes par un promontoire rocheux, permettant une baignade relativement calme. L\'ambiance resto de plage propose des grillades de poisson accompagnées de limonade maison.', 
    icon: '🏖️' 
  },
  { 
    title: 'Parc Éolien de ERRADIC', 
    description: 'Le parc éolien installé sur les hauteurs de São Vicente compte 16 éoliennes produisant 40 MW, soit environ 30% de l\'électricité de Madère. Les couchers de soleil offrent un spectacle particulier : les pâles profilées contre le ciel orange, la silhouette majestueuse des machines qui tournent lentement dans la brise marine. Un sentier balisé traverse le parc et permet de marcher entre les éoliennes.', 
    icon: '💨' 
  },
  { 
    title: 'Caves de Lameiros', 
    description: 'Les vignobles de Lameiros, cultivés en terrasses sur les flancs de la vallée de São Vicente depuis le XVIe siècle, produisent un vin rouge tannique caractéristique du nord de Madère. Les caves troglodytiques, creusées dans la roche volcanique à flanc de falaise, offrent des conditions naturelles idéales pour le vieillissement des vins. Les domaines proposent des dégustations dans ces caves millénaires, accompagnées de fromages de chèvre locaux.', 
    icon: '🍇' 
  },
]

export default function SaoVicentePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Hidden Gem</span>
            <h1 className="text-4xl text-white font-serif">São Vicente</h1>
            <p className="text-stone-300">Le nord authentique : grottes de lave, vignobles et silence atlantique</p>
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
              São Vicente représente le nord de Madère dans toute son authenticité préservée. Ce village de 3 000 habitants, blotti au fond d'une vallée verdoyante ouverte sur l'Atlantique, conserve une atmosphère d'autrefois où les tracteurs traversent les routes secondaires et les anciens saluent les passants depuis leurs murets de pierre. Les activités traditionnelles – pêche, agriculture en terrasses, apiculture – continuent d'animer le quotidien, bien loin du tourisme de masse qui concentre ses energies sur la côte sud.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La curiosité géologique majeure réside dans les grottes de lave, formées lors d'une éruption sous-marine qui projeta des coulées volcaniques jusqu'à la mer. Ces tunnels, accessibles aux visiteurs depuis 1996, offrent un voyage initiatique au cœur du volcanisme qui a façonné l'archipel. Le parc éolien qui surplombe le village rappelle la volonté de Madère de développer les énergies renouvelables, tandis que les vignobles en terrasses perpétuent une tradition viticole qui remonte à la colonisation portugaise du XVe siècle.
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
            <p className="text-stone-700">Commencez par la visite des grottes le matin (durée 45 minutes), puis déjeuner au restaurant familial avec vue sur la vallée. L'après-midi, explorez les vignobles de Lameiros et Terminez la journée au parc éolien pour le coucher du soleil. La route entre São Vicente et Porto Moniz, qui longe la côte nord par des tunnels spectaculaires, offre des vues imprenables sur l'océan et les falaises de la côte ouest.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Madère</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}