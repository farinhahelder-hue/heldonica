import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Versailles IDF | Château, jardins et Grand Canal | Heldonica",
    description: "Versailles : château des rois de France, jardins à la française, Grand Canal. Guide slow travel pour une journée royale loin des foules.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/idf/versailles' },
  };
}

const pepites = [
  { 
    title: 'Le Château', 
    description: 'Ce palais royal, commencé par Louis XIII en 1623 et agrandi par Louis XIV qui y installa la cour en 1682, constitue le plus vaste ensemble palatial d\'Europe. Les 2 300 pièces s\'étendent sur 63 000 m² et le domaine couvre 800 hectares. La Galerie des Glaces, longue de 73 mètres, illustre la puissance de la France avec ses 357 miroirs et ses arches dorées. Les appartements royaux, ouverts sur les jardins, révèlent le faste de la monarchie absolue à travers lesobeau, la chambre du Roi et le salon de la Paix.',
    icon: '🏰' 
  },
  { 
    title: 'Les Jardins à la Française', 
    description: 'Ces jardins de 830 hectares, dessinés par André Le Nôtre pour Louis XIV, constituent le chef-d\'œuvre de l\'art des jardins européen. Les parterres de broderies de buis, les bassins géométriques et les allées rectilignes créent une perspective monumentaleordonnée autour de l\'Ombré d\'Eau. Les statues de marbre, au nombre de 372, animent les terrasses et les rampes. Le contraste entre la rigueur architecturale des espaces proches du château et la naturel apparent des bosquets révèle le génie de Le Nôtre.',
    icon: '🌳' 
  },
  { 
    title: 'Le Grand Canal', 
    description: 'Ce plan d\'eau de 1 600 mètres de longueur et 62 mètres de largeur, creusé entre 1667 et 1671, constitue l\'axe central des jardins. Le bassin principal, alimenté par la Machine de Marly, reflète les ailes du château et offre des promenades en barque inoubliables. Les bals sur l\'eau organisés pendant les Grandes Eaux nocturnes, avecFeu d\'artifice et espectáculo pyrotechnique, recréent l\'ambiance fastueuse des réceptions royales. Le Grand Canal permettait également les exhibitions navales avec des miniatures de vaisseaux de guerre.',
    icon: '🚣' 
  },
  { 
    title: 'Le Hameau de la Reine', 
    description: 'Ce village miniature, construit entre 1783 et 1787 pour Marie-Antoinette, offre une parenthèse champêtre au cœur des jardins. Les douze Maisons de押寓, incluant le Moulin, la Ruche et la Tour de Marlborough, abritent des salons décorés avec raffinement. Le Dairy, le Réfectoire et le billard complètent cet ensemble où la reine jouait à la bergère loin du protocole. Le jardin français qui entoure le hameau, avec son Potager et son Bouchard, fournissait les fruits et légumes de la cour.',
    icon: '🏘️' 
  },
]

export default function VersaillesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Île-de-France</span>
            <h1 className="text-4xl text-white font-serif">Versailles</h1>
            <p className="text-stone-300">Le faste royal, les jardins majestueux et le rêve champêtre de Marie-Antoinette</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/idf" className="text-stone-500 hover:text-amber-700">Île-de-France</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Versailles, cette ville de 85 000 habitants située à 20 kilomètres de Paris, demeure indissociable de son château, symbole du pouvoir absolu des rois de France. Le Roi Soleil, Louis XIV, fit de ce pavillon de chasse un palais incomparable où la France montra sa magnificence au monde entier. Le Treaty de Versailles, signé ici en 1919, mit fin à la Première Guerre mondiale et redessina la carte de l'Europe, ancrant définitivement Versailles dans l'histoire mondiale.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La visite du château et des jardins réclame du temps. Lesguides recommandent 3 à 4 heures pour les seuls appartements royaux, auxquelles il faut ajouter la visite des ailes et des appartements de Mesdames. Les jardins, immenses, se parcourent à pied, en petit train ou en barque, avec des détours vers le Hameau de la Reine, le Grand Canal et le Théâtre de la Reine. Les musicales, qui animent certaines journées d'été, et les Grandes Eaux nocturnes, avecFeu d'artifice sur le bassin de Neptune, constituent des événements majeurs.
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
            <p className="text-stone-700">Pour profiter de Versailles dans le calme, achetez le billet « Château + Jardins » avec accès au Petit Trianon et au Hameau de la Reine. Arrivez à l'ouverture à 9h et commencez par les appartements avant que les cars de touristes n'envahissent les salles. Le déjeuner à la Petite Polandaise, cette salon de thé caché près du bassin de Neptune, propose des tartelettes aux fruits et du chocolat chaud royal. L'après-midi, louez une barque sur le Grand Canal pour une perspective unique sur le château.</p>
          </section>
          <Link href="/destinations/idf" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Île-de-France</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}