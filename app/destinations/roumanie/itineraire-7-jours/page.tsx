import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';
import PdfDownloadButton from '@/components/PdfDownloadButton';

const SITE_URL = 'https://heldonica.fr';

const ArticleMap = dynamic(() => import('@/components/ArticleMap'), { ssr: false });

export const metadata: Metadata = {
  title: 'Roumanie 7 jours : itinéraire slow travel en couple | Heldonica',
  description: 'Itinéraire Roumanie 7 jours testé sur place : Bucarest, Sinaia, Brașov, Sighișoara, Viscri, Cluj. Budget, hébergements, pépites et conseils slow travel.',
  alternates: {
    canonical: `${SITE_URL}/destinations/roumanie/itineraire-7-jours`,
  },
  openGraph: {
    title: 'Roumanie 7 jours : itinéraire slow travel en couple | Heldonica',
    description: 'Circuit Transylvanie complet testé sur le terrain : villes, nature et villages authentiques.',
    url: `${SITE_URL}/destinations/roumanie/itineraire-7-jours`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Itinéraire Roumanie 7 jours - Transylvanie slow travel',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
};

const days = [
  {
    day: 1,
    title: 'Bucarest — Premier contact',
    from: 'Arrivée à l\'aéroport Otopeni',
    location: 'Bucarest',
    activity: 'Installation dans le quartier Floreasca, découverte du quartier, premier repas roumain',
    pepite: 'Restaurant fără Zahăr — cantine locale dans Floreasca, cuisine maison, 12 € pour deux',
    accommodation: 'Hotel Cismigiu — 3*, quartier centre, 55 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Bucarest&aid=2420035',
    detail: 'On pose les valises dans le quartier Floreasca, loin du bruit du centre. C\'est là qu\'on trouve les meilleures adresses locales — des cantines où les avocats du coin mangent à midi, des petits parcs où personne ne se prend en photo. Premier dîner : sarmale (choux farcis) et mămăligă (polenta), arrosés de vin de Murfatlar. On rentre tôt, demain la route commence.',
  },
  {
    day: 2,
    title: 'Bucarest → Sinaia — Les Carpates',
    from: 'Bucarest (1h30 de route)',
    location: 'Sinaia',
    activity: 'Château de Peleș, forêt des Carpates',
    pepite: 'Le château de Peleș — arrive à l\'ouverture (9h15), tu évites 90 % des groupes',
    accommodation: 'Hotel Sinaia — 4*, vue montagne, 70 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Sinaia&aid=2420035',
    detail: 'La route Bucarest-Sinaia est une mise en jambe parfaite. Les plaines cèdent progressivement la place aux collines, puis aux Carpates qui surgissent sans prévenir. Le château de Peleș est le premier choc visuel du voyage — un concentré d\'architecture néo-Renaissance perché dans la forêt. L\'après-midi, on marche dans les bois au-dessus de Sinaia. L\'air change, le rythme aussi. On comprend déjà pourquoi on vient ici.',
  },
  {
    day: 3,
    title: 'Sinaia → Brașov — La perle transylvanienne',
    from: 'Sinaia (40 min de route)',
    location: 'Brașov',
    activity: 'Vieille ville, rue Republicii, tramway nostalgique',
    pepite: 'Le tramway 102 jusqu\'à la gare de Brașov — un voyage dans le temps pour 0.50 €',
    accommodation: 'Hotel Belvedere — 3*, vue sur la citadelle, 50 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Brașov&aid=2420035',
    detail: 'Brașov est la plus belle ville de Transylvanie, point barre. La place du Conseil (Piața Sfatului) est entourée de bâtiments pastel qui n\'ont pas besoin de filtre. La rue Republicii — piétonne, bordée d\'arcades — est faite pour flâner sans but. On monte jusqu\'à la forteresse pour la vue, mais le vrai moment, c\'est le tramway 102 : une vieille rame qui traverse la ville avec un bruit de ferraille réconfortant. Soirée dans un restaurant du vieux Brașov : papanași (beignets au fromage blanc et crème) en dessert. Indispensable.',
  },
  {
    day: 4,
    title: 'Brașov → Sighișoara — La citadelle habitée',
    from: 'Brașov (1h45 de route)',
    location: 'Sighișoara',
    activity: 'Citadelle médiévale, tour de l\'Horloge',
    pepite: 'Restaurant din Turn — dîner dans une tour médiévale, cuisine transylvanienne revisitée, 25 € pour deux',
    accommodation: 'Hotel Sighișoara — 3*, intra-muros, 45 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Sighișoara&aid=2420035',
    detail: 'Sighișoara est la seule citadelle médiévale d\'Europe encore habitée en continu. On y entre par la tour de l\'Horloge, on gravit les escaliers couverts, et on débouche sur une place où le temps semble figé. La différence avec Brașov : ici, pas de foule. Les ruelles sont calmes, les chats dorment sur les pavés. Le restaurant din Turn est perché dans une tour — on y mange une mici (saucisses roumaines) en regardant la ville s\'illuminer. C\'est notre journée préférée du circuit.',
  },
  {
    day: 5,
    title: 'Sighișoara → Viscri — Le silence saxon',
    from: 'Sighișoara (45 min de route)',
    location: 'Viscri',
    activity: 'Village saxon, église fortifiée UNESCO, Fondation Charles',
    pepite: 'Chez Elena — déjeuner chez l\'habitant dans sa cour : soupe, pain cuit au feu de bois, 8 €',
    accommodation: 'Guesthouse Viscri — chez l\'habitant, 35 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Viscri&aid=2420035',
    detail: 'Viscri est ce qui reste de la Roumanie d\'avant. Un village saxon où les rues sont en terre battue, où les charrettes croisent les vélos, où le seul bruit vient des cloches des moutons. L\'église fortifiée classée UNESCO domine le village. La Fondation Charles (le prince Charles a une maison ici) a aidé à restaurer plusieurs bâtiments, mais l\'esprit reste celui d\'un village qui vit pour lui-même, pas pour les touristes. On déjeune chez Elena, dans sa cour, assis sur un banc en bois. On repart en comprenant pourquoi on voyage vraiment.',
  },
  {
    day: 6,
    title: 'Viscri → Cluj-Napoca — L\'effervescence',
    from: 'Viscri (2h45 de route)',
    location: 'Cluj-Napoca',
    activity: 'Ville universitaire, scène culturelle, bars alternatifs',
    pepite: 'La muzica până la capăt — librairie-café alternative au sous-sol, rue Memorandumului',
    accommodation: 'Hotel Deja Vu — 3*, quartier centre, 55 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Cluj&aid=2420035',
    detail: 'Cluj, c\'est l\'autre Roumanie. Étudiante, connectée, tournée vers l\'avenir. Le contraste avec Viscri est brutal : on passe du silence absolu aux terrasses bondées de l\'avenue Eroilor. La vie culturelle est bouillonnante — théâtre alternatif, galeries d\'art contemporain, bars qui ferment à 4h du matin. On flâne dans le quartier Mărăști, on boit un café chez Laika, on dîne dans un bistro hongrois. Cluj est un rappel que la Roumanie ne se réduit pas à ses cartes postales médiévales.',
  },
  {
    day: 7,
    title: 'Cluj-Napoca → Départ — La dernière gorgée',
    from: 'Cluj (aéroport)',
    location: 'Cluj-Napoca',
    activity: 'Marché Piața Unirii, café Laika, dernier pătrat de cozonac',
    pepite: 'Café Laika — torréfaction locale, pet-friendly, meilleur flat white de Roumanie',
    accommodation: null,
    accommodationUrl: null,
    detail: 'Dernier matin à Cluj. On traîne au marché Piața Unirii, on achète un dernier cozonac (brioche à la noix), on boit un café à Laika en faisant le bilan. Sept jours qui passent trop vite — c\'est toujours le signe d\'un bon voyage. Le vol retour depuis Cluj est direct vers plusieurs villes européennes. Dans l\'avion, on commence déjà à rêver au prochain retour. Parce qu\'on reviendra — la Roumanie a cette capacité à retenir ceux qui prennent le temps de la connaître.',
  },
];

const summaryRows = days.map(d => ({
  jour: `J${d.day}`,
  ville: d.location.split('—')[0].trim(),
  activite: d.activity.split(',')[0],
  nuit: d.accommodation?.split('—')[0]?.trim() ?? 'Départ',
}));

export default function Itineraire7JoursPage() {
  return (
    <>
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
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Roumanie — Itinéraire 7 jours
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Roumanie 7 jours : itinéraire slow travel en couple
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Bucarest, Sinaia, Brașov, Sighișoara, Viscri, Cluj — le circuit Transylvanie qu&apos;on a testé, ajusté, et qu&apos;on referait sans hésiter.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing pt-0 -mt-6">
          <div className="container max-w-4xl">
            <div className="rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-eucalyptus/10 text-eucalyptus px-3 py-1 text-xs font-semibold">
                  Testé par Heldonica
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">
                  2 visites
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 text-stone-600 px-3 py-1 text-xs font-semibold">
                  Septembre 2024
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                  Automne doré
                </span>
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                On a testé cet itinéraire en septembre 2024, en plein automne doré. Les températures étaient douces (18-25°C), les couleurs incroyables et les sites nettement moins fréquentés qu&apos;en juillet-août. Chaque étape a été vérifiée, chaque adresse testée — on ne recommande que ce qu&apos;on a vraiment expérimenté. <strong>Budget réel : 1 150 € pour deux, tout compris.</strong>
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
                <tbody className="divide-y divide-stone-100">
                  {summaryRows.map((row) => (
                    <tr key={row.jour} className="hover:bg-cloud-dancer/50">
                      <td className="px-4 py-3 font-semibold text-eucalyptus">{row.jour}</td>
                      <td className="px-4 py-3 text-charcoal">{row.ville}</td>
                      <td className="px-4 py-3 text-charcoal/70 hidden md:table-cell">{row.activite}</td>
                      <td className="px-4 py-3 text-charcoal/70 hidden md:table-cell">{row.nuit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <div className="space-y-6">
              {days.map((day) => (
                <article key={day.day} className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="shrink-0 w-10 h-10 rounded-full bg-eucalyptus text-white flex items-center justify-center text-sm font-bold">
                      {day.day}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h2 className="text-2xl font-serif text-mahogany">{day.title}</h2>
                        <span className="text-xs text-stone-400">{day.from}</span>
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{day.location}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{day.detail}</p>

                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">
                        Pépite dénichée
                      </p>
                      <p className="text-sm text-charcoal/80">{day.pepite}</p>
                    </div>
                    {day.accommodation && day.accommodationUrl && (
                      <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
                        <p className="text-xs font-semibold text-stone-600 mb-1">
                          On a dormi chez
                        </p>
                        <p className="text-sm text-charcoal/80 mb-1">{day.accommodation}</p>
                        <a
                          href={day.accommodationUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-xs text-eucalyptus font-semibold hover:underline"
                        >
                          Voir les disponibilités →
                        </a>
                      </div>
                    )}
                    {!day.accommodation && (
                      <div className="rounded-xl bg-teal/5 border border-teal/20 p-3">
                        <p className="text-xs font-semibold text-teal mb-1">Départ</p>
                        <p className="text-sm text-charcoal/80">Vol retour depuis Cluj-Napoca</p>
                      </div>
                    )}
                  </div>

                  {day.accommodationUrl && (
                    <div className="text-xs text-stone-400">
                      <span>Liens Booking.com — un petit geste qui nous aide sans rien changer à ton tarif.</span>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">Carte interactive du circuit</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              Explore chaque étape sur la carte : hébergements, pépites, points de passage et routes empruntées.
            </p>
            <Script id="ga4-map-interaction" strategy="lazyOnload">{`
              if (typeof window !== 'undefined' && window.gtag) {
                document.querySelector('[class*="leaflet"]')?.addEventListener('click', function() {
                  window.gtag('event', 'carte_interactive_utilisee', { destination: 'roumanie', itinerary: '7-jours' });
                });
              }
            `}</Script>
            <div className="rounded-2xl overflow-hidden border border-stone-200">
              <ArticleMap slug="roumanie-7-jours" />
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-serif text-mahogany mb-4">Télécharge le PDF de cet itinéraire</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              Emporte ce carnet Roumanie 7 jours dans ton téléphone ou imprime-le : les adresses et les pépites dénichées sans avoir besoin de réseau.
            </p>
            <PdfDownloadButton destination="roumanie" duration="7" className="inline-flex px-8 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors" />
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
              On adapte ce circuit à ton budget, ta saison et ton énergie réelle. Dates flexibles, hébergements ajustés, rythme sur mesure.
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex px-7 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
            >
      Construire mon itinéraire sur mesure →
            </Link>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-3">
              Reste inspiré
            </p>
            <h2 className="text-2xl font-serif text-mahogany mb-4">
              On t&apos;envoie nos prochains carnets ?
            </h2>
            <NewsletterForm variant="inline" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
