'use client'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'

export const metadata: Metadata = {
  title: 'Timisoara slow travel | Guide Heldonica',
  description:
    'Guide Timisoara: ville hongroise, architecture Art Nouveau, bars,parks.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/timisoara',
  },
}

const pepites = [
  {
    title: 'Piata Unirii',
    description: 'La place centrale. Cathedrale, opera, cafes en terrase.',
    icon: '🏛️',
    address: 'Timisoara',
  },
  {
    title: 'Jardins Botanique',
    description: 'Le plus grand jardin botanique de Roumanie. Roses,serres.',
    icon: '🌹',
    address: 'Strada A-I. Cuza',
  },
  {
    title: 'Strada Mercy',
    description: 'L artery avec les Batyi. Bars, restaurants, boutiques.',
    icon: '🍸',
    address: 'Strada Mercy',
  },
  {
    title: 'Muzeul de Arta',
    description: 'Musee d art. Collection de peinture roumaine.',
    icon: '🎨',
    address: 'Piata Unirii',
  },
  {
    title: 'Parcul Civic',
    description: 'Le parc municipal. Promenade, cafes, gens du coin.',
    icon: '🌳',
    address: 'Parcul Civic',
  },
  {
    title: 'Punctsa Piata 700',
    description: 'Le QG de la revolution. Symbolique et historique.',
    icon: '🇷🇴',
    address: 'Piata Victoriei',
  },
]

const navLinks = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Roumanie', href: '/destinations/roumanie' },
]

export default function TimisoaraPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Roumanie
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Timisoara
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Ville hongroise, architecture Art Nouveau, gardens.
              La petite Vienne des Carpates.
            </p>
          </div>
        </section>

        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-stone-500 hover:text-amber-700">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              Timisoara, c est la surprise.
              On y va pour Bucarest, mais on reste pour Timisoara.
              <strong>Une ville europeenne a petit prix.</strong>
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              L architecture autrichienne, les cafes sur les places,
              la vie nocturne active. C est la Troisieme ville de Roumanie
              mais on dirait une ville autrichienne.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Ce qu on a deniché
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {pepites.map((pepite, idx) => (
                <div key={idx} className="p-6 bg-white rounded-lg border border-stone-200">
                  <div className="text-2xl mb-2">{pepite.icon}</div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">
                    {pepite.title}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {pepite.description}
                  </p>
                  <p className="text-stone-400 text-xs mt-2">{pepite.address}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">Ou dormir</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li><strong>Hotel Maestrand:</strong> Centre, 70-100€</li>
                <li><strong>Pensiunea Nobles:</strong> charme, 50-70€</li>
                <li><strong>Airbnb:</strong> Apparts centre</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">Ou manger</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li><strong>Mer元:</strong> Cuisine locale, reservation</li>
                <li><strong>Conviva:</strong> Gastro pub, bon rapport</li>
                <li><strong>Barista:</strong> Cafe de specialty</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Aproximité</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/destinations/roumanie" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100 transition-colors">
                <span className="text-stone-700">Roumanie</span>
                <span className="block text-xs text-stone-500 mt-1">~2h vol</span>
              </Link>
              <div className="p-4 bg-stone-100 rounded-lg text-center">
                <span className="text-stone-700">Hongrie</span>
                <span className="block text-xs text-stone-500 mt-1">~5h bus</span>
              </div>
              <div className="p-4 bg-stone-100 rounded-lg text-center">
                <span className="text-stone-700">Serbie</span>
                <span className="block text-xs text-stone-500 mt-1">~4h bus</span>
              </div>
            </div>
          </section>

          <section>
            <Link href="/destinations/roumanie" className="text-amber-700 hover:underline">
              ← Retour Roumanie
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}