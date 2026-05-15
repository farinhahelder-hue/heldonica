import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'

export const metadata: Metadata = {
  title: 'Roumanie slow travel | Guide Heldonica',
  description:
    'Guide Roumanie: Timisoara, Bucarest, Sibiu, Transylvanie. Destinations slow travel.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie',
  },
  openGraph: {
    title: 'Roumanie slow travel | Guide Heldonica',
    url: 'https://www.heldonica.fr/destinations/roumanie',
  },
}

const subNav = [
  { label: 'Timisoara', href: '/destinations/timisoara' },
  { label: 'Bucarest', href: '/destinations/roumanie/bucarest' },
  { label: 'Sibiu', href: '/destinations/roumanie/sibiu' },
  { label: 'Transylvanie', href: '/destinations/roumanie/transylvanie' },
]

export default function RoumaniePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Destinations
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Roumanie
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Timisoara, Bucarest, Transylvanie. Le pays qu on redécouvre.
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
              La Roumanie, c est la surprise.
              <strong>Timisoara l autrichienne, Bucarest la dynamique, Transylvanie la legendaire.</strong>
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              On y va pour les villages保加利亚, les chateaux de Dracula,
              les Monasteres paintes. Mais on reste pour les gens,
              le prix, et ce sentiment d etre alle quelque part
              qui n est pas encore touristique a mort.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Nos destinations
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link
                href="/destinations/timisoara"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Timisoara
                </h3>
                <p className="text-stone-600 text-sm">
                  Ville hongroise. Art Nouveau, gardens, vibe europeenne.
                </p>
              </Link>
              <Link
                href="/destinations/roumanie/bucarest"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Bucarest
                </h3>
                <p className="text-stone-600 text-sm">
                  Capitale. Macro, culture, vie nocturne.
                </p>
              </Link>
              <Link
                href="/destinations/roumanie/sibiu"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Sibiu
                </h3>
                <p className="text-stone-600 text-sm">
                  Ville saxonne. Fetes, architecture, montagne.
                </p>
              </Link>
              <Link
                href="/destinations/roumanie/transylvanie"
                className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400 transition-colors"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2">
                  Transylvanie
                </h3>
                <p className="text-stone-600 text-sm">
                  Villages, chateaux, legends.
                </p>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                Quand y aller
              </h3>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Mai - Juin:</strong> Ideal, nature verte</li>
                <li><strong>Septembre:</strong> Vendanges, tarifs OK</li>
                <li><strong>Decembre:</strong> Marche de Noel</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                Budget couple
              </h3>
              <ul className="space-y-2 text-stone-600">
                <li><strong>Hébergement:</strong> 50-100€ /nuit</li>
                <li><strong>Repas:</strong> 20-40€</li>
                <li><strong>Vol:</strong> ~150€ A/R</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              En voir plus
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/destinations/timisoara"
                className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
              >
                Timisoara →
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:border-amber-400 transition-colors"
              >
                Articles Roumanie →
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}