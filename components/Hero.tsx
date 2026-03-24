import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-32">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-mahogany mb-6">
              L'Expert de l'Aventure
            </h1>
            <p className="text-xl text-charcoal mb-8 leading-relaxed">
              Slow travel en couple écoresponsable & Consulting hôtelier indépendant
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/travel-planning" className="px-8 py-3 bg-eucalyptus text-white rounded-lg hover:bg-teal transition text-center">
                Travel Planning
              </Link>
              <Link href="/hotel-consulting" className="px-8 py-3 border-2 border-eucalyptus text-eucalyptus rounded-lg hover:bg-eucalyptus/5 transition text-center">
                Consulting Hôtelier
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-eucalyptus/10 to-teal/10 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-sm">Image Hero</p>
              <p className="text-gray-400 text-xs">(Couple slow travel)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
