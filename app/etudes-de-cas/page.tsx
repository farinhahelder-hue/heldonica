import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const cases = [
  {
    hotel: 'Hotel urbain 4* - Paris',
    context: 'Dependance OTA elevee, prix peu differencies selon la demande.',
    actions: [
      'Recalibrage des segments tarifaires',
      'Pilotage RevPAR journalier',
      'Optimisation fiche Google Business Profile',
    ],
    result: '+18% RevPAR en 90 jours',
  },
  {
    hotel: 'Boutique hotel - Cote Atlantique',
    context: 'Basse saison faible, communication locale peu visible.',
    actions: [
      'Refonte pages locales SEO',
      'Strategie offres basse saison',
      'Parcours de conversion simplifie',
    ],
    result: '+24% reservations directes',
  },
  {
    hotel: 'Maison de charme - Suisse romande',
    context: 'Bonne occupation, marge sous pression sur certaines periodes.',
    actions: [
      'Analyse mix canaux et cout d acquisition',
      'Nouveau cadre de pricing week-end',
      'Dashboard suivi performances hebdomadaire',
    ],
    result: '+12 points de marge operationnelle',
  },
];

export const metadata: Metadata = {
  title: 'Etudes de cas hotellerie | Heldonica',
  description:
    'Cas clients B2B Heldonica: Revenue Management, SEO local et experience client avec resultats mesures.',
  alternates: {
    canonical: 'https://www.heldonica.fr/etudes-de-cas',
  },
};

export default function EtudesDeCasPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              B2B hotellerie
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Etudes de cas orientees resultats
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Vous cherchez des leviers concrets sur votre RevPAR, vos ventes directes
              et votre visibilite locale. Voici trois interventions type avec indicateurs
              mesurables.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container space-y-8">
            {cases.map((item) => (
              <article
                key={item.hotel}
                className="rounded-2xl border border-stone-200 p-7 md:p-8 shadow-sm"
              >
                <div className="grid md:grid-cols-[1.2fr_1fr] gap-8">
                  <div>
                    <h2 className="text-2xl font-serif text-mahogany mb-3">{item.hotel}</h2>
                    <p className="text-charcoal/80 mb-5">{item.context}</p>
                    <p className="text-sm uppercase tracking-[0.12em] text-eucalyptus font-semibold mb-3">
                      Actions deployees
                    </p>
                    <ul className="space-y-2 text-charcoal/85">
                      {item.actions.map((action) => (
                        <li key={action} className="flex items-start gap-2">
                          <span className="text-teal mt-[2px]">●</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-cloud-dancer rounded-xl p-6 border border-stone-200 h-fit">
                    <p className="text-xs uppercase tracking-[0.12em] text-eucalyptus font-semibold mb-2">
                      KPI principal
                    </p>
                    <p className="text-3xl font-serif text-mahogany mb-2">{item.result}</p>
                    <p className="text-sm text-charcoal/70">
                      Resultat constate apres mise en place des optimisations prioritaires.
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-eucalyptus text-white section-spacing">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Vous voulez un plan d action adapte a votre hotel ?
            </h2>
            <p className="text-white/85 max-w-2xl mx-auto mb-8">
              Nous cadrons vos priorites en Revenue Management, SEO local et conversion
              pour viser des gains mesurables a court terme.
            </p>
            <Link
              href="/hotel-consulting"
              className="inline-flex px-7 py-3 rounded-lg bg-white text-eucalyptus font-semibold hover:bg-cloud-dancer transition-colors"
            >
              Decouvrir le consulting hotelier
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
