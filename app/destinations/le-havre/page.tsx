import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.heldonica.fr'

const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Le Havre',
  description: 'Port historique Atlantique de Normandie. Architecture Auguste Perret, falaises de craie, et slow travel en bord de mer. Destination idéale pour couples cherchant authenticité et paysages côtiers.',
  url: `${SITE_URL}/destinations/le-havre`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'FR',
    addressRegion: 'Normandie',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 49.5142,
    longitude: 0.1065,
  },
  touristType: ['History buff', 'Architecture lover', 'Beach lover'],
  bestSeasonToVisit: ['May', 'June', 'July', 'August', 'September'],
}

const faqHavreSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Quand partir au Havre ?", "acceptedAnswer": { "@type": "Answer", "text": "Mai-juin pour la météo douce. Juillet-août possible mais plus touristique. Septembre-octobre idéal : températures agréables, foules limitées." }},
    { "@type": "Question", "name": "Combien de jours au Havre ?", "acceptedAnswer": { "@type": "Answer", "text": "2-3 jours suffisent pour découvrir la ville, ses musées et les plages. 4-5 jours permettent d'explorer les falaises de Honfleur et la Côte d'Albâtre." }},
    { "@type": "Question", "name": "Comment aller au Havre depuis Paris ?", "acceptedAnswer": { "@type": "Answer", "text": "Train direct depuis Paris Saint-Lazare : 2h15. Voiture conseillée pour explorer la région côtière." }},
  ]
};

export const metadata: Metadata = {
  title: 'Le Havre slow travel | Guide Heldonica',
  description:
    'Guide du Havre : architecture Perret, musées, plages et côte normande. Notre guide couple pour découvrir lentement ce port atlantique authentique.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/le-havre',
  },
  openGraph: {
    title: 'Le Havre slow travel | Guide Heldonica',
    description:
      'Port historique, architecture iconique, falaises. Découvrez Le Havre en couple, hors des sentiers battus.',
    url: 'https://www.heldonica.fr/destinations/le-havre',
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function LehavrePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqHavreSchema) }} />
      <Header />
      <main>
        <section className="py-24 bg-gradient-to-br from-stone-50 to-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇫🇷</span>
              <span className="text-sm text-stone-600 font-medium uppercase tracking-wider">Normandie, France</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-6">
              Le Havre
            </h1>
            <p className="text-xl text-stone-600 mb-8">
              Un port qui respire. Architecture iconique, musées sincères, falaises majestueuses. Le Havre n'est pas touristique — c'est authentique.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-stone-500 mb-1">Meilleure période</p>
                <p className="font-semibold text-stone-900">Mai–Sept</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Budget couple/sem</p>
                <p className="font-semibold text-stone-900">~900 €</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Train depuis Paris</p>
                <p className="font-semibold text-stone-900">2h15</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Visa</p>
                <p className="font-semibold text-stone-900">Non (UE)</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Langue</p>
                <p className="font-semibold text-stone-900">Français</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Pourquoi Le Havre ?</h2>
            <div className="space-y-6 text-lg text-stone-700 leading-relaxed">
              <p>
                Le Havre n'a pas la perfection d'une destination de carte postale. C'est peut-être pour ça qu'on l'aime. C'est un vrai port qui respire, avec des histoires de marins, d'architectes et de gens ordinaires.
              </p>
              <p>
                Auguste Perret y a réinventé une ville après 1945 — pas en copiant, mais en construisant une architecture qui ressemble au Havre lui-même. Sobre, puissante, honnête.
              </p>
              <p>
                De là, tu peux marcher vers les falaises de Honfleur, regarder les bateaux rentrer au port, manger un plateau de fruits de mer chez un poissonnier, et dormir dans une petite maison face à la mer. C'est ça, Le Havre.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 border-b border-stone-200 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Itinéraire 4 jours</h2>
            <div className="space-y-8">
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 1 : Arrivée & Centre Perret</h3>
                <p className="text-stone-700">Gare, balade dans les rues reconstruites de Perret, marché, dîner sur le front de mer.</p>
              </div>
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 2 : Musées & Port</h3>
                <p className="text-stone-700">MuMa (musée Malraux), visite du port historique, balade sur les quais, café en front de mer.</p>
              </div>
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 3 : Côte d'Albâtre</h3>
                <p className="text-stone-700">Excursion vers Étretat (1h en voiture), falaises, petits villages côtiers, Honfleur.</p>
              </div>
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 4 : Lenteur</h3>
                <p className="text-stone-700">Flânerie, ruelle, marché du matin, musée ou balade en falaise selon l'envie.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">FAQ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-stone-900 mb-2">Le Havre est-il vraiment touristique ?</h3>
                <p className="text-stone-700">Non. Contrairement à Honfleur ou Étretat, Le Havre reste une ville de vrai travailleurs. C'est son charme.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-2">Faut-il une voiture ?</h3>
                <p className="text-stone-700">Non pour explorer Le Havre même. Oui si tu veux aller sur la Côte d'Albâtre (Honfleur, Étretat).</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-2">Où manger les meilleures huîtres ?</h3>
                <p className="text-stone-700">Chez les poisonniers du marché. Plus authentique qu'un restaurant touristique.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
