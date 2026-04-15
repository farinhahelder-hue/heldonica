'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SlowTravelQuiz from '@/components/SlowTravelQuiz';

type DestinationCard = {
  name: string;
  slug: string;
  country: string;
  style: 'nature' | 'culture' | 'city' | 'food';
  duration: '3-5' | '5-7' | '7-10' | '10+';
  description: string;
  image: string;
  budget: string;
  cta: string;
};

const destinations: DestinationCard[] = [
  {
    name: 'Madere',
    slug: '/destinations/madere',
    country: 'Portugal',
    style: 'nature',
    duration: '7-10',
    description: 'Falaises, levadas, villages suspendus et ocean Atlantique.',
    image: 'https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?w=1200&q=80',
    budget: '1400-1800 EUR / duo / 7j',
    cta: 'Voir le pilier',
  },
  {
    name: 'Sicile',
    slug: '/travel-planning-form?destination=sicile',
    country: 'Italie',
    style: 'food',
    duration: '5-7',
    description: 'Baroque du sud-est, table locale et mer mediterraneenne.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=80',
    budget: 'Sur mesure',
    cta: 'Demander un carnet',
  },
  {
    name: 'Suisse',
    slug: '/destinations/suisse',
    country: 'Suisse',
    style: 'nature',
    duration: '10+',
    description: 'Grand train tour, lacs alpins et adresses contemplatives.',
    image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1200&q=80',
    budget: 'Premium progressif',
    cta: 'Explorer',
  },
  {
    name: 'Roumanie',
    slug: '/destinations/roumanie',
    country: 'Roumanie',
    style: 'culture',
    duration: '7-10',
    description: 'Transylvanie, villages vivants et patrimoine authentique.',
    image: 'https://images.unsplash.com/photo-1603540576557-0f675f531f26?w=1200&q=80',
    budget: 'Accessible et riche',
    cta: 'Explorer',
  },
  {
    name: 'Zurich',
    slug: '/destinations/zurich',
    country: 'Suisse',
    style: 'city',
    duration: '3-5',
    description: 'Riviere, quartiers creatifs et slow city suisse.',
    image: 'https://images.unsplash.com/photo-1538785614344-6f594c4bbf22?w=1200&q=80',
    budget: 'Court sejour premium',
    cta: 'Voir le carnet',
  },
  {
    name: 'Paris',
    slug: '/destinations/paris',
    country: 'France',
    style: 'city',
    duration: '3-5',
    description: 'Paris hors sentiers battus, adresses de quartier et rythme doux.',
    image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=1200&q=80',
    budget: 'Modulable',
    cta: 'Explorer',
  },
];

const styleOptions = [
  { value: 'all', label: 'Tous les styles' },
  { value: 'nature', label: 'Nature' },
  { value: 'culture', label: 'Culture' },
  { value: 'city', label: 'City break' },
  { value: 'food', label: 'Food' },
] as const;

const durationOptions = [
  { value: 'all', label: 'Toutes durees' },
  { value: '3-5', label: '3 a 5 jours' },
  { value: '5-7', label: '5 a 7 jours' },
  { value: '7-10', label: '7 a 10 jours' },
  { value: '10+', label: '10 jours et +' },
] as const;

export default function DestinationsPage() {
  const [countryFilter, setCountryFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState<(typeof styleOptions)[number]['value']>('all');
  const [durationFilter, setDurationFilter] =
    useState<(typeof durationOptions)[number]['value']>('all');

  const countries = useMemo(
    () => ['all', ...Array.from(new Set(destinations.map((item) => item.country)))],
    []
  );

  const filteredDestinations = useMemo(
    () =>
      destinations.filter((item) => {
        const countryOk = countryFilter === 'all' || item.country === countryFilter;
        const styleOk = styleFilter === 'all' || item.style === styleFilter;
        const durationOk = durationFilter === 'all' || item.duration === durationFilter;
        return countryOk && styleOk && durationOk;
      }),
    [countryFilter, styleFilter, durationFilter]
  );

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Hub destinations
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              6 terrains slow travel pour voyager autrement
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Filtre selon ton style, ton temps et ton contexte. Ici, chaque destination
              est pensee avec une approche terrain: pepites testees, rythme coherent,
              et vraie valeur de voyage.
            </p>
          </div>
        </section>

        <section className="bg-white pb-4">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-4 rounded-2xl border border-stone-200 p-4 md:p-5 bg-cloud-dancer/60">
              <label className="text-sm font-medium text-charcoal">
                Pays
                <select
                  value={countryFilter}
                  onChange={(event) => setCountryFilter(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 bg-white"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country === 'all' ? 'Tous les pays' : country}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-charcoal">
                Style
                <select
                  value={styleFilter}
                  onChange={(event) =>
                    setStyleFilter(
                      event.target.value as (typeof styleOptions)[number]['value']
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 bg-white"
                >
                  {styleOptions.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-charcoal">
                Duree
                <select
                  value={durationFilter}
                  onChange={(event) =>
                    setDurationFilter(
                      event.target.value as (typeof durationOptions)[number]['value']
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 bg-white"
                >
                  {durationOptions.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            {filteredDestinations.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 p-10 text-center">
                <p className="text-lg font-semibold text-mahogany mb-2">
                  Aucun resultat avec ces filtres
                </p>
                <p className="text-charcoal/70 mb-5">
                  Elargis les criteres ou passe en mode sur mesure.
                </p>
                <Link
                  href="/travel-planning-form"
                  className="inline-flex px-6 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
                >
                  Construire mon itinerary
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((item) => (
                  <article
                    key={`${item.name}-${item.slug}`}
                    className="rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-56 object-cover"
                      loading="lazy"
                    />
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                        {item.country} - {item.duration} jours
                      </p>
                      <h2 className="text-2xl font-serif text-mahogany mb-2">{item.name}</h2>
                      <p className="text-sm text-charcoal/75 leading-relaxed mb-4">
                        {item.description}
                      </p>
                      <p className="text-sm font-semibold text-charcoal mb-4">{item.budget}</p>
                      <Link
                        href={item.slug}
                        className="inline-flex px-5 py-2.5 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
                      >
                        {item.cta}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <SlowTravelQuiz />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
