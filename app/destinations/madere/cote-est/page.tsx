import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Wind } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import EditableIcon from '@/components/inline-edit/EditableIcon'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

export const revalidate = 86400

const PAGE = 'destinations-madere-cote-est'

const defaultMetadata: Metadata = {
  title: 'Côte Est de Madère et Ponta de São Lourenço : carnet slow travel | Heldonica',
  description:
    'De la presqu île volcanique de Ponta de São Lourenço aux ruelles côtières de Santa Cruz et aux terrasses de Caniço de Baixo : notre carnet vérifié sur la côte est de Madère.',
  openGraph: {
    title: 'Côte Est de Madère et Ponta de São Lourenço : carnet slow travel | Heldonica',
    description:
      'Presqu île volcanique de Ponta de São Lourenço (PR8), Santa Cruz et Caniço de Baixo dans notre carnet de terrain sur la côte est de Madère.',
    type: 'website',
    images: ['/images/destinations/madere/itinerary/etape1_ponta_lourenco.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/cote-est',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function CoteEstPage({
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
        slug="madere-cote-est"
        title={zones.title || 'Cote-Est'}
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
                <Wind className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Cap Oriental · Presqu île Volcanique & Bourgs Côtiers', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '32.7437° N, 16.7164° W', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Côte Est de Madère : des crêtes arides de São Lourenço aux ruelles de Santa Cruz'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'Face aux alizés de l Atlantique, l extrémité orientale de Madère abandonne la forêt de lauriers pour des falaises de basalte striées d ocre et de rouge, avant de retrouver la douceur des bourgs maritimes de Machico, Santa Cruz et Caniço.'
              )}
            </p>
          </div>
        </section>

        {/* METADATA BAR */}
        <section className="border-b border-[#DED5C6] bg-[#EFE9DF]/70">
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_1_label', 'text', 'Sentier PR8')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', '7,2 km A/R · ~3 h de marche')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Départ conseillé')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', 'Dès l aube (7 h 30 – 8 h)')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Taxe sentier PR8')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', '3 € IFCN (Simplifica)')}
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
            {Z('intro_kicker', 'text', 'Récit de terrain · Cap oriental de Madère')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'Un autre visage de Madère : quand l île-jardin cède la place au basalte nu et aux bourgs tranquilles'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Beaucoup de visiteurs ne voient de la côte est que le ruban de la piste d atterrissage posée sur pilotis à Santa Cruz avant de filer vers Funchal. C est pourtant sur ce flanc oriental, entre les bourgs anciens de Machico, Caniçal et la longue échine rocheuse de Ponta de São Lourenço, que la géologie volcanique de Madère se lit le plus clairement."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'Au-delà de Caniçal, le relief s abaisse brusquement et n accroche plus les nuages : privée d arbres, la presqu île de Ponta de São Lourenço (sentier PR8) déroule sur plusieurs kilomètres une crête étroite où l on voit simultanément la houle agitée de la côte nord à gauche et les eaux abritées de la côte sud à droite, avec les îles Desertas qui se découpent à l horizon.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'Après le vent et la minéralité du cap, le retour vers Santa Cruz et les terrasses en gradins de Caniço de Baixo offre un contrepoint paisible : ruelles pavées de calçada, places ombragées de platanes face aux galets et maisons tournées vers le large qui ont servi de camp de base à notre séjour.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de la Côte Est')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus entre cap volcanique et villages côtiers')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-cote-est" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'La crête de São Lourenço', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Une presqu île volcanique semi-aride aux strates de basalte noir, d ocre et de tuf rouge, sculptée par les alizés et bordée par les deux versants de l Atlantique.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-cote-est" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Le front de mer de Santa Cruz', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'L une des plus anciennes communes de l île (fondée en 1515), avec son église manuéline São Salvador, ses ruelles pavées et sa promenade de palmiers au ras des galets.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-cote-est" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'Les gradins de Caniço de Baixo', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Un versant calme tourné vers les îles Desertas et la réserve marine de Garajau, idéal comme point d attache pour rayonner sur toute l île sans subir la circulation urbaine.',
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
                'Trois étapes vérifiées sur la côte orientale de Madère'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Notre itinéraire photographié entre la pointe de São Lourenço, Santa Cruz et Caniço.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/madere/itinerary/etape1_ponta_lourenco.jpg"
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
                        {Z('step1_tag', 'text', 'Étape 01 · Aube sur le sentier PR8')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step1_coords', 'text', '32.7437° N, 16.7164° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step1_title', 'text', 'Marcher sur la presqu île de Ponta de São Lourenço au lever du jour')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Le sentier PR8 (7,2 km aller-retour jusqu au belvédère du Morro do Furado au-dessus de la Casa do Sardinha) ne comporte aucun arbre pour faire de l ombre. En partant dès 7 h 30 du parking de Baía d Abra, la lumière dorée du levant embrase les couches de basalte et de tuf volcanique, et le parking est encore fluide.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step1_note',
                      'text',
                      'Option retour : si le vent se lève fort à l aller, de petits bateaux-taxis assurent la liaison entre le ponton de Cais do Sardinha et la marina de Quinta do Lorde.'
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
                    src="/images/destinations/madere/itinerary/etape6_santa_cruz_ruelles.jpg"
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
                        {Z('step2_tag', 'text', 'Étape 02 · Halte maritime')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step2_coords', 'text', '32.6881° N, 16.7915° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step2_title', 'text', 'Les ruelles pavées et la promenade côtière de Santa Cruz')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'De retour de la presqu île, arrête-toi dans le vieux bourg de Santa Cruz. Autour de la Praça Dr. João Abel de Freitas et de l église Matriz aux portails de pierre volcanique grise (cantaria), les cafés servent la bica (expresso court) à l ombre des arbres avant d ouvrir sur la plage de galets.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step2_note',
                      'text',
                      'Idéal aussi pour la dernière demi-journée du voyage : le centre piéton de Santa Cruz est à cinq minutes de la dépose des voitures de location.'
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
                    src="/images/destinations/madere/itinerary/etape2_canico_terrasses.jpg"
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
                        {Z('step3_tag', 'text', 'Étape 03 · Fin de journée face aux Desertas')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step3_coords', 'text', '32.6436° N, 16.8319° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step3_title', 'text', 'Les terrasses de Caniço de Baixo et le promontoire du Garajau')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'Entre Santa Cruz et Funchal, le versant de Caniço de Baixo descend en terrasses fleuries jusqu à l océan. Tout près, la pointe du Cristo Rei au Garajau domine la première réserve marine sous-marine créée au Portugal en 1986 et regarde le soleil décliner derrière la baie de Funchal.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step3_note',
                      'text',
                      'En contrebas de la falaise du Garajau, un petit téléphérique descend jusqu à une plage de galets aux eaux claires très appréciée des plongeurs avec masque et tuba.'
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
              fallback="Sur le sentier PR8 de Ponta de São Lourenço, n oublie pas de régler la redevance environnementale de 3 € sur le portail régional Simplifica la veille, et ajoute avant de reprendre la route le court détour de cinq minutes jusqu au Miradouro da Ponta do Rosto : la vue sur les falaises striées de rouge et la mer du Nord y est saisissante."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Équipement PR8')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'Chaussures crantées (marches rocheuses parfois glissantes), chapeau qui tient au vent et au moins 1,5 L d eau par personne.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Baignade abritée')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'À Cais do Sardinha (au bout du PR8) ou à la Prainha de Caniçal, une anse naturelle de sable volcanique cuivré abritée de la houle du nord.'
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
