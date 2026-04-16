import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const offers = [
  {
    title: 'Diagnostic terrain',
    description:
      'On lit votre établissement comme le ferait un client attentif : promesse, parcours, lisibilité, friction, décalage entre discours et réalité.',
    bullets: [
      'Regard client + regard hôtelier',
      'Points de friction prioritaires',
      'Actions tenables rapidement',
    ],
  },
  {
    title: 'Distribution & visibilité',
    description:
      'Canaux, direct, présence locale, pages qui convertissent : on remet de la cohérence là où tout part souvent dans des directions différentes.',
    bullets: [
      'Lecture du mix de distribution',
      'SEO local et lisibilité des offres',
      'Recommandations concrètes, sans jargon',
    ],
  },
  {
    title: 'IA utile, pas gadget',
    description:
      'On vous aide à choisir les bons usages : ceux qui font gagner du temps, clarifient l’information et renforcent l’expérience sans la déshumaniser.',
    bullets: [
      'Cas d’usage réalistes',
      'Outils adaptés à votre équipe',
      'Mise en place progressive',
    ],
  },
];

const observations = [
  {
    title: 'Ce qu’on comprend en arrivant',
    description:
      'Votre site, votre promesse, votre parcours de réservation : est-ce que tout raconte la même chose, et est-ce que le client comprend vite ?',
  },
  {
    title: 'Ce qui se casse entre l’envie et l’acte',
    description:
      'Là où vous perdez de la confiance, du temps ou du direct. Souvent, le problème est visible bien avant les chiffres.',
  },
  {
    title: 'Ce qui peut vraiment tenir chez vous',
    description:
      'On repart avec une feuille de route réaliste pour votre taille, votre équipe et votre niveau d’énergie. Pas une usine à gaz.',
  },
];

const faqs = [
  {
    question: 'Quel type d’hôtel accompagnez-vous ?',
    answer:
      'Des hôtels indépendants, maisons de charme, petits groupes et lieux qui veulent garder une identité claire tout en améliorant leur lisibilité et leur efficacité.',
  },
  {
    question: 'Travaillez-vous seulement sur le revenue management ?',
    answer:
      'Non. On regarde aussi le discours, l’expérience client, la présence locale, le parcours de réservation et les bons usages de l’IA quand ils ont du sens.',
  },
  {
    question: 'Comment démarre une mission ?',
    answer:
      'Par un rendez-vous de cadrage. On regarde votre contexte, ce qui vous agace vraiment, et on vous dit franchement si on pense pouvoir vous aider utilement.',
  },
];

export const metadata: Metadata = {
  title: 'Consulting hôtelier | Heldonica',
  description:
    'On connaît vos clients parce qu’on en fait partie. Regard terrain, parcours client, visibilité locale et outils IA utiles pour hôtels indépendants.',
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
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6 max-w-4xl">
              On connaît vos clients mieux que la plupart de vos consultants
              <span className="block italic text-eucalyptus">parce qu’on est vos clients.</span>
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed mb-8">
              Pas de promesses chiffrées plaquées sur un deck. On arrive, on regarde ce qui se passe vraiment, on vous dit ce qu’on voit. Ensuite, on travaille ensemble.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="px-7 py-3 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
              >
                Prendre rendez-vous →
              </Link>
              <Link
                href="/ai-hotellerie"
                className="px-7 py-3 rounded-lg border border-eucalyptus text-eucalyptus font-semibold hover:bg-eucalyptus/5 transition-colors"
              >
                Voir les outils →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-10">Là où on intervient</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <article key={offer.title} className="rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <h3 className="text-2xl font-serif text-mahogany mb-3">{offer.title}</h3>
                  <p className="text-charcoal/80 leading-relaxed mb-5">{offer.description}</p>
                  <ul className="space-y-2 text-sm text-charcoal/85">
                    {offer.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="text-teal mt-[2px]">•</span>
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
                Premier cadrage
              </p>
              <h2 className="text-3xl font-serif text-mahogany mb-4">
                Rendez-vous stratégique de 90 min — 290 € HT
              </h2>
              <p className="text-charcoal/80 max-w-3xl leading-relaxed mb-6">
                On pose le diagnostic, on trie les urgences, on voit ce qui relève du discours, de l’opérationnel, du direct ou des outils. Si une mission suit, ce montant est déduit de la phase 1.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl bg-cloud-dancer/70 p-4 border border-stone-200">
                  <p className="text-sm font-semibold text-mahogany mb-1">Format</p>
                  <p className="text-sm text-charcoal/75">Visio ou présentiel (Paris)</p>
                </div>
                <div className="rounded-xl bg-cloud-dancer/70 p-4 border border-stone-200">
                  <p className="text-sm font-semibold text-mahogany mb-1">Livrable</p>
                  <p className="text-sm text-charcoal/75">Feuille de route priorisée</p>
                </div>
                <div className="rounded-xl bg-cloud-dancer/70 p-4 border border-stone-200">
                  <p className="text-sm font-semibold text-mahogany mb-1">Délai</p>
                  <p className="text-sm text-charcoal/75">Compte-rendu sous 48h</p>
                </div>
              </div>
              <Link
                href="/contact"
                className="inline-flex px-7 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
              >
                Prendre rendez-vous →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-serif text-mahogany mb-8">Ce qu’on regarde d’abord</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {observations.map((item) => (
                <article key={item.title} className="rounded-2xl border border-stone-200 p-6">
                  <h3 className="text-xl font-serif text-mahogany mb-3">{item.title}</h3>
                  <p className="text-charcoal/75 text-sm leading-relaxed">{item.description}</p>
                </article>
              ))}
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
