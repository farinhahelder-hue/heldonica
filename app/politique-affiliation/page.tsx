import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

export const metadata: Metadata = {
  title: 'Programme Partenaires & Affiliation | Heldonica',
  description:
    "Politique d'affiliation Heldonica : comment on sélectionne et utilise les liens partenaires (Booking.com, GetYourGuide, etc.) pour financer le site sans compromettre la qualité des recommandations.",
  alternates: {
    canonical: 'https://www.heldonica.fr/politique-affiliation',
  },
}

export default function PolitiqueAffiliationPage() {
  return (
    <InlineEditProvider page="politique-affiliation">
      <Header />
      <Breadcrumb />
      <main className="bg-white">
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3">
              <EditableZone page="politique-affiliation" zone="hero_badge" fallback="Transparence" />
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-mahogany mb-5">
              <EditableZone page="politique-affiliation" zone="hero_title" fallback="Programme partenaires" />
            </h1>
            <p className="text-lg text-charcoal/80">
              <EditableZone page="politique-affiliation" zone="hero_subtitle" type="textarea" fallback="Comment on finance le site sans trahir les recommandations qui te servent vraiment." />
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 space-y-12">

            {/* Transparence */}
            <div className="rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 p-6">
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <EditableZone page="politique-affiliation" zone="belief_title" fallback="Ce qu'on croit" />
              </h2>
              <p className="text-stone-700 leading-relaxed">
                <EditableZone page="politique-affiliation" zone="belief_text" type="textarea" fallback="Heldonica existe pour t'aider à voyager mieux, pas pour te vendre des produits. Les liens affiliés sont une façon de garder le site gratuit sans sacrifier l'indépendance. Mais notre règle est simple : on ne recommande que ce qu'on utiliserait nous-mêmes." />
              </p>
            </div>

            {/* Comment ça marche */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">
                <EditableZone page="politique-affiliation" zone="how_works_title" fallback="Comment fonctionne l'affiliation" />
              </h2>
              <p className="text-charcoal/80 leading-relaxed">
                <EditableZone page="politique-affiliation" zone="how_works_text_1" type="textarea" fallback="Quand tu cliques sur un lien partenaire (Booking.com, GetYourGuide, etc.) et que tu réserves, on touche une petite commission sur la vente. Ça ne change rien pour toi : le prix est le même, et parfois tu as même accès à des réductions exclusives." />
              </p>
              <p className="text-charcoal/80 leading-relaxed mt-4">
                <EditableZone page="politique-affiliation" zone="how_works_text_2" type="textarea" fallback="Ces revenus nous permettent de payer l'hébergement, le temps passé à tester les lieux, et de garder le blog gratuit pour tout le monde." />
              </p>
            </div>

            {/* Partenaires */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">
                <EditableZone page="politique-affiliation" zone="partners_title" fallback="Nos partenaires" />
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Booking.com', desc: 'Hébergements testés et recommandés' },
                  { name: 'GetYourGuide', desc: 'Expériences et activités sur place' },
                  { name: 'Aviasals', desc: 'Comparateur de vols' },
                  { name: 'Rentalcars', desc: 'Location de voiture' },
                ].map((partner, i) => (
                  <div key={partner.name} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                    <p className="font-semibold text-stone-900">
                      <EditableZone page="politique-affiliation" zone={`partner_${i + 1}_name`} fallback={partner.name} />
                    </p>
                    <p className="text-sm text-stone-500">
                      <EditableZone page="politique-affiliation" zone={`partner_${i + 1}_desc`} fallback={partner.desc} />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notre processus de sélection */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">
                <EditableZone page="politique-affiliation" zone="selection_title" fallback="Comment on sélectionne" />
              </h2>
              <p className="text-charcoal/80 leading-relaxed mb-4">
                <EditableZone page="politique-affiliation" zone="selection_intro" type="textarea" fallback="Tous les liens partenaires ne se valent pas. Voici notre processus :" />
              </p>
              <ol className="space-y-3 list-decimal list-inside text-charcoal/80">
                <li><strong>Test terrain</strong> — <EditableZone page="politique-affiliation" zone="selection_step_1" fallback="On vérifie que le service existe vraiment et qu'il est fiable." /></li>
                <li><strong>Alignement avec notre voix</strong> — <EditableZone page="politique-affiliation" zone="selection_step_2" fallback="On ne recommande que des services qu'on utiliserait." /></li>
                <li><strong>Transparence sur les commissions</strong> — <EditableZone page="politique-affiliation" zone="selection_step_3" fallback="Tous les liens sont signalés comme partenaires." /></li>
                <li><strong>Pas de pression commerciale</strong> — <EditableZone page="politique-affiliation" zone="selection_step_4" fallback="On ne change pas une recommandation positive pour une commission plus élevée." /></li>
              </ol>
            </div>

            {/* Limitations */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-4">
                <EditableZone page="politique-affiliation" zone="limitations_title" fallback="Ce qu'on ne fait pas" />
              </h2>
              <ul className="space-y-2 text-charcoal/80">
                <li>❌ <EditableZone page="politique-affiliation" zone="limitation_1" fallback="On ne recommande pas un service qu'on n'a pas vérifié, même si la commission est élevée." /></li>
                <li>❌ <EditableZone page="politique-affiliation" zone="limitation_2" fallback="On ne modifie pas nos opinions négatives pour des raisons commerciales." /></li>
                <li>❌ <EditableZone page="politique-affiliation" zone="limitation_3" fallback="On ne cache pas qu'un lien est partenaire." /></li>
                <li>❌ <EditableZone page="politique-affiliation" zone="limitation_4" fallback="On n'affiche pas de publicités intrusives ou de contenu sponsorisé déguisé." /></li>
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
              <EditableZone page="politique-affiliation" zone="last_update" fallback="Dernière mise à jour : juin 2026" />
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
