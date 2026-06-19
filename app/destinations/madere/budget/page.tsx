import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Budget Madère en couple : notre guide complet 2026 | Guide Heldonica",
    description: "Le vrai budget pour voyager à Madère. Notre guide complet pour les couples.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/madere/budget' },
  };
}

export default function Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">🌟 Madère</span>
            <h1 className="text-4xl text-white font-serif">Budget</h1>
            <p className="text-stone-300">Le vrai budget pour voyager à Madère</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/madere" className="text-stone-500 hover:text-amber-700">Retour a Madere</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6"><strong>Madère en couple</strong> pour 1200€/semaine : c'est le budget que nous avons dépensé lors de notre dernier voyage. Vol A/R, hébergement romantique, repas au restaurant, location de voiture et activités — nous avons gardé tous les reçus pour vous donner les vraies infos. Comptez entre 1200€ et 1800€ tout compris selon votre niveau de confort.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700 hover:text-amber-800 font-medium">Retour a Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
