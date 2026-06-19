import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Giverny Normandie | Jardins de Monet, maison et water lily | Heldonica",
    description: "Giverny : maison et jardins de Claude Monet, nymphéas légendaires, pont japonais. Guide slow travel pour découvrir le sanctuaire de l'impressionnisme.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/idf/giverny' },
  };
}

const pepites = [
  { 
    title: 'Le Jardin d\'Eau', 
    description: 'Ce bassin de nymphéas de 200 m², creusé par Monet en 1903, constitue le cœur battant du jardin. Les Ponts japonais en bois verts enjambent les massettes et les lotus, créant les compositions que l\'on retrouve dans les célèbres toiles de la série des Nymphéas. Le jeu d\'ombres et de reflets sur la surface miroitante de l\'eau change au fil des heures, offrant un spectacle différent à chaque visite. Les visiteurs peuvent observer les nymphéas et les iris de début mai à fin octobre.',
    icon: '🌸' 
  },
  { 
    title: 'Le Jardin Fleuri', 
    description: 'Le Clos Normand, d\'une superficie de un hectare, présente une explosion de couleurs de avril à octobre. Monet organisa ses massifs selon les principes de la painting de paysage, avec des teintes qui s\'harmonisent et se répondent. Les arcs de glycine du Tunnel Rose encadrent l\'entrée de la maison et offrent une cascade florale parfée au mois de mai. Les tournesols, les dahlias et les roses anciennes constituent les floraisons les plus spectaculaires de l\'été.',
    icon: '🎨' 
  },
  { 
    title: 'La Maison de Monet', 
    description: 'Cette maison de paysan normand, purchaseée par Monet en 1883, conserve intact l\'ambiance dans laquelle vécut le maître de l\'impressionnisme. Les murs de la cuisine, recouverts de faïences bleues de Rouen, témoignent du goût prononcé du peintre pour la couleur. La chambre rose, avec ses papiers peints à fleurs, et l\'atelier de peinture, où trônent les reconstitutions des œuvres ultime du maître, complètent la visite. La boutique propose des reproductions d\'art et des produits dérivés inspirés des tableaux.',
    icon: '🏠' 
  },
  { 
    title: 'Musée Americanon de Giverny', 
    description: 'Ce musée, logé dans le pavillon de la Villa Monoyer, présente la collection d\'art américain rassemblée par le collectionneur Terrence Kennedy. Les œuvres de Monet, Manet, Renoir et Degas voisinent avec celles de Whistler, Sargent et Cassatt. La donation Kennedy comprend également des œuvres de Sisley, Pissarro et Berthe Morisot, offrant un panorama complet de l\'impressionnisme français. Le jardin d\'inspiration française qui entoure le musée complète l\'ensemble.',
    icon: '🏛️' 
  },
]

export default function GivernyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Normandie</span>
            <h1 className="text-4xl text-white font-serif">Giverny</h1>
            <p className="text-stone-300">Le sanctuaire de Monet où l'art et la nature ne font qu'un</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/idf" className="text-stone-500 hover:text-amber-700">Île-de-France</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Giverny, ce village normand de 1 000 habitants situé à 80 kilomètres de Paris, doit sa notoriété mondiale à un seul homme : Claude Monet. Le peintre impressionniste y vécut pendant 43 ans, créant dans ce coin de campagne les jardins les plus photographiés au monde. Les toiles des Nymphéas, réalisées dans ce bassin magique, hangent aujourd\'hui dans le Musée de l\'Orangerie à Paris, mais le lieu où elles naquirent continue d\'attirer des centaines de milliers de visiteurs chaque année.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La visite des jardins et de la maison s\'effectue d\'avril à novembre, avec un affluence maximale en mai et juin lorsque les glycines et les roses sont en pleine fleur. La Fondation Monet, qui gère le site depuis 1980, a reconstitué les plantations selon les plans et les correspondances du peintre, garantissant une fidélité remarquable à la vision d\'origine. La lumière de fin d\'après-midi, celle-là même qui inspirait Monet, offre des Conditions optimales pour la photographie.
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
            <p className="text-stone-700">Pour profiter de Giverny dans le calme, venez en semaine en début de saison (avril) ou en fin de journée (après 16h). Le déjeuner à l\'Auberge du Prieuré, cette ancienne ferme normande transformée en restaurant gastronomique, propose une cuisine de saison basée sur les légumes du jardin et les produits fermiers du Vexin. Le dimanche, le marché de Vernon propose des fromages d\'E Normandy, du cidre fermier et du miel de lavande.</p>
          </section>
          <Link href="/destinations/idf" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Île-de-France</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}