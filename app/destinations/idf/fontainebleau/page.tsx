import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Fontainebleau IDF | Forêt de brosses, escalade et château royal | Heldonica",
    description: "Fontainebleau : forêt de 25 000 hectares, sites d'escalade mythiques, château des rois de France. Guide slow travel pour une escapade nature depuis Paris.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/idf/fontainebleau' },
  };
}

const pepites = [
  { 
    title: 'Forêt de Fontainebleau', 
    description: 'Cette forêt domaniale de 25 000 hectares constitue le plus grand massif forestier d\'Île-de-France. Les 1 500 km de sentiers balisés permettent de découvrir des landscapes variés : pinèdes odorantes, chênaies séculaires, landes de bruyères et chaos de rochers millénaires. Les pierres de grès, sculptées par l\'érosion sur des millions d\'années, créent des formes fantastiques que l\'imagination populaire a rebaptisées : l\'Éléphant, le Cheval, la Tête de Chien. La forêt fut le cadre de chasse préféré des rois de France depuis François Ier jusqu\'à Louis XV.',
    icon: '🌲' 
  },
  { 
    title: 'Sites d\'escalade', 
    description: 'Fontainebleau accueille la première zone d\'escalade de blocs en Europe, avec plus de 30 000 problèmes tracés sur 500 secteurs. Le massif d\'Apremont, les Gorges d\'Ailly et le secteur de la Triple Paroi attirent des grimpeurs du monde entier. Les prises多样化 de grès, appelées « brosses », offrent une texture unique qui réclame une technique spécifique. Les falaises calcaires atteignent 30 mètres et proposent des voies pour tous niveaux, du débutant au grimpeur confirmé recherchant des problèmes extrêmes.',
    icon: '🧗' 
  },
  { 
    title: 'Château de Fontainebleau', 
    description: 'Ce palais royal, seul château à avoir été habité par tous les souverains français de François Ier à Napoléon III, constitue un joyau architectural méconnu. Les 1 500 pièces s\'organisent autour de quatre cours Successives reflétant les Styles de chaque époque. La galerie François-Ier, chef-d\'œuvre de la Renaissance française, impressionne par ses fresques mythologiques. Les appartements de Napoléon et l\'escalier en fer à cheval constituent d\'autres temps forts de la visite.',
    icon: '🏰' 
  },
  { 
    title: 'Étang de la Forge', 
    description: 'Ce plan d\'eau de 8 hectares, alimenté par la forêt et bordé de pins maritimes, offre un cadre idyllique pour la détente. Les activités nautiques non motorisées (canoë-kayak, paddle) permettent de explorer les rives herbeuses où paissent les chevaux de race locale. Un sentier de 3 kilomètres fait le tour de l\'étang, avec des points de vue sur les rochers environnants. Le restaurant de la Forge propose une cuisine du terroir dans un ancien pavillon de chasse du XVIe siècle.',
    icon: '🏞️' 
  },
]

export default function FontainebleauPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Île-de-France</span>
            <h1 className="text-4xl text-white font-serif">Fontainebleau</h1>
            <p className="text-stone-300">La forêt des rois, les rochers millénaires et le palais royal à une heure de Paris</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/idf" className="text-stone-500 hover:text-amber-700">Île-de-France</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Fontainebleau représente l'évasion nature par excellence pour les Parisiens en quête d'air frais et de grands espaces. Cette ville de 15 000 habitants, située à 55 kilomètres au sud-est de Paris, partage son territoire entre la plus grande forêt domaniale d'Île-de-France et un centre historique dominé par son palais royal. La combinaison unique de nature sauvage et de patrimoine historique fait de Fontainebleau une destination idéale pour une journée ou un week-end.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La forêt de Fontainebleau, classée réserve biologique intégrale depuis 1952, protège un écosystèmeexceptionnel. Les zones de landes, les tourbières et les pelouses sableuses hébergent des espèces végétales et animales rares. Les cerfs et les sangliers, présents en grand nombre, témoignent de l'état de conservation remarquable du massif. Les quatre saisons révèlent des ambiances différentes : les bouleaux argentés de l'hiver, les bruyères roses de l'été, les couleurs flamboyantes de l'automne et la pousse printanière des fougères.
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
            <p className="text-stone-700">Pour découvrir Fontainebleau comme un initié, partez tôt le matin vers le secteur de la Roche aux Potences. Cette zone moins fréquentée offre des circuits de bouldering pour tous niveaux dans un cadre enchanteur. Après l'effort, le déjeuner au Relais de l'Ouche, cette auberge discrète cachée dans les bois, propose une cuisine du terroir préparée avec les produits de la forêt : cèpes de printemps, gibier d'automne, miel des ruchers environnants. Le dessert, une tarte aux myrtilles sauvages, justifie à lui seul le déplacement.</p>
          </section>
          <Link href="/destinations/idf" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Île-de-France</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}