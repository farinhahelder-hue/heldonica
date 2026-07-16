import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Guides de voyage | Heldonica',
  description: 'Nos guides pratiques terrain : pépites dénichées, adresses testées, conseils slow travel. Ce qu\'on n\'a pas mis sur le blog.',
  alternates: {
    canonical: 'https://www.heldonica.fr/guides',
  },
  openGraph: {
    url: 'https://www.heldonica.fr/guides',
    title: 'Guides de voyage | Heldonica',
    description: 'Nos guides pratiques terrain : pépites dénichées, adresses testées, conseils slow travel.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Guides de voyage — Heldonica',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guides de voyage | Heldonica',
    description: 'Nos guides pratiques terrain : pépites dénichées, adresses testées, conseils slow travel.',
    creator: '@heldonica',
    images: ['/og-default.jpg'],
  },
}

const GUIDES = [
  {
    slug: 'top-10-pepites-madere',
    title: "Les 10 pépites de Madère qu'on ne te dit pas",
    description: 'Les adresses dénichées sur le terrain, les sentiers hors des cartes et les tables familiales que les guides touristiques ignorent.',
    destination: 'Madère',
    emoji: '🌿',
  },
]

export default function GuidesPage() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-cloud-dancer py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-mahogany font-semibold mb-4">Guides & Pépites</p>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-5 leading-tight">
              Ce qu&apos;on n&apos;a pas mis sur le blog.
            </h1>
            <p className="text-charcoal/70 text-lg max-w-xl mx-auto leading-relaxed">
              Des guides pratiques terrain — avec les vraies adresses, les vraies distances, les vraies erreurs à éviter.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid gap-6">
              {GUIDES.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group flex gap-6 rounded-2xl border border-stone-200 bg-stone-50 p-6 hover:border-eucalyptus/40 hover:bg-eucalyptus/5 transition-all"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-eucalyptus/10 flex items-center justify-center text-3xl">
                    {guide.emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-eucalyptus font-semibold mb-1">{guide.destination}</p>
                    <h2 className="text-xl font-serif font-light text-stone-900 mb-2 group-hover:text-mahogany transition-colors leading-snug">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-charcoal/60 leading-relaxed">{guide.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-stone-50 border-t border-stone-200 py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-charcoal/60 text-sm mb-4">D&apos;autres guides en préparation — laisse-nous ton email pour être prévenu.</p>
            <Link href="/destinations" className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:underline">
              ← Voir toutes nos destinations
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
