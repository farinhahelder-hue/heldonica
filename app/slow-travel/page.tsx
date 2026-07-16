import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

export const metadata: Metadata = {
  title: 'Slow Travel — Voyager Autrement, Lentement, Authentiquement | Heldonica',
  description:
    "Qu’est-ce que le slow travel ? On te partage notre approche du voyage lent, écoresponsable et hors des sentiers battus. Destinations, conseils et carnets de route.",
  keywords: [
    'slow travel',
    'slow travel France',
    'slow travel Europe',
    'voyage lent',
    'voyager autrement',
    'tourisme responsable',
    'voyage écoresponsable',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/slow-travel',
  },
}

export default function SlowTravelPage() {
  return (
    <InlineEditProvider page="slow-travel">
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-gradient-to-br from-stone-50 via-eucalyptus/10 to-white py-24 md:py-28">
          <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
            <EditableZone page="slow-travel" zone="hero_badge" fallback="Slow travel"
              className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-mahogany block"
            />
            <h1 className="mb-6 text-4xl font-serif font-light leading-tight text-stone-900 md:text-6xl">
              <EditableZone page="slow-travel" zone="hero_title_line1" fallback="Le slow travel n'est pas une esthétique." className="inline" />
              <br />
              <EditableZone page="slow-travel" zone="hero_title_line2" fallback="C'est une façon de regarder." className="inline" />
            </h1>
            <EditableZone page="slow-travel" zone="hero_text" type="textarea" fallback="On ralentit pour mieux lire un lieu, mieux choisir un rythme, mieux sentir ce qui tient vraiment. Ce n'est pas une vertu — c'est simplement plus juste."
              className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-700 block"
            />
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3 md:px-10">
            {[
              { zone: 'principle_1', fallbackTitle: "Ralentir assez pour voir", fallbackText: "Le slow travel ne consiste pas à faire moins pour cocher une valeur morale. Il consiste à laisser une journée respirer assez longtemps pour qu'un lieu commence enfin à répondre." },
              { zone: 'principle_2', fallbackTitle: "Revenir quand c'est nécessaire", fallbackText: "On comprend rarement un terrain au premier passage. Revenir, corriger, comparer, rater mieux : c'est aussi comme ça qu'on construit Heldonica." },
              { zone: 'principle_3', fallbackTitle: "Chercher juste, pas loin", fallbackText: "Dénicheurs de pépites, même en bas de chez toi. Le regard compte autant que la distance. Un canal, une rue, une forêt proche peuvent déjà changer la journée." },
            ].map((p) => (
              <div key={p.zone} className="rounded-2xl border border-stone-200 bg-stone-50 p-8">
                <EditableZone page="slow-travel" zone={`${p.zone}_title`} fallback={p.fallbackTitle}
                  className="mb-4 text-2xl font-serif font-light leading-tight text-stone-900 block"
                />
                <EditableZone page="slow-travel" zone={`${p.zone}_text`} type="textarea" fallback={p.fallbackText}
                  className="text-base leading-relaxed text-stone-700 block"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-stone-950 py-20 text-white md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
            <EditableZone page="slow-travel" zone="quote_badge" fallback="Notre point de vue"
              className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal/80 block"
            />
            <EditableZone page="slow-travel" zone="quote_text" type="textarea" fallback="Voyager lentement, ce n'est pas se retirer du monde. C'est accepter qu'un détail juste vaille mieux qu'une journée trop remplie."
              className="text-2xl font-serif font-light leading-relaxed md:text-3xl block"
            />
          </div>
        </section>

        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
            <EditableZone page="slow-travel" zone="cta_badge" fallback="Continuer"
              className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 block"
            />
            <EditableZone page="slow-travel" zone="cta_title" fallback="Si cette façon de voyager te parle, on a déjà des carnets pour ça."
              className="mb-6 text-3xl font-serif font-light leading-tight text-stone-900 md:text-4xl block"
            />
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/blog"
                className="rounded-full bg-mahogany px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-mahogany/90"
              >
                <EditableZone page="slow-travel" zone="cta_blog_label" fallback="Lire le carnet →" />
              </Link>
              <Link
                href="/destinations"
                className="text-sm font-semibold text-mahogany transition-colors duration-200 hover:text-mahogany/90"
              >
                <EditableZone page="slow-travel" zone="cta_destinations_label" fallback="Voir les destinations →" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

// ⚡ Bolt Optimization: Use Incremental Static Regeneration (ISR) to cache the page for 60 seconds. This significantly improves Time To First Byte (TTFB).
export const revalidate = 60;
