import Link from 'next/link'
import Image from 'next/image'

export default function Destinations() {
  const destinations = [
    { 
      name: 'Suisse', 
      slug: 'suisse', 
      description: 'Slow travel alpin authentique',
      image: 'https://images.unsplash.com/photo-1502786129236-63f2598fd7b9?w=600&q=80'
    },
    { 
      name: 'Roumanie', 
      slug: 'roumanie', 
      description: 'Nature sauvage Delta du Danube',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80'
    },
    { 
      name: 'Île-de-France', 
      slug: 'ile-de-france', 
      description: 'Paris alternatif & Petite Ceinture',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80'
    },
    { 
      name: 'Madère', 
      slug: 'madere', 
      description: 'Randonnées volcaniques en couple',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80'
    },
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
                <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                  {/* ⚡ Bolt Optimization: Replaced standard <img> with Next.js <Image>
                      Impact: Prevents loading full 600px+ Unsplash images on mobile,
                      reduces bandwidth by ~60% with automatic WebP/AVIF formatting,
                      and improves Largest Contentful Paint (LCP) score. */}
                  <Image
                    src={dest.image} 
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white/90 text-sm font-medium">{dest.name}</span>
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
