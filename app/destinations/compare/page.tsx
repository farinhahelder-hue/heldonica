import { supabase } from '@/lib/supabase-client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DestinationComparison from '@/components/DestinationComparison'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getPageZones } from '@/lib/cms-zones'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Script from 'next/script'
import { buildPageMetadata } from '@/lib/page-metadata'

export const dynamic = 'force-dynamic'

const metadata: Metadata = {
  title: 'Comparer les destinations | Heldonica',
  description: 'Compare nos destinations slow travel : budget, saison, style et articles publiés. Trouve la destination qui te correspond.',
  alternates: { canonical: `${SITE_URL}/destinations/compare` },
  openGraph: {
    title: 'Comparer les destinations slow travel | Heldonica',
    description: 'Budget, saison, style de voyage — compare et choisis ta prochaine destination.',
    url: `${SITE_URL}/destinations/compare`,
    images: [{ url: `${SITE_URL}/og-compare.jpg`, width: 1200, height: 630 }],
    locale: 'fr_FR', type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-compare', metadata)
}


async function getDestinations() {
  if (!supabase) return []
  const { data } = await supabase
    .from('destinations_public')
    .select('slug, title, country, flag_emoji, teaser, hero_unsplash_url, featured_image, status, travel_style, best_season, avg_budget_couple_week, article_count, continent')
    .order('priority_score', { ascending: false })
  return (data || []) as any[]
}

export default async function ComparePage() {
  const destinations = await getDestinations()
  const zones = await getPageZones('destinations-compare')

  return (
    <>
      <Header />
      <Script id="compare-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Comparer les destinations slow travel | Heldonica',
          description: 'Compare nos destinations slow travel : budget, saison, style et articles publiés.',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Destinations', item: `${SITE_URL}/destinations` },
              { '@type': 'ListItem', position: 2, name: 'Comparer', item: `${SITE_URL}/destinations/compare` },
            ],
          },
        }),
      }} />
      <main>
        <InlineEditProvider page="destinations-compare" initialZones={zones}>
        <section className="bg-stone-50 py-16 md:py-24">
          <div className="container max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-eucalyptus mb-3">
              <EditableZone page="destinations-compare" zone="eyebrow" fallback="Comparateur" />
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-mahogany mb-4">
              <EditableZone page="destinations-compare" zone="title" fallback="Compare nos destinations" />
            </h1>
            <p className="text-stone-600 max-w-2xl text-sm leading-relaxed mb-2">
              <EditableZone page="destinations-compare" zone="description" fallback="Budget, saison, style de voyage, nombre d&apos;articles — sélectionne jusqu&apos;à 5 destinations et compare-les pour trouver celle qui te correspond." />
            </p>
          </div>
        </section>
        </InlineEditProvider>

        <section className="py-12 md:py-16">
          <div className="container max-w-6xl">
            <DestinationComparison destinations={destinations} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
