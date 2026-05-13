'use client'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Colombie slow travel | Guide Heldonica',
  description:
    'Guide Colombie: Bogota, Medellin, Valle del Cauca. Cafe, salsa, nature.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/colombie',
  },
}

const subNav = [
  { label: 'Bogota', href: '/destinations/colombie/bogota' },
  { label: 'Medellin', href: '/destinations/colombie/medellin' },
  { label: 'Cali', href: '/destinations/colombie/cali' },
  { label: 'Cartago', href: '/destinations/colombie/cartago' },
]

export default function ColombiePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm font-medium mb-4">
              Destinations
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Colombie
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Cafe, salsa, Emeraude. Le pays qui change.
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

        <div className="max-w-4-xl mx-auto px-4 py-12">
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              La Colombie, c est le retour.
              <strong>La transformation est incredible.</strong>
              Bogota, Medellin, et le Valle del Cauca.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              Le cafe, la salsa, les gens.
              <strong>Et les emeraudes -- bien sur.</strong>
              L ile trouve sa place sur la carte du monde.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Villes</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/destinations/colombie/bogota" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Bogota</h3>
                <p className="text-stone-600 text-sm">Capitale. 2600m, culture.</p>
              </Link>
              <Link href="/destinations/colombie/medellin" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Medellin</h3>
                <p className="text-stone-600 text-sm">Ville de l eternel打印. Transformation.</p>
              </Link>
              <Link href="/destinations/colombie/cali" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Cali</h3>
                <p className="text-stone-600 text-sm">Salsa. Valle del Cauca.</p>
              </Link>
              <Link href="/destinations/colombie/cartago" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Cartago</h3>
                <p className="text-stone-600 text-sm">Zone cafe. Tradition.</p>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Quand</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Decembre - Avril: Sec</li>
                <li>Mai - Novembre: Pluies</li>
                <li>Juillet - Aout: Festivals</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Budget</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Hotel: 40-100€</li>
                <li>Repas: 15-30€</li>
                <li>Vol: ~700€</li>
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