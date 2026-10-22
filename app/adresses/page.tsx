import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import AddressBookCard from '@/components/AddressBookCard'
import {
  ADDRESS_BOOK,
  ADDRESS_CATEGORIES,
  countAddressEntries,
  getAddressCountsByCategory,
  getAddressCountsByDestination,
  getAddressDestinations,
  isAddressCategory,
  type AddressCategory,
} from '@/lib/address-book'
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo'

export const metadata: Metadata = {
  title: "Carnet d'adresses | Les lieux qu'on a vécus | Heldonica",
  description:
    "Le carnet d'adresses Heldonica : les lieux qu'on a réellement traversés, avec la saison, l'accès et ce qu'on éviterait la prochaine fois.",
  alternates: {
    canonical: `${SITE_URL}/adresses`,
  },
  openGraph: {
    url: `${SITE_URL}/adresses`,
    title: "Carnet d'adresses | Heldonica",
    description:
      "Les lieux qu'on a réellement vécus, classés par destination et par envie. Aucune fiche achetée.",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Carnet d'adresses Heldonica" }],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Carnet d'adresses | Heldonica",
    description:
      "Les lieux qu'on a réellement vécus, classés par destination et par envie.",
    creator: '@heldonica',
    images: [DEFAULT_OG_IMAGE],
  },
}

type AddressSearchParams = {
  destination?: string
  type?: string
}

function buildHref(
  current: AddressSearchParams,
  patch: { destination?: string; type?: string }
): string {
  const params = new URLSearchParams()
  const destination = patch.destination !== undefined ? patch.destination : current.destination
  const type = patch.type !== undefined ? patch.type : current.type
  if (destination && destination !== 'toutes') params.set('destination', destination)
  if (type && type !== 'toutes') params.set('type', type)
  const query = params.toString()
  return query ? `/adresses?${query}` : '/adresses'
}

const ACTIVE_FILTER = 'bg-eucalyptus text-white border-transparent'
const INACTIVE_FILTER =
  'bg-white text-eucalyptus/80 border border-eucalyptus/40 hover:bg-eucalyptus/5'

export default async function AddressBookPage({
  searchParams,
}: {
  searchParams: Promise<AddressSearchParams>
}) {
  const params = await searchParams
  const destinations = getAddressDestinations()
  const activeDestination = destinations.some((destination) => destination.slug === params.destination)
    ? params.destination
    : undefined
  const activeType: AddressCategory | undefined = isAddressCategory(params.type)
    ? params.type
    : undefined

  const entries = ADDRESS_BOOK.filter((entry) => {
    if (activeDestination && entry.destination !== activeDestination) return false
    if (activeType && entry.category !== activeType) return false
    return true
  })

  const destinationCounts = getAddressCountsByDestination()
  const categoryCounts = getAddressCountsByCategory(
    activeDestination
      ? ADDRESS_BOOK.filter((entry) => entry.destination === activeDestination)
      : ADDRESS_BOOK
  )

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Carnet d'adresses Heldonica",
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      url: `${SITE_URL}/adresses/${entry.destination}/${entry.slug}`,
    })),
  }

  return (
    <>
      <Header />
      <Breadcrumb />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <main>
        <section className="bg-cloud-dancer py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mahogany">
              Carnet d&apos;adresses
            </p>
            <h1 className="mb-5 font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
              Les lieux qu&apos;on a vécus, pas ceux qu&apos;on a recopiés.
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-charcoal/70">
              Chaque fiche vient d&apos;un lieu où on est passés. On y met la saison,
              l&apos;accès, ce qu&apos;on a ressenti et ce qu&apos;on éviterait la prochaine
              fois.
            </p>
            <p className="mt-5 text-sm text-charcoal/50">
              {countAddressEntries()} fiches · {destinations.length} destinations ouvertes
            </p>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white py-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-center gap-2" aria-label="Filtrer par destination">
              <Link
                href={buildHref(params, { destination: 'toutes' })}
                aria-current={!activeDestination ? 'page' : undefined}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !activeDestination ? ACTIVE_FILTER : INACTIVE_FILTER
                }`}
              >
                Toutes les destinations
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                  {countAddressEntries()}
                </span>
              </Link>
              {destinations.map((destination) => {
                const isActive = activeDestination === destination.slug
                return (
                  <Link
                    key={destination.slug}
                    href={buildHref(params, { destination: destination.slug })}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? ACTIVE_FILTER : INACTIVE_FILTER
                    }`}
                  >
                    {destination.name}
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                      {destinationCounts[destination.slug] ?? 0}
                    </span>
                  </Link>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Filtrer par envie">
              <Link
                href={buildHref(params, { type: 'toutes' })}
                aria-current={!activeType ? 'page' : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  !activeType ? ACTIVE_FILTER : INACTIVE_FILTER
                }`}
              >
                Toutes les envies
              </Link>
              {ADDRESS_CATEGORIES.map((category) => {
                const isActive = activeType === category.key
                const count = categoryCounts[category.key] ?? 0
                return (
                  <Link
                    key={category.key}
                    href={buildHref(params, { type: category.key })}
                    aria-current={isActive ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? ACTIVE_FILTER : INACTIVE_FILTER
                    }`}
                  >
                    {category.label}
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                      {count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-stone-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            {entries.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <AddressBookCard key={entry.slug} entry={entry} />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-8 text-center">
                <p className="mb-3 font-serif text-xl text-mahogany">
                  Rien dans ce filtre pour l&apos;instant.
                </p>
                <p className="mb-5 text-sm text-charcoal/60">
                  Le carnet s&apos;ouvre destination par destination. En attendant, le
                  guide de la destination reste le bon point de départ.
                </p>
                <Link
                  href="/destinations"
                  className="inline-flex rounded-lg bg-eucalyptus px-5 py-3 text-sm font-semibold text-white hover:bg-eucalyptus/90"
                >
                  Voir les destinations
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-8 text-center font-serif text-3xl text-mahogany">
              Comment une adresse entre ici
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-eucalyptus">
                  1. On y va
                </p>
                <p className="text-sm leading-relaxed text-charcoal/70">
                  Pas de fiche sans passage sur place. Le lieu est traversé, pas
                  seulement repéré sur une carte.
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-eucalyptus">
                  2. On note le réel
                </p>
                <p className="text-sm leading-relaxed text-charcoal/70">
                  La saison, l&apos;accès, le moment de la journée, ce qui nous a
                  marqués et ce qu&apos;on éviterait.
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-eucalyptus">
                  3. On garde la trace
                </p>
                <p className="text-sm leading-relaxed text-charcoal/70">
                  Chaque fiche renvoie à notre Coffre des Savoirs. Si on n&apos;a pas
                  vécu, on ne publie pas.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-stone-50 py-14">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="mb-4 font-serif text-2xl text-mahogany">
              Tu veux ces adresses dans un itinéraire qui te ressemble ?
            </h2>
            <p className="mb-7 text-charcoal/65">
              On part de ton rythme, de tes dates et de ce que tu aimes vraiment.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/travel-planning"
                className="inline-flex rounded-lg bg-eucalyptus px-6 py-3 text-sm font-semibold text-white hover:bg-eucalyptus/90"
              >
                Voir le Travel Planning
              </Link>
              <Link
                href="/blog"
                className="text-sm font-semibold text-eucalyptus hover:underline"
              >
                Lire nos carnets de route
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
