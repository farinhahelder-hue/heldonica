import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import {
  ADDRESS_BOOK,
  getAddressCategory,
  getAddressDestination,
  getAddressEntriesByDestination,
  getAddressEntry,
} from '@/lib/address-book'
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo'

type Props = {
  params: Promise<{ destination: string; slug: string }>
}

export function generateStaticParams() {
  return ADDRESS_BOOK.map((entry) => ({
    destination: entry.destination,
    slug: entry.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destination: destinationSlug, slug } = await params
  const entry = getAddressEntry(destinationSlug, slug)
  const destination = getAddressDestination(destinationSlug)
  if (!entry || !destination) {
    return { title: 'Adresse introuvable | Heldonica' }
  }

  const title = `${entry.name} (${entry.city}) | Carnet d'adresses Heldonica`
  const description = entry.lived.slice(0, 155)

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/adresses/${entry.destination}/${entry.slug}`,
    },
    openGraph: {
      url: `${SITE_URL}/adresses/${entry.destination}/${entry.slug}`,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${entry.name} — carnet d'adresses Heldonica`,
        },
      ],
      locale: 'fr_FR',
      type: 'article',
      siteName: 'Heldonica',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@heldonica',
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function AddressEntryPage({ params }: Props) {
  const { destination: destinationSlug, slug } = await params
  const entry = getAddressEntry(destinationSlug, slug)
  const destination = getAddressDestination(destinationSlug)
  if (!entry || !destination) notFound()

  const category = getAddressCategory(entry.category)
  const siblings = getAddressEntriesByDestination(entry.destination)
  const index = siblings.findIndex((item) => item.slug === entry.slug)
  const previous = index > 0 ? siblings[index - 1] : undefined
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : undefined

  const mapQuery = encodeURIComponent(`${entry.name}, ${entry.city}, ${destination.name}`)
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  const placeLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: entry.name,
    description: entry.lived,
    address: {
      '@type': 'PostalAddress',
      addressLocality: entry.city,
    },
    url: `${SITE_URL}/adresses/${entry.destination}/${entry.slug}`,
    isPartOf: {
      '@type': 'ItemList',
      name: `Carnet d'adresses à ${destination.name}`,
      url: `${SITE_URL}/adresses/${entry.destination}`,
    },
  }

  return (
    <>
      <Header />
      <Breadcrumb />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeLd) }}
      />

      <main>
        <article>
          <header className="bg-cloud-dancer py-16 md:py-20">
            <div className="mx-auto max-w-4xl px-6">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
                <span className="rounded-full bg-eucalyptus/10 px-3 py-1 text-eucalyptus">
                  {category?.label ?? entry.category}
                </span>
                <Link
                  href={`/adresses/${destination.slug}`}
                  className="text-charcoal/50 hover:text-eucalyptus"
                >
                  {destination.name}
                </Link>
                <span className="text-charcoal/30">·</span>
                <span className="text-charcoal/50">{entry.city}</span>
              </div>

              <h1 className="mb-5 font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
                {entry.name}
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed text-charcoal/75">
                {entry.lived}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-eucalyptus px-5 py-2.5 text-sm font-semibold text-eucalyptus hover:bg-eucalyptus/5"
                >
                  Voir sur la carte
                </a>
                <Link
                  href={destination.destinationUrl}
                  className="text-sm font-semibold text-eucalyptus hover:underline"
                >
                  Le guide de {destination.name}
                </Link>
              </div>
            </div>
          </header>

          <div className="bg-white py-16">
            <div className="mx-auto grid max-w-4xl gap-10 px-6 md:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="mb-4 font-serif text-2xl text-mahogany">
                  Ce qu&apos;on a vécu
                </h2>
                <p className="leading-relaxed text-charcoal/75">{entry.lived}</p>

                {entry.sensory && (
                  <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-eucalyptus">
                      Le repère sensoriel
                    </p>
                    <p className="text-sm leading-relaxed text-charcoal/70">
                      {entry.sensory}
                    </p>
                  </div>
                )}
              </div>

              <aside className="space-y-5">
                <dl className="space-y-4 rounded-2xl border border-stone-200 p-5">
                  {entry.season && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/45">
                        Saison
                      </dt>
                      <dd className="mt-1 text-sm text-charcoal/80">{entry.season}</dd>
                    </div>
                  )}
                  {entry.mobility && (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/45">
                        Accès
                      </dt>
                      <dd className="mt-1 text-sm text-charcoal/80">{entry.mobility}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/45">
                      Destination
                    </dt>
                    <dd className="mt-1 text-sm text-charcoal/80">
                      <Link href={`/adresses/${destination.slug}`} className="hover:text-eucalyptus">
                        {destination.name}
                      </Link>
                    </dd>
                  </div>
                </dl>

                {entry.pitfall && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                      Ce qu&apos;on éviterait
                    </p>
                    <p className="text-sm leading-relaxed text-amber-900/80">
                      {entry.pitfall}
                    </p>
                  </div>
                )}

                <p className="text-xs leading-relaxed text-charcoal/45">
                  Fiche issue du Coffre des Savoirs Heldonica. Lieu traversé,
                  noté sur place, repris ici sans arrondi.
                </p>
              </aside>
            </div>
          </div>

          {(previous || next) && (
            <nav
              aria-label="Autres adresses de la destination"
              className="border-t border-stone-200 bg-stone-50 py-10"
            >
              <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 sm:flex-row sm:justify-between">
                {previous ? (
                  <Link
                    href={`/adresses/${previous.destination}/${previous.slug}`}
                    className="group text-sm"
                  >
                    <span className="block text-xs uppercase tracking-[0.14em] text-charcoal/45">
                      Fiche précédente
                    </span>
                    <span className="mt-1 block font-serif text-lg text-mahogany group-hover:text-eucalyptus">
                      {previous.name}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link
                    href={`/adresses/${next.destination}/${next.slug}`}
                    className="group text-left sm:text-right text-sm"
                  >
                    <span className="block text-xs uppercase tracking-[0.14em] text-charcoal/45">
                      Fiche suivante
                    </span>
                    <span className="mt-1 block font-serif text-lg text-mahogany group-hover:text-eucalyptus">
                      {next.name}
                    </span>
                  </Link>
                )}
              </div>
            </nav>
          )}
        </article>

        <section className="bg-mahogany py-14 text-white">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="mb-4 font-serif text-2xl">
              On l&apos;intègre à ton itinéraire ?
            </h2>
            <p className="mb-7 text-white/75">
              Cette adresse peut devenir une étape. On construit le reste autour
              de ton rythme.
            </p>
            <Link
              href={`/travel-planning-form?destination=${destination.slug}`}
              className="inline-flex rounded-lg bg-eucalyptus px-6 py-3 text-sm font-semibold text-white hover:bg-eucalyptus/90"
            >
              Planifier {destination.name} avec Heldonica
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
