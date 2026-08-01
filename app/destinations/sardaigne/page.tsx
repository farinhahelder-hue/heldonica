import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

const PAGE = 'destinations-sardaigne'

const metadata: Metadata = {
  title: 'Sardaigne slow travel | Guide Heldonica',
  description: "Guide slow travel Sardaigne : plages sauvages, villages de l'intérieur, agritourisme et adresses dénichées loin des foules. Testé par Heldonica.",
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne',
  },
  openGraph: {
    title: 'Sardaigne slow travel | Guide Heldonica',
    description: "Plages sauvages, villages de l'intérieur et adresses dénichées loin des foules. Notre guide slow travel Sardaigne testé sur le terrain.",
    url: 'https://www.heldonica.fr/destinations/sardaigne',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Sardaigne — plages et villages slow travel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sardaigne slow travel | Guide Heldonica',
    description: "Plages sauvages, villages de l'intérieur et adresses dénichées loin des foules.",
    images: ['/og-default.jpg'],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-sardaigne', metadata)
}


const subNav = [
  { label: 'Cagliari', href: '/destinations/sardaigne/cagliari' },
  { label: 'Costa Smeralda', href: '/destinations/sardaigne/costa-smeralda' },
  { label: 'Alghero', href: '/destinations/sardaigne/alghero' },
  { label: 'Nuoro', href: '/destinations/sardaigne/nuoro' },
  { label: 'Asinara', href: '/destinations/sardaigne/asinara' },
]

// Valeurs de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const FAQS: { q: { zone: string; fb: string }; a: { zone: string; fb: string } }[] = [
  { q: { zone: "faq_1_q", fb: "Quand aller en Sardaigne ?" }, a: { zone: "faq_1_a", fb: "Mai-juin ou septembre : plages parfaites, foules réduites. Juillet-août reste possible mais très fréquenté." } },
  { q: { zone: "faq_2_q", fb: "Où loger en Sardaigne ?" }, a: { zone: "faq_2_a", fb: "Cagliari pour la culture et la vie locale, Alghero pour le charme catalan, et les agriturismes de l'intérieur pour le vrai slow travel." } },
  { q: { zone: "faq_3_q", fb: "Comment se déplacer en Sardaigne ?" }, a: { zone: "faq_3_a", fb: "La voiture est indispensable pour explorer les villages et l'intérieur. Vols directs vers Cagliari (CAG) ou Olbia (OLB) depuis Paris." } }
]

export default async function SardaignePage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: zones[`${PAGE}__${f.q.zone}`] ?? f.q.fb,
      acceptedAnswer: { '@type': 'Answer', text: zones[`${PAGE}__${f.a.zone}`] ?? f.a.fb },
    })),
  }

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-stone-900 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover opacity-30')}
          </div>
          <div className="relative max-w-4xl mx-auto px-6">
            <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Destination testée
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', "Sardaigne", undefined, 'span')}
              <span className="block text-teal italic text-3xl md:text-4xl mt-2">{Z('hero_subtitle', 'text', "l'île qui ne se livre pas d'un seul coup", undefined, 'span')}</span>
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', "Entre Méditerranée et mer Tyrrhénienne, la Sardaigne cache ses meilleures cartes à l'intérieur des terres, loin des plages célèbres.", undefined, 'span')}
            </p>
          </div>
        </section>

        <nav aria-label="Villes et zones de Sardaigne" className="bg-white border-b border-stone-200 sticky top-16 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed mb-4">
              {Z('intro_1', 'textarea', "La Sardaigne, c'est l'île qui reste. Pas dans le sens d'un souvenir vague — dans le sens d'un endroit qui s'installe et ne repart plus. Les plages du sud autour de Cagliari, les lagunes roses aux flamants, les dunes sauvages de Piscinas. Et puis l'intérieur : les villages de pierre, les fêtes bariolées, les pecorino vieux qu'on mange au couteau.", undefined, 'span')}
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              {Z('intro_2', 'textarea', "Ce qu'on préfère ? Les agriturismes de la Barbagia, où l'on mange ce que la famille a produit. Et les routes qui ne mènent nulle part — jusqu'à ce qu'elles mènent quelque part d'extraordinaire.", undefined, 'span')}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Nos zones favorites</h2>
            <div className="grid gap-6 md:grid-cols-2">
                <Link key={"/destinations/sardaigne/cagliari"} href={"/destinations/sardaigne/cagliari"}
                  className="block p-6 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                  <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">{Z('zone_1_title', 'text', "Cagliari", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('zone_1_desc', 'textarea', "Le sud. Capitale animée, lagune aux flamants, dunes de Piscinas.", undefined, 'span')}</p>
                  <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">Voir le guide →</span>
                </Link>
                <Link key={"/destinations/sardaigne/alghero"} href={"/destinations/sardaigne/alghero"}
                  className="block p-6 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                  <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">{Z('zone_2_title', 'text', "Alghero", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('zone_2_desc', 'textarea', "Nord-ouest. Ville catalane aux remparts dorés, grotte de Neptune.", undefined, 'span')}</p>
                  <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">Voir le guide →</span>
                </Link>
                <Link key={"/destinations/sardaigne/nuoro"} href={"/destinations/sardaigne/nuoro"}
                  className="block p-6 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                  <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">{Z('zone_3_title', 'text', "Nuoro & Barbagia", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('zone_3_desc', 'textarea', "L'intérieur. Villages de pierre, agritourismes, cuisine de montagne.", undefined, 'span')}</p>
                  <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">Voir le guide →</span>
                </Link>
                <Link key={"/destinations/sardaigne/asinara"} href={"/destinations/sardaigne/asinara"}
                  className="block p-6 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                  <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">{Z('zone_4_title', 'text', "Asinara", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('zone_4_desc', 'textarea', "Île sauvage du nord-ouest. Parc national, ânes blancs, plongée.", undefined, 'span')}</p>
                  <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">Voir le guide →</span>
                </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-stone-900 font-medium mb-4">Meilleure période</h3>
              <ul className="text-stone-600 text-sm space-y-2">
                <li>{Z('period_1', 'textarea', "✓ Mai – Juin : idéal, mer et terrasses", undefined, 'span')}</li>
                <li>{Z('period_2', 'textarea', "✓ Septembre : parfait, foules réduites", undefined, 'span')}</li>
                <li>{Z('period_3', 'textarea', "⚠ Juillet – Août : chaud, très fréquenté", undefined, 'span')}</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-stone-900 font-medium mb-4">Budget indicatif (duo/semaine)</h3>
              <ul className="text-stone-600 text-sm space-y-2">
                <li>{Z('budget_1', 'textarea', "Hébergement : 70–150€/nuit", undefined, 'span')}</li>
                <li>{Z('budget_2', 'textarea', "Repas au restaurant : 40–70€/jour", undefined, 'span')}</li>
                <li>{Z('budget_3', 'textarea', "Vol Paris–Cagliari : ~120–200€ A/R", undefined, 'span')}</li>
              </ul>
            </div>
          </section>

          <div className="pt-4 border-t border-stone-200">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              ← Toutes les destinations
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
