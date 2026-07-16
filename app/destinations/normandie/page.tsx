import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.heldonica.fr'

const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Normandie',
  description: 'Région française riche en histoire et en paysages côtiers. Le Havre, Honfleur, Bayeux et les plages du débarquement. Destination slow travel idéale pour les amateurs d\'histoire et de bord de mer.',
  url: `${SITE_URL}/destinations/normandie`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'FR',
    addressRegion: 'Normandie',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 49.2829,
    longitude: -0.5011,
  },
  touristType: ['History buff', 'Beach lover', 'Slow traveler'],
  bestSeasonToVisit: ['May', 'June', 'July', 'August', 'September'],
}

const faqNormandieSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Quand aller en Normandie ?", "acceptedAnswer": { "@type": "Answer", "text": "Mai-septembre pour meteo agreable. Juin pour cimetiere americain moins foule." }},
    { "@type": "Question", "name": "Comment aller en Normandie ?", "acceptedAnswer": { "@type": "Answer", "text": "Train depuis Paris (2h). Voiture pour flexibilite. Baleines à Etretat." }},
    { "@type": "Question", "name": "Que voir en Normandie ?", "acceptedAnswer": { "@type": "Answer", "text": "Le Havre (UNESCO), Honfleur, plages du debarquement, Mont Saint-Michel." }}
  ]
};

export const metadata: Metadata = {
  title: 'Normandie slow travel | Guide Heldonica',
  description:
    'Guide pilier Normandie: Le Havre, Honfleur, Bayeux et les environs. Quand partir, budget réel, où dormir, et choses à faire.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/normandie',
  },
  openGraph: {
    title: 'Normandie slow travel | Guide Heldonica',
    description:
      'Le Havre, Honfleur, plages et histoire. Notre guide pour un roadtrip slow travel en Normandie.',
    url: 'https://www.heldonica.fr/destinations/normandie',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Normandie slow travel — Falaises d\'Étretat',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
}

const subNav = [
  { label: 'Le Havre', href: '/destinations/normandie/le-havre' },
  { label: 'Côte d Albâtre', href: '/destinations/normandie/cote-albatre' },
  { label: 'Pays d Auge', href: '/destinations/normandie/pays-dauge' },
]

export default function NormandiePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Destinations
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Normandie
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Falaises de craie blanche, ports de pêche authentique, histoire par chaque rue.
              La Normandie qu'on aime — entre mer et patrimoine.
            </p>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-amber-700 whitespace-nowrap text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              Quand on pense Normandie, on imagine les plages du Débarquement, les falaises d Etretat, Honfleur.
              Mais entre les sentiers battus, il y a une Normandie plus secrète : les petits ports de pêche, les vallons du Pays d Auge,
              les apparts Art déco du Havre. <strong>C'est celle-là qu'on est allés chercher.</strong>
            </p>
          </section>

          {/* Regions grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Nos régions
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Link
                href="/destinations/normandie/le-havre"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Le Havre et environs
                </h3>
                <p className="text-stone-600 text-sm">
                  Deuxième port de France, patrimoine UNESCO d Auguste Perret.
                </p>
              </Link>
              <Link
                href="/destinations/normandie/cote-albatre"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Côte d Albâtre
                </h3>
                <p className="text-stone-600 text-sm">
                  Les fameuses falaises de craie blanche, d Etretat aux caps.
                </p>
              </Link>
              <Link
                href="/destinations/normandie/pays-dauge"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Pays d Auge
                </h3>
                <p className="text-stone-600 text-sm">
                  Bocage normand, Calvados, villages pittoresques et fromage.
                </p>
              </Link>
            </div>
          </section>

          {/* Quick info */}
          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                Quand y aller
              </h3>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Mai - Juin:</strong> Ideal, moins de monde</li>
                <li><strong>Septembre:</strong> Fin de saison, tarifs ok</li>
                <li><strong>Juillet - Aout:</strong> Peak estival, prevoyez</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                Budget couple
              </h3>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Confort:</strong> 120-180€ /nuit</li>
                <li><strong>Repas:</strong> 40-60€</li>
                <li><strong>Carburant:</strong>~80€ pour le roadtrip</li>
              </ul>
            </div>
          </section>

          {/* Links */}
          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              En voir plus
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/destinations/normandie/le-havre"
                className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
              >
                Le Havre et environs →
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:border-amber-400 transition-colors"
              >
                Articles Normandie →
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {/* Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqNormandieSchema) }}
      />
    </>
  )
}