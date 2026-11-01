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

const PAGE = 'destinations-sicile-taormine'

const metadata: Metadata = {
  title: 'Taormine & Monts Péloritains en Slow Travel : Théâtre Antique & Alcantara | Heldonica',
  description:
    'Carnet de route à Taormine hors foule : Théâtre antique à l’ouverture face à l’Etna, jardins de la Villa Comunale, sentier des Saraceni vers Castelmola et gorges de l’Alcantara.',
  openGraph: {
    title: 'Taormine & Alcantara en couple : carnet slow travel en Sicile | Heldonica',
    description:
      'Entrer le premier au Théâtre gréco-romain à 9h00 du matin, grimper à pied par le sentier des Saraceni jusqu’à Castelmola et remonter les orgues basaltiques de l’Alcantara.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile/taormine',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function TaorminePage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="sicile-taormine"
        title={zones.title || 'Taormine'}
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
                'Aperçu interne du carnet Taormine, Castelmola & Alcantara (non indexé tant que la page figure dans unpublished-pages).',
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
              {Z('hero_badge', 'text', 'Côte Ionienne · Monte Tauro & Monts Péloritains · 37.8516° N, 15.2853° E', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-[#F7F3EC] mb-5 leading-tight">
              {Z(
                'hero_title',
                'text',
                'Taormine & les monts Péloritains : balcon antique sur l’Etna, jardins botaniques et gorges de lave',
                undefined,
                'span'
              )}
            </h1>
            <p className="text-lg text-[#E2D9C8] max-w-2xl leading-relaxed mb-6">
              {Z(
                'intro_text',
                'textarea',
                'Suspendue à deux cents mètres au-dessus de la mer Ionienne sur une terrasse rocheuse du Monte Tauro, Taormine offre la courbe de la baie de Naxos dominée par les trois mille trois cents mètres de l’Etna. En décalant ses horaires vers l’aube et la fin d’après-midi, on découvre ses jardins ornithologiques, ses sentiers muletiers vers Castelmola et les canyons basaltiques de l’Alcantara.',
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
                  'Gare historique de Taormina-Giardini · Sentier des Saraceni & Vallée de l’Alcantara',
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
            {Z('highlights_heading', 'text', 'Comment aborder Taormine et son arrière-pays à contre-courant', undefined, 'span')}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_1_emoji', 'text', 'Ouverture à 9h00', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_1_title', 'text', 'Le Théâtre antique & les jardins de Lady Trevelyan', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_1_description',
                  'textarea',
                  'Franchir les portes du Teatro Antico dès l’ouverture matinale quand la lumière de l’est éclaire de face le cône de l’Etna à travers les brèches de briques romaines, puis descendre vers la Villa Comunale.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_2_emoji', 'text', 'Sentier vertical', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_2_title', 'text', 'La montée à pied vers la Madonna della Rocca & Castelmola', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_2_description',
                  'textarea',
                  'Quitter le centre par l’escalier des Saraceni taillé dans la falaise pour atteindre la chapelle rupestre de la Madonna della Rocca et le nid d’aigle médiéval de Castelmola à 529 mètres.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_3_emoji', 'text', 'Canyon & crêtes', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_3_title', 'text', 'Les gorges basaltiques de l’Alcantara & Savoca', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_3_description',
                  'textarea',
                  'Explorer le canyon de prismes hexagonaux creusé par le fleuve Alcantara dans une coulée du mont Moio, et grimper vers les crêtes des monts Péloritains à Savoca et Casalvecchio Siculo.',
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
              {Z('stages_kicker', 'text', 'Itinéraire sur 2 à 4 jours', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-[#241D1A]">
              {Z('stages_heading', 'text', 'De la réserve d’Isola Bella aux crêtes des monts Péloritains', undefined, 'span')}
            </h2>
          </div>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_1_badge', 'text', 'Étape 01 · Teatro Antico & Naumachie', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_1_gps', 'text', '37.8522° N, 15.2922° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_1_title', 'text', 'Une scène hellénistique remaniée par Rome face à la mer et au volcan', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_1_text',
                'textarea',
                'Fondé au IIIe siècle avant notre ère sous Hiéron II de Syracuse puis agrandi en briques rouges par les Romains, le Théâtre antique de Taormine mesure 109 mètres de diamètre. Sa singularité tient à l’effondrement partiel du mur de scène (frons scenae), qui découpe la côte calabraise à gauche, la baie de Giardini-Naxos au centre et le sommet de l’Etna à droite.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_2_badge', 'text', 'Étape 02 · Villa Comunale & Palazzo Corvaja', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_2_gps', 'text', '37.8506° N, 15.2894° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_2_title', 'text', 'Les pavillons ornithologiques de Lady Florence Trevelyan et le gothique sicilien', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_2_text',
                'textarea',
                'À la fin du XIXe siècle, la naturaliste écossaise Lady Florence Trevelyan transforma le rebord méridional de la falaise de Taormine en un parc botanique et ornithologique ponctué de pavillons excentriques en brique, bois et pierre de lave — les Beehives, conçus pour observer les oiseaux migrateurs face à l’Etna. Dans le bourg, le Palazzo Corvaja marie une tour arabe du XIe siècle et des fenêtres géminées gothiques-catalanes.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_3_badge', 'text', 'Étape 03 · Réserve naturelle à l’aube', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_3_gps', 'text', '37.8503° N, 15.3008° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_3_title', 'text', 'L’îlot botanique d’Isola Bella relié à la côte par un tombolo de galets', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_3_text',
                'textarea',
                'Acquis par Lady Trevelyan en 1890 avant de devenir réserve naturelle régionale gérée par l’université de Catane, l’îlot calcaire d’Isola Bella est relié au rivage par une étroite langue de galets que l’on traverse pieds nus dans l’eau claire. Descends à pied dès 7h30 par l’escalier de la Via Pirandello pour profiter de la crique dans un silence complet.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_4_badge', 'text', 'Étape 04 · Castelmola & Monte Venere', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_4_gps', 'text', '37.8592° N, 15.2778° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_4_title', 'text', 'La Via dei Saraceni et le belvédère de Castelmola à 529 mètres d’altitude', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_4_text',
                'textarea',
                'Depuis Porta Pasquale, l’escalier pavé des Saraceni grimpe en lacets serrés jusqu’à l’ermitage de la Madonna della Rocca — dont la voûte est le rocher dolomitique lui-même — avant de poursuivre jusqu’à Castelmola. Perché sur un piton calcaire vertical, ce village piétonnier à la place pavée en mosaïque de lave noire et de pierre blanche est aussi le point de départ vers le sommet du Monte Venere (884 m).',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_5_badge', 'text', 'Étape 05 · Vallée de l’Alcantara', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_5_gps', 'text', '37.8792° N, 15.1744° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_5_title', 'text', 'Les orgues prismatiques de basalte et la Cuba byzantine de Castiglione di Sicilia', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_5_text',
                'textarea',
                'À quinze kilomètres à l’ouest de Taormine, le fleuve Alcantara marque la frontière géologique entre les calcaires des monts Péloritains et les laves de l’Etna. En refroidissant au contact de l’eau, une coulée préhistorique s’est fracturée en prismes hexagonaux réguliers de 25 mètres de haut. Plus haut dans la vallée, au pied de Castiglione di Sicilia, se dresse dans les vergers la Cuba di Santa Domenica, chapelle rurale byzantine du VIIe siècle.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_6_badge', 'text', 'Étape 06 · Crêtes des monts Péloritains', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_6_gps', 'text', '37.9558° N, 15.3408° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_6_title', 'text', 'Savoca, Forza d’Agrò et l’abbaye normande des Saints-Pierre-et-Paul d’Agrò', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_6_text',
                'textarea',
                'Au nord de Taormine, les monts Péloritains plongent dans le détroit de Messine en vallées encaissées (fiumare) dominées par les bourgs médiévaux de Forza d’Agrò et de Savoca. Dans le lit du torrent Agrò, au pied de Casalvecchio Siculo, se dresse l’église basilienne des Saints-Pierre-et-Paul d’Agrò, reconstruite en 1116 sous Roger II, mêlant arcs outrepassés arabes, coupoles byzantines et appareil polychrome de brique, de calcaire et de lave.',
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
              {Z('local_tip_kicker', 'text', 'Repère d’horaire à la Villa Comunale', undefined, 'span')}
            </p>
            <p className="text-[#241D1A] leading-relaxed">
              {Z(
                'local_tip',
                'textarea',
                'Visite les jardins de la Villa Comunale à deux moments précis : à l’ouverture matinale quand les rayons du soleil traversent la brume au-dessus de la baie de Naxos, ou une heure avant la fermeture du soir, lorsque les terrasses sud s’illuminent face au volcan et que les allées d’oliviers centenaires sont silencieuses.',
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
              {Z('cta_title', 'text', 'Rejoindre les vignobles de l’Etna Nord, Catane ou Syracuse', undefined, 'span')}
            </h2>
            <p className="text-[#E2D9C8] text-sm max-w-xl mx-auto mb-6">
              {Z(
                'cta_desc',
                'textarea',
                'Depuis la gare de Taormina-Giardini, tu rejoins en train Catane en 45 minutes, Syracuse en 2 heures, ou la gare de Riposto pour monter à bord du train Circumetnea vers Linguaglossa et Randazzo.',
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/destinations/sicile/catane"
                className="px-6 py-3 bg-action text-white rounded-sm text-xs uppercase tracking-[0.16em] font-medium hover:bg-action-fonce transition-colors"
              >
                {Z('cta_btn_catane', 'text', 'Voir le carnet Catane & Etna', undefined, 'span')}
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
