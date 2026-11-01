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

const PAGE = 'destinations-madere-cabo-girao'

const defaultMetadata: Metadata = {
  title: 'Cabo Girão et Fajã dos Padres : notre carnet slow travel à Madère | Heldonica',
  description:
    'De la falaise marine de 580 mètres de Cabo Girão aux jardins subtropicaux de la Fajã dos Padres et au port de Câmara de Lobos : notre carnet de terrain sur la côte sud de Madère.',
  openGraph: {
    title: 'Cabo Girão et Fajã dos Padres : notre carnet slow travel à Madère | Heldonica',
    description:
      '580 m à pic sur l océan Atlantique, jardins cultivés de la Fajã dos Padres en contrebas et barques colorées de Câmara de Lobos.',
    type: 'website',
    images: ['/images/destinations/madere/itinerary/etape7_cabo_girao_faja.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/cabo-girao',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function CaboGiraoPage({
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
        slug="madere-cabo-girao"
        title={zones.title || 'Cabo-Girao'}
        country="Madère"
        hero_unsplash_url="/images/destinations/madere/itinerary/etape7_cabo_girao_faja.jpg"
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
              '/images/destinations/madere/itinerary/etape7_cabo_girao_faja.jpg',
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
                {Z('hero_badge', 'text', 'Côte Sud · Falaise de 580 m & Fajã', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '32.6567° N, 17.0216° W', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Cabo Girão et Fajã dos Padres : 580 mètres entre le ciel et les vignes de Malvasia'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'Plutôt que de s arrêter dix minutes sur la passerelle vitrée aux heures des cars, on explore Cabo Girão à l aube avant de plonger vers les jardins subtropicaux de la Fajã dos Padres et le port de Câmara de Lobos.'
              )}
            </p>
          </div>
        </section>

        {/* METADATA BAR */}
        <section className="border-b border-[#DED5C6] bg-[#EFE9DF]/70">
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Mountain className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_1_label', 'text', 'Hauteur de falaise')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', '580 m à pic sur l océan')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Créneau calme')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', '8 h 30 – 9 h 30 ou après 18 h')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Accès belvédère')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', '2 € / personne (portique)')}
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
            {Z('intro_kicker', 'text', 'Récit de terrain · Côte sud de Madère')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'Pourquoi la vraie richesse de Cabo Girão se trouve 500 mètres plus bas, au ras des galets'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Avec ses 580 mètres d à-pic volcanique au-dessus de l Atlantique, Cabo Girão figure parmi les plus hautes falaises marines d Europe. Vu depuis la passerelle suspendue au sommet, le dessin géométrique des minuscules parcelles agricoles collées au pied de la paroi — les fajãs — donne immédiatement le vertige."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'Pourtant, entre 10 h et 16 h, le belvédère supérieur de Cabo Girão est l endroit le plus fréquenté de la côte sud : les bus s y succèdent sur le parking et l expérience se résume souvent à une file d attente devant le plancher de verre (entrée tarifée 2 €). Si tu veux ressentir la mesure du lieu, viens dès l ouverture à 8 h 30, quand la lumière rasante de l est éclaire toute la courbe de la baie de Funchal jusqu à Câmara de Lobos.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'Surtout, ne repars pas sans avoir exploré l envers du décor à trois kilomètres à l ouest : la Fajã dos Padres. En descendant le long de la paroi basaltique de 300 mètres jusqu au bord de l eau, on marche sous des treilles de vignes de Malvasia, des avocatiers, des manguiers et des bananiers cultivés en bio sur une étroite langue de galets que seuls le téléphérique ou les bateaux relient au reste de l île.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient autour de Cabo Girão')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus entre falaise, fajã et port de pêche')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-cabo-girao" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'La Fajã dos Padres', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Ancien domaine viticole des jésuites au pied d une falaise de 300 mètres : on y parcourt des allées de manguiers, de bananiers et de vignes historiques face au ressac.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-cabo-girao" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Le port de Câmara de Lobos', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'En contrebas oriental de Cabo Girão, les barques de pêcheurs peintes de couleurs vives (les xavelhas) sèchent sur la grève de galets noirs après la pêche nocturne au sabre noir.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-cabo-girao" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'L aplomb de 580 mètres', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Au lever du jour, la vue porte simultanément sur les terrasses cultivées des Fajãs do Rancho et de Cabo Girão tout en bas et sur l amphithéâtre volcanique de Funchal au loin.',
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
                'Trois étapes entre la falaise de Cabo Girão et les jardins côtiers'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Notre découpage pour profiter du littoral sud-ouest à contre-courant des cars.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/madere/itinerary/etape7_cabo_girao_faja.jpg"
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
                        {Z('step1_tag', 'text', 'Étape 01 · Le belvédère et la fajã')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step1_coords', 'text', '32.6567° N, 17.0216° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step1_title', 'text', 'Cabo Girão à la première heure puis Fajã dos Padres')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Commence par le promontoire de Cabo Girão dès 8 h 30 pour observer dans le calme la paroi basaltique et les terrasses agricoles en contrebas. Poursuis ensuite à cinq minutes vers l ouest jusqu à Quinta Grande pour descendre à la Fajã dos Padres et marcher sous les pergolas de vignes au bord de l océan.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step1_note',
                      'text',
                      'Repère pratique : en bas de la Fajã dos Padres, une petite terrasse au bord des galets sert les fruits du verger (mangues, avocats, bananes) selon la récolte de la semaine.'
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
                    src="/images/destinations/madere/itinerary/etape4_funchal_bananeraies.jpg"
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
                        {Z('step2_tag', 'text', 'Étape 02 · L anse des pêcheurs')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step2_coords', 'text', '32.6465° N, 16.9772° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step2_title', 'text', 'Câmara de Lobos et ses terrasses de bananiers')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'Au pied oriental de Cabo Girão, l anse volcanique de Câmara de Lobos abrite le principal port de pêche au poisson-sabre noir (espada) de l île. En quittant le front de mer par les escaliers qui montent vers l Ilhéu de Câmara de Lobos, on traverse des jardins de bananiers suspendus au-dessus des toits de tuiles.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step2_note',
                      'text',
                      'À goûter sur place : la poncha tradicional préparée au pilon de bois (mexelote) avec du rhum agricole de canne à sucre de Madère, du miel et du jus de citron frais.'
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
                    src="/images/destinations/madere/ponta_do_sol.jpg"
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
                        {Z('step3_tag', 'text', 'Étape 03 · Lumière du soir à 15 min')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step3_coords', 'text', '32.6791° N, 17.1042° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step3_title', 'text', 'Poursuivre vers la jetée de Ponta do Sol au coucher du soleil')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'En suivant la côte sud vers l ouest par Ribeira Brava, tu atteins Ponta do Sol en une quinzaine de minutes. La vieille jetée de basalte du XIXe siècle (Cais da Ponta do Sol) reçoit les derniers rayons du soleil face à la houle atlantique.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step3_note',
                      'text',
                      'Retrouve notre carnet dédié à Ponta do Sol pour prolonger la soirée sur place.'
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
              fallback="Si tu veux voir la falaise de 580 mètres sans la foule du plancher de verre, passe à Cabo Girão dès 8 h 30 ou en fin de journée après 18 h, et consacre le cœur de ta matinée à descendre à la Fajã dos Padres où le nombre de visiteurs reste naturellement limité par la cabine du téléphérique."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Vins de Madère')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'La Fajã dos Padres est le berceau historique du cépage Malvasia Cândida : demande à voir les chais anciens au pied de la falaise.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Accès routier')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'Sortie 1 (Cabo Girão) ou sortie 2 (Quinta Grande / Fajã dos Padres) depuis la voie rapide VR1 à l ouest de Funchal.'
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
