import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Sibiu slow travel | Guide Heldonica',
  description: 'Guide Sibiu: fete, montagne, architecture.',
  robots: { index: false, follow: false },
}

const navLinks = [
  { label: 'Roumanie', href: '/destinations/roumanie' },
  { label: 'Timisoara', href: '/destinations/timisoara' },
]

const pepites = [
  { title: 'Piata Mare', description: 'Place centrale.', icon: '🏛️' },
  { title: 'Astra', description: 'Musee du village en plein air.', icon: '🏘️' },
  { title: 'Montagnes', description: 'Proximite des Carpathes.', icon: '⛰️' },
]

export default function SibiuPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4">Roumanie</span>
            <h1 className="text-4xl text-white font-serif">Sibiu</h1>
            <p className="text-stone-300">Ville saxonne. Fetes, montagne, architecture.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="text-stone-500 hover:text-amber-700">{l.label}</Link>
          ))}
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Sibiu, c est la petite Europe. Propre, rangee, avec les montagnes a cote.</p>
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