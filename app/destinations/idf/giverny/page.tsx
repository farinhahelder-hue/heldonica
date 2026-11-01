import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Flower2 } from 'lucide-react'
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

const PAGE = 'destinations-idf-giverny'

const defaultMetadata: Metadata = {
  title: 'Giverny en couple : notre carnet slow travel | Heldonica',
  description:
    'Aux portes de l Île-de-France et de la vallée de l Epte, notre carnet de terrain à Giverny : traversée à vélo depuis la gare de Vernon, Jardin d Eau de Claude Monet dès 9 h, ancien Hôtel Baudy et coteaux crayeux de la Seine.',
  openGraph: {
    title: 'Giverny en couple : notre carnet slow travel | Heldonica',
    description:
      'Giverny à vélo le long de l ancienne voie ferrée depuis Vernon, Clos Normand et sentier des coteaux au-dessus de la Seine.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/idf/giverny',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function GivernyPage({
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
        slug="idf-giverny"
        title={zones.title || 'Giverny'}
        country="France"
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
              href="/destinations/idf"
              className="inline-flex items-center gap-2 text-[#F5F0E8]/80 hover:text-[#F5F0E8] text-xs uppercase tracking-[0.2em] mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('back_to_parent', 'text', 'Retour au carnet Île-de-France', undefined, 'span')}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#8B6E32]/90 text-[#F5F0E8] text-[11px] uppercase tracking-[0.18em]">
                <Flower2 className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Vallée de l Epte · Jardins de Monet & Coteaux de Seine', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '49.0756° N, 1.5333° E', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z(
                'hero_title',
                'text',
                'Giverny : rejoindre le Jardin d Eau à vélo et monter sur les coteaux crayeux'
              )}
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_subtitle',
                'textarea',
                'À 45 minutes de train de Paris Saint-Lazare, le village où Claude Monet a vécu quarante-trois ans se découvre en arrivant dès l ouverture à vélo le long de la Seine, avant de gagner les sentiers de crête du Vexin.'
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
                  {Z('meta_1_label', 'text', 'Créneau impératif')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_1_value', 'text', '9 h 00 (ouverture) ou après 16 h 30')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Flower2 className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_2_label', 'text', 'Période d ouverture')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_2_value', 'text', '1er avril au 1er novembre')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('meta_3_label', 'text', 'Accès doux')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('meta_3_value', 'text', 'Train Vernon-Giverny + 5 km à vélo')}
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
                  {Z('meta_4_value', 'text', 'Carnet Île-de-France · Duo Heldonica')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO & RECIT DE TERRAIN */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8B6E32] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {Z('intro_kicker', 'text', 'Récit de terrain · Confluence de la Seine et de l Epte')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z(
              'intro_heading',
              'text',
              'Commencer par le Jardin d Eau à neuf heures précises, quand les saules pleureurs se reflètent sans une ride'
            )}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="intro_text"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="À la frontière exacte entre le Vexin français et la Normandie, là où la petite rivière de l Epte se jette dans la Seine, Giverny attire le monde entier entre avril et octobre. Pourtant, il suffit de décaler son horaire et son mode d approche pour retrouver le calme que Claude Monet est venu chercher ici en 1883."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'En descendant du premier train matinal en gare de Vernon-Giverny, on loue deux vélos sur le parvis pour franchir le pont sur la Seine devant le Vieux-Moulin à colombages suspendu au-dessus des piles du XIIe siècle, puis on suit la piste cyclable aménagée sur l ancienne voie ferrée. En vingt minutes de pédalage au milieu des prairies humides, on arrive à la rue Claude Monet avant les cars.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'La règle qui change toute la visite : dès le contrôle de ton billet coupe-file à 9 h 00, ne t attarde pas dans la première cour du Clos Normand ; emprunte immédiatement le passage souterrain vers le Jardin d Eau. Pendant vingt minutes, tu auras le pont japonais drapé de glycines, la bambouseraie et le miroir des nymphéas presque pour toi seul.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 3 REPERES (LEGACY CMS ZONES highlight_1..3) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de Giverny')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus entre jardins et coteaux')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-idf-giverny" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'Le Jardin d Eau et le Clos Normand', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Deux jardins complémentaires : les perspectives symétriques d arceaux de rosiers et de capucines devant la maison rose aux volets verts, et le bassin oriental alimenté par un bras de l Epte.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-idf-giverny" zone="highlight_2_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'La voie verte depuis Vernon', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'Cinq kilomètres de piste cyclable plate le long de la Seine et de l ancienne voie ferrée de Gisors, en passant devant le Vieux-Moulin de Vernon et le château des Tourelles.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-idf-giverny" zone="highlight_3_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'Le sentier des Coteaux & Sainte-Radegonde', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Au bout de la rue Claude Monet, l église romane Sainte-Radegonde et les sentiers calcaires qui dominent le village offrent une retraite silencieuse loin de l axe central.',
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
                'Une journée à Giverny : du Vieux-Moulin de Vernon aux collines de l Epte'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Notre parcours testé pour voir les jardins au calme puis marcher dans la campagne environnante.'
              )}
            </p>
          </div>

          <div className="space-y-6">
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step1_tag', 'text', 'Étape 01 · 8 h 15 à Vernon & Voie Verte')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step1_coords', 'text', '49.0964° N, 1.4886° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step1_title', 'text', 'Traverser la Seine devant le Vieux-Moulin et pédaler vers Giverny')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step1_desc',
                  'textarea',
                  'Prends le train de 7 h 10 à Paris Saint-Lazare vers Vernon-Giverny. Récupère un vélo face à la gare, traverse le pont Clemenceau en t arrêtant sur la rive droite de Vernonnet devant le Vieux-Moulin à pans de bois du XVIe siècle et le donjon des Tourelles, puis suis la voie verte de 5 km dans la brume matinale.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step1_note',
                  'text',
                  'Location vélo devant la gare de Vernon : compte environ 15 € la journée.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step2_tag', 'text', 'Étape 02 · 9 h 00 à la Fondation Claude Monet')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step2_coords', 'text', '49.0753° N, 1.5338° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step2_title', 'text', 'Le Jardin d Eau, la salle à manger jaune chrome et la cuisine d azulejos de Rouen')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step2_desc',
                  'textarea',
                  'Commence par le tour complet du bassin des nymphéas à 9 h, puis remonte vers le Clos Normand et l intérieur de la maison de Monet : le salon-atelier tapissé de reproductions, la salle à manger entièrement peinte en deux tons de jaune chrome où sont accrochées ses estampes japonaises d Hokusai et d Hiroshige, et la cuisine aux carreaux de faïence bleue de Rouen et aux casseroles de cuivre.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step2_note',
                  'text',
                  'Calendrier floraisons : iris et glycines en mai, rosiers et premiers nymphéas en juin-juillet, dahlias et capucines en septembre.'
                )}
              </div>
            </article>

            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                  {Z('step3_tag', 'text', 'Étape 03 · Ancien Hôtel Baudy & coteaux')}
                </span>
                <span className="text-[11px] font-mono text-[#7D7365]">
                  {Z('step3_coords', 'text', '49.0772° N, 1.5269° E')}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('step3_title', 'text', 'La roseraie de l Ancien Hôtel Baudy, l église Sainte-Radegonde et les collines')}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                {Z(
                  'step3_desc',
                  'textarea',
                  'Vers 11 h, quand la rue Claude Monet se remplit, remonte vers l extrémité ouest du village : l Ancien Hôtel Baudy (où logèrent Cézanne, Renoir et Rodin à partir de 1887, avec son atelier en bois au fond de la roseraie en terrasses) et le cimetière de l église Sainte-Radegonde où repose Monet avec sa famille. De là, emprunte le sentier pédestre qui grimpe sur les pelouses calcaires des coteaux pour dominer toute la vallée de la Seine.'
                )}
              </p>
              <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                {Z(
                  'step3_note',
                  'text',
                  'Prolongation à vélo l après-midi : remonter de 12 km vers la Roche-Guyon et son donjon médiéval sur la falaise de craie.'
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
              fallback="Réserve impérativement ton billet horodaté en ligne pour 9 h 00 un jour de semaine (mardi ou jeudi) et entre par la petite porte de groupe/billet prépayé dans la ruelle latérale (Chemin du Roy) plutôt que par la file principale de la rue Claude Monet."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-[#F5F0E8]/15 text-xs text-[#E8DFD1]/85">
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_1_label', 'text', 'Fermeture hivernale')}
                </span>
                {Z(
                  'practical_1_value',
                  'text',
                  'La maison et les jardins de Claude Monet ferment chaque année du 2 novembre au 31 mars pour le repos hivernal et les plantations des onze jardiniers.'
                )}
              </div>
              <div>
                <span className="block text-[#C49A45] uppercase tracking-wider text-[10px] mb-1">
                  {Z('practical_2_label', 'text', 'Où pique-niquer')}
                </span>
                {Z(
                  'practical_2_value',
                  'text',
                  'Les pique-niques sont interdits dans l enceinte des jardins : installe-toi au bord de la Seine près du Vieux-Moulin de Vernon ou sur les bancs des coteaux au-dessus de l église.'
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DED5C6] pt-8">
            <Link
              href="/destinations/idf"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#2C2416] hover:text-[#8B6E32] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('footer_back_link', 'text', 'Voir tout le carnet Île-de-France', undefined, 'span')}
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#2C2416] text-[#F5F0E8] hover:bg-[#3E3321] text-xs uppercase tracking-[0.18em] transition-colors"
            >
              {Z('footer_cta_services', 'text', 'Construire ton itinéraire sur mesure', undefined, 'span')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  )
}
