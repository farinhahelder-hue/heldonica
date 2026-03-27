import Link from "next/link"
import Image from "next/image"

const destinations = [
  {
        slug: "paris",
        name: "Paris",
        country: "France",
        image: "/images/paris.jpg",
        description: "La ville lumière"
  },
  {
        slug: "tokyo",
        name: "Tokyo", 
        country: "Japon",
        image: "/images/tokyo.jpg",
        description: "Tradition et modernité"
  },
  {
        slug: "new-york",
        name: "New York",
        country: "États-Unis",
        image: "/images/new-york.jpg",
        description: "La ville qui ne dort jamais"
  },
  {
        slug: "rome",
        name: "Rome",
        country: "Italie",
        image: "/images/rome.jpg",
        description: "La ville éternelle"
  }
  ]

export default function DestinationsPage() {
    return (
          <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-16">
                        <h1 className="text-4xl font-bold text-center mb-4">Nos Destinations</h1>h1>
                        <p className="text-gray-600 text-center mb-12">Découvrez nos destinations de voyage</p>p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {destinations.map((dest) => (
                        <Link 
                                        key={dest.slug}
                                        href={`/destinations/${dest.slug}`}
                                        className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                                      >
                                      <div className="aspect-[4/3] relative bg-gray-200">
                                                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                        {dest.name}
                                                      </div>div>
                                      </div>div>
                                      <div className="p-4">
                                                      <h2 className="font-semibold text-lg group-hover:text-blue-600">{dest.name}</h2>h2>
                                                      <p className="text-sm text-gray-500">{dest.country}</p>p>
                                                      <p className="text-sm text-gray-600 mt-2">{dest.description}</p>p>
                                      </div>div>
                        </Link>Link>
                      ))}
                        </div>div>
                </div>div>
          </main>main>
        )
}</main>
