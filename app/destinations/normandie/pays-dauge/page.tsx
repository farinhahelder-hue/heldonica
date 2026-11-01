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

const PAGE = 'destinations-normandie-pays-dauge'

const metadata: Metadata = {
  title: 'Pays d’Auge en couple : carnet slow travel entre vergers et colombages | Heldonica',
  description:
    'Explorer le Pays d’Auge en couple : Beuvron-en-Auge, Route du Cidre à Cambremer, Honfleur au lever du jour, Beaumont-en-Auge et fromageries AOP.',
  openGraph: {
    title: 'Pays d’Auge en couple : carnet slow travel | Heldonica',
    description:
      'Des ruelles d’ardoise d’Honfleur aux pressoirs à cidre de Cambremer et aux manoirs à pans de bois du Pays d’Auge.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/normandie/pays-dauge',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function PaysDaugePage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="normandie-pays-dauge"
        title={zones.title || "Pays d'Auge"}
        country="Normandie"
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
                'Aperçu interne du carnet Pays d’Auge (non indexé tant que la page figure dans unpublished-pages).',
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
              {Z('hero_badge', 'text', 'Normandie · Calvados & Orne · 49.1889° N, 0.0456° O', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-[#F7F3EC] mb-5 leading-tight">
              {Z(
                'hero_title',
                'text',
                'Pays d’Auge : vergers de haute-tige, chemins creux et manoirs à colombages',
                undefined,
                'span'
              )}
            </h1>
            <p className="text-lg text-[#E2D9C8] max-w-2xl leading-relaxed mb-6">
              {Z(
                'intro_text',
                'textarea',
                "Entre la vallée de la Touques et celle de la Dives, le Pays d'Auge déploie un relief de collines douces où les pommiers de haute-tige abritent les vaches normandes. On quitte la côte à l'aube pour suivre les petites routes départementales bordées de haies vives, de haras et de pressoirs centenaires.",
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
                  'Route du Cidre AOP · 6 étapes entre Honfleur, Cambremer et Orbec',
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
            {Z('highlights_kicker', 'text', 'L’âme du bocage', undefined, 'span')}
          </p>
          <h2 className="text-2xl font-serif text-[#241D1A] mb-6">
            {Z('highlights_heading', 'text', 'Trois repères pour savourer le Pays d’Auge', undefined, 'span')}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_1_emoji', 'text', 'Architecture rurale', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_1_title', 'text', 'Colombages, tuiles et brique vernissée', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_1_description',
                  'textarea',
                  'Des halles de Beuvron-en-Auge au manoir de Coupesarte entouré de douves, le bois de chêne sculpté dialogue avec le damier de pierre et de silex.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_2_emoji', 'text', 'Caves & vergers', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_2_title', 'text', 'Cidre AOP Pays d’Auge & Pommeau', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_2_description',
                  'textarea',
                  'Ici, les cidres de fermentation naturelle assemblent variétés amères, douces-amères et acidulées récoltées sous des arbres de plein vent.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_3_emoji', 'text', 'Trois AOP laitières', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_3_title', 'text', 'Pont-l’Évêque, Livarot & Camembert au lait cru', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_3_description',
                  'textarea',
                  'Les prairies humides du bocage augeron ont donné naissance aux trois plus anciens fromages normands moulés à la louche.',
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
              {Z('stages_kicker', 'text', 'De l’estuaire aux collines intérieures', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-[#241D1A]">
              {Z('stages_heading', 'text', 'Nos 6 étapes à travers le Pays d’Auge', undefined, 'span')}
            </h2>
          </div>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_1_badge', 'text', 'Étape 01 · Port d’ardoise à l’aube', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_1_gps', 'text', '49.4194° N, 0.2328° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_1_title', 'text', 'Honfleur : l’église Sainte-Catherine et le quartier de l’Enclos dès 8h00', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_1_text',
                'textarea',
                'Honfleur ne se savoure qu’avant 9h30 ou en semaine hors saison. Lorsque le Vieux Bassin est encore lisse comme un miroir, monte vers l’église Sainte-Catherine bâtie au XVe siècle par les charpentiers de marine sous la forme de deux coques de navire renversées, puis grimpe vers la chapelle Notre-Dame-de-Grâce sous les grands arbres de la Côte de Grâce.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_2_badge', 'text', 'Étape 02 · Balcon sur la vallée de la Touques', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_2_gps', 'text', '49.2783° N, 0.1103° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_2_title', 'text', 'Beaumont-en-Auge : le bourg perché des mathématiciens et des peintres', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_2_text',
                'textarea',
                'À dix minutes au sud de Pont-l’Évêque, Beaumont-en-Auge aligne ses maisons à colombages pastel le long d’une crête calme. Depuis le petit jardin public derrière l’ancien prieuré bénédictin, le regard porte sur des kilomètres de prairies bocagères et de pommiers sans un seul bâtiment moderne.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_3_badge', 'text', 'Étape 03 · Place aux halles', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_3_gps', 'text', '49.1889° N, 0.0456° O', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_3_title', 'text', 'Beuvron-en-Auge et la chapelle perchée de Clermont-en-Auge', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_3_text',
                'textarea',
                'Autour de sa halle centrale en bois, Beuvron-en-Auge rassemble un ensemble remarquable de demeures à pans de bois des XVIIe et XVIIIe siècles et l’ancien manoir du Lieu Hocquart. Après avoir traversé le village, monte à pied ou en voiture jusqu’à la butte de Clermont-en-Auge (140 m) pour embrasser toute la plaine de la Dives.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_4_badge', 'text', 'Étape 04 · Boucle de 40 km', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_4_gps', 'text', '49.1525° N, 0.0481° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_4_title', 'text', 'Cambremer, Saint-Ouen-le-Pin et la Route du Cidre', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_4_text',
                'textarea',
                'Balisée par le panneau « Cru de Cambremer », cette boucle champêtre relie Bonnebosq, Grandouet (et sa minuscule église entourée de pressoirs à longue étreinte) et les jardins du Pays d’Auge. Les producteurs y reçoivent sur rendez-vous ou en journée pour faire déguster cidres bruts non pasteurisés, poirés et Calvados élevés en fûts de chêne.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_5_badge', 'text', 'Étape 05 · Manoir sur douves', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_5_gps', 'text', '49.0586° N, 0.1061° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_5_title', 'text', 'Le manoir de Coupesarte et le château de Saint-Germain-de-Livet', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_5_text',
                'textarea',
                'Au sud de Lisieux, deux joyaux architecturaux se reflètent dans leurs douves en eau : le manoir de Coupesarte (XVe siècle), entièrement bâti en pans de bois sur hourdis de brique, et le château de Saint-Germain-de-Livet dont la façade à damier de pierre blanche et de briques vernissées vertes est entourée de paons en liberté.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_6_badge', 'text', 'Étape 06 · Savoir-faire fromager', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_6_gps', 'text', '49.0067° N, 0.1539° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_6_title', 'text', 'De Livarot à Orbec : les vallées fromagères du sud augeron', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_6_text',
                'textarea',
                'En descendant la vallée de la Vie et de l’Orbiquet jusqu’à Livarot et Orbec, le paysage se fait plus encaissé et boisé. C’est le fief du Livarot entouré de ses cinq laîches de roseau (« le Colonel ») et des marchés fermiers où l’on achète directement beurre cru baratté, crème épaisse et teurgoule cuite cinq heures au four.',
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
              {Z('local_tip_kicker', 'text', 'Repère de dégustation à la ferme', undefined, 'span')}
            </p>
            <p className="text-[#241D1A] leading-relaxed">
              {Z(
                'local_tip',
                'textarea',
                'Sur la Route du Cidre autour de Cambremer, repère la mention « Cidre AOP Pays d’Auge — prise de mousse naturelle en bouteille » : contrairement aux cidres gazéifiés industriels, sa bulle fine provient uniquement de la fermentation lente en cave fraîche.',
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
              {Z('cta_title', 'text', 'Construire ton week-end prolongé en Normandie', undefined, 'span')}
            </h2>
            <p className="text-[#E2D9C8] text-sm max-w-xl mx-auto mb-6">
              {Z(
                'cta_desc',
                'textarea',
                'Associe deux nuits dans un pressoir du Pays d’Auge à une halte architecturale au Havre ou sur les falaises d’Étretat.',
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/destinations/normandie/le-havre"
                className="px-6 py-3 bg-action text-white rounded-sm text-xs uppercase tracking-[0.16em] font-medium hover:bg-action-fonce transition-colors"
              >
                {Z('cta_btn_havre', 'text', 'Voir Le Havre', undefined, 'span')}
              </Link>
              <Link
                href="/destinations/normandie"
                className="px-6 py-3 border border-[#DED5C6]/40 text-[#F7F3EC] rounded-sm text-xs uppercase tracking-[0.16em] font-medium hover:border-[#F7F3EC] transition-colors"
              >
                {Z('cta_btn_back', 'text', '← Guide Normandie', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
