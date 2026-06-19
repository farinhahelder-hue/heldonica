import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Îles Éoliennes en couple : Lipari, Stromboli, Vulcano | Guide Heldonica",
    description: "L'archipel volcanique aux eaux turquoise. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/sicile/etoile' },
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
            <h1 className="text-4xl text-white font-serif">Etoile</h1>
            <p className="text-stone-300">L'archipel volcanique aux eaux turquoise</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sicile" className="text-stone-500 hover:text-amber-700">Retour a Sicile</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">Les <strong>îles Éoliennes</strong> sont un archipel de sept îles volcaniques au nord de la Sicile. Ce patrimoine mondial de l'UNESCO offre une expérience unique. Lipari, Vulcano, Stromboli et Panarea — chaque île a sa personalité.</p>
          </section>
          <Link href="/destinations/sicile" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Sicile</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
