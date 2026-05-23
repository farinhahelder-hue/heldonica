'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const navLinks = [
  { label: 'Madere', href: '/destinations/madere' },
  { label: 'Funchal', href: '/destinations/madere/funchal' },
]

const pepites = [
  { title: 'Belvedere', description: 'La plus haute falaise d Europe. Vue a pic.', icon: '🪨' },
  { title: 'Chapelle', description: 'La petite eglise au bord du vide.', icon: '⛪' },
  { title: 'Miradouro', description: 'Le spot photo. Forcument.', icon: '📸' },
  { title: 'Hamlets', description: 'Les villages en contrebas.', icon: '🏘️' },
]

export default function CaboGiraoPage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Cabo Girao","description":"La plus haute falaise d Europe. Vue a pic.","url":"https://heldonica.fr/destinations/madere/cabo-girao","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":32.6564809,"longitude":-17.0044527}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Madere","item":"https://heldonica.fr/destinations/madere"},{"@type":"ListItem","position":4,"name":"Cabo Girao","item":"https://heldonica.fr/destinations/madere/cabo-girao"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm mb-4">Madere</span>
            <h1 className="text-4xl text-white font-serif">Cabo Girao</h1>
            <p className="text-stone-300">La plus haute falaise d Europe. 580m a pic sur l ocean.</p>
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
              Cabo Girao, c est le spot qui fait rever.
              <strong>580 metres de falaise directe dans l ocean.</strong>
              Y aller pour le lever ou le coucher du soleil.
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
              <h3 className="font-serif mb-3">Ou cafe</h3>
              <ul className="text-sm text-stone-600 space-y-1">
                <li><strong>Skybar:</strong> Vue panoramique</li>
                <li><strong>Cafe do Cabo:</strong> Simple, correct</li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-lg border">
              <h3 className="font-serif mb-3">Conseil</h3>
              <p className="text-sm text-stone-600">Venez tot ou en fin de journee. En plein milieu, c est bus de touristes.</p>
            </div>
          </section>
          <Link href="/destinations/madere" className="text-amber-700">← Retour Madere</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}