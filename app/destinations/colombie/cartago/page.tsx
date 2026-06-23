import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Cartago en couple : slow travel & pépites cachées | Heldonica",
    description: "Valle del Cauca. Zone cafe. Tradition.",
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
      canonical: 'https://www.heldonica.fr/destinations/colombie/cartago'
    },
  robots: { index: false, follow: false },
  };
}

export default function CartagoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Colombie</span>
            <h1 className="text-4xl text-white font-serif">Cartago</h1>
            <p className="text-stone-300">Valle del Cauca. Zone cafe. Tradition.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/colombie" className="text-stone-500 hover:text-amber-700">Colombie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Cartago, c est la zone cafe. Les fincas, les plantations, le meilleur cafe de Colombie.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">☕</div>
              <h3 className="font-serif">Cafe</h3>
              <p className="text-sm text-stone-600">Finca.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🌱</div>
              <h3 className="font-serif">Ferme</h3>
              <p className="text-sm text-stone-600">Visites.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🥭</div>
              <h3 className="font-serif">Fruit</h3>
              <p className="text-sm text-stone-600">Local.</p>
            </div>
          </section>
          <section className="mb-8 p-5 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-serif mb-2">💡 Le secret</h3>
            <p className="text-sm text-stone-700">Allez dans les fincas vers Salado -- ils font du cafe directement.</p>
          </section>
          <Link href="/destinations/colombie" className="text-amber-700">← Retour Colombie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}