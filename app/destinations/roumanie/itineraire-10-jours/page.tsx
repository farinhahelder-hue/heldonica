import type { Metadata } from 'next'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'
import DayAccommodationBox from '@/components/itinerary/DayAccommodationBox'

export const revalidate = 86400

const PAGE = 'destinations-roumanie-itineraire-10-jours'

const metadata: Metadata = {
  title: 'Itinéraire Roumanie 10 jours | Transylvanie & Maramureș slow travel | Heldonica',
  description:
    'Grand itinéraire 10 jours en Roumanie : Brașov, Viscri, Sighișoara, Cluj-Napoca, Maramureș, Apuseni, Sibiu et Transfăgărășan. Testé en août 2026.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/itineraire-10-jours',
  },
  openGraph: {
    title: 'Itinéraire Roumanie 10 jours — Transylvanie, Apuseni & Maramureș | Heldonica',
    description:
      '10 jours entre églises fortifiées saxonnes, monastères en bois du Maramureș et crêtes des Carpates.',
    url: 'https://www.heldonica.fr/destinations/roumanie/itineraire-10-jours',
    type: 'article',
    images: [
      {
        url: 'https://www.heldonica.fr/images/destinations/roumanie/IMG_20260827_135023.jpg',
        width: 1200,
        height: 630,
        alt: 'Itinéraire Roumanie 10 jours — Heldonica',
      },
    ],
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-itineraire-10-jours', metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function Itineraire10JoursPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  if (!isPreview && isUnpublishedCmsPage('destinations-roumanie-itineraire-10-jours')) {
    return (
      <ComingSoonDestination
        slug="roumanie-itineraire-10-jours"
        title={zones.title || 'Itinéraire Roumanie — 10 jours'}
        country="Roumanie"
        hero_unsplash_url="/images/destinations/roumanie/IMG_20260827_135023.jpg"
        zones={zones}
      />
    )
  }

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html',
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

  const getCmsOrSetting = (zone: string, fallback: string) =>
    zones[`${PAGE}__${zone}`] ?? fallback

  const DAYS = [
    {
      day: 1,
      location: getCmsOrSetting('day_1_location', 'Bucarest → Brașov'),
      activity: getCmsOrSetting('day_1_activity_short', 'Train 2h30 + Piața Sfatului'),
      accommodation: getCmsOrSetting('day_1_acc_short', 'Casa Wagner'),
    },
    {
      day: 2,
      location: getCmsOrSetting('day_2_location', 'Brașov & Château de Bran'),
      activity: getCmsOrSetting('day_2_activity_short', 'Bran à 8h00 + Mont Tâmpa'),
      accommodation: getCmsOrSetting('day_2_acc_short', 'Casa Wagner'),
    },
    {
      day: 3,
      location: getCmsOrSetting('day_3_location', 'Viscri (UNESCO)'),
      activity: getCmsOrSetting('day_3_activity_short', 'Église fortifiée + ruelles saxonnes'),
      accommodation: getCmsOrSetting('day_3_acc_short', 'Viscri 125'),
    },
    {
      day: 4,
      location: getCmsOrSetting('day_4_location', 'Sighișoara'),
      activity: getCmsOrSetting('day_4_activity_short', 'Citadelle habitée + Escalier des Écoliers'),
      accommodation: getCmsOrSetting('day_4_acc_short', 'Casa Georgius Krauss'),
    },
    {
      day: 5,
      location: getCmsOrSetting('day_5_location', 'Cluj-Napoca (via Turda)'),
      activity: getCmsOrSetting('day_5_activity_short', 'Salina Turda + centre universitaire'),
      accommodation: getCmsOrSetting('day_5_acc_short', 'Hôtel Beyfin'),
    },
    {
      day: 6,
      location: getCmsOrSetting('day_6_location', 'Maramureș — Breb & Bârsana'),
      activity: getCmsOrSetting('day_6_activity_short', 'Monastère en bois de Bârsana + village de Breb'),
      accommodation: getCmsOrSetting('day_6_acc_short', 'Ferme traditionnelle à Breb'),
    },
    {
      day: 7,
      location: getCmsOrSetting('day_7_location', 'Maramureș — Săpânța & Vallée de l’Iza'),
      activity: getCmsOrSetting('day_7_activity_short', 'Cimetière Joyeux + églises UNESCO de Poienile Izei'),
      accommodation: getCmsOrSetting('day_7_acc_short', 'Ferme traditionnelle à Breb'),
    },
    {
      day: 8,
      location: getCmsOrSetting('day_8_location', 'Monts Apuseni → Sibiu'),
      activity: getCmsOrSetting('day_8_activity_short', 'Village de Rimetea + arrivée à Sibiu'),
      accommodation: getCmsOrSetting('day_8_acc_short', 'Maison d’hôtes Piața Mică'),
    },
    {
      day: 9,
      location: getCmsOrSetting('day_9_location', 'Sibiu & Route Transfăgărășan'),
      activity: getCmsOrSetting('day_9_activity_short', 'Lac glaciaire Bâlea (2 034 m) + Vieille Ville'),
      accommodation: getCmsOrSetting('day_9_acc_short', 'Maison d’hôtes Piața Mică'),
    },
    {
      day: 10,
      location: getCmsOrSetting('day_10_location', 'Sibiu → Bucarest'),
      activity: getCmsOrSetting('day_10_activity_short', 'Vallée de l’Olt + monastère de Cozia'),
      accommodation: '—',
    },
  ]

  const departText = getCmsOrSetting(
    'depart',
    'Août 2026 • Couple • Train + voiture de location • ~1 480 € tout compris pour 2'
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main className="min-h-screen bg-[#FAF7F2]">
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
                'Aperçu interne de l’itinéraire Roumanie 10 jours (non indexé).',
                undefined,
                'span'
              )}
            </span>
          </div>
        )}

        {/* Hero */}
        <section className="bg-stone-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-stone-300 text-sm mb-4">
              <Link href="/destinations/roumanie" className="hover:text-white transition-colors">
                {Z('breadcrumb_roumanie', 'text', 'Roumanie', undefined, 'span')}
              </Link>
              <span>/</span>
              <span>{Z('breadcrumb_current', 'text', 'Itinéraire 10 jours', undefined, 'span')}</span>
            </div>
            <span className="inline-block bg-teal text-white text-xs font-medium px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              {Z('hero_kicker', 'text', 'Testé par Heldonica • La grande boucle', undefined, 'span')}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight">
              {Z('hero_title', 'text', 'Roumanie en 10 jours', undefined, 'span')}
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl leading-relaxed mb-8">
              {Z(
                'hero_subtitle',
                'textarea',
                'La grande traversée slow travel : des cités saxonnes de Transylvanie aux églises en bois du Maramureș et aux crêtes des monts Apuseni et Făgăraș.',
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_1', 'text', '10 jours / 9 nuits', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_2', 'text', 'Août 2026', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_3', 'text', 'Train + voiture de location (8j)', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full font-semibold">
                {Z('chip_4', 'text', '~1 480 € pour 2 tout compris', undefined, 'span')}
              </span>
            </div>
          </div>
        </section>

        {/* Tableau récapitulatif */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-sm border border-[#DED5C6] overflow-hidden">
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-serif text-lg text-stone-900">
                {Z('summary_title', 'text', "Aperçu de l'itinéraire", undefined, 'span')}
              </h2>
              <span className="text-xs text-stone-500">{departText}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">{Z('th_day', 'text', 'Jour', undefined, 'span')}</th>
                    <th className="px-6 py-3 text-left">{Z('th_city', 'text', 'Ville', undefined, 'span')}</th>
                    <th className="px-6 py-3 text-left">{Z('th_activity', 'text', 'Activité', undefined, 'span')}</th>
                    <th className="px-6 py-3 text-left">{Z('th_night', 'text', 'Nuit', undefined, 'span')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {DAYS.map((d) => (
                    <tr key={d.day} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-eucalyptus whitespace-nowrap">J{d.day}</td>
                      <td className="px-6 py-3.5 font-medium text-stone-900">{d.location}</td>
                      <td className="px-6 py-3.5 text-stone-600">{d.activity}</td>
                      <td className="px-6 py-3.5 text-stone-500">{d.accommodation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Jours détaillés */}
        <section className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
          {/* J1 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J1</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_1_title', 'text', 'Bucarest → Brașov', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_1_text',
                'textarea',
                'Arrivée à Bucarest et train direct depuis la Gara de Nord jusqu’à Brașov (2h30). Installation sur la Piața Sfatului et marche vespérale le long des anciens remparts sous le mont Tâmpa.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_1_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_1_tip',
                  'textarea',
                  'Commencer par le train entre Bucarest et Brașov permet d’économiser deux jours de location de voiture tout en traversant la vallée de la Prahova sans embouteillages.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={1}
              departText={departText}
              cityFallback={getCmsOrSetting('day_1_city_fb', 'Brașov')}
              accommodationFallback={getCmsOrSetting('day_1_acc_fb', 'Casa Wagner')}
            />
          </div>

          {/* J2 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J2</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_2_title', 'text', 'Château de Bran à l’aube & Brașov', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_2_text',
                'textarea',
                'Prise en charge du véhicule à 7h30 et arrivée à Bran pour l’ouverture de 8h00. Après la visite, détour par les gorges calcaires de Zărnești dans le massif de Piatra Craiului, puis après-midi consacré à l’Église Noire et aux tours de guet de Brașov.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_2_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_2_tip',
                  'textarea',
                  'Monte à la Tour Blanche (Turnul Alb) en fin de journée : le point de vue plonge directement sur la nef gothique de l’Église Noire et les toits de tuiles rouges.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={2}
              departText={departText}
              cityFallback={getCmsOrSetting('day_2_city_fb', 'Brașov')}
              accommodationFallback={getCmsOrSetting('day_2_acc_fb', 'Casa Wagner')}
            />
          </div>

          {/* J3 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J3</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_3_title', 'text', 'Viscri — Le village saxon hors des grands axes', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_3_text',
                'textarea',
                'Route vers Viscri (1h15). Visite de son église fortifiée blanche classée à l’UNESCO, marche sur les chemins de prairie qui entourent le village et dîner à la table d’une ferme saxonne.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_3_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_3_tip',
                  'textarea',
                  'Les maisons d’hôtes de Viscri n’ont que quelques chambres chacune : réserve cette étape en premier pour dormir dans une véritable cour saxonne.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={3}
              departText={departText}
              cityFallback={getCmsOrSetting('day_3_city_fb', 'Viscri')}
              accommodationFallback={getCmsOrSetting('day_3_acc_fb', 'Viscri 125')}
            />
          </div>

          {/* J4 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J4</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_4_title', 'text', 'Sighișoara — Citadelle médiévale', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_4_text',
                'textarea',
                'Trajet court (45 min) jusqu’à Sighișoara. Exploration des neuf tours de corporations, montée par l’Escalier couvert des Écoliers et soirée paisible dans la haute ville une fois les excursionnistes repartis.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_4_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_4_tip',
                  'textarea',
                  'Fais un crochet par Saschiz (20 min avant Sighișoara) pour observer son clocher défensif inspiré de celui de Sighișoara et acheter du miel de fleurs sauvages.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={4}
              departText={departText}
              cityFallback={getCmsOrSetting('day_4_city_fb', 'Sighișoara')}
              accommodationFallback={getCmsOrSetting('day_4_acc_fb', 'Casa Georgius Krauss')}
            />
          </div>

          {/* J5 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J5</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_5_title', 'text', 'Salina Turda & Cluj-Napoca', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_5_text',
                'textarea',
                'Route vers le nord-ouest (2h15) avec arrêt à la mine de sel souterraine de Turda (Salina Turda, 120 m sous terre, lac souterrain en barque). Arrivée à Cluj-Napoca l’après-midi : Piața Unirii, église Saint-Michel, jardin botanique Alexandru Borza et cafés de la Strada Piezișă.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_5_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_5_tip',
                  'textarea',
                  'Dans la mine de sel de Turda, la température reste à 11 °C toute l’année : garde un pull dans le coffre même en plein mois d’août.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={5}
              departText={departText}
              cityFallback={getCmsOrSetting('day_5_city_fb', 'Cluj-Napoca')}
              accommodationFallback={getCmsOrSetting('day_5_acc_fb', 'Hôtel Beyfin (Piața Avram Iancu)')}
            />
          </div>

          {/* J6 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J6</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_6_title', 'text', 'Montée vers le Maramureș : Bârsana & Breb', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_6_text',
                'textarea',
                'Traversée vers le nord jusqu’au Maramureș (3h00). Les portails monumentaux sculptés en chêne annoncent le changement de région. Visite du monastère en bois de Bârsana aux flèches élancées de 57 mètres, puis installation dans le village de Breb au pied du massif du Gutâi.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_6_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_6_tip',
                  'textarea',
                  'À Breb, laisse la voiture à l’entrée du village et parcours à pied les chemins bordés de meules de foin coniques jusqu’à l’église en bois des Saints-Archanges (1622).',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={6}
              departText={departText}
              cityFallback={getCmsOrSetting('day_6_city_fb', 'Breb (Maramureș)')}
              accommodationFallback={getCmsOrSetting('day_6_acc_fb', 'Maison en bois traditionnelle à Breb')}
            />
          </div>

          {/* J7 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J7</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_7_title', 'text', 'Săpânța & les églises en bois de la vallée de l’Iza', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_7_text',
                'textarea',
                'Journée complète dans le Maramureș historique : découverte du Cimetière Joyeux de Săpânța (Cimitirul Vesel) et de ses stèles bleu outremer sculptées par Stan Ioan Pătraș, puis retour par les églises en bois classées UNESCO de Desești et Poienile Izei aux fresques intérieures peintes sur toile et bois.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_7_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_7_tip',
                  'textarea',
                  'Arrête-toi à Sârbi pour voir fonctionner les tourbillons à eau traditionnels (vâltoare) et le moulin hydraulique en bois toujours utilisé par les familles du village.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={7}
              departText={departText}
              cityFallback={getCmsOrSetting('day_7_city_fb', 'Breb (Maramureș)')}
              accommodationFallback={getCmsOrSetting('day_7_acc_fb', 'Maison en bois traditionnelle à Breb')}
            />
          </div>

          {/* J8 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J8</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_8_title', 'text', 'Des monts Apuseni (Rimetea) à Sibiu', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_8_text',
                'textarea',
                'Descente vers le sud en longeant le massif karstique des monts Apuseni. Halte déjeuner à Rimetea, village aux maisons d’un blanc immaculé alignées aux volets verts sous la falaise calcaire de Piatra Secuiului, avant de rejoindre Sibiu en fin d’après-midi.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_8_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_8_tip',
                  'textarea',
                  'Entre Aiud et Rimetea, la route départementale DJ107M traverse les gorges de Vălișoara (Cheile Vălișoarei) : un défilé rocheux spectaculaire où l’on s’arrête facilement.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={8}
              departText={departText}
              cityFallback={getCmsOrSetting('day_8_city_fb', 'Sibiu')}
              accommodationFallback={getCmsOrSetting('day_8_acc_fb', 'Maison d’hôtes Piața Mică')}
            />
          </div>

          {/* J9 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J9</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_9_title', 'text', 'Sibiu & la route Transfăgărășan', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_9_text',
                'textarea',
                'Matinée sur la route alpine Transfăgărășan jusqu’au lac glaciaire Bâlea (2 034 m). Retour à Sibiu l’après-midi pour explorer la Ville Haute (Piața Mare, Palais Brukenthal, Piața Huet) et le musée en plein air ASTRA dans la forêt de Dumbrava.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_9_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_9_tip',
                  'textarea',
                  'Le musée ASTRA au sud de Sibiu rassemble plus de 300 moulins, églises et fermes authentiques autour d’un grand lac boisé : compte deux heures de marche paisible en fin d’après-midi.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={9}
              departText={departText}
              cityFallback={getCmsOrSetting('day_9_city_fb', 'Sibiu')}
              accommodationFallback={getCmsOrSetting('day_9_acc_fb', 'Maison d’hôtes Piața Mică')}
            />
          </div>

          {/* J10 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J10</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_10_title', 'text', 'Sibiu → Bucarest par la vallée de l’Olt', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_10_text',
                'textarea',
                'Descente vers la Valachie par les gorges de l’Olt, halte au monastère de Cozia (1388) au bord de l’eau, puis retour vers Bucarest Otopeni pour le vol du soir.',
                undefined,
                'span'
              )}
            </p>
          </div>
        </section>

        {/* Budget détaillé */}
        <section className="bg-stone-100 py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl text-stone-900 mb-6">
              {Z('budget_title', 'text', 'Budget réel (pour 2 personnes)', undefined, 'span')}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_1_label', 'text', 'Hébergements (9 nuits)', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_1_val', 'text', '710 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_1_sub', 'text', 'Maisons saxonnes & fermes en bois', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_2_label', 'text', 'Transports sur place', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_2_val', 'text', '320 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_2_sub', 'text', 'Train + location voiture 8j + essence', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_3_label', 'text', 'Repas & tables d’hôtes', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_3_val', 'text', '340 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_3_sub', 'text', 'Dîners fermiers inclus au Maramureș', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_4_label', 'text', 'Visites & entrées', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_4_val', 'text', '110 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_4_sub', 'text', 'Salina Turda, églises UNESCO, musées', undefined, 'span')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation autres durées */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="font-serif text-xl text-stone-900 mb-5">
            {Z('other_durations_title', 'text', 'Autres durées disponibles', undefined, 'span')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/destinations/roumanie/itineraire-5-jours"
              className="group bg-white rounded-xl border border-[#DED5C6] p-5 hover:border-eucalyptus transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                  {Z('other_5j_title', 'text', 'Roumanie en 5 jours', undefined, 'span')}
                </p>
                <p className="text-stone-500 text-sm">
                  {Z('other_5j_sub', 'text', 'Format court : Brașov, Viscri & Sibiu', undefined, 'span')}
                </p>
              </div>
              <span className="text-eucalyptus font-bold text-lg">→</span>
            </Link>
            <Link
              href="/destinations/roumanie/itineraire-7-jours"
              className="group bg-white rounded-xl border border-[#DED5C6] p-5 hover:border-eucalyptus transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                  {Z('other_7j_title', 'text', 'Roumanie en 7 jours', undefined, 'span')}
                </p>
                <p className="text-stone-500 text-sm">
                  {Z('other_7j_sub', 'text', 'Transylvanie complète + Transfăgărășan', undefined, 'span')}
                </p>
              </div>
              <span className="text-eucalyptus font-bold text-lg">→</span>
            </Link>
          </div>
          <div className="mt-8 pt-6 border-t border-stone-200">
            <Link href="/destinations/roumanie" className="text-sm text-eucalyptus font-semibold hover:underline">
              {Z('back_link', 'text', '← Retour au guide Roumanie', undefined, 'span')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
