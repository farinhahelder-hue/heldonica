'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Faial', href: '/destinations/madere/faial' },
]

const pepites = [
  { title: 'Cable Car', description: 'Le funiculaire vertigo. 80euros.', icon: '🚡' },
  { title: 'Terraces', description: 'Les terrasses. Vertigineuses.', icon: '🌾' },
  { title: 'Village', description: 'En bas. Le vrai village.', icon: '🏘️' },
  { title: 'Panorama', description: 'Vue a pic. 1000m.', icon: '🏔️' },
]

export default function AchadasPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Secret Gem</span>
            <h1 className="text-4xl text-white font-serif">Achadas da Cruz</h1>
            <p className="text-stone-300">Le funiculaire. 1000m de chute. Vertige.</p>
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
              Achadas da Cruz, c est le spot the brave.
              <strong>Le funiculaire le plus d EUROPE -- 1000m de chute verticale.</strong>
              Pas pour les gens qui ont le vertige.
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
            <h3 className="font-serif mb-2">⭐ Le warning</h3>
            <p className="text-sm text-stone-700">Attention -- quand il vente, ca bouge. Et il vente souvent. Pas de children sous 12 ans.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}