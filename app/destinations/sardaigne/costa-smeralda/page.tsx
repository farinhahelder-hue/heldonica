import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Costa Smeralda en couple : le glamour italien | Guide Heldonica",
    description: "Le coast de VIP et de glamour. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/sardaigne/costa-smeralda' },
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
            <h1 className="text-4xl text-white font-serif">Costa Smeralda</h1>
            <p className="text-stone-300">Le coast de VIP et de glamour</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sardaigne" className="text-stone-500 hover:text-amber-700">Retour a Sardaigne</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">La <strong>Costa Smeralda</strong> (Côte Émeraude) est le joyau de la Sardaigne. Découverte dans les années 1960 par le Prince Aga Khan, cette côte de 20 km est devenue le repaire des célébrités et des yachts les plus impressionnants du monde.</p>
          </section>
          <Link href="/destinations/sardaigne" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Sardaigne</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
