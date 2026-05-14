'use client'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Roumanie slow travel | Guide Heldonica',
  description:
    'Guide Roumanie: Timisoara, Bucarest, Transylvanie. Chateaux, villages.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie',
  },
}

const subNav = [
  { label: 'Timisoara', href: '/destinations/roumanie/timisoara' },
  { label: 'Bucarest', href: '/destinations/roumanie/bucarest' },
  { label: 'Sibiu', href: '/destinations/roumanie/sibiu' },
  { label: 'Cluj', href: '/destinations/roumanie/cluj' },
  { label: 'Brasov', href: '/destinations/roumanie/brasov' },
]

export default function RoumaniePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm font-medium mb-4">Destinations</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Roumanie</h1>
            <p className="text-xl text-stone-300 max-w-2xl">Chateaux, villages, Transylvanie. Le pays qui change.</p>
          </div>
        </section>

        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
            {subNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-stone-600 hover:text-amber-700 whitespace-nowrap text-sm font-medium">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              La Roumanie, c est la surprise.
              <strong>Timisoara autrichienne, Bucarest dynamique, Transylvanie legendaire.</strong>
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              Les villages, les chateaux de Dracula, les monasteres paintes.
              <strong>Et les gens -- ils sont accueillants.</strong>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Villes</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/destinations/roumanie/timisoara" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Timisoara</h3>
                <p className="text-stone-600 text-sm">Art Nouveau, jardins.</p>
              </Link>
              <Link href="/destinations/roumanie/bucarest" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Bucarest</h3>
                <p className="text-stone-600 text-sm">Capitale, Macro.</p>
              </Link>
              <Link href="/destinations/roumanie/sibiu" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Sibiu</h3>
                <p className="text-stone-600 text-sm">Fetes, montagne.</p>
              </Link>
              <Link href="/destinations/roumanie/cluj" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Cluj</h3>
                <p className="text-stone-600 text-sm">Universite, cafe.</p>
              </Link>
              <Link href="/destinations/roumanie/brasov" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Brasov</h3>
                <p className="text-stone-600 text-sm">Montagne, Dracula.</p>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Quand</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Mai - Juin: Ideal</li>
                <li>Septembre: Vendanges</li>
                <li>Decembre: Noel</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Budget</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Hotel: 50-100€</li>
                <li>Repas: 20-40€</li>
                <li>Vol: ~150€</li>
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