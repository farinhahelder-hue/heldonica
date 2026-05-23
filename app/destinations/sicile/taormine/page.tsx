'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function TaorminePage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Taormine","description":"Découvrez cette destination avec Heldonica.","url":"https://heldonica.fr/destinations/sicile/taormine","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":37.8512218,"longitude":15.2830191}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Sicile","item":"https://heldonica.fr/destinations/sicile"},{"@type":"ListItem","position":4,"name":"Taormine","item":"https://heldonica.fr/destinations/sicile/taormine"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Sicile</span>
            <h1 className="text-4xl text-white font-serif">Taormine</h1>
            <p className="text-stone-300">Est. Theatre grec, vue mer.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sicile" className="text-stone-500 hover:text-amber-700">Sicile</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Taormine, c est le spot tourism. Le theatre grec avec vue sur la mer. Incredible.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🏛️</div>
              <h3 className="font-serif">Theatre</h3>
              <p className="text-sm text-stone-600">Grec.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🌊</div>
              <h3 className="font-serif">Isola Bella</h3>
              <p className="text-sm text-stone-600">Plage.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🚌</div>
              <h3 className="font-serif">Corvette</h3>
              <p className="text-sm text-stone-600">Gare.</p>
            </div>
          </section>
          <Link href="/destinations/sicile" className="text-amber-700">← Retour Sicile</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}