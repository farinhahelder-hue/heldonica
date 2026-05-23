'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Funchal', href: '/destinations/madere/funchal' },
]

const pepites = [
  { title: 'Piscines Naturelles', description: 'Piscines de lave naturelle. Quand la chaleur tape.', icon: '🏊' },
  { title: 'Plage de Seixal', description: 'La seule plage de sable noir. Authentique.', icon: '🏖️' },
  { title: 'Miroir d Eau', description: 'Plans d eau avec vue ocean.', icon: '💧' },
  { title: 'Village de Seixal', description: 'Petit village de pecheurs.', icon: '⚓' },
]

export default function PortoMonizPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4">Madere</span>
            <h1 className="text-4xl text-white font-serif">Porto Moniz</h1>
            <p className="text-stone-300">Au nord-ouest. Les piscines naturelles, le village, la route qui tangue.</p>
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
              Porto Moniz, c est le grand voyage. La route pour y aller est une aventure —
              des virages, des tunnels, des vues sur l ocean.
              <strong>Mais les piscines naturelles valent le detour.</strong>
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
              <h3 className="font-serif mb-3">Ou dormir</h3>
              <ul className="text-sm text-stone-600 space-y-1">
                <li><strong>Quinta do Lorde:</strong> 80-120€</li>
                <li><strong>Pension familiale:</strong> 50-70€</li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-lg border">
              <h3 className="font-serif mb-3">Conseil</h3>
              <p className="text-sm text-stone-600">Partez tot le matin. Moins de monde aux piscines.</p>
            </div>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}