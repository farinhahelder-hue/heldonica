import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Itinéraire Madère 7 jours | Heldonica',
  description:
    'Itinéraire slow travel Madère sur 7 jours : rythme, points de vue, levadas et adresses locales.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/itineraire-7-jours',
  },
};

const days = [
  {
    title: 'Jour 1 - Atterrissage doux à Funchal',
    content:
      'Installation, marché des lavradores, front de mer, dîner local sans pression horaire.',
  },
  {
    title: 'Jour 2 - Ponta de São Lourenço',
    content:
      'Départ matinal, rando côte est, pause longue face aux reliefs puis retour lent.',
  },
  {
    title: 'Jour 3 - Levadas et forêts',
    content:
      'Section de levada adaptée à ton niveau, pause pique-nique et fin de journée en village.',
  },
  {
    title: 'Jour 4 - Nord volcanique',
    content:
      'Route panoramique, piscines naturelles, session photo et table locale en bord de mer.',
  },
  {
    title: 'Jour 5 - Villages suspendus',
    content:
      'Jardins, belvédères et cafés de hauteur. Journée idéale pour ralentir sans se couper du paysage.',
  },
  {
    title: 'Jour 6 - Journée modulable',
    content:
      "Option mer, option montagne ou option repos complet selon météo et niveau d'énergie.",
  },
  {
    title: 'Jour 7 - Clôture sensorielle',
    content:
      'Dernier panorama, achats utiles, retour à Funchal et départ sans course de fin de voyage.',
  },
];

export default function MadereItineraryPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Madère - Itinéraire
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Itinéraire Madère 7 jours
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Un plan fait pour respirer : moins de zigzags, plus de cohérence entre
              paysages, adresses et énergie du duo.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-4xl">
            <div className="space-y-5">
              {days.map((day) => (
                <article
                  key={day.title}
                  className="rounded-2xl border border-stone-200 p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{day.title}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{day.content}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl grid md:grid-cols-2 gap-5">
            <article className="rounded-2xl border border-stone-200 p-6 bg-white">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                Conseil rythme
              </p>
              <p className="text-charcoal/80">
                Ne surcharge pas les jours 2 à 4. Madère fatigue vite si on empile
                trop de dénivelé et de route.
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 p-6 bg-white">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                Conseil budget
              </p>
              <p className="text-charcoal/80">
                Garde une marge pour la météo : parfois on décale une activité et on
                gagne en qualité d&apos;expérience.
              </p>
            </article>
          </div>
        </section>

        <section className="bg-mahogany text-white section-spacing">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Besoin de la version sur mesure de cet itinéraire ?
            </h2>
            <p className="text-white/80 mb-8">
              On ajuste ce cadre à ton budget, ta saison et ton énergie réelle.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=madere"
                className="px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
              >
                Construire mon itinéraire
              </Link>
              <Link
                href="/destinations/madere/budget"
                className="px-7 py-3 rounded-lg border border-white/40 hover:border-white transition-colors"
              >
                Voir le budget
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
