import type { Metadata } from 'next'
import Link from 'next/link'
import { Compass, Eye, MapPin } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

export const revalidate = 86400

const PAGE = 'destinations-sardaigne-alghero'

const metadata: Metadata = {
  title: 'Alghero, Capo Caccia & Bosa en couple : carnet slow travel | Heldonica',
  description:
    'Découvrir Alghero en couple : remparts catalans des Bastioni, falaises de Capo Caccia, parc naturel de Porto Conte et route côtière SP105 vers Bosa.',
  openGraph: {
    title: 'Alghero & Bosa en couple : carnet slow travel en Sardaigne | Heldonica',
    description:
      'La Barceloneta sarde : bastions de grès doré face au couchant, escalier du Cabirol à Capo Caccia, vignobles de Sella & Mosca et maisons pastel de Bosa.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne/alghero',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function AlgheroPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="sardaigne-alghero"
        title={zones.title || 'Alghero'}
        country="Sardaigne"
        hero_unsplash_url="/og-default.jpg"
        zones={zones}
      />
    )
  }

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html' | 'image',
    fallback: string,
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
      <main className="min-h-screen bg-[#F7F3EC] text-[#241D1A]">
        {isPreview && (
          <div className="bg-amber-100/90 border-b border-amber-300 text-amber-900 px-4 py-2.5 text-xs flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 text-amber-700" />
            <span className="font-medium">
              {Z('draft_badge_title', 'text', 'Mode Brouillon actif :', undefined, 'span')}
            </span>
            <span>
              {Z(
                'draft_badge_desc',
                'text',
                'Aperçu interne du carnet Alghero, Capo Caccia & Bosa (non indexé tant que la page figure dans unpublished-pages).',
                undefined,
                'span'
              )}
            </span>
          </div>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#1E1916] py-20 md:py-28 border-b border-[#DED5C6]">
          <div className="absolute inset-0 opacity-30">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#D8CFC0] mb-3">
              {Z('hero_badge', 'text', 'Sardaigne · Nord-Ouest (Riviera del Corallo) · 40.5580° N, 8.3193° E', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-[#F7F3EC] mb-5 leading-tight">
              {Z(
                'hero_title',
                'text',
                'Alghero & Bosa : bastions catalans, falaises calcaires de Capo Caccia et route des vautours',
                undefined,
                'span'
              )}
            </h1>
            <p className="text-lg text-[#E2D9C8] max-w-2xl leading-relaxed mb-6">
              {Z(
                'intro_text',
                'textarea',
                "Repeuplée par la couronne d'Aragon en 1354, L'Alguer conserve dans ses ruelles pavées de galets des plaques de rue bilingues en catalan alguérois, un clocher gothique octogonal et des remparts de grès doré qui plongent directement dans la mer face au promontoire de Capo Caccia.",
                undefined,
                'span'
              )}
            </p>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#F7F3EC] bg-[#FAF7F2]/10 border border-[#DED5C6]/30 px-4 py-2 rounded-sm">
              <Compass className="w-4 h-4 text-eucalyptus" />
              <span>
                {Z(
                  'hero_meta_badge',
                  'text',
                  'Centre historique piéton · Parc de Porto Conte & route SP105 vers Bosa',
                  undefined,
                  'span'
                )}
              </span>
            </div>
          </div>
        </section>

        {/* 3 Piliers (compatibilité SubDestinationTemplate : highlight_1..3) */}
        <section className="max-w-4xl mx-auto px-4 py-12 border-b border-[#DED5C6]">
          <p className="text-[11px] uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-2">
            {Z('highlights_kicker', 'text', 'Trois empreintes', undefined, 'span')}
          </p>
          <h2 className="text-2xl font-serif text-[#241D1A] mb-6">
            {Z('highlights_heading', 'text', 'Ce qui distingue la côte nord-ouest sarde', undefined, 'span')}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_1_emoji', 'text', 'Héritage aragonais', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_1_title', 'text', 'Les Bastioni Marco Polo & Cristoforo Colombo', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_1_description',
                  'textarea',
                  'En fin d’après-midi, toute la vieille ville se retrouve sur le chemin de ronde en pierre couleur miel pour regarder le soleil plonger derrière la silhouette du géant endormi de Capo Caccia.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_2_emoji', 'text', 'Karst & mer', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_2_title', 'text', 'Les 654 marches de l’Escala del Cabirol', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_2_description',
                  'textarea',
                  'Taillé à flanc d’une paroi calcaire verticale de 110 mètres, cet escalier suspendu au-dessus des flots descend jusqu’à l’entrée de la grotte marine de Neptune.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_3_emoji', 'text', 'Vignes & palmier nain', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_3_title', 'text', 'Vermentino salin, Torbato & Malvasia di Bosa', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_3_description',
                  'textarea',
                  'Des terres calcaires d’Alghero aux coteaux volcaniques du fleuve Temo à Bosa, la côte ouest produit des vins blancs iodés et des cuvées oxydatives rares.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* 6 étapes détaillées */}
        <section className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-2">
              {Z('stages_kicker', 'text', 'Itinéraire sur 3 jours', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-[#241D1A]">
              {Z('stages_heading', 'text', 'Les 6 étapes entre Alghero, Porto Conte et Bosa', undefined, 'span')}
            </h2>
          </div>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_1_badge', 'text', 'Étape 01 · Cité fortifiée', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_1_gps', 'text', '40.5580° N, 8.3119° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_1_title', 'text', 'Le centre historique d’Alghero, la cathédrale Santa Maria et la coupole de San Michele', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_1_text',
                'textarea',
                'Entre dans la vieille ville par la Torre di Porta Terra et perds-toi dans l’entrelacs des ruelles pavées de galets ronds (Carrer del Bisbe, Via Principe Umberto). Monte au sommet du campanile gothique-catalan de la cathédrale Santa Maria pour observer le dôme en majolique polychrome de l’église San Michele et la ligne continue des bastions marins.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_2_badge', 'text', 'Étape 02 · Âge du bronze sarde', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_2_gps', 'text', '40.5958° N, 8.2428° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_2_title', 'text', 'Le complexe nuragique de Palmavera et la nécropole d’Anghelu Ruju', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_2_text',
                'textarea',
                'À dix kilomètres au nord d’Alghero, le village nuragique de Palmavera assemble deux tours maîtresses en calcaire blanc et en grès doré entourées d’une cinquantaine de cabanes circulaires bâties entre le XVe et le VIIIe siècle avant notre ère, dont la Grande Cabane des réunions a conservé son siège circulaire en pierre.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_3_badge', 'text', 'Étape 03 · Randonnée en réserve naturelle', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_3_gps', 'text', '40.5881° N, 8.1656° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_3_title', 'text', 'Le Parc naturel régional de Porto Conte et le sentier de Punta Giglio', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_3_text',
                'textarea',
                'Autour de la vaste baie abritée de Porto Conte (le Portus Nympharum des Romains), marche deux heures à travers la pinède et le maquis de palmiers nains jusqu’au promontoire calcaire de Punta Giglio. La vue plonge sur les eaux turquoise de la réserve marine et la muraille blanche opposée de Capo Caccia.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_4_badge', 'text', 'Étape 04 · Escalier du chevreuil', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_4_gps', 'text', '40.5650° N, 8.1603° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_4_title', 'text', 'Capo Caccia et la Grotta di Nettuno par l’Escala del Cabirol à 9h00', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_4_text',
                'textarea',
                'Plutôt que d’embarquer sur les bateaux touristiques depuis le port, rejoins l’extrémité du cap dès 8h45 par temps calme pour descendre à pied les 654 marches de l’Escala del Cabirol. La grotte s’ouvre au ras des vagues sur le lac souterrain salé Lamarmora entouré de colonnes stalagmitiques monumentales.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_5_badge', 'text', 'Étape 05 · 45 kilomètres en corniche', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_5_gps', 'text', '40.4122° N, 8.4014° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_5_title', 'text', 'La route panoramique SP105 d’Alghero à Bosa', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_5_text',
                'textarea',
                'C’est l’une des plus belles routes côtières de Méditerranée : pendant quarante-cinq kilomètres sans un seul village, la SP105 serpente entre la mer et des falaises volcaniques ocre et pourpre où niche la dernière colonie sarde de vautours fauves (grifoni). Prévois deux heures pour t’arrêter sur les belvédères rocheux.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_6_badge', 'text', 'Étape 06 · Cité fluviale', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_6_gps', 'text', '40.2953° N, 8.4978° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_6_title', 'text', 'Bosa : le quartier médiéval de Sa Costa et les anciennes tanneries du Temo', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_6_text',
                'textarea',
                'Traverse le Vieux Pont en trachyte rouge sur le fleuve Temo — seul cours d’eau navigable de Sardaigne — où se reflètent les anciennes tanneries du XIXe siècle (Sas Conzas), puis grimpe par les ruelles en escalier du quartier de Sa Costa jusqu’au château des Malaspina.',
                undefined,
                'span'
              )}
            </p>
          </article>
        </section>

        {/* Conseil local (compatibilité SubDestinationTemplate : local_tip_kicker & local_tip) */}
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <div className="bg-[#EFE9DF] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
              {Z('local_tip_kicker', 'text', 'Repère de table à Alghero et Bosa', undefined, 'span')}
            </p>
            <p className="text-[#241D1A] leading-relaxed">
              {Z(
                'local_tip',
                'textarea',
                'À Alghero, commande la paella algherese préparée non pas avec du riz mais avec de la fregula sarda (petites billes de semoule de blé dur roulées à la main et toastées au four), accompagnée d’un verre de Torbato sec issu des terres calcaires de Porto Conte.',
                undefined,
                'span'
              )}
            </p>
          </div>
        </section>

        {/* Navigation bas de page */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-[#2A1D18] text-[#F7F3EC] rounded-sm p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-serif mb-3">
              {Z('cta_title', 'text', 'Poursuivre vers l’île d’Asinara ou la Barbagia', undefined, 'span')}
            </h2>
            <p className="text-[#E2D9C8] text-sm max-w-xl mx-auto mb-6">
              {Z(
                'cta_desc',
                'textarea',
                'Depuis Alghero, remonte quarante minutes vers Stintino pour embarquer vers le parc national d’Asinara, ou gagne les montagnes de Nuoro.',
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/destinations/sardaigne/asinara"
                className="px-6 py-3 bg-action text-white rounded-sm text-xs uppercase tracking-[0.16em] font-medium hover:bg-action-fonce transition-colors"
              >
                {Z('cta_btn_asinara', 'text', 'Voir le carnet Île d’Asinara', undefined, 'span')}
              </Link>
              <Link
                href="/destinations/sardaigne"
                className="px-6 py-3 border border-[#DED5C6]/40 text-[#F7F3EC] rounded-sm text-xs uppercase tracking-[0.16em] font-medium hover:border-[#F7F3EC] transition-colors"
              >
                {Z('cta_btn_back', 'text', '← Guide Sardaigne', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
