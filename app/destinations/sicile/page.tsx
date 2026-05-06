import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SlowTravelQuiz from '@/components/SlowTravelQuiz';

const SITE_URL = 'https://heldonica.fr';

const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Sicile',
  description:
    'Grande île méditerranéenne italienne reconnue pour son patrimoine baroque, sa gastronomie dense et ses côtes contrastantes. Destination slow travel idéale pour les voyageurs curieux de culture et de table.',
  url: `${SITE_URL}/destinations/sicile`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IT',
    addressRegion: 'Sicile',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.5999,
    longitude: 14.0154,
  },
  touristType: ['Food lover', 'Culture traveler', 'Slow traveler', 'Heritage seeker'],
  bestSeasonToVisit: ['April', 'May', 'June', 'September', 'October'],
};

const schemaFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quand partir en Sicile pour un voyage slow travel ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Avril-juin et septembre-octobre sont les fenêtres idéales : chaleur supportable, foules limitées, marchés vivants. Juillet-août est trop chaud et trop chargé pour un rythme lent.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de jours prévoir pour la Sicile en couple ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '7 jours permettent de couvrir un angle (Val di Noto + côte baroque ou Palerme + côte nord) sans se précipiter. 10 jours donnent le rythme idéal pour une lecture profonde.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quel budget pour la Sicile en voyage slow ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Sicile est une des destinations méditerranéennes les plus accessibles : comptez 70-110 €/jour en duo (hébergement boutique + table locale + déplacements). En sur mesure Heldonica, on cadre l’enveloppe selon vos contraintes réelles.',
      },
    },
    {
      '@type': 'Question',
      name: 'La Sicile convient-elle au slow travel ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, à condition de choisir le bon rythme. La Sicile récompense ceux qui restent : une seule ville donnée deux jours révèle bien plus qu’un tour en bus. Les marchés, les artisans, les trattorie de quartier — tout se découvre lentement.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Sicile slow travel en couple — Guide & Voyage sur Mesure | Heldonica',
  description:
    'Voyage lent en Sicile : baroques du Val di Noto, marchés de Palerme, côtes contrastées. Guide pratique + conception sur mesure pour un duo qui veut prendre son temps.',
  keywords: [
    'Sicile slow travel',
    'voyage Sicile couple',
    'que faire Sicile',
    'Sicile authentique',
    'itinéraire Sicile 7 jours',
    'voyage Sicile hors sentiers battus',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sicile',
  },
  openGraph: {
    title: 'Sicile slow travel en couple — Heldonica',
    description:
      'Baroques, marchés, côtes : la Sicile se découvre lentement. Guide terrain + conception sur mesure pour un voyage en couple hors des sentiers battus.',
    url: 'https://www.heldonica.fr/destinations/sicile',
    siteName: 'Heldonica',
    type: 'article',
    locale: 'fr_FR',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=80',
        width: 1200,
        height: 800,
        alt: 'Sicile — côte baroque et mer méditerranéenne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sicile slow travel en couple — Heldonica',
    description:
      'Baroques, marchés, côtes : la Sicile se découvre lentement. Guide terrain + conception sur mesure.',
    images: ['https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1200&q=80'],
    creator: '@heldonica',
  },
};

const seasonRows = [
  {
    period: 'Avril — Juin',
    weather: '18 à 26 °C, campagne en fleurs',
    vibe: 'Idéal : marchés vivants, foules limitées',
  },
  {
    period: 'Septembre — Octobre',
    weather: '22 à 28 °C, mer chaude',
    vibe: 'Parfait : vendanges, côte douce, ambiance calme',
  },
  {
    period: 'Juillet — Août',
    weather: '30 à 38°C, forte affluence',
    vibe: 'À éviter pour un rythme slow : prix hauts, chaleur éprouvante',
  },
];

const faqItems = [
  {
    question: 'Quand partir en Sicile pour éviter les foules ?',
    answer:
      'Avril-juin et septembre-octobre. Le printemps sicilien est d’une générosité rare : tout fleurit, les marchés débordent, les routes respirent.',
  },
  {
    question: 'Vaut-il mieux louer une voiture en Sicile ?',
    answer:
      'Oui, pour la liberté de mouvement entre les villages baroques et les côtes. Les transports en commun existent mais sont lents et limités en zone rurale.',
  },
  {
    question: 'Quelle zone choisir pour un premier voyage slow ?',
    answer:
      'Le Val di Noto (sud-est) pour le baroque, Cefalù + Madonie pour la côte nord plus douce. Palerme est inévitable mais se digest mieux avec deux nuits.',
  },
  {
    question: 'La Sicile est-elle accessible sans parler italien ?',
    answer:
      'Dans les zones touristiques oui. Dans les villages intérieurs, quelques mots d’italien changent radicalement l’accueil et ce qu’on vous sert.',
  },
];

export default function SicilePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq) }}
      />
      <Header />
      <main>

        {/* Hero */}
        <section className="relative min-h-[66vh] flex items-end overflow-hidden bg-stone-900">
          <img
            src="https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=1400&q=80"
            alt="Côte sicilienne — mer méditerranéenne et baroque"
            className="absolute inset-0 h-full w-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="relative container py-14 md:py-20">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">
              Destination sur mesure
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-4xl mb-5">
              Sicile : le sud qu’on prend par la pierre, par le ventre et par les fins d’après-midi
            </h1>
            <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
              Une île qui ne se résume pas. Baroque, gastronomie dense, côtes contrastées — la Sicile donne tout à ceux qui acceptent de ralentir.
            </p>
          </div>
        </section>

        {/* 3 chiffres-clés */}
        <section className="bg-white section-spacing">
          <div className="container grid md:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-stone-200 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Quand partir</p>
              <p className="text-charcoal/85">Avril–juin et septembre–octobre. Éviter juillet-août pour un rythme slow.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Budget indicatif</p>
              <p className="text-charcoal/85">70–110 € / jour / duo. Accessible, surtout hors saison haute.</p>
            </article>
            <article className="rounded-2xl border border-stone-200 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Profil idéal</p>
              <p className="text-charcoal/85">Couple curieux de table, de baroque et d’un rythme qui laisse le temps aux détails.</p>
            </article>
          </div>
        </section>

        {/* Saisons + Budget */}
        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
              <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8">
                <h2 className="text-3xl font-serif text-mahogany mb-4">Quand partir en Sicile</h2>
                <p className="text-charcoal/80 leading-relaxed mb-6">
                  La Sicile change de visage selon la saison. L’été est intense, presque trop ; le printemps et l’automne sont les vrais fenêtres slow travel.
                </p>
                <div className="space-y-4">
                  {seasonRows.map((row) => (
                    <div key={row.period} className="rounded-xl border border-stone-200 p-4 bg-cloud-dancer/50">
                      <p className="font-semibold text-mahogany">{row.period}</p>
                      <p className="text-sm text-charcoal/80 mt-1">{row.weather}</p>
                      <p className="text-sm text-eucalyptus mt-1">{row.vibe}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8">
                <h2 className="text-3xl font-serif text-mahogany mb-4">Budget et cadrage</h2>
                <p className="text-charcoal/80 leading-relaxed mb-4">
                  La Sicile est généreuse côté rapport qualité-prix. Un duo peut vivre très bien sans exploser l’enveloppe, à condition de manger local et de loger en dehors des zones ultra-touristiques.
                </p>
                <ul className="space-y-2 text-charcoal/80 mb-6">
                  <li>— Vols : 300–550 € duo (selon origine)</li>
                  <li>— Hébergement : 70–130 € / nuit</li>
                  <li>— Repas + activités : 50–90 € / jour / duo</li>
                  <li>— Voiture : 35–60 € / jour</li>
                </ul>
                <Link
                  href="/travel-planning-form?destination=sicile"
                  className="inline-flex px-5 py-2.5 rounded-full bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
                >
                  Obtenir un cadrage sur mesure
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Où dormir */}
        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">
              Où dormir : 3 bases pour un voyage lent
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <article className="rounded-2xl border border-stone-200 p-6">
                <h3 className="text-xl font-serif text-mahogany mb-2">Noto</h3>
                <p className="text-sm text-charcoal/75 mb-4">
                  Joyau baroque du Val di Noto. Base idéale pour le sud-est : pierre dorée, calme, marché du matin.
                </p>
                <a
                  href="https://www.booking.com/city/it/noto.fr.html?aid=2420035"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-eucalyptus font-semibold text-sm"
                >
                  Voir les hébergements partenaires
                </a>
              </article>
              <article className="rounded-2xl border border-stone-200 p-6">
                <h3 className="text-xl font-serif text-mahogany mb-2">Cefalù</h3>
                <p className="text-sm text-charcoal/75 mb-4">
                  Nord de l’île, entre mer et montagnes des Madonie. Plus douce, moins fréquentée que Taormína.
                </p>
                <a
                  href="https://www.booking.com/city/it/cefalu.fr.html?aid=2420035"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-eucalyptus font-semibold text-sm"
                >
                  Voir les hébergements partenaires
                </a>
              </article>
              <article className="rounded-2xl border border-stone-200 p-6">
                <h3 className="text-xl font-serif text-mahogany mb-2">Raguse (Ragusa Ibla)</h3>
                <p className="text-sm text-charcoal/75 mb-4">
                  La ville haute est touristique, mais Ragusa Ibla en contrebas résiste encore. Intime, lente, parfaite en duo.
                </p>
                <a
                  href="https://www.booking.com/city/it/ragusa.fr.html?aid=2420035"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-eucalyptus font-semibold text-sm"
                >
                  Voir les hébergements partenaires
                </a>
              </article>
            </div>
          </div>
        </section>

        {/* Itéraire + carte */}
        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
              <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8">
                <h2 className="text-3xl font-serif text-mahogany mb-4">
                  Itéraire 7 jours : version Heldonica
                </h2>
                <p className="text-charcoal/75 text-sm mb-5">Sur mesure selon vos dates et contraintes — ceci est une base de départ.</p>
                <ul className="space-y-3 text-charcoal/80 mb-6">
                  <li><span className="font-semibold text-mahogany">J1 :</span> Arrivée Palerme, marché Ballarò, installation.</li>
                  <li><span className="font-semibold text-mahogany">J2 :</span> Palerme — vieille ville, street food, cathédrale.</li>
                  <li><span className="font-semibold text-mahogany">J3 :</span> Route vers Cefalù, déjeuner bord de mer.</li>
                  <li><span className="font-semibold text-mahogany">J4 :</span> Descente vers le Val di Noto via les Madonie.</li>
                  <li><span className="font-semibold text-mahogany">J5 :</span> Noto, marché, baroque et douceur locales.</li>
                  <li><span className="font-semibold text-mahogany">J6 :</span> Ragusa Ibla — matée lente, trattoria de quartier.</li>
                  <li><span className="font-semibold text-mahogany">J7 :</span> Slow morning, dernière adresse, retour.</li>
                </ul>
                <Link
                  href="/travel-planning-form?destination=sicile"
                  className="inline-flex px-5 py-2.5 rounded-full bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
                >
                  Adapter cet itéraire à mes dates
                </Link>
              </article>

              <aside className="rounded-2xl overflow-hidden border border-stone-200 bg-white">
                <iframe
                  title="Carte Sicile"
                  src="https://www.google.com/maps?q=Sicily,Italy&output=embed"
                  className="w-full h-[360px]"
                  loading="lazy"
                />
              </aside>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white section-spacing">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">FAQ Sicile</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="rounded-xl border border-stone-200 p-5 bg-cloud-dancer/40"
                >
                  <summary className="font-semibold text-charcoal cursor-pointer">{item.question}</summary>
                  <p className="text-charcoal/75 text-sm mt-3 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Quiz */}
        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <SlowTravelQuiz />
          </div>
        </section>

        {/* CTA Planning */}
        <section className="bg-mahogany text-white section-spacing">
          <div className="container text-center max-w-3xl">
            <p className="text-sm uppercase tracking-[0.16em] text-teal mb-3">Voyage sur mesure</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Tu veux un carnet Sicile conçu pour ton rythme ?
            </h2>
            <p className="text-white/80 mb-8">
              On transforme tes contraintes réelles — dates, budget, envies, énergie — en un itinéraire concret avec adresses testées et séquence logique.
            </p>
            <Link
              href="/travel-planning-form?destination=sicile"
              className="inline-flex px-7 py-3 rounded-full bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
            >
              Démarrer ma demande Sicile
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
