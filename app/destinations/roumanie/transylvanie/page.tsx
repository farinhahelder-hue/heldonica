import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Transylvanie slow travel | Guide Heldonica',
  description: 'Guide Transylvanie: chateaux, legends, villages.',
}

const navLinks = [
  { label: 'Roumanie', href: '/destinations/roumanie' },
  { label: 'Timisoara', href: '/destinations/timisoara' },
]

const pepites = [
  { title: 'Bran', description: 'Le château de Dracula.', icon: '🏰' },
  { title: 'Sighisoara', description: 'Cite medievale.', icon: '🏘️' },
  { title: 'Villages', description: 'Maisons paintes.', icon: '🎨' },
]

export default function TransylvaniePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4">Roumanie</span>
            <h1 className="text-4xl text-white font-serif">Transylvanie</h1>
            <p className="text-stone-300">Chateaux, legends, villages paintes.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-stone-500 hover:text-amber-700">{l.label}</Link>
          ))}
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">La Transylvanie, c est la legende. Mais en vrai, ce sont des villages magnifiques.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            {pepites.map((p, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border">
                <div className="text-xl mb-2">{p.icon}</div>
                <h3 className="font-serif">{p.title}</h3>
                <p className="text-sm text-stone-600">{p.description}</p>
              </div>
            ))}
          </section>
          <Link href="/destinations/roumanie" className="text-amber-700">← Retour Roumanie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}