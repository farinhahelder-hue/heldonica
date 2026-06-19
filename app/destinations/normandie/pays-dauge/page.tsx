import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Pays d'Auge en couple : le cœur vert de la Normandie | Guide Heldonica",
    description: "La Normandie authentique aux cottages anglais. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/normandie/pays-dauge' },
  };
}

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">🏖 Normandie</span>
            <h1 className="text-4xl text-white font-serif">Pays Dauge</h1>
            <p className="text-stone-300">La Normandie authentique aux cottages anglais</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/normandie" className="text-stone-500 hover:text-amber-700">Retour a Normandie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">Le <strong>Pays d'Auge</strong> est l'une des plus belles régions de Normandie, reconnaissable à ses cottages normands à pans de bois, ses herbages verdoyants où paissent les fameuses Vaches Normandes. C'est ici que sont nés le camembert et le calvados.</p>
          </section>
          <Link href="/destinations/normandie" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Normandie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
