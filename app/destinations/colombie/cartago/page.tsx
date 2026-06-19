import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Cartago Colombie | Route du café, fincas et traditions du Valle del Cauca | Heldonica",
    description: "Cartago dans le Valle del Cauca : route du café, fincas coloniales, iglesia de la Veracruz. Découvrez les plantations de café et l'art de vivre caleño.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/colombie/cartago' },
  };
}

const pepites = [
  { 
    title: 'Fincas de café', 
    description: 'Les plantations de café autour de Cartago s\'étendent sur les flancs de la Cordillera Occidental, entre 1 200 et 1 800 mètres d\'altitude. Le microclimat de cette zone, caractérisé par des pluies régulières et des brouillards matinaux, produit un café à l\'acidité brillante et aux arômes floraux recherchés par les tostadores spécialisés. Les fincas familiales, transmises de génération en génération depuis le XIXe siècle, accueillent les visiteurs pour des visites commentées qui expliquent le processus de la fleur à la tasse.',
    icon: '☕' 
  },
  { 
    title: 'Iglesia de la Veracruz', 
    description: 'Cette église coloniale du XVIe siècle, construite par les espagnols sur le modèle des édifices religieux andalous, constitue le monument historique le plus important de Cartago. La façade en pierre de taille, les arcs de brique rouge et le clocher mudéjar témoignent de l\'architecture coloniale espagnole. Chaque année en mai, la fête de la Cruz attire des pèlerins de toute la région pour une procession fleurie qui traverse les rues du centre historique.',
    icon: '⛪' 
  },
  { 
    title: 'Marché de fruits tropicaux', 
    description: 'Le marché central de Cartago propose une explosion de couleurs et de saveurs tropicales. Les étals regorgent de fruitscolombiens inconnus en Europe : cholupa à la chair orangée, lulo aux notes d\'ananas, guanábana au goût de crème pâtissière, ou encore patilla, cette pastèque gigante qui rafraîchit les chaudes après-midi. Les jus fraîchement pressés, préparés avec du leche de hueso, ce lait de vachelocal élevé, constituent le petit-déjeuner typique des Cartagueños.',
    icon: '🥭' 
  },
  { 
    title: 'Route du café vers Salado', 
    description: 'La route qui relie Cartago à Salado traverse les meilleures zones caféières du Valle del Cauca. Les collines couvertes de plants de café, entrecoupées de bananiers plantains et d\'arbres d\'ombre, créent un paysage verdoyant particulièrement photogénique au lever du soleil. Les arrêts dans les fincas permettent de déguster un café préparé selon la méthode traditionnelle colombienne, infusé lentement dans un filtre en tissu et sucré avec du panelita.',
    icon: '🌱' 
  },
]

export default function CartagoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Colombie</span>
            <h1 className="text-4xl text-white font-serif">Cartago</h1>
            <p className="text-stone-300">La ville coloniale au cœur de la zone caféière du Valle del Cauca</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/colombie" className="text-stone-500 hover:text-amber-700">Colombie</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Cartago, fondée en 1540 par le conquistador Jorge Robledo, représente l'une des plus anciennes villes coloniales de Colombie. Cette cité de 130 000 habitants, située dans la vallée du río La Vieja à 900 mètres d'altitude, conserve un centre historique aux rues pavées bordées de maisons coloniales aux façades ocre et jaune. La températuremoyenne de 24°C et l'humidité tropicale créent des conditions idéales pour la culture du café qui fit la richesse de la région.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La ville constitue la porte d'entrée vers la zona cafetera, cette région montagneuse où se concentre la production du meilleur café de Colombie. Les fincas dispersées sur les flancs des Andes produisent un café arabica de specialty prisé par les connaisseurs du monde entier. Chaque finca a sa propre historia, sa propre recette de fermentation et son propre profil de torréfaction. Les visites dans ces exploitations familiales permettent de comprendre les liens intimes entre le paysage, le climat et la tasse de café.
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
            <p className="text-stone-700">Pour une expérience authentique, contactez directement le señor Miguel Ángel de la finca La Esperanza à Salado. Sa famille cultive du café depuis quatre générations et accueille les voyageurs pour une journée complète incluant la récolte, le décorticage, la fermentation et la dégustation. Le déjeuner à la ferme, préparé avec les produits du potager et servi bajo el corredor, offre une immersion dans la vie quotidienne rurale colombienne que les circuits touristiques ne proposent jamais.</p>
          </section>
          <Link href="/destinations/colombie" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Colombie</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}