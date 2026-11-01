import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Castle } from 'lucide-react'
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

const PAGE = 'destinations-roumanie-transylvanie'

const defaultMetadata: Metadata = {
  title: 'Transylvanie en slow travel : villages saxons de Biertan, Viscri et Mălâncrav | Heldonica',
  description:
    'Entre Sibiu, Sighișoara et Brașov, notre carnet de route dans les villages saxons fortifiés de Transylvanie : Biertan, Viscri, Mălâncrav et collines pastorales.',
  openGraph: {
    title: 'Transylvanie en slow travel : villages saxons de Biertan, Viscri et Mălâncrav | Heldonica',
    description:
      'Églises fortifiées de Biertan et Viscri, manoir Apafi de Mălâncrav et chemins pastoraux de Transylvanie.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/transylvanie',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function TransylvaniePage({
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
        slug="roumanie-transylvanie"
        title={zones.title || 'Transylvanie'}
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
                <Castle className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Cœur des Carpates · Villages Saxons Fortifiés', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '46.0548° N, 25.0887° E', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Transylvanie rurale : les chemins de terre entre Biertan, Mălâncrav et Viscri'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'Loin du folklore commercial des grands châteaux, la Transylvanie se révèle dès qu on quitte la route nationale entre Sibiu et Sighișoara pour suivre les vallées d églises-citadelles et de fermes saxonnes pastel.'
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
                  {Z('meta_1_label', 'text', 'Boucle saxonne')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', '140 km · 2 à 3 jours lents')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Castle className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Sites UNESCO')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', 'Biertan, Viscri, Saschiz')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Maisons d hôtes')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', '~45 € / nuit (ferme saxonne)')}
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
            {Z('intro_kicker', 'text', 'Récit de terrain · Siebenbürgen')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'La Transylvanie des sept citadelles : là où l église du village servait aussi de grenier et de rempart'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Dès qu on quitte la chaussée nationale entre Sibiu et Sighișoara pour s engager sur les routes secondaires serpentant vers Biertan, Mălâncrav ou Viscri, l allure du voyage change immédiatement. On avance entre des collines de pâturages et de chênaies où les troupeaux rentrent seuls au village en fin d après-midi."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'Dans chaque village saxon fondé aux XIIe et XIIIe siècles, l urbanisme raconte la même solidarité paysanne : deux rangées de fermes aux façades bleues, vert amande ou ocre s alignent de part et d autre d une large rue herbeuse. De hautes portes cochères en chêne massif ferment de longues cours intérieures qui débouchent à l arrière sur les granges et les vergers de pruniers.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'Au centre ou sur le promontoire du vallon se dresse l église fortifiée (Kirchenburg) : entourée d une à trois enceintes de murailles flanquées de tours de corporations, elle abritait autrefois les réserves de grains et de lard de chaque famille en cas de siège.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de la Transylvanie saxonne')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois villages vécus sur notre boucle de 140 kilomètres')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-transylvanie" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'Les trois enceintes de Biertan', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Ancien siège des évêques luthériens de Transylvanie pendant trois siècles, doté d un retable polyptyque de 28 panneaux peints et d une porte de sacristie à 19 verrous de 1515.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-transylvanie" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Le vallon isolé de Mălâncrav', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'Au bout d une route en cul-de-sac bordée de vergers biologiques, son église fortifiée conserve les plus vastes fresques gothiques murales du XIVe siècle en Transylvanie.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-transylvanie" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'Viscri au coucher du soleil', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Une fois les visiteurs de mi-journée repartis, la rue principale de terre battue et l église blanche fortifiée sur la colline retrouvent le calme pastoral des soirées d été.',
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
                'Notre boucle de 3 jours dans les villages saxons : de Biertan à Viscri'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                '140 kilomètres de routes secondaires testés en août 2026 à travers les collines de Transylvanie.'
              )}
            </p>
          </div>

          <div className="space-y-6">
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step1_tag', 'text', 'Étape 01 · Vallée de la Târnava Mare')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step1_coords', 'text', '46.1353° N, 24.5214° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step1_title', 'text', 'Biertan, Richiș et l escalier couvert en bois')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step1_desc',
                  'textarea',
                  'Monte par l escalier couvert en bois de chêne de 100 mètres jusqu à l esplanade intérieure de l église fortifiée de Biertan. Dans la tour de l horloge, l odeur de résine séchée des charpentes du XVe siècle est restée intacte. Poursuis ensuite à cinq kilomètres jusqu au village voisin de Richiș, beaucoup moins fréquenté.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step1_note',
                  'text',
                  'Billet d accès : 3 € (15 RON) à Biertan ; parking gratuit au pied des remparts.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step2_tag', 'text', 'Étape 02 · Halte à Sighișoara et Mălâncrav')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step2_coords', 'text', '46.1089° N, 24.6486° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step2_title', 'text', 'Des vergers de Mălâncrav à la colline de l École de Sighișoara')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step2_desc',
                  'textarea',
                  'Fais le détour par la vallée en cul-de-sac de Mălâncrav où la fondation Mihai Eminescu Trust a restauré le manoir Apafi et relancé les vergers traditionnels de pommiers. En fin de journée, rejoins la citadelle haute de Sighișoara pour gravir les 175 marches de l escalier des Écoliers (Scara Școlarilor, 1642) lorsque les cars sont repartis.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step2_note',
                  'text',
                  'À Mălâncrav, demande la clé de l église fortifiée à la maison du gardien juste en bas des marches pour voir les fresques du XIVe siècle.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step3_tag', 'text', 'Étape 03 · Nuitée en maison saxonne')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step3_coords', 'text', '46.0548° N, 25.0887° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step3_title', 'text', 'Viscri et Saschiz : dîner au poêle à bois et silence du soir')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step3_desc',
                  'textarea',
                  'Arrive à Viscri après 16 h 30. Monte dans le chemin de ronde de l église fortifiée blanche pour regarder les troupeaux redescendre des collines au son des cloches, puis partage un dîner paysan dans une cour saxonne (soupe de haricots verts, pain cuit au four, fromage frais et confiture de rhubarbe autour de 15 € par personne).'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step3_note',
                  'text',
                  'Stationnement : le cœur de Viscri est préservé des voitures ; laisse ton véhicule sur le parking aménagé à l entrée du village et parcours la grande rue à pied.'
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
              fallback="En Transylvanie rurale, évite absolument de conduire après la tombée de la nuit sur les routes secondaires : les charrettes à cheval non éclairées, les troupeaux tardifs et les chaussées parfois dégradées après les orages d été demandent une visibilité de plein jour."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Où dormir')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'Choisis une maison saxonne restaurée à Viscri, Crit ou Cincșor plutôt qu un hôtel moderne en bord de route nationale.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Artisanat vérifié')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'À Viscri, l association des tricoteuses du village vend directement devant les portes cochères des chaussettes en laine brute feutrée.'
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
