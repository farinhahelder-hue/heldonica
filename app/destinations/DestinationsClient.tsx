'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import DestinationCard from '@/components/DestinationCard'
import type { DestinationCardProps } from '@/components/DestinationCard'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'
import NewsletterForm from '@/components/NewsletterForm'
import { useContentLoader } from '@/hooks/useContentLoader'
import EditableZone from '@/components/inline-edit/EditableZone'

type RawDestination = Record<string, any>

const CONTINENT_TABS_DEFAULT = [
  { value: 'all', label: 'Toutes', icon: '' },
  { value: 'starred', label: 'Coups de cœur', icon: '' },
  { value: 'Europe', label: 'Europe', icon: '' },
  { value: 'Méditerranée', label: 'Méditerranée', icon: '' },
  { value: 'Amériques', label: 'Amériques', icon: '' },
]

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
  const { settings } = useContentLoader()
  const [destinations, setDestinations] = useState<DestinationCardProps[]>([])
  const [loading, setLoading] = useState(true)
  const [continentFilter, setContinentFilter] = useState('all')

  const tabs = (() => {
    const raw = settings?.destinations_tabs_json
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as { value: string; label: string; icon: string }[]
      } catch {}
    }
    return CONTINENT_TABS_DEFAULT
  })()

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
      if (continentFilter === 'Europe') return !['Colombie'].includes(d.country) && d.country !== 'Amérique du Sud'
      if (continentFilter === 'Méditerranée') return ['Italie', 'Sicile', 'Sardaigne', 'Espagne', 'Grèce', 'Malte', 'Maroc', 'Portugal', 'Monténégro'].includes(d.country)
      return false
    })
  }, [starred, published, continentFilter])

  const totalCount = destinations.length

  return (
    <>
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-[#EFE9DF] border-b border-[#E2D9C8] py-16 md:py-24 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Ces trois textes passaient par settings.destinations_hub_*, clés
                qui n'ont jamais existé dans site_settings : le composant servait
                donc ses littéraux. Ils sont désormais pilotés par les zones. */}
            <p className="text-[11px] uppercase tracking-[0.22em] text-eucalyptus font-medium mb-4">
              <EditableZone page="destinations" zone="hero_badge" fallback="Atlas & carnets de route" />
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-normal text-mahogany mb-6 leading-tight">
              <EditableZone page="destinations" zone="hero_title" fallback="Nos destinations slow travel en couple" />
            </h1>
            <p className="text-charcoal/80 text-base md:text-lg max-w-3xl leading-relaxed">
              <EditableZone
                page="destinations"
                zone="hero_subtitle"
                type="textarea"
                fallback="Toutes nos destinations testées sur le terrain — pas de contenu généré sans vécu."
              />
            </p>
          </div>
        </section>

        <section className="bg-[#F7F3EC]/95 backdrop-blur-sm sticky top-[68px] lg:top-[80px] z-30 border-b border-[#DED5C6]">
          <div className="max-w-5xl mx-auto px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setContinentFilter(tab.value); if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'filtre_continent_utilise', { filtre: tab.value }) }}
                  aria-pressed={continentFilter === tab.value}
                  className={`inline-flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] font-medium transition-colors ${
                    continentFilter === tab.value
                      ? 'bg-mahogany text-[#FAF7F2]'
                      : 'bg-transparent text-charcoal/75 hover:text-mahogany border border-[#D8CEBE]'
                  }`}
                >
                  {tab.icon ? <span>{tab.icon}</span> : null}
                  <span>{tab.label}</span>
                  {tab.value === 'starred' && starred.length > 0 && (
                    <span className={`ml-0.5 text-[11px] ${continentFilter === 'starred' ? 'text-[#FAF7F2]/80' : 'text-charcoal/55'}`}>
                      ({starred.length})
                    </span>
                  )}
                </button>
              ))}
              <Link
                href="/destinations/compare"
                className="ml-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] font-medium text-mahogany border-b border-mahogany/30 pb-0.5 hover:text-eucalyptus hover:border-eucalyptus transition-colors"
              >
                Comparer
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#F7F3EC] py-12 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-10 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-[#E6DEC8] rounded-sm w-48 mx-auto"></div>
                  <div className="h-2 bg-[#EFE9DF] rounded-sm w-32 mx-auto"></div>
                </div>
              </div>
            ) : filteredPublished.length === 0 && continentFilter !== 'all' ? (
              <div className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-10 text-center">
                <p className="text-lg font-serif text-mahogany mb-2">Aucun résultat avec ce filtre</p>
                <p className="text-charcoal/70 mb-5">Élargis un peu le cadre.</p>
                <button onClick={() => setContinentFilter('all')} className="inline-flex px-6 py-2.5 rounded-sm bg-action text-[#FAF7F2] text-sm font-medium hover:bg-action-fonce transition-colors">
                  Voir toutes les destinations
                </button>
              </div>
            ) : (
              <div className="space-y-16">
                {continentFilter === 'all' && starred.length > 0 && (
                  <section>
                    <div className="flex items-baseline justify-between border-b border-[#DED5C6] pb-3 mb-8">
                      <h2 className="text-2xl md:text-3xl font-serif font-normal text-mahogany">
                        <EditableZone page="destinations" zone="section_curated_title" fallback="Nos coups de cœur" />
                      </h2>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-eucalyptus font-medium">Sélection du carnet</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                      {starred.map((d) => (
                        <DestinationCard key={`starred-${d.slug}`} {...d} />
                      ))}
                    </div>
                  </section>
                )}

                {filteredPublished.length > 0 && (
                  <section>
                    {(continentFilter === 'all' || continentFilter === 'Toutes') && starred.length > 0 && (
                      <div className="flex items-baseline justify-between border-b border-[#DED5C6] pb-3 mb-8">
                        <h2 className="text-2xl md:text-3xl font-serif font-normal text-mahogany">
                          <EditableZone page="destinations" zone="section_all_title" fallback="Toutes nos destinations" />
                        </h2>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                      {(continentFilter === 'starred' ? starred : filteredPublished).map((d) => (
                        <DestinationCard key={`pub-${d.slug}`} {...d} />
                      ))}
                    </div>
                  </section>
                )}

                {comingSoon.length > 0 && (continentFilter === 'all' || continentFilter === 'Europe' || continentFilter === 'Méditerranée') && (
                  <section className="rounded-sm bg-[#EFE9DF] border border-[#DED5C6] p-8 md:p-10">
                    <div className="text-center mb-8">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-charcoal/55 mb-2">Carnets en cours d&apos;écriture</p>
                      <h2 className="text-2xl font-serif font-normal text-mahogany mb-2">
                        <EditableZone page="destinations" zone="section_soon_title" fallback="Prochainement sur Heldonica" />
                      </h2>
                      <p className="text-charcoal/75 max-w-lg mx-auto text-sm leading-relaxed">
                        <EditableZone
                          page="destinations"
                          zone="section_soon_text"
                          type="textarea"
                          fallback="On explore ces destinations pour toi. Sois notifié en avant-première quand un nouveau guide sort."
                        />
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {comingSoon.map((d) => (
                        <DestinationCard key={`cs-${d.slug}`} {...d} />
                      ))}
                    </div>
                    <div className="max-w-md mx-auto rounded-sm bg-[#1E1A17] border border-[#332C27] px-6 py-5">
                      <NewsletterForm variant="inline" />
                    </div>
                  </section>
                )}
              </div>
            )}

            <div className="mt-14 text-center">
              <Link
                href="/destinations/carte"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-sm border border-mahogany/35 text-mahogany text-sm font-medium tracking-wide hover:bg-mahogany hover:text-[#FAF7F2] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                  <line x1="8" y1="2" x2="8" y2="18"></line>
                  <line x1="16" y1="6" x2="16" y2="22"></line>
                </svg>
                Explorer la carte des carnets
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#EFE9DF] border-t border-[#E2D9C8] py-12 md:py-16 px-4">
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
