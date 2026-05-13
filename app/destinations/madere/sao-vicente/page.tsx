'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Cabo Girao', href: '/destinations/madere/cabo-girao' },
]

const pepites = [
  { title: 'Grutas de Sao Vicente', description: 'Grottes de lave. Inedit.', icon: '🌋' },
  { title: 'Praia Negra', description: 'Plage de sable noir. Souveraine.', icon: '🏖️' },
  { title: 'Parc Ventilado', description: 'Le park eolien. Vue incredible.', icon: '💨' },
  { title: 'Caves de Lameiros', description: 'Vignobles en terrrasse. Authentique.', icon: '🍇' },
]

export default function SaoVicentePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Hidden Gem</span>
            <h1 className="text-4xl text-white font-serif">Sao Vicente</h1>
            <p className="text-stone-300">Le nord forgotten. Grottes, plage noire, eoliennes.</p>
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
              Sao Vicente, c est le nord qu on zappe.
              <strong>Les grottes de lave — seulement 2 ouverts au public.</strong>
              Et la plage noire, une des rares.
            </p>
          </section>
          <section className="mb-8 grid md:grid-cols-2 gap-4">
            {peptides.map((p, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border">
                <div className="text-xl mb-2">{p.icon}</div>
                <h3 className="font-serif">{p.title}</h3>
                <p className="text-sm text-stone-600">{p.description}</p>
              </div>
            ))}
          </section>
          <section className="mb-8 p-5 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-serif mb-2">💡 Le trick</h3>
            <p className="text-sm text-stone-700">Allez au parc eolien au coucher du soleil — les eoliennes ont l air de danser avec les couleurs.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}