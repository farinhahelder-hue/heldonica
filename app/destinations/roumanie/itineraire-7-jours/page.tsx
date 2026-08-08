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
const PAGE = "destinations-roumanie-itineraire-7-jours";
const DAYS: { day: number; location: string; activity: string; accommodation: string | null }[] = [{"day":1,"location":"Bucarest","activity":"Installation dans le quartier Floreasca, découverte du quartier, premier repas roumain","accommodation":"Hotel Cismigiu — 3*, quartier centre, 55 €/nuit"},{"day":2,"location":"Sinaia","activity":"Château de Peleș, forêt des Carpates","accommodation":"Hotel Sinaia — 4*, vue montagne, 70 €/nuit"},{"day":3,"location":"Brașov","activity":"Vieille ville, rue Republicii, tramway nostalgique","accommodation":"Hotel Belvedere — 3*, vue sur la citadelle, 50 €/nuit"},{"day":4,"location":"Sighișoara","activity":"Citadelle médiévale, tour de l'Horloge","accommodation":"Hotel Sighișoara — 3*, intra-muros, 45 €/nuit"},{"day":5,"location":"Viscri","activity":"Village saxon, église fortifiée UNESCO, Fondation Charles","accommodation":"Guesthouse Viscri — chez l'habitant, 35 €/nuit"},{"day":6,"location":"Cluj-Napoca","activity":"Ville universitaire, scène culturelle, bars alternatifs","accommodation":"Hotel Deja Vu — 3*, quartier centre, 55 €/nuit"},{"day":7,"location":"Cluj-Napoca","activity":"Marché Piața Unirii, café Laika, dernier pătrat de cozonac","accommodation":null}];

const metadata: Metadata = {
  title: "Roumanie 7 jours : itinéraire slow travel en couple | Heldonica",
  description: "Itinéraire Roumanie 7 jours testé sur place : Bucarest, Sinaia, Brașov, Sighișoara, Viscri, Cluj. Budget, hébergements, pépites et conseils slow travel.",
  alternates: {
    canonical: `${SITE_URL}/destinations/roumanie/itineraire-7-jours`,
  },
  openGraph: {
    title: "Roumanie 7 jours : itinéraire slow travel en couple | Heldonica",
    description: "Circuit Transylvanie complet testé sur le terrain : villes, nature et villages authentiques.",
    url: `${SITE_URL}/destinations/roumanie/itineraire-7-jours`,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Itinéraire Roumanie 7 jours - Transylvanie slow travel",
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-itineraire-7-jours', metadata)
}


export default async function Itineraire7JoursPage() {
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
                  headline: 'Roumanie 7 jours : itinéraire slow travel en couple',
                  description: 'Circuit Transylvanie complet testé sur le terrain : Bucarest, Sinaia, Brașov, Sighișoara, Viscri, Cluj.',
                  author: { '@type': 'Organization', name: 'Heldonica' },
                  url: `${SITE_URL}/destinations/roumanie/itineraire-7-jours`,
                }),
              }}
            />
      <Header />
      <Script id="ga4-itinerary-view" strategy="lazyOnload">{`
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'itinerary_view', { destination: 'roumanie', duration: '7' });
              }
            `}</Script>
      <Script id="ga4-map-interaction" strategy="lazyOnload">{`
                    if (typeof window !== 'undefined' && window.gtag) {
                      document.querySelector('[class*="leaflet"]')?.addEventListener('click', function() {
                        window.gtag('event', 'carte_interactive_utilisee', { destination: 'roumanie', itinerary: '7-jours' });
                      });
                    }
                  `}</Script>      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              {Z('hero_badge', 'text', "Roumanie — Itinéraire 7 jours", undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              {Z('hero_title', 'text', "Roumanie 7 jours : itinéraire slow travel en couple", undefined, 'span')}
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              {Z('hero_description', 'textarea', "Bucarest, Sinaia, Brașov, Sighișoara, Viscri, Cluj — le circuit Transylvanie qu'on a testé, ajusté, et qu'on referait sans hésiter.", undefined, 'span')}
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
                {Z('blurb', 'html', "On a testé cet itinéraire en septembre 2024, en plein automne doré. Les températures étaient douces (18-25°C), les couleurs incroyables et les sites nettement moins fréquentés qu'en juillet-août. Chaque étape a été vérifiée, chaque adresse testée — on ne recommande que ce qu'on a vraiment expérimenté. <strong>Budget réel : 1 150 € pour deux, tout compris.</strong>", undefined, 'span')}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing pt-0">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-serif text-mahogany mb-6">{Z('overview_title', 'text', "Aperçu du circuit", undefined, 'span')}</h2>
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
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{Z('day_1_title', 'text', "Bucarest — Premier contact", undefined, 'span')}</h2>
                        <span className="text-xs text-stone-500">{Z('day_1_from', 'text', "Arrivée à l'aéroport Otopeni", undefined, 'span')}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_1_location', 'text', "Bucarest", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_1_detail', 'textarea', "On pose les valises dans le quartier Floreasca, loin du bruit du centre. C'est là qu'on trouve les meilleures adresses locales — des cantines où les avocats du coin mangent à midi, des petits parcs où personne ne se prend en photo. Premier dîner : sarmale (choux farcis) et mămăligă (polenta), arrosés de vin de Murfatlar. On rentre tôt, demain la route commence.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_1_pepite', 'textarea', "Restaurant fără Zahăr — cantine locale dans Floreasca, cuisine maison, 12 € pour deux", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={1}
                      cityFallback={"Bucarest"}
                      accommodationFallback={"Hotel Cismigiu — 3*, quartier centre, 55 €/nuit"}
                      departText={departText}
                      disclosureClassName=""
                    />
                  </div>
                </article>
                <article key={2} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{Z('day_2_title', 'text', "Bucarest → Sinaia — Les Carpates", undefined, 'span')}</h2>
                        <span className="text-xs text-stone-500">{Z('day_2_from', 'text', "Bucarest (1h30 de route)", undefined, 'span')}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_2_location', 'text', "Sinaia", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_2_detail', 'textarea', "La route Bucarest-Sinaia est une mise en jambe parfaite. Les plaines cèdent progressivement la place aux collines, puis aux Carpates qui surgissent sans prévenir. Le château de Peleș est le premier choc visuel du voyage — un concentré d'architecture néo-Renaissance perché dans la forêt. L'après-midi, on marche dans les bois au-dessus de Sinaia. L'air change, le rythme aussi. On comprend déjà pourquoi on vient ici.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_2_pepite', 'textarea', "Le château de Peleș — arrive à l'ouverture (9h15), tu évites 90 % des groupes", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={2}
                      cityFallback={"Sinaia"}
                      accommodationFallback={"Hotel Sinaia — 4*, vue montagne, 70 €/nuit"}
                      departText={departText}
                      disclosureClassName=""
                    />
                  </div>
                </article>
                <article key={3} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{Z('day_3_title', 'text', "Sinaia → Brașov — La perle transylvanienne", undefined, 'span')}</h2>
                        <span className="text-xs text-stone-500">{Z('day_3_from', 'text', "Sinaia (40 min de route)", undefined, 'span')}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_3_location', 'text', "Brașov", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_3_detail', 'textarea', "Brașov est la plus belle ville de Transylvanie, point barre. La place du Conseil (Piața Sfatului) est entourée de bâtiments pastel qui n'ont pas besoin de filtre. La rue Republicii — piétonne, bordée d'arcades — est faite pour flâner sans but. On monte jusqu'à la forteresse pour la vue, mais le vrai moment, c'est le tramway 102 : une vieille rame qui traverse la ville avec un bruit de ferraille réconfortant. Soirée dans un restaurant du vieux Brașov : papanași (beignets au fromage blanc et crème) en dessert. Indispensable.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_3_pepite', 'textarea', "Le tramway 102 jusqu'à la gare de Brașov — un voyage dans le temps pour 0.50 €", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={3}
                      cityFallback={"Brașov"}
                      accommodationFallback={"Hotel Belvedere — 3*, vue sur la citadelle, 50 €/nuit"}
                      departText={departText}
                      disclosureClassName=""
                    />
                  </div>
                </article>
                <article key={4} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{Z('day_4_title', 'text', "Brașov → Sighișoara — La citadelle habitée", undefined, 'span')}</h2>
                        <span className="text-xs text-stone-500">{Z('day_4_from', 'text', "Brașov (1h45 de route)", undefined, 'span')}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_4_location', 'text', "Sighișoara", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_4_detail', 'textarea', "Sighișoara est la seule citadelle médiévale d'Europe encore habitée en continu. On y entre par la tour de l'Horloge, on gravit les escaliers couverts, et on débouche sur une place où le temps semble figé. La différence avec Brașov : ici, pas de foule. Les ruelles sont calmes, les chats dorment sur les pavés. Le restaurant din Turn est perché dans une tour — on y mange une mici (saucisses roumaines) en regardant la ville s'illuminer. C'est notre journée préférée du circuit.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_4_pepite', 'textarea', "Restaurant din Turn — dîner dans une tour médiévale, cuisine transylvanienne revisitée, 25 € pour deux", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={4}
                      cityFallback={"Sighișoara"}
                      accommodationFallback={"Hotel Sighișoara — 3*, intra-muros, 45 €/nuit"}
                      departText={departText}
                      disclosureClassName=""
                    />
                  </div>
                </article>
                <article key={5} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      5
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{Z('day_5_title', 'text', "Sighișoara → Viscri — Le silence saxon", undefined, 'span')}</h2>
                        <span className="text-xs text-stone-500">{Z('day_5_from', 'text', "Sighișoara (45 min de route)", undefined, 'span')}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_5_location', 'text', "Viscri", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_5_detail', 'textarea', "Viscri est ce qui reste de la Roumanie d'avant. Un village saxon où les rues sont en terre battue, où les charrettes croisent les vélos, où le seul bruit vient des cloches des moutons. L'église fortifiée classée UNESCO domine le village. La Fondation Charles (le prince Charles a une maison ici) a aidé à restaurer plusieurs bâtiments, mais l'esprit reste celui d'un village qui vit pour lui-même, pas pour les touristes. On déjeune chez Elena, dans sa cour, assis sur un banc en bois. On repart en comprenant pourquoi on voyage vraiment.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_5_pepite', 'textarea', "Chez Elena — déjeuner chez l'habitant dans sa cour : soupe, pain cuit au feu de bois, 8 €", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={5}
                      cityFallback={"Viscri"}
                      accommodationFallback={"Guesthouse Viscri — chez l'habitant, 35 €/nuit"}
                      departText={departText}
                      disclosureClassName=""
                    />
                  </div>
                </article>
                <article key={6} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      6
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{Z('day_6_title', 'text', "Viscri → Cluj-Napoca — L'effervescence", undefined, 'span')}</h2>
                        <span className="text-xs text-stone-500">{Z('day_6_from', 'text', "Viscri (2h45 de route)", undefined, 'span')}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_6_location', 'text', "Cluj-Napoca", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_6_detail', 'textarea', "Cluj, c'est l'autre Roumanie. Étudiante, connectée, tournée vers l'avenir. Le contraste avec Viscri est brutal : on passe du silence absolu aux terrasses bondées de l'avenue Eroilor. La vie culturelle est bouillonnante — théâtre alternatif, galeries d'art contemporain, bars qui ferment à 4h du matin. On flâne dans le quartier Mărăști, on boit un café chez Laika, on dîne dans un bistro hongrois. Cluj est un rappel que la Roumanie ne se réduit pas à ses cartes postales médiévales.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_6_pepite', 'textarea', "La muzica până la capăt — librairie-café alternative au sous-sol, rue Memorandumului", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={6}
                      cityFallback={"Cluj-Napoca"}
                      accommodationFallback={"Hotel Deja Vu — 3*, quartier centre, 55 €/nuit"}
                      departText={departText}
                      disclosureClassName=""
                    />
                  </div>
                </article>
                <article key={7} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      7
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{Z('day_7_title', 'text', "Cluj-Napoca → Départ — La dernière gorgée", undefined, 'span')}</h2>
                        <span className="text-xs text-stone-500">{Z('day_7_from', 'text', "Cluj (aéroport)", undefined, 'span')}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_7_location', 'text', "Cluj-Napoca", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_7_detail', 'textarea', "Dernier matin à Cluj. On traîne au marché Piața Unirii, on achète un dernier cozonac (brioche à la noix), on boit un café à Laika en faisant le bilan. Sept jours qui passent trop vite — c'est toujours le signe d'un bon voyage. Le vol retour depuis Cluj est direct vers plusieurs villes européennes. Dans l'avion, on commence déjà à rêver au prochain retour. Parce qu'on reviendra — la Roumanie a cette capacité à retenir ceux qui prennent le temps de la connaître.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_7_pepite', 'textarea', "Café Laika — torréfaction locale, pet-friendly, meilleur flat white de Roumanie", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={7}
                      cityFallback={"Cluj-Napoca"}
                      accommodationFallback={""}
                      departText={departText}
                      disclosureClassName=""
                    />
                  </div>
                </article>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">{Z('map_title', 'text', "Carte interactive du circuit", undefined, 'span')}</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              {Z('map_intro', 'text', "Explore chaque étape sur la carte : hébergements, pépites, points de passage et routes empruntées.", undefined, 'span')}
            </p>
            <div className="rounded-2xl overflow-hidden border border-stone-200">
              <DynamicArticleMap slug="roumanie-7-jours" />
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-serif text-mahogany mb-4">{Z('pdf_title', 'text', "Télécharge le PDF de cet itinéraire", undefined, 'span')}</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              {Z('pdf_intro', 'text', "Emporte ce carnet Roumanie 7 jours dans ton téléphone ou imprime-le : les adresses et les pépites dénichées sans avoir besoin de réseau.", undefined, 'span')}
            </p>
            <PdfDownloadButton destination="roumanie" duration="7" className="inline-flex px-8 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors" />
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-3">
              {Z('cta_custom_kicker', 'text', "Conception sur mesure", undefined, 'span')}
            </p>
            <h2 className="text-2xl font-serif text-mahogany mb-4">
              {Z('cta_custom_title', 'text', "Tu veux la version personnalisée de cet itinéraire ?", undefined, 'span')}
            </h2>
            <p className="text-charcoal/70 mb-8 max-w-lg mx-auto">
              {Z('cta_custom_text', 'text', "On adapte ce circuit à ton budget, ta saison et ton énergie réelle.", undefined, 'span')}
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex px-7 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
            >
              {Z('cta_custom_button', 'text', "Construire mon itinéraire sur mesure →", undefined, 'span')}
            </Link>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-3">
              {Z('newsletter_kicker', 'text', "Reste inspiré", undefined, 'span')}
            </p>
            <h2 className="text-2xl font-serif text-mahogany mb-4">
              {Z('newsletter_title', 'text', "On t'envoie nos prochains carnets ?", undefined, 'span')}
            </h2>
            <NewsletterForm variant="inline" />
          </div>
        </section>      </main>
      <Footer />
    </InlineEditProvider>
  );
}
