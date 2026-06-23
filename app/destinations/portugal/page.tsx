import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'


const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Portugal',
  description: 'Destination slow travel avec ses villes côtières et régions variées comme Lisbonne, Porto et Madère.',
  url: `${SITE_URL}/destinations/portugal`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PT',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.3999,
    longitude: -8.2245,
  },
  touristType: ['Culture lover', 'Nature lover', 'Slow traveler'],
};

const faqPortugalSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Quand aller au Portugal ?", "acceptedAnswer": { "@type": "Answer", "text": "Printemps (avril-mai) et autumn (septembre-octobre) pour eviter les foules." }},
    { "@type": "Question", "name": "Comment aller au Portugal ?", "acceptedAnswer": { "@type": "Answer", "text": "Vol direct depuis Paris (2h30). Aeroports: Lisbonne, Porto, Faro." }},
    { "@type": "Question", "name": "Budget Portugal ?", "acceptedAnswer": { "@type": "Answer", "text": "Environ 80-120€/jour en hotel milieu et restaurant local." }}
  ]
};

export const metadata: Metadata = {
  title: 'Portugal slow travel | Guide Heldonica',
  description:
    'Guide Portugal: Madere, Porto, Lisbonne, Algarve. Destinations slow travel.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/portugal',
  },
  openGraph: {
    title: 'Portugal slow travel | Guide Heldonica',
    url: 'https://www.heldonica.fr/destinations/portugal',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Portugal slow travel — Madère, Porto, Lisbonne',
      },
    ],
  },
}

const subNav = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Porto', href: '/destinations/portugal/porto' },
  { label: 'Lisbonne', href: '/destinations/portugal/lisbonne' },
]

export default function PortugalPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPortugalSchema) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Destinations
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Portugal
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Madere, Porto, Lisbonne. Le pays qui a fait le slow travel avant l heure.
            </p>
          </div>
        </section>

        <nav className="bg-white border-b border-stone-200">
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

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              Le Portugal, c est le pays qu on visite et revisite.
              <strong>Madere au nord, Lisbonne au sud, et tout ce qu il y a entre.</strong>
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              Madère c’est l’île. Porto c’est le vin. Lisbonne c’est le fado.
              Mais entre les trois, il y a les plages de l Algarve, les villages de l Alentejo,
              et les routes qui longent l Atlantique.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Nos destinations
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Link
                href="/destinations/madere"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Madere
                </h3>
                <p className="text-stone-600 text-sm">
                  Ile de l Atlantique. Falaises, levadas, nature.
                </p>
              </Link>
              <Link
                href="/destinations/portugal/porto"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Porto
                </h3>
                <p className="text-stone-600 text-sm">
                  Vin de Porto, architecture, bord de Douro.
                </p>
              </Link>
              <Link
                href="/destinations/portugal/lisbonne"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Lisbonne
                </h3>
                <p className="text-stone-600 text-sm">
                  Collines, Tram 28, fado.
                </p>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                Quand y aller
              </h3>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Mars - Mai:</strong> Ideal, douceur printaniere</li>
                <li><strong>Septembre:</strong> Mer chaude, moins de monde</li>
                <li><strong>Juillet - Aout:</strong> Peak, prevoyez</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                Budget couple
              </h3>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Hébergement:</strong> 80-150€ /nuit</li>
                <li><strong>Repas:</strong> 30-50€</li>
                <li><strong>Vol:</strong> ~150€ A/R</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              En voir plus
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/destinations/madere"
                className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
              >
                Madere →
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:border-amber-400 transition-colors"
              >
                Articles Portugal →
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}