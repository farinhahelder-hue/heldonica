import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Bogota en couple : slow travel & pépites cachées | Heldonica",
    description: "Capitale. 2600m, Graffiti, Candelaria.",
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
      canonical: "https://heldonica.fr/destinations/colombie/bogota"
    }
  };
}

export default function BogotaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Colombie</span>
            <h1 className="text-4xl text-white font-serif">Bogota</h1>
            <p className="text-stone-300">Capitale. 2600m, Graffiti, Candelaria.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/colombie" className="text-stone-500 hover:text-amber-700">Colombie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Bogota, c est la capitale a 2600m. Le centre historique, les murs de grafitti, les musees.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-serif">Grafitti</h3>
              <p className="text-sm text-stone-600">La Candelaria.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏛️</div>
              <h3 className="font-serif">Musee</h3>
              <p className="text-sm text-stone-600">Or.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🗿</div>
              <h3 className="font-serif">Monserrate</h3>
              <p className="text-sm text-stone-600">Vue.</p>
            </div>
          </section>
          <Link href="/destinations/colombie" className="text-amber-700">← Retour Colombie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}