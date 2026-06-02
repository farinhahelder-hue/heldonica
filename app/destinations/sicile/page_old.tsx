import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'

const faqSicileSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Quand aller en Sicile ?", "acceptedAnswer": { "@type": "Answer", "text": "Mai-juin ou septembre-octobre pour eviter la chaleur et les foules." }},
    { "@type": "Question", "name": "Comment aller en Sicile ?", "acceptedAnswer": { "@type": "Answer", "text": "Vol directo Catane ou Palerme depuis Paris (2h). Ferries depuis Naples ou Genes." }},
    { "@type": "Question", "name": "Budget Sicile ?", "acceptedAnswer": { "@type": "Answer", "text": "Environ 90-130€/jour. Petit budget possibile avec Airbnb et trattorias." }}
  ]
};

export const metadata: Metadata = {
  title: 'Sicile slow travel | Guide Heldonica',
  description:
    'Guide Sicile: ile mediterraneenne. Etna, temples, mer. Le meilleur de l italie.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile',
  },
}

const subNav = [
  { label: 'Catane', href: '/destinations/sicile/catane' },
  { label: 'Palerme', href: '/destinations/sicile/palerme' },
  { label: 'Taormine', href: '/destinations/sicile/taormine' },
  { label: 'Syracuse', href: '/destinations/sicile/syracuse' },
]

export default function SicilePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSicileSchema) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm font-medium mb-4">
              Destinations
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Sicile
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              L ile mediterraneenne. Etna, temples grecs, mer.
            </p>
          </div>
        </section>

        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-amber-700 whitespace-nowrap text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              La Sicile, c est l ile qu on voit dans les films.
              <strong>L Etna, les temples grecs, les couleurs.</strong>
              Palermo, Catane, et les petits villages.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              La cuisine sicilienne, c est la meilleure.
              <strong>Arancini, cannoli, pasta.</strong>
              Et le mer toujours la.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Zones</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/destinations/sicile/catane" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Catane</h3>
                <p className="text-stone-600 text-sm">Est. Volcan, baroque.</p>
              </Link>
              <Link href="/destinations/sicile/palerme" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Palerme</h3>
                <p className="text-stone-600 text-sm">Ouest. Capitale, palais.</p>
              </Link>
              <Link href="/destinations/sicile/taormine" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Taormine</h3>
                <p className="text-stone-600 text-sm">Est. Theatre, vue mer.</p>
              </Link>
              <Link href="/destinations/sicile/syracuse" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Syracuse</h3>
                <p className="text-stone-600 text-sm">Sud-est. Antique.</p>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Quand</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Avril - Juin: Ideal</li>
                <li>Septembre: Parfait</li>
                <li>Juillet - Aout: Chaud</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Budget</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Hotel: 100-180€</li>
                <li>Repas: 35-55€</li>
                <li>Vol: ~120€</li>
              </ul>
            </div>
          </section>

          <Link href="/destinations" className="text-amber-700">← Retour Destinations</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}