import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Bucarest en couple : la parisienne des Balkans | Guide Heldonica",
    description: "La capitale qui surprend par son élégance. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/roumanie/bucarest' },
  };
}

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">🌟 Roumanie</span>
            <h1 className="text-4xl text-white font-serif">Bucarest</h1>
            <p className="text-stone-300">La capitale qui surprend par son élégance</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/roumanie" className="text-stone-500 hover:text-amber-700">Retour a Roumanie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Bucarest</strong> est une ville qui déroute et seduit à la fois. Surnommée 'le Petit Paris' au début du 20e siècle, la capitale roumaine a traversé deux guerres mondiales, un régime communist et une révolution pour devenir une metropolis dynamique et fascinante.</p>
          </section>
          <Link href="/destinations/roumanie" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Roumanie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
