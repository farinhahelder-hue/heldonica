import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'

export const metadata: Metadata = {
  title: 'Côte d Albâtre slow travel | Guide Heldonica',
  description:
    'Guide Côte d Albâtre: falaises d Etretat, Caps, Deauville via la coastale.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/normandie/cote-albatre',
  },
  robots: { index: false, follow: false },
}

const pepites = [
  {
    title: 'Falaises d Etretat',
    description: 'Les fameuses arches en forme d aiguille. Vue depuis le cap d Antifer.',
    icon: '🪨',
    address: 'Etretat',
  },
  {
    title: 'Cap d Antifer',
    description: 'Le point le plus haut. Vue 360°. Sentier depuis la plage.',
    icon: '🌅',
    address: 'Saint-Jouin-Bruneval',
  },
  {
    title: 'Ferme de la côte',
    description: 'Maraîchers en bord de falaise. Produits du terroir.',
    icon: '🥬',
    address: 'Veules-les-Roses',
  },
  {
    title: 'Etretat',
    description: "Le village classique. Mais tôt le matin, c'est un autre monde.",
    icon: '🏘️',
    address: 'Etretat',
  },
]

const navLinks = [
  { label: 'Normandie', href: '/destinations/normandie' },
  { label: 'Le Havre', href: '/destinations/normandie/le-havre' },
  { label: 'Pays d Auge', href: '/destinations/normandie/pays-dauge' },
]

export default function CoteAlbatrePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-gradient-to-b from-stone-900 to-stone-800 py-20">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-amber-400 text-sm font-medium mb-4">
              Normandie
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Côte d Albâtre
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Les falaises de craie blanche. Etretat, Caps, et les petits villages entre les deux.
            </p>
          </div>
        </section>

        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 text-sm">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-stone-500 hover:text-amber-700">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed">
              La Côte d'Albâtre, c'est la Normandie qu'on imagine quand on pense Normandie.
              Les falaises de craie blanche, les aiguilles, les plages de galets.
              <strong>Mais attention aux familles en été.</strong>
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              Le trick : y aller tôt le matin ou hors saison.
              Là, c'est magnifique. Vous êtes seuls face aux falaises.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Ce qu'on a deniché
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {pepites.map((pepite, idx) => (
                <div key={idx} className="p-6 bg-white rounded-lg border border-stone-200">
                  <div className="text-2xl mb-2">{pepite.icon}</div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">
                    {pepite.title}
                  </h3>
                  <p className="text-stone-600 text-sm">
                    {pepite.description}
                  </p>
                  <p className="text-stone-400 text-xs mt-2">{pepite.address}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">Ou dormir</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li><strong>Hotel du Falcon:</strong> Etretat, 90-140€</li>
                <li><strong>Chambres d hotes:</strong> Dans les villages</li>
                <li><strong>Camping:</strong> Sainte-Croix-sur-Mer</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">Ou manger</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li><strong>Le农家:</strong> Farm table, reservation</li>
                <li><strong>Les Fils:</strong> Creperie Etretat</li>
                <li><strong>Marche:</strong> Fecamp, le samedi</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Aproximité</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/destinations/normandie/le-havre" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100">
                <span className="text-stone-700">Le Havre</span>
                <span className="block text-xs text-stone-500 mt-1">~30 min</span>
              </Link>
              <Link href="/destinations/normandie" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100">
                <span className="text-stone-700">Honfleur</span>
                <span className="block text-xs text-stone-500 mt-1">~45 min</span>
              </Link>
              <Link href="/destinations/normandie/pays-dauge" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100">
                <span className="text-stone-700">Pays d Auge</span>
                <span className="block text-xs text-stone-500 mt-1">~40 min</span>
              </Link>
            </div>
          </section>

          <section>
            <Link href="/destinations/normandie" className="text-amber-700 hover:underline">
              ← Retour Normandie
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}