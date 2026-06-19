import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Cagliari en couple : la capitale méridionale | Guide Heldonica",
    description: "La ville solaire au creux de la falaise. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/sardaigne/cagliari' },
  };
}

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">🌊 Sardaigne</span>
            <h1 className="text-4xl text-white font-serif">Cagliari</h1>
            <p className="text-stone-300">La ville solaire au creux de la falaise</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sardaigne" className="text-stone-500 hover:text-amber-700">Retour a Sardaigne</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Cagliari</strong> est la capitale de la Sardaigne. Installée sur une colline face au golfo degli Angeli, la ville offre un mélange d'histoire ancienne, de vie méridionale et de plages accessibles. Les plages de Poetto sont parmi les plus belles de Sardaigne.</p>
          </section>
          <Link href="/destinations/sardaigne" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Sardaigne</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
