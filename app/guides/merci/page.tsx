import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Merci ! | | Téléchargement en cours',
  description: 'Ton guide est en train de partir dans ta boîte mail. En attendant, découvre nos autres ressources.',
  robots: { index: false, follow: false },
}

const NEXT_STEPS = [
  {
    title: 'Découvre nos carnets de voyage',
    description: 'Récits slow travel, destinations testées, conseils terrain.',
    href: '/blog',
    cta: 'Explorer le blog',
    icon: '📖',
  },
  {
    title: 'Planifie ton prochain voyage',
    description: 'Un brief, un échange, un carnet de route sur mesure.',
    href: '/travel-planning',
    cta: 'En savoir plus',
    icon: '🗺️',
  },
  {
    title: 'Suis-nous sur Instagram',
    description: 'Chaque jour, on partage une pépite, un lieu, un moment.',
    href: 'https://www.instagram.com/heldonica/',
    external: true,
    cta: 'Nous suivre',
    icon: '📱',
  },
]

export default function GuidesMerciPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        {/* Hero de confirmation */}
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto px-6">
            {/* Animation de succès */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-eucalyptus/10 rounded-full flex items-center justify-center mx-auto">
                <span className="text-5xl">✨</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-mahogany mb-4">
              C&apos;est noté&nbsp;!
            </h1>
            <p className="text-stone-600 text-lg leading-relaxed mb-6">
              Ton guide arrive dans ta boîte mail dans les prochaines minutes.<br />
              <strong className="text-stone-700">Pense à vérifier ton dossier spam</strong> si tu ne le vois pas.
            </p>
            
            <div className="bg-white rounded-2xl p-6 border border-stone-100 inline-block">
              <p className="text-sm text-stone-500">
                <span className="text-eucalyptus">💡</span> En attendant, on te recommande de regarder nos{' '}
                <Link href="/blog" className="text-amber-700 hover:underline font-semibold">
                  carnets de voyage
                </Link>{' '}
                — ils sont gratuits aussi.
              </p>
            </div>
          </div>
        </section>

        {/* Prochaines étapes */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-xl font-serif font-bold text-stone-900 mb-8 text-center">
              Pendant que tu attends...
            </h2>
            
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
                  <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone-500 mb-4">{step.description}</p>
                  <span className="text-eucalyptus font-semibold text-sm group-hover:gap-2 transition-all inline-flex items-center gap-1">
                    {step.cta}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Upsell doux */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-xl mx-auto px-6">
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 md:p-12 text-white text-center">
              <span className="text-4xl mb-4 block">🗺️</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
                Tu pars bientôt en voyage&nbsp;?
              </h2>
              <p className="text-stone-300 leading-relaxed mb-8">
                Si tu as besoin d&apos;un coup de main pour organiser ton itinerary, on propose du travel planning sur mesure.
                Un brief, un échange humain, un carnet de route pensé pour toi.
              </p>
              <Link
                href="/travel-planning"
                className="inline-block px-8 py-4 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all"
              >
                Découvrir le travel planning →
              </Link>
              <p className="text-stone-500 text-sm mt-4">
                Consultations dès 150€ • Satisfait ou remboursé
              </p>
            </div>
          </div>
        </section>

        {/* Retour blog */}
        <section className="pb-16 md:pb-24 text-center">
          <div className="max-w-xl mx-auto px-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour au blog
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}