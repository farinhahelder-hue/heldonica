'use client'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Funchal slow travel | Guide Heldonica',
  description:
    'Guide Funchal: vieille ville, Mercado,缆车, restaurants, cosas a fazer.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/funchal',
  },
}

const pepites = [
  {
    title: 'Mercado dos Lavradores',
    description: 'Le marche couvert. Fruits, poisson, couleurs. Le matin.',
    icon: '🍊',
    address: 'Rua de Santa Maria',
  },
  {
    title: 'Zona Velha',
    description: 'Le vieuxquartier. Rues etroites, portes colores.',
    icon: '🚶',
    address: 'Rua de Santa Maria',
  },
  {
    title: 'Teleférico do Funchal',
    description: 'Cable car vers le Monte. Vue sur la baie.',
    icon: '🚡',
    address: 'Avenida do Mar',
  },
  {
    title: 'Praia do Funchal',
    description: 'Plage de sable volcan. Pas Caraibe mais OK.',
    icon: '🏖️',
    address: 'Avenida do Mar',
  },
  {
    title: 'Caves de Sao João',
    description: 'Degustation vin de Madere. Les caves historiques.',
    icon: '🍷',
    address: 'Estrada瞿nicas 23',
  },
]

const navLinks = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Portugal', href: '/destinations/portugal' },
  { label: 'Madere', href: '/destinations/madere' },
]

export default function FunchalPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Madere
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Funchal et environs
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              La capitale de Madere. Le marche, le vieux quartier, et la vue depuis le cable car.
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
              Funchal, c est la porte d entree. L aéroport, le port, les croisières.
              Mais derriere les touristcs, il y a une ville.
              <strong>Le vieuxquartier sent le poisson et les fruits murs.</strong>
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              On y reste 2-3 jours maximum. Juste assez pour le marche,
              la balade dans les rues et le cable car vers le Monte.
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
                <li><strong>Hotel Reid:</strong> Centre, rooftop, 100-150€</li>
                <li><strong>Pensao Beloura:</strong>Simple, correcte, 50-70€</li>
                <li><strong>Airbnb:</strong> Apparts avec vue</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">Ou manger</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li><strong>Le Restaurant:</strong> Cuisine locale, reservation</li>
                <li><strong>Mercado:</strong> Poisson grille auzed</li>
                <li><strong>Cafe do Mercado:</strong> Pause cafe</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Aproximité</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/destinations/madere" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100 transition-colors">
                <span className="text-stone-700">Madère</span>
                <span className="block text-xs text-stone-500 mt-1">Île</span>
              </Link>
              <Link href="/destinations/portugal" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100 transition-colors">
                <span className="text-stone-700">Portugal</span>
                <span className="block text-xs text-stone-500 mt-1">~2h vol</span>
              </Link>
              <div className="p-4 bg-stone-100 rounded-lg text-center">
                <span className="text-stone-700">Porto</span>
                <span className="block text-xs text-stone-500 mt-1">~1h45 vol</span>
              </div>
            </div>
          </section>

          <section>
            <Link href="/destinations/portugal" className="text-amber-700 hover:underline">
              ← Retour Portugal
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}