import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';
import DynamicArticleMap from '@/components/DynamicArticleMap';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import Script from 'next/script';
import PdfDownloadButton from '@/components/PdfDownloadButton';
import DaySummaryTable from '@/components/itinerary/DaySummaryTable';
import DayAccommodationBox from '@/components/itinerary/DayAccommodationBox';
import { buildPageMetadata } from '@/lib/page-metadata'

const SITE_URL = 'https://www.heldonica.fr';
const PAGE = "destinations-roumanie-itineraire-10-jours";
const DAYS: { day: number; location: string; activity: string; accommodation: string | null }[] = [{"day":1,"location":"Bucarest","activity":"Installation Floreasca, premier repas roumain","accommodation":"Hotel Cismigiu — 3*, centre, 55 €/nuit"},{"day":2,"location":"Sinaia","activity":"Château de Peleș, forêt des Carpates","accommodation":"Hotel Sinaia — 4*, vue montagne, 70 €/nuit"},{"day":3,"location":"Brașov","activity":"Vieille ville, rue Republicii, tramway nostalgique","accommodation":"Hotel Belvedere — 3*, vue citadelle, 50 €/nuit"},{"day":4,"location":"Sighișoara","activity":"Citadelle médiévale, tour de l'Horloge","accommodation":"Hotel Sighișoara — 3*, intra-muros, 45 €/nuit"},{"day":5,"location":"Viscri","activity":"Village saxon, église fortifiée UNESCO","accommodation":"Guesthouse Viscri — chez l'habitant, 35 €/nuit"},{"day":6,"location":"Cluj-Napoca","activity":"Arrivée, premiers pas en ville","accommodation":"Hotel Deja Vu — 3*, centre, 55 €/nuit"},{"day":7,"location":"Cluj-Napoca","activity":"Musée ethnographique Romulus Vuia, marché Piața Unirii, quartier Mănăștur","accommodation":"Hotel Deja Vu — 3*, centre, 55 €/nuit"},{"day":8,"location":"Maramureș","activity":"Route vers le nord, premiers villages en bois","accommodation":"Guesthouse Maramureș — chez l'habitant, 30 €/nuit"},{"day":9,"location":"Maramureș","activity":"Marché paysan du dimanche, villages de bois, églises UNESCO","accommodation":"Guesthouse Maramureș — chez l'habitant, 30 €/nuit"},{"day":10,"location":"Maramureș / Cluj-Napoca","activity":"Dernier petit déjeuner paysan, route retour Cluj, vol départ","accommodation":null}];

const metadata: Metadata = {
  title: "Roumanie 10 jours : grande traversée slow travel en couple | Heldonica",
  description: "Itinéraire Roumanie 10 jours testé sur place : Bucarest, Brașov, Sighișoara, Viscri, Cluj, Maramureș. Le circuit complet incluant la région la plus authentique du pays.",
  alternates: {
    canonical: `${SITE_URL}/destinations/roumanie/itineraire-10-jours`,
  },
  openGraph: {
    title: "Roumanie 10 jours : grande traversée slow travel en couple | Heldonica",
    description: "Circuit Roumanie complet testé sur le terrain : Transylvanie + Maramureș + Bucovine. 10 jours d'immersion.",
    url: `${SITE_URL}/destinations/roumanie/itineraire-10-jours`,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Itinéraire Roumanie 10 jours - Grande traversée slow travel",
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-itineraire-10-jours', metadata)
}


export default async function Itineraire10JoursPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  /*
   * `departText` est une valeur, pas un élément : il descend en prop dans
   * DaySummaryTable. On lit donc la zone directement. Le premier paramètre
   * s'appelle `zone` comme celui de Z ci-dessus — c'est ce nom que
   * check-cms-zones.mjs reconnaît pour rattacher un accesseur local.
   */
  const zoneText = (zone: string, fallback: string) => zones[`${PAGE}__${zone}`] ?? fallback

  const departText = zoneText('depart_text', "Vol retour depuis Cluj-Napoca");

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Article',
                  headline: 'Roumanie 10 jours : grande traversée slow travel en couple',
                  description: 'Circuit Roumanie complet testé sur le terrain : Transylvanie + Maramureș.',
                  author: { '@type': 'Organization', name: 'Heldonica' },
                  url: `${SITE_URL}/destinations/roumanie/itineraire-10-jours`,
                }),
              }}
            />
      <Header />
      <Script id="ga4-itinerary-view" strategy="lazyOnload">{`
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'itinerary_view', { destination: 'roumanie', duration: '10' });
              }
            `}</Script>      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              {Z('hero_badge', 'text', "Roumanie — Itinéraire 10 jours", undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              {Z('hero_title', 'text', "Roumanie 10 jours : grande traversée slow travel", undefined, 'span')}
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              {Z('hero_description', 'textarea', "Du delta urbain de Bucarest au Maramureș profond — la Roumanie dans toute sa diversité, à un rythme qui laisse place à l'imprévu.", undefined, 'span')}
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing pt-0 -mt-6">
          <div className="container max-w-4xl">
            <div className="rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-eucalyptus/10 text-eucalyptus px-3 py-1 text-xs font-semibold">Testé par Heldonica</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">{Z('chip_1', 'text', "2 visites", undefined, 'span')}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 text-stone-600 px-3 py-1 text-xs font-semibold">{Z('chip_2', 'text', "Septembre 2024", undefined, 'span')}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">{Z('chip_3', 'text', "Automne doré", undefined, 'span')}</span>
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {Z('blurb', 'html', "Cet itinéraire est le plus complet qu'on ait testé. Les 3 jours supplémentaires dans le Maramureș font toute la différence — c'est là que la Roumanie révèle son âme la plus authentique. <strong>Budget réel : 1 600 € pour deux, tout compris.</strong>", undefined, 'span')}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing pt-0">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-serif text-mahogany mb-6">Aperçu du circuit</h2>
            <div className="overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full text-sm table-auto">
                <thead className="bg-stone-50 text-stone-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Jour</th>
                    <th className="px-4 py-3 text-left">Ville</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Activité</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Nuit</th>
                  </tr>
                </thead>
                <DaySummaryTable page={PAGE} days={DAYS} />
              </table>
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <div className="space-y-6">
                <article key={1} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_1_title', 'text', "Bucarest — Premier contact", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_1_location', 'text', "Bucarest", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_1_detail', 'textarea', "On pose les valises dans le quartier Floreasca, loin du bruit du centre. C'est là qu'on trouve les meilleures adresses locales — des cantines où les avocats du coin mangent à midi, des petits parcs où personne ne se prend en photo. Premier dîner : sarmale (choux farcis) et mămăligă (polenta), arrosés de vin de Murfatlar. On rentre tôt, demain la route commence.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_1_pepite', 'textarea', "Restaurant fără Zahăr — cantine locale dans Floreasca, 12 € pour deux", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={1}
                      cityFallback={"Bucarest"}
                      accommodationFallback={"Hotel Cismigiu — 3*, centre, 55 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={2} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_2_title', 'text', "Bucarest → Sinaia — Les Carpates", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_2_location', 'text', "Sinaia", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_2_detail', 'textarea', "La route Bucarest-Sinaia est une mise en jambe parfaite. Les plaines cèdent progressivement la place aux collines, puis aux Carpates qui surgissent sans prévenir. Le château de Peleș est le premier choc visuel du voyage — un concentré d'architecture néo-Renaissance perché dans la forêt. L'après-midi, on marche dans les bois au-dessus de Sinaia.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_2_pepite', 'textarea', "Le château de Peleș — arrive à l'ouverture (9h15), tu évites 90 % des groupes", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={2}
                      cityFallback={"Sinaia"}
                      accommodationFallback={"Hotel Sinaia — 4*, vue montagne, 70 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={3} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_3_title', 'text', "Sinaia → Brașov — La perle transylvanienne", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_3_location', 'text', "Brașov", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_3_detail', 'textarea', "Brașov est la plus belle ville de Transylvanie. La place du Conseil (Piața Sfatului) est entourée de bâtiments pastel. La rue Republicii — piétonne, bordée d'arcades — est faite pour flâner sans but. On monte jusqu'à la forteresse pour la vue, mais le vrai moment, c'est le tramway 102 : une vieille rame qui traverse la ville avec un bruit de ferraille réconfortant.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_3_pepite', 'textarea', "Le tramway 102 jusqu'à la gare de Brașov — un voyage dans le temps pour 0.50 €", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={3}
                      cityFallback={"Brașov"}
                      accommodationFallback={"Hotel Belvedere — 3*, vue citadelle, 50 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={4} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_4_title', 'text', "Brașov → Sighișoara — La citadelle habitée", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_4_location', 'text', "Sighișoara", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_4_detail', 'textarea', "Sighișoara est la seule citadelle médiévale d'Europe encore habitée en continu. On y entre par la tour de l'Horloge, on gravit les escaliers couverts, et on débouche sur une place où le temps semble figé. Le restaurant din Turn est perché dans une tour — on y mange une mici en regardant la ville s'illuminer.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_4_pepite', 'textarea', "Restaurant din Turn — dîner dans une tour médiévale, cuisine transylvanienne revisitée, 25 € pour deux", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={4}
                      cityFallback={"Sighișoara"}
                      accommodationFallback={"Hotel Sighișoara — 3*, intra-muros, 45 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={5} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      5
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_5_title', 'text', "Sighișoara → Viscri — Le silence saxon", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_5_location', 'text', "Viscri", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_5_detail', 'textarea', "Viscri est ce qui reste de la Roumanie d'avant. Un village saxon où les rues sont en terre battue, où les charrettes croisent les vélos, où le seul bruit vient des cloches des moutons. La Fondation Charles a aidé à restaurer plusieurs bâtiments. On déjeune chez Elena, dans sa cour, assis sur un banc en bois.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_5_pepite', 'textarea', "Chez Elena — déjeuner chez l'habitant dans sa cour : soupe, pain cuit au feu de bois, 8 €", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={5}
                      cityFallback={"Viscri"}
                      accommodationFallback={"Guesthouse Viscri — chez l'habitant, 35 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={6} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      6
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_6_title', 'text', "Viscri → Cluj-Napoca — L'effervescence", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_6_location', 'text', "Cluj-Napoca", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_6_detail', 'textarea', "Cluj, c'est l'autre Roumanie. Étudiante, connectée, tournée vers l'avenir. On flâne dans le quartier Mărăști, on boit un café chez Laika, on dîne dans un bistro hongrois. Cluj est un rappel que la Roumanie ne se réduit pas à ses cartes postales médiévales.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_6_pepite', 'textarea', "La muzica până la capăt — librairie-café alternative au sous-sol, rue Memorandumului", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={6}
                      cityFallback={"Cluj-Napoca"}
                      accommodationFallback={"Hotel Deja Vu — 3*, centre, 55 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={7} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      7
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_7_title', 'text', "Cluj — Journée culturelle", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_7_location', 'text', "Cluj-Napoca", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_7_detail', 'textarea', "Une journée entière pour explorer Cluj en profondeur. Le musée Romulus Vuia est un bijou méconnu : des maisons paysannes, églises en bois et moulins reconstitués sur 15 hectares en pleine ville. L'après-midi, on traîne au marché Piața Unirii — fruits séchés, fromages de Sibiu, miel de Maramureș. Le quartier Mănăștur, bohème et alternatif, mérite le détour pour ses fresques murales et ses cafés de rue.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_7_pepite', 'textarea', "Musée ethnographique Romulus Vuia — village roumain reconstitué en plein air, 4 €, prévois 2h", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={7}
                      cityFallback={"Cluj-Napoca"}
                      accommodationFallback={"Hotel Deja Vu — 3*, centre, 55 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={8} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      8
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_8_title', 'text', "Cluj → Maramureș — L'âme de la Roumanie", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_8_location', 'text', "Maramureș", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_8_detail', 'textarea', "La route Cluj-Maramureș traverse des collines qui ressemblent à un tableau. On arrive dans la région la plus authentique de Roumanie — celle que les touristes effleurent sans jamais vraiment explorer. Les villages en bois aux toits de bardeaux, les églises aux flèches élancées, les charrettes qui règnent encore sur les routes. L'après-midi, on visite le cimetière joyeux de Săpânța — une expérience qui défie toutes les attentes. Des tombes bleues, des épitaphes drôles, une leçon de vie.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_8_pepite', 'textarea', "Le cimetière joyeux de Săpânța — tombes colorées racontant la vie des défunts avec humour, 2 €, unique au monde", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={8}
                      cityFallback={"Maramureș"}
                      accommodationFallback={"Guesthouse Maramureș — chez l'habitant, 30 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={9} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      9
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_9_title', 'text', "Maramureș — Immersion totale", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_9_location', 'text', "Maramureș", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_9_detail', 'textarea', "Le Maramureș se vit, pas se visite. On commence au marché de Sighetu Marmației — le dimanche matin, c'est l'effervescence. Paysans en costume traditionnel, fromages de brebis affinés sous l'écorce, pains cuits au feu de bois. L'après-midi, on enchaîne les églises en bois classées UNESCO : Bârsana, Ieud, Desești — chacune avec sa flèche qui perce le ciel. Le soir, le dîner chez l'habitant est un moment suspendu. C'est pour ça qu'on voyage jusqu'ici.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_9_pepite', 'textarea', "Le marché de Sighetu Marmației — producteurs locaux, fromage de burduf, slănină fumée, tout goûter sans retenue", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={9}
                      cityFallback={"Maramureș"}
                      accommodationFallback={"Guesthouse Maramureș — chez l'habitant, 30 €/nuit"}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
                <article key={10} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      10
                    </span>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_10_title', 'text', "Maramureș → Cluj — Le retour", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_10_location', 'text', "Maramureș / Cluj-Napoca", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_10_detail', 'textarea', "Dernière gorgée de Maramureș. On prend le temps d'un dernier petit déjeuner — pain chaud, crème fraîche, confiture maison. On achète du miel et de la palincă. Puis la route vers Cluj, 2h30 de virages à travers les collines. Dans l'avion, on est fatigués mais comblés. Dix jours qui ont tout donné. Et déjà, on sait qu'on reviendra — il reste tant de Roumanie à découvrir.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{Z('day_10_pepite', 'textarea', "Le marché du dimanche matin — achète du miel et de la palincă (eau-de-vie de prune) pour ramener un vrai goût de Roumanie", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={10}
                      cityFallback={"Maramureș / Cluj-Napoca"}
                      accommodationFallback={""}
                      departText={departText}
                      disclosureClassName="mt-2"
                    />
                  </div>
                </article>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">Carte interactive du circuit</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              Explore chaque étape sur la carte : hébergements, pépites et routes empruntées à travers la Roumanie.
            </p>
            <div className="rounded-2xl overflow-hidden border border-stone-200">
              <DynamicArticleMap slug="roumanie-10-jours" />
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-serif text-mahogany mb-4">Télécharge le PDF de cet itinéraire</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              Emporte ce carnet Roumanie 10 jours dans ton téléphone ou imprime-le : les adresses et les pépites dénichées sans avoir besoin de réseau.
            </p>
            <PdfDownloadButton destination="roumanie" duration="10" className="inline-flex px-8 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors" />
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <h2 className="text-2xl font-serif text-mahogany mb-4">Pas assez de temps ?</h2>
            <p className="text-charcoal/70 mb-6 max-w-lg mx-auto">
              Notre itinéraire 7 jours couvre l&apos;essentiel de la Transylvanie si tu as moins de flexibilité.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/destinations/roumanie/itineraire-7-jours" className="inline-flex px-6 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors">
                Voir l&apos;itinéraire 7 jours →
              </Link>
              <Link href="/destinations/roumanie/itineraire-5-jours" className="inline-flex px-6 py-3 rounded-lg border border-stone-300 text-charcoal font-semibold hover:bg-stone-50 transition-colors">
                Version 5 jours →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-3">
              Conception sur mesure
            </p>
            <h2 className="text-2xl font-serif text-mahogany mb-4">
              Tu veux la version personnalisée de cet itinéraire ?
            </h2>
            <p className="text-charcoal/70 mb-8 max-w-lg mx-auto">
              On adapte ce circuit à ton budget, ta saison et ton énergie réelle.
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex px-7 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
            >
              Construire mon itinéraire sur mesure →
            </Link>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-3">
              Reste inspiré
            </p>
            <h2 className="text-2xl font-serif text-mahogany mb-4">
              On t&apos;envoie nos prochains carnets ?
            </h2>
            <NewsletterForm variant="inline" />
          </div>
        </section>      </main>
      <Footer />
    </InlineEditProvider>
  );
}
