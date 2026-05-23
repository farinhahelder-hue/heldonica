'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function FontainebleauPage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Fontainebleau","description":"Découvrez cette destination avec Heldonica.","url":"https://heldonica.fr/destinations/idf/fontainebleau","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":48.4049375,"longitude":2.7015872}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Idf","item":"https://heldonica.fr/destinations/idf"},{"@type":"ListItem","position":4,"name":"Fontainebleau","item":"https://heldonica.fr/destinations/idf/fontainebleau"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">IdF</span>
            <h1 className="text-4xl text-white font-serif">Fontainebleau</h1>
            <p className="text-stone-300">Foret. Escarpements, escalade.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/idf" className="text-stone-500 hover:text-amber-700">IdF</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">La foret. Les rochers, les parcours.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🌲</div><h3 className="font-serif">Foret</h3></div>
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🧗</div><h3 className="font-serif">Escalade</h3></div>
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🏰</div><h3 className="font-serif">Chateau</h3></div>
          </section>
          <Link href="/destinations/idf" className="text-amber-700">← Retour IdF</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}