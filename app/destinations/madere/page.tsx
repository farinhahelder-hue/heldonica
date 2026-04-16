import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SlowTravelQuiz from '@/components/SlowTravelQuiz';

export const metadata: Metadata = {
  title: 'Madere slow travel | Guide Heldonica',
  description:
    'Guide pilier Madere: quand partir, budget reel, ou dormir, itinerary 7 jours et FAQ pratique.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere',
  },
  openGraph: {
    title: 'Madere slow travel | Guide Heldonica',
    description:
      'Falaises, levadas, adresses locales et plan de voyage concret pour un duo slow travel.',
    url: 'https://www.heldonica.fr/destinations/madere',
    images: [
      {
        url: 'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
        width: 1200,
        height: 630,
        alt: 'Madere en slow travel - Fanal et falaises atlantiques',
      },
    ],
    locale: 'fr_FR',
    type: 'article',
  },
};

const seasonRows = [
  {
    period: 'Mars - Mai',
    weather: '16 a 22 C, vegetation tres vive',
    vibe: 'Excellent pour rando + villages',
  },
  {
    period: 'Juin - Septembre',
    weather: '22 a 28 C, mer plus agreable',
    vibe: 'Ideal pour un mix ocean + relief',
  },
  {
    period: 'Octobre - Fevrier',
    weather: '14 a 20 C, plus humide',
    vibe: 'Parfait en mode slow contemplatif',
  },
];

const faqItems = [
  {
    question: 'Combien de jours pour une premiere fois a Madere ?',
    answer:
      '7 jours est un bon equilibre pour alterner falaises, levadas, villages et temps de pause en duo.',
  },
  {
    question: 'Le budget 1400-1800 EUR est-il realiste ?',
    answer:
      'Oui, pour 7 jours en duo avec une approche equilibree et hors pics tres hauts de saison.',
  },
  {
    question: 'Faut-il louer une voiture ?',
    answer:
      'Pour explorer librement les points de vue et randonnees, oui. Sinon, il faut cadrer un itinerary plus compact.',
  },
  {
    question: 'Madere convient-elle a un voyage lent ?',
    answer:
      'Tres bien. La force de l ile est de pouvoir doser: plages, relief, gastronomie et micro-aventures au meme endroit.',
  },
];

export default function MaderePage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative min-h-[66vh] flex items-end overflow-hidden bg-stone-900">
          <img
            src="https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg"
            alt="Foret de Fanal dans la brume a Madere"
            className="absolute inset-0 h-full w-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          <div className="absolute right-4 top-4 hidden md:block rounded-xl overflow-hidden border border-white/25 shadow-xl bg-black/30 backdrop-blur-sm">
            <img
              src="https://heldonica.fr/wp-content/uploads/2026/03/fetched-image-2-1024x768.jpg"
              alt="Cabo Girao a l'aube, spot eco-luxe"
              className="h-28 w-40 object-cover"
              loading="lazy"
            />
            <p className="px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-white/90">
              Cabo Girao - 6h
            </p>
          </div>
          <div className="relative container py-14 md:py-20">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">
              Destination pilier
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-4xl mb-5">
              Madere, l ile de l eternel printemps en mode slow travel
            </h1>
            <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
              Un mix unique de relief volcanique, villages atlantiques et adresses
              locales. Ici, on voyage lentement sans jamais s ennuyer.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container grid md:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-stone-200 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                Quand partir
              </p>
              <p className="text-charcoal/85">
                Fenetre ideale: avril a octobre, avec un excellent compromis en mai-juin
                et septembre.
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                Budget reel
              </p>
              <p className="text-charcoal/85">
                Reference duo 7 jours: 1400-1800 EUR (hors extras premium).
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 p-6">
              <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                Profil ideal
              </p>
              <p className="text-charcoal/85">
                Couple curieux qui veut combiner nature, table locale et rythme
                respirable.
              </p>
            </article>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8">
              <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8">
                <h2 className="text-3xl font-serif text-mahogany mb-4">Quand partir a Madere</h2>
                <p className="text-charcoal/80 leading-relaxed mb-6">
                  Madere se voyage toute l annee, mais chaque saison change la lecture de
                  l ile. L objectif n est pas de cocher, mais de choisir le bon tempo.
                </p>
                <div className="space-y-4">
                  {seasonRows.map((row) => (
                    <div
                      key={row.period}
                      className="rounded-xl border border-stone-200 p-4 bg-cloud-dancer/50"
                    >
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
                  Sur 7 jours en duo, l enveloppe la plus frequente se situe entre 1400 et
                  1800 EUR selon la saison, l hebergement et la location voiture.
                </p>
                <ul className="space-y-2 text-charcoal/80 mb-6">
                  <li>- Vols: 500-760 EUR duo</li>
                  <li>- Hebergement: 90-160 EUR / nuit</li>
                  <li>- Repas + activites: 60-110 EUR / jour / duo</li>
                  <li>- Voiture: 45-70 EUR / jour</li>
                </ul>
                <Link
                  href="/destinations/madere/budget"
                  className="inline-flex px-5 py-2.5 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
                >
                  Ouvrir le calculateur budget
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">
              Ou dormir: 3 bases pertinentes
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <article className="rounded-2xl border border-stone-200 p-6">
                <h3 className="text-xl font-serif text-mahogany mb-2">Funchal</h3>
                <p className="text-sm text-charcoal/75 mb-4">
                  Base confortable pour une premiere fois: ville vivante, restaurants et
                  acces simple a l ensemble de l ile.
                </p>
                <a
                  href="https://www.booking.com/city/pt/funchal.fr.html?aid=2420035"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-eucalyptus font-semibold text-sm"
                >
                  Voir les hebergements partenaires
                </a>
              </article>
              <article className="rounded-2xl border border-stone-200 p-6">
                <h3 className="text-xl font-serif text-mahogany mb-2">Sao Vicente</h3>
                <p className="text-sm text-charcoal/75 mb-4">
                  Plus brut, plus vegetal. Excellent point d entree pour les levadas et les
                  routes panoramiques du nord.
                </p>
                <a
                  href="https://www.booking.com/city/pt/sao-vicente.fr.html?aid=2420035"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-eucalyptus font-semibold text-sm"
                >
                  Voir les hebergements partenaires
                </a>
              </article>
              <article className="rounded-2xl border border-stone-200 p-6">
                <h3 className="text-xl font-serif text-mahogany mb-2">Ponta do Sol</h3>
                <p className="text-sm text-charcoal/75 mb-4">
                  Plus intime, plus doux, ideal pour un voyage en duo oriente slow et
                  coucher de soleil.
                </p>
                <a
                  href="https://www.booking.com/city/pt/ponta-do-sol.fr.html?aid=2420035"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-eucalyptus font-semibold text-sm"
                >
                  Voir les hebergements partenaires
                </a>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
              <article className="rounded-2xl bg-white border border-stone-200 p-6 md:p-8">
                <h2 className="text-3xl font-serif text-mahogany mb-4">
                  Itineraire 7 jours: version Heldonica
                </h2>
                <ul className="space-y-3 text-charcoal/80 mb-6">
                  <li>Jour 1: Funchal, marche, vieille ville, coucher de soleil.</li>
                  <li>Jour 2: Est de l ile, Ponta de Sao Lourenco.</li>
                  <li>Jour 3: Levadas et forets de laurisylve.</li>
                  <li>Jour 4: Nord volcanique, piscines naturelles.</li>
                  <li>Jour 5: Villages suspendus et routes panoramiques.</li>
                  <li>Jour 6: Journee libre selon energie et meteo.</li>
                  <li>Jour 7: Slow morning et dernier panorama.</li>
                </ul>
                <Link
                  href="/destinations/madere/itineraire-7-jours"
                  className="inline-flex px-5 py-2.5 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
                >
                  Lire l itinerary detaille
                </Link>
              </article>

              <aside className="rounded-2xl overflow-hidden border border-stone-200 bg-white">
                <iframe
                  title="Carte Madere"
                  src="https://www.google.com/maps?q=Madeira&output=embed"
                  className="w-full h-[360px]"
                  loading="lazy"
                />
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">FAQ Madere</h2>
            <div className="space-y-4">
              {faqItems.map((item) => (
                <details
                  key={item.question}
                  className="rounded-xl border border-stone-200 p-5 bg-cloud-dancer/40"
                >
                  <summary className="font-semibold text-charcoal cursor-pointer">
                    {item.question}
                  </summary>
                  <p className="text-charcoal/75 text-sm mt-3 leading-relaxed">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl">
            <SlowTravelQuiz />
          </div>
        </section>

        <section className="bg-mahogany text-white section-spacing">
          <div className="container text-center max-w-3xl">
            <p className="text-sm uppercase tracking-[0.16em] text-teal mb-3">
              Voyage sur mesure
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Tu veux un carnet Madere adapte a ton rythme ?
            </h2>
            <p className="text-white/80 mb-8">
              On transforme tes contraintes reelles (temps, budget, energie) en itinerary
              concret, avec adresses testees et sequence logique.
            </p>
            <Link
              href="/travel-planning-form?destination=madere"
              className="inline-flex px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
              >
                Demarrer ma demande Madere
              </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
