import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SITE_URL = 'https://heldonica.fr';

const zurichLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Zurich',
  description: 'Ville suisse au bord du lac de Zurich, entre modernité et douceur de vivre. L\'eau change le tempo avant même le premier café.',
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
  touristType: ['Urban explorer', 'Culture seeker', 'Slow traveler'],
};

export const metadata: Metadata = {
  title: 'Zurich slow travel : ville en eau | Guide Heldonica',
  description:
    'Zurich en slow travel : 3 à 5 jours au bord du lac, quartiers alternatifs, café sans rush. La ville où l\'eau change le tempo avant même le premier café.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/zurich',
  },
  openGraph: {
    title: 'Zurich slow travel : ville en eau | Guide Heldonica',
    description:
      'Zurich ne crie rien, mais elle tient très bien dans la durée. Lacs, quartiers alternatifs, café sans précipitation.',
    url: 'https://www.heldonica.fr/destinations/zurich',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Zurich au bord du lac, reflet et calme',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
};

const quickFacts = [
  { label: 'Durée', value: '3 à 5 jours' },
  { label: 'Profil', value: 'City break premium' },
  { label: 'Meilleure saison', value: 'Mai à septembre' },
  { label: 'Budget indicatif', value: 'Sur mesure' },
];

const zones = [
  {
    name: 'Quartier de la Niederdorf',
    description: 'Ruelles médiévales, artisans, librairies indépendantes. L\'Old Town qu\'on arpente sans liste.',
  },
  {
    name: 'Kreuzberg & Kreis 5',
    description: 'Quartier créatif, ateliers, coffee shops alternatifs. L\'autre Zurich, celui qu\'on ne voit pas sur les cartes postales.',
  },
  {
    name: 'Le lac',
    description: 'Promenade au bord de l\'eau, baignade possible, transats en été. La ville commence vraiment ici.',
  },
];

const faqItems = [
  {
    question: 'Zurich est-il trop cher pour un slow travel ?',
    answer: 'Moins qu\'on croit, si on sort du centre touristique. Les coffee shops du Kreis 5 sont aussi bons qu\'à Paris et moins chers. Les marchés proposent des produits locaux à des prix corrects.',
  },
  {
    question: 'Combien de jours pour voir Zurich vraiment ?',
    answer: '3 jours suffisent si on ne court pas les musées. 5 jours permettent d\'explorer les environs (Rigi, Pfannenstiel) et de prendre le rythme de la ville.',
  },
  {
    question: 'Faut-il parler allemand pour y aller ?',
    answer: 'Non. Zurich est bilingue français-allemand et l\'anglais est très répandu. Aucune barrière pour un voyageur francophone.',
  },
];

export default function ZurichPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(zurichLd) }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[66vh] flex items-end overflow-hidden bg-stone-900">
          <img
            src="https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80"
            alt="Zurich au bord du lac, reflets sur l'eau"
            className="absolute inset-0 h-full w-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="relative container py-14 md:py-20">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">
              Destination pilier
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-4xl mb-5">
              Zurich, ville en eau
            </h1>
            <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
              La ville où l&apos;eau change le tempo avant même le premier café, si tu acceptes de te laisser faire.
            </p>
          </div>
        </section>

        {/* Quick facts */}
        <section className="bg-white section-spacing">
          <div className="container">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickFacts.map((fact) => (
                <div key={fact.label} className="rounded-xl border border-stone-200 p-5 bg-cloud-dancer/40">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-1">
                    {fact.label}
                  </p>
                  <p className="text-charcoal font-medium">{fact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Zones */}
        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">
              Zurich au-delà du centre
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {zones.map((zone) => (
                <article key={zone.name} className="rounded-2xl bg-white border border-stone-200 p-6">
                  <h3 className="text-xl font-serif text-mahogany mb-3">{zone.name}</h3>
                  <p className="text-charcoal/75 text-sm leading-relaxed">{zone.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white section-spacing">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">FAQ Zurich</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details key={item.question} className="rounded-xl border border-stone-200 p-5 bg-cloud-dancer/40">
                  <summary className="font-semibold text-charcoal cursor-pointer">
                    {item.question}
                  </summary>
                  <p className="text-charcoal/75 text-sm mt-3 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-mahogany text-white section-spacing">
          <div className="container text-center max-w-3xl">
            <p className="text-sm uppercase tracking-[0.16em] text-teal mb-3">
              Voyage sur mesure
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Tu veux un carnet Zurich adapté à ton rythme ?
            </h2>
            <p className="text-white/80 mb-8">
              On construit un city break qui prend le temps qu&apos;il faut, avec les bons quartiers et les bons arrêts.
            </p>
            <Link
              href="/travel-planning-form?destination=zurich"
              className="inline-flex px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
            >
              Demander un carnet Zurich →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}