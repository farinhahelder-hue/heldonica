import type { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';

const SITE_URL = 'https://heldonica.fr';

const ArticleMap = dynamic(() => import('@/components/ArticleMap'), { ssr: false });

export const metadata: Metadata = {
  title: 'Roumanie 5 jours : itinéraire slow travel focus Transylvanie | Heldonica',
  description: 'Itinéraire Roumanie 5 jours testé sur place : Brașov, Sighișoara, Sibiu, château de Peleș, randonnée dans les Carpates. L\'essentiel de la Transylvanie en version concentrée.',
  alternates: {
    canonical: `${SITE_URL}/destinations/roumanie/itineraire-5-jours`,
  },
  openGraph: {
    title: 'Roumanie 5 jours : itinéraire slow travel focus Transylvanie | Heldonica',
    description: 'L\'essence de la Roumanie en version concentrée : Brașov, Sighișoara, Sibiu, Carpates et château de Peleș.',
    url: `${SITE_URL}/destinations/roumanie/itineraire-5-jours`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Itinéraire Roumanie 5 jours - Focus Transylvanie',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
};

const days = [
  {
    day: 1,
    title: 'Brașov — Installation et vieille ville',
    location: 'Brașov',
    activity: 'Arrivée, vieille ville, rue Republicii, place du Conseil',
    pepite: 'La terrasse du Ceai la Metrou — salon de thé caché sous les arcades, thé maison et vue sur la place',
    accommodation: 'Hotel Belvedere — 3*, vue citadelle, 50 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Brașov&aid=2420035',
    detail: 'On pose les bases à Brașov, la plus belle porte d\'entrée de la Transylvanie. La vieille ville se découvre à pied en une après-midi : la rue Republicii, piétonne et bordée d\'arcades, la place du Conseil avec ses bâtiments pastel, et la première terrasse pour un café en observant le rythme local. Pas de précipitation — on s\'imprègne.',
  },
  {
    day: 2,
    title: 'Château de Peleș et randonnée dans les Carpates',
    location: 'Sinaia',
    activity: 'Château de Peleș, forêt des Carpates, randonnée légère',
    pepite: 'Le sentier Sinaia-Cota 1400 — 2h de montée douce à travers la forêt, vue panoramique sur toute la vallée',
    accommodation: 'Hotel Sinaia — 4*, vue montagne, 70 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Sinaia&aid=2420035',
    detail: 'À 40 minutes de Brașov, Sinaia est le joyau des Carpates. Le château de Peleș mérite qu\'on arrive à l\'ouverture — les salles sont plus impressionnantes sans la foule. L\'après-midi, on prend un sentier dans la forêt au-dessus de la ville. Les Carpates ont cette capacité à te faire oublier le temps. On redescend fatigué mais apaisé.',
  },
  {
    day: 3,
    title: 'Sighișoara — La citadelle médiévale',
    location: 'Sighișoara',
    activity: 'Tour de l\'Horloge, escalier couvert, citadelle',
    pepite: 'Restaurant din Turn — dîner dans une tour du 14e siècle, cuisine transylvanienne, 25 € pour deux',
    accommodation: 'Hotel Sighișoara — 3*, intra-muros, 45 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Sighișoara&aid=2420035',
    detail: 'Sighișoara est un arrêt obligé, et on comprend pourquoi dès qu\'on franchit la tour de l\'Horloge. La citadelle est vivante, habitée, pas un décor pour touristes. On flâne dans les ruelles pavées, on monte les marches couvertes jusqu\'au sommet, et le soir venu, on s\'installe au din Turn pour un dîner qui restera dans les mémoires.',
  },
  {
    day: 4,
    title: 'Sibiu — Ambiance saxonne et culture',
    location: 'Sibiu',
    activity: 'Grande place, pont des Mensonges, musée ASTRA',
    pepite: 'Le musée ASTRA en plein air — 30 hectares de vie rurale roumaine reconstituée, 5 €, prévois 3h',
    accommodation: 'Hotel Sibiul — 3*, vieille ville, 50 €/nuit',
    accommodationUrl: 'https://www.booking.com/searchresults.fr.html?ss=Sibiu&aid=2420035',
    detail: 'Sibiu, ancienne capitale européenne de la culture, a gardé un charme saxon irrésistible. La Grande Place est l\'une des plus belles d\'Europe de l\'Est. Le pont des Mensonges offre une vue parfaite sur la ville basse. L\'après-midi au musée ASTRA est une plongée fascinante dans la Roumanie rurale — moulins, églises en bois, fermes reconstituées. Un musée à ciel ouvert unique.',
  },
  {
    day: 5,
    title: 'Retour à Brașov et dernière flânerie',
    location: 'Brașov',
    activity: 'Petit déjeuner tardif, dernier tour, départ',
    pepite: 'Boulangerie La Pâine — meilleur cozonac de la ville, à prendre pour la route',
    accommodation: null,
    accommodationUrl: null,
    detail: 'Dernière matinée à Brașov. On prend le temps : petit déjeuner à la boulangerie La Pâine, dernier tour dans la vieille ville pour acheter un souvenir qui a du sens, et on prend la route vers l\'aéroport de Sibiu ou Bucarest. Cinq jours suffisent pour tomber amoureux de la Transylvanie — et pour commencer à planifier le prochain voyage, plus long.',
  },
];

const summaryRows = days.map(d => ({
  jour: `J${d.day}`,
  ville: d.location.split('—')[0].trim(),
  activite: d.activity.split(',')[0],
  nuit: d.accommodation?.split('—')[0]?.trim() ?? 'Départ',
}));

export default function Itineraire5JoursPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Roumanie — Itinéraire 5 jours
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Roumanie 5 jours : focus Transylvanie
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              L&apos;essence de la Roumanie en version concentrée : Brașov, Sinaia, Sighișoara, Sibiu — et les Carpates au milieu.
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
              </div>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                Ce circuit 5 jours reprend le meilleur de la Transylvanie sans les longs transferts. Idéal pour un premier contact avec la Roumanie ou un week-end prolongé. <strong>Budget réel : 850 € pour deux, vols inclus.</strong>
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
                      <h2 className="text-2xl font-serif text-mahogany mb-1">{day.title}</h2>
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
                        <p className="text-sm text-charcoal/80">Retour vers l&apos;aéroport de Sibiu ou Bucarest</p>
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
              Explore chaque étape sur la carte : hébergements, pépites et points de passage.
            </p>
            <div className="rounded-2xl overflow-hidden border border-stone-200">
              <ArticleMap slug="roumanie-5-jours" />
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-xl text-center">
            <h2 className="text-2xl font-serif text-mahogany mb-4">Tu préfères un rythme plus lent ?</h2>
            <p className="text-charcoal/70 mb-6 max-w-lg mx-auto">
              5 jours c&apos;est court pour la Roumanie. Notre itinéraire 7 jours ajoute Viscri et Cluj sans rien sacrifier.
            </p>
            <Link
              href="/destinations/roumanie/itineraire-7-jours"
              className="inline-flex px-7 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
            >
              Voir l&apos;itinéraire 7 jours →
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
