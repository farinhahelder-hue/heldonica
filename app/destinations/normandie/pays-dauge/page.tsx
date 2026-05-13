'use client'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://heldonica.fr'

export const metadata: Metadata = {
  title: 'Pays d Auge slow travel | Guide Heldonica',
  description:
    'Guide Pays d Auge: Honfleur, Deauville, produits du terroir, bocage normand.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/normandie/pays-dauge',
  },
}

const pepites = [
  {
    title: 'Honfleur',
    description: 'Le portype. Mais hors saison, c est magic. Lesaufs sur le port.',
    icon: '⚓',
    address: 'Honfleur',
  },
  {
    title: 'Marché de Honfleur',
    description: 'Le samedi. Fromage deкриш, cidre, Calvados. On y va vraiment.',
    icon: '🧀',
    address: 'Place Saint-Catherine',
  },
  {
    title: 'Deauville',
    description: 'LesPlanches. Lesparasols. mais derriere, il y a la vraie ville.',
    icon: '🏖️',
    address: 'Deauville',
  },
  {
    title: 'Camembert',
    description: 'Laferme qui fait le vraiCamembert. Dégustation + explications.',
    icon: '🧀',
    address: 'Camembert',
  },
  {
    title: 'Villages du</title>
    description: 'Beuzeval, Blangy, Pont-l Eveque. Rues pietonnes, maisons a colombages.',
    icon: '🏘️',
    address: 'Multiple',
  },
]

const navLinks = [
  { label: 'Normandie', href: '/destinations/normandie' },
  { label: 'Le Havre', href: '/destinations/normandie/le-havre' },
  { label: 'Côte d Albâtre', href: '/destinations/normandie/cote-albatre' },
]

export default function PaysDaugePage() {
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
              Pays d Auge
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl">
              Honfleur, Deauville, le bocage. Le pays du cidre et du Camembert.
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
              Le Pays d Auge, c est la Normandie postcards.
              Honfleur, Deauville, les plages du Débarquement tout proches.
              <strong>Mais c est aussi l interieur des terres.</strong>
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mt-4">
              Les prés avec les vaches (oui, les vraies, pour le lait et le fromage),
              les maisons a colombages, les petites routes entre lespommiers.
              C est là qu on a trouvé notre Normandie.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Ce qu on a deniché
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {peptides.map((pepite, idx) => (
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
                <li><strong>Hotel La...</strong> Honfleur, 100-150€</li>
                <li><strong>Chambres d hotes:</strong> Dans les fermes</li>
                <li><strong>Gites:</strong> Dans les villages</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">Ou manger</h3>
              <ul className="space-y-2 text-stone-600 text-sm">
                <li><strong>Le农家:</strong> Farm table, reservation</li>
                <li><strong>Creperie:</strong> A Honfleur</li>
                <li><strong>Marche:</strong> Tous les Samedi</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Aproximité</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/destinations/normandie/le-havre" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100">
                <span className="text-stone-700">Le Havre</span>
                <span className="block text-xs text-stone-500 mt-1">~25 min</span>
              </Link>
              <Link href="/destinations/normandie/cote-albatre" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100">
                <span className="text-stone-700">Etretat</span>
                <span className="block text-xs text-stone-500 mt-1">~40 min</span>
              </Link>
              <Link href="/destinations/normandie" className="p-4 bg-stone-100 rounded-lg text-center hover:bg-amber-100">
                <span className="text-stone-700">Caen</span>
                <span className="block text-xs text-stone-500 mt-1">~30 min</span>
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