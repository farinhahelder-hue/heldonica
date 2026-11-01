import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Music } from 'lucide-react'
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

const PAGE = 'destinations-portugal-lisbonne'

const defaultMetadata: Metadata = {
  title: 'Lisbonne en couple : notre itinéraire slow travel | Heldonica',
  description:
    'Notre carnet de terrain à Lisbonne : bica matinale à 0,80 € dans les travessas de l Alfama, escaliers de la Mouraria, guitarra portuguesa à 12 cordes, Miradouro da Senhora do Monte et ferry vers Cacilhas.',
  openGraph: {
    title: 'Lisbonne en couple : notre itinéraire slow travel | Heldonica',
    description:
      'Arpenter Lisbonne à pied : ruelles de l Alfama et de la Mouraria, accords de guitarra portuguesa et traversée du Tage vers Cacilhas.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/portugal/lisbonne',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function LisbonnePage({
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
        slug="portugal-lisbonne"
        title={zones.title || 'Lisbonne'}
        country="Portugal"
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
              href="/destinations/portugal"
              className="inline-flex items-center gap-2 text-[#F5F0E8]/80 hover:text-[#F5F0E8] text-xs uppercase tracking-[0.2em] mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('back_to_parent', 'text', 'Retour au carnet Portugal', undefined, 'span')}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#8B6E32]/90 text-[#F5F0E8] text-[11px] uppercase tracking-[0.18em]">
                <Music className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Estuaire du Tage · Alfama, Mouraria & Guitarra Portuguesa', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '38.7117° N, 9.1303° W', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Lisbonne à pied : travessas de l Alfama, azulejos patinés et reflets sur le Tage'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'De la bica matinale bue au comptoir d une tasca sans enseigne aux douze cordes métalliques de la guitarra portuguesa le soir venu, Lisbonne se révèle quand on abandonne les files d attente pour grimper ses collines de calcaire poli.'
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
                  {Z('meta_1_label', 'text', 'Rituel du matin')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', 'Bica à 0,80 € (Rua dos Remédios)')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Traversée du Tage')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', 'Ferry Cacilhas · 1,50 € (10 min)')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Music className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Table de quartier')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', '~14 € / pers. en tasca locale')}
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
                  {Z('meta_4_value', 'text', 'Carnet de route · Duo Heldonica')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO & RECIT DE TERRAIN */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8B6E32] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {Z('intro_kicker', 'text', 'Récit de terrain · Collines d Alfama et de la Mouraria')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'Le grincement du premier tramway sur les rails humides et l odeur du café torréfié'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="On a posé nos sacs à dos dans une petite travessa de l Alfama un matin d automne, quand le premier tramway jaune grinçait sur les rails encore humides de rosée. L odeur du café torréfié — la bica à 0,80 € bue debout au comptoir d une tasca sans enseigne — se mêlait à l air iodé montant de l estuaire du Tage."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'Loin des files d attente du tram 28 à Martim Moniz, on a préféré remonter à pied les escaliers escarpés qui grimpent vers la Mouraria. Là, entre deux façades d azulejos bleus patinés par le sel marin, dona Maria étendait son linge sur des fils de fer tendus d un balcon à l autre. Elle nous a raconté qu ici, les voisins se connaissent depuis trois générations et que le soir venu, les fenêtres restent entrouvertes pour laisser passer les accords des cercles de fado vécus entre habitants.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'Dans ces venelles rescapées du grand séisme du 1er novembre 1755, la guitarra portuguesa — avec ses douze cordes d acier réparties en six chœurs doubles attaqués à l ongle — fait vibrer une résonance liquide contre la pierre calcaire de la calçada portuguesa.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de Lisbonne')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus sur les sept collines')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-portugal-lisbonne" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'Miradouro da Senhora do Monte', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Le belvédère le plus haut de la colline de Graça : en fin d après-midi, la lumière rasante de l Atlantique baigne les toits de tuiles rouges et le château d un éclat cuivré.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-portugal-lisbonne" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Les escaliers d Alfama & Mouraria', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'Autour de la Rua dos Remédios et des Becos da Mouraria, les ruelles médiévales en colimaçon ont survécu au séisme de 1755 et gardent leur vie de quartier dès 8 h du matin.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-portugal-lisbonne" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'Le ferry vers Cacilhas au couchant', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Pour 1,50 € depuis Cais do Sodré, dix minutes de traversée sur l estuaire du Tage permettent de contempler toute la façade ocre et blanche de Lisbonne depuis la rive sud.',
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
                'Une journée lente à Lisbonne : de l Alfama matinal aux quais de Cacilhas'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Trois étapes à pied et en bateau pour éviter la saturation des axes touristiques.'
              )}
            </p>
          </div>

          <div className="space-y-6">
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step1_tag', 'text', 'Étape 01 · 8 h 00 dans l Alfama')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step1_coords', 'text', '38.7123° N, 9.1278° W')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step1_title', 'text', 'Bica au comptoir de la Rua dos Remédios et Miradouro de Santa Luzia')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step1_desc',
                  'textarea',
                  'Commence ta marche vers 8 h dans le bas de l Alfama, quand les livreurs déposent le pain chaud et que la pergola d azulejos du Miradouro de Santa Luzia et des Portas do Sol est encore déserte. Prends une bica serrée (0,80 €) et un pastel de nata encore tiède à la sortie du fournil (1,30 €) saupoudré d un voile de cannelle.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step1_note',
                  'text',
                  'Attention sous la semelle : les petits pavés blancs et noirs de calcaire (calçada portuguesa) sont très glissants après une averse ou dans les descentes raides.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step2_tag', 'text', 'Étape 02 · Colline de Graça & Mouraria')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step2_coords', 'text', '38.7191° N, 9.1328° W')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step2_title', 'text', 'Monter à pied jusqu au Miradouro da Senhora do Monte')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step2_desc',
                  'textarea',
                  'Grimpe par les escaliers de la Mouraria (Escadinhas de São Cristóvão et Rua do Capelão, berceau historique de la fadista Maria Severa) jusqu au plateau ouvrier de Graça et au Miradouro da Senhora do Monte. Sous les pins parasols, la vue plonge sur la Baixa pombaline reconstruite après 1755, le couvent des Carmes et le pont du 25-Avril.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step2_note',
                  'text',
                  'Pour le déjeuner : commande un plat du jour (prato do dia — morue au four ou sardines grillées avec carafe de vinho verde, environ 14 € par personne) dans une tasca de Graça.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step3_tag', 'text', 'Étape 03 · Lumière du soir sur le Tage')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step3_coords', 'text', '38.6881° N, 9.1475° W')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step3_title', 'text', 'Traverser le Tage en ferry orange de Cais do Sodré à Cacilhas')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step3_desc',
                  'textarea',
                  'Une heure avant le coucher du soleil, embarque avec les pendulaires lisboètes sur le ferry de Cais do Sodré vers Cacilhas (1,50 € la traversée de 10 minutes). Une fois sur la rive sud, longe à pied les anciens entrepôts maritimes du Ginjal le long de l eau : Lisbonne tout entière s illumine en face de toi, dorée par le reflet du fleuve.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step3_note',
                  'text',
                  'Carte Viva Viagem / Navegante rechargeable aux bornes de Cais do Sodré, valable à la fois dans les trams et sur les bateaux Transtejo.'
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
              fallback="Si tu veux prendre le tramway historique 28E en bois (Remodelado), ne fais jamais la queue au départ de Martim Moniz en journée : prends-le avant 8 h du matin dans le sens Prazeres → Graça, ou parcours l itinéraire à pied pour pouvoir t arrêter dans chaque cour d azulejos."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Écouter du fado sans piège')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'Privilégie les petites maisons de fado vécues à la Mouraria ou à Alfama où l on paie à la consommation (fado vadio) plutôt que les grands dîners-spectacles.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Chaussures obligatoires')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'Choisis des semelles en caoutchouc souple et antidérapant : le calcaire poli par des décennies de passages brille comme du marbre dans les pentes.'
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DED5C6] pt-8">
            <Link
              href="/destinations/portugal"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#2C2416] hover:text-[#8B6E32] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('footer_back_link', 'text', 'Voir tout le carnet Portugal', undefined, 'span')}
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#2C2416] text-[#F5F0E8] hover:bg-[#3E3321] text-xs uppercase tracking-[0.18em] transition-colors"
            >
              {Z('footer_cta_services', 'text', 'Construire ton itinéraire au Portugal', undefined, 'span')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  )
}
