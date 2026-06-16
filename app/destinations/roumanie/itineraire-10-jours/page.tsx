import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';

const SITE_URL = 'https://heldonica.fr';

const ArticleMap = dynamic(() => import('@/components/ArticleMap'), { ssr: false });

export const metadata: Metadata = {
  title: 'Roumanie 10 jours : grande traversée slow travel en couple | Heldonica',
  description: 'Itinéraire Roumanie 10 jours testé sur place : Bucarest, Brașov, Sighișoara, Viscri, Cluj, Maramureș. Le circuit complet incluant la région la plus authentique du pays.',
  alternates: {
    canonical: `${SITE_URL}/destinations/roumanie/itineraire-10-jours`,
  },
  openGraph: {
    title: 'Roumanie 10 jours : grande traversée slow travel en couple | Heldonica',
    description: 'Circuit Roumanie complet testé sur le terrain : Transylvanie + Maramureș + Bucovine. 10 jours d\'immersion.',
    url: `${SITE_URL}/destinations/roumanie/itineraire-10-jours`,
    images: [{
      url: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=1200&q=85',
      width: 1200, height: 630,
      alt: 'Itinéraire Roumanie 10 jours - Grande traversée slow travel',
    }],
    locale: 'fr_FR',
    type: 'article',
  },
};

const days = [
  {
    day: 1, title: 'Bucarest — Premier contact',
    location: 'Bucarest',
    activity: 'Installation Floreasca, premier repas roumain',
    pepite: 'Restaurant fără Zahăr — cantine locale dans Floreasca, 12 € pour deux',
    accommodation: 'Hotel Cismigiu — 3*, centre, 55 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Bucarest&aid=2420035',
    detail: 'On pose les valises dans le quartier Floreasca, loin du bruit du centre. C\'est là qu\'on trouve les meilleures adresses locales — des cantines où les avocats du coin mangent à midi, des petits parcs où personne ne se prend en photo. Premier dîner : sarmale (choux farcis) et mămăligă (polenta), arrosés de vin de Murfatlar. On rentre tôt, demain la route commence.',
  },
  {
    day: 2, title: 'Bucarest → Sinaia — Les Carpates',
    location: 'Sinaia',
    activity: 'Château de Peleș, forêt des Carpates',
    pepite: 'Le château de Peleș — arrive à l\'ouverture (9h15), tu évites 90 % des groupes',
    accommodation: 'Hotel Sinaia — 4*, vue montagne, 70 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Sinaia&aid=2420035',
    detail: 'La route Bucarest-Sinaia est une mise en jambe parfaite. Les plaines cèdent progressivement la place aux collines, puis aux Carpates qui surgissent sans prévenir. Le château de Peleș est le premier choc visuel du voyage — un concentré d\'architecture néo-Renaissance perché dans la forêt. L\'après-midi, on marche dans les bois au-dessus de Sinaia.',
  },
  {
    day: 3, title: 'Sinaia → Brașov — La perle transylvanienne',
    location: 'Brașov',
    activity: 'Vieille ville, rue Republicii, tramway nostalgique',
    pepite: 'Le tramway 102 jusqu\'à la gare de Brașov — un voyage dans le temps pour 0.50 €',
    accommodation: 'Hotel Belvedere — 3*, vue citadelle, 50 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Brașov&aid=2420035',
    detail: 'Brașov est la plus belle ville de Transylvanie. La place du Conseil (Piața Sfatului) est entourée de bâtiments pastel. La rue Republicii — piétonne, bordée d\'arcades — est faite pour flâner sans but. On monte jusqu\'à la forteresse pour la vue, mais le vrai moment, c\'est le tramway 102 : une vieille rame qui traverse la ville avec un bruit de ferraille réconfortant.',
  },
  {
    day: 4, title: 'Brașov → Sighișoara — La citadelle habitée',
    location: 'Sighișoara',
    activity: 'Citadelle médiévale, tour de l\'Horloge',
    pepite: 'Restaurant din Turn — dîner dans une tour médiévale, cuisine transylvanienne revisitée, 25 € pour deux',
    accommodation: 'Hotel Sighișoara — 3*, intra-muros, 45 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Sighișoara&aid=2420035',
    detail: 'Sighișoara est la seule citadelle médiévale d\'Europe encore habitée en continu. On y entre par la tour de l\'Horloge, on gravit les escaliers couverts, et on débouche sur une place où le temps semble figé. Le restaurant din Turn est perché dans une tour — on y mange une mici en regardant la ville s\'illuminer.',
  },
  {
    day: 5, title: 'Sighișoara → Viscri — Le silence saxon',
    location: 'Viscri',
    activity: 'Village saxon, église fortifiée UNESCO',
    pepite: 'Chez Elena — déjeuner chez l\'habitant dans sa cour : soupe, pain cuit au feu de bois, 8 €',
    accommodation: 'Guesthouse Viscri — chez l\'habitant, 35 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Viscri&aid=2420035',
    detail: 'Viscri est ce qui reste de la Roumanie d\'avant. Un village saxon où les rues sont en terre battue, où les charrettes croisent les vélos, où le seul bruit vient des cloches des moutons. La Fondation Charles a aidé à restaurer plusieurs bâtiments. On déjeune chez Elena, dans sa cour, assis sur un banc en bois.',
  },
  {
    day: 6, title: 'Viscri → Cluj-Napoca — L\'effervescence',
    location: 'Cluj-Napoca',
    activity: 'Arrivée, premiers pas en ville',
    pepite: 'La muzica până la capăt — librairie-café alternative au sous-sol, rue Memorandumului',
    accommodation: 'Hotel Deja Vu — 3*, centre, 55 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Cluj&aid=2420035',
    detail: 'Cluj, c\'est l\'autre Roumanie. Étudiante, connectée, tournée vers l\'avenir. On flâne dans le quartier Mărăști, on boit un café chez Laika, on dîne dans un bistro hongrois. Cluj est un rappel que la Roumanie ne se réduit pas à ses cartes postales médiévales.',
  },
  {
    day: 7, title: 'Cluj — Journée culturelle',
    location: 'Cluj-Napoca',
    activity: 'Musée ethnographique Romulus Vuia, marché Piața Unirii, quartier Mănăștur',
    pepite: 'Musée ethnographique Romulus Vuia — village roumain reconstitué en plein air, 4 €, prévois 2h',
    accommodation: 'Hotel Deja Vu — 3*, centre, 55 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Cluj&aid=2420035',
    detail: 'Une journée entière pour explorer Cluj en profondeur. Le musée Romulus Vuia est un bijou méconnu : des maisons paysannes, églises en bois et moulins reconstitués sur 15 hectares en pleine ville. L\'après-midi, on traîne au marché Piața Unirii — fruits séchés, fromages de Sibiu, miel de Maramureș. Le quartier Mănăștur, bohème et alternatif, mérite le détour pour ses fresques murales et ses cafés de rue.',
  },
  {
    day: 8, title: 'Cluj → Maramureș — L\'âme de la Roumanie',
    location: 'Maramureș',
    activity: 'Route vers le nord, premiers villages en bois',
    pepite: 'Le cimetière joyeux de Săpânța — tombes colorées racontant la vie des défunts avec humour, 2 €, unique au monde',
    accommodation: 'Guesthouse Maramureș — chez l\'habitant, 30 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Maramureș&aid=2420035',
    detail: 'La route Cluj-Maramureș traverse des collines qui ressemblent à un tableau. On arrive dans la région la plus authentique de Roumanie — celle que les touristes effleurent sans jamais vraiment explorer. Les villages en bois aux toits de bardeaux, les églises aux flèches élancées, les charrettes qui règnent encore sur les routes. L\'après-midi, on visite le cimetière joyeux de Săpânța — une expérience qui défie toutes les attentes. Des tombes bleues, des épitaphes drôles, une leçon de vie.',
  },
  {
    day: 9, title: 'Maramureș — Immersion totale',
    location: 'Maramureș',
    activity: 'Marché paysan du dimanche, villages de bois, églises UNESCO',
    pepite: 'Le marché de Sighetu Marmației — producteurs locaux, fromage de burduf, slănină fumée, tout goûter sans retenue',
    accommodation: 'Guesthouse Maramureș — chez l\'habitant, 30 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Maramureș&aid=2420035',
    detail: 'Le Maramureș se vit, pas se visite. On commence au marché de Sighetu Marmației — le dimanche matin, c\'est l\'effervescence. Paysans en costume traditionnel, fromages de brebis affinés sous l\'écorce, pains cuits au feu de bois. L\'après-midi, on enchaîne les églises en bois classées UNESCO : Bârsana, Ieud, Desești — chacune avec sa flèche qui perce le ciel. Le soir, le dîner chez l\'habitant est un moment suspendu. C\'est pour ça qu\'on voyage jusqu\'ici.',
  },
  {
    day: 10, title: 'Maramureș → Cluj — Le retour',
    location: 'Maramureș / Cluj-Napoca',
    activity: 'Dernier petit déjeuner paysan, route retour Cluj, vol départ',
    pepite: 'Le marché du dimanche matin — achète du miel et de la palincă (eau-de-vie de prune) pour ramener un vrai goût de Roumanie',
    accommodation: null,
    accommodationUrl: null,
    detail: 'Dernière gorgée de Maramureș. On prend le temps d\'un dernier petit déjeuner — pain chaud, crème fraîche, confiture maison. On achète du miel et de la palincă. Puis la route vers Cluj, 2h30 de virages à travers les collines. Dans l\'avion, on est fatigués mais comblés. Dix jours qui ont tout donné. Et déjà, on sait qu\'on reviendra — il reste tant de Roumanie à découvrir.',
  },
];

const summaryRows = days.map(d => ({
  jour: `J${d.day}`,
  ville: d.location.split('—')[0].trim(),
  activite: d.activity.split(',')[0],
  nuit: d.accommodation?.split('—')[0]?.trim() ?? 'Départ',
}));

export default function Itineraire10JoursPage() {
  return (
    <>
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
      `}</Script>
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Roumanie — Itinéraire 10 jours
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Roumanie 10 jours : grande traversée slow travel
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Du delta urbain de Bucarest au Maramureș profond — la Roumanie dans toute sa diversité, à un rythme qui laisse place à l&apos;imprévu.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing pt-0 -mt-6">
          <div className="container max-w-4xl">
            <div className="rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-eucalyptus/10 text-eucalyptus px-3 py-1 text-xs font-semibold">Testé par Heldonica</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">2 visites</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 text-stone-600 px-3 py-1 text-xs font-semibold">Septembre 2024</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">Automne doré</span>
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                Cet itinéraire est le plus complet qu&apos;on ait testé. Les 3 jours supplémentaires dans le Maramureș font toute la différence — c&apos;est là que la Roumanie révèle son âme la plus authentique. <strong>Budget réel : 1 600 € pour deux, tout compris.</strong>
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
                      </div>
                      <p className="text-xs uppercase tracking-[0.1em] text-eucalyptus font-semibold">{day.location}</p>
                    </div>
                  </div>

                  <p className="text-charcoal/80 leading-relaxed mb-4">{day.detail}</p>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Pépite dénichée</p>
                      <p className="text-sm text-charcoal/80">{day.pepite}</p>
                    </div>
                    {day.accommodation && day.accommodationUrl && (
                      <div className="rounded-xl bg-stone-50 border border-stone-200 p-3">
                        <p className="text-xs font-semibold text-stone-600 mb-1">On a dormi chez</p>
                        <p className="text-sm text-charcoal/80 mb-1">{day.accommodation}</p>
                        <a href={day.accommodationUrl} target="_blank" rel="noreferrer noopener" className="text-xs text-eucalyptus font-semibold hover:underline">
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
                    <div className="text-xs text-stone-400 mt-2">
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
              Explore chaque étape sur la carte : hébergements, pépites et routes empruntées à travers la Roumanie.
            </p>
            <div className="rounded-2xl overflow-hidden border border-stone-200">
              <ArticleMap slug="roumanie-10-jours" />
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-serif text-mahogany mb-4">Télécharge le PDF de cet itinéraire</h2>
            <p className="text-charcoal/70 mb-6 max-w-2xl">
              Emporte ce carnet Roumanie 10 jours dans ton téléphone ou imprime-le : les adresses, les pépites et les bons plans sans avoir besoin de réseau.
            </p>
            <a
              href="#pdf-download"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'guide_pdf_telecharge', { destination: 'roumanie', duration: '10' });
                }
                alert('Le PDF sera bientôt disponible. En attendant, tu peux sauvegarder cette page ou nous écrire pour une version personnalisée.');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger le PDF (bientôt disponible)
            </a>
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

        <section className="bg-cloud-dancer section-spacing">
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
              onClick={() => {
                if (typeof window !== 'undefined' && window.gtag) {
                  window.gtag('event', 'cta_travel_planning_clique', { destination: 'roumanie', itinerary: '10-jours' });
                }
              }}
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
        </section>
      </main>
      <Footer />
    </>
  );
}
