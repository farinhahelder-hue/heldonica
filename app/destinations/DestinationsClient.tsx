'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SlowTravelQuiz from '@/components/SlowTravelQuiz';
import { DestinationMarker } from '@/lib/destinations-supabase';

type DestinationCard = {
  name: string;
  slug: string;
  country: string;
  style: 'nature' | 'culture' | 'city' | 'food';
  duration: '3-5' | '5-7' | '7-10' | '10+';
  description: string;
  image: string;
  budget: string;
  season: string;
  verdict: string;
};

// Map category to style for filtering
function categoryToStyle(category: string): DestinationCard['style'] {
  switch (category) {
    case 'nature': return 'nature';
    case 'culture': return 'culture';
    case 'ville': return 'city';
    case 'ile': return 'city';
    case 'cote': return 'city';
    case 'montagne': return 'nature';
    default: return 'city';
  }
}

// Map region to duration estimate
function regionToDuration(region: string): DestinationCard['duration'] {
  if (region === 'Amérique latine') return '7-10';
  if (region === 'Europe') return '5-7';
  return '5-7';
}

// Static fallback data
const defaultDestinations: DestinationCard[] = [
  {
    name: 'Madère',
    slug: '/destinations/madere',
    country: 'Portugal',
    style: 'nature',
    duration: '7-10',
    description: "L'île qu'on a mise trois ans à vraiment comprendre.",
    image: 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80',
    budget: '1 400 à 1 800 € / duo / 7 jours',
    season: 'mars à juin · septembre à novembre',
    verdict: "Le genre d'île qui te force à ralentir si tu veux qu'elle s'ouvre.",
  },
  {
    name: 'Sicile',
    slug: '/travel-planning-form?destination=sicile',
    country: 'Italie',
    style: 'food',
    duration: '5-7',
    description: "Le sud-est qu'on prend par la pierre, par le ventre et par les fins d'après-midi.",
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    budget: 'Sur mesure',
    season: 'avril à juin · septembre à octobre',
    verdict: "À faire lentement, sinon la Sicile ne te donne que sa surface.",
  },
  {
    name: 'Suisse',
    slug: '/destinations/suisse',
    country: 'Suisse',
    style: 'nature',
    duration: '10+',
    description: "Le pays qu'on croit trop lisse jusqu'au moment où on lui laisse du train.",
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
    budget: 'Premium progressif',
    season: 'juin à septembre',
    verdict: "Si tu lui laisses du temps, la Suisse devient bien plus qu'une carte postale.",
  },
  {
    name: 'Roumanie',
    slug: '/destinations/roumanie',
    country: 'Roumanie',
    style: 'culture',
    duration: '7-10',
    description: "Le terrain de l'enfance, du retour et des villages qui n'ont pas encore laissé tomber leur rythme.",
    image: 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=800&q=80',
    budget: 'Accessible et dense',
    season: 'mai à octobre',
    verdict: "Une destination qui récompense ceux qui sortent des capitales trop vite résumées.",
  },
  {
    name: 'Zurich',
    slug: '/destinations/zurich',
    country: 'Suisse',
    style: 'city',
    duration: '3-5',
    description: "La ville où l'eau change le tempo avant même le premier café.",
    image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
    budget: 'Court séjour premium',
    season: 'mai à septembre',
    verdict: "Zurich ne crie rien, mais elle tient très bien dans la durée.",
  },
  {
    name: 'Paris',
    slug: '/destinations/paris',
    country: 'France',
    style: 'city',
    duration: '3-5',
    description: "Même en bas de chez toi, il reste des rues qui n'ont pas fini de se révéler.",
    image: 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=80',
    budget: 'Modulable',
    season: "toute l'année",
    verdict: "Paris est meilleur quand on arrête d'essayer d'en faire trop.",
  },
];

// Transform Supabase data to DestinationCard
function transformDestination(marker: DestinationMarker): DestinationCard {
  return {
    name: marker.title,
    slug: marker.link,
    country: marker.country,
    style: categoryToStyle(marker.category),
    duration: regionToDuration(marker.region),
    description: marker.excerpt,
    image: marker.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    budget: 'Voir la destination',
    season: 'Consulter le guide',
    verdict: marker.excerpt,
  };
}

type Props = {
  destinations?: DestinationMarker[];
};

const styleOptions = [
  { value: 'all', label: 'Tous les styles' },
  { value: 'nature', label: 'Nature' },
  { value: 'culture', label: 'Culture' },
  { value: 'city', label: 'City break' },
  { value: 'food', label: 'Food' },
] as const;

const durationOptions = [
  { value: 'all', label: 'Toutes durées' },
  { value: '3-5', label: '3 à 5 jours' },
  { value: '5-7', label: '5 à 7 jours' },
  { value: '7-10', label: '7 à 10 jours' },
  { value: '10+', label: '10 jours et +' },
] as const;

export default function DestinationsClient({ destinations }: Props) {
  const [countryFilter, setCountryFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState<(typeof styleOptions)[number]['value']>('all');
  const [durationFilter, setDurationFilter] =
    useState<(typeof durationOptions)[number]['value']>('all');

  // Use Supabase data if available, otherwise fallback to default static data
  const cardDestinations = useMemo(() => {
    if (destinations && destinations.length > 0) {
      return destinations.map(transformDestination);
    }
    return defaultDestinations;
  }, [destinations]);

  const countries = useMemo(
    () => ['all', ...Array.from(new Set(cardDestinations.map((item) => item.country)))],
    [cardDestinations]
  );

  const filteredDestinations = useMemo(
    () =>
      cardDestinations.filter((item) => {
        const countryOk = countryFilter === 'all' || item.country === countryFilter;
        const styleOk = styleFilter === 'all' || item.style === styleFilter;
        const durationOk = durationFilter === 'all' || item.duration === durationFilter;
        return countryOk && styleOk && durationOk;
      }),
    [cardDestinations, countryFilter, styleFilter, durationFilter]
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
              Six destinations qu&apos;on a arpentées dans tous les sens
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Pas en touristes pressés, en gens qui reviennent, qui testent, qui se trompent et qui recommandenous. Ici, on te montre des terrains qu&apos;on connaît vraiment, avec leur bon rythme, leur budget indicatif et notre verdict signé court.
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
                    setStyleFilter(event.target.value as (typeof styleOptions)[number]['value'])
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
                Durée
                <select
                  value={durationFilter}
                  onChange={(event) =>
                    setDurationFilter(event.target.value as (typeof durationOptions)[number]['value'])
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
                <p className="text-lg font-semibold text-mahogany mb-2">Aucun résultat avec ces filtres</p>
                <p className="text-charcoal/70 mb-5">
                  Élargis un peu le cadre, ou dis-nous ce que tu cherches vraiment.
                </p>
                <Link
                  href="/travel-planning-form"
                  className="inline-flex px-6 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
                >
                  Nous écrire →
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((item) => {
                  const cta = 'Voir la destination →';

                  return (
                    <article
                      key={`${item.name}-${item.slug}`}
                      className="rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-56 object-cover"
                        loading="lazy"
                      />
                      <div className="p-5">
                        <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                          {item.country}
                        </p>
                        <h2 className="text-2xl font-serif text-mahogany mb-3">{item.name}</h2>
                        <p className="text-sm text-charcoal/75 leading-relaxed mb-5">{item.description}</p>

                        <div className="grid grid-cols-1 gap-3 mb-5 text-sm">
                          <div className="rounded-xl bg-cloud-dancer/60 border border-stone-200 p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-1">Durée</p>
                            <p className="text-charcoal">{item.duration} jours</p>
                          </div>
                          <div className="rounded-xl bg-cloud-dancer/60 border border-stone-200 p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-1">Budget indicatif</p>
                            <p className="text-charcoal">{item.budget}</p>
                          </div>
                          <div className="rounded-xl bg-cloud-dancer/60 border border-stone-200 p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-1">Meilleure saison</p>
                            <p className="text-charcoal">{item.season}</p>
                          </div>
                          <div className="rounded-xl bg-white border border-stone-200 p-3">
                            <p className="text-[11px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-1">Notre verdict</p>
                            <p className="text-charcoal/85">{item.verdict}</p>
                          </div>
                        </div>

                        <Link
                          href={item.slug}
                          className="inline-flex px-5 py-2.5 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-all duration-200"
                        >
                          {cta}
                        </Link>
                      </div>
                    </article>
                  );
                })}
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Quelles destinations propose Heldonica ?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Heldonica partage des destinations authentiques hors des sentiers battus testées sur le terrain : Madère, Roumanie, Sicile, et d\'autres pépites européennes. Toutes nos destinations sont choisies pour leur caractère écoresponsable et leur richesse locale.',
                },
              },
              {
                '@type': 'Question',
                name: "Qu'est-ce qu'une destination hors des sentiers battus ?",
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Une destination hors des sentiers battus, c\'est un lieu authentique, peu touristique, où l\'expérience locale prime sur les circuits standardisés. Chez Heldonica, on ne recommande que des endroits qu\'on a visités et vérifiés nous-mêmes.',
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}
