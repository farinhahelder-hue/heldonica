import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Timisoara en couple : slow travel & pépites cachées | Heldonica",
    description: "Ville hongroise. Art Nouveau.",
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
      canonical: 'https://www.heldonica.fr/destinations/roumanie/timisoara'
    },
  robots: { index: false, follow: false },
  };
}

export default function TimisoaraPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Roumanie</span>
            <h1 className="text-4xl text-white font-serif">Timisoara</h1>
            <p className="text-stone-300">Ville hongroise. Art Nouveau.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/roumanie" className="text-stone-500 hover:text-amber-700">Roumanie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Timisoara, ville hongroise. Art Nouveau, jardins.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🏛️</div><h3 className="font-serif">Place</h3></div>
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🎨</div><h3 className="font-serif">Art Nouveau</h3></div>
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🌳</div><h3 className="font-serif">Jardins</h3></div>
          </section>
          <Link href="/destinations/roumanie" className="text-amber-700">← Retour Roumanie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}