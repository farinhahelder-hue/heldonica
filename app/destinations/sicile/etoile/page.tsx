'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function EtoilePage() {
  return (
    <>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"TouristDestination","name":"Etoile","description":"Découvrez cette destination avec Heldonica.","url":"https://heldonica.fr/destinations/sicile/etoile","touristType":{"@type":"Audience","audienceType":"couple"},"geo":{"@type":"GeoCoordinates","latitude":37.5549611,"longitude":14.2893785}}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil","item":"https://heldonica.fr"},{"@type":"ListItem","position":2,"name":"Destinations","item":"https://heldonica.fr/destinations"},{"@type":"ListItem","position":3,"name":"Sicile","item":"https://heldonica.fr/destinations/sicile"},{"@type":"ListItem","position":4,"name":"Etoile","item":"https://heldonica.fr/destinations/sicile/etoile"}]}) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm inline-block">⭐ Secret Gem</span>
            <h1 className="text-4xl text-white font-serif">Isole Eoliennes</h1>
            <p className="text-stone-300">Volcans, boue.</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/sicile" className="text-stone-500 hover:text-amber-700">Sicile</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-8">
            <p className="text-lg text-stone-700">Les Eoliennes, c est le volcan sous la mer. Boue chaude, plages noires,Lipari, Salina.</p>
          </section>
          <section className="mb-8 grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🌋</div>
              <h3 className="font-serif">Vulcano</h3>
              <p className="text-sm text-stone-600">Boue.</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-2xl mb-2">🍷</div>
              <h3 className="font-serif">Malvasia</h3>
              <p className="text-sm text-stone-600">Vin.</p>
            </div>
          </section>
          <section className="mb-8 p-5 bg-amber-50 rounded-lg border border-amber-200">
            <h3 className="font-serif mb-2">💡 Le moment</h3>
            <p className="text-sm text-stone-700">Mai-Juin -- moins de monde, temperatures OK.</p>
          </section>
          <Link href="/destinations/sicile" className="text-amber-700">← Retour Sicile</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}