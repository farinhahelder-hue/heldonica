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

export const revalidate = 3600

const SITE_URL = 'https://www.heldonica.fr'
const PAGE = 'destinations-roumanie-timisoara'

const metadata: Metadata = {
  title: 'Timișoara en couple : carnet slow travel dans le Banat | Heldonica',
  description:
    'Timișoara, capitale du Banat : Piața Unirii baroque, cour créative du Cuib d’Arte, quartier Fabric et berges du canal Bega. Notre carnet slow travel.',
  alternates: {
    canonical: `${SITE_URL}/destinations/roumanie/timisoara`,
  },
  openGraph: {
    title: 'Timișoara en couple : carnet slow travel dans le Banat | Heldonica',
    description:
      'Première ville d’Europe éclairée à l’électricité, berceau de la révolution roumaine et ville de carrefour du Banat : Timișoara se découvre à pied.',
    url: `${SITE_URL}/destinations/roumanie/timisoara`,
    images: [
      {
        url: `${SITE_URL}/images/destinations/roumanie/IMG_20260827_135023.jpg`,
        width: 1200,
        height: 630,
        alt: 'Timișoara et l’architecture d’Europe centrale — Heldonica',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timișoara en couple : carnet slow travel dans le Banat | Heldonica',
    description:
      'Piața Unirii, quartier Fabric, cours intérieures et berges du canal Bega — notre carnet slow travel à Timișoara.',
    images: [`${SITE_URL}/images/destinations/roumanie/IMG_20260827_135023.jpg`],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function TimisoaraPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="roumanie-timisoara"
        title={zones.title || 'Timișoara'}
        country="Roumanie"
        hero_unsplash_url="/images/destinations/roumanie/IMG_20260827_135023.jpg"
        zones={zones}
      />
    )
  }

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html' | 'image',
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

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main className="min-h-screen bg-[#F7F3EC] text-[#241D1A]">
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
                'Aperçu interne du carnet Timișoara enrichi (non indexé tant que la page figure dans unpublished-pages).',
                undefined,
                'span'
              )}
            </span>
          </div>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#1E1916] py-24 md:py-32 border-b border-[#DED5C6]">
          <div className="absolute inset-0 opacity-35">
            {Z(
              'hero_image',
              'image',
              '/images/destinations/roumanie/IMG_20260827_135023.jpg',
              'w-full h-full object-cover'
            )}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-[#D8CFC0] text-[11px] uppercase tracking-[0.22em] mb-4">
              {Z('hero_badge', 'text', 'Roumanie · Banat · 45.7580° N, 21.2290° E', undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-normal text-[#F7F3EC] mb-4 leading-tight">
              {Z('hero_title', 'text', 'Timișoara', undefined, 'span')}
            </h1>
            <p className="text-lg md:text-xl text-[#E2D9C8] max-w-2xl leading-relaxed">
              {Z(
                'hero_description',
                'textarea',
                "Première ville d'Europe à avoir reçu l'éclairage électrique public en 1884, premier foyer de la révolution roumaine de 1989 et carrefour historique du Banat. Une ville de places baroques, de cours intérieures et de tramways jaunes.",
                undefined,
                'span'
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations/roumanie"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A3B32] text-[#F7F3EC] rounded-sm hover:bg-[#3A2D26] transition-colors text-xs uppercase tracking-[0.16em]"
              >
                {Z('hero_btn_guide', 'text', 'Guide Roumanie', undefined, 'span')}
              </Link>
              <Link
                href="/travel-planning"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F7F3EC]/10 text-[#F7F3EC] rounded-sm hover:bg-[#F7F3EC]/20 transition-colors text-xs uppercase tracking-[0.16em] border border-[#F7F3EC]/30"
              >
                {Z('hero_btn_plan', 'text', 'Planifier mon séjour', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb nav */}
        <nav className="bg-[#EFE9DF] border-b border-[#DED5C6] sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 text-xs uppercase tracking-[0.14em] text-[#6E655C] overflow-x-auto no-scrollbar">
            <Link href="/destinations" className="hover:text-[#241D1A] transition-colors whitespace-nowrap">
              {Z('breadcrumb_destinations', 'text', 'Destinations', undefined, 'span')}
            </Link>
            <span>›</span>
            <Link href="/destinations/roumanie" className="hover:text-[#241D1A] transition-colors whitespace-nowrap">
              {Z('breadcrumb_roumanie', 'text', 'Roumanie', undefined, 'span')}
            </Link>
            <span>›</span>
            <span className="text-[#241D1A] whitespace-nowrap">
              {Z('hero_title', 'text', 'Timișoara', undefined, 'span')}
            </span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">
              {Z('intro_kicker', 'text', 'Notre angle', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-normal text-[#241D1A] mb-5">
              {Z('intro_title', 'text', "La ville du Banat qui ne se livre qu'à pied", undefined, 'span')}
            </h2>
            <div className="space-y-4 text-[#4A413A] leading-relaxed">
              <p>
                {Z(
                  'intro_1',
                  'textarea',
                  "Située à l'extrême ouest de la Roumanie, entre la plaine hongroise et la frontière serbe, Timișoara a cette qualité rare des villes d'Europe centrale : elle ne cherche pas à impressionner d'un bloc. Il faut flâner dans le quartier Fabric en fin d'après-midi, s'asseoir sur les pavés de la Piața Unirii avec un espresso matinal et longer les berges ombragées du canal Bega.",
                  undefined,
                  'span'
                )}
              </p>
              <p>
                {Z(
                  'intro_2',
                  'textarea',
                  "Timișoara est roumaine, mais ses façades baroques et Sécession racontent quatre siècles d'influences hongroises, souabes, serbes et autrichiennes. Trois grandes places piétonnes — Unirii, Libertății et Victoriei — structurent le vieux centre, tandis que les anciens faubourgs industriels de Fabric et Iosefin abritent des cours créatives et des ateliers indépendants.",
                  undefined,
                  'span'
                )}
              </p>
            </div>
          </section>

          {/* Pépites grid */}
          <section className="mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">
              {Z('pepites_kicker', 'text', 'Repères de terrain', undefined, 'span')}
            </p>
            <h2 className="text-2xl font-serif font-normal text-[#241D1A] mb-6">
              {Z('pepites_title', 'text', 'Les 6 haltes pour comprendre Timișoara', undefined, 'span')}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#3D5A47]">{Z('pepite_1_icon', 'text', 'Landmark', undefined, 'span')}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">
                    {Z('pepite_1_tag', 'text', 'Place baroque · 45.7580° N, 21.2290° E', undefined, 'span')}
                  </span>
                </div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">
                  {Z('pepite_1_title', 'text', 'Piața Unirii', undefined, 'span')}
                </h3>
                <p className="text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'pepite_1_desc',
                    'textarea',
                    'Vaste quadrilatère baroque où le Dôme catholique Saint-Georges fait face à la cathédrale orthodoxe serbe et au Palais Baroque (musée d’art). Le matin avant 9h30, les façades pastel captent la lumière rasante dans un calme complet.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#3D5A47]">{Z('pepite_2_icon', 'text', 'Palette', undefined, 'span')}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">
                    {Z('pepite_2_tag', 'text', 'Cour intérieure', undefined, 'span')}
                  </span>
                </div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">
                  {Z('pepite_2_title', 'text', "Cuib d'Arte & cours secrètes", undefined, 'span')}
                </h3>
                <p className="text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'pepite_2_desc',
                    'textarea',
                    'Derrière les lourdes portes cochères du centre et du quartier Fabric se cachent des cours intérieures ombragées où se mêlent expositions indépendantes, librairies et cafés sous les arbres.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#3D5A47]">{Z('pepite_3_icon', 'text', 'Building2', undefined, 'span')}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">
                    {Z('pepite_3_tag', 'text', 'Quartier historique', undefined, 'span')}
                  </span>
                </div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">
                  {Z('pepite_3_title', 'text', 'Quartier Fabric & Piața Traian', undefined, 'span')}
                </h3>
                <p className="text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'pepite_3_desc',
                    'textarea',
                    "Ancien faubourg artisanal et industriel relié au centre par le tramway. Autour de la Piața Traian et de la synagogue de Fabric, les palais Sécession aux ferronneries souples témoignent de l'âge d'or austro-hongrois.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#3D5A47]">{Z('pepite_4_icon', 'text', 'Landmark', undefined, 'span')}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">
                    {Z('pepite_4_tag', 'text', 'Mémoire civique', undefined, 'span')}
                  </span>
                </div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">
                  {Z('pepite_4_title', 'text', 'Piața Victoriei & Mémorial de 1989', undefined, 'span')}
                </h3>
                <p className="text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'pepite_4_desc',
                    'textarea',
                    'Grande esplanade piétonne reliant l’Opéra national à la cathédrale métropolitaine aux onze clochers vernissés. À deux pas, le Mémorial de la Révolution documente avec sobriété le soulèvement de décembre 1989.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#3D5A47]">{Z('pepite_5_icon', 'text', 'Trees', undefined, 'span')}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">
                    {Z('pepite_5_tag', 'text', 'Promenade fluviale', undefined, 'span')}
                  </span>
                </div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">
                  {Z('pepite_5_title', 'text', 'Berges du canal Bega & Parcul Rozelor', undefined, 'span')}
                </h3>
                <p className="text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'pepite_5_desc',
                    'textarea',
                    'Le canal Bega traverse Timișoara sous une voûte de saules et de parcs continus. On le longe à pied ou en vaporetto public (ligne STPT à 1 leu) jusqu’au quartier Iosefin.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#3D5A47]">{Z('pepite_6_icon', 'text', 'Martini', undefined, 'span')}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">
                    {Z('pepite_6_tag', 'text', 'Vie locale', undefined, 'span')}
                  </span>
                </div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">
                  {Z('pepite_6_title', 'text', 'Strada Eugeniu de Savoya & Strada Mercy', undefined, 'span')}
                </h3>
                <p className="text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'pepite_6_desc',
                    'textarea',
                    'Deux artères pavées du bastion historique où se succèdent torréfacteurs indépendants, caves à vins du Banat (domaine Recaș) et librairies-cafés.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">
              {Z('pratique_kicker', 'text', 'Côté pratique', undefined, 'span')}
            </p>
            <h2 className="text-2xl font-serif font-normal text-[#241D1A] mb-6">
              {Z('pratique_title', 'text', 'Où poser ses valises et s’attabler', undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-4">
                  {Z('sleep_title', 'text', 'Où dormir selon ton quartier', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-[#5C5349] text-sm">
                  <li>
                    {Z(
                      'sleep_1',
                      'html',
                      '<strong>Autour de Piața Unirii (Cetate)</strong> — Idéal pour tout parcourir à pied dès le matin dans le périmètre piéton historique.',
                      undefined,
                      'span'
                    )}
                  </li>
                  <li>
                    {Z(
                      'sleep_2',
                      'html',
                      '<strong>Rives du canal Bega & Iosefin</strong> — Villas Sécession au calme, à dix minutes de marche de la cathédrale le long des parcs.',
                      undefined,
                      'span'
                    )}
                  </li>
                  <li>
                    {Z(
                      'sleep_3',
                      'html',
                      '<strong>Quartier Fabric</strong> — Appartements dans d’anciens immeubles bourgeois, reliés au centre en cinq minutes par les lignes de tramway 1 et 2.',
                      undefined,
                      'span'
                    )}
                  </li>
                </ul>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-4">
                  {Z('eat_title', 'text', 'Saveurs du Banat & cafés', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-[#5C5349] text-sm">
                  <li>
                    {Z(
                      'eat_1',
                      'html',
                      '<strong>Cuisine du Banat</strong> — Goûte aux <em>sarmale</em> mijotées, aux soupes aigres (<em>ciorbă</em>) et aux pâtisseries d’héritage souabe et hongrois (<em>strudel</em>, <em>găluște cu prune</em>).',
                      undefined,
                      'span'
                    )}
                  </li>
                  <li>
                    {Z(
                      'eat_2',
                      'html',
                      '<strong>Torréfacteurs de Strada Mercy</strong> — Espresso de spécialité servi en terrasse sur les pavés dès 8h00.',
                      undefined,
                      'span'
                    )}
                  </li>
                  <li>
                    {Z(
                      'eat_3',
                      'html',
                      '<strong>Marché de Piața Iosefin & Badea Cârțan</strong> — Étalages paysans de fromages de brebis, miels d’acacia et légumes du Banat.',
                      undefined,
                      'span'
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">
              {Z('faq_kicker', 'text', 'Questions fréquentes', undefined, 'span')}
            </p>
            <div className="space-y-4">
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-serif font-normal text-[#241D1A] cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_1_q', 'text', 'Quelle est la meilleure saison pour découvrir Timișoara ?', undefined, 'span')}
                  <span className="text-[#3D5A47] group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'faq_1_a',
                    'textarea',
                    'Le printemps et le début de l’automne offrent des températures douces pour les parcs du canal Bega. En août 2026, privilégie les visites architecturales avant 11h00 et après 17h30 lorsque les terrasses de la Piața Unirii reprennent vie.',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-serif font-normal text-[#241D1A] cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_2_q', 'text', 'Comment relier Timișoara à la Transylvanie ?', undefined, 'span')}
                  <span className="text-[#3D5A47] group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'faq_2_a',
                    'textarea',
                    'Par la route ou le rail via la vallée du Mureș : compte environ 3h00 jusqu’à Sibiu (avec halte possible au château de Hunedoara ou à la citadelle d’Alba Iulia) et 3h30 jusqu’à Cluj-Napoca.',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-serif font-normal text-[#241D1A] cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_3_q', 'text', 'Combien de jours prévoir sur place ?', undefined, 'span')}
                  <span className="text-[#3D5A47] group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-[#5C5349] text-sm leading-relaxed">
                  {Z(
                    'faq_3_a',
                    'textarea',
                    'Deux à trois nuits permettent d’explorer sans hâte les trois places centrales (Unirii, Libertății, Victoriei), de traverser le quartier Fabric en tramway et de naviguer sur le canal Bega.',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
            </div>
          </section>

          {/* À proximité */}
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">
              {Z('nearby_kicker', 'text', 'Poursuivre la route', undefined, 'span')}
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/destinations/roumanie"
                className="p-4 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] text-center hover:border-[#8C7A6B] transition-colors"
              >
                <span className="text-[#241D1A] font-serif">
                  {Z('nearby_1_title', 'text', 'Roumanie', undefined, 'span')}
                </span>
                <span className="block text-xs text-[#6E655C] mt-1">
                  {Z('nearby_1_sub', 'text', 'Guide complet', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/roumanie/sibiu"
                className="p-4 bg-[#FAF7F2] border border-[#DED5C6] rounded-sm text-center hover:border-[#8C7A6B] transition-colors"
              >
                <span className="text-[#241D1A] font-serif">
                  {Z('nearby_2_title', 'text', 'Sibiu', undefined, 'span')}
                </span>
                <span className="block text-xs text-[#6E655C] mt-1">
                  {Z('nearby_2_sub', 'text', '~3h vers l’est (Transylvanie)', undefined, 'span')}
                </span>
              </Link>
              <Link
                href="/destinations/roumanie/transylvanie"
                className="p-4 bg-[#FAF7F2] border border-[#DED5C6] rounded-sm text-center hover:border-[#8C7A6B] transition-colors"
              >
                <span className="text-[#241D1A] font-serif">
                  {Z('nearby_3_title', 'text', 'Transylvanie', undefined, 'span')}
                </span>
                <span className="block text-xs text-[#6E655C] mt-1">
                  {Z('nearby_3_sub', 'text', 'Villages saxons & Carpates', undefined, 'span')}
                </span>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-[#EFE9DF] border border-[#DED5C6] rounded-sm p-8 text-center mb-8">
            <h3 className="font-serif font-normal text-xl text-[#241D1A] mb-3">
              {Z('cta_title', 'text', 'Un itinéraire Roumanie sur-mesure', undefined, 'span')}
            </h3>
            <p className="text-[#5C5349] text-sm mb-5 max-w-md mx-auto">
              {Z(
                'cta_desc',
                'textarea',
                'Timișoara, Sibiu, villages saxons et Carpates : on conçoit avec toi un itinéraire fluide adapté à ton rythme.',
                undefined,
                'span'
              )}
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A3B32] text-[#F7F3EC] rounded-sm hover:bg-[#3A2D26] transition-colors text-xs uppercase tracking-[0.16em]"
            >
              {Z('cta_btn', 'text', 'Concevoir mon voyage', undefined, 'span')}
            </Link>
          </div>

          <Link
            href="/destinations/roumanie"
            className="text-[#3D5A47] hover:text-[#241D1A] text-xs uppercase tracking-[0.16em] transition-colors"
          >
            {Z('back_link', 'text', '← Guide Roumanie', undefined, 'span')}
          </Link>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
