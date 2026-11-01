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

export const revalidate = 3600

const PAGE = 'destinations-sicile-palerme'

const metadata: Metadata = {
  title: 'Palerme en Slow Travel : Mosaïques Arabo-Normandes, Marchés & Kalsa | Heldonica',
  description:
    'Carnet de route à Palerme : Chapelle Palatine et églises arabo-normandes UNESCO, marchés de Ballarò et du Capo, jardin botanique de la Kalsa et cloître de Monreale.',
  openGraph: {
    title: 'Palerme en couple : carnet slow travel en Sicile | Heldonica',
    description:
      'Traverser à pied trois mille ans de strates méditerranéennes, des plafonds à muqarnas de la Chapelle Palatine aux étals de Ballarò et aux ficus centenaires de la Kalsa.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile/palerme',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function PalermePage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="sicile-palerme"
        title={zones.title || 'Palerme'}
        country="Sicile"
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
                'Aperçu interne du carnet Palerme & Monreale (non indexé tant que la page figure dans unpublished-pages).',
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
              {Z('hero_badge', 'text', 'Sicile Occidentale · Conca d’Oro · 38.1157° N, 13.3615° E', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-[#F7F3EC] mb-5 leading-tight">
              {Z(
                'hero_title',
                'text',
                'Palerme : or byzantin, coupoles arabo-normandes, marchés vivants et jardins de la Kalsa',
                undefined,
                'span'
              )}
            </h1>
            <p className="text-lg text-[#E2D9C8] max-w-2xl leading-relaxed mb-6">
              {Z(
                'intro_text',
                'textarea',
                'Fondée par les Phéniciens sous le nom de Ziz, capitale de l’émirat arabe de Sicile puis couronne du royaume normand de Roger II et de Frédéric II, Palerme fait dialoguer des charpentes fatimides, des mosaïques de Constantinople et des oratoires de stuc blanc de Giacomo Serpotta.',
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
                  '9 édifices arabo-normands UNESCO · Exploration 100 % piétonne dans les 4 mandamenti',
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
            {Z('highlights_heading', 'text', 'Ce qui révèle la profondeur de Palerme', undefined, 'span')}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_1_emoji', 'text', 'Syncrétisme XIIe s.', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_1_title', 'text', 'De la Chapelle Palatine à la Piazza Bellini', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_1_description',
                  'textarea',
                  'Lever les yeux vers le plafond de bois sculpté en muqarnas et les mosaïques d’or de la Chapelle Palatine, avant de rejoindre les trois coupoles rouges de San Cataldo et la Martorana.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_2_emoji', 'text', 'Marchés du matin', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_2_title', 'text', 'Ballarò et Il Capo entre 8h00 et 11h00', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_2_description',
                  'textarea',
                  'Arpenter les venelles de l’Albergheria et du Monte di Pietà parmi les étals de fenouil sauvage, d’amandes fraîches, d’olives de Nocellara et de sfincione au sésame.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_3_emoji', 'text', 'Botanique & cloître', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_3_title', 'text', 'L’Orto Botanico de la Kalsa & Monreale', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_3_description',
                  'textarea',
                  'Passer les heures chaudes sous les racines aériennes des Ficus macrophylla du jardin botanique fondé en 1789, puis monter à Monreale pour détailler ses 228 colonnes jumelées.',
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
              {Z('stages_kicker', 'text', 'Itinéraire sur 4 à 5 jours', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-[#241D1A]">
              {Z('stages_heading', 'text', 'Les quatre mandamenti historiques, la Kalsa et la colline de Monreale', undefined, 'span')}
            </h2>
          </div>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_1_badge', 'text', 'Étape 01 · Palazzo dei Normanni & Cassaro', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_1_gps', 'text', '38.1111° N, 13.3536° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_1_title', 'text', 'La Chapelle Palatine de Roger II et les toits de la Cathédrale', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_1_text',
                'textarea',
                'Tout en haut du Cassaro — l’axe rectiligne tracé par les Phéniciens — le Palais des Normands abrite la Chapelle Palatine, consacrée en 1140. Sa nef centrale est coiffée d’un plafond en bois peint à stalactites (muqarnas) de tradition fatimide, tandis que ses parois scintillent de mosaïques byzantines. En redescendant vers la Cathédrale, monte sur ses toits en terrasses pour embrasser toute la cuvette montagneuse de la Conca d’Oro.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_2_badge', 'text', 'Étape 02 · Quattro Canti & Piazza Bellini', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_2_gps', 'text', '38.1147° N, 13.3622° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_2_title', 'text', 'Le théâtre octogonal du baroque et le duo Martorana – San Cataldo', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_2_text',
                'textarea',
                'Au croisement exact du Corso Vittorio Emanuele et de la Via Maqueda, les Quattro Canti forment une place octogonale dont les quatre façades concaves figurent les saisons et les saintes patronnes de Palerme. Juste derrière la Fontana Pretoria s’ouvre la Piazza Bellini : les trois dômes rouges de San Cataldo (1154) font face aux mosaïques de la Martorana et au couvent de Santa Caterina d’Alessandria.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_3_badge', 'text', 'Étape 03 · Albergheria & Oratoires', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_3_gps', 'text', '38.1128° N, 13.3608° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_3_title', 'text', 'Ballarò, Casa Professa et l’art du stuc blanc de Giacomo Serpotta', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_3_text',
                'textarea',
                'En t’enfonçant dans l’Albergheria par le marché de Ballarò, pousse la porte de l’église du Gesù (Casa Professa), chef-d’œuvre de marqueterie de marbres polychromes. À travers la ville, trois oratoires discrets — San Lorenzo, Santa Cita et San Domenico — dévoilent le travail de Giacomo Serpotta (1656-1732), qui transforma un mélange de chaux et de poudre de marbre en scènes théâtrales d’un blanc immaculé.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_4_badge', 'text', 'Étape 04 · La Kalsa & Orto Botanico', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_4_gps', 'text', '38.1131° N, 13.3728° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_4_title', 'text', 'Piazza Marina, Palazzo Abatellis et les ficus géants de Villa Giulia', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_4_text',
                'textarea',
                'Ancien quartier fortifié de l’émir au Xe siècle, la Kalsa s’organise autour du jardin Garibaldi sur la Piazza Marina, ombragé par un Ficus macrophylla planté en 1863. Dans la Via Alloro voisine, le Palazzo Abatellis — réaménagé avec sobriété par l’architecte Carlo Scarpa en 1953 — conserve L’Annonciation d’Antonello de Messine, à deux pas des allées de l’Orto Botanico.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_5_badge', 'text', 'Étape 05 · Parcs royaux normands', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_5_gps', 'text', '38.1167° N, 13.3411° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_5_title', 'text', 'Le palais d’été de la Zisa et le cloître de San Giovanni degli Eremiti', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_5_text',
                'textarea',
                'Hors des anciens remparts, les rois normands Guillaume Ier et Guillaume II firent édifier des pavillons de plaisance inspirés de l’architecture fatimide du Caire : la Zisa (de l’arabe al-Azîza, « la Splendide »), conçue avec des cheminées de ventilation et une fontaine intérieure, la Cuba, et le cloître fleuri de citronniers et de grenadiers de San Giovanni degli Eremiti.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_6_badge', 'text', 'Étape 06 · Monreale & Monte Pellegrino', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_6_gps', 'text', '38.0817° N, 13.2922° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_6_title', 'text', 'Le Duomo de Guillaume II à Monreale et l’ancienne Scala Vecchia', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_6_text',
                'textarea',
                'À huit kilomètres au-dessus de Palerme, la cathédrale de Monreale déploie 6 400 m² de mosaïques byzantines culminant dans le Christ Pantocrator de l’abside, et un cloître bénédictin dont aucun des 228 chapiteaux historiés n’est identique. Au nord de la baie, l’ancienne Scala Vecchia pavée grimpe à pied au Monte Pellegrino jusqu’à la grotte-sanctuaire de Santa Rosalia.',
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
              {Z('local_tip_kicker', 'text', 'Repère gourmand sur la Piazza Bellini', undefined, 'span')}
            </p>
            <p className="text-[#241D1A] leading-relaxed">
              {Z(
                'local_tip',
                'textarea',
                'Sur la Piazza Bellini, entre dans l’ancien monastère dominicain de Santa Caterina d’Alessandria par la porte de la Dolceria : les pâtissiers perpétuent les recettes conventuelles de cassata al forno et de cannoli garnis minute à la ricotta de brebis de Piana degli Albanesi, que tu peux déguster dans le calme du cloître des orangers avant de monter sur les terrasses.',
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
              {Z('cta_title', 'text', 'De Palerme vers les îles Éoliennes ou la côte ionienne', undefined, 'span')}
            </h2>
            <p className="text-[#E2D9C8] text-sm max-w-xl mx-auto mb-6">
              {Z(
                'cta_desc',
                'textarea',
                'Depuis la gare de Palermo Centrale, les trains longent la mer Tyrrhénienne vers Cefalù et Milazzo (embarquement pour les Éoliennes) ou traversent les collines de l’intérieur sicilien vers Catane et Syracuse.',
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/destinations/sicile/etoile"
                className="px-6 py-3 bg-action text-white rounded-sm text-xs uppercase tracking-[0.16em] font-medium hover:bg-action-fonce transition-colors"
              >
                {Z('cta_btn_etoile', 'text', 'Voir le carnet Îles Éoliennes', undefined, 'span')}
              </Link>
              <Link
                href="/destinations/sicile"
                className="px-6 py-3 border border-[#DED5C6]/40 text-[#F7F3EC] rounded-sm text-xs uppercase tracking-[0.16em] font-medium hover:border-[#F7F3EC] transition-colors"
              >
                {Z('cta_btn_back', 'text', '← Guide Sicile', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
