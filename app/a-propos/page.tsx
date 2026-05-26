import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'À Propos — L\'Histoire d\'Heldonica',
  description:
    "Découvrez l'histoire d'Heldonica : un duo passionné de slow travel qui vous emmène hors des sentiers battus. Carnets de voyage vécus et Travel Planning sur mesure.",
  keywords: [
    'heldonica',
    'blog slow travel',
    'qui sommes-nous',
    'travel planner',
    'voyage authentique',
    'histoire heldonica',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/a-propos',
  },
  openGraph: {
    url: 'https://www.heldonica.fr/a-propos',
    title: 'À Propos — L\'Histoire d\'Heldonica',
    description:
      "Un duo passionné de slow travel qui vous emmène hors des sentiers battus. Carnets vécus et Travel Planning sur mesure.",
    images: [
      {
        url: 'https://www.heldonica.fr/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Notre Histoire',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

// ⚡ Bolt Optimization: Use Incremental Static Regeneration (ISR) to cache the about page for 1 hour.
export const revalidate = 3600

const schemaPerson = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Heldonica",
  "url": "https://www.heldonica.fr/a-propos",
  "jobTitle": "Travel Planners & Blogueurs",
  "description": "Duo d'explorateurs passionnés par le slow travel et les pépites cachées, offrant des services de travel planning sur mesure.",
  "sameAs": [
    "https://www.instagram.com/heldonica",
  ]
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        {/* HERO SECTION */}
        <section className="relative px-6 pt-12 md:pt-20 pb-16 md:pb-24 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="order-2 md:order-1">
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-6">Notre Histoire</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-stone-900 leading-[1.1] mb-8">
                On ferme les ordis. <br className="hidden md:block" />
                <em className="text-amber-800">On part pour de vrai.</em>
              </h1>
              <div className="space-y-6 text-stone-600 text-lg leading-relaxed">
                <p>
                  Heldonica, c&apos;est un besoin viscéral de déconnecter. De quitter l&apos;urgence. On s&apos;est rencontrés à Paris en 2015, entre deux réunions, deux métros, deux deadlines. On a vite compris qu&apos;on cherchait la même chose : le silence des grands espaces, la rugosité de la vraie vie et le bruit des rencontres qui marquent.
                </p>
                <p>
                  Lui, l&apos;insulaire, a grandi face à l&apos;Atlantique, sur les pentes abruptes de Madère. Il a cet instinct de fuir les foules pour trouver la crique secrète. Elle, la lectrice de villes, a habité sept pays. Pas visités, habités. Cherchant à chaque fois à comprendre la poésie intime d&apos;un lieu, des villages isolés de Roumanie aux ruelles de Lisbonne.
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] md:aspect-square bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1516483638261-f40af5ff0961?q=80&w=1000"
                  alt="Duo Heldonica en voyage, regardant l&apos;horizon"
                  className="w-full h-full object-cover"
                  width={800}
                  height={1000}
                  loading="eager"
                />
              </div>
              {/* Badge flottant */}
              <div className="absolute -bottom-6 -left-6 md:-left-12 bg-white p-6 rounded-2xl shadow-xl max-w-[200px] border border-stone-100">
                <p className="text-3xl font-serif font-light text-amber-800 mb-1">10+</p>
                <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Ans de terrain en duo</p>
              </div>
            </div>
          </div>
        </section>

        {/* POURQUOI LE SLOW TRAVEL */}
        <section className="py-20 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8">Pourquoi le Slow Travel ?</h2>
            <div className="space-y-6 text-stone-600 text-lg leading-relaxed text-left md:text-center">
              <p>
                Parce qu&apos;on en a marre des voyages « fast-food » où l&apos;on coche des cases sur une liste. Courir d&apos;un spot à un autre pour ramener exactement la même photo que tout le monde ? On laisse ça aux autres.
              </p>
              <p>
                Le voyage, c'est prendre le temps d'être là. Se perdre volontairement dans les ruelles de Bogota pour tomber sur ce petit café où le temps s&apos;est arrêté. Cette soirée improvisée avec des pêcheurs à Câmara de Lobos, autour d'un feu, à écouter des histoires que tu ne liras jamais dans aucun guide.
              </p>
              <p>
                C&apos;est privilégier le train qui serpente lentement, le bus local où l&apos;on partage son siège, la marche qui fait chauffer les mollets mais permet de sentir le pays respirer. Le slow travel n&apos;est pas qu&apos;une esthétique, c&apos;est une philosophie de l'attention.
              </p>
            </div>
          </div>
        </section>

        {/* NOTRE APPROCHE (DÉTAILS VÉCUS) */}
        <section className="py-20 md:py-32 max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=1000"
                  alt="Carnet de voyage et appareil photo sur une table en bois"
                  className="w-full h-full object-cover"
                  width={600}
                  height={800}
                  loading="lazy"
                />
              </div>
            <div>
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre promesse</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8">
                Tout ce qu&apos;on écrit a été <em className="text-amber-800">testé et transpiré sur le terrain</em>.
              </h2>
              <div className="space-y-6 text-stone-600 text-lg leading-relaxed">
                <p>
                  Ici, pas d&apos;IA qui compile des itinéraires depuis un bureau. Pas de stagiaire qui agrège des avis TripAdvisor pour pondre des "Top 10" sans âme.
                </p>
                <p>
                  Quand on te parle de cette auberge isolée au cœur des Carpates, c'est parce qu&apos;on y a dormi. On a senti le froid mordant du matin, mais on se souvient encore du goût de la soupe fumante de la grand-mère. C'est du vécu. De la poussière sous nos chaussures.
                </p>
                <p>
                  Quand on te conseille d&apos;éviter tel sentier "incontournable" au profit d'un autre juste à côté, c'est qu&apos;on s&apos;est fait avoir par la foule, et qu&apos;on a transpiré pour trouver cette alternative sauvage. On te raconte nos galères, nos crevaisons sous la pluie, tout comme nos plus belles pépites. Le vrai voyage n&apos;est pas parfait, mais il est vivant.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CE QU'ON PROPOSE (TRAVEL PLANNING) */}
        <section className="py-24 bg-stone-900 text-stone-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
             <p className="text-amber-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">On le fait pour toi</p>
            <h2 className="text-3xl md:text-5xl font-serif font-light text-white mb-8">
              Ton voyage, pensé avec la même exigence que les nôtres.
            </h2>
            <div className="space-y-6 text-stone-300 text-lg leading-relaxed mb-12">
              <p>
                On a passé des années à affiner notre radar, à rater des bus pour trouver mieux, à dénicher ces adresses secrètes qui ont une âme. Cette expertise obsessionnelle du terrain, on la met à ton service.
              </p>
              <p>
                Que tu partes en solo, en couple, en famille ou entre amis, on construit <strong>ton voyage sur mesure</strong>. On part d'une feuille blanche. On t&apos;écoute, on s&apos;adapte à ton rythme et à tes contraintes, et on te livre un itinéraire clé en main, rempli de nos meilleures pépites confidentielles.
              </p>
              <p className="text-xl font-serif italic text-amber-200">
                Tu n&apos;as plus qu&apos;à fermer ton ordi, faire ton sac, et te laisser surprendre. On s&apos;occupe de la logistique, tu t&apos;occupes de vivre.
              </p>
            </div>

            <Link
                href="/travel-planning-form"
                className="inline-block bg-amber-700 hover:bg-amber-600 text-white font-medium px-8 py-4 rounded-full transition-colors text-lg"
              >
                Confie-nous ton prochain voyage
              </Link>
          </div>
        </section>
      </main>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPerson) }} />
    </>
  )
}
