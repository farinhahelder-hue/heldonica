import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Le Havre en couple : la ville d'Auguste Perret | Guide Heldonica",
    description: "La ville d'Art Deco renaît face à la mer. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/normandie/le-havre' },
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
            <h1 className="text-4xl text-white font-serif">Le Havre</h1>
            <p className="text-stone-300">La ville d'Art Deco renaît face à la mer</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/normandie" className="text-stone-500 hover:text-amber-700">Retour a Normandie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Le Havre</strong> est l'une des plus grandes villes portuaires de France. Reconstruite après la Seconde Guerre mondiale par Auguste Perret, la ville est inscrite au patrimoine mondial de l'UNESCO. Son centre-ville en béton et son plan urbain en Damier создают un paysage fascinant.</p>
          </section>
          <Link href="/destinations/normandie" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Normandie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
