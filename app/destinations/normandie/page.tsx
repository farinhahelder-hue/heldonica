import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

export const revalidate = 3600

const PAGE = 'destinations-normandie'

const metadata: Metadata = {
  title: 'Normandie en couple : guide slow travel (Le Havre, Côte d’Albâtre, Pays d’Auge) | Heldonica',
  description:
    'Guide slow travel en Normandie : architecture Auguste Perret au Havre (UNESCO), falaises de craie de la Côte d’Albâtre et vergers du Pays d’Auge.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/normandie',
  },
  openGraph: {
    title: 'Normandie en couple : guide slow travel | Heldonica',
    description:
      'Le Havre d’Auguste Perret, les valleuses de la Côte d’Albâtre et les pressoirs du Pays d’Auge : notre guide slow travel en Normandie.',
    url: 'https://www.heldonica.fr/destinations/normandie',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Normandie slow travel — Côte d'Albâtre et Pays d'Auge",
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-normandie', metadata)
}

export default async function NormandiePage() {
  const zones = await getPageZones(PAGE)

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html',
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

  const SUBNav = [
    {
      zone: 'subnav_1',
      label: getCmsOrSetting('subnav_1', 'Le Havre'),
      href: '/destinations/normandie/le-havre',
    },
    {
      zone: 'subnav_2',
      label: getCmsOrSetting('subnav_2', "Côte d'Albâtre"),
      href: '/destinations/normandie/cote-albatre',
    },
    {
      zone: 'subnav_3',
      label: getCmsOrSetting('subnav_3', "Pays d'Auge"),
      href: '/destinations/normandie/pays-dauge',
    },
  ]

  const FAQS = [
    {
      qZone: 'faq_1_q',
      aZone: 'faq_1_a',
      q: getCmsOrSetting('faq_1_q', 'Quand partir en Normandie pour éviter l’affluence ?'),
      a: getCmsOrSetting(
        'faq_1_a',
        'Mai, juin et septembre offrent la plus belle lumière sur la Manche et des falaises dégagées en semaine. En été, privilégie les départs sur les sentiers côtiers avant 9h00 et les fins d’après-midi après 17h30.'
      ),
    },
    {
      qZone: 'faq_2_q',
      aZone: 'faq_2_a',
      q: getCmsOrSetting('faq_2_q', 'Comment rejoindre la Normandie depuis Paris sans stress ?'),
      a: getCmsOrSetting(
        'faq_2_a',
        'Le train Nomad relie Paris-Saint-Lazare au Havre en 2h15 et à Lisieux ou Deauville en 1h45. Le Havre se parcourt intégralement à pied et en tramway ; une voiture louée en gare permet ensuite de relier les valleuses de la Côte d’Albâtre et le bocage du Pays d’Auge.'
      ),
    },
    {
      qZone: 'faq_3_q',
      aZone: 'faq_3_a',
      q: getCmsOrSetting('faq_3_q', 'Que privilégier pour un premier séjour en couple ?'),
      a: getCmsOrSetting(
        'faq_3_a',
        'Associe trois ambiances complémentaires sur 4 à 5 jours : l’architecture de béton rosé d’Auguste Perret et le musée MuMa au Havre, la marche sur le GR21 entre Vaucottes et Yport sur la Côte d’Albâtre, puis les vergers cidricoles autour de Cambremer et Beuvron-en-Auge.'
      ),
    },
  ]

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristDestination',
            name: 'Normandie',
            description:
              'Architecture UNESCO du Havre, falaises de craie de la Côte d’Albâtre et bocage cidricole du Pays d’Auge.',
            url: 'https://www.heldonica.fr/destinations/normandie',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'FR',
              addressRegion: 'Normandie',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 49.4944,
              longitude: 0.1079,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <Header />
      <main className="min-h-screen bg-[#F7F3EC]">
        {/* Hero */}
        <section className="relative bg-stone-900 py-20 md:py-24 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 uppercase tracking-widest">
              {Z('hero_badge', 'text', 'Destinations · France · Manche & Bocage', undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', 'Normandie', undefined, 'span')}
              <span className="block text-teal italic text-2xl md:text-3xl mt-2">
                {Z(
                  'hero_subtitle',
                  'text',
                  'béton ciselé, craie blanche et chemins creux sous les pommiers',
                  undefined,
                  'span'
                )}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z(
                'hero_description',
                'textarea',
                "Des grands portiques d'Auguste Perret face à l'estuaire de la Seine jusqu'aux valleuses secrètes de la Côte d'Albâtre et aux pressoirs du Pays d'Auge : la Normandie qu'on arpente en prenant le temps des marées.",
                undefined,
                'span'
              )}
            </p>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-[#FAF7F2] border-b border-[#DED5C6] sticky top-16 z-40" aria-label="Sous-destinations">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {SUBNav.map((item) => (
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
          {/* Intro */}
          <section className="mb-12 space-y-4">
            <p className="text-lg text-stone-700 leading-relaxed">
              {Z(
                'intro_1',
                'html',
                "Quand on évoque la Normandie, les mêmes images reviennent : l'arche d'Étretat à midi ou les bassins bondés d'Honfleur un dimanche d'été. Pourtant, à quelques kilomètres de ces points de fixation, s'étend une géographie bien plus apaisée : les valleuses herbeuses qui descendent vers les galets entre Vaucottes et Varengeville-sur-Mer, les chemins creux du Pays d'Auge bordés de haies vives et la lumière maritime du Havre dont le centre reconstruit par Auguste Perret est classé au patrimoine mondial de l'UNESCO. <strong>C'est cette Normandie de grand vent et de tables sincères qu'on te partage ici.</strong>",
                undefined,
                'span'
              )}
            </p>
            <p className="text-base text-stone-600 leading-relaxed">
              {Z(
                'intro_2',
                'textarea',
                "À deux heures de train de Paris-Saint-Lazare, la région se prête particulièrement aux séjours lents hors des grands week-ends fériés : marcher sur le GR21 au rythme des coefficients de marée, écouter résonner le clocher-lanterne de 107 mètres de l'église Saint-Joseph du Havre et goûter un cidre fermier parcellaire sur les collines de Cambremer.",
                undefined,
                'span'
              )}
            </p>
          </section>

          {/* Cards grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('regions_title', 'text', 'Nos trois territoires en Normandie', undefined, 'span')}
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              <Link
                href="/destinations/normandie/le-havre"
                className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group block"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-2">
                  {Z('card_1_kicker', 'text', 'Estuaire & UNESCO', undefined, 'span')}
                </p>
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_1_title', 'text', 'Le Havre et Sainte-Adresse', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'card_1_desc',
                    'textarea',
                    "Chef-d'œuvre d'urbanisme d'Auguste Perret : église Saint-Joseph, appartement témoin, collection impressionniste du MuMa face à la mer et falaises du Cap de la Hève.",
                    undefined,
                    'span'
                  )}
                </p>
              </Link>
              <Link
                href="/destinations/normandie/cote-albatre"
                className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group block"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-2">
                  {Z('card_2_kicker', 'text', 'Falaises de craie & GR21', undefined, 'span')}
                </p>
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_2_title', 'text', "Côte d'Albâtre", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'card_2_desc',
                    'textarea',
                    "130 kilomètres de murailles de craie à silex : Étretat à l'aube, valleuse de Vaucottes, port d'Yport, Fécamp, Veules-les-Roses et le cimetière marin de Varengeville-sur-Mer.",
                    undefined,
                    'span'
                  )}
                </p>
              </Link>
              <Link
                href="/destinations/normandie/pays-dauge"
                className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group block"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-2">
                  {Z('card_3_kicker', 'text', 'Bocage, cidre & colombages', undefined, 'span')}
                </p>
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_3_title', 'text', "Pays d'Auge", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'card_3_desc',
                    'textarea',
                    'Vallons verdoyants, manoirs à pans de bois, Route du Cidre autour de Cambremer et Beuvron-en-Auge, fromageries de Pont-l’Évêque et Livarot.',
                    undefined,
                    'span'
                  )}
                </p>
              </Link>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('infos_section_title', 'text', 'Repères pratiques pour préparer ton séjour', undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif text-lg text-stone-900 mb-4">
                  {Z('info_1_title', 'text', 'Quand y aller', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span>
                      {Z(
                        'info_1_item_1',
                        'html',
                        '<strong>Mai – Juin :</strong> Floraison des pommiers dans le Pays d’Auge et longues soirées claires sur la Manche.',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>
                      {Z(
                        'info_1_item_2',
                        'html',
                        '<strong>Septembre – Octobre :</strong> Lumière dorée d’arrière-saison, récolte des pommes à cidre et grandes marées d’équinoxe.',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>
                      {Z(
                        'info_1_item_3',
                        'html',
                        '<strong>Juillet – Août :</strong> Privilégie la semaine et les départs avant 8h30 sur les falaises d’Étretat.',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif text-lg text-stone-900 mb-4">
                  {Z('info_2_title', 'text', 'Budget indicatif en couple', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span>
                      {Z(
                        'info_2_item_1',
                        'html',
                        '<strong>Hébergement de caractère :</strong> 110 à 170 € / nuit en maison d’hôtes ou hôtel face mer.',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>
                      {Z(
                        'info_2_item_2',
                        'html',
                        '<strong>Tables & producteurs :</strong> 35 à 55 € par personne pour un dîner de poissons de criée ou une table cidricole.',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>
                      {Z(
                        'info_2_item_3',
                        'html',
                        '<strong>Mobilité :</strong> Train Paris – Le Havre dès 19 € l’aller ; location de véhicule ~45 € / jour.',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('faq_section_title', 'text', 'Questions fréquentes sur la Normandie', undefined, 'span')}
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

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('more_section_title', 'text', 'Poursuivre l’exploration', undefined, 'span')}
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/destinations/normandie/le-havre"
                className="px-6 py-3 bg-action text-white rounded-sm hover:bg-action-fonce transition-colors text-sm font-medium"
              >
                {Z('more_btn_1', 'text', 'Carnet Le Havre', undefined, 'span')}
              </Link>
              <Link
                href="/destinations/normandie/cote-albatre"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-sm hover:border-eucalyptus/40 transition-colors text-sm font-medium"
              >
                {Z('more_btn_2', 'text', "Carnet Côte d'Albâtre", undefined, 'span')}
              </Link>
              <Link
                href="/destinations/normandie/pays-dauge"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-sm hover:border-eucalyptus/40 transition-colors text-sm font-medium"
              >
                {Z('more_btn_3', 'text', "Carnet Pays d'Auge", undefined, 'span')}
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-sm hover:border-eucalyptus/40 transition-colors text-sm font-medium"
              >
                {Z('more_btn_blog', 'text', 'Tous nos articles', undefined, 'span')}
              </Link>
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
