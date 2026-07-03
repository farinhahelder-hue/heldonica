import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

export const metadata: Metadata = {
  title: 'Start |',
  description: 'Retrouve tous les liens Heldonica : blog, guides gratuits, travel planning et contact.',
  robots: { index: false, follow: false },
}

const LINKS = [
  {
    categoryZone: 'cat_1',
    fallbackCat: '📖 Blog',
    items: [
      { labelZone: 'link_1_label', fallbackLabel: 'Tous les carnets de voyage', href: '/blog', descZone: 'link_1_desc', fallbackDesc: 'Récits slow travel, destinations authentiques' },
      { labelZone: 'link_2_label', fallbackLabel: 'Guides pratiques', href: '/blog?categorie=Guides Pratiques', descZone: 'link_2_desc', fallbackDesc: 'Itinéraires, conseils, pépites testées' },
      { labelZone: 'link_3_label', fallbackLabel: 'Destinations', href: '/destinations', descZone: 'link_3_desc', fallbackDesc: 'Madère, Roumanie, Monténégro, Grèce...' },
    ],
  },
  {
    categoryZone: 'cat_2',
    fallbackCat: '🗺️ Services',
    items: [
      { labelZone: 'link_4_label', fallbackLabel: 'Travel planning sur mesure', href: '/travel-planning', descZone: 'link_4_desc', fallbackDesc: 'Conçois ton voyage avec nous' },
      { labelZone: 'link_5_label', fallbackLabel: 'Expertise hôtelière B2B', href: '/expert-hotelier', descZone: 'link_5_desc', fallbackDesc: 'Audit & consulting pour professionnels' },
      { labelZone: 'link_6_label', fallbackLabel: 'À propos', href: '/a-propos', descZone: 'link_6_desc', fallbackDesc: 'Notre histoire, notre philosophie' },
    ],
  },
  {
    categoryZone: 'cat_3',
    fallbackCat: '🎁 Gratuits',
    items: [
      { labelZone: 'link_7_label', fallbackLabel: 'Guide Top 10 Madère', href: '/guides/top-10-pepites-madere', descZone: 'link_7_desc', fallbackDesc: 'Les meilleures adresses testées sur place' },
      { labelZone: 'link_8_label', fallbackLabel: 'Quiz Slow Travel', href: '/slow-travel', descZone: 'link_8_desc', fallbackDesc: 'Quel voyageur es-tu ?' },
    ],
  },
  {
    categoryZone: 'cat_4',
    fallbackCat: '💬 Contact',
    items: [
      { labelZone: 'link_9_label', fallbackLabel: 'Nous contacter', href: '/contact', descZone: 'link_9_desc', fallbackDesc: 'Une question ? On répond sous 48h' },
      { labelZone: 'link_10_label', fallbackLabel: 'Instagram', href: 'https://www.instagram.com/heldonica/', external: true, descZone: 'link_10_desc', fallbackDesc: '@heldonica' },
      { labelZone: 'link_11_label', fallbackLabel: 'Newsletter', href: '#newsletter', descZone: 'link_11_desc', fallbackDesc: 'Reçois les pépites chaque semaine' },
    ],
  },
]

export default function StartPage() {
  return (
    <InlineEditProvider page="start">
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <div className="mb-6">
              <Image
                src="/favicon.svg"
                alt="Heldonica"
                width={64}
                height={64}
                className="mx-auto"
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-mahogany mb-4">
              <EditableZone page="start" zone="hero_title" fallback="Bienvenue sur Heldonica" />
            </h1>
            <EditableZone page="start" zone="hero_desc" fallback="Slow travel vécu, conçu sur mesure. Retrouve ici tous nos liens — blog, guides gratuits, services et contact."
              className="text-stone-600 text-lg leading-relaxed block"
            />
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="max-w-2xl mx-auto px-6">
            <div className="space-y-10">
              {LINKS.map((section, i) => (
                <div key={i}>
                  <EditableZone page="start" zone={section.categoryZone} fallback={section.fallbackCat}
                    className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 block"
                  />
                  <div className="space-y-3">
                    {section.items.map((link, j) => (
                      <Link
                        key={j}
                        href={link.external ? link.href : link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="block bg-white rounded-2xl p-5 border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                              <EditableZone page="start" zone={link.labelZone} fallback={link.fallbackLabel} className="inline" />
                              {link.external && (
                                <svg className="inline-block ml-2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                            </p>
                            <EditableZone page="start" zone={link.descZone} fallback={link.fallbackDesc}
                              className="text-sm text-stone-500 mt-1 block"
                            />
                          </div>
                          <svg className="w-5 h-5 text-stone-300 group-hover:text-eucalyptus group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="newsletter" className="py-16 md:py-24 bg-stone-950 text-white">
          <div className="max-w-xl mx-auto px-6 text-center">
            <EditableZone page="start" zone="newsletter_title" fallback="Reçois les pépites chaque semaine"
              className="text-2xl md:text-3xl font-serif font-bold mb-4 block"
            />
            <EditableZone page="start" zone="newsletter_text" fallback="Un lieu testé, un conseil terrain, un avant-goût de ce qu'on prépare. Pas de spam."
              className="text-stone-400 mb-8 block"
            />
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="ton@email.fr"
                required
                className="flex-1 px-5 py-3.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all whitespace-nowrap"
              >
                <EditableZone page="start" zone="newsletter_cta" fallback="S'inscrire" />
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
