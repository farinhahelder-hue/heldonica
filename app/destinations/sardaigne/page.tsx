import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

export const revalidate = 86400

const PAGE = 'destinations-sardaigne'

const metadata: Metadata = {
  title: 'Sardaigne en couple : guide slow travel (Cagliari, Alghero, Barbagia, Asinara) | Heldonica',
  description:
    'Guide slow travel Sardaigne : salines et lagunes de Cagliari, remparts catalans d’Alghero, villages granitiques de la Barbagia et parc national d’Asinara.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne',
  },
  openGraph: {
    title: 'Sardaigne en couple : guide slow travel | Heldonica',
    description:
      'Des dunes du Sulcis et de Cagliari aux bergeries de la Barbagia et à l’île d’Asinara : notre guide slow travel en Sardaigne.',
    url: 'https://www.heldonica.fr/destinations/sardaigne',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Sardaigne — côtes granitiques et villages de la Barbagia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sardaigne en couple : guide slow travel | Heldonica',
    description:
      'Cagliari, Alghero, Nuoro, Gallura et l’île d’Asinara : la Sardaigne hors saison.',
    images: ['/og-default.jpg'],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-sardaigne', metadata)
}

export default async function SardaignePage() {
  const zones = await getPageZones(PAGE)

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'image' | 'html',
    fallback: string,
    className?: string,
    as?: any
  ) => (
    <EditableZone
      page={PAGE}
      zone={zone}
      type={type}
      fallback={fallback}
      className={className}
      as={as}
    />
  )

  const getCmsOrSetting = (zone: string, fallback: string) =>
    zones[`${PAGE}__${zone}`] ?? fallback

  const subNav = [
    {
      zone: 'subnav_1',
      label: getCmsOrSetting('subnav_1', 'Cagliari'),
      href: '/destinations/sardaigne/cagliari',
    },
    {
      zone: 'subnav_2',
      label: getCmsOrSetting('subnav_2', 'Gallura & Costa Smeralda'),
      href: '/destinations/sardaigne/costa-smeralda',
    },
    {
      zone: 'subnav_3',
      label: getCmsOrSetting('subnav_3', 'Alghero'),
      href: '/destinations/sardaigne/alghero',
    },
    {
      zone: 'subnav_4',
      label: getCmsOrSetting('subnav_4', 'Nuoro & Barbagia'),
      href: '/destinations/sardaigne/nuoro',
    },
    {
      zone: 'subnav_5',
      label: getCmsOrSetting('subnav_5', 'Île d’Asinara'),
      href: '/destinations/sardaigne/asinara',
    },
  ]

  const FAQS = [
    {
      qZone: 'faq_1_q',
      aZone: 'faq_1_a',
      q: getCmsOrSetting('faq_1_q', 'Quelle est la meilleure période pour parcourir la Sardaigne ?'),
      a: getCmsOrSetting(
        'faq_1_a',
        'Mai, juin et la période de mi-septembre à fin octobre : l’eau de la mer Tyrrhénienne est douce, le maquis embaume le myrte et l’immortelle, et les sentiers côtiers comme les tables d’agriturismo retrouvent leur calme.'
      ),
    },
    {
      qZone: 'faq_2_q',
      aZone: 'faq_2_a',
      q: getCmsOrSetting('faq_2_q', 'Comment répartir ses étapes sur une à deux semaines ?'),
      a: getCmsOrSetting(
        'faq_2_a',
        'L’île est vaste et montagneuse : évite de vouloir tout boucler en sept jours. Choisis soit la moitié nord (Alghero, parc d’Asinara, intérieur de la Barbagia autour de Nuoro et granit de Gallura), soit la moitié sud (Cagliari, dunes de Piscinas, île de San Pietro et Ogliastra).'
      ),
    },
    {
      qZone: 'faq_3_q',
      aZone: 'faq_3_a',
      q: getCmsOrSetting('faq_3_q', 'Comment se déplacer sur place ?'),
      a: getCmsOrSetting(
        'faq_3_a',
        'Une voiture compacte est indispensable pour emprunter la route panoramique SP105 entre Alghero et Bosa ou la SS125 (Orientale Sarda) à travers le massif du Supramonte. Les ports et aéroports de Cagliari, Olbia et Alghero permettent d’entrer par une pointe et de repartir par une autre.'
      ),
    },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-[#F7F3EC]">
        <section className="relative bg-stone-900 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover opacity-30')}
          </div>
          <div className="relative max-w-4xl mx-auto px-6">
            <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {Z('hero_badge', 'text', 'Méditerranée · Italie insulaire', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', 'Sardaigne', undefined, 'span')}
              <span className="block text-teal italic text-2xl md:text-3xl mt-2">
                {Z(
                  'hero_subtitle',
                  'text',
                  "l'île-continent où les bergers tournent le dos aux yachts",
                  undefined,
                  'span'
                )}
              </span>
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z(
                'hero_description',
                'textarea',
                "À quelques kilomètres des criques cristallines commence une tout autre Sardaigne : celle des plateaux calcaires du Supramonte, des nuraghes de basalte vieux de trois mille ans, des remparts catalans d'Alghero et des lagunes aux flamants roses de Cagliari.",
                undefined,
                'span'
              )}
            </p>
          </div>
        </section>

        <nav
          aria-label="Villes et zones de Sardaigne"
          className="bg-[#FAF7F2] border-b border-[#DED5C6] sticky top-16 z-10"
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors"
              >
                {Z(item.zone, 'text', item.label, undefined, 'span')}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-12 space-y-4">
            <p className="text-lg text-stone-700 leading-relaxed">
              {Z(
                'intro_1',
                'textarea',
                "La Sardaigne est moins une île balnéaire qu'un petit continent pastoral entouré d'eau. Au sud, Cagliari dresse ses bastions calcaires dorés entre le golfe des Anges et les salines de Molentargius où nichent des milliers de flamants roses, tandis qu'à l'ouest les dunes blondes de Piscinas descendent des anciennes mines d'Ingurtosu jusqu'à la mer ouverte.",
                undefined,
                'span'
              )}
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              {Z(
                'intro_2',
                'textarea',
                "Mais c'est en quittant le littoral vers la Barbagia et Nuoro que l'on mesure la singularité sarde : des tables d'agriturismo où l'on partage le pane carasau tout juste sorti du four à bois, le pecorino affiné, les culurgiones tressés à la main et un verre de Cannonau au pied des falaises calcaires du Gennargentu.",
                undefined,
                'span'
              )}
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('zones_section_title', 'text', 'Nos cinq carnets régionaux en Sardaigne', undefined, 'span')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Link
                href="/destinations/sardaigne/cagliari"
                className="block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('zone_1_title', 'text', 'Cagliari & la côte sud', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'zone_1_desc',
                    'textarea',
                    'Quartier haut du Castello, marché de San Benedetto, flamants roses de Molentargius, cité antique de Nora et dunes sauvages de Piscinas.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('zone_1_cta', 'text', 'Voir le carnet', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/sardaigne/alghero"
                className="block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('zone_2_title', 'text', 'Alghero, Capo Caccia & Bosa', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'zone_2_desc',
                    'textarea',
                    'Enclave catalane du nord-ouest : remparts de grès doré face au couchant, escalier de la Escala del Cabirol à Capo Caccia et route côtière SP105 vers Bosa.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('zone_2_cta', 'text', 'Voir le carnet', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/sardaigne/nuoro"
                className="block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('zone_3_title', 'text', 'Nuoro, la Barbagia & le Supramonte', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'zone_3_desc',
                    'textarea',
                    'Le cœur pastoral et littéraire de Grazia Deledda : musée ethnographique de Nuoro, canyon de Gorropu, source de Su Gologone et vignobles d’Oliena.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('zone_3_cta', 'text', 'Voir le carnet', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/sardaigne/asinara"
                className="block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('zone_4_title', 'text', 'Parc national de l’île d’Asinara', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'zone_4_desc',
                    'textarea',
                    'Ancienne île-quarantaine et pénitentiaire devenue réserve marine intégrale sans voitures privées : ânes blancs endémiques, sentiers de granit et criques protégées.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('zone_4_cta', 'text', 'Voir le carnet', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/sardaigne/costa-smeralda"
                className="block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group md:col-span-2"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('zone_5_title', 'text', 'Gallura intérieure & Costa Smeralda hors saison', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'zone_5_desc',
                    'textarea',
                    'Au-delà des marinas d’août : les chaos granitiques de Capo Testa, l’île de Caprera à vélo, les villages de granit de San Pantaleo et Aggius, et les vignobles de Vermentino di Gallura.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('zone_5_cta', 'text', 'Voir le carnet', undefined, 'span')}
                </span>
              </Link>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <h3 className="font-serif text-stone-900 font-medium mb-4">
                {Z('period_heading', 'text', 'Meilleure période', undefined, 'span')}
              </h3>
              <ul className="text-stone-600 text-sm space-y-2">
                <li>
                  {Z(
                    'period_1',
                    'textarea',
                    'Mai – Juin : floraison du maquis, randonnées dans le Supramonte et premières baignades.',
                    undefined,
                    'span'
                  )}
                </li>
                <li>
                  {Z(
                    'period_2',
                    'textarea',
                    'Septembre – Octobre : mer encore à 23 °C, vendanges du Cannonau et fête d’Autunno in Barbagia.',
                    undefined,
                    'span'
                  )}
                </li>
                <li>
                  {Z(
                    'period_3',
                    'textarea',
                    'Juillet – Août : privilégie les hauts plateaux de l’intérieur et la côte ouest (Bosa, Sulcis).',
                    undefined,
                    'span'
                  )}
                </li>
              </ul>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <h3 className="font-serif text-stone-900 font-medium mb-4">
                {Z('budget_heading', 'text', 'Budget indicatif (en couple)', undefined, 'span')}
              </h3>
              <ul className="text-stone-600 text-sm space-y-2">
                <li>
                  {Z(
                    'budget_1',
                    'textarea',
                    'Hébergement en agriturismo ou maison de bourg : 85 à 145 € / nuit.',
                    undefined,
                    'span'
                  )}
                </li>
                <li>
                  {Z(
                    'budget_2',
                    'textarea',
                    'Dîner complet en agriturismo ou trattoria : 35 à 55 € par personne.',
                    undefined,
                    'span'
                  )}
                </li>
                <li>
                  {Z(
                    'budget_3',
                    'textarea',
                    'Accès : vols vers Cagliari ou Olbia (~120–220 € A/R) ou ferry de nuit depuis Toulon/Nice.',
                    undefined,
                    'span'
                  )}
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('faq_heading', 'text', 'Questions fréquentes sur la Sardaigne', undefined, 'span')}
            </h2>
            <div className="space-y-4">
              {FAQS.map((f) => (
                <details key={f.qZone} className="bg-[#FAF7F2] p-5 rounded-sm border border-[#DED5C6] group">
                  <summary className="font-serif text-stone-900 cursor-pointer list-none flex items-center justify-between">
                    {Z(f.qZone, 'text', f.q, undefined, 'span')}
                    <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                    {Z(f.aZone, 'textarea', f.a, undefined, 'span')}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <div className="pt-4 border-t border-[#DED5C6]">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              {Z('back_all_destinations', 'text', '← Toutes les destinations', undefined, 'span')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
