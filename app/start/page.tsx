import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import { getPageZones } from '@/lib/cms-zones'
import { getCmsOrSetting } from '@/lib/content-loader'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

export const revalidate = 86400

const metadata: Metadata = {
  title: 'Tous nos liens | Heldonica',
  description: 'Retrouve tous les liens Heldonica : blog, guides gratuits, travel planning et contact.',
  robots: { index: false, follow: false },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('start', metadata)
}

export default async function StartPage() {
  const zones = await getPageZones('start')

  const ArrowIcon = () => (
    <svg className="w-5 h-5 text-stone-300 group-hover:text-eucalyptus group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )

  const ExternalIcon = () => (
    <svg className="inline-block ml-2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )

  return (
    <InlineEditProvider page="start" initialZones={zones}>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="py-16 md:py-24 text-center">
          <div className="max-w-2xl mx-auto px-6">
            <div className="mb-6">
              <Image
                src="/favicon.svg"
                alt={getCmsOrSetting('logo_alt', '', 'Heldonica')}
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
              {/* Catégorie 1 : Blog */}
              <div>
                <EditableZone page="start" zone="cat_1" fallback="Blog"
                  className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 block"
                />
                <div className="space-y-3">
                  <Link href="/blog" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_1_label" fallback="Tous les carnets de voyage" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_1_desc" fallback="Récits slow travel, destinations authentiques"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>

                  <Link href="/blog?categorie=Guides Pratiques" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_2_label" fallback="Guides pratiques" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_2_desc" fallback="Itinéraires, conseils, pépites testées"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>

                  <Link href="/destinations" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_3_label" fallback="Destinations" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_3_desc" fallback="Madère, Roumanie, Monténégro, Grèce..."
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Catégorie 2 : Services */}
              <div>
                <EditableZone page="start" zone="cat_2" fallback="Services"
                  className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 block"
                />
                <div className="space-y-3">
                  <Link href="/travel-planning" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_4_label" fallback="Travel planning sur mesure" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_4_desc" fallback="Conçois ton voyage avec nous"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>

                  <Link href="/a-propos" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_6_label" fallback="À propos" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_6_desc" fallback="Notre histoire, notre philosophie"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Catégorie 3 : Gratuits */}
              <div>
                <EditableZone page="start" zone="cat_3" fallback="Gratuits"
                  className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 block"
                />
                <div className="space-y-3">
                  <Link href="/guides/top-10-pepites-madere" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_7_label" fallback="Guide Top 10 Madère" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_7_desc" fallback="Les meilleures adresses testées sur place"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>

                  <Link href="/slow-travel" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_8_label" fallback="Quiz Slow Travel" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_8_desc" fallback="Quel voyageur es-tu ?"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Catégorie 4 : Contact */}
              <div>
                <EditableZone page="start" zone="cat_4" fallback="Contact"
                  className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 block"
                />
                <div className="space-y-3">
                  <Link href="/contact" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_9_label" fallback="Nous contacter" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_9_desc" fallback="Une question ? On répond sous 48h"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>

                  <Link href="https://www.instagram.com/heldonica/" target="_blank" rel="noopener noreferrer" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_10_label" fallback="Instagram" className="inline" />
                          <ExternalIcon />
                        </p>
                        <EditableZone page="start" zone="link_10_desc" fallback="@heldonica"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>

                  <Link href="#newsletter" className="block bg-[#FAF7F2] rounded-sm p-5 border border-stone-100 hover:border-[#DED5C6] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                          <EditableZone page="start" zone="link_11_label" fallback="Newsletter" className="inline" />
                        </p>
                        <EditableZone page="start" zone="link_11_desc" fallback="Reçois les pépites chaque semaine"
                          className="text-sm text-stone-500 mt-1 block"
                        />
                      </div>
                      <ArrowIcon />
                    </div>
                  </Link>
                </div>
              </div>
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
                placeholder={getCmsOrSetting('newsletter_placeholder', '', 'ton@email.fr')}
                required
                className="flex-1 px-5 py-3.5 bg-stone-800 border border-stone-700 rounded-sm text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-action text-white font-semibold rounded-sm hover:brightness-110 transition-all whitespace-nowrap"
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
