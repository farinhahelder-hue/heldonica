import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'

export const metadata: Metadata = {
  title: 'Le Havre slow travel | Guide Heldonica',
  description:
    'Guide Le Havre et environs: architecture Art Deco d Auguste Perret, plages de la Manche, roadtrip.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/normandie/le-havre',
  },
  openGraph: {
    title: 'Le Havre slow travel | Guide Heldonica',
    description:
      'Architecture Art Deco, plages et ports de pêche. Notre guide du Havre.',
    url: 'https://www.heldonica.fr/destinations/normandie/le-havre',
    images: [
      {
        url: 'https://heldonica.fr/og-destinations.jpg',
        width: 1200,
        height: 630,
        alt: 'Le Havre - Cathédrale et port',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
}

const pepites = [
  {
    title: 'Maison du Patrimoine',
    description: 'Expos sur l architecture d Auguste Perret. Incontournable pour comprendre la ville.',
    icon: '🏛️',
    address: '2 Place Georges Cohen',
  },
  {
    title: 'Plage de Sainte-Adresse',
    description: 'La plage urbaine by-the-book. Baignade, promenade, les gens du coin.',
    icon: '🏖️',
    address: 'Sainte-Adresse',
  },
  {
    title: 'Port de Harfleur',
    description: 'Petit port de pêche authentique. Les pêcheurs vendent sur le quai le matin.',
    icon: '⚓',
    address: 'Harfleur',
  },
  {
    title: 'Musée des Beaux-Arts',
    description: 'Collection impressionniste. Dessous, des Tiepolo, Monet, Dufy.',
    icon: '🎨',
    address: 'Bd Clemenceau',
  },
]

const navLinks = [
  { label: 'Normandie', href: '/destinations/normandie' },
  { label: 'Côte d Albâtre', href: '/destinations/normandie/cote-albatre' },
  { label: 'Pays d Auge', href: '/destinations/normandie/pays-dauge' },
]

export default function LeHavrePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Normandie
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Le Havre et environs
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Deuxième port de France. Mais pas que ça. Architecture Art Deco,
              plages, et un esprit qui surprend.
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-stone-500 hover:text-amber-700">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              On est tombés sur Le Havre par hasard. On cherchait une halte entre Caen et Rouen,
              et on s est retrouvé à marcher dans les rues d Auguste Perret.
              <strong>C est une ville qu on ne attend pas.</strong>
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              Le centre-ville est classé UNESCO. Non pas pour un monument, mais pour l ensemble.
              Des apparts года 1930s, des churches en béton, des theaters.
              Et derrière les quais ? La mer.
            </p>
          </section>

          {/* Pépites */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Ce qu on a déniché
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {pepites.map((pepite, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-lg border border-stone-200"
                >
                  <div className="text-2xl mb-2">{pepite.icon}</div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">
                    {pepite.title}
                  </h3>
                  <p className="text-stone-600 text-sm mb-2">
                    {pepite.description}
                  </p>
                  <p className="text-stone-400 text-xs">
                    {pepite.address}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Practical */}
          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                Ou dormir
              </h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li><strong>Hôtel Vent d Ouest:</strong> Centre, design, 90-130€</li>
                <li><strong>Brit Hotel:</strong> Simple, correct, 60-80€</li>
                <li><strong>Airbnb:</strong> Apparts Art Deco dispo</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                Ou manger
              </h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li><strong>La Cite:</strong> Brasserie port, bons produits</li>
                <li><strong>Le Comptoir:</strong> Cuisine locale, budget OK</li>
                <li><strong>Marché Central:</strong> Fruits, poisson, fromage</li>
              </ul>
            </div>
          </section>

          {/* Aproximité */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Aproximité
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/destinations/normandie/cote-albatre"
                className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100 transition-colors"
              >
                <span className="text-stone-700">Falaises d Etretat</span>
                <span className="block text-xs text-stone-500 mt-1">~30 min</span>
              </Link>
              <Link
                href="/destinations/normandie/pays-dauge"
                className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100 transition-colors"
              >
                <span className="text-stone-700">Honfleur</span>
                <span className="block text-xs text-stone-500 mt-1">~25 min</span>
              </Link>
              <Link
                href="/destinations/normandie/pays-dauge"
                className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100 transition-colors"
              >
                <span className="text-stone-700">Deauville</span>
                <span className="block text-xs text-stone-500 mt-1">~30 min</span>
              </Link>
            </div>
          </section>

          {/* Back */}
          <section>
            <Link
              href="/destinations/normandie"
              className="text-amber-700 hover:underline"
            >
              ← Retour Normandie
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}