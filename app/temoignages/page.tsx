import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const testimonials = [
  {
    couple: 'Lucie et Maxime',
    destination: 'Madère',
    quote:
      "On voulait un voyage lent, sensoriel et sans stress. On a reçu un carnet ultra clair, avec des pépites qu’on n’aurait jamais trouvées seuls.",
    result: '7 jours fluides, zéro improvisation subie',
  },
  {
    couple: 'Inès et Adrien',
    destination: 'Sicile',
    quote:
      "Le rythme était parfait pour nous. Chaque jour avait une vraie ambiance, sans courir. Le plus : les adresses locales testées sur le terrain.",
    result: '5 jours construits autour de nos envies',
  },
  {
    couple: 'Camille et Théo',
    destination: 'Suisse',
    quote:
      "On a senti qu’il y avait du vécu dans chaque recommandation. Rien de générique. On s’est sentis accompagnés du début à la fin.",
    result: '10 jours de voyage contemplatif en duo',
  },
  {
    couple: 'Léa et Nicolas',
    destination: 'Roumanie',
    quote:
      "On voulait sortir des circuits classiques, sans prendre de risques inutiles. Le carnet Heldonica nous a donné exactement cet équilibre.",
    result: 'Transylvanie authentique, budget maîtrisé',
  },
];

export const metadata: Metadata = {
  title: 'Témoignages clients | Heldonica',
  description:
    'Retours de couples accompagnés par Heldonica pour leur voyage slow travel sur mesure.',
  alternates: {
    canonical: 'https://www.heldonica.fr/temoignages',
  },
};

export default function TemoignagesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Retours couples
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Ils ont voyagé avec nous
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Chaque témoignage vient d&apos;un projet réel : un duo, une envie, un rythme.
              Pas de promesse générique, uniquement du vécu et des résultats concrets.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((item) => (
                <article
                  key={item.couple}
                  className="rounded-2xl border border-stone-200 p-7 bg-cloud-dancer/40"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3">
                    {item.destination}
                  </p>
                  <blockquote className="text-charcoal leading-relaxed mb-5">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <div className="pt-4 border-t border-stone-200">
                    <p className="font-semibold text-mahogany">{item.couple}</p>
                    <p className="text-sm text-charcoal/70 mt-1">{item.result}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-mahogany text-white section-spacing">
          <div className="container text-center">
            <p className="text-sm uppercase tracking-[0.16em] text-teal mb-3">
              Ton projet slow travel
            </p>
            <h2 className="text-3xl md:text-4xl font-serif mb-5">
              On construit ton itinéraire sur mesure ?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Tu partages ton contexte, on te propose un cadre clair, des pépites testées,
              et un plan vraiment adapté à ton rythme.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/travel-planning-form"
                className="px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
              >
                Nous écrire
              </Link>
              <Link
                href="/contact"
                className="px-7 py-3 rounded-lg border border-white/40 hover:border-white transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ⚡ Bolt Optimization: Use Incremental Static Regeneration (ISR) to cache the page for 60 seconds. This significantly improves Time To First Byte (TTFB).
export const revalidate = 60;
