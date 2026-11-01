import type { Metadata } from 'next'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

export const revalidate = 86400

const PAGE = 'destinations-colombie'

const metadata: Metadata = {
  title: 'Colombie en couple : guide slow travel (Eje Cafetero, Bogotá, Medellín, Cali) | Heldonica',
  description:
    'Guide slow travel Colombie : de Cartago à Salento dans l’Eje Cafetero, Bogotá, Medellín et Cali. Étapes de terroir, fincas caféières et repères pratiques.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/colombie',
  },
  openGraph: {
    title: 'Colombie en couple : guide slow travel | Heldonica',
    description:
      'Des fincas du Quindío et de Cartago aux collines de Medellín, Bogotá et Cali : notre carnet slow travel en Colombie.',
    url: 'https://www.heldonica.fr/destinations/colombie',
    images: [
      {
        url: '/images/destinations/colombie/cartago/etape5_salento_cordillere.jpg',
        width: 1200,
        height: 630,
        alt: 'Colombie — Cordillère centrale et région du café',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-colombie', metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function ColombiePage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  // « Bientôt » tant que la page est dans lib/unpublished-pages.ts, sauf aperçu ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="colombie"
        title={zones.title || 'Colombie'}
        country="Colombie"
        hero_unsplash_url="/images/destinations/colombie/cartago/etape5_salento_cordillere.jpg"
        zones={zones}
      />
    )
  }

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
      label: getCmsOrSetting('subnav_1', 'Cartago & Eje Cafetero'),
      href: '/destinations/colombie/cartago',
    },
    {
      zone: 'subnav_2',
      label: getCmsOrSetting('subnav_2', 'Bogotá'),
      href: '/destinations/colombie/bogota',
    },
    {
      zone: 'subnav_3',
      label: getCmsOrSetting('subnav_3', 'Medellín'),
      href: '/destinations/colombie/medellin',
    },
    {
      zone: 'subnav_4',
      label: getCmsOrSetting('subnav_4', 'Cali'),
      href: '/destinations/colombie/cali',
    },
  ]

  const FAQS = [
    {
      qZone: 'faq_1_q',
      aZone: 'faq_1_a',
      q: getCmsOrSetting('faq_1_q', 'Quelle est la meilleure saison pour un voyage en Colombie ?'),
      a: getCmsOrSetting(
        'faq_1_a',
        'De décembre à mars (saison sèche principale) et en juillet-août (veranillo) pour parcourir la cordillère des Andes, le Valle del Cauca et les fincas du Quindío sous un ciel dégagé le matin.'
      ),
    },
    {
      qZone: 'faq_2_q',
      aZone: 'faq_2_a',
      q: getCmsOrSetting('faq_2_q', 'Comment organiser ses déplacements entre les vallées andines ?'),
      a: getCmsOrSetting(
        'faq_2_a',
        'La Colombie est traversée par trois cordillères parallèles : privilégie une boucle cohérente par région (par exemple Cali – Cartago – Quimbaya – Salento dans le sud-ouest, ou Bogotá et Medellín séparément) plutôt que de multiplier les longs trajets routiers de montagne.'
      ),
    },
    {
      qZone: 'faq_3_q',
      aZone: 'faq_3_a',
      q: getCmsOrSetting('faq_3_q', 'Quel budget prévoir sur place en couple ?'),
      a: getCmsOrSetting(
        'faq_3_a',
        'Hors vol long-courrier, compte entre 65 et 110 € par jour pour deux personnes en logeant dans des fincas caféières de caractère ou des maisons coloniales et en prenant le temps des marchés et tables de terroir.'
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
        {isPreview && (
          <div className="bg-amber-100/90 border-b border-amber-300 text-amber-900 px-4 py-2.5 text-xs flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 text-amber-700" />
            <span className="font-medium">
              {Z('draft_badge_title', 'text', 'Mode Brouillon actif :', undefined, 'span')}
            </span>
            <span>
              {Z(
                'draft_badge_desc',
                'text',
                'Aperçu interne de la page pilier Colombie (non indexée tant qu’elle figure dans unpublished-pages).',
                undefined,
                'span'
              )}
            </span>
          </div>
        )}

        {/* Hero */}
        <section className="relative bg-stone-900 py-20 md:py-24 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 uppercase tracking-widest">
              {Z('hero_badge', 'text', 'Destination Amérique du Sud · Andes & Valle del Cauca', undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', 'Colombie', undefined, 'span')}
              <span className="block text-teal italic text-2xl md:text-3xl mt-2">
                {Z(
                  'hero_subtitle',
                  'text',
                  'des plaines du Valle del Cauca aux crêtes caféières de la cordillère centrale',
                  undefined,
                  'span'
                )}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z(
                'hero_description',
                'textarea',
                "Bambous géants le long du Río La Vieja, cafés de village à Quimbaya, musées d'altitude à Bogotá et brise du soir à Cali : une Colombie vécue au rythme des routes secondaires et des tables paysannes.",
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
                "Comprendre la Colombie demande d'accepter sa géographie verticale : en moins de deux heures de route, on quitte la chaleur tropicale du Valle del Cauca à 900 mètres d'altitude pour franchir le Río La Vieja bordé de bambous <em>guadua</em> et grimper vers les brumes fraîches du Quindío et de Salento à 1 900 mètres. Chaque palier d'altitude possède ses arbres, ses fromages frais moulés du matin et sa manière de torréfier le grain.",
                undefined,
                'span'
              )}
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              {Z(
                'intro_2',
                'html',
                "Ce qu'on retient avant tout de nos étapes sur place, c'est la dignité chaleureuse de l'accueil : s'attabler dès l'aube à Cartago autour de <em>pan de bono</em> tout chauds, discuter de la récolte au comptoir d'une cafetaria ouverte sur la rue à Quimbaya ou voir tomber le crépuscule sur les crêtes de Boquía loin de toute agitation.",
                undefined,
                'span'
              )}
            </p>
          </section>

          {/* Cards grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('cities_section_title', 'text', 'Nos quatre carnets en Colombie', undefined, 'span')}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <Link
                href="/destinations/colombie/cartago"
                className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group block"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_4_title', 'text', 'Cartago & la région du café (Quindío)', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'card_4_desc',
                    'textarea',
                    'Notre itinéraire vérifié en 6 étapes avec photos et coordonnées GPS : Cartago, Río La Vieja, Quimbaya, El Roble, Boquía et Salento.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('card_4_cta', 'text', 'Voir le carnet 6 étapes', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/colombie/bogota"
                className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group block"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_1_title', 'text', 'Bogotá', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'card_1_desc',
                    'textarea',
                    'Capitale andine à 2 640 mètres : ruelles coloniales de La Candelaria, Musée de l’Or, fondation Botero, marché de Paloquemao et belvédère de Monserrate.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('card_1_cta', 'text', 'Voir le carnet', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/colombie/medellin"
                className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group block"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_2_title', 'text', 'Medellín', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'card_2_desc',
                    'textarea',
                    'Vallée d’Aburrá à 1 500 mètres : urbanisme social par Metrocable jusqu’au parc Arví, Jardin botanique, quartier arboré de Laureles et escapade à Santa Fe de Antioquia.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('card_2_cta', 'text', 'Voir le carnet', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/colombie/cali"
                className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group block"
              >
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_3_title', 'text', 'Cali', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'card_3_desc',
                    'textarea',
                    'Porte du Valle del Cauca : colline coloniale de San Antonio, berges ombragées du Río Cali, marché de la Galería Alameda et culture musicale caleña.',
                    undefined,
                    'span'
                  )}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">
                  {Z('card_3_cta', 'text', 'Voir le carnet', undefined, 'span')}
                </span>
              </Link>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('infos_section_title', 'text', 'Repères pratiques pour la Colombie', undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif text-lg text-stone-900 mb-4">
                  {Z('info_1_title', 'text', 'Meilleure période', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span>
                      {Z(
                        'info_1_item_1',
                        'html',
                        '<strong>Décembre – Mars :</strong> Saison sèche principale dans les Andes et l’Eje Cafetero.',
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
                        '<strong>Juillet – Août :</strong> Second été sec (<em>veranillo</em>), propice aux randonnées d’altitude.',
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
                        '<strong>Avril – Mai & Octobre – Novembre :</strong> Pluies plus fréquentes en fin d’après-midi dans la cordillère.',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif text-lg text-stone-900 mb-4">
                  {Z('info_2_title', 'text', 'Budget indicatif (en couple)', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span>
                      {Z(
                        'info_2_item_1',
                        'html',
                        '<strong>Hébergement en finca ou maison coloniale :</strong> 55 à 115 € / nuit pour deux.',
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
                        '<strong>Tables locales & cafés de spécialité :</strong> 20 à 40 € / jour pour deux personnes.',
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
                        '<strong>Vols Paris – Bogotá :</strong> ~650 à 900 € A/R selon la saison.',
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
              {Z('faq_section_title', 'text', 'Questions fréquentes', undefined, 'span')}
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
