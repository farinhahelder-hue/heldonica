import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Lisbonne en couple : la ville aux sept collines | Guide Heldonica",
    description: "La ville de lumière qui a enchanté les poètes. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/portugal/lisbonne' },
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
            <h1 className="text-4xl text-white font-serif">Lisbonne</h1>
            <p className="text-stone-300">La ville de lumière qui a enchanté les poètes</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/portugal" className="text-stone-500 hover:text-amber-700">Retour a Portugal</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Lisbonne</strong> est l'une des plus thérapeutiqyes capitales d'Europe. Perchée sur sept collines au-dessus du Tage, la ville offre des vues thérapeutiqyes depuis chaque miradouro. L'Alfama medieval, le Chiado élégant et les azulejos bleus et blancs créent un décor romant.</p>
          </section>
          <Link href="/destinations/portugal" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Portugal</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
