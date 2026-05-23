'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Cote Est', href: '/destinations/madere/cote-est' },
]

const pepites = [
  { title: 'Port de Santos', description: 'Le petit port. Les tavernes.', icon: '⚓' },
  { title: 'Montanha', description: 'La montagne derriere. Randonnnable.', icon: '⛰️' },
  { title: 'Faja', description: 'La plage au debut. Sable noir.', icon: '🏖️' },
  { title: 'Wine Caves', description: 'Vins locaux. Degustation.', icon: '🍷' },
]

export default function SantosPage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Santos","description":"Le petit port. Les tavernes.","url":"https://heldonica.fr/destinations/madere/santos","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":0,"longitude":0}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Madere","item":"https://heldonica.fr/destinations/madere"},{"@type":"ListItem","position":4,"name":"Santos","item":"https://heldonica.fr/destinations/madere/santos"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4 inline-block">⭐ Hidden Gem</span>
            <h1 className="text-4xl text-white font-serif">Santos</h1>
            <p className="text-stone-300">Le petit village. Les tavernes, le vin.</p>
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
              Porto da Cruz (Santos), c est le village qu on voit quand on vole sur Madere.
              <strong>Petit, authentique, et les meilleures tavernes.</strong>
              Les locaux y mangent — pas les touristes.
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
            <h3 className="font-serif mb-2">💡 La meilleure heure</h3>
            <p className="text-sm text-stone-700">Vers 18h — les pecheurs rentrent et les tavernes servent le poisson grille sur place.</p>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}