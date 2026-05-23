import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'

const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Suisse',
  description: 'Voyage slow travel en Suisse en couple : train panoramique, lacs alpins, villages préservés et silence des Alpes. La Suisse qu\'on croit trop lisse jusqu\'au moment où on lui laisse du temps.',
  url: `${SITE_URL}/destinations/suisse`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 46.8182,
    longitude: 8.2275,
  },
  touristType: ['Nature lover', 'Slow traveler', 'Couple', 'Train traveler'],
  bestSeasonToVisit: ['June', 'July', 'August', 'September'],
}

const faqSuisseSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quand partir en Suisse en couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Juin à septembre pour les randonnées et les lacs. Décembre à mars pour le ski et l\'ambiance hivernale dans les villages alpins. Éviter les vacances scolaires françaises pour les meilleures disponibilités.',
      },
    },
    {
      '@type': 'Question',
      name: 'La Suisse est-elle accessible en train ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Le réseau ferroviaire suisse est parmi les meilleurs au monde. Le Swiss Travel Pass couvre trains, bus et bateaux — idéal pour un voyage slow travel. Zurich, Berne, Lucerne, Interlaken, Lausanne et Genève sont toutes reliées efficacement.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel budget prévoir pour un voyage en Suisse ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Suisse est une destination premium. Comptez 150-250€/nuit en hébergement confort, 50-80€ par repas pour deux. Le Swiss Travel Pass réduit significativement les coûts de transport. Budget total : 2 500 à 4 000€ pour un couple sur 10 jours.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Suisse slow travel — Voyage en couple | Heldonica',
  description:
    'Guide slow travel en Suisse : trains panoramiques, lacs alpins, Zurich, Lucerne, Interlaken. Notre retour terrain — budget réel, itinéraires et adresses testées en couple.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/suisse',
  },
  openGraph: {
    title: 'Suisse slow travel — Voyage en couple | Heldonica',
    description:
      'La Suisse qu\'on croit trop lisse jusqu\'au moment où on lui laisse du train, du silence et un peu de pluie. Notre guide slow travel.',
    url: 'https://www.heldonica.fr/destinations/suisse',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Suisse — Lac alpin et montagnes',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
}

export default function SuissePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Europe · Nature & Slow train
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Suisse
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Le pays qu&apos;on croit trop lisse jusqu&apos;au moment où on lui laisse du train, du silence
              et un peu de pluie. Si tu lui laisses du temps, la Suisse devient bien plus qu&apos;une carte postale propre.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Intro */}
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              La Suisse, on l&apos;a longtemps évitée — trop chère, trop propre, trop cartonnée.
              Et puis on a pris le Glacier Express, on s&apos;est arrêtés dans un village des Grisons
              qui ne figure dans aucun guide, on a mangé une raclette dans un chalet à 1 800 m d&apos;altitude.
              <strong> C&apos;est là qu&apos;on a compris que la Suisse se mérite.</strong>
            </p>
          </section>

          {/* Destinations suisses */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Nos destinations en Suisse</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link
                href="/destinations/zurich"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-amber-700 font-semibold mb-2">City break</p>
                <h3 className="font-serif text-lg text-stone-900 mb-2">Zurich</h3>
                <p className="text-stone-600 text-sm">
                  La ville où l&apos;eau change le tempo. Lac, vieille ville, tramways silencieux et art de vivre qui tient dans la durée.
                </p>
                <span className="inline-block mt-3 text-amber-700 text-sm font-medium">Voir Zurich →</span>
              </Link>
              <div className="p-6 bg-white rounded-lg border border-stone-200">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-400 font-semibold mb-2">Bientôt</p>
                <h3 className="font-serif text-lg text-stone-900 mb-2">Lucerne & Interlaken</h3>
                <p className="text-stone-600 text-sm">
                  Le Pont de la Chapelle, le lac des Quatre-Cantons et les Alpes bernoises. Notre guide arrive.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-stone-200">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-400 font-semibold mb-2">Bientôt</p>
                <h3 className="font-serif text-lg text-stone-900 mb-2">Train panoramique Glacier Express</h3>
                <p className="text-stone-600 text-sm">
                  8h de Zermatt à St-Moritz à travers 91 tunnels et 291 ponts. L&apos;itinéraire slow train ultime.
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-stone-200">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-400 font-semibold mb-2">Bientôt</p>
                <h3 className="font-serif text-lg text-stone-900 mb-2">Les Grisons</h3>
                <p className="text-stone-600 text-sm">
                  La région la moins connue, la plus authentique. Villages rhéto-romans, vallées secrètes et silence absolu.
                </p>
              </div>
            </div>
          </section>

          {/* Quick info */}
          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h2 className="font-serif text-lg text-stone-900 mb-4">Quand partir en Suisse</h2>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Juin — septembre :</strong> Randonnées, lacs, villages alpins</li>
                <li><strong>Décembre — mars :</strong> Ski, ambiance hivernale, fourrures de neige</li>
                <li><strong>Printemps :</strong> Floraisons, moins de monde, tarifs corrects</li>
                <li><strong>À éviter :</strong> Vacances scolaires françaises (prix hôteliers × 2)</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h2 className="font-serif text-lg text-stone-900 mb-4">Budget couple — 10 jours</h2>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Hébergement :</strong> 150 — 250 € / nuit</li>
                <li><strong>Repas :</strong> 50 — 80 € / dîner pour deux</li>
                <li><strong>Transport :</strong> Swiss Travel Pass recommandé (~350 €/pers.)</li>
                <li><strong>Budget total :</strong> 2 500 — 4 000 € / duo</li>
              </ul>
            </div>
          </section>

          {/* Notre verdict */}
          <section className="mb-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700 font-semibold mb-2">Notre verdict Heldonica</p>
            <p className="text-stone-800 text-lg leading-relaxed">
              La Suisse est une destination qui récompense la lenteur et punit la précipitation.
              Le train est ton meilleur allié : pas de voiture à gérer, des paysages qui défilent,
              et un rythme qui s&apos;impose naturellement. Le budget est premium, mais chaque franc suisse
              s&apos;entend dans la qualité de ce qu&apos;on mange, où on dort et comment on se déplace.
            </p>
          </section>

          {/* CTA */}
          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">On conçoit ton voyage Suisse sur mesure</h2>
            <p className="text-stone-600 mb-6">
              Itinéraire train panoramique, sélection d&apos;hébergements authentiques, rythme adapté
              à ce que vous cherchez — sans rien laisser au hasard.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/travel-planning-form?destination=suisse"
                className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold"
              >
                Démarrer ma conception sur mesure →
              </Link>
              <Link
                href="/destinations/zurich"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:border-amber-400 transition-colors"
              >
                Explorer Zurich →
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSuisseSchema) }}
      />
    </>
  )
}
