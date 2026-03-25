import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function Destination({ params }: Props) {
  const { slug } = await params
  const destinations: Record<string, any> = {
    'suisse': {
      name: 'Suisse',
      title: 'Slow travel alpin authentique',
      description: 'Découvrez les Alpes suisses à votre rythme, loin des sentiers touristiques battus.',
      highlights: ['Randonnées alpines', 'Villages pittoresques', 'Gastronomie locale', 'Lacs cristallins'],
    },
    'roumanie': {
      name: 'Roumanie',
      title: 'Nature sauvage Delta du Danube',
      description: 'Explorez la nature brute de la Roumanie et les mystères du Delta du Danube.',
      highlights: ['Delta du Danube', 'Carpates', 'Villages traditionnels', 'Biodiversité unique'],
    },
    'ile-de-france': {
      name: 'Île-de-France',
      title: 'Paris alternatif & Petite Ceinture',
      description: 'Redécouvrez la région parisienne loin des clichés touristiques.',
      highlights: ['Petite Ceinture', 'Paris bohème', 'Châteaux', 'Forêts'],
    },
    'madere': {
      name: 'Madère',
      title: 'Randonnées volcaniques en couple',
      description: 'Aventure volcanique et nature luxuriante sur l\'île de Madère.',
      highlights: ['Levadas', 'Côtes volcaniques', 'Flore tropicale', 'Panoramas époustouflants'],
    },
  }

  const destination = destinations[slug] || destinations['suisse']

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-eucalyptus/10 to-teal/10 py-20 md:py-32">
          <div className="container">
            <Link href="/" className="text-eucalyptus hover:text-teal transition mb-4 inline-block">← Retour</Link>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-mahogany mb-4">{destination.name}</h1>
            <p className="text-2xl text-charcoal">{destination.title}</p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2">
                <div className="bg-gradient-to-br from-eucalyptus/10 to-teal/10 rounded-lg h-96 flex items-center justify-center mb-8">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Image {destination.name}</p>
                  </div>
                </div>
                <h2 className="text-3xl font-serif font-bold text-mahogany mb-4">À propos</h2>
                <p className="text-lg text-charcoal leading-relaxed mb-8">
                  {destination.description}
                </p>
              </div>

              <div>
                <div className="bg-cloud-dancer p-8 rounded-lg border border-gray-200 sticky top-24">
                  <h3 className="text-2xl font-serif font-bold text-mahogany mb-6">Incontournables</h3>
                  <ul className="space-y-3 mb-8">
                    {destination.highlights.map((highlight: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-charcoal">
                        <span className="text-eucalyptus">✓</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full px-6 py-3 bg-eucalyptus text-white rounded-lg hover:bg-teal transition">
                    Planifier mon voyage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <h2 className="text-4xl font-serif font-bold text-mahogany mb-12 text-center">Autres destinations</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {['suisse', 'roumanie', 'ile-de-france', 'madere'].filter(s => s !== slug).map((destSlug) => (
                <Link key={destSlug} href={`/destinations/${destSlug}`} className="group">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
                    <h3 className="text-xl font-serif font-bold text-mahogany mb-2">
                      {destinations[destSlug].name}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4">{destinations[destSlug].title}</p>
                    <span className="text-eucalyptus font-semibold group-hover:text-teal transition">Découvrir →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
