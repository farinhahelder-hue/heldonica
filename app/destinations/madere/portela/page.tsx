import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Portela en couple : slow travel & pépites cachées | Heldonica",
    description: "Le village. La vue, le cimetiere, les eucalyptus.",
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
      canonical: 'https://www.heldonica.fr/destinations/madere/portela"
    }
  };
}

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Ribeiro Frio', href: '/destinations/madere/ribeiro-frio' },
]

const pepites = [
  { title: 'Viewpoint', description: 'Vue a 360. Sur tout.', icon: '🌄' },
  { title: 'Cemetery', description: 'Le cimetiere. Beaux monuments.', icon: '🪦' },
  { title: 'Church', description: 'L eglise du village. Simple.', icon: '⛪' },
  { title: 'Eucalyptus', description: 'Les arbres. Parfums.', icon: '🌳' },
]

export default function PortelaPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Secret Gem</span>
            <h1 className="text-4xl text-white font-serif">Portela</h1>
            <p className="text-stone-300">Le village. La vue, le cimetiere, les eucalyptus.</p>
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
              Portela, c est le village qu on voit depuis Ribeiro Frio.
              <strong>Petit, silent, et la vue est enorme.</strong>
              Les gens y vivent their vie.
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
          <section className="mb-8 p-5 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-serif mb-2">⭐ Le moment</h3>
            <p className="text-sm text-stone-700">Le matin tot -- la brume descend des montagnes et le silence est Total.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}