import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Itineraire Madere 7 jours | Heldonica',
  description:
    'Itineraire slow travel Madere sur 7 jours: rythme, points de vue, levadas et adresses locales.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/madere/itineraire-7-jours',
  },
};

const days = [
  {
    title: 'Jour 1 - Atterrissage doux a Funchal',
    content:
      'Installation, marche des lavradores, front de mer, dinner local sans pression horaire.',
  },
  {
    title: 'Jour 2 - Ponta de Sao Lourenco',
    content:
      'Depart matinal, rando cote est, pause longue face aux reliefs puis retour lent.',
  },
  {
    title: 'Jour 3 - Levadas et forets',
    content:
      'Section de levada adaptee a ton niveau, pause pique-nique et fin de journee en village.',
  },
  {
    title: 'Jour 4 - Nord volcanique',
    content:
      'Route panoramique, piscines naturelles, session photo et table locale en bord de mer.',
  },
  {
    title: 'Jour 5 - Villages suspendus',
    content:
      'Jardins, belvederes et cafes de hauteur. Journee ideale pour ralentir sans se couper du paysage.',
  },
  {
    title: 'Jour 6 - Journee modulable',
    content:
      'Option mer, option montagne ou option repos complet selon meteo et niveau d energie.',
  },
  {
    title: 'Jour 7 - Cloture sensorielle',
    content:
      'Dernier panorama, achats utiles, retour a Funchal et depart sans course de fin de voyage.',
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
              Madere - Itineraire
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Itineraire Madere 7 jours
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Un plan fait pour respirer: moins de zigzags, plus de coherence entre
              paysages, adresses et energie du duo.
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
                Ne surcharge pas les jours 2 a 4. Madere fatigue vite si on empile
                trop de denivele et de route.
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 p-6 bg-white">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                Conseil budget
              </p>
              <p className="text-charcoal/80">
                Garde une marge pour la meteo: parfois on decale une activite et on
                gagne en qualite d experience.
              </p>
            </article>
          </div>
        </section>

        <section className="bg-mahogany text-white section-spacing">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Besoin de la version sur mesure de cet itinerary ?
            </h2>
            <p className="text-white/80 mb-8">
              On ajuste ce cadre a ton budget, ta saison et ton energie reelle.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=madere"
                className="px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
              >
                Construire mon itinerary
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
