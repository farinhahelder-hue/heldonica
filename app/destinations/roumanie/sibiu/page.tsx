import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Eye } from 'lucide-react'
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

const PAGE = 'destinations-roumanie-sibiu'

const defaultMetadata: Metadata = {
  title: 'Sibiu en slow travel : lucarnes de toits, passages d escaliers et Mărginimea | Heldonica',
  description:
    'Explorer Sibiu et ses environs en Transylvanie : Piața Mare et Piața Mică au matin, escaliers de la Ville Basse, musée en plein air ASTRA et villages pastoraux de Mărginimea Sibiului.',
  openGraph: {
    title: 'Sibiu en slow travel : lucarnes de toits, passages d escaliers et Mărginimea | Heldonica',
    description:
      'Lucarnes en forme d yeux, passages voûtés de la Ville Basse et vergers des villages de Mărginimea Sibiului.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/sibiu',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function SibiuPage({
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
        slug="roumanie-sibiu"
        title={zones.title || 'Sibiu'}
        country="Roumanie"
        hero_unsplash_url="/og-default.jpg"
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
        <section className="relative h-[64vh] min-h-[440px] flex items-end overflow-hidden bg-[#1E1916]">
          <div className="absolute inset-0">
            {Z(
              'hero_image',
              'image',
              '/og-default.jpg',
              'w-full h-full object-cover object-center opacity-45'
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1610]/95 via-[#1A1610]/50 to-transparent" />
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
                <Eye className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Transylvanie du Sud · Hermannstadt & Villages Saxons', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '45.7983° N, 24.1256° E', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Sibiu : sous le regard des lucarnes de tuiles, entre Ville Haute et campagnes saxonnes'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'Fondée au XIIe siècle par les colons saxons sous le nom d Hermannstadt, Sibiu articule trois places reliées par des passages voûtés et constitue le point de départ naturel vers les vallées de Biertan et des monts Făgăraș.'
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
                  {Z('meta_1_label', 'text', 'Durée idéale')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', '2 jours + boucle saxonne')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Trois places')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', 'Piața Mare, Mică & Huet')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Parc ASTRA')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', '10 km de sentiers boisés')}
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
            {Z('intro_kicker', 'text', 'Récit de terrain · Cité des guildes saxonnes')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'Passer sous les arches de Sibiu : quand la Ville Haute bascule vers les ateliers de la Ville Basse'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Ce qui frappe d abord en levant les yeux à Sibiu, ce sont les centaines de lucarnes étirées en amande sur les toits de tuiles brunes — les « yeux de la ville », conçus autrefois pour ventiler les greniers à grains et à provisions des marchands saxons."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'La ville historique se lit sur deux niveaux. En haut (Orașul de Sus), trois places communiquent par des passages voûtés : la vaste Piața Mare bordée par le palais Brukenthal, la Piața Mică en arc de cercle traversée par le Pont des Mensonges en fonte (1859), et la calme Piața Huet resserrée autour de la cathédrale évangélique luthérienne dont la flèche domine toute la plaine du Cibin.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'Mais c est en franchissant le Passage des Escaliers (Pasajul Scărilor), soutenu par des arcs-boutants en brique du XIIIe siècle, que le rythme ralentit vraiment : la Ville Basse (Orașul de Jos) déroule des places herbeuses comme la Piața Aurarilor (place des Orfèvres) où presque aucun groupe ne descend.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de Sibiu')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus entre architecture saxonne et vallées pastorales')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-sibiu" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'Le Passage des Escaliers & la Ville Basse', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Des volées de marches sous des arches de brique médiévales qui relient la Piața Huet aux ruelles d artisans et à la place des Orfèvres en contrebas.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-sibiu" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'La forêt de Dumbrava (Musée ASTRA)', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'Au sud de la ville, un parc forestier de 96 hectares autour d un lac où ont été démontés et reconstruits plus de 300 moulins à eau, églises en bois et fermes de toute la Roumanie.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-sibiu" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'Les vergers de Cisnădioara et Biertan', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Autour de Sibiu, les collines mènent à la basilique romane perchée de Cisnădioara et aux chemins de terre reliant les églises fortifiées de la vallée de la Târnava.',
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
                'Trois étapes à Sibiu et dans ses campagnes voisines'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Relevés de terrain enregistrés lors de notre traversée de la Transylvanie en août 2026.'
              )}
            </p>
          </div>

          <div className="space-y-6">
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step1_tag', 'text', 'Étape 01 · Matinée entre Ville Haute et Ville Basse')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step1_coords', 'text', '45.7975° N, 24.1519° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step1_title', 'text', 'Piața Huet, Tour du Conseil et descente vers la Piața Aurarilor')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step1_desc',
                  'textarea',
                  'Traverse la Piața Mică dès 8 h 30, monte dans la Tour du Conseil (Turnul Sfatului) pour observer les lucarnes des toits à hauteur d œil et la chaîne des monts Făgăraș au sud, puis emprunte le Passage des Escaliers vers les rues calmes de la Ville Basse et la Strada Cetății bordée des tours des corporations (Charpentiers, Potiers, Arquebusiers).'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step1_note',
                  'text',
                  'Marché paysan : le vendredi matin autour de la cathédrale évangélique et tous les jours au marché Cibin pour les fromages de brebis (telemea, burduf) de Mărginimea Sibiului.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step2_tag', 'text', 'Étape 02 · Après-midi sous les chênes')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step2_coords', 'text', '45.7544° N, 24.1150° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step2_title', 'text', 'Marcher dans la forêt de Dumbrava et jusqu à Cisnădioara')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step2_desc',
                  'textarea',
                  'À quinze minutes au sud du centre (accessible en bus ou par la piste cyclable ombragée qui traverse le bois de Dumbrava), le musée ethnographique ASTRA se parcourt comme une réserve forestière au bord de l eau. Poursuis ensuite à dix minutes jusqu au village de Cisnădioara (Michelsberg) où une petite basilique romane en pierre du XIIe siècle couronne une colline boisée.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step2_note',
                  'text',
                  'Au coucher du soleil, le promontoire de Cisnădioara offre un panorama dégagé sur les vergers et les premiers contreforts des Carpates.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step3_tag', 'text', 'Étape 03 · Échappée vers les villages saxons')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step3_coords', 'text', '46.1353° N, 24.5214° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step3_title', 'text', 'La route secondaire de Sibiu à Biertan et Mălâncrav')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step3_desc',
                  'textarea',
                  'Depuis Sibiu, quitte la route nationale pour remonter par la vallée de l Hârtibaciu (Agnita) jusqu à Biertan et ses trois enceintes de murailles médiévales. Les hautes portes cochères en chêne massif, l odeur de fumée de bois de hêtre et le pas régulier des charrettes rythment la traversée vers Sighișoara.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step3_note',
                  'text',
                  'Repère budget vérifié : compte 3 € (15 RON) pour l accès à l église fortifiée de Biertan et environ 45 € la nuitée en maison d hôtes saxonne restaurée.'
                )}
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
              fallback="Pour dîner ou dormir au calme à Sibiu, privilégie les adresses installées dans la Ville Basse (autour de la Piața Aurarilor et de la Strada Târgul Vinului) ou dans les villages pastoraux de Rășinari et Sibiel à vingt minutes à l ouest, plutôt que les grandes terrasses centrales de la Piața Mare."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Route Transfăgărășan')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'Sibiu est à 45 minutes du versant nord de la route alpine Transfăgărășan (lac Bâlea à 2 034 m, ouverte de fin juin à fin octobre).'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Spécialité locale')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'Goûte la ciorbă ardelenească (soupe acidulée à l estragon) et la confiture de rhubarbe servie dans les auberges saxonnes autour de Sibiu.'
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
