import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Porto en couple : la ville du vin et du Douro | Guide Heldonica",
    description: "La ville de caractère au bord du Douro. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/portugal/porto' },
  };
}

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">🌅 Portugal</span>
            <h1 className="text-4xl text-white font-serif">Porto</h1>
            <p className="text-stone-300">La ville de caractère au bord du Douro</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/portugal" className="text-stone-500 hover:text-amber-700">Retour a Portugal</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Porto</strong> est la deuxième ville du Portugal. Bâti sur les rives du Douro, la ville est célèbre pour son vin de Porto, ses façades d'azulejos et son pont Dom Luis I. La Ribeira, son quartier riverain classé UNESCO, en fait une destination attachante.</p>
          </section>
          <Link href="/destinations/portugal" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Portugal</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
