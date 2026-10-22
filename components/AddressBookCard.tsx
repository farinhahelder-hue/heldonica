import Link from 'next/link'
import {
  getAddressCategory,
  getAddressDestination,
  type AddressEntry,
} from '@/lib/address-book'

export default function AddressBookCard({ entry }: { entry: AddressEntry }) {
  const category = getAddressCategory(entry.category)
  const destination = getAddressDestination(entry.destination)
  const href = `/adresses/${entry.destination}/${entry.slug}`

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 transition-all duration-200 hover:border-eucalyptus/40 hover:shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-eucalyptus/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-eucalyptus">
          {category?.label ?? entry.category}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-charcoal/45">
          {entry.city}
        </span>
      </div>

      <h3 className="mb-2 font-serif text-xl text-mahogany">
        <Link href={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalyptus focus-visible:ring-offset-2">
          {entry.name}
        </Link>
      </h3>

      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-charcoal/70">
        {entry.lived}
      </p>

      {(entry.season || entry.mobility) && (
        <dl className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/55">
          {entry.season && (
            <div>
              <dt className="inline font-medium text-charcoal/70">Saison&nbsp;:</dt>{' '}
              <dd className="inline">{entry.season}</dd>
            </div>
          )}
          {entry.mobility && (
            <div>
              <dt className="inline font-medium text-charcoal/70">Accès&nbsp;:</dt>{' '}
              <dd className="inline">{entry.mobility}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
        <span className="text-xs text-charcoal/45">
          {destination?.name ?? entry.destination}
        </span>
        <Link
          href={href}
          className="text-sm font-semibold text-eucalyptus hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalyptus focus-visible:ring-offset-2"
        >
          Lire la fiche
        </Link>
      </div>
    </article>
  )
}
