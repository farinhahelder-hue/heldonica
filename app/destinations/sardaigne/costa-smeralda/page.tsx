'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function CostaSmeraldaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Sardaigne</span>
            <h1 className="text-4xl text-white font-serif">Costa Smeralda</h1>
            <p className="text-stone-300">Le nord.millionnaires, plages incredible.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sardaigne" className="text-stone-500 hover:text-amber-700">Sardaigne</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Costa Smeralda, c est les plages des stars. Mais entre Juin et Septembre seulement.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏝️</div>
              <h3 className="font-serif">Porto Cervo</h3>
              <p className="text-sm text-stone-600">Le centre.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">💎</div>
              <h3 className="font-serif">Smeralda</h3>
              <p className="text-sm text-stone-600">La plage.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">⛵</div>
              <h3 className="font-serif">Cala Raul</h3>
              <p className="text-sm text-stone-600">Cachée.</p>
            </div>
          </section>
          <Link href="/destinations/sardaigne" className="text-amber-700">← Retour Sardaigne</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}