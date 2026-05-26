import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Estreito de Camara en couple : slow travel & pépites cachées | Heldonica",
    description: "Le vallee. Les levadas, les cascades, la foret.",
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
      canonical: "https://heldonica.fr/destinations/madere/estreito"
    }
  };
}

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Ribeiro Frio', href: '/destinations/madere/ribeiro-frio' },
]

const pepites = [
  { title: 'Levada Nova', description: 'La levada qui traverse. 3h. Magic.', icon: '🌿' },
  { title: 'Cascata', description: 'La chute d eau. En cours de route.', icon: '💦' },
  { title: 'Balcoes Novo', description: 'Le nouveau. Encore plus fort.', icon: '⛰️' },
  { title: 'Forest Path', description: 'Dans la foret. Silence total.', icon: '🌲' },
]

export default function EstreitoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Secret Gem</span>
            <h1 className="text-4xl text-white font-serif">Estreito de Camara</h1>
            <p className="text-stone-300">Le vallee. Les levadas, les cascades, la foret.</p>
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
              Estreito, c est la vallee.
              <strong>Les levadas les plus belles sans les foules.</strong>
              Attention -- c est 3h de rando minimum.
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
            <h3 className="font-serif mb-2">⭐ Le secret</h3>
            <p className="text-sm text-stone-700">Partez tot -- vous croisez un seul groupe sur le chemin. Retour a 14h max.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}