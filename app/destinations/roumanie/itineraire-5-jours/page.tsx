import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';
import DynamicArticleMap from '@/components/DynamicArticleMap';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import DaySummaryTable from '@/components/itinerary/DaySummaryTable';
import DayAccommodationBox from '@/components/itinerary/DayAccommodationBox';
import { buildPageMetadata } from '@/lib/page-metadata'

const SITE_URL = 'https://www.heldonica.fr';
const PAGE = "destinations-roumanie-itineraire-5-jours";
const DAYS: { day: number; location: string; activity: string; accommodation: string | null }[] = [{"day":1,"location":"Brașov","activity":"Arrivée, vieille ville, rue Republicii, place du Conseil","accommodation":"Hotel Belvedere — 3*, vue citadelle, 50 €/nuit"},{"day":2,"location":"Sinaia","activity":"Château de Peleș, forêt des Carpates, randonnée légère","accommodation":"Hotel Sinaia — 4*, vue montagne, 70 €/nuit"},{"day":3,"location":"Sighișoara","activity":"Tour de l'Horloge, escalier couvert, citadelle","accommodation":"Hotel Sighișoara — 3*, intra-muros, 45 €/nuit"},{"day":4,"location":"Sibiu","activity":"Grande place, pont des Mensonges, musée ASTRA","accommodation":"Hotel Sibiul — 3*, vieille ville, 50 €/nuit"},{"day":5,"location":"Brașov","activity":"Petit déjeuner tardif, dernier tour, départ","accommodation":null}];

const metadata: Metadata = {
  title: "Roumanie 5 jours : itinéraire slow travel focus Transylvanie | Heldonica",
  description: "Itinéraire Roumanie 5 jours testé sur place : Brașov, Sighișoara, Sibiu, château de Peleș, randonnée dans les Carpates. L'essentiel de la Transylvanie en version concentrée.",
  alternates: {
    canonical: `${SITE_URL}/destinations/roumanie/itineraire-5-jours`,
  },
  openGraph: {
    title: "Roumanie 5 jours : itinéraire slow travel focus Transylvanie | Heldonica",
    description: "L'essence de la Roumanie en version concentrée : Brașov, Sighișoara, Sibiu, Carpates et château de Peleș.",
    url: `${SITE_URL}/destinations/roumanie/itineraire-5-jours`,
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Itinéraire Roumanie 5 jours - Focus Transylvanie",
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-itineraire-5-jours', metadata)
}


export default async function Itineraire5JoursPage() {
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

  const departText = zoneText('depart_text', "Retour vers l'aéroport de Sibiu ou Bucarest");

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              {Z('hero_badge', 'text', "Roumanie — Itinéraire 5 jours", undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              {Z('hero_title', 'text', "Roumanie 5 jours : focus Transylvanie", undefined, 'span')}
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              {Z('hero_description', 'textarea', "L'essence de la Roumanie en version concentrée : Brașov, Sinaia, Sighișoara, Sibiu — et les Carpates au milieu.", undefined, 'span')}
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
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                {Z('blurb', 'html', "Ce circuit 5 jours reprend le meilleur de la Transylvanie sans les longs transferts. Idéal pour un premier contact avec la Roumanie ou un week-end prolongé. <strong>Budget réel : 850 € pour deux, vols inclus.</strong>", undefined, 'span')}
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
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_1_title', 'text', "Brașov — Installation et vieille ville", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_1_location', 'text', "Brașov", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_1_detail', 'textarea', "On pose les bases à Brașov, la plus belle porte d'entrée de la Transylvanie. La vieille ville se découvre à pied en une après-midi : la rue Republicii, piétonne et bordée d'arcades, la place du Conseil avec ses bâtiments pastel, et la première terrasse pour un café en observant le rythme local. Pas de précipitation — on s'imprègne.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_1_pepite', 'textarea', "La terrasse du Ceai la Metrou — salon de thé caché sous les arcades, thé maison et vue sur la place", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={1}
                      cityFallback={"Brașov"}
                      accommodationFallback={"Hotel Belvedere — 3*, vue citadelle, 50 €/nuit"}
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
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_2_title', 'text', "Château de Peleș et randonnée dans les Carpates", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_2_location', 'text', "Sinaia", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_2_detail', 'textarea', "À 40 minutes de Brașov, Sinaia est le joyau des Carpates. Le château de Peleș mérite qu'on arrive à l'ouverture — les salles sont plus impressionnantes sans la foule. L'après-midi, on prend un sentier dans la forêt au-dessus de la ville. Les Carpates ont cette capacité à te faire oublier le temps. On redescend fatigué mais apaisé.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_2_pepite', 'textarea', "Le sentier Sinaia-Cota 1400 — 2h de montée douce à travers la forêt, vue panoramique sur toute la vallée", undefined, 'span')}</p>
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
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_3_title', 'text', "Sighișoara — La citadelle médiévale", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_3_location', 'text', "Sighișoara", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_3_detail', 'textarea', "Sighișoara est un arrêt obligé, et on comprend pourquoi dès qu'on franchit la tour de l'Horloge. La citadelle est vivante, habitée, pas un décor pour touristes. On flâne dans les ruelles pavées, on monte les marches couvertes jusqu'au sommet, et le soir venu, on s'installe au din Turn pour un dîner qui restera dans les mémoires.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_3_pepite', 'textarea', "Restaurant din Turn — dîner dans une tour du 14e siècle, cuisine transylvanienne, 25 € pour deux", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={3}
                      cityFallback={"Sighișoara"}
                      accommodationFallback={"Hotel Sighișoara — 3*, intra-muros, 45 €/nuit"}
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
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_4_title', 'text', "Sibiu — Ambiance saxonne et culture", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_4_location', 'text', "Sibiu", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_4_detail', 'textarea', "Sibiu, ancienne capitale européenne de la culture, a gardé un charme saxon irrésistible. La Grande Place est l'une des plus belles d'Europe de l'Est. Le pont des Mensonges offre une vue parfaite sur la ville basse. L'après-midi au musée ASTRA est une plongée fascinante dans la Roumanie rurale — moulins, églises en bois, fermes reconstituées. Un musée à ciel ouvert unique.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_4_pepite', 'textarea', "Le musée ASTRA en plein air — 30 hectares de vie rurale roumaine reconstituée, 5 €, prévois 3h", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={4}
                      cityFallback={"Sibiu"}
                      accommodationFallback={"Hotel Sibiul — 3*, vieille ville, 50 €/nuit"}
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
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{Z('day_5_title', 'text', "Retour à Brașov et dernière flânerie", undefined, 'span')}</h2>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{Z('day_5_location', 'text', "Brașov", undefined, 'span')}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{Z('day_5_detail', 'textarea', "Dernière matinée à Brașov. On prend le temps : petit déjeuner à la boulangerie La Pâine, dernier tour dans la vieille ville pour acheter un souvenir qui a du sens, et on prend la route vers l'aéroport de Sibiu ou Bucarest. Cinq jours suffisent pour tomber amoureux de la Transylvanie — et pour commencer à planifier le prochain voyage, plus long.", undefined, 'span')}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{Z('pepite_label', 'text', "Pépite dénichée", undefined, 'span')}</p>
                      <p className="text-sm text-charcoal/80">{Z('day_5_pepite', 'textarea', "Boulangerie La Pâine — meilleur cozonac de la ville, à prendre pour la route", undefined, 'span')}</p>
                    </div>
                    <DayAccommodationBox
                      page={PAGE}
                      day={5}
                      cityFallback={"Brașov"}
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
            <h2 className="text-3xl font-serif text-mahogany mb-6">{Z('map_title', 'text', "Carte interactive du circuit", undefined, 'span')}</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              {Z('map_intro', 'text', "Explore chaque étape sur la carte : hébergements, pépites et points de passage.", undefined, 'span')}
            </p>
            <div className="rounded-2xl overflow-hidden border border-stone-200">
              <DynamicArticleMap slug="roumanie-5-jours" />
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <h2 className="text-2xl font-serif text-mahogany mb-4">{Z('cta_slower_title', 'text', "Tu préfères un rythme plus lent ?", undefined, 'span')}</h2>
            <p className="text-charcoal/70 mb-6 max-w-lg mx-auto">
              {Z('cta_slower_text', 'textarea', "5 jours c'est court pour la Roumanie. Notre itinéraire 7 jours ajoute Viscri et Cluj sans rien sacrifier.", undefined, 'span')}
            </p>
            <Link
              href="/destinations/roumanie/itineraire-7-jours"
              className="inline-flex px-7 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
            >
              {Z('cta_slower_button', 'text', "Voir l'itinéraire 7 jours →", undefined, 'span')}
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
