'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AlgheroPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Sardaigne</span>
            <h1 className="text-4xl text-white font-serif">Alghero</h1>
            <p className="text-stone-300">Nord-ouest. Influences catalanes.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sardaigne" className="text-stone-500 hover:text-amber-700">Sardaigne</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Alghero, c est la ville catalane. Les remparts, les grottes de Neptune.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏰</div>
              <h3 className="font-serif">Remparts</h3>
              <p className="text-sm text-stone-600">Centre historique.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🌊</div>
              <h3 className="font-serif">Neptune</h3>
              <p className="text-sm text-stone-600">Grottes marines.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🍷</div>
              <h3 className="font-serif">Vermentino</h3>
              <p className="text-sm text-stone-600">Vin local.</p>
            </div>
          </section>
          <Link href="/destinations/sardaigne" className="text-amber-700">← Retour Sardaigne</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}