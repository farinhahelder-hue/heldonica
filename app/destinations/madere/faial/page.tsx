import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Mountain } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import EditableIcon from '@/components/inline-edit/EditableIcon'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

export const revalidate = 3600

const PAGE = 'destinations-madere-faial'

const defaultMetadata: Metadata = {
  title: 'Faial à Madère en couple : notre carnet slow travel | Heldonica',
  description:
    'Notre carnet de terrain à Faial sur la côte nord-est de Madère : piton basaltique du Penha d Águia (590 m), fin de randonnée après la Levada do Caldeirão Verde, poncha et miel de canne chez l artisan du village.',
  openGraph: {
    title: 'Faial à Madère en couple : notre carnet slow travel | Heldonica',
    description:
      'Sous le rocher du Penha d Águia à Faial : rencontre au café du village autour du miel de canne et belvédère du Guindaste sur l Atlantique.',
    type: 'website',
    images: ['/images/destinations/madere/itinerary/etape1_ponta_lourenco.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/faial',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function FaialPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string }>
}) {
  const sp = searchParams ? await searchParams : {}
  const isDraftPreview = sp?.preview === 'draft' || sp?.preview === 'true'
  const zones = await getPageZones(PAGE)
  const published = !isUnpublishedCmsPage(PAGE)

  if (!published && !isDraftPreview) {
    return (
      <ComingSoonDestination
        slug="madere-faial"
        title={zones.title || 'Faial'}
        country="Madère"
        hero_unsplash_url="/images/destinations/madere/itinerary/etape1_ponta_lourenco.jpg"
        zones={zones}
      />
    )
  }

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html' | 'image' = 'text',
    fallback: string = '',
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

      {isDraftPreview && !published && (
        <div className="bg-[#2C2416] text-[#F5F0E8] text-xs py-2.5 px-4 text-center border-b border-[#8B6E32]/40">
          {Z(
            'draft_preview_banner',
            'text',
            'Mode prévisualisation brouillon — Cette sous-destination est en cours de préparation éditoriale.'
          )}
        </div>
      )}

      <main className="min-h-screen bg-[#F5F0E8] text-[#2C2416]">
        {/* HERO SECTION */}
        <section className="relative h-[68vh] min-h-[480px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            {Z(
              'hero_image',
              'image',
              '/images/destinations/madere/itinerary/etape1_ponta_lourenco.jpg',
              'w-full h-full object-cover object-center'
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1610]/90 via-[#1A1610]/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
            <Link
              href="/destinations/madere"
              className="inline-flex items-center gap-2 text-[#F5F0E8]/80 hover:text-[#F5F0E8] text-xs uppercase tracking-[0.2em] mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('back_to_parent', 'text', 'Retour au carnet Madère', undefined, 'span')}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#8B6E32]/90 text-[#F5F0E8] text-[11px] uppercase tracking-[0.18em]">
                <Mountain className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Côte Nord-Est · Penha d Águia & Miel de Canne', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '32.7885° N, 16.8522° W', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Faial : un verre de poncha dans les nuages face au Penha d Águia'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'Entre les vallées encaissées de Santana et le piton basaltique de 590 mètres qui garde l océan, Faial est le village où l on s arrête après la marche pour écouter les anciens raconter le miel de canne.'
              )}
            </p>
          </div>
        </section>

        {/* METADATA BAR */}
        <section className="border-b border-[#DED5C6] bg-[#EFE9DF]/70">
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_1_label', 'text', 'Moment idéal')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', 'Aube au Guindaste · Midi au village')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Mountain className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Penha d Águia')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', '590 m d altitude · Sentier escarpé')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Depuis Ribeiro Frio')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', '15 min par la route ER103')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_4_label', 'text', 'Terrain vérifié')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_4_value', 'text', 'Octobre 2024 · Duo Heldonica')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO & RECIT DE TERRAIN */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8B6E32] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {Z('intro_kicker', 'text', 'Récit de terrain · Commune de Santana (Nord-Est)')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'C est à Faial qu on l a compris : à Madère, on ne voyage pas pour les monuments, mais pour les rencontres'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Au débouché de la profonde Ribeira da Metade et de la Ribeira Seca, Faial s étire en terrasses entre les nuages de la montagne centrale et le fracas de la côte nord-est. Son horizon est barré par un monolithe volcanique que l on reconnaît de loin : le Penha d Águia (« le Rocher de l Aigle »), qui dresse sa muraille verticale de 590 mètres entre Faial et Porto da Cruz."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'On est arrivés à Faial en redescendant de la Levada do Caldeirão Verde, les chaussures encore humides de l eau des canaux. En s asseyant au petit café du bas pour commander un verre de poncha fraîchement pressée face à la vallée, un ancien du village est venu discuter à notre table. Il nous a expliqué comment il cultivait sa canne à sucre sur les parcelles en pente et comment il faisait réduire son propre miel de canne (mel de cana).',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'C est exactement dans cette halte imprévue, entre les brumes qui couraient sur les crêtes de Santana et l odeur d agrumes du comptoir, que le rythme du nord-est de Madère nous a happés : un territoire agricole, fier et hospitalier, loin des grands hôtels de la côte sud.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de Faial')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus entre vallée et océan')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-faial" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'La poncha au miel de canne', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Au café du village après la marche dans les levadas, l artisan presse ses citrons minute et utilise le mel de cana sombre issu des terrasses voisines.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-faial" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Le belvédère du Guindaste', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'À l embouchure de la Ribeira do Faial, deux passerelles vitrées s avancent au-dessus des galets noirs avec une vue directe sur la côte nord jusqu à la pointe de São Lourenço.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-faial" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'Le rocher du Penha d Águia', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Ce bloc basaltique isolé de 590 mètres sépare Faial de Porto da Cruz ; son sentier forestier raide récompense les marcheurs par un panorama complet sur le nord-est.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ITINERAIRE SECTION */}
        <section className="max-w-4xl mx-auto px-6 py-14">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8B6E32] font-semibold">
              {Z('itinerary_label', 'text', 'Parcours Pas à Pas')}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal mt-1">
              {Z(
                'itinerary_title',
                'text',
                'Une journée autour de Faial : de la Levada do Caldeirão Verde à l océan'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Notre boucle vécue entre les gorges de Santana et le littoral basaltique de Faial.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/madere/fanal_foret.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                        {Z('step1_tag', 'text', 'Étape 01 · Mardi matin dès l aube')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step1_coords', 'text', '32.7836° N, 16.9061° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step1_title', 'text', 'Le tunnel végétal de la Levada do Caldeirão Verde (PR9)')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'À quinze minutes au-dessus de Faial par Santana, le parc forestier de Queimadas marque le départ de la Levada do Caldeirão Verde. En partant tôt un mardi matin, on a marché seuls dans ce couloir de verdure taillé dans la falaise, traversant quatre tunnels rocheux jusqu au cirque basaltique où tombe la cascade.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step1_note',
                      'text',
                      'Conseil terrain : commence la marche à la première heure du jour ; à partir de 10 h 30, les croisements le long du parapet étroit ralentissent fortement la progression.'
                    )}
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 2 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px] md:order-2">
                  <Image
                    src="/images/destinations/madere/itinerary/etape1_ponta_lourenco.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                        {Z('step2_tag', 'text', 'Étape 02 · Retour de marche au village')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step2_coords', 'text', '32.7885° N, 16.8522° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step2_title', 'text', 'Pause poncha et miel de canne à Faial')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'En redescendant vers Faial en milieu de journée, arrête-toi dans l un des petits cafés de bord de route qui dominent la vallée. C est là que l on a pris le temps d échanger avec les habitants autour d un verre de poncha battue minute et d apprendre comment la canne à sucre coupée à la machette au printemps devient ce sirop sombre et parfumé.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step2_note',
                      'text',
                      'À goûter aussi : le bolo de mel de Madeira, gâteau dense aux épices et au miel de canne qui se conserve des mois et se rompt uniquement à la main.'
                    )}
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 3 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/madere/porto_moniz.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                        {Z('step3_tag', 'text', 'Étape 03 · Bord d océan au Guindaste')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step3_coords', 'text', '32.7928° N, 16.8492° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step3_title', 'text', 'Le Miradouro do Guindaste et le bassin maritime de Faial')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'Termine au niveau de la mer entre la plage endiguée de la Praia do Faial, juste au pied du Penha d Águia, et le promontoire du Guindaste. D ici, le regard embrasse toute la façade nord-est de Madère jusqu aux falaises ocres de la Ponta de São Lourenço.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step3_note',
                      'text',
                      'Accès libre et parking gratuit juste derrière le belvédère du Guindaste.'
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* CONSEIL LOCAL (LEGACY CMS ZONES local_tip & local_tip_kicker) */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <div className="bg-[#2C2416] text-[#F5F0E8] rounded-sm p-8 sm:p-10 border border-[#8B6E32]/40">
            <div className="flex items-center gap-2 text-[#C49A45] text-xs uppercase tracking-[0.2em] mb-3">
              <Compass className="w-4 h-4" />
              {Z('local_tip_kicker', 'text', 'Le conseil de terrain Heldonica', undefined, 'span')}
            </div>
            <EditableZone
              page={PAGE}
              zone="local_tip"
              type="textarea"
              as="p"
              className="font-serif text-lg sm:text-xl text-[#F5F0E8] leading-relaxed mb-6"
              fallback="Après une matinée sur la Levada do Caldeirão Verde ou la Levada do Furado, évite les restaurants touristiques autour des maisons à toit de chaume du centre de Santana : descends plutôt à Faial ou à Porto da Cruz pour t attabler dans un café de village face au Penha d Águia."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Randonnée Penha d Águia')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'Le sentier vers le sommet du Penha d Águia (environ 2 h 30 A/R, 400 m D+) est raide et terreux : à n entreprendre que par temps sec.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Route panoramique')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'Pour remonter vers le sud, emprunte l ancienne route qui grimpe de Faial au col de Portela plutôt que le tunnel rapide.'
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DED5C6] pt-8">
            <Link
              href="/destinations/madere"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#2C2416] hover:text-[#8B6E32] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('footer_back_link', 'text', 'Voir tout le carnet Madère', undefined, 'span')}
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#2C2416] text-[#F5F0E8] hover:bg-[#3E3321] text-xs uppercase tracking-[0.18em] transition-colors"
            >
              {Z('footer_cta_services', 'text', 'Construire ton itinéraire à Madère', undefined, 'span')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  )
}
