'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MapWrapper from '@/components/MapWrapper';
import {
  destinationMarkers,
  getCountries,
  getRegions,
  getCategories,
  type DestinationMarker,
} from '@/lib/destinations-data';

// Filter options with translations
const categoryLabels: Record<DestinationMarker['category'], string> = {
  nature: 'Nature',
  culture: 'Culture',
  city: 'City break',
  food: 'Food & Gastro',
};

export default function MapClientPage() {
  const [countryFilter, setCountryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<DestinationMarker['category'] | 'all'>('all');

  const countries = getCountries();
  const regions = getRegions();
  const categories = getCategories();

  const filteredMarkers = useMemo(() => {
    return destinationMarkers.filter((marker) => {
      const countryOk = countryFilter === 'all' || marker.country === countryFilter;
      const regionOk = regionFilter === 'all' || marker.region === regionFilter;
      const categoryOk = categoryFilter === 'all' || marker.category === categoryFilter;
      return countryOk && regionOk && categoryOk;
    });
  }, [countryFilter, regionFilter, categoryFilter]);

  // Get regions available for the selected country
  const availableRegions = useMemo(() => {
    if (countryFilter === 'all') {
      return regions;
    }
    return Array.from(
      new Set(
        destinationMarkers
          .filter((m) => m.country === countryFilter)
          .map((m) => m.region)
      )
    ).sort();
  }, [countryFilter, regions]);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-16 md:py-24">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Carte interactive
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-mahogany mb-4">
              Explorez nos destinations sur la carte
            </h1>
            <p className="text-charcoal/80 text-lg max-w-2xl leading-relaxed">
              Cliquez sur les marqueurs pour découvrir chaque pépite, son atmosphere et son lien direct vers le guide complet.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-white/95 backdrop-blur-md pb-4 sticky top-[60px] lg:top-[72px] z-30 shadow-sm">
          <div className="container py-4">
            <div className="flex flex-wrap gap-3 md:gap-4 items-end">
              {/* Country Filter */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-eucalyptus mb-2">
                  Pays
                </label>
                <select
                  value={countryFilter}
                  onChange={(e) => {
                    setCountryFilter(e.target.value);
                    setRegionFilter('all');
                  }}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 bg-white text-charcoal focus:border-eucalyptus focus:ring-2 focus:ring-eucalyptus/20 transition-all"
                >
                  <option value="all">Tous les pays</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-eucalyptus mb-2">
                  Région
                </label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 bg-white text-charcoal focus:border-eucalyptus focus:ring-2 focus:ring-eucalyptus/20 transition-all"
                >
                  <option value="all">Toutes régions</option>
                  {availableRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-eucalyptus mb-2">
                  Catégorie
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as DestinationMarker['category'] | 'all')}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5 bg-white text-charcoal focus:border-eucalyptus focus:ring-2 focus:ring-eucalyptus/20 transition-all"
                >
                  <option value="all">Toutes catégories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryLabels[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results count */}
              <div className="self-center text-sm text-charcoal/70">
                {filteredMarkers.length} point{filteredMarkers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="bg-cloud-dancer py-8 md:py-12">
          <div className="container">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <MapWrapper
                markers={filteredMarkers}
                height="600px"
              />
            </div>

            {/* Attribution note */}
            <p className="text-xs text-charcoal/60 mt-4 text-center">
              Cartographie © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-eucalyptus transition-colors">OpenStreetMap</a> contributors
            </p>
          </div>
        </section>

        {/* Quick destinations list below map */}
        <section className="bg-white py-12 md:py-16">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-serif text-mahogany mb-8 text-center">
              Nos destinations en un coup d&apos;œil
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarkers.slice(0, 9).map((marker) => (
                <Link
                  key={marker.slug}
                  href={marker.url}
                  className="group rounded-xl border border-stone-200 p-4 hover:shadow-md hover:border-eucalyptus/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-mahogany/10 flex items-center justify-center flex-shrink-0 group-hover:bg-mahogany/20 transition-colors">
                      <span className="text-mahogany font-serif text-sm font-bold">
                        {marker.title.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.1em] text-eucalyptus font-semibold mb-1">
                        {marker.country}
                      </p>
                      <h3 className="font-serif font-bold text-mahogany text-sm mb-1 truncate">
                        {marker.title.split(',')[0]}
                      </h3>
                      <p className="text-xs text-charcoal/70 line-clamp-2">
                        {marker.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredMarkers.length > 9 && (
              <p className="text-center text-sm text-charcoal/60 mt-6">
                et {filteredMarkers.length - 9} autre{filteredMarkers.length - 9 !== 1 ? 's' : ''} destination{filteredMarkers.length - 9 !== 1 ? 's' : ''}...
              </p>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-cloud-dancer py-12 md:py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-serif text-mahogany mb-4">
              Tu veux un itinéraire sur mesure ?
            </h2>
            <p className="text-charcoal/75 mb-8">
              On transforme tes contraintes en carnet de voyage concret, avec destinations testées et séquence logique.
            </p>
            <Link
              href="/travel-planning-form"
              className="inline-flex px-8 py-3 rounded-xl bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
            >
              Créer mon voyage →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}