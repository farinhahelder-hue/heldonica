import Header from '@/components/Header'
import HeroVideo from '@/components/HeroVideo'
import Services from '@/components/Services'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      
      {/* HERO SECTION */}
      <section className="relative h-screen bg-black flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4"
        />
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-serif font-light mb-6 tracking-tight">
            Explorateurs émerveillés, dénicheurs de pépites.
          </h1>
          <p className="text-xl md:text-2xl font-light text-gray-200 leading-relaxed mb-8">
            Nous croyons que l'aventure ne se trouve pas seulement au bout du monde. Elle se cache dans une ruelle oubliée, un marché de quartier, un café discret en Provence, un sentier silencieux ou une adresse simple qui révèle toute l'âme d'un lieu.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/blog" className="px-8 py-3 bg-amber-900 hover:bg-amber-800 text-white rounded-lg font-semibold transition">
              Découvrir nos carnets
            </a>
            <a href="/travel-planning-form" className="px-8 py-3 border-2 border-white hover:bg-white hover:text-black text-white rounded-lg font-semibold transition">
              Voyage sur mesure
            </a>
          </div>
        </div>
      </section>

      {/* PRÉSENTATION DU CONCEPT */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 text-gray-900">
                Un art du voyage autrement
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Nous sommes un duo de contrastes : elle, urbaine parisienne, sensible à l'architecture, à la philosophie et aux détails qui font vibrer une ville ; lui, passionné d'histoire, de photographie et de territoires oubliés.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Ensemble, nous explorons la nature, les villes à contre-courant, les lieux singuliers, la gastronomie locale et toutes les façons de voyager autrement. À travers nos itinéraires vécus, nos adresses testées et nos inspirations gourmandes, nous partageons un art du voyage plus lent, plus sensoriel, plus vivant.
              </p>
              <div className="space-y-2 text-gray-600">
                <p><strong>Terrains signatures :</strong></p>
                <p className="text-sm">Paris • Île-de-France • Normandie • Le Havre • Madère • Timișoara</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-green-50 rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-600 italic">Chaque lieu raconte une histoire. Nous les racontons ensemble.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SÉLECTION D'ITINÉRAIRES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-gray-900 text-center">
            Nos itinéraires vécus
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Des carnets de voyage authentiques, testés et documentés. Chaque itinéraire est une invitation à découvrir autrement.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Madère Slow Travel",
                description: "Entre falaises vertigineuses et jardins suspendus, un voyage au rythme des sentiers côtiers.",
                icon: "🌊",
                duration: "7-10 jours",
                link: "/destinations"
              },
              {
                title: "Paris Insolite",
                description: "Au-delà des monuments, découvrez les passages secrets, les ateliers d'artistes et les bistrots authentiques.",
                icon: "🏛️",
                duration: "3-5 jours"
              },
              {
                title: "Normandie Poétique",
                description: "Falaises de craie, villages de charme et patrimoine maritime. Un voyage dans le temps et la beauté.",
                icon: "🌾",
                duration: "4-6 jours"
              },
              {
                title: "Timișoara Méconnue",
                description: "Architecture austro-hongroise, histoire riche et gastronomie généreuse. L'Europe de l'Est autrement.",
                icon: "🏰",
                duration: "5-7 jours"
              },
              {
                title: "Le Havre Contemporain",
                description: "Architecture moderniste, musées avant-gardistes et port mythique. Une ville en renaissance.",
                icon: "⚓",
                duration: "2-3 jours"
              },
              {
                title: "Île-de-France Cachée",
                description: "Châteaux, forêts et villages pittoresques. L'essence de la France à quelques kilomètres de Paris.",
                icon: "🏞️",
                duration: "3-4 jours"
              }
            ].map((itinerary, i) => (
              <a key={i} href={itinerary.link || "#"} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition block hover:translate-y-[-4px]">
                <div className="text-4xl mb-3">{itinerary.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{itinerary.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{itinerary.description}</p>
                <p className="text-amber-900 font-semibold text-sm">⏱️ {itinerary.duration}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* BLOC INSPIRATION CULINAIRE */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-700 italic font-semibold">La gastronomie, c'est l'âme d'un voyage.</p>
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-light mb-6 text-gray-900">
                Inspirations gourmandes
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Nous ne voyageons pas seulement pour voir, mais aussi pour goûter. Chaque destination révèle ses saveurs authentiques : les recettes portugaises transmises de génération en génération, les brasseries parisiennes incontournables, les restaurants cachés qui font vibrer les cœurs.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Nos sélections culinaires ne sont jamais des listes touristiques. Ce sont des adresses testées, des rencontres avec des chefs passionnés, des moments de partage autour d'une table où l'on raconte des histoires.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🥘</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Recettes locales</h4>
                    <p className="text-sm text-gray-600">Découvrez les secrets culinaires des régions que nous explorons</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🍷</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Accords mets-vins</h4>
                    <p className="text-sm text-gray-600">Les meilleurs vins pour sublimer chaque moment de voyage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👨‍🍳</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Rencontres culinaires</h4>
                    <p className="text-sm text-gray-600">Les histoires des chefs et restaurateurs qui font la différence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES & VOYAGE SUR MESURE */}
      <section className="py-20 bg-gradient-to-br from-amber-900 to-green-900 text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-4 text-center">
            Voyage sur mesure
          </h2>
          <p className="text-center text-amber-100 mb-12 max-w-2xl mx-auto text-lg">
            Confiez-nous les clés de votre prochaine aventure. Nous créons des itinéraires qui vous ressemblent.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Itinéraires personnalisés",
                description: "Basés sur vos envies, votre style de voyage et vos contraintes. Aucun itinéraire n'est identique.",
                icon: "🗺️"
              },
              {
                title: "Adresses testées",
                description: "Hôtels de charme, restaurants cachés, expériences authentiques. Tout ce que nous recommandons, nous l'avons vécu.",
                icon: "⭐"
              },
              {
                title: "Carnet de voyage",
                description: "Un document complet avec cartes, conseils pratiques, adresses et inspirations pour chaque étape.",
                icon: "📖"
              }
            ].map((service, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20 hover:border-white/40 transition">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-amber-100">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <div>
              <a 
                href="/destinations" 
                className="inline-block px-8 py-4 bg-white text-amber-900 rounded-lg font-semibold hover:bg-amber-50 transition shadow-lg mr-4"
              >
                Découvrir nos destinations →
              </a>
              <a 
                href="/travel-planning-form" 
                className="inline-block px-8 py-4 bg-white text-amber-900 rounded-lg font-semibold hover:bg-amber-50 transition shadow-lg"
              >
                Voyage sur mesure →
              </a>
            </div>
          </div>
        </div>
      </section>

      <HeroVideo />
      <Services />
      <Footer />
    </>
  )
}
