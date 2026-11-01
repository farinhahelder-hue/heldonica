import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'
import { Clock, ShieldCheck, HeartHandshake, Compass, BedDouble, Calendar, ArrowRight } from 'lucide-react'

export const revalidate = 86400

const SITE_URL = 'https://www.heldonica.fr'

const metadata: Metadata = {
  title: 'Les 5 erreurs qui gâchent un voyage en couple | Heldonica',
  description:
    "Comment alléger la charge mentale, déjouer les pièges des avis trompeurs et s'approprier l'art du temps partagé pour déconnecter à deux.",
  keywords: [
    'voyage en couple',
    'slow travel couple',
    'conseils voyage duo',
    'erreurs voyage couple',
    'voyage sans stress',
    'Heldonica',
  ],
  alternates: {
    canonical: `${SITE_URL}/guides/5-erreurs-voyage-couple`,
  },
  openGraph: {
    title: 'Les 5 erreurs qui gâchent un voyage en couple | Heldonica',
    description: "Guide slow travel : 5 erreurs fréquentes et nos solutions éprouvées sur le terrain pour voyager sereinement à deux.",
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Guide voyage en couple Heldonica' }],
    locale: 'fr_FR',
    type: 'article',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('guides-5-erreurs-voyage-couple', metadata)
}

const PAGE = 'guides'

export default async function GuideErreursCouplePage() {
  const zones = await getPageZones(PAGE)

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main className="bg-[#FAF7F2] text-[#241D1A] min-h-screen">
        {/* En-tête éditorial */}
        <section className="bg-[#EFE9DF] py-16 md:py-24 border-b border-[#DED5C6]">
          <div className="container max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] text-xs text-eucalyptus uppercase tracking-[0.14em] font-medium mb-4">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.25} />
              <EditableZone page={PAGE} zone="guide_erreurs_badge" fallback="Carnet de réflexion • Slow Travel en duo" className="inline" />
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-normal text-mahogany mb-6 leading-tight">
              <EditableZone page={PAGE} zone="guide_erreurs_h1" fallback="Les 5 erreurs qui gâchent un voyage en couple (et comment ralentir)" className="inline" />
            </h1>
            <p className="text-charcoal/80 text-lg leading-relaxed mb-6 font-serif">
              <EditableZone page={PAGE} zone="guide_erreurs_intro" type="textarea"
                fallback="Partir à deux ne devrait jamais être une épreuve logistique. Voici les frictions les plus fréquentes observées lors des préparatifs, et nos réponses concrètes testées sur le terrain."
                className="inline"
              />
            </p>
            <div className="flex items-center gap-3 text-xs text-charcoal/60 pt-2 border-t border-[#DED5C6]">
              <span><EditableZone page={PAGE} zone="guide_erreurs_author" fallback="Rédigé par le duo fondateur Heldonica" className="inline" /></span>
              <span>•</span>
              <span><EditableZone page={PAGE} zone="guide_erreurs_reading_time" fallback="Temps de lecture : 7 minutes" className="inline" /></span>
            </div>
          </div>
        </section>

        {/* Corps du guide — 5 erreurs structurées avec EditableZone directes */}
        <section className="py-16 md:py-20">
          <div className="container max-w-3xl space-y-12">
            {/* Erreur 1 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-8 transition-shadow hover:shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DED5C6]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-serif font-bold text-eucalyptus px-2.5 py-1 rounded-sm bg-[#EFE9DF] border border-[#DED5C6]">01</span>
                  <Compass className="w-5 h-5 text-mahogany" strokeWidth={1.25} />
                </div>
                <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal/50">
                  <EditableZone page={PAGE} zone="guide_label_vigilance" fallback="Point de vigilance" className="inline" />
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-normal text-mahogany mb-4">
                <EditableZone page={PAGE} zone="guide_erreur_1_title" fallback="La surcharge de programme (le syndrome de la check-list)" className="inline" />
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-charcoal/75">
                <div className="p-4 rounded-sm bg-red-50/60 border border-red-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_trap" fallback="Le piège classique" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_1_problem" type="textarea"
                    fallback="Vouloir cocher huit sites par jour en pensant rentabiliser ses congés. Résultat : on court, on surveille sa montre, et la moindre correspondance manquée devient une source d'agacement à deux."
                    className="inline"
                  />
                </div>
                <div className="p-4 rounded-sm bg-emerald-50/60 border border-emerald-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_recom" fallback="Ce qu'on préconise" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_1_solution" type="textarea"
                    fallback="L'art de la demi-journée vide. Dans chacun de nos carnets, on sanctuarise au moins une demi-journée sans aucune consigne : traîner au lit, lire au soleil, improviser une marche. Le repos partagé fait partie du voyage."
                    className="inline"
                  />
                </div>
              </div>
            </article>

            {/* Erreur 2 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-8 transition-shadow hover:shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DED5C6]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-serif font-bold text-eucalyptus px-2.5 py-1 rounded-sm bg-[#EFE9DF] border border-[#DED5C6]">02</span>
                  <HeartHandshake className="w-5 h-5 text-mahogany" strokeWidth={1.25} />
                </div>
                <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal/50">
                  <EditableZone page={PAGE} zone="guide_label_vigilance" fallback="Point de vigilance" className="inline" />
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-normal text-mahogany mb-4">
                <EditableZone page={PAGE} zone="guide_erreur_2_title" fallback="L'asymétrie de la charge mentale logistique" className="inline" />
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-charcoal/75">
                <div className="p-4 rounded-sm bg-red-50/60 border border-red-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_trap" fallback="Le piège classique" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_2_problem" type="textarea"
                    fallback="Dans la grande majorité des couples, un seul partenaire porte l'organisation : comparer les billets, éplucher cinquante onglets d'hôtels, caler les temps de route. Celui qui organise stresse d'avoir mal choisi ; l'autre a l'impression de subir."
                    className="inline"
                  />
                </div>
                <div className="p-4 rounded-sm bg-emerald-50/60 border border-emerald-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_recom" fallback="Ce qu'on préconise" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_2_solution" type="textarea"
                    fallback="Déléguer l'arbitrage technique à un regard extérieur neutre. Recevoir un carnet déjà validé sur le terrain permet aux deux partenaires de découvrir les étapes le jour J, avec la même curiosité joyeuse."
                    className="inline"
                  />
                </div>
              </div>
            </article>

            {/* Erreur 3 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-8 transition-shadow hover:shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DED5C6]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-serif font-bold text-eucalyptus px-2.5 py-1 rounded-sm bg-[#EFE9DF] border border-[#DED5C6]">03</span>
                  <BedDouble className="w-5 h-5 text-mahogany" strokeWidth={1.25} />
                </div>
                <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal/50">
                  <EditableZone page={PAGE} zone="guide_label_vigilance" fallback="Point de vigilance" className="inline" />
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-normal text-mahogany mb-4">
                <EditableZone page={PAGE} zone="guide_erreur_3_title" fallback="Le piège des faux avis et des cadrages trompeurs" className="inline" />
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-charcoal/75">
                <div className="p-4 rounded-sm bg-red-50/60 border border-red-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_trap" fallback="Le piège classique" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_3_problem" type="textarea"
                    fallback="Un hébergement noté 4,8 étoiles sur Booking… jusqu'à ce qu'on découvre sur place qu'il donne sur une route passante, que l'insonorisation est inexistante ou que la photo de piscine datait d'il y a six ans."
                    className="inline"
                  />
                </div>
                <div className="p-4 rounded-sm bg-emerald-50/60 border border-emerald-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_recom" fallback="Ce qu'on préconise" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_3_solution" type="textarea"
                    fallback="La vérification physique. On ne recommande que des lieux où l'on a dormi, vérifié l'accueil, testé le silence nocturne et mesuré l'épaisseur des cloisons. Pas de stock photo, pas de complaisance."
                    className="inline"
                  />
                </div>
              </div>
            </article>

            {/* Erreur 4 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-8 transition-shadow hover:shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DED5C6]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-serif font-bold text-eucalyptus px-2.5 py-1 rounded-sm bg-[#EFE9DF] border border-[#DED5C6]">04</span>
                  <Calendar className="w-5 h-5 text-mahogany" strokeWidth={1.25} />
                </div>
                <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal/50">
                  <EditableZone page={PAGE} zone="guide_label_vigilance" fallback="Point de vigilance" className="inline" />
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-normal text-mahogany mb-4">
                <EditableZone page={PAGE} zone="guide_erreur_4_title" fallback="Changer d'hébergement chaque soir" className="inline" />
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-charcoal/75">
                <div className="p-4 rounded-sm bg-red-50/60 border border-red-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_trap" fallback="Le piège classique" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_4_problem" type="textarea"
                    fallback="Faire et défaire ses valises quotidiennement détruit toute sensation de déconnexion. On reste en tension logistique permanente au lieu de s'imprégner d'un terroir."
                    className="inline"
                  />
                </div>
                <div className="p-4 rounded-sm bg-emerald-50/60 border border-emerald-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_recom" fallback="Ce qu'on préconise" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_4_solution" type="textarea"
                    fallback="Le principe de la double ancre. Pour une semaine de voyage, deux hébergements de caractère suffisent largement. On pose ses affaires, on prend ses habitudes chez l'artisan du coin et on rayonne à rythme doux."
                    className="inline"
                  />
                </div>
              </div>
            </article>

            {/* Erreur 5 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-8 transition-shadow hover:shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DED5C6]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-serif font-bold text-eucalyptus px-2.5 py-1 rounded-sm bg-[#EFE9DF] border border-[#DED5C6]">05</span>
                  <Clock className="w-5 h-5 text-mahogany" strokeWidth={1.25} />
                </div>
                <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal/50">
                  <EditableZone page={PAGE} zone="guide_label_vigilance" fallback="Point de vigilance" className="inline" />
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-serif font-normal text-mahogany mb-4">
                <EditableZone page={PAGE} zone="guide_erreur_5_title" fallback="Négliger les temps de transition" className="inline" />
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-charcoal/75">
                <div className="p-4 rounded-sm bg-red-50/60 border border-red-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_trap" fallback="Le piège classique" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_5_problem" type="textarea"
                    fallback="Calculer les temps de trajet au plus juste sur Google Maps sans prévoir les arrêts contemplation, les routes sinueuses ou la fatigue de fin d'après-midi."
                    className="inline"
                  />
                </div>
                <div className="p-4 rounded-sm bg-emerald-50/60 border border-emerald-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/80 mb-1">
                    <EditableZone page={PAGE} zone="guide_label_recom" fallback="Ce qu'on préconise" className="inline" />
                  </p>
                  <EditableZone page={PAGE} zone="guide_erreur_5_solution" type="textarea"
                    fallback="Multiplier le temps de trajet estimé par 1,3 en montagne et privilégier le train ou les routes secondaires panoramiques. Le trajet n'est pas une corvée à expédier : il est le premier chapitre de la journée."
                    className="inline"
                  />
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Section CTA vers le service sur-mesure */}
        <section className="bg-[#EFE9DF] py-16 md:py-20 border-t border-[#DED5C6]">
          <div className="container max-w-2xl text-center">
            <div className="w-12 h-12 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] flex items-center justify-center mx-auto mb-4 text-eucalyptus">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.25} />
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-normal text-mahogany mb-4">
              <EditableZone page={PAGE} zone="guide_cta_title" fallback="Envie de nous confier la confection de votre carnet ?" className="inline" />
            </h2>
            <p className="text-sm text-charcoal/70 mb-8 leading-relaxed">
              <EditableZone page={PAGE} zone="guide_cta_text" type="textarea"
                fallback="On absorbe l'intégralité de la logistique et de la vérification de terrain. Vous partez l'esprit tranquille avec un carnet cousu main, sans commission cachée."
                className="inline"
              />
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/travel-planning"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-sm bg-action text-[#FAF7F2] text-xs font-medium uppercase tracking-[0.16em] hover:bg-action-fonce transition-colors"
              >
                <span><EditableZone page={PAGE} zone="guide_cta_btn_planning" fallback="Découvrir nos formules" className="inline" /></span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/destinations"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] text-mahogany text-xs font-medium uppercase tracking-[0.16em] hover:bg-[#E8E0D2] transition-colors"
              >
                <EditableZone page={PAGE} zone="guide_cta_btn_destinations" fallback="Explorer nos destinations" className="inline" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
