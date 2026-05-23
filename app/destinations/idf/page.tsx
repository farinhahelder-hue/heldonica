import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const faqIdfSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Jour ideale Paris ?", "acceptedAnswer": { "@type": "Answer", "text": "Mardi-vendredipour evit weekends chargés." }},
    { "@type": "Question", "name": "Transport Paris ?", "acceptedAnswer": { "@type": "Answer", "text": "Metro + Vélib. Navigo pour deca." }},
    { "@type": "Question", "name": "Que faire pres Paris ?", "acceptedAnswer": { "@type": "Answer", "text": "Versailles, Giverny, Fontainebleau en journee." }}
  ]
};

export const metadata: Metadata = {
  title: 'Ile-de-France slow travel : Paris, Versailles, Giverny | Heldonica',
  description:
    'Ile-de-France en slow travel : Paris hors des sentiers battus, Versailles, Giverny, Fontainebleau. Weekends et journees hors des foules.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/idf',
  },
  openGraph: {
    title: 'Ile-de-France slow travel : Paris et ses environs | Heldonica',
    description:
      'Ile-de-France en slow travel : Paris, Versailles, Giverny, Fontainebleau. Nos pepites pour un weekend ou une journee hors des sentiers battus.',
    url: 'https://www.heldonica.fr/destinations/idf',
    images: [
      {
        url: 'https://heldonica.fr/og-destinations.jpg',
        width: 1200,
        height: 630,
        alt: 'Ile-de-France slow travel - Paris et chateaux',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ile-de-France slow travel : Paris et ses environs | Heldonica',
    description: 'Ile-de-France en slow travel : Paris, Versailles, Giverny. Weekend et journees.',
  },
}

const subNav = [
  { label: 'Paris', href: '/destinations/idf/paris' },
  { label: 'Versailles', href: '/destinations/idf/versailles' },
  { label: 'Giverny', href: '/destinations/idf/giverny' },
  { label: 'Fontainebleau', href: '/destinations/idf/fontainebleau' },
]

export default function IdfPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqIdfSchema) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">Destinations</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Ile-de-France</h1>
            <p className="text-xl text-stone-300 max-w-2xl">Paris, chateaux, nature.</p>
          </div>
        </section>

        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto">
            {subNav.map((item) => (
              <Link key={item.href} href={item.href} className="text-stone-600 hover:text-amber-700 whitespace-nowrap text-sm font-medium">
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              L Ile-de-France, c est la region Parisienne.
              <strong>Paris, Versailles, Giverny, Fontainebleau.</strong>
              Les weekends et les journees.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Zones</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link href="/destinations/idf/paris" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Paris</h3>
                <p className="text-stone-600 text-sm">Capitale, balades.</p>
              </Link>
              <Link href="/destinations/idf/versailles" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Versailles</h3>
                <p className="text-stone-600 text-sm">Chateau, jardins.</p>
              </Link>
              <Link href="/destinations/idf/giverny" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Giverny</h3>
                <p className="text-stone-600 text-sm">Monet, jardins.</p>
              </Link>
              <Link href="/destinations/idf/fontainebleau" className="block p-6 bg-white rounded-lg border border-stone-200 hover:border-amber-400">
                <h3 className="font-serif text-lg text-stone-900 mb-2">Fontainebleau</h3>
                <p className="text-stone-600 text-sm">Foret, escalade.</p>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Quand</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Avril - Juin: Ideal</li>
                <li>Septembre: Parfait</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-serif mb-4">Budget</h3>
              <ul className="text-stone-600 text-sm space-y-1">
                <li>Hotel: 150-300€</li>
                <li>Repas: 40-80€</li>
              </ul>
            </div>
          </section>

          <Link href="/destinations" className="text-amber-700">← Retour Destinations</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}