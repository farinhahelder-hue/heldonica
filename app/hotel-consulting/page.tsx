import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const offers = [
  {
    title: 'Diagnostic RevPAR',
    description:
      'Analyse rapide de votre mix canaux, politique tarifaire et saisonnalite pour identifier les gains prioritaires.',
    bullets: [
      'Audit 360 Revenue Management',
      '3 leviers actionnables sous 30 jours',
      'Plan priorise et chiffrable',
    ],
  },
  {
    title: 'SEO Local Hotel',
    description:
      'Renforcement de votre visibilite locale pour capter une demande qualifiee et augmenter les reservations directes.',
    bullets: [
      'Optimisation Google Business Profile',
      'Architecture contenu locale',
      'Pilotage des intentions de recherche',
    ],
  },
  {
    title: 'Conversion & Experience',
    description:
      'Optimisation du parcours de reservation et de la proposition de valeur pour convertir davantage au meilleur tarif.',
    bullets: [
      'Audit parcours utilisateur',
      'Recommandations UX orientees revenu',
      'Mise en place de KPIs decisionnels',
    ],
  },
];

const faqs = [
  {
    question: 'Quel type d hotel accompagnez-vous ?',
    answer:
      'Nous travaillons avec des hotels independants, boutique hotels et maisons de charme qui veulent piloter leur performance avec plus de clarte.',
  },
  {
    question: 'En combien de temps peut-on mesurer les premiers effets ?',
    answer:
      'Les premiers signaux apparaissent souvent entre 4 et 8 semaines, selon votre saisonnalite et la maturite de vos canaux.',
  },
  {
    question: 'Intervenez-vous uniquement sur le revenue management ?',
    answer:
      'Non. Notre approche combine Revenue Management, SEO local et conversion pour viser un impact business coherent.',
  },
];

export const metadata: Metadata = {
  title: 'Consulting hotelier | Heldonica',
  description:
    'Revenue Management, SEO local et experience client pour hotels independants avec objectifs RevPAR et ventes directes.',
  alternates: {
    canonical: 'https://www.heldonica.fr/hotel-consulting',
  },
};

export default function HotelConsultingPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Consulting B2B
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Hotel consulting axe performance
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed mb-8">
              Vous cherchez des resultats mesurables sur votre RevPAR, votre acquisition
              directe et votre rentabilite. Nous cadrons les priorites, puis nous les
              transformons en plan d action concret.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="px-7 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
              >
                Reserver un appel de cadrage
              </Link>
              <Link
                href="/etudes-de-cas"
                className="px-7 py-3 rounded-lg border border-eucalyptus text-eucalyptus font-semibold hover:bg-eucalyptus/5 transition-colors"
              >
                Voir les etudes de cas
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-10">
              Offres prioritaires
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <article
                  key={offer.title}
                  className="rounded-2xl border border-stone-200 p-6 shadow-sm"
                >
                  <h3 className="text-2xl font-serif text-mahogany mb-3">{offer.title}</h3>
                  <p className="text-charcoal/80 leading-relaxed mb-5">{offer.description}</p>
                  <ul className="space-y-2 text-sm text-charcoal/85">
                    {offer.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="text-teal mt-[2px]">●</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <div className="rounded-2xl bg-white border border-stone-200 p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-3">
                Pricing appel
              </p>
              <h2 className="text-3xl font-serif text-mahogany mb-4">
                Session strategique 90 min - 290 EUR HT
              </h2>
              <p className="text-charcoal/80 max-w-3xl leading-relaxed mb-6">
                Cette session pose votre diagnostic prioritaire et votre feuille de route.
                Si nous enchainons sur une mission, ce montant est deduit de la phase 1.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-cloud-dancer/70 p-4 border border-stone-200">
                  <p className="text-sm font-semibold text-mahogany mb-1">Format</p>
                  <p className="text-sm text-charcoal/75">Visio ou presentiel (Paris)</p>
                </div>
                <div className="rounded-xl bg-cloud-dancer/70 p-4 border border-stone-200">
                  <p className="text-sm font-semibold text-mahogany mb-1">Livrable</p>
                  <p className="text-sm text-charcoal/75">Plan d action priorise</p>
                </div>
                <div className="rounded-xl bg-cloud-dancer/70 p-4 border border-stone-200">
                  <p className="text-sm font-semibold text-mahogany mb-1">Delai</p>
                  <p className="text-sm text-charcoal/75">Compte-rendu sous 48h</p>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex px-7 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
              >
                Planifier un appel
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">
              Preuves et indicateurs
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <article className="rounded-2xl border border-stone-200 p-6">
                <p className="text-4xl font-serif text-mahogany mb-2">+18%</p>
                <p className="text-sm uppercase tracking-[0.12em] text-eucalyptus mb-2">RevPAR</p>
                <p className="text-charcoal/75 text-sm">
                  Gain mesure apres optimisation pricing et arbitrage canaux.
                </p>
              </article>
              <article className="rounded-2xl border border-stone-200 p-6">
                <p className="text-4xl font-serif text-mahogany mb-2">+24%</p>
                <p className="text-sm uppercase tracking-[0.12em] text-eucalyptus mb-2">
                  Direct bookings
                </p>
                <p className="text-charcoal/75 text-sm">
                  Progression des reservations sans intermediaire sur periode comparable.
                </p>
              </article>
              <article className="rounded-2xl border border-stone-200 p-6">
                <p className="text-4xl font-serif text-mahogany mb-2">12 pts</p>
                <p className="text-sm uppercase tracking-[0.12em] text-eucalyptus mb-2">Marge</p>
                <p className="text-charcoal/75 text-sm">
                  Amelioration operationnelle suite a la reallocation des efforts commerciaux.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-white pb-20">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-xl border border-stone-200 p-6">
                  <h3 className="text-lg font-semibold text-mahogany mb-2">{faq.question}</h3>
                  <p className="text-charcoal/80">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
