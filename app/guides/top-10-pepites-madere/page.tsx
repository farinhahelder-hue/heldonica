import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import NewsletterPopup from '@/components/NewsletterPopup'
import GuideDownloadForm from '@/components/GuideDownloadForm'

export const metadata: Metadata = {
  title: 'Guide Top 10 Pépites Madère | Heldonica',
  description:
    "Télécharge notre guide des 10 meilleures adresses testées à Madère. Restaurants, sentiers, spots photo — tout ce qu’on a aimé et qu’on te recommande.",
  keywords: [
    'guide Madère',
    'pépites Madère',
    'adresses Madère',
    'restaurants Madère',
    'sentiers Madère',
    'slow travel Madère',
    'Heldonica',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/guides/top-10-pepites-madere',
  },
  openGraph: {
    title: 'Guide Top 10 Pépites Madère | Heldonica',
    description: "10 meilleures adresses testées à Madère. Télécharge gratuitement le guide.",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Guide Top 10 Pépites Madère',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

const PEEPITES = [
  {
    rank: 1,
    title: 'Restaurant Quinta do Fogo',
    type: 'Restaurant',
    description: 'Le meilleur poisson grillé de l\'île, avec vue sur les vignobles. Le propietario sait tout sur chaque plat.',
    secret: 'Demande le vin de Madère de la maison — ils le servent en carafe et c\'est une tuerie.',
  },
  {
    rank: 2,
    title: 'Levada dos Tornos',
    type: 'Randonnée',
    description: 'La plus belle levada, entre forêt luxuriante et panoramas vertigineux. 12 km, sans difficulté.',
    secret: 'Commence tôt le matin pour avoir les SELFies sans personne.',
  },
  {
    rank: 3,
    title: 'Porto Moniz Natural Pools',
    type: 'Nature',
    description: 'Piscines volcaniques naturelles, turquoise, à couper le souffle. Moins connu que les autres spots.',
    secret: 'Va au coucher du soleil — les couleurs sont irréelles et il n\'y a presque personne.',
  },
  {
    rank: 4,
    title: 'Café do Pirata',
    type: 'Café',
    description: 'Le meilleur café de Funchal, caché dans une ruelle. Torréfaction locale, pastries maison.',
    secret: 'Prends le cortado — c\'est leur spécialité et il n\'est pas sur la carte.',
  },
  {
    rank: 5,
    title: 'Miradouro Pico do Arieiro',
    type: 'Vue',
    description: 'Le troisième plus haut sommet de Madère. On y arrive par une route sinueuse, mais la vue...',
    secret: 'Parcours le tunnel jusqu\'au Pico Ruivo si tu es chaud — c\'est là-haut que tout se passe.',
  },
  {
    rank: 6,
    title: 'Fábrica de Arte',
    type: 'Art & Culture',
    description: 'Galerie d\'art improvisée dans une ancienne usine. Expositions rotate, ambiance unique.',
    secret: 'Il y a un café caché derrière la galerie — c\'est là que les locaux vont.',
  },
  {
    rank: 7,
    title: 'Praia de Seixal',
    type: 'Plage',
    description: 'La seule plage de sable noir de Madère. Sauvage, tranquille, perdue.',
    secret: 'Il y a un bar juste au-dessus de la plage — les bières sont froides et le view est identique.',
  },
  {
    rank: 8,
    title: 'Monte Palace Tropical Garden',
    type: 'Jardin',
    description: 'Les jardins les plus fous de Madère. Des milliers d\'espèces, des cascades, des cygnes.',
    secret: 'Le lever du soleil depuis le belvédère est un moment qu\'on n\'oublie pas.',
  },
  {
    rank: 9,
    title: 'Wine Bar do Funchal',
    type: 'Bar à vin',
    description: 'Sélection de vins de Madère (les vrais, les doux) avec des amuse-bouches qui vont avec.',
    secret: 'Le propriétaire fait des dégustations私ées pour ceux qui demandent gentiment.',
  },
  {
    rank: 10,
    title: 'Anfiteatro do Faial',
    type: 'Vue',
    description: 'Un point de vue inconnu des touristes, face à la baie de Funchal. On y va pour le coucher du soleil.',
    secret: 'Il y a un petit marché artisanal le dimanche matin — on y trouve des choses impossibles à trouver ailleurs.',
  },
]

export default function Top10PepitesMaderePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        {/* Hero */}
        <section className="relative bg-stone-950 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551632811-561732d1e306?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
              Guide gratuit
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              Top 10 Pépites<br />
              <span className="text-amber-400">à Madère</span>
            </h1>
            <p className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
              Ce qu&apos;on a testé, aimé, et qu&apos;on te recommande sans hésiter. Restaurants, sentiers, vues, spots photo — tout ce qu&apos;on aurait aimé savoir avant d&apos;y aller.
            </p>
            
            {/* CTA principal */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 max-w-md mx-auto">
              <p className="text-amber-400 font-semibold mb-3">📥 Télécharge gratuitement</p>
              <GuideDownloadForm variant="hero" />
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center">
              On a passé 3 semaines à Madère.<br />Voici ce qu&apos;on en a retiré.
            </h2>
            <p className="text-stone-600 leading-relaxed text-lg">
              Madère, c&apos;est l&apos;inverse du tourisme de masse. C&apos;est des routes qui serpentent dans des forêts luxuriantes, des villages où le temps s&apos;est arrêté, des restaurants où le propriétaire te raconte l&apos;histoire de chaque plat.
            </p>
            <p className="text-stone-600 leading-relaxed mt-4">
              On a testé,맛 пробовали, on s&apos;est perdus, on a trouvé des trucs incroyables. Et maintenant, on te les partage. Gratuitement.
            </p>
          </div>
        </section>

        {/* Liste des pépites */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-10 text-center">
              Les 10 pépites 👇
            </h2>
            
            <div className="space-y-6">
              {PEEPITES.map((pep) => (
                <div
                  key={pep.rank}
                  className="bg-white rounded-2xl p-6 md:p-8 border border-stone-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-2xl font-bold text-amber-800">
                      {pep.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-semibold text-eucalyptus uppercase tracking-wider">{pep.type}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{pep.title}</h3>
                      <p className="text-stone-600 leading-relaxed mb-4">{pep.description}</p>
                      <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-400">
                        <p className="text-sm">
                          <span className="font-semibold text-amber-800">🔒 Le secret :</span>{' '}
                          <span className="text-stone-700">{pep.secret}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final pour le guide */}
        <section className="py-16 md:py-20 bg-stone-950 text-white">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Tu pars à Madère&nbsp;?
            </h2>
            <p className="text-stone-400 leading-relaxed mb-8">
              Le guide complet avec toutes les adresses, les maps, et les tips pour éviter les pièges à éviter. Gratuit.
            </p>
            <GuideDownloadForm variant="inline" />
            <p className="text-stone-500 text-sm mt-4">
              10 pages, PDF, sans engagement.
            </p>
          </div>
        </section>

        {/* Related content */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8 text-center">
              Continue à explorer
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/destinations/madere"
                className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-md transition-shadow group"
              >
                <span className="text-2xl mb-4 block">🌍</span>
                <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  Guide complet Madère
                </h3>
                <p className="text-sm text-stone-500">Tout ce qu&apos;il faut savoir pour préparer ton voyage.</p>
              </Link>
              <Link
                href="/blog"
                className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-md transition-shadow group"
              >
                <span className="text-2xl mb-4 block">📖</span>
                <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  Carnets de voyage
                </h3>
                <p className="text-sm text-stone-500">Nos récits depuis le terrain, destinations réelles.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <NewsletterPopup />
    </>
  )
}