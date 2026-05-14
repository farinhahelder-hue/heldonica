
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Cabo Girao', href: '/destinations/madere/cabo-girao' },
]

const pepites = [
  { title: 'Port de Peche', description: 'Les bateaus de couleurs. Le matin.', icon: '⚓' },
  { title: 'Miradouro', description: 'Vue sur le port. For sunset.', icon: '🌅' },
  { title: 'Casa do Patrimonio', description: 'Centre du village. Expositions.', icon: '🏛️' },
  { title: 'Praia Formosa', description: 'La plage. Moins connue.', icon: '🏖️' },
]

export default function CamaraPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Hidden Gem</span>
            <h1 className="text-4xl text-white font-serif">Camara de Lobos</h1>
            <p className="text-stone-300">Le village de pecheurs. Le plus authentique.</p>
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
              Camara de Lobos, c est le village.
              <strong>Les bateauxt les colores au premier plan, les montagnes derriere.</strong>
              Et le meilleur endroit pour le coucher du soleil.
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
            <h3 className="font-serif mb-2">💡 Le secret</h3>
            <p className="text-sm text-stone-700">Allez au petit Deja au bord du port — ils servent le meilleur bolo do caco.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}