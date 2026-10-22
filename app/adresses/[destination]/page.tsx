import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import AddressBookCard from '@/components/AddressBookCard'
import {
  ADDRESS_CATEGORIES,
  getAddressDestination,
  getAddressDestinations,
  getAddressEntriesByDestination,
} from '@/lib/address-book'
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo'

type Props = {
  params: Promise<{ destination: string }>
}

export function generateStaticParams() {
  return getAddressDestinations().map((destination) => ({
    destination: destination.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destination: slug } = await params
  const destination = getAddressDestination(slug)
  if (!destination) {
    return { title: 'Carnet d’adresses introuvable | Heldonica' }
  }

  const title = `Carnet d'adresses à ${destination.name} | Heldonica`
  const description = `${destination.intro} Saison, accès et pièges évités : les fiches vécues de notre carnet d'adresses à ${destination.name}.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/adresses/${destination.slug}` },
    openGraph: {
      url: `${SITE_URL}/adresses/${destination.slug}`,
      title,
      description,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `Carnet d'adresses à ${destination.name} — Heldonica`,
        },
      ],
      locale: 'fr_FR',
      type: 'website',
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

export default async function AddressDestinationPage({ params }: Props) {
  const { destination: slug } = await params
  const destination = getAddressDestination(slug)
  if (!destination) notFound()

  const entries = getAddressEntriesByDestination(destination.slug)
  if (entries.length === 0) notFound()

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Carnet d'adresses à ${destination.name}`,
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
        <section className="bg-cloud-dancer py-20 md:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-mahogany">
              Carnet d&apos;adresses
            </p>
            <h1 className="mb-5 font-serif text-4xl font-light leading-tight text-stone-900 md:text-5xl">
              {destination.name}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-charcoal/70">
              {destination.intro}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href={destination.destinationUrl}
                className="inline-flex rounded-lg bg-eucalyptus px-5 py-2.5 text-sm font-semibold text-white hover:bg-eucalyptus/90"
              >
                Le guide complet de {destination.name}
              </Link>
              <Link
                href="/adresses"
                className="text-sm font-semibold text-eucalyptus hover:underline"
              >
                Tout le carnet d&apos;adresses
              </Link>
            </div>
          </div>
        </section>

        <div className="bg-stone-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            {ADDRESS_CATEGORIES.map((category) => {
              const group = entries.filter((entry) => entry.category === category.key)
              if (group.length === 0) return null
              const anchor = `adresses-${category.key}`
              return (
                <section key={category.key} id={anchor} className="mb-14 last:mb-0">
                  <div className="mb-5 flex items-baseline justify-between gap-4">
                    <h2 className="font-serif text-2xl text-mahogany">{category.label}</h2>
                    <span className="text-xs uppercase tracking-[0.14em] text-charcoal/45">
                      {group.length} {group.length > 1 ? 'fiches' : 'fiche'}
                    </span>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((entry) => (
                      <AddressBookCard key={entry.slug} entry={entry} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </div>

        <section className="border-t border-stone-200 bg-white py-14">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="mb-4 font-serif text-2xl text-mahogany">
              On te prépare le même voyage, à ton rythme.
            </h2>
            <p className="mb-7 text-charcoal/65">
              Les adresses du carnet servent de base. L&apos;itinéraire, lui, se
              construit avec toi.
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
