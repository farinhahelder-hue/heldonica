'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function CaliPage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Cali","description":"Découvrez cette destination avec Heldonica.","url":"https://heldonica.fr/destinations/colombie/cali","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":3.4108435,"longitude":-76.5812127}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Colombie","item":"https://heldonica.fr/destinations/colombie"},{"@type":"ListItem","position":4,"name":"Cali","item":"https://heldonica.fr/destinations/colombie/cali"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Colombie</span>
            <h1 className="text-4xl text-white font-serif">Cali</h1>
            <p className="text-stone-300">Capitale de la salsa. Valle del Cauca.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/colombie" className="text-stone-500 hover:text-amber-700">Colombie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Cali, c est la capitale mondiale de la salsa. Les clubs, les festivals, la fievre.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">💃</div>
              <h3 className="font-serif">Salsa</h3>
              <p className="text-sm text-stone-600">Calle 38.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏃</div>
              <h3 className="font-serif">Feria</h3>
              <p className="text-sm text-stone-600">Decembre.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🌯</div>
              <h3 className="font-serif">Canqui</h3>
              <p className="text-sm text-stone-600">Empanadas.</p>
            </div>
          </section>
          <Link href="/destinations/colombie" className="text-amber-700">← Retour Colombie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}