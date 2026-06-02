'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SlowTravelQuiz from '@/components/SlowTravelQuiz';

type DestinationCard = {
  id?: string;
  name: string;
  slug: string;
  country: string;
  region?: string;
  style: 'nature' | 'culture' | 'city' | 'food';
  duration: '3-5' | '5-7' | '7-10' | '10+';
  description: string;
  image: string;
  budget: string;
  season: string;
  verdict: string;
};

// Images for each destination category
const DESTINATION_IMAGES: Record<string, string> = {
  'Madère': 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80',
  'Portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
  'Roumanie': 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=800&q=80',
  'Sicile': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
  'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'Suisse': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80',
  'Italie': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
  'Monténégro': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
};

// Fallback descriptions
const DESTINATION_DESCRIPTIONS: Record<string, string> = {
  'Madère': "L'île qu'on a mise trois ans à vraiment comprendre. Chaque retour révèle quelque chose que le précédent avait raté.",
  'Roumanie': "Le terrain de l'enfance, du retour et des villages qui n'ont pas encore laissé tomber leur rythme.",
  'Sicile': "Le sud-est qu'on prend par la pierre, par le ventre et par les fins d'après-midi qui durent plus que prévu.",
  'Portugal': "Lisbonne vue par ceux qui y vivent, pas par ceux qui la traversent.",
  'France': "Même en bas de chez toi, il reste des rues qui n'ont pas fini de se révéler si tu ralentis juste assez.",
  'Suisse': "Les Alpes qu'on prend par les crêtes, par les bains et par les matins dans le brouillard de haute altitude.",
  'Italie': "La botte qu'on prend par ses secrets — villages de pierre, tables de campagne, couchers de soleil sur la Méditerranée.",
  'Monténégro': "Les Balkans par leur côté le plus lumineux — fjords, villages de pêcheurs et routes qui longent la mer.",
};

const DESTINATION_VERDICTS: Record<string, string> = {
  'Madère': "Le genre d'île qui te force à ralentir si tu veux qu'elle s'ouvre.",
  'Roumanie': "Une destination qui récompense ceux qui sortent des capitales trop vite résumées.",
  'Sicile': "À faire lentement, sinon la Sicile ne te donne que sa surface.",
  'Portugal': "Lisbonne est meilleure quand on prend le temps de s'asseoir.",
  'France': "Paris est meilleur quand on arrête d'essayer d'en faire trop.",
  'Suisse': "La Suisse révèle ses meilleurs côtés à ceux qui descendent des sentiers balisés.",
  'Italie': "L'Italie qu'on cherche n'est jamais dans les guides.",
  'Monténégro': "Un pays qui n'a pas encore appris à vendre ce qu'il est.",
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

function mapCategoryToStyle(category: string): DestinationCard['style'] {
  const map: Record<string, DestinationCard['style']> = {
    'nature': 'nature',
    'culture': 'culture',
    'city': 'city',
    'ville': 'city',
    'food': 'food',
    'montagne': 'nature',
  };
  return map[category?.toLowerCase()] || 'nature';
}

function mapRegionToDuration(region: string): DestinationCard['duration'] {
  // Rough mapping based on region
  const durations: Record<string, DestinationCard['duration']> = {
    'Europe de l\'Ouest': '3-5',
    'Europe du Sud': '5-7',
    'Méditerranée': '5-7',
    'Europe de l\'Est': '7-10',
    'Balkans': '7-10',
    'Alpes': '7-10',
  };
  return durations[region] || '7-10';
}

export default function DestinationsClient() {
  const [countryFilter, setCountryFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState<(typeof styleOptions)[number]['value']>('all');
  const [durationFilter, setDurationFilter] = useState<(typeof durationOptions)[number]['value']>('all');
  const [destinations, setDestinations] = useState<DestinationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch('/api/destinations');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        if (Array.isArray(data.destinations)) {
          const mapped: DestinationCard[] = data.destinations.map((d: any) => {
            const name = d.title?.split('|')[0]?.trim() || d.slug?.split('-').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ') || 'Destination';
            
            return {
              id: d.id,
              name,
              slug: d.link || `/destinations/${d.slug}`,
              country: d.country || '',
              region: d.region,
              style: mapCategoryToStyle(d.category || ''),
              duration: mapRegionToDuration(d.region || ''),
              description: d.excerpt || DESTINATION_DESCRIPTIONS[name] || `Destination testée et recommandée par Heldonica.`,
              image: d.featured_image || DESTINATION_IMAGES[name] || DESTINATION_IMAGES[d.country] || DESTINATION_IMAGES.default,
              budget: 'Sur mesure',
              season: 'Nous consulter',
              verdict: DESTINATION_VERDICTS[name] || 'Une destination qui mérite qu\'on prenne le temps.',
            };
          });
          setDestinations(mapped);
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError('Impossible de charger les destinations');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDestinations();
  }, []);

  const countries = useMemo(
    () => ['all', ...Array.from(new Set(destinations.map((item) => item.country)))],
    [destinations]
  );

  const filteredDestinations = useMemo(
    () =>
      destinations.filter((item) => {
        const countryOk = countryFilter === 'all' || item.country === countryFilter;
        const styleOk = styleFilter === 'all' || item.style === styleFilter;
        const durationOk = durationFilter === 'all' || item.duration === durationFilter;
        return countryOk && styleOk && durationOk;
      }),
    [countryFilter, styleFilter, durationFilter, destinations]
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
              {loading ? 'Destinations en cours de chargement...' : `${destinations.length} destinations qu'on a arpentées dans tous les sens`}
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Pas en touristes pressés, en gens qui reviennent, qui testent, qui se trompent et qui recommandencent. Ici, on te montre des terrains qu'on connaît vraiment, avec leur bon rythme, leur budget indicatif et notre verdict signé court.
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
            {loading ? (
              <div className="rounded-2xl border border-stone-200 p-10 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-stone-200 rounded w-48 mx-auto mb-4"></div>
                  <div className="h-2 bg-stone-100 rounded w-32 mx-auto"></div>
                </div>
              </div>
            ) : filteredDestinations.length === 0 ? (
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
              <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((item) => (
                  <article
                    key={item.id || `${item.name}-${item.slug}`}
                    className="rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 relative"
                  >
                    <div className="relative h-48 bg-stone-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                        {item.country}
                      </p>
                      <h2 className="text-2xl font-serif text-mahogany mb-3">{item.name}</h2>
                      <p className="text-sm text-charcoal/75 leading-relaxed mb-5 line-clamp-2">{item.description}</p>

                      <div className="grid grid-cols-1 gap-3 mb-5 text-sm">
                        <div className="rounded-xl bg-cloud-dancer/60 border border-stone-200 p-3">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-1">Durée</p>
                          <p className="text-charcoal">{item.duration} jours</p>
                        </div>
                        <div className="rounded-xl bg-white border border-stone-200 p-3">
                          <p className="text-[11px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-1">Notre verdict</p>
                          <p className="text-charcoal/85 text-xs">{item.verdict}</p>
                        </div>
                      </div>

                      <Link
                        href={item.slug}
                        className="inline-flex px-5 py-2.5 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-all duration-200"
                      >
                        Voir la destination →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/destinations/carte"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-eucalyptus text-eucalyptus font-semibold hover:bg-eucalyptus hover:text-white transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                  </svg>
                  Voir la carte interactive →
                </Link>
              </div>
              </>
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