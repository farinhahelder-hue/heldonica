'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Ribeiro Frio', href: '/destinations/madere/ribeiro-frio' },
]

const pepites = [
  { title: 'Village', description: 'Dans les nuages. Literally.', icon: '☁️' },
  { title: 'Funiculaire', description: 'Pour monter. Vue sur vallee.', icon: '🚡' },
  { title: 'Erables', description: 'Les arbres. En automne, magic.', icon: '🍁' },
  { title: 'Apiario', description: 'Miel local. Degustation.', icon: '🍯' },
]

export default function FaialPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Hidden Gem</span>
            <h1 className="text-4xl text-white font-serif">Faial</h1>
            <p className="text-stone-300">Le village dans les nuages. Montagne.</p>
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
              Faial, c est la montagne.
              <strong>Tu prends le funiculaire et hop — tu es dans les nuages.</strong>
              Les gens vivent la-haut, font leur miel.
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
            <h3 className="font-serif mb-2">💡 Le moment</h3>
            <p className="text-sm text-stone-700">Prenez un cafe au village — le vieux vous racontera comment il fait son miel depuis 40 ans.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}