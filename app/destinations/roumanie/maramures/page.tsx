import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Trees } from 'lucide-react'
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

const PAGE = 'destinations-roumanie-maramures'

const defaultMetadata: Metadata = {
  title: 'Maramureș slow travel : églises en bois UNESCO, train Mocănița et vallée de l Iza | Heldonica',
  description:
    'Églises en bois de Bârsana, Ieud et Desești, portes en chêne sculptées de la vallée de l Iza et train forestier à vapeur Mocănița à Vișeu de Sus : notre carnet slow travel en Roumanie.',
  openGraph: {
    title: 'Maramureș slow travel : églises en bois UNESCO, train Mocănița et vallée de l Iza | Heldonica',
    description:
      'Églises en bois UNESCO, portes sculptées de la vallée de l Iza et train à vapeur Mocănița dans le nord de la Roumanie.',
    type: 'website',
    // Pas IMG_20260827_135025 : mêmes maisons qu'une photo de Bucarest prise 6 minutes plus tôt.
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/maramures',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function MaramuresPage({
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
        slug="roumanie-maramures"
        title={zones.title || 'Maramures'}
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
                <Trees className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Nord des Carpates · Civilisation du Bois & Vallée du Vaser', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '47.7167° N, 24.4333° E', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Maramureș : à l heure où les portails en chêne sculpté s ouvrent sur la brume'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'Le long des vallées encaissées de l Iza, de la Mara et du Vaser, le bois demeure une matière vivante : flèches d églises de 50 mètres en bardeaux de sapin, meules de foin fauchées à la main et dernier train forestier à vapeur d Europe.'
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
                  {Z('meta_1_label', 'text', 'Train Mocănița')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', 'Départ 9 h 00 · Vișeu de Sus')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Trees className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Flèche de Bârsana')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', '57 m en bois de chêne')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Accès depuis Cluj')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', '3 h 30 de route via Baia Mare')}
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
            {Z('intro_kicker', 'text', 'Récit de terrain · Nord de la Roumanie')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'Avant huit heures, quand les portails parlent avant les maisons'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Tout au nord de la Roumanie, le long de la frontière ukrainienne, le Maramureș s articule autour des vallées de l Iza, de la Mara, du Cosău et du Vaser. On y est arrivés tôt le matin lors de notre traversée en 2026, à l heure où le bois humide travaille, où les pas crissent sur le gravier et où une odeur de fumée fine flotte au-dessus des vergers."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'Dans chaque village du Maramureș, la ferme s ouvre par un portail monumental en chêne massif sculpté à la gouge de rosettes solaires, d arbres de vie et de cordes torsadées. Sur les collines qui encadrent la route, le foin sèche encore en hautes meules coniques façonnées autour d un pieu central, tandis que les églises en bois classées par l UNESCO (Bârsana, Ieud, Desești, Budești) dressent leurs flèches effilées vers les nuages.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'À Vișeu de Sus, le train forestier à vapeur Mocănița — mis en service sur voie étroite (760 mm) pour acheminer les grumes des Carpates — s enfonce encore sur plus de 40 kilomètres le long du torrent du Vaser, dans une vallée dépourvue de toute route carrossable.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient du Maramureș')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus entre vallées pastorales et train à vapeur')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-maramures" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'Les Églises en bois UNESCO (Bârsana & Ieud)', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Des flèches de chêne et de sapin assemblées sans clous métalliques, des fresques intérieures peintes directement sur toile marouflée et le calme de la vallée de l Iza.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-maramures" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Le train à vapeur Mocănița (Vallée du Vaser)', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'Dernier chemin de fer forestier à vapeur opérationnel d Europe : départ à 9 h de Vișeu de Sus pour remonter le canyon boisé de la rivière Vaser jusqu à Paltin.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-roumanie-maramures" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'Les tables paysannes et la Mămăligă', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'L hospitalité des maisons de Breb et Botiza, où l on partage au coin du poêle la mămăligă crémeuse au fromage de brebis brânză et une goutte d horincă de prune.',
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
                'Trois étapes dans les vallées du Maramureș'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Notre parcours vérifié entre la vallée de l Iza, le village de Breb et le train du Vaser.'
              )}
            </p>
          </div>

          <div className="space-y-6">
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step1_tag', 'text', 'Étape 01 · Vallée de l Iza')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step1_coords', 'text', '47.8011° N, 24.0608° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step1_title', 'text', 'De Bârsana à Ieud : les maîtres charpentiers du bois')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step1_desc',
                  'textarea',
                  'Remonte la vallée de l Iza au matin en t arrêtant au monastère de Bârsana (dont la tour en bois atteint 57 mètres) puis à l église sur la colline d Ieud (Biserica din Deal, XIVe-XVIIe siècles). L intérieur sombre éclairé à la bougie sent la cire d abeille et le vieux sapin.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step1_note',
                  'text',
                  'Accès églises UNESCO : environ 2 € (10 RON) par site ; prévois des pièces ou petits billets en RON.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step2_tag', 'text', 'Étape 02 · Vallée de la Mara & pied du Gutâi')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step2_coords', 'text', '47.7486° N, 23.9044° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step2_title', 'text', 'Marcher entre les meules de foin de Breb et Desești')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step2_desc',
                  'textarea',
                  'Sous la crête rocheuse des monts Gutâi, le village de Breb se parcourt uniquement à pied par ses chemins bordés de clôtures en noisetier tressé. Visite l église Sainte-Parascève de Desești (1770) tout près, puis poursuis jusqu à Săpânța où le sculpteur Stan Ioan Pătraș a gravé et peint en bleu vif des centaines de stèles en chêne racontant la vie de chaque habitant.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step2_note',
                  'text',
                  'Temps de route : dans le Maramureș, compte environ 1 h 30 pour parcourir 40 kilomètres sur les routes de col.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step3_tag', 'text', 'Étape 03 · Départ 9 h 00 à Vișeu de Sus')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step3_coords', 'text', '47.7167° N, 24.4333° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step3_title', 'text', 'La remontée de la vallée du Vaser à bord du Mocănița')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step3_desc',
                  'textarea',
                  'Présente-toi dès 8 h 15 à la gare forestière CFF de Vișeu de Sus. À 9 h 00, la locomotive à vapeur s ébranle dans un nuage de vapeur blanche et de fumée de bois pour remonter à 20 km/h les gorges sauvages de la rivière Vaser jusqu à la clairière de Paltin (environ 5 à 6 heures aller-retour avec les arrêts d eau).'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step3_note',
                  'text',
                  'Tarif repère : à partir de 19 € (95 RON) l aller-retour sec ; réservation préalable indispensable de mai à octobre.'
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
              fallback="Pars tôt le matin sur les routes secondaires de la vallée de la Mara et du Cosău pour observer la brume se lever sur les meules de foin, garde toujours des espèces en RON pour les petites pensions familiales, et télécharge tes cartes hors-ligne avant de t engager dans les vallées forestières."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Dimanche matin')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'Le dimanche vers 9 h 30, les habitants de Botiza, Ieud et Breb se rendent encore à l église en costumes brodés traditionnels.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Mémorial de Sighet')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'À Sighetu Marmației, consacre deux heures au Mémorial des victimes du communisme installé dans l ancienne prison politique.'
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
