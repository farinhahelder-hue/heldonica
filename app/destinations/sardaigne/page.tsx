
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Sardaigne slow travel | Guide Heldonica',
  description:
    'Guide Sardaigne: ile mediterraneenne. Plages, montagnes, villages.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne',
  },
}

const subNav = [
  { label: 'Cagliari', href: '/destinations/sardaigne/cagliari' },
  { label: 'Costa Smeralda', href: '/destinations/sardaigne/costa-smeralda' },
  { label: 'Alghero', href: '/destinations/sardaigne/alghero' },
  { label: 'Nuoro', href: '/destinations/sardaigne/nuoro' },
]

export default function SardaignePage() {
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
              Sardaigne
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              L ile mediterraneenne. Plages incredible, montagnes, villages.
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
              La Sardaigne, c est l ile qui reste.
              <strong>Entre Mediterranee et mer Tyrrhenienne.</strong>
              Les plages sont les plus belles d Europe.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              L interieur des terres, c est autre chose.
              <strong>Les villages, les transhumances, les fetes.</strong>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Zones</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/destinations/sardaigne/cagliari" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Cagliari</h3>
                <p className="text-stone-600 text-sm">Le sud. Capitale, lagune.</p>
              </Link>
              <Link href="/destinations/sardaigne/costa-smeralda" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Costa Smeralda</h3>
                <p className="text-stone-600 text-sm">Le nord. Plages de stars.</p>
              </Link>
              <Link href="/destinations/sardaigne/alghero" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Alghero</h3>
                <p className="text-stone-600 text-sm">Nord-ouest. Catalan.</p>
              </Link>
              <Link href="/destinations/sardaigne/nuoro" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Nuoro</h3>
                <p className="text-stone-600 text-sm">Centre. Montagnes.</p>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Quand</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Mai - Juin: Ideal</li>
                <li>Septembre: Parfait</li>
                <li>Juillet - Aout: Peak</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Budget</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Hotel: 100-200€</li>
                <li>Repas: 40-60€</li>
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