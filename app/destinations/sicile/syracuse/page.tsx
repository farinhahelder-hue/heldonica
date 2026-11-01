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

const PAGE = 'destinations-sicile-syracuse'

const metadata: Metadata = {
  title: 'Syracuse & Ortigia en Slow Travel : Pierre Blanche, Grèce Antique & Noto | Heldonica',
  description:
    'Carnet de route à Syracuse et dans le Val di Noto : île piétonne d’Ortigia, cathédrale incorporant le temple d’Athéna, parc archéologique de la Neapolis et réserve de Vendicari.',
  openGraph: {
    title: 'Syracuse & Ortigia en couple : carnet slow travel en Sicile | Heldonica',
    description:
      'Flâner sur la Piazza Duomo d’Ortigia où un temple dorique du Ve siècle av. J.-C. soutient une nef baroque, longer le Lungomare Alfeo et explorer Vendicari et Pantalica.',
    type: 'website',
    images: ['/og-default.jpg'],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile/syracuse',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function SyracusePage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="sicile-syracuse"
        title={zones.title || 'Syracuse'}
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
                'Aperçu interne du carnet Syracuse, Ortigia & Val di Noto (non indexé tant que la page figure dans unpublished-pages).',
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
              {Z('hero_badge', 'text', 'Sud-Est Sicilien · Côte Ionienne & Val di Noto · 37.0600° N, 15.2933° E', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-[#F7F3EC] mb-5 leading-tight">
              {Z(
                'hero_title',
                'text',
                'Syracuse & Ortigia : lumière de pierre blanche, mémoire grecque et lagunes de Vendicari',
                undefined,
                'span'
              )}
            </h1>
            <p className="text-lg text-[#E2D9C8] max-w-2xl leading-relaxed mb-6">
              {Z(
                'intro_text',
                'textarea',
                'Fondée en 734 avant notre ère par des colons grecs de Corinthe sur l’île d’Ortigia, Syracuse resplendit d’un calcaire blanc ivoire qui renvoie la lumière de la mer Ionienne à toute heure du jour. Sur la Piazza Duomo, les vingt-six colonnes doriques du temple d’Athéna forment aujourd’hui encore les murs porteurs de la cathédrale.',
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
                  'Presqu’île piétonne d’Ortigia · Train du Baroque vers Noto, Modica & Ragusa',
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
            {Z('highlights_heading', 'text', 'Ce qui ancre un séjour à Syracuse et dans le sud-est sicilien', undefined, 'span')}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_1_emoji', 'text', 'Île d’Ortigia', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_1_title', 'text', 'Piazza Duomo, Giudecca & Castello Maniace', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_1_description',
                  'textarea',
                  'Traverser la Piazza Duomo pavée de pierre blanche, admirer L’Enterrement de sainte Lucie peint par le Caravage en 1608, et marcher jusqu’à la pointe sud où le Castello Maniace s’avance dans les flots.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_2_emoji', 'text', 'Grèce antique', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_2_title', 'text', 'La Neapolis & la rivière aux papyrus du Ciane', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_2_description',
                  'textarea',
                  'Découvrir le grand Théâtre grec creusé dans le rocher du Temenite et les vergers d’agrumes des Latomies, puis longer la rivière Ciane bordée des seuls papyrus sauvages d’Europe.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
              <span className="text-xs uppercase tracking-widest text-eucalyptus block mb-2">
                {Z('highlight_3_emoji', 'text', 'Baroque & nature', undefined, 'span')}
              </span>
              <h3 className="font-serif text-lg text-[#241D1A] mb-2">
                {Z('highlight_3_title', 'text', 'Noto, Vendicari & les gorges calcaires de Pantalica', undefined, 'span')}
              </h3>
              <p className="text-sm text-[#5C5349] leading-relaxed">
                {Z(
                  'highlight_3_description',
                  'textarea',
                  'Rayonner vers les façades couleur miel de Noto, les marais côtiers de la réserve de Vendicari et le canyon karstique de l’Anapo à Pantalica.',
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
              {Z('stages_kicker', 'text', 'Itinéraire sur 3 à 5 jours', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-[#241D1A]">
              {Z('stages_heading', 'text', 'D’Ortigia aux canyons de Pantalica et aux lagunes de Vendicari', undefined, 'span')}
            </h2>
          </div>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_1_badge', 'text', 'Étape 01 · Temple d’Apollon & Marché', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_1_gps', 'text', '37.0642° N, 15.2928° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_1_title', 'text', 'Le plus ancien temple dorique de Sicile et les étals de la Via De Benedictis', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_1_text',
                'textarea',
                'Dès que l’on franchit le pont Umbertino pour entrer sur l’île d’Ortigia, les colonnes monolithiques du temple d’Apollon (début du VIe siècle av. J.-C.) marquent le seuil de la ville antique. Juste à côté s’anime chaque matin le marché de la Via Emanuele De Benedictis : tomates cerises de Pachino, amandes de Noto, citrons Femminello de Syracuse, câpres au sel et ricotta salée.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_2_badge', 'text', 'Étape 02 · Piazza Duomo d’Ortigia', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_2_gps', 'text', '37.0594° N, 15.2933° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_2_title', 'text', 'Quand le temple grec d’Athéna devient cathédrale baroque et l’église de Santa Lucia', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_2_text',
                'textarea',
                'Point culminant d’Ortigia, la Piazza Duomo dessine une ellipse allongée bordée des palais Beneventano del Bosco et Vermexio. Derrière la façade baroque d’Andrea Palma (XVIIIe siècle), l’intérieur de la cathédrale révèle la structure intacte du temple dorique d’Athéna érigé en 480 av. J.-C. À l’extrémité sud de la place, l’église Santa Lucia alla Badia abrite la toile monumentale peinte par le Caravage en 1608.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_3_badge', 'text', 'Étape 03 · Pointe sud & Giudecca', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_3_gps', 'text', '37.0536° N, 15.3006° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_3_title', 'text', 'La source d’Aréthuse, le Castello Maniace de Frédéric II et le mikvé byzantin', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_3_text',
                'textarea',
                'Sur le Lungomare Alfeo, la Fonte Aretusa est une résurgence karstique d’eau douce qui jaillit à quelques mètres de l’eau salée, peuplée de touffes de papyrus. À la pointe méridionale d’Ortigia, le Castello Maniace (1232-1240) garde l’entrée du Grand Port avec sa salle aux voûtes d’ogives gothiques. Remonte ensuite par les ruelles de la Giudecca, où subsiste sous le Palazzo Bianco un bain rituel juif (mikvé) creusé à dix-huit mètres sous la roche à l’époque byzantine.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_4_badge', 'text', 'Étape 04 · Neapolis & Villa Landolina', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_4_gps', 'text', '37.0758° N, 15.2750° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_4_title', 'text', 'Le Théâtre grec de 138 mètres de diamètre, l’Oreille de Denys et le musée Paolo Orsi', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_4_text',
                'textarea',
                'Sur la terre ferme, le parc archéologique de la Neapolis réunit le Théâtre grec — où Eschyle dirigea la première représentation des Perses en 472 av. J.-C. — et les Latomies plantées d’orangers et de magnolias au fond desquelles s’ouvre l’Oreille de Denys, grotte artificielle de 23 mètres de haut. Complète la visite par le musée archéologique régional Paolo Orsi.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_5_badge', 'text', 'Étape 05 · Réserve côtière & Val di Noto', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_5_gps', 'text', '36.8019° N, 15.0972° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_5_title', 'text', 'Les lagunes à flamants roses de Vendicari et la pierre dorée de Noto au couchant', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_5_text',
                'textarea',
                'À trente minutes au sud de Syracuse, la réserve naturelle de Vendicari protège un cordon littoral de maquis méditerranéen, de criques de sable clair (Calamosche, Marianelli) et de lagunes côtières où font halte les flamants roses et les hérons au pied de l’ancienne tonnara. En fin d’après-midi, monte à Noto : ses églises et palais en tuf calcaire prennent une teinte rose cuivrée au coucher du soleil.',
                undefined,
                'span'
              )}
            </p>
          </article>

          <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-eucalyptus font-semibold uppercase tracking-wider mb-2">
              <span>{Z('stage_6_badge', 'text', 'Étape 06 · Monts Hybléens UNESCO', undefined, 'span')}</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#5C5349]">
                <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                {Z('stage_6_gps', 'text', '37.1411° N, 15.0289° E', undefined, 'span')}
              </span>
            </div>
            <h3 className="text-xl font-serif text-[#241D1A] mb-3">
              {Z('stage_6_title', 'text', 'Marcher le long de l’ancienne voie ferrée des gorges de Pantalica et de la vallée de l’Anapo', undefined, 'span')}
            </h3>
            <p className="text-[#4A413A] leading-relaxed">
              {Z(
                'stage_6_text',
                'textarea',
                'Dans l’arrière-pays des monts Hybléens, la réserve naturelle de Pantalica est un profond canyon creusé par les rivières Anapo et Calcinara. Ses parois calcaires abritent près de cinq mille tombes rupestres protohistoriques et des oratoires byzantins troglodytiques. Le fond de la gorge se parcourt à pied ou à vélo sur le tracé plat et ombragé de platanes d’une ancienne ligne ferroviaire.',
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
              {Z('local_tip_kicker', 'text', 'Repère de lumière autour d’Ortigia', undefined, 'span')}
            </p>
            <p className="text-[#241D1A] leading-relaxed">
              {Z(
                'local_tip',
                'textarea',
                'Fais le tour complet des remparts d’Ortigia à pied deux fois dans la même journée : le matin côté est sur le Lungomare di Levante (quartier de la Graziella) face au soleil levant sur la mer Ionienne, et une demi-heure avant le crépuscule côté ouest sur le Lungomare Alfeo et le Largo Aretusa, quand la baie du Porto Grande s’embrase.',
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
              {Z('cta_title', 'text', 'Remonter la côte ionienne vers Catane, l’Etna et Taormine', undefined, 'span')}
            </h2>
            <p className="text-[#E2D9C8] text-sm max-w-xl mx-auto mb-6">
              {Z(
                'cta_desc',
                'textarea',
                'Syracuse est reliée toutes les heures en train régional à Catane (1h15) et à Taormine-Giardini (2h00), ainsi qu’aux cités baroques de Noto, Modica et Ragusa.',
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
