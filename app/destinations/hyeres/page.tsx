import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.heldonica.fr'

const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Hyères',
  description: 'Perle côtière de la Méditerranée, au sud du Var. Îles d\'Or, vieille ville authentique, plages cachées. Destination slow travel méditerranéenne en couple.',
  url: `${SITE_URL}/destinations/hyeres`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'FR',
    addressRegion: 'Provence-Alpes-Côte d\'Azur',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 43.1202,
    longitude: 6.6309,
  },
  touristType: ['Beach lover', 'Nature lover', 'Slow traveler'],
  bestSeasonToVisit: ['May', 'June', 'September', 'October'],
}

const faqHyeresSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Quand partir à Hyères ?", "acceptedAnswer": { "@type": "Answer", "text": "Mai-juin pour la météo parfaite. Juillet-août possible mais touristique. Septembre-octobre idéal : mer encore chaude, foules limitées." }},
    { "@type": "Question", "name": "Comment aller à Hyères ?", "acceptedAnswer": { "@type": "Answer", "text": "Train depuis Paris (5-6h via Marseille). Voiture recommandée pour explorer les alentours et les îles." }},
    { "@type": "Question", "name": "Faut-il louer un bateau pour les Îles d'Or ?", "acceptedAnswer": { "@type": "Answer", "text": "Des ferries réguliers relient les îles. Location de bateau possible pour plus de liberté, sinon les ferries suffisent." }},
  ]
};

export const metadata: Metadata = {
  title: 'Hyères slow travel | Guide Heldonica',
  description:
    'Guide Hyères : vieille ville, îles d\'Or, plages méditerranéennes. Notre guide couple pour un slow travel authentique en Provence.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/hyeres',
  },
  openGraph: {
    title: 'Hyères slow travel | Guide Heldonica',
    description:
      'Îles d\'Or, mer turquoise, pinèdes. Découvrez Hyères en couple, loin des sentiers touristiques.',
    url: 'https://www.heldonica.fr/destinations/hyeres',
    images: [
      {
        url: `${SITE_URL}/og-default.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function HyeresPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqHyeresSchema) }} />
      <Header />
      <main>
        <section className="py-24 bg-gradient-to-br from-sky-50 to-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🇫🇷</span>
              <span className="text-sm text-stone-600 font-medium uppercase tracking-wider">Provence, France</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 mb-6">
              Hyères
            </h1>
            <p className="text-xl text-stone-600 mb-8">
              La Méditerranée hors des clichés. Îles d'Or à la vue, vieille ville bohème, pinèdes jusqu'à la mer. Hyères, c'est la Provence sans les hôtels de luxe.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-stone-500 mb-1">Meilleure période</p>
                <p className="font-semibold text-stone-900">Mai–Oct</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Budget couple/sem</p>
                <p className="font-semibold text-stone-900">~1100 €</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Train depuis Paris</p>
                <p className="font-semibold text-stone-900">5–6h</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Visa</p>
                <p className="font-semibold text-stone-900">Non (UE)</p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Langue</p>
                <p className="font-semibold text-stone-900">Français</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Pourquoi Hyères ?</h2>
            <div className="space-y-6 text-lg text-stone-700 leading-relaxed">
              <p>
                Hyères est le secret que tout le monde connaît et que personne ne visite. Les Îles d'Or — Porquerolles, Port-Cros, Île du Levant — sont à portée de ferry. La vieille ville colle aux collines, avec des ruelles qui sentent le thym et la mer. Les plages ne sont pas bétonnées, elles sont encore sauvages.
              </p>
              <p>
                C'est la Méditerranée de ton grand-mère, avant qu'elle ne devienne luxe. Ici, tu croises des locaux, pas des touristes en uniforme de plage. Ici, le rosé coûte 5 euros et il est bon.
              </p>
              <p>
                Hyères, c'est pour les couples qui veulent la mer sans le show, les îles sans l'hôtel 5 étoiles, la Provence sans les boutiques de lavande.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 border-b border-stone-200 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Itinéraire 5 jours</h2>
            <div className="space-y-8">
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 1 : Arrivée & Vieille Ville</h3>
                <p className="text-stone-700">Gare, montée vers la vieille ville, lunch en terrasse, exploration des ruelles. Coucher de soleil depuis les fortifications.</p>
              </div>
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 2 : Porquerolles</h3>
                <p className="text-stone-700">Ferry matin, plage de sable blanc, balade à vélo sur l'île, dîner face à la mer. Ferry retour en fin d'après-midi.</p>
              </div>
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 3 : Port-Cros & Rando</h3>
                <p className="text-stone-700">Ferry vers Port-Cros, randonnée côtière, baignade entre deux caps, vue sur la Méditerranée depuis les sentiers.</p>
              </div>
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 4 : Plages Cachées</h3>
                <p className="text-stone-700">Voiture (si possible), petites criques entre Hyères et Giens, baignade tranquille, déjeuner chez un poissonnier.</p>
              </div>
              <div className="border-l-4 border-eucalyptus pl-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-2">Jour 5 : Lenteur</h3>
                <p className="text-stone-700">Marché provençal, musée local, flânerie dans les ruelles, dernier dîner face aux îles.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">FAQ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-stone-900 mb-2">Porquerolles ou Port-Cros ?</h3>
                <p className="text-stone-700">Porquerolles est plus accessible, avec plages de sable. Port-Cros est plus sauvage, plus randonnée. Idéal : les deux en une semaine.</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-2">Hyères est-elle chère ?</h3>
                <p className="text-stone-700">Moins que la Côte d'Azur. Budget ~1100€/semaine pour deux (hébergement, repas, transport, îles).</p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 mb-2">Faut-il réserver les restaurants ?</h3>
                <p className="text-stone-700">Non. Hyères reste décontractée. Les restaurants de qualité n'exigent pas de réservation, sauf juillet-août.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
