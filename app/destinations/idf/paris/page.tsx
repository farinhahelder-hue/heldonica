import type { Metadata } from 'next';
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export function generateMetadata(): Metadata {
  return {
    title: "Paris slow travel | Quartiers secrets, balades et art de vivre parisien | Heldonica",
    description: "Paris autrement : quartiers méconnus, balades sur les berges, terrasses cachées. Guide slow travel pour découvrir la capitale comme un parisien.",
    openGraph: {
      type: "website",
      images: [{ url: "https://heldonica.fr/og-destinations.jpg", width: 1200, height: 630 }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: 'https://www.heldonica.fr/destinations/idf/paris' },
  };
}

const pepites = [
  { 
    title: 'Le Marais', 
    description: 'Ce quartier du 3e et 4e arrondissement, véritable condensé de l\'histoire de Paris, séduit par ses rues étroites bordées d\'hôtels particuliers des XVIe et XVIIe siècles. Les places ombragées, comme la place des Vosges la plus ancienne de Paris, invitent à la flânerie. Les galeries d\'art, les boutiques de créateurs et les cafés branchés ont remplacé les ateliers d\'artisans, transformant le Marais en quartier le plus animé de la capitale. La diversité architecturale, du Moyen Âge au contemporain, crée un décor unique au monde.',
    icon: '🎨' 
  },
  { 
    title: 'Jardin du Luxembourg', 
    description: 'Ce jardin de 23 hectares, créé en 1612 par Marie de Médicis, constitue le poumon vert du 6e arrondissement. Les pelouses à l\'anglaise, les parterres à la française et le bassin central offrent un cadre enchanteur pour la promenade. Les marionnettistes, les joueurs d\'échecs et les promeneurs de chiens animent ce lieu de rencontre prisé des Parisiens. Le Palais du Luxembourg, qui abrite le Sénat, et lapetit bâtiment de l\'Observatoire, monument d\'astronomie du XIXe siècle, encadrent ce jewel de verdure.',
    icon: '🌳' 
  },
  { 
    title: 'Canal Saint-Martin', 
    description: 'Ce canal de 4,5 kilomètres, creusé entre 1802 et 1822, offre une promenade atypique loin des circuits touristiques. Les écluses automatisées, les ponts suspendus et les peupliers qui longent les berges créent une ambiance particulière. Les cafes parisiens qui s\'implantent sur les rive droite attirent une clientèle de quartier recherchant l\'authenticité. Le marché de la place de la Bataille-de-Stalingrad, le samedi matin, propose des produits du terroir et des victuailles pour un pique-nique au bord de l\'eau.',
    icon: '🚣' 
  },
  { 
    title: 'Buttes Chaumont', 
    description: 'Ce parc de 25 hectares, créé en 1867 sur d\'anciennes carrieres de plâtre, constitue lagrande surprise du 19e arrondissement. Le lac de 2 hectares, alimenté par une cascade de 32 mètres, entoure une île rocheuse couronnée par un temple de la Sibylle. Le pont suspendu de 63 mètres de portée enjambe le précipice, offrant des vues spectaculaires sur la ville. L\'ambiance rustique de ce parc, avec ses grottes artificielles et ses falaises abruptes, contraste avec l\'urbanisation environnante.',
    icon: '🏞️' 
  },
]

export default function ParisPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="text-amber-400 text-sm">Île-de-France</span>
            <h1 className="text-4xl text-white font-serif">Paris</h1>
            <p className="text-stone-300">La Ville Lumière au-delà des clichés, entre jardins secrets et terrasses paisibles</p>
          </div>
        </section>
        <nav className="bg-white border-b px-4 py-3 flex gap-4 text-sm">
          <Link href="/destinations/idf" className="text-stone-500 hover:text-amber-700">Île-de-France</Link>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-10">
            <p className="text-lg text-stone-700 leading-relaxed mb-6">
              Paris, capitale de la France et residence du pouvoir depuis plus de mille ans, continue d\'exercer son attraction sur les voyageurs du monde entier. La Ville Lumière, comme on la surnomme depuis le déploiement de l\'éclairage au gaz au XIXe siècle, cache pourtant des visages multiples que les seuls monuments emblématiques ne suffisent pas à révéler. Derrière la vitrine romantique des films et des guides touristiques se cache une metropolis complexe où coexistent des quartiers aux identités marquées.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              La clé pour apprécier Paris réside dans le ralentissement du rythme. Oubliez les listes de monuments à cocher et laissez-vous guider par la curiosité. Les rues du Marais réservent des découvertes inattendues à chaque coin de rue. Les jardins méconnus du 19e arrondissement offrent des panoramas surprenants sur la skyline parisien. Les marchés de quartier, les boulangeries artisanales et les cafes de voisinage constituent le sel d\'une immersion réussie dans l\'art de vivre parisien.
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
            <p className="text-stone-700">Pour découvrir le vrai Paris, partez à pied depuis le canal Saint-Martin jusqu\'aux Buttes Chaumont en traversant le quartier de Belleville. Ce parcours de 3 kilomètres révèle des Paris successifs : les écluses du canal, les ruelles pentues de Ménilmontant, les marchés de Belleville et les points de vue sur la Tour Eiffel qui apparaissent soudain entre les toits. Terminez par un déjeuner à la Crêperie de la Maroquière, cette cantine de quartier où les locals se retrouvent depuis 1958.</p>
          </section>
          <Link href="/destinations/idf" className="text-amber-700 hover:text-amber-800 font-medium">← Retour Île-de-France</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}