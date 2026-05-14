
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function CatanePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Sicile</span>
            <h1 className="text-4xl text-white font-serif">Catane</h1>
            <p className="text-stone-300">Est. Volcan, baroque.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sicile" className="text-stone-500 hover:text-amber-700">Sicile</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Catane, c est au pied de l Etna. Volcan, lave noire, cathedral baroque.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🌋</div>
              <h3 className="font-serif">Etna</h3>
              <p className="text-sm text-stone-600">Volcan.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏛️</div>
              <h3 className="font-serif">Duomo</h3>
              <p className="text-sm text-stone-600">Cathedrale.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">♠️</div>
              <h3 className="font-serif">Marche</h3>
              <p className="text-stone-600 text-sm">Poisson.</p>
            </div>
          </section>
          <Link href="/destinations/sicile" className="text-amber-700">← Retour Sicile</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}