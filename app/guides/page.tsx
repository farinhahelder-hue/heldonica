import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

const PAGE = "guides";
const GUIDES = [
  { slug: "top-10-pepites-madere", title: "Les 10 pépites de Madère qu'on ne te dit pas", description: "Les adresses dénichées sur le terrain, les sentiers hors des cartes et les tables familiales que les guides touristiques ignorent.", destination: "Madère", emoji: "🌿" },
];

const metadata: Metadata = {
  title: "Guides de voyage | Heldonica",
  description: "Nos guides pratiques terrain : pépites dénichées, adresses testées, conseils slow travel. Ce qu'on n'a pas mis sur le blog.",
  alternates: {
    canonical: "https://www.heldonica.fr/guides",
  },
  openGraph: {
    url: "https://www.heldonica.fr/guides",
    title: "Guides de voyage | Heldonica",
    description: "Nos guides pratiques terrain : pépites dénichées, adresses testées, conseils slow travel.",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Guides de voyage — Heldonica",
      },
    ],
    locale: 'fr_FR',
    type: "website",
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Guides de voyage | Heldonica",
    description: "Nos guides pratiques terrain : pépites dénichées, adresses testées, conseils slow travel.",
    creator: '@heldonica',
    images: ['/og-default.jpg'],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('guides', metadata)
}


export default async function GuidesPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-cloud-dancer py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-mahogany font-semibold mb-4">
              {Z('hero_eyebrow', 'text', "Guides & Pépites", undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-5 leading-tight">
              {Z('hero_title', 'text', "Ce qu'on n'a pas mis sur le blog.", undefined, 'span')}
            </h1>
            <p className="text-charcoal/70 text-lg max-w-xl mx-auto leading-relaxed">
              {Z('hero_description', 'textarea', "Des guides pratiques terrain — avec les vraies adresses, les vraies distances, les vraies erreurs à éviter.", undefined, 'span')}
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid gap-6">
                <Link
                  key={GUIDES[0].slug}
                  href={'/guides/' + GUIDES[0].slug}
                  className="group flex gap-6 rounded-2xl border border-stone-200 bg-stone-50 p-6 hover:border-eucalyptus/40 hover:bg-eucalyptus/5 transition-all"
                >
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-eucalyptus/10 flex items-center justify-center text-3xl">
                    {Z('guide_1_emoji', 'text', "🌿", undefined, 'span')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-eucalyptus font-semibold mb-1">
                      {Z('guide_1_destination', 'text', "Madère", undefined, 'span')}
                    </p>
                    <h2 className="text-xl font-serif font-light text-stone-900 mb-2 group-hover:text-mahogany transition-colors leading-snug">
                      {Z('guide_1_title', 'text', "Les 10 pépites de Madère qu'on ne te dit pas", undefined, 'span')}
                    </h2>
                    <p className="text-sm text-charcoal/60 leading-relaxed">
                      {Z('guide_1_description', 'textarea', "Les adresses dénichées sur le terrain, les sentiers hors des cartes et les tables familiales que les guides touristiques ignorent.", undefined, 'span')}
                    </p>
                  </div>
                </Link>
            </div>
          </div>
        </section>

        <section className="bg-stone-50 border-t border-stone-200 py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-charcoal/60 text-sm mb-4">
              {Z('cta_text', 'textarea', "D'autres guides en préparation — laisse-nous ton email pour être prévenu.", undefined, 'span')}
            </p>
            <Link href="/destinations" className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:underline">
              ← Voir toutes nos destinations
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
