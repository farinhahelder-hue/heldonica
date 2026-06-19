import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Catane en couple : la ville baroque au pied de l'Etna | Guide Heldonica",
    description: "La ville baroque aux pieds de l'Etna. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/sicile/catane' },
  };
}

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">🌴 Sicile</span>
            <h1 className="text-4xl text-white font-serif">Catane</h1>
            <p className="text-stone-300">La ville baroque aux pieds de l'Etna</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sicile" className="text-stone-500 hover:text-amber-700">Retour a Sicile</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Catane</strong> est la deuxième ville de Sicile. Construite en pierre de lave noire de l'Etna, la ville possède une identity visuelle forte. Reconstruite après le tremblement de terre de 1693, elle possède l'un des plus beaux centres historiques baroques d'Europe.</p>
          </section>
          <Link href="/destinations/sicile" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Sicile</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
