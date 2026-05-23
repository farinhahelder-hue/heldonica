import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'

const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Zurich',
  description: 'City break slow travel à Zurich : la ville où l\'eau change le tempo. Lac de Zurich, vieille ville, musées, gastronomie et art de vivre suisse à un rythme qui tient dans la durée.',
  url: `${SITE_URL}/destinations/zurich`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CH',
    addressRegion: 'Zurich',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 47.3769,
    longitude: 8.5417,
  },
  touristType: ['City break lover', 'Slow traveler', 'Couple'],
  bestSeasonToVisit: ['May', 'June', 'July', 'August', 'September'],
}

const faqZurichSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quand partir à Zurich en couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mai à septembre pour profiter du lac et des terrasses. Décembre pour les marchés de Noël. Éviter les week-ends de foires qui font grimper les prix hôteliers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel budget prévoir pour un city break à Zurich ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zurich est une destination premium. Comptez 200-350€/nuit en hôtel confort central, 60-90€ pour un dîner en deux. Le transport en commun est excellent et inclus dans la plupart des cartes hôtelières.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de jours pour visiter Zurich ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '3 à 5 jours suffisent pour un city break bien rythmé. Prévoir une journée lac, une journée vieille ville et musées, et une excursion vers Lucerne ou les pré-Alpes.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Zurich slow travel — City break en couple | Heldonica',
  description:
    'City break à Zurich : lac, vieille ville, musées et art de vivre suisse. Notre guide slow travel en couple — budget réel, quand partir, nos adresses testées.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/zurich',
  },
  openGraph: {
    title: 'Zurich slow travel — City break en couple | Heldonica',
    description:
      'Zurich ne crie rien, mais elle tient très bien dans la durée. Notre guide city break slow travel.',
    url: 'https://www.heldonica.fr/destinations/zurich',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Zurich — Lac et vieille ville',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
}

export default function ZurichPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Suisse · City break
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Zurich
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              La ville où l&apos;eau change le tempo avant même le premier café, si tu acceptes de te laisser faire.
              Zurich ne crie rien, mais elle tient très bien dans la durée.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Intro */}
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              On arrive souvent à Zurich avec l&apos;idée d&apos;une ville froide, trop propre, trop chère.
              Et puis le lac apparaît, les tramways glissent sans bruit, les terrasses de la Langstrasse
              se remplissent doucement — et on comprend que la ville fonctionne à un autre rythme.
              <strong> Pas bruyant, pas spectaculaire, mais qui tient.</strong>
            </p>
          </section>

          {/* Quick info */}
          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h2 className="font-serif text-lg text-stone-900 mb-4">Quand partir à Zurich</h2>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Mai — juin :</strong> Idéal, lac praticable, peu de monde</li>
                <li><strong>Juillet — août :</strong> Saison haute, bords de lac animés</li>
                <li><strong>Décembre :</strong> Marchés de Noël parmi les plus beaux d&apos;Europe</li>
                <li><strong>À éviter :</strong> Week-ends de grandes foires (Art Basel Zurich, etc.)</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h2 className="font-serif text-lg text-stone-900 mb-4">Budget couple — 3 à 5 jours</h2>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Hébergement :</strong> 200 — 350 € / nuit (centre-ville)</li>
                <li><strong>Repas :</strong> 60 — 90 € / dîner pour deux</li>
                <li><strong>Transport :</strong> Inclus dans la carte hôtelière ZVV</li>
                <li><strong>Budget total :</strong> Court séjour premium</li>
              </ul>
            </div>
          </section>

          {/* Incontournables */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Ce qu&apos;on y fait vraiment</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-5 bg-white rounded-lg border border-stone-200">
                <h3 className="font-serif text-stone-900 mb-2">Lac de Zurich</h3>
                <p className="text-stone-600 text-sm">
                  Baignade publique gratuite aux bains du lac (Seebad) en été. Le matin tôt, c&apos;est une pépite.
                </p>
              </div>
              <div className="p-5 bg-white rounded-lg border border-stone-200">
                <h3 className="font-serif text-stone-900 mb-2">Vieille ville & Lindenhügel</h3>
                <p className="text-stone-600 text-sm">
                  Grossmünster, Fraumünster et ses vitraux Chagall, ruelles médiévales et points de vue.
                </p>
              </div>
              <div className="p-5 bg-white rounded-lg border border-stone-200">
                <h3 className="font-serif text-stone-900 mb-2">Excursion Lucerne</h3>
                <p className="text-stone-600 text-sm">
                  45 min en train. Le Pont de la Chapelle, le lac des Quatre-Cantons et les pré-Alpes en toile de fond.
                </p>
              </div>
            </div>
          </section>

          {/* Notre verdict */}
          <section className="mb-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700 font-semibold mb-2">Notre verdict Heldonica</p>
            <p className="text-stone-800 text-lg leading-relaxed">
              Zurich ne crie rien, mais elle tient très bien dans la durée. C&apos;est une ville qui récompense
              ceux qui résistent à l&apos;envie de tout cocher. Prenez le tram sans destination fixe,
              posez-vous sur un bord de lac — c&apos;est là qu&apos;elle se révèle vraiment.
            </p>
          </section>

          {/* CTA */}
          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Tu veux qu&apos;on conçoive ton séjour Zurich ?</h2>
            <p className="text-stone-600 mb-6">
              On prépare des itinéraires slow travel sur mesure pour les couples — avec les vraies adresses,
              les transports optimisés et le bon rythme pour une ville comme Zurich.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/travel-planning-form?destination=zurich"
                className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold"
              >
                Démarrer ma conception sur mesure →
              </Link>
              <Link
                href="/destinations/suisse"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:border-amber-400 transition-colors"
              >
                Explorer la Suisse →
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqZurichSchema) }}
      />
    </>
  )
}
