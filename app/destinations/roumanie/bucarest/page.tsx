import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Trees } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import EditableIcon from '@/components/inline-edit/EditableIcon'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'

export const revalidate = 86400

const PAGE = 'destinations-roumanie-bucarest'

const defaultMetadata: Metadata = {
  title: 'Bucarest en slow travel : jardins secrets, cloîtres et delta urbain | Heldonica',
  description:
    'Explorer Bucarest autrement : du cloître caché de Schitu Dârvari aux 184 hectares sauvages du delta de Văcărești et aux villas arborées de Cotroceni.',
  openGraph: {
    title: 'Bucarest en slow travel : jardins secrets, cloîtres et delta urbain | Heldonica',
    description:
      'Cloîtres orthodoxes discrets, delta naturel de Văcărești et ruelles ombragées dans notre carnet de terrain à Bucarest.',
    type: 'website',
    images: [
      'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135618.jpg',
    ],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/bucarest',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function BucarestPage() {
  const zones = await getPageZones(PAGE)

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

      <main className="min-h-screen bg-[#F5F0E8] text-[#2C2416]">
        {/* HERO SECTION */}
        <section className="relative h-[68vh] min-h-[480px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            {Z(
              'hero_image',
              'image',
              '/images/destinations/roumanie/IMG_20260827_135618.jpg',
              'w-full h-full object-cover object-center'
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1610]/90 via-[#1A1610]/40 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
            <Link
              href="/destinations/roumanie"
              className="inline-flex items-center gap-2 text-[#F5F0E8]/80 hover:text-[#F5F0E8] text-xs uppercase tracking-[0.2em] mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('back_to_parent', 'text', 'Retour au carnet Roumanie', undefined, 'span')}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#8B6E32]/90 text-[#F5F0E8] text-[11px] uppercase tracking-[0.18em]">
                <Trees className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Valachie · Cloîtres Cachés & Delta Urbain', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '44.4268° N, 26.1025° E', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Bucarest à pas lents : cours monastiques, façades Belle Époque et roseaux de Văcărești'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'Derrière ses grands boulevards contrastés, la capitale roumaine cache un réseau de cours d églises brâncovènes, de passages vitrés et d étangs sauvages que l on ne découvre qu en marchant hors des axes bruyants.'
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
                  {Z('meta_1_label', 'text', 'Rythme conseillé')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', '2 à 3 jours à pied')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Trees className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Parc naturel urbain')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', '184 ha (Delta Văcărești)')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Quartiers calmes')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', 'Cotroceni, Icoanei, Filaret')}
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
                  {Z('meta_4_value', 'text', 'Août 2026 · Duo Heldonica')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO & RECIT DE TERRAIN */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8B6E32] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {Z('intro_kicker', 'text', 'Récit de terrain · Capitale de la Roumanie')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'Comment apprivoiser le contraste de Bucarest en passant par ses jardins intérieurs'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Au premier regard, Bucarest déroute par le heurt brutal de ses époques : en l espace de deux pâtés de maisons, une église orthodoxe à colonnades sculptées du XVIIIe siècle côtoie un hôtel particulier francophile de 1900 et une barre de béton monumentaliste des années 1980."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'Si l on reste sur les artères principales ou dans les seules rues de bars de Lipscani le soir venu, la ville peut sembler bruyante et épuisante. Mais il suffit de pousser un portail en bois vers une cour monastique comme celle de Stavropoleos ou de Schitu Dârvari pour que le tumulte s efface d un coup sous les tilleuls et les vignes grimpantes.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'C est cette lecture par les contre-allées que l on a suivie lors de notre passage fin août 2026 : relier les jardins historiques de Cișmigiu aux villas ombragées de Cotroceni, grimper l escalier de la rue Xenofon jusqu au parc Carol Ier, puis finir au coucher du soleil devant les 184 hectares de roseaux sauvages du delta urbain de Văcărești.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de Bucarest')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus loin du bruit des boulevards')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-bucarest" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'Le Delta de Văcărești', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Ancien chantier hydraulique inachevé que la nature a intégralement reconquis : 184 hectares de zones humides, de saules et d oiseaux aquatiques en plein sud-est de la ville.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-bucarest" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Le cloître de Schitu Dârvari', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'Fondé en 1834 dans le quartier d Icoanei, ce petit ermitage entouré de hauts murs blancs abrite un jardin fleuri et des fresques intérieures d une grande finesse.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-bucarest" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'La colline de Filaret et Xenofon', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Seule rue entièrement en escaliers de Bucarest, la Strada Xenofon grimpe vers le point culminant du parc Carol Ier et ses allées ombragées du début du XXe siècle.',
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
                'Trois étapes à pied pour traverser le Bucarest vert et historique'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Relevés et photographies réalisés lors de notre passage à Bucarest en août 2026.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/roumanie/IMG_20260827_135023.jpg"
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
                        {Z('step1_tag', 'text', 'Étape 01 · Matinée dans le vieux centre')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step1_coords', 'text', '44.4321° N, 26.0982° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step1_title', 'text', 'Stavropoleos, le passage Macca-Vilacrosse et les jardins de Cișmigiu')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Commence avant 9 h dans le quartier historique de Lipscani, lorsque les terrasses sont encore repliées. Le cloître sculpté en pierre de l église Stavropoleos (1724) et la verrière jaune du passage Macca-Vilacrosse se visitent alors dans un calme complet avant de rejoindre à pied les grands arbres et le lac du jardin de Cișmigiu.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step1_note',
                      'text',
                      'Halte lecture : sur la Strada Lipscani, la librairie Cărturești Carusel occupe un ancien édifice bancaire de 1903 restauré sur six niveaux lumineux.'
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
                    src="/images/destinations/roumanie/IMG_20260827_135025.jpg"
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
                        {Z('step2_tag', 'text', 'Étape 02 · Milieu de journée à l ombre')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step2_coords', 'text', '44.4426° N, 26.1059° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step2_title', 'text', 'Les villas d Icoanei, Schitu Dârvari et le quartier de Cotroceni')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'En quittant l agitation de Piața Romană vers le jardin Gradina Icoanei, les rues s apaisent immédiatement. Pousse la porte en bois du monastère de Schitu Dârvari (Strada Schitu Dârvari 3) pour t asseoir quelques minutes dans sa cour fleurie, ou traverse la Dâmbovița vers les rues bordées de tilleuls et de maisons néo-roumaines de Cotroceni.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step2_note',
                      'text',
                      'Pause café : les salons de thé installés dans les jardins des villas de Cotroceni (autour de la Strada Doctor Lister) sont parfaits aux heures chaudes de l après-midi.'
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
                    src="/images/destinations/roumanie/IMG_20260827_135834.jpg"
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
                        {Z('step3_tag', 'text', 'Étape 03 · Fin d après-midi sauvage')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step3_coords', 'text', '44.4005° N, 26.1353° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step3_title', 'text', 'Marcher sur la digue du parc naturel de Văcărești au couchant')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'À quatre kilomètres au sud-est de la place Unirii, une digue circulaire en béton entoure une cuvette de 184 hectares où devait naître un lac artificiel à la fin des années 1980. Abandonné après 1989, le bassin s est transformé spontanément en zone humide protégée où nichent hérons, cormorans et tortues d eau douce.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step3_note',
                      'text',
                      'Accès : métro Piața Sudului ou Mihai Bravu, puis dix minutes à pied jusqu aux sentiers balisés de la digue (entrée libre).'
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
              fallback="Explore le centre historique de Lipscani entre 8 h et 10 h 30 pour l architecture des cours et des passages, mais déjeune et passe tes soirées dans les quartiers résidentiels arborés de Cotroceni, Dorobanți ou Icoanei où vivent réellement les Bucarestois."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Liaisons vers la Transylvanie')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'Depuis la Gara de Nord de Bucarest, les trains directs rejoignent Sinaia en 1 h 30 et Brașov en 2 h 30 à travers la vallée de la Prahova.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Transports urbains')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'Le métro de Bucarest (Metrorex) accepte directement le paiement sans contact par carte bancaire aux portiques de chaque station.'
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DED5C6] pt-8">
            <Link
              href="/destinations/roumanie"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#2C2416] hover:text-[#8B6E32] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('footer_back_link', 'text', 'Voir tout le carnet Roumanie', undefined, 'span')}
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#2C2416] text-[#F5F0E8] hover:bg-[#3E3321] text-xs uppercase tracking-[0.18em] transition-colors"
            >
              {Z('footer_cta_services', 'text', 'Construire ton itinéraire en Roumanie', undefined, 'span')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  )
}
