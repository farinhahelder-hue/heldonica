import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Cali Colombie | Capitale mondiale de la salsa, guide slow travel | Heldonica",
    description: "Cali, capitale de la salsa : clubs mythiques, Festival de la Feria, street food du Valle del Cauca. Guide slow travel pour découvrir la ville comme un local.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/colombie/cali' },
  };
}

const pepites = [
  { 
    title: 'La Calle 38', 
    description: 'Cette avenue, surnommée la Salsa Avenue, concentre les mejores salles de danse de Cali. Les établissements comme Zofé, El Palacio et El Bajo Mundo attirent les danseurs professionnels et les amateurs chaque soir. La plupart des bars proposent des cours gratuits entre 20h et 22h, avant que les DJ n\'enchaînent les morceaux de salsa, cumbia et chachacha. L\'ambiance monte crescendo jusqu\'à l\'aube, quand les derniers danseurs rejoignent les échoppes de sancocho pour le petit-déjeuner.',
    icon: '💃' 
  },
  { 
    title: 'La Feria de Cali', 
    description: 'Chaque année, du 25 au 30 décembre, Cali vit au rythme de sa féria annuelle. Ce festival, créé en 1957, attire plus de 4 millions de visiteurs venus admirer les défilés de chars fleuris, les spectacles de rodéo et les concours de salsa sur scène. Le Silletón, ce personnage masqué qui déambule dans les rues avec un fauteuil sur la tête, symbolise la joie de vivre Cali. Les spectacles de vallenato et de música del Pacífico résonnent dans tous les quartiers.', 
    icon: '🏃' 
  },
  { 
    title: 'Street Food du Valle del Cauca', 
    description: 'La gastronomie caleña reflète la richesse du Valle del Cauca, cette région agricole où se mêlent traditions afro-colombiennes et influences indigènes. Les empanadas de viento, fourrées au fromage et frites deux fois, constituent l\'en-cas ubiquitous. Le sancocho de gallina, ragoût de poulet aux plantains et légumes, se déguste dans les cantinas du marché. Les jus de fruits exotiques, préparés avec du cholupa, du maracuyá ou du lulo, désaltèrent dans la chaleur tropicale.', 
    icon: '🌯' 
  },
  { 
    title: 'Le Cristo Rey', 
    description: 'Cette statue géante du Christ de 26 mètres de hauteur, installée sur le Cerro de las Tres Cruces en 1953, offre un panorama imprenable sur Cali et la vallée du Cauca. Le funiculaire, inaugurated en 1998, permet d\'accéder au sommet en 7 minutes. Les marches de l\'escalier, au nombre de 300, constituent le pèlerinage preferred des croyants le dimanche. Le coucher du soleil sur la ville, quand les lumières s\'allument dans les quartiers en contrebas, crée un moment de magie pure.', 
    icon: '🗿' 
  },
]

export default function CaliPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Colombie</span>
            <h1 className="text-4xl text-white font-serif">Cali</h1>
            <p className="text-stone-300">La capitale mondiale de la salsa au rythme du Valle del Cauca</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/colombie" className="text-stone-500 hover:text-amber-700">Colombie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Cali, surnommée la Sucré Metropolis, occupe une place particulière dans le cœur des Colombiens. Cette ville de 2,5 millions d'habitants, nichée dans le Valle del Cauca à 1 000 mètres d'altitude, combine la chaleur tropicale avec une énergie culturelle inégalée. La salsa, importée de Porto Rico et de Cuba dans les années 1970, s'est appropriée ici une identité propre, plus sensuelle et plus rapide que dans les Caraïbes. Chaque soir, les salles de danse emplissent les rues de rythme et de passion.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Au-delà de la salsa, Cali révèle une identité multifaceted. Les origines africaines, héritées du commerce colonial d'esclaves, imprègnent la musique, la danse et la gastronomie. Les quartiers de San Antonio et El Peñón conservent l'architecture coloniale avec leurs maisons blanchies à la chaux et leurs balcons ornés de fleurs. La proximité du Parque Nacional Natural Farallones permet des excursions en forêt tropicale avant le retour en ville pour une soirée de salsa.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-serif mb-6 text-stone-800">Nos pépites</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pepites.map((p, i) => (
                <div key={i} className="p-6 bg-white rounded-lg border border-stone-200">
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-10 bg-gradient-to-r from-amber-50 to-stone-50 p-6 rounded-xl border border-amber-100">
            <h2 className="text-xl font-serif mb-4 text-stone-800">💡 Le secret de Heldonica</h2>
            <p className="text-stone-700">Pour vivre Cali comme un caleño, commencez votre journée au Mercado de la Alameda pour un petit-déjeuner d'empanadas et de jus de fruits frais. L'après-midi, flânez dans le quartier de San Antonio jusqu'au parc du même nom, où les groupes de salsa practican sur la place publique. Le soir, allez à la Casa de la Salsa sur la carrera 10 pour un cours avec les masters locaux. Terminez votre nuit à La Topa, ce club gratuit où les meilleurs danseurs show leurs moves jusqu'à l'aube.</p>
          </section>
          <Link href="/destinations/colombie" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Colombie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}