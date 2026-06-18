import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Syracuse en couple : slow travel & pépites cachées | Heldonica",
    description: "Sud-est. Antique, Ortigia.",
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
      canonical: 'https://www.heldonica.fr/destinations/sicile/syracuse'
    },
  robots: { index: false, follow: false },
  };
}

export default function SyracusePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Sicile</span>
            <h1 className="text-4xl text-white font-serif">Syracuse</h1>
            <p className="text-stone-300">Sud-est. Antique, Ortigia.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sicile" className="text-stone-500 hover:text-amber-700">Sicile</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Syracuse, c est la ville antique. Le temple, la cathedral, Ortigia.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏛️</div>
              <h3 className="font-serif">Temple</h3>
              <p className="text-sm text-stone-600">Apollo.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">⌛</div>
              <h3 className="font-serif">Ortigia</h3>
              <p className="text-sm text-stone-600">Ile.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🍊</div>
              <h3 className="font-serif">Marche</h3>
              <p className="text-sm text-stone-600">Ortigia.</p>
            </div>
          </section>
          <Link href="/destinations/sicile" className="text-amber-700">← Retour Sicile</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}