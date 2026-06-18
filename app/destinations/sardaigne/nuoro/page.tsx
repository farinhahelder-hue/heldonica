import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Nuoro en couple : slow travel & pépites cachées | Heldonica",
    description: "Centre. Montagnes, pasteurs.",
    openGraph: {
      type: "website",
      images: ["https://heldonica.fr/images/default-hero.jpg"],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: {
      card: "summary_large_image"
    },
    alternates: {
      canonical: 'https://www.heldonica.fr/destinations/sardaigne/nuoro'
    },
  robots: { index: false, follow: false },
  };
}

export default function NuoroPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Sardaigne</span>
            <h1 className="text-4xl text-white font-serif">Nuoro</h1>
            <p className="text-stone-300">Centre. Montagnes, pasteurs.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sardaigne" className="text-stone-500 hover:text-amber-700">Sardaigne</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Nuoro, c est la montagne. Les pasteurs, les transhumances, le silence.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">⛰️</div>
              <h3 className="font-serif">Gennargentu</h3>
              <p className="text-sm text-stone-600">Le parc.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🐑</div>
              <h3 className="font-serif">Transhumance</h3>
              <p className="text-sm text-stone-600">Printemps.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏘️</div>
              <h3 className="font-serif">Orgosolo</h3>
              <p className="text-sm text-stone-600">Village.</p>
            </div>
          </section>
          <Link href="/destinations/sardaigne" className="text-amber-700">← Retour Sardaigne</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}