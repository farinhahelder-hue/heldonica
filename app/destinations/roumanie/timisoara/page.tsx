'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function TimisoaraPage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Timisoara","description":"Découvrez cette destination avec Heldonica.","url":"https://heldonica.fr/destinations/roumanie/timisoara","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":45.7538355,"longitude":21.2257474}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Roumanie","item":"https://heldonica.fr/destinations/roumanie"},{"@type":"ListItem","position":4,"name":"Timisoara","item":"https://heldonica.fr/destinations/roumanie/timisoara"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Roumanie</span>
            <h1 className="text-4xl text-white font-serif">Timisoara</h1>
            <p className="text-stone-300">Ville hongroise. Art Nouveau.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/roumanie" className="text-stone-500 hover:text-amber-700">Roumanie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Timisoara, ville hongroise. Art Nouveau, jardins.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🏛️</div><h3 className="font-serif">Place</h3></div>
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🎨</div><h3 className="font-serif">Art Nouveau</h3></div>
            <div className="p-4 bg-white rounded-lg border"><div className="text-2xl mb-2">🌳</div><h3 className="font-serif">Jardins</h3></div>
          </section>
          <Link href="/destinations/roumanie" className="text-amber-700">← Retour Roumanie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}