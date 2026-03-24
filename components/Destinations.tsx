import Link from 'next/link'

export default function Destinations() {
  const destinations = [
    { name: 'Suisse', slug: 'suisse', description: 'Slow travel alpin authentique' },
    { name: 'Roumanie', slug: 'roumanie', description: 'Nature sauvage Delta du Danube' },
    { name: 'Île-de-France', slug: 'ile-de-france', description: 'Paris alternatif & Petite Ceinture' },
    { name: 'Madère', slug: 'madere', description: 'Randonnées volcaniques en couple' },
  ]

  return (
    <section className="bg-cloud-dancer section-spacing">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-mahogany mb-4 text-center">
          Nos Pépites
        </h2>
        <p className="text-center text-gray-600 mb-16 text-lg">
          4 destinations phares pour l'aventure en couple
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <Link key={dest.slug} href={`/destinations/${dest.slug}`}>
              <div className="group cursor-pointer">
                <div className="bg-gradient-to-br from-eucalyptus/10 to-teal/10 rounded-lg h-48 flex items-center justify-center mb-4 group-hover:shadow-lg transition">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">{dest.name}</p>
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-mahogany mb-2">{dest.name}</h3>
                <p className="text-gray-700 text-sm">{dest.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
