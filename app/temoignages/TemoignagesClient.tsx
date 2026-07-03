'use client';

import Link from 'next/link';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';

type Testimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
  destination: string;
  rating: number;
  avatar_url: string | null;
  source: string;
  display_order: number;
};

const TESTIMONIALS_DATA_FALLBACK = [
  { zone: 'testimonial_1', couple: 'Lucie et Maxime', dest: 'Madère', quote: "On voulait un voyage lent, sensoriel et sans stress. On a reçu un carnet ultra clair, avec des pépites qu'on n'aurait jamais trouvées seuls.", result: '7 jours fluides, zéro improvisation subie' },
  { zone: 'testimonial_2', couple: 'Inès et Adrien', dest: 'Sicile', quote: "Le rythme était parfait pour nous. Chaque jour avait une vraie ambiance, sans courir. Le plus : les adresses locales testées sur le terrain.", result: '5 jours construits autour de nos envies' },
  { zone: 'testimonial_3', couple: 'Camille et Théo', dest: 'Suisse', quote: "On a senti qu'il y avait du vécu dans chaque recommandation. Rien de générique. On s'est sentis accompagnés du début à la fin.", result: '10 jours de voyage contemplatif en duo' },
  { zone: 'testimonial_4', couple: 'Léa et Nicolas', dest: 'Roumanie', quote: "On voulait sortir des circuits classiques, sans prendre de risques inutiles. Le carnet Heldonica nous a donné exactement cet équilibre.", result: 'Transylvanie authentique, budget maîtrisé' },
];

type Props = {
  testimonials: Testimonial[];
};

export default function TemoignagesClient({ testimonials }: Props) {
  const displayTestimonials = testimonials.length > 0 
    ? testimonials.slice(0, 4).map((t, i) => ({
        zone: `testimonial_${i + 1}`,
        couple: t.name,
        dest: t.destination || t.location || 'Destination',
        quote: t.quote,
        result: t.location || 'Voyage réussi',
      }))
    : TESTIMONIALS_DATA_FALLBACK;

  return (
    <InlineEditProvider page="temoignages">
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <EditableZone page="temoignages" zone="hero_badge" fallback="Retours couples"
              className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4 block"
            />
            <EditableZone page="temoignages" zone="hero_title" fallback="Ils ont voyagé avec nous"
              className="text-4xl md:text-6xl font-serif text-mahogany mb-6 block"
            />
            <EditableZone page="temoignages" zone="hero_text" type="textarea" fallback="Chaque témoignage vient d'un projet réel : un duo, une envie, un rythme. Pas de promesse générique, uniquement du vécu et des résultats concrets."
              className="text-charcoal/80 text-lg max-w-3xl leading-relaxed block"
            />
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-6">
              {displayTestimonials.map((item) => (
                <article
                  key={item.zone}
                  className="rounded-2xl border border-stone-200 p-7 bg-cloud-dancer/40"
                >
                  <EditableZone page="temoignages" zone={`${item.zone}_dest`} fallback={item.dest}
                    className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3 block"
                  />
                  <blockquote className="text-charcoal leading-relaxed mb-5">
                    &ldquo;<EditableZone page="temoignages" zone={`${item.zone}_quote`} type="textarea" fallback={item.quote} className="inline" />&rdquo;
                  </blockquote>
                  <div className="pt-4 border-t border-stone-200">
                    <EditableZone page="temoignages" zone={`${item.zone}_couple`} fallback={item.couple}
                      className="font-semibold text-mahogany block"
                    />
                    <EditableZone page="temoignages" zone={`${item.zone}_result`} fallback={item.result}
                      className="text-sm text-charcoal/70 mt-1 block"
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-mahogany text-white section-spacing">
          <div className="container text-center">
            <EditableZone page="temoignages" zone="cta_badge" fallback="Ton projet slow travel"
              className="text-sm uppercase tracking-[0.16em] text-teal mb-3 block"
            />
            <EditableZone page="temoignages" zone="cta_title" fallback="On construit ton itinéraire sur mesure ?"
              className="text-3xl md:text-4xl font-serif mb-5 block"
            />
            <EditableZone page="temoignages" zone="cta_text" type="textarea" fallback="Tu partages ton contexte, on te propose un cadre clair, des pépites testées, et un plan vraiment adapté à ton rythme."
              className="text-white/80 max-w-2xl mx-auto mb-8 block"
            />
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/travel-planning-form"
                className="px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
              >
                <EditableZone page="temoignages" zone="cta_button_write" fallback="Nous écrire" />
              </Link>
              <Link
                href="/contact"
                className="px-7 py-3 rounded-lg border border-white/40 hover:border-white transition-colors"
              >
                <EditableZone page="temoignages" zone="cta_button_contact" fallback="Nous contacter" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </InlineEditProvider>
  );
}
