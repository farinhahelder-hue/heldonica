import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Alghero en couple : la petite Barcelone catalane | Guide Heldonica",
    description: "La ville catalane aux portes de la Méditerranée. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/sardaigne/alghero' },
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
            <h1 className="text-4xl text-white font-serif">Alghero</h1>
            <p className="text-stone-300">La ville catalane aux portes de la Méditerranée</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sardaigne" className="text-stone-500 hover:text-amber-700">Retour a Sardaigne</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Alghero</strong> est l'une des plus belles villes de Sardaigne. Cette ville fortifiée par les Catalans au 14e siècle a gardé une identidad propre. Ses remparts médiévaux, ses tours aragonaises et son architecture gothique catalane créent un décor meridional unique.</p>
          </section>
          <Link href="/destinations/sardaigne" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Sardaigne</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
