import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Cote Est en couple : slow travel & pépites cachées | Heldonica",
    description: "Machico, Canical, la cote sauvage. L arrivee en avion.",
    openGraph: {
      type: "website",
      images: ["https://heldonica.fr/images/default-hero.jpg"],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: {
      card: "summary_large_image"
    },
    alternates: {
      canonical: 'https://www.heldonica.fr/destinations/madere/cote-est'
    },
  robots: { index: false, follow: false },
  };
}

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Funchal', href: '/destinations/madere/funchal' },
]

const pepites = [
  { title: 'Praia de Machico', description: 'La plage au bord du village. Simple.', icon: '🏖️' },
  { title: 'Canical', description: 'Le port de peche. Lesdauphins parfois.', icon: '🐬' },
  { title: 'Ponta de Sao Lourenco', description: 'La peninsula. Randonnnable.', icon: '🏝️' },
  { title: 'Cristiano Ronaldo', description: 'L aeroport. Le nouveau terminal.', icon: '✈️' },
]

export default function CoteEstPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4">Madere</span>
            <h1 className="text-4xl text-white font-serif">Cote Est</h1>
            <p className="text-stone-300">Machico, Canical, la cote sauvage. L arrivee en avion.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-stone-500 hover:text-amber-700">{l.label}</Link>
          ))}
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">
              La cote Est, c'est le ventre.
              <strong>Moins touristique que l Ouest, plus authentique.</strong>
              Les plages sont differentes — rochers, galets, pas de sable fin.
            </p>
          </section>
          <section className="mb-8 grid md:grid-cols-2 gap-4">
            {pepites.map((p, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border">
                <div className="text-xl mb-2">{p.icon}</div>
                <h3 className="font-serif">{p.title}</h3>
                <p className="text-sm text-stone-600">{p.description}</p>
              </div>
            ))}
          </section>
          <section className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-5 rounded-lg border">
              <h3 className="font-serif mb-3">Pour la plage</h3>
              <ul className="text-sm text-stone-600 space-y-1">
                <li><strong>Complexe:</strong> Piscines naturelles</li>
                <li><strong>Plage:</strong> Machico</li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-lg border">
              <h3 className="font-serif mb-3">Conseil</h3>
              <p className="text-sm text-stone-600">Venez pour la peninsula — la rando va jusqu au bout.</p>
            </div>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}