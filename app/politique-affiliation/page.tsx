import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Programme Partenaires & Affiliation — Heldonica',
  description:
    "Politique d'affiliation Heldonica : comment on sélectionne et utilise les liens partenaires (Booking.com, GetYourGuide, etc.) pour financer le site sans compromettre la qualité des recommandations.",
  alternates: {
    canonical: 'https://heldonica.fr/politique-affiliation',
  },
}

export default function PolitiqueAffiliationPage() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3">
              Transparence
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-mahogany mb-5">
              Programme partenaires
            </h1>
            <p className="text-lg text-charcoal/80">
              Comment on finance le site sans trahir les recommandations qui te servent vraiment.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 space-y-12">
            
            {/* Transparence */}
            <div className="rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 p-6">
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Ce qu&apos;on croit
              </h2>
              <p className="text-stone-700 leading-relaxed">
                Heldonica existe pour t&apos;aider à voyager mieux, pas pour te vendre des produits. 
                Les liens affiliés sont une façon de garder le site gratuit sans sacrifier l&apos;indépendance.
                Mais notre règle est simple : <strong>on ne recommande que ce qu&apos;on utiliserait nous-mêmes.</strong>
              </p>
            </div>

            {/* Comment ça marche */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">Comment fonctionne l&apos;affiliation</h2>
              <p className="text-charcoal/80 leading-relaxed">
                Quand tu cliques sur un lien partenaire (Booking.com, GetYourGuide, etc.) et que tu réserves,
                on touche une petite commission sur la vente. Ça ne change rien pour toi : le prix est le même,
                et parfois tu as même accès à des réductions exclusives.
              </p>
              <p className="text-charcoal/80 leading-relaxed mt-4">
                Ces revenus nous permettent de payer l&apos;hébergement, le temps passé à tester les lieux,
                et de garder le blog gratuit pour tout le monde.
              </p>
            </div>

            {/* Partenaires */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">Nos partenaires</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Booking.com', desc: 'Hébergements testés et recommandés' },
                  { name: 'GetYourGuide', desc: 'Expériences et activités sur place' },
                  { name: 'Aviasals', desc: 'Comparateur de vols' },
                  { name: ' rentalcars', desc: 'Location de voiture' },
                ].map((partner) => (
                  <div key={partner.name} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                    <p className="font-semibold text-stone-900">{partner.name}</p>
                    <p className="text-sm text-stone-500">{partner.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notre processus de sélection */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">Comment on sélectionne</h2>
              <p className="text-charcoal/80 leading-relaxed mb-4">
                Tous les liens partenaires ne se valent pas. Voici notre processus :
              </p>
              <ol className="space-y-3 list-decimal list-inside text-charcoal/80">
                <li><strong>Test terrain</strong> — On vérifie que le service existe vraiment et qu&apos;il est fiable.</li>
                <li><strong>Alignement avec notre voix</strong> — On ne recommande que des services qu&apos;on utiliserait.</li>
                <li><strong>Transparence sur les commissions</strong> — Tous les liens sont signalés comme partenaires.</li>
                <li><strong>Pas de pression commerciale</strong> — On ne change pas une recommandation positive pour une commission plus élevée.</li>
              </ol>
            </div>

            {/* Limitations */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">Ce qu&apos;on ne fait pas</h2>
              <ul className="space-y-2 text-charcoal/80">
                <li>❌ On ne recommande pas un service qu&apos;on n&apos;a pas vérifié, même si la commission est élevée.</li>
                <li>❌ On ne modifie pas nos opinions négatives pour des raisons commerciales.</li>
                <li>❌ On necache pas qu&apos;un lien est partenaire.</li>
                <li>❌ On n&apos;affiche pas de publicités intrusives ou de contenu sponsorisé déguisé.</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="border-t border-stone-200 pt-8">
              <p className="text-charcoal/60 text-sm">
                Des questions sur notre programme partenaires ? Écris-nous à{' '}
                <a href="mailto:contact@heldonica.fr" className="text-eucalyptus hover:underline">
                  contact@heldonica.fr
                </a>
                .
              </p>
            </div>

            <p className="text-sm text-charcoal/60 text-center">
              Dernière mise à jour : juin 2026
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}