'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function MedellinPage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Medellin","description":"Découvrez cette destination avec Heldonica.","url":"https://heldonica.fr/destinations/colombie/medellin","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":6.2697324,"longitude":-75.6025597}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Colombie","item":"https://heldonica.fr/destinations/colombie"},{"@type":"ListItem","position":4,"name":"Medellin","item":"https://heldonica.fr/destinations/colombie/medellin"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Colombie</span>
            <h1 className="text-4xl text-white font-serif">Medellin</h1>
            <p className="text-stone-300">Ville de l eternelle printemps. Parche, metro.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/colombie" className="text-stone-500 hover:text-amber-700">Colombie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Medellin, c est la transformation. Le clima eternal, les parches, le metro cable.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🌿</div>
              <h3 className="font-serif">Parche</h3>
              <p className="text-sm text-stone-600">Jardins botaniques.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🚡</div>
              <h3 className="font-serif">Metro Cable</h3>
              <p className="text-sm text-stone-600">Comuna 13.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">💃</div>
              <h3 className="font-serif">Salsa</h3>
              <p className="text-sm text-stone-600">Parque Leras.</p>
            </div>
          </section>
          <Link href="/destinations/colombie" className="text-amber-700">← Retour Colombie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}