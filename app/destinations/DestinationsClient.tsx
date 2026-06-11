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
  tags?: string[];
};

// Country clusters with intro copy and SEO
const COUNTRY_CLUSTERS: Record<string, { intro: string; tags: string[]; blogKeyword: string }> = {
  'Madère': {
    intro: "L'île qu'on a mise trois ans à vraiment comprendre. Chaque retour révèle quelque chose que le précédent avait raté. Voici tout ce qu'on sait maintenant.",
    tags: ['Îles', 'Randonnée', 'Océan', 'Vin'],
    blogKeyword: 'madere',
  },
  'Portugal': {
    intro: "Le Portugal qu'on cherche quand on veut échapper aux foules. Plains de l'Alentejo, falaises de l'Algarve, villages de l'arrière-pays — on a arpenté tout ça.",
    tags: ['Europe du Sud', 'Côte', 'Food', 'Patrimoine'],
    blogKeyword: 'portugal',
  },
  'Roumanie': {
    intro: "Le terrain de l'enfance, du retour et des villages qui n'ont pas encore laissé tomber leur rythme. Transylvanie, Bucovine, Maramureș — des terres qui racontent encore des histoires.",
    tags: ['Europe de l\'Est', 'Patrimoine', 'Nature', 'Rural'],
    blogKeyword: 'roumanie',
  },
  'Sicile': {
    intro: "Le sud-est qu'on prend par la pierre, par le ventre et par les fins d'après-midi qui durent plus que prévu. Palermo, l'Etna, les villages de l'intérieur — on y revient chaque année.",
    tags: ['Méditerranée', 'Food', 'Histoire', 'Côte'],
    blogKeyword: 'sicile',
  },
  'Suisse': {
    intro: "Les Alpes qu'on prend par les crêtes, par les bains et par les matins dans le brouillard de haute altitude. Zurich, Lucerne, les villages de montagne — la Suisse loin des clichés.",
    tags: ['Alpes', 'Lacs', 'Randonnée', 'Culture'],
    blogKeyword: 'suisse',
  },
  'France': {
    intro: "Même en bas de chez toi, il reste des rues qui n'ont pas fini de se révéler si tu ralentis juste assez. La France qu'on redécouvre en prenant le temps.",
    tags: ['Europe de l\'Ouest', 'Patrimoine', 'Gastronomie', 'Nature'],
    blogKeyword: 'france',
  },
  'Italie': {
    intro: "La botte qu'on prend par ses secrets — villages de pierre, tables de campagne, couchers de soleil sur la Méditerranée. L'Italie loin des guides standard.",
    tags: ['Méditerranée', 'Food', 'Culture', 'Art'],
    blogKeyword: 'italie',
  },
  'Monténégro': {
    intro: "Les Balkans par leur côté le plus lumineux — fjords, villages de pêcheurs et routes qui longent la mer. Un pays qui n'a pas encore appris à vendre ce qu'il est.",
    tags: ['Balkans', 'Côte', 'Nature', 'Authentique'],
    blogKeyword: 'montenegro',
  },
  default: {
    intro: "Des destinations qu'on a testées, arpentées et parfois ratées pour que tu n'aies pas à le faire. Voici ce qu'on en a retenu.",
    tags: ['Voyage lent', 'Authentique', 'Éco-responsable'],
    blogKeyword: 'destinations',
  },
};

// Images for each destination category
const DESTINATION_IMAGES: Record<string, string> = {
  'Madère': 'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=800&q=80',
  'Portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
  'Alentejo': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80',
  'Roumanie': 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=800&q=80',
  'Sicile': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
  'France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'Suisse': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80',
  'Italie': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
  'Monténégro': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
};

const DESTINATION_VERDICTS: Record<string, string> = {
  'Madère': "Le genre d'île qui te force à ralentir si tu veux qu'elle s'ouvre.",
  'Alentejo': "Le Portugal profond qu'on cherche tous sans oser le dire.",
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
  { value: 'nature', label: '🌿 Nature' },
  { value: 'culture', label: '🏛️ Culture' },
  { value: 'city', label: '🏙️ City break' },
  { value: 'food', label: '🍽️ Food' },
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

// Group destinations by country
function groupByCountry(destinations: DestinationCard[]): Record<string, DestinationCard[]> {
  return destinations.reduce((acc, dest) => {
    const country = dest.country || 'Autre';
    if (!acc[country]) acc[country] = [];
    acc[country].push(dest);
    return acc;
  }, {} as Record<string, DestinationCard[]>);
}

// Style chip colors
const STYLE_CHIPS: Record<string, { bg: string; text: string; label: string }> = {
  'nature': { bg: '#dcfce7', text: '#166534', label: '🌿 Nature' },
  'culture': { bg: '#fef3c7', text: '#92400e', label: '🏛️ Culture' },
  'city': { bg: '#e0e7ff', text: '#3730a3', label: '🏙️ City' },
  'food': { bg: '#fed7aa', text: '#9a3412', label: '🍽️ Food' },
};

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
            const name = d.title?.split('|')[0]?.trim() || d.slug?.split('-').map((w: string) =>
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ') || 'Destination';
            const country = d.country || '';
            const cluster = COUNTRY_CLUSTERS[country] || COUNTRY_CLUSTERS.default;

            return {
              id: d.id,
              name,
              slug: d.link || `/destinations/${d.slug}`,
              ...(d.slug === 'sicile-interieure' ? { slug: '/destinations/sicile' } : {}),
              country,
              region: d.region,
              style: mapCategoryToStyle(d.category || ''),
              duration: mapRegionToDuration(d.region || ''),
              description: d.excerpt || `Destination testée et recommandée par Heldonica.`,
              image: d.featured_image || DESTINATION_IMAGES[name] || DESTINATION_IMAGES[country] || DESTINATION_IMAGES.default,
              budget: 'Sur mesure',
              season: 'Nous consulter',
              verdict: DESTINATION_VERDICTS[name] || cluster.intro.split('.')[0] + '.',
              tags: cluster.tags,
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

  const groupedDestinations = useMemo(() => {
    if (countryFilter !== 'all') return { [countryFilter]: filteredDestinations };
    return groupByCountry(filteredDestinations);
  }, [filteredDestinations, countryFilter]);

  const totalDestinations = destinations.length;

  return (
    <>
      <Header />
      <main>
        {/* Hero Section - Mobile-first */}
        <section className="bg-gradient-to-br from-[#f8f6f4] to-white py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-[#83C5BE] font-semibold mb-4">
              Hub destinations
            </p>
            <h1 className="text-3xl md:text-5xl font-serif text-[#6b2a1a] mb-6 leading-tight">
              {loading ? 'Destinations en cours de chargement...' : 
                `${totalDestinations} destinations qu'on a arpentées dans tous les sens`}
            </h1>
            <p className="text-[#444] text-base md:text-lg max-w-3xl leading-relaxed">
              Pas en touristes pressés, en gens qui reviennent, qui testent, qui se trompent et qui recommandencent. 
              Ici, on te montre des terrains qu'on connaît vraiment, avec leur bon rythme, leur budget indicatif et notre verdict signé court.
            </p>
          </div>
        </section>

        {/* Sticky Filters */}
        <section className="bg-white pb-4 sticky top-0 z-10 border-b border-stone-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#6b2a1a] font-medium mb-1.5 text-xs uppercase tracking-wider">Pays</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 bg-white text-[#444] focus:border-[#83C5BE] focus:ring-2 focus:ring-[#83C5BE]/20 outline-none"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country === 'all' ? 'Tous les pays' : country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6b2a1a] font-medium mb-1.5 text-xs uppercase tracking-wider">Style</label>
                <select
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value as (typeof styleOptions)[number]['value'])}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 bg-white text-[#444] focus:border-[#83C5BE] focus:ring-2 focus:ring-[#83C5BE]/20 outline-none"
                >
                  {styleOptions.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6b2a1a] font-medium mb-1.5 text-xs uppercase tracking-wider">Durée</label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value as (typeof durationOptions)[number]['value'])}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2.5 bg-white text-[#444] focus:border-[#83C5BE] focus:ring-2 focus:ring-[#83C5BE]/20 outline-none"
                >
                  {durationOptions.map((duration) => (
                    <option key={duration.value} value={duration.value}>
                      {duration.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations by Country Clusters */}
        <section className="bg-white py-12 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="rounded-2xl border border-stone-200 p-10 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-stone-200 rounded w-48 mx-auto mb-4"></div>
                  <div className="h-2 bg-stone-100 rounded w-32 mx-auto"></div>
                </div>
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 p-10 text-center">
                <p className="text-lg font-semibold text-[#6b2a1a] mb-2">Aucun résultat avec ces filtres</p>
                <p className="text-[#444]/70 mb-5">
                  Élargis un peu le cadre, ou dis-nous ce que tu cherches vraiment.
                </p>
                <Link
                  href="/travel-planning-form"
                  className="inline-flex px-6 py-3 rounded-lg bg-[#83C5BE] text-white font-semibold hover:bg-[#83C5BE]/90 transition-colors"
                >
                  Nous écrire →
                </Link>
              </div>
            ) : (
              <div className="space-y-12 md:space-y-16">
                {Object.entries(groupedDestinations)
                  .filter(([_, dests]) => dests.length > 0)
                  .map(([country, dests]) => {
                    const cluster = COUNTRY_CLUSTERS[country] || COUNTRY_CLUSTERS.default;
                    const chipStyle = STYLE_CHIPS[dests[0]?.style] || { bg: '#f3f4f6', text: '#374151', label: '' };
                    
                    return (
                      <div key={country} className="relative">
                        {/* Country Header with Intro */}
                        <div className="mb-6 pb-4 border-b-2 border-[#6b2a1a]/10">
                          <h2 className="text-2xl md:text-3xl font-serif text-[#6b2a1a] mb-3">{country}</h2>
                          <p className="text-[#666] text-sm md:text-base leading-relaxed max-w-2xl">
                            {cluster.intro}
                          </p>
                          
                          {/* Country Tags */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {cluster.tags.map((tag) => (
                              <span 
                                key={tag} 
                                className="px-3 py-1 rounded-full text-xs font-medium bg-[#f8f6f4] text-[#6b2a1a] border border-stone-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          {/* Blog Link */}
                          <Link 
                            href={`/blog?search=${encodeURIComponent(cluster.blogKeyword)}`}
                            className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#83C5BE] hover:text-[#6b2a1a] font-medium transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                            </svg>
                            Articles sur {country.toLowerCase()} →
                          </Link>
                        </div>

                        {/* Destinations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {dests.map((item) => {
                            const itemChip = STYLE_CHIPS[item.style] || chipStyle;
                            return (
                              <article
                                key={item.id || `${item.name}-${item.slug}`}
                                className="rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white"
                              >
                                {/* Image with Style Chip */}
                                <div className="relative h-40 md:h-48 bg-stone-100">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  />
                                  <span 
                                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                                    style={{ backgroundColor: itemChip.bg, color: itemChip.text }}
                                  >
                                    {itemChip.label}
                                  </span>
                                </div>
                                
                                {/* Content */}
                                <div className="p-4 md:p-5">
                                  <h3 className="text-xl font-serif text-[#6b2a1a] mb-2">{item.name}</h3>
                                  <p className="text-sm text-[#666] leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                                  
                                  {/* Badges */}
                                  <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-[#f8f6f4] text-xs font-medium text-[#6b2a1a]">
                                      ⏱️ {item.duration} jours
                                    </span>
                                    {item.region && (
                                      <span className="px-3 py-1 rounded-full bg-[#83C5BE]/10 text-xs font-medium text-[#83C5BE]">
                                        {item.region}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Verdict */}
                                  <p className="text-xs text-[#888] italic mb-4 leading-relaxed">
                                    "{item.verdict}"
                                  </p>
                                  
                                  <Link
                                    href={item.slug}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6b2a1a] text-white text-sm font-semibold hover:bg-[#6b2a1a]/90 transition-all w-full justify-center"
                                  >
                                    Découvrir
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="5" y1="12" x2="19" y2="12"></line>
                                      <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                  </Link>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* CTA to Map */}
            <div className="mt-12 text-center">
              <Link
                href="/destinations/carte"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-[#83C5BE] text-[#83C5BE] font-semibold hover:bg-[#83C5BE] hover:text-white transition-all text-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
                Voir la carte interactive →
              </Link>
            </div>
          </div>
        </section>

        {/* Quiz Section */}
        <section className="bg-[#f8f6f4] py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <SlowTravelQuiz />
          </div>
        </section>
      </main>
      <Footer />

      {/* FAQ Schema for SEO */}
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
                  text: 'Heldonica partage des destinations authentiques hors des sentiers battus testées sur le terrain : Madère, Roumanie, Sicile, Suisse et d\'autres pépites européennes. Toutes nos destinations sont choisies pour leur caractère écoresponsable et leur richesse locale.',
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
              {
                '@type': 'Question',
                name: 'Comment sont choisies les destinations ?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Chaque destination est testée sur le terrain par l\'équipe Heldonica. On privilégie les endroits qui offrent une vraie immersion culturelle, un impact économique positif pour les communautés locales, et une expérience de voyage lente et authentique.',
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}