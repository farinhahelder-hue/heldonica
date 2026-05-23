'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function CagliariPage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Cagliari","description":"Découvrez cette destination avec Heldonica.","url":"https://heldonica.fr/destinations/sardaigne/cagliari","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":39.2171994,"longitude":9.113311}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Sardaigne","item":"https://heldonica.fr/destinations/sardaigne"},{"@type":"ListItem","position":4,"name":"Cagliari","item":"https://heldonica.fr/destinations/sardaigne/cagliari"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Sardaigne</span>
            <h1 className="text-4xl text-white font-serif">Cagliari</h1>
            <p className="text-stone-300">Le sud. Lagune, dunes, sel.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sardaigne" className="text-stone-500 hover:text-amber-700">Sardaigne</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Cagliari, c est le sud. La lagune avec les flamants, les dunes de Piscinas.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🦩</div>
              <h3 className="font-serif">Lagune</h3>
              <p className="text-sm text-stone-600">Flamants roses.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏖️</div>
              <h3 className="font-serif">Piscinas</h3>
              <p className="text-sm text-stone-600">Dunes.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🧂</div>
              <h3 className="font-serif">Salines</h3>
              <p className="text-sm text-stone-600">Sel rose.</p>
            </div>
          </section>
          <Link href="/destinations/sardaigne" className="text-amber-700">← Retour Sardaigne</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}