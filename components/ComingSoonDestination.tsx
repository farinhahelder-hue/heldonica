import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import Script from 'next/script'

interface ComingSoonDestinationProps {
  slug: string
  title: string
  country: string
  flag_emoji?: string
  teaser?: string
  hero_unsplash_url?: string
  featured_image?: string
  travel_style?: string
  best_season?: string
  avg_budget_couple_week?: number
}

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'

const STYLE_LABELS: Record<string, string> = {
  'slow-culture': 'Culture',
  'slow-nature': 'Nature',
  'nature': 'Nature',
  'culture': 'Culture',
  'city': 'Ville',
  'food': 'Food',
}

function formatBudget(amount?: number): string {
  if (!amount) return ''
  if (amount >= 1000) return `~${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k€/semaine/couple`
  return `~${amount}€/semaine/couple`
}

export default function ComingSoonDestination({
  slug, title, country, flag_emoji, teaser,
  hero_unsplash_url, featured_image, travel_style,
  best_season, avg_budget_couple_week,
}: ComingSoonDestinationProps) {
  const imgSrc = hero_unsplash_url || featured_image || HERO_FALLBACK
  const styleLabel = travel_style ? STYLE_LABELS[travel_style] || travel_style : ''

  return (
    <>
      <Header />
      <Script id="ga4-coming-soon" strategy="lazyOnload">{`
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'coming_soon_view', { destination: '${slug}' });
        }
      `}</Script>
      <main>
        <section className="relative min-h-[60vh] flex items-end overflow-hidden bg-stone-900">
          <Image
            src={imgSrc}
            alt={`${title} — bientôt sur Heldonica`}
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative container py-16 md:py-24">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">
              {flag_emoji} {country} — Bientôt
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-3xl mb-5 leading-tight">
              {title} — bientôt sur Heldonica
            </h1>
            {teaser && (
              <p className="text-white/80 max-w-2xl text-lg leading-relaxed">{teaser}</p>
            )}
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-3 gap-4">
              {styleLabel && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Style</p>
                  <p className="text-charcoal font-medium">{styleLabel}</p>
                </div>
              )}
              {best_season && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Meilleure saison</p>
                  <p className="text-charcoal font-medium">{best_season}</p>
                </div>
              )}
              {avg_budget_couple_week && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Budget indicatif</p>
                  <p className="text-charcoal font-medium">{formatBudget(avg_budget_couple_week)}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer py-20 md:py-28">
          <div className="container max-w-2xl text-center">
            <p className="text-4xl mb-6">🛠️</p>
            <h2 className="text-3xl font-serif text-mahogany mb-4">
              On prépare notre guide complet pour {title.toLowerCase()}
            </h2>
            <p className="text-charcoal/70 mb-8 max-w-lg mx-auto">
              On est en train de tester, arpenter et sélectionner les meilleures adresses.
              Sois notifié en avant-première quand le guide sera prêt.
            </p>
            <div className="max-w-md mx-auto mb-8">
              <NewsletterForm variant="inline" />
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-sm text-eucalyptus font-semibold hover:underline"
            >
              ← Voir toutes nos destinations
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
