'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DestinationCard from '@/components/DestinationCard'
import type { DestinationCardProps } from '@/components/DestinationCard'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'
import NewsletterForm from '@/components/NewsletterForm'

type RawDestination = Record<string, any>

const CONTINENT_TABS = [
  { value: 'all', label: 'Toutes', icon: '🌍' },
  { value: 'starred', label: 'Coups de cœur', icon: '⭐' },
  { value: 'Europe', label: 'Europe', icon: '🇪🇺' },
  { value: 'Méditerranée', label: 'Méditerranée', icon: '🌊' },
  { value: 'Amériques', label: 'Amériques', icon: '🌎' },
]

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'

function mapRawToCard(d: RawDestination): DestinationCardProps {
  return {
    slug: d.slug || '',
    title: d.title || d.name || d.slug || '',
    country: d.country || '',
    flag_emoji: d.flag_emoji || '',
    excerpt: d.excerpt || '',
    teaser: d.teaser || d.excerpt || '',
    hero_unsplash_url: d.hero_unsplash_url || '',
    featured_image: d.featured_image || '',
    status: d.status || 'draft',
    travel_style: d.travel_style || d.category || '',
    best_season: d.best_season || '',
    avg_budget_couple_week: d.avg_budget_couple_week || undefined,
    article_count: d.article_count || 0,
    coming_soon_date: d.coming_soon_date || undefined,
    priority_score: d.priority_score || 0,
  }
}

export default function DestinationsClient() {
  const [destinations, setDestinations] = useState<DestinationCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [continentFilter, setContinentFilter] = useState('all')

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch('/api/destinations')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        const raw = Array.isArray(data.destinations) ? data.destinations : []
        setDestinations(raw.map(mapRawToCard))
      } catch (err) {
        console.error('Error fetching destinations:', err)
        setDestinations([])
      } finally {
        setLoading(false)
      }
    }
    
    // Fallback: if no destinations loaded after 3 seconds, force stop loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)
    
    fetchDestinations().finally(() => clearTimeout(timeout))
  }, [])

  const starred = useMemo(() => destinations.filter(d => d.status === 'starred'), [destinations])
  const published = useMemo(() => destinations.filter(d => d.status === 'published'), [destinations])
  const comingSoon = useMemo(() => destinations.filter(d => d.status === 'coming_soon'), [destinations])

  const filteredPublished = useMemo(() => {
    let list = [...starred, ...published]
    if (continentFilter === 'starred') return starred
    if (continentFilter === 'all' || continentFilter === 'Toutes') return list
    if (continentFilter === 'Amériques') return list.filter(d => ['Colombie', 'Amérique du Sud'].includes(d.country))
    return list.filter(d => {
      if (continentFilter === 'Europe') return d.country !== 'Colombie'
      return false
    })
  }, [starred, published, continentFilter])

  const totalCount = destinations.length

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-[#f8f6f4] to-white py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Hub destinations
            </p>
            <h1 className="text-3xl md:text-5xl font-serif text-mahogany mb-6 leading-tight">
              Nos destinations slow travel en couple
            </h1>
            <p className="text-charcoal text-base md:text-lg max-w-3xl leading-relaxed">
              Toutes nos destinations testées sur le terrain — pas de contenu généré sans vécu.
            </p>
          </div>
        </section>

        <section className="bg-white pb-4 sticky top-0 z-10 border-b border-stone-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              {CONTINENT_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setContinentFilter(tab.value); if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'filtre_continent_utilise', { filtre: tab.value }) }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    continentFilter === tab.value
                      ? 'bg-eucalyptus text-white shadow-sm'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.value === 'starred' && starred.length > 0 && (
                    <span className={`ml-1 text-xs ${continentFilter === 'starred' ? 'text-white/80' : 'text-stone-400'}`}>
                      ({starred.length})
                    </span>
                  )}
                </button>
              ))}
              <Link
                href="/destinations/compare"
                className="ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-eucalyptus border border-eucalyptus/30 hover:bg-eucalyptus hover:text-white transition-all"
              >
                Comparer →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="rounded-2xl border border-stone-200 p-10 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-stone-200 rounded w-48 mx-auto"></div>
                  <div className="h-2 bg-stone-100 rounded w-32 mx-auto"></div>
                </div>
              </div>
            ) : filteredPublished.length === 0 && continentFilter !== 'all' ? (
              <div className="rounded-2xl border border-stone-200 p-10 text-center">
                <p className="text-lg font-semibold text-mahogany mb-2">Aucun résultat avec ce filtre</p>
                <p className="text-charcoal/70 mb-5">Élargis un peu le cadre.</p>
                <button onClick={() => setContinentFilter('all')} className="inline-flex px-6 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors">
                  Voir toutes les destinations →
                </button>
              </div>
            ) : (
              <div className="space-y-16">
                {continentFilter === 'all' && starred.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xl">⭐</span>
                      <h2 className="text-2xl font-serif text-mahogany">Nos coups de cœur</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {starred.map((d) => (
                        <DestinationCard key={`starred-${d.slug}`} {...d} />
                      ))}
                    </div>
                  </section>
                )}

                {filteredPublished.length > 0 && (
                  <section>
                    {(continentFilter === 'all' || continentFilter === 'Toutes') && starred.length > 0 && (
                      <h2 className="text-2xl font-serif text-mahogany mb-6">Toutes nos destinations</h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(continentFilter === 'starred' ? starred : filteredPublished).map((d) => (
                        <DestinationCard key={`pub-${d.slug}`} {...d} />
                      ))}
                    </div>
                  </section>
                )}

                {comingSoon.length > 0 && (continentFilter === 'all' || continentFilter === 'Europe' || continentFilter === 'Méditerranée') && (
                  <section className="rounded-2xl bg-stone-50 border border-stone-200 p-8 md:p-10">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-serif text-mahogany mb-2">Prochainement sur Heldonica</h2>
                      <p className="text-charcoal/70 max-w-lg mx-auto">
                        On explore ces destinations pour vous. Sois notifié en avant-première quand un nouveau guide sort.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {comingSoon.map((d) => (
                        <DestinationCard key={`cs-${d.slug}`} {...d} />
                      ))}
                    </div>
                    <div className="max-w-md mx-auto">
                      <NewsletterForm variant="inline" />
                    </div>
                  </section>
                )}
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                href="/destinations/carte"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-eucalyptus text-eucalyptus font-semibold hover:bg-eucalyptus hover:text-white transition-all text-lg"
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

        <section className="bg-cloud-dancer py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
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
            '@type': 'ItemList',
            name: 'Destinations slow travel en couple — Heldonica',
            description: 'Toutes nos destinations testées sur le terrain.',
            url: 'https://www.heldonica.fr/destinations',
            numberOfItems: filteredPublished.length,
            itemListElement: filteredPublished.filter(d => d.status !== 'coming_soon').map((d, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `https://www.heldonica.fr/destinations/${d.slug}`,
              name: d.title,
            })),
          }),
        }}
      />
    </>
  )
}
