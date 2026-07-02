import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

export const metadata: Metadata = {
  title: 'Merci ! | | Téléchargement en cours',
  description: 'Ton guide est en train de partir dans ta boîte mail. En attendant, découvre nos autres ressources.',
  robots: { index: false, follow: false },
}

const NEXT_STEPS = [
  {
    titleZone: 'step_1_title',
    descZone: 'step_1_desc',
    ctaZone: 'step_1_cta',
    href: '/blog',
    icon: '📖',
  },
  {
    titleZone: 'step_2_title',
    descZone: 'step_2_desc',
    ctaZone: 'step_2_cta',
    href: '/travel-planning',
    icon: '🗺️',
  },
  {
    titleZone: 'step_3_title',
    descZone: 'step_3_desc',
    ctaZone: 'step_3_cta',
    href: 'https://www.instagram.com/heldonica/',
    external: true,
    icon: '📱',
  },
]

export default function GuidesMerciPage() {
  return (
    <InlineEditProvider page="guides-merci">
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <div className="mb-8">
              <div className="w-24 h-24 bg-eucalyptus/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-5xl">✨</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-mahogany mb-4">
              <EditableZone page="guides-merci" zone="hero_title" fallback="C'est noté !" />
            </h1>
            <EditableZone page="guides-merci" zone="hero_text" type="textarea"
              fallback="Ton guide arrive dans ta boîte mail dans les prochaines minutes.\nPense à vérifier ton dossier spam si tu ne le vois pas."
              className="text-stone-600 text-lg leading-relaxed mb-6 block"
            />

            <div className="bg-white rounded-2xl p-6 border border-stone-100 inline-block">
              <p className="text-sm text-stone-500">
                <span className="text-eucalyptus">💡</span>{' '}
                <EditableZone page="guides-merci" zone="hero_note" fallback="En attendant, on te recommande de regarder nos carnets de voyage — ils sont gratuits aussi."
                  className="inline"
                />
              </p>
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <EditableZone page="guides-merci" zone="next_steps_title" fallback="Pendant que tu attends..."
              className="text-xl font-serif font-bold text-stone-900 mb-8 text-center block"
            />

            <div className="grid md:grid-cols-3 gap-6">
              {NEXT_STEPS.map((step, i) => (
                <Link
                  key={i}
                  href={step.href}
                  target={step.external ? '_blank' : undefined}
                  rel={step.external ? 'noopener noreferrer' : undefined}
                  className="bg-white rounded-2xl p-6 border border-stone-100 hover:shadow-lg hover:border-stone-200 transition-all group"
                >
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <EditableZone page="guides-merci" zone={step.titleZone} fallback={['Découvre nos carnets de voyage', "Planifie ton prochain voyage", 'Suis-nous sur Instagram'][i]}
                    className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors block"
                  />
                  <EditableZone page="guides-merci" zone={step.descZone}
                    fallback={['Récits slow travel, destinations testées, conseils terrain.', 'Un brief, un échange, un carnet de route sur mesure.', "Chaque jour, on partage une pépite, un lieu, un moment."][i]}
                    className="text-sm text-stone-500 mb-4 block"
                  />
                  <span className="text-eucalyptus font-semibold text-sm group-hover:gap-2 transition-all inline-flex items-center gap-1">
                    <EditableZone page="guides-merci" zone={step.ctaZone}
                      fallback={['Explorer le blog', 'En savoir plus', 'Nous suivre'][i]}
                      className="inline"
                    />
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="max-w-xl mx-auto px-6">
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 md:p-12 text-white text-center">
              <span className="text-4xl mb-4 block">🗺️</span>
              <EditableZone page="guides-merci" zone="upsell_title" fallback="Tu pars bientôt en voyage ?"
                className="text-2xl md:text-3xl font-serif font-bold mb-4 block"
              />
              <EditableZone page="guides-merci" zone="upsell_text" type="textarea"
                fallback="Si tu as besoin d'un coup de main pour organiser ton itinéraire, on propose du travel planning sur mesure.\nUn brief, un échange humain, un carnet de route pensé pour toi."
                className="text-stone-300 leading-relaxed mb-8 block"
              />
              <Link
                href="/travel-planning"
                className="inline-block px-8 py-4 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all"
              >
                <EditableZone page="guides-merci" zone="upsell_cta" fallback="Découvrir le travel planning →" />
              </Link>
              <EditableZone page="guides-merci" zone="upsell_footnote" fallback="Consultations dès 150€ • Satisfait ou remboursé"
                className="text-stone-500 text-sm mt-4 block"
              />
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-24 text-center">
          <div className="max-w-xl mx-auto px-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <EditableZone page="guides-merci" zone="back_link" fallback="Retour au blog" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
