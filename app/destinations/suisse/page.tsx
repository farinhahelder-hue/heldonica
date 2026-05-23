import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SITE_URL = 'https://www.heldonica.fr';

const suisseLd = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Suisse',
  description: 'Le pays qu\'on croit trop lisse jusqu\'au moment où on lui laisse du train, du silence et un peu de pluie.',
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
  touristType: ['Nature lover', 'Hiker', 'Slow traveler'],
};

export const metadata: Metadata = {
  title: 'Suisse slow travel : alpin et authentique | Guide Heldonica',
  description:
    'Suisse en slow travel : 10+ jours dans les Alpes, villages,randonnées et silences. Le pays qu\'on croit trop lisse jusqu\'à lui laisser du temps.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/suisse',
  },
  openGraph: {
    title: 'Suisse slow travel : alpin et authentique | Guide Heldonica',
    description:
      'Le pays qu\'on croit trop lisse jusqu\'au moment où on lui laisse du train, du silence et un peu de pluie.',
    url: 'https://www.heldonica.fr/destinations/suisse',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Alpes suisses, silence et sommets',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
};

const quickFacts = [
  { label: 'Durée', value: '10+ jours' },
  { label: 'Profil', value: 'Premium progressif' },
  { label: 'Meilleure saison', value: 'Juin à septembre' },
  { label: 'Budget indicatif', value: 'Premium progressif' },
];

const regions = [
  {
    name: 'Zurich & lac de Zurich',
    description: 'Ville, culture, eau. Le point d\'entrée logique pour comprendre le pays sans commencer par les montagnes.',
  },
  {
    name: 'Grisons',
    description: 'Les montagnes vraies, les villages engels, les chemins de rando qui ne suivent personne. Là où la Suisse devient alpine.',
  },
  {
    name: 'Valais',
    description: 'Les Alpes à la verticale : Zermatt, Saas-Fee, Verbier. Le pays du dehors, celui qui justifie le voyage.',
  },
  {
    name: 'Ticino',
    description: 'Le sud dans le nord :意大利 influences, cafés au bord du lac, douceur qui change du tempo suisse.',
  },
];

const faqItems = [
  {
    question: 'La Suisse est-elle vraiment si chère ?',
    answer: 'Oui, dans les zones touristiques. Non, dans les villages alpins si on mange chez les producteurs locaux. Le secret : sortir des sentiers principaux et prendre le temps de négocier.',
  },
  {
    question: 'Faut-il parler plusieurs langues pour voyager en Suisse ?',
    answer: 'Non. L\'anglais est suffisant dans les villes et zones touristiques. En montagne, un mélange d\'allemand, français et italien selon la région fonctionne.',
  },
  {
    question: 'Quel est le bon rythme pour la Suisse ?',
    answer: 'Slow, vraiment slow. Une région par semaine minimum. La Suisse récompense ceux qui descendent du train et restent.',
  },
];

export default function SuissePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(suisseLd) }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[66vh] flex items-end overflow-hidden bg-stone-900">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80"
            alt="Alpes suisses, sommets et silence"
            className="absolute inset-0 h-full w-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="relative container py-14 md:py-20">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">
              Destination pilier
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-4xl mb-5">
              Suisse, le pays qu&apos;on croyait trop lisse
            </h1>
            <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
              Le pays qu&apos;on croit trop lisse jusqu&apos;au moment où on lui laisse du train, du silence et un peu de pluie.
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

        {/* Regions */}
        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">
              Les régions à arpenter lentement
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {regions.map((region) => (
                <article key={region.name} className="rounded-2xl bg-white border border-stone-200 p-6">
                  <h3 className="text-xl font-serif text-mahogany mb-3">{region.name}</h3>
                  <p className="text-charcoal/75 text-sm leading-relaxed">{region.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Verdict */}
        <section className="bg-white section-spacing">
          <div className="container max-w-3xl">
            <div className="rounded-2xl border border-stone-200 p-8 bg-cloud-dancer/40">
              <p className="text-[11px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                Notre verdict
              </p>
              <p className="text-2xl font-serif text-mahogany mb-4">
                Si tu lui laisses du temps, la Suisse devient bien plus qu&apos;une carte postale propre.
              </p>
              <p className="text-charcoal/75 text-sm leading-relaxed">
                Les Alpes ne livrent leurs secrets qu&apos;aux voyageurs qui descendent du train et restent. Zurich est un début, pas une destination finale.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">FAQ Suisse</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details key={item.question} className="rounded-xl border border-stone-200 p-5 bg-white">
                  <summary className="font-semibold text-charcoal cursor-pointer">
                    {item.question}
                  </summary>
                  <p className="text-charcoal/75 text-sm mt-3 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Link to Zurich */}
        <section className="bg-white section-spacing">
          <div className="container">
            <div className="rounded-2xl border border-stone-200 p-8 text-center">
              <h2 className="text-2xl font-serif text-mahogany mb-4">
                Zurich, le point d&apos;entrée Suisse
              </h2>
              <p className="text-charcoal/75 mb-6 max-w-2xl mx-auto">
                Avant les montagnes, Zurich. La ville où comprendre le pays, prendrer le rythme, et préparer la montée.
              </p>
              <Link
                href="/destinations/zurich"
                className="inline-flex px-6 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
              >
                Explorer Zurich →
              </Link>
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
              Tu veux un carnet Suisse adapté à ton rythme ?
            </h2>
            <p className="text-white/80 mb-8">
              On construit un voyage alpin qui prend le temps qu&apos;il faut, avec les bons villages et les bons arrêts.
            </p>
            <Link
              href="/travel-planning-form?destination=suisse"
              className="inline-flex px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
            >
              Demander un carnet Suisse →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}