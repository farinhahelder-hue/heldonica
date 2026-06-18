import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Asinara en couple : slow travel & pépites cachées | Heldonica",
    description: "L ile prison. Ane blanchis, exclusivite.",
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
      canonical: 'https://www.heldonica.fr/destinations/sardaigne/asinara"
    }
  };
}

export default function AsinaraPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm inline-block">⭐ Hidden Gem</span>
            <h1 className="text-4xl text-white font-serif">Asinara</h1>
            <p className="text-stone-300">L ile prison. Ane blanchis, exclusivite.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sardaigne" className="text-stone-500 hover:text-amber-700">Sardaigne</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Asinara, c est l ile aux anes blanchis. Ils sont partout. Pas de tourists -- seulement 1 ferry par jour.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🫎</div>
              <h3 className="font-serif">Anes</h3>
              <p className="text-sm text-stone-600">Blanchis. Partout.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏝️</div>
              <h3 className="font-serif">Prison</h3>
              <p className="text-sm text-stone-600">Ex-colonie.</p>
            </div>
          </section>
          <section className="mb-8 p-5 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-serif mb-2">💡 Secret</h3>
            <p className="text-sm text-stone-700">Le ferry de Porto Torres -- 1 par jour. Reservez a l avance.</p>
          </section>
          <Link href="/destinations/sardaigne" className="text-amber-700">← Retour Sardaigne</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}