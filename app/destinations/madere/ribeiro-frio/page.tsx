
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Funchal', href: '/destinations/madere/funchal' },
]

const pepites = [
  { title: 'Levada do Furado', description: 'La rando star. 2h30 de tunnel vegetal.', icon: '🌿' },
  { title: 'Portela', description: 'Le village avec la vue. Pour decelerer.', icon: '🏘️' },
  { title: 'Balcoes', description: 'Le spot avec vue sur la valle. Court et doable.', icon: '⛰️' },
  { title: 'Poiso', description: 'Le haut, la foret. Frais.', icon: '🌲' },
]

export default function RibeiroFrioPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4">Madere</span>
            <h1 className="text-4xl text-white font-serif">Ribeiro Frio</h1>
            <p className="text-stone-300">Le centre montagne. Levadas, foret, altitude.</p>
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
              Ribeiro Frio, c est la montagne.
              <strong>Les levadas dans la foret Laurisilva — patrimoine UNESCO.</strong>
              Attention, il peut fare gris et pluvieux.
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
              <h3 className="font-serif mb-3">Quand y aller</h3>
              <ul className="text-sm text-stone-600 space-y-1">
                <li><strong>Printemps:</strong> Ideal, vegetation.</li>
                <li><strong>Septembre:</strong> Encore bon.</li>
                <li><strong>Eviter:</strong> Hiver,多有雨水.</li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-lg border">
              <h3 className="font-serif mb-3">Conseil</h3>
              <p className="text-sm text-stone-600">Prevoyez des Chaussures de rando. Les chemins sont glissants.</p>
            </div>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}