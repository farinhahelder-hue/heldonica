import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Start — Heldonica | Liens rapides',
  description: 'Retrouve tous les liens Heldonica : blog, guides gratuits, travel planning et contact.',
  robots: { index: false, follow: false },
}

const LINKS = [
  {
    category: '📖 Blog',
    items: [
      { label: 'Tous les carnets de voyage', href: '/blog', desc: 'Récits slow travel, destinations authentiques' },
      { label: 'Guides pratiques', href: '/blog?categorie=Guides Pratiques', desc: 'Itinéraires, conseils, pépites testées' },
      { label: 'Destinations', href: '/destinations', desc: 'Madère, Roumanie, Monténégro, Grèce...' },
    ],
  },
  {
    category: '🗺️ Services',
    items: [
      { label: 'Travel planning sur mesure', href: '/travel-planning', desc: 'Conçois ton voyage avec nous' },
      { label: 'Expertise hôtelière B2B', href: '/expert-hotelier', desc: 'Audit & consulting pour professionnels' },
      { label: 'À propos', href: '/a-propos', desc: 'Notre histoire, notre philosophie' },
    ],
  },
  {
    category: '🎁 Gratuits',
    items: [
      { label: 'Guide Top 10 Madère', href: '/guides/top-10-pepites-madere', desc: 'Les meilleures adresses testées sur place' },
      { label: 'Quiz Slow Travel', href: '/slow-travel', desc: 'Quel voyageur es-tu ?' },
    ],
  },
  {
    category: '💬 Contact',
    items: [
      { label: 'Nous contacter', href: '/contact', desc: 'Une question ? On répond sous 48h' },
      { label: 'Instagram', href: 'https://www.instagram.com/heldonica/', external: true, desc: '@heldonica' },
      { label: 'Newsletter', href: '#newsletter', desc: 'Reçois les pépites chaque semaine' },
    ],
  },
]

export default function StartPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        {/* Hero */}
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
              Bienvenue sur Heldonica
            </h1>
            <p className="text-stone-600 text-lg leading-relaxed">
              Slow travel vécu, conçu sur mesure. Retrouve ici tous nos liens — blog, guides gratuits, services et contact.
            </p>
          </div>
        </section>

        {/* Liens */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-2xl mx-auto px-6">
            <div className="space-y-10">
              {LINKS.map((section, i) => (
                <div key={i}>
                  <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4">
                    {section.category}
                  </h2>
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
                              {link.label}
                              {link.external && (
                                <svg className="inline-block ml-2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                            </p>
                            <p className="text-sm text-stone-500 mt-1">{link.desc}</p>
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

        {/* Newsletter */}
        <section id="newsletter" className="py-16 md:py-24 bg-stone-950 text-white">
          <div className="max-w-xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Reçois les pépites chaque semaine
            </h2>
            <p className="text-stone-400 mb-8">
              Un lieu testé, un conseil terrain, un avant-goût de ce qu&apos;on prépare. Pas de spam.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="ton@email.com"
                required
                className="flex-1 px-5 py-3.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all whitespace-nowrap"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}