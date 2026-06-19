import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Syracuse en couple : l'Ortygie antique et baroque | Guide Heldonica",
    description: "La cité antique où naquit Archimède. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/sicile/syracuse' },
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
            <h1 className="text-4xl text-white font-serif">Syracuse</h1>
            <p className="text-stone-300">La cité antique où naquit Archimède</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sicile" className="text-stone-500 hover:text-amber-700">Retour a Sicile</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Syracuse</strong> est l'une des plus anciennes villes de Sicile. Fondée par les Grees au 8e siècle avant J.-C., elle fut l'une des plus puissantes cités de la Méditerranée. L'île d'Ortygie est un joyau baroque où l'ancien et le moderne se mêlent.</p>
          </section>
          <Link href="/destinations/sicile" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Sicile</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
