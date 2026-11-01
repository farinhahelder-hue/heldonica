import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Waves } from 'lucide-react'
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

const PAGE = 'destinations-madere-porto-moniz'

const defaultMetadata: Metadata = {
  title: 'Porto Moniz slow travel : vasques volcaniques de Madère | Heldonica',
  description:
    'Notre carnet de terrain à Porto Moniz sur la pointe nord-ouest de Madère : vasques naturelles de basalte noir près du fort de São João Baptista, houle atlantique et route côtière de Seixal.',
  openGraph: {
    title: 'Porto Moniz slow travel : vasques volcaniques de Madère | Heldonica',
    description:
      'Baignade dans les vasques de lave noire à Porto Moniz, houle atlantique et repères slow travel sur la côte nord de Madère.',
    type: 'website',
    images: ['/images/destinations/madere/porto_moniz.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/porto-moniz',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function PortoMonizPage({
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
        slug="madere-porto-moniz"
        title={zones.title || 'Porto-Moniz'}
        country="Madère"
        hero_unsplash_url="/images/destinations/madere/porto_moniz.jpg"
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
              '/images/destinations/madere/porto_moniz.jpg',
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
                <Waves className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Pointe Nord-Ouest · Vasques de Lave', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '32.8668° N, 17.1667° W', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Porto Moniz : le fracas de l Atlantique dans la roche volcanique noire'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'À l extrémité nord-ouest de Madère, les coulées de lave refroidies au contact de l océan ont façonné un labyrinthe de bassins naturels que chaque marée haute remplit d une eau claire et vive.'
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
                  {Z('meta_1_value', 'text', 'Avant 10 h ou après 16 h 30')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Waves className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Vasques naturelles')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', 'Accès libre (côté Fort)')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Bassin aménagé')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', '3 € / personne (vestiaires)')}
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
            {Z('intro_kicker', 'text', 'Récit de terrain · Pointe nord-ouest')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'Deux visages à Porto Moniz : les bassins lissés à l ouest, les aiguilles de basalte brut à l est'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Porto Moniz occupe un promontoire de lave à la pointe nord-ouest de Madère, là où la houle du large vient se briser de plein fouet contre la roche volcanique noire. En arrivant par la route côtière depuis Seixal ou en redescendant du plateau de Paúl da Serra, on découvre d en haut l écume blanche qui dessine les contours des vasques naturelles."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'Sur place, il faut distinguer deux ensembles bien différents. À l ouest du front de mer, les Piscinas Naturais aménagées (entrée autour de 3 €) ont été légèrement maçonnées sur leur pourtour pour offrir des margelles planes, un poste de surveillance et des vestiaires. L eau de mer y est renouvelée en permanence par les vagues qui passent par-dessus le mur de basalte.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'Mais c est à l autre bout de la promenade maritime, juste au pied du fort de São João Baptista et face à l îlot volcanique de l Ilhéu Mole, que l on a trouvé ce que l on cherchait : les Piscinas Naturais do Cachalote. Ici, la lave n a pas été rabotée. Des arches de basalte noir, des aiguilles rocheuses et des bassins profonds en accès libre reçoivent directement les gerbes de l Atlantique.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de Porto Moniz')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus sur le littoral nord-ouest')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-porto-moniz" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'Les vasques du Cachalote', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Situées près du port et du rocher du Cachalote, ces vasques volcaniques non bétonnées restent en accès libre toute l année et conservent le dessin brut des coulées de basalte.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-porto-moniz" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Le Fort de São João Baptista', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'Érigé en 1730 en pierres basaltiques sombres pour défendre la rade contre les incursions de corsaires, ce petit fortin veille sur les bassins orientaux et l îlot de l Ilhéu Mole.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-porto-moniz" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'La corniche de Seixal', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'À dix minutes à l est de Porto Moniz, la plage de sable noir volcanique du port de Seixal s ouvre au pied de falaises vertes d où tombent de fines cascades directement dans la mer.',
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
                'Une journée sur la côte nord-ouest : de Seixal aux vasques de Porto Moniz'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Trois haltes complémentaires pour éviter la foule de la mi-journée sur le front de mer.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
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
                        {Z('step1_tag', 'text', 'Étape 01 · Matinée au bord de l eau')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step1_coords', 'text', '32.8668° N, 17.1667° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step1_title', 'text', 'Les vasques volcaniques de Porto Moniz avant les cars')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'En arrivant vers 9 h, le soleil du matin éclaire déjà les pointes de basalte noir tandis que les cars d excursion venus de Funchal sont encore sur la route. Le contraste entre la pierre volcanique sombre qui accumule la chaleur et l eau atlantique limpide est saisissant.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step1_note',
                      'text',
                      'Repère marée : à marée haute par houle modérée, les vagues passent par-dessus les digues naturelles de lave ; par forte houle du nord, reste sur les passerelles hautes.'
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
                    src="/images/destinations/madere/fanal_foret.jpg"
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
                        {Z('step2_tag', 'text', 'Étape 02 · À 15 minutes sur le plateau')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step2_coords', 'text', '32.8091° N, 17.1408° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step2_title', 'text', 'Monter vers la forêt primaire de Fanal à la mi-journée')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'Lorsque le front de mer de Porto Moniz se remplit entre midi et 15 h, la route ER209 permet de grimper en un quart d heure à 1 150 mètres d altitude jusqu au plateau de Fanal. On quitte le bruit du ressac pour le silence feutré des lauriers centenaires couverts de mousse et de lichens.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step2_note',
                      'text',
                      'Équipement : prévois toujours un coupe-vent dans le coffre, l écart thermique entre les vasques de Porto Moniz et Fanal dépasse souvent 8 °C.'
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
                    src="/images/destinations/madere/achadas_da_cruz.jpg"
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
                        {Z('step3_tag', 'text', 'Étape 03 · Fin d après-midi sur la falaise')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step3_coords', 'text', '32.8453° N, 17.2064° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step3_title', 'text', 'Le promontoire d Achadas da Cruz au couchant')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'À dix minutes de route au sud-ouest de Porto Moniz, la falaise d Achadas da Cruz regarde plein ouest. Même après la fermeture du téléphérique de la fajã en fin d après-midi, le belvédère haut offre une vue plongeante de 450 mètres sur les jardins côtiers et l océan doré par le soir.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step3_note',
                      'text',
                      'Si tu veux descendre dans la fajã, passe à Achadas da Cruz avant 16 h (horaires : 8 h – 11 h 30 et 12 h 30 – 17 h, 3 € A/R).'
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
              fallback="Privilégie les vasques naturelles gratuites du Cachalote (près du fort de São João Baptista) tôt le matin pour le côté brut des arches de basalte, et combine ta matinée avec la plage de sable noir de Seixal à dix minutes vers l est avant que les cars n arrivent sur la côte nord."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Dans le sac')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'Chaussons d eau recommandés : le basalte volcanique des vasques non aménagées est rugueux sous le pied.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Météo côtière')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'Vérifie la webcam en direct de Porto Moniz avant de quitter le sud : la côte nord a son propre régime de nuages et de houle.'
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
